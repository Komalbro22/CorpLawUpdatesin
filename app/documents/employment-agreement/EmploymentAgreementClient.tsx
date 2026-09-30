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
  const [activeTab, setActiveTab] = useState<'profile' | 'compensation' | 'terms' | 'preview'>('profile')
  const [previewMarkdown, setPreviewMarkdown] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [isDownloading, setIsDownloading] = useState<'docx' | 'pdf' | null>(null)
  const [showDownloadPrompt, setShowDownloadPrompt] = useState<boolean>(false)
  const [pendingDownloadFormat, setPendingDownloadFormat] = useState<'docx' | 'pdf' | null>(null)

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
            text: data.error || 'Could not process that instruction right now. Please edit the fields directly below.',
          },
        ])
      }
    } catch (err: any) {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Network connection error. You can continue configuring the agreement using the smart tabs below.',
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
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
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
          <title>Employment Agreement - ${formData.employeeName}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; margin: 40px; color: #111; }
            h1 { font-size: 18pt; text-align: center; text-transform: uppercase; margin-bottom: 24px; }
            h2 { font-size: 14pt; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
            h3 { font-size: 12pt; margin-top: 18px; }
            p { margin: 10px 0; text-align: justify; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 11pt; }
            th, td { border: 1px solid #999; padding: 6px 10px; text-align: left; }
            th { background: #f0f0f0; }
            blockquote { margin: 12px 0; padding: 10px 14px; background: #f9f9f9; border-left: 4px solid #0056b3; font-size: 11pt; }
            hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
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
    try {
      const res = await fetch('/api/documents/employment-agreement-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: formData,
          format,
        }),
      })

      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Employment_Agreement_${formData.employeeName.replace(/[^a-zA-Z0-9]/g, '_')}_${formData.executionDate}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Download error:', err)
      alert('Failed to generate document. Please try copying the text or printing directly.')
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
  const wageRule = useMemo(() => checkWageFiftyPercentRule(formData.salaryStructure), [formData.salaryStructure])
  const stampRule = useMemo(
    () => STATE_STAMP_SCHEDULE[formData.state] || STATE_STAMP_SCHEDULE.karnataka,
    [formData.state]
  )

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden my-8">
      {/* ─── Header & Value Proposition ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white relative">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Labour Codes (2025/2026) & Section 2(y) Wage Rule Compliant
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            AI-Powered Indian Employment Agreement Generator
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Draft, customize, and export a legally vetted Indian employment agreement in Microsoft Word (.docx) or PDF.
            Features automatic 50% wage parity validation under the Code on Wages, state-specific Article 5 stamp duty,
            strict IP work-for-hire covenants, and clear statutory disclosures under Section 27 of the Indian Contract Act.
          </p>
        </div>
      </div>

      {/* ─── AI Conversational Drafter Box ──────────────────────────────────── */}
      <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Employment Agreement Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tell us about the job in plain language (English, Hindi, or Hinglish). The assistant asks missing questions and updates the agreement in real-time.
            </p>
          </div>
        </div>

        {/* AI Chat History */}
        <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80 mb-4 max-h-60 overflow-y-auto space-y-3 text-sm">
          {aiMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                {msg.note && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-amber-700 dark:text-amber-300 font-semibold flex items-start gap-1.5">
                    <Scale className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Statutory Pointer: {msg.note}</span>
                  </div>
                )}
                {msg.missing && msg.missing.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Information still needed: </span>
                    {msg.missing.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              Analyzing Indian labour statutes and drafting clauses...
            </div>
          )}
        </div>

        {/* Input & Prompt Suggestion Chips */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendAiPrompt()}
              placeholder="e.g. Senior Software Engineer in Bengaluru on ₹12 Lakh CTC, 3 months probation, hybrid, 30 days notice"
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              disabled={aiLoading}
            />
            <button
              onClick={() => handleSendAiPrompt()}
              disabled={aiLoading || !aiPrompt.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 self-center font-medium mr-1">Try prompt:</span>
            {[
              'Rahul Verma, Software Dev in Bengaluru, ₹12L CTC, 3m probation',
              'Fixed-term 1 year Project Manager in Mumbai, ₹18L CTC',
              'Remote Content Writer for Delhi firm, ₹6L CTC, WFH policy',
              'Junior Trainee with ₹1.5L training bond (18 months service)',
              'Hinglish: Senior Accountant in Lucknow, 8 lakh salary, 2m notice',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendAiPrompt(chip)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Preset Switcher ────────────────────────────────────────────────── */}
      <div className="p-6 md:p-8 bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Step 1 — Choose Document Type / Role Preset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {(Object.keys(EMPLOYMENT_PRESETS) as EmploymentType[]).map(key => {
            const p = EMPLOYMENT_PRESETS[key]
            const isSelected = formData.presetType === key
            return (
              <button
                key={key}
                onClick={() => handleApplyPreset(key)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <span
                    className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-sm mb-1.5 ${
                      isSelected
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {p.badgeText}
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {p.label}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {p.subtitle}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── State Stamp Duty Notice & Wage Rule Banner ──────────────────────── */}
      <div className="px-6 py-4 bg-blue-50/70 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>State Stamp Duty ({stampRule.stateName}):</strong> {formatInr(stampRule.stampDutyAmount)} under{' '}
            {stampRule.articleRef} ({stampRule.stampType}).
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Scale className={`w-4 h-4 shrink-0 ${wageRule.isCompliant ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Code on Wages 50% Rule:</strong> Basic is {wageRule.basicPercentage}% of monthly gross ({wageRule.isCompliant ? 'Compliant' : 'Needs Adjustment'}).
          </span>
          {!wageRule.isCompliant && (
            <button
              onClick={handleAutoAdjustBasicFiftyPercent}
              className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:no-underline ml-1"
            >
              Auto-Fix to 50%
            </button>
          )}
        </div>
      </div>

      {/* ─── Navigation Tabs ────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
        {[
          { id: 'profile', label: '1. Role & Parties', icon: Users },
          { id: 'compensation', label: '2. Remuneration & CTC', icon: Calculator },
          { id: 'terms', label: '3. Terms & Covenants', icon: ShieldCheck },
          { id: 'preview', label: '4. Live Agreement & Export', icon: Eye },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3.5 px-4 font-semibold text-xs md:text-sm border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ─── Tab Content ────────────────────────────────────────────────────── */}
      <div className="p-6 md:p-8 bg-white dark:bg-slate-900">
        {/* TAB 1: ROLE & PARTIES */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Designation, Workplace & State Jurisdiction
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title / Designation *
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => updateField('designation', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => updateField('department', e.target.value)}
                    placeholder="e.g. Core Engineering"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reports To (Designation)
                  </label>
                  <input
                    type="text"
                    value={formData.reportingManagerDesignation}
                    onChange={e => updateField('reportingManagerDesignation', e.target.value)}
                    placeholder="e.g. VP of Technology"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Mode *
                  </label>
                  <select
                    value={formData.workMode}
                    onChange={e => updateField('workMode', e.target.value as WorkMode)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  >
                    <option value="in_office">Office-Based (Full-Time on premises)</option>
                    <option value="hybrid">Hybrid (Office + Remote Roster)</option>
                    <option value="fully_remote">Fully Remote (Work-From-Home)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Workplace Location / City *
                  </label>
                  <input
                    type="text"
                    value={formData.workLocationCity}
                    onChange={e => updateField('workLocationCity', e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State for Stamp Duty & Court Jurisdiction *
                  </label>
                  <select
                    value={formData.state}
                    onChange={e => updateField('state', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  >
                    {Object.keys(STATE_STAMP_SCHEDULE).map(st => (
                      <option key={st} value={st}>
                        {STATE_STAMP_SCHEDULE[st].stateName} (Stamp Duty: {formatInr(STATE_STAMP_SCHEDULE[st].stampDutyAmount)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Joining *
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={e => updateField('joiningDate', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agreement Execution Date *
                  </label>
                  <input
                    type="date"
                    value={formData.executionDate}
                    onChange={e => updateField('executionDate', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Execution Place *
                  </label>
                  <input
                    type="text"
                    value={formData.executionPlace}
                    onChange={e => updateField('executionPlace', e.target.value)}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Employer Legal Entity Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Employer Legal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={e => updateField('employerName', e.target.value)}
                    placeholder="e.g. Apex Infotech Solutions Private Limited"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Entity Type
                  </label>
                  <select
                    value={formData.employerEntityType}
                    onChange={e => updateField('employerEntityType', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  >
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registration No. / CIN / LLPIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.employerRegistrationNumber || ''}
                    onChange={e => updateField('employerRegistrationNumber', e.target.value)}
                    placeholder="e.g. U72200KA2022PTC158942"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Authorised Signatory Name & Designation *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.signatoryName}
                      onChange={e => updateField('signatoryName', e.target.value)}
                      placeholder="Signatory Name"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                    />
                    <input
                      type="text"
                      value={formData.signatoryDesignation}
                      onChange={e => updateField('signatoryDesignation', e.target.value)}
                      placeholder="Designation (e.g. Director)"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Office Address *
                  </label>
                  <input
                    type="text"
                    value={formData.employerRegisteredAddress}
                    onChange={e => updateField('employerRegisteredAddress', e.target.value)}
                    placeholder="Registered Office full address"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Employee Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Employee Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={e => updateField('employeeName', e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Father / Spouse Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.employeeFatherOrSpouseName || ''}
                    onChange={e => updateField('employeeFatherOrSpouseName', e.target.value)}
                    placeholder="e.g. Suresh Verma"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Employee PAN (Tax ID)
                  </label>
                  <input
                    type="text"
                    value={formData.employeePan || ''}
                    onChange={e => updateField('employeePan', e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email & Mobile (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={formData.employeeEmail || ''}
                      onChange={e => updateField('employeeEmail', e.target.value)}
                      placeholder="Email Address"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                    />
                    <input
                      type="text"
                      value={formData.employeePhone || ''}
                      onChange={e => updateField('employeePhone', e.target.value)}
                      placeholder="Mobile Number"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Residential Address *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeResidentialAddress}
                    onChange={e => updateField('employeeResidentialAddress', e.target.value)}
                    placeholder="Full residential address"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setActiveTab('compensation')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Next: Remuneration & CTC</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: REMUNERATION & CTC */}
        {activeTab === 'compensation' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Monthly Salary Structure & 50% Wage Parity Check
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Under Section 2(y) of the Code on Wages, 2019, Basic Pay plus Dearness Allowance must equal at least 50% of monthly remuneration to avoid surplus allowances being reclassified as wages for PF and Gratuity.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Basic Salary (Monthly) *
                  </label>
                  <input
                    type="number"
                    value={formData.salaryStructure.basicMonthly}
                    onChange={e => updateSalaryBreakdown('basicMonthly', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {wageRule.basicPercentage}% of monthly gross pay
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    House Rent Allowance (HRA)
                  </label>
                  <input
                    type="number"
                    value={formData.salaryStructure.hraMonthly}
                    onChange={e => updateSalaryBreakdown('hraMonthly', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Usually 40%–50% of Basic Pay</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Special / Flexible Allowance
                  </label>
                  <input
                    type="number"
                    value={formData.salaryStructure.specialAllowanceMonthly}
                    onChange={e => updateSalaryBreakdown('specialAllowanceMonthly', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Balancing allowance</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Employer EPF Share (Monthly)
                  </label>
                  <input
                    type="number"
                    value={formData.salaryStructure.pfEmployerMonthly}
                    onChange={e => updateSalaryBreakdown('pfEmployerMonthly', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Statutory employer share (part of CTC)</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Computed Gross Salary (Monthly)
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm font-bold font-mono">
                    {formatInr(formData.monthlyGross)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Sum of monthly earnings</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Annual CTC (INR) *
                  </label>
                  <div className="w-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2.5 text-sm font-bold font-mono text-indigo-700 dark:text-indigo-300">
                    {formatInr(formData.annualCtc)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">{numberToWordsInr(formData.annualCtc)}</span>
                </div>
              </div>

              {/* Wage Compliance Box */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                  wageRule.isCompliant
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                }`}
              >
                <Scale className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-sm mb-0.5">
                    {wageRule.isCompliant ? 'Code on Wages Compliance: PASSED' : 'Statutory Wage Optimization Required'}
                  </div>
                  <p className="leading-relaxed">{wageRule.message}</p>
                </div>
                {!wageRule.isCompliant && (
                  <button
                    onClick={handleAutoAdjustBasicFiftyPercent}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold shrink-0 transition-colors"
                  >
                    Adjust to 50%
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Working Hours & Payment Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Working Hours (Max 9)
                  </label>
                  <input
                    type="number"
                    value={formData.workHoursPerDay}
                    onChange={e => updateField('workHoursPerDay', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Working Days / Week (Max 48h)
                  </label>
                  <input
                    type="number"
                    value={formData.workDaysPerWeek}
                    onChange={e => updateField('workDaysPerWeek', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Weekly Off Day
                  </label>
                  <input
                    type="text"
                    value={formData.weeklyOffDay}
                    onChange={e => updateField('weeklyOffDay', e.target.value)}
                    placeholder="e.g. Saturday and Sunday"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Salary Payout Day
                  </label>
                  <input
                    type="number"
                    value={formData.paymentDayOfMonth}
                    onChange={e => updateField('paymentDayOfMonth', Number(e.target.value))}
                    placeholder="e.g. 7"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setActiveTab('profile')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Next: Terms & Restrictive Covenants</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: TERMS & RESTRICTIVE COVENANTS */}
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Probation, Confirmation & Notice Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3 flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.hasProbation}
                      onChange={e => updateField('hasProbation', e.target.checked)}
                      className="w-4 h-4 rounded-sm text-indigo-600"
                    />
                    <span>Include Probationary Evaluation Period</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.isFixedTerm}
                      onChange={e => updateField('isFixedTerm', e.target.checked)}
                      className="w-4 h-4 rounded-sm text-indigo-600"
                    />
                    <span>Fixed-Term Employment (Specific Duration)</span>
                  </label>
                </div>

                {formData.hasProbation && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Probation Duration (Months)
                      </label>
                      <input
                        type="number"
                        value={formData.probationMonths}
                        onChange={e => updateField('probationMonths', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Notice Period during Probation (Days)
                      </label>
                      <input
                        type="number"
                        value={formData.probationNoticeDays}
                        onChange={e => updateField('probationNoticeDays', Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                  </>
                )}

                {formData.isFixedTerm && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fixed-Term Tenure (Months)
                    </label>
                    <input
                      type="number"
                      value={formData.fixedTermDurationMonths || 12}
                      onChange={e => updateField('fixedTermDurationMonths', Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Standard Notice Period post-Confirmation (Days) *
                  </label>
                  <input
                    type="number"
                    value={formData.noticePeriodDays}
                    onChange={e => updateField('noticePeriodDays', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Restrictive Covenants & Section 27 Caution */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Restrictive Covenants & Section 27 Contract Act Caution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Non-Solicitation Period (Months post-separation)
                  </label>
                  <input
                    type="number"
                    value={formData.nonSolicitMonths}
                    onChange={e => updateField('nonSolicitMonths', Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Applies to soliciting clients, customers, and co-workers.
                  </span>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.includeNonCompeteCaution}
                      onChange={e => updateField('includeNonCompeteCaution', e.target.checked)}
                      className="w-4 h-4 rounded-sm text-indigo-600"
                    />
                    <span>Include Mandatory Section 27 Non-Compete Statutory Caution</span>
                  </label>
                </div>
              </div>

              {/* Section 27 Warning Box */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center gap-1.5 text-sm mb-1">
                  <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Statutory Rule: Post-Employment Non-Compete is Void in India
                </div>
                <p className="leading-relaxed">
                  Under <strong>Section 27 of the Indian Contract Act, 1872</strong> and Supreme Court precedents (*Percept D&apos;Mark v. Zaheer Khan*),
                  an employer cannot restrain an ex-employee from taking up employment with a competitor after their contract ends.
                  We enforce enforceable protections instead: <strong>non-solicitation, perpetual trade secret confidentiality, and IP work-for-hire assignment</strong>.
                </p>
              </div>
            </div>

            {/* Training Cost Recovery / Bond */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Specialized Training Commitment (Section 74)
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.hasTrainingBond}
                    onChange={e => updateField('hasTrainingBond', e.target.checked)}
                    className="w-4 h-4 rounded-sm text-indigo-600"
                  />
                  <span>Enable Training Cost Recovery Clause</span>
                </label>
              </div>

              {formData.hasTrainingBond ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Service Commitment Period (Months)
                      </label>
                      <input
                        type="number"
                        value={formData.bondDurationMonths || 12}
                        onChange={e => updateField('bondDurationMonths', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Actual Training Expense Pre-Estimate (INR) *
                      </label>
                      <input
                        type="number"
                        value={formData.trainingCostAmount || 100000}
                        onChange={e => updateField('trainingCostAmount', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm font-mono"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Specialized Training Description (Must be documented with bills/vouchers)
                      </label>
                      <input
                        type="text"
                        value={formData.trainingSpecialityDescription || ''}
                        onChange={e => updateField('trainingSpecialityDescription', e.target.value)}
                        placeholder="e.g. Advanced Enterprise Cloud Security Certification and Proprietary ERP Systems Training"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    <strong>Legal Requirement:</strong> Under Indian High Court rulings (*Sicpa India Ltd.* and *Toshniwal Brothers*),
                    an employer can only recover direct, reasonable, and actual expenditure incurred exclusively for training.
                    Retaining educational certificates or imposing punitive exit penalties is strictly illegal.
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Standard agreement selected without employee training commitment. (Check above to enable).
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setActiveTab('compensation')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Generate & Preview Draft</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PREVIEW & EXPORT ACTIONS */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ready for Execution:
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold">
                  {formData.designation} ({formData.employerName})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleInitiateDownload('docx')}
                  disabled={isDownloading !== null}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading === 'docx' ? 'Generating...' : 'Download Word (.docx)'}</span>
                </button>
                <button
                  onClick={() => handleInitiateDownload('pdf')}
                  disabled={isDownloading !== null}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isDownloading === 'pdf' ? 'Generating...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Markdown Display Box */}
            <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-xs font-serif text-slate-800 dark:text-slate-200 leading-relaxed text-sm md:text-base max-h-[650px] overflow-y-auto whitespace-pre-wrap">
              {previewMarkdown}
            </div>

            {/* Post-Generation Checklist Card */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Post-Generation Execution Checklist for HR / Founders
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-5">
                <li>
                  <strong>Stamp Duty Payment:</strong> Procure non-judicial stamp paper or e-stamp certificate of{' '}
                  <strong>{formatInr(stampRule.stampDutyAmount)}</strong> in <strong>{stampRule.stateName}</strong> ({stampRule.articleRef}).
                </li>
                <li>
                  <strong>Signatures:</strong> Both the authorized corporate representative and the employee must sign all pages; two independent witnesses should sign the execution clause.
                </li>
                <li>
                  <strong>Statutory Appointment Letter:</strong> Issue the formal Letter of Appointment containing the statutory particulars under Section 6(1)(f) of the OSH Code, 2020.
                </li>
                <li>
                  <strong>Personnel Filing:</strong> Retain the executed original securely in HR personnel files. (Notice: General employment contracts do <em>not</em> need to be placed in Company Minute Books or filed with the RoC/MCA).
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Non-Intrusive Download Modal */}
      {showDownloadPrompt && (
        <LazyDownloadSubscribePrompt
          open={showDownloadPrompt}
          source="template"
          onClose={handlePromptComplete}
        />
      )}
    </div>
  )
}
