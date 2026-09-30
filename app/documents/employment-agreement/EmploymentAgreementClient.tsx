'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Download,
  FileText,
  Building2,
  Copy,
  Printer,
  Sparkles,
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  MapPin,
  Plus,
  Trash2,
  User,
  Users,
  ExternalLink,
  Lock,
  ArrowRight,
  Handshake,
  Landmark,
  Calculator,
  Percent,
  Briefcase,
  HelpCircle,
  Laptop,
  Home,
  Clock,
  Send,
  RefreshCw,
  Eye,
  Check,
  Edit3,
  RotateCcw,
  LoaderCircle,
} from 'lucide-react'
import {
  EmploymentAgreementFormData,
  EmploymentType,
  WorkMode,
  SalaryBreakdown,
  EMPLOYMENT_PRESETS,
  STATE_STAMP_SCHEDULE,
  DEFAULT_SAMPLE_EMPLOYMENT_DATA,
  formatInr,
  numberToWordsInr,
  checkWageFiftyPercentRule,
  generateEmploymentAgreementMarkdown,
} from '@/lib/doc-generator/employment-agreement-generator'
import { isDownloadPromptSuppressed } from '@/lib/download-prompt-storage'

const LazyDownloadSubscribePrompt = dynamic(
  () => import('@/components/DownloadSubscribePrompt'),
  { ssr: false }
)

