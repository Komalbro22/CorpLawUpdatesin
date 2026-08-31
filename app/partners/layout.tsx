import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'List Your Service — Partner with CorpLawUpdates.in',
  description:
    'Join CorpLawUpdates.in as a verified CS, CA, or Advocate. List your corporate law and compliance services to reach compliance professionals across India.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/partners',
  },
  openGraph: {
    title: 'List Your Service — Partner with CorpLawUpdates.in',
    description:
      'Join as a verified CS, CA, or Advocate and list your corporate law and compliance services on CorpLawUpdates.in.',
    url: 'https://www.corplawupdates.in/partners',
    type: 'website',
    siteName: 'CorpLawUpdates.in',
  },
}

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
