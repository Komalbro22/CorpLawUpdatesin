/* eslint-disable @typescript-eslint/no-explicit-any */
// Triggering new build fix
/* eslint-disable react/no-unescaped-entities */
import { supabase } from '@/lib/supabase'
import UpdateCard from '@/components/UpdateCard'
import Link from 'next/link'
import { Metadata } from 'next'
import type { CSSProperties } from 'react'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Gavel,
  Globe2,
  Landmark,
  Newspaper,
  Scale,
  TrendingUp,
} from 'lucide-react'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Corporate Law Updates India (2026) – SEBI, RBI, MCA Notifications & Circulars',
  description: 'Get the latest corporate law updates in India including SEBI, RBI, MCA, NCLT, IBC and FEMA. Simplified and beautifully structured for all professionals, corporates, and modern compliance leaders.',
  alternates: { canonical: 'https://www.corplawupdates.in' },
  openGraph: {
    title: 'Corporate Law Updates India (2026) – SEBI, RBI, MCA Notifications & Circulars',
    description: 'Get the latest corporate law updates in India including SEBI, RBI, MCA, NCLT, IBC and FEMA. Updated daily.',
    url: 'https://www.corplawupdates.in',
    images: [{ url: 'https://www.corplawupdates.in/api/og?title=Corporate+Law+Updates+India+2026&category=', width: 1200, height: 630 }],
  },
}

