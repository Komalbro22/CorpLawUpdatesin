import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getSpokeDocument } from '@/lib/document-sets-data'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB cap

export async function POST(req: NextRequest) {
  const auth = await verifyAdminOrKey(req, 'document-sets:write')
  if (!auth.success) return auth.response

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const spokeSlug = formData.get('spoke_slug') as string | null
    const newVersion = (formData.get('version') as string | null) || 'v1.1'

    if (!file || !spokeSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: file and spoke_slug' },
        { status: 400 }
      )
    }

    // 1. File type validation
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'docx' && ext !== 'pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only .docx and .pdf files are allowed (§11.2 & §11.7).' },
        { status: 400 }
      )
    }

    // 2. Size cap check (10MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      )
    }

    // 3. Find target document
    const spoke = await getSpokeDocument(spokeSlug)
    if (!spoke || !spoke.document) {
      return NextResponse.json({ error: `Document '${spokeSlug}' not found` }, { status: 404 })
    }

    const currentDoc = spoke.document
    const oldVersion = currentDoc.version
    const oldUrl = ext === 'docx' ? currentDoc.docx_url : currentDoc.pdf_url

    // 4. Archive old version into superseded_files array
    const supersededFiles = [...(currentDoc.superseded_files || [])]
    if (oldUrl) {
      supersededFiles.push({
        version: oldVersion,
        url: oldUrl,
        replaced_at: new Date().toISOString(),
      })
    }

    // 5. Store / save path
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filename = `${spokeSlug}-${newVersion}.${ext}`

    // Upload to Supabase Storage if bucket exists, or save reference
    let publicUrl = `/api/documents/sets/director-appointment/download?doc=${spokeSlug}&format=${ext}`
    try {
      const storagePath = `document-sets/${filename}`
      const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
        .from('media')
        .upload(storagePath, fileBuffer, {
          contentType: file.type || (ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'),
          upsert: true,
        })

      if (!uploadErr && uploadData) {
        const { data: urlData } = supabaseAdmin.storage.from('media').getPublicUrl(storagePath)
        if (urlData?.publicUrl) publicUrl = urlData.publicUrl
      }
    } catch (e) {
      // Fallback to internal generator route
    }

    // 6. Update document record
    const updates: Record<string, any> = {
      version: newVersion,
      superseded_files: supersededFiles,
      updated_at: new Date().toISOString(),
    }
    if (ext === 'docx') {
      updates.docx_url = publicUrl
    } else {
      updates.pdf_url = publicUrl
    }

    await supabaseAdmin
      .from('document_set_documents')
      .update(updates)
      .eq('spoke_slug', spokeSlug)

    return NextResponse.json({
      ok: true,
      message: `Template updated to version ${newVersion}. Previous version ${oldVersion} retained as SUPERSEDED.`,
      filename,
      version: newVersion,
      superseded_count: supersededFiles.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
