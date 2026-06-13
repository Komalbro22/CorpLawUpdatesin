import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ROC Compliance Deadline Tracker 2026 | CorpLawUpdates.in',
  description: 'Interactive tracker for MCA ROC compliance deadlines. Track AOC-4, MGT-7, DPT-3, DIR-3 KYC, and Board Meeting dates based on your company configuration.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/roc-tracker',
  },
}

export default function ROCTrackerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
