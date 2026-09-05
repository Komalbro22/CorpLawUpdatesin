import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ToastProvider } from '@/components/Toast'
import BackToTop from '@/components/BackToTop'
import WhatsAppButton from '@/components/WhatsAppButton'
import HideOnAdmin from '@/components/HideOnAdmin'
import AnnouncementBar from '@/components/AnnouncementBar'
import Script from 'next/script'
import JsonLd from '@/components/JsonLd'
import TrackingScripts from '@/components/TrackingScripts'
import ConsentGatedAnalytics from '@/components/ConsentGatedAnalytics'

import WebMCPRegistry from '@/components/WebMCPRegistry'

import ThemeScript from '@/components/ThemeScript'
import { fontVariables } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.corplawupdates.in'),
  title: {
    default: 'CorpLawUpdates.in - Free Corporate Law Intelligence',
    template: '%s | CorpLawUpdates.in',
  },
  description: 'Free Indian corporate law updates covering MCA, SEBI, RBI, CCI, Labour Law, NCLT, IBC and FEMA regulatory developments for legal & compliance professionals.',

  authors: [{ name: 'CorpLawUpdates.in' }],
  creator: 'CorpLawUpdates.in',
  publisher: 'CorpLawUpdates.in',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
    description: 'Free Indian corporate law updates - MCA, SEBI, RBI, CCI, Labour Law, NCLT, IBC and FEMA regulatory updates for professionals.',
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
    title: {
      default: 'CorpLawUpdates.in - India\'s Free Corporate Law Intelligence Platform',
      template: '%s | CorpLawUpdates.in',
    },
    description: 'Free MCA, SEBI, RBI, NCLT, IBC and FEMA updates for professionals.',
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
  return (
    <html lang="en" data-scroll-behavior="smooth" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="llms" href="/llms.txt" />
        <meta name="theme-color" content="#0F172A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
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
          knowsAbout: [
            'Corporate Law in India',
            'Companies Act 2013',
            'Ministry of Corporate Affairs (MCA)',
            'Securities and Exchange Board of India (SEBI)',
            'Reserve Bank of India (RBI)',
            'Insolvency and Bankruptcy Code (IBC)',
            'National Company Law Tribunal (NCLT)',
            'Foreign Exchange Management Act (FEMA)'
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
      </head>
      <body className="font-body bg-slate-50 dark:bg-slate-950 text-navy dark:text-slate-100 antialiased min-h-dvh flex flex-col selection:bg-amber-200/50 selection:text-navy break-words" suppressHydrationWarning>
        <ToastProvider>
          <HideOnAdmin>
            <TrackingScripts />
          </HideOnAdmin>
          <a
            href="#main-content"
            className="absolute left-4 top-4 z-50 -translate-y-[200%] rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-gold shadow-lg ring-2 ring-amber-400/50 transition-transform focus:left-4 focus:top-4 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Skip to main content
          </a>
          <HideOnAdmin><AnnouncementBar /></HideOnAdmin>
          <HideOnAdmin>
            <header>
              <Navbar />
            </header>
          </HideOnAdmin>
          <main id="main-content" tabIndex={-1} className="flex-grow outline-none overflow-x-hidden">
            {children}
          </main>
          <HideOnAdmin><Footer /></HideOnAdmin>
          <HideOnAdmin><BackToTop /></HideOnAdmin>
          <HideOnAdmin><WhatsAppButton /></HideOnAdmin>
          <HideOnAdmin><WebMCPRegistry /></HideOnAdmin>
        </ToastProvider>
        <HideOnAdmin>
          <ConsentGatedAnalytics />
        </HideOnAdmin>

        <Script
          id="pwa-service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    for (var r of regs) { r.unregister(); }
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      for (var k of keys) { caches.delete(k); }
                    });
                  }
                } else {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                }
              }
            `,
          }}
        />

        {/* Google News & Preferred Sources Publisher SDK */}
        <Script
          id="google-publisher-sdk"
          src="https://news.google.com/swg/js/v1/publisher.js"
          strategy="lazyOnload"
        />

      </body>
    </html>
  )
}
