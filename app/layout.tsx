import type { Metadata } from 'next'
import { Lora, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ToastProvider } from '@/components/Toast'
import BackToTop from '@/components/BackToTop'
import HideOnAdmin from '@/components/HideOnAdmin'
import './globals.css'

const lora = Lora({ subsets: ['latin'], variable: '--font-heading', display: 'swap' })
const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'CorpLawUpdates.in', template: '%s | CorpLawUpdates.in' },
  description: "India's free corporate law intelligence platform covering MCA, SEBI, RBI, NCLT, IBC and FEMA updates",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    siteName: 'CorpLawUpdates.in',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${lora.variable} ${sourceSans.variable}`}>
      <body className="font-body bg-slate-50 text-navy antialiased min-h-screen flex flex-col">
        <ToastProvider>
          <HideOnAdmin><Navbar /></HideOnAdmin>
          <main className="flex-grow">
            {children}
          </main>
          <HideOnAdmin><Footer /></HideOnAdmin>
          <HideOnAdmin><BackToTop /></HideOnAdmin>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
