import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const DAILY_TOKEN_QUOTA = parseInt(process.env.GEMINI_DAILY_TOKEN_QUOTA ?? '1000000', 10)

    const startOfToday = new Date()
    startOfToday.setUTCHours(0, 0, 0, 0)
    const startOfTodayIso = startOfToday.toISOString()

    // 1. Fetch all documents generated today to compute daily token consumption
    const { data: todayDocs, error: todayDocsError } = await supabaseAdmin
      .from('generated_documents')
      .select('total_tokens, prompt_tokens, completion_tokens, generation_type, created_at')
      .gte('created_at', startOfTodayIso)

    if (todayDocsError) {
      console.error('[Analytics API] Error fetching today\'s documents:', todayDocsError.message)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    const docsTodayCount = todayDocs?.length || 0
    let dailyTokensConsumed = 0
    let aiDocsTodayCount = 0
    let standardDocsTodayCount = 0

    todayDocs?.forEach(doc => {
      if (doc.generation_type === 'ai') {
        dailyTokensConsumed += doc.total_tokens || 0
        aiDocsTodayCount++
      } else {
        standardDocsTodayCount++
      }
    })

    const remainingTokens = Math.max(0, DAILY_TOKEN_QUOTA - dailyTokensConsumed)

    // 2. Refresh Time: calculate seconds left until Midnight UTC
    const midnightUtc = new Date()
    midnightUtc.setUTCHours(24, 0, 0, 0)
    const refreshTimeSeconds = Math.max(0, Math.floor((midnightUtc.getTime() - Date.now()) / 1000))

    // 3. Last Generation Details
    const { data: lastGen, error: lastGenError } = await supabaseAdmin
      .from('generated_documents')
      .select('template_name, created_at, total_tokens, generation_type')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastGenError) {
      console.error('[Analytics API] Error fetching last generation:', lastGenError.message)
    }

    // 4. Fetch last 1000 documents to compute aggregate statistics (Top IPs, Top Templates)
    const { data: recentDocs, error: recentDocsError } = await supabaseAdmin
      .from('generated_documents')
      .select('template_name, total_tokens, ip_address, generation_type, created_at')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (recentDocsError) {
      console.error('[Analytics API] Error fetching recent documents:', recentDocsError.message)
    }

    // Process Top IPs/Clients
    const ipCounts: Record<string, { count: number; tokens: number }> = {}
    recentDocs?.forEach(doc => {
      const ip = doc.ip_address || 'unknown'
      if (!ipCounts[ip]) {
        ipCounts[ip] = { count: 0, tokens: 0 }
      }
      ipCounts[ip].count++
      if (doc.generation_type === 'ai') {
        ipCounts[ip].tokens += doc.total_tokens || 0
      }
    })

    const topClients = Object.entries(ipCounts)
      .map(([ip, stats]) => ({
        ip,
        count: stats.count,
        tokens: stats.tokens,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Process Top Templates
    const templateCounts: Record<string, number> = {}
    recentDocs?.forEach(doc => {
      const name = doc.template_name || 'Unspecified'
      templateCounts[name] = (templateCounts[name] || 0) + 1
    })

    const topTemplates = Object.entries(templateCounts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 5. Fetch current limit settings
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
        overview: {
          dailyTokensConsumed,
          dailyTokenQuota: DAILY_TOKEN_QUOTA,
          remainingTokens,
          refreshTimeSeconds,
          docsTodayCount,
          aiDocsTodayCount,
          standardDocsTodayCount,
        },
        lastGeneration: lastGen || null,
        topClients,
        topTemplates,
        settings: {
          maxRequests,
          maxTokens,
          whitelistedIps,
        },
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30',
        },
      }
    )
  } catch (err: any) {
    console.error('[Analytics API] Internal server error:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
