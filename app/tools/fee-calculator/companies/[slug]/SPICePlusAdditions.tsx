import React from 'react'
import Link from 'next/link'
import { CheckCircle2, ArrowUpRight, Scale, ShieldCheck, Sparkles, Building, Landmark } from 'lucide-react'

const KEY_STATE_RATES = [
  { state: 'Delhi', moa: '₹200', aoa: '0.15% (min ₹150, max ₹25L)', form: '₹10', tier: 'Low Cost' },
  { state: 'Maharashtra', moa: '₹1,000', aoa: '0.3% (₹1,000/₹5L, max ₹1 Cr)', form: '₹100', tier: 'Moderate' },
  { state: 'Karnataka', moa: '₹1,000', aoa: '₹5,000 per ₹10L (2024 Act)', form: '₹20', tier: 'High Duty' },
  { state: 'Tamil Nadu', moa: '₹1,000', aoa: '₹500 per ₹10L (2024 Rev.)', form: '₹20', tier: 'Moderate' },
  { state: 'Uttar Pradesh', moa: '₹500', aoa: '₹500 (Flat)', form: '₹100', tier: 'Low Cost' },
  { state: 'Gujarat', moa: '₹100', aoa: '₹1,000 (up to ₹1 Cr)', form: '₹20', tier: 'Low Cost' },
  { state: 'Telangana', moa: '₹500', aoa: '₹1,000 (0.15% > ₹10L)', form: '₹20', tier: 'Moderate' },
  { state: 'West Bengal', moa: '₹300', aoa: '₹300 (Flat)', form: '₹10', tier: 'Low Cost' },
  { state: 'Haryana', moa: '₹60', aoa: '₹60 (Flat)', form: '₹10', tier: 'Lowest Duty' },
  { state: 'Punjab', moa: '₹10,025', aoa: '0.15% of capital', form: '₹10', tier: 'High Duty' },
  { state: 'Rajasthan', moa: '₹500', aoa: '0.5% (max ₹5L)', form: '₹50', tier: 'Moderate' },
  { state: 'Kerala', moa: '₹1,000', aoa: '0.1% (min ₹2,000, max ₹5L)', form: '₹25', tier: 'Moderate' }
]

export default function SPICePlusAdditions() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 space-y-12">
      {/* Zero Fee Statutory Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-400 mt-1">
            <Sparkles className="size-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 mb-2">
              Statutory Exemption Notice
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              ₹0 MCA Filing Fee up to ₹15 Lakhs Authorized Capital
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-3xl">
              Under <strong>G.S.R. 329(E)</strong> (effective 25 April 2019) amending Table A of the Companies (Registration Offices and Fees) Rules, 2014, the Ministry of Corporate Affairs levies <strong>NIL registration fee</strong> for Part B incorporation for companies having authorized capital up to ₹15,00,000. Only state stamp duty, e-form duty, and PAN/TAN statutory charges apply.
            </p>
          </div>
        </div>
        <a
          href="#spice-plus-workspace"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold whitespace-nowrap transition-colors shadow-sm self-stretch md:self-auto justify-center"
        >
          <span>Calculate Custom Duties</span>
          <ArrowUpRight className="size-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 5A: Services Checklist */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy dark:text-white">11 Integrated Services in SPICe+</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Forms INC-32, INC-33, INC-34 & AGILE-PRO-S (INC-35)</p>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-3.5 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Company Name Reservation (Part A / RUN):</strong>
                  <span className="text-slate-600 dark:text-slate-400 block text-xs">Valid for 20 days under Rule 9A; reserve together or independently.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Certificate of Incorporation (COI):</strong>
                  <span className="text-slate-600 dark:text-slate-400 block text-xs">Issued electronically by CRC (Central Registration Centre) with corporate CIN.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Director Identification Number (DIN):</strong>
                  <span className="text-slate-600 dark:text-slate-400 block text-xs">Up to 3 proposed directors receive DIN directly at ₹0 fee without separate DIR-3.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">PAN & TAN Allotment (Income Tax Dept):</strong>
                  <span className="text-slate-600 dark:text-slate-400 block text-xs">Automatic allotment with e-COI; fixed statutory fee of ₹78 (PAN) + ₹77 (TAN).</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">EPFO & ESIC Employer Registrations:</strong>
                  <span className="text-slate-600 dark:text-slate-400 block text-xs">Mandatory registration codes generated automatically via AGILE-PRO-S.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Professional Tax (PT) Registration:</strong>
                  <span className="text-slate-600 dark:text-slate-400 block text-xs">Mandatory in Maharashtra, Karnataka, West Bengal, and other notifying states.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Mandatory Corporate Bank Account Opening:</strong>
                  <span className="text-slate-600 dark:text-slate-400 block text-xs">Seamless corporate bank account pre-allotment via integrated partner banks.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">Optional GSTIN & Shops & Establishment Registration:</strong>
                  <span className="text-slate-600 dark:text-slate-400 block text-xs">Apply for voluntary GST or Delhi Shops registration simultaneously in AGILE-PRO-S.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              * Note: INC-9 electronic declarations are auto-generated and digitally signed by directors/subscribers without requiring physical affidavits.
            </p>
          </div>
        </div>

        {/* 5B: Stamp Duty Benchmark Table */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Scale className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy dark:text-white">State Stamp Duty Rates (2026)</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">State revenue acts governing electronic MOA & AOA stamping</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-300">State</th>
                    <th className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-300">e-MOA</th>
                    <th className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-300">e-AOA Rate</th>
                    <th className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-300 text-right">Duty Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {KEY_STATE_RATES.map(row => (
                    <tr key={row.state} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2 font-medium font-sans text-slate-900 dark:text-slate-100">{row.state}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{row.moa}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{row.aoa}</td>
                      <td className="px-3 py-2 text-right font-sans">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          row.tier === 'Low Cost' || row.tier === 'Lowest Duty'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : row.tier === 'High Duty'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                        }`}>
                          {row.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              * Note: Stamp duty is a state subject governed under Entry 44 of List III (Concurrent List). Karnataka rates reflect the Karnataka Stamp (Amendment) Act, 2024 (Art. 10). Tamil Nadu rates reflect the 2024 stamp duty schedule revision.
            </p>
            <div className="text-right">
              <a
                href="#spice-plus-workspace"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Check all 36 States & UTs above</span>
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
