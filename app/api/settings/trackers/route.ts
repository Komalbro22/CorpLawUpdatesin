import { getSetting } from '@/lib/settings'
import { NextResponse } from 'next/server'

export const revalidate = 0

export async function GET() {
  try {
    // Fetch GA and Clarity IDs in parallel for performance
    const [gaId, clarityId] = await Promise.all([
      getSetting('google_analytics_id'),
      getSetting('microsoft_clarity_id'),
    ])

    return NextResponse.json({
      gaId: gaId || null,
      clarityId: clarityId || null,
    })
  } catch (error) {
    const err = error as Error & { digest?: string }
    if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
      throw error
    }

    console.error('[API Error fetching trackers]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
