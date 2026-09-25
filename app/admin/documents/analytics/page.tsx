'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Loader2,
  RefreshCw,
  Clock,
  Cpu,
  FileText,
  ShieldAlert,
  Save,
  MapPin,
  Calendar,
  Download,
  BarChart3,
  Globe,
  Sparkles,
  Search
} from 'lucide-react'
import { useToast } from '@/components/Toast'

type Timeframe = 'today' | 'week' | 'month' | 'all'

interface Overview {
  dailyTokensConsumed: number
  dailyTokenQuota: number
  remainingTokens: number
  refreshTimeSeconds: number
  docsTodayCount: number
  aiDocsTodayCount: number
  standardDocsTodayCount: number
  docsWeekCount: number
  docsMonthCount: number
  docsTotalCount: number
  uniqueCitiesCount: number
}

interface TemplateBreakdown {
  name: string
  count: number
  aiCount: number
  standardCount: number
  tokens: number
  pct: number
}

interface LocationBreakdown {
  city: string
  region: string
  regionName: string
  country: string
  countryCode: string
  flag: string
  count: number
  pct: number
}

interface RecentGeneration {
  id: string
  template_name: string
  generation_type: string
  total_tokens: number
  city: string
  regionName: string
  country: string
  flag: string
  ip: string
  created_at: string
}

interface Settings {
  maxRequests: string
  maxTokens: string
  whitelistedIps: string
}

