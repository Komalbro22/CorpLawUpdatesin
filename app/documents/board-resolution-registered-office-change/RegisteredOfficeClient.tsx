'use client'

import { useState, useMemo } from 'react'
import {
  Download,
  FileText,
  Building2,
  User,
  Copy,
  Printer,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Mail,
  Camera,
  MapPin,
  Landmark,
} from 'lucide-react'
import {
  RegisteredOfficeFormData,
  DEFAULT_SAMPLE_REG_OFFICE_DATA,
} from '@/lib/doc-generator/registered-office-generator'

export default function RegisteredOfficeClient() {
  const [formData, setFormData] = useState<RegisteredOfficeFormData>(
    DEFAULT_SAMPLE_REG_OFFICE_DATA
  )
  const [activeTab, setActiveTab] = useState<
    'preview' | 'form' | 'checklist' | 'bank-letter'
  >('preview')
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<'resolution' | 'letter' | null>(null)

  const handleInputChange = (field: keyof RegisteredOfficeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDownload = async (format: 'docx' | 'pdf' | 'bank-letter') => {
    try {
      setIsDownloading(format)
      const res = await fetch('/api/documents/registered-office-download', {
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
      if (format === 'bank-letter') {
        a.download = `Bank_Intimation_Letter_${companySlug}.docx`
      } else if (format === 'docx') {
        a.download = `Board_Resolution_Registered_Office_${companySlug}.docx`
      } else {
        a.download = `Board_Resolution_Registered_Office_${companySlug}.pdf`
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
    setFormData(DEFAULT_SAMPLE_REG_OFFICE_DATA)
  }

  const handleClearForm = () => {
    setFormData({
      companyName: '',
      cin: '',
      meetingDate: '',
      meetingTime: '',
      meetingVenue: '',
      chairpersonName: '',
      directorsPresent: '',
      oldAddress: '',
      newAddress: '',
      effectiveDate: '',
      premisesType: 'rented',
      ownerName: '',
      directorName: '',
      directorDin: '',
      companySecretaryName: '',
      csMembershipNo: '',
      certifiedDate: '',
      bankName: '',
      bankBranch: '',
      bankAccountNumber: '',
    })
  }

  const resolutionRawText = useMemo(() => {
    const comp = formData.companyName || '[COMPANY NAME]'
    const cin = formData.cin || '[CIN]'
    const oldAddr = formData.oldAddress || '[OLD REGISTERED OFFICE ADDRESS]'
    const newAddr = formData.newAddress || '[NEW REGISTERED OFFICE ADDRESS]'
    const dt = formData.meetingDate || '[MEETING DATE]'
    const tm = formData.meetingTime || '[MEETING TIME]'
    const venue = formData.meetingVenue || oldAddr
    const dir = formData.directorName || '[DIRECTOR NAME]'
    const din = formData.directorDin || '[DIN]'
    const cs = formData.companySecretaryName || '[COMPANY SECRETARY NAME]'
    const csMem = formData.csMembershipNo || '[CS MEMBERSHIP NO]'
    const effDate = formData.effectiveDate || dt
    const chair = formData.chairpersonName || '[CHAIRPERSON NAME]'

    return `${comp.toUpperCase()}
CIN: ${cin}
Registered Office: ${oldAddr}

CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${comp.toUpperCase()} HELD ON ${dt} AT ${tm} AT ${venue}

CHANGE OF REGISTERED OFFICE OF THE COMPANY WITHIN LOCAL LIMITS OF THE SAME CITY / TOWN / VILLAGE

"RESOLVED THAT pursuant to the provisions of Section 12(5)(a) and other applicable provisions, if any, of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014, and the relevant provisions of the Articles of Association of the Company, the consent of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from:

Existing Registered Office:
${oldAddr}

To New Registered Office:
${newAddr}

with effect from ${effDate}, which is within the local limits of the same city / town / village and within the jurisdiction of the same Registrar of Companies.

RESOLVED FURTHER THAT the No Objection Certificate (NOC) received from the owner/landlord of the new premises together with the latest utility bill (electricity bill not older than 2 months) and the lease/rent agreement in respect of the new premises, placed before the meeting, be and are hereby noted and accepted as conclusive proof of the right to use the premises as the Registered Office of the Company.

RESOLVED FURTHER THAT ${dir}, Director (DIN: ${din}) and/or ${cs}, Company Secretary (Membership No.: ${csMem}) of the Company, be and are hereby severally authorized to digitally sign, certify, and file e-Form INC-22 with the Registrar of Companies within the statutory timeline of 30 days from the date of this resolution, along with requisite statutory attachments and fees, as prescribed under Section 12 of the Companies Act, 2013.

RESOLVED FURTHER THAT the Company shall arrange to paint or affix the Company’s Name and Registered Office Address outside and inside the new premises in English and in the local language as mandated under Section 12(3)(a) and Rule 25(2) of the Companies (Incorporation) Rules, 2014, and to arrange for taking geo-tagged interior and exterior photographs showing at least one Director/KMP present inside the registered office as required for MCA verification.

RESOLVED FURTHER THAT the Directors of the Company be and are hereby severally authorized to update the registered office address on the company letterheads, business correspondence, invoices, official website, and to file application for amendment of core fields in Form GST REG-14 within 15 days on the GST portal, and to intimate the change of address to all banking partners, financial institutions, Income Tax authorities, EPFO, ESIC, and other regulatory agencies."

For ${comp.toUpperCase()}

________________________________________
${chair}
Chairperson / Director

CERTIFIED TRUE COPY:
For ${comp.toUpperCase()}

________________________________________
${dir}
Director / Authorised Signatory
DIN: ${din}
Date: ${dt}
Place: ${venue.split(',').pop()?.trim() || 'New Delhi'}`
  }, [formData])

  const bankLetterText = useMemo(() => {
    const comp = formData.companyName || '[COMPANY NAME]'
    const cin = formData.cin || '[CIN]'
    const oldAddr = formData.oldAddress || '[OLD ADDRESS]'
    const newAddr = formData.newAddress || '[NEW ADDRESS]'
    const dt = formData.meetingDate || '[DATE]'
    const bank = formData.bankName || '[BANK NAME]'
    const branch = formData.bankBranch || '[BRANCH NAME]'
    const acct = formData.bankAccountNumber || '[ACCOUNT NUMBER]'
    const dir = formData.directorName || '[DIRECTOR NAME]'
    const din = formData.directorDin || '[DIN]'

    return `${comp.toUpperCase()}
CIN: ${cin}
New Registered Office: ${newAddr}

Date: ${dt}

To,
The Branch Manager,
${bank}
${branch}

SUBJECT: INTIMATION OF CHANGE OF REGISTERED OFFICE ADDRESS — ACCOUNT NO. ${acct}

Dear Sir / Madam,

We wish to inform you that the Board of Directors of our Company, ${comp}, at its meeting held on ${dt}, has approved the shifting of the Registered Office of the Company from its existing premises to the following new premises with effect from ${formData.effectiveDate || dt}:

Old Registered Office:
${oldAddr}

New Registered Office:
${newAddr}

The necessary statutory e-Form INC-22 has been submitted to the Registrar of Companies (ROC) pursuant to Section 12 of the Companies Act, 2013.

We request you to kindly update the new Registered Office address in your bank records, CBS system, checkbook issuances, and communication records for our Current Account No. ${acct} maintained with your branch.

Enclosures:
1. Certified True Copy of Board Resolution dated ${dt}
2. Copy of e-Form INC-22 filed with ROC along with MCA Challan / SRN Receipt
3. Proof of Address for new premises (Electricity Bill / Rent Agreement)
4. Self-attested PAN Card copy of the Company

Thanking you,
Yours faithfully,

For ${comp.toUpperCase()}

________________________________________
${dir}
Director / Authorised Signatory
DIN: ${din}`
  }, [formData])

  const copyResolution = () => {
    navigator.clipboard.writeText(resolutionRawText)
    setCopiedType('resolution')
    setTimeout(() => setCopiedType(null), 2500)
  }

  const copyBankLetter = () => {
    navigator.clipboard.writeText(bankLetterText)
    setCopiedType('letter')
    setTimeout(() => setCopiedType(null), 2500)
  }

  return (
    <div suppressHydrationWarning className="space-y-10">
      {/* Top 1-Click Download Hub */}
      <div
        suppressHydrationWarning
        className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 p-6 shadow-sm dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Section 12(5)(a) Companies Act, 2013 • Rule 25 & 27 • Form INC-22
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Board Resolution for Change of Registered Office (Within Same City)
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              Download certified true copy formats in <strong>Word (.docx)</strong> and <strong>PDF</strong>. Includes Section 12 statutory authorization, Form INC-22 30-day compliance checklist, and Bank Address Change Intimation Letter.
            </p>
          </div>

          {/* Direct Download Buttons */}
          <div className="flex flex-wrap gap-3 sm:flex-nowrap">
            <a
              href="/api/documents/registered-office-download?type=blank-docx"
              download="Board_Resolution_Registered_Office_Change_Same_City.docx"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow"
            >
              <Download className="h-4 w-4" />
              Download Word (.docx)
            </a>
            <a
              href="/api/documents/registered-office-download?type=blank-pdf"
              download="Board_Resolution_Registered_Office_Change_Same_City.pdf"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FileText className="h-4 w-4 text-red-500" />
              Download PDF
            </a>
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
                    ? 'border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                Live Resolution Preview
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === 'form'
                    ? 'border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <User className="h-4 w-4" />
                Customize Particulars
              </button>
              <button
                onClick={() => setActiveTab('checklist')}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === 'checklist'
                    ? 'border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Form INC-22 Checklist
              </button>
              <button
                onClick={() => setActiveTab('bank-letter')}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === 'bank-letter'
                    ? 'border-blue-600 font-semibold text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Landmark className="h-4 w-4" />
                Bank Intimation Letter
              </button>
            </nav>

            {/* Form Actions */}
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

        {/* Tab 1: Live Resolution Preview */}
        {activeTab === 'preview' && (
          <div className="p-4 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Official Certified True Copy Format
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drafted pursuant to Section 12(5)(a) of Companies Act, 2013 and ICSI Secretarial Standard-1 (SS-1).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyResolution}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedType === 'resolution' ? 'Copied to Clipboard!' : 'Copy Resolution'}
                </button>
                <button
                  onClick={() => handleDownload('docx')}
                  disabled={isDownloading === 'docx'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
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
              {/* Company Header */}
              <div className="text-center">
                <p className="text-xl font-bold tracking-wide text-slate-900 dark:text-white uppercase">
                  {formData.companyName || '[COMPANY NAME]'}
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  CIN: <span className="font-mono">{formData.cin || '[CIN]'}</span>
                </p>
                <p className="mt-1 text-xs italic text-slate-600 dark:text-slate-400">
                  Registered Office: {formData.oldAddress || '[CURRENT REGISTERED OFFICE ADDRESS]'}
                </p>
              </div>

              <div className="my-6 border-b border-slate-300 dark:border-slate-700" />

              {/* Certified Header */}
              <div className="text-center space-y-1">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white underline">
                  CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS
                </p>
                <p className="text-xs font-semibold uppercase text-slate-800 dark:text-slate-200">
                  HELD ON {formData.meetingDate || '15/09/2026'} AT {formData.meetingTime || '11:00 A.M.'} AT{' '}
                  {formData.meetingVenue || formData.oldAddress || '[REGISTERED OFFICE VENUE]'}
                </p>
              </div>

              {/* Directors Present */}
              <div className="mt-6 text-xs text-slate-800 dark:text-slate-200 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">DIRECTORS PRESENT:</p>
                <div className="whitespace-pre-line pl-2">
                  {formData.directorsPresent ||
                    '1. Shri A. K. Sharma (Director & Chairperson)\n2. Smt. Priya Verma (Director)\n3. Shri Vikram Mehta (Director)'}
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-800 dark:text-slate-200">
                <span className="font-bold text-slate-900 dark:text-white">CHAIRPERSON: </span>
                {formData.chairpersonName || 'Shri A. K. Sharma'}, Director, took the Chair.
              </div>

              {/* Subject Title */}
              <div className="my-6 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                  CHANGE OF REGISTERED OFFICE OF THE COMPANY WITHIN LOCAL LIMITS OF THE SAME CITY
                </p>
              </div>

              {/* Resolution Clause 1 */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify text-slate-800 dark:text-slate-200">
                <p>
                  <strong className="font-bold text-slate-900 dark:text-white">"RESOLVED THAT </strong>
                  pursuant to the provisions of Section 12(5)(a) and other applicable provisions, if any, of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014 (including any statutory modification(s) or re-enactment(s) thereof for the time being in force) and the relevant provisions of the Articles of Association of the Company, the consent of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from:
                </p>

                {/* Transition Box */}
                <div className="rounded-lg border border-slate-400 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 p-4 text-xs space-y-2">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider block">Existing Registered Office:</span>
                    <span className="text-slate-900 dark:text-slate-200">{formData.oldAddress || '[OLD ADDRESS]'}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 dark:border-slate-700">
                    <span className="font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">To New Registered Office:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formData.newAddress || '[NEW ADDRESS]'}</span>
                  </div>
                </div>

                <p>
                  with effect from <strong className="text-slate-900 dark:text-white">{formData.effectiveDate || formData.meetingDate || '15/09/2026'}</strong>, which is within the local limits of the same city / town / village and within the jurisdiction of the same Registrar of Companies.
                </p>

                <p>
                  <strong className="font-bold text-slate-900 dark:text-white">RESOLVED FURTHER THAT </strong>
                  the No Objection Certificate (NOC) received from the owner/landlord of the new premises together with the latest utility bill (electricity bill not older than 2 months) and the lease/rent agreement in respect of the new premises, placed before the meeting, be and are hereby noted and accepted as conclusive proof of the right to use the premises as the Registered Office of the Company.
                </p>

                <p>
                  <strong className="font-bold text-slate-900 dark:text-white">RESOLVED FURTHER THAT </strong>
                  <strong className="text-slate-900 dark:text-white">{formData.directorName || 'Sample Director'}</strong>, Director (DIN: {formData.directorDin || '09999999'}) and/or <strong className="text-slate-900 dark:text-white">{formData.companySecretaryName || 'CS Sample Sharma'}</strong>, Company Secretary (Membership No.: {formData.csMembershipNo || 'A99999'}) of the Company, be and are hereby severally authorized to digitally sign, certify, and file e-Form INC-22 with the Registrar of Companies within the statutory timeline of 30 days from the date of this resolution, along with requisite statutory attachments and fees, as prescribed under Section 12 of the Companies Act, 2013.
                </p>

                <p>
                  <strong className="font-bold text-slate-900 dark:text-white">RESOLVED FURTHER THAT </strong>
                  the Company shall arrange to paint or affix the Company’s Name and Registered Office Address outside and inside the new premises in English and in the local language as mandated under Section 12(3)(a) and Rule 25(2) of the Companies (Incorporation) Rules, 2014, and to arrange for taking geo-tagged interior and exterior photographs showing at least one Director/KMP present inside the registered office as required for MCA verification.
                </p>

                <p>
                  <strong className="font-bold text-slate-900 dark:text-white">RESOLVED FURTHER THAT </strong>
                  the Directors of the Company be and are hereby severally authorized to update the registered office address on the company letterheads, business correspondence, invoices, official website, and to file application for amendment of core fields in Form GST REG-14 within 15 days on the GST portal, and to intimate the change of address to all banking partners, financial institutions, Income Tax authorities, EPFO, ESIC, and other regulatory agencies."
                </p>
              </div>

              {/* Signatures */}
              <div className="mt-10 flex justify-between gap-8 pt-6 border-t border-slate-300 dark:border-slate-700 text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">For {formData.companyName?.toUpperCase() || '[COMPANY NAME]'}</p>
                  <div className="h-14" />
                  <p className="border-t border-slate-700 dark:border-slate-400 pt-1 font-bold text-slate-900 dark:text-white">
                    {formData.chairpersonName || 'Shri A. K. Sharma'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">Chairperson / Director</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">CERTIFIED TRUE COPY:</p>
                  <p className="font-bold text-slate-800 dark:text-slate-300">For {formData.companyName?.toUpperCase() || '[COMPANY NAME]'}</p>
                  <div className="h-14" />
                  <p className="border-t border-slate-700 dark:border-slate-400 pt-1 font-bold text-slate-900 dark:text-white">
                    {formData.directorName || 'Sample Director'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">Director / Authorised Signatory</p>
                  <p className="text-slate-600 dark:text-slate-400">DIN: {formData.directorDin || '09999999'}</p>
                  <p className="text-slate-600 dark:text-slate-400">Date: {formData.certifiedDate || formData.meetingDate || '15/09/2026'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Customize Fields */}
        {activeTab === 'form' && (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Customize Board Resolution Fields
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Update company, address, meeting, and signatory particulars. Changes update live in the preview and export files.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Category 1: Company & Meeting Details */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  1. Company & Meeting Details
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Company Name (in full) *</label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Company CIN *</label>
                  <input
                    type="text"
                    value={formData.cin || ''}
                    onChange={(e) => handleInputChange('cin', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. U72900DL2024PTC999999"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Board Meeting Date *</label>
                    <input
                      type="text"
                      value={formData.meetingDate || ''}
                      onChange={(e) => handleInputChange('meetingDate', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Meeting Time</label>
                    <input
                      type="text"
                      value={formData.meetingTime || ''}
                      onChange={(e) => handleInputChange('meetingTime', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. 11:00 A.M."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Chairperson Name</label>
                  <input
                    type="text"
                    value={formData.chairpersonName || ''}
                    onChange={(e) => handleInputChange('chairpersonName', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. Shri A. K. Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Directors Present (one per line)</label>
                  <textarea
                    rows={3}
                    value={formData.directorsPresent || ''}
                    onChange={(e) => handleInputChange('directorsPresent', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                    placeholder="1. Shri A. K. Sharma (Director)&#10;2. Smt. Priya Verma (Director)"
                  />
                </div>
              </div>

              {/* Category 2: Address Particulars */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  2. Address & Shifting Particulars
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Existing Registered Office Address *</label>
                  <textarea
                    rows={2}
                    value={formData.oldAddress || ''}
                    onChange={(e) => handleInputChange('oldAddress', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Full current address with PIN code"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">New Registered Office Address (in full) *</label>
                  <textarea
                    rows={2}
                    value={formData.newAddress || ''}
                    onChange={(e) => handleInputChange('newAddress', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Full new address with PIN code (within same city)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Effective Date of Shifting *</label>
                    <input
                      type="text"
                      value={formData.effectiveDate || ''}
                      onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Premises Type</label>
                    <select
                      value={formData.premisesType || 'rented'}
                      onChange={(e) => handleInputChange('premisesType', e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="rented">Rented / Leased</option>
                      <option value="owned">Owned by Company</option>
                      <option value="director_owned">Owned by Director / Relative</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Owner / Landlord Name (for NOC)</label>
                  <input
                    type="text"
                    value={formData.ownerName || ''}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g. Shri R. P. Singh (Landlord)"
                  />
                </div>
              </div>

              {/* Category 3: Authorised Signatories */}
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40 md:col-span-2">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 font-bold text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  3. Authorised Signatories & Certification
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Authorised Director Name *</label>
                    <input
                      type="text"
                      value={formData.directorName || ''}
                      onChange={(e) => handleInputChange('directorName', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. Sample Director (Authorised Signatory)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Director DIN *</label>
                    <input
                      type="text"
                      value={formData.directorDin || ''}
                      onChange={(e) => handleInputChange('directorDin', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="09999999"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Company Secretary Name (if any)</label>
                    <input
                      type="text"
                      value={formData.companySecretaryName || ''}
                      onChange={(e) => handleInputChange('companySecretaryName', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="e.g. CS Sample Sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">CS Membership No.</label>
                    <input
                      type="text"
                      value={formData.csMembershipNo || ''}
                      onChange={(e) => handleInputChange('csMembershipNo', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="A99999"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
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
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {isDownloading === 'docx' ? 'Generating Word...' : 'Download Word (.docx)'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Form INC-22 Checklist */}
        {activeTab === 'checklist' && (
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                Form INC-22 Mandatory Filing Checklist & Timeline (Section 12)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Under Section 12(5)(a) of the Companies Act, 2013, Form INC-22 must be filed with the Registrar of Companies (ROC) within <strong>30 days</strong> of passing the Board Resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mandatory Attachments */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Mandatory Attachments to e-Form INC-22
                </h4>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>1. Certified True Copy of Board Resolution:</strong> Duly signed by Director/CS with date and place.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>2. Registered Title Deed / Lease Deed:</strong> Conveyance deed in company's name or rent/lease agreement in company's name along with rent receipt.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>3. Utility Bill (Max 2 Months Old):</strong> Electricity, telephone, or gas bill in owner's or company's name containing the complete address.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>4. No Objection Certificate (NOC):</strong> Signed by the property owner authorizing the company to use premises as registered office.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>5. List of Other Companies:</strong> If any other companies share the same registered office, attach their names and CINs.</span>
                  </li>
                </ul>
              </div>

              {/* Rule 25(2) Photo Verification Mandate */}
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Mandatory Rule 25(2) Photograph Requirements
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  MCA strictly rejects Form INC-22 filings without the two mandatory geo-tagged photographs:
                </p>
                <div className="space-y-2 text-xs text-amber-900 dark:text-amber-200">
                  <div className="rounded-lg border border-amber-200 bg-white p-2.5 dark:border-amber-900/60 dark:bg-slate-900">
                    <p className="font-bold text-slate-900 dark:text-white">Photo 1: Exterior of Premises & Name Board</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Must show outside of the building with the Company Name Board painted or affixed. Board must clearly show Company Name, CIN, Registered Office Address, and Email ID in English and local vernacular language.
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-white p-2.5 dark:border-amber-900/60 dark:bg-slate-900">
                    <p className="font-bold text-slate-900 dark:text-white">Photo 2: Interior of Registered Office with Director</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      Must show inside the office room with at least one Director or Key Managerial Personnel (KMP) physically present in the photograph.
                    </p>
                  </div>
                </div>
              </div>

              {/* Statutory Timelines & Penalties */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/40 md:col-span-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Statutory Deadlines & Post-Filing Requirements
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <p className="font-bold text-blue-600 dark:text-blue-400">Within 30 Days (Section 12(5))</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">File Form INC-22 with ROC</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">Failure attracts ₹1,000/day fine up to ₹1 Lakh on company and defaulting officers under Section 12(8).</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">Within 15 Days (GST Law)</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">File Form GST REG-14</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">Amendment of Core Field on GST portal with INC-22 approval and utility bill.</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">Immediate / Ongoing</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">Bank, Tax & Stationery Intimation</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">Update bank KYC, PAN/TAN address on TRACES, EPFO, ESIC, letterheads, and website.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Bank Intimation Letter */}
        {activeTab === 'bank-letter' && (
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Bank Intimation Letter Format (Address Change)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formal letter to be printed on Company Letterhead and submitted to your bank branch with certified Board Resolution and INC-22 receipt.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyBankLetter}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedType === 'letter' ? 'Copied to Clipboard!' : 'Copy Letter Text'}
                </button>
                <button
                  onClick={() => handleDownload('bank-letter')}
                  disabled={isDownloading === 'bank-letter'}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isDownloading === 'bank-letter' ? 'Generating...' : 'Download Word (.docx)'}
                </button>
              </div>
            </div>

            {/* Bank Particulars Quick Edit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. HDFC Bank Limited"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Bank Branch</label>
                <input
                  type="text"
                  value={formData.bankBranch || ''}
                  onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="e.g. Connaught Place Branch, New Delhi"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Current Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccountNumber || ''}
                  onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="50200012345678"
                />
              </div>
            </div>

            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-5 font-mono text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              {bankLetterText}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
