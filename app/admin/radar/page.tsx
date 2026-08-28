'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Radio,
  RefreshCw,
  ExternalLink,
  PenSquare,
  Sparkles,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Hourglass
} from 'lucide-react'
import { RadarResponse, RegulatorUpdate, RegulatorKey } from '@/lib/regulator-radar/types'

const LOCAL_STORAGE_SEEN_KEY = 'corplaw_radar_seen_hashes'
const LOCAL_STORAGE_ENABLED_KEY = 'corplaw_radar_active_regulators'
const LOCAL_STORAGE_HOURS_KEY = 'corplaw_radar_time_range_hours'

const ALL_REGULATORS: { key: RegulatorKey; label: string; desc: string; defaultOn: boolean }[] = [
  { key: 'FEMA', label: 'FEMA / FED', desc: 'RBI Foreign Exchange & A.P. DIR Circulars', defaultOn: true },
  { key: 'LABOUR', label: 'Labour / EPFO / ESIC', desc: 'EPFO & ESIC Orders and Labour Codes', defaultOn: true },
  { key: 'MCA', label: 'MCA', desc: 'Companies Act & LLP General Circulars', defaultOn: true },
  { key: 'SEBI', label: 'SEBI', desc: 'Securities & Market Circulars', defaultOn: true },
  { key: 'RBI', label: 'RBI Banking', desc: 'Commercial Banking & NBFCs', defaultOn: true },
  { key: 'CCI', label: 'CCI', desc: 'Competition Commission Orders & PR', defaultOn: true },
  { key: 'IBBI', label: 'IBBI', desc: 'Insolvency & Bankruptcy Circulars', defaultOn: true },
  { key: 'NCLT', label: 'NCLT Orders', desc: 'National Company Law Tribunal Benches & Orders', defaultOn: true },
  { key: 'NCLAT', label: 'NCLAT Appeals', desc: 'Company Law & IBC Appellate Judgments', defaultOn: true },
  { key: 'TAX', label: 'Tax (CBDT/CBIC)', desc: 'Income Tax & GST Notifications', defaultOn: false },
]

const TIME_RANGES = [
  { label: '48h (2 Days)', value: 48 },
  { label: '72h (3 Days)', value: 72, desc: 'Recommended' },
  { label: '7 Days (1 Wk)', value: 168 },
]

