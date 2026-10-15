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
  Building2,
  User,
  ArrowRight,
  Gavel,
  Check,
  Globe,
  Home,
  FileCheck,
} from 'lucide-react'
import {
  PoaFormData,
  PoaType,
  PoaRevocability,
  DEFAULT_SAMPLE_POA_DATA,
  generatePoaMarkdown,
} from '@/lib/doc-generator/poa-generator'
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

export default function PoaClient() {
  const [formData, setFormData] = useState<PoaFormData>(DEFAULT_SAMPLE_POA_DATA)
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form')
  const [isDownloading, setIsDownloading] = useState<'docx' | 'pdf' | null>(null)
  const [downloadError, setDownloadError] = useState<string>('')
  const [isCopied, setIsCopied] = useState<boolean>(false)

  // Live markdown text for preview
  const markdownText = useMemo(() => {
    return generatePoaMarkdown(formData)
  }, [formData])

  const handleInputChange = (field: keyof PoaFormData, value: any) => {
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
      const res = await fetch('/api/documents/poa-download', {
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
      const safeName = (formData.attorneyName || 'Attorney')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 25)
      a.download = `Power_of_Attorney_${safeName}.${format}`
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
          {/* Section 1: Classification & Revocability */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Gavel className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. POA Type &amp; Revocability Classification
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  POA Classification:
                </label>
                <select
                  value={formData.poaType}
                  onChange={e => handleInputChange('poaType', e.target.value as PoaType)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  <option value="General Power of Attorney">General Power of Attorney (GPA)</option>
                  <option value="Special Power of Attorney">Special Power of Attorney (SPA)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Revocability Nature:
                </label>
                <select
                  value={formData.revocability}
                  onChange={e => handleInputChange('revocability', e.target.value as PoaRevocability)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  <option value="Revocable">Revocable at Will of Principal</option>
                  <option value="Irrevocable (Coupled with Interest — Sec 202)">
                    Irrevocable (Coupled with Interest — Sec 202)
                  </option>
                </select>
              </div>
            </div>

            {formData.revocability.includes('Irrevocable') && (
              <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-lg text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Section 202 Mandate:</strong> Under Indian Contract Act, agency is irrevocable ONLY if the
                  agent has an existing pecuniary or proprietary interest in the subject property. General POAs without
                  financial interest cannot be made irrevocable.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Date of Execution:</label>
                <input
                  type="text"
                  value={formData.executionDate}
                  onChange={e => handleInputChange('executionDate', e.target.value)}
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

          {/* Section 2: Principal (Grantor) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  2. Principal (Grantor of Power)
                </h2>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isNri}
                  onChange={e => handleInputChange('isNri', e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>NRI Executing Abroad</span>
              </label>
            </div>

            {formData.isNri && (
              <div className="p-3 bg-blue-950/40 border border-blue-600/50 rounded-lg text-xs text-blue-200 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-blue-300">
                  <Globe className="w-4 h-4" />
                  <span>NRI 3-Month Stamping Rule (Section 18, Indian Stamp Act, 1899)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Execute before the Indian Consulate or a Notary Public abroad (with Apostille if required), courier
                  the original to India, and submit to the District Registrar / Collector of Stamps for adjudication &amp;
                  stamping <strong>within 3 months (90 days)</strong> of its receipt in India.
                </p>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Country of Residence:</label>
                  <input
                    type="text"
                    value={formData.nriCountry || ''}
                    onChange={e => handleInputChange('nriCountry', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded p-1.5 text-xs outline-none"
                    placeholder="e.g. United Arab Emirates (Dubai) / USA / UK"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Principal Legal Name:</label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={e => handleInputChange('principalName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Father's / Spouse's Name:</label>
                <input
                  type="text"
                  value={formData.principalFatherOrSpouse}
                  onChange={e => handleInputChange('principalFatherOrSpouse', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Age (Years):</label>
                <input
                  type="text"
                  value={formData.principalAge}
                  onChange={e => handleInputChange('principalAge', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">PAN (Optional):</label>
                <input
                  type="text"
                  value={formData.principalPan || ''}
                  onChange={e => handleInputChange('principalPan', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none uppercase"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Aadhaar (Masked):</label>
                <input
                  type="text"
                  value={formData.principalAadhaar || ''}
                  onChange={e => handleInputChange('principalAadhaar', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="XXXX-XXXX-1234"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Residential Address:</label>
              <textarea
                value={formData.principalAddress}
                onChange={e => handleInputChange('principalAddress', e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Section 3: Attorney (Agent) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                3. Attorney / Agent (Grantee of Power)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Attorney Legal Name:</label>
                <input
                  type="text"
                  value={formData.attorneyName}
                  onChange={e => handleInputChange('attorneyName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Relationship to Principal:</label>
                <input
                  type="text"
                  value={formData.attorneyRelationship}
                  onChange={e => handleInputChange('attorneyRelationship', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Son / Brother / Spouse / Advocate"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Father's / Spouse's Name:</label>
                <input
                  type="text"
                  value={formData.attorneyFatherOrSpouse}
                  onChange={e => handleInputChange('attorneyFatherOrSpouse', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Age (Years):</label>
                <input
                  type="text"
                  value={formData.attorneyAge}
                  onChange={e => handleInputChange('attorneyAge', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">PAN (Optional):</label>
                <input
                  type="text"
                  value={formData.attorneyPan || ''}
                  onChange={e => handleInputChange('attorneyPan', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none uppercase"
                  placeholder="XYZPA5432M"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Attorney Residence Address:</label>
              <textarea
                value={formData.attorneyAddress}
                onChange={e => handleInputChange('attorneyAddress', e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Section 4: Powers Granted */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                4. Specific Powers Conferred
              </h2>
            </div>

            <div className="space-y-2.5">
              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.powerBankAccounts}
                  onChange={e => handleInputChange('powerBankAccounts', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <strong className="text-white block">Operate Bank Accounts:</strong>
                  <span className="text-slate-400">
                    Sign cheques, manage savings/current/FD accounts, execute RTGS/NEFT instructions.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.powerProperty}
                  onChange={e => handleInputChange('powerProperty', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <strong className="text-white block">Manage &amp; Let Out Immovable Property:</strong>
                  <span className="text-slate-400">
                    Supervise property, let out on lease/leave &amp; license, collect rents, pay property tax.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.powerTaxAuthorities}
                  onChange={e => handleInputChange('powerTaxAuthorities', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <strong className="text-white block">Represent Before Tax &amp; Govt. Authorities:</strong>
                  <span className="text-slate-400">
                    Appear before Income Tax, GST, Municipal Ward, Registrar of Companies, and Revenue officers.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.powerLitigation}
                  onChange={e => handleInputChange('powerLitigation', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <strong className="text-white block">Represent in Court &amp; Engage Advocates:</strong>
                  <span className="text-slate-400">
                    Institute and defend civil/criminal suits, sign plaints, affidavits, and appoint legal counsel.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.powerRegistration}
                  onChange={e => handleInputChange('powerRegistration', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <strong className="text-white block">Execute &amp; Register Documents:</strong>
                  <span className="text-slate-400">
                    Present deeds and admit execution before the Sub-Registrar of Assurances.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.powerMoneys}
                  onChange={e => handleInputChange('powerMoneys', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <div>
                  <strong className="text-white block">Recover Moneys &amp; Issue Valid Receipts:</strong>
                  <span className="text-slate-400">
                    Demand, sue for, collect all debts, sums, dues and grant binding legal discharges.
                  </span>
                </div>
              </label>
            </div>

            {/* Conditional Property Details */}
            {formData.powerProperty && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Home className="w-3.5 h-3.5" />
                  <span>Property Details (For Schedule of Property):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Unit / Plot / Survey No.:</label>
                    <input
                      type="text"
                      value={formData.propertySurveyOrFlatNo || ''}
                      onChange={e => handleInputChange('propertySurveyOrFlatNo', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded p-1.5 text-xs outline-none"
                      placeholder="e.g. Unit 302 / Survey 44"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Building / Society:</label>
                    <input
                      type="text"
                      value={formData.propertyBuilding || ''}
                      onChange={e => handleInputChange('propertyBuilding', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded p-1.5 text-xs outline-none"
                      placeholder="e.g. Trade Tower Co-op Society"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">City:</label>
                    <input
                      type="text"
                      value={formData.propertyCity || ''}
                      onChange={e => handleInputChange('propertyCity', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded p-1.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">State:</label>
                    <input
                      type="text"
                      value={formData.propertyState || ''}
                      onChange={e => handleInputChange('propertyState', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded p-1.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Area (sq. ft.):</label>
                    <input
                      type="text"
                      value={formData.propertyArea || ''}
                      onChange={e => handleInputChange('propertyArea', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded p-1.5 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Other Bespoke Powers (Optional):
              </label>
              <textarea
                value={formData.otherPowers || ''}
                onChange={e => handleInputChange('otherPowers', e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none resize-none"
                placeholder="e.g. Specific authority to appear before municipal board for water connection..."
              />
            </div>
          </div>

          {/* Section 5: Duration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                5. Duration of Authority
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Duration Mode:</label>
                <select
                  value={formData.durationMode}
                  onChange={e => handleInputChange('durationMode', e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  <option value="Until Revoked in Writing">Until Revoked in Writing</option>
                  <option value="Fixed Period">Fixed Expiry Date</option>
                </select>
              </div>
              {formData.durationMode === 'Fixed Period' && (
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Valid Until Date:</label>
                  <input
                    type="text"
                    value={formData.validUntilDate || ''}
                    onChange={e => handleInputChange('validUntilDate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    placeholder="e.g. 31st October 2027"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Maharashtra Stamp Duty Guide Box */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Gavel className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white">
                Maharashtra Stamp Duty Reference (Article 48)
              </h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
              <li>
                <strong>To Close Relatives (Father, Mother, Spouse, Son, Daughter, Brother, Sister):</strong>{' '}
                Flat <strong>₹500</strong> stamp duty without consideration.
              </li>
              <li>
                <strong>To Non-Relatives / Developer / For Consideration:</strong> Same stamp duty as conveyance
                deed (Article 25) based on market value.
              </li>
              <li>
                <strong>General Non-Property POA:</strong> Flat <strong>₹500</strong> per person authorized.
              </li>
            </ul>
          </div>

          {/* AI Clause Builder Integration */}
          <AiClauseBuilder
            documentType="General Power of Attorney"
            existingClauseTitles={[
              'Banking Operations',
              'Property Management',
              'Revenue Authorities Representation',
              'Litigation & Court Proceedings',
              'Registration of Deeds',
              'Moneys Recovery',
              'Ratification',
            ]}
            customClauses={formData.customClauses || []}
            onAddClause={handleAddClause}
            onRemoveClause={handleRemoveClause}
          />
        </div>

        {/* Right Preview Column */}
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
                  Court-admissible text ready for non-judicial stamp paper &amp; notarial attestation
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
                Powers of Attorney Act, 1882 compliant
              </span>
              <span>Notary Attestation &amp; Stamping Recommended</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
