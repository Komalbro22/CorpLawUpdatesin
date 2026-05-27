import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MSME Delayed Interest Calculator (RBI reference bank rate) | CorpLawUpdates.in',
  description: 'Statutorily accurate delayed payment interest calculator. Computes compounding monthly rests at 3x the active RBI Bank Rate under Section 16 of the MSMED Act, 2006.',
  alternates: { canonical: 'https://www.corplawupdates.in/tools/msme-calculator' }
}

export default function MsmeCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
