'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Radio,
  RefreshCw,
  X,
  ExternalLink,
  PenSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Eye,
  EyeOff,
  Filter,
  Building2,
  FileText
} from 'lucide-react'
import { RadarResponse, RegulatorUpdate, RegulatorKey } from '@/lib/regulator-radar/types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const LOCAL_STORAGE_SEEN_KEY = 'corplaw_radar_seen_hashes'

export default function RegulatorRadarModal({ isOpen, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RadarResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [seenHashes, setSeenHashes] = useState<string[]>([])
  const [selectedRegulator, setSelectedRegulator] = useState<string>('ALL')
  const [hideSeen, setHideSeen] = useState<boolean>(true)
  const [lastScanTime, setLastScanTime] = useState<string | null>(null)

  // Load seen hashes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SEEN_KEY)
      if (stored) {
        setSeenHashes(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Failed to read seen hashes from localStorage:', e)
    }
  }, [])

  // Save seen hashes to localStorage
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
    if (confirm('Reset your seen/dismissed circular history?')) {
      setSeenHashes([])
      try {
        localStorage.removeItem(LOCAL_STORAGE_SEEN_KEY)
      } catch (e) {}
    }
  }, [])

  // Fetch Radar data
  const fetchRadar = useCallback(async (forceFresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/regulator-radar?hours=48${forceFresh ? '&fresh=true' : ''}`)
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }
      const json: RadarResponse = await res.json()
      setData(json)
      setLastScanTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    } catch (err: any) {
      setError(err.message || 'Failed to scan regulators')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch on modal open if no data yet
  useEffect(() => {
    if (isOpen && !data && !loading) {
      fetchRadar(false)
    }
  }, [isOpen, data, loading, fetchRadar])

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!data?.items) return []
    return data.items.filter((item) => {
      const isSeen = seenHashes.includes(item.id)
      if (hideSeen && isSeen) return false

      if (selectedRegulator === 'ALL') return true
      if (selectedRegulator === 'LABOUR') {
        return item.regulator === 'LABOUR' || item.regulator === 'EPFO' || item.regulator === 'ESIC'
      }
      return item.regulator === selectedRegulator
    })
  }, [data, seenHashes, hideSeen, selectedRegulator])

  const unreadCount = useMemo(() => {
    if (!data?.items) return 0
    return data.items.filter((i) => !seenHashes.includes(i.id)).length
  }, [data, seenHashes])

  // 1-Click Create Article Action
  const handleCreateArticle = (item: RegulatorUpdate) => {
    // 1. Mark as seen
    markAsSeen(item.id)

    // 2. Build prefill payload
    const prefill = {
      title: item.title,
      category: item.category,
      sourceName: item.regulatorLabel,
      sourceUrl: item.sourceUrl,
      pdfUrl: item.pdfUrl,
      publishedAt: item.date,
      effectiveDate: item.date,
      regulationRef: item.circularNo || item.regulatorLabel,
      summary: `The ${item.regulatorLabel} has issued a recent notification regarding: ${item.title}.`,
      keyChanges: [
        `${item.regulatorLabel} notification issued on ${item.date}.`,
        `Direct reference: ${item.title}.`,
        `Applicable to corporate and compliance stakeholders.`
      ]
    }

    try {
      sessionStorage.setItem('corplaw_radar_prefill', JSON.stringify(prefill))
    } catch (e) {
      console.warn('Failed to save prefill to sessionStorage:', e)
    }

    // 3. Close modal & navigate to new article page
    onClose()
    router.push('/admin/articles/new?from=radar')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Regulator Radar"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50/50 to-orange-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 animate-pulse">
              <Radio className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  Regulator Radar <span className="text-xs font-normal text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-full font-sans">48-Hour Live Monitor</span>
                </h2>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {lastScanTime ? `Last scanned at ${lastScanTime}` : 'Scanning regulator feeds...'}
                {unreadCount > 0 && (
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[11px]">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchRadar(true)}
              disabled={loading}
              title="Force Fresh Scan (bypasses cache)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">{loading ? 'Scanning...' : 'Scan Now'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SOURCES STATUS PILLS */}
        {data?.sources && (
          <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Regulators:
            </span>
            {data.sources.map((src) => (
              <span
                key={src.label}
                className={`shrink-0 px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 ${
                  src.count > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : src.status === 'error'
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>{src.label}</span>
                {src.count > 0 && <span className="font-bold">({src.count})</span>}
              </span>
            ))}
          </div>
        )}

        {/* CONTROLS & FILTER BAR */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Regulator category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
            {[
              { key: 'ALL', label: 'All Updates' },
              { key: 'FEMA', label: 'FEMA / Foreign Ex' },
              { key: 'LABOUR', label: 'Labour / EPFO / ESIC' },
              { key: 'MCA', label: 'MCA' },
              { key: 'SEBI', label: 'SEBI' },
              { key: 'RBI', label: 'RBI Banking' },
              { key: 'CCI', label: 'CCI' },
              { key: 'IBBI', label: 'IBBI' },
              { key: 'TAX', label: 'Tax' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedRegulator(tab.key)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  selectedRegulator === tab.key
                    ? 'bg-amber-500 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Toggle controls */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <button
              type="button"
              onClick={() => setHideSeen(!hideSeen)}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium select-none"
            >
              {hideSeen ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              <span>{hideSeen ? 'Hiding Seen' : 'Showing All'}</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsSeen}
                className="text-slate-500 hover:text-slate-800 font-medium hover:underline"
              >
                Mark all seen
              </button>
            )}

            {seenHashes.length > 0 && (
              <button
                type="button"
                onClick={clearSeenHistory}
                className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
                title="Clear local memory of dismissed circulars"
              >
                Reset History
              </button>
            )}
          </div>
        </div>

        {/* CONTENT LIST */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50 min-h-[300px]">
          {/* LOADING STATE */}
          {loading && !data && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-800">Scanning official regulatory portals...</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Checking RBI, FEMA, EPFO, ESIC, MCA, SEBI, CCI, and IBBI for circulars published in the last 48 hours.
              </p>
            </div>
          )}

          {/* ERROR STATE */}
          {error && !loading && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Unable to scan some regulators</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchRadar(true)}
                  className="mt-2 text-xs font-semibold text-red-700 underline"
                >
                  Try scanning again
                </button>
              </div>
            </div>
          )}

          {/* EMPTY / ALL CAUGHT UP STATE */}
          {!loading && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-white rounded-xl border border-slate-200/80 p-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900">
                All caught up!
              </h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                {hideSeen && seenHashes.length > 0
                  ? `No new unread circulars found in the last 48 hours. You have reviewed or dismissed all recent updates.`
                  : `No regulatory circulars were published across the checked portals in the last 48 hours (today & yesterday).`}
              </p>
              <div className="flex items-center gap-2 pt-2">
                {hideSeen && seenHashes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setHideSeen(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    View Seen Circulars ({seenHashes.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fetchRadar(true)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm"
                >
                  Force Re-Scan
                </button>
              </div>
            </div>
          )}

          {/* LIST OF CARDS */}
          {!loading &&
            filteredItems.map((item) => {
              const isSeen = seenHashes.includes(item.id)
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    isSeen
                      ? 'bg-white/60 border-slate-200 opacity-60'
                      : 'bg-white border-amber-200/70 shadow-sm hover:shadow hover:border-amber-400'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      {/* Badge row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {item.regulatorLabel}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          📅 {item.rawDateStr || item.date}
                        </span>
                        {!isSeen && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            New
                          </span>
                        )}
                        {isSeen && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            ✓ Seen
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-heading font-bold text-sm text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      {/* Snippet / Source */}
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {item.snippet}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleCreateArticle(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm w-full sm:w-auto justify-center"
                      >
                        <PenSquare className="w-3.5 h-3.5" />
                        <span>Create Article</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                          title="Open official document in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>PDF / Web</span>
                        </a>

                        {!isSeen ? (
                          <button
                            type="button"
                            onClick={() => markAsSeen(item.id)}
                            className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Mark as seen / Dismiss"
                          >
                            Dismiss
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <p className="text-[11px]">
            Filtered strictly to <strong>last 48 hours</strong> · Zero database load · Cached locally.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
