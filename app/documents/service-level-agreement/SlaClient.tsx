'use client'

import React, { useState } from 'react'
import {
  Download,
  FileText,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Shield,
  Clock,
  Sparkles,
  Calculator,
  Server,
  Cloud,
  Users,
  Wrench,
  UserCheck
} from 'lucide-react'
import { SlaType, SLA_PRESETS, SlaFormData } from '@/lib/doc-generator/sla-generator'

export default function SlaClient() {
  const [activeTab, setActiveTab] = useState<'instant' | 'customizer' | 'calculator'>('instant')
  const [selectedPreset, setSelectedPreset] = useState<SlaType>('cloud_computing')
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Customizer Form State
  const [formData, setFormData] = useState<SlaFormData>({
    slaType: 'cloud_computing',
    title: SLA_PRESETS.cloud_computing.title,
    effectiveDate: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    clientName: 'ALPHA ENTERPRISES PRIVATE LIMITED',
    clientCin: 'U72900MH2020PTC123456',
    clientAddress: '101, Express Towers, Nariman Point, Mumbai - 400021, Maharashtra, India',
    clientSignatoryName: 'Rajesh Sharma',
    clientSignatoryTitle: 'Director',
    providerName: 'NEXUS CLOUD SOLUTIONS PRIVATE LIMITED',
    providerCin: 'U72200DL2018PTC654321',
    providerAddress: 'Plot 45, Okhla Industrial Area Phase-III, New Delhi - 110020, India',
    providerSignatoryName: 'Amitabh Sen',
    providerSignatoryTitle: 'Managing Director',
    servicesDescription: SLA_PRESETS.cloud_computing.servicesDefault,
    uptimeTarget: '99.95%',
    maintenanceWindow: 'Every second Sunday from 01:00 AM to 04:00 AM IST with 5 days advance notice.',
    sev1ResponseTime: '1 Hour',
    sev1ResolutionTime: '4 Hours',
    sev2ResponseTime: '2 Hours',
    sev2ResolutionTime: '8 Hours',
    sev3ResponseTime: '8 Hours',
    sev3ResolutionTime: '24 Hours',
    sev4ResponseTime: '24 Hours',
    sev4ResolutionTime: '72 Hours',
    creditPercentage: '5% of monthly fees per 0.05% drop below 99.95%',
    penaltyCap: '25% of monthly billing',
    arbitrationSeat: 'New Delhi',
    termMonths: '12',
  })

  // Calculator State
  const [calcMonthlyFee, setCalcMonthlyFee] = useState<number>(200000)
  const [calcDowntimeHours, setCalcDowntimeHours] = useState<number>(4)
  const [calcUptimeTarget, setCalcUptimeTarget] = useState<number>(99.9)

  const handlePresetSelect = (type: SlaType) => {
    setSelectedPreset(type)
    const p = SLA_PRESETS[type]
    setFormData(prev => ({
      ...prev,
      slaType: type,
      title: p.title,
      servicesDescription: p.servicesDefault,
      uptimeTarget: p.uptimeDefault,
      maintenanceWindow: p.maintenanceDefault,
      creditPercentage: p.creditDefault,
      penaltyCap: p.capDefault,
    }))
  }

  const handleInstantDownload = (type: SlaType, format: 'docx' | 'pdf') => {
    setDownloadingFormat(`${type}-${format}`)
    const url = `/api/documents/sla-download?type=${type}&format=${format}`
    const a = document.createElement('a')
    a.href = url
    a.download = `Service_Level_Agreement_${type}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => setDownloadingFormat(null), 1500)
  }

  const handleCustomDownload = async (format: 'docx' | 'pdf') => {
    setDownloadingFormat(`custom-${format}`)
    try {
      const res = await fetch('/api/documents/sla-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, format }),
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Custom_SLA_${formData.slaType}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    } finally {
      setDownloadingFormat(null)
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Calculate SLA Credits:
  // Total hours in 30-day month = 720 hours
  // 99.9% uptime allows 0.72 hours downtime
  // Actual downtime hours = calcDowntimeHours
  const allowedDowntimeHours = 720 * (1 - calcUptimeTarget / 100)
  const excessDowntimeHours = Math.max(0, calcDowntimeHours - allowedDowntimeHours)
  // Credit rate = 2% per excess hour, capped at 25%
  const calculatedCreditPct = Math.min(25, Math.round(excessDowntimeHours * 2))
  const calculatedCreditAmount = Math.round((calcMonthlyFee * calculatedCreditPct) / 100)
  const actualUptimePct = (((720 - calcDowntimeHours) / 720) * 100).toFixed(2)

  const presetIcons: Record<SlaType, React.ReactNode> = {
    cloud_computing: <Cloud className="w-4 h-4" />,
    it_saas: <Server className="w-4 h-4" />,
    vendor_customer: <Users className="w-4 h-4" />,
    software_maintenance: <Wrench className="w-4 h-4" />,
    recruitment_hr: <UserCheck className="w-4 h-4" />,
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden mb-12">
      {/* ─── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-2 flex-wrap sm:flex-nowrap">
        <button
          onClick={() => setActiveTab('instant')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'instant'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Download className="w-4 h-4 text-amber-500" />
          <span>1-Click Downloads (.docx / .pdf)</span>
        </button>

        <button
          onClick={() => setActiveTab('customizer')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'customizer'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>Interactive SLA Customizer</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'calculator'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>Service Credit Penalty Calculator</span>
        </button>
      </div>

      {/* ─── TAB 1: 1-Click Instant Downloads ─────────────────────────────── */}
      {activeTab === 'instant' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Select Pre-Configured Industry SLA Template
              </h3>
              <p className="text-xs text-slate-500">
                Drafted under the Indian Contract Act 1872 & DPDP Act 2023. Ready for immediate legal execution.
              </p>
            </div>
            <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-1 rounded-full">
              Updated September 2026
            </span>
          </div>

          {/* Preset Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(SLA_PRESETS) as SlaType[]).map(key => {
              const p = SLA_PRESETS[key]
              const isSelected = selectedPreset === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePresetSelect(key)}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {presetIcons[key]}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {p.uptimeDefault}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-heading">
                      {p.shortLabel}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active Preset Action Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready-To-Sign Format</span>
              </div>
              <h4 className="text-xl font-extrabold font-heading text-white">
                {SLA_PRESETS[selectedPreset].title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Includes Uptime Target ({SLA_PRESETS[selectedPreset].uptimeDefault}), 4-tier Severity Response Matrix,
                Service Credit calculation under Section 74 Indian Contract Act, and mandatory DPDP Act 2023 data processing safeguards.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => handleInstantDownload(selectedPreset, 'docx')}
                disabled={downloadingFormat !== null}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingFormat === `${selectedPreset}-docx` ? 'Generating...' : 'Download Word (.docx)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleInstantDownload(selectedPreset, 'pdf')}
                disabled={downloadingFormat !== null}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-50"
              >
                <FileText className="w-4 h-4 text-rose-400" />
                <span>{downloadingFormat === `${selectedPreset}-pdf` ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Interactive SLA Customizer ───────────────────────────── */}
      {activeTab === 'customizer' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold font-heading text-slate-900">
              Customize SLA Parameters Online
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in your corporate entities, uptime thresholds, and penalty limits to generate a custom ready-to-print agreement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Client Details */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Client (Customer) Details
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client CIN</label>
                  <input
                    type="text"
                    value={formData.clientCin || ''}
                    onChange={e => setFormData({ ...formData, clientCin: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={formData.clientSignatoryName}
                    onChange={e => setFormData({ ...formData, clientSignatoryName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Office Address</label>
                <textarea
                  rows={2}
                  value={formData.clientAddress}
                  onChange={e => setFormData({ ...formData, clientAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Right: Service Provider Details */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-600" /> Service Provider Details
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Provider Legal Name</label>
                <input
                  type="text"
                  value={formData.providerName}
                  onChange={e => setFormData({ ...formData, providerName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Provider CIN</label>
                  <input
                    type="text"
                    value={formData.providerCin || ''}
                    onChange={e => setFormData({ ...formData, providerCin: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={formData.providerSignatoryName}
                    onChange={e => setFormData({ ...formData, providerSignatoryName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Office Address</label>
                <textarea
                  rows={2}
                  value={formData.providerAddress}
                  onChange={e => setFormData({ ...formData, providerAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Operational Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Uptime Target (%)</label>
              <input
                type="text"
                value={formData.uptimeTarget}
                onChange={e => setFormData({ ...formData, uptimeTarget: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Penalty Cap</label>
              <input
                type="text"
                value={formData.penaltyCap}
                onChange={e => setFormData({ ...formData, penaltyCap: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Arbitration Seat (City)</label>
              <input
                type="text"
                value={formData.arbitrationSeat}
                onChange={e => setFormData({ ...formData, arbitrationSeat: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => handleCustomDownload('docx')}
              disabled={downloadingFormat !== null}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{downloadingFormat === 'custom-docx' ? 'Generating Document...' : 'Download Custom Word (.docx)'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCustomDownload('pdf')}
              disabled={downloadingFormat !== null}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>{downloadingFormat === 'custom-pdf' ? 'Generating PDF...' : 'Download Custom PDF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Service Credit Penalty Calculator ──────────────────────── */}
      {activeTab === 'calculator' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              Service Credit & Liquidated Damages Calculator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate statutory downtime compensation under Section 74 of the Indian Contract Act, 1872.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Service Retainer / Billing (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={calcMonthlyFee}
                  onChange={e => setCalcMonthlyFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contracted Uptime Target (%)
                  </label>
                  <select
                    value={calcUptimeTarget}
                    onChange={e => setCalcUptimeTarget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value={99.99}>99.99% (Four Nines — Mission Critical)</option>
                    <option value={99.9}>99.9% (Three Nines — Standard Cloud/SaaS)</option>
                    <option value={99.5}>99.5% (Enterprise Business Hours)</option>
                    <option value={99.0}>99.0% (General Commercial SLA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Actual Outage / Downtime (Hours in Month)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={calcDowntimeHours}
                    onChange={e => setCalcDowntimeHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
                <strong>Statutory Note (Sec. 74 Indian Contract Act 1872):</strong> Service credits must reflect genuine pre-estimated losses. In Indian courts (<em>Maula Bux v. Union of India</em>), excessive uncapped penalties without proof of loss risk being set aside as punitive forfeitures. A 15%–25% monthly billing cap is standard industry practice.
              </div>
            </div>

            {/* Result Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Calculated Remedy
                </span>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-amber-400 tabular-nums font-mono">
                    ₹{calculatedCreditAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Service Credit ({calculatedCreditPct}% of billing)
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Permitted Downtime:</span>
                    <span className="font-mono text-white">{allowedDowntimeHours.toFixed(2)} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Excess Downtime:</span>
                    <span className="font-mono text-rose-400">{excessDowntimeHours.toFixed(2)} hrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Availability:</span>
                    <span className="font-mono text-amber-300">{actualUptimePct}%</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `Service Credit Calculation:\nMonthly Billing: ₹${calcMonthlyFee.toLocaleString('en-IN')}\nTarget Uptime: ${calcUptimeTarget}%\nActual Downtime: ${calcDowntimeHours} hrs\nCredit Percentage: ${calculatedCreditPct}%\nPayable Credit: ₹${calculatedCreditAmount.toLocaleString('en-IN')}`,
                    'calc'
                  )
                }
                className="mt-6 w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-2.5 rounded-xl border border-slate-700 transition-colors"
              >
                {copiedKey === 'calc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'calc' ? 'Copied Calculation!' : 'Copy Calculation Note'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
