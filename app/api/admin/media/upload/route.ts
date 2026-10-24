import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import imageSize from 'image-size'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'media:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'No file provided in form-data "file" field.' } },
        { status: 400 }
      )
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: { code: 'INVALID_FILE_TYPE', message: 'Only image files (WebP, JPEG, PNG, GIF) are allowed.' } },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: { code: 'FILE_TOO_LARGE', message: 'File size exceeds maximum limit of 5 MB.' } },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let width: number | null = null
    let height: number | null = null
    try {
      const dimensions = imageSize(buffer)
      width = dimensions.width || null
      height = dimensions.height || null
    } catch {
      // Dimensions extraction is best-effort
    }

    const timestamp = Date.now().toString()
    const cleanName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const fileName = `${timestamp}-${cleanName}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('article-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: { code: 'STORAGE_ERROR', message: uploadError.message } },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('article-images')
      .getPublicUrl(fileName)

    const responsePayload = {
      url: publicUrl,
      path: fileName,
      width,
      height,
      size: file.size,
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'media:upload',
        entityType: 'media',
        entityId: fileName,
        ip: clientIp,
        status: 'success',
        details: { fileName, size: file.size, contentType: file.type },
      })
    }

    return NextResponse.json(responsePayload, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to upload image' } },
      { status: 500 }
    )
  }
}
