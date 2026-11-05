import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Compliance Fee Calculators Hub | CorpLawUpdates.in',
  },
  description: 'Calculate MCA21 V3 filing fees, Table B delay multipliers, ₹100/day ROC penalties, LLP late fees, MSME delayed interest, and IBBI delayed filing fees.',
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
