'use client'

import { useState, useMemo } from 'react'
import {
  Download,
  FileText,
  Building2,
  Copy,
  Printer,
  FileCheck2,
  Landmark,
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
  Sparkles,
} from 'lucide-react'
import {
  ModtFormData,
  DEFAULT_SAMPLE_MODT_DATA,
  ModtDocumentType,
  formatInrCurrency,
  convertNumberToIndianWords,
  TitleDeedItem,
} from '@/lib/doc-generator/modt-generator'
import Link from 'next/link'

const NOTIFIED_TOWNS = [
  'New Delhi',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Ahmedabad',
  'Pune',
]

const STATE_STAMP_RATES: Record<
  string,
  {
    state: string
    article: string
    rate: string
    maxCap: string
    registrationCompulsory: boolean
    noticeOfIntimation: boolean
    notes: string
  }
> = {
  maharashtra: {
    state: 'Maharashtra',
    article: 'Article 6(1), Maharashtra Stamp Act',
    rate: '0.2% of loan amount',
    maxCap: '₹10,00,000 (Ten Lakhs)',
    registrationCompulsory: false,
    noticeOfIntimation: true,
    notes:
      'Filing Notice of Intimation under Section 89B of Registration Act is MANDATORY within 30 days if MODT is not registered. Non-filing attracts penalty & fine.',
  },
  karnataka: {
    state: 'Karnataka',
    article: 'Article 6, Karnataka Stamp Act, 1957',
    rate: '0.1% to 0.2% of loan amount',
    maxCap: '₹10,00,000 (Ten Lakhs)',
    registrationCompulsory: true,
    noticeOfIntimation: false,
    notes:
      'Registration of MODT at Sub-Registrar office is compulsory in Karnataka under the Karnataka Registration (Amendment) Act.',
  },
  tamil_nadu: {
    state: 'Tamil Nadu',
    article: 'Article 6, Tamil Nadu Stamp Act',
    rate: '0.5% of loan amount',
    maxCap: '₹40,000 (Stamp) + 1% Regn (Cap ₹40,000)',
    registrationCompulsory: true,
    noticeOfIntimation: false,
    notes:
      'Registration of MODTD under Section 17 of Indian Registration Act within 4 months of execution is strictly mandatory in Tamil Nadu.',
  },
  delhi: {
    state: 'Delhi (NCT)',
    article: 'Article 6, Indian Stamp Act (Delhi Schedule)',
    rate: '0.5% of loan amount',
    maxCap: 'Subject to local municipal caps',
    registrationCompulsory: false,
    noticeOfIntimation: false,
    notes:
      'Equitable mortgage executed in Delhi NCT requires stamp duty payment under Article 6. Registration optional if purely recording past deposit.',
  },
  gujarat: {
    state: 'Gujarat',
    article: 'Article 6, Gujarat Stamp Act',
    rate: '0.25% of loan amount',
    maxCap: '₹4,50,000 (Four Lakh Fifty Thousand)',
    registrationCompulsory: false,
    noticeOfIntimation: false,
    notes:
      'Capped ad-valorem duty under Article 6. Banks insist on franked stamp duty or e-stamping before deed deposit.',
  },
  telangana: {
    state: 'Telangana & Andhra Pradesh',
    article: 'Article 6, Indian Stamp Act (TS/AP Schedule)',
    rate: '0.5% stamp duty + 0.1% registration fee',
    maxCap: 'No uniform ceiling',
    registrationCompulsory: true,
    noticeOfIntimation: false,
    notes:
      'Compulsory registration enforced by banks to avoid priority disputes over subsequent registered transfers.',
  },
  uttar_pradesh: {
    state: 'Uttar Pradesh',
    article: 'Article 6, Indian Stamp Act (UP Schedule)',
    rate: '0.5% of loan amount',
    maxCap: 'Subject to UP Stamp Rules',
    registrationCompulsory: false,
    noticeOfIntimation: false,
    notes:
      'Equitable mortgage must be executed in notified municipal towns in UP (Noida, Lucknow, Kanpur, Agra, Varanasi, etc.).',
  },
}

