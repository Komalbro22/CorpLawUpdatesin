import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MCA Late Filing Fee Calculator (AOC-4, MGT-7, LLP-11) | CorpLawUpdates.in',
  description: 'Free calculator to estimate statutory basic filing fees and delayed daily penalty rates under the latest 2026 MCA guidelines for small companies, OPCs, and LLPs.',
  alternates: { canonical: 'https://www.corplawupdates.in/tools/mca-calculator' }
}

export default function McaCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