const categoryMeta = [
  { id: 'MCA', label: 'MCA', Icon: Building2, bg: 'from-blue-600 to-blue-700', ring: 'ring-blue-500/20', desc: 'Ministry of Corporate Affairs' },
  { id: 'SEBI', label: 'SEBI', Icon: TrendingUp, bg: 'from-emerald-600 to-emerald-700', ring: 'ring-emerald-500/20', desc: 'Securities & Exchange Board' },
  { id: 'RBI', label: 'RBI', Icon: Landmark, bg: 'from-violet-600 to-violet-700', ring: 'ring-violet-500/20', desc: 'Reserve Bank of India' },
  { id: 'NCLT', label: 'NCLT', Icon: Scale, bg: 'from-orange-600 to-orange-700', ring: 'ring-orange-500/20', desc: 'National Company Law Tribunal' },
  { id: 'IBC', label: 'IBC', Icon: Gavel, bg: 'from-red-600 to-red-700', ring: 'ring-red-500/20', desc: 'Insolvency & Bankruptcy Code' },
  { id: 'FEMA', label: 'FEMA', Icon: Globe2, bg: 'from-teal-600 to-teal-700', ring: 'ring-teal-500/20', desc: 'Foreign Exchange Management' },
]

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
      .limit(9),
  ])

  const featuredUpdates = featuredRes.data || []
  const latestUpdates = latestRes.data || []
  const hasUpdates = featuredUpdates.length > 0 || latestUpdates.length > 0

  return (
    <div>
      <section className="relative w-full overflow-hidden bg-slate-950">
        {/* Soft glowing premium color orbs */}
        <div
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-amber-500/15 to-transparent blur-[120px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-indigo-500/15 to-transparent blur-[120px] pointer-events-none"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(15,23,42,0.98))]"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:72px_72px]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8">
          <div className="flex flex-col items-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              MCA - SEBI - RBI - NCLT - IBC - FEMA
            </p>
            <h1 className="font-heading text-4xl font-bold leading-[1.1] text-white text-balance md:text-5xl lg:text-6xl">
              Corporate Law Updates
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg text-balance">
              CorpLawUpdates.in provides the latest corporate law updates including SEBI regulations, RBI notifications, MCA circulars, and NCLT judgments — simplified and beautifully structured for all professionals, corporates, and modern compliance leaders.
            </p>
            <p className="mt-4 text-sm text-slate-400 font-medium italic">
              Updated daily with the latest corporate law updates.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
              <Link
                href="/updates"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-8 py-4 text-sm font-bold text-navy shadow-lg shadow-amber-900/20 transition-colors hover:bg-amber-400 motion-safe:hover:scale-105"
              >
                Browse updates
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href="/newsletter"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-white/[0.10] motion-safe:hover:scale-105"
              >
                Subscribe free
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-slate-300">
              {['No login required', 'Updated regularly', 'Built for Indian compliance'].map(item => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold" aria-hidden />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>


      {!hasUpdates && (
        <section className="py-20 text-center px-4">
          <h2 className="text-2xl font-bold text-navy mb-4 font-heading">Updates coming soon</h2>
          <p className="text-slate-500">Check back shortly.</p>
        </section>
      )}

      {featuredUpdates.length > 0 && (
        <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Editor's desk</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy font-heading">
                Featured updates
              </h2>
              <p className="mt-2 text-slate-500 text-sm md:text-base">
                Hand-picked regulatory highlights worth reading first.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredUpdates.map((update: any, i: number) => (
              <UpdateCard key={update.id} update={update} animationDelay={i * 80} />
            ))}
          </div>
        </section>
      )}

      <section className="py-14 px-4 w-full border-y border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-navy mb-2 font-heading text-center">
            Browse by regulator
          </h2>
          <p className="text-slate-500 text-center text-sm md:text-base mb-10 max-w-xl mx-auto">
            Jump straight to updates from the authority you follow.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categoryMeta.map(({ id, label, Icon, bg, ring, desc }, i) => (
              <Link
                key={id}
                href={`/category/${id.toLowerCase()}`}
                style={{ '--delay': `${i * 50}ms` } as CSSProperties}
                className={`animate-fade-up group flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${bg} p-4 text-center text-white shadow-md ${ring} ring-1 transition-all duration-300 ease-spring motion-safe:hover:-translate-y-1 hover:shadow-lg`}
              >
                <Icon className="w-6 h-6 opacity-90 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-110" aria-hidden />
                <span className="font-bold text-base">{label}</span>
                <span className="text-[10px] text-white/75 leading-tight hidden sm:block">{desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {latestUpdates.length > 0 && (
        <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Newest first</p>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-navy font-heading">
                Latest updates
              </h2>
              <p className="mt-2 text-slate-500 text-sm md:text-base">
                New and recent briefs from Indian regulators.
              </p>
            </div>
            <Link
              href="/updates"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-slate-50"
            >
              View all
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
            {latestUpdates.map((update: any, i: number) => (
              <UpdateCard key={update.id} update={update} animationDelay={i * 60} />
            ))}
          </div>
          <div className="text-center sm:hidden">
            <Link
              href="/updates"
              className="inline-flex items-center gap-2 text-navy font-semibold hover:text-amber-700 transition-colors text-base group"
            >
              View all updates
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      {/* Premium Legal Document Generator Promo Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto border-t border-slate-100">
        <div className="bg-navy rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:32px_32px]" aria-hidden />
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="text-4xl mb-4">📄</div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3 text-white">
              Free Legal Document Generator
            </h2>
            <p className="text-slate-350 max-w-lg mx-auto mb-8 text-sm leading-relaxed font-light">
              Generate Board Resolutions, Director Appointment letters, Bank Account Opening authorities and legal documents in seconds. Powered by AI. Based on ICSI Secretarial Standards and Companies Act 2013.
            </p>
            <Link href="/documents"
                  className="inline-block bg-gold hover:bg-amber-400 text-navy font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md">
              Generate Documents Free →
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full bg-navy py-16 md:py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] bg-[size:72px_72px]" aria-hidden />
        <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
          <Newspaper className="mb-4 h-8 w-8 text-gold" aria-hidden />
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
            Weekly Corporate Law Digest
          </h2>
          <p className="text-slate-300/90 mb-8 max-w-xl mx-auto leading-relaxed">
            One email on Mondays: MCA, SEBI, RBI, NCLT, IBC and FEMA. No spam. Unsubscribe anytime.
          </p>
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 font-bold text-navy transition-colors hover:bg-amber-400"
          >
            Subscribe free
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Subtle SEO Context at Bottom */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-slate-100 mt-10">
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-8 shadow-sm text-center">
          <h2 className="text-xl font-bold text-navy mb-4 font-heading">Latest Corporate Law Updates</h2>
          <div className="max-w-3xl mx-auto text-sm text-slate-500 leading-relaxed space-y-4">
            <p>
              CorpLawUpdates.in provides the <strong>latest corporate law updates</strong> covering 
              <Link href="/category/sebi" className="text-gold hover:underline font-medium mx-1">SEBI updates</Link>, 
              <Link href="/category/rbi" className="text-gold hover:underline font-medium mx-1">RBI circular updates</Link>, 
              <Link href="/category/mca" className="text-gold hover:underline font-medium mx-1">MCA updates</Link>, 
              NCLT, IBC and FEMA regulations.
            </p>
            <p>
              We simplify complex legal updates into easy-to-understand summaries with key insights and practical implications 
              to help you stay ahead with <strong>corporate law updates</strong>.
            </p>
            <p className="pt-2">
              👉 <Link href="/updates" className="text-gold font-bold hover:text-amber-700 transition-colors underline decoration-gold/30 underline-offset-4">
                Browse all corporate law updates
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "CorpLawUpdates.in",
            "url": "https://www.corplawupdates.in",
            "description": "Latest corporate law updates (SEBI, RBI, MCA, NCLT, IBC)",
            "publisher": {
              "@type": "Organization",
              "name": "CorpLawUpdates.in",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.corplawupdates.in/icon.png"
              }
            }
          })
        }}
      />
    </div>
  )
}
