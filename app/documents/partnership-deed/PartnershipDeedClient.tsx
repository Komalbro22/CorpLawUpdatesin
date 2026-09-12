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
  Calculator,
  Percent,
  Briefcase,
  HelpCircle,
} from 'lucide-react'
import {
  PartnershipDeedFormData,
  PartnerProfile,
  FirmCategory,
  PARTNERSHIP_PRESETS,
  DEFAULT_SAMPLE_PARTNERSHIP_DATA,
  calculateSection40bRemuneration,
  formatInrCurrency,
  convertNumberToIndianWords,
} from '@/lib/doc-generator/partnership-deed-generator'

const STATE_STAMP_RATES_DEED: Record<
  string,
  {
    state: string
    article: string
    rateText: string
    calcDuty: (capital: number) => number
    maxCapText: string
    eStampPortal: string
    notes: string
  }
> = {
  maharashtra: {
    state: 'Maharashtra',
    article: 'Article 47, Maharashtra Stamp Act',
    rateText: '1% of capital contribution (Min ₹500, Max ₹50,000)',
    calcDuty: (capital: number) => Math.min(50000, Math.max(500, Math.round(capital * 0.01))),
    maxCapText: '₹50,000 (Ceiling raised from ₹15,000 w.e.f. 14 Oct 2024)',
    eStampPortal: 'e-SBTR / GRAS Maharashtra Portal',
    notes: 'Maharashtra Partnership (Amendment) Act, 2026 mandates online e-filing with Mumbai RoF.',
  },
  delhi: {
    state: 'Delhi (NCT)',
    article: 'Article 46, Indian Stamp Act (Delhi Schedule)',
    rateText: '1% of capital contribution (Min ₹200, Max ₹5,000)',
    calcDuty: (capital: number) => Math.min(5000, Math.max(200, Math.round(capital * 0.01))),
    maxCapText: '₹5,000 (Maximum Cap)',
    eStampPortal: 'SHCIL Delhi e-Stamping',
    notes: 'Mandatory non-judicial e-stamp paper issued by Stock Holding Corporation of India (SHCIL).',
  },
  karnataka: {
    state: 'Karnataka',
    article: 'Article 40 / 44, Karnataka Stamp Act',
    rateText: 'Flat ₹2,000 (Where capital is up to ₹50,000) or ₹5,000 (higher capital)',
    calcDuty: (capital: number) => (capital > 50000 ? 5000 : 2000),
    maxCapText: '₹5,000 fixed',
    eStampPortal: 'Kaveri 2.0 / SHCIL Karnataka',
    notes: 'Partnership deed rate is distinct from LLP Agreement rates in Karnataka.',
  },
  gujarat: {
    state: 'Gujarat',
    article: 'Article 44, Gujarat Stamp Act',
    rateText: '1% of capital contribution (Min ₹500, Max ₹10,000)',
    calcDuty: (capital: number) => Math.min(10000, Math.max(500, Math.round(capital * 0.01))),
    maxCapText: '₹10,000 (Maximum Cap)',
    eStampPortal: 'SHCIL Gujarat e-Stamping',
    notes: 'Must be franked or e-stamped prior to execution by all partners.',
  },
  tamil_nadu: {
    state: 'Tamil Nadu',
    article: 'Article 46, Indian Stamp Act (TN Schedule)',
    rateText: '₹300 (capital ≤ ₹1 Lakh); 1% for capital > ₹1 Lakh (Max ₹25,000)',
    calcDuty: (capital: number) => (capital <= 100000 ? 300 : Math.min(25000, Math.round(capital * 0.01))),
    maxCapText: '₹25,000',
    eStampPortal: 'TN Registration e-Stamp',
    notes: 'Subject to TN Stamp Amendment Rules. Minimum ₹300 non-judicial stamp paper.',
  },
  telangana: {
    state: 'Telangana & Andhra Pradesh',
    article: 'Article 46, Indian Stamp Act (TS/AP Schedule)',
    rateText: 'Flat ₹500 (₹100 if capital ≤ ₹5,000)',
    calcDuty: (capital: number) => (capital <= 5000 ? 100 : 500),
    maxCapText: '₹500 flat',
    eStampPortal: 'Registration & Stamps Dept Portal (IGRS)',
    notes: 'Telangana provides end-to-end online firm registration via Meeseva (₹245 total fee, ~3 days).',
  },
  rajasthan: {
    state: 'Rajasthan',
    article: 'Article 44, Rajasthan Stamp Act',
    rateText: '₹2,000 per ₹50,000 of capital (Min ₹2,000, Max ₹10,000)',
    calcDuty: (capital: number) => Math.min(10000, Math.max(2000, Math.ceil(capital / 50000) * 2000)),
    maxCapText: '₹10,000',
    eStampPortal: 'e-Gras Rajasthan Portal',
    notes: 'Surcharge of 20% (cow & heritage surcharge) applicable on state stamp duty.',
  },
  uttar_pradesh: {
    state: 'Uttar Pradesh',
    article: 'Article 46, Indian Stamp Act (UP Schedule)',
    rateText: 'Flat ₹750',
    calcDuty: () => 750,
    maxCapText: '₹750 flat',
    eStampPortal: 'IGRSUP e-Stamping Portal',
    notes: 'Can be executed on physical non-judicial stamp paper or e-stamp certificates.',
  },
  west_bengal: {
    state: 'West Bengal',
    article: 'Article 46, Indian Stamp Act (WB Schedule)',
    rateText: 'Flat ₹150 (₹50 if capital ≤ ₹500)',
    calcDuty: (capital: number) => (capital <= 500 ? 50 : 150),
    maxCapText: '₹150 flat',
    eStampPortal: 'GRIPS West Bengal Portal',
    notes: 'One of the lowest stamp duties in India for general partnership deeds.',
  },
  kerala: {
    state: 'Kerala',
    article: 'Article 44, Kerala Stamp Act',
    rateText: 'Flat ₹5,000',
    calcDuty: () => 5000,
    maxCapText: '₹5,000 flat',
    eStampPortal: 'Kerala Registration e-Stamp',
    notes: 'Uniform flat duty regardless of partnership capital contribution.',
  },
  punjab_haryana: {
    state: 'Punjab & Haryana',
    article: 'Article 46, Indian Stamp Act (PB/HR)',
    rateText: 'Flat ₹1,000',
    calcDuty: () => 1000,
    maxCapText: '₹1,000 flat',
    eStampPortal: 'e-GRAS Punjab / Haryana Portal',
    notes: 'Physical or e-stamp paper issued under state stamp schedules.',
  },
}

