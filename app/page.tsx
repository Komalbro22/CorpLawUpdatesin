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
  title: 'India\'s Free Corporate Law Intelligence Platform',
  description: 'Free MCA, SEBI, RBI, NCLT, IBC and FEMA regulatory updates for Company Secretaries, corporate lawyers and compliance officers in India. No login required.',
  alternates: {
    canonical: 'https://www.corplawupdates.in',
  },
  openGraph: {
    title: 'CorpLawUpdates.in — Free Corporate Law Updates India',
    description: 'Free MCA, SEBI, RBI regulatory updates for CS professionals. Updated daily.',
    url: 'https://www.corplawupdates.in',
    images: [{ url: 'https://www.corplawupdates.in/api/og?title=India%27s+Free+Corporate+Law+Intelligence+Platform&category=', width: 1200, height: 630 }],
  },
}

export default async function HomePage() {
  const [featuredRes, latestRes, updatesCountRes, viewsRes] = await Promise.all([
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
      .limit(9),
    supabase
      .from('updates')
      .select('*', { count: 'exact', head: true })
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString()),
    supabase
      .from('updates')
      .select('views')
  ])

  const featuredUpdates = featuredRes.data || []
  const latestUpdates = latestRes.data || []
  const updatesCount = updatesCountRes.count || 0
  const totalViews = viewsRes.data?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0

  const hasUpdates = featuredUpdates.length > 0 || latestUpdates.length > 0

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+'
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+'
    return num.toString()
  }

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="w-full bg-navy relative min-h-[62vh] py-20 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:100px_100px]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(245,158,11,0.18),transparent_55%)]" aria-hidden />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center h-full">
          <p className="text-gold/90 text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-5">
            MCA · SEBI · RBI · NCLT · IBC · FEMA
          </p>
          <h1 className="font-heading text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] text-balance">
            India's Free Corporate Law Intelligence Platform
          </h1>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
            Stay updated on Indian corporate regulations with clear, sourced briefs. Free to read. No account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/updates"
              className="bg-gold text-navy font-semibold py-3.5 px-8 rounded-lg hover:bg-amber-400 transition-colors shadow-lg shadow-gold/20 text-center ring-1 ring-white/10"
            >
              Browse updates
            </Link>
            <Link
              href="/newsletter"
              className="border border-white/40 text-white font-semibold py-3.5 px-8 rounded-lg hover:bg-white/10 transition-colors text-center backdrop-blur-sm"
            >
              Weekly newsletter
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-8 border-t border-white/15 pt-10 w-full max-w-md mx-auto">
            <div className="text-center">
              <div className="text-3xl text-white font-bold mb-1 tracking-tight">
                {formatNumber(updatesCount)}
              </div>
              <div className="text-slate-400 text-sm font-medium">
                Articles published
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl text-white font-bold mb-1 tracking-tight">
                {formatNumber(totalViews)}
              </div>
              <div className="text-slate-400 text-sm font-medium">
                All-time reads
              </div>
            </div>
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
        <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2 font-heading border-l-4 border-gold pl-4">
            Featured updates
          </h2>
          <p className="text-slate-600 mb-8 md:mb-10 max-w-2xl pl-4 md:pl-5 text-sm md:text-base">
            Hand-picked regulatory highlights worth reading first.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredUpdates.map((update: any) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        </section>
      )}

      {/* 3. CATEGORY PILLS */}
      <section className="py-14 px-4 w-full border-y border-slate-200/90 mb-16 bg-white shadow-sm shadow-slate-200/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-navy mb-2 font-heading text-center">
            Browse by regulator
          </h2>
          <p className="text-slate-600 text-center text-sm md:text-base mb-8 max-w-xl mx-auto">
            Jump straight to updates from the authority you follow.
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA'].map((cat) => {
              const styles: Record<string, string> = {
                MCA: 'bg-blue-600 hover:bg-blue-700 ring-blue-700/20',
                SEBI: 'bg-emerald-600 hover:bg-emerald-700 ring-emerald-700/20',
                RBI: 'bg-violet-600 hover:bg-violet-700 ring-violet-700/20',
                NCLT: 'bg-orange-600 hover:bg-orange-700 ring-orange-700/20',
                IBC: 'bg-red-600 hover:bg-red-700 ring-red-700/20',
                FEMA: 'bg-teal-600 hover:bg-teal-700 ring-teal-700/20',
              }
              return (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className={`${styles[cat]} text-white px-5 py-2.5 rounded-lg font-semibold text-sm md:text-base shadow-md shadow-slate-900/10 ring-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2`}
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
        <section className="pb-16 md:pb-20 px-4 max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2 font-heading border-l-4 border-gold pl-4">
            Latest updates
          </h2>
          <p className="text-slate-600 mb-8 md:mb-10 max-w-2xl pl-4 md:pl-5 text-sm md:text-base">
            New and recent briefs, newest first.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
            {latestUpdates.map((update: any) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/updates"
              className="inline-flex items-center gap-2 text-navy font-semibold hover:text-amber-700 transition-colors text-base md:text-lg border-b border-navy/20 hover:border-amber-700/40 pb-0.5"
            >
              View all updates
            </Link>
          </div>
        </section>
      )}

      {/* 5. NEWSLETTER SECTION */}
      <section className="w-full bg-navy py-16 md:py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(245,158,11,0.12),transparent_50%)]" aria-hidden />
        <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
            Weekly corporate law digest
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            One email on Mondays: MCA, SEBI, RBI, NCLT, IBC and FEMA. No spam. Unsubscribe anytime.
          </p>
          <div className="w-full max-w-md mx-auto text-left">
            <NewsletterWidget />
          </div>
        </div>
      </section>
    </div>
  )
}
