'use client'

import { useState, useMemo } from 'react'
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
} from 'lucide-react'
import {
  MouFormData,
  DEFAULT_SAMPLE_MOU_DATA,
  MouType,
  MOU_TYPE_PRESETS,
} from '@/lib/doc-generator/mou-generator'
import Link from 'next/link'

const QUICK_AI_PROMPTS = [
  'B2B SaaS software company partnering with a regional distributor to sell ERP systems on 25% commission.',
  'Two doctors opening a joint diagnostic clinic in Pune: one brings premises and equipment, one brings medical staff.',
  'University incubator signing an MoU with an EV tech startup for free lab space in exchange for student internships.',
  'E-commerce brand hiring an exclusive third-party warehouse logistics provider with 48-hour delivery SLAs.',
]

export default function MouClient() {
  const [formData, setFormData] = useState<MouFormData>(DEFAULT_SAMPLE_MOU_DATA)
  const [activeTab, setActiveTab] = useState<'mou' | 'nda' | 'matrix' | 'roadmap'>('mou')
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // AI Assist State
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Switch preset
  const handleSelectPreset = (type: MouType) => {
    const preset = MOU_TYPE_PRESETS[type]
    setFormData(prev => ({
      ...prev,
      mouType: type,
      title: preset.title,
      collaborationPurpose: preset.defaultPurpose,
      scopeOfWork: preset.scope,
      obligationsPartyA: [...preset.obligationsA],
      obligationsPartyB: [...preset.obligationsB],
      financialTermsDescription: preset.financials,
      intellectualPropertyTerms: preset.ipTerms,
      exclusivityTerms: preset.exclusivity,
    }))
  }

  // AI generation handler
  const handleAiGenerate = async () => {
    if (!aiPrompt || aiPrompt.trim().length < 5) {
      alert('Please describe your collaboration purpose in at least a few words.')
      return
    }

    setIsAiGenerating(true)
    setAiError(null)

    try {
      const response = await fetch('/api/documents/mou-ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purposePrompt: aiPrompt, currentData: formData }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to process AI assist request')
      }

      const { data } = await response.json()

      setFormData(prev => ({
        ...prev,
        mouType: data.mouType || prev.mouType,
        title: data.title || prev.title,
        collaborationPurpose: data.collaborationPurpose || prev.collaborationPurpose,
        scopeOfWork: data.scopeOfWork || prev.scopeOfWork,
        partyA: {
          ...prev.partyA,
          name: data.suggestedPartyAName || prev.partyA.name,
        },
        partyB: {
          ...prev.partyB,
          name: data.suggestedPartyBName || prev.partyB.name,
        },
        obligationsPartyA: Array.isArray(data.obligationsPartyA)
          ? data.obligationsPartyA
          : prev.obligationsPartyA,
        obligationsPartyB: Array.isArray(data.obligationsPartyB)
          ? data.obligationsPartyB
          : prev.obligationsPartyB,
        financialTermsDescription:
          data.financialTermsDescription || prev.financialTermsDescription,
        intellectualPropertyTerms:
          data.intellectualPropertyTerms || prev.intellectualPropertyTerms,
        exclusivityTerms: data.exclusivityTerms || prev.exclusivityTerms,
        validityDuration: data.validityDuration || prev.validityDuration,
      }))

      alert('AI has successfully populated custom clauses based on your purpose!')
    } catch (err: any) {
      console.error(err)
      setAiError(err.message || 'AI generation failed. Please try again.')
    } finally {
      setIsAiGenerating(false)
    }
  }

  const handleInputChange = (field: keyof MouFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePartyChange = (party: 'partyA' | 'partyB', field: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      [party]: { ...prev[party], [field]: val },
    }))
  }

  const handleAddObligation = (party: 'A' | 'B') => {
    if (party === 'A') {
      setFormData(prev => ({
        ...prev,
        obligationsPartyA: [...prev.obligationsPartyA, 'New agreed responsibility for Party A'],
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        obligationsPartyB: [...prev.obligationsPartyB, 'New agreed responsibility for Party B'],
      }))
    }
  }

  const handleRemoveObligation = (party: 'A' | 'B', index: number) => {
    if (party === 'A') {
      setFormData(prev => ({
        ...prev,
        obligationsPartyA: prev.obligationsPartyA.filter((_, i) => i !== index),
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        obligationsPartyB: prev.obligationsPartyB.filter((_, i) => i !== index),
      }))
    }
  }

  const handleObligationTextChange = (party: 'A' | 'B', index: number, text: string) => {
    if (party === 'A') {
      const updated = [...formData.obligationsPartyA]
      updated[index] = text
      setFormData(prev => ({ ...prev, obligationsPartyA: updated }))
    } else {
      const updated = [...formData.obligationsPartyB]
      updated[index] = text
      setFormData(prev => ({ ...prev, obligationsPartyB: updated }))
    }
  }

  const handleDownload = async (doc: 'mou' | 'nda', format: 'docx' | 'pdf') => {
    const key = `${doc}-${format}`
    setIsDownloading(key)
    try {
      const response = await fetch('/api/documents/mou-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, doc, format }),
      })
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = (formData.partyA.name || 'MoU')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30)
      a.download = `${doc.toUpperCase()}_Agreement_${safeName}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error(err)
      alert('Failed to generate document. Please check form inputs.')
    } finally {
      setIsDownloading(null)
    }
  }

  // Plain text for clipboard
  const fullDocumentText = useMemo(() => {
    const obA = formData.obligationsPartyA.map((o, i) => `${i + 1}. ${o}`).join('\n')
    const obB = formData.obligationsPartyB.map((o, i) => `${i + 1}. ${o}`).join('\n')
    const recitals = formData.backgroundRecitals
      .map((r, i) => `${String.fromCharCode(65 + i)}. ${r}`)
      .join('\n')

    return `${formData.title.toUpperCase()}\n(Under the Indian Contract Act, 1872)\n\nExecuted on ${
      formData.effectiveDate
    } at ${formData.executionCity}, ${formData.executionState}\n\nBY AND BETWEEN:\nParty A: ${
      formData.partyA.name
    } (${formData.partyA.identifier})\nAddress: ${formData.partyA.registeredAddress}\nRepresented by: ${
      formData.partyA.signatoryName
    }, ${formData.partyA.signatoryDesignation}\n\nAND\n\nParty B: ${formData.partyB.name} (${
      formData.partyB.identifier
    })\nAddress: ${formData.partyB.registeredAddress}\nRepresented by: ${
      formData.partyB.signatoryName
    }, ${formData.partyB.signatoryDesignation}\n\nRECITALS:\n${recitals}\n\n1. PURPOSE & SCOPE:\nPurpose: ${
      formData.collaborationPurpose
    }\nScope: ${formData.scopeOfWork}\n\n2. RESPONSIBILITIES OF PARTY A:\n${obA}\n\n3. RESPONSIBILITIES OF PARTY B:\n${obB}\n\n4. FINANCIAL TERMS:\n${
      formData.financialTermsDescription
    }\n\n5. TERM & VALIDITY:\nValid for ${formData.validityDuration}. Definitive Agreement target: ${
      formData.targetDefinitiveAgreementDate
    }\n\n6. BINDING COVENANTS:\nConfidentiality: ${formData.confidentialityTerms}\nIP Rights: ${
      formData.intellectualPropertyTerms
    }\nExclusivity: ${formData.exclusivityTerms}\nArbitration Seat: ${
      formData.arbitrationSeat
    }\nGoverning Law: Laws of India / Courts of ${formData.arbitrationSeat}, ${
      formData.governingLawState
    }\n\nEXECUTED BY AUTHORIZED SIGNATORIES`
  }, [formData])

  const handleCopy = () => {
    navigator.clipboard.writeText(fullDocumentText)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-12">
      {/* Workstation Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Indian Contract Act, 1872
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI Purpose Assisted
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Commercial Drafting Standard
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              MoU (Memorandum of Understanding) Legal Workstation
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Create, customize, and export institutionally vetted MoUs for commercial partnerships, joint ventures, vendor engagements, academic research, and startups in Word (.docx) and PDF.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => handleDownload('mou', 'docx')}
              disabled={!!isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading === 'mou-docx' ? 'Generating Word...' : 'Download Word (.docx)'}
            </button>
            <button
              onClick={() => handleDownload('mou', 'pdf')}
              disabled={!!isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading === 'mou-pdf' ? 'Generating PDF...' : 'Download PDF (.pdf)'}
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
              title="Copy text to clipboard"
            >
              <Copy className="w-4 h-4" />
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
              title="Print document"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* 6 MoU Purpose Presets */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
            Select MoU Collaboration Type / Pre-Configuration:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(Object.keys(MOU_TYPE_PRESETS) as MouType[]).map(typeKey => {
              const p = MOU_TYPE_PRESETS[typeKey]
              const isSelected = formData.mouType === typeKey
              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => handleSelectPreset(typeKey)}
                  className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold block">{p.shortBadge}</span>
                  <span className="text-[10px] text-slate-400 truncate mt-1">
                    {typeKey === 'business_partnership' && 'Commercial Alliance'}
                    {typeKey === 'joint_venture' && 'SPV & Equity JV'}
                    {typeKey === 'vendor_services' && 'Procurement & SLA'}
                    {typeKey === 'research_tech' && 'IP & University'}
                    {typeKey === 'startup_founders' && 'Vesting & Equity'}
                    {typeKey === 'inter_company' && 'Group Services'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* AI Purpose Assistant Highlight Box */}
        <div className="mt-5 p-4 rounded-xl bg-slate-800/70 border border-indigo-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                AI Custom Purpose Assistant (Powered by Gemini)
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              Free AI Generation
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Need an MoU for a unique arrangement? Describe your collaboration in plain English below. Our AI lawyer will tailor the entire document, specific obligations, and legal clauses.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. AI SaaS company partnering with a Mumbai logistics firm for warehouse automation, 50-50 revenue split, 1-year pilot..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isAiGenerating}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs shadow transition disabled:opacity-50 whitespace-nowrap flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAiGenerating ? 'Drafting with AI...' : 'Draft with AI ✨'}
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-400">
            <span className="shrink-0 font-medium">Try:</span>
            {QUICK_AI_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAiPrompt(qp)}
                className="shrink-0 px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-slate-300 truncate max-w-xs transition text-left"
              >
                {qp}
              </button>
            ))}
          </div>

          {aiError && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800">
              {aiError}
            </p>
          )}
        </div>

        {/* 4-Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-b border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('mou')}
            className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'mou'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Full MoU Agreement (Main)
          </button>
          <button
            onClick={() => setActiveTab('nda')}
            className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'nda'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Lock className="w-4 h-4" />
            2. Confidentiality (NDA) Addendum
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-4 h-4" />
            3. Binding Matrix & Stamp Guide
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            4. Roadmap to Definitive Agreement
          </button>
        </div>
      </div>

      {/* Main Workstation Body: Left Customizer / Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[750px]">
        {/* LEFT COLUMN: Customizer Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 space-y-6 overflow-y-auto max-h-[850px]">
          {/* Document Title & Date */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Document Particulars & Jurisdiction
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                MoU Formal Document Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Effective Date
                </label>
                <input
                  type="text"
                  value={formData.effectiveDate}
                  onChange={e => handleInputChange('effectiveDate', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.executionCity}
                  onChange={e => handleInputChange('executionCity', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.executionState}
                  onChange={e => handleInputChange('executionState', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Party A Particulars */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center justify-between">
              <span>Party A (First Party)</span>
              <span className="text-[10px] text-slate-400">Initiator</span>
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Company / Entity Name
              </label>
              <input
                type="text"
                value={formData.partyA.name}
                onChange={e => handlePartyChange('partyA', 'name', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Entity Classification
                </label>
                <input
                  type="text"
                  value={formData.partyA.entityType}
                  onChange={e => handlePartyChange('partyA', 'entityType', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  CIN / Registration / PAN
                </label>
                <input
                  type="text"
                  value={formData.partyA.identifier}
                  onChange={e => handlePartyChange('partyA', 'identifier', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Signatory Name
                </label>
                <input
                  type="text"
                  value={formData.partyA.signatoryName}
                  onChange={e => handlePartyChange('partyA', 'signatoryName', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.partyA.signatoryDesignation}
                  onChange={e => handlePartyChange('partyA', 'signatoryDesignation', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Registered Office Address
              </label>
              <textarea
                rows={2}
                value={formData.partyA.registeredAddress}
                onChange={e => handlePartyChange('partyA', 'registeredAddress', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Party B Particulars */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
              <span>Party B (Second Party)</span>
              <span className="text-[10px] text-slate-400">Collaborator</span>
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Company / Entity Name
              </label>
              <input
                type="text"
                value={formData.partyB.name}
                onChange={e => handlePartyChange('partyB', 'name', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Entity Classification
                </label>
                <input
                  type="text"
                  value={formData.partyB.entityType}
                  onChange={e => handlePartyChange('partyB', 'entityType', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  CIN / Registration / PAN
                </label>
                <input
                  type="text"
                  value={formData.partyB.identifier}
                  onChange={e => handlePartyChange('partyB', 'identifier', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Signatory Name
                </label>
                <input
                  type="text"
                  value={formData.partyB.signatoryName}
                  onChange={e => handlePartyChange('partyB', 'signatoryName', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.partyB.signatoryDesignation}
                  onChange={e => handlePartyChange('partyB', 'signatoryDesignation', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Registered Office Address
              </label>
              <textarea
                rows={2}
                value={formData.partyB.registeredAddress}
                onChange={e => handlePartyChange('partyB', 'registeredAddress', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Scope & Commercial Terms */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Collaboration Purpose & Scope
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Purpose Statement
              </label>
              <textarea
                rows={2}
                value={formData.collaborationPurpose}
                onChange={e => handleInputChange('collaborationPurpose', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Detailed Scope of Collaboration
              </label>
              <textarea
                rows={2}
                value={formData.scopeOfWork}
                onChange={e => handleInputChange('scopeOfWork', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Financial Terms / Cost Allocation
              </label>
              <textarea
                rows={2}
                value={formData.financialTermsDescription}
                onChange={e => handleInputChange('financialTermsDescription', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Responsibilities Builder: Party A */}
          <div className="space-y-2.5 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Roles of Party A ({formData.obligationsPartyA.length})
              </h4>
              <button
                type="button"
                onClick={() => handleAddObligation('A')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Role
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {formData.obligationsPartyA.map((ob, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-indigo-600 mt-1">{idx + 1}.</span>
                  <input
                    type="text"
                    value={ob}
                    onChange={e => handleObligationTextChange('A', idx, e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  {formData.obligationsPartyA.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObligation('A', idx)}
                      className="text-rose-500 hover:text-rose-700 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities Builder: Party B */}
          <div className="space-y-2.5 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Roles of Party B ({formData.obligationsPartyB.length})
              </h4>
              <button
                type="button"
                onClick={() => handleAddObligation('B')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Role
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {formData.obligationsPartyB.map((ob, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-blue-600 mt-1">{idx + 1}.</span>
                  <input
                    type="text"
                    value={ob}
                    onChange={e => handleObligationTextChange('B', idx, e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  {formData.obligationsPartyB.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObligation('B', idx)}
                      className="text-rose-500 hover:text-rose-700 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dispute Resolution & Jurisdiction */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Arbitration Seat & Governing Law</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Binding Clause
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Seat of Arbitration
                </label>
                <input
                  type="text"
                  value={formData.arbitrationSeat}
                  onChange={e => handleInputChange('arbitrationSeat', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Governing State Courts
                </label>
                <input
                  type="text"
                  value={formData.governingLawState}
                  onChange={e => handleInputChange('governingLawState', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Specimen View (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-950 flex flex-col justify-between overflow-y-auto max-h-[850px]">
          {activeTab === 'matrix' ? (
            /* Tab 3: Binding vs Non-Binding Matrix & Stamp Guide */
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2 mb-1">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  Statutory Clause Enforceability Matrix & State Stamp Guide
                </h3>
                <p className="text-xs text-indigo-800 dark:text-indigo-300">
                  Under the Indian Contract Act, 1872, an MoU is a hybrid instrument: commercial expectations remain non-binding, while protective covenants are legally binding and enforceable in court.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Clause in MoU</th>
                      <th className="p-3">Legal Status</th>
                      <th className="p-3">Enforceability under Indian Law</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold">Recitals & Commercial Purpose</td>
                      <td className="p-3 text-amber-600 font-medium">Non-Binding Intent</td>
                      <td className="p-3">Expresses goodwill. Cannot be sued for specific performance.</td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                      <td className="p-3 font-semibold">Roles & Responsibilities</td>
                      <td className="p-3 text-amber-600 font-medium">Non-Binding Target</td>
                      <td className="p-3">Operational targets. Subject to definitive contract execution.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Confidentiality & Non-Disclosure</td>
                      <td className="p-3 text-emerald-600 font-bold">100% Binding</td>
                      <td className="p-3">Breach warrants immediate injunctive relief & monetary damages.</td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                      <td className="p-3 font-semibold">Intellectual Property Ownership</td>
                      <td className="p-3 text-emerald-600 font-bold">100% Binding</td>
                      <td className="p-3">Protects pre-existing IP. Enforceable under Copyright/Patent Acts.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Exclusivity / Lock-In Period</td>
                      <td className="p-3 text-emerald-600 font-bold">100% Binding</td>
                      <td className="p-3">Prevents party from shopping deal with competitors during term.</td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                      <td className="p-3 font-semibold">Arbitration & Dispute Seat</td>
                      <td className="p-3 text-emerald-600 font-bold">100% Binding</td>
                      <td className="p-3">Severable arbitration agreement under Section 7 of Arbitration Act.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Governing Law & Jurisdiction</td>
                      <td className="p-3 text-emerald-600 font-bold">100% Binding</td>
                      <td className="p-3">Determines which State High Court holds supervisory powers.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* State Stamp Duty Guide */}
              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-600" />
                  Does an MoU Require Stamp Duty in India?
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  If an MoU is purely an expression of mutual intent with NO binding commercial liabilities, it can be printed on company letterhead with nominal stamp paper (₹100 to ₹500 under Article 5 &apos;Agreement&apos;). However, if the MoU contains binding commercial commitments, equity transfer covenants, or penalty clauses, state revenue authorities may treat it as a full-fledged contract and levy ad-valorem stamp duty.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold block text-slate-900 dark:text-white">Maharashtra</span>
                    <span className="text-slate-500">Art. 5(h): ₹500 stamp</span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold block text-slate-900 dark:text-white">Delhi (NCT)</span>
                    <span className="text-slate-500">Art. 5: ₹100 non-judicial</span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold block text-slate-900 dark:text-white">Karnataka</span>
                    <span className="text-slate-500">Art. 5: ₹200 to ₹500</span>
                  </div>
                  <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold block text-slate-900 dark:text-white">Tamil Nadu</span>
                    <span className="text-slate-500">Art. 5: ₹100 stamp</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'roadmap' ? (
            /* Tab 4: Roadmap to Definitive Agreement (Fixing the content bug!) */
            <div className="space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Statutory Execution & Conversion Roadmap (MoU to Final Contract)
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Follow the authentic commercial contract transition steps. (Note: An MoU does NOT require Minute Book filings or MCA e-Forms unless it is an internal board-mandated transaction).
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Review & Reconcile Commercial Alignment
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                      Verify that all numbers, roles, milestone delivery dates, and entity identifiers are mutually accepted by both commercial and technical leads.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Print on State Non-Judicial Stamp Paper or Company Letterhead
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                      Execute on appropriate state stamp paper (typically ₹100 to ₹500) if binding confidentiality or exclusivity clauses are activated, or print on official corporate letterhead.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Signatures by Authorized Representatives & 2 Witnesses
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                      Both Parties sign in duplicate with corporate designation. Attestation by two independent witnesses adds significant evidentiary value in case of contract disputes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Exchange Original Counterparts & Commence Pilot Work
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                      Each Party retains one original signed counterpart. Trigger pre-sales integration, data exchange, and feasibility assessments within the agreed timeline.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold shrink-0 text-xs">
                    5
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Conversion into Definitive Agreement (Within 90 Days)
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                      Upon successful evaluation, formalize commercial terms under a legally binding Definitive Agreement (Joint Venture Agreement, Master Service Agreement, or License Contract).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'nda' ? (
            /* Tab 2: NDA Addendum Preview */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    Non-Disclosure & Confidentiality Addendum
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Standalone enforceable schedule governing trade secrets, IP, and proprietary data.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload('nda', 'docx')}
                    className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Word (.docx)
                  </button>
                  <button
                    onClick={() => handleDownload('nda', 'pdf')}
                    className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
                  >
                    PDF (.pdf)
                  </button>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 rounded-xl border border-slate-200/90 dark:border-slate-800 font-serif text-slate-900 dark:text-slate-100 shadow-inner text-xs sm:text-sm leading-relaxed space-y-4">
                <div className="text-center space-y-1 pb-4 border-b border-slate-300 dark:border-slate-700">
                  <h3 className="text-base font-bold uppercase underline">
                    NON-DISCLOSURE & CONFIDENTIALITY UNDERTAKING
                  </h3>
                  <p className="text-xs italic text-slate-600 dark:text-slate-400">
                    (Annexure forming an integral part of MoU dated {formData.effectiveDate})
                  </p>
                </div>

                <p className="text-justify pt-2">
                  THIS NON-DISCLOSURE UNDERTAKING is entered into between{' '}
                  <strong>{formData.partyA.name}</strong> and{' '}
                  <strong>{formData.partyB.name}</strong> in furtherance of evaluating their mutual collaboration.
                </p>

                <div className="space-y-3 text-justify">
                  <p>
                    <strong>1. Confidential Information:</strong> Includes all software source code, customer accounts, financial matrices, pricing structures, trade secrets, and technical know-how disclosed by either Party.
                  </p>
                  <p>
                    <strong>2. Standard of Care:</strong> The Receiving Party shall protect disclosed data with at least reasonable care and shall not disclose or exploit such information for any third-party purpose.
                  </p>
                  <p>
                    <strong>3. Survival:</strong> The confidentiality obligations herein shall survive for 3 (three) years following expiration or termination of the MoU.
                  </p>
                  <p>
                    <strong>4. Equitable Relief:</strong> Parties agree monetary compensation is inadequate for breach, and injunctive relief may be obtained in competent courts.
                  </p>
                </div>

                <div className="pt-6 flex justify-between items-end">
                  <div>
                    <p className="font-bold">For {formData.partyA.name}</p>
                    <div className="h-8"></div>
                    <p className="text-xs">({formData.partyA.signatoryName})</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">For {formData.partyB.name}</p>
                    <div className="h-8"></div>
                    <p className="text-xs">({formData.partyB.signatoryName})</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 1: Full MoU Agreement Live Canvas */
            <div className="space-y-6">
              {/* Document Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    Live Draft Preview: {formData.title}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Auto-updates in real time as you tweak inputs or trigger AI assistance.
                  </p>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Ready to Export
                </span>
              </div>

              {/* Rendered Legal Document Paper */}
              <div className="bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 rounded-xl border border-slate-200/90 dark:border-slate-800 font-serif text-slate-900 dark:text-slate-100 shadow-inner text-xs sm:text-sm leading-relaxed space-y-4">
                <div className="text-center space-y-1 pb-4 border-b border-slate-300 dark:border-slate-700">
                  <h3 className="text-base sm:text-lg font-bold tracking-wide uppercase underline">
                    {formData.title}
                  </h3>
                  <p className="text-xs italic text-slate-600 dark:text-slate-400">
                    (Executed under the Indian Contract Act, 1872 • Commercial Collaboration Framework)
                  </p>
                </div>

                <p className="text-justify pt-2">
                  THIS MEMORANDUM OF UNDERSTANDING (&quot;MoU&quot;) is executed on this{' '}
                  <strong>{formData.effectiveDate}</strong> at <strong>{formData.executionCity}</strong>, State of{' '}
                  <strong>{formData.executionState}</strong> (&quot;Effective Date&quot;);
                </p>

                <div className="text-center font-bold py-1">BY AND BETWEEN</div>

                <p className="text-justify">
                  <strong>{formData.partyA.name.toUpperCase()}</strong>, a {formData.partyA.entityType}, having its registered office at {formData.partyA.registeredAddress} ({formData.partyA.identifier}), represented by its authorized signatory, <strong>{formData.partyA.signatoryName}</strong>, {formData.partyA.signatoryDesignation} (hereinafter referred to as &quot;PARTY A&quot;) of the FIRST PART;
                </p>

                <div className="text-center font-bold py-1">AND</div>

                <p className="text-justify">
                  <strong>{formData.partyB.name.toUpperCase()}</strong>, a {formData.partyB.entityType}, having its registered office at {formData.partyB.registeredAddress} ({formData.partyB.identifier}), represented by its authorized signatory, <strong>{formData.partyB.signatoryName}</strong>, {formData.partyB.signatoryDesignation} (hereinafter referred to as &quot;PARTY B&quot;) of the SECOND PART.
                </p>

                <div className="font-bold pt-2">WHEREAS:</div>
                <div className="space-y-1.5 text-justify">
                  {formData.backgroundRecitals.map((r, i) => (
                    <p key={i}>
                      <strong>{String.fromCharCode(65 + i)}.</strong> {r}
                    </p>
                  ))}
                </div>

                <div className="font-bold pt-2">
                  NOW THIS MEMORANDUM WITNESSETH AND RECORDS AS FOLLOWS:
                </div>

                <div className="space-y-3 text-justify">
                  <div>
                    <h5 className="font-bold">1. PURPOSE & SCOPE OF WORK</h5>
                    <p className="mt-1">
                      <strong>1.1 Purpose:</strong> {formData.collaborationPurpose}
                    </p>
                    <p className="mt-1">
                      <strong>1.2 Scope:</strong> {formData.scopeOfWork}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold">2. ROLES & RESPONSIBILITIES OF PARTY A ({formData.partyA.name})</h5>
                    <div className="pl-4 space-y-1 mt-1 font-sans text-xs">
                      {formData.obligationsPartyA.map((o, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="font-bold">{idx + 1}.</span>
                          <span>{o}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold">3. ROLES & RESPONSIBILITIES OF PARTY B ({formData.partyB.name})</h5>
                    <div className="pl-4 space-y-1 mt-1 font-sans text-xs">
                      {formData.obligationsPartyB.map((o, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="font-bold">{idx + 1}.</span>
                          <span>{o}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold">4. FINANCIAL TERMS & EXPENSES</h5>
                    <p className="mt-1">{formData.financialTermsDescription}</p>
                  </div>

                  <div>
                    <h5 className="font-bold">5. TERM & ROADMAP TO DEFINITIVE AGREEMENT</h5>
                    <p className="mt-1">
                      This MoU is valid for <strong>{formData.validityDuration}</strong>. The Parties intend to execute a comprehensive Definitive Agreement {formData.targetDefinitiveAgreementDate}, which shall supersede this instrument.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold">6. LEGAL EFFECT & BINDING NATURE</h5>
                    <p className="mt-1">
                      Except for Clauses 7 (Confidentiality), 8 (Intellectual Property), 9 (Arbitration), and 10 (Governing Law) which constitute legally binding obligations under the Indian Contract Act, 1872, this MoU is an expression of commercial intent only.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold">7. CONFIDENTIALITY (BINDING)</h5>
                    <p className="mt-1">{formData.confidentialityTerms}</p>
                  </div>

                  <div>
                    <h5 className="font-bold">8. INTELLECTUAL PROPERTY RIGHTS (BINDING)</h5>
                    <p className="mt-1">{formData.intellectualPropertyTerms}</p>
                  </div>

                  <div>
                    <h5 className="font-bold">9. ARBITRATION & DISPUTE RESOLUTION (BINDING)</h5>
                    <p className="mt-1">
                      Disputes shall be resolved by a sole arbitrator under the Arbitration and Conciliation Act, 1996. Seat of arbitration: <strong>{formData.arbitrationSeat}</strong>, India.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold">10. GOVERNING LAW & JURISDICTION (BINDING)</h5>
                    <p className="mt-1">
                      Governed by laws of India. Courts at <strong>{formData.arbitrationSeat}</strong>, State of <strong>{formData.governingLawState}</strong> shall have exclusive jurisdiction.
                    </p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-300 dark:border-slate-700">
                  <div>
                    <p className="font-bold">FOR {formData.partyA.name.toUpperCase()}</p>
                    <div className="h-10"></div>
                    <p className="font-bold">({formData.partyA.signatoryName})</p>
                    <p className="text-xs text-slate-500">{formData.partyA.signatoryDesignation}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">FOR {formData.partyB.name.toUpperCase()}</p>
                    <div className="h-10"></div>
                    <p className="font-bold">({formData.partyB.signatoryName})</p>
                    <p className="text-xs text-slate-500">{formData.partyB.signatoryDesignation}</p>
                  </div>
                </div>

                <div className="pt-4 text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-bold text-slate-800 dark:text-slate-200">WITNESSES:</p>
                  <p>1. {formData.witness1Name} - {formData.witness1Address}</p>
                  <p>2. {formData.witness2Name} - {formData.witness2Address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Section 10 Indian Contract Act & Arbitration Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('mou', 'docx')}
                disabled={!!isDownloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Word (.docx)
              </button>
              <button
                onClick={() => handleDownload('mou', 'pdf')}
                disabled={!!isDownloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                PDF (.pdf)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
