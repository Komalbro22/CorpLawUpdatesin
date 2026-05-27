import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Client Legal Review Portal | CorpLawUpdates.in',
  description: 'Secure, read-only document review and approval portal.',
  robots: {
    index: false,
    follow: false
  }
}

export default function ClientReviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
