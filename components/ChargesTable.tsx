import React from 'react'
import { ChargeRecord } from '@/types'
import { Landmark, CheckCircle2, AlertCircle, Calendar, ShieldAlert } from 'lucide-react'

interface ChargesTableProps {
  charges: ChargeRecord[]
  companyName: string
}

export default function ChargesTable({ charges, companyName }: ChargesTableProps) {
  if (!charges || charges.length === 0) {
    return null
  }

  const openCharges = charges.filter(c => c.status === 'OPEN')
  const totalOpenAmount = openCharges.reduce((acc, c) => acc + (c.amount || 0), 0)
  const totalOpenCr = (totalOpenAmount / 10000000).toFixed(2)

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy dark:text-white font-heading">
              Secured Bank Charges & Loan Mortgages (CHG-1)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Registered bank borrowings and hypothecated charges for {companyName}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300/60">
            Total Secured Debt: ₹{totalOpenCr} Cr
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
            <tr>
              <th className="p-3.5">Charge ID</th>
              <th className="p-3.5">Lending Institution / Bank</th>
              <th className="p-3.5">Secured Amount (₹)</th>
              <th className="p-3.5">Date of Creation</th>
              <th className="p-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {charges.map((c) => {
              const amountCr = c.amount ? (c.amount / 10000000).toFixed(2) : '0'
              const isOpen = c.status === 'OPEN'

              return (
                <tr key={c.charge_id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-200">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                      #{c.charge_id}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-navy dark:text-white">
                    {c.holder_name}
                  </td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{amountCr} Crore
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {c.creation_date ? new Date(c.creation_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="w-3.5 h-3.5" /> OPEN / ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SATISFIED
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
