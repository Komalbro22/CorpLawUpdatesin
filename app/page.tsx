/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from '@/lib/supabase'
import UpdateCard from '@/components/UpdateCard'
import NewsletterWidget from '@/components/NewsletterWidget'
import Link from 'next/link'

import { Metadata } from 'next'
import { BASE_URL } from '@/lib/utils'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'CorpLawUpdates.in — India\'s Free Corporate Law Intelligence Platform',
  description: 'Free corporate law updates covering MCA, SEBI, RBI, NCLT, IBC and FEMA. For corporate lawyers, compliance officers and CS professionals.',
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'CorpLawUpdates.in',
    description: 'India\'s Free Corporate Law Intelligence Platform',
    url: BASE_URL,
    type: 'website',
    images: [{
      url: BASE_URL + '/api/og?title=CorpLawUpdates.in&category=MCA',
      width: 1200,
      height: 630,
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CorpLawUpdates.in',
    description: 'India\'s Free Corporate Law Intelligence Platform',
  }
}

export default async function HomePage() {
  const [featuredRes, latestRes] = await Promise.all([
    supabase
      .from('updates')
      .select('*')
      .eq('is_featured', true)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('updates')
      .select('*')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(9)
  ])

  const featuredUpdates = featuredRes.data || []
  const latestUpdates = latestRes.data || []

  const hasUpdates = featuredUpdates.length > 0 || latestUpdates.length > 0

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="w-full bg-navy relative py-20 px-4 md:py-32 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-heading text-white text-4xl md:text-6xl font-bold mb-6 leading-tight">
            India's Free Corporate Law Intelligence Platform
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl">
            Stay updated on MCA, SEBI, RBI, NCLT, IBC and FEMA regulations. Free forever. No login required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/updates"
              className="bg-gold text-navy font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg text-center"
            >
              Browse Updates
            </Link>
            <Link
              href="/newsletter"
              className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors text-center"
            >
              Subscribe Free
            </Link>
          </div>
        </div>
      </section>

      {!hasUpdates && (
        <section className="py-20 text-center px-4">
          <h2 className="text-2xl font-bold text-navy mb-4 font-heading">Updates coming soon</h2>
          <p className="text-slate-600">Check back shortly.</p>
        </section>
      )}

      {/* 2. FEATURED UPDATES */}
      {featuredUpdates.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-navy mb-8 font-heading border-l-4 border-gold pl-4">
            Featured Updates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredUpdates.map((update: any) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        </section>
      )}

      {/* 3. CATEGORY PILLS */}
      <section className="py-12 px-4 w-full border-y border-slate-200 mb-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-navy mb-8 font-heading text-center">
            Browse by Regulator
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA'].map((cat) => {
              const bgColors: Record<string, string> = {
                MCA: 'bg-[#3B82F6]', SEBI: 'bg-[#10B981]', RBI: 'bg-[#8B5CF6]',
                NCLT: 'bg-[#F97316]', IBC: 'bg-[#EF4444]', FEMA: 'bg-[#14B8A6]'
              };
              return (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className={`${bgColors[cat]} text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-sm`}
                >
                  {cat}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. LATEST UPDATES */}
      {latestUpdates.length > 0 && (
        <section className="pb-16 px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-navy mb-8 font-heading border-l-4 border-gold pl-4">
            Latest Updates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {latestUpdates.map((update: any) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/updates"
              className="inline-flex items-center text-navy font-bold hover:text-gold transition-colors text-lg group"
            >
              View All Updates →
            </Link>
          </div>
        </section>
      )}

      {/* 5. NEWSLETTER SECTION */}
      <section className="bg-slate-100 py-20 px-4 w-full border-t border-slate-200">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold text-navy mb-4 font-heading">
            Get Updates in Your Inbox
          </h2>
          <p className="text-slate-600 mb-8 max-w-lg">
            Weekly digest of top corporate law updates. Free forever.
          </p>
          <div className="w-full max-w-md text-left">
            <NewsletterWidget />
          </div>
        </div>
      </section>
    </div>
  )
}