export default function DocumentAnalyticsPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [timeframe, setTimeframe] = useState<Timeframe>('today')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [templateBreakdown, setTemplateBreakdown] = useState<TemplateBreakdown[]>([])
  const [topLocations, setTopLocations] = useState<LocationBreakdown[]>([])
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([])
  const [hourlyDistribution, setHourlyDistribution] = useState<number[]>(new Array(24).fill(0))
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')

  // Settings editing state
  const [maxRequests, setMaxRequests] = useState('50')
  const [maxTokens, setMaxTokens] = useState('100000')
  const [whitelistedIps, setWhitelistedIps] = useState('127.0.0.1')
  const [savingSettings, setSavingSettings] = useState(false)

  const fetchData = async (tf: Timeframe = timeframe, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/documents/analytics?timeframe=${tf}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to load document analytics')
        showToast(data.error || 'Failed to load analytics', 'error')
      } else {
        setOverview(data.overview)
        setTemplateBreakdown(data.templateBreakdown || [])
        setTopLocations(data.topLocations || [])
        setRecentGenerations(data.recentGenerations || [])
        setHourlyDistribution(data.hourlyDistribution || new Array(24).fill(0))
        setTimeLeft(data.overview?.refreshTimeSeconds ?? null)

        if (data.settings) {
          setMaxRequests(data.settings.maxRequests)
          setMaxTokens(data.settings.maxTokens)
          setWhitelistedIps(data.settings.whitelistedIps)
        }
      }
    } catch (err) {
      console.error(err)
      setError('Connection error')
      showToast('Failed to connect to API', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData(timeframe)
    // Periodic refresh every 60s
    const interval = setInterval(() => fetchData(timeframe, true), 60000)
    return () => clearInterval(interval)
  }, [timeframe])

  // Countdown timer for daily quota refresh
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)

    try {
      const payloads = [
        { key: 'max_requests_per_ip_daily', value: maxRequests },
        { key: 'max_tokens_per_ip_daily', value: maxTokens },
        { key: 'whitelisted_ips', value: whitelistedIps },
      ]

      const results = await Promise.all(
        payloads.map(payload =>
          fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        )
      )

      if (results.every(res => res.ok)) {
        showToast('IP rate-limiting & whitelist saved successfully', 'success')
      } else {
        showToast('Failed to save some rate-limiting settings', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Error saving rate-limiting settings', 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  // Export current generation data to CSV
  const handleExportCSV = () => {
    if (!recentGenerations.length) {
      showToast('No document records to export', 'error')
      return
    }

    const headers = ['Document Name', 'Method', 'City', 'Region', 'Country', 'Tokens Used', 'Client IP', 'Created At (IST)']
    const rows = recentGenerations.map(gen => [
      `"${gen.template_name.replace(/"/g, '""')}"`,
      gen.generation_type.toUpperCase(),
      `"${gen.city.replace(/"/g, '""')}"`,
      `"${gen.regionName.replace(/"/g, '""')}"`,
      gen.country,
      gen.total_tokens,
      gen.ip,
      `"${new Date(gen.created_at).toLocaleString('en-IN')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `document_analytics_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Analytics exported to CSV', 'success')
  }

  // Filtered recent generations based on search query
  const filteredGenerations = useMemo(() => {
    if (!searchQuery.trim()) return recentGenerations
    const q = searchQuery.toLowerCase()
    return recentGenerations.filter(
      gen =>
        gen.template_name.toLowerCase().includes(q) ||
        gen.city.toLowerCase().includes(q) ||
        gen.regionName.toLowerCase().includes(q) ||
        gen.ip.includes(q)
    )
  }, [recentGenerations, searchQuery])

  // Hourly chart max value for scaling
  const maxHourlyCount = Math.max(1, ...hourlyDistribution)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 text-slate-500">
        <Loader2 className="w-9 h-9 animate-spin text-amber-500" />
        <p className="text-sm font-semibold tracking-wide text-slate-700">Loading document intelligence...</p>
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="p-8 admin-card border border-red-500/20 bg-red-500/[0.02] text-red-600 rounded-2xl max-w-2xl mx-auto my-12">
        <h2 className="text-xl font-bold font-heading mb-2">Error Loading Analytics</h2>
        <p className="text-sm">{error || 'An unexpected error occurred while communicating with the analytics engine.'}</p>
        <button
          onClick={() => fetchData(timeframe)}
          className="mt-5 inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  const quotaPct = Math.min(100, Math.round((overview.dailyTokensConsumed / overview.dailyTokenQuota) * 100))

  // Timeframe labels
  const timeframeLabels: Record<Timeframe, { title: string; count: number }> = {
    today: { title: 'Today', count: overview.docsTodayCount },
    week: { title: 'This Week (7D)', count: overview.docsWeekCount },
    month: { title: 'This Month (30D)', count: overview.docsMonthCount },
    all: { title: 'All Time', count: overview.docsTotalCount },
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen text-slate-900">
      
      {/* ─── Top Header & Controls ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                Document Generation Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time tracking of generated legal deeds, geographic origins, token quotas, and client IPs.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={() => fetchData(timeframe, true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ─── Timeframe Navigation Bar ─────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
          {(['today', 'week', 'month', 'all'] as Timeframe[]).map(tf => {
            const isActive = timeframe === tf
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{timeframeLabels[tf].title}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] tabular-nums ${
                  isActive ? 'bg-amber-100 text-amber-800' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {timeframeLabels[tf].count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>Viewing data for <strong>{timeframeLabels[timeframe].title}</strong></span>
        </div>
      </div>

      {/* ─── Executive Metric KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Documents */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Documents Created
            </span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {timeframeLabels[timeframe].count}
            </span>
            <span className="text-xs text-slate-400">drafts</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>AI: <strong className="text-blue-600">{overview.aiDocsTodayCount}</strong></span>
            <span>Standard: <strong className="text-emerald-600">{overview.standardDocsTodayCount}</strong></span>
          </div>
        </div>

        {/* Unique Access Locations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Access Hubs
            </span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {topLocations.length}
            </span>
            <span className="text-xs text-slate-400">cities / regions</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">Top: <strong>{topLocations[0]?.city || 'Direct Access'}</strong></span>
            <span>{topLocations[0]?.flag || '🇮🇳'}</span>
          </div>
        </div>

        {/* Gemini Token Usage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Daily AI Quota Usage
            </span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {formatINR(overview.dailyTokensConsumed)}
            </span>
            <span className="text-xs text-slate-400">/ 1M tokens</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${quotaPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
              <span>{quotaPct}% used</span>
              <span>{formatINR(overview.remainingTokens)} left</span>
            </div>
          </div>
        </div>

        {/* Quota Refresh Countdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Quota Refresh In
            </span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
              {timeLeft !== null && timeLeft > 0 ? formatTime(timeLeft) : '00:00:00'}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Resets at 00:00 UTC</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Key rotation active</span>
          </div>
        </div>
      </div>

      {/* ─── Two-Column Intelligence: Geolocation vs Template Popularity ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Where It Was Accessed From (Geolocation Intelligence) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Where Accessed From (Cities & Regions)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Geographic location of corporate lawyers & compliance officers creating documents.
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
              {topLocations.length} Hubs
            </span>
          </div>

          {topLocations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <span>No geographic access records found for this period.</span>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5">City & State / Country</th>
                    <th className="pb-2.5 text-right">Drafts</th>
                    <th className="pb-2.5 text-right w-24">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topLocations.map(loc => (
                    <tr key={`${loc.city}-${loc.region}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base select-none">{loc.flag}</span>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {loc.city}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {loc.regionName || loc.region ? `${loc.regionName || loc.region}, ` : ''}{loc.country}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 tabular-nums">
                        {loc.count}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${loc.pct}%` }}
                            />
                          </div>
                          <span className="text-slate-500 tabular-nums font-mono text-[11px]">
                            {loc.pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Which Documents Were Created (Template Breakdown) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Which Documents Created ({timeframeLabels[timeframe].title})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Volume and method distribution across legal document templates.
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-1 rounded-lg">
              {templateBreakdown.length} Templates
            </span>
          </div>

          {templateBreakdown.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <span>No documents generated in this timeframe yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5">Template Name</th>
                    <th className="pb-2.5 text-center">AI / Std</th>
                    <th className="pb-2.5 text-right">Drafts</th>
                    <th className="pb-2.5 text-right w-24">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templateBreakdown.map(tpl => (
                    <tr key={tpl.name} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 pr-2">
                        <span className="font-semibold text-slate-900 block truncate max-w-xs text-xs" title={tpl.name}>
                          {tpl.name}
                        </span>
                        {tpl.tokens > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatINR(tpl.tokens)} tokens
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          {tpl.aiCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {tpl.aiCount} AI
                            </span>
                          )}
                          {tpl.standardCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {tpl.standardCount} Std
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 tabular-nums">
                        {tpl.count}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${tpl.pct}%` }}
                            />
                          </div>
                          <span className="text-slate-500 tabular-nums font-mono text-[11px]">
                            {tpl.pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Peak Drafting Hours (Hourly Distribution in IST) ─────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Peak Professional Drafting Hours (IST)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hourly distribution of document generation activity across the Indian business day.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Timezone: UTC+5:30 (IST)</span>
        </div>

        {/* 24-Hour Bar Graph */}
        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 items-end h-28 pt-4">
          {hourlyDistribution.map((count, hour) => {
            const heightPct = Math.round((count / maxHourlyCount) * 100)
            const isBusinessHours = hour >= 10 && hour <= 18
            return (
              <div key={hour} className="flex flex-col items-center gap-1 group relative">
                <div className="w-full bg-slate-100 rounded-t-sm h-20 flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      count > 0
                        ? isBusinessHours
                          ? 'bg-amber-500 group-hover:bg-amber-400'
                          : 'bg-indigo-500 group-hover:bg-indigo-400'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(count > 0 ? 8 : 0, heightPct)}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-400 font-mono">
                  {hour % 6 === 0 ? `${hour}:00` : ''}
                </span>

                {/* Tooltip on hover */}
                {count > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {hour}:00 IST: {count} {count === 1 ? 'doc' : 'docs'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
              Business Hours (10 AM - 6 PM IST)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
              Off-Hours Drafting
            </span>
          </div>
          <span>Total: <strong>{timeframeLabels[timeframe].count}</strong> drafts</span>
        </div>
      </div>

      {/* ─── Live Chronological Generation Feed ───────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              Live Generation Activity Feed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of recent documents created by practicing professionals.
            </p>
          </div>

          {/* Search inside recent feed */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doc, city, or IP..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {filteredGenerations.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
            No matching document generation records found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Document Template</th>
                  <th className="p-3">Location (City & Region)</th>
                  <th className="p-3 text-center">Method</th>
                  <th className="p-3 text-right">Tokens Used</th>
                  <th className="p-3">Client IP</th>
                  <th className="p-3 text-right">Created At (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGenerations.map(gen => {
                  const isWhitelisted = whitelistedIps.split(',').map(s => s.trim()).includes(gen.ip)
                  return (
                    <tr key={gen.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 max-w-xs truncate" title={gen.template_name}>
                        {gen.template_name}
                      </td>
                      <td className="p-3 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{gen.flag}</span>
                          <span className="font-medium">{gen.city}</span>
                          {gen.regionName && (
                            <span className="text-slate-400 text-[11px]">({gen.regionName})</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            gen.generation_type === 'ai'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {gen.generation_type}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {gen.generation_type === 'ai' ? formatINR(gen.total_tokens) : '0 (Std)'}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        {gen.ip}
                        {isWhitelisted && (
                          <span className="ml-1.5 px-1 py-0.5 rounded text-[9px] font-sans font-bold bg-emerald-100 text-emerald-800">
                            Whitelist
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right text-slate-500 text-[11px]">
                        {new Date(gen.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Rate Limiting & Whitelist Settings Form ──────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-bold font-heading text-slate-900">
            IP Rate-Limiting & Whitelist Controls
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Configure safety thresholds per IP to protect Gemini API keys from quota abuse and scraping loops.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Max AI Requests Per IP / Daily
              </label>
              <input
                type="number"
                required
                min="1"
                value={maxRequests}
                onChange={e => setMaxRequests(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Max AI Tokens Per IP / Daily
              </label>
              <input
                type="number"
                required
                min="1"
                value={maxTokens}
                onChange={e => setMaxTokens(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              Whitelisted Testing IPs
              <span className="text-[10px] text-slate-400 font-normal uppercase">(exempt from rate limits)</span>
            </label>
            <input
              type="text"
              value={whitelistedIps}
              onChange={e => setWhitelistedIps(e.target.value)}
              placeholder="e.g. 127.0.0.1, 192.168.1.100"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-mono transition-colors"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Comma-separated list of client IP addresses. Useful for internal testing and automated test workers.
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs transition-all disabled:opacity-60"
            >
              {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
