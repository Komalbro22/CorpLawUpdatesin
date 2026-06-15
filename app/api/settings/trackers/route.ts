import { getSetting } from '@/lib/settings'
import { NextResponse } from 'next/server'

export const revalidate = 0

export async function GET() {
  try {
    const gaId = await getSetting('google_analytics_id')
    const clarityId = await getSetting('microsoft_clarity_id')

    return NextResponse.json({
      gaId: gaId || null,
      clarityId: clarityId || null
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
