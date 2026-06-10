'use client'

import { useState } from 'react'
import FeeResultModal from './FeeResultModal'

type SubTab = 'general' | 'annual' | 'capital' | 'charges'

export default function CompanyFeeCalc() {
  const [subTab, setSubTab] = useState<SubTab>('general')

  // Shared state for modal
  const [modalOpen, setModalOpen] = useState(false)
  const [result, setResult] = useState({
    totalFee: 0,
    normalFee: 0,
    additionalFee: 0,
    stampDuty: 0,
    adValoremFee: 0,
    showWarning: false,
    warningText: ''
  })

  // General Forms State
  const [genForm, setGenForm] = useState('ADT-1')
  const [genType, setGenType] = useState('pvt')
  const [genCapital, setGenCapital] = useState('100000')
  const [genDelay, setGenDelay] = useState('0')
  const [genRepeat, setGenRepeat] = useState(false)

  // Annual Forms State
  const [annForm, setAnnForm] = useState('AOC-4')
  const [annType, setAnnType] = useState('pvt')
  const [annCapital, setAnnCapital] = useState('100000')
  const [annDelay, setAnnDelay] = useState('0')

  // Capital State
  const [capType, setCapType] = useState('pvt')
  const [capExisting, setCapExisting] = useState('1000000')
  const [capNew, setCapNew] = useState('5000000')
  const [capState, setCapState] = useState('delhi')
  const [capDelay, setCapDelay] = useState('0')
  const [capError, setCapError] = useState(false)

  // Charges State
  const [chgForm, setChgForm] = useState('CHG-1')
  const [chgType, setChgType] = useState('pvt')
  const [chgCapital, setChgCapital] = useState('1000000')
  const [chgAmount, setChgAmount] = useState('1000000')
  const [chgDelay, setChgDelay] = useState('0')

  // Helpers
  const getBaseFee = (capital: number, isOpcSmall: boolean) => {
    if (capital < 0) return 0
    if (isOpcSmall) {
      if (capital <= 100000) return 50
      if (capital <= 500000) return 100
      if (capital <= 2500000) return 150
      return 200
    }
    if (capital <= 100000) return 200
    if (capital <= 500000) return 300
    if (capital <= 2500000) return 400
    if (capital <= 10000000) return 500
    return 600
  }

  const getLateFeeMultiplier = (days: number, isHigherFee: boolean, hasGracePeriod: boolean) => {
    if (days <= 0) return 0
    if (hasGracePeriod && days <= 15) return 0
    const m = isHigherFee ? {15:1, 30:3, 60:6, 90:9, 180:15, 999:18} : {15:1, 30:2, 60:4, 90:6, 180:10, 999:12}
    if (days <= 15) return m[15]
    if (days <= 30) return m[30]
    if (days <= 60) return m[60]
    if (days <= 90) return m[90]
    if (days <= 180) return m[180]
    return m[999]
  }

  const handleGenCalc = () => {
    const capital = parseInt(genCapital) || 0
    const delay = parseInt(genDelay) || 0
    const isOpcSmall = genType === 'opc' || genType === 'small'
    
    const fixedFees: Record<string, number> = { 
      'INC-1': 1000, 
      'DIR-3': 500, 
      'DIR-3-KYC': delay > 0 ? 5000 : 0, 
      'STK-2': 5000 
    }
    
    let baseFee = fixedFees[genForm] !== undefined ? fixedFees[genForm] : getBaseFee(capital, isOpcSmall)
    
    if (genForm === 'SPICe+') {
      if (genType === 'opc') {
        if (capital <= 1000000) baseFee = 2000
        else if (capital <= 5000000) baseFee = 2000 + Math.ceil((capital - 1000000) / 10000) * 200
        else baseFee = 2000 + Math.ceil(4000000 / 10000) * 200 + Math.ceil((capital - 5000000) / 10000) * 200
      } else baseFee = getBaseFee(capital, isOpcSmall)
    }

    let additionalFee = 0, showWarning = false, warningText = ''
    if (delay > 0 && genForm !== 'DIR-3-KYC') {
      const hasGrace = (genForm === 'ADT-1')
      const multiplier = getLateFeeMultiplier(delay, genRepeat && (genForm === 'INC-22' || genForm === 'PAS-3'), hasGrace)
      additionalFee = baseFee * multiplier
      if (multiplier > 0) {
        showWarning = true
        warningText = `Late filing of ${delay} days attracts <strong>${multiplier}x</strong> additional fee.`
      } else if (hasGrace && delay <= 15) {
        showWarning = true
        warningText = `ADT-1 filed within 15-day grace period — no late fee applicable.`
      }
    }

    setResult({ totalFee: baseFee + additionalFee, normalFee: baseFee, additionalFee, stampDuty: 0, adValoremFee: 0, showWarning, warningText })
    setModalOpen(true)
  }

  const handleAnnCalc = () => {
    const capital = parseInt(annCapital) || 0
    const delay = parseInt(annDelay) || 0
    const isOpcSmall = annType === 'opc' || annType === 'small'
    
    const baseFee = getBaseFee(capital, isOpcSmall)
    let additionalFee = 0, showWarning = false, warningText = ''
    
    if (delay > 0) {
      additionalFee = delay * 100
      showWarning = true
      warningText = `Annual return late filing — <strong>₹100 per day</strong>. ${delay} days × ₹100 = ₹ ${additionalFee.toLocaleString('en-IN')}.`
    }
    
    setResult({ totalFee: baseFee + additionalFee, normalFee: baseFee, additionalFee, stampDuty: 0, adValoremFee: 0, showWarning, warningText })
    setModalOpen(true)
  }

  const handleCapCalc = () => {
    const existing = parseInt(capExisting) || 0
    const newCap = parseInt(capNew) || 0
    const delay = parseInt(capDelay) || 0
    
    if (newCap <= existing) {
      setCapError(true)
      return
    }
    setCapError(false)
    
    const isOpcSmall = capType === 'opc' || capType === 'small'
    const increaseAmount = newCap - existing
    let baseFee = 0
    
    if (isOpcSmall) {
      if (newCap <= 1000000) baseFee = 2000
      else if (newCap <= 5000000) baseFee = 2000 + Math.ceil((newCap - 1000000) / 10000) * 200
      else baseFee = 2000 + Math.ceil(4000000 / 10000) * 200 + Math.ceil((newCap - 5000000) / 10000) * 200
    } else {
      if (increaseAmount <= 100000) baseFee = 5000
      else if (increaseAmount <= 500000) baseFee = 5000 + Math.ceil((increaseAmount - 100000) / 10000) * 400
      else if (increaseAmount <= 5000000) baseFee = 5000 + 1600 + Math.ceil((increaseAmount - 500000) / 10000) * 300
      else if (increaseAmount <= 10000000) baseFee = 5000 + 1600 + 13500 + Math.ceil((increaseAmount - 5000000) / 10000) * 100
      else baseFee = 5000 + 1600 + 13500 + 5000 + Math.ceil((increaseAmount - 10000000) / 10000) * 75
    }
    
    const stampDutyRates: Record<string, number> = { delhi:0.0015, maharashtra:0.002, karnataka:0.001, tamilnadu:0.001, gujarat:0.001, rajasthan:0.001, westbengal:0.001, telangana:0.0015, andhra:0.0015, kerala:0.001, other:0.001 }
    const stampDutyCaps: Record<string, number> = { maharashtra: 5000000 }
    
    let stampDuty = Math.ceil(increaseAmount * (stampDutyRates[capState] || 0.001))
    if (stampDutyCaps[capState] && stampDuty > stampDutyCaps[capState]) stampDuty = stampDutyCaps[capState]
    
    let additionalFee = 0, showWarning = false, warningText = ''
    if (delay > 0) {
      const multiplier = getLateFeeMultiplier(delay, false, false)
      additionalFee = baseFee * multiplier
      showWarning = true
      warningText = `Late filing of ${delay} days attracts <strong>${multiplier}x</strong> additional fee. Stamp duty shown is indicative.`
    } else {
      showWarning = true
      warningText = 'Stamp duty shown is indicative. The MCA portal calculates exact duty at time of filing.'
    }
    
    setResult({ totalFee: baseFee + additionalFee + stampDuty, normalFee: baseFee, additionalFee, stampDuty, adValoremFee: 0, showWarning, warningText })
    setModalOpen(true)
  }

  const handleChgCalc = () => {
    const capital = parseInt(chgCapital) || 0
    const amount = parseInt(chgAmount) || 0
    const delay = parseInt(chgDelay) || 0
    const isSmall = chgType === 'small'
    
    const baseFee = getBaseFee(capital, isSmall)
    const hasAdValorem = (chgForm === 'CHG-1' || chgForm === 'CHG-9')
    let additionalFee = 0, adValoremFee = 0, showWarning = false, warningText = ''
    
    if (delay > 0) {
      const multiplier = isSmall ? 3 : 6
      additionalFee = baseFee * multiplier
      if (delay > 30 && hasAdValorem) {
        const adValoremRate = isSmall ? 0.00025 : 0.0005
        const adValoremCap = isSmall ? 100000 : 500000
        adValoremFee = Math.min(Math.ceil(amount * adValoremRate), adValoremCap)
      }
      showWarning = true
      if (delay > 300) {
        warningText = `<strong>Delay exceeds 300 days.</strong> Requires Central Govt condonation. Calculated: ${multiplier}x late fee.`
      } else {
        warningText = `Charge filing delay — <strong>${multiplier}x</strong> additional fee.`
      }
    }
    
    setResult({ totalFee: baseFee + additionalFee + adValoremFee, normalFee: baseFee, additionalFee, stampDuty: 0, adValoremFee, showWarning, warningText })
    setModalOpen(true)
  }

  return (
    <div>
      {/* Sub Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 mb-6 pb-px hide-scrollbar">
        {[
          { id: 'general', label: 'General Filing' },
          { id: 'annual', label: 'Annual Returns' },
          { id: 'capital', label: 'Share Capital' },
          { id: 'charges', label: 'Charges' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as SubTab)}
            className={`whitespace-nowrap py-3 px-5 border-b-2 font-medium text-sm transition-colors ${
              subTab === t.id
                ? 'border-navy dark:border-white text-navy dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* General Filing Tab */}
        {subTab === 'general' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Form type</label>
                <select className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={genForm} onChange={(e) => setGenForm(e.target.value)}>
                  <option value="ADT-1">ADT-1 — Auditor Appointment</option>
                  <option value="DIR-12">DIR-12 — Director Changes</option>
                  <option value="INC-22">INC-22 — Registered Office Change</option>
                  <option value="PAS-3">PAS-3 — Return of Allotment</option>
                  <option value="INC-20A">INC-20A — Commencement of Business</option>
                  <option value="DIR-3-KYC">DIR-3 KYC — Director KYC</option>
                  <option value="DPT-3">DPT-3 — Return of Deposits</option>
                  <option value="MSME-1">MSME-1 — Half-yearly Return</option>
                  <option value="STK-2">STK-2 — Strike Off</option>
                  <option value="SPICe+">SPICe+ Part B — Incorporation</option>
                  <option value="Other">Other Forms (MGT-14, SH-8, etc.)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company type</label>
                <select className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={genType} onChange={(e) => setGenType(e.target.value)}>
                  <option value="pvt">Private Limited Company</option>
                  <option value="public">Public Limited Company</option>
                  <option value="opc">One Person Company (OPC)</option>
                  <option value="small">Small Company</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Authorized capital (₹)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={genCapital} onChange={(e) => setGenCapital(e.target.value)} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delay in filing (days)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={genDelay} onChange={(e) => setGenDelay(e.target.value)} />
                <p className="text-xs text-slate-500 mt-1">Days past due date — 0 if on-time</p>
              </div>

              {(genForm === 'INC-22' || genForm === 'PAS-3') && (
                <div className="md:col-span-2 flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <input type="checkbox" id="genRepeat" checked={genRepeat} onChange={(e) => setGenRepeat(e.target.checked)} className="w-4 h-4 rounded text-navy focus:ring-navy accent-navy" />
                  <label htmlFor="genRepeat" className="text-sm text-amber-800 dark:text-amber-400 font-medium cursor-pointer">Apply higher fee — repeat delay in INC-22 / PAS-3</label>
                </div>
              )}
            </div>
            
            <button onClick={handleGenCalc} className="w-full mt-4 py-3.5 px-6 bg-navy hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group">
              Calculate Fee
              <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        )}

        {/* Annual Returns Tab */}
        {subTab === 'annual' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Form type</label>
                <select className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={annForm} onChange={(e) => setAnnForm(e.target.value)}>
                  <option value="AOC-4">AOC-4 — Financial Statements</option>
                  <option value="AOC-4-CFS">AOC-4 CFS — Consolidated Financials</option>
                  <option value="AOC-4-XBRL">AOC-4 XBRL — XBRL Format</option>
                  <option value="MGT-7">MGT-7 — Annual Return</option>
                  <option value="MGT-7A">MGT-7A — Annual Return (OPC/Small)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company type</label>
                <select className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={annType} onChange={(e) => setAnnType(e.target.value)}>
                  <option value="pvt">Private Limited Company</option>
                  <option value="public">Public Limited Company</option>
                  <option value="opc">One Person Company (OPC)</option>
                  <option value="small">Small Company</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Authorized capital (₹)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={annCapital} onChange={(e) => setAnnCapital(e.target.value)} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delay in filing (days)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={annDelay} onChange={(e) => setAnnDelay(e.target.value)} />
                <p className="text-xs text-slate-500 mt-1">₹ 100 per day penalty</p>
              </div>
            </div>
            
            <button onClick={handleAnnCalc} className="w-full mt-4 py-3.5 px-6 bg-navy hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group">
              Calculate Fee
              <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        )}

        {/* Share Capital Tab */}
        {subTab === 'capital' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company type</label>
                <select className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={capType} onChange={(e) => setCapType(e.target.value)}>
                  <option value="pvt">Private Limited Company</option>
                  <option value="public">Public Limited Company</option>
                  <option value="opc">One Person Company (OPC)</option>
                  <option value="small">Small Company</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Existing capital (₹)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={capExisting} onChange={(e) => setCapExisting(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New capital (₹)</label>
                <input type="number" className={`w-full p-3 rounded-xl border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy outline-none transition-all ${capError ? 'border-red-500 focus:border-red-500 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-navy'}`} value={capNew} onChange={(e) => { setCapNew(e.target.value); setCapError(false); }} />
                {capError && <p className="text-xs text-red-500 mt-1 font-medium">New capital must be greater than existing</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">State</label>
                <select className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={capState} onChange={(e) => setCapState(e.target.value)}>
                  <option value="delhi">Delhi</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="tamilnadu">Tamil Nadu</option>
                  <option value="gujarat">Gujarat</option>
                  <option value="rajasthan">Rajasthan</option>
                  <option value="westbengal">West Bengal</option>
                  <option value="telangana">Telangana</option>
                  <option value="andhra">Andhra Pradesh</option>
                  <option value="kerala">Kerala</option>
                  <option value="other">Other States</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delay in filing (days)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={capDelay} onChange={(e) => setCapDelay(e.target.value)} />
              </div>
            </div>
            
            <button onClick={handleCapCalc} className="w-full mt-4 py-3.5 px-6 bg-navy hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group">
              Calculate Fee
              <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        )}

        {/* Charges Tab */}
        {subTab === 'charges' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Form type</label>
                <select className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={chgForm} onChange={(e) => setChgForm(e.target.value)}>
                  <option value="CHG-1">CHG-1 — Creation / Modification of Charge</option>
                  <option value="CHG-4">CHG-4 — Satisfaction of Charge</option>
                  <option value="CHG-6">CHG-6 — Receiver / Manager Appointment</option>
                  <option value="CHG-9">CHG-9 — Debenture Charge Registration</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Company type</label>
                <select className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={chgType} onChange={(e) => setChgType(e.target.value)}>
                  <option value="pvt">Private / Public Limited</option>
                  <option value="small">OPC / Small Company</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Authorized capital (₹)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={chgCapital} onChange={(e) => setChgCapital(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount secured (₹)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={chgAmount} onChange={(e) => setChgAmount(e.target.value)} />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delay in filing (days)</label>
                <input type="number" className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-navy focus:border-navy outline-none transition-all" value={chgDelay} onChange={(e) => setChgDelay(e.target.value)} />
              </div>
            </div>
            
            <button onClick={handleChgCalc} className="w-full mt-4 py-3.5 px-6 bg-navy hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-navy font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group">
              Calculate Fee
              <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        )}
      </div>

      <FeeResultModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        {...result} 
      />
    </div>
  )
}
