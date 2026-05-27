import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interactive AI Legal Drafting Co-Pilot | CorpLawUpdates.in',
  description: 'Generate legally binding Board Resolutions, Mutual NDAs, Sale Deeds, LLP Agreements, and Commercial Leases instantly using our AI Co-Pilot under DPDP Act privacy guidelines.',
  alternates: { canonical: 'https://www.corplawupdates.in/tools/drafting-copilot' }
}

export default function DraftingCopilotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
