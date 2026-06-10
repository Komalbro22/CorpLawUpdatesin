import { Metadata } from 'next'
import LLPFeeCalc from '../components/LLPFeeCalc'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'LLP Fee Calculator | MCA Penalty & Form Filing Fees',
  description: 'Calculate LLP filing fees and late penalties for Form 8, Form 11, Form 3, and DIR-3 KYC.',
}

export default function LLPFeePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 pb-20">
      <div className="bg-navy py-12 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Link href="/tools/fee-calculator" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 inline-flex items-center gap-2">
            ← Back to Calculator Hub
          </Link>
          <div className="inline-flex items-center gap-2 bg-blue-400/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider block w-max">
            ✓ Updated for FY 2026-27
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-4">
            LLP Fee & Penalty Calculator
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Calculate statutory filing fees and flat ₹100/day late filing penalties for Limited Liability Partnerships.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-8 mb-16">
          <LLPFeeCalc />
        </div>
      </div>
    </div>
  )
}
