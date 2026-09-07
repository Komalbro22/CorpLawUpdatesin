import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Compliance Fee & Penalty Calculators Hub | CorpLawUpdates',
  },
  description: 'Calculate MCA21 V3 statutory filing fees, Table B delay multipliers, ₹100/day ROC penalties, LLP late fees, and MSME delayed payment interest.',
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
