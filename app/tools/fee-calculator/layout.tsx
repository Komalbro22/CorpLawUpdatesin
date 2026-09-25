import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'Compliance Fee & Penalty Calculators Hub (FY 2026-27) — MCA, LLP, MSME & IBBI | CorpLaw',
  },
  description: 'Calculate MCA21 V3 statutory filing fees, Table B delay multipliers, ₹100/day ROC penalties, LLP late fees, MSME delayed interest, and IBBI late filing fees.',
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
