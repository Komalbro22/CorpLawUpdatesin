import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compliance Fee & Penalty Calculators Hub | CorpLawUpdates.in',
  description: 'Free interactive fee and penalty calculators for Companies, LLPs, MSMEs, and GST late fees.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator',
  },
}

export default function FeeCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
