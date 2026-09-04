import type { Metadata } from 'next'

const pageUrl = 'https://www.corplawupdates.in/documents/share-transfer-deed'
const title = 'Form SH-4 Share Transfer Deed Format: Word & PDF Download (2026)'
const description = 'Download official MCA Form SH-4 share transfer deed format in Word (.docx) and PDF. Includes 0.015% stamp duty calculator, 60-day lodging checklist, specimen board resolution & legal guide under Section 56.'

export const revalidate = 86400

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'share transfer form sh-4 pdf download',
    'sh-4 new format in word',
    'share transfer form',
    'sh 4 new format download',
    'sh-4 format',
    'share transfer deed',
    'sh4 form',
    'share transfer form sh-4 in word format',
    'form sh-4 mca download',
    'sh4 word format',
    'stamp duty on share transfer form sh-4',
    'Section 56 Companies Act 2013',
    'Rule 11 Companies Share Capital and Debentures Rules 2014',
    'board resolution for transfer of shares',
    'small company physical share transfer Rule 9B',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website',
    url: pageUrl,
    siteName: 'CorpLawUpdates.in',
    title: `${title} | CorpLawUpdates.in`,
    description,
    images: [{
      url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent('Form SH-4 Share Transfer Deed Format & Generator')}&type=Document Generator`,
      width: 1200,
      height: 630,
      alt: 'Form SH-4 Share Transfer Deed format, Word & PDF generator, and stamp duty calculator',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | CorpLawUpdates.in`,
    description,
    images: [`https://www.corplawupdates.in/api/og?title=${encodeURIComponent('Form SH-4 Share Transfer Deed Format & Generator')}&type=Document Generator`],
  },
}

export default function ShareTransferDeedLayout({ children }: { children: React.ReactNode }) {
  return children
}
