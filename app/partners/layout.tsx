import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner With Us — CorpLawUpdates.in',
  description:
    'Partner with CorpLawUpdates.in. Reach Company Secretaries, Chartered Accountants, CMAs, and compliance leaders across India through sponsored articles, partner listings, and promotions.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/partners',
  },
  openGraph: {
    title: 'Partner With Us — CorpLawUpdates.in',
    description:
      'Partner with CorpLawUpdates.in. Reach Company Secretaries, Chartered Accountants, CMAs, and compliance leaders across India.',
    url: 'https://www.corplawupdates.in/partners',
    type: 'website',
    siteName: 'CorpLawUpdates.in',
  },
}

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
