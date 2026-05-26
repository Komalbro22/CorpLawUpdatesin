// src/app/admin/rates/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Landmark, Save, ShieldAlert, Users, ExternalLink, Sliders } from 'lucide-react'
import { useToast } from '@/components/Toast'

export default function AdminRatesOverridePage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  // Settings states matching DB compliance_rates
  const [bankRate, setBankRate] = useState('6.75')
  const [whatsappCount, setWhatsappCount] = useState('12000')
  const [isAmnestyActive, setIsAmnestyActive] = useState('false')
  const [schemeName, setSchemeName] = useState('')
  const [schemeUrl, setSchemeUrl] = useState('')

  useEffect(() => {
    async function loadRates() {
      try {
        const response = await fetch('/api/admin/rates')
        if (response.ok) {
          const d = await response.json()
          const list = d.rates || []
          
          const br = list.find((r: any) => r.key === 'rbi_bank_rate')
          if (br) setBankRate(String(br.rate_value || '6.75'))

          const wa = list.find((r: any) => r.key === 'whatsapp_member_count')
          if (wa) setWhatsappCount(String(wa.text_value || '12000'))

          const am = list.find((r: any) => r.key === 'active_amnesty_scheme')
          if (am) setIsAmnestyActive(am.text_value || 'false')

          const name = list.find((r: any) => r.key === 'amnesty_scheme_name')
          if (name) setSchemeName(name.text_value || '')

          const url = list.find((r: any) => r.key === 'amnesty_scheme_url')
          if (url) setSchemeUrl(url.text_value || '')
        } else {
          showToast('Failed to load active rates from database cache.', 'error')
        }
      } catch (err) {
        console.error('Failed to load rates:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRates()
  }, [])

  const updateSetting = async (key: string, rateValue: number | null, textValue: string | null) => {
    setSavingKey(key)
    try {
      const response = await fetch('/api/admin/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, rate_value: rateValue, text_value: textValue })
      })

      if (response.ok) {
        showToast(`Statutory setting '${key}' successfully updated!`, 'success')
      } else {
        const err = await response.json()
        showToast(err.error || 'Failed to update settings.', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('API connection error during save.', 'error')
    } finally {
      setSavingKey(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500 font-sans">
        <div className="w-8 h-8 rounded-full border-4 border-slate-700 border-t-amber-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading statutory variables…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl text-white font-sans">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
          <Sliders className="w-7 h-7 text-amber-500" />
          Tool Rates & Waiver Override Panel
        </h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          Directly manage delayed compounding interest reference rates, WhatsApp counts, and active MCA CFSS waivers.
        </p>
      </div>

      {/* WORKSPACE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: RBI Rates and WhatsApp settings */}
        <div className="space-y-6">
          
          {/* RBI Rate Card */}
          <div className="bg-slate-900 border border-white/5 rounded-xl p-6 space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Landmark className="w-5 h-5 text-amber-500" />
              RBI Bank Reference Rate
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Enter the statutory bank rate under Section 49 of the RBI Act. Compounding calculators use 3× this value.
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.01"
                value={bankRate}
                onChange={(e) => setBankRate(e.target.value)}
                className="flex-grow bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={() => updateSetting('rbi_bank_rate', parseFloat(bankRate), null)}
                disabled={savingKey === 'rbi_bank_rate'}
                className="inline-flex items-center gap-1.5 px-4 bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs rounded-lg uppercase tracking-wider disabled:opacity-50 transition-colors shrink-0"
              >
                <Save className="w-4 h-4" />
                Save Rate
              </button>
            </div>
          </div>

          {/* WhatsApp Member Count */}
          <div className="bg-slate-900 border border-white/5 rounded-xl p-6 space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Users className="w-5 h-5 text-amber-500" />
              WhatsApp Member Count
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              Update the active community subscriber numbers displayed on the homepage sidebar.
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                value={whatsappCount}
                onChange={(e) => setWhatsappCount(e.target.value)}
                className="flex-grow bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={() => updateSetting('whatsapp_member_count', null, whatsappCount)}
                disabled={savingKey === 'whatsapp_member_count'}
                className="inline-flex items-center gap-1.5 px-4 bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs rounded-lg uppercase tracking-wider disabled:opacity-50 transition-colors shrink-0"
              >
                <Save className="w-4 h-4" />
                Save Count
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Amnesty Waiver toggles */}
        <div className="bg-slate-900 border border-white/5 rounded-xl p-6 space-y-5 shadow-lg">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            MCA CFSS / Amnesty Scheme Waiver Settings
          </h3>
          <p className="text-xs text-slate-400 leading-normal">
            Enable or disable standard daily additional late filing fees (₹100/day) across company delay calculators.
          </p>

          {/* Scheme Active Toggle */}
          <div className="flex justify-between items-center bg-slate-950 border border-white/5 rounded-lg p-4">
            <div>
              <span className="text-xs font-bold text-white block">Amnesty Active status</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Toggle live waivers across calculators</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAmnestyActive === 'true'}
                onChange={(e) => {
                  const val = e.target.checked ? 'true' : 'false'
                  setIsAmnestyActive(val)
                  updateSetting('active_amnesty_scheme', null, val)
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-900" />
            </label>
          </div>

          {/* Scheme Details */}
          <div className="space-y-4 pt-3 border-t border-white/5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Scheme Display Name
              </label>
              <input
                type="text"
                value={schemeName}
                onChange={(e) => setSchemeName(e.target.value)}
                placeholder="e.g. Fresh Start Scheme 2026"
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                Circular Reference Link URL
                {schemeUrl && (
                  <a href={schemeUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </label>
              <input
                type="url"
                value={schemeUrl}
                onChange={(e) => setSchemeUrl(e.target.value)}
                placeholder="https://www.mca.gov.in/bin/dms/getdocument..."
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={async () => {
                await updateSetting('amnesty_scheme_name', null, schemeName)
                await updateSetting('amnesty_scheme_url', null, schemeUrl)
              }}
              disabled={savingKey === 'amnesty_scheme_name'}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs uppercase tracking-wider rounded-lg disabled:opacity-50 transition-colors shadow-md shadow-amber-500/10"
            >
              <Save className="w-4 h-4" />
              Save Scheme parameters
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
