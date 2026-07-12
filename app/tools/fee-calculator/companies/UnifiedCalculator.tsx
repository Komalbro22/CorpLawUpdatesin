'use client'

import React, { useState, useMemo } from 'react'
import { mcaForms } from '@/data/mca-forms'
import { calculateMCAFee, CalculatorParams } from '@/lib/calculatorUtils'

const extraForms = [
  { slug: 'inc-22', formNumber: 'INC-22', formName: 'Notice of change of registered office', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'inc-24', formNumber: 'INC-24', formName: 'Application for change of name', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'inc-28', formNumber: 'INC-28', formName: 'Notice of order of Court/Tribunal', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'pas-4', formNumber: 'PAS-4', formName: 'Private Placement Offer Letter', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'sh-7', formNumber: 'SH-7', formName: 'Notice of alteration of share capital', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'chg-1', formNumber: 'CHG-1', formName: 'Creation of charge', penaltyType: 'multiplier', penaltyRate: '3x or 6x + Ad Valorem', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'chg-4', formNumber: 'CHG-4', formName: 'Particulars for satisfaction of charge', penaltyType: 'multiplier', penaltyRate: '3x or 6x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'chg-9', formNumber: 'CHG-9', formName: 'Creation of charge (Debentures)', penaltyType: 'multiplier', penaltyRate: '3x or 6x + Ad Valorem', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'dir-3', formNumber: 'DIR-3', formName: 'Application for allotment of DIN', penaltyType: 'nil', penaltyRate: 'N/A', normalFeeStructure: 'flat', concessionApplies: false },
  { slug: 'dir-3-kyc', formNumber: 'DIR-3-KYC', formName: 'Director KYC', penaltyType: 'flat', penaltyRate: '₹5000', normalFeeStructure: 'flat', concessionApplies: false },
  { slug: 'stk-2', formNumber: 'STK-2', formName: 'Strike off company', penaltyType: 'flat', penaltyRate: '₹5000', normalFeeStructure: 'flat', concessionApplies: false },
  { slug: 'mgt-14', formNumber: 'MGT-14', formName: 'Filing of Resolutions and agreements', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'dpt-3', formNumber: 'DPT-3', formName: 'Return of Deposits', penaltyType: 'multiplier', penaltyRate: '1.2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'ben-2', formNumber: 'BEN-2', formName: 'Return of SBO Disclosures', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'pas-6', formNumber: 'PAS-6', formName: 'Reconciliation of share capital audit', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'adt-3', formNumber: 'ADT-3', formName: 'Notice of resignation by auditor', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'cra-2', formNumber: 'CRA-2', formName: 'Appointment of Cost Auditor Intimation', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'cra-4', formNumber: 'CRA-4', formName: 'Filing of Cost Audit Report', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'aoc-5', formNumber: 'AOC-5', formName: 'Notice of address for keeping books of account', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'mgt-15', formNumber: 'MGT-15', formName: 'AGM Report of listed company', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false },
  { slug: 'mbp-1', formNumber: 'MBP-1', formName: 'Disclosure of interest by directors', penaltyType: 'nil', penaltyRate: 'N/A (Physical)', normalFeeStructure: 'nil', concessionApplies: false },
  { slug: 'other-general', formNumber: 'Other General Form', formName: 'Any standard event-based MCA form', penaltyType: 'multiplier', penaltyRate: '2x to 12x normal fee', normalFeeStructure: 'capital_slab', concessionApplies: false }
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
  const [showModal, setShowModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.has('form')) setSelectedSlug(params.get('form')!)
      if (params.has('type')) setCompanyType(params.get('type')!)
      if (params.has('cap')) setCapital(Number(params.get('cap')))
      if (params.has('dly')) setDelay(Number(params.get('dly')))
      if (params.has('ncap')) setNewCapital(Number(params.get('ncap')))
      if (params.has('st')) setState(params.get('st')!)
      if (params.has('rep')) setIsRepeatOffender(params.get('rep') === '1')
      if (params.has('chg')) setChargeAmount(Number(params.get('chg')))
    }
  }, [])

  // WebMCP — Imperative API
  // Official docs: https://developer.chrome.com/docs/ai/webmcp/imperative-api
  React.useEffect(() => {
    if (!('modelContext' in document) || !document.modelContext) return;

    document.modelContext.registerTool({
      name: 'calculateMCALateFee',
      description: 'Calculates MCA (Ministry of Corporate Affairs) late filing fee for Indian companies. Use this when a user asks about late fees, ROC filing penalties, or delay charges for MCA forms like MGT-7, AOC-4, DPT-3, DIR-3KYC, ADT-1, MGT-14, SH-7, PAS-3, CHG-1, or MSME-1.',
      inputSchema: {
        type: 'object',
        properties: {
          formSlug: {
            type: 'string',
            description: 'The MCA form slug. Examples: mgt-7, aoc-4, dpt-3, dir-3kyc, adt-1, mgt-14, sh-7, pas-3, chg-1, msme-1'
          },
          companyType: {
            type: 'string',
            enum: ['small', 'other', 'opc', 'llp'],
            description: 'Type of company. Use: small (small company), opc (One Person Company), llp (LLP), other (all other companies)'
          },
          capital: {
            type: 'number',
            description: 'Paid-up share capital of the company in Indian Rupees'
          },
          delayDays: {
            type: 'number',
            description: 'Number of days delayed beyond the due date',
            minimum: 1
          },
          isRepeatOffender: {
            type: 'string',
            enum: ['no', 'yes'],
            description: 'Whether the company is a repeat offender (default: no)'
          }
        },
        required: ['formSlug', 'delayDays']
      },
      execute: async (params) => {
        try {
          const calcParams: CalculatorParams = {
            formSlug: String(params.formSlug || ''),
            companyType: String(params.companyType || 'other') as CalculatorParams['companyType'],
            capital: Number(params.capital || 0),
            delayDays: Number(params.delayDays || 0),
            isRepeatOffender: params.isRepeatOffender === 'yes',
            newCapital: Number(params.newCapital || 0),
            state: String(params.state || ''),
            chargeAmount: Number(params.chargeAmount || 0),
          };
          const result = calculateMCAFee(calcParams);
          if (!result) {
            return 'Could not calculate fee. Please check the form type and parameters.';
          }
          return `MCA Late Fee Calculation for ${params.formSlug}:\n` +
            `Delay: ${params.delayDays} days\n` +
            `Normal Fee: ₹${result.baseFee?.toLocaleString('en-IN') ?? 'N/A'}\n` +
            `Late Fee: ₹${result.lateFee?.toLocaleString('en-IN') ?? 'N/A'}\n` +
            `Total Payable: ₹${result.total?.toLocaleString('en-IN') ?? 'N/A'}\n` +
            (result.warningText ? `Note: ${result.warningText}` : '');
        } catch (e) {
          return 'Error calculating fee. Please verify the form type is correct.';
        }
      }
    });

    return () => {
      if (!('modelContext' in document) || !document.modelContext) return;
      document.modelContext.unregisterTool?.('calculateMCALateFee');
    };
  }, []);

  const copyShareLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('form', selectedSlug)
    url.searchParams.set('type', companyType)
    url.searchParams.set('cap', capital.toString())
    url.searchParams.set('dly', delay.toString())
    if (selectedSlug === 'sh-7') url.searchParams.set('ncap', newCapital.toString())
    if (['sh-7', 'spice-plus', 'inc-32'].includes(selectedSlug)) url.searchParams.set('st', state)
    if (['inc-22', 'pas-3'].includes(selectedSlug)) url.searchParams.set('rep', isRepeatOffender ? '1' : '0')
    if (['chg-1', 'chg-4', 'chg-6', 'chg-9'].includes(selectedSlug)) url.searchParams.set('chg', chargeAmount.toString())
    
    navigator.clipboard.writeText(url.toString())
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

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

  const commonForms = useMemo(() => {
    const commonSlugs = ['aoc-4', 'mgt-7', 'adt-1', 'inc-22', 'dir-12', 'dir-3-kyc', 'chg-1', 'inc-20a', 'mgt-14']
    return commonSlugs.map(slug => {
      const form = allForms.find(f => f.slug === slug)
      if (!form) return null
      return {
        form,
        result: calculateMCAFee({
          formSlug: slug,
          companyType,
          capital,
          delayDays: delay,
          isRepeatOffender,
          newCapital,
          state,
          chargeAmount
        })
      }
    }).filter(Boolean)
  }, [allForms, companyType, capital, delay, isRepeatOffender, newCapital, state, chargeAmount])

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
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

      {/* WebMCP Declarative Form Annotations (Draft Spec: https://webmachinelearning.github.io/webmcp/) */}
      <form 
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-10"
        toolname="calculate_roc_fee"
        tooldescription="Calculate Ministry of Corporate Affairs (MCA) statutory filing fees and ROC late filing penalties based on form type and delay days."
      >
        {/* Basic Inputs */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700 mb-2">Form Type</label>
          <select
            name="form_slug"
            value={selectedSlug}
            onChange={e => setSelectedSlug(e.target.value)}
            className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm"
            toolparamdescription="The MCA form slug. Examples: mgt-7, aoc-4, dpt-3, dir-3kyc, adt-1, mgt-14, sh-7, pas-3, chg-1, msme-1"
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
            name="company_type"
            value={companyType}
            onChange={e => setCompanyType(e.target.value)}
            disabled={isSpice || isDir3Kyc || isDir3 || isStk2}
            className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
            toolparamdescription="Type of company: private, public, opc (One Person Company), or small (Small Company)."
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
              name="capital"
              min="0"
              value={capital}
              onChange={e => setCapital(Number(e.target.value))}
              disabled={isDir3Kyc || isDir3 || isStk2}
              className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
              toolparamdescription="Paid-up share capital of the company in Indian Rupees."
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700 mb-2">Delay in filing (days)</label>
          <input
            type="number"
            name="delay_days"
            min="0"
            value={delay}
            onChange={e => setDelay(Number(e.target.value))}
            disabled={isSpice || isDir3 || isStk2}
            className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
            toolparamdescription="The number of days the filing is delayed beyond the due date. Enter 0 if filing on time."
          />
        </div>

        {/* Conditional Inputs */}
        {(isSH7 || isSpice) && (
          <>
            {isSH7 && (
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
            )}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-slate-700 mb-2">Registered State</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full border border-slate-300 bg-white text-slate-900 rounded-[4px] px-3 py-2.5 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all shadow-sm"
              >
                <option value="andhrapradesh">Andhra Pradesh</option>
                <option value="bihar">Bihar</option>
                <option value="delhi">Delhi</option>
                <option value="gujarat">Gujarat</option>
                <option value="karnataka">Karnataka</option>
                <option value="madhyapradesh">Madhya Pradesh</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="punjab">Punjab</option>
                <option value="rajasthan">Rajasthan</option>
                <option value="tamilnadu">Tamil Nadu</option>
                <option value="telangana">Telangana</option>
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
                name="is_repeat_offender"
                checked={isRepeatOffender}
                onChange={e => setIsRepeatOffender(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
                toolparamdescription="Whether the company is a repeat offender."
              />
              <span className="text-sm font-medium text-slate-700">Apply higher fee (Repeat delay)</span>
            </label>
          </div>
        )}
      </form>

      {/* Calculate Button (replaces live result section) */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => {
            setShowModal(true)
            // Log tool usage asynchronously
            fetch('/api/calculators/log', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'mca_late_fee',
                input: { formSlug: selectedForm.slug, companyType, capital, delay, isRepeatOffender, newCapital, state, chargeAmount },
                result: { baseFee: result.baseFee, lateFee: result.lateFee, stampDuty: result.stampDuty, adValoremFee: result.adValoremFee, total: result.total }
              })
            }).catch(console.error)
          }}
          className="flex-1 bg-[#0a0a0a] hover:bg-black text-white font-bold py-4 px-6 rounded-[8px] transition-all flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-xl"
        >
          Calculate Fee <span aria-hidden="true">→</span>
        </button>
        <button
          onClick={copyShareLink}
          className="sm:w-auto px-6 py-4 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-[8px] transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          {copiedLink ? 'Link Copied!' : 'Copy Share Link'}
        </button>
      </div>

      {/* Quick Compare 9 Common Forms */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Compare: 9 Common Forms</h3>
        <p className="text-sm text-slate-500 mb-6">See how your current inputs (Company Type, Capital, Delay) affect the 9 most frequently filed MCA forms simultaneously.</p>
        <div className="overflow-x-auto rounded-[8px] border border-slate-200 shadow-sm">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Form</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Normal Fee</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Late Penalty</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Other (Stamp Duty / Ad Valorem)</th>
                <th className="px-4 py-3 font-bold text-slate-900 text-right">Total Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commonForms.map((item: any) => (
                <tr key={item.form.slug} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-blue-700">{item.form.formNumber}</td>
                  <td className="px-4 py-3 text-slate-600 font-tabular-nums">₹{item.result.baseFee.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-tabular-nums ${item.result.lateFee > 0 ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                    ₹{item.result.lateFee.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-tabular-nums">
                    {(item.result.stampDuty > 0 || item.result.adValoremFee > 0) 
                      ? `₹${(item.result.stampDuty + item.result.adValoremFee).toLocaleString()}` 
                      : '-'}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 text-right font-tabular-nums">₹{item.result.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl flex flex-col md:flex-row w-full max-w-3xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            {/* Mobile Close Button */}
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-1 md:hidden bg-white rounded-full shadow-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Left side - Breakdown */}
            <div className="flex-1 p-8 md:p-10">
              <h3 className="text-xs font-bold text-slate-500 tracking-wider mb-6">FEE BREAKDOWN</h3>
              
              <p className="text-sm text-slate-500 mb-1 font-medium">Total Payable</p>
              <div className="text-[2.75rem] font-bold text-slate-900 mb-10 font-tabular-nums flex items-baseline leading-none">
                <span className="text-[1.5rem] mr-1 text-slate-400 font-medium">₹</span>
                {result.total.toLocaleString()}
              </div>

              <div className="flex justify-between py-4 border-b border-slate-100 text-sm">
                <span className="text-slate-600 font-medium">Normal filing fee</span>
                <span className="font-bold text-slate-900 font-tabular-nums">₹ {result.baseFee.toLocaleString()}</span>
              </div>
              
              {result.lateFee > 0 && (
                <div className="flex justify-between py-4 border-b border-slate-100 text-sm">
                  <span className="text-slate-600 font-medium">Additional fee (late filing)</span>
                  <span className="font-bold text-slate-900 font-tabular-nums">₹ {result.lateFee.toLocaleString()}</span>
                </div>
              )}

              {(result.stampDuty > 0 || result.adValoremFee > 0) && (
                <div className="flex justify-between py-4 border-b border-slate-100 text-sm">
                  <span className="text-slate-600 font-medium">{result.stampDuty > 0 ? 'Estimated Stamp Duty' : 'Ad Valorem Fee'}</span>
                  <span className="font-bold text-slate-900 font-tabular-nums">₹ {(result.stampDuty || result.adValoremFee).toLocaleString()}</span>
                </div>
              )}

              {result.warningText && (
                <div className="mt-8 bg-[#FFFBF0] border border-[#FDE68A] rounded-[8px] p-4 flex gap-3 text-sm text-[#92400E]">
                  <span className="text-amber-500">⚠️</span>
                  <span dangerouslySetInnerHTML={{__html: result.warningText}} className="font-medium leading-relaxed"></span>
                </div>
              )}
            </div>

            {/* Right side - Black Callout Box */}
            <div className="w-full md:w-[320px] bg-[#0a0a0a] p-8 md:p-10 text-white flex flex-col justify-center relative">
              {/* Desktop Close Button */}
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-1 rounded-full hidden md:block transition-colors">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <h4 className="text-[1.35rem] font-bold mb-5 leading-snug">
                Your filing is now ₹{result.total.toLocaleString()}
                {result.lateFee > 0 && selectedForm.penaltyType === 'per_day' ? ', and growing by ₹100 every day.' : '.'}
              </h4>
              
              <p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed font-medium">
                Need this for your records or clients? Generate a professional PDF estimate containing the full breakdown, penalty rules, and official disclaimers.
              </p>
              
              <button 
                onClick={handleDownloadPDF} 
                className="w-full bg-white text-black font-bold py-3.5 px-4 rounded-[6px] hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                 Download Detailed PDF <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
