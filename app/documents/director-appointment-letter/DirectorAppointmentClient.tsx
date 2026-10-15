'use client'

import { useState, useMemo } from 'react'
import {
  Download,
  Copy,
  Printer,
  ShieldCheck,
  Building2,
  User,
  Gavel,
  Check,
  AlertTriangle,
  FileText,
  Calendar,
} from 'lucide-react'
import {
  DirectorAppointmentFormData,
  DEFAULT_SAMPLE_DIRECTOR_APPOINTMENT_DATA,
  DirectorDesignation,
  generateDirectorAppointmentMarkdown,
} from '@/lib/doc-generator/director-appointment-generator'
import LegalDocRenderer, { cleanMarkdownForClipboard } from '@/components/documents/LegalDocRenderer'
import AiClauseBuilder, { CustomClauseItem } from '@/components/documents/AiClauseBuilder'

const DESIGNATIONS: DirectorDesignation[] = [
  'Additional Director',
  'Director',
  'Independent Director',
  'Nominee Director',
  'Executive Director',
  'Managing Director',
]

export default function DirectorAppointmentClient() {
  const [formData, setFormData] = useState<DirectorAppointmentFormData>(
    DEFAULT_SAMPLE_DIRECTOR_APPOINTMENT_DATA
  )
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form')
  const [isDownloading, setIsDownloading] = useState<'docx' | 'pdf' | null>(null)
  const [downloadError, setDownloadError] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)

  const markdownText = useMemo(() => {
    return generateDirectorAppointmentMarkdown(formData)
  }, [formData])

  const updateField = <K extends keyof DirectorAppointmentFormData>(
    key: K,
    val: DirectorAppointmentFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  const handleAddClause = (clause: CustomClauseItem) => {
    setFormData(prev => ({
      ...prev,
      customClauses: [
        ...(prev.customClauses || []),
        {
          id: clause.id,
          title: clause.title,
          text: clause.text,
          riskWarning: clause.riskWarning,
        },
      ],
    }))
  }

  const handleRemoveClause = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customClauses: (prev.customClauses || []).filter(c => c.id !== id),
    }))
  }

  // Handle Designation Change to set default statutory terms
  const handleDesignationChange = (newDesig: DirectorDesignation) => {
    let defaultTerm = formData.term
    if (newDesig === 'Additional Director') {
      defaultTerm = 'Holds office up to the date of the next Annual General Meeting (AGM) under Section 161(1)'
    } else if (newDesig === 'Independent Director') {
      defaultTerm = '5 (Five) consecutive years pursuant to Section 149(10) and Schedule IV'
    } else if (newDesig === 'Managing Director') {
      defaultTerm = '5 (Five) years pursuant to Section 196(2)'
    }
    setFormData(prev => ({ ...prev, designation: newDesig, term: defaultTerm }))
  }

  // Handle Download
  const handleDownload = async (format: 'docx' | 'pdf') => {
    setIsDownloading(format)
    setDownloadError('')
    try {
      const res = await fetch('/api/documents/director-appointment-download', {
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
      const cleanName = (formData.directorName || 'Director').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25)
      a.download = `Appointment_Letter_${cleanName}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error(err)
      setDownloadError('Failed to generate appointment letter. Please use Copy Text or Print as fallback.')
    } finally {
      setIsDownloading(null)
    }
  }

  // Copy Clean Text without markdown syntax tokens
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

  // Print using rendered document styles
  const handlePrint = () => {
    const previewEl = document.getElementById('director-appointment-doc-preview')
    if (!previewEl) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointment Letter - ${formData.directorName}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; margin: 40px; color: #111; }
            h1 { font-size: 14pt; text-align: center; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; }
            h2 { font-size: 12pt; text-align: center; margin: 10px 0 4px 0; font-weight: bold; }
            h3, h4 { font-size: 11pt; margin: 10px 0 4px 0; font-weight: bold; }
            p { margin: 6px 0; text-align: justify; }
            blockquote { margin: 6px 0; padding-left: 12px; border-left: 2px solid #0056b3; font-style: italic; }
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
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              Companies Act, 2013 Engine
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">DIR-2 &bull; DIR-12 &bull; Schedule IV Aligned</span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-white">
            Customise Director Appointment Letter
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
            {/* 1. Company Details */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Issuing Company Details
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company Name (In Full)
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => updateField('companyName', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Corporate ID (CIN)
                  </label>
                  <input
                    type="text"
                    value={formData.companyCin}
                    onChange={e => updateField('companyCin', e.target.value)}
                    placeholder="U01100MH2020PTC345678"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company Email
                  </label>
                  <input
                    type="text"
                    value={formData.companyEmail || ''}
                    onChange={e => updateField('companyEmail', e.target.value)}
                    placeholder="compliance@company.in"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Registered Office Address
                </label>
                <textarea
                  rows={2}
                  value={formData.companyAddress}
                  onChange={e => updateField('companyAddress', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* 2. Director Appointee Details */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Director Appointee Details
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name of Appointee
                </label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={e => updateField('directorName', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Director ID No. (DIN)
                  </label>
                  <input
                    type="text"
                    value={formData.directorDin}
                    onChange={e => updateField('directorDin', e.target.value)}
                    placeholder="8-digit DIN"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Income-tax PAN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.directorPan || ''}
                    onChange={e => updateField('directorPan', e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={formData.directorAddress}
                  onChange={e => updateField('directorAddress', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* 3. Appointment Terms */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-blue-600" />
                Appointment Terms &amp; Fiduciary Governance
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <select
                    value={formData.designation}
                    onChange={e => handleDesignationChange(e.target.value as DirectorDesignation)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {DESIGNATIONS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="text"
                    value={formData.effectiveDate}
                    onChange={e => updateField('effectiveDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tenure / Term
                </label>
                <input
                  type="text"
                  value={formData.term}
                  onChange={e => updateField('term', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Remuneration / Sitting Fees (Subject to Sec 197)
                </label>
                <textarea
                  rows={2}
                  value={formData.remuneration}
                  onChange={e => updateField('remuneration', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Board Committees
                </label>
                <input
                  type="text"
                  value={formData.boardCommittees}
                  onChange={e => updateField('boardCommittees', e.target.value)}
                  placeholder="e.g. Audit Committee, NRC"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company Signatory
                  </label>
                  <input
                    type="text"
                    value={formData.signatoryName}
                    onChange={e => updateField('signatoryName', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Signatory Designation
                  </label>
                  <input
                    type="text"
                    value={formData.signatoryDesignation}
                    onChange={e => updateField('signatoryDesignation', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* AI Custom Clause Drafter */}
            <AiClauseBuilder
              documentType="Director Appointment Letter"
              existingClauseTitles={[
                'Role & Statutory Functions',
                'Board Committees',
                'Director Fiduciary Duties',
                'Remuneration and Expenses',
                'Disclosures and Form DIR-2/MBP-1',
                'Confidentiality & Insider Trading',
                'Governing Law',
              ]}
              customClauses={formData.customClauses || []}
              onAddClause={handleAddClause}
              onRemoveClause={handleRemoveClause}
            />
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
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Official Letterhead Preview &bull; Companies Act, 2013 Compliance
              </span>
            </div>

            <div className="pt-2">
              <LegalDocRenderer id="director-appointment-doc-preview" content={markdownText} />
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 font-sans text-[11px] text-slate-500 text-center">
              Issued on Company Letterhead &bull; Form DIR-12 must be filed with ROC within 30 days under Section 170(2)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
