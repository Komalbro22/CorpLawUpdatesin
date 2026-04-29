import type { Metadata } from 'next'
import { Lora, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ToastProvider } from '@/components/Toast'
import BackToTop from '@/components/BackToTop'
import WhatsAppButton from '@/components/WhatsAppButton'
import HideOnAdmin from '@/components/HideOnAdmin'
import AnnouncementBar from '@/components/AnnouncementBar'
import Script from 'next/script'
import JsonLd from '@/components/JsonLd'
import { getSetting } from '@/lib/settings'
import './globals.css'

const lora = Lora({ subsets: ['latin'], variable: '--font-heading', display: 'swap' })
const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.corplawupdates.in'),
  title: {
    default: 'CorpLawUpdates.in — India\'s Free Corporate Law Intelligence Platform',
    template: '%s | CorpLawUpdates.in',
  },
  description: 'Free Indian corporate law updates — MCA, SEBI, RBI, NCLT, IBC and FEMA regulatory updates for CS professionals, corporate lawyers and compliance officers.',
  keywords: [
    'MCA circular 2026',
    'SEBI notification 2026', 
    'RBI circular 2026',
    'corporate law India',
    'company secretary updates',
    'compliance calendar 2026',
    'Companies Act 2013 amendments',
    'SEBI LODR compliance',
    'IBC insolvency updates',
    'FEMA regulations India',
    'CS professional updates',
    'corporate compliance India',
    'MCA filing deadlines',
    'NCLT orders 2026',
  ],
  authors: [{ name: 'CorpLawUpdates.in' }],
  creator: 'CorpLawUpdates.in',
  publisher: 'CorpLawUpdates.in',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.corplawupdates.in',
    siteName: 'CorpLawUpdates.in',
    title: 'CorpLawUpdates.in — India\'s Free Corporate Law Intelligence Platform',
    description: 'Free Indian corporate law updates — MCA, SEBI, RBI, NCLT, IBC and FEMA regulatory updates for CS professionals.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CorpLawUpdates.in — India\'s Free Corporate Law Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@corplawupdates',
    creator: '@corplawupdates',
    title: 'CorpLawUpdates.in — India\'s Free Corporate Law Intelligence Platform',
    description: 'Free MCA, SEBI, RBI, NCLT, IBC and FEMA updates for CS professionals.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.corplawupdates.in',
    types: {
      'application/rss+xml': 'https://www.corplawupdates.in/api/feed.xml',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || '',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = await getSetting('google_analytics_id')

  return (
    <html lang="en" className={`${lora.variable} ${sourceSans.variable}`}>
      <head>
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'CorpLawUpdates.in',
          url: 'https://www.corplawupdates.in',
          logo: 'https://www.corplawupdates.in/icon.png',
          description: 'India\'s Free Corporate Law Intelligence Platform',
          sameAs: [
            'https://twitter.com/corplawupdates',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'corplawupdatesin@gmail.com',
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: 'English',
          },
        }} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'CorpLawUpdates.in',
          url: 'https://www.corplawupdates.in',
          description: 'Free Indian corporate law updates',
          inLanguage: 'en-IN',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://www.corplawupdates.in/updates?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        }} />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="font-body bg-slate-50 text-navy antialiased min-h-screen flex flex-col">
        <ToastProvider>
          <HideOnAdmin><AnnouncementBar /></HideOnAdmin>
          <HideOnAdmin><Navbar /></HideOnAdmin>
          <main className="flex-grow">
            {children}
          </main>
          <HideOnAdmin><Footer /></HideOnAdmin>
          <HideOnAdmin><BackToTop /></HideOnAdmin>
          <WhatsAppButton />
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
        {/* Google Reader Revenue Manager - SWG */}
        <Script
          src="https://news.google.com/swg/js/v1/swg-basic.js"
          strategy="afterInteractive"
        />
        <Script
          id="swg-basic-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (self.SWG_BASIC = self.SWG_BASIC || []).push(
                basicSubscriptions => {
                  basicSubscriptions.init({
                    type: "NewsArticle",
                    isPartOfType: ["Product"],
                    isPartOfProductId: "CAow767GDA:openaccess",
                    clientOptions: { theme: "light", lang: "en" },
                  });
                }
              );
            `,
          }}
        />
      </body>
    </html>
  )
}
