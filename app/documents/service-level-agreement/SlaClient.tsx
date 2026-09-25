'use client'

import React, { useState } from 'react'
import {
  Download,
  FileText,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Shield,
  Clock,
  Sparkles,
  Calculator,
  Server,
  Cloud,
  Users,
  Wrench,
  UserCheck,
  Printer,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Languages,
  AlertCircle,
  X,
  ChevronRight,
  Eye,
  Scale
} from 'lucide-react'
import {
  SlaType,
  SLA_PRESETS,
  SlaFormData,
  SlaCustomClause,
} from '@/lib/doc-generator/sla-generator'

const QUICK_AI_PROMPTS = [
  {
    label: '🛡️ DPDP Act 2023 & CERT-In Notice',
    prompt: 'Add mandatory CERT-In 6-hour cybersecurity breach notification and DPDP Act 2023 Section 8 data processor safeguards clause.',
    action: 'add_clause' as const,
    tone: 'balanced' as const,
  },
  {
    label: '⚡ Customer-Friendly (99.99% Uptime)',
    prompt: 'Make SLA strongly customer-friendly: 99.99% high-availability uptime, 15-minute response for Sev-1, 2-hour resolution, 10% credit per 0.01% outage, capped at 25% billing.',
    action: 'draft_from_prompt' as const,
    tone: 'client_favourable' as const,
  },
  {
    label: '🛡️ Vendor-Protective (Safe Liability)',
    prompt: 'Make SLA vendor-friendly: 99.0% uptime, 2-hour Sev-1 response, exclude 3rd-party API & ISP outages from downtime, cap liquidated damages at 10% monthly retainer.',
    action: 'draft_from_prompt' as const,
    tone: 'vendor_favourable' as const,
  },
  {
    label: '🔄 Disaster Recovery & BCP',
    prompt: 'Add a robust Business Continuity & Disaster Recovery (DR) clause with Recovery Time Objective (RTO) of 2 hours and Recovery Point Objective (RPO) of 15 minutes, with semi-annual DR drills.',
    action: 'add_clause' as const,
    tone: 'balanced' as const,
  },
  {
    label: '🔍 Audit Rights & SOC 2 Compliance',
    prompt: 'Add a right-to-audit clause allowing client to inspect SOC 2 Type II reports, ISO 27001 certifications, and conduct annual third-party security audits.',
    action: 'add_clause' as const,
    tone: 'client_favourable' as const,
  },
  {
    label: '🌐 Hindi Executive Summary (द्विभाषी)',
    prompt: 'Generate an authoritative formal Hindi executive summary (द्विभाषी वैधानिक सारांश) explaining uptime SLOs, response times, and Section 74 damages for company promoters and board directors.',
    action: 'change_language' as const,
    tone: 'balanced' as const,
    language: 'bilingual' as const,
  },
]

