import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { getNewsletterPdfById, replaceNewsletterPdf, deleteNewsletterPdf } from '@/lib/newsletter-pdfs'
import { revalidateNewsletterMutation } from '@/lib/content-revalidation'

export const dynamic = 'force-dynamic'

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_HTML_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

/**
 * GET /api/admin/newsletter-pdfs/[id]
 * Fetch single newsletter PDF details by ID.
 * Scopes: newsletter:read
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params
  const { data, error } = await getNewsletterPdfById(id)

  if (error || !data) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: error || 'Newsletter PDF not found' } },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, newsletter: data })
}

/**
 * PATCH /api/admin/newsletter-pdfs/[id]
 * Replace the PDF file and/or update metadata (week_label, week_start, week_end, slug).
 * Accepts either multipart/form-data or application/json.
 * Scopes: newsletter:write
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params
  const clientIp = getClientIp(request)

  try {
    let fileBuffer: Buffer | undefined
    let htmlBuffer: Buffer | undefined
    let fileName: string | undefined
    let week_label: string | undefined
    let week_start: string | undefined
    let week_end: string | undefined
    let slug: string | undefined

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const htmlFile = formData.get('html') as File | null
      week_label = (formData.get('week_label') as string | null)?.trim() || undefined
      week_start = (formData.get('week_start') as string | null)?.trim() || undefined
      week_end = (formData.get('week_end') as string | null)?.trim() || undefined
      slug = (formData.get('slug') as string | null)?.trim() || undefined

      if (file) {
        const isPdfMime = file.type === 'application/pdf'
        const isPdfExt = file.name.toLowerCase().endsWith('.pdf')
        if (!isPdfMime && !isPdfExt) {
          return NextResponse.json(
            { error: { code: 'INVALID_FILE_TYPE', message: 'Only PDF documents (application/pdf) are allowed.' } },
            { status: 400 }
          )
        }

        if (file.size > MAX_PDF_SIZE_BYTES) {
          return NextResponse.json(
            { error: { code: 'FILE_TOO_LARGE', message: `File size exceeds the 10 MB limit (provided: ${(file.size / (1024 * 1024)).toFixed(2)} MB).` } },
            { status: 400 }
          )
        }

        const arrayBuffer = await file.arrayBuffer()
        fileBuffer = Buffer.from(arrayBuffer)
        fileName = file.name
      }

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
    } else {
      const json = await request.json()
      week_label = json.week_label?.trim() || undefined
      week_start = json.week_start?.trim() || undefined
      week_end = json.week_end?.trim() || undefined
      slug = json.slug?.trim() || undefined
      if (typeof json.html === 'string' && json.html.trim()) {
        htmlBuffer = Buffer.from(json.html, 'utf-8')
      }
    }

    if (week_start && !/^\d{4}-\d{2}-\d{2}$/.test(week_start)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid "week_start" date format (expected YYYY-MM-DD).' } },
        { status: 400 }
      )
    }

    if (week_end && !/^\d{4}-\d{2}-\d{2}$/.test(week_end)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid "week_end" date format (expected YYYY-MM-DD).' } },
        { status: 400 }
      )
    }

    const previousRecord = await getNewsletterPdfById(id)
    const previousSlug = previousRecord.data?.slug

    const result = await replaceNewsletterPdf(id, {
      fileBuffer,
      htmlBuffer,
      fileName,
      slug,
      week_label,
      week_start,
      week_end,
    })

    if (result.error || !result.data) {
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: result.error || 'Failed to update newsletter PDF' } },
        { status: 500 }
      )
    }

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'newsletter:write',
        entityType: 'newsletter_pdf',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: {
          replacedFile: !!fileBuffer,
          replacedHtml: !!htmlBuffer,
          slug: result.data.slug,
          week_label: result.data.week_label,
          file_size_bytes: result.data.file_size_bytes,
          html_path: result.data.html_path,
          has_html: result.data.has_html,
        },
      })
    }

    revalidateNewsletterMutation({ slug: result.data.slug, oldSlug: previousSlug })

    return NextResponse.json({
      success: true,
      message: fileBuffer || htmlBuffer ? 'Newsletter files updated successfully.' : 'Newsletter metadata updated successfully.',
      newsletter: result.data,
      public_url: result.data.public_url,
      reading_url: result.data.reading_url,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Unexpected server error' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/newsletter-pdfs/[id]
 * Delete a newsletter PDF and its underlying storage file.
 * Scopes: newsletter:write
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'newsletter:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params
  const clientIp = getClientIp(request)
  const existingRecord = await getNewsletterPdfById(id)

  const result = await deleteNewsletterPdf(id)

  if (!result.success) {
    return NextResponse.json(
      { error: { code: 'DELETE_FAILED', message: result.error || 'Failed to delete newsletter PDF' } },
      { status: 500 }
    )
  }

  if (authCheck.auth.type === 'api_key') {
    await logApiAudit({
      keyId: authCheck.auth.key.id,
      keyName: authCheck.auth.key.name,
      action: 'newsletter:write',
      entityType: 'newsletter_pdf',
      entityId: id,
      ip: clientIp,
      status: 'success',
      details: { action: 'deleted' },
    })
  }

  revalidateNewsletterMutation({ slug: existingRecord.data?.slug })

  return NextResponse.json({
    success: true,
    message: 'Newsletter PDF deleted successfully.',
  })
}
