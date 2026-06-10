import { Metadata } from 'next'
import CompanyFeeCalc from '../components/CompanyFeeCalc'
import FeeTables from '../components/FeeTables'
import SEOContent from '../components/SEOContent'
import FAQSection from '../components/FAQSection'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Company Fee Calculator | MCA & ROC Filing Penalty',
  description: 'Calculate ROC filing fees, ₹100/day late fee, and stamp duty for AOC-4, MGT-7, ADT-1, INC-20A, SH-7 & 20+ Company forms.',
}

export default function CompaniesFeePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 pb-20">
      <div className="bg-navy py-12 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Link href="/tools/fee-calculator" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 inline-flex items-center gap-2">
            ← Back to Calculator Hub
          </Link>
          <div className="inline-flex items-center gap-2 bg-green-400/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider block w-max">
            ✓ Updated for FY 2026-27
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-4">
            Company ROC Fee Calculator
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Calculate exact ROC filing fees, late penalties, and state-wise stamp duty for Private, Public, OPC and Small Companies.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-8 mb-16">
          <CompanyFeeCalc />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <FeeTables />
        <SEOContent />
        <FAQSection />
      </div>
    </div>
  )
}