export default function EmploymentAgreementClient() {
  const [formData, setFormData] = useState<EmploymentAgreementFormData>(
    DEFAULT_SAMPLE_EMPLOYMENT_DATA
  )
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor')
  const [previewMarkdown, setPreviewMarkdown] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [isDownloading, setIsDownloading] = useState<'docx' | 'pdf' | null>(null)
  const [downloadError, setDownloadError] = useState<string>('')
  const [showDownloadPrompt, setShowDownloadPrompt] = useState<boolean>(false)
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<'docx' | 'pdf' | null>(null)
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(true)

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState<string>('')
  const [aiLoading, setAiLoading] = useState<boolean>(false)
  const [aiMessages, setAiMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; note?: string; missing?: string[] }[]
  >([
    {
      sender: 'assistant',
      text: 'Hello! I am your AI Employment Agreement Assistant. Tell me about the role in plain English, Hindi, or Hinglish (e.g. "Senior Software Engineer in Bengaluru on ₹12 Lakh CTC with 3 months probation and 30 days notice"). I will capture the details, check statutory compliance under the Labour Codes, and customize your draft.',
    },
  ])

  // Recalculate preview whenever formData changes
  useEffect(() => {
    try {
      const md = generateEmploymentAgreementMarkdown(formData)
      setPreviewMarkdown(md)
    } catch (err) {
      console.error('Failed to generate markdown:', err)
    }
  }, [formData])

  // Handle Preset Switching
  const handleApplyPreset = (presetKey: EmploymentType) => {
    const preset = EMPLOYMENT_PRESETS[presetKey]
    if (!preset) return
    setFormData(prev => ({
      ...prev,
      presetType: presetKey,
      ...preset.defaults,
    }))
  }

  // Load Standard Sample Data
  const handleLoadSample = () => {
    setFormData(DEFAULT_SAMPLE_EMPLOYMENT_DATA)
    setDownloadError('')
  }

  // Reset to empty/minimal defaults
  const handleReset = () => {
    setFormData({
      ...DEFAULT_SAMPLE_EMPLOYMENT_DATA,
      employerName: '',
      employerRegistrationNumber: '',
      employerRegisteredAddress: '',
      employerWorkplaceAddress: '',
      signatoryName: '',
      employeeName: '',
      employeeFatherOrSpouseName: '',
      employeeResidentialAddress: '',
      employeePan: '',
      employeeEmail: '',
      employeePhone: '',
      designation: '',
      department: '',
      annualCtc: 0,
      monthlyGross: 0,
      salaryStructure: {
        basicMonthly: 0,
        hraMonthly: 0,
        specialAllowanceMonthly: 0,
        pfEmployerMonthly: 0,
        statutoryBonusMonthly: 0,
        otherAllowancesMonthly: 0,
        grossMonthly: 0,
        annualCtc: 0,
      },
    })
    setDownloadError('')
  }

  // Update Field Helper
  const updateField = <K extends keyof EmploymentAgreementFormData>(
    key: K,
    val: EmploymentAgreementFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  // Update Salary Breakdown Helper
  const updateSalaryBreakdown = (key: keyof SalaryBreakdown, val: number) => {
    setFormData(prev => {
      const nextBreakdown = { ...prev.salaryStructure, [key]: val }
      const gross =
        (nextBreakdown.basicMonthly || 0) +
        (nextBreakdown.hraMonthly || 0) +
        (nextBreakdown.specialAllowanceMonthly || 0) +
        (nextBreakdown.statutoryBonusMonthly || 0) +
        (nextBreakdown.otherAllowancesMonthly || 0)
      nextBreakdown.grossMonthly = gross

      // Approximate CTC = (Gross + PF) * 12
      const annual = (gross + (nextBreakdown.pfEmployerMonthly || 0)) * 12
      nextBreakdown.annualCtc = annual

      return {
        ...prev,
        salaryStructure: nextBreakdown,
        monthlyGross: gross,
        annualCtc: annual,
      }
    })
  }

  // Recalculate Basic to meet 50% rule automatically
  const handleAutoAdjustBasicFiftyPercent = () => {
    const total = formData.monthlyGross || 100000
    const targetBasic = Math.round(total * 0.5)
    const currentHra = formData.salaryStructure.hraMonthly || Math.round(total * 0.2)
    const remainingSpecial = Math.max(0, total - targetBasic - currentHra)

    setFormData(prev => ({
      ...prev,
      salaryStructure: {
        ...prev.salaryStructure,
        basicMonthly: targetBasic,
        hraMonthly: currentHra,
        specialAllowanceMonthly: remainingSpecial,
        grossMonthly: total,
      },
    }))
  }

  // AI Assistant Submission
  const handleSendAiPrompt = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || aiPrompt
    if (!textToSend.trim() || aiLoading) return

    const userMsg = textToSend.trim()
    setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    if (!overridePrompt) setAiPrompt('')
    setAiLoading(true)

    try {
      const res = await fetch('/api/documents/employment-agreement-ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extract_and_fill',
          prompt: userMsg,
          currentData: formData,
        }),
      })

      const data = await res.json()
      if (data.success && data.data) {
        const aiData = data.data
        if (aiData.updatedData) {
          setFormData(prev => {
            const next = { ...prev, ...aiData.updatedData }
            if (aiData.updatedData.basicMonthly) {
              next.salaryStructure = {
                ...next.salaryStructure,
                basicMonthly: Number(aiData.updatedData.basicMonthly),
              }
            }
            return next
          })
        }

        setAiMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: aiData.assistantReply || 'Draft updated with your requested terms.',
            note: aiData.legalAuditNote,
            missing: aiData.missingFields,
          },
        ])
      } else {
        setAiMessages(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: data.error || 'Could not process that instruction right now. Please edit the fields directly in the form.',
          },
        ])
      }
    } catch {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Network connection error. You can continue configuring the agreement using the form controls.',
        },
      ])
    } finally {
      setAiLoading(false)
    }
  }

  // Copy to Clipboard
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(previewMarkdown)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    } catch {
      setDownloadError('Could not copy to clipboard. Please copy manually from the preview.')
    }
  }

  // Print Document
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Employment Agreement - ${formData.employeeName || 'Draft'}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; margin: 35px; color: #111; }
            h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 18px; }
            h2 { font-size: 13pt; margin-top: 18px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
            h3 { font-size: 11pt; margin-top: 14px; }
            p { margin: 8px 0; text-align: justify; }
            table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 10pt; }
            th, td { border: 1px solid #999; padding: 5px 8px; text-align: left; }
            th { background: #f0f0f0; }
            blockquote { margin: 10px 0; padding: 8px 12px; background: #f9f9f9; border-left: 3px solid #0056b3; font-size: 10pt; }
            hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div id="content">
            ${previewMarkdown
              .replace(/^# (.*$)/gim, '<h1>$1</h1>')
              .replace(/^## (.*$)/gim, '<h2>$1</h2>')
              .replace(/^### (.*$)/gim, '<h3>$1</h3>')
              .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
              .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/gim, '<em>$1</em>')
              .replace(/\n\n/gim, '<p></p>')}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 400)
  }

  // Direct Trigger Download
  const executeDownload = async (format: 'docx' | 'pdf') => {
    setIsDownloading(format)
    setDownloadError('')
    try {
      const res = await fetch('/api/documents/employment-agreement-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: formData,
          format,
        }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.error || `Server responded with ${res.status}: ${res.statusText}`)
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cleanEmp = (formData.employeeName || 'Employee').replace(/[^a-zA-Z0-9]/g, '_')
      const cleanDate = (formData.executionDate || '2026').replace(/[^a-zA-Z0-9]/g, '-')
      a.download = `Employment_Agreement_${cleanEmp}_${cleanDate}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Download error:', err)
      setDownloadError(err?.message || 'Failed to generate document. Please try copying the text or printing directly.')
    } finally {
      setIsDownloading(null)
    }
  }

  // Download with Non-Intrusive Prompt check
  const handleInitiateDownload = (format: 'docx' | 'pdf') => {
    if (isDownloadPromptSuppressed()) {
      executeDownload(format)
      return
    }
    setPendingDownloadFormat(format)
    setShowDownloadPrompt(true)
  }

  const handlePromptComplete = () => {
    setShowDownloadPrompt(false)
    if (pendingDownloadFormat) {
      executeDownload(pendingDownloadFormat)
      setPendingDownloadFormat(null)
    }
  }

  // Calculations
  const wageRule = useMemo(
    () => checkWageFiftyPercentRule(formData.salaryStructure),
    [formData.salaryStructure]
  )
  const stampRule = useMemo(
    () => STATE_STAMP_SCHEDULE[formData.state] || STATE_STAMP_SCHEDULE.karnataka,
    [formData.state]
  )

  // Visual helper for draft text placeholder
  const renderDraftSpan = (text: string | null | undefined, placeholder: string) => {
    if (text && String(text).trim()) {
      return (
        <span className="font-semibold text-slate-900 dark:text-white underline decoration-indigo-500/40 underline-offset-2">
          {String(text)}
        </span>
      )
    }
    return (
      <span className="rounded bg-indigo-50 px-1 py-0.5 text-xs font-mono font-medium text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
        [{placeholder}]
      </span>
    )
  }

  return (
    <section id="generator" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7" aria-labelledby="generator-heading">
      {/* ─── Header Bar with Action Controls ────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300">
            <Sparkles className="size-3.5" aria-hidden="true" /> Interactive Legal Drafter
          </div>
          <h2 id="generator-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Create & Preview Employment Agreement
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Draft an India-compliant employment agreement governed by the Labour Codes and Indian Contract Act, 1872. Watch your agreement update in real time with live 50% wage parity validation and state stamp duty computation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50/80 px-3 py-2 text-xs font-semibold text-indigo-900 hover:bg-indigo-100 dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
            title="Load standard Indian corporate sample particulars"
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
            href="/api/documents/employment-agreement-download?format=docx"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileText className="size-3.5" aria-hidden="true" /> Blank Word
          </a>
          <a
            href="/api/documents/employment-agreement-download?format=pdf"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileText className="size-3.5" aria-hidden="true" /> Blank PDF
          </a>
        </div>
      </div>

      {/* ─── Mobile Tab Switcher ────────────────────────────────────────────── */}
      <div className="mt-5 flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/60 lg:hidden">
        <button
          type="button"
          onClick={() => setActiveMobileTab('editor')}
          className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
            activeMobileTab === 'editor'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
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
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Eye className="size-3.5" />
          <span>2. Live Draft Preview & Download</span>
        </button>
      </div>

      {/* ─── Error Alert ────────────────────────────────────────────────────── */}
      {downloadError && (
        <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-600 shrink-0" />
            <span>{downloadError}</span>
          </div>
          <button onClick={() => setDownloadError('')} className="text-xs text-red-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* ─── Main 2-Column Workstation on Desktop ────────────────────────────── */}
      <div className="mt-6 grid gap-8 lg:grid-cols-12 items-start">
        {/* ─── LEFT COLUMN: Input Controls (5 cols on lg) ───────────────────── */}
        <div className={`space-y-6 lg:col-span-5 ${activeMobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Step 1: Document Type / Preset */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Step 1: Classification & Role Preset
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                6 Presets
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              Select Employment Category
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(Object.keys(EMPLOYMENT_PRESETS) as EmploymentType[]).map(key => {
                const p = EMPLOYMENT_PRESETS[key]
                const isSelected = formData.presetType === key
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => handleApplyPreset(key)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs dark:border-indigo-500 dark:bg-indigo-950/40'
                        : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {p.label.replace(' Employment Agreement', '')}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {p.badgeText}
                      </span>
                    </div>
                    <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Jurisdiction & State Stamp Duty */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Landmark className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span>Step 2: State Jurisdiction & Stamp Duty</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Governing State *
                </label>
                <select
                  value={formData.state}
                  onChange={e => updateField('state', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.keys(STATE_STAMP_SCHEDULE).map(st => (
                    <option key={st} value={st}>
                      {STATE_STAMP_SCHEDULE[st].stateName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Place of Execution *
                </label>
                <input
                  type="text"
                  value={formData.executionPlace}
                  onChange={e => updateField('executionPlace', e.target.value)}
                  placeholder="e.g. Bengaluru, Karnataka"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="rounded-lg bg-indigo-50/60 p-2.5 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300">
              <strong>Non-Judicial Duty:</strong> {formatInr(stampRule.stampDutyAmount)} under {stampRule.articleRef} ({stampRule.stampType}).
            </div>
          </div>

          {/* Step 3: Employer Particulars */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Building2 className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span>Step 3: Employer Particulars</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employer Legal Entity Name *
              </label>
              <input
                type="text"
                value={formData.employerName}
                onChange={e => updateField('employerName', e.target.value)}
                placeholder="e.g. Apex Infotech Solutions Private Limited"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Entity Type
                </label>
                <input
                  type="text"
                  value={formData.employerEntityType}
                  onChange={e => updateField('employerEntityType', e.target.value)}
                  placeholder="e.g. Private Limited Company"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Registration / CIN Number
                </label>
                <input
                  type="text"
                  value={formData.employerRegistrationNumber}
                  onChange={e => updateField('employerRegistrationNumber', e.target.value)}
                  placeholder="e.g. U72200KA2022PTC158942"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Office Address *
              </label>
              <input
                type="text"
                value={formData.employerRegisteredAddress}
                onChange={e => updateField('employerRegisteredAddress', e.target.value)}
                placeholder="Complete registered corporate address"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authorised Signatory Name *
                </label>
                <input
                  type="text"
                  value={formData.signatoryName}
                  onChange={e => updateField('signatoryName', e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Signatory Designation *
                </label>
                <input
                  type="text"
                  value={formData.signatoryDesignation}
                  onChange={e => updateField('signatoryDesignation', e.target.value)}
                  placeholder="e.g. Director & Head of Human Resources"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Employee Particulars */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <User className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span>Step 4: Employee Particulars</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={e => updateField('employeeName', e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Father/Spouse Name
                </label>
                <input
                  type="text"
                  value={formData.employeeFatherOrSpouseName}
                  onChange={e => updateField('employeeFatherOrSpouseName', e.target.value)}
                  placeholder="e.g. Suresh Verma"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Residential Address *
              </label>
              <input
                type="text"
                value={formData.employeeResidentialAddress}
                onChange={e => updateField('employeeResidentialAddress', e.target.value)}
                placeholder="Current residential address"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Employee PAN
                </label>
                <input
                  type="text"
                  value={formData.employeePan}
                  onChange={e => updateField('employeePan', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designation *
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={e => updateField('designation', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => updateField('department', e.target.value)}
                  placeholder="e.g. Platform Engineering"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reporting Manager Title
                </label>
                <input
                  type="text"
                  value={formData.reportingManagerDesignation}
                  onChange={e => updateField('reportingManagerDesignation', e.target.value)}
                  placeholder="e.g. VP of Technology"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Joining Date *
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={e => updateField('joiningDate', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Remuneration & Wage Parity */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Calculator className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span>Step 5: Remuneration & Code on Wages</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                wageRule.isCompliant
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}>
                Basic: {wageRule.basicPercentage}% (Min 50%)
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Cost to Company (CTC) *
                </label>
                <input
                  type="number"
                  value={formData.annualCtc}
                  onChange={e => updateField('annualCtc', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Gross Salary
                </label>
                <input
                  type="number"
                  value={formData.monthlyGross}
                  onChange={e => updateField('monthlyGross', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-mono"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Monthly Salary Breakdown Components (Annexure A)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500">Basic Salary (Monthly) *</label>
                  <input
                    type="number"
                    value={formData.salaryStructure.basicMonthly}
                    onChange={e => updateSalaryBreakdown('basicMonthly', Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">HRA Allowance</label>
                  <input
                    type="number"
                    value={formData.salaryStructure.hraMonthly}
                    onChange={e => updateSalaryBreakdown('hraMonthly', Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Special Allowance</label>
                  <input
                    type="number"
                    value={formData.salaryStructure.specialAllowanceMonthly}
                    onChange={e => updateSalaryBreakdown('specialAllowanceMonthly', Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Employer PF Contribution</label>
                  <input
                    type="number"
                    value={formData.salaryStructure.pfEmployerMonthly}
                    onChange={e => updateSalaryBreakdown('pfEmployerMonthly', Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {!wageRule.isCompliant && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    Basic is under 50% statutory threshold.
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoAdjustBasicFiftyPercent}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Auto-Adjust Basic to 50%
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Step 6: Workplace, Terms & Covenants */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <ShieldCheck className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span>Step 6: Workplace, Terms & Covenants</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'in_office', label: 'Office Base', icon: Building2 },
                  { id: 'hybrid', label: 'Hybrid Roster', icon: Home },
                  { id: 'fully_remote', label: 'Fully Remote', icon: Laptop },
                ].map(item => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => updateField('workMode', item.id as WorkMode)}
                    className={`p-2 rounded-lg border text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      formData.workMode === item.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <item.icon className="size-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Probation Period (Months)
                </label>
                <input
                  type="number"
                  value={formData.probationMonths}
                  onChange={e => updateField('probationMonths', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Period post-Confirmation (Days) *
                </label>
                <input
                  type="number"
                  value={formData.noticePeriodDays}
                  onChange={e => updateField('noticePeriodDays', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Non-Solicitation (Months)
                </label>
                <input
                  type="number"
                  value={formData.nonSolicitMonths}
                  onChange={e => updateField('nonSolicitMonths', Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>
              <div className="flex items-center pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.includeNonCompeteCaution}
                    onChange={e => updateField('includeNonCompeteCaution', e.target.checked)}
                    className="size-4 rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <span>Section 27 Caution Clause</span>
                </label>
              </div>
            </div>
          </div>

          {/* AI Legal Drafter Accordion */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAiAssistant(!showAiAssistant)}>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  AI Legal Drafting Assistant
                </span>
              </div>
              <button type="button" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                {showAiAssistant ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {showAiAssistant && (
              <div className="mt-3 space-y-3">
                <div className="max-h-48 overflow-y-auto space-y-2 text-xs rounded-lg bg-white p-3 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
                      <span className={`inline-block rounded-lg px-2.5 py-1.5 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                      }`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <RefreshCw className="size-3 animate-spin text-indigo-600" />
                      <span>Customizing agreement terms...</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendAiPrompt()}
                    placeholder="e.g. Remote Lead Designer in Pune on 15L CTC, 60 days notice"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                    disabled={aiLoading}
                  />
                  <button
                    type="button"
                    onClick={() => handleSendAiPrompt()}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Live Specimen Paper Draft Preview & Download ────── */}
        <div className={`lg:col-span-7 ${activeMobileTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-6 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            {/* Specimen Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Eye className="size-3.5 text-indigo-600 dark:text-indigo-400" /> Live Specimen Draft
                </span>
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                  {stampRule.stateName} Duty: {formatInr(stampRule.stampDutyAmount)}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                  wageRule.isCompliant
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  50% Wage Parity
                </span>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  title="Copy full text to clipboard"
                >
                  {isCopied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
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
              {/* Document Header */}
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-6 font-sans">
                <div className="text-base sm:text-lg font-bold tracking-wide uppercase text-slate-900 dark:text-white">
                  EMPLOYMENT AGREEMENT
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Execution Date: {renderDraftSpan(formData.executionDate, 'DATE')} | Place: {renderDraftSpan(formData.executionPlace, 'EXECUTION PLACE')}
                </div>
              </div>

              {/* Stamp Duty Notice Box */}
              <div className="my-4 rounded-lg bg-slate-50 dark:bg-slate-900/80 p-3 font-sans text-xs border border-indigo-200 dark:border-indigo-900/50">
                <strong className="text-indigo-900 dark:text-indigo-300">STATUTORY STAMP DUTY NOTICE ({stampRule.stateName}):</strong>{' '}
                <span className="text-slate-700 dark:text-slate-300">
                  This instrument is subject to non-judicial stamp duty of <strong>{formatInr(stampRule.stampDutyAmount)}</strong> payable under{' '}
                  <strong>{stampRule.articleRef}</strong> via {stampRule.stampType}.
                </span>
              </div>

              {/* Preamble & Parties */}
              <div className="space-y-3.5 text-justify my-5">
                <p>
                  This <strong>EMPLOYMENT AGREEMENT</strong> (&quot;<strong>Agreement</strong>&quot;) is entered into on this{' '}
                  {renderDraftSpan(formData.executionDate, 'DATE')}, at {renderDraftSpan(formData.executionPlace, 'LOCATION')}, by and between:
                </p>

                <p>
                  <strong>1. {renderDraftSpan(formData.employerName, 'EMPLOYER LEGAL NAME')}</strong>, a{' '}
                  {renderDraftSpan(formData.employerEntityType, 'ENTITY TYPE')}
                  {formData.employerRegistrationNumber ? (
                    <> (Registration/CIN: {renderDraftSpan(formData.employerRegistrationNumber, 'CIN/REGISTRATION NO.')})</>
                  ) : null}
                  , having its registered office at {renderDraftSpan(formData.employerRegisteredAddress, 'REGISTERED OFFICE ADDRESS')}
                  , represented herein by its authorized representative, <strong>{renderDraftSpan(formData.signatoryName, 'SIGNATORY NAME')}</strong>,{' '}
                  {renderDraftSpan(formData.signatoryDesignation, 'SIGNATORY DESIGNATION')} (hereinafter referred to as the &quot;<strong>Company</strong>&quot; or &quot;<strong>Employer</strong>&quot;) of the <strong>FIRST PART</strong>;
                </p>

                <p className="text-center font-sans font-bold text-xs uppercase tracking-wider text-slate-500 my-2">
                  AND
                </p>

                <p>
                  <strong>2. {renderDraftSpan(formData.employeeName, 'EMPLOYEE FULL NAME')}</strong>
                  {formData.employeeFatherOrSpouseName ? (
                    <>, son/daughter/spouse of {renderDraftSpan(formData.employeeFatherOrSpouseName, 'FATHER / SPOUSE NAME')}</>
                  ) : null}
                  , residing at {renderDraftSpan(formData.employeeResidentialAddress, 'RESIDENTIAL ADDRESS')}
                  , bearing PAN: {renderDraftSpan(formData.employeePan, 'PAN NUMBER')} (hereinafter referred to as the &quot;<strong>Employee</strong>&quot;) of the <strong>SECOND PART</strong>.
                </p>
              </div>

              {/* Recitals */}
              <div className="space-y-2 text-justify my-4">
                <p className="font-sans font-bold text-xs">WHEREAS:</p>
                <p>
                  A. The Company desires to appoint the Employee to the position of <strong>{renderDraftSpan(formData.designation, 'DESIGNATION')}</strong> in its{' '}
                  <strong>{renderDraftSpan(formData.department, 'DEPARTMENT')}</strong> department.
                </p>
                <p>
                  B. The Employee has represented that they possess the requisite competence, professional qualifications, and legal capacity to undertake the duties and covenants set forth herein.
                </p>
              </div>

              {/* Operative Clauses */}
              <div className="space-y-4 text-justify my-5">
                <div>
                  <h3 className="font-sans font-bold text-xs uppercase text-slate-900 dark:text-white">
                    1. APPOINTMENT, COMMENCEMENT & OSH CODE COMPLIANCE
                  </h3>
                  <p className="mt-1">
                    1.1 The Company hereby appoints the Employee as <strong>{renderDraftSpan(formData.designation, 'DESIGNATION')}</strong> starting from the Joining Date of{' '}
                    <strong>{renderDraftSpan(formData.joiningDate, 'JOINING DATE')}</strong>. The Employee shall report directly to the{' '}
                    <strong>{renderDraftSpan(formData.reportingManagerDesignation, 'REPORTING MANAGER')}</strong>. Pursuant to Section 6(1)(f) of the Occupational Safety, Health and Working Conditions Code, 2020, this agreement incorporates all required statutory particulars of employment.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-xs uppercase text-slate-900 dark:text-white">
                    2. PLACE OF WORK & WORK MODE
                  </h3>
                  <p className="mt-1">
                    2.1 The Employee is engaged on a <strong>{(formData.workMode || 'hybrid').replace(/_/g, ' ').toUpperCase()}</strong> basis based out of{' '}
                    <strong>{renderDraftSpan(formData.workLocationCity, 'CITY')}</strong>. In compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act), the Employee shall maintain strict information security, confidentiality, and device integrity at all times.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-xs uppercase text-slate-900 dark:text-white">
                    {formData.isFixedTerm
                      ? '3. FIXED-TERM TENURE (IR CODE, 2020)'
                      : formData.hasProbation
                      ? '3. PROBATION & CONFIRMATION'
                      : '3. REGULAR EMPLOYMENT STATUS'}
                  </h3>
                  <p className="mt-1">
                    {formData.isFixedTerm ? (
                      <>
                        3.1 This contract is executed as a Fixed-Term Employment under Section 2(o) of the Industrial Relations Code, 2020 for a duration of {formData.fixedTermDurationMonths || 12} months. Pursuant to Section 2(zh), expiry of this tenure does not constitute retrenchment. Pro-rata gratuity applies after one year under Section 53 of the Code on Social Security, 2020.
                      </>
                    ) : formData.hasProbation ? (
                      <>
                        3.1 The Employee shall serve an initial probationary period of <strong>{formData.probationMonths} months</strong>. Confirmation requires a formal written letter. During probation, either party may terminate this agreement upon <strong>{formData.probationNoticeDays} calendar days&apos;</strong> written notice.
                      </>
                    ) : (
                      <>
                        3.1 The Employee is appointed directly as a regular confirmed employee governed by standard separation terms.
                      </>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-xs uppercase text-slate-900 dark:text-white">
                    4. REMUNERATION & STATUTORY WAGES (SECTION 2(y))
                  </h3>
                  <p className="mt-1">
                    4.1 The Employee shall receive an annual Cost to Company (CTC) of{' '}
                    <strong>{formData.annualCtc ? formatInr(formData.annualCtc) : renderDraftSpan('', 'ANNUAL CTC')}</strong> ({numberToWordsInr(formData.annualCtc)}). Under Section 2(y) of the Code on Wages, 2019, Basic Salary is established at{' '}
                    <strong>{formatInr(formData.salaryStructure.basicMonthly)} per month</strong> ({wageRule.basicPercentage}% of monthly gross pay), satisfying the statutory 50% basic benchmark. Monthly salary is disbursed on or before the {formData.paymentDayOfMonth}th day of each calendar month.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-xs uppercase text-slate-900 dark:text-white">
                    5. INTELLECTUAL PROPERTY & RESTRICTIVE COVENANTS
                  </h3>
                  <p className="mt-1">
                    5.1 All works, software code, designs, and inventions authored by the Employee belong exclusively to the Company as work-for-hire under Section 17(c) of the Copyright Act, 1957. A <strong>{formData.nonSolicitMonths}-month</strong> non-solicitation covenant applies post-employment.
                    {formData.includeNonCompeteCaution && (
                      <span className="block mt-1 text-slate-600 dark:text-slate-400 italic">
                        Statutory Disclosure: In accordance with Section 27 of the Indian Contract Act, 1872 (Percept D&apos;Mark v. Zaheer Khan), post-employment non-compete restraints are void and unenforceable in India; protection is enforced strictly through non-solicitation, trade secret secrecy, and IP ownership.
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-xs uppercase text-slate-900 dark:text-white">
                    6. SEPARATION & NOTICE PERIOD
                  </h3>
                  <p className="mt-1">
                    6.1 Post-confirmation, either party may terminate this agreement upon <strong>{formData.noticePeriodDays} days&apos;</strong> written notice{formData.noticePayInLieuPermitted ? ' or payment of basic salary in lieu thereof' : ''}. Termination for cause (fraud, criminal act, moral turpitude) may be effected immediately without severance pay.
                  </p>
                </div>
              </div>

              {/* Signatory Block */}
              <div className="mt-8 pt-4 font-sans text-xs border-t border-slate-200 dark:border-slate-800">
                <p className="font-bold">IN WITNESS WHEREOF, the Parties have executed this Agreement on the Effective Date.</p>
                <div className="mt-6 grid grid-cols-2 gap-8">
                  <div>
                    <p className="font-bold">{formData.employerName ? `For ${formData.employerName}` : 'For [EMPLOYER NAME]'}</p>
                    <div className="mt-8 w-44 border-b border-slate-400 dark:border-slate-600"></div>
                    <p className="mt-1.5 font-bold">{renderDraftSpan(formData.signatoryName, 'AUTHORISED SIGNATORY')}</p>
                    <p className="text-slate-600 dark:text-slate-400">{renderDraftSpan(formData.signatoryDesignation, 'DESIGNATION')}</p>
                  </div>
                  <div>
                    <p className="font-bold">Accepted by Employee</p>
                    <div className="mt-8 w-44 border-b border-slate-400 dark:border-slate-600"></div>
                    <p className="mt-1.5 font-bold">{renderDraftSpan(formData.employeeName, 'EMPLOYEE NAME')}</p>
                    <p className="text-slate-600 dark:text-slate-400">{renderDraftSpan(formData.designation, 'DESIGNATION')}</p>
                  </div>
                </div>
              </div>

              {/* Annexure A: Salary Table */}
              <div className="mt-8 pt-4 font-sans border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  ANNEXURE A: SALARY BREAKDOWN SCHEDULE
                </h4>
                <table className="w-full text-left text-xs border-collapse border border-slate-200 dark:border-slate-800">
                  <thead>
                    <tr className="bg-slate-900 text-white dark:bg-slate-800">
                      <th className="p-2 border border-slate-700">Salary Component</th>
                      <th className="p-2 border border-slate-700">Monthly (INR)</th>
                      <th className="p-2 border border-slate-700">Annual (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">Basic Salary (Sec 2(y))</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.salaryStructure.basicMonthly)}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.salaryStructure.basicMonthly * 12)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">House Rent Allowance (HRA)</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.salaryStructure.hraMonthly)}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.salaryStructure.hraMonthly * 12)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">Special / Role Allowance</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.salaryStructure.specialAllowanceMonthly)}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.salaryStructure.specialAllowanceMonthly * 12)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-200 dark:border-slate-800">Employer PF Contribution</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.salaryStructure.pfEmployerMonthly)}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.salaryStructure.pfEmployerMonthly * 12)}</td>
                    </tr>
                    <tr className="bg-slate-100 dark:bg-slate-900 font-bold">
                      <td className="p-2 border border-slate-200 dark:border-slate-800">Total Gross Pay / Annual CTC</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.salaryStructure.grossMonthly)}</td>
                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{formatInr(formData.annualCtc)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Download Bar (Always Visible like Dividend) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Labour Codes & OSH Code Compliant Specimen</span>
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleInitiateDownload('docx')}
                  disabled={!!isDownloading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60 shadow-xs transition-colors"
                >
                  {isDownloading === 'docx' ? <LoaderCircle className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                  <span>Download Word (.docx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInitiateDownload('pdf')}
                  disabled={!!isDownloading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 shadow-xs transition-colors"
                >
                  {isDownloading === 'pdf' ? <LoaderCircle className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Non-Intrusive Download Modal */}
      {showDownloadPrompt && (
        <LazyDownloadSubscribePrompt
          open={showDownloadPrompt}
          source="template"
          onClose={handlePromptComplete}
        />
      )}
    </section>
  )
}
