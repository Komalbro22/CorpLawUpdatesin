'use client'

import { useState, useMemo } from 'react'
import {
  Download,
  FileText,
  Building2,
  Copy,
  Printer,
  Sparkles,
  FileCheck2,
  Landmark,
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Search,
  Lock,
  Percent,
  Clock,
  Briefcase,
  HelpCircle,
} from 'lucide-react'
import {
  BankLoanFormData,
  DEFAULT_SAMPLE_BANK_LOAN_DATA,
  LoanFacilityType,
  SecurityType,
  SigningAuthority,
  calculateBorrowingLimit,
  formatInrCurrency,
} from '@/lib/doc-generator/bank-loan-generator'

const FACILITY_CONFIG: Record<
  LoanFacilityType,
  {
    label: string
    shortBadge: string
    legalSection: string
    typicalSecurity: string
    typicalTenure: string
    desc: string
    iconBg: string
    iconColor: string
  }
> = {
  term_loan: {
    label: 'Term Loan (Capex / Machinery / Vehicles)',
    shortBadge: 'Term Loan',
    legalSection: 'Section 179(3)(d) • Section 77',
    typicalSecurity: 'Hypothecation of purchased machinery / assets & equitable mortgage',
    typicalTenure: '3 to 7 Years (Equated Monthly Instalments)',
    desc: 'Long-term financing for purchasing fixed assets, factory expansion, commercial real estate, or commercial vehicles.',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/80',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  working_capital: {
    label: 'Working Capital / Cash Credit (CC)',
    shortBadge: 'Cash Credit (CC)',
    legalSection: 'Section 179(3)(d) • Section 77',
    typicalSecurity: 'Hypothecation of present and future stocks, raw materials & book debts',
    typicalTenure: '12 Months (Renewable annually against stock audit)',
    desc: 'Revolving credit limit for day-to-day operational expenses, inventory holding, and trade receivable financing.',
    iconBg: 'bg-blue-100 dark:bg-blue-950/80',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  cash_credit: {
    label: 'Cash Credit Facility (Stock Hypothecation)',
    shortBadge: 'Cash Credit',
    legalSection: 'Section 179(3)(d) • Section 77',
    typicalSecurity: 'First charge on entire current assets of the company',
    typicalTenure: '1 Year renewable upon submission of audited financials',
    desc: 'Standard cash credit facility with monthly drawing power calculations based on paid stock statements.',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/80',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  overdraft: {
    label: 'Bank Overdraft (OD) Facility',
    shortBadge: 'Overdraft (OD)',
    legalSection: 'Section 179(3)(d)',
    typicalSecurity: 'Lien on Fixed Deposits, Mutual Funds, or Immovable Property',
    typicalTenure: 'On-demand revolving limit',
    desc: 'Permits company to withdraw funds in excess of current account balance up to the sanctioned overdraft limit.',
    iconBg: 'bg-amber-100 dark:bg-amber-950/80',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  bank_guarantee_lc: {
    label: 'Non-Fund Based: Letter of Credit (LC) / Bank Guarantee (BG)',
    shortBadge: 'LC / BG Facility',
    legalSection: 'Section 179(3)(d) • Section 180(1)(c)',
    typicalSecurity: 'Cash margin (10-25%) plus counter-indemnity by company',
    typicalTenure: 'Project specific / Contract tenure (Up to 36 months)',
    desc: 'Trade finance instruments including Performance Bank Guarantees, Financial Guarantees, and Inland/Import Letters of Credit.',
    iconBg: 'bg-purple-100 dark:bg-purple-950/80',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  unsecured_loan: {
    label: 'Unsecured Business / Corporate Loan',
    shortBadge: 'Unsecured Loan',
    legalSection: 'Section 179(3)(d)',
    typicalSecurity: 'Clean / Unsecured (No charge on company assets)',
    typicalTenure: '12 to 36 Months',
    desc: 'Cash-flow based corporate borrowing without collateral or mortgage. No MCA Form CHG-1 charge registration required.',
    iconBg: 'bg-rose-100 dark:bg-rose-950/80',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  composite: {
    label: 'Composite Credit Limit (Term Loan + CC + BG)',
    shortBadge: 'Composite Limit',
    legalSection: 'Section 179(3)(d) • Section 180(1)(c) • Section 77',
    typicalSecurity: 'Pari-passu charge on fixed & current assets, collateral mortgage',
    typicalTenure: 'Multiple tranches per facility sub-limit',
    desc: 'Comprehensive multi-facility credit sanction combining fund-based and non-fund-based banking lines.',
    iconBg: 'bg-teal-100 dark:bg-teal-950/80',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
}

export default function BankLoanClient() {
  const [formData, setFormData] = useState<BankLoanFormData>(DEFAULT_SAMPLE_BANK_LOAN_DATA)
  const [activeTab, setActiveTab] = useState<
    'resolution' | 'special-resolution' | 'bank-letter' | 'chg1-extract' | 'checklist'
  >('resolution')
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [copiedType, setCopiedType] = useState<string | null>(null)
  const [cinLoading, setCinLoading] = useState(false)
  const [cinError, setCinError] = useState<string | null>(null)

  const limits = useMemo(() => calculateBorrowingLimit(formData), [formData])

  const handleInputChange = (field: keyof BankLoanFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFacilityChange = (facility: LoanFacilityType) => {
    const config = FACILITY_CONFIG[facility]
    setFormData((prev) => ({
      ...prev,
      facilityType: facility,
      facilityName: config.label,
      securityDescription: config.typicalSecurity,
      tenure: config.typicalTenure,
      hasChg1Filing: facility !== 'unsecured_loan',
    }))
  }

  // CIN Lookup
  const handleCinLookup = async () => {
    if (!formData.cin || formData.cin.trim().length < 21) {
      setCinError('Please enter a valid 21-digit Corporate Identification Number (CIN).')
      return
    }
    setCinLoading(true)
    setCinError(null)
    try {
      const res = await fetch(`/api/company/${formData.cin.trim().toUpperCase()}`)
      if (!res.ok) throw new Error('Company not found on MCA database')
      const data = await res.json()
      if (data && data.company_name) {
        const isPublic = (data.class_of_company || '').toLowerCase().includes('public')
        setFormData((prev) => ({
          ...prev,
          companyName: data.company_name,
          registeredOffice: data.registered_office_address || prev.registeredOffice,
          companyType: isPublic ? 'public' : 'private',
          paidUpCapital: Number(data.paid_up_capital) || prev.paidUpCapital,
        }))
      }
    } catch (err: any) {
      setCinError(err.message || 'Unable to fetch company particulars.')
    } finally {
      setCinLoading(false)
    }
  }

  // File Downloads
  const handleDownload = async (
    format: 'docx' | 'pdf' | 'bank-letter',
    type: 'resolution' | 'special-resolution' | 'bank-letter' | 'chg1-extract' = 'resolution'
  ) => {
    try {
      setIsDownloading(`${type}-${format}`)
      const res = await fetch('/api/documents/bank-loan-download', {
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
      const facilitySlug = formData.facilityType || 'term_loan'

      if (type === 'bank-letter') {
        a.download = `Bank_Covering_Letter_${companySlug}.docx`
      } else if (type === 'special-resolution') {
        a.download = `Special_Resolution_Section_180_${companySlug}.docx`
      } else if (type === 'chg1-extract') {
        a.download = `CHG1_Resolution_Extract_${companySlug}.docx`
      } else if (format === 'docx') {
        a.download = `Board_Resolution_Bank_Loan_${facilitySlug}_${companySlug}.docx`
      } else {
        a.download = `Board_Resolution_Bank_Loan_${facilitySlug}_${companySlug}.pdf`
      }

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error(err)
      alert('Error generating document. Please try again.')
    } finally {
      setIsDownloading(null)
    }
  }

  // Copy to Clipboard
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2500)
  }

  // Print
  const handlePrint = () => {
    window.print()
  }

  // Resolution text for preview & clipboard
  const boardResolutionText = useMemo(() => {
    const amtFormatted = formatInrCurrency(formData.loanAmount)
    const comp = formData.companyName.toUpperCase()
    return `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${comp} HELD ON ${formData.meetingDate} AT ${formData.meetingTime} AT ${formData.meetingVenue.toUpperCase()}

PRESENT:
${formData.directorsPresent}

CHAIRPERSON:
${formData.chairpersonName}, Director, took the Chair.

APPROVAL FOR AVAILING ${formData.facilityName.toUpperCase()} OF ${amtFormatted} FROM ${formData.bankName.toUpperCase()}

"RESOLVED THAT pursuant to the provisions of Section 179(3)(d) of the Companies Act, 2013 read with the applicable Rules made thereunder and the Articles of Association of the Company, the consent and approval of the Board of Directors of the Company be and is hereby accorded to avail credit facility in the nature of ${formData.facilityName} up to an aggregate principal limit of ${amtFormatted} (${formData.loanAmountWords}) from ${formData.bankName}, ${formData.bankBranch} for the purpose of ${formData.loanPurpose}, on the terms, conditions, rate of interest, and repayment schedule as stipulated by the Bank in its Sanction Letter Ref. No. ${formData.sanctionLetterNo} dated ${formData.sanctionLetterDate}.

RESOLVED FURTHER THAT the Company accepts the commercial terms governing the facility as follows:
• Facility Type: ${formData.facilityName}
• Sanctioned Limit: ${amtFormatted} (${formData.loanAmountWords})
• Rate of Interest: ${formData.interestRate}
• Tenure & Repayment: ${formData.tenure}; Repayable ${formData.repaymentTerms}

RESOLVED FURTHER THAT for securing the due repayment of the principal amount together with interest, charges, and costs, the consent of the Board be and is hereby accorded for the creation of security by way of ${formData.securityDescription} in favour of ${formData.bankName}${formData.isPariPassu ? ` on a pari-passu basis with ${formData.pariPassuLenders || 'existing lenders'}` : ' on an exclusive first charge basis'}.

RESOLVED FURTHER THAT ${formData.director1Name}, Director (DIN: ${formData.director1Din}) or ${formData.director2Name}, Director (DIN: ${formData.director2Din}) be and is/are hereby authorized on behalf of the Company to negotiate, finalize, and sign the duplicate copy of the Sanction Letter, Loan Agreement, Hypothecation Deed, Mortgage Deeds, Demand Promissory Notes, Guarantees, and all such other agreements and declarations as may be required by ${formData.bankName}.

${
  formData.hasChg1Filing
    ? `RESOLVED FURTHER THAT pursuant to Section 77 of the Companies Act, 2013, the Directors or Company Secretary of the Company be and is hereby authorized to file statutory e-Form CHG-1 with the Registrar of Companies (ROC) within 30 days of the creation of the charge, sign digitally, and obtain the Certificate of Registration of Charge (Form CHG-2).\n\n`
    : ''
}RESOLVED FURTHER THAT a certified true copy of this resolution signed by any Director or Company Secretary of the Company be furnished to ${formData.bankName} and that the Bank be requested to act upon the same."

For ${comp}

(${formData.director1Name})
Director / Authorised Signatory
DIN: ${formData.director1Din}
Date: ${formData.certifiedDate || formData.meetingDate}
Place: New Delhi`
  }, [formData])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy via-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="bg-blue-600/30 text-blue-300 border border-blue-400/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Section 179(3)(d) • Mandatory Board Approval
          </span>
          <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-400/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            MCA V3 &amp; Form CHG-1 Compliant
          </span>
          <span className="bg-purple-600/30 text-purple-300 border border-purple-400/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Sec 180(1)(c) Limit Engine
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold font-serif mb-3 leading-tight">
          Board Resolution for Bank Loan &amp; Credit Facilities Generator
        </h1>
        <p className="text-slate-300 text-sm md:text-base max-w-4xl leading-relaxed">
          Draft official, bank-ready Certified True Copies of Board Resolutions for Term Loans, Cash Credit (CC), Overdraft (OD), and LC/BG limits. Features real-time Section 180(1)(c) borrowing limit checks, G.S.R. 464(E) private company exemptions, Form CHG-1 charge extracts, and formal Bank Covering Letters in editable Word (.docx) &amp; printable PDF.
        </p>
      </div>

      {/* Facility Type Selector Tabs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="size-4 text-blue-600" />
            <span>Select Credit Facility Type</span>
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Pre-configures resolutions, covenants &amp; security clauses
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {(
            [
              'term_loan',
              'working_capital',
              'cash_credit',
              'overdraft',
              'bank_guarantee_lc',
              'unsecured_loan',
            ] as LoanFacilityType[]
          ).map((fac) => {
            const cfg = FACILITY_CONFIG[fac]
            const isSelected = formData.facilityType === fac
            return (
              <button
                key={fac}
                type="button"
                onClick={() => handleFacilityChange(fac)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${cfg.iconBg} ${cfg.iconColor}`}
                >
                  {cfg.shortBadge}
                </span>
                <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                  {cfg.shortBadge}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Configuration Forms (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 1: Company Particulars & CIN Lookup */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="size-4 text-blue-600" />
              <span>1. Company &amp; Board Meeting Particulars</span>
            </h3>

            {/* CIN Lookup Bar */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                CIN (21 Digits) — Auto-Fill via MCA Database
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.cin}
                  onChange={(e) => handleInputChange('cin', e.target.value.toUpperCase())}
                  placeholder="e.g. U72900DL2022PTC123456"
                  maxLength={21}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleCinLookup}
                  disabled={cinLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Search className="size-3.5" />
                  <span>{cinLoading ? '...' : 'Lookup'}</span>
                </button>
              </div>
              {cinError && <p className="text-[11px] text-red-500 mt-1">{cinError}</p>}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Company Type
                  </label>
                  <select
                    value={formData.companyType}
                    onChange={(e) => handleInputChange('companyType', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="private">Private Limited (Exempt under Sec 180)</option>
                    <option value="public">Public Limited (Sec 180 Limits Apply)</option>
                    <option value="opc">One Person Company (OPC)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Board Meeting Date
                  </label>
                  <input
                    type="text"
                    value={formData.meetingDate}
                    onChange={(e) => handleInputChange('meetingDate', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Registered Office Address
                </label>
                <input
                  type="text"
                  value={formData.registeredOffice}
                  onChange={(e) => handleInputChange('registeredOffice', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Meeting Time &amp; Venue
                  </label>
                  <input
                    type="text"
                    value={formData.meetingTime}
                    onChange={(e) => handleInputChange('meetingTime', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Chairperson Name
                  </label>
                  <input
                    type="text"
                    value={formData.chairpersonName}
                    onChange={(e) => handleInputChange('chairpersonName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Lending Bank & Sanction Parameters */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Landmark className="size-4 text-emerald-600" />
              <span>2. Lending Bank &amp; Sanction Terms</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Lending Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Branch Name / Location
                  </label>
                  <input
                    type="text"
                    value={formData.bankBranch}
                    onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Sanction Letter Ref No.
                  </label>
                  <input
                    type="text"
                    value={formData.sanctionLetterNo}
                    onChange={(e) => handleInputChange('sanctionLetterNo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Sanction Date
                  </label>
                  <input
                    type="text"
                    value={formData.sanctionLetterDate}
                    onChange={(e) => handleInputChange('sanctionLetterDate', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Loan Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                    step={100000}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Interest Rate (% / Spread)
                  </label>
                  <input
                    type="text"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Amount in Words
                </label>
                <input
                  type="text"
                  value={formData.loanAmountWords}
                  onChange={(e) => handleInputChange('loanAmountWords', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 italic"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tenure
                  </label>
                  <input
                    type="text"
                    value={formData.tenure}
                    onChange={(e) => handleInputChange('tenure', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Repayment Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.repaymentTerms}
                    onChange={(e) => handleInputChange('repaymentTerms', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Loan Purpose / Use of Proceeds
                </label>
                <input
                  type="text"
                  value={formData.loanPurpose}
                  onChange={(e) => handleInputChange('loanPurpose', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Statutory Borrowing Limit Calculator (Sec 180(1)(c)) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="size-4 text-purple-600" />
                <span>3. Statutory Borrowing Limit Engine (Sec 180)</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Rule Engine
              </span>
            </div>

            {/* Statutory Status Pill */}
            <div
              className={`p-3 rounded-xl border text-xs mb-4 ${
                limits.isExempt
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 text-blue-900 dark:text-blue-200'
                  : limits.specialResolutionRequired
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {limits.isExempt ? (
                  <>
                    <ShieldCheck className="size-4 text-blue-600" />
                    <span>Private Company Exemption Active (G.S.R. 464(E))</span>
                  </>
                ) : limits.specialResolutionRequired ? (
                  <>
                    <AlertTriangle className="size-4 text-amber-600" />
                    <span>Special Resolution Required (Section 180(1)(c))</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Within Board Limits (Section 179(3)(d))</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {limits.isExempt
                  ? 'Private Limited Companies are fully exempt from Section 180 by MCA Notification G.S.R. 464(E) dated 5th June 2015. Ordinary Board Resolution suffices without EGM Special Resolution or Form MGT-14.'
                  : limits.specialResolutionRequired
                  ? `Total borrowings after loan (${formatInrCurrency(
                      limits.totalBorrowingsAfterLoan
                    )}) exceed paid-up capital & free reserves (${formatInrCurrency(
                      limits.statutoryCap
                    )}) by ${formatInrCurrency(limits.excessAmount)}. An EGM Special Resolution and Form MGT-14 are mandatory.`
                  : `Total borrowings (${formatInrCurrency(
                      limits.totalBorrowingsAfterLoan
                    )}) are well within the statutory ceiling of ${formatInrCurrency(
                      limits.statutoryCap
                    )}. No shareholder meeting or Form MGT-14 required.`}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Paid-up Capital (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.paidUpCapital}
                    onChange={(e) => handleInputChange('paidUpCapital', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Free Reserves (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.freeReserves}
                    onChange={(e) => handleInputChange('freeReserves', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Securities Premium (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.securitiesPremium}
                    onChange={(e) =>
                      handleInputChange('securitiesPremium', Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Existing Borrowings (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.existingBorrowings}
                    onChange={(e) =>
                      handleInputChange('existingBorrowings', Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs">
                <span className="text-slate-500">Statutory Cap (Capital + Reserves):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatInrCurrency(limits.statutoryCap)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Security Details & Authorised Signatories */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="size-4 text-blue-600" />
              <span>4. Security, Signatories &amp; ROC Form CHG-1</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Security / Hypothecation Description
                </label>
                <textarea
                  value={formData.securityDescription}
                  onChange={(e) => handleInputChange('securityDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Director 1 (Signatory)
                  </label>
                  <input
                    type="text"
                    value={formData.director1Name}
                    onChange={(e) => handleInputChange('director1Name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    DIN 1
                  </label>
                  <input
                    type="text"
                    value={formData.director1Din}
                    onChange={(e) => handleInputChange('director1Din', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Director 2
                  </label>
                  <input
                    type="text"
                    value={formData.director2Name}
                    onChange={(e) => handleInputChange('director2Name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Signing Mode
                  </label>
                  <select
                    value={formData.signingAuthority}
                    onChange={(e) =>
                      handleInputChange('signingAuthority', e.target.value as SigningAuthority)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="any_one">Any One Director Severally</option>
                    <option value="both_jointly">Both Directors Jointly</option>
                    <option value="director_or_cs">Director or CS Severally</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chg1Checkbox"
                  checked={formData.hasChg1Filing}
                  onChange={(e) => handleInputChange('hasChg1Filing', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="chg1Checkbox"
                  className="text-xs text-slate-700 dark:text-slate-300 font-medium"
                >
                  Include explicit authorization to file e-Form CHG-1 with ROC (Section 77)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Tab Live Preview & Document Actions (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-6">
            {/* Tab Navigation Header */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 p-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('resolution')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'resolution'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <FileText className="size-3.5" />
                <span>1. Board Resolution</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('special-resolution')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'special-resolution'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <Scale className="size-3.5" />
                <span>2. Sec 180(1)(c) Special Res.</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bank-letter')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'bank-letter'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <Briefcase className="size-3.5" />
                <span>3. Bank Covering Letter</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chg1-extract')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'chg1-extract'
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <ShieldCheck className="size-3.5" />
                <span>4. CHG-1 Extract</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('checklist')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'checklist'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <FileCheck2 className="size-3.5" />
                <span>5. Checklist</span>
              </button>
            </div>

            {/* Action Bar: Download Word, PDF, Copy, Print */}
            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      'docx',
                      activeTab === 'special-resolution'
                        ? 'special-resolution'
                        : activeTab === 'bank-letter'
                        ? 'bank-letter'
                        : activeTab === 'chg1-extract'
                        ? 'chg1-extract'
                        : 'resolution'
                    )
                  }
                  disabled={!!isDownloading}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="size-3.5" />
                  <span>
                    {isDownloading?.includes('docx') ? 'Generating Word...' : 'Download Word (.docx)'}
                  </span>
                </button>

                {activeTab === 'resolution' && (
                  <button
                    type="button"
                    onClick={() => handleDownload('pdf', 'resolution')}
                    disabled={!!isDownloading}
                    className="px-3.5 py-2 rounded-xl bg-navy hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700 shadow-sm"
                  >
                    <Download className="size-3.5" />
                    <span>
                      {isDownloading?.includes('pdf') ? 'Generating PDF...' : 'Download PDF'}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(boardResolutionText, 'resolution')}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Copy full text to clipboard"
                >
                  <Copy className="size-3.5" />
                  <span>{copiedType === 'resolution' ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                  title="Print document"
                >
                  <Printer className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Document Content View */}
            <div className="p-6 max-h-[750px] overflow-y-auto font-serif text-slate-900 dark:text-slate-100 text-sm leading-relaxed space-y-4">
              {activeTab === 'resolution' && (
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                    <h2 className="text-lg font-bold tracking-wide uppercase">
                      {formData.companyName}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">CIN: {formData.cin}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      Regd. Office: {formData.registeredOffice}
                    </p>
                  </div>

                  <div className="text-center font-bold text-xs underline mb-3 uppercase tracking-wider">
                    CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF THE COMPANY
                  </div>

                  <div className="text-center font-semibold text-xs text-slate-600 dark:text-slate-400 mb-5">
                    HELD ON {formData.meetingDate} AT {formData.meetingTime} AT {formData.meetingVenue.toUpperCase()}
                  </div>

                  <div className="mb-4 text-xs font-sans space-y-1">
                    <p className="font-bold">PRESENT:</p>
                    {formData.directorsPresent.split('\n').map((line, i) => (
                      <p key={i} className="text-slate-600 dark:text-slate-400">
                        {line}
                      </p>
                    ))}
                    <p className="pt-2">
                      <strong className="font-bold">CHAIRPERSON: </strong>
                      {formData.chairpersonName}, Director, took the Chair.
                    </p>
                  </div>

                  <div className="text-center font-bold text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide py-2 border-y border-slate-200 dark:border-slate-800 my-4">
                    APPROVAL FOR AVAILING {formData.facilityName.toUpperCase()} OF {formatInrCurrency(formData.loanAmount)} FROM {formData.bankName.toUpperCase()}
                  </div>

                  <p className="text-justify text-xs text-slate-700 dark:text-slate-300">
                    The Chairperson informed the Board that in order to finance {formData.loanPurpose}, the Company approached {formData.bankName}, {formData.bankBranch}. The Board was further apprised that the Bank has sanctioned the credit facility vide Sanction Letter Ref. No. {formData.sanctionLetterNo} dated {formData.sanctionLetterDate}.
                  </p>

                  <p className="text-justify text-xs text-slate-800 dark:text-slate-200">
                    <strong className="font-bold">RESOLVED THAT </strong>
                    pursuant to Section 179(3)(d) of the Companies Act, 2013 and other applicable provisions, approval of the Board be and is hereby accorded to avail {formData.facilityName} up to an aggregate principal limit of {formatInrCurrency(formData.loanAmount)} ({formData.loanAmountWords}) from {formData.bankName}, {formData.bankBranch} for {formData.loanPurpose}, on the terms and conditions outlined in the Sanction Letter dated {formData.sanctionLetterDate}.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-900/70 p-3 rounded-lg text-xs space-y-1 font-sans">
                    <p>
                      <strong>Facility Type:</strong> {formData.facilityName}
                    </p>
                    <p>
                      <strong>Sanctioned Limit:</strong> {formatInrCurrency(formData.loanAmount)} ({formData.loanAmountWords})
                    </p>
                    <p>
                      <strong>Rate of Interest:</strong> {formData.interestRate}
                    </p>
                    <p>
                      <strong>Tenure &amp; Repayment:</strong> {formData.tenure}; Repayable {formData.repaymentTerms}
                    </p>
                  </div>

                  <p className="text-justify text-xs text-slate-800 dark:text-slate-200">
                    <strong className="font-bold">RESOLVED FURTHER THAT </strong>
                    for securing the due repayment of the credit facility, consent of the Board be and is hereby accorded for the creation of security by way of {formData.securityDescription} in favour of {formData.bankName}{formData.isPariPassu ? ` on a pari-passu basis with other lenders` : ' on an exclusive first charge basis'}.
                  </p>

                  <p className="text-justify text-xs text-slate-800 dark:text-slate-200">
                    <strong className="font-bold">RESOLVED FURTHER THAT </strong>
                    {formData.director1Name}, Director (DIN: {formData.director1Din}) or {formData.director2Name}, Director (DIN: {formData.director2Din}) be and is/are hereby authorized on behalf of the Company to finalize, sign, and execute the duplicate Sanction Letter, Loan Agreement, Hypothecation Deed, Promissory Notes, and all related documentation.
                  </p>

                  {formData.hasChg1Filing && (
                    <p className="text-justify text-xs text-slate-800 dark:text-slate-200">
                      <strong className="font-bold">RESOLVED FURTHER THAT </strong>
                      pursuant to Section 77 of the Companies Act, 2013, the Directors or Company Secretary of the Company be authorized to file e-Form CHG-1 with the Registrar of Companies within 30 days of charge creation and obtain the Certificate of Registration of Charge (CHG-2).
                    </p>
                  )}

                  <p className="text-justify text-xs text-slate-800 dark:text-slate-200">
                    <strong className="font-bold">RESOLVED FURTHER THAT </strong>
                    a certified true copy of this resolution signed by any Director or Company Secretary be furnished to {formData.bankName} and that the Bank be requested to act upon the same.
                  </p>

                  <div className="pt-6 flex justify-between items-end text-xs">
                    <div>
                      <p>Date: {formData.certifiedDate || formData.meetingDate}</p>
                      <p>Place: New Delhi</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">For {formData.companyName.toUpperCase()}</p>
                      <div className="h-10"></div>
                      <p className="font-bold">({formData.director1Name})</p>
                      <p className="text-slate-500">Director / Authorised Signatory</p>
                      <p className="text-slate-500">DIN: {formData.director1Din}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'special-resolution' && (
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner space-y-4">
                  <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold tracking-wide uppercase">
                      {formData.companyName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      SPECIAL RESOLUTION UNDER SECTION 180(1)(c) OF THE COMPANIES ACT, 2013
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-lg text-xs text-purple-900 dark:text-purple-200 font-sans">
                    <strong>Statutory Applicability: </strong>
                    {limits.isExempt
                      ? 'Note: Private Limited Companies are exempt from Section 180 under MCA Notification G.S.R. 464(E). This Special Resolution is strictly required for Public Companies whose borrowings exceed paid-up capital & free reserves.'
                      : 'Required for Public Companies when total borrowings exceed paid-up capital + free reserves + securities premium.'}
                  </div>

                  <p className="font-bold text-xs text-navy dark:text-white uppercase">
                    ITEM NO. 1: APPROVAL FOR BORROWING MONIES IN EXCESS OF PAID-UP CAPITAL, FREE RESERVES AND SECURITIES PREMIUM UNDER SECTION 180(1)(c)
                  </p>

                  <p className="text-justify text-xs text-slate-800 dark:text-slate-200">
                    <strong className="font-bold">RESOLVED THAT </strong>
                    pursuant to Section 180(1)(c) and other applicable provisions of the Companies Act, 2013, consent of the Members be and is hereby accorded to the Board of Directors of the Company to borrow from time to time monies on such terms and conditions as the Board may deem fit, which together with monies already borrowed may exceed the aggregate of the paid-up share capital, free reserves, and securities premium of the Company, provided that total amount so borrowed shall not exceed the limit of {formatInrCurrency(limits.totalBorrowingsAfterLoan * 1.5)}.
                  </p>

                  <p className="text-justify text-xs text-slate-800 dark:text-slate-200">
                    <strong className="font-bold">RESOLVED FURTHER THAT </strong>
                    pursuant to Section 180(1)(a) of the Companies Act, 2013, consent of the Members be accorded to the Board to create charges and mortgages on company assets in favour of lenders to secure such borrowings.
                  </p>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-xs mb-2">
                      EXPLANATORY STATEMENT PURSUANT TO SECTION 102 OF THE COMPANIES ACT, 2013
                    </p>
                    <p className="text-justify text-xs text-slate-700 dark:text-slate-300">
                      As on date, the paid-up capital of the Company is {formatInrCurrency(limits.paidUpCapital)}, free reserves are {formatInrCurrency(limits.freeReserves)}, and securities premium is {formatInrCurrency(limits.securitiesPremium)}, aggregating to {formatInrCurrency(limits.statutoryCap)}. In view of business expansion, borrowings are expected to exceed this statutory ceiling. Accordingly, the Board recommends this Special Resolution for approval.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'bank-letter' && (
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner space-y-4">
                  <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold tracking-wide uppercase">
                      {formData.companyName}
                    </h2>
                    <p className="text-xs text-slate-500">COMPANY LETTERHEAD FORMAT</p>
                  </div>

                  <p className="text-xs">Date: {formData.certifiedDate || formData.meetingDate}</p>
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold">To,</p>
                    <p>The Branch Manager,</p>
                    <p className="font-bold">{formData.bankName},</p>
                    <p>{formData.bankBranch}, {formData.bankAddress}</p>
                  </div>

                  <p className="text-xs font-bold underline">
                    Subject: Submission of Board Resolution and Acceptance of Sanction Terms for {formData.facilityName} of {formatInrCurrency(formData.loanAmount)} (Sanction Ref: {formData.sanctionLetterNo})
                  </p>

                  <p className="text-xs text-justify">
                    Dear Sir / Madam, We refer to your Sanction Letter Ref. No. {formData.sanctionLetterNo} dated {formData.sanctionLetterDate}. We are pleased to inform you that the Board of Directors at its meeting held on {formData.meetingDate} has approved the availment of the said credit facility.
                  </p>

                  <p className="text-xs font-semibold">We enclose herewith the following statutory documents:</p>
                  <ol className="list-decimal list-inside text-xs space-y-1 text-slate-700 dark:text-slate-300">
                    <li>Certified True Copy of the Board Resolution passed on {formData.meetingDate}</li>
                    <li>Duplicate copy of Sanction Letter duly signed as token of acceptance</li>
                    <li>Executed Loan Agreement, Hypothecation Deed &amp; Security Documents</li>
                    <li>List of Directors with DIN and specimen signatures of Authorised Signatories</li>
                    <li>Statutory Declaration under Section 179(3)(d) and Section 180(1)(c)</li>
                    <li>Undertaking to file e-Form CHG-1 with ROC within 30 days</li>
                  </ol>

                  <div className="pt-4 text-xs">
                    <p>Yours faithfully,</p>
                    <p className="font-bold">For {formData.companyName.toUpperCase()}</p>
                    <div className="h-8"></div>
                    <p className="font-bold">({formData.director1Name})</p>
                    <p className="text-slate-500">Director / Authorised Signatory (DIN: {formData.director1Din})</p>
                  </div>
                </div>
              )}

              {activeTab === 'chg1-extract' && (
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner space-y-4">
                  <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-bold tracking-wide uppercase">
                      {formData.companyName}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">CIN: {formData.cin}</p>
                  </div>

                  <div className="text-center font-bold text-xs uppercase underline tracking-wide">
                    EXTRACT OF RESOLUTION AUTHORIZING CREATION OF CHARGE UNDER SECTION 77 OF THE COMPANIES ACT, 2013 (FOR MCA E-FORM CHG-1)
                  </div>

                  <p className="text-justify text-xs text-slate-800 dark:text-slate-200">
                    <strong className="font-bold">RESOLVED THAT </strong>
                    pursuant to Section 77 and Section 179(3)(d) of the Companies Act, 2013 read with the Companies (Registration of Charges) Rules, 2014, consent of the Board be and is hereby accorded to create security by way of {formData.securityDescription} in favour of {formData.bankName}, {formData.bankBranch} for securing {formData.facilityName} of {formatInrCurrency(formData.loanAmount)}.
                  </p>

                  <p className="text-justify text-xs text-slate-800 dark:text-slate-200">
                    <strong className="font-bold">RESOLVED FURTHER THAT </strong>
                    {formData.director1Name}, Director (DIN: {formData.director1Din}) or the Company Secretary be and is hereby authorized to file statutory e-Form CHG-1 on MCA V3 within 30 days of charge creation and obtain the Certificate of Registration of Charge (CHG-2).
                  </p>

                  <div className="pt-4 text-right text-xs">
                    <p className="font-bold">For {formData.companyName.toUpperCase()}</p>
                    <div className="h-8"></div>
                    <p className="font-bold">({formData.director1Name})</p>
                    <p className="text-slate-500">Director (DIN: {formData.director1Din})</p>
                  </div>
                </div>
              )}

              {activeTab === 'checklist' && (
                <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner space-y-4 font-sans">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Statutory Compliance Roadmap for Bank Loan Disbursement</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3 items-start">
                      <span className="font-bold text-blue-600 text-sm">01</span>
                      <div>
                        <strong className="font-bold text-slate-900 dark:text-white block">
                          Pass Board Resolution under Section 179(3)(d)
                        </strong>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                          Monies must be borrowed at a duly convened Board Meeting. Circular resolutions are strictly prohibited under Section 179(3).
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3 items-start">
                      <span className="font-bold text-purple-600 text-sm">02</span>
                      <div>
                        <strong className="font-bold text-slate-900 dark:text-white block">
                          Check Section 180(1)(c) Borrowing Limits
                        </strong>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                          Public companies exceeding paid-up capital + free reserves must pass an EGM Special Resolution and file Form MGT-14 within 30 days. Private companies are exempt under G.S.R. 464(E).
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3 items-start">
                      <span className="font-bold text-emerald-600 text-sm">03</span>
                      <div>
                        <strong className="font-bold text-slate-900 dark:text-white block">
                          Stamp Duty Payment on Loan &amp; Hypothecation Deeds
                        </strong>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                          Pay applicable state stamp duty before execution (e.g. Maharashtra: 0.1% to 0.2% capped at ₹10L; Delhi: Article 6; Karnataka: 0.1% to 0.2%).
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3 items-start">
                      <span className="font-bold text-amber-600 text-sm">04</span>
                      <div>
                        <strong className="font-bold text-slate-900 dark:text-white block">
                          File e-Form CHG-1 with ROC within 30 Days (Section 77)
                        </strong>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                          Mandatory registration of charge on MCA portal within 30 days of deed execution. Delayed filing attracts ad-valorem fees up to 60 days, beyond which Regional Director condonation is needed.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3 items-start">
                      <span className="font-bold text-navy text-sm">05</span>
                      <div>
                        <strong className="font-bold text-slate-900 dark:text-white block">
                          Update Register of Charges (Section 85)
                        </strong>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                          Enter particulars of the charge in statutory Form CHG-7 at the registered office and obtain Form CHG-2 Certificate of Registration from the ROC for bank disbursement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
