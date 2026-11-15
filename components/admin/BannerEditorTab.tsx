'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Upload,
  Eye,
  Code,
  Layout,
  Calendar,
  Share2,
  ExternalLink,
  Layers,
  FileImage,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react'
import { REGULATOR_THEMES } from '@/lib/banner/themes'
import { BANNER_ICON_NAMES } from '@/lib/banner/types'

interface BannerAsset {
  id: string
  article_id: string
  source: 'template' | 'html' | 'svg' | 'upload' | 'legacy'
  spec: any
  code: string | null
  alt: string
  hash: string
  formats: {
    og_png: string
    hero_webp: string
  }
  status: 'candidate' | 'active' | 'archived'
  created_by: string
  created_at: string
}

interface BannerEditorTabProps {
  articleId: string
  articleSlug: string
  articleTitle: string
  articleSummary?: string
  articleCategory?: string
  initialActiveBannerId?: string | null
  showToast: (msg: string, type?: any) => void
}

export default function BannerEditorTab({
  articleId,
  articleSlug,
  articleTitle,
  articleSummary = '',
  articleCategory = 'MCA',
  initialActiveBannerId = null,
  showToast,
}: BannerEditorTabProps) {
  const [mode, setMode] = useState<'template' | 'html' | 'svg' | 'upload'>('template')
  const [socialTab, setSocialTab] = useState<'discover' | 'whatsapp' | 'linkedin' | 'x'>('discover')

  // Template Form State
  const [regulator, setRegulator] = useState<string>(
    articleCategory && articleCategory.toUpperCase() in REGULATOR_THEMES
      ? articleCategory.toUpperCase()
      : 'MCA'
  )
  const [headline, setHeadline] = useState(articleTitle.slice(0, 68) || 'Statutory Compliance Update')
  const [sub, setSub] = useState(articleSummary.slice(0, 90) || '')
  const [action, setAction] = useState('Check filing obligations')
  const [impact, setImpact] = useState<'High' | 'Medium' | 'Lower'>('Medium')
  const [dateLabel, setDateLabel] = useState(
    new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  )
  const [alt, setAlt] = useState('')

  // Visual Type state
  const [visualType, setVisualType] = useState<
    'calendar_shift' | 'stat_cards' | 'before_after' | 'date_card' | 'stamp' | 'icon_panel'
  >('calendar_shift')

  // Calendar shift state
  const [calFromMonth, setCalFromMonth] = useState('JUN')
  const [calFromDay, setCalFromDay] = useState('30')
  const [calToMonth, setCalToMonth] = useState('JUL')
  const [calToDay, setCalToDay] = useState('10')
  const [calStrike, setCalStrike] = useState(true)
  const [calToLabel, setCalToLabel] = useState('NEW DEADLINE')

  // Stat cards state
  const [statCards, setStatCards] = useState<Array<{ label: string; value: string; chip?: string }>>([
    { label: 'REVISED PENALTY', value: '₹50,000', chip: '+200%' },
    { label: 'COMPLIANCE WINDOW', value: '30 DAYS' },
  ])

  // Before after state
  const [baOldVal, setBaOldVal] = useState('₹500 Cr')
  const [baNewVal, setBaNewVal] = useState('₹1,000 Cr')
  const [baDirection, setBaDirection] = useState<'up' | 'down' | 'none'>('up')
  const [baOldLabel, setBaOldLabel] = useState('Previous Cutoff')
  const [baNewLabel, setBaNewLabel] = useState('Revised Threshold')

  // Date card state
  const [dcMonth, setDcMonth] = useState('DEC')
  const [dcDay, setDcDay] = useState('15')
  const [dcYear, setDcYear] = useState('2026')
  const [dcCaption, setDcCaption] = useState('Comments close 5:00 PM IST')

  // Stamp state
  const [stampType, setStampType] = useState<'FAKE' | 'CONFIRMED' | 'CLARIFIED' | 'WITHDRAWN'>('CLARIFIED')
  const [stampClaim, setStampClaim] = useState('Rumors of revision in FDI thresholds refuting ministry circular.')

  // Icon panel state
  const [iconName, setIconName] = useState('building-bank')
  const [iconLabel, setIconLabel] = useState('Ministry Circular')

  // HTML / SVG Code state
  const [code, setCode] = useState('')

  // Preview & Render Status
  const [previewPng, setPreviewPng] = useState<string | null>(null)
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([])
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [currentHash, setCurrentHash] = useState<string>('')

  // Candidate Banners & Active Banner
  const [banners, setBanners] = useState<BannerAsset[]>([])
  const [activeBanner, setActiveBanner] = useState<BannerAsset | null>(null)
  const [savingCandidate, setSavingCandidate] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  // Upload file state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadFocal, setUploadFocal] = useState<'center' | 'top' | 'bottom'>('center')
  const uploadInputRef = useRef<HTMLInputElement>(null)

  // Load article banner history
  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${articleId}/banner`)
      if (!res.ok) return
      const data = await res.json()
      setBanners([...(data.candidates || []), ...(data.history || [])])
      setActiveBanner(data.active_banner || null)
    } catch {
      // Non-blocking
    }
  }, [articleId])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  // Build spec object
  const buildCurrentSpec = useCallback(() => {
    let visual: any = {}

    if (visualType === 'calendar_shift') {
      visual = {
        type: 'calendar_shift',
        from: { month: calFromMonth.toUpperCase(), day: calFromDay },
        to: { month: calToMonth.toUpperCase(), day: calToDay },
        strike: calStrike,
        toLabel: calToLabel,
      }
    } else if (visualType === 'stat_cards') {
      visual = {
        type: 'stat_cards',
        cards: statCards,
      }
    } else if (visualType === 'before_after') {
      visual = {
        type: 'before_after',
        oldValue: baOldVal,
        newValue: baNewVal,
        direction: baDirection,
        oldLabel: baOldLabel,
        newLabel: baNewLabel,
      }
    } else if (visualType === 'date_card') {
      visual = {
        type: 'date_card',
        month: dcMonth.toUpperCase(),
        day: dcDay,
        year: dcYear,
        caption: dcCaption,
      }
    } else if (visualType === 'stamp') {
      visual = {
        type: 'stamp',
        stamp: stampType,
        claim: stampClaim,
      }
    } else {
      visual = {
        type: 'icon_panel',
        icon: iconName,
        label: iconLabel,
      }
    }

    const computedAlt =
      (
        alt.trim() ||
        `${regulator} circular on ${headline}. ${sub || ''}`
      )
        .slice(0, 135)
        .trim()

    return {
      v: 1,
      regulator,
      headline,
      sub: sub ? sub.slice(0, 100) : undefined,
      action: action || undefined,
      dateLabel,
      impact,
      alt: computedAlt.length < 20 ? `${computedAlt} - Official Compliance Update`.slice(0, 135) : computedAlt,
      visual,
    }
  }, [
    alt,
    regulator,
    headline,
    sub,
    action,
    dateLabel,
    impact,
    visualType,
    calFromMonth,
    calFromDay,
    calToMonth,
    calToDay,
    calStrike,
    calToLabel,
    statCards,
    baOldVal,
    baNewVal,
    baDirection,
    baOldLabel,
    baNewLabel,
    dcMonth,
    dcDay,
    dcYear,
    dcCaption,
    stampType,
    stampClaim,
    iconName,
    iconLabel,
  ])

  // Debounced preview trigger
  useEffect(() => {
    if (mode === 'upload') return

    const timer = setTimeout(async () => {
      setPreviewLoading(true)
      setPreviewError(null)

      try {
        let payload: any = {}
        if (mode === 'template') {
          payload = {
            mode: 'template',
            spec: buildCurrentSpec(),
          }
        } else if (mode === 'html') {
          payload = {
            mode: 'html',
            code,
            alt: alt.length >= 20 ? alt : `${articleTitle} graphic banner`,
            regulator,
            headline,
          }
        } else if (mode === 'svg') {
          payload = {
            mode: 'svg',
            code,
            alt: alt.length >= 20 ? alt : `${articleTitle} vector graphic`,
          }
        }

        const res = await fetch('/api/banner/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()
        if (!res.ok) {
          if (data.errors) {
            setPreviewError(data.errors.map((e: any) => `${e.path}: ${e.message}`).join('; '))
          } else {
            setPreviewError(data.render_error || data.error?.message || 'Preview generation failed')
          }
        } else {
          setPreviewPng(data.png_base64)
          setPreviewWarnings(data.warnings || [])
          setCurrentHash(data.hash || '')
        }
      } catch (err: any) {
        setPreviewError(err?.message || 'Network error while rendering preview')
      } finally {
        setPreviewLoading(false)
      }
    }, 700)

    return () => clearTimeout(timer)
  }, [mode, buildCurrentSpec, code, alt, articleTitle, regulator, headline])

  // Auto-suggest Alt text
  const handleAutoSuggestAlt = () => {
    let suggestion = ''
    if (visualType === 'calendar_shift') {
      suggestion = `Calendar showing ${regulator} deadline extended from ${calFromDay} ${calFromMonth} to ${calToDay} ${calToMonth}`
    } else if (visualType === 'stat_cards') {
      const summaryCards = statCards.map((c) => `${c.label}: ${c.value}`).join(', ')
      suggestion = `Stat card for ${regulator} update: ${summaryCards}`
    } else if (visualType === 'before_after') {
      suggestion = `Before and after comparison for ${regulator}: ${baOldLabel} ${baOldVal} revised to ${baNewLabel} ${baNewVal}`
    } else if (visualType === 'stamp') {
      suggestion = `Official notice stamped ${stampType}: ${stampClaim.slice(0, 100)}`
    } else {
      suggestion = `${regulator} official compliance banner for ${headline}`
    }
    setAlt(suggestion.slice(0, 135))
    showToast('Auto-suggested Alt text created!', 'info')
  }

  // Save banner as candidate or activate immediately
  const handleSaveBanner = async (activateImmediately: boolean = false) => {
    setSavingCandidate(true)
    try {
      let payload: any = {}
      if (mode === 'template') {
        payload = {
          mode: 'template',
          spec: buildCurrentSpec(),
          activate: activateImmediately,
        }
      } else if (mode === 'html') {
        payload = {
          mode: 'html',
          code,
          alt: alt.length >= 20 ? alt : `${articleTitle} graphic banner`,
          regulator,
          headline,
          activate: activateImmediately,
        }
      } else if (mode === 'svg') {
        payload = {
          mode: 'svg',
          code,
          alt: alt.length >= 20 ? alt : `${articleTitle} vector graphic`,
          activate: activateImmediately,
        }
      }

      const res = await fetch(`/api/articles/${articleId}/banner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        showToast(data.render_error || data.error?.message || 'Failed to save banner', 'error')
      } else {
        showToast(
          activateImmediately
            ? 'Banner saved and ACTIVATED as the live header!'
            : 'Banner saved to candidate queue!',
          'success'
        )
        await fetchBanners()
      }
    } catch (err: any) {
      showToast(err?.message || 'Save request failed', 'error')
    } finally {
      setSavingCandidate(false)
    }
  }

  // Activate candidate
  const handleActivate = async (bannerId: string) => {
    setActivatingId(bannerId)
    try {
      const res = await fetch(`/api/articles/${articleId}/banner/${bannerId}/activate`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Banner activated for this article!', 'success')
        await fetchBanners()
      } else {
        showToast(data.error?.message || 'Activation failed', 'error')
      }
    } catch {
      showToast('Network error during activation', 'error')
    } finally {
      setActivatingId(null)
    }
  }

  // Revert to legacy
  const handleRevertToLegacy = async () => {
    if (!confirm('Revert this article to its legacy image?')) return
    try {
      const res = await fetch(`/api/articles/${articleId}/banner/deactivate`, {
        method: 'POST',
      })
      if (res.ok) {
        showToast('Reverted to legacy featured image.', 'info')
        await fetchBanners()
      }
    } catch {
      showToast('Revert failed', 'error')
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(url)
    showToast('Copied banner CDN URL to clipboard!', 'info')
    setTimeout(() => setCopiedLink(null), 3000)
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Status Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Status:</span>
            {activeBanner ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Code-Rendered Banner Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                Legacy Image Fallback (Active)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active banners automatically power OpenGraph, Twitter Cards, Article JSON-LD, Google Images, and hero headers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {activeBanner && (
            <button
              type="button"
              onClick={handleRevertToLegacy}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="size-3.5 text-slate-500" />
              Revert to Legacy Image
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSaveBanner(false)}
            disabled={savingCandidate || previewLoading || !!previewError}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors disabled:opacity-50"
          >
            {savingCandidate ? 'Saving...' : 'Save as Candidate'}
          </button>
          <button
            type="button"
            onClick={() => handleSaveBanner(true)}
            disabled={savingCandidate || previewLoading || !!previewError}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="size-3.5 text-slate-950" />
            Save &amp; Activate Live
          </button>
        </div>
      </div>

      {/* Active Live Banner Card */}
      {activeBanner && (
        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-slate-50/50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-36 sm:w-48 aspect-[1200/630] rounded-xl overflow-hidden shadow-md border border-emerald-200 shrink-0 bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeBanner.formats.og_png}
                  alt={activeBanner.alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Live Active Banner
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Source: <strong className="text-slate-800 uppercase">{activeBanner.source}</strong> ({activeBanner.created_by})
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 leading-tight">
                  {activeBanner.spec?.headline || activeBanner.alt}
                </h3>
                {activeBanner.spec?.sub && (
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                    {activeBanner.spec.sub}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Currently serving live on article hero, OpenGraph cards, Twitter cards, and Google News sitemaps.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(activeBanner.formats.og_png)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="size-3.5" />
                Copy CDN Link
              </button>
              <button
                type="button"
                onClick={handleRevertToLegacy}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Revert to Legacy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prominent Candidate Banner Ready For Review */}
      {(() => {
        const candidate = banners.find((b) => b.status === 'candidate')
        if (!candidate || activeBanner) return null

        return (
          <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-emerald-50/50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-36 sm:w-48 aspect-[1200/630] rounded-xl overflow-hidden shadow-md border border-amber-200 shrink-0 bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={candidate.formats.og_png}
                    alt={candidate.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-200 text-amber-900 border border-amber-300">
                      Candidate Ready for Review
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Generated by <strong className="text-slate-800">{candidate.created_by}</strong>
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-slate-900 leading-tight">
                    {candidate.spec?.headline || candidate.alt}
                  </h3>
                  {candidate.spec?.sub && (
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {candidate.spec.sub}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click Activate to promote this banner to live hero, OpenGraph social card, and Google News sitemap.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  disabled={activatingId === candidate.id}
                  onClick={() => handleActivate(candidate.id)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  {activatingId === candidate.id ? 'Activating...' : 'Activate This Banner Now'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Main 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Source Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('template')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'template' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layout className="size-3.5" />
              Template Builder
            </button>
            <button
              type="button"
              onClick={() => setMode('html')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'html' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="size-3.5" />
              Satori HTML
            </button>
            <button
              type="button"
              onClick={() => setMode('svg')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'svg' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileImage className="size-3.5" />
              Vector SVG
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="size-3.5" />
              Direct Upload
            </button>
          </div>

          {/* TEMPLATE MODE */}
          {mode === 'template' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              {/* Regulator & Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Regulator Authority &amp; Palette Theme
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(REGULATOR_THEMES).map((reg) => {
                    const theme = REGULATOR_THEMES[reg as keyof typeof REGULATOR_THEMES]
                    const isSelected = regulator === reg
                    return (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setRegulator(reg)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50/50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-full h-3 rounded-md mb-1.5 shadow-xs"
                          style={{ backgroundColor: theme.bg }}
                        />
                        <span className="block text-xs font-bold text-slate-900">{reg}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Headline with Live Character Counter */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Banner Headline <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      headline.length > 52 ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  >
                    {headline.length} / 70 chars
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={70}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Name Reservation Resubmission Deadline Extended"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-medium"
                />
              </div>

              {/* Sub-Headline & Action Chip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sub-Headline</label>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        sub.length > 90 ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    >
                      {sub.length} / 100
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={100}
                    value={sub}
                    onChange={(e) => setSub(e.target.value)}
                    placeholder="Brief 1-line clarification..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Action Chip</label>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        action.length > 32 ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    >
                      {action.length} / 40
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="e.g. File Form SPICe+ Part B"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Impact Level & Date Label */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Impact Dot
                  </label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden font-medium"
                  >
                    <option value="High">🔴 High Regulatory Impact</option>
                    <option value="Medium">🟡 Medium Impact</option>
                    <option value="Lower">⚪ Lower Impact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date Label
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    placeholder="e.g. Nov 2026"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Visual Type Selector */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Right Column Visual Module
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'calendar_shift', label: '📅 Deadline Shift' },
                    { id: 'stat_cards', label: '📊 Big Stat Cards' },
                    { id: 'before_after', label: '⚖️ Before / After' },
                    { id: 'date_card', label: '🗓️ Comments By' },
                    { id: 'stamp', label: '🛡️ Debunk Stamp' },
                    { id: 'icon_panel', label: '🏛️ Emblem & Icon' },
                  ].map((vis) => (
                    <button
                      key={vis.id}
                      type="button"
                      onClick={() => setVisualType(vis.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        visualType === vis.id
                          ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-400'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {vis.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Visual Fields */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                {visualType === 'calendar_shift' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Deadline Shift Configuration
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-slate-500">FROM (Old Date):</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={calFromMonth}
                            onChange={(e) => setCalFromMonth(e.target.value.toUpperCase())}
                            placeholder="JUN"
                            className="w-1/2 px-2 py-1.5 text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg text-center"
                          />
                          <input
                            type="text"
                            maxLength={2}
                            value={calFromDay}
                            onChange={(e) => setCalFromDay(e.target.value)}
                            placeholder="30"
                            className="w-1/2 px-2 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-emerald-700">TO (New Deadline):</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={calToMonth}
                            onChange={(e) => setCalToMonth(e.target.value.toUpperCase())}
                            placeholder="JUL"
                            className="w-1/2 px-2 py-1.5 text-xs font-mono font-bold uppercase border border-emerald-300 rounded-lg text-center bg-emerald-50/40"
                          />
                          <input
                            type="text"
                            maxLength={2}
                            value={calToDay}
                            onChange={(e) => setCalToDay(e.target.value)}
                            placeholder="10"
                            className="w-1/2 px-2 py-1.5 text-xs font-mono font-bold border border-emerald-300 rounded-lg text-center bg-emerald-50/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={calStrike}
                          onChange={(e) => setCalStrike(e.target.checked)}
                          className="rounded-sm border-slate-300 text-amber-500"
                        />
                        Cross out old date with red strike
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        value={calToLabel}
                        onChange={(e) => setCalToLabel(e.target.value)}
                        placeholder="NEW DEADLINE"
                        className="px-2 py-1 text-xs border border-slate-300 rounded-lg uppercase"
                      />
                    </div>
                  </div>
                )}

                {visualType === 'stat_cards' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Numeric / Statutory Stat Cards (1 to 3)
                      </span>
                      {statCards.length < 3 && (
                        <button
                          type="button"
                          onClick={() => setStatCards([...statCards, { label: 'NEW CRITERIA', value: '₹1 Cr' }])}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-lg"
                        >
                          <Plus className="size-3" /> Add Card
                        </button>
                      )}
                    </div>
                    {statCards.map((c, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          maxLength={34}
                          value={c.label}
                          onChange={(e) => {
                            const copy = [...statCards]
                            copy[idx].label = e.target.value
                            setStatCards(copy)
                          }}
                          placeholder="Label (e.g. MINIMUM NET WORTH)"
                          className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-md uppercase"
                        />
                        <div className="relative w-32">
                          <input
                            type="text"
                            maxLength={9}
                            value={c.value}
                            onChange={(e) => {
                              const copy = [...statCards]
                              copy[idx].value = e.target.value
                              setStatCards(copy)
                            }}
                            placeholder="₹50,000"
                            className="w-full px-2 py-1 text-xs font-bold border border-slate-200 rounded-md"
                          />
                        </div>
                        <input
                          type="text"
                          maxLength={12}
                          value={c.chip || ''}
                          onChange={(e) => {
                            const copy = [...statCards]
                            copy[idx].chip = e.target.value
                            setStatCards(copy)
                          }}
                          placeholder="Chip (e.g. +200%)"
                          className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-md"
                        />
                        {statCards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setStatCards(statCards.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {visualType === 'before_after' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Before / After Comparison
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={baOldLabel}
                          onChange={(e) => setBaOldLabel(e.target.value)}
                          placeholder="Previous Cutoff"
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={baOldVal}
                          onChange={(e) => setBaOldVal(e.target.value)}
                          placeholder="₹500 Cr"
                          className="w-full px-2 py-1 text-xs font-bold border border-slate-300 rounded-md text-slate-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={baNewLabel}
                          onChange={(e) => setBaNewLabel(e.target.value)}
                          placeholder="Revised Threshold"
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={baNewVal}
                          onChange={(e) => setBaNewVal(e.target.value)}
                          placeholder="₹1,000 Cr"
                          className="w-full px-2 py-1 text-xs font-bold border border-emerald-400 rounded-md text-emerald-700 bg-emerald-50/30"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Direction:</span>
                      <div className="flex gap-2">
                        {(['up', 'down', 'none'] as const).map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            onClick={() => setBaDirection(dir)}
                            className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${
                              baDirection === dir
                                ? 'bg-slate-900 text-white'
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}
                          >
                            {dir === 'up' ? '▲ Increased' : dir === 'down' ? '▼ Decreased' : 'Revised'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {visualType === 'date_card' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Single Consultation / Deadline Card
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={dcMonth}
                        onChange={(e) => setDcMonth(e.target.value.toUpperCase())}
                        placeholder="DEC"
                        className="px-2 py-1.5 text-xs font-bold uppercase border border-slate-300 rounded-lg text-center"
                      />
                      <input
                        type="text"
                        maxLength={2}
                        value={dcDay}
                        onChange={(e) => setDcDay(e.target.value)}
                        placeholder="15"
                        className="px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                      />
                      <input
                        type="text"
                        maxLength={4}
                        value={dcYear}
                        onChange={(e) => setDcYear(e.target.value)}
                        placeholder="2026"
                        className="px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg text-center"
                      />
                    </div>
                    <input
                      type="text"
                      maxLength={80}
                      value={dcCaption}
                      onChange={(e) => setDcCaption(e.target.value)}
                      placeholder="e.g. Comments close 5:00 PM IST"
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                )}

                {visualType === 'stamp' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Myth-Busting / Confirmation Stamp
                    </span>
                    <div className="flex gap-2">
                      {(['FAKE', 'CONFIRMED', 'CLARIFIED', 'WITHDRAWN'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStampType(s)}
                          className={`px-3 py-1 text-xs font-extrabold uppercase rounded-lg border transition-all ${
                            stampType === s
                              ? 'bg-rose-100 border-rose-500 text-rose-800 ring-1 ring-rose-400'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <textarea
                      maxLength={140}
                      rows={2}
                      value={stampClaim}
                      onChange={(e) => setStampClaim(e.target.value)}
                      placeholder="Rumor or claim being clarified..."
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg resize-none"
                    />
                  </div>
                )}

                {visualType === 'icon_panel' && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Centered Icon &amp; Emblem Module
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {BANNER_ICON_NAMES.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setIconName(name)}
                          className={`p-1.5 text-[11px] font-mono rounded-lg border text-center transition-all ${
                            iconName === name
                              ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      maxLength={40}
                      value={iconLabel}
                      onChange={(e) => setIconLabel(e.target.value)}
                      placeholder="Label (optional)"
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Alt Text with Auto-Suggest */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Accessibility &amp; SEO Alt Text <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        alt.length > 130 ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    >
                      {alt.length} / 140
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoSuggestAlt}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md"
                  >
                    <Sparkles className="size-3" /> Auto-Suggest
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={140}
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Detailed visual description for screen readers and Google Image indexer..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Must describe the specific dates, percentages, or numbers shown on the banner (max 140 chars).
                </span>
              </div>
            </div>
          )}

          {/* HTML / SVG CODE MODE */}
          {(mode === 'html' || mode === 'svg') && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {mode === 'html' ? 'Satori HTML Canvas Editor' : 'Clean Vector SVG Editor'}
                </span>
                <span className="text-xs text-slate-500 font-mono">1200 x 630 px</span>
              </div>

              {/* Token Insertion Chips */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-semibold text-slate-500 self-center mr-1">Insert Token:</span>
                {[
                  '{{headline}}',
                  '{{theme.bg}}',
                  '{{theme.accent}}',
                  '{{theme.circle}}',
                  '{{icon:building-bank}}',
                  '{{icon:scale}}',
                ].map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => setCode((prev) => prev + token)}
                    className="px-2 py-0.5 font-mono text-[11px] bg-white border border-slate-200 rounded-md hover:bg-amber-50 hover:border-amber-400"
                  >
                    {token}
                  </button>
                ))}
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={
                  mode === 'html'
                    ? '<div style="display: flex; width: 1200px; height: 630px; background-color: {{theme.bg}}">\n  ...\n</div>'
                    : '<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">\n  ...\n</svg>'
                }
                rows={12}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-hidden bg-slate-900 text-slate-100"
              />

              <div className="text-xs text-slate-500 space-y-1">
                <p><strong>Strict Satori Rules:</strong> Flexbox only (`display: flex`). No floats or grid. All elements must specify display flex. Remote images are blocked for security.</p>
              </div>
            </div>
          )}

          {/* UPLOAD MODE */}
          {mode === 'upload' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-amber-500 transition-colors">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  ref={uploadInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setUploadFile(f)
                  }}
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-amber-50 rounded-full text-amber-600 mb-3">
                    <Upload className="size-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {uploadFile ? uploadFile.name : 'Choose a banner image to upload'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG, or WebP up to 5 MB</span>
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-all"
                  >
                    Select Image File
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cover-Crop Focal Point
                </label>
                <div className="flex gap-2">
                  {(['center', 'top', 'bottom'] as const).map((fp) => (
                    <button
                      key={fp}
                      type="button"
                      onClick={() => setUploadFocal(fp)}
                      className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg border transition-all ${
                        uploadFocal === fp
                          ? 'bg-amber-100 border-amber-500 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {fp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Debounced Preview & Social Proofs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="size-4 text-amber-600" />
                Live Satori Render (1200 x 630)
              </span>
              {previewLoading && (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-semibold animate-pulse">
                  <RefreshCw className="size-3 animate-spin" /> Rendering...
                </span>
              )}
            </div>

            {/* Render Canvas */}
            <div className="relative aspect-[1200/630] w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner border border-slate-200 flex items-center justify-center">
              {previewPng ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewPng}
                  alt="Live banner preview"
                  className="w-full h-full object-cover"
                />
              ) : previewLoading ? (
                <div className="text-center text-slate-400 text-xs">
                  <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-amber-400" />
                  Generating pixel-perfect banner...
                </div>
              ) : activeBanner ? (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeBanner.formats.og_png}
                    alt={activeBanner.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                    <CheckCircle2 className="size-3" /> Live Active Banner
                  </div>
                </div>
              ) : banners.find((b) => b.status === 'candidate') ? (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banners.find((b) => b.status === 'candidate')!.formats.og_png}
                    alt={banners.find((b) => b.status === 'candidate')!.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-amber-950/80 text-amber-300 border border-amber-500/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                    Candidate Banner
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs p-4">
                  Adjust spec fields to generate live banner
                </div>
              )}
            </div>

            {/* Error or Warnings Box */}
            {previewError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Render Error:</strong>
                  <p className="mt-0.5">{previewError}</p>
                </div>
              </div>
            )}

            {previewWarnings.length > 0 && !previewError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <strong className="font-bold block">Design Guidelines Warning:</strong>
                {previewWarnings.map((w, idx) => (
                  <p key={idx} className="text-[11px]">• {w}</p>
                ))}
              </div>
            )}

            {/* 300px Thumbnail Test */}
            {(() => {
              const cardImg =
                previewPng ||
                activeBanner?.formats.og_png ||
                banners.find((b) => b.status === 'candidate')?.formats.og_png

              return (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    300px Legibility Check (Mobile Feed / Google Discover Card)
                  </span>
                  <div className="w-[300px] aspect-[1200/630] rounded-lg overflow-hidden border border-slate-300 shadow-xs bg-slate-900 flex items-center justify-center">
                    {cardImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cardImg} alt="300px check" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">No banner image yet</span>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Social Media Card Mocks */}
          {(() => {
            const cardImg =
              previewPng ||
              activeBanner?.formats.og_png ||
              banners.find((b) => b.status === 'candidate')?.formats.og_png

            return (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="size-3.5 text-slate-500" /> Social Card Mocks
                  </span>
                  <div className="flex gap-1 text-[11px]">
                    {(['discover', 'whatsapp', 'linkedin', 'x'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSocialTab(tab)}
                        className={`px-2 py-0.5 rounded-md font-bold uppercase transition-all ${
                          socialTab === tab
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mock Render Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  {socialTab === 'discover' && (
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden max-w-sm mx-auto">
                      {cardImg && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cardImg} alt="Google Discover mock" className="w-full aspect-[16/9] object-cover" />
                      )}
                      <div className="p-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CorpLawUpdates.in</span>
                        <h4 className="font-heading font-bold text-sm text-slate-900 leading-tight mt-1">{articleTitle}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{articleSummary}</p>
                      </div>
                    </div>
                  )}

                  {socialTab === 'whatsapp' && (
                    <div className="bg-[#E7F3E8] p-2.5 rounded-xl border border-[#D0E7D2] max-w-sm mx-auto">
                      <div className="bg-white rounded-lg overflow-hidden border border-slate-200">
                        {cardImg && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cardImg} alt="WhatsApp mock" className="w-full aspect-[1200/630] object-cover" />
                        )}
                        <div className="p-2">
                          <span className="text-[10px] text-slate-400">corplawupdates.in</span>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{articleTitle}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2">{articleSummary}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {socialTab === 'linkedin' && (
                    <div className="bg-white rounded-lg border border-slate-300 overflow-hidden max-w-sm mx-auto">
                      {cardImg && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cardImg} alt="LinkedIn mock" className="w-full aspect-[1200/630] object-cover" />
                      )}
                      <div className="p-2.5 bg-slate-50 border-t border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase">corplawupdates.in</span>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-0.5">{articleTitle}</h4>
                      </div>
                    </div>
                  )}

                  {socialTab === 'x' && (
                    <div className="bg-black text-white rounded-2xl border border-slate-800 overflow-hidden max-w-sm mx-auto">
                      {cardImg && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cardImg} alt="X Card mock" className="w-full aspect-[1200/630] object-cover" />
                      )}
                      <div className="p-3">
                        <span className="text-[10px] text-slate-400">corplawupdates.in</span>
                        <h4 className="font-bold text-xs line-clamp-1 mt-0.5">{articleTitle}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{articleSummary}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Candidate History & Reversion Gallery */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="size-4 text-slate-500" />
            Candidate &amp; Version History for this Article
          </span>
          <span className="text-xs text-slate-400">{banners.length} versions stored</span>
        </div>

        {banners.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No candidate banners created yet. Build and save your first banner above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((b) => (
              <div
                key={b.id}
                className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                  b.status === 'active'
                    ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="aspect-[1200/630] w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-100 mb-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.formats.og_png}
                      alt={b.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        b.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'candidate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {b.spec?.headline || b.alt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(b.formats.og_png)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {copiedLink === b.formats.og_png ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    Copy Link
                  </button>

                  {b.status !== 'active' ? (
                    <button
                      type="button"
                      disabled={activatingId === b.id}
                      onClick={() => handleActivate(b.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {activatingId === b.id ? 'Activating...' : 'Activate'}
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Currently Live
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
