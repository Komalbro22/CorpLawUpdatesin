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
  Home,
  Building2,
  User,
  ArrowRight,
  Gavel,
  Check,
  Calculator,
  Sparkles,
} from 'lucide-react'
import {
  LeaseFormData,
  LeaseAgreementType,
  DEFAULT_SAMPLE_LEASE_DATA,
  generateLeaseMarkdown,
  calculateMaharashtraStampDuty,
} from '@/lib/doc-generator/lease-generator'
import LegalDocRenderer, { cleanMarkdownForClipboard } from '@/components/documents/LegalDocRenderer'
import AiClauseBuilder, { CustomClauseItem } from '@/components/documents/AiClauseBuilder'

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

export default function LeaseClient() {
  const [formData, setFormData] = useState<LeaseFormData>(DEFAULT_SAMPLE_LEASE_DATA)
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form')
  const [isDownloading, setIsDownloading] = useState<'docx' | 'pdf' | null>(null)
  const [downloadError, setDownloadError] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)

  // Live markdown text for preview
  const markdownText = useMemo(() => {
    return generateLeaseMarkdown(formData)
  }, [formData])

  // Live Maharashtra stamp duty calculation
  const mhDuty = useMemo(() => {
    return calculateMaharashtraStampDuty(
      formData.monthlyRent,
      formData.tenureMonths,
      formData.securityDeposit,
      formData.nonRefundableDeposit || 0
    )
  }, [formData.monthlyRent, formData.tenureMonths, formData.securityDeposit, formData.nonRefundableDeposit])

  const handleInputChange = (field: keyof LeaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const handleCopyText = async () => {
    try {
      const clean = cleanMarkdownForClipboard(markdownText)
      await navigator.clipboard.writeText(clean)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    } catch {
      setDownloadError('Could not copy to clipboard automatically.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async (format: 'docx' | 'pdf') => {
    setIsDownloading(format)
    setDownloadError('')
    try {
      const res = await fetch('/api/documents/lease-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, format }),
      })

      if (!res.ok) {
        throw new Error(`Server returned error code ${res.status}`)
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = (formData.lesseeName || 'Tenant')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 25)
      a.download = `Rent_Agreement_${safeName}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Download error:', err)
      setDownloadError('Failed to generate document. Please use Copy Text or try again.')
    } finally {
      setIsDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mobile Tab Toggle */}
      <div className="flex sm:hidden p-1 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveMobileTab('form')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition ${
            activeMobileTab === 'form'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Edit Terms
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition ${
            activeMobileTab === 'preview'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Live Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div
          className={`lg:col-span-6 space-y-6 ${
            activeMobileTab === 'preview' ? 'hidden sm:block' : 'block'
          }`}
        >
          {/* Section 1: Agreement Class */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Gavel className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Agreement Type & Execution Place
              </h2>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Select Agreement Format:
              </label>
              <select
                value={formData.agreementType}
                onChange={e =>
                  handleInputChange('agreementType', e.target.value as LeaseAgreementType)
                }
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <option value="11-Month Leave & License (Maharashtra)">
                  11-Month Leave &amp; License (Maharashtra — Indian Easements Act, Sec 52)
                </option>
                <option value="11-Month Rent Agreement (other states)">
                  11-Month Rent Agreement (Other States — Registration Act, Sec 17)
                </option>
                <option value="Registered Lease Deed (1+ years)">
                  Registered Lease Deed (1+ Years — Transfer of Property Act, Sec 107)
                </option>
                <option value="Commercial Lease">
                  Commercial Lease Deed (Office / Retail / Industrial)
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Agreement Date:</label>
                <input
                  type="text"
                  value={formData.agreementDate}
                  onChange={e => handleInputChange('agreementDate', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="e.g. 15th October 2026"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Execution City:</label>
                <input
                  type="text"
                  value={formData.executionCity}
                  onChange={e => handleInputChange('executionCity', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">State:</label>
                <select
                  value={formData.executionState}
                  onChange={e => handleInputChange('executionState', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Owner / Licensor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Owner / Licensor (First Party)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Full Legal Name:</label>
                <input
                  type="text"
                  value={formData.lessorName}
                  onChange={e => handleInputChange('lessorName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Father's / Spouse's Name:</label>
                <input
                  type="text"
                  value={formData.lessorFatherOrSpouse}
                  onChange={e => handleInputChange('lessorFatherOrSpouse', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Age (Years):</label>
                <input
                  type="text"
                  value={formData.lessorAge}
                  onChange={e => handleInputChange('lessorAge', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">PAN (Optional):</label>
                <input
                  type="text"
                  value={formData.lessorPan || ''}
                  onChange={e => handleInputChange('lessorPan', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none uppercase"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Aadhaar (Masked):</label>
                <input
                  type="text"
                  value={formData.lessorAadhaar || ''}
                  onChange={e => handleInputChange('lessorAadhaar', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="XXXX-XXXX-1234"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Residential Address:</label>
              <textarea
                value={formData.lessorAddress}
                onChange={e => handleInputChange('lessorAddress', e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Section 3: Tenant / Licensee */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                3. Tenant / Licensee (Second Party)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Full Legal Name:</label>
                <input
                  type="text"
                  value={formData.lesseeName}
                  onChange={e => handleInputChange('lesseeName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Father's / Spouse's Name:</label>
                <input
                  type="text"
                  value={formData.lesseeFatherOrSpouse}
                  onChange={e => handleInputChange('lesseeFatherOrSpouse', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Age (Years):</label>
                <input
                  type="text"
                  value={formData.lesseeAge}
                  onChange={e => handleInputChange('lesseeAge', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Occupation / Employer:</label>
                <input
                  type="text"
                  value={formData.lesseeEmployment || ''}
                  onChange={e => handleInputChange('lesseeEmployment', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">PAN / Aadhaar:</label>
                <input
                  type="text"
                  value={formData.lesseePan || ''}
                  onChange={e => handleInputChange('lesseePan', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none uppercase"
                  placeholder="PAN / Identity Proof"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Permanent Residence Address:</label>
              <textarea
                value={formData.lesseePermanentAddress}
                onChange={e => handleInputChange('lesseePermanentAddress', e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Section 4: Scheduled Property */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Home className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                4. Scheduled Property Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Property Type:</label>
                <select
                  value={formData.propertyType}
                  onChange={e => handleInputChange('propertyType', e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  <option value="Residential Flat / Apartment">Residential Flat / Apartment</option>
                  <option value="Independent House / Villa">Independent House / Villa</option>
                  <option value="Commercial Office">Commercial Office</option>
                  <option value="Retail Shop">Retail Shop</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Flat / Unit Number:</label>
                <input
                  type="text"
                  value={formData.propertyNumber}
                  onChange={e => handleInputChange('propertyNumber', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Flat No. 404, 4th Floor"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Building / Society Name:</label>
                <input
                  type="text"
                  value={formData.buildingName}
                  onChange={e => handleInputChange('buildingName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Street &amp; Locality:</label>
                <input
                  type="text"
                  value={formData.locality}
                  onChange={e => handleInputChange('locality', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Built-up / Carpet Area:</label>
                <input
                  type="text"
                  value={formData.superBuiltUpArea}
                  onChange={e => handleInputChange('superBuiltUpArea', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="e.g. 850 sq. ft."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Furnishing Status:</label>
                <select
                  value={formData.furnishingStatus}
                  onChange={e => handleInputChange('furnishingStatus', e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Parking Slot (Optional):</label>
                <input
                  type="text"
                  value={formData.parkingSlot || ''}
                  onChange={e => handleInputChange('parkingSlot', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Covered Car Space #P-14"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Fixtures &amp; Inventory List:
              </label>
              <textarea
                value={formData.fixturesInventory}
                onChange={e => handleInputChange('fixturesInventory', e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                placeholder="e.g. 3 ceiling fans, 2 split ACs, modular kitchen, geyser..."
              />
            </div>
          </div>

          {/* Section 5: Commercial Terms */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                5. Commercial Terms &amp; Rent Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Monthly Rent (₹):</label>
                <input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={e => handleInputChange('monthlyRent', Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Security Deposit (₹):</label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={e => handleInputChange('securityDeposit', Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Tenure (Months):</label>
                <input
                  type="number"
                  value={formData.tenureMonths}
                  onChange={e => handleInputChange('tenureMonths', Number(e.target.value) || 11)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Rent Due Date:</label>
                <input
                  type="number"
                  value={formData.rentDueDate}
                  min={1}
                  max={28}
                  onChange={e => handleInputChange('rentDueDate', Number(e.target.value) || 5)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Lock-in Period (Months):</label>
                <input
                  type="number"
                  value={formData.lockInPeriodMonths}
                  onChange={e => handleInputChange('lockInPeriodMonths', Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Notice Period (Months):</label>
                <select
                  value={formData.noticePeriodMonths}
                  onChange={e => handleInputChange('noticePeriodMonths', Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  <option value={1}>1 Month</option>
                  <option value={2}>2 Months</option>
                  <option value={3}>3 Months</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Society Maintenance Borne By:</label>
                <select
                  value={formData.maintenancePayer}
                  onChange={e => handleInputChange('maintenancePayer', e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  <option value="Lessor / Owner">Lessor / Owner</option>
                  <option value="Lessee / Tenant">Lessee / Tenant</option>
                  <option value="Shared Equally">Shared Equally</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Rent Escalation on Renewal (%):</label>
                <input
                  type="number"
                  value={formData.annualEscalationPercent}
                  onChange={e => handleInputChange('annualEscalationPercent', Number(e.target.value) || 5)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Maharashtra Stamp Duty Interactive Estimator Box */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Maharashtra Stamp Duty &amp; Registration Fee Calculator
                </h3>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Compulsory Digital Stamping
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Under the Maharashtra Stamp Act, stamp duty is levied at <strong>0.25%</strong> on total rent + 10% notional interest per year on refundable deposit for tenures up to 5 years:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Rent</span>
                <span className="font-semibold text-white">₹{mhDuty.totalRent.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">10% Notional Int.</span>
                <span className="font-semibold text-white">₹{mhDuty.notionalInterest.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Taxable Base</span>
                <span className="font-semibold text-white">₹{mhDuty.taxableBase.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-amber-950/60 p-2.5 rounded-lg border border-amber-500/40">
                <span className="text-amber-300 block text-[10px] font-bold">Stamp Duty (0.25%)</span>
                <span className="font-bold text-amber-400 text-sm">₹{mhDuty.stampDuty.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Registration Fee: <strong>₹{mhDuty.registrationFeeUrban}</strong> (Urban) / <strong>₹{mhDuty.registrationFeeRural}</strong> (Rural)</span>
              <span className="text-amber-300 font-medium">w.e.f. 1 July 2025: Digital Stamping Mandatory</span>
            </div>
          </div>

          {/* AI Clause Builder Integration */}
          <AiClauseBuilder
            documentType="Lease / Rent Agreement"
            existingClauseTitles={[
              'Grant of Temporary Occupation',
              'Term and Tenure',
              'Monthly Rent',
              'Security Deposit',
              'Maintenance & Utilities',
              'Subletting Restriction',
              'Inspection Rights',
              'Lock-in & Termination',
              'Police Verification',
            ]}
            customClauses={formData.customClauses || []}
            onAddClause={handleAddClause}
            onRemoveClause={handleRemoveClause}
          />
        </div>

        {/* Right Preview & Action Column */}
        <div
          className={`lg:col-span-6 space-y-4 ${
            activeMobileTab === 'form' ? 'hidden sm:block' : 'block'
          }`}
        >
          {/* Action Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 sticky top-6 z-20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Live Document Preview
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Legal formatting ready for non-judicial stamp paper or e-stamping
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 inline-flex items-center gap-1.5 transition"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Text
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 inline-flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  disabled={isDownloading === 'docx'}
                  onClick={() => handleDownload('docx')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isDownloading === 'docx' ? 'Generating Word...' : 'Word (.docx)'}
                </button>
                <button
                  type="button"
                  disabled={isDownloading === 'pdf'}
                  onClick={() => handleDownload('pdf')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 inline-flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-red-400" />
                  {isDownloading === 'pdf' ? 'Generating PDF...' : 'PDF'}
                </button>
              </div>
            </div>

            {downloadError && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-200">
                {downloadError}
              </div>
            )}

            {/* Clean LegalDocRenderer Canvas */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 sm:p-6 max-h-[750px] overflow-y-auto text-slate-100 shadow-inner">
              <LegalDocRenderer content={markdownText} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Transfer of Property Act &amp; Easements Act compliant
              </span>
              <span>Print on ₹100/₹500 Stamp Paper or E-Stamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
