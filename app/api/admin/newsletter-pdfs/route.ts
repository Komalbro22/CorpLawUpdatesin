import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { listNewsletterPdfs, uploadNewsletterPdf } from '@/lib/newsletter-pdfs'

export const dynamic = 'force-dynamic'

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_HTML_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

/**
 * GET /api/admin/newsletter-pdfs
 * List all weekly newsletter PDFs ordered newest first.
 * Scopes: newsletter:read (session or API key)
 */
export async function GET(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { data, error } = await listNewsletterPdfs()
  if (error) {
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: error } },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    count: data.length,
    newsletters: data,
  })
}

/**
 * POST /api/admin/newsletter-pdfs
 * Multipart upload of a weekly newsletter PDF with optional HTML reading version.
 * Fields:
 *  - file (File, application/pdf, <= 10MB) [Required]
 *  - html (File, text/html or .html, <= 2MB) [Optional]
 *  - week_label (string, e.g. "2 – 8 November 2026") [Required]
 *  - week_start (YYYY-MM-DD) [Required]
 *  - week_end (YYYY-MM-DD) [Required]
 *  - slug (optional string, e.g. "weekly-briefing-2026-11-09")
 * Scopes: newsletter:write (session or API key)
 */
export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const clientIp = getClientIp(request)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const htmlFile = formData.get('html') as File | null
    const week_label = (formData.get('week_label') as string | null)?.trim()
    const week_start = (formData.get('week_start') as string | null)?.trim()
    const week_end = (formData.get('week_end') as string | null)?.trim()
    const customSlug = (formData.get('slug') as string | null)?.trim()

    // 1. Validate File Presence
    if (!file) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required "file" field in multipart form-data.' } },
        { status: 400 }
      )
    }

    // 2. Validate MIME Type & Extension (PDF only)
    const isPdfMime = file.type === 'application/pdf'
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf')
    if (!isPdfMime && !isPdfExt) {
      return NextResponse.json(
        { error: { code: 'INVALID_FILE_TYPE', message: 'Only PDF documents (application/pdf) are allowed.' } },
        { status: 400 }
      )
    }

    // 3. Validate File Size (Max 10 MB)
    if (file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { error: { code: 'FILE_TOO_LARGE', message: `File size exceeds the 10 MB limit (provided: ${(file.size / (1024 * 1024)).toFixed(2)} MB).` } },
        { status: 400 }
      )
    }

    // 4. Validate Optional HTML Reading Version
    let htmlBuffer: Buffer | undefined
    if (htmlFile && htmlFile.size > 0) {
      const isHtmlMime = htmlFile.type === 'text/html' || htmlFile.type === 'application/xhtml+xml'
      const isHtmlExt = htmlFile.name.toLowerCase().endsWith('.html') || htmlFile.name.toLowerCase().endsWith('.htm')
      if (!isHtmlMime && !isHtmlExt) {
        return NextResponse.json(
          { error: { code: 'INVALID_HTML_TYPE', message: 'Only HTML files (text/html or .html) are allowed for the reading version.' } },
          { status: 400 }
        )
      }

      if (htmlFile.size > MAX_HTML_SIZE_BYTES) {
        return NextResponse.json(
          { error: { code: 'HTML_TOO_LARGE', message: `HTML file size exceeds the 2 MB limit (provided: ${(htmlFile.size / (1024 * 1024)).toFixed(2)} MB).` } },
          { status: 400 }
        )
      }

      const htmlArrayBuffer = await htmlFile.arrayBuffer()
      htmlBuffer = Buffer.from(htmlArrayBuffer)
    }

    // 5. Validate Metadata Fields
    if (!week_label) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required "week_label" field (e.g. "2 – 8 November 2026").' } },
        { status: 400 }
      )
    }

    if (!week_start || !/^\d{4}-\d{2}-\d{2}$/.test(week_start)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing or invalid "week_start" date (expected YYYY-MM-DD).' } },
        { status: 400 }
      )
    }

    if (!week_end || !/^\d{4}-\d{2}-\d{2}$/.test(week_end)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing or invalid "week_end" date (expected YYYY-MM-DD).' } },
        { status: 400 }
      )
    }

    const uploader = authCheck.auth.type === 'api_key'
      ? `api_key:${authCheck.auth.key.name}`
      : `session:${authCheck.auth.role}`

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const result = await uploadNewsletterPdf({
      fileBuffer,
      htmlBuffer,
      fileName: file.name,
      slug: customSlug,
      week_label,
      week_start,
      week_end,
      uploaded_by: uploader,
    })

    if (result.error || !result.data) {
      return NextResponse.json(
        { error: { code: 'UPLOAD_FAILED', message: result.error || 'Failed to process newsletter upload' } },
        { status: 500 }
      )
    }

    // Audit Logging for API Key invocations
    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'newsletter:write',
        entityType: 'newsletter_pdf',
        entityId: result.data.id,
        ip: clientIp,
        status: 'success',
        details: {
          slug: result.data.slug,
          week_label,
          file_size_bytes: file.size,
          file_path: result.data.file_path,
          html_path: result.data.html_path,
          has_html: result.data.has_html,
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Newsletter PDF and reading version uploaded successfully.',
        newsletter: result.data,
        public_url: result.data.public_url,
        reading_url: result.data.reading_url,
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Unexpected server error' } },
      { status: 500 }
    )
  }
}
