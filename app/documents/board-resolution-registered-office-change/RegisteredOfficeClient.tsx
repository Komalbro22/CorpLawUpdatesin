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
  FileCheck2,
  Camera,
  MapPin,
  Landmark,
  Compass,
  ShieldCheck,
  Scale,
  Newspaper,
  BookOpen,
} from 'lucide-react'
import {
  RegisteredOfficeFormData,
  DEFAULT_SAMPLE_REG_OFFICE_DATA,
  ShiftingScope,
} from '@/lib/doc-generator/registered-office-generator'

const SCOPE_CONFIG: Record<
  ShiftingScope,
  {
    label: string
    shortBadge: string
    legalRef: string
    approvalNeeded: string
    formsNeeded: string
    desc: string
    icon: string
  }
> = {
  same_city: {
    label: 'Within Same City / Town / Village',
    shortBadge: 'Same City (Local Limits)',
    legalRef: 'Section 12(5)(a) • Rule 25 & 27',
    approvalNeeded: 'Board Resolution only',
    formsNeeded: 'e-Form INC-22 (within 30 days)',
    desc: 'Simple shifting within municipal limits. No shareholders meeting, no Regional Director approval.',
    icon: '🏙️',
  },
  outside_local: {
    label: 'Outside Local Limits (Same RoC & State)',
    shortBadge: 'Outside Local Limits',
    legalRef: 'Section 12(5) • Rule 25 & 27',
    approvalNeeded: 'Board Resolution + Special Resolution (Shareholders)',
    formsNeeded: 'e-Form MGT-14 + INC-22',
    desc: 'Shifting to another town or city in the same State under the same RoC. Requires 75% shareholder majority at EGM.',
    icon: '🗺️',
  },
  different_roc: {
    label: 'Different RoC (Within Same State)',
    shortBadge: 'Different RoC (Same State)',
    legalRef: 'Section 12(5) 2nd Proviso • Rule 28',
    approvalNeeded: 'Board Res. + Special Res. + Regional Director (RD) Confirmation',
    formsNeeded: 'MGT-14 + INC-23 (RD) + INC-28 + INC-22',
    desc: 'Applicable in Maharashtra (Mumbai ↔ Pune) or Tamil Nadu (Chennai ↔ Coimbatore). Mandates RD petition & newspaper notice.',
    icon: '🏛️',
  },
  different_state: {
    label: 'From One State to Another (Inter-State)',
    shortBadge: 'Inter-State Shifting',
    legalRef: 'Section 12 & Section 13(4) • Rule 30',
    approvalNeeded: 'Board Res. + Special Res. (MOA Alteration) + Central Govt / RD Order',
    formsNeeded: 'MGT-14 + INC-23 + INC-28 + INC-22 (New CIN)',
    desc: 'Shifting across state borders requires altering Clause II of MOA, list of creditors affidavit, Form INC-26 newspaper ads, and RD confirmation.',
    icon: '🇮🇳',
  },
}