export default function RegulatorRadarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RadarResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [seenHashes, setSeenHashes] = useState<string[]>([])
  const [selectedRegulator, setSelectedRegulator] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [hideSeen, setHideSeen] = useState<boolean>(true)
  const [lastScanTime, setLastScanTime] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState<boolean>(false)
  const [timeRange, setTimeRange] = useState<number>(72)

  // Active / Enabled regulators list (persisted in localStorage)
  const [enabledRegulators, setEnabledRegulators] = useState<RegulatorKey[]>(() => {
    return ALL_REGULATORS.filter((r) => r.defaultOn).map((r) => r.key)
  })

  // Load seen hashes, time range & active regulators on mount
  useEffect(() => {
    try {
      const storedSeen = localStorage.getItem(LOCAL_STORAGE_SEEN_KEY)
      if (storedSeen) setSeenHashes(JSON.parse(storedSeen))

      const storedHours = localStorage.getItem(LOCAL_STORAGE_HOURS_KEY)
      if (storedHours) setTimeRange(Number(storedHours))

      const storedEnabled = localStorage.getItem(LOCAL_STORAGE_ENABLED_KEY)
      if (storedEnabled) {
        const parsed = JSON.parse(storedEnabled)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validKeys = ALL_REGULATORS.map((r) => r.key)
          const filtered = parsed.filter((k: any) => validKeys.includes(k))
          // Automatically merge any newly added defaultOn regulators (e.g. NCLT, NCLAT)
          const newDefaultKeys = ALL_REGULATORS.filter((r) => r.defaultOn && !filtered.includes(r.key)).map((r) => r.key)
          const merged = Array.from(new Set([...filtered, ...newDefaultKeys]))
          setEnabledRegulators(merged)
          try {
            localStorage.setItem(LOCAL_STORAGE_ENABLED_KEY, JSON.stringify(merged))
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Failed to load radar settings from localStorage:', e)
    }
  }, [])

  // Toggle regulator ON/OFF
  const toggleRegulator = (key: RegulatorKey) => {
    setEnabledRegulators((prev) => {
      let next: RegulatorKey[]
      if (prev.includes(key)) {
        if (prev.length === 1) {
          alert('At least one regulator must remain active.')
          return prev
        }
        next = prev.filter((k) => k !== key)
      } else {
        next = [...prev, key]
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_ENABLED_KEY, JSON.stringify(next))
      } catch (e) {}
      
      // Auto re-fetch with new enabled list
      fetchRadar(true, next, timeRange)
      return next
    })
  }

  // Handle changing time range
  const handleTimeRangeChange = (newHours: number) => {
    setTimeRange(newHours)
    try {
      localStorage.setItem(LOCAL_STORAGE_HOURS_KEY, String(newHours))
    } catch (e) {}
    fetchRadar(true, enabledRegulators, newHours)
  }

  // Toggle all on/off
  const setAllRegulators = (enableAll: boolean) => {
    const next = enableAll ? ALL_REGULATORS.map((r) => r.key) : ['MCA', 'SEBI', 'RBI', 'NCLT', 'NCLAT'] as RegulatorKey[]
    setEnabledRegulators(next)
    try {
      localStorage.setItem(LOCAL_STORAGE_ENABLED_KEY, JSON.stringify(next))
    } catch (e) {}
    fetchRadar(true, next, timeRange)
  }

  // Save seen hashes
  const markAsSeen = useCallback((id: string) => {
    setSeenHashes((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      try {
        localStorage.setItem(LOCAL_STORAGE_SEEN_KEY, JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }, [])

  const markAllAsSeen = useCallback(() => {
    if (!data?.items) return
    const allIds = data.items.map((i) => i.id)
    setSeenHashes((prev) => {
      const next = Array.from(new Set([...prev, ...allIds]))
      try {
        localStorage.setItem(LOCAL_STORAGE_SEEN_KEY, JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }, [data])

  const clearSeenHistory = useCallback(() => {
    if (confirm('Reset your seen/dismissed circular history? All past circulars will reappear.')) {
      setSeenHashes([])
      try {
        localStorage.removeItem(LOCAL_STORAGE_SEEN_KEY)
      } catch (e) {}
    }
  }, [])

  // Fetch Radar data
  const fetchRadar = useCallback(async (forceFresh = false, activeList = enabledRegulators, hours = timeRange) => {
    setLoading(true)
    setError(null)
    try {
      const enabledParam = activeList.join(',')
      const res = await fetch(`/api/admin/regulator-radar?hours=${hours}&enabled=${enabledParam}${forceFresh ? '&fresh=true' : ''}`)
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }
      const json: RadarResponse = await res.json()
      setData(json)
      setLastScanTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }))
    } catch (err: any) {
      setError(err.message || 'Failed to scan regulators')
    } finally {
      setLoading(false)
    }
  }, [enabledRegulators, timeRange])

  // Initial fetch on mount
  useEffect(() => {
    fetchRadar(false)
  }, [fetchRadar])

  // Filter items based on active regulators, seen filter, category tab, and search query
  const filteredItems = useMemo(() => {
    if (!data?.items) return []
    return data.items.filter((item) => {
      // Must belong to an enabled regulator
      if (!enabledRegulators.includes(item.regulator)) return false

      const isSeen = seenHashes.includes(item.id)
      if (hideSeen && isSeen) return false

      if (selectedRegulator !== 'ALL') {
        if (selectedRegulator === 'LABOUR') {
          if (item.regulator !== 'LABOUR' && item.regulator !== 'EPFO' && item.regulator !== 'ESIC') return false
        } else if (item.regulator !== selectedRegulator) {
          return false
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.regulatorLabel.toLowerCase().includes(q) ||
          (item.snippet && item.snippet.toLowerCase().includes(q))
        )
      }

      return true
    })
  }, [data, seenHashes, hideSeen, selectedRegulator, searchQuery, enabledRegulators])

  const unreadCount = useMemo(() => {
    if (!data?.items) return 0
    return data.items.filter((i) => enabledRegulators.includes(i.regulator) && !seenHashes.includes(i.id)).length
  }, [data, seenHashes, enabledRegulators])

  // Count by regulator for badges
  const regulatorCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0, FEMA: 0, LABOUR: 0, MCA: 0, SEBI: 0, RBI: 0, CCI: 0, IBBI: 0, NCLT: 0, NCLAT: 0, TAX: 0 }
    if (!data?.items) return counts

    data.items.forEach((item) => {
      if (!enabledRegulators.includes(item.regulator)) return
      const isUnread = !seenHashes.includes(item.id)
      if (isUnread) {
        counts.ALL++
        if (item.regulator === 'FEMA') counts.FEMA++
        else if (item.regulator === 'LABOUR' || item.regulator === 'EPFO' || item.regulator === 'ESIC') counts.LABOUR++
        else if (item.regulator === 'MCA') counts.MCA++
        else if (item.regulator === 'SEBI') counts.SEBI++
        else if (item.regulator === 'RBI') counts.RBI++
        else if (item.regulator === 'CCI') counts.CCI++
        else if (item.regulator === 'IBBI') counts.IBBI++
        else if (item.regulator === 'NCLT') counts.NCLT++
        else if (item.regulator === 'NCLAT') counts.NCLAT++
        else if (item.regulator === 'TAX') counts.TAX++
      }
    })
    return counts
  }, [data, seenHashes, enabledRegulators])

  // 1-Click Create Article Action (Intelligently structured for Case Laws vs Circulars)
  const handleCreateArticle = (item: RegulatorUpdate) => {
    markAsSeen(item.id)

    const isJudicial = item.regulator === 'NCLT' || item.regulator === 'NCLAT'

    const prefill = {
      title: item.title,
      category: item.category || (isJudicial ? 'NCLT' : 'MCA'),
      sourceName: item.regulatorLabel,
      sourceUrl: item.sourceUrl,
      pdfUrl: item.pdfUrl,
      publishedAt: item.date,
      effectiveDate: item.date,
      regulationRef: item.circularNo || (isJudicial ? 'Judicial Ruling' : item.regulatorLabel),
      summary: isJudicial
        ? `The ${item.regulatorLabel} has delivered a notable order regarding ${item.title}. This explainer provides a simplified breakdown of the dispute, key legal provisions under the Companies Act / IBC, the tribunal's decision, and practical takeaways for businesses and practitioners.`
        : `The ${item.regulatorLabel} has issued a recent notification regarding: ${item.title}.`,
      keyChanges: isJudicial
        ? [
            `Judicial Order delivered on ${item.date}.`,
            `Order Type: ${item.circularNo || 'Tribunal Judgment'}.`,
            `Significant practical takeaways for corporate boards, creditors, and insolvency professionals.`
          ]
        : [
            `${item.regulatorLabel} notification issued on ${item.date}.`,
            `Subject matter: ${item.title}.`,
            `Applicable to corporate and compliance entities.`
          ]
    }

    try {
      sessionStorage.setItem('corplaw_radar_prefill', JSON.stringify(prefill))
    } catch (e) {
      console.warn('Failed to save prefill to sessionStorage:', e)
    }

    router.push('/admin/articles/new?from=radar')
  }

  return (
    <div className="space-y-6 pb-16 content-fade-in max-w-7xl mx-auto">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-heading font-extrabold text-slate-900">
                Regulator Radar
              </h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Regulatory Monitor
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                {lastScanTime ? `Last scanned: ${lastScanTime}` : 'Scanning active portals...'}
              </span>
              <span>·</span>
              <span className="font-semibold text-slate-700">
                {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
              </span>
            </p>
          </div>
        </div>

        {/* TOP BUTTONS & TIME RANGE CONTROLS */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Window Switcher */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-xs">
            {TIME_RANGES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTimeRangeChange(t.value)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === t.value
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors border ${
              showConfig
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
            }`}
            title="Configure which regulators to scan or mute"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Regulators ({enabledRegulators.length}/{ALL_REGULATORS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => fetchRadar(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Scanning Sites...' : 'Scan Now (Fresh)'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsSeen}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mark All Seen</span>
            </button>
          )}

          {seenHashes.length > 0 && (
            <button
              type="button"
              onClick={clearSeenHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 transition-colors"
              title="Reset dismissed circular history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seen</span>
            </button>
          )}
        </div>
      </div>

      {/* REGULATOR ON / OFF CONFIGURATION DRAWER */}
      {showConfig && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                Active Regulators & Portal Toggles
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any regulator to toggle it ON/OFF. Inactive regulators will be skipped to save scan time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAllRegulators(true)}
                className="text-xs font-semibold text-amber-700 hover:underline px-2 py-1"
              >
                Enable All
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setAllRegulators(false)}
                className="text-xs font-semibold text-slate-500 hover:underline px-2 py-1"
              >
                Core Regulators Only
              </button>
            </div>
          </div>

          {/* Grid of Regulators to Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_REGULATORS.map((reg) => {
              const isActive = enabledRegulators.includes(reg.key)
              return (
                <button
                  key={reg.key}
                  type="button"
                  onClick={() => toggleRegulator(reg.key)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 select-none ${
                    isActive
                      ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isActive ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>{reg.label}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-amber-200/80 text-amber-900' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isActive ? 'Active' : 'Off'}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{reg.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Found ({timeRange <= 48 ? '48h' : timeRange <= 72 ? '72h' : '7 Days'})</p>
            <p className="text-xl font-heading font-extrabold text-slate-900">{data?.totalFound ?? 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Unread & Ready</p>
            <p className="text-xl font-heading font-extrabold text-emerald-600">{unreadCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Regulators</p>
            <p className="text-xl font-heading font-extrabold text-slate-900">
              {enabledRegulators.length} of {ALL_REGULATORS.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Reviewed / Seen</p>
            <p className="text-xl font-heading font-extrabold text-slate-700">{seenHashes.length}</p>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Regulator Tabs (Only shows tabs for ACTIVE regulators) */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedRegulator('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 flex items-center gap-1.5 ${
                selectedRegulator === 'ALL'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50'
              }`}
            >
              <span>All Regulators</span>
              {regulatorCounts.ALL > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    selectedRegulator === 'ALL' ? 'bg-white text-amber-600' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {regulatorCounts.ALL}
                </span>
              )}
            </button>

            {ALL_REGULATORS.filter((r) => enabledRegulators.includes(r.key)).map((tab) => {
              const unread = regulatorCounts[tab.key] || 0
              const isSelected = selectedRegulator === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedRegulator(tab.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  {unread > 0 && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white text-amber-600' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {unread}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Sub-bar: Status pills & visibility toggle */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto text-[11px] text-slate-500">
            <span className="font-semibold text-slate-400">Portal Status:</span>
            {data?.sources?.map((src) => (
              <span
                key={src.label}
                className={`px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${
                  src.count > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : src.status === 'error'
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>{src.label}</span>
                {src.count > 0 && <span className="font-bold">({src.count})</span>}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setHideSeen(!hideSeen)}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold shrink-0 cursor-pointer"
          >
            {hideSeen ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            <span>{hideSeen ? 'Hiding Seen Circulars' : 'Showing All Circulars'}</span>
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && !loading && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Unable to connect to one or more government portals</h4>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
            <button
              type="button"
              onClick={() => fetchRadar(true)}
              className="mt-2 text-xs font-bold text-red-700 underline hover:text-red-900"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <h3 className="font-heading font-bold text-base text-slate-900">
              Scanning Regulatory Portals...
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              Checking active portals ({enabledRegulators.join(', ')}) for notifications published in the last {timeRange <= 48 ? '48 hours' : timeRange <= 72 ? '72 hours' : '7 days'}.
            </p>
          </div>
        </div>
      )}

      {/* EMPTY / ALL CAUGHT UP STATE */}
      {!loading && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-heading text-lg font-bold text-slate-900">
              All caught up! No unread updates.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {hideSeen && seenHashes.length > 0
                ? `You have reviewed or dismissed all circulars published in this time range.`
                : `No new circulars or notifications were published across your active regulators in the last ${timeRange <= 48 ? '48 hours' : timeRange <= 72 ? '72 hours' : '7 days'}.`}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            {hideSeen && seenHashes.length > 0 && (
              <button
                type="button"
                onClick={() => setHideSeen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Show Seen Items ({seenHashes.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => handleTimeRangeChange(168)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Scan Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => fetchRadar(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}

      {/* LIST OF DETAILED CIRCULAR CARDS */}
      {!loading && filteredItems.length > 0 && (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isSeen = seenHashes.includes(item.id)
            return (
              <div
                key={item.id}
                className={`p-6 rounded-2xl border transition-all duration-200 ${
                  isSeen
                    ? 'bg-white/70 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200/90 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left Column: Details */}
                  <div className="space-y-2.5 min-w-0 flex-1">
                    {/* Badges & Meta */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100/80 text-amber-900 border border-amber-200">
                        {item.regulatorLabel}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.rawDateStr || item.date}
                      </span>
                      {!isSeen ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          New Circular
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Reviewed
                        </span>
                      )}
                    </div>

                    {/* Circular Title */}
                    <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    {/* Snippet / Context */}
                    {item.snippet && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
                        {item.snippet}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleCreateArticle(item)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20 transition-all duration-200"
                    >
                      <PenSquare className="w-4 h-4" />
                      <span>Create Article</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.pdfUrl || item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                        title="Open official document / PDF in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{item.pdfUrl ? 'Download PDF' : 'Official Source'}</span>
                      </a>

                      {!isSeen && (
                        <button
                          type="button"
                          onClick={() => markAsSeen(item.id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Dismiss / Mark as seen"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
