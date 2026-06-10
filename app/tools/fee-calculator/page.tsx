import { Metadata } from 'next'
import ClientPage from './client-page'

export const metadata: Metadata = {
  title: 'MCA Fee Calculator FY 2026-27 | ROC Filing Fees, Late Penalty & Stamp Duty',
  description: 'Free MCA fees calculator. Accurately calculate ROC filing fees, ₹100/day late filing penalty, and stamp duty for AOC-4, MGT-7, ADT-1, INC-20A, SH-7 & 20+ forms for Companies, LLPs and MSMEs.',
  keywords: [
    'MCA Fee Calculator', 'ROC Filing Fees', 'Late Fee Calculator', 'MCA Penalty Calculator',
    'AOC-4 Fees', 'MGT-7 Late Fee', 'Stamp Duty Calculator', 'Share Capital Increase',
    'LLP Penalty', 'MSME Delayed Payment Interest'
  ],
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator',
  },
  openGraph: {
    title: 'MCA Fee Calculator FY 2026-27 | Late Fee, Stamp Duty, ROC',
    description: 'Calculate ROC filing fees, ₹100/day late fee, and stamp duty for AOC-4, MGT-7, ADT-1, INC-20A, SH-7 & 20+ forms.',
    url: 'https://www.corplawupdates.in/tools/fee-calculator',
    siteName: 'CorpLawUpdates.in',
    type: 'website',
  },
}

export default function FeeCalculatorPage() {
  return <ClientPage />
}
