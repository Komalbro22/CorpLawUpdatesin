'use client'

import { useState, useMemo } from 'react'
import {
  Download,
  Copy,
  Printer,
  ShieldCheck,
  Building2,
  Landmark,
  Gavel,
  Check,
  AlertTriangle,
  FileText,
  Calculator,
  Percent,
} from 'lucide-react'
import {
  BankGuaranteeFormData,
  DEFAULT_SAMPLE_BANK_GUARANTEE_DATA,
  BankGuaranteeType,
  GuaranteeNature,
  calculateMaharashtraBgStampDuty,
  numberToWordsIndian,
  generateBankGuaranteeMarkdown,
} from '@/lib/doc-generator/bank-guarantee-generator'

export default function BankGuaranteeClient() {
  const [formData, setFormData] = useState<BankGuaranteeFormData>(
    DEFAULT_SAMPLE_BANK_GUARANTEE_DATA
  )
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form')
  const [isDownloading, setIsDownloading] = useState<'docx' | 'pdf' | null>(null)
  const [downloadError, setDownloadError] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)

  // Live Stamp Duty Calculation
  const stampCalc = useMemo(() => {
    const isGovt = formData.beneficiaryType === 'government_public_works'
    return calculateMaharashtraBgStampDuty(formData.amount || 0, isGovt)
  }, [formData.amount, formData.beneficiaryType])

  const markdownText = useMemo(() => {
    return generateBankGuaranteeMarkdown(formData)
  }, [formData])

  const updateField = <K extends keyof BankGuaranteeFormData>(
    key: K,
    val: BankGuaranteeFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  // Handle Amount Change with Auto Words Calculation
  const handleAmountChange = (numVal: number) => {
    const words = numberToWordsIndian(numVal)
    setFormData(prev => ({
      ...prev,
      amount: numVal,
      amountWords: words,
    }))
  }

  // Handle Download
  const handleDownload = async (format: 'docx' | 'pdf') => {
    setIsDownloading(format)
    setDownloadError('')
    try {
      const res = await fetch('/api/documents/bank-guarantee-download', {
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
      const cleanNum = (formData.bgNumber || 'BG').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25)
      a.download = `Bank_Guarantee_${formData.guaranteeType}_${cleanNum}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error(err)
      setDownloadError('Failed to generate Bank Guarantee. Please use Copy Text or Print as fallback.')
    } finally {
      setIsDownloading(null)
    }
  }

  // Copy Preview
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      setDownloadError('Could not copy to clipboard.')
    }
  }

  // Print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bank Guarantee - ${formData.bgNumber || 'Draft'}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; margin: 40px; color: #111; }
            h1 { font-size: 16pt; text-align: center; margin-bottom: 4px; }
            h2 { font-size: 13pt; margin-top: 14px; }
            h3 { font-size: 11.5pt; margin-top: 12px; }
            h4 { font-size: 10.5pt; margin-top: 10px; }
            p { margin: 6px 0; text-align: justify; }
            blockquote { margin: 6px 0; padding-left: 12px; border-left: 2px solid #555; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; }
            th, td { border: 1px solid #888; padding: 6px 10px; text-align: left; }
            hr { border: none; border-top: 1px solid #ccc; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div>
            ${markdownText
              .replace(/^# (.*$)/gim, '<h1>$1</h1>')
              .replace(/^### (.*$)/gim, '<h3>$1</h3>')
              .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Top Banner with Action Buttons */}
      <div className="bg-slate-900 px-4 py-4 sm:px-6 sm:py-5 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">
              Contract Act &bull; Sections 124&ndash;147
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">Maharashtra Art 34A (2026) Ready</span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-white">
            Customise Bank Guarantee (BG) Draft
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
            {/* 1. Guarantee Classification */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-blue-600" />
                Guarantee Type &amp; Nature
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Guarantee Type
                  </label>
                  <select
                    value={formData.guaranteeType}
                    onChange={e => updateField('guaranteeType', e.target.value as BankGuaranteeType)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="performance">Performance Guarantee</option>
                    <option value="financial">Financial Guarantee</option>
                    <option value="advance_payment">Advance Payment Guarantee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Invocation Nature
                  </label>
                  <select
                    value={formData.nature}
                    onChange={e => updateField('nature', e.target.value as GuaranteeNature)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="unconditional">Unconditional (On-Demand)</option>
                    <option value="conditional">Conditional (Default Proof)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    BG Number
                  </label>
                  <input
                    type="text"
                    value={formData.bgNumber || ''}
                    onChange={e => updateField('bgNumber', e.target.value)}
                    placeholder="BG/2026/PUN/009845"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Place of Execution
                  </label>
                  <input
                    type="text"
                    value={formData.executionPlace}
                    onChange={e => updateField('executionPlace', e.target.value)}
                    placeholder="e.g. Pune, Maharashtra"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Amount & Live Maharashtra Stamp Duty */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 dark:border-purple-900/50 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-purple-600" />
                  Guarantee Amount &amp; Stamp Duty
                </h3>
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800 border border-purple-200">
                  Duty: ₹ {stampCalc.duty.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Guaranteed Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => handleAmountChange(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount in Words
                </label>
                <input
                  type="text"
                  value={formData.amountWords}
                  onChange={e => updateField('amountWords', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="rounded-lg bg-white/80 p-2.5 text-[11px] text-purple-900 dark:bg-slate-800/80 dark:text-purple-200 border border-purple-100 dark:border-purple-900 leading-relaxed">
                <strong>Maharashtra Stamp Duty (Article 34A w.e.f. 22 July 2026):</strong> {stampCalc.rule}
              </div>
            </div>

            {/* 3. Parties: Applicant & Beneficiary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Applicant &amp; Beneficiary
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Applicant Name (Principal Debtor)
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={e => updateField('applicantName', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Applicant Address &amp; CIN
                </label>
                <textarea
                  rows={2}
                  value={formData.applicantAddress}
                  onChange={e => updateField('applicantAddress', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Beneficiary Name (Creditor)
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.beneficiaryType === 'government_public_works'}
                      onChange={e =>
                        updateField('beneficiaryType', e.target.checked ? 'government_public_works' : 'commercial')
                      }
                      className="rounded-sm text-purple-600"
                    />
                    <span>Govt Works (₹500 flat stamp)</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.beneficiaryName}
                  onChange={e => updateField('beneficiaryName', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Beneficiary Address
                </label>
                <textarea
                  rows={2}
                  value={formData.beneficiaryAddress}
                  onChange={e => updateField('beneficiaryAddress', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* 4. Issuing Bank & Underlying Contract */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-blue-600" />
                Issuing Bank &amp; Contract Reference
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={e => updateField('bankName', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Branch Name &amp; IFSC
                  </label>
                  <input
                    type="text"
                    value={formData.bankBranch}
                    onChange={e => updateField('bankBranch', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Branch Counter Address (For Invocations)
                </label>
                <input
                  type="text"
                  value={formData.bankAddress}
                  onChange={e => updateField('bankAddress', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Underlying Contract / Tender Award Ref &amp; Date
                </label>
                <textarea
                  rows={2}
                  value={formData.underlyingContractRef}
                  onChange={e => updateField('underlyingContractRef', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Valid From
                  </label>
                  <input
                    type="text"
                    value={formData.validityFrom}
                    onChange={e => updateField('validityFrom', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Valid Up To
                  </label>
                  <input
                    type="text"
                    value={formData.validityTo}
                    onChange={e => updateField('validityTo', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Claim Expiry
                  </label>
                  <input
                    type="text"
                    value={formData.claimPeriodDate}
                    onChange={e => updateField('claimPeriodDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-bold text-rose-600 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* 5. Bank Signatories */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-blue-600" />
                Bank Authorised Signatory
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Officer Name
                  </label>
                  <input
                    type="text"
                    value={formData.signatory1Name}
                    onChange={e => updateField('signatory1Name', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.signatory1Designation}
                    onChange={e => updateField('signatory1Designation', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    PA No. / Code
                  </label>
                  <input
                    type="text"
                    value={formData.signatory1PaNumber || ''}
                    onChange={e => updateField('signatory1PaNumber', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
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
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Official Bank Guarantee Instrument &bull; Indian Contract Act, 1872
              </span>
            </div>

            <div className="whitespace-pre-line text-justify font-serif space-y-3">
              {markdownText
                .replace(/^# (.*$)/gim, '')
                .replace(/^---/gim, '')}
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 font-sans text-[11px] text-slate-500 text-center">
              Executed under Article 34A Maharashtra Stamp Act (effective July 2026) / State Stamp Act &bull; Independent Guarantee Undertaking
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
