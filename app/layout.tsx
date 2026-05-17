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

const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })
const sourceSans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.corplawupdates.in'),
  title: {
    default: 'CorpLawUpdates.in - Free Corporate Law Updates',
    template: '%s | CorpLawUpdates.in',
  },
  description: 'Free Indian corporate law updates - MCA, SEBI, RBI, NCLT, IBC and FEMA regulatory updates for CS professionals, corporate lawyers and compliance officers.',
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
    title: 'CorpLawUpdates.in - India\'s Free Corporate Law Intelligence Platform',
    description: 'Free Indian corporate law updates - MCA, SEBI, RBI, NCLT, IBC and FEMA regulatory updates for CS professionals.',
    images: [
      {
        url: 'https://www.corplawupdates.in/api/og?title=India%27s+Free+Corporate+Law+Intelligence+Platform&category=',
        width: 1200,
        height: 630,
        alt: 'CorpLawUpdates.in - India\'s Free Corporate Law Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@corplawupdates',
    creator: '@corplawupdates',
    title: 'CorpLawUpdates.in - India\'s Free Corporate Law Intelligence Platform',
    description: 'Free MCA, SEBI, RBI, NCLT, IBC and FEMA updates for CS professionals.',
    images: ['https://www.corplawupdates.in/api/og?title=India%27s+Free+Corporate+Law+Intelligence+Platform&category='],
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
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0F172A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'CorpLawUpdates.in',
          url: 'https://www.corplawupdates.in',
          logo: 'https://www.corplawupdates.in/icon.png',
          description: 'India\'s free corporate law intelligence platform providing MCA, SEBI, RBI, NCLT and IBC regulatory updates.',
          email: 'mail@corplawupdates.in',
          sameAs: [
            'https://x.com/CorpLawUpdates',
            'https://www.linkedin.com/company/corplawupdates/',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'mail@corplawupdates.in',
            contactType: 'Customer Support',
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
        {gaId && gaId.startsWith('G-') && (
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
      <body className={`${lora.variable} ${sourceSans.variable} font-body bg-slate-50 text-navy antialiased min-h-screen flex flex-col selection:bg-amber-200/50 selection:text-navy break-words`}>
        <ToastProvider>
          <a
            href="#main-content"
            className="absolute left-4 top-4 z-[100] -translate-y-[200%] rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-gold shadow-lg ring-2 ring-amber-400/50 transition-transform focus:left-4 focus:top-4 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Skip to main content
          </a>
          <HideOnAdmin><AnnouncementBar /></HideOnAdmin>
          <HideOnAdmin><Navbar /></HideOnAdmin>
          <main id="main-content" tabIndex={-1} className="flex-grow outline-none">
            {children}
          </main>
          <HideOnAdmin><Footer /></HideOnAdmin>
          <HideOnAdmin><BackToTop /></HideOnAdmin>
          <HideOnAdmin><WhatsAppButton /></HideOnAdmin>
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
