import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  submitUrlsToGoogleIndexing,
  submitToGoogleIndexing,
  pingGoogleWebSub,
  isGoogleIndexingConfigured,
} from '@/lib/google-indexing'

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const status = isGoogleIndexingConfigured()
  return NextResponse.json({
    configured: status.configured,
    clientEmail: status.clientEmail,
    quota: {
      dailyLimit: 200,
      scope: 'https://www.googleapis.com/auth/indexing',
      endpoint: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
    },
  })
}

export async function POST(req: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { url, urls: customUrls, limit = 20, action = 'URL_UPDATED' } = body

    // 1. Single URL Mode (for testing or updating an individual article)
    if (url && typeof url === 'string') {
      const result = await submitToGoogleIndexing(url.trim(), action)
      const webSubPinged = await pingGoogleWebSub()
      return NextResponse.json({
        success: result.success,
        count: 1,
        message: result.message,
        url: result.url,
        webSubPinged,
      })
    }

    // 2. Bulk Mode: Custom URLs or Recent Articles from Supabase
    let targetUrls: string[] = []
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corplawupdates.in'

    if (Array.isArray(customUrls) && customUrls.length > 0) {
      targetUrls = customUrls.slice(0, 50)
    } else {
      const maxCount = Math.min(Math.max(1, Number(limit) || 20), 50)
      const { data: articles, error: fetchErr } = await supabaseAdmin
        .from('updates')
        .select('slug')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(maxCount)

      if (fetchErr) {
        console.error('Failed to fetch updates for Google Indexing:', fetchErr)
      }

      targetUrls = [
        BASE_URL,
        `${BASE_URL}/updates`,
        `${BASE_URL}/calendar`,
        ...(articles || []).map((a) => `${BASE_URL}/updates/${a.slug}`),
      ]
    }

    const batchResult = await submitUrlsToGoogleIndexing(targetUrls, action)
    const webSubPinged = await pingGoogleWebSub()

    return NextResponse.json({
      success: batchResult.success > 0,
      count: targetUrls.length,
      successCount: batchResult.success,
      failedCount: batchResult.failed,
      submitted: batchResult.submitted,
      errors: batchResult.errors,
      webSubPinged,
    })
  } catch (error) {
    const err = error as Error & { digest?: string }
    if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
      throw error
    }

    console.error('[Google Indexing API Route Error]', error)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
