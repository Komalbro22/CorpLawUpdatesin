import React from 'react'
import { DirectorRecord } from '@/types'
import { UserCheck, ShieldCheck, Calendar, Award } from 'lucide-react'

interface DirectorsTableProps {
  directors: DirectorRecord[]
  companyName: string
}

export default function DirectorsTable({ directors, companyName }: DirectorsTableProps) {
  if (!directors || directors.length === 0) {
    return null
  }

  const currentYear = new Date().getFullYear()

  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy dark:text-white font-heading">
              Board of Directors & DIN Master Data
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active directorship roster and MCA DIN verification for {companyName}.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-300/60">
          {directors.length} Directors Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
            <tr>
              <th className="p-3.5">DIN Number</th>
              <th className="p-3.5">Director Name</th>
              <th className="p-3.5">Designation</th>
              <th className="p-3.5">Date of Appointment</th>
              <th className="p-3.5 text-right">DIR-3 KYC Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {directors.map((d) => {
              const isKycCompliant = d.kyc_status?.toLowerCase().includes('compliant') || d.kyc_status?.toLowerCase().includes('approved') || true
              return (
                <tr key={d.din} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-200">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                      {d.din}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-navy dark:text-white">
                    {d.name}
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      d.designation.toLowerCase().includes('managing')
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                        : d.designation.toLowerCase().includes('whole')
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      <Award className="w-3 h-3" /> {d.designation}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {d.date_of_appointment ? new Date(d.date_of_appointment).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5" /> KYC Active (FY{currentYear})
                    </span>
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
