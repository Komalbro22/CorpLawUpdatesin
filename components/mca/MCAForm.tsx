// src/components/mca/MCAForm.tsx
'use client'

import { Landmark, Scale, HelpCircle } from 'lucide-react'
import type { FormType } from '@/lib/mca-fees'

interface MCAFormProps {
  entityType: 'company' | 'llp'
  setEntityType: (type: 'company' | 'llp') => void
  isSmallOrOPC: boolean
  setIsSmallOrOPC: (val: boolean) => void
  formType: FormType
  setFormType: (form: FormType) => void
  nominalCapital: number
  setNominalCapital: (val: number) => void
  financialYear: number
  setFinancialYear: (year: number) => void
  actualFilingDate: string
  setActualFilingDate: (date: string) => void
}

export function MCAForm({
  entityType,
  setEntityType,
  isSmallOrOPC,
  setIsSmallOrOPC,
  formType,
  setFormType,
  nominalCapital,
  setNominalCapital,
  financialYear,
  setFinancialYear,
  actualFilingDate,
  setActualFilingDate
}: MCAFormProps) {
  return (
    <div className="bg-brand-slate-blue border border-white/10 rounded-card p-6 shadow-md space-y-6 text-white">
      
      {/* 1. Entity Selection Buttons */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 block">
          1. Select Entity Type
        </label>
        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => {
              setEntityType('company')
              setFormType('AOC-4')
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-badge border transition-all ${
              entityType === 'company'
                ? 'border-brand-gold bg-brand-gold text-brand-navy shadow-lg shadow-brand-gold/10'
                : 'border-white/10 bg-brand-navy/40 text-brand-muted hover:bg-brand-navy/60 hover:text-white'
            }`}
          >
            <Landmark className="h-4 w-4" />
            Limited Company
          </button>
          <button
            type="button"
            onClick={() => {
              setEntityType('llp')
              setFormType('LLP-11')
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-badge border transition-all ${
              entityType === 'llp'
                ? 'border-brand-gold bg-brand-gold text-brand-navy shadow-lg shadow-brand-gold/10'
                : 'border-white/10 bg-brand-navy/40 text-brand-muted hover:bg-brand-navy/60 hover:text-white'
            }`}
          >
            <Scale className="h-4 w-4" />
            Limited Liability LLP
          </button>
        </div>
      </div>

      {/* 2. Small Company / OPC Discount Checkbox (Company Only) */}
      {entityType === 'company' && (
        <div className="p-4 bg-brand-navy/40 border border-white/5 rounded-badge flex items-center justify-between">
          <div className="pr-4">
            <span className="text-xs font-bold text-white block">
              Small Company / OPC Status?
            </span>
            <span className="text-[10px] text-brand-muted leading-tight block mt-0.5">
              Apply statutory 50% discount on standard base filing fees.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSmallOrOPC}
              onChange={(e) => setIsSmallOrOPC(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-brand-navy rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-muted after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold peer-checked:after:bg-brand-navy" />
          </label>
        </div>
      )}

      {/* 3. Form Selection & Nominal Capital Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block">
            2. Form Code / Type
          </label>
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value as FormType)}
            className="w-full bg-brand-navy border border-white/10 focus:border-brand-gold focus:ring-brand-gold rounded-badge text-xs font-semibold p-3 text-white focus:outline-none"
          >
            {entityType === 'company' ? (
              <>
                <option value="AOC-4">AOC-4 (Financial Statements)</option>
                <option value="MGT-7">MGT-7 (Annual Return)</option>
                <option value="DIR-3-KYC">DIR-3 KYC (Director KYC Verify)</option>
                <option value="DPT-3">DPT-3 (Return of Deposits)</option>
              </>
            ) : (
              <>
                <option value="LLP-11">Form 11 (LLP Annual Return)</option>
                <option value="LLP-8">Form 8 (Statement of Accounts)</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block flex items-center gap-1.5">
            3. Nominal Capital / Contribution
            <span className="group relative cursor-pointer text-brand-muted hover:text-white">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-brand-navy text-[10px] text-brand-muted rounded border border-white/10 hidden group-hover:block z-30 font-normal leading-normal">
                Authorized capital for Companies, or partner contribution amount for LLPs.
              </span>
            </span>
          </label>
          <div className="relative rounded-badge shadow-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-muted text-xs font-bold">
              ₹
            </span>
            <input
              type="number"
              value={nominalCapital}
              min={0}
              onChange={(e) => setNominalCapital(Math.max(0, Number(e.target.value)))}
              className="w-full bg-brand-navy border border-white/10 focus:border-brand-gold focus:ring-brand-gold focus:outline-none rounded-badge pl-8 pr-3.5 py-3 text-xs font-bold text-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Dates Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block">
            4. Financial Year Ending
          </label>
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(Number(e.target.value))}
            className="w-full bg-brand-navy border border-white/10 focus:border-brand-gold focus:ring-brand-gold rounded-badge text-xs font-semibold p-3 text-white focus:outline-none"
          >
            <option value={2026}>FY 2025-26 (Latest Filing)</option>
            <option value={2025}>FY 2024-25 (Current Filing)</option>
            <option value={2024}>FY 2023-24 (Previous Filing)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block">
            5. Actual Filing Date
          </label>
          <input
            type="date"
            value={actualFilingDate}
            onChange={(e) => setActualFilingDate(e.target.value)}
            className="w-full bg-brand-navy border border-white/10 focus:border-brand-gold focus:ring-brand-gold rounded-badge text-xs font-bold p-3 text-white focus:outline-none"
          />
        </div>
      </div>

    </div>
  )
}
