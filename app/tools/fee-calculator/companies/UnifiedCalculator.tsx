'use client'

import React, { useState, useMemo } from 'react'
import { mcaForms } from '@/data/mca-forms'
import { calculateMCAFee, CalculatorParams } from '@/lib/calculatorUtils'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const extraForms = [
  { slug: 'inc-22', formNumber: 'INC-22', formName: 'Notice of change of registered office', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: true },
  { slug: 'inc-24', formNumber: 'INC-24', formName: 'Application for change of name', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: true },
  { slug: 'inc-28', formNumber: 'INC-28', formName: 'Notice of order of Court/Tribunal', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: true },
  { slug: 'pas-4', formNumber: 'PAS-4', formName: 'Private Placement Offer Letter', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: true },
  { slug: 'sh-7', formNumber: 'SH-7', formName: 'Notice of alteration of share capital', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: true },
  { slug: 'chg-1', formNumber: 'CHG-1', formName: 'Creation of charge', penaltyType: 'multiplier', penaltyRate: '3x or 6x + Ad Valorem', normalFeeStructure: 'capital_slab', concessionApplies: true },
  { slug: 'chg-4', formNumber: 'CHG-4', formName: 'Particulars for satisfaction of charge', penaltyType: 'multiplier', penaltyRate: '3x or 6x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: true },
  { slug: 'chg-9', formNumber: 'CHG-9', formName: 'Creation of charge (Debentures)', penaltyType: 'multiplier', penaltyRate: '3x or 6x + Ad Valorem', normalFeeStructure: 'capital_slab', concessionApplies: true },
  { slug: 'dir-3', formNumber: 'DIR-3', formName: 'Application for allotment of DIN', penaltyType: 'nil', penaltyRate: 'N/A', normalFeeStructure: 'flat', concessionApplies: false },
  { slug: 'dir-3-kyc', formNumber: 'DIR-3-KYC', formName: 'Director KYC', penaltyType: 'flat', penaltyRate: '₹5000', normalFeeStructure: 'flat', concessionApplies: false },
  { slug: 'stk-2', formNumber: 'STK-2', formName: 'Strike off company', penaltyType: 'flat', penaltyRate: '₹5000', normalFeeStructure: 'flat', concessionApplies: false },
  { slug: 'mgt-14', formNumber: 'MGT-14', formName: 'Filing of Resolutions and agreements', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: true },
  { slug: 'other-general', formNumber: 'Other General Form', formName: 'Any standard event-based MCA form', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: true }
]

export default function UnifiedCalculator() {
  const [selectedSlug, setSelectedSlug] = useState('aoc-4')
  const [companyType, setCompanyType] = useState('private')
  const [capital, setCapital] = useState<number>(100000)
  const [delay, setDelay] = useState<number>(0)
  
  // Specific states
  const [newCapital, setNewCapital] = useState<number>(500000)
  const [state, setState] = useState('maharashtra')
  const [isRepeatOffender, setIsRepeatOffender] = useState(false)
  const [chargeAmount, setChargeAmount] = useState<number>(1000000)

  const allForms = useMemo(() => {
    const combined = [...mcaForms, ...extraForms]
    return combined.filter((v,i,a)=>a.findIndex(v2=>(v2.slug===v.slug))===i).sort((a, b) => a.formNumber.localeCompare(b.formNumber))
  }, [])

  const selectedForm = useMemo(() => allForms.find(f => f.slug === selectedSlug) || allForms[0], [allForms, selectedSlug])
  
  const isSpice = selectedForm.slug === 'spice-plus' || selectedForm.slug === 'inc-32'
  const isSH7 = selectedForm.slug === 'sh-7'
  const isCharge = ['chg-1', 'chg-4', 'chg-6', 'chg-9'].includes(selectedForm.slug)
  const isInc22Pas3 = ['inc-22', 'pas-3'].includes(selectedForm.slug)
  const isDir3Kyc = selectedForm.slug === 'dir-3-kyc'
  const isStk2 = selectedForm.slug === 'stk-2'
  const isDir3 = selectedForm.slug === 'dir-3'

  // Live Calculation using shared logic
  const result = useMemo(() => {
    const params: CalculatorParams = {
      formSlug: selectedForm.slug,
      companyType,
      capital,
      delayDays: delay,
      isRepeatOffender,
      newCapital,
      state,
      chargeAmount
    }
    return calculateMCAFee(params)
  }, [selectedForm, companyType, capital, delay, isRepeatOffender, newCapital, state, chargeAmount])

  const generatePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    
    // Header
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(15, 23, 42) // Slate-900
    doc.text('CorpLawUpdates.in', 14, 22)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 116, 139) // Slate-500
    doc.text("India's Free Corporate Law Intelligence Platform", 14, 28)
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(37, 99, 235) // Blue-600
    doc.text('MCA Fee Calculation Estimate', 14, 40)
    
    // Metadata
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(15, 23, 42)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 40, { align: 'right' })
    doc.text(`Form: ${selectedForm.formNumber} - ${selectedForm.formName}`, 14, 50)
    doc.text(`Company Type: ${companyType.toUpperCase()}`, 14, 56)
    doc.text(`Authorized Capital: INR ${capital.toLocaleString()}`, 14, 62)
    doc.text(`Delay in Days: ${delay}`, 14, 68)

    // Details table
    const tableData: any[] = [
      ['Normal Filing Fee', `INR ${result.baseFee.toLocaleString()}`],
      ['Additional Fee (Late Penalty)', `INR ${result.lateFee.toLocaleString()}`],
    ]
    if (result.stampDuty > 0) tableData.push(['Estimated Stamp Duty', `INR ${result.stampDuty.toLocaleString()}`])
    if (result.adValoremFee > 0) tableData.push(['Ad Valorem Fee', `INR ${result.adValoremFee.toLocaleString()}`])
    
    tableData.push([{ content: 'Total Liability', styles: { fontStyle: 'bold' } }, { content: `INR ${result.total.toLocaleString()}`, styles: { fontStyle: 'bold' } }])

    autoTable(doc, {
      startY: 75,
      head: [['Fee Component', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { textColor: [15, 23, 42] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 50, halign: 'right' }
      }
    })

    // Disclaimer
    const finalY = (doc as any).lastAutoTable.finalY || 120
    doc.setFontSize(8)
    doc.setTextColor(220, 38, 38) // Red-600
    const disclaimer = "DISCLAIMER: This is an indicative estimate for planning purposes only. It does not constitute legal advice or an official fee challan. Actual fees are determined strictly at the time of filing on the MCA21 portal."
    doc.text(doc.splitTextToSize(disclaimer, pageWidth - 28), 14, finalY + 15)

    doc.save(`MCA_Fee_Estimate_${selectedForm.formNumber}.pdf`)
  }

  return (
    <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] border border-slate-200 p-8 w-full max-w-4xl mx-auto mb-16 relative overflow-hidden font-inter">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none" />
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          MCA Fee Calculator
        </h2>
        <p className="text-base text-slate-500">
          Professional institutional calculator for precise MCA filing fees and penalties.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-10">
        {/* Basic Inputs */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700 mb-2">Form Type</label>
          <select
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm"
          >
            {allForms.map(form => (
              <option key={form.slug} value={form.slug}>
                {form.formNumber} — {form.formName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700 mb-2">Company Type</label>
          <select
            value={companyType}
            onChange={e => setCompanyType(e.target.value)}
            disabled={isSpice || isDir3Kyc || isDir3 || isStk2}
            className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="private">Private Limited Company</option>
            <option value="public">Public Limited Company</option>
            <option value="opc">One Person Company (OPC)</option>
            <option value="small">Small Company</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700 mb-2">Authorized Capital (₹)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
            <input
              type="number"
              min="0"
              value={capital}
              onChange={e => setCapital(Number(e.target.value))}
              disabled={isDir3Kyc || isDir3 || isStk2}
              className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700 mb-2">Delay in filing (days)</label>
          <input
            type="number"
            min="0"
            value={delay}
            onChange={e => setDelay(Number(e.target.value))}
            disabled={isSpice || isDir3 || isStk2}
            className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        {/* Conditional Inputs */}
        {isSH7 && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">New Capital (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  value={newCapital}
                  onChange={e => setNewCapital(Number(e.target.value))}
                  className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Registered State</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm"
              >
                <option value="delhi">Delhi</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="karnataka">Karnataka</option>
                <option value="tamilnadu">Tamil Nadu</option>
                <option value="other">Other States</option>
              </select>
            </div>
          </>
        )}

        {isCharge && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-2">Amount Secured (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                min="0"
                value={chargeAmount}
                onChange={e => setChargeAmount(Number(e.target.value))}
                className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        )}

        {isInc22Pas3 && (
          <div className="flex flex-col justify-end">
            <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={isRepeatOffender}
                onChange={e => setIsRepeatOffender(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Apply higher fee (Repeat delay)</span>
            </label>
          </div>
        )}
      </div>

      {result.warningText && (
        <div className="bg-amber-50 border border-amber-200 rounded-[8px] p-4 mb-8 flex gap-3">
          <span className="text-amber-500 text-lg">⚠️</span>
          <p className="text-sm text-amber-800 leading-relaxed font-medium" dangerouslySetInnerHTML={{__html: result.warningText}} />
        </div>
      )}

      {/* Results Section */}
      <div className="border-l-4 border-blue-600 bg-blue-50/50 rounded-r-[8px] p-6 md:p-8 relative">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Calculation Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500 mb-1">Base Fee</span>
            <span className="text-2xl font-semibold text-slate-900 font-tabular-nums">₹{result.baseFee.toLocaleString()}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500 mb-1">Late Fee</span>
            <span className="text-2xl font-semibold text-red-600 font-tabular-nums">₹{result.lateFee.toLocaleString()}</span>
          </div>

          {(result.stampDuty > 0 || result.adValoremFee > 0) ? (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-500 mb-1">{result.stampDuty > 0 ? 'Stamp Duty' : 'Ad Valorem'}</span>
              <span className="text-2xl font-semibold text-slate-900 font-tabular-nums">₹{(result.stampDuty || result.adValoremFee).toLocaleString()}</span>
            </div>
          ) : (
            <div className="hidden md:block"></div>
          )}

          <div className="flex flex-col col-span-2 md:col-span-1 md:text-right">
            <span className="text-sm font-medium text-slate-500 mb-1">Total Liability</span>
            <span className="text-4xl font-bold text-slate-900 font-tabular-nums tracking-tight">₹{result.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={generatePDF}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-medium px-6 py-2.5 rounded-[4px] shadow-sm transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download Detailed PDF
        </button>
      </div>
    </div>
  )
}