export default function SlaClient() {
  const [activeTab, setActiveTab] = useState<'preview' | 'customizer' | 'calculator' | 'instant'>('preview')
  const [selectedPreset, setSelectedPreset] = useState<SlaType>('cloud_computing')
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Main Form Data State
  const [formData, setFormData] = useState<SlaFormData>({
    slaType: 'cloud_computing',
    title: SLA_PRESETS.cloud_computing.title,
    effectiveDate: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    clientName: 'ALPHA ENTERPRISES PRIVATE LIMITED',
    clientCin: 'U72900MH2020PTC123456',
    clientAddress: '101, Express Towers, Nariman Point, Mumbai - 400021, Maharashtra, India',
    clientSignatoryName: 'Rajesh Sharma',
    clientSignatoryTitle: 'Director',
    providerName: 'NEXUS CLOUD SOLUTIONS PRIVATE LIMITED',
    providerCin: 'U72200DL2018PTC654321',
    providerAddress: 'Plot 45, Okhla Industrial Area Phase-III, New Delhi - 110020, India',
    providerSignatoryName: 'Amitabh Sen',
    providerSignatoryTitle: 'Managing Director',
    servicesDescription: SLA_PRESETS.cloud_computing.servicesDefault,
    uptimeTarget: '99.95%',
    maintenanceWindow: 'Every second Sunday from 01:00 AM to 04:00 AM IST with 5 days advance notice.',
    sev1ResponseTime: '1 Hour',
    sev1ResolutionTime: '4 Hours',
    sev2ResponseTime: '2 Hours',
    sev2ResolutionTime: '8 Hours',
    sev3ResponseTime: '8 Hours',
    sev3ResolutionTime: '24 Hours',
    sev4ResponseTime: '24 Hours',
    sev4ResolutionTime: '72 Hours',
    creditPercentage: '5% of monthly fees per 0.05% drop below 99.95%',
    penaltyCap: '25% of monthly billing',
    arbitrationSeat: 'New Delhi',
    termMonths: '12',
    customClauses: [
      {
        id: 'init_certin',
        title: 'CERT-In 6-Hour Cybersecurity Incident Notice',
        content:
          'Pursuant to the CERT-In Directions 2022, the Service Provider shall report any information security incident, cyber breach, or unauthorized system compromise to the Client within six (6) hours of detection.',
      },
    ],
    languageNote: '',
  })

  // History Stack for Undo
  const [historyStack, setHistoryStack] = useState<SlaFormData[]>([])

  // AI Assist Drawer/Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiAction, setAiAction] = useState<'draft_from_prompt' | 'add_clause' | 'rephrase' | 'change_language'>('draft_from_prompt')
  const [aiTone, setAiTone] = useState<'balanced' | 'vendor_favourable' | 'client_favourable'>('balanced')
  const [aiLanguage, setAiLanguage] = useState<'en' | 'hi' | 'bilingual'>('en')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSuccessToast, setAiSuccessToast] = useState<string | null>(null)

  // Manual Clause Addition in Customizer
  const [newClauseTitle, setNewClauseTitle] = useState('')
  const [newClauseContent, setNewClauseContent] = useState('')
  const [isAddingManualClause, setIsAddingManualClause] = useState(false)

  // Calculator State
  const [calcMonthlyFee, setCalcMonthlyFee] = useState<number>(200000)
  const [calcDowntimeHours, setCalcDowntimeHours] = useState<number>(4)
  const [calcUptimeTarget, setCalcUptimeTarget] = useState<number>(99.9)

  const handlePresetSelect = (type: SlaType) => {
    setSelectedPreset(type)
    const p = SLA_PRESETS[type]
    setHistoryStack(prev => [...prev.slice(-5), formData])
    setFormData(prev => ({
      ...prev,
      slaType: type,
      title: p.title,
      servicesDescription: p.servicesDefault,
      uptimeTarget: p.uptimeDefault,
      maintenanceWindow: p.maintenanceDefault,
      creditPercentage: p.creditDefault,
      penaltyCap: p.capDefault,
    }))
  }

  const handleInstantDownload = (type: SlaType, format: 'docx' | 'pdf') => {
    setDownloadingFormat(`${type}-${format}`)
    const url = `/api/documents/sla-download?type=${type}&format=${format}`
    const a = document.createElement('a')
    a.href = url
    a.download = `Service_Level_Agreement_${type}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDownloadingFormat(null), 1500)
  }

  const handleCustomDownload = async (format: 'docx' | 'pdf') => {
    setDownloadingFormat(`custom-${format}`)
    try {
      const res = await fetch('/api/documents/sla-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, format }),
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Custom_SLA_${formData.slaType}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Unable to generate custom document. Please verify inputs.')
    } finally {
      setDownloadingFormat(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // AI Assist Call
  const handleRunAiAssist = async (customPromptToUse?: string, customAction?: any, customTone?: any, customLang?: any) => {
    const promptToSubmit = (customPromptToUse || aiPrompt).trim()
    if (!promptToSubmit || promptToSubmit.length < 3) {
      setAiError('Please enter a specific drafting instruction or select a quick prompt chip.')
      return
    }

    setIsAiLoading(true)
    setAiError(null)

    try {
      const res = await fetch('/api/documents/sla-ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: customAction || aiAction,
          prompt: promptToSubmit,
          tone: customTone || aiTone,
          language: customLang || aiLanguage,
          currentData: formData,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.details || 'Gemini drafting failed.')
      }

      const result = json.data

      // Save previous state for Undo
      setHistoryStack(prev => [...prev.slice(-5), formData])

      // Apply updates to formData
      setFormData(prev => {
        const updated = { ...prev }

        if (result.updatedData) {
          Object.assign(updated, result.updatedData)
        }

        if (Array.isArray(result.addedClauses) && result.addedClauses.length > 0) {
          const currentClauses = prev.customClauses ? [...prev.customClauses] : []
          result.addedClauses.forEach((newC: SlaCustomClause) => {
            const exists = currentClauses.some(
              c => c.title.toLowerCase().trim() === newC.title.toLowerCase().trim()
            )
            if (!exists) {
              currentClauses.push({
                id: newC.id || `clause_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                title: newC.title,
                content: newC.content,
              })
            }
          })
          updated.customClauses = currentClauses
        }

        if (result.languageNote) {
          updated.languageNote = result.languageNote
        }

        return updated
      })

      setAiSuccessToast(result.aiSummary || 'AI legal updates applied successfully!')
      setTimeout(() => setAiSuccessToast(null), 6000)
      setIsAiModalOpen(false)
      setActiveTab('preview') // Automatically switch to preview so user sees the change!
    } catch (err: any) {
      console.error('[SLA AI Assist Error]:', err)
      setAiError(err.message || 'AI drafting service unavailable. Please retry.')
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleUndo = () => {
    if (historyStack.length === 0) return
    const previous = historyStack[historyStack.length - 1]
    setHistoryStack(prev => prev.slice(0, -1))
    setFormData(previous)
    setAiSuccessToast('Reverted to previous version.')
    setTimeout(() => setAiSuccessToast(null), 3000)
  }

  const handleAddManualClause = () => {
    if (!newClauseTitle.trim() || !newClauseContent.trim()) return
    const newClause: SlaCustomClause = {
      id: `manual_${Date.now()}`,
      title: newClauseTitle.trim(),
      content: newClauseContent.trim(),
    }
    setFormData(prev => ({
      ...prev,
      customClauses: [...(prev.customClauses || []), newClause],
    }))
    setNewClauseTitle('')
    setNewClauseContent('')
    setIsAddingManualClause(false)
  }

  const handleDeleteClause = (clauseId?: string) => {
    if (!clauseId) return
    setFormData(prev => ({
      ...prev,
      customClauses: prev.customClauses?.filter(c => c.id !== clauseId),
    }))
  }

  // Full agreement plain text generator for clipboard copy
  const getFullAgreementText = (): string => {
    const customClausesText = (formData.customClauses || [])
      .map((c, i) => `${6 + i}. ${c.title.toUpperCase()}\n${c.content}\n`)
      .join('\n')

    const nextClauseNum = 6 + (formData.customClauses?.length || 0)

    const langNoteText = formData.languageNote
      ? `\nANNEXURE I: BILINGUAL STATUTORY NOTE / द्विभाषी वैधानिक सारांश\n${formData.languageNote}\n`
      : ''

    return `SERVICE LEVEL AGREEMENT (SLA)
[Governed by the Indian Contract Act, 1872 & Information Technology Act, 2000]

THIS SERVICE LEVEL AGREEMENT is made on this ${formData.effectiveDate} by and between:
1. ${formData.clientName} (CIN: ${formData.clientCin || 'N/A'}), having its registered office at ${formData.clientAddress} (the "Client"); and
2. ${formData.providerName} (CIN: ${formData.providerCin || 'N/A'}), having its registered office at ${formData.providerAddress} (the "Service Provider").

WHEREAS:
A. The Service Provider is engaged in the professional business of delivering technical and enterprise services.
B. The Client desires to engage the Service Provider in accordance with the performance benchmarks and liquidated damages remedies stipulated herein.

NOW IT IS MUTUALLY AGREED AS FOLLOWS:

1. SCOPE OF SERVICES & COMMENCEMENT
The Service Provider shall deliver the following designated services for an initial term of ${formData.termMonths} months:
${formData.servicesDescription}

2. SERVICE LEVEL OBJECTIVES (SLOs) & UPTIME COMMITMENT
2.1 Availability Target: The Service Provider unconditionally warrants that the contracted services shall maintain a minimum monthly uptime of ${formData.uptimeTarget}, measured 24 hours a day, 7 days a week over each calendar billing month.
2.2 Scheduled Maintenance: Uptime excludes agreed maintenance windows: ${formData.maintenanceWindow}.

3. INCIDENT SEVERITY CLASSIFICATION & RESPONSE TIMES
- Severity 1 (Critical): Target Response: ${formData.sev1ResponseTime} | Target Resolution: ${formData.sev1ResolutionTime}
- Severity 2 (High): Target Response: ${formData.sev2ResponseTime} | Target Resolution: ${formData.sev2ResolutionTime}
- Severity 3 (Medium): Target Response: ${formData.sev3ResponseTime} | Target Resolution: ${formData.sev3ResolutionTime}
- Severity 4 (Low): Target Response: ${formData.sev4ResponseTime} | Target Resolution: ${formData.sev4ResolutionTime}

4. SERVICE CREDITS & LIQUIDATED DAMAGES
4.1 Failure to satisfy agreed SLOs shall entitle Client to Service Credits: ${formData.creditPercentage}, subject to an aggregate monthly cap of ${formData.penaltyCap}.
4.2 Section 74 Indian Contract Act Compliance: Service Credits represent a genuine pre-estimate of loss and reasonable compensation under Section 74 of the Indian Contract Act, 1872.

5. DATA PROTECTION & CYBERSECURITY COMPLIANCE
The Service Provider acts as a Data Processor under Section 8 of the Digital Personal Data Protection Act, 2023 (DPDP Act) and shall notify the Client of any cybersecurity incident within six (6) hours of discovery.

${customClausesText}
${nextClauseNum}. GOVERNING LAW & ARBITRATION
This Agreement shall be governed by the laws of India and subject to arbitration in ${formData.arbitrationSeat}, India under the Arbitration and Conciliation Act, 1996.
${langNoteText}
IN WITNESS WHEREOF, the parties hereto have executed this Agreement by their authorized signatories:
FOR CLIENT: _______________________ (${formData.clientSignatoryName}, ${formData.clientSignatoryTitle})
FOR SERVICE PROVIDER: _______________________ (${formData.providerSignatoryName}, ${formData.providerSignatoryTitle})
`
  }

  // Calculator calculations
  const allowedDowntimeHours = 720 * (1 - calcUptimeTarget / 100)
  const excessDowntimeHours = Math.max(0, calcDowntimeHours - allowedDowntimeHours)
  const calculatedCreditPct = Math.min(25, Math.round(excessDowntimeHours * 2))
  const calculatedCreditAmount = Math.round((calcMonthlyFee * calculatedCreditPct) / 100)
  const actualUptimePct = (((720 - calcDowntimeHours) / 720) * 100).toFixed(2)

  const presetIcons: Record<SlaType, React.ReactNode> = {
    cloud_computing: <Cloud className="w-4 h-4" />,
    it_saas: <Server className="w-4 h-4" />,
    vendor_customer: <Users className="w-4 h-4" />,
    software_maintenance: <Wrench className="w-4 h-4" />,
    recruitment_hr: <UserCheck className="w-4 h-4" />,
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden mb-12">
      {/* ─── AI Toast / Success Notification ─────────────────────────────── */}
      {aiSuccessToast && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-emerald-500/10 border-b border-amber-300 px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs text-amber-950 font-medium">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Gemini AI Drafter:</strong> {aiSuccessToast}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {historyStack.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/80 border border-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" /> Undo
              </button>
            )}
            <button
              type="button"
              onClick={() => setAiSuccessToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Top Navigation Bar with AI Launch Button ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 bg-slate-50/90 p-2 gap-2">
        <div className="flex p-1 gap-1.5 flex-wrap sm:flex-nowrap flex-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Live Document Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('customizer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'customizer'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Interactive Customizer</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'calculator'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>Penalty Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'instant'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>1-Click Presets</span>
          </button>
        </div>

        {/* Gemini AI Drafter Launch Button */}
        <div className="flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>Gemini AI Legal Drafter</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono font-medium uppercase">
              AI Edit
            </span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: Live SLA Legal Paper Preview ──────────────────────────── */}
      {activeTab === 'preview' && (
        <div className="p-4 sm:p-8 space-y-6 bg-slate-100/60 min-h-[600px]">
          {/* Preview Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-mono uppercase bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                Statutory A4 Preview
              </span>
              <span className="text-xs text-slate-500">
                Preset: <strong>{SLA_PRESETS[formData.slaType].shortLabel}</strong>
              </span>
              {formData.customClauses && formData.customClauses.length > 0 && (
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-full">
                  +{formData.customClauses.length} Special Clause{formData.customClauses.length > 1 ? 's' : ''}
                </span>
              )}
              {formData.languageNote && (
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Languages className="w-3 h-3" /> Bilingual Note Attached
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Edit</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(getFullAgreementText(), 'agreement-text')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
              >
                {copiedKey === 'agreement-text' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={() => handleCustomDownload('docx')}
                disabled={downloadingFormat !== null}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-2xs disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCustomDownload('pdf')}
                disabled={downloadingFormat !== null}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-2xs disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* ─── Physical Paper Legal Agreement Sheet (A4 styling) ──────────── */}
          <div className="max-w-4xl mx-auto bg-white border border-slate-300 shadow-xl rounded-2xl p-6 sm:p-12 text-slate-900 font-sans print:shadow-none print:border-none print:p-0">
            {/* Stamp Paper Top Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-semibold block">
                COMMERCIAL SERVICE CONTRACT & PERFORMANCE STANDARD
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-slate-950 font-serif">
                {formData.title || SLA_PRESETS[formData.slaType].title}
              </h1>
              <p className="text-xs text-slate-600 italic">
                [Executed under the Indian Contract Act, 1872, Information Technology Act, 2000 & DPDP Act, 2023]
              </p>
            </div>

            {/* Preamble & Execution Date */}
            <div className="text-xs sm:text-sm leading-relaxed text-slate-800 space-y-3 mb-6">
              <p>
                <strong>THIS SERVICE LEVEL AGREEMENT (&quot;Agreement&quot; or &quot;SLA&quot;)</strong> is entered into on this{' '}
                <span className="font-semibold underline underline-offset-4 decoration-amber-500">{formData.effectiveDate}</span>{' '}
                (&quot;Effective Date&quot;), by and between:
              </p>

              {/* Parties Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-1">
                    1. The Client (Customer)
                  </span>
                  <p className="font-bold text-slate-900">{formData.clientName}</p>
                  <p className="text-slate-600 font-mono text-[11px]">CIN: {formData.clientCin || '[CIN NOT SPECIFIED]'}</p>
                  <p className="text-slate-600 text-[11px] leading-normal">{formData.clientAddress}</p>
                  <p className="text-slate-500 text-[11px]">
                    Represented by: <strong>{formData.clientSignatoryName}</strong> ({formData.clientSignatoryTitle})
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-1">
                    2. The Service Provider
                  </span>
                  <p className="font-bold text-slate-900">{formData.providerName}</p>
                  <p className="text-slate-600 font-mono text-[11px]">CIN: {formData.providerCin || '[CIN NOT SPECIFIED]'}</p>
                  <p className="text-slate-600 text-[11px] leading-normal">{formData.providerAddress}</p>
                  <p className="text-slate-500 text-[11px]">
                    Represented by: <strong>{formData.providerSignatoryName}</strong> ({formData.providerSignatoryTitle})
                  </p>
                </div>
              </div>

              {/* Recitals */}
              <div className="space-y-1.5 pt-2 text-xs text-slate-700">
                <p>
                  <strong>WHEREAS:</strong>
                </p>
                <p className="pl-4">
                  <strong>A.</strong> The Service Provider is engaged in the professional commercial business of providing designated enterprise technical, cloud, software maintenance, and operational workflows.
                </p>
                <p className="pl-4">
                  <strong>B.</strong> The Client desires to retain the Service Provider, and the Service Provider agrees to deliver the Services strictly in conformance with the service levels, uptime targets, incident resolution matrices, and liquidated damages remedies stipulated herein.
                </p>
              </div>
            </div>

            {/* ─── Numbered Statutory & Operational Clauses ─────────────────── */}
            <div className="space-y-6 text-xs sm:text-sm text-slate-800 leading-relaxed">
              {/* Clause 1 */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-bold text-slate-950 uppercase tracking-wide text-xs sm:text-sm mb-2 flex items-center gap-2">
                  <span className="font-mono text-amber-600">1.</span> SCOPE OF SERVICES & COMMENCEMENT
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>1.1</strong> The Service Provider shall deliver the following designated operational and technology services during the agreed Term of <strong>{formData.termMonths} Months</strong> from the Effective Date:
                </p>
                <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {formData.servicesDescription}
                </div>
              </div>

              {/* Clause 2 */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-bold text-slate-950 uppercase tracking-wide text-xs sm:text-sm mb-2 flex items-center gap-2">
                  <span className="font-mono text-amber-600">2.</span> SERVICE LEVEL OBJECTIVES (SLOs) & UPTIME COMMITMENT
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed mb-2">
                  <strong>2.1 Availability Target:</strong> The Service Provider warrants that the contracted services shall achieve a minimum availability of{' '}
                  <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">{formData.uptimeTarget}</span>, measured 24 hours per day, 7 days per week over each calendar billing month.
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>2.2 Permitted Maintenance:</strong> Uptime excludes pre-scheduled maintenance conducted during agreed windows: <em>&ldquo;{formData.maintenanceWindow}&rdquo;</em>. Any outage outside permitted windows constitutes unscheduled downtime.
                </p>
              </div>

              {/* Clause 3: Severity Table */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-bold text-slate-950 uppercase tracking-wide text-xs sm:text-sm mb-2 flex items-center gap-2">
                  <span className="font-mono text-amber-600">3.</span> INCIDENT SEVERITY CLASSIFICATION & RESPONSE MATRIX
                </h3>
                <p className="text-xs text-slate-700 mb-3">
                  <strong>3.1</strong> Incidents and defects reported by Client shall be prioritized, acknowledged, and remediated in accordance with the statutory matrix below:
                </p>

                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5 border-b border-slate-300">Severity Tier</th>
                        <th className="p-2.5 border-b border-slate-300">Impact Definition</th>
                        <th className="p-2.5 border-b border-slate-300 text-center">Target Response</th>
                        <th className="p-2.5 border-b border-slate-300 text-center">Target Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 text-xs">
                      <tr className="bg-rose-50/30">
                        <td className="p-2.5 font-bold text-rose-700 whitespace-nowrap">
                          Severity 1 (Critical)
                        </td>
                        <td className="p-2.5 text-slate-600">
                          Complete system outage; mission-critical business transactions halted; no workaround available.
                        </td>
                        <td className="p-2.5 text-center font-bold font-mono text-rose-700">
                          {formData.sev1ResponseTime}
                        </td>
                        <td className="p-2.5 text-center font-bold font-mono text-rose-700">
                          {formData.sev1ResolutionTime}
                        </td>
                      </tr>
                      <tr className="bg-amber-50/30">
                        <td className="p-2.5 font-bold text-amber-700 whitespace-nowrap">
                          Severity 2 (High)
                        </td>
                        <td className="p-2.5 text-slate-600">
                          Core feature severely impaired; business operations impaired but secondary workflows functioning.
                        </td>
                        <td className="p-2.5 text-center font-bold font-mono text-amber-700">
                          {formData.sev2ResponseTime}
                        </td>
                        <td className="p-2.5 text-center font-bold font-mono text-amber-700">
                          {formData.sev2ResolutionTime}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-blue-700 whitespace-nowrap">
                          Severity 3 (Medium)
                        </td>
                        <td className="p-2.5 text-slate-600">
                          Non-critical defect; acceptable operational workaround available; productivity partially affected.
                        </td>
                        <td className="p-2.5 text-center font-bold font-mono text-blue-700">
                          {formData.sev3ResponseTime}
                        </td>
                        <td className="p-2.5 text-center font-bold font-mono text-blue-700">
                          {formData.sev3ResolutionTime}
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-700 whitespace-nowrap">
                          Severity 4 (Low)
                        </td>
                        <td className="p-2.5 text-slate-600">
                          Cosmetic glitch, documentation inquiry, or general configuration enhancement request.
                        </td>
                        <td className="p-2.5 text-center font-bold font-mono text-slate-700">
                          {formData.sev4ResponseTime}
                        </td>
                        <td className="p-2.5 text-center font-bold font-mono text-slate-700">
                          {formData.sev4ResolutionTime}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clause 4 */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-bold text-slate-950 uppercase tracking-wide text-xs sm:text-sm mb-2 flex items-center gap-2">
                  <span className="font-mono text-amber-600">4.</span> SERVICE CREDITS & LIQUIDATED DAMAGES
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed mb-2">
                  <strong>4.1 Service Credit Formula:</strong> In the event of failure to meet contracted availability or resolution timelines, Client shall receive credits calculated at: <strong>{formData.creditPercentage}</strong>, subject to an aggregate monthly ceiling of <strong>{formData.penaltyCap}</strong>.
                </p>
                <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed italic">
                  <strong>Section 74 Indian Contract Act Compliance:</strong> The parties expressly stipulate that the Service Credits agreed herein represent a fair, genuine pre-estimate of loss under Section 74 of the Indian Contract Act, 1872, and shall not be construed as an arbitrary penal forfeiture.
                </div>
              </div>

              {/* Clause 5 */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-bold text-slate-950 uppercase tracking-wide text-xs sm:text-sm mb-2 flex items-center gap-2">
                  <span className="font-mono text-amber-600">5.</span> DATA PROTECTION & CYBERSECURITY COMPLIANCE
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>5.1</strong> The Service Provider acts as a Data Processor under Section 8 of the Digital Personal Data Protection Act, 2023 (DPDP Act) and shall maintain technical safeguards prescribed under Section 43A of the Information Technology Act, 2000. In accordance with CERT-In Cyber Security Directions 2022, any cyber incident or unauthorized breach must be reported to Client within <strong>six (6) hours</strong> of detection.
                </p>
              </div>

              {/* Dynamic Custom Clauses (AI / User generated) */}
              {formData.customClauses && formData.customClauses.length > 0 && (
                <div className="space-y-4">
                  {formData.customClauses.map((clause, idx) => (
                    <div key={clause.id || idx} className="border-t border-slate-200 pt-4 group relative">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-950 uppercase tracking-wide text-xs sm:text-sm flex items-center gap-2">
                          <span className="font-mono text-amber-600">{6 + idx}.</span> {clause.title}
                        </h3>
                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                          Custom Stipulation
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        <strong>{6 + idx}.1</strong> {clause.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Governing Law & Dispute Resolution */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-bold text-slate-950 uppercase tracking-wide text-xs sm:text-sm mb-2 flex items-center gap-2">
                  <span className="font-mono text-amber-600">
                    {6 + (formData.customClauses?.length || 0)}.
                  </span>{' '}
                  GOVERNING LAW & ARBITRATION
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>{6 + (formData.customClauses?.length || 0)}.1</strong> This Agreement shall be governed by and construed in accordance with the substantive laws of India. Any controversy or dispute arising under this SLA shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be <strong>{formData.arbitrationSeat}, India</strong>.
                </p>
              </div>

              {/* Bilingual Hindi Summary / Note if Present */}
              {formData.languageNote && (
                <div className="border-2 border-dashed border-amber-300 bg-amber-50/50 p-4 rounded-xl mt-6">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-amber-900 mb-2">
                    <Languages className="w-4 h-4 text-amber-600" />
                    <span>ANNEXURE I: BILINGUAL STATUTORY NOTE / कार्यपालिका सारांश (द्विभाषी)</span>
                  </div>
                  <p className="text-xs text-slate-800 italic leading-relaxed whitespace-pre-wrap">
                    {formData.languageNote}
                  </p>
                </div>
              )}

              {/* Execution & Signatures Block */}
              <div className="border-t-2 border-slate-900 pt-6 mt-8 space-y-4">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wide text-center">
                  IN WITNESS WHEREOF, THE PARTIES HERETO HAVE DULY EXECUTED THIS SERVICE LEVEL AGREEMENT AS OF THE EFFECTIVE DATE FIRST WRITTEN ABOVE.
                </p>

                <div className="grid grid-cols-2 gap-8 pt-4">
                  {/* Client Signature */}
                  <div className="space-y-3">
                    <span className="font-bold text-xs text-slate-900 uppercase block">FOR AND ON BEHALF OF CLIENT:</span>
                    <div className="border-b border-slate-400 pt-12"></div>
                    <div className="text-xs space-y-0.5 text-slate-700">
                      <p>
                        Authorized Signatory: <strong>{formData.clientSignatoryName}</strong>
                      </p>
                      <p>Designation: {formData.clientSignatoryTitle}</p>
                      <p>Entity: {formData.clientName}</p>
                      <p>Date: {formData.effectiveDate}</p>
                    </div>
                  </div>

                  {/* Provider Signature */}
                  <div className="space-y-3">
                    <span className="font-bold text-xs text-slate-900 uppercase block">FOR AND ON BEHALF OF SERVICE PROVIDER:</span>
                    <div className="border-b border-slate-400 pt-12"></div>
                    <div className="text-xs space-y-0.5 text-slate-700">
                      <p>
                        Authorized Signatory: <strong>{formData.providerSignatoryName}</strong>
                      </p>
                      <p>Designation: {formData.providerSignatoryTitle}</p>
                      <p>Entity: {formData.providerName}</p>
                      <p>Date: {formData.effectiveDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Interactive SLA Customizer ───────────────────────────── */}
      {activeTab === 'customizer' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Customize SLA Parameters & Clauses
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Edit legal entities, uptime commitments, and add custom statutory clauses. Live updates reflect in preview.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-2xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Gemini to Fill / Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Client Details */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Client (Customer) Details
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client CIN</label>
                  <input
                    type="text"
                    value={formData.clientCin || ''}
                    onChange={e => setFormData({ ...formData, clientCin: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={formData.clientSignatoryName}
                    onChange={e => setFormData({ ...formData, clientSignatoryName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Office Address</label>
                <textarea
                  rows={2}
                  value={formData.clientAddress}
                  onChange={e => setFormData({ ...formData, clientAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Right: Service Provider Details */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-600" /> Service Provider Details
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Legal Name</label>
                <input
                  type="text"
                  value={formData.providerName}
                  onChange={e => setFormData({ ...formData, providerName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Provider CIN</label>
                  <input
                    type="text"
                    value={formData.providerCin || ''}
                    onChange={e => setFormData({ ...formData, providerCin: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={formData.providerSignatoryName}
                    onChange={e => setFormData({ ...formData, providerSignatoryName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Office Address</label>
                <textarea
                  rows={2}
                  value={formData.providerAddress}
                  onChange={e => setFormData({ ...formData, providerAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Operational Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Uptime Target (%)</label>
              <input
                type="text"
                value={formData.uptimeTarget}
                onChange={e => setFormData({ ...formData, uptimeTarget: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Penalty Cap</label>
              <input
                type="text"
                value={formData.penaltyCap}
                onChange={e => setFormData({ ...formData, penaltyCap: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Formula</label>
              <input
                type="text"
                value={formData.creditPercentage}
                onChange={e => setFormData({ ...formData, creditPercentage: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Arbitration Seat (City)</label>
              <input
                type="text"
                value={formData.arbitrationSeat}
                onChange={e => setFormData({ ...formData, arbitrationSeat: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Scope of Services */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Services Description</label>
            <textarea
              rows={3}
              value={formData.servicesDescription}
              onChange={e => setFormData({ ...formData, servicesDescription: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
            />
          </div>

          {/* ─── Custom Clauses Manager ────────────────────────────────────── */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" /> Special Clauses & Operational Stipulations
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Add custom statutory covenants, cybersecurity notices, or audit rules.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingManualClause(!isAddingManualClause)}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Clause
              </button>
            </div>

            {/* List of active custom clauses */}
            {formData.customClauses && formData.customClauses.length > 0 ? (
              <div className="space-y-3">
                {formData.customClauses.map((clause, idx) => (
                  <div key={clause.id || idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-amber-600">{6 + idx}.</span> {clause.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteClause(clause.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                        title="Delete clause"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{clause.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No custom clauses added yet. Click &quot;Add Clause&quot; or use Gemini AI Drafter.</p>
            )}

            {/* Inline Add Clause Box */}
            {isAddingManualClause && (
              <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Add New Custom Clause</span>
                <input
                  type="text"
                  placeholder="Clause Title (e.g., SOC 2 Annual Audit & Verification Rights)"
                  value={newClauseTitle}
                  onChange={e => setNewClauseTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  rows={2}
                  placeholder="Full legal text of clause..."
                  value={newClauseContent}
                  onChange={e => setNewClauseContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingManualClause(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddManualClause}
                    disabled={!newClauseTitle.trim() || !newClauseContent.trim()}
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg shadow-2xs disabled:opacity-50"
                  >
                    Save Clause
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bilingual / Language Note Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-amber-600" />
              Bilingual Executive Summary / Hindi Statutory Note (Optional Annexure)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. यह अनुबंध भारतीय संविदा अधिनियम १८७२ के अंतर्गत विधिक रूप से मान्य है..."
              value={formData.languageNote || ''}
              onChange={e => setFormData({ ...formData, languageNote: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-serif"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" /> View in Live Legal Preview
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleCustomDownload('docx')}
                disabled={downloadingFormat !== null}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>{downloadingFormat === 'custom-docx' ? 'Generating...' : 'Download Word (.docx)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCustomDownload('pdf')}
                disabled={downloadingFormat !== null}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>{downloadingFormat === 'custom-pdf' ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Service Credit Penalty Calculator ──────────────────────── */}
      {activeTab === 'calculator' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              Service Credit & Liquidated Damages Calculator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate statutory downtime compensation under Section 74 of the Indian Contract Act, 1872.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Service Retainer / Billing (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={calcMonthlyFee}
                  onChange={e => setCalcMonthlyFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contracted Uptime Target (%)
                  </label>
                  <select
                    value={calcUptimeTarget}
                    onChange={e => setCalcUptimeTarget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value={99.99}>99.99% (Four Nines — Mission Critical)</option>
                    <option value={99.9}>99.9% (Three Nines — Standard Cloud/SaaS)</option>
                    <option value={99.5}>99.5% (Enterprise Business Hours)</option>
                    <option value={99.0}>99.0% (General Commercial SLA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Actual Outage / Downtime (Hours in Month)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={calcDowntimeHours}
                    onChange={e => setCalcDowntimeHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                <strong>Statutory Note (Sec. 74 Indian Contract Act 1872):</strong> Service credits must reflect genuine pre-estimated losses. In Indian courts (<em>Maula Bux v. Union of India</em>), excessive uncapped penalties without proof of loss risk being set aside as punitive forfeitures. A 15%–25% monthly billing cap is standard industry practice.
              </div>
            </div>

            {/* Result Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Calculated Remedy
                </span>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-amber-400 tabular-nums font-mono">
                    ₹{calculatedCreditAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Service Credit ({calculatedCreditPct}% of billing)
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Permitted Downtime:</span>
                    <span className="font-mono text-white">{allowedDowntimeHours.toFixed(2)} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Excess Downtime:</span>
                    <span className="font-mono text-rose-400">{excessDowntimeHours.toFixed(2)} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Availability:</span>
                    <span className="font-mono text-amber-300">{actualUptimePct}%</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `Service Credit Calculation:\nMonthly Billing: ₹${calcMonthlyFee.toLocaleString('en-IN')}\nTarget Uptime: ${calcUptimeTarget}%\nActual Downtime: ${calcDowntimeHours} hrs\nCredit Percentage: ${calculatedCreditPct}%\nPayable Credit: ₹${calculatedCreditAmount.toLocaleString('en-IN')}`,
                    'calc'
                  )
                }
                className="mt-6 w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2.5 rounded-xl border border-slate-700 transition-colors"
              >
                {copiedKey === 'calc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'calc' ? 'Copied Calculation!' : 'Copy Calculation Note'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: 1-Click Instant Downloads ─────────────────────────────── */}
      {activeTab === 'instant' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Select Pre-Configured Industry SLA Template
              </h3>
              <p className="text-xs text-slate-500">
                Drafted under the Indian Contract Act 1872 & DPDP Act 2023. Ready for immediate legal execution.
              </p>
            </div>
            <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-1 rounded-full">
              Updated September 2026
            </span>
          </div>

          {/* Preset Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(SLA_PRESETS) as SlaType[]).map(key => {
              const p = SLA_PRESETS[key]
              const isSelected = selectedPreset === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetSelect(key)}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {presetIcons[key]}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {p.uptimeDefault}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-heading">
                      {p.shortLabel}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active Preset Action Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready-To-Sign Format</span>
              </div>
              <h4 className="text-xl font-extrabold font-heading text-white">
                {SLA_PRESETS[selectedPreset].title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Includes Uptime Target ({SLA_PRESETS[selectedPreset].uptimeDefault}), 4-tier Severity Response Matrix,
                Service Credit calculation under Section 74 Indian Contract Act, and mandatory DPDP Act 2023 data processing safeguards.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => handleInstantDownload(selectedPreset, 'docx')}
                disabled={downloadingFormat !== null}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingFormat === `${selectedPreset}-docx` ? 'Generating...' : 'Download Word (.docx)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleInstantDownload(selectedPreset, 'pdf')}
                disabled={downloadingFormat !== null}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-50"
              >
                <FileText className="w-4 h-4 text-rose-400" />
                <span>{downloadingFormat === `${selectedPreset}-pdf` ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── GEMINI AI LEGAL DRAFTER MODAL / DRAWER ─────────────────────── */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 text-white shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
                    Gemini AI Legal Drafter & SLA Assistant
                  </h3>
                  <p className="text-xs text-slate-500">
                    Indian Contract Act 1872 • DPDP Act 2023 • CERT-In Cybersecurity Rules
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Preset Clauses & Actions
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_AI_PROMPTS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiPrompt(chip.prompt)
                      setAiAction(chip.action)
                      setAiTone(chip.tone)
                      if (chip.language) setAiLanguage(chip.language)
                      handleRunAiAssist(chip.prompt, chip.action, chip.tone, chip.language || 'en')
                    }}
                    disabled={isAiLoading}
                    className="text-left text-xs bg-slate-50 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl transition-all font-medium disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Describe What You Need (Clauses, Uptime, Penalty, Tone, or Language)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. We provide AI APIs to banks in Mumbai. Add 99.95% uptime, 30m Sev-1 response, RBI IT framework compliance, right to quarterly audit, and a Hindi summary for promoters."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Configuration Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Drafter Action</label>
                <select
                  value={aiAction}
                  onChange={e => setAiAction(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="draft_from_prompt">Full SLA Draft & Tune</option>
                  <option value="add_clause">Add Specific Legal Clause</option>
                  <option value="rephrase">Rephrase / Tighten Terms</option>
                  <option value="change_language">Hindi Summary / Multilingual</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Legal Stance (Tone)</label>
                <select
                  value={aiTone}
                  onChange={e => setAiTone(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="balanced">Balanced Commercial</option>
                  <option value="client_favourable">Customer Favourable (Strict)</option>
                  <option value="vendor_favourable">Vendor Protective (Safe)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Language Output</label>
                <select
                  value={aiLanguage}
                  onChange={e => setAiLanguage(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="en">English (Statutory Legal)</option>
                  <option value="bilingual">Bilingual (English + Hindi)</option>
                  <option value="hi">Hindi Primary Terminology</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {aiError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-400">
                Powered by Gemini 2.5 • Instant Live Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  disabled={isAiLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRunAiAssist()}
                  disabled={isAiLoading || aiPrompt.trim().length < 3}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAiLoading ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-200" />
                      <span>Drafting Compliant Clauses...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate & Apply to SLA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