export default function EquitableMortgageClient() {
  const [formData, setFormData] = useState<ModtFormData>(DEFAULT_SAMPLE_MODT_DATA)
  const [activeTab, setActiveTab] = useState<ModtDocumentType | 'stamp_guide'>('modt')
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [selectedState, setSelectedState] = useState<string>('maharashtra')

  // Gemini AI Legal Property Assistant
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSuccessBadge, setAiSuccessBadge] = useState<string | null>(null)
  const [showAiPrompt, setShowAiPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const handlePolishProperty = async (promptToUse?: string) => {
    const textToPolish = (promptToUse || customPrompt || formData.propertyDescription).trim()
    if (!textToPolish) {
      setAiError('Please enter a brief description of the property or pick a quick suggestion below.')
      return
    }
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await fetch('/api/documents/legal-purpose-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'property_description',
          rawText: textToPolish,
          context: {
            city: formData.notifiedTown,
            state: formData.state,
          },
        }),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to polish property description')
      }
      const data = await res.json()
      if (data?.data?.polishedText) {
        setFormData(prev => ({ ...prev, propertyDescription: data.data.polishedText }))
        setAiSuccessBadge(
          data.data.propertyType
            ? `Conveyancing Language Applied (${data.data.propertyType})`
            : 'Conveyancing Language Applied'
        )
        setShowAiPrompt(false)
        setCustomPrompt('')
        setTimeout(() => setAiSuccessBadge(null), 6000)
      }
    } catch (err: any) {
      setAiError(err.message || 'AI assist encountered an error. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const isCorp = formData.mortgagorType === 'corporate'

  const handleInputChange = (field: keyof ModtFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBoundaryChange = (dir: keyof ModtFormData['boundaries'], val: string) => {
    setFormData(prev => ({
      ...prev,
      boundaries: { ...prev.boundaries, [dir]: val },
    }))
  }

  const handleAddDeed = () => {
    setFormData(prev => ({
      ...prev,
      titleDeeds: [
        ...prev.titleDeeds,
        {
          serialNo: prev.titleDeeds.length + 1,
          docType: 'Original Title Document',
          docNo: 'Regn. No. / Sanction Order No.',
          date: new Date().toLocaleDateString('en-GB'),
          executants: 'Executed in favour of Mortgagor',
        },
      ],
    }))
  }

  const handleRemoveDeed = (index: number) => {
    setFormData(prev => ({
      ...prev,
      titleDeeds: prev.titleDeeds
        .filter((_, idx) => idx !== index)
        .map((d, i) => ({ ...d, serialNo: i + 1 })),
    }))
  }

  const handleDeedChange = (index: number, field: keyof TitleDeedItem, val: any) => {
    setFormData(prev => {
      const updated = [...prev.titleDeeds]
      updated[index] = { ...updated[index], [field]: val }
      return { ...prev, titleDeeds: updated }
    })
  }

  const handleLoanAmountChange = (num: number) => {
    setFormData(prev => ({
      ...prev,
      loanAmount: num,
      loanAmountWords: convertNumberToIndianWords(num),
    }))
  }

  const handleDownload = async (docType: ModtDocumentType, format: 'docx' | 'pdf') => {
    const key = `${docType}-${format}`
    setIsDownloading(key)
    try {
      const response = await fetch('/api/documents/modt-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, documentType: docType, format }),
      })
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = (formData.companyName || formData.mortgagorName || 'MODT')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30)
      a.download = `${docType.toUpperCase()}_${safeName}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error(err)
      alert('Failed to generate document. Please check required fields.')
    } finally {
      setIsDownloading(null)
    }
  }

  // Generate plain text for clipboard
  const fullDocumentText = useMemo(() => {
    const deeds = formData.titleDeeds
      .map(
        (d, i) =>
          `${i + 1}. ${d.docType} | Document No: ${d.docNo} | Date: ${d.date} | Executants: ${d.executants}`
      )
      .join('\n')

    if (activeTab === 'undertaking') {
      return `AFFIDAVIT-CUM-DECLARATION & INDEMNITY UNDERTAKING\n\nI/We, ${
        isCorp ? formData.director1Name + ' of ' + formData.companyName : formData.mortgagorName
      }, do hereby solemnly affirm and declare:\n\n1. That I/the Company am the sole and absolute owner of ${
        formData.propertyDescription
      }.\n2. That all deposited title deeds with ${formData.bankName} are authentic original documents.\n3. That no prior mortgage or litigation exists.\n\nVerified at ${
        formData.notifiedTown
      } on ${formData.executionDate}.`
    }

    if (activeTab === 'letter_of_deposit') {
      return `Date: ${formData.executionDate}\nTo,\nThe Branch Manager,\n${formData.bankName},\n${
        formData.bankBranch
      }\n\nSubject: Deposit of Original Title Deeds for creating Equitable Mortgage - ${
        formData.loanFacilityName
      } of ${formatInrCurrency(formData.loanAmount)}\n\nDear Sir/Madam,\nI/We confirm depositing original deeds:\n${deeds}\n\nYours faithfully,\n${
        isCorp ? 'For ' + formData.companyName : formData.mortgagorName
      }`
    }

    if (activeTab === 'chg1_extract') {
      return `CERTIFIED TRUE COPY OF THE BOARD RESOLUTION OF ${formData.companyName.toUpperCase()}\nHELD ON ${
        formData.meetingDate
      }\n\nRESOLVED THAT the consent of the Board be accorded to create an Equitable Mortgage over ${
        formData.propertyDescription
      } in favour of ${formData.bankName} for ${formatInrCurrency(
        formData.loanAmount
      )} under Section 179(3)(e) & Section 77 of Companies Act, 2013.\n\nFor ${formData.companyName}\n${
        formData.director1Name
      }, Director (DIN: ${formData.director1Din})`
    }

    // Default: MODT
    return `MEMORANDUM OF DEPOSIT OF TITLE DEEDS (MODT)\n(Under Section 58(f) of Transfer of Property Act, 1882)\n\nExecuted on ${
      formData.executionDate
    } at Notified Town of ${formData.notifiedTown}, ${formData.state}\n\nBY: ${
      isCorp ? formData.companyName + ' (' + formData.cin + ')' : formData.mortgagorName
    }\nIN FAVOUR OF: ${formData.bankName}, ${formData.bankBranch}\n\nWHEREAS:\n1. The Lender sanctioned ${
      formData.loanFacilityName
    } of ${formatInrCurrency(formData.loanAmount)} (${formData.loanAmountWords}) vide letter dated ${
      formData.sanctionLetterDate
    }.\n2. Repayment is secured by Equitable Mortgage.\n\nFIRST SCHEDULE (Original Title Deeds Deposited):\n${deeds}\n\nSECOND SCHEDULE (Property Details):\nDescription: ${
      formData.propertyDescription
    }\nPlot/Survey: ${formData.surveyOrPlotNo} | Area: ${formData.propertyArea}\nBoundaries: North: ${
      formData.boundaries.north
    }, South: ${formData.boundaries.south}, East: ${formData.boundaries.east}, West: ${
      formData.boundaries.west
    }\n\nEXECUTED BY MORTGAGOR\nWITNESSES:\n1. ${formData.witness1Name}\n2. ${formData.witness2Name}`
  }, [formData, activeTab, isCorp])

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
      {/* Top Workstation Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Transfer of Property Act, 1882 • Section 58(f)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Banking Standard (SARFAESI Ready)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              MODT (Memorandum of Deposit of Title Deeds) Workstation
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Draft, customize, and export institutional-grade Equitable Mortgage documents with Schedule of Title Deeds, Mortgagor Undertaking, Bank Letter & MCA Form CHG-1 filing clauses.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => handleDownload(activeTab === 'stamp_guide' ? 'modt' : activeTab, 'docx')}
              disabled={!!isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading?.includes('docx') ? 'Generating Word...' : 'Download Word (.docx)'}
            </button>
            <button
              onClick={() => handleDownload(activeTab === 'stamp_guide' ? 'modt' : activeTab, 'pdf')}
              disabled={!!isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading?.includes('pdf') ? 'Generating PDF...' : 'Download PDF (.pdf)'}
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

        {/* 5-Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-b border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab('modt')}
            className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'modt'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. MODT Agreement (Main)
          </button>
          <button
            onClick={() => setActiveTab('undertaking')}
            className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'undertaking'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            2. Mortgagor Affidavit & Undertaking
          </button>
          <button
            onClick={() => setActiveTab('letter_of_deposit')}
            className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'letter_of_deposit'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Landmark className="w-4 h-4" />
            3. Bank Covering Letter of Deposit
          </button>
          <button
            onClick={() => setActiveTab('chg1_extract')}
            className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'chg1_extract'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            4. Corporate Resolution (Form CHG-1)
          </button>
          <button
            onClick={() => setActiveTab('stamp_guide')}
            className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'stamp_guide'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-4 h-4" />
            5. State Stamp Duty & Filing Guide
          </button>
        </div>
      </div>

      {/* Main Workstation Body: Left Customizer / Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[750px]">
        {/* LEFT COLUMN: Customizer Form Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 space-y-6 overflow-y-auto max-h-[850px]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-600" />
              Mortgagor Profile & Entity Type
            </h3>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleInputChange('mortgagorType', 'corporate')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  formData.mortgagorType === 'corporate'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Company
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('mortgagorType', 'individual')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  formData.mortgagorType === 'individual'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('mortgagorType', 'joint')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  formData.mortgagorType === 'joint'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Joint Owners
              </button>
            </div>
          </div>

          {/* Section 1: Mortgagor Particulars */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>{isCorp ? 'Company Particulars' : 'Mortgagor Details'}</span>
              {isCorp && (
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono">
                  Sec 77 Mandate
                </span>
              )}
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {isCorp ? 'Company Name' : 'Mortgagor Full Name'}
              </label>
              <input
                type="text"
                value={isCorp ? formData.companyName : formData.mortgagorName}
                onChange={e =>
                  isCorp
                    ? (handleInputChange('companyName', e.target.value),
                      handleInputChange('mortgagorName', e.target.value))
                    : handleInputChange('mortgagorName', e.target.value)
                }
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {isCorp ? 'CIN' : 'PAN'}
                </label>
                <input
                  type="text"
                  value={isCorp ? formData.cin : formData.mortgagorPanOrCin}
                  onChange={e =>
                    isCorp
                      ? handleInputChange('cin', e.target.value)
                      : handleInputChange('mortgagorPanOrCin', e.target.value)
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {isCorp ? 'Authorized Director' : "Father's / Spouse Name"}
                </label>
                <input
                  type="text"
                  value={isCorp ? formData.director1Name : formData.mortgagorFatherOrRep}
                  onChange={e =>
                    isCorp
                      ? handleInputChange('director1Name', e.target.value)
                      : handleInputChange('mortgagorFatherOrRep', e.target.value)
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {isCorp ? 'Registered Office Address' : 'Residential Address'}
              </label>
              <textarea
                rows={2}
                value={isCorp ? formData.registeredOffice : formData.mortgagorAddress}
                onChange={e =>
                  isCorp
                    ? (handleInputChange('registeredOffice', e.target.value),
                      handleInputChange('mortgagorAddress', e.target.value))
                    : handleInputChange('mortgagorAddress', e.target.value)
                }
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Section 2: Bank & Credit Facility */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Lender & Sanctioned Facility</span>
              <span className="text-[10px] text-slate-400">Section 58(a) TPA</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Bank / Lender Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={e => handleInputChange('bankName', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Branch Office
                </label>
                <input
                  type="text"
                  value={formData.bankBranch}
                  onChange={e => handleInputChange('bankBranch', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Sanction Letter No.
                </label>
                <input
                  type="text"
                  value={formData.sanctionLetterNo}
                  onChange={e => handleInputChange('sanctionLetterNo', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Sanction Letter Date
                </label>
                <input
                  type="text"
                  value={formData.sanctionLetterDate}
                  onChange={e => handleInputChange('sanctionLetterDate', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Loan Amount (in ₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.loanAmount}
                  onChange={e => handleLoanAmountChange(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold pl-8"
                />
                <span className="absolute left-3 top-2 text-xs text-slate-400">₹</span>
              </div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium italic">
                {formData.loanAmountWords}
              </p>
            </div>
          </div>

          {/* Section 3: Notified Town (Territorial Jurisdiction under Sec 58(f)) */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Notified Town / Place of Execution
              </h4>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                Mandatory Sec 58(f)
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Deposit of title deeds MUST occur in a notified town (though the property may be situated anywhere in India).
            </p>

            <div className="flex flex-wrap gap-1.5">
              {NOTIFIED_TOWNS.map(town => (
                <button
                  key={town}
                  type="button"
                  onClick={() => handleInputChange('notifiedTown', town)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition font-medium ${
                    formData.notifiedTown.toLowerCase() === town.toLowerCase()
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {town}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  City of Deposit
                </label>
                <input
                  type="text"
                  value={formData.notifiedTown}
                  onChange={e => handleInputChange('notifiedTown', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Execution Date
                </label>
                <input
                  type="text"
                  value={formData.executionDate}
                  onChange={e => handleInputChange('executionDate', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: First Schedule (Title Deeds List) */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                First Schedule: Deposited Title Deeds ({formData.titleDeeds.length})
              </h4>
              <button
                type="button"
                onClick={handleAddDeed}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Deed
              </button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {formData.titleDeeds.map((deed, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Deed #{idx + 1}
                    </span>
                    {formData.titleDeeds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDeed(idx)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Remove deed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Document Nature (e.g. Original Sale Deed)"
                    value={deed.docType}
                    onChange={e => handleDeedChange(idx, 'docType', e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Doc / Regn No."
                      value={deed.docNo}
                      onChange={e => handleDeedChange(idx, 'docNo', e.target.value)}
                      className="w-full text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                    />
                    <input
                      type="text"
                      placeholder="Date (DD/MM/YYYY)"
                      value={deed.date}
                      onChange={e => handleDeedChange(idx, 'date', e.target.value)}
                      className="w-full text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Second Schedule (Property Boundaries) */}
          <div className="space-y-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Second Schedule: Property & Boundaries
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Property Description (Second Schedule)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAiPrompt(!showAiPrompt)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                >
                  <Sparkles className="size-3 text-indigo-600 dark:text-indigo-400" />
                  <span>{showAiPrompt ? 'Close AI' : '✨ AI Polish with Gemini'}</span>
                </button>
              </div>

              {showAiPrompt && (
                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200">
                      Describe property in plain English:
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Gemini 2.5 Flash</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. industrial shed on plot 42 okhla phase 3 with boundary wall & power"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePolishProperty()}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handlePolishProperty()}
                      disabled={aiLoading}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shrink-0 disabled:opacity-50 transition"
                    >
                      {aiLoading ? 'Refining...' : 'Refine'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500">Quick Presets:</span>
                    {[
                      'Industrial Land & Built-up Factory Shed',
                      'Commercial Office Unit in Tech Park',
                      'Residential Apartment with Undivided Share',
                      'Freehold Commercial Showroom Building',
                      'Industrial Warehouse with RCC Structure',
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePolishProperty(preset)}
                        disabled={aiLoading}
                        className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300 transition"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {aiError && <p className="text-[11px] text-rose-600 dark:text-rose-400">{aiError}</p>}
                </div>
              )}

              {aiSuccessBadge && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  <span>{aiSuccessBadge}</span>
                </div>
              )}

              <textarea
                rows={2}
                value={formData.propertyDescription}
                onChange={e => handleInputChange('propertyDescription', e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                  North
                </label>
                <input
                  type="text"
                  value={formData.boundaries.north}
                  onChange={e => handleBoundaryChange('north', e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                  South
                </label>
                <input
                  type="text"
                  value={formData.boundaries.south}
                  onChange={e => handleBoundaryChange('south', e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                  East
                </label>
                <input
                  type="text"
                  value={formData.boundaries.east}
                  onChange={e => handleBoundaryChange('east', e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                  West
                </label>
                <input
                  type="text"
                  value={formData.boundaries.west}
                  onChange={e => handleBoundaryChange('west', e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Specimen View (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-950 flex flex-col justify-between overflow-y-auto max-h-[850px]">
          {activeTab === 'stamp_guide' ? (
            /* Tab 5: State Stamp Duty & Compliance Guide */
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2 mb-1">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  State-Wise MODT Stamp Duty & Registration Guide
                </h3>
                <p className="text-xs text-indigo-800 dark:text-indigo-300">
                  Select your state to inspect statutory stamp duty provisions, ad-valorem caps, mandatory registration rules, and Notice of Intimation compliance.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Select State Jurisdiction
                </label>
                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="maharashtra">Maharashtra (0.2% max ₹10L • Notice of Intimation Sec 89B)</option>
                  <option value="karnataka">Karnataka (0.1%-0.2% • Compulsory Registration)</option>
                  <option value="tamil_nadu">Tamil Nadu (0.5% max ₹40k + 1% Reg • Mandatory Regn)</option>
                  <option value="delhi">Delhi NCT (0.5% • Section 58(f) Notified Town)</option>
                  <option value="gujarat">Gujarat (0.25% max ₹4.5L)</option>
                  <option value="telangana">Telangana & Andhra Pradesh (0.5% + 0.1% Regn)</option>
                  <option value="uttar_pradesh">Uttar Pradesh (0.5% • Notified Municipal Towns)</option>
                </select>
              </div>

              {STATE_STAMP_RATES[selectedState] && (
                <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {STATE_STAMP_RATES[selectedState].state}
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      {STATE_STAMP_RATES[selectedState].article}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                        Stamp Duty Rate
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {STATE_STAMP_RATES[selectedState].rate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                        Statutory Maximum Cap
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {STATE_STAMP_RATES[selectedState].maxCap}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                        Sub-Registrar Registration
                      </span>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          STATE_STAMP_RATES[selectedState].registrationCompulsory
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {STATE_STAMP_RATES[selectedState].registrationCompulsory
                          ? 'Compulsory by Law'
                          : 'Optional / Not Required'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                        Notice of Intimation (Sec 89B)
                      </span>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          STATE_STAMP_RATES[selectedState].noticeOfIntimation
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {STATE_STAMP_RATES[selectedState].noticeOfIntimation
                          ? 'Mandatory within 30 Days'
                          : 'Not Applicable'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
                    <strong>Statutory Note: </strong>
                    {STATE_STAMP_RATES[selectedState].notes}
                  </div>

                  {/* Estimated duty on current form loan amount */}
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                        Estimated Stamp Duty on {formatInrCurrency(formData.loanAmount)}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Based on {STATE_STAMP_RATES[selectedState].rate}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedState === 'maharashtra'
                          ? formatInrCurrency(Math.min(formData.loanAmount * 0.002, 1000000))
                          : selectedState === 'tamil_nadu'
                          ? formatInrCurrency(Math.min(formData.loanAmount * 0.005, 40000))
                          : selectedState === 'gujarat'
                          ? formatInrCurrency(Math.min(formData.loanAmount * 0.0025, 450000))
                          : formatInrCurrency(formData.loanAmount * 0.005)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cross-Link Card to Bank Loan Resolution */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Borrowing as a Corporate Entity?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Companies mortgaging property must pass a Board Resolution under Section 179(3)(d) and register the charge with the ROC in e-Form CHG-1 within 30 days.
                  </p>
                </div>
                <Link
                  href="/documents/board-resolution-bank-loan"
                  className="shrink-0 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition inline-flex items-center gap-1"
                >
                  Board Resolution Tool
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Tabs 1 to 4: Realtime Formatted Specimen Preview */
            <div className="space-y-6">
              {/* Document Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {activeTab === 'modt'
                      ? 'Live Draft: Memorandum of Deposit of Title Deeds'
                      : activeTab === 'undertaking'
                      ? 'Live Draft: Affidavit & Indemnity Undertaking'
                      : activeTab === 'letter_of_deposit'
                      ? 'Live Draft: Bank Letter of Deposit'
                      : 'Live Draft: Board Resolution for Form CHG-1'}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Auto-updates in real time as you adjust particulars on the left.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ready for Stamp & Signature
                  </span>
                </div>
              </div>

              {/* Rendered Letterhead / Legal Page Paper Canvas */}
              <div className="bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 rounded-xl border border-slate-200/90 dark:border-slate-800 font-serif text-slate-900 dark:text-slate-100 shadow-inner text-xs sm:text-sm leading-relaxed space-y-4">
                {activeTab === 'modt' && (
                  <>
                    <div className="text-center space-y-1 pb-4 border-b border-slate-300 dark:border-slate-700">
                      <h3 className="text-base sm:text-lg font-bold tracking-wide underline uppercase">
                        Memorandum of Deposit of Title Deeds
                      </h3>
                      <p className="text-xs italic text-slate-600 dark:text-slate-400">
                        (Evidencing Creation of Equitable Mortgage under Section 58(f) of Transfer of Property Act, 1882)
                      </p>
                    </div>

                    <p className="text-justify pt-2">
                      THIS MEMORANDUM OF DEPOSIT OF TITLE DEEDS is executed on this{' '}
                      <strong>{formData.executionDate}</strong> at the Notified Town/City of{' '}
                      <strong>{formData.notifiedTown}</strong>, State of <strong>{formData.state}</strong>;
                    </p>

                    <div className="text-center font-bold py-1">BY</div>
                    <p className="text-justify">
                      {isCorp ? (
                        <>
                          <strong>{formData.companyName}</strong>, a company incorporated under the Companies Act with CIN{' '}
                          <strong>{formData.cin}</strong>, having its Registered Office at{' '}
                          {formData.registeredOffice}, acting through its Authorized Director,{' '}
                          <strong>{formData.director1Name}</strong> (DIN: {formData.director1Din}) (hereinafter referred to as the &quot;MORTGAGOR&quot;).
                        </>
                      ) : (
                        <>
                          <strong>{formData.mortgagorName}</strong>, {formData.mortgagorFatherOrRep}, resident of{' '}
                          {formData.mortgagorAddress} (PAN: <strong>{formData.mortgagorPanOrCin}</strong>) (hereinafter referred to as the &quot;MORTGAGOR&quot;).
                        </>
                      )}
                    </p>

                    <div className="text-center font-bold py-1">IN FAVOUR OF</div>
                    <p className="text-justify">
                      <strong>{formData.bankName.toUpperCase()}</strong>, a banking corporation having its branch office at{' '}
                      {formData.bankBranch}, {formData.bankAddress} (hereinafter referred to as the &quot;LENDER&quot; / &quot;MORTGAGEE&quot;).
                    </p>

                    <div className="font-bold pt-2">WHEREAS:</div>
                    <ol className="list-decimal pl-5 space-y-2 text-justify">
                      <li>
                        The Lender has sanctioned credit facility/facilities comprising{' '}
                        <strong>{formData.loanFacilityName}</strong> up to an aggregate limit of{' '}
                        <strong>{formatInrCurrency(formData.loanAmount)}</strong> ({formData.loanAmountWords}) vide Sanction Letter Ref.{' '}
                        <strong>{formData.sanctionLetterNo}</strong> dated {formData.sanctionLetterDate}.
                      </li>
                      <li>
                        One of the conditions precedent to disbursement is the creation of an Equitable Mortgage under Section 58(f) of the Transfer of Property Act, 1882 over the immovable property described in the Second Schedule.
                      </li>
                      <li>
                        The Mortgagor is the sole and absolute owner of the scheduled property with clear, marketable, and unencumbered title.
                      </li>
                    </ol>

                    <div className="font-bold pt-2">
                      NOW THIS MEMORANDUM WITNESSETH AND RECORDS AS FOLLOWS:
                    </div>
                    <div className="space-y-2 text-justify">
                      <p>
                        <strong>1. Deposit in Notified Town:</strong> The Mortgagor confirms that on{' '}
                        {formData.executionDate} at {formData.bankBranch} in the Notified Town of{' '}
                        <strong>{formData.notifiedTown}</strong>, the Mortgagor physically and voluntarily handed over and deposited with the authorized officer of the Lender all original documents of title detailed in the <strong>First Schedule</strong> hereunder written.
                      </p>
                      <p>
                        <strong>2. Express Intent:</strong> The deposit of the said title deeds was made with the clear and unequivocal intention to create an Equitable Mortgage over the property described in the <strong>Second Schedule</strong> to secure repayment of {formatInrCurrency(formData.loanAmount)} with interest at {formData.interestRate}.
                      </p>
                      <p>
                        <strong>3. Continuing Security:</strong> This mortgage shall operate as a continuing security for all present and future obligations and balances.
                      </p>
                      <p>
                        <strong>4. SARFAESI Enforcement:</strong> The Lender shall have all statutory powers under the SARFAESI Act, 2002 and Transfer of Property Act, 1882 in the event of default.
                      </p>
                      {isCorp && (
                        <p>
                          <strong>5. MCA ROC Filing:</strong> The Mortgagor Company undertakes to file statutory e-Form CHG-1 with the Registrar of Companies under Section 77 of the Companies Act, 2013 within 30 days of execution.
                        </p>
                      )}
                    </div>

                    {/* Schedules */}
                    <div className="pt-4 border-t border-slate-300 dark:border-slate-700">
                      <h4 className="text-center font-bold text-xs sm:text-sm uppercase underline mb-2">
                        THE FIRST SCHEDULE ABOVE REFERRED TO
                      </h4>
                      <p className="text-center text-[11px] italic text-slate-500 mb-3">
                        (List of Original Title Deeds Deposited)
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-300 dark:border-slate-700">
                          <thead>
                            <tr className="bg-slate-200 dark:bg-slate-800 font-bold">
                              <th className="p-2 border border-slate-300 dark:border-slate-700">S.No</th>
                              <th className="p-2 border border-slate-300 dark:border-slate-700">Document Type</th>
                              <th className="p-2 border border-slate-300 dark:border-slate-700">Doc / Regn No.</th>
                              <th className="p-2 border border-slate-300 dark:border-slate-700">Date</th>
                              <th className="p-2 border border-slate-300 dark:border-slate-700">Executant / Parties</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.titleDeeds.map((d, i) => (
                              <tr key={i}>
                                <td className="p-2 border border-slate-300 dark:border-slate-700 font-bold">{i + 1}</td>
                                <td className="p-2 border border-slate-300 dark:border-slate-700">{d.docType}</td>
                                <td className="p-2 border border-slate-300 dark:border-slate-700 font-mono text-[11px]">{d.docNo}</td>
                                <td className="p-2 border border-slate-300 dark:border-slate-700">{d.date}</td>
                                <td className="p-2 border border-slate-300 dark:border-slate-700 text-[11px]">{d.executants}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-300 dark:border-slate-700">
                      <h4 className="text-center font-bold text-xs sm:text-sm uppercase underline mb-2">
                        THE SECOND SCHEDULE ABOVE REFERRED TO
                      </h4>
                      <p className="text-center text-[11px] italic text-slate-500 mb-2">
                        (Description of Immovable Mortgaged Property)
                      </p>
                      <p className="text-justify mb-2">
                        <strong>Property:</strong> {formData.propertyDescription} (Plot/Khasra: {formData.surveyOrPlotNo}, Extent: {formData.propertyArea}).
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                        <div><strong>North:</strong> {formData.boundaries.north}</div>
                        <div><strong>South:</strong> {formData.boundaries.south}</div>
                        <div><strong>East:</strong> {formData.boundaries.east}</div>
                        <div><strong>West:</strong> {formData.boundaries.west}</div>
                      </div>
                    </div>

                    {/* Signature Block */}
                    <div className="pt-6 flex justify-between items-end">
                      <div>
                        <p className="font-bold mb-1">WITNESSES:</p>
                        <p className="text-xs">1. {formData.witness1Name}</p>
                        <p className="text-xs">2. {formData.witness2Name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {isCorp ? `For ${formData.companyName}` : formData.mortgagorName}
                        </p>
                        <div className="h-10"></div>
                        <p className="text-xs italic text-slate-500">
                          {isCorp ? `(${formData.director1Name}) Director` : '(MORTGAGOR)'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'undertaking' && (
                  <>
                    <div className="text-center space-y-1 pb-4 border-b border-slate-300 dark:border-slate-700">
                      <h3 className="text-base sm:text-lg font-bold tracking-wide underline uppercase">
                        Affidavit-cum-Declaration & Indemnity Undertaking
                      </h3>
                      <p className="text-xs italic text-slate-600 dark:text-slate-400">
                        (In Respect of Equitable Mortgage Created under Section 58(f) of Transfer of Property Act, 1882)
                      </p>
                    </div>

                    <p className="text-justify pt-2">
                      I/We,{' '}
                      <strong>
                        {isCorp
                          ? `${formData.director1Name}, Director of ${formData.companyName} (CIN: ${formData.cin})`
                          : formData.mortgagorName}
                      </strong>
                      , do hereby solemnly affirm, declare, and undertake as under:
                    </p>

                    <ol className="list-decimal pl-5 space-y-3 text-justify">
                      <li>
                        <strong>Absolute Title:</strong> The Mortgagor is the sole, absolute, and exclusive owner of the immovable property bearing {formData.propertyDescription} (Plot/Khasra: {formData.surveyOrPlotNo}, Area: {formData.propertyArea}). The title is clear, marketable, freely transferable, and unencumbered.
                      </li>
                      <li>
                        <strong>Authentic Original Deeds:</strong> The title deeds, parent deeds, mutation certificates, and tax receipts deposited with {formData.bankName}, {formData.bankBranch} are original, authentic, genuine, and valid instruments. No prior mortgage exists.
                      </li>
                      <li>
                        <strong>No Litigation:</strong> There are no pending litigations, civil suits, IBC proceedings, DRT/NCLT proceedings, or tax attachment notices against the property.
                      </li>
                      <li>
                        <strong>Indemnity Covenant:</strong> The Mortgagor agrees to indemnify and keep indemnified {formData.bankName} against all losses, damages, legal costs, or claims arising from any defect in title.
                      </li>
                    </ol>

                    <div className="pt-8 flex justify-between items-end">
                      <div>
                        <p className="font-bold underline text-xs">VERIFICATION:</p>
                        <p className="text-xs max-w-xs text-slate-600 dark:text-slate-400">
                          Verified at {formData.notifiedTown} on {formData.executionDate} that contents are true and correct.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">DEPONENT</p>
                        <div className="h-10"></div>
                        <p className="text-xs text-slate-500">
                          {isCorp ? `(${formData.director1Name})` : `(${formData.mortgagorName})`}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'letter_of_deposit' && (
                  <>
                    <div className="space-y-1 pb-2">
                      <p>Date: {formData.executionDate}</p>
                      <p className="pt-2 font-bold">To,</p>
                      <p>The Branch Manager,</p>
                      <p className="font-bold">{formData.bankName}</p>
                      <p>{formData.bankBranch}</p>
                      <p>{formData.bankAddress}</p>
                    </div>

                    <div className="py-2 font-bold text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      Subject: Deposit of Original Title Deeds with intent to create Equitable Mortgage for securing {formData.loanFacilityName} of {formatInrCurrency(formData.loanAmount)} (Sanction Letter: {formData.sanctionLetterNo})
                    </div>

                    <p>Dear Sir / Madam,</p>

                    <p className="text-justify">
                      In terms of Sanction Letter No. <strong>{formData.sanctionLetterNo}</strong> dated{' '}
                      {formData.sanctionLetterDate}, I / we confirm that on this day, {formData.executionDate}, at your office in the notified town of <strong>{formData.notifiedTown}</strong>, I / we have deposited the following original title deeds relating to the property situated at {formData.propertyDescription}:
                    </p>

                    <div className="pl-4 space-y-1.5 font-sans text-xs">
                      {formData.titleDeeds.map((d, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="font-bold">{i + 1}.</span>
                          <span>
                            <strong>{d.docType}</strong> (Doc No: {d.docNo}, Dated: {d.date})
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-justify">
                      The deposit is made with the express intent to create an Equitable Mortgage under Section 58(f) of the Transfer of Property Act, 1882 to secure due repayment of {formatInrCurrency(formData.loanAmount)} ({formData.loanAmountWords}) with interest.
                    </p>

                    <p>Kindly acknowledge receipt of the original documents and provide safe custody confirmation.</p>

                    <div className="pt-6 text-right">
                      <p className="font-bold">
                        {isCorp ? `For ${formData.companyName}` : 'Yours faithfully,'}
                      </p>
                      <div className="h-10"></div>
                      <p className="text-xs">
                        {isCorp ? `(${formData.director1Name}) Director` : `(${formData.mortgagorName}) Mortgagor`}
                      </p>
                    </div>
                  </>
                )}

                {activeTab === 'chg1_extract' && (
                  <>
                    <div className="text-center space-y-1 pb-4 border-b border-slate-300 dark:border-slate-700">
                      <h3 className="text-base sm:text-lg font-bold tracking-wide uppercase">
                        {formData.companyName}
                      </h3>
                      <p className="text-xs font-mono">CIN: {formData.cin}</p>
                      <p className="text-[11px] italic text-slate-500">
                        Regd. Office: {formData.registeredOffice}
                      </p>
                    </div>

                    <div className="text-center font-bold text-xs underline py-2">
                      CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS HELD ON {formData.meetingDate}
                    </div>

                    <div className="space-y-3 text-justify pt-2">
                      <p>
                        <strong>RESOLVED THAT</strong> pursuant to Section 179(3)(d), Section 179(3)(e), and Section 77 of the Companies Act, 2013, the consent of the Board of Directors be and is hereby accorded to create an Equitable Mortgage under Section 58(f) of the Transfer of Property Act, 1882 by depositing original title deeds in respect of the Company&apos;s immovable property situated at {formData.propertyDescription} in favour of {formData.bankName}, {formData.bankBranch} to secure the credit facility of {formatInrCurrency(formData.loanAmount)} ({formData.loanAmountWords}).
                      </p>

                      <p>
                        <strong>RESOLVED FURTHER THAT</strong> {formData.director1Name}, Director (DIN: {formData.director1Din}) and {formData.director2Name}, Director (DIN: {formData.director2Din}) be and are hereby severally authorized to deposit the original title deeds, sign the Memorandum of Deposit of Title Deeds, Declarations, Undertakings, and sign and submit statutory e-Form CHG-1 on the MCA portal within 30 days of creation of charge.&quot;
                      </p>
                    </div>

                    <div className="pt-8 text-right">
                      <p className="font-bold">For {formData.companyName}</p>
                      <div className="h-10"></div>
                      <p className="text-xs font-bold">
                        ({formData.director1Name})
                      </p>
                      <p className="text-xs text-slate-500">Director (DIN: {formData.director1Din})</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Section 58(f) TPA & Stamp Act Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(activeTab === 'stamp_guide' ? 'modt' : activeTab, 'docx')}
                disabled={!!isDownloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Word (.docx)
              </button>
              <button
                onClick={() => handleDownload(activeTab === 'stamp_guide' ? 'modt' : activeTab, 'pdf')}
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
