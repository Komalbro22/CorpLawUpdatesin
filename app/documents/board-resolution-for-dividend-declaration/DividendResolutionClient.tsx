'use client'

import { useMemo, useState } from 'react'
import {
  Download,
  FileText,
  LoaderCircle,
  Copy,
  Check,
  Printer,
  Sparkles,
  RotateCcw,
  Building2,
  Calendar,
  Coins,
  Eye,
  Landmark,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import {
  type DividendResolutionData,
  buildDividendResolutionText,
  SAMPLE_DIVIDEND_RESOLUTION_DATA,
} from '@/lib/doc-generator/dividend-resolution-text'

type FormState = {
  resolutionType: 'final' | 'interim'
  companyName: string
  cin: string
  registeredOffice: string
  meetingDate: string
  meetingTime: string
  meetingPlace: string
  financialYear: string
  dividendPerShare: string
  faceValue: string
  eligibleShares: string
  recordDate: string
  paymentDeadline: string
  chairperson: string
  bankName: string
}

const initial: FormState = {
  resolutionType: 'final',
  companyName: '',
  cin: '',
  registeredOffice: '',
  meetingDate: '',
  meetingTime: '',
  meetingPlace: '',
  financialYear: '',
  dividendPerShare: '',
  faceValue: '',
  eligibleShares: '',
  recordDate: '',
  paymentDeadline: '',
  chairperson: '',
  bankName: '',
}

export default function DividendResolutionClient() {
  const [form, setForm] = useState<FormState>(initial)
  const [busy, setBusy] = useState<'docx' | 'pdf' | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor')

  // Financial calculations
  const dividendCalc = useMemo(() => {
    const amount = Number(form.dividendPerShare)
    const faceValue = Number(form.faceValue)
    const shares = Number(form.eligibleShares)

    const totalPayout = amount > 0 && shares > 0 ? amount * shares : 0
    const formattedTotal = totalPayout > 0
      ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(totalPayout)
      : ''

    const dividendPercentage = amount > 0 && faceValue > 0
      ? ((amount / faceValue) * 100).toFixed(1)
      : ''

    return {
      totalPayout,
      formattedTotal,
      dividendPercentage,
    }
  }, [form.dividendPerShare, form.faceValue, form.eligibleShares])

  // Full draft text for preview, copy & print
  const draftLines = useMemo(() => {
    return buildDividendResolutionText(form)
  }, [form])

  const fullResolutionText = useMemo(() => {
    return draftLines.join('\n')
  }, [draftLines])

  const handleLoadSample = () => {
    setForm({
      resolutionType: SAMPLE_DIVIDEND_RESOLUTION_DATA.resolutionType,
      companyName: SAMPLE_DIVIDEND_RESOLUTION_DATA.companyName || '',
      cin: SAMPLE_DIVIDEND_RESOLUTION_DATA.cin || '',
      registeredOffice: SAMPLE_DIVIDEND_RESOLUTION_DATA.registeredOffice || '',
      meetingDate: SAMPLE_DIVIDEND_RESOLUTION_DATA.meetingDate || '',
      meetingTime: SAMPLE_DIVIDEND_RESOLUTION_DATA.meetingTime || '',
      meetingPlace: SAMPLE_DIVIDEND_RESOLUTION_DATA.meetingPlace || '',
      financialYear: SAMPLE_DIVIDEND_RESOLUTION_DATA.financialYear || '',
      dividendPerShare: SAMPLE_DIVIDEND_RESOLUTION_DATA.dividendPerShare || '',
      faceValue: SAMPLE_DIVIDEND_RESOLUTION_DATA.faceValue || '',
      eligibleShares: SAMPLE_DIVIDEND_RESOLUTION_DATA.eligibleShares || '',
      recordDate: SAMPLE_DIVIDEND_RESOLUTION_DATA.recordDate || '',
      paymentDeadline: SAMPLE_DIVIDEND_RESOLUTION_DATA.paymentDeadline || '',
      chairperson: SAMPLE_DIVIDEND_RESOLUTION_DATA.chairperson || '',
      bankName: SAMPLE_DIVIDEND_RESOLUTION_DATA.bankName || '',
    })
    setError('')
  }

  const handleReset = () => {
    setForm(initial)
    setError('')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullResolutionText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Could not copy to clipboard. Please copy manually from the preview.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  async function download(format: 'docx' | 'pdf') {
    setError('')
    const requiredKeys: Array<{ key: keyof FormState; label: string }> = [
      { key: 'companyName', label: 'Company name' },
      { key: 'meetingDate', label: 'Board meeting date' },
      { key: 'financialYear', label: 'Financial year' },
      { key: 'dividendPerShare', label: 'Dividend per share' },
      { key: 'faceValue', label: 'Face value per share' },
      { key: 'eligibleShares', label: 'Estimated eligible shares' },
      { key: 'chairperson', label: 'Chairperson / authorised signatory' },
    ]

    const missing = requiredKeys.find(field => !form[field.key].trim())
    if (missing) {
      setError(`Please enter ${missing.label.toLowerCase()}.`)
      setActiveMobileTab('editor')
      document.getElementById(missing.key)?.focus()
      return
    }

    const amount = Number(form.dividendPerShare)
    const faceValue = Number(form.faceValue)
    const shares = Number(form.eligibleShares)
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(faceValue) || faceValue <= 0 || !Number.isSafeInteger(shares) || shares <= 0) {
      setError('Enter positive amounts and a whole number of eligible shares.')
      setActiveMobileTab('editor')
      return
    }

    setBusy(format)
    try {
      const response = await fetch('/api/documents/dividend-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, data: form }),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Document generation failed. Please try again.')
      }
      const blob = await response.blob()
      const href = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = href
      link.download = `Dividend_${form.resolutionType}_Board_Resolution.${format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(href)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Document generation failed. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  // Visual helper for draft text placeholder
  const renderDraftSpan = (text: string, placeholder: string) => {
    if (text && text.trim()) {
      return <span className="font-semibold text-slate-900 dark:text-white underline decoration-amber-500/40 underline-offset-2">{text}</span>
    }
    return <span className="rounded bg-amber-50 px-1 py-0.5 text-xs font-mono font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">[{placeholder}]</span>
  }

  return (
    <section id="generator" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7" aria-labelledby="generator-heading">
      {/* Header bar with actions */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
            <Sparkles className="size-3.5" aria-hidden="true" /> Interactive Legal Drafter
          </div>
          <h2 id="generator-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Create & Preview Dividend Board Resolution
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Select resolution type, configure meeting and dividend details, and watch the statutory specimen draft update in real time. Download an editable Word document or print-ready PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50/80 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
            title="Load standard corporate sample particulars"
          >
            <Sparkles className="size-3.5" aria-hidden="true" /> Load Sample
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Clear all fields"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" /> Reset
          </button>
          <a
            href="/api/documents/dividend-resolution?type=blank-docx"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileText className="size-3.5" aria-hidden="true" /> Blank Word
          </a>
          <a
            href="/api/documents/dividend-resolution?type=blank-pdf"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileText className="size-3.5" aria-hidden="true" /> Blank PDF
          </a>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="mt-5 flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/60 lg:hidden">
        <button
          type="button"
          onClick={() => setActiveMobileTab('editor')}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
            activeMobileTab === 'editor'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          1. Edit Particulars
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'preview'
              ? 'bg-navy text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Eye className="size-3.5" />
          <span>2. Live Draft Preview</span>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Main 2-Column Workstation on Desktop */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Input Form Controls (5 cols on lg) */}
        <div className={`space-y-6 lg:col-span-5 ${activeMobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Resolution Type Selection */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Step 1: Classification</span>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Statutory Resolution Nature</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className={`flex cursor-pointer gap-2.5 rounded-lg border p-3 transition-all ${
                form.resolutionType === 'final'
                  ? 'border-amber-600 bg-amber-50/80 shadow-sm dark:border-amber-500 dark:bg-amber-950/40'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/50'
              }`}>
                <input
                  type="radio"
                  name="resolutionType"
                  value="final"
                  checked={form.resolutionType === 'final'}
                  onChange={() => setForm(current => ({ ...current, resolutionType: 'final' }))}
                  className="mt-0.5 accent-amber-700"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">Final Dividend</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-slate-500 dark:text-slate-400">Board recommends; members declare at AGM.</span>
                </div>
              </label>

              <label className={`flex cursor-pointer gap-2.5 rounded-lg border p-3 transition-all ${
                form.resolutionType === 'interim'
                  ? 'border-amber-600 bg-amber-50/80 shadow-sm dark:border-amber-500 dark:bg-amber-950/40'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/50'
              }`}>
                <input
                  type="radio"
                  name="resolutionType"
                  value="interim"
                  checked={form.resolutionType === 'interim'}
                  onChange={() => setForm(current => ({ ...current, resolutionType: 'interim' }))}
                  className="mt-0.5 accent-amber-700"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-900 dark:text-white">Interim Dividend</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-slate-500 dark:text-slate-400">Board declares under Section 123(3).</span>
                </div>
              </label>
            </div>
          </div>

          {/* Company Particulars */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Building2 className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Step 2: Company Details</span>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Company Name <span className="text-red-600">*</span>
              </span>
              <input
                id="companyName"
                value={form.companyName}
                onChange={e => setForm(c => ({ ...c, companyName: e.target.value }))}
                placeholder="e.g. ACME TECHNOLOGIES LIMITED"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">CIN (Optional)</span>
                <input
                  id="cin"
                  value={form.cin}
                  onChange={e => setForm(c => ({ ...c, cin: e.target.value }))}
                  placeholder="U72200MH2018PLC312456"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Chairperson Name <span className="text-red-600">*</span>
                </span>
                <input
                  id="chairperson"
                  value={form.chairperson}
                  onChange={e => setForm(c => ({ ...c, chairperson: e.target.value }))}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Registered Office Address</span>
              <input
                id="registeredOffice"
                value={form.registeredOffice}
                onChange={e => setForm(c => ({ ...c, registeredOffice: e.target.value }))}
                placeholder="Full address as per MCA master data"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </div>

          {/* Meeting Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Calendar className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Step 3: Board Meeting Particulars</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Meeting Date <span className="text-red-600">*</span>
                </span>
                <input
                  id="meetingDate"
                  value={form.meetingDate}
                  onChange={e => setForm(c => ({ ...c, meetingDate: e.target.value }))}
                  placeholder="e.g. 30 September 2026"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Meeting Time</span>
                <input
                  id="meetingTime"
                  value={form.meetingTime}
                  onChange={e => setForm(c => ({ ...c, meetingTime: e.target.value }))}
                  placeholder="e.g. 11:00 A.M."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Meeting Venue / Video Conference</span>
              <input
                id="meetingPlace"
                value={form.meetingPlace}
                onChange={e => setForm(c => ({ ...c, meetingPlace: e.target.value }))}
                placeholder="e.g. Registered Office / Video Conferencing"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </div>

          {/* Dividend Terms & Financial Year */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Coins className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Step 4: Dividend Terms &amp; Share Capital</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Financial Year <span className="text-red-600">*</span>
                </span>
                <input
                  id="financialYear"
                  value={form.financialYear}
                  onChange={e => setForm(c => ({ ...c, financialYear: e.target.value }))}
                  placeholder="e.g. 2025–26"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Face Value Per Share (Rs.) <span className="text-red-600">*</span>
                </span>
                <input
                  id="faceValue"
                  value={form.faceValue}
                  onChange={e => setForm(c => ({ ...c, faceValue: e.target.value }))}
                  placeholder="e.g. 10"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Dividend Per Share (Rs.) <span className="text-red-600">*</span>
                </span>
                <input
                  id="dividendPerShare"
                  value={form.dividendPerShare}
                  onChange={e => setForm(c => ({ ...c, dividendPerShare: e.target.value }))}
                  placeholder="e.g. 2.50"
                  inputMode="decimal"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Estimated Eligible Shares <span className="text-red-600">*</span>
                </span>
                <input
                  id="eligibleShares"
                  value={form.eligibleShares}
                  onChange={e => setForm(c => ({ ...c, eligibleShares: e.target.value }))}
                  placeholder="e.g. 1000000"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            </div>

            {/* Real-time Calculation Badge */}
            <div className="rounded-lg bg-amber-50/70 p-3 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Aggregate Outgo:</span>
                <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  {dividendCalc.formattedTotal ? `Rs. ${dividendCalc.formattedTotal}` : '—'}
                </span>
              </div>
              {dividendCalc.dividendPercentage && (
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Dividend Yield on Face Value:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{dividendCalc.dividendPercentage}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Compliance & Banking */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Landmark className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Step 5: Banking &amp; Timelines</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Record Date / Cut-off Date</span>
                <input
                  id="recordDate"
                  value={form.recordDate}
                  onChange={e => setForm(c => ({ ...c, recordDate: e.target.value }))}
                  placeholder="e.g. 15 October 2026"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Proposed Payment Date / By</span>
                <input
                  id="paymentDeadline"
                  value={form.paymentDeadline}
                  onChange={e => setForm(c => ({ ...c, paymentDeadline: e.target.value }))}
                  placeholder="e.g. 30 October 2026"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Scheduled Bank for Separate Account {form.resolutionType === 'interim' && <span className="text-amber-600">(Mandatory Sec 123(4))</span>}
              </span>
              <input
                id="bankName"
                value={form.bankName}
                onChange={e => setForm(c => ({ ...c, bankName: e.target.value }))}
                placeholder="e.g. HDFC Bank Limited / ICICI Bank"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Live Resolution Draft Preview (7 cols on lg) */}
        <div className={`lg:col-span-7 ${activeMobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            {/* Live Specimen Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Live Resolution Draft Preview
                </span>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  {form.resolutionType === 'interim' ? 'Interim Dividend (Sec 123(3))' : 'Final Dividend (Sec 123)'}
                </span>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  title="Copy full text to clipboard"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  title="Print draft"
                >
                  <Printer className="size-3.5" />
                  <span className="sr-only sm:not-sr-only">Print</span>
                </button>
              </div>
            </div>

            {/* Simulated Paper Draft Document */}
            <div className="max-h-[680px] overflow-y-auto p-5 sm:p-8 font-serif text-slate-900 dark:text-slate-100 leading-relaxed text-xs sm:text-[13px] bg-white dark:bg-slate-950 select-text">
              {/* Company Header Block */}
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-6 font-sans">
                <div className="text-base sm:text-lg font-bold tracking-wide uppercase text-slate-900 dark:text-white">
                  {renderDraftSpan(form.companyName, 'NAME OF THE COMPANY')}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  CIN: {renderDraftSpan(form.cin, 'CIN, IF APPLICABLE')}
                </div>
                <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                  Registered Office: {renderDraftSpan(form.registeredOffice, 'REGISTERED OFFICE ADDRESS')}
                </div>
              </div>

              {/* Certified Banner */}
              <div className="text-center my-4 font-sans font-bold uppercase tracking-wider text-xs border-y border-slate-100 dark:border-slate-800/80 py-2.5 text-slate-800 dark:text-slate-200">
                CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF{' '}
                {form.companyName ? form.companyName.toUpperCase() : '[THE COMPANY]'} HELD ON{' '}
                {renderDraftSpan(form.meetingDate, 'DATE')} AT {renderDraftSpan(form.meetingTime, 'TIME')} AT{' '}
                {renderDraftSpan(form.meetingPlace || form.registeredOffice, 'VENUE / VIDEO CONFERENCING DETAILS')}
              </div>

              {/* Chairperson Line */}
              <div className="my-3 font-sans text-xs text-slate-700 dark:text-slate-300">
                <strong>CHAIRPERSON: </strong>
                {renderDraftSpan(form.chairperson, 'NAME OF CHAIRPERSON')}, took the Chair.
              </div>

              {/* Operative Resolution Text */}
              <div className="space-y-3.5 text-justify my-5">
                {form.resolutionType === 'final' ? (
                  <>
                    <p>
                      <strong>“RESOLVED THAT </strong> pursuant to the applicable provisions of the Companies Act, 2013, including section 123, the rules made thereunder and the Articles of Association of the Company, and subject to approval of the members at the ensuing Annual General Meeting, a final dividend of Rs.{' '}
                      {renderDraftSpan(form.dividendPerShare, 'AMOUNT')} per fully paid-up equity share of face value Rs.{' '}
                      {renderDraftSpan(form.faceValue, 'FACE VALUE')} each, aggregating approximately to{' '}
                      {dividendCalc.formattedTotal ? (
                        <span className="font-semibold text-slate-900 dark:text-white">Rs. {dividendCalc.formattedTotal}</span>
                      ) : (
                        renderDraftSpan('', 'AGGREGATE AMOUNT')
                      )}
                      , be and is hereby recommended for the financial year {renderDraftSpan(form.financialYear, 'FINANCIAL YEAR')}, to the members whose names appear in the Register of Members / beneficial owners’ records as on{' '}
                      {renderDraftSpan(form.recordDate, 'RECORD DATE')}.
                    </p>

                    <p>
                      <strong>RESOLVED FURTHER THAT </strong> the Board recommends that the members, at the ensuing Annual General Meeting, declare the aforesaid dividend, and that the dividend, if declared, be paid within the period prescribed by law, subject to deduction of tax at source and other applicable statutory requirements.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>“RESOLVED THAT </strong> pursuant to section 123(3) and other applicable provisions of the Companies Act, 2013, the rules made thereunder and the Articles of Association of the Company, and after considering the financial position and available profits of the Company, an interim dividend of Rs.{' '}
                      {renderDraftSpan(form.dividendPerShare, 'AMOUNT')} per fully paid-up equity share of face value Rs.{' '}
                      {renderDraftSpan(form.faceValue, 'FACE VALUE')} each, aggregating approximately to{' '}
                      {dividendCalc.formattedTotal ? (
                        <span className="font-semibold text-slate-900 dark:text-white">Rs. {dividendCalc.formattedTotal}</span>
                      ) : (
                        renderDraftSpan('', 'AGGREGATE AMOUNT')
                      )}
                      , be and is hereby declared for the financial year {renderDraftSpan(form.financialYear, 'FINANCIAL YEAR')}, payable to the members whose names appear in the Register of Members / beneficial owners’ records as on{' '}
                      {renderDraftSpan(form.recordDate, 'RECORD DATE')}.
                    </p>

                    <p>
                      <strong>RESOLVED FURTHER THAT </strong> the total amount of dividend declared be deposited in a separate bank account with{' '}
                      {renderDraftSpan(form.bankName, 'SCHEDULED BANK')} within the period of 5 days prescribed under section 123(4) of the Act, and that the dividend be paid within the period of 30 days prescribed under section 127, after applicable tax deductions and verification of shareholder payment details.
                    </p>
                  </>
                )}

                <p>
                  <strong>RESOLVED FURTHER THAT </strong> the Company Secretary / Chief Financial Officer be and is hereby authorised to finalise the eligible shareholder list, verify the number of eligible shares (currently estimated at {renderDraftSpan(form.eligibleShares, 'NUMBER OF ELIGIBLE SHARES')}), calculate the final aggregate amount, arrange the required bank transfer and statutory deductions, issue payment instructions, maintain supporting records, and do all acts necessary to give effect to this resolution, subject to the Act, applicable rules, the Articles of Association and any applicable SEBI requirements.
                </p>

                <p>
                  <strong>RESOLVED FURTHER THAT </strong> the authorised signatories be and are hereby authorised to operate the relevant bank account and sign such instructions and documents as may be required for payment of the dividend by {renderDraftSpan(form.paymentDeadline, 'PAYMENT DEADLINE')}, or within the applicable statutory period if earlier or otherwise required by law.
                </p>

                <p>
                  <strong>RESOLVED FURTHER THAT </strong> the Company Secretary be and is hereby authorised to make the necessary entries in the minutes and statutory records and, where applicable, make required intimations to the stock exchange(s) and other authorities.”
                </p>
              </div>

              {/* Signatory Block */}
              <div className="mt-8 pt-4 font-sans text-xs border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold">For and on behalf of the Board</p>
                <p className="mt-1 font-semibold">{form.companyName ? `For ${form.companyName}` : 'For [NAME OF THE COMPANY]'}</p>
                <div className="mt-6">
                  <div className="w-48 border-b border-slate-400 dark:border-slate-600"></div>
                  <p className="mt-1.5 font-bold">{renderDraftSpan(form.chairperson, 'CHAIRPERSON NAME')}</p>
                  <p className="text-slate-600 dark:text-slate-400">Chairperson / Director</p>
                  <p className="text-slate-500 dark:text-slate-500 font-mono text-[11px]">DIN: [DIN, IF APPLICABLE]</p>
                </div>
                <div className="mt-4 flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>Date: {renderDraftSpan(form.meetingDate, 'DATE')}</span>
                  <span>Place: {renderDraftSpan(form.meetingPlace ? form.meetingPlace.split('/')[0].trim() : '', 'PLACE')}</span>
                </div>
              </div>

              {/* Drafting Note in Preview */}
              <div className="mt-6 rounded-lg bg-slate-50 dark:bg-slate-900 p-3 font-sans text-[11px] leading-5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                <strong>Statutory Note:</strong> {form.resolutionType === 'final'
                  ? 'A final dividend is recommended by the Board and declared by members at the AGM under Section 123. The members cannot declare a dividend exceeding the rate recommended by the Board.'
                  : 'An interim dividend is declared directly by the Board under Section 123(3). Deposit the full amount in a separate scheduled bank account within 5 days under Section 123(4) and pay within 30 days under Section 127.'}
              </div>
            </div>

            {/* Bottom Download Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Section 123 Compliant Specimen</span>
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2">
                <button
                  type="button"
                  onClick={() => download('docx')}
                  disabled={!!busy}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60 shadow-sm"
                >
                  {busy === 'docx' ? <LoaderCircle className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                  Download Word (.docx)
                </button>
                <button
                  type="button"
                  onClick={() => download('pdf')}
                  disabled={!!busy}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 shadow-sm"
                >
                  {busy === 'pdf' ? <LoaderCircle className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
