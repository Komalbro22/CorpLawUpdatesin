import { NextRequest, NextResponse } from 'next/server'
import { getNewsletterPdfBySlug, incrementNewsletterDownloadCount } from '@/lib/newsletter-pdfs'

export const dynamic = 'force-dynamic'

/**
 * GET /newsletters/[slug]
 * Branded download/view route for weekly briefing PDFs.
 * 302-redirects to the public Supabase storage URL with a cache-busting timestamp.
 * Automatically opens the PDF directly inside the reader's browser viewer.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.redirect(new URL('/newsletters', request.url), 302)
    }

    const { data: record, error } = await getNewsletterPdfBySlug(slug)

    if (error || !record || !record.direct_storage_url) {
      // If direct slug not found, redirect to archive page with error notice
      return NextResponse.redirect(new URL('/newsletters?not_found=1', request.url), 302)
    }

    // Increment download/view count in the background (fire-and-forget)
    incrementNewsletterDownloadCount(record.id).catch(() => {})

    // 302 Redirect directly to the storage asset URL.
    // The storage URL serves Content-Type: application/pdf so browser renders it inline.
    // We set Cache-Control: no-cache on the 302 itself to ensure replaced files are never stale.
    return NextResponse.redirect(record.direct_storage_url, {
      status: 302,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (err: any) {
    console.error('[NewsletterDownload] Error redirecting to PDF:', err)
    return NextResponse.redirect(new URL('/newsletters', request.url), 302)
  }
}
