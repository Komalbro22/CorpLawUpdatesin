'use client'

import { useState, useMemo } from 'react'
import {
  Download,
  FileText,
  Copy,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  MapPin,
  Building2,
  User,
  ExternalLink,
  Lock,
  ArrowRight,
  Gavel,
  Check,
} from 'lucide-react'
import {
  NdaFormData,
  DEFAULT_SAMPLE_NDA_DATA,
  NdaType,
  NdaRelationshipContext,
  generateNdaMarkdown,
} from '@/lib/doc-generator/nda-generator'
import LegalDocRenderer, { cleanMarkdownForClipboard } from '@/components/documents/LegalDocRenderer'

const INDIAN_STATES = [
  'Maharashtra',
  'Delhi (NCT)',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'Haryana',
  'Uttar Pradesh',
  'West Bengal',
  'Rajasthan',
  'Madhya Pradesh',
  'Kerala',
  'Punjab',
]

export default function NdaClient() {
  const [formData, setFormData] = useState<NdaFormData>(DEFAULT_SAMPLE_NDA_DATA)
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form')
  const [isDownloading, setIsDownloading] = useState<'docx' | 'pdf' | null>(null)
  const [downloadError, setDownloadError] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)

  // Live markdown text for preview
  const markdownText = useMemo(() => {
    return generateNdaMarkdown(formData)
  }, [formData])

  const updateField = <K extends keyof NdaFormData>(key: K, val: NdaFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  // Handle Download Trigger
  const handleDownload = async (format: 'docx' | 'pdf') => {
    setIsDownloading(format)
    setDownloadError('')
    try {
      const res = await fetch('/api/documents/nda-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          ...formData,
        }),
      })

      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`)
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cleanName = (formData.disclosingPartyName || 'NDA').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25)
      a.download = `NDA_${formData.ndaType}_${cleanName}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error(err)
      setDownloadError('Failed to generate document. Please use Copy Text or Print as fallback.')
    } finally {
      setIsDownloading(null)
    }
  }

  // Copy Clean Document Text (Strips raw markdown syntax tokens)
  const handleCopy = async () => {
    try {
      const cleanText = cleanMarkdownForClipboard(markdownText)
      await navigator.clipboard.writeText(cleanText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      setDownloadError('Could not copy to clipboard.')
    }
  }

  // Print Document Window using rendered legal styles
  const handlePrint = () => {
    const previewEl = document.getElementById('nda-doc-preview')
    if (!previewEl) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Non-Disclosure Agreement - ${formData.disclosingPartyName}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; margin: 40px; color: #111; }
            h1 { font-size: 14pt; text-align: center; margin-bottom: 12px; font-weight: bold; text-transform: uppercase; }
            h2 { font-size: 12pt; text-align: center; margin: 12px 0 6px 0; font-weight: bold; text-transform: uppercase; }
            h3, h4 { font-size: 11pt; margin: 10px 0 4px 0; font-weight: bold; }
            p { margin: 6px 0; text-align: justify; }
            blockquote { margin: 6px 0; padding-left: 12px; border-left: 2px solid #555; font-style: italic; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 16px; font-size: 10pt; }
            th, td { border: 1px solid #777; padding: 8px 10px; text-align: left; vertical-align: top; }
            th { background-color: #f5f5f5; font-weight: bold; }
            hr { border: none; border-top: 1px solid #ccc; margin: 16px 0; }
            ul, ol { padding-left: 24px; margin: 6px 0; }
            li { text-align: justify; margin: 3px 0; }
          </style>
        </head>
        <body>
          ${previewEl.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Top Banner with Action Buttons */}
      <div className="bg-slate-900 px-4 py-4 sm:px-6 sm:py-5 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
              Interactive Legal Generator
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">Indian Contract Act, 1872 Compliant</span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-white">
            Customise Non-Disclosure Agreement (NDA) Draft
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={() => handleDownload('docx')}
            disabled={isDownloading === 'docx'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading === 'docx' ? 'Generating...' : 'Word (.docx)'}</span>
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={isDownloading === 'pdf'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-500 disabled:opacity-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading === 'pdf' ? 'Generating...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="bg-rose-50 border-b border-rose-200 p-3 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{downloadError}</span>
          </div>
          <button onClick={() => setDownloadError('')} className="text-rose-600 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Mobile Tab Toggle */}
      <div className="flex border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 lg:hidden">
        <button
          onClick={() => setActiveMobileTab('form')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
            activeMobileTab === 'form'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400'
          }`}
        >
          1. Edit Form Fields
        </button>
        <button
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center border-b-2 transition ${
            activeMobileTab === 'preview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-600 dark:text-slate-400'
          }`}
        >
          2. Live Document Preview
        </button>
      </div>

      {/* Main Grid: Form on Left / Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[750px]">
        {/* FORM PANEL (col 5) */}
        <div
          className={`lg:col-span-5 p-5 sm:p-6 overflow-y-auto max-h-[850px] border-r border-slate-200 dark:border-slate-800 ${
            activeMobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="space-y-5">
            {/* 1. Agreement Type & Context */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Agreement Type &amp; Context
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NDA Type
                  </label>
                  <select
                    value={formData.ndaType}
                    onChange={e => updateField('ndaType', e.target.value as NdaType)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="mutual">Mutual (Bilateral)</option>
                    <option value="unilateral">One-Way (Unilateral)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Relationship Context
                  </label>
                  <select
                    value={formData.relationshipContext}
                    onChange={e => updateField('relationshipContext', e.target.value as NdaRelationshipContext)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="business_discussion">Business Discussion</option>
                    <option value="employee">Employee</option>
                    <option value="contractor">Contractor / Consultant</option>
                    <option value="investor_pitch">Investor Pitch</option>
                    <option value="vendor">Vendor / Supplier</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Effective Date
                </label>
                <input
                  type="text"
                  value={formData.effectiveDate}
                  onChange={e => updateField('effectiveDate', e.target.value)}
                  placeholder="e.g. 15th October 2026"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* 2. Disclosing Party */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                {formData.ndaType === 'mutual' ? 'Party 1 (Disclosing / Receiving)' : 'Disclosing Party'}
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Entity / Full Legal Name
                </label>
                <input
                  type="text"
                  value={formData.disclosingPartyName}
                  onChange={e => updateField('disclosingPartyName', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Entity Type
                  </label>
                  <select
                    value={formData.disclosingPartyType}
                    onChange={e => updateField('disclosingPartyType', e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="company">Private / Public Ltd Company</option>
                    <option value="llp">LLP / Partnership</option>
                    <option value="individual">Individual / Proprietorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    CIN / LLPIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.disclosingPartyCin || ''}
                    onChange={e => updateField('disclosingPartyCin', e.target.value)}
                    placeholder="U72900MH2021PTC123456"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Registered / Principal Address
                </label>
                <textarea
                  rows={2}
                  value={formData.disclosingPartyAddress}
                  onChange={e => updateField('disclosingPartyAddress', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Signatory Name
                  </label>
                  <input
                    type="text"
                    value={formData.disclosingSignatoryName}
                    onChange={e => updateField('disclosingSignatoryName', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.disclosingSignatoryDesignation}
                    onChange={e => updateField('disclosingSignatoryDesignation', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. Receiving Party */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                {formData.ndaType === 'mutual' ? 'Party 2 (Receiving / Disclosing)' : 'Receiving Party'}
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Entity / Full Legal Name
                </label>
                <input
                  type="text"
                  value={formData.receivingPartyName}
                  onChange={e => updateField('receivingPartyName', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Entity Type
                  </label>
                  <select
                    value={formData.receivingPartyType}
                    onChange={e => updateField('receivingPartyType', e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="company">Private / Public Ltd Company</option>
                    <option value="llp">LLP / Partnership</option>
                    <option value="individual">Individual / Proprietorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    CIN / LLPIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.receivingPartyCin || ''}
                    onChange={e => updateField('receivingPartyCin', e.target.value)}
                    placeholder="U74999HR2022PTC654321"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Registered / Principal Address
                </label>
                <textarea
                  rows={2}
                  value={formData.receivingPartyAddress}
                  onChange={e => updateField('receivingPartyAddress', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Signatory Name
                  </label>
                  <input
                    type="text"
                    value={formData.receivingSignatoryName}
                    onChange={e => updateField('receivingSignatoryName', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.receivingSignatoryDesignation}
                    onChange={e => updateField('receivingSignatoryDesignation', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 4. Purpose of Disclosure */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                Purpose of Disclosure
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Authorized Purpose (Be Specific)
                </label>
                <textarea
                  rows={3}
                  value={formData.purposeOfDisclosure}
                  onChange={e => updateField('purposeOfDisclosure', e.target.value)}
                  placeholder="e.g. evaluating a potential software development engagement..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Tip: A specific purpose prevents legal claims that the NDA was an unlawful overbroad restraint.
                </p>
              </div>
            </div>

            {/* 5. Term, Governing Law & Dispute Resolution */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-blue-600" />
                Term, Jurisdiction &amp; Dispute Resolution
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confidentiality Period
                  </label>
                  <select
                    value={formData.confidentialityPeriod}
                    onChange={e => updateField('confidentialityPeriod', e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="2_years">2 Years</option>
                    <option value="3_years">3 Years (Standard)</option>
                    <option value="5_years">5 Years</option>
                    <option value="custom">Custom Period</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Governing State
                  </label>
                  <select
                    value={formData.governingState}
                    onChange={e => updateField('governingState', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Dispute Resolution Mode
                  </label>
                  <div className="flex items-center gap-4 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="disputeRes"
                        checked={formData.disputeResolution === 'arbitration'}
                        onChange={() => updateField('disputeResolution', 'arbitration')}
                        className="text-blue-600"
                      />
                      <span>Arbitration</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="disputeRes"
                        checked={formData.disputeResolution === 'courts'}
                        onChange={() => updateField('disputeResolution', 'courts')}
                        className="text-blue-600"
                      />
                      <span>Courts</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Seat / Court City
                  </label>
                  <input
                    type="text"
                    value={formData.arbitrationCity || ''}
                    onChange={e => updateField('arbitrationCity', e.target.value)}
                    placeholder="e.g. Mumbai, New Delhi"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.includeNonSolicit || false}
                    onChange={e => updateField('includeNonSolicit', e.target.checked)}
                    className="rounded-sm text-blue-600"
                  />
                  <span>Include 12-Month Non-Solicitation Covenant</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW PANEL (col 7) */}
        <div
          className={`lg:col-span-7 bg-slate-50 dark:bg-slate-950 p-5 sm:p-8 overflow-y-auto max-h-[850px] font-serif ${
            activeMobileTab === 'form' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed space-y-4">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800 text-center">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Statutory Draft Preview &bull; Indian Contract Act, 1872
              </span>
            </div>

            <div className="pt-2">
              <LegalDocRenderer id="nda-doc-preview" content={markdownText} />
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 font-sans text-[11px] text-slate-500 text-center">
              Generated via CorpLawUpdates.in &bull; Ready for execution on non-judicial stamp paper or e-Stamping
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
