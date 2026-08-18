// app/api/admin/regulator-radar/route.ts
import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { runRegulatorRadar } from '@/lib/regulator-radar'
import { getCached, setCached } from '@/lib/redis-cache'
import { RadarResponse } from '@/lib/regulator-radar/types'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const hours = parseInt(searchParams.get('hours') || '72', 10)
  const isFresh = searchParams.get('fresh') === 'true'
  const enabledParam = searchParams.get('enabled')
  const enabledRegulators = enabledParam 
    ? (enabledParam.split(',').map(s => s.trim().toUpperCase()) as any[]) 
    : undefined

  const cacheKey = `radar:updates:${hours}h:${enabledParam || 'all'}`

  // 1. Check Redis cache unless user specifically requested a force refresh
  if (!isFresh) {
    try {
      const cached = await getCached<RadarResponse>(cacheKey)
      if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
        return NextResponse.json({ ...cached, cached: true })
      }
    } catch (e) {
      console.warn('[Radar API] Redis get failed:', e)
    }
  }

  // 2. Fetch fresh updates with strict 8.5s maximum execution budget
  try {
    const radarPromise = runRegulatorRadar(hours, enabledRegulators)
    const timeoutFallback: RadarResponse = {
      status: 'partial',
      checkedAt: new Date().toISOString(),
      filterHours: hours,
      totalFound: 0,
      sources: [],
      items: []
    }

    const radarData = await Promise.race([
      radarPromise,
      new Promise<RadarResponse>((resolve) => setTimeout(() => resolve(timeoutFallback), 8500))
    ])

    // Cache results for 10 minutes (600s)
    if (radarData.items && radarData.items.length > 0) {
      try {
        await setCached(cacheKey, radarData, 600)
      } catch (e) {
        console.warn('[Radar API] Redis set failed:', e)
      }
    }

    return NextResponse.json({ ...radarData, cached: false })
  } catch (err: any) {
    console.error('[Radar API] Run error:', err)
    return NextResponse.json(
      {
        status: 'error',
        error: err.message || 'Failed to scan regulator portals',
        checkedAt: new Date().toISOString(),
        sources: [],
        items: []
      },
      { status: 200 } // Return 200 with empty items so client doesn't crash on 500/504
    )
  }
}
