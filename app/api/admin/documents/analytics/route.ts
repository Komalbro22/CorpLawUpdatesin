import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { resolveGeoFromIp, GeoLocation } from '@/lib/geo-ip'

export async function GET(request: Request) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const requestedTimeframe = searchParams.get('timeframe') || 'today' // 'today' | 'week' | 'month' | 'all'

    const DAILY_TOKEN_QUOTA = parseInt(process.env.GEMINI_DAILY_TOKEN_QUOTA ?? '1000000', 10)

    // Calculate reference time boundaries
    const now = new Date()

    const startOfToday = new Date(now)
    startOfToday.setUTCHours(0, 0, 0, 0)
    const startOfTodayIso = startOfToday.toISOString()

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // 1. Fetch recent generated documents (lean columns only to preserve Supabase egress)
    const { data: allDocs, error: docsError } = await supabaseAdmin
      .from('generated_documents')
      .select('id, template_name, total_tokens, prompt_tokens, completion_tokens, ip_address, generation_type, created_at, form_data')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (docsError) {
      console.error('[Analytics API] Error fetching documents:', docsError.message)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    const docs = allDocs || []

    // 2. High-level Timeframe Counts
    const todayDocs = docs.filter(d => d.created_at >= startOfTodayIso)
    const weekDocs = docs.filter(d => d.created_at >= sevenDaysAgo)
    const monthDocs = docs.filter(d => d.created_at >= thirtyDaysAgo)

    let dailyTokensConsumed = 0
    let aiDocsTodayCount = 0
    let standardDocsTodayCount = 0

    todayDocs.forEach(doc => {
      if (doc.generation_type === 'ai') {
        dailyTokensConsumed += doc.total_tokens || 0
        aiDocsTodayCount++
      } else {
        standardDocsTodayCount++
      }
    })

    const remainingTokens = Math.max(0, DAILY_TOKEN_QUOTA - dailyTokensConsumed)

    // Midnight UTC refresh timer
    const midnightUtc = new Date(now)
    midnightUtc.setUTCHours(24, 0, 0, 0)
    const refreshTimeSeconds = Math.max(0, Math.floor((midnightUtc.getTime() - now.getTime()) / 1000))

    // 3. Resolve Geolocation for unique IPs in dataset
    const uniqueIps = Array.from(new Set(docs.map(d => d.ip_address || '127.0.0.1')))
    const geoMap = new Map<string, GeoLocation>()

    // Resolve geo concurrently with a concurrency limit
    await Promise.all(
      uniqueIps.map(async ip => {
        const geo = await resolveGeoFromIp(ip)
        geoMap.set(ip, geo)
      })
    )

    // 4. Select documents for the currently requested timeframe
    let filteredDocs = docs
    if (requestedTimeframe === 'today') {
      filteredDocs = todayDocs
    } else if (requestedTimeframe === 'week') {
      filteredDocs = weekDocs
    } else if (requestedTimeframe === 'month') {
      filteredDocs = monthDocs
    }

    const activeCount = filteredDocs.length

    // 5. Aggregate Templates in Selected Timeframe
    const templateMap = new Map<
      string,
      { count: number; aiCount: number; standardCount: number; tokens: number }
    >()

    filteredDocs.forEach(doc => {
      const name = doc.template_name || 'Unspecified Document'
      const current = templateMap.get(name) || { count: 0, aiCount: 0, standardCount: 0, tokens: 0 }
      current.count++
      if (doc.generation_type === 'ai') {
        current.aiCount++
        current.tokens += doc.total_tokens || 0
      } else {
        current.standardCount++
      }
      templateMap.set(name, current)
    })

    const templateBreakdown = Array.from(templateMap.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        aiCount: stats.aiCount,
        standardCount: stats.standardCount,
        tokens: stats.tokens,
        pct: activeCount > 0 ? Math.round((stats.count / activeCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // 6. Aggregate Geolocation in Selected Timeframe
    const locationMap = new Map<
      string,
      {
        city: string
        region: string
        regionName: string
        country: string
        countryCode: string
        flag: string
        count: number
      }
    >()

    filteredDocs.forEach(doc => {
      // Priority 1: Check embedded geo inside form_data._meta.geo
      const embeddedGeo = (doc.form_data as any)?._meta?.geo
      const resolvedGeo = embeddedGeo || geoMap.get(doc.ip_address || '127.0.0.1') || {
        city: 'Direct Access',
        region: '',
        regionName: 'India',
        country: 'India',
        countryCode: 'IN',
        flag: '🇮🇳',
      }

      const locationKey = `${resolvedGeo.city}#${resolvedGeo.regionName || resolvedGeo.region || resolvedGeo.country}`
      const existing = locationMap.get(locationKey) || {
        city: resolvedGeo.city,
        region: resolvedGeo.region,
        regionName: resolvedGeo.regionName || resolvedGeo.region || resolvedGeo.country,
        country: resolvedGeo.country,
        countryCode: resolvedGeo.countryCode || 'IN',
        flag: resolvedGeo.flag || '🇮🇳',
        count: 0,
      }
      existing.count++
      locationMap.set(locationKey, existing)
    })

    const topLocations = Array.from(locationMap.values())
      .map(loc => ({
        ...loc,
        pct: activeCount > 0 ? Math.round((loc.count / activeCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // 7. Recent Generations (Chronological Feed)
    const recentGenerations = docs.slice(0, 50).map(doc => {
      const embeddedGeo = (doc.form_data as any)?._meta?.geo
      const resolvedGeo = embeddedGeo || geoMap.get(doc.ip_address || '127.0.0.1') || {
        city: 'Direct Access',
        region: '',
        regionName: 'India',
        country: 'India',
        countryCode: 'IN',
        flag: '🇮🇳',
      }

      return {
        id: doc.id,
        template_name: doc.template_name || 'Standard Legal Document',
        generation_type: doc.generation_type || 'standard',
        total_tokens: doc.total_tokens || 0,
        city: resolvedGeo.city,
        regionName: resolvedGeo.regionName || resolvedGeo.region,
        country: resolvedGeo.country,
        flag: resolvedGeo.flag || '🇮🇳',
        ip: doc.ip_address || 'unknown',
        created_at: doc.created_at,
      }
    })

    // 8. Hourly Activity Distribution (IST = UTC + 5:30)
    const hourlyCounts = new Array(24).fill(0)
    filteredDocs.forEach(doc => {
      const d = new Date(doc.created_at)
      // Convert to IST hour
      const istHours = (d.getUTCHours() + 5 + Math.floor((d.getUTCMinutes() + 30) / 60)) % 24
      hourlyCounts[istHours]++
    })

    // 9. Fetch current limit settings
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['max_requests_per_ip_daily', 'max_tokens_per_ip_daily', 'whitelisted_ips'])

    if (settingsError) {
      console.error('[Analytics API] Error fetching site settings:', settingsError.message)
    }

    const maxRequests = settingsData?.find(s => s.key === 'max_requests_per_ip_daily')?.value || '50'
    const maxTokens = settingsData?.find(s => s.key === 'max_tokens_per_ip_daily')?.value || '100000'
    const whitelistedIps = settingsData?.find(s => s.key === 'whitelisted_ips')?.value || '127.0.0.1'

    return NextResponse.json(
      {
        timeframe: requestedTimeframe,
        overview: {
          dailyTokensConsumed,
          dailyTokenQuota: DAILY_TOKEN_QUOTA,
          remainingTokens,
          refreshTimeSeconds,
          docsTodayCount: todayDocs.length,
          aiDocsTodayCount,
          standardDocsTodayCount,
          docsWeekCount: weekDocs.length,
          docsMonthCount: monthDocs.length,
          docsTotalCount: docs.length,
          uniqueCitiesCount: locationMap.size,
        },
        templateBreakdown,
        topLocations,
        recentGenerations,
        hourlyDistribution: hourlyCounts,
        settings: {
          maxRequests,
          maxTokens,
          whitelistedIps,
        },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=15',
        },
      }
    )
  } catch (err: any) {
    console.error('[Analytics API] Internal server error:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
