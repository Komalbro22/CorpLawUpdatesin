import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — CorpLawUpdates.in',
  description: 'Contact CorpLawUpdates.in for queries, article tips, partnerships or feedback.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/contact',
  },
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
