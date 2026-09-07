import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    absolute: 'ROC Compliance Deadline Tracker (2026) | CorpLawUpdates',
  },
  description: 'Track personalized MCA ROC annual return due dates, Table B late fee penalties, and Board Meeting compliance deadlines for your company.',
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
