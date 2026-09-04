'use client'

import { useState, useMemo } from 'react'
import {
  Download,
  FileText,
  Calculator,
  Building2,
  User,
  Copy,
  Printer,
  ShieldCheck,
  Clock,
  Sparkles,
  Scale,
  Layers,
  FileCheck2,
} from 'lucide-react'
import {
  Sh4FormData,
  DEFAULT_SAMPLE_SH4_DATA,
} from '@/lib/doc-generator/sh4-generator'

function formatInr(val: number): string {
  if (isNaN(val) || val === 0) return '0'
  const parts = Math.floor(val).toString().split('.')
  let intPart = parts[0]
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3)
    const rest = intPart.slice(0, -3)
    intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
  }
  return intPart
}

export default function Sh4DeedClient() {
  const [formData, setFormData] = useState<Sh4FormData>(DEFAULT_SAMPLE_SH4_DATA)
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'calculator' | 'resolution'>('preview')
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [copiedRes, setCopiedRes] = useState(false)

  // Stamp Duty Calculation state
  const [calcConsideration, setCalcConsideration] = useState<string>('100000')

  const stampDutyResult = useMemo(() => {
    const rawVal = parseFloat(calcConsideration.replace(/,/g, '')) || 0
    if (rawVal <= 0) return { duty: '0.00', formattedConsideration: '0', rawVal: 0 }
    // Rate: 0.015% (Finance Act, 2019 w.e.f. 01 July 2020)
    const duty = Math.max(1, Math.round(rawVal * 0.00015 * 100) / 100)
    return {
      duty: duty.toFixed(2),
      formattedConsideration: formatInr(rawVal),
      rawVal,
    }
  }, [calcConsideration])

  const handleInputChange = (field: keyof Sh4FormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'consideration') {
        const raw = parseFloat(value.replace(/,/g, '')) || 0
        if (raw > 0) {
          const duty = Math.max(1, Math.round(raw * 0.00015 * 100) / 100)
          updated.stampDutyAmount = duty.toFixed(2)
        }
      }
      return updated
    })
  }

  const handleDownload = async (format: 'docx' | 'pdf' | 'board-resolution') => {
    try {
      setIsDownloading(format)
      const res = await fetch('/api/documents/sh4-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData, format }),
      })

      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const companySlug = (formData.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')
      if (format === 'board-resolution') {
        a.download = `Board_Resolution_Share_Transfer_${companySlug}.docx`
      } else {
        a.download = `Form_SH-4_${companySlug}.${format}`
      }
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      alert('Unable to generate document. Please try again or download the blank template.')
    } finally {
      setIsDownloading(null)
    }
  }

  const handleLoadSample = () => {
    setFormData(DEFAULT_SAMPLE_SH4_DATA)
    setCalcConsideration('100000')
  }

  const handleClearForm = () => {
    setFormData({
      executionDate: '',
      cin: '',
      companyName: '',
      stockExchange: 'N/A (Unlisted Private Company)',
      securityClass: 'Equity Shares',
      nominalValue: '10',
      calledUpValue: '10',
      paidUpValue: '10',
      numberOfSecurities: '',
      numberOfSecuritiesWords: '',
      consideration: '',
      considerationWords: '',
      distinctiveFrom: '',
      distinctiveTo: '',
      certificateNumbers: '',
      transferorFolio: '',
      transferorName: '',
      witnessName: '',
      witnessAddress: '',
      witnessPincode: '',
      transfereeName: '',
      transfereeRelativeName: '',
      transfereeAddress: '',
      transfereePincode: '',
      transfereeEmail: '',
      transfereeOccupation: '',
      transfereeExistingFolio: 'New Member',
      stampDutyAmount: '0.00',
      femaApprovalRequired: false,
      directorName: '',
      directorDin: '',
      meetingDate: '',
      registeredOffice: '',
    })
  }

  const boardResolutionText = useMemo(() => {
    const comp = formData.companyName || '[COMPANY NAME]'
    const cin = formData.cin || '[CIN]'
    const ro = formData.registeredOffice || '[REGISTERED OFFICE ADDRESS]'
    const dt = formData.meetingDate || '[MEETING DATE]'
    const shares = formData.numberOfSecurities || '[NUMBER]'
    const sharesWords = formData.numberOfSecuritiesWords || '[NUMBER IN WORDS]'
    const nom = formData.nominalValue || '10'
    const distFrom = formData.distinctiveFrom || '[FROM]'
    const distTo = formData.distinctiveTo || '[TO]'
    const cert = formData.certificateNumbers || '[CERTIFICATE NOS]'
    const tferor = formData.transferorName || '[TRANSFEROR NAME]'
    const tferee = formData.transfereeName || '[TRANSFEREE NAME]'
    const cons = formData.consideration || '[CONSIDERATION]'
    const consWords = formData.considerationWords || '[CONSIDERATION IN WORDS]'
    const dir = formData.directorName || '[DIRECTOR NAME]'
    const din = formData.directorDin || '[DIN]'

    return `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${comp.toUpperCase()} HELD ON ${dt} AT THE REGISTERED OFFICE OF THE COMPANY AT ${ro}

APPROVAL FOR TRANSFER OF EQUITY SHARES UNDER SECTION 56 OF THE COMPANIES ACT, 2013

"RESOLVED THAT pursuant to the provisions of Section 56 of the Companies Act, 2013 read with Rule 11 of the Companies (Share Capital and Debentures) Rules, 2014, and other applicable provisions (if any), and the Articles of Association of the Company, the transfer of ${shares} (${sharesWords}) Equity Shares of ₹${nom}/- each fully paid up bearing distinctive numbers from ${distFrom} to ${distTo} (both inclusive), comprised in Share Certificate No(s) ${cert}, from ${tferor} (Transferor) to ${tferee} (Transferee) for a total consideration of ₹${cons}/- (Rupees ${consWords}) as per the duly stamped, dated and executed Share Transfer Deed in Form SH-4 received by the Company, be and is hereby approved.

RESOLVED FURTHER THAT ${dir}, Director (DIN: ${din}) of the Company, be and is hereby authorized to make necessary endorsements on the reverse of the relevant Share Certificate(s) and deliver the same to the Transferee within the statutory timeline of one month from the date of lodgement as prescribed under Section 56(4) of the Companies Act, 2013.

RESOLVED FURTHER THAT ${dir}, Director / Company Secretary of the Company, be and is hereby authorized to make necessary entries in the Register of Transfers (Form SH-6) and Register of Members (Form MGT-1) maintained pursuant to Section 88 of the Companies Act, 2013, and to take all such steps as may be necessary to give effect to the aforesaid resolution."

For ${comp}

________________________________________
${dir}
Director / Authorised Signatory
DIN: ${din}`
  }, [formData])

  const copyResolution = () => {
    navigator.clipboard.writeText(boardResolutionText)
    setCopiedRes(true)
    setTimeout(() => setCopiedRes(false), 2500)
  }


  return (
    <div suppressHydrationWarning className="space-y-10">
      {/* Top Direct Download Hub - Clean light/dark styling */}
      <div suppressHydrationWarning className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-6 shadow-sm dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-800 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Official Prescribed Format • Form SH-4
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Download Official Form SH-4 (Securities Transfer Form)
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Prescribed under <strong>Section 56 of Companies Act, 2013</strong> and <strong>Rule 11 of Companies (Share Capital & Debentures) Rules, 2014</strong>. Download official blank formats or customize online with instant 0.015% stamp duty calculation.
            </p>
          </div>

          {/* Direct Download Buttons */}
          <div className="flex flex-wrap gap-3 sm:flex-nowrap">
            <a
              href="/api/documents/sh4-download?type=blank-docx"
              download="Form_SH-4_Securities_Transfer_Deed_Blank.docx"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow"
            >
              <Download className="h-4 w-4" />
              Download Word (.docx)
            </a>
            <a
              href="/api/documents/sh4-download?type=blank-pdf"
              download="Form_SH-4_Securities_Transfer_Deed_Blank.pdf"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <FileText className="h-4 w-4 text-red-500" />
              Download PDF
            </a>
            <a
              href="/api/documents/sh4-download?type=board-resolution-docx"
              download="Board_Resolution_Share_Transfer_Section_56.docx"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
              title="Download specimen board resolution"
            >
              <FileCheck2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Board Resolution (.docx)
            </a>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-6 dark:border-slate-800 sm:grid-cols-4 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lodging Deadline</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Within 60 Days</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Scale className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Stamp Duty Rate</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">0.015% (Uniform)</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Board Registration</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Within 1 Month</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Governing Law</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sec 56, Co Act 2013</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Navigation Tabs Header */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-4 pt-3 dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="flex space-x-2" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === 'preview'
                    ? 'border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                Live SH-4 Preview
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === 'form'
                    ? 'border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <User className="h-4 w-4" />
                Customize Fields
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === 'calculator'
                    ? 'border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Calculator className="h-4 w-4" />
                Stamp Duty Calculator
              </button>
              <button
                onClick={() => setActiveTab('resolution')}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === 'resolution'
                    ? 'border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <FileCheck2 className="h-4 w-4" />
                Board Resolution Specimen
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={handleLoadSample}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Load Sample Data
              </button>
              <button
                onClick={handleClearForm}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Live Document Preview */}
        {activeTab === 'preview' && (
          <div className="p-4 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Official Form SH-4 Statutory Preview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formatted in exact accordance with Companies (Share Capital and Debentures) Rules, 2014.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDownload('docx')}
                  disabled={isDownloading === 'docx'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isDownloading === 'docx' ? 'Generating Word...' : 'Download Word (.docx)'}
                </button>
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloading === 'pdf'}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  <FileText className="h-3.5 w-3.5 text-red-500" />
                  {isDownloading === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
              </div>
            </div>

            {/* Paper Sheet Preview Container (supports both clean light paper and dark theme mode) */}
            <div className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-6 font-serif text-slate-900 shadow-md sm:p-10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              {/* Form Title */}
              <div className="text-center">
                <p className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">FORM NO. SH-4</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">SECURITIES TRANSFER FORM</p>
                <p className="mt-1 text-xs italic text-slate-600 dark:text-slate-400">
                  [Pursuant to section 56 of the Companies Act, 2013 and sub-rule (1) of rule 11 of the Companies (Share Capital and Debentures) Rules 2014]
                </p>
              </div>

              {/* Execution Date */}
              <div className="mt-6 text-right text-sm text-slate-800 dark:text-slate-200">
                <span className="font-semibold text-slate-900 dark:text-white">Date of execution:</span>{' '}
                <span className="border-b border-dotted border-slate-700 dark:border-slate-400 px-2 font-mono">
                  {formData.executionDate || '____/____/2026'}
                </span>
              </div>

              {/* Recital */}
              <p className="mt-4 text-justify text-xs leading-relaxed sm:text-sm text-slate-800 dark:text-slate-300">
                FOR THE CONSIDERATION stated below the “Transferor(s)” named do hereby transfer to the “Transferee(s)” named the securities specified below subject to the conditions on which the said securities are now held by the Transferor(s) and the Transferee(s) do hereby agree to accept and hold the said securities subject to the conditions aforesaid.
              </p>

              {/* Company Details */}
              <div className="mt-4 space-y-1 text-xs sm:text-sm text-slate-800 dark:text-slate-300">
                <p>
                  <strong className="font-semibold text-slate-900 dark:text-white">CIN:</strong>{' '}
                  <span className="font-mono">{formData.cin || '__________________________________'}</span>
                </p>
                <p>
                  <strong className="font-semibold text-slate-900 dark:text-white">Name of the company (in full):</strong>{' '}
                  <span className="font-semibold uppercase text-slate-900 dark:text-white">{formData.companyName || '____________________________________________________'}</span>
                </p>
                <p>
                  <strong className="font-semibold text-slate-900 dark:text-white">Name of the Stock Exchange where listed, if any:</strong>{' '}
                  <span>{formData.stockExchange || 'N/A (Unlisted Private Company)'}</span>
                </p>
              </div>

              {/* Description of Securities */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider sm:text-sm text-slate-900 dark:text-white">DESCRIPTION OF SECURITIES:</p>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-400 dark:border-slate-700 text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 font-semibold text-slate-800 dark:text-slate-200">
                        <th className="border border-slate-400 dark:border-slate-700 p-2 text-left">Kind/Class of securities (1)</th>
                        <th className="border border-slate-400 dark:border-slate-700 p-2 text-left">Nominal value / unit (2)</th>
                        <th className="border border-slate-400 dark:border-slate-700 p-2 text-left">Called up / unit (3)</th>
                        <th className="border border-slate-400 dark:border-slate-700 p-2 text-left">Paid up / unit (4)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 dark:border-slate-700 p-2">{formData.securityClass || 'Equity Shares'}</td>
                        <td className="border border-slate-400 dark:border-slate-700 p-2">₹ {formData.nominalValue || '10'}</td>
                        <td className="border border-slate-400 dark:border-slate-700 p-2">₹ {formData.calledUpValue || '10'}</td>
                        <td className="border border-slate-400 dark:border-slate-700 p-2">₹ {formData.paidUpValue || '10'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-400 dark:border-slate-700 text-xs sm:text-sm">
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 dark:border-slate-700 p-2 w-1/2">
                          <strong className="text-slate-900 dark:text-white">No. of Securities being transferred:</strong><br />
                          In figures: {formData.numberOfSecurities || '____________'}<br />
                          In words: {formData.numberOfSecuritiesWords || '________________________'}
                        </td>
                        <td className="border border-slate-400 dark:border-slate-700 p-2 w-1/2">
                          <strong className="text-slate-900 dark:text-white">Consideration Received (₹):</strong><br />
                          In figures: ₹ {formData.consideration || '____________'}<br />
                          In words: {formData.considerationWords || '________________________'}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-400 dark:border-slate-700 p-2" colSpan={2}>
                          <strong className="text-slate-900 dark:text-white">Distinctive Numbers:</strong> From <span className="font-mono">{formData.distinctiveFrom || '______'}</span> To <span className="font-mono">{formData.distinctiveTo || '______'}</span> &nbsp;|&nbsp; <strong className="text-slate-900 dark:text-white">Certificate Nos.:</strong> <span className="font-mono">{formData.certificateNumbers || '______'}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transferor Particulars */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider sm:text-sm text-slate-900 dark:text-white">TRANSFEROR’S PARTICULARS:</p>
                <div className="mt-2 border border-slate-400 dark:border-slate-700 p-3 text-xs sm:text-sm space-y-2">
                  <div className="flex justify-between flex-wrap gap-2">
                    <span><strong className="text-slate-900 dark:text-white">Registered Folio Number:</strong> <span className="font-mono">{formData.transferorFolio || '______'}</span></span>
                    <span><strong className="text-slate-900 dark:text-white">Name(s) in full:</strong> {formData.transferorName || '________________________'}</span>
                  </div>
                  <div className="pt-6 text-right">
                    <span className="border-t border-slate-700 dark:border-slate-400 px-6 font-sans text-xs text-slate-700 dark:text-slate-300">Signature(s) of Transferor(s)</span>
                  </div>
                </div>
              </div>

              {/* Attestation / Witness Confirmation */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider sm:text-sm text-slate-900 dark:text-white">ATTESTATION / WITNESS CONFIRMATION:</p>
                <div className="mt-2 border border-slate-400 dark:border-slate-700 p-3 text-xs sm:text-sm space-y-2">
                  <p className="italic text-slate-700 dark:text-slate-300">"I hereby confirm that the Transferor has signed before me."</p>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-2">
                    <div className="space-y-1">
                      <p><strong className="text-slate-900 dark:text-white">Name of Witness:</strong> {formData.witnessName || '________________________'}</p>
                      <p><strong className="text-slate-900 dark:text-white">Address:</strong> {formData.witnessAddress || '________________________'} (PIN: {formData.witnessPincode || '______'})</p>
                    </div>
                    <div className="pt-6 text-right sm:self-end">
                      <span className="border-t border-slate-700 dark:border-slate-400 px-6 font-sans text-xs text-slate-700 dark:text-slate-300">Signature of Witness</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transferee Particulars (Statutory 6-Column Format) */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider sm:text-sm text-slate-900 dark:text-white">TRANSFEREE’S PARTICULARS:</p>
                <table className="mt-2 w-full border-collapse border border-slate-400 dark:border-slate-700 text-left text-[11px] sm:text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
                      <th className="border border-slate-400 dark:border-slate-700 p-2">Name in full (1)</th>
                      <th className="border border-slate-400 dark:border-slate-700 p-2">Father’s/Mother’s/Spouse (2)</th>
                      <th className="border border-slate-400 dark:border-slate-700 p-2">Address & E-mail ID (3)</th>
                      <th className="border border-slate-400 dark:border-slate-700 p-2">Occupation (4)</th>
                      <th className="border border-slate-400 dark:border-slate-700 p-2">Existing Folio (5)</th>
                      <th className="border border-slate-400 dark:border-slate-700 p-2">Signature (6)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 dark:border-slate-700 p-2 font-medium">1. {formData.transfereeName || '________________________'}</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2">{formData.transfereeRelativeName || '________________________'}</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2">
                        {formData.transfereeAddress || '________________________'}<br />
                        PIN: {formData.transfereePincode || '______'} | {formData.transfereeEmail || ''}
                      </td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2">{formData.transfereeOccupation || '________________'}</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2">{formData.transfereeExistingFolio || 'New Member'}</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2 pt-6 text-center align-bottom">
                        <span className="border-t border-slate-700 dark:border-slate-400 px-2 font-sans text-[10px]">(1)</span>
                      </td>
                    </tr>
                    <tr className="text-slate-400 dark:text-slate-500">
                      <td className="border border-slate-400 dark:border-slate-700 p-2">2.</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2"></td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2"></td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2"></td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2"></td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2 pt-6 text-center align-bottom">
                        <span className="border-t border-slate-400 dark:border-slate-600 px-2 font-sans text-[10px]">(2)</span>
                      </td>
                    </tr>
                    <tr className="text-slate-400 dark:text-slate-500">
                      <td className="border border-slate-400 dark:border-slate-700 p-2">3.</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2"></td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2"></td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2"></td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2"></td>
                      <td className="border border-slate-400 dark:border-slate-700 p-2 pt-6 text-center align-bottom">
                        <span className="border-t border-slate-400 dark:border-slate-600 px-2 font-sans text-[10px]">(3)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-2 flex flex-col sm:flex-row sm:justify-between border border-slate-400 dark:border-slate-700 p-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <span>Folio No. of Transferee: {formData.transfereeExistingFolio || 'New Member'}</span>
                  <span>Specimen Signature of Transferee: (1) _________ (2) _________ (3) _________</span>
                </div>
              </div>

              {/* Value of Stamp Affixed & Stamp Box */}
              <div className="mt-6 border border-slate-400 dark:border-slate-700 p-4">
                <p className="text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                  Value of Stamp Affixed: ₹ {formData.stampDutyAmount || '15.00'}
                </p>
                <div className="mt-2 border-2 border-dashed border-slate-400 dark:border-slate-600 p-6 text-center bg-slate-50/80 dark:bg-slate-800/60">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">STAMPS</p>
                  <p className="mt-1 text-xs italic text-slate-600 dark:text-slate-300">
                    [ Space for affixing Share Transfer Stamps / attaching e-Stamping Certificate ]
                  </p>
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                    Duty calculated @ 0.015% under Schedule I, Article 62 of Indian Stamp Act, 1899. Stamps must be cancelled across under Section 12.
                  </p>
                </div>
              </div>

              {/* Mandatory 2022 MCA Amendment Declaration */}
              <div className="mt-6 border border-slate-400 dark:border-slate-700 p-3.5 bg-slate-50/80 dark:bg-slate-800/60">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Declaration (Pursuant to Companies (Share Capital and Debentures) Amendment Rules, 2022):
                </p>
                <div className="mt-2 space-y-1.5 text-xs">
                  <p className={!formData.femaApprovalRequired ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}>
                    {!formData.femaApprovalRequired ? '( X )' : '(   )'} Transferee is not required to obtain the Government approval under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019 prior to transfer of shares; or
                  </p>
                  <p className={formData.femaApprovalRequired ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}>
                    {formData.femaApprovalRequired ? '( X )' : '(   )'} Transferee is required to obtain the Government approval under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019 prior to transfer of shares and the same has been obtained and is enclosed herewith.
                  </p>
                </div>
              </div>

              {/* Enclosures */}
              <div className="mt-6 border border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Enclosures:</p>
                <p>(1) Certificate of shares or debentures or other securities</p>
                <p>(2) If no certificate is issued, letter of allotment.</p>
                <p>(3) Copy of PAN Card of Transferee (mandatory).</p>
                <p>(4) Declaration / Approval under Foreign Exchange Management (Non-debt Instruments) Rules, 2019 (if applicable).</p>
                <p>(5) Others, specify: ____________________________________________________________________</p>
              </div>

              {/* For Office Use Only */}
              <div className="mt-4 border border-slate-300 dark:border-slate-700 p-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">For office use only:</p>
                <p>Checked by: _________________________ &nbsp;|&nbsp; Signature tallied by: _________________________</p>
                <p>Entered in the Register of Transfer on: ___________________ vide Transfer No.: ___________________</p>
                <p>Approval Date: ___________________ &nbsp;|&nbsp; Power of attorney / Probate / Death Certificate registered at No.: ______</p>
              </div>

              {/* On the reverse page of certificate */}
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">ON THE REVERSE PAGE OF THE CERTIFICATE:</p>
                <table className="mt-1.5 w-full border-collapse border border-slate-400 dark:border-slate-700 text-left text-[11px] sm:text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-200">
                      <th className="border border-slate-400 dark:border-slate-700 p-1.5">Name of Transferor</th>
                      <th className="border border-slate-400 dark:border-slate-700 p-1.5">Name of Transferee</th>
                      <th className="border border-slate-400 dark:border-slate-700 p-1.5">No. of shares</th>
                      <th className="border border-slate-400 dark:border-slate-700 p-1.5">Date of Transfer</th>
                      <th className="border border-slate-400 dark:border-slate-700 p-1.5">Authorised Signatory</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-slate-800 dark:text-slate-200">
                      <td className="border border-slate-400 dark:border-slate-700 p-1.5">{formData.transferorName || '________________________'}</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-1.5">{formData.transfereeName || '________________________'}</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-1.5">{formData.numberOfSecurities || '________'}</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-1.5">___/___/2026</td>
                      <td className="border border-slate-400 dark:border-slate-700 p-1.5 pt-6 text-center align-bottom">_________________</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Customize Form Fields */}
        {activeTab === 'form' && (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Form SH-4 Document Customizer</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Fill in company, share, and party particulars. Changes instantly update the live preview and export files.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Category 1: Company & Execution Details */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  1. Company & Execution Details
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Company Name (in full) *</label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Company CIN *</label>
                  <input
                    type="text"
                    value={formData.cin || ''}
                    onChange={(e) => handleInputChange('cin', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. U72900DL2024PTC999999"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Date of Execution *</label>
                    <input
                      type="text"
                      value={formData.executionDate || ''}
                      onChange={(e) => handleInputChange('executionDate', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Stock Exchange (if listed)</label>
                    <input
                      type="text"
                      value={formData.stockExchange || ''}
                      onChange={(e) => handleInputChange('stockExchange', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="N/A (Unlisted)"
                    />
                  </div>
                </div>
              </div>

              {/* Category 2: Description of Securities */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  2. Description of Securities
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Kind / Class *</label>
                    <input
                      type="text"
                      value={formData.securityClass || ''}
                      onChange={(e) => handleInputChange('securityClass', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Equity Shares"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Nominal Value (₹) *</label>
                    <input
                      type="text"
                      value={formData.nominalValue || ''}
                      onChange={(e) => handleInputChange('nominalValue', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Called-Up Value (₹) *</label>
                    <input
                      type="text"
                      value={formData.calledUpValue || ''}
                      onChange={(e) => handleInputChange('calledUpValue', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Paid-Up Value (₹) *</label>
                    <input
                      type="text"
                      value={formData.paidUpValue || ''}
                      onChange={(e) => handleInputChange('paidUpValue', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">No. of Securities (Figures) *</label>
                    <input
                      type="text"
                      value={formData.numberOfSecurities || ''}
                      onChange={(e) => handleInputChange('numberOfSecurities', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">No. of Securities (Words) *</label>
                    <input
                      type="text"
                      value={formData.numberOfSecuritiesWords || ''}
                      onChange={(e) => handleInputChange('numberOfSecuritiesWords', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="One Thousand Only"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Distinctive From</label>
                    <input
                      type="text"
                      value={formData.distinctiveFrom || ''}
                      onChange={(e) => handleInputChange('distinctiveFrom', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="1001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Distinctive To</label>
                    <input
                      type="text"
                      value={formData.distinctiveTo || ''}
                      onChange={(e) => handleInputChange('distinctiveTo', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="2000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Certificate Nos.</label>
                    <input
                      type="text"
                      value={formData.certificateNumbers || ''}
                      onChange={(e) => handleInputChange('certificateNumbers', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="04"
                    />
                  </div>
                </div>
              </div>

              {/* Category 3: Consideration & Stamp Duty */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  3. Consideration & Stamping (0.015%)
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Consideration Received (₹, Figures) *</label>
                  <input
                    type="text"
                    value={formData.consideration || ''}
                    onChange={(e) => handleInputChange('consideration', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. 100000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Consideration (Words) *</label>
                  <input
                    type="text"
                    value={formData.considerationWords || ''}
                    onChange={(e) => handleInputChange('considerationWords', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. One Lakh Rupees Only"
                  />
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <p className="font-semibold">Calculated Stamp Duty: ₹ {formData.stampDutyAmount || '15.00'}</p>
                  <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                    Rate: 0.015% of consideration as per Finance Act, 2019 w.e.f. July 1, 2020.
                  </p>
                </div>
              </div>

              {/* Category 4: Transferor Details */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  4. Transferor Details
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Transferor Full Name *</label>
                  <input
                    type="text"
                    value={formData.transferorName || ''}
                    onChange={(e) => handleInputChange('transferorName', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. Sample Transferor (Shri A. K. Sharma)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Registered Folio Number *</label>
                  <input
                    type="text"
                    value={formData.transferorFolio || ''}
                    onChange={(e) => handleInputChange('transferorFolio', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. SMPL-001"
                  />
                </div>
              </div>

              {/* Category 5: Transferee Details */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40 md:col-span-2">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  5. Transferee Details
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Transferee Full Name *</label>
                    <input
                      type="text"
                      value={formData.transfereeName || ''}
                      onChange={(e) => handleInputChange('transfereeName', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Sample Transferee (Smt. Priya Verma)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Father’s / Mother’s / Spouse’s Name *</label>
                    <input
                      type="text"
                      value={formData.transfereeRelativeName || ''}
                      onChange={(e) => handleInputChange('transfereeRelativeName', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Late Shri M. L. Verma (Father)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Address *</label>
                    <input
                      type="text"
                      value={formData.transfereeAddress || ''}
                      onChange={(e) => handleInputChange('transfereeAddress', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Flat No. 404, Sample Residency, Sector 14, Gurugram"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Pin Code *</label>
                      <input
                        type="text"
                        value={formData.transfereePincode || ''}
                        onChange={(e) => handleInputChange('transfereePincode', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="122001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Existing Folio (if any)</label>
                      <input
                        type="text"
                        value={formData.transfereeExistingFolio || ''}
                        onChange={(e) => handleInputChange('transfereeExistingFolio', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="New Member"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email ID *</label>
                    <input
                      type="email"
                      value={formData.transfereeEmail || ''}
                      onChange={(e) => handleInputChange('transfereeEmail', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="transferee.sample@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Occupation *</label>
                    <input
                      type="text"
                      value={formData.transfereeOccupation || ''}
                      onChange={(e) => handleInputChange('transfereeOccupation', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Professional / Business (Sample)"
                    />
                  </div>
                </div>

                {/* 2022 FEMA Non-debt Instruments Declaration */}
                <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                    FEMA Non-Debt Instruments Declaration (Mandatory 2022 MCA Amendment) *
                  </label>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="femaApprovalCustomizer"
                        checked={!formData.femaApprovalRequired}
                        onChange={() => setFormData((prev) => ({ ...prev, femaApprovalRequired: false }))}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        <strong>Option 1 (Domestic / Exempt):</strong> Transferee is NOT required to obtain Government approval under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019 prior to transfer of shares.
                      </span>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="femaApprovalCustomizer"
                        checked={!!formData.femaApprovalRequired}
                        onChange={() => setFormData((prev) => ({ ...prev, femaApprovalRequired: true }))}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        <strong>Option 2 (FDI / Land Border Approval):</strong> Transferee IS required to obtain Government approval under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019 and the same has been obtained and enclosed.
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Category 6: Witness Details */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40 md:col-span-2">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  6. Witness / Attestation Particulars
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Witness Full Name *</label>
                    <input
                      type="text"
                      value={formData.witnessName || ''}
                      onChange={(e) => handleInputChange('witnessName', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Sample Witness (Shri R. P. Singh)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Witness Address *</label>
                    <input
                      type="text"
                      value={formData.witnessAddress || ''}
                      onChange={(e) => handleInputChange('witnessAddress', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. 102, Sample Commercial Complex, New Delhi"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Pin Code *</label>
                    <input
                      type="text"
                      value={formData.witnessPincode || ''}
                      onChange={(e) => handleInputChange('witnessPincode', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="110001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('preview')}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                View Live Preview
              </button>
              <button
                onClick={() => handleDownload('docx')}
                disabled={isDownloading === 'docx'}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {isDownloading === 'docx' ? 'Generating Word...' : 'Download Form SH-4 (.docx)'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Stamp Duty Calculator */}
        {activeTab === 'calculator' && (
          <div className="p-6 sm:p-8">
            <div className="mx-auto max-w-2xl">
              <div className="text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                  Form SH-4 Stamp Duty Calculator (2026)
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Calculate the exact statutory stamp duty on transfer of shares in physical form under the Indian Stamp Act, 1899.
                </p>
              </div>

              {/* Calculator Form */}
              <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20 sm:p-8">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Total Consideration Amount (₹)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  For gift transfers without monetary consideration, enter Fair Market Value (FMV) or face value.
                </p>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lg font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={calcConsideration}
                    onChange={(e) => setCalcConsideration(e.target.value.replace(/[^0-9.]/g, ''))}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-4 text-xl font-bold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="100000"
                  />
                </div>

                {/* Quick Selection Buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {['10000', '50000', '100000', '500000', '1000000'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setCalcConsideration(val)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      ₹ {formatInr(Number(val))}
                    </button>
                  ))}
                </div>

                {/* Calculation Results Card */}
                <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Consideration Value</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">₹ {stampDutyResult.formattedConsideration}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Statutory Rate (Uniform Pan-India)</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">0.015% (₹15 per ₹1 Lakh)</span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-base font-bold text-slate-900 dark:text-white">Total Stamp Duty Payable</span>
                    <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">₹ {stampDutyResult.duty}</span>
                  </div>
                </div>

                <div className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400 space-y-1">
                  <p><strong>Legal Citation:</strong> Indian Stamp Act, 1899, Schedule I, Article 56A as amended by the Finance Act, 2019 (effective 1st July 2020).</p>
                  <p><strong>Outdated 0.25% Rule:</strong> Prior to July 2020, stamp duty was 25 paise per ₹100 (0.25%). The 2020 amendment slashed and unified this rate to <strong>0.015%</strong> across all Indian states.</p>
                  <p><strong>0.005% vs 0.015% Note:</strong> The 0.005% rate (sometimes misread as 0.05%) applies strictly to the <em>initial issuance / allotment</em> of share certificates (Form SH-1) by the company. Secondary <em>share transfers</em> executed on Form SH-4 are strictly charged at <strong>0.015%</strong> (₹15 per ₹1 Lakh).</p>
                  <p><strong>Payment Mode:</strong> Affix adhesive Share Transfer Stamps or attach an e-Stamping certificate from SHCIL / State Treasury. Share transfer stamps must be cancelled by writing signature or drawing a cross across them as required under Section 12.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Specimen Board Resolution */}
        {activeTab === 'resolution' && (
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Specimen Board Resolution for Share Transfer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Required under Section 56(4) of Companies Act, 2013 to register the transfer and endorse share certificates.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyResolution}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedRes ? 'Copied!' : 'Copy Resolution'}
                </button>
                <button
                  onClick={() => handleDownload('board-resolution')}
                  disabled={isDownloading === 'board-resolution'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isDownloading === 'board-resolution' ? 'Generating...' : 'Download Word (.docx)'}
                </button>
              </div>
            </div>

            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-5 font-mono text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              {boardResolutionText}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