export default function RegisteredOfficeClient() {
  const [formData, setFormData] = useState<RegisteredOfficeFormData>(
    DEFAULT_SAMPLE_REG_OFFICE_DATA
  )
  const [activeTab, setActiveTab] = useState<
    'preview' | 'special-resolution' | 'inc26' | 'form' | 'checklist' | 'bank-letter'
  >('preview')
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<string | null>(null)

  const currentScope = formData.shiftingScope || 'same_city'

  const handleInputChange = (field: keyof RegisteredOfficeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleScopeChange = (scope: ShiftingScope) => {
    setFormData((prev) => ({ ...prev, shiftingScope: scope }))
    if (scope === 'same_city' && (activeTab === 'special-resolution' || activeTab === 'inc26')) {
      setActiveTab('preview')
    } else if (scope === 'outside_local' && activeTab === 'inc26') {
      setActiveTab('special-resolution')
    }
  }

  const handleDownload = async (
    format: 'docx' | 'pdf' | 'bank-letter',
    type: 'resolution' | 'special-resolution' | 'inc26-notice' | 'bank-letter' = 'resolution'
  ) => {
    try {
      setIsDownloading(`${type}-${format}`)
      const res = await fetch('/api/documents/registered-office-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData, format, type }),
      })

      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const companySlug = (formData.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')
      
      if (type === 'bank-letter') {
        a.download = `Bank_Intimation_Letter_${companySlug}.docx`
      } else if (type === 'special-resolution') {
        a.download = `Special_Resolution_EGM_Notice_${companySlug}.docx`
      } else if (type === 'inc26-notice') {
        a.download = `Form_INC26_Newspaper_Notice_${companySlug}.docx`
      } else if (format === 'docx') {
        a.download = `Board_Resolution_Registered_Office_${currentScope}_${companySlug}.docx`
      } else {
        a.download = `Board_Resolution_Registered_Office_${currentScope}_${companySlug}.pdf`
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
    setFormData({
      ...DEFAULT_SAMPLE_REG_OFFICE_DATA,
      shiftingScope: currentScope,
    })
  }

  const handleClearForm = () => {
    setFormData({
      shiftingScope: currentScope,
      companyName: '',
      cin: '',
      meetingDate: '',
      meetingTime: '',
      meetingVenue: '',
      chairpersonName: '',
      directorsPresent: '',
      oldAddress: '',
      newAddress: '',
      oldState: '',
      newState: '',
      oldRoc: '',
      newRoc: '',
      effectiveDate: '',
      premisesType: 'rented',
      ownerName: '',
      directorName: '',
      directorDin: '',
      companySecretaryName: '',
      csMembershipNo: '',
      certifiedDate: '',
      egmDate: '',
      egmTime: '',
      egmVenue: '',
      rdJurisdiction: '',
      newspaperEnglish: '',
      newspaperVernacular: '',
      creditorCount: '',
      creditorDebtAmount: '',
      bankName: '',
      bankBranch: '',
      bankAccountNumber: '',
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2500)
  }

  // Dynamic text representations for clipboard
  const resolutionClipboardText = useMemo(() => {
    const comp = formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'
    const cin = formData.cin || 'U72900DL2024PTC999999'
    const dt = formData.meetingDate || '15/09/2026'
    const tm = formData.meetingTime || '11:00 A.M.'
    const venue = formData.meetingVenue || formData.oldAddress || 'New Delhi'
    const chair = formData.chairpersonName || 'Shri A. K. Sharma'
    const oldAddr = formData.oldAddress || 'Old Registered Office'
    const newAddr = formData.newAddress || 'New Registered Office'
    const effDate = formData.effectiveDate || dt
    const dir = formData.directorName || 'Sample Director'
    const din = formData.directorDin || '09999999'
    const cs = formData.companySecretaryName || 'CS Sample Sharma'
    const csMem = formData.csMembershipNo || 'A99999'

    let titleText = ''
    let bodyText = ''

    if (currentScope === 'same_city') {
      titleText = 'SHIFTING OF REGISTERED OFFICE WITHIN LOCAL LIMITS OF SAME CITY / TOWN / VILLAGE'
      bodyText = `"RESOLVED THAT pursuant to the provisions of Section 12(5)(a) and other applicable provisions of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014, the approval of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from:\n\n${oldAddr}\n\nTo:\n\n${newAddr}\n\nwith effect from ${effDate}, within the local limits of the same city / town / village.\n\nRESOLVED FURTHER THAT the No Objection Certificate (NOC) and utility bill placed before the meeting be accepted as conclusive proof of right to use the premises.\n\nRESOLVED FURTHER THAT ${dir}, Director (DIN: ${din}) and/or ${cs}, Company Secretary (Membership No.: ${csMem}) be authorized to file e-Form INC-22 with ROC within 30 days."`
    } else if (currentScope === 'outside_local') {
      titleText = 'SHIFTING OF REGISTERED OFFICE OUTSIDE LOCAL LIMITS (SAME ROC & STATE)'
      bodyText = `"RESOLVED THAT pursuant to the provisions of Section 12(5) of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014, and subject to the approval of the Members by Special Resolution, the approval of the Board be and is hereby accorded to shift the Registered Office of the Company from ${oldAddr} to ${newAddr}.\n\nRESOLVED FURTHER THAT an Extraordinary General Meeting (EGM) be convened on ${formData.egmDate || '10/10/2026'} for seeking approval of the Members by Special Resolution.\n\nRESOLVED FURTHER THAT ${dir}, Director (DIN: ${din}) and/or ${cs}, Company Secretary (Membership No.: ${csMem}) be authorized to file e-Form MGT-14 within 30 days and e-Form INC-22 within 30 days of shifting."`
    } else if (currentScope === 'different_roc') {
      titleText = 'SHIFTING OF REGISTERED OFFICE FROM ONE ROC TO ANOTHER WITHIN SAME STATE'
      bodyText = `"RESOLVED THAT pursuant to Section 12(5) second proviso and Rule 28 of the Companies (Incorporation) Rules, 2014, and subject to approval of Members by Special Resolution and confirmation by the Regional Director (${formData.rdJurisdiction || 'Regional Director'}), the consent of the Board be and is hereby accorded to shift the Registered Office from ${oldAddr} (${formData.oldRoc || 'RoC 1'}) to ${newAddr} (${formData.newRoc || 'RoC 2'}).\n\nRESOLVED FURTHER THAT an EGM be convened on ${formData.egmDate || '10/10/2026'} for passing the Special Resolution, and an Application in Form INC-23 be filed with the Regional Director, followed by Form INC-28 (within 60 days) and Form INC-22 (within 30 days of INC-28)."`
    } else {
      titleText = 'SHIFTING OF REGISTERED OFFICE FROM ONE STATE TO ANOTHER (INTER-STATE)'
      bodyText = `"RESOLVED THAT pursuant to Section 12(5) and Section 13(4) of the Companies Act, 2013 read with Rule 30 of the Companies (Incorporation) Rules, 2014, and subject to Special Resolution of Members and confirmation by the Central Government / Regional Director (${formData.rdJurisdiction || 'Regional Director'}), the consent of the Board be and is hereby accorded to shift the Registered Office from ${formData.oldState || 'Delhi'} to ${formData.newState || 'Maharashtra'}.\n\nRESOLVED FURTHER THAT Clause II of the Memorandum of Association be altered accordingly.\n\nRESOLVED FURTHER THAT an EGM be convened on ${formData.egmDate || '10/10/2026'} to pass the Special Resolution, Petition in Form INC-23 be filed with the Regional Director, Form INC-26 newspaper notices be published, and Form INC-28 and INC-22 be filed with ROC."`
    }

    return `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${comp} HELD ON ${dt} AT ${tm} AT ${venue}

CIN: ${cin}
Registered Office: ${oldAddr}

${titleText}

${bodyText}

For ${comp}
________________________________________
${chair}
Chairperson / Director

CERTIFIED TRUE COPY:
For ${comp}
________________________________________
${dir}
Director (DIN: ${din})`
  }, [formData, currentScope])

  const specialResClipboardText = useMemo(() => {
    const comp = formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'
    const cin = formData.cin || 'U72900DL2024PTC999999'
    const oldAddr = formData.oldAddress || 'Old Registered Office'
    const newAddr = formData.newAddress || 'New Registered Office'
    const egmDt = formData.egmDate || '10/10/2026'
    const egmTm = formData.egmTime || '11:30 A.M.'
    const egmVn = formData.egmVenue || 'Registered Office / VC'
    const dir = formData.directorName || 'Sample Director'
    const din = formData.directorDin || '09999999'

    return `NOTICE OF EXTRAORDINARY GENERAL MEETING (EGM)
${comp}
CIN: ${cin}
Registered Office: ${oldAddr}

NOTICE IS HEREBY GIVEN that an Extraordinary General Meeting of the Members of ${comp} will be held on ${egmDt} at ${egmTm} at ${egmVn} to transact the following Special Business:

SPECIAL RESOLUTION:
"RESOLVED THAT pursuant to the applicable provisions of the Companies Act, 2013, the consent of the Members be and is hereby accorded to shift the Registered Office of the Company from ${oldAddr} to ${newAddr}."

EXPLANATORY STATEMENT PURSUANT TO SECTION 102 OF THE COMPANIES ACT, 2013:
The Board of Directors evaluated the operational expansion, staffing requirements, and client proximity needs of the Company and resolved that shifting the registered office to ${newAddr} is in the best commercial interest of the Company.
None of the Directors, KMPs, or their relatives are interested in the proposed resolution, save to the extent of their shareholding.

By Order of the Board
For ${comp}
____________________________
${dir}, Director (DIN: ${din})`
  }, [formData])

  const inc26ClipboardText = useMemo(() => {
    const comp = formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'
    const cin = formData.cin || 'U72900DL2024PTC999999'
    const oldAddr = formData.oldAddress || 'Old Registered Office'
    const newAddr = formData.newAddress || 'New Registered Office'
    const rd = formData.rdJurisdiction || 'Regional Director, Northern Region, New Delhi'
    const egmDt = formData.egmDate || '10/10/2026'
    const dir = formData.directorName || 'Sample Director'
    const din = formData.directorDin || '09999999'

    return `FORM NO. INC-26 [Pursuant to Rule 30 of the Companies (Incorporation) Rules, 2014]
BEFORE THE REGIONAL DIRECTOR, ${rd.toUpperCase()}
IN THE MATTER OF SUB-SECTION (4) OF SECTION 13 OF THE COMPANIES ACT, 2013
AND IN THE MATTER OF ${comp.toUpperCase()} (CIN: ${cin})

PUBLIC NOTICE
Notice is hereby given to the General Public that the Company intends to make an application to the Central Government / Regional Director under Section 13(4) of the Companies Act, 2013 read with Rule 30 of the Companies (Incorporation) Rules, 2014, seeking confirmation of alteration of the Memorandum of Association of the Company in terms of the Special Resolution passed at the EGM held on ${egmDt}, to enable the Company to shift its Registered Office from ${oldAddr} to ${newAddr}.

Any person whose interest is likely to be affected by the proposed shifting may submit physical representations supported by an affidavit stating the nature of interest and grounds of opposition to ${rd}, within 14 days from publication, with copy to the Company.

For and on behalf of ${comp}
____________________________
${dir}, Director (DIN: ${din})`
  }, [formData])

  const letterClipboardText = useMemo(() => {
    const comp = formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'
    const dt = formData.meetingDate || '15/09/2026'
    const oldAddr = formData.oldAddress || '101, Old Business Hub, New Delhi - 110001'
    const newAddr = formData.newAddress || 'Plot No. 99, Sample Commercial Tower, New Delhi - 110020'
    const dir = formData.directorName || 'Sample Director'
    const din = formData.directorDin || '09999999'
    const bName = formData.bankName || 'HDFC Bank Limited'
    const bBranch = formData.bankBranch || 'Connaught Place Branch, New Delhi'
    const bAcc = formData.bankAccountNumber || '50200012345678'

    return `Date: ${dt}

To,
The Branch Manager,
${bName},
${bBranch}.

SUBJECT: INTIMATION FOR CHANGE OF REGISTERED OFFICE ADDRESS — CURRENT ACCOUNT NO.: ${bAcc}

Dear Sir / Madam,

We wish to inform you that the Board of Directors of ${comp} at its meeting held on ${dt} has approved the shifting of the Registered Office of the Company from:

Old Address: ${oldAddr}
New Address: ${newAddr}

The necessary statutory e-Form INC-22 has been submitted to the Registrar of Companies (ROC) pursuant to Section 12 of the Companies Act, 2013.

Kindly update the new Registered Office Address in your banking records for Current Account No. ${bAcc}.

Enclosures:
1. Certified True Copy of Board Resolution dated ${dt}
2. Copy of e-Form INC-22 filed with ROC along with MCA Challan / SRN Receipt
3. Proof of Address for New Premises (Electricity Bill / Lease Agreement)
4. Self-attested copy of Company PAN Card

Thanking you,
Yours faithfully,
For ${comp}

____________________________
${dir}, Director (DIN: ${din})`
  }, [formData])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 shadow-2xl border border-indigo-800/40">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Statutory Shifting Engine • Companies Act, 2013 (Sec 12 & 13)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Registered Office Shifting{' '}
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
              Master Suite & Resolution Generator
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
            Draft and download certified Board Resolutions, Special Resolutions, Section 102 Explanatory Statements, Form INC-26 newspaper notices, and Bank Intimation Letters across all 4 shifting scopes under Indian corporate law.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Form INC-22 Compliant
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-400" /> Section 12 & 13 Verified
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" /> Rule 25(2) Photo Guidance
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" /> Instant Word & PDF Export
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Interactive 4-Way Shifting Scope Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Select Registered Office Shifting Scope
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The resolution text, statutory roadmaps, and required approvals will automatically adapt to your chosen legal scope.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800">
            Current: {SCOPE_CONFIG[currentScope].shortBadge}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(Object.keys(SCOPE_CONFIG) as ShiftingScope[]).map((scopeKey) => {
            const config = SCOPE_CONFIG[scopeKey]
            const isSelected = currentScope === scopeKey

            return (
              <button
                key={scopeKey}
                onClick={() => handleScopeChange(scopeKey)}
                type="button"
                className={`p-4 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-50/90 to-white dark:from-indigo-950/40 dark:to-slate-900 border-indigo-600 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{config.icon}</span>
                    {isSelected ? (
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        Select
                      </span>
                    )}
                  </div>
                  <h3
                    className={`text-sm font-bold leading-snug ${
                      isSelected
                        ? 'text-indigo-950 dark:text-indigo-200'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {config.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {config.desc}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1">
                  <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 dark:text-slate-500">Approval:</span>{' '}
                    {config.approvalNeeded}
                  </p>
                  <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    <span className="text-slate-400 dark:text-slate-500">Forms:</span>{' '}
                    {config.formsNeeded}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Action Downloads Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm font-bold">1-Click Statutory Downloads</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
              v2.15.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Formatted with ICSI SS-1 secretarial standards, statutory verification recitals, and address comparisons.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Board Resolution DOCX */}
          <button
            onClick={() => handleDownload('docx', 'resolution')}
            disabled={isDownloading !== null}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isDownloading === 'resolution-docx' ? 'Generating...' : 'Board Resolution (.docx)'}
          </button>

          {/* Board Resolution PDF */}
          <button
            onClick={() => handleDownload('pdf', 'resolution')}
            disabled={isDownloading !== null}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            {isDownloading === 'resolution-pdf' ? 'Generating...' : 'Printable PDF'}
          </button>

          {/* Special Resolution DOCX (Scopes 2, 3, 4) */}
          {currentScope !== 'same_city' && (
            <button
              onClick={() => handleDownload('docx', 'special-resolution')}
              disabled={isDownloading !== null}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4" />
              {isDownloading === 'special-resolution-docx'
                ? 'Generating...'
                : 'Special Resolution & Sec 102 (.docx)'}
            </button>
          )}

          {/* Form INC-26 Notice DOCX (Scopes 3, 4) */}
          {(currentScope === 'different_roc' || currentScope === 'different_state') && (
            <button
              onClick={() => handleDownload('docx', 'inc26-notice')}
              disabled={isDownloading !== null}
              className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Newspaper className="w-4 h-4" />
              {isDownloading === 'inc26-notice-docx'
                ? 'Generating...'
                : 'Form INC-26 Notice (.docx)'}
            </button>
          )}

          {/* Bank Letter DOCX */}
          <button
            onClick={() => handleDownload('bank-letter', 'bank-letter')}
            disabled={isDownloading !== null}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Landmark className="w-4 h-4 text-amber-400" />
            {isDownloading === 'bank-letter-bank-letter' ? 'Generating...' : 'Bank Letter (.docx)'}
          </button>
        </div>
      </div>

      {/* 4. Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'preview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Board Resolution
        </button>

        {currentScope !== 'same_city' && (
          <button
            onClick={() => setActiveTab('special-resolution')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === 'special-resolution'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Special Resolution & EGM
          </button>
        )}

        {(currentScope === 'different_roc' || currentScope === 'different_state') && (
          <button
            onClick={() => setActiveTab('inc26')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeTab === 'inc26'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Form INC-26 Notice
          </button>
        )}

        <button
          onClick={() => setActiveTab('form')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'form'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Customize Particulars
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'checklist'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Filing Roadmap & Checklist
        </button>

        <button
          onClick={() => setActiveTab('bank-letter')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'bank-letter'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Bank Intimation Letter
        </button>
      </div>

      {/* 5. Main Tab Content */}
      <div className="space-y-6">
        {/* TAB 1: Live Resolution Preview */}
        {activeTab === 'preview' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Live Resolution Preview • {SCOPE_CONFIG[currentScope].shortBadge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Certified True Copy of Board Resolution
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(resolutionClipboardText, 'resolution')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedType === 'resolution' ? 'Copied!' : 'Copy Resolution'}
                </button>
                <button
                  onClick={() => handleDownload('docx', 'resolution')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Word (.docx)
                </button>
              </div>
            </div>

            {/* Document Simulated Sheet */}
            <div className="p-6 sm:p-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-sm shadow-inner space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-base sm:text-lg font-bold tracking-wide uppercase text-slate-900 dark:text-white">
                  {formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'}
                </h4>
                <p className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-400">
                  CIN: {formData.cin || 'U72900DL2024PTC999999'}
                </p>
                <p className="text-xs italic text-slate-500 dark:text-slate-400">
                  Registered Office: {formData.oldAddress || '101, Old Business Hub, Barakhamba Road, Connaught Place, New Delhi - 110001'}
                </p>
              </div>

              <div className="text-center py-2 border-y border-slate-300 dark:border-slate-700 space-y-1">
                <p className="font-bold text-xs sm:text-sm underline tracking-wide text-slate-900 dark:text-white">
                  CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS
                </p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  HELD ON {formData.meetingDate || '15/09/2026'} AT {formData.meetingTime || '11:00 A.M.'} AT {formData.meetingVenue || '101, Old Business Hub, Connaught Place, New Delhi - 110001'}
                </p>
              </div>

              <div className="text-xs space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">DIRECTORS PRESENT:</p>
                <pre className="font-serif whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-xs">
                  {formData.directorsPresent || '1. Shri A. K. Sharma (Director & Chairperson)\n2. Smt. Priya Verma (Director)\n3. Shri Vikram Mehta (Director)'}
                </pre>
                <p className="pt-2">
                  <span className="font-bold text-slate-900 dark:text-white">CHAIRPERSON: </span>
                  {formData.chairpersonName || 'Shri A. K. Sharma'}, Director, took the Chair.
                </p>
              </div>

              <div className="text-center pt-2">
                <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-900 dark:text-white uppercase bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded border border-indigo-200 dark:border-indigo-800">
                  {SCOPE_CONFIG[currentScope].label}
                </span>
              </div>

              {/* Scope specific preview resolution body */}
              <div className="space-y-4 text-justify text-xs sm:text-[13px] leading-relaxed">
                {currentScope === 'same_city' && (
                  <>
                    <p>
                      <strong>"RESOLVED THAT</strong> pursuant to the provisions of Section 12(5)(a) and other applicable provisions, if any, of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014 and the Articles of Association of the Company, the consent and approval of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from:
                    </p>
                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 space-y-2 font-mono text-xs">
                      <p>
                        <strong className="text-slate-900 dark:text-white">FROM:</strong> {formData.oldAddress || '101, Old Business Hub, Barakhamba Road, Connaught Place, New Delhi - 110001'}
                      </p>
                      <p>
                        <strong className="text-slate-900 dark:text-white">TO:</strong> {formData.newAddress || 'Plot No. 99, Sample Commercial Tower, Phase II, Okhla Industrial Area, New Delhi - 110020'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Effective Date: {formData.effectiveDate || '15/09/2026'} • Within same city limits
                      </p>
                    </div>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> the No Objection Certificate (NOC) received from the owner of the new premises together with the latest electricity bill (not older than 2 months) and rent agreement be and are hereby accepted as conclusive proof of right to use the premises.
                    </p>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> {formData.directorName || 'Sample Director'}, Director (DIN: {formData.directorDin || '09999999'}) and/or {formData.companySecretaryName || 'CS Sample Sharma'}, Company Secretary (Membership No.: {formData.csMembershipNo || 'A99999'}) be and are hereby severally authorized to digitally sign, certify, and file e-Form INC-22 with the Registrar of Companies within 30 days.
                    </p>
                  </>
                )}

                {currentScope === 'outside_local' && (
                  <>
                    <p>
                      <strong>"RESOLVED THAT</strong> pursuant to the provisions of Section 12(5) and other applicable provisions, if any, of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014, and subject to the approval of the Members of the Company by way of a Special Resolution, the consent and approval of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from:
                    </p>
                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 space-y-2 font-mono text-xs">
                      <p>
                        <strong className="text-slate-900 dark:text-white">FROM:</strong> {formData.oldAddress || 'Old Registered Office'}
                      </p>
                      <p>
                        <strong className="text-slate-900 dark:text-white">TO:</strong> {formData.newAddress || 'New Registered Office'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Outside local municipal limits • Same State & RoC Jurisdiction
                      </p>
                    </div>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> an Extraordinary General Meeting (EGM) of the Members of the Company be convened on <strong>{formData.egmDate || '10/10/2026'}</strong> at <strong>{formData.egmTime || '11:30 A.M.'}</strong> at {formData.egmVenue || 'the Registered Office of the Company'} for seeking approval of the Members by Special Resolution.
                    </p>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> the draft Notice of EGM together with the Explanatory Statement under Section 102 of the Companies Act, 2013 be approved and issued to all Members, Directors, and Auditors.
                    </p>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> upon passing of the Special Resolution, {formData.directorName || 'Sample Director'}, Director (DIN: {formData.directorDin || '09999999'}) and/or {formData.companySecretaryName || 'CS Sample Sharma'}, Company Secretary be authorized to file e-Form MGT-14 within 30 days and subsequently file e-Form INC-22 within 30 days of shifting.
                    </p>
                  </>
                )}

                {currentScope === 'different_roc' && (
                  <>
                    <p>
                      <strong>"RESOLVED THAT</strong> pursuant to Section 12(5) second proviso and Rule 28 of the Companies (Incorporation) Rules, 2014, and subject to the approval of the Members by Special Resolution and confirmation by the Regional Director ({formData.rdJurisdiction || 'Regional Director, Western Region'}), the consent of the Board be and is hereby accorded to shift the Registered Office from {formData.oldAddress || 'Old Address'} ({formData.oldRoc || 'RoC Mumbai'}) to {formData.newAddress || 'New Address'} ({formData.newRoc || 'RoC Pune'}).
                    </p>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> an EGM be convened on {formData.egmDate || '10/10/2026'} to seek approval of Members by Special Resolution.
                    </p>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> {formData.directorName || 'Sample Director'}, Director (DIN: {formData.directorDin || '09999999'}) be authorized to file an Application / Petition in e-Form INC-23 with the Regional Director under Rule 28, publish notices in Form INC-26 in an English daily and vernacular daily newspaper, serve individual notices to all creditors, file e-Form MGT-14, file e-Form INC-28 within 60 days of the confirmation order, and subsequently file e-Form INC-22 within 30 days.
                    </p>
                  </>
                )}

                {currentScope === 'different_state' && (
                  <>
                    <p>
                      <strong>"RESOLVED THAT</strong> pursuant to the provisions of Section 12(5), Section 13(4), (5), (7) and other applicable provisions of the Companies Act, 2013 read with Rule 30 of the Companies (Incorporation) Rules, 2014, and subject to the approval of the Members by Special Resolution and confirmation by the Central Government / Regional Director ({formData.rdJurisdiction || 'Regional Director, Northern Region, New Delhi'}), the consent of the Board of Directors be and is hereby accorded to shift the Registered Office of the Company from the {formData.oldState || 'NCT of Delhi'} to the {formData.newState || 'State of Maharashtra'}, from {formData.oldAddress || 'Old Address'} to {formData.newAddress || 'New Address'}.
                    </p>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> subject to the approval of Members and confirmation by the Regional Director, Clause II of the Memorandum of Association of the Company be altered by substituting the words "{formData.oldState || 'NCT of Delhi'}" with the words "{formData.newState || 'State of Maharashtra'}".
                    </p>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> an EGM be convened on {formData.egmDate || '10/10/2026'} to consider and pass the Special Resolution.
                    </p>
                    <p>
                      <strong>RESOLVED FURTHER THAT</strong> {formData.directorName || 'Sample Director'}, Director (DIN: {formData.directorDin || '09999999'}) be authorized to prepare a list of creditors verified by affidavit under Rule 30(2), file Petition in e-Form INC-23, publish newspaper notices in Form INC-26, serve notices to all creditors, ROC, and Chief Secretary of {formData.oldState || 'Delhi'}, file e-Form INC-28 within 30 days of the RD order, and file e-Form INC-22 for issuance of updated Certificate of Incorporation / CIN."
                    </p>
                  </>
                )}

                <p>
                  <strong>RESOLVED FURTHER THAT</strong> the Company arrange to affix the Company's Name and Registered Office Address in legible letters outside and inside the premises in English and the local language as mandated under Section 12(3)(a), arrange geo-tagged photographs under Rule 25(2), file Form GST REG-14 within 15 days, and intimate banking partners."
                </p>
              </div>

              <div className="pt-6 border-t border-slate-300 dark:border-slate-700 flex justify-between items-end text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">CERTIFIED TRUE COPY</p>
                  <p>For {formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'}</p>
                  <div className="pt-6">
                    <p className="font-bold text-slate-900 dark:text-white">{formData.directorName || 'Sample Director'}</p>
                    <p className="text-slate-500">Director / Authorised Signatory (DIN: {formData.directorDin || '09999999'})</p>
                    <p className="text-[11px] text-slate-400">Date: {formData.certifiedDate || formData.meetingDate || '15/09/2026'}</p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <p>For {formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'}</p>
                  <div className="pt-6">
                    <p className="font-bold text-slate-900 dark:text-white">{formData.chairpersonName || 'Shri A. K. Sharma'}</p>
                    <p className="text-slate-500">Chairperson / Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Special Resolution & EGM Notice (Scopes 2, 3, 4) */}
        {activeTab === 'special-resolution' && currentScope !== 'same_city' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Extraordinary General Meeting (EGM) Package
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Notice of EGM, Special Resolution & Section 102 Explanatory Statement
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(specialResClipboardText, 'special-res')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedType === 'special-res' ? 'Copied!' : 'Copy EGM Package'}
                </button>
                <button
                  onClick={() => handleDownload('docx', 'special-resolution')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Word (.docx)
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-sm shadow-inner space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-base sm:text-lg font-bold tracking-wide uppercase text-slate-900 dark:text-white">
                  {formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'}
                </h4>
                <p className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-400">
                  CIN: {formData.cin || 'U72900DL2024PTC999999'}
                </p>
                <p className="text-xs italic text-slate-500 dark:text-slate-400">
                  Registered Office: {formData.oldAddress || 'Old Registered Office'}
                </p>
              </div>

              <div className="text-center py-2 border-y border-slate-300 dark:border-slate-700">
                <p className="font-bold text-sm tracking-wide text-slate-900 dark:text-white underline">
                  NOTICE OF EXTRAORDINARY GENERAL MEETING (EGM)
                </p>
              </div>

              <p className="text-xs sm:text-sm text-justify">
                <strong>NOTICE IS HEREBY GIVEN</strong> that an Extraordinary General Meeting of the Members of {formData.companyName || 'the Company'} will be held on <strong>{formData.egmDate || '10/10/2026'}</strong> at <strong>{formData.egmTime || '11:30 A.M.'}</strong> at <strong>{formData.egmVenue || 'the Registered Office of the Company / via VC'}</strong> to transact the following Special Business:
              </p>

              <div className="space-y-3">
                <p className="font-bold text-xs uppercase text-slate-900 dark:text-white">
                  ITEM NO. 1: SPECIAL RESOLUTION
                </p>
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-xs sm:text-[13px] leading-relaxed">
                  <p>
                    <strong>"RESOLVED THAT</strong> pursuant to Section 12(5) {currentScope === 'different_state' ? 'and Section 13(4) of Companies Act, 2013' : ''} and other applicable provisions, the consent of the Members of the Company be and is hereby accorded to shift the Registered Office from {formData.oldAddress || 'Old Address'} to {formData.newAddress || 'New Address'}."
                  </p>
                  {currentScope === 'different_state' && (
                    <p className="mt-2">
                      <strong>"RESOLVED FURTHER THAT</strong> Clause II (Situation Clause) of the Memorandum of Association be altered to reflect the new state."
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-300 dark:border-slate-700 space-y-3 text-xs sm:text-[13px]">
                <p className="font-bold text-sm text-center uppercase tracking-wide underline text-slate-900 dark:text-white">
                  EXPLANATORY STATEMENT PURSUANT TO SECTION 102 OF THE COMPANIES ACT, 2013
                </p>
                <p className="text-justify">
                  The Board of Directors evaluated the commercial rationale and operational expansion of the Company. Shifting to {formData.newAddress || 'the new premises'} offers state-of-the-art infrastructure and closer proximity to key markets.
                </p>
                <p className="text-justify">
                  None of the Directors, KMPs, or their relatives are concerned or interested in the resolution except to the extent of their shareholding. The Board recommends passing the Special Resolution unanimously.
                </p>
              </div>

              <div className="pt-4 text-right text-xs">
                <p>By Order of the Board</p>
                <p className="font-bold text-slate-900 dark:text-white">{formData.directorName || 'Sample Director'}</p>
                <p className="text-slate-500">Director (DIN: {formData.directorDin || '09999999'})</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Form INC-26 Newspaper Notice (Scopes 3 & 4) */}
        {activeTab === 'inc26' && (currentScope === 'different_roc' || currentScope === 'different_state') && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Mandatory Newspaper Publication • Rule 28 / Rule 30
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Form No. INC-26 Public Newspaper Notice
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(inc26ClipboardText, 'inc26')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedType === 'inc26' ? 'Copied!' : 'Copy Notice'}
                </button>
                <button
                  onClick={() => handleDownload('docx', 'inc26-notice')}
                  className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Word (.docx)
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-sm shadow-inner space-y-4 max-w-4xl mx-auto">
              <div className="text-center space-y-1">
                <p className="font-bold text-base text-slate-900 dark:text-white">FORM NO. INC-26</p>
                <p className="text-xs italic text-slate-500">[Pursuant to Rule 30 of the Companies (Incorporation) Rules, 2014]</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase pt-2">
                  BEFORE THE REGIONAL DIRECTOR, {formData.rdJurisdiction?.toUpperCase() || 'REGIONAL DIRECTOR, NORTHERN REGION, NEW DELHI'}
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  IN THE MATTER OF SUB-SECTION (4) OF SECTION 13 OF THE COMPANIES ACT, 2013
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  AND IN THE MATTER OF {formData.companyName?.toUpperCase() || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'} (CIN: {formData.cin || 'U72900DL2024PTC999999'})
                </p>
              </div>

              <div className="text-center py-1">
                <span className="font-bold text-xs uppercase underline tracking-wider text-slate-900 dark:text-white">
                  PUBLIC NOTICE
                </span>
              </div>

              <p className="text-xs sm:text-[13px] text-justify">
                Notice is hereby given to the General Public that the Company intends to make an application to the Central Government / Regional Director under Section 13(4) of the Companies Act, 2013 read with Rule 30 of the Companies (Incorporation) Rules, 2014, seeking confirmation of alteration of the Memorandum of Association in terms of the Special Resolution passed at the EGM held on <strong>{formData.egmDate || '10/10/2026'}</strong> to enable the Company to shift its Registered Office from:
              </p>

              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl space-y-1 text-xs">
                <p><strong>Existing Office:</strong> {formData.oldAddress || 'Old Address'}</p>
                <p><strong>Proposed Office:</strong> {formData.newAddress || 'New Address'}</p>
              </div>

              <p className="text-xs sm:text-[13px] text-justify">
                Any person whose interest is likely to be affected by the proposed shifting may deliver representations supported by an affidavit stating the nature of interest and grounds of opposition to the <strong>{formData.rdJurisdiction || 'Regional Director, Northern Region, New Delhi'}</strong> within <strong>fourteen (14) days</strong> from the date of publication of this notice, with a copy to the applicant Company.
              </p>

              <div className="pt-4 text-right text-xs">
                <p>For and on behalf of the Applicant Company</p>
                <p className="font-bold text-slate-900 dark:text-white">{formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'}</p>
                <p className="mt-2 font-bold">{formData.directorName || 'Sample Director'}, Director (DIN: {formData.directorDin || '09999999'})</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Customize Particulars */}
        {activeTab === 'form' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Customize Company & Meeting Particulars
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update company details to dynamically regenerate resolutions, EGM notices, and bank letters.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadSample}
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-indigo-200 dark:border-indigo-800"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Load Sample Data
                </button>
                <button
                  onClick={handleClearForm}
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                >
                  Clear Form
                </button>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section 1: Company Profile */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  1. Company Identity
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g. SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Identification Number (CIN) *
                  </label>
                  <input
                    type="text"
                    value={formData.cin || ''}
                    onChange={(e) => handleInputChange('cin', e.target.value)}
                    placeholder="e.g. U72900DL2024PTC999999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Board Meeting Particulars */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  2. Board Meeting Particulars
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Meeting Date *
                    </label>
                    <input
                      type="text"
                      value={formData.meetingDate || ''}
                      onChange={(e) => handleInputChange('meetingDate', e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Meeting Time *
                    </label>
                    <input
                      type="text"
                      value={formData.meetingTime || ''}
                      onChange={(e) => handleInputChange('meetingTime', e.target.value)}
                      placeholder="e.g. 11:00 A.M."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Venue *
                  </label>
                  <input
                    type="text"
                    value={formData.meetingVenue || ''}
                    onChange={(e) => handleInputChange('meetingVenue', e.target.value)}
                    placeholder="e.g. Registered office of the company"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 3: Registered Office Addresses */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  3. Address Shifting Particulars
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Existing Registered Office Address *
                    </label>
                    <textarea
                      rows={3}
                      value={formData.oldAddress || ''}
                      onChange={(e) => handleInputChange('oldAddress', e.target.value)}
                      placeholder="Full existing registered office address with PIN code"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Proposed Registered Office Address *
                    </label>
                    <textarea
                      rows={3}
                      value={formData.newAddress || ''}
                      onChange={(e) => handleInputChange('newAddress', e.target.value)}
                      placeholder="Full new registered office address with PIN code"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Scope-conditional fields for RoC and States */}
                {currentScope === 'different_roc' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Existing RoC Jurisdiction *
                      </label>
                      <input
                        type="text"
                        value={formData.oldRoc || ''}
                        onChange={(e) => handleInputChange('oldRoc', e.target.value)}
                        placeholder="e.g. RoC Mumbai"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        New RoC Jurisdiction *
                      </label>
                      <input
                        type="text"
                        value={formData.newRoc || ''}
                        onChange={(e) => handleInputChange('newRoc', e.target.value)}
                        placeholder="e.g. RoC Pune"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                )}

                {currentScope === 'different_state' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Origin State / UT *
                      </label>
                      <input
                        type="text"
                        value={formData.oldState || ''}
                        onChange={(e) => handleInputChange('oldState', e.target.value)}
                        placeholder="e.g. NCT of Delhi"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Destination State / UT *
                      </label>
                      <input
                        type="text"
                        value={formData.newState || ''}
                        onChange={(e) => handleInputChange('newState', e.target.value)}
                        placeholder="e.g. State of Maharashtra"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: EGM Particulars (for Scopes 2, 3, 4) */}
              {currentScope !== 'same_city' && (
                <div className="space-y-4 md:col-span-2 p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    4. Extraordinary General Meeting (EGM) Details (Required for Special Resolution)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Proposed EGM Date *
                      </label>
                      <input
                        type="text"
                        value={formData.egmDate || ''}
                        onChange={(e) => handleInputChange('egmDate', e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        EGM Time *
                      </label>
                      <input
                        type="text"
                        value={formData.egmTime || ''}
                        onChange={(e) => handleInputChange('egmTime', e.target.value)}
                        placeholder="e.g. 11:30 A.M."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        EGM Venue / Mode *
                      </label>
                      <input
                        type="text"
                        value={formData.egmVenue || ''}
                        onChange={(e) => handleInputChange('egmVenue', e.target.value)}
                        placeholder="Registered Office / VC"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 5: Regional Director Bench (for Scopes 3 & 4) */}
              {(currentScope === 'different_roc' || currentScope === 'different_state') && (
                <div className="space-y-4 md:col-span-2 p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    5. Regional Director (RD) & Newspaper Particulars
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Regional Director Bench *
                      </label>
                      <input
                        type="text"
                        value={formData.rdJurisdiction || ''}
                        onChange={(e) => handleInputChange('rdJurisdiction', e.target.value)}
                        placeholder="e.g. Regional Director, Northern Region, New Delhi"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        English Newspaper for Form INC-26 *
                      </label>
                      <input
                        type="text"
                        value={formData.newspaperEnglish || ''}
                        onChange={(e) => handleInputChange('newspaperEnglish', e.target.value)}
                        placeholder="e.g. The Financial Express"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 6: Authorised Signatories */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  6. Authorised Director & Chairperson
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Director Name (Authorised for Form INC-22) *
                  </label>
                  <input
                    type="text"
                    value={formData.directorName || ''}
                    onChange={(e) => handleInputChange('directorName', e.target.value)}
                    placeholder="e.g. Sample Director"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Director DIN *
                    </label>
                    <input
                      type="text"
                      value={formData.directorDin || ''}
                      onChange={(e) => handleInputChange('directorDin', e.target.value)}
                      placeholder="e.g. 09999999"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Chairperson Name *
                    </label>
                    <input
                      type="text"
                      value={formData.chairpersonName || ''}
                      onChange={(e) => handleInputChange('chairpersonName', e.target.value)}
                      placeholder="e.g. Shri A. K. Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 7: Bank Details for Intimation Letter */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  7. Bank Intimation Letter Particulars
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankName || ''}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="e.g. HDFC Bank Limited"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Branch *
                    </label>
                    <input
                      type="text"
                      value={formData.bankBranch || ''}
                      onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                      placeholder="e.g. Connaught Place Branch"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber || ''}
                      onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                      placeholder="e.g. 50200012345678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Filing Roadmap & Checklist */}
        {activeTab === 'checklist' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                <span>Statutory Compliance Roadmap • {SCOPE_CONFIG[currentScope].shortBadge}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                Mandatory Legal Procedure & Step-by-Step Filing Sequence
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Governed under {SCOPE_CONFIG[currentScope].legalRef}
              </p>
            </div>

            {/* Dynamic Step-by-Step Roadmap */}
            <div className="space-y-4">
              {/* Step 1: Always Board Meeting */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Convene Board Meeting & Pass Board Resolution
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-10 leading-relaxed">
                  Serve at least 7 days' notice under Section 173(3). Pass the resolution approving the shifting of registered office, accept Landlord NOC and utility bills, and authorize Director/CS for filings.
                  {currentScope !== 'same_city' && ' Also approve convening of EGM and the draft Notice with Section 102 Explanatory Statement.'}
                </p>
              </div>

              {/* Step 2: EGM (Scopes 2, 3, 4) */}
              {currentScope !== 'same_city' && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Convene EGM & Pass Special Resolution (75% Majority)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-10 leading-relaxed">
                    Serve 21 clear days' notice under Section 101 (or shorter notice with 95% consent). Pass Special Resolution approving the shifting {currentScope === 'different_state' && 'and altering Clause II of Memorandum of Association (MOA)'}.
                  </p>
                </div>
              )}

              {/* Step 3: File Form MGT-14 (Scopes 2, 3, 4) */}
              {currentScope !== 'same_city' && (
                <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                      File e-Form MGT-14 with ROC (Strict 30-Day Limit)
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-300 pl-10 leading-relaxed">
                    Pursuant to Section 117(1), file certified copy of the Special Resolution along with Explanatory Statement under Section 102 within 30 days of passing.
                  </p>
                </div>
              )}

              {/* Step 4 & 5: Regional Director Petition & Newspaper Notice (Scopes 3 & 4) */}
              {(currentScope === 'different_roc' || currentScope === 'different_state') && (
                <>
                  <div className="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                        4
                      </span>
                      <h4 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                        Publish Form INC-26 & Petition Regional Director (Form INC-23)
                      </h4>
                    </div>
                    <p className="text-xs text-teal-900 dark:text-teal-300 pl-10 leading-relaxed">
                      Publish public notice in Form INC-26 in an English daily and vernacular daily newspaper in the district. Serve individual notices to all creditors, debenture holders, RoC, and Chief Secretary. File Petition in e-Form INC-23 with verified list of creditors and affidavit.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        5
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Obtain Regional Director Order & File e-Form INC-28
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-10 leading-relaxed">
                      Attend RD hearings. Upon receipt of confirmation order, file certified copy in e-Form INC-28 with ROC within {currentScope === 'different_roc' ? '60 days' : '30 days'}.
                    </p>
                  </div>
                </>
              )}

              {/* Final Core Step: File Form INC-22 */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs">
                    {currentScope === 'same_city' ? '2' : currentScope === 'outside_local' ? '4' : '6'}
                  </span>
                  <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                    File e-Form INC-22 with ROC (30-Day Mandate)
                  </h4>
                </div>
                <p className="text-xs text-indigo-900 dark:text-indigo-300 pl-10 leading-relaxed">
                  File Form INC-22 within 30 days of resolution (or within 30 days of INC-28 registration). Attach Board resolution, utility bill (&lt; 2 months), Landlord NOC, and the 2 mandatory Rule 25(2) geo-tagged photos.
                </p>
              </div>

              {/* Post-Filing Intimations: GST, Banks */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentScope === 'same_city' ? '3' : currentScope === 'outside_local' ? '5' : '7'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Post-Approval Updates: GST REG-14, Banks, Name Board
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-10 leading-relaxed">
                  File Form GST REG-14 for core field amendment within 15 days on the GST portal {currentScope === 'different_state' && '(or apply for fresh GSTIN in the new state)'}. Submit intimation letter to banks with INC-22 receipt and update company name boards in English and vernacular language.
                </p>
              </div>
            </div>

            {/* Rule 25(2) Geo-Tagged Photographs Guide */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-amber-300">
                  Mandatory Rule 25(2) Geo-Tagged Photograph Requirement for Form INC-22
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Under Rule 25(2) of Companies (Incorporation) Rules, 2014, the MCA strictly requires two clear photographs of the registered office:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <p className="font-bold text-slate-200">1. Exterior Photograph</p>
                  <p className="text-slate-400 text-[11px]">
                    Showing the registered office building exterior with the company's official name board clearly displaying Company Name, CIN, Address, and Email in English and the local language.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                  <p className="font-bold text-slate-200">2. Interior Photograph</p>
                  <p className="text-slate-400 text-[11px]">
                    Showing the interior office layout with at least one Director or Key Managerial Personnel (KMP) physically present inside the registered office.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Bank Intimation Letter */}
        {activeTab === 'bank-letter' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Corporate Bank Intimation Letter
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Address Change Letter to Bank Branch Manager
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(letterClipboardText, 'letter')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedType === 'letter' ? 'Copied!' : 'Copy Letter'}
                </button>
                <button
                  onClick={() => handleDownload('bank-letter', 'bank-letter')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Word (.docx)
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-serif leading-relaxed text-sm shadow-inner space-y-4 max-w-3xl mx-auto">
              <div className="text-right text-xs">
                Date: {formData.meetingDate || '15/09/2026'}
              </div>

              <div className="text-xs space-y-0.5">
                <p>To,</p>
                <p className="font-bold text-slate-900 dark:text-white">The Branch Manager,</p>
                <p>{formData.bankName || 'HDFC Bank Limited'},</p>
                <p>{formData.bankBranch || 'Connaught Place Branch, New Delhi'}.</p>
              </div>

              <div className="py-2">
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  SUBJECT: INTIMATION FOR CHANGE OF REGISTERED OFFICE ADDRESS — CURRENT ACCOUNT NO.: {formData.bankAccountNumber || '50200012345678'}
                </p>
              </div>

              <p className="text-xs">Dear Sir / Madam,</p>

              <p className="text-xs sm:text-[13px] text-justify">
                We wish to inform you that the Board of Directors of {formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'} at its meeting held on {formData.meetingDate || '15/09/2026'} has approved the shifting of the Registered Office of the Company from:
              </p>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <p><strong>Old Address:</strong> {formData.oldAddress || '101, Old Business Hub, Barakhamba Road, Connaught Place, New Delhi - 110001'}</p>
                <p><strong>New Address:</strong> {formData.newAddress || 'Plot No. 99, Sample Commercial Tower, Phase II, Okhla Industrial Area, New Delhi - 110020'}</p>
              </div>

              <p className="text-xs sm:text-[13px] text-justify">
                The necessary statutory e-Form INC-22 has been submitted to the Registrar of Companies (ROC) pursuant to Section 12 of the Companies Act, 2013.
              </p>

              <p className="text-xs sm:text-[13px] text-justify">
                We kindly request you to update the new Registered Office Address in your banking records and system for our Current Account No. {formData.bankAccountNumber || '50200012345678'}, and forward all future bank correspondence, cheque books, and communication to the new address.
              </p>

              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Enclosures:</p>
                <p>1. Certified True Copy of Board Resolution dated {formData.meetingDate || '15/09/2026'}</p>
                <p>2. Copy of e-Form INC-22 filed with ROC along with MCA Challan / SRN Receipt</p>
                <p>3. Proof of Address for New Premises (Electricity Bill / Lease Agreement)</p>
                <p>4. Self-attested copy of Company PAN Card</p>
              </div>

              <div className="pt-6 text-xs space-y-1">
                <p>Thanking you,</p>
                <p>Yours faithfully,</p>
                <p className="font-bold text-slate-900 dark:text-white">For {formData.companyName || 'SAMPLE COMMERCIAL VENTURES PRIVATE LIMITED'}</p>
                <div className="pt-6">
                  <p className="font-bold text-slate-900 dark:text-white">{formData.directorName || 'Sample Director'}</p>
                  <p className="text-slate-500">Authorised Signatory / Director (DIN: {formData.directorDin || '09999999'})</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