export default function PartnershipDeedClient() {
  const [formData, setFormData] = useState<PartnershipDeedFormData>(DEFAULT_SAMPLE_PARTNERSHIP_DATA)
  const [activeTab, setActiveTab] = useState<'deed' | 'rof-form-1' | 'bank-mandate' | 'stamp-guide'>('deed')
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [selectedState, setSelectedState] = useState<string>('maharashtra')

  // Section 40(b) interactive calculator state
  const [calcBookProfit, setCalcBookProfit] = useState<number>(1500000)

  // Gemini AI Business Objects Assistant State
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSuccessBadge, setAiSuccessBadge] = useState<string | null>(null)
  const [showAiPrompt, setShowAiPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  // Profit/loss share validation
  const totalProfitShare = useMemo(() => {
    return formData.partners.reduce((sum, p) => sum + (Number(p.profitShare) || 0), 0)
  }, [formData.partners])

  const totalCapitalCalculated = useMemo(() => {
    return formData.partners.reduce((sum, p) => sum + (Number(p.capitalAmount) || 0), 0)
  }, [formData.partners])

  // Section 40(b) calculation result
  const sec40bCalc = useMemo(() => {
    return calculateSection40bRemuneration(calcBookProfit)
  }, [calcBookProfit])

  const workingPartnersCount = useMemo(() => {
    return formData.partners.filter(p => p.isWorkingPartner).length
  }, [formData.partners])

  const handleInputChange = (field: keyof PartnershipDeedFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCategoryPreset = (cat: FirmCategory) => {
    const preset = PARTNERSHIP_PRESETS[cat]
    setFormData(prev => ({
      ...prev,
      category: cat,
      firmName: preset.suggestedFirmName,
      durationYears: preset.defaultDuration,
      businessObjects: preset.defaultObjects,
      remunerationType: preset.remunerationDefault,
    }))
  }

  // Partner updates
  const handlePartnerChange = (idx: number, field: keyof PartnerProfile, val: any) => {
    setFormData(prev => {
      const updated = [...prev.partners]
      updated[idx] = { ...updated[idx], [field]: val }

      // Auto update capital total if capital amount changed
      if (field === 'capitalAmount') {
        const newTotal = updated.reduce((sum, p) => sum + (Number(p.capitalAmount) || 0), 0)
        return {
          ...prev,
          partners: updated,
          totalCapital: newTotal,
          totalCapitalWords: convertNumberToIndianWords(newTotal),
        }
      }

      return { ...prev, partners: updated }
    })
  }

  const handleAddPartner = () => {
    if (formData.partners.length >= 8) {
      alert('Maximum 8 partners supported in online drafting workstation.')
      return
    }
    const newIdx = formData.partners.length + 1
    const newPartner: PartnerProfile = {
      name: `Partner ${newIdx}`,
      fatherOrSpouse: 'S/o / D/o ____________',
      address: 'Address Line, City, State - PIN',
      pan: 'ABCDE1234F',
      aadhaarOrId: 'XXXX-XXXX-0000',
      isWorkingPartner: true,
      capitalAmount: 200000,
      capitalPercentage: 20,
      profitShare: 20,
      lossShare: 20,
      monthlyRemuneration: 25000,
    }
    setFormData(prev => {
      const updated = [...prev.partners, newPartner]
      const newTotal = updated.reduce((sum, p) => sum + (Number(p.capitalAmount) || 0), 0)
      return {
        ...prev,
        partners: updated,
        totalCapital: newTotal,
        totalCapitalWords: convertNumberToIndianWords(newTotal),
      }
    })
  }

  const handleRemovePartner = (idx: number) => {
    if (formData.partners.length <= 2) {
      alert('A partnership firm requires a minimum of 2 partners under Section 4 of Indian Partnership Act, 1932.')
      return
    }
    setFormData(prev => {
      const updated = prev.partners.filter((_, i) => i !== idx)
      const newTotal = updated.reduce((sum, p) => sum + (Number(p.capitalAmount) || 0), 0)
      return {
        ...prev,
        partners: updated,
        totalCapital: newTotal,
        totalCapitalWords: convertNumberToIndianWords(newTotal),
      }
    })
  }

  // Gemini AI Business Objects Assistant
  const handlePolishObjects = async (presetPrompt?: string) => {
    const textToRefine = (presetPrompt || customPrompt || formData.businessObjects).trim()
    if (!textToRefine) {
      setAiError('Please enter a brief description of your business activity or select a quick preset.')
      return
    }
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await fetch('/api/documents/legal-purpose-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'partnership_business_objects',
          rawText: textToRefine,
          context: {
            firmName: formData.firmName,
            category: formData.category,
            city: formData.executionCity,
          },
        }),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'Failed to refine business objects')
      }
      const data = await res.json()
      if (data?.data?.polishedText) {
        setFormData(prev => ({ ...prev, businessObjects: data.data.polishedText }))
        setAiSuccessBadge(
          data.data.industryCategory
            ? `Objects Generated (${data.data.industryCategory})`
            : 'Legal Objects Generated'
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

  // Download Handlers
  const handleDownload = async (docType: 'deed' | 'rof-form-1' | 'bank-mandate', format: 'docx' | 'pdf') => {
    try {
      setIsDownloading(`${docType}-${format}`)
      const res = await fetch('/api/documents/partnership-deed-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData, format, doc: docType }),
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const firmSlug = (formData.firmName || 'Partnership_Firm').replace(/[^a-zA-Z0-9]/g, '_')

      if (docType === 'rof-form-1') {
        a.download = `ROF_Form_1_${firmSlug}.${format}`
      } else if (docType === 'bank-mandate') {
        a.download = `Bank_Account_Mandate_${firmSlug}.${format}`
      } else {
        a.download = `Partnership_Deed_${firmSlug}.${format}`
      }

      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Unable to generate document. Please try again.')
    } finally {
      setIsDownloading(null)
    }
  }

  const handleCopyClipboard = () => {
    const text = `PARTNERSHIP DEED OF ${formData.firmName.toUpperCase()}
Execution Date: ${formData.executionDate} at ${formData.executionCity}, ${formData.executionState}

PARTNERS:
${formData.partners.map((p, i) => `${i + 1}. ${p.name} (${p.fatherOrSpouse}) - PAN: ${p.pan}, Capital: Rs. ${formatInrCurrency(p.capitalAmount)} (${p.profitShare}% profit)`).join('\n')}

BUSINESS OBJECTS:
${formData.businessObjects}

CAPITAL & REMUNERATION:
Total Capital: Rs. ${formatInrCurrency(formData.totalCapital)} (${formData.totalCapitalWords})
Interest on Capital: ${formData.hasCapitalInterest ? `${formData.capitalInterestRate}% p.a. (Sec 40(b)(iv))` : 'Nil'}
Partner Remuneration: ${formData.hasPartnerRemuneration ? 'Computed as per Section 40(b)(v) formula (90% on first Rs. 6L book profit, 60% on balance)' : 'Nil'}
Section 194T TDS: 10% TDS applicable on payments exceeding Rs. 20,000 p.a.
Bank Account: ${formData.bankName} (${formData.bankingSigningAuthority})
Arbitration: Sole Arbitrator at ${formData.arbitrationSeat}

DRAFTED IN COMPLIANCE WITH INDIAN PARTNERSHIP ACT 1932 & SECTION 40(b) INCOME-TAX ACT.`

    navigator.clipboard.writeText(text)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2500)
  }

  const currentStampConfig = STATE_STAMP_RATES_DEED[selectedState] || STATE_STAMP_RATES_DEED.maharashtra
  const calculatedStampDuty = currentStampConfig.calcDuty(formData.totalCapital)

  return (
    <div className="space-y-8">
      {/* 1. Category Preset Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Handshake className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Select Partnership Firm Category Preset:
          </label>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Presets pre-configure duration, objects & banking clauses
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {(
            [
              'general_at_will',
              'trading_retail',
              'professional_services',
              'manufacturing_industrial',
              'tech_ecommerce',
            ] as FirmCategory[]
          ).map(catKey => {
            const p = PARTNERSHIP_PRESETS[catKey]
            const isSelected = formData.category === catKey
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => handleCategoryPreset(catKey)}
                className={`p-3 rounded-xl text-left border transition shadow-sm ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {p.shortBadge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mt-1">
                  {p.label}
                </h4>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Top Action Bar: Word (.docx) and PDF Downloads */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Sec 40(b) AY 2025-26 Compliant
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Sec 194T TDS Ready
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              ROF Form 1 Included
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            Export Lawyer-Vetted Partnership Deed & ROF Application
          </h3>
          <p className="text-xs text-slate-400">
            No watermarks • Bookman Old Style 12pt legal layout • Dynamic multi-partner tables & witness blocks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>{copySuccess ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          {/* Download Word DOCX */}
          <button
            type="button"
            onClick={() => handleDownload('deed', 'docx')}
            disabled={isDownloading !== null}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading === 'deed-docx' ? 'Generating Word...' : 'Download Word (.docx)'}</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={() => handleDownload('deed', 'pdf')}
            disabled={isDownloading !== null}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading === 'deed-pdf' ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workstation: Split View Form + Live Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Interactive Customizer Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Firm Identity & Duration */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              1. Firm Identity & Location
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Firm Name (with M/s) *
                </label>
                <input
                  type="text"
                  value={formData.firmName}
                  onChange={e => handleInputChange('firmName', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Duration of Partnership *
                </label>
                <input
                  type="text"
                  value={formData.durationYears || 'At Will'}
                  onChange={e => handleInputChange('durationYears', e.target.value)}
                  placeholder="e.g. At Will or 5 Years"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Execution Date (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  value={formData.executionDate}
                  onChange={e => handleInputChange('executionDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Effective Commencement Date
                </label>
                <input
                  type="text"
                  value={formData.effectiveDate}
                  onChange={e => handleInputChange('effectiveDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Execution City
                </label>
                <input
                  type="text"
                  value={formData.executionCity}
                  onChange={e => handleInputChange('executionCity', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Execution State
                </label>
                <input
                  type="text"
                  value={formData.executionState}
                  onChange={e => handleInputChange('executionState', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Principal Place of Business (Full Address with PIN) *
              </label>
              <textarea
                rows={2}
                value={formData.principalAddress}
                onChange={e => handleInputChange('principalAddress', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Card 2: Business Objects & Gemini AI Assistant */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                2. Business Objects & Commercial Scope
              </h4>
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
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">
                    Describe your business idea in plain English:
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Gemini 2.5 Flash</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. we want to do solar rooftop installations, EPC contracting and wholesale supply"
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePolishObjects()}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handlePolishObjects()}
                    disabled={aiLoading}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shrink-0 disabled:opacity-50 transition"
                  >
                    {aiLoading ? 'Generating...' : 'Refine'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-500">Quick Industry Pills:</span>
                  {[
                    'Cloud Kitchen & Food Delivery',
                    'Solar EPC & Clean Energy',
                    'Software Development & SaaS',
                    'Import-Export & Logistics Agency',
                    'Civil Contracting & Construction',
                  ].map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePolishObjects(pill)}
                      disabled={aiLoading}
                      className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300 transition"
                    >
                      {pill}
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
              rows={3}
              value={formData.businessObjects}
              onChange={e => handleInputChange('businessObjects', e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Card 3: Dynamic Multi-Partner Management */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                3. Partners Profiles & Capital ({formData.partners.length} Partners)
              </h4>
              <button
                type="button"
                onClick={handleAddPartner}
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Partner</span>
              </button>
            </div>

            {/* Profit Share Validation Banner */}
            {totalProfitShare !== 100 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Total profit sharing ratio is currently {totalProfitShare}%. Must equal exactly 100%.
                </span>
                <span className="text-[10px] font-bold">Diff: {100 - totalProfitShare}%</span>
              </div>
            )}

            <div className="space-y-4">
              {formData.partners.map((partner, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Partner {idx + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={partner.isWorkingPartner}
                          onChange={e => handlePartnerChange(idx, 'isWorkingPartner', e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <span>Working Partner (Sec 40(b))</span>
                      </label>
                      {formData.partners.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePartner(idx)}
                          className="text-slate-400 hover:text-rose-500 transition"
                          title="Remove Partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        value={partner.name}
                        onChange={e => handlePartnerChange(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        Father&apos;s / Spouse Name *
                      </label>
                      <input
                        type="text"
                        value={partner.fatherOrSpouse}
                        onChange={e => handlePartnerChange(idx, 'fatherOrSpouse', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                      Residential Address *
                    </label>
                    <input
                      type="text"
                      value={partner.address}
                      onChange={e => handlePartnerChange(idx, 'address', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        PAN *
                      </label>
                      <input
                        type="text"
                        value={partner.pan}
                        onChange={e => handlePartnerChange(idx, 'pan', e.target.value.toUpperCase())}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        Capital (₹)
                      </label>
                      <input
                        type="number"
                        value={partner.capitalAmount}
                        onChange={e => handlePartnerChange(idx, 'capitalAmount', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        Profit Share (%)
                      </label>
                      <input
                        type="number"
                        value={partner.profitShare}
                        onChange={e => {
                          const val = Number(e.target.value)
                          handlePartnerChange(idx, 'profitShare', val)
                          handlePartnerChange(idx, 'lossShare', val)
                        }}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                        Loss Share (%)
                      </label>
                      <input
                        type="number"
                        value={partner.lossShare}
                        onChange={e => handlePartnerChange(idx, 'lossShare', Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Total Capital Contribution:</span>
              <span>₹{formatInrCurrency(formData.totalCapital)} ({formData.totalCapitalWords})</span>
            </div>
          </div>

          {/* Card 4: Financials & Section 40(b) Engine */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              4. Section 40(b) Tax Deductibility & Financials
            </h4>

            {/* Section 40(b) Remuneration interactive simulator */}
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                  Section 40(b) Deduction Simulator (AY 2025-26)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
                  Post-Finance Act 2024
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-600 dark:text-slate-400">
                  Estimated Annual Book Profit of the Firm (₹):
                </label>
                <input
                  type="number"
                  value={calcBookProfit}
                  onChange={e => setCalcBookProfit(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Max Deductible Partner Remuneration:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ₹{formatInrCurrency(sec40bCalc.maxDeductible)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {sec40bCalc.explanation}
                </p>
                {workingPartnersCount > 0 && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                    Split equally across {workingPartnersCount} working partner(s): ₹{formatInrCurrency(Math.round(sec40bCalc.maxDeductible / workingPartnersCount))} per partner/year.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Interest on Capital (% p.a.) [Max 12%]
                </label>
                <input
                  type="number"
                  max={12}
                  min={0}
                  value={formData.capitalInterestRate}
                  onChange={e => {
                    const val = Math.min(12, Math.max(0, Number(e.target.value)))
                    handleInputChange('capitalInterestRate', val)
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
                <span className="text-[10px] text-slate-500">Capped at 12% under Section 40(b)(iv).</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Partner Monthly Drawings Cap (₹)
                </label>
                <input
                  type="number"
                  value={formData.monthlyDrawingsLimit}
                  onChange={e => handleInputChange('monthlyDrawingsLimit', Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Banking & Operational Mandate */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              5. Banking Operations & Governance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={e => handleInputChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Bank Branch
                </label>
                <input
                  type="text"
                  value={formData.bankBranch}
                  onChange={e => handleInputChange('bankBranch', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Account Signing Authority
                </label>
                <select
                  value={formData.bankingSigningAuthority}
                  onChange={e => handleInputChange('bankingSigningAuthority', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="any_partner">Any One Partner Individually</option>
                  <option value="joint_all">Jointly by All Partners</option>
                  <option value="designated_managing">Designated Managing Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Single Signatory Limit (₹)
                </label>
                <input
                  type="number"
                  value={formData.bankingTransactionLimitSingle}
                  onChange={e => handleInputChange('bankingTransactionLimitSingle', Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Arbitration Seat City
                </label>
                <input
                  type="text"
                  value={formData.arbitrationSeat}
                  onChange={e => handleInputChange('arbitrationSeat', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Non-Compete Radius (Km) & Period (Years)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.nonCompeteRadiusKm}
                    onChange={e => handleInputChange('nonCompeteRadiusKm', Number(e.target.value))}
                    className="w-1/2 px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    value={formData.nonCompeteYears}
                    onChange={e => handleInputChange('nonCompeteYears', Number(e.target.value))}
                    className="w-1/2 px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Document Canvas & Auxiliary Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
            <button
              type="button"
              onClick={() => setActiveTab('deed')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap border-b-2 ${
                activeTab === 'deed'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              Partnership Deed
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rof-form-1')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap border-b-2 ${
                activeTab === 'rof-form-1'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 inline mr-1" />
              ROF Form 1
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bank-mandate')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap border-b-2 ${
                activeTab === 'bank-mandate'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 inline mr-1" />
              Bank Mandate
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stamp-guide')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap border-b-2 ${
                activeTab === 'stamp-guide'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5 inline mr-1" />
              Stamp Duty & Sec 69
            </button>
          </div>

          {/* TAB 1: Live Deed Canvas */}
          {activeTab === 'deed' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-h-[750px] overflow-y-auto font-serif text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm tracking-wide uppercase text-slate-900 dark:text-white font-sans">
                  PARTNERSHIP DEED
                </h3>
                <p className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-sans mt-0.5">
                  OF {formData.firmName.toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-500 font-sans">
                  Indian Partnership Act, 1932 • Section 40(b) Compliant
                </p>
              </div>

              <p className="text-justify">
                THIS DEED OF PARTNERSHIP is made on this <strong>{formData.executionDate}</strong> at{' '}
                <strong>{formData.executionCity}</strong>, State of <strong>{formData.executionState}</strong> by and between:
              </p>

              <div className="space-y-2 pl-3 border-l-2 border-indigo-200 dark:border-indigo-800 font-sans text-[11px]">
                {formData.partners.map((p, i) => (
                  <p key={i}>
                    <strong>{i + 1}. {p.name.toUpperCase()}</strong>, {p.fatherOrSpouse}, residing at {p.address} (PAN: {p.pan}) — <em>{i === 0 ? 'First Party' : i === 1 ? 'Second Party' : `Party ${i + 1}`}</em>
                  </p>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p><strong>1. FIRM NAME:</strong> &quot;{formData.firmName.toUpperCase()}&quot;</p>
                <p><strong>2. COMMENCEMENT & DURATION:</strong> Commenced on {formData.effectiveDate}, duration &quot;{formData.durationYears || 'At Will'}&quot;.</p>
                <p><strong>3. PRINCIPAL PLACE:</strong> {formData.principalAddress}</p>
                <p><strong>4. OBJECTS:</strong> {formData.businessObjects}</p>
                <p><strong>5. CAPITAL:</strong> Total Rs. {formatInrCurrency(formData.totalCapital)} ({formData.totalCapitalWords}).</p>
                <p><strong>6. PROFIT SHARING:</strong> {formData.partners.map(p => `${p.name}: ${p.profitShare}%`).join(' | ')}</p>
                <p><strong>7. INTEREST ON CAPITAL:</strong> {formData.hasCapitalInterest ? `Simple interest at ${formData.capitalInterestRate}% p.a. (max 12% as per Sec 40(b)(iv)).` : 'No interest on capital.'}</p>
                <p><strong>8. WORKING PARTNER REMUNERATION:</strong> Computed under Section 40(b)(v) formula (90% on first Rs. 6,00,000 book profit, 60% on balance).</p>
                <p><strong>9. SECTION 194T TDS:</strong> 10% TDS on partner salary, interest & bonus exceeding Rs. 20,000 p.a.</p>
                <p><strong>10. BANK ACCOUNT:</strong> {formData.bankName} operated {formData.bankingSigningAuthority}.</p>
                <p><strong>11. CONTINUATION (SEC 42(c) OVERRIDDEN):</strong> Firm does not dissolve on death/insolvency of a partner.</p>
                <p><strong>12. ARBITRATION:</strong> Sole arbitrator at {formData.arbitrationSeat}.</p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 font-sans text-[11px]">
                <p className="font-bold text-slate-900 dark:text-white">SIGNATURES OF ALL PARTNERS:</p>
                {formData.partners.map((p, i) => (
                  <p key={i} className="text-slate-600 dark:text-slate-400">
                    _________________________ ({p.name})
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ROF Form 1 Canvas */}
          {activeTab === 'rof-form-1' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-h-[750px] overflow-y-auto text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    FORM NO. 1 (Section 58)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Statement for Registration of Firm with Registrar of Firms
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload('rof-form-1', 'docx')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                >
                  Download Form 1 (.docx)
                </button>
              </div>

              <div className="space-y-2">
                <p><strong>1. Name of Firm:</strong> {formData.firmName}</p>
                <p><strong>2. Principal Place:</strong> {formData.principalAddress}</p>
                <p><strong>3. Branches:</strong> {formData.branchAddress || 'None'}</p>
                <p><strong>4. Duration:</strong> {formData.durationYears || 'At Will'}</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white">PARTNERS JOINING DETAILS:</p>
                {formData.partners.map((p, i) => (
                  <div key={i} className="p-2 rounded bg-slate-50 dark:bg-slate-800 text-[11px]">
                    <strong>{p.name}</strong> ({p.fatherOrSpouse}) | Address: {p.address} | Joined: {formData.effectiveDate}
                  </div>
                ))}
              </div>

              <p className="text-[11px] italic text-slate-500 pt-2">
                Verification: We, the partners, hereby verify that the above statement is true to our knowledge.
              </p>
            </div>
          )}

          {/* TAB 3: Bank Account Mandate */}
          {activeTab === 'bank-mandate' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-h-[750px] overflow-y-auto text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Bank Current Account Mandate
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Resolution on Firm Letterhead for Account Opening
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload('bank-mandate', 'docx')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                >
                  Download Letter (.docx)
                </button>
              </div>

              <p><strong>Date:</strong> {formData.executionDate}</p>
              <p><strong>To:</strong> The Branch Manager, {formData.bankName || 'The Bank'}, {formData.bankBranch || 'Branch Office'}</p>
              <p className="font-bold text-slate-900 dark:text-white">
                SUB: OPENING OF CURRENT ACCOUNT IN THE NAME OF &quot;{formData.firmName}&quot;
              </p>
              <p className="text-justify">
                We, the undersigned, being all the partners of &quot;{formData.firmName}&quot;, request you to open a Current Account in the firm&apos;s name. We enclose a certified copy of the Partnership Deed dated {formData.executionDate}.
              </p>
              <p className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-950 dark:text-indigo-200 font-semibold text-[11px]">
                Operational Mandate: Operated {formData.bankingSigningAuthority === 'any_partner' ? `singly by ANY ONE partner up to ₹${formatInrCurrency(formData.bankingTransactionLimitSingle)}, and jointly for higher amounts.` : 'jointly by all partners.'}
              </p>
            </div>
          )}

          {/* TAB 4: Stamp Duty & Section 69 Guide */}
          {activeTab === 'stamp-guide' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  State Stamp Duty Calculator (Article 46)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Select your state to calculate required non-judicial stamp duty for ₹{formatInrCurrency(formData.totalCapital)} capital
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Select State / UT:
                </label>
                <select
                  value={selectedState}
                  onChange={e => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {Object.entries(STATE_STAMP_RATES_DEED).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.state} ({item.rateText})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white text-sm">
                  <span>Required Stamp Duty:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ₹{formatInrCurrency(calculatedStampDuty)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  <strong>Statutory Article:</strong> {currentStampConfig.article}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  <strong>Ceiling Limit:</strong> {currentStampConfig.maxCapText}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  <strong>e-Stamping Portal:</strong> {currentStampConfig.eStampPortal}
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium pt-1 border-t border-slate-200 dark:border-slate-700">
                  Note: {currentStampConfig.notes}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200 space-y-1 text-[11px]">
                <span className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Section 69 Disabilities (If Firm is Unregistered):
                </span>
                <p>
                  Registration is optional, but Section 69 bars an unregistered firm from suing third parties in civil courts to recover debt or enforce contracts.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
