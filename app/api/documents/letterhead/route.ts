import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import sharp from 'sharp'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const email = formData.get('email') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process with sharp — standard A4 letterhead scale (width: 2480px, height: 400px at 300 DPI)
    let processed: Buffer
    try {
      processed = await sharp(buffer)
        .resize({
          width: 2480,
          height: 400,
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // transparent background
        })
        .png({ quality: 90 })
        .toBuffer()
    } catch (sharpError: any) {
      console.error('Sharp processing error:', sharpError)
      return NextResponse.json(
        { error: `Failed to process image: ${sharpError.message}` },
        { status: 500 }
      )
    }

    const timestamp = Date.now()
    const fileIdentifier = email ? email.replace(/[^a-zA-Z0-9]/g, '_') : 'anonymous'
    const fileName = `letterheads/${fileIdentifier}-${timestamp}.png`

    // Create bucket if it doesn't exist (we will ignore errors if it already exists)
    try {
      await supabaseAdmin.storage.createBucket('document-assets', {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024 // 2MB limit
      })
    } catch (bucketErr) {
      // Bucket might already exist, ignore error
    }

    // Upload processed PNG to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('document-assets')
      .upload(fileName, processed, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload letterhead to storage: ${uploadError.message}` },
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
