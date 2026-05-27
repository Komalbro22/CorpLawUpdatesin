import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import sharp from 'sharp'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const email = formData.get('email') as string | null
    const type = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const isDoc = file.name.toLowerCase().endsWith('.doc') || file.type === 'application/msword'

    if (!isPdf && !isDocx && !isDoc) {
      return NextResponse.json(
        { error: 'Only PDF, DOC, and DOCX template files are supported.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const fileIdentifier = email ? email.replace(/[^a-zA-Z0-9]/g, '_') : 'anonymous'
    const fileExt = isPdf ? 'pdf' : isDocx ? 'docx' : 'doc'
    const fileName = `letterheads/${fileIdentifier}-${timestamp}.${fileExt}`
    const contentType = isPdf 
      ? 'application/pdf' 
      : isDocx 
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      : 'application/msword'

    // Create bucket if it doesn't exist
    try {
      await supabaseAdmin.storage.createBucket('document-assets', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024 // Increased to 5MB limit for templates
      })
    } catch (bucketErr) {
      // Bucket might already exist, ignore error
    }

    // Upload raw document to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('document-assets')
      .upload(fileName, buffer, {
        contentType: contentType,
        upsert: true
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload template to storage: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public access URL
    const { data: urlData } = supabaseAdmin.storage
      .from('document-assets')
      .getPublicUrl(fileName)

    if (!urlData || !urlData.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to retrieve uploaded file public URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      publicUrl: urlData.publicUrl,
      fileName: fileName
    })

  } catch (error: any) {
    console.error('Letterhead upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
