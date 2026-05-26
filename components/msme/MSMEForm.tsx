// src/components/msme/MSMEForm.tsx
'use client'

import { Info, HelpCircle } from 'lucide-react'

interface MSMEFormProps {
  principal: number
  setPrincipal: (val: number) => void
  creditDays: 15 | 45
  setCreditDays: (val: 15 | 45) => void
  invoiceDate: string
  setInvoiceDate: (val: string) => void
  paymentDate: string
  setPaymentDate: (val: string) => void
  bankRate: number
  setBankRate: (val: number) => void
}

export function MSMEForm({
  principal,
  setPrincipal,
  creditDays,
  setCreditDays,
  invoiceDate,
  setInvoiceDate,
  paymentDate,
  setPaymentDate,
  bankRate,
  setBankRate
}: MSMEFormProps) {
  return (
    <div className="bg-brand-slate-blue border border-white/10 rounded-card p-6 shadow-md space-y-6 text-white">
      
      {/* 1. Principal & Credit Slabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block flex items-center gap-1.5">
            1. Invoice Principal Amount
            <span className="group relative cursor-pointer text-brand-muted hover:text-white">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-brand-navy text-[10px] text-brand-muted rounded border border-white/10 hidden group-hover:block z-30 font-normal leading-normal">
                The core principal amount outstanding on the delayed invoice (excluding tax if calculated separately).
              </span>
            </span>
          </label>
          <div className="relative rounded-badge shadow-sm">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-muted text-xs font-bold">
              ₹
            </span>
            <input
              type="number"
              min={0}
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
              className="w-full bg-brand-navy border border-white/10 focus:border-brand-gold focus:ring-brand-gold focus:outline-none rounded-badge pl-8 pr-3.5 py-3 text-xs font-bold text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block">
            2. Statutory Credit Limit (Days)
          </label>
          <select
            value={creditDays}
            onChange={(e) => setCreditDays(Number(e.target.value) as 15 | 45)}
            className="w-full bg-brand-navy border border-white/10 focus:border-brand-gold focus:ring-brand-gold rounded-badge text-xs font-semibold p-3 text-white focus:outline-none"
          >
            <option value={45}>45 Days (Agreement in Writing)</option>
            <option value={15}>15 Days (No Written Agreement / Default)</option>
          </select>
        </div>
      </div>

      {/* 2. Dates Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block">
            3. Invoice Delivery Date
          </label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full bg-brand-navy border border-white/10 focus:border-brand-gold focus:ring-brand-gold rounded-badge text-xs font-bold p-3 text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 block">
            4. Actual Payment / Valuation Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full bg-brand-navy border border-white/10 focus:border-brand-gold focus:ring-brand-gold rounded-badge text-xs font-bold p-3 text-white focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Configurable RBI Bank Rate */}
      <div className="p-4 bg-brand-navy/40 border border-white/5 rounded-badge flex items-center justify-between flex-wrap gap-4 font-sans">
        <div className="flex-1 min-w-[200px]">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            RBI Bank Rate Reference
          </span>
          <span className="text-[10px] text-brand-muted block mt-0.5 leading-normal">
            Section 49 statutory discount rate as updated by the Reserve Bank of India. Interest is computed at 3× this rate.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            min={0}
            max={20}
            value={bankRate}
            onChange={(e) => setBankRate(Math.max(0, Number(e.target.value)))}
            className="w-20 bg-brand-navy border border-white/10 focus:border-brand-gold focus:outline-none rounded-badge text-center text-xs font-bold py-2 px-2.5 text-white"
          />
          <span className="text-xs font-bold text-brand-gold">%</span>
        </div>
      </div>

    </div>
  )
}
