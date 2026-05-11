/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
import { supabase } from '@/lib/supabase'
import UpdateCard from '@/components/UpdateCard'
import Link from 'next/link'
import { Metadata } from 'next'
import HomeStats from '@/components/HomeStats'
import {
  Building2, TrendingUp, Landmark, Scale, Gavel, Globe2, ArrowRight
} from 'lucide-react'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'India\'s Free Corporate Law Intelligence Platform',
  description: 'Free MCA, SEBI, RBI, NCLT, IBC and FEMA regulatory updates for Company Secretaries, corporate lawyers and compliance officers in India. No login required.',
  alternates: { canonical: 'https://www.corplawupdates.in' },
  openGraph: {
    title: 'CorpLawUpdates.in — Free Corporate Law Updates India',
    description: 'Free MCA, SEBI, RBI regulatory updates for CS professionals. Updated daily.',
    url: 'https://www.corplawupdates.in',
    images: [{ url: 'https://www.corplawupdates.in/api/og?title=India%27s+Free+Corporate+Law+Intelligence+Platform&category=', width: 1200, height: 630 }],
  },
}

const categoryMeta = [
  { id: 'MCA',  label: 'MCA',  Icon: Building2, bg: 'from-blue-600 to-blue-700',    ring: 'ring-blue-500/20',    desc: 'Ministry of Corporate Affairs'  },
  { id: 'SEBI', label: 'SEBI', Icon: TrendingUp, bg: 'from-emerald-600 to-emerald-700', ring: 'ring-emerald-500/20', desc: 'Securities & Exchange Board'    },
  { id: 'RBI',  label: 'RBI',  Icon: Landmark,  bg: 'from-violet-600 to-violet-700', ring: 'ring-violet-500/20',  desc: 'Reserve Bank of India'          },
  { id: 'NCLT', label: 'NCLT', Icon: Scale,     bg: 'from-orange-600 to-orange-700', ring: 'ring-orange-500/20',  desc: 'National Company Law Tribunal'  },
  { id: 'IBC',  label: 'IBC',  Icon: Gavel,     bg: 'from-red-600 to-red-700',       ring: 'ring-red-500/20',     desc: 'Insolvency & Bankruptcy Code'   },
  { id: 'FEMA', label: 'FEMA', Icon: Globe2,    bg: 'from-teal-600 to-teal-700',     ring: 'ring-teal-500/20',    desc: 'Foreign Exchange Management'    },
]

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
    supabase.from('updates').select('views'),
  ])

  const featuredUpdates = featuredRes.data || []
  const latestUpdates   = latestRes.data || []
  const updatesCount    = updatesCountRes.count || 0
  const totalViews      = viewsRes.data?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0
  const hasUpdates      = featuredUpdates.length > 0 || latestUpdates.length > 0

  return (
    <div>
      {/* ─── 1. HERO ─── */}
      <section className="w-full bg-navy relative min-h-[64vh] py-20 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:80px_80px]"
          aria-hidden
        />
        {/* Animated gradient orbs */}
        <div
          className="animate-orb-1 absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full opacity-[0.12] blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F59E0B, transparent 70%)' }}
          aria-hidden
        />
        <div
          className="animate-orb-2 absolute -bottom-32 -right-24 w-[360px] h-[360px] rounded-full opacity-[0.10] blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(245,158,11,0.15),transparent_55%)]" aria-hidden />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-gold/80 text-xs md:text-sm font-bold tracking-[0.25em] uppercase mb-5 animate-fade-in">
            MCA · SEBI · RBI · NCLT · IBC · FEMA
          </p>
          <h1 className="font-heading text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] text-balance animate-fade-up">
            India's Free Corporate Law Intelligence Platform
          </h1>
          <p className="text-slate-300/90 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed animate-fade-up" style={{ '--delay': '80ms' } as any}>
            Stay updated on Indian corporate regulations with clear, sourced briefs. Free to read. No account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto animate-fade-up" style={{ '--delay': '160ms' } as any}>
            <Link
              href="/updates"
              className="group bg-gold text-navy font-bold py-3.5 px-8 rounded-xl hover:bg-amber-400 transition-all duration-200 shadow-lg shadow-gold/20 text-center ring-1 ring-white/10 hover:shadow-glow-gold flex items-center justify-center gap-2"
            >
              Browse Updates
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden />
            </Link>
            <Link
              href="/newsletter"
              className="border border-white/30 text-white font-semibold py-3.5 px-8 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-200 text-center backdrop-blur-sm"
            >
              Weekly Newsletter
            </Link>
          </div>

          {/* Stats — client-side count-up island */}
          <div className="mt-14 w-full max-w-xs mx-auto animate-fade-up" style={{ '--delay': '240ms' } as any}>
            <HomeStats updatesCount={updatesCount} totalViews={totalViews} />
          </div>
        </div>
      </section>

      {!hasUpdates && (
        <section className="py-20 text-center px-4">
          <h2 className="text-2xl font-bold text-navy mb-4 font-heading">Updates coming soon</h2>
          <p className="text-slate-500">Check back shortly.</p>
        </section>
      )}

      {/* ─── 2. FEATURED UPDATES ─── */}
      {featuredUpdates.length > 0 && (
        <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2 font-heading border-l-4 border-gold pl-4">
            Featured Updates
          </h2>
          <p className="text-slate-500 mb-8 md:mb-10 pl-5 text-sm md:text-base">
            Hand-picked regulatory highlights worth reading first.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredUpdates.map((update: any, i: number) => (
              <UpdateCard key={update.id} update={update} animationDelay={i * 80} />
            ))}
          </div>
        </section>
      )}

      {/* ─── 3. CATEGORY CARDS ─── */}
      <section className="py-14 px-4 w-full border-y border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-navy mb-2 font-heading text-center">
            Browse by Regulator
          </h2>
          <p className="text-slate-500 text-center text-sm md:text-base mb-10 max-w-xl mx-auto">
            Jump straight to updates from the authority you follow.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categoryMeta.map(({ id, label, Icon, bg, ring, desc }, i) => (
              <Link
                key={id}
                href={`/category/${id.toLowerCase()}`}
                style={{ '--delay': `${i * 50}ms` } as any}
                className={`animate-fade-up group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${bg} text-white shadow-md ${ring} ring-1 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-spring text-center`}
              >
                <Icon className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform duration-200" aria-hidden />
                <span className="font-bold text-base">{label}</span>
                <span className="text-[10px] text-white/70 leading-tight hidden sm:block">{desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. LATEST UPDATES ─── */}
      {latestUpdates.length > 0 && (
        <section className="py-16 md:py-20 px-4 max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2 font-heading border-l-4 border-gold pl-4">
            Latest Updates
          </h2>
          <p className="text-slate-500 mb-8 md:mb-10 pl-5 text-sm md:text-base">
            New and recent briefs, newest first.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10">
            {latestUpdates.map((update: any, i: number) => (
              <UpdateCard key={update.id} update={update} animationDelay={i * 60} />
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/updates"
              className="inline-flex items-center gap-2 text-navy font-semibold hover:text-amber-700 transition-colors text-base md:text-lg group"
            >
              View all updates
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      {/* ─── 5. NEWSLETTER ─── */}
      <section className="w-full bg-navy py-16 md:py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(245,158,11,0.10),transparent_50%)]" aria-hidden />
        {/* Decorative envelope SVG */}
        <div className="absolute left-8 bottom-8 opacity-5 pointer-events-none hidden lg:block" aria-hidden>
          <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
            <rect x="2" y="2" width="116" height="86" rx="6" stroke="white" strokeWidth="4"/>
            <path d="M2 20L60 54L118 20" stroke="white" strokeWidth="4"/>
          </svg>
        </div>
        <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
          <div className="text-3xl mb-3" aria-hidden>📬</div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
            Weekly Corporate Law Digest
          </h2>
          <p className="text-slate-300/90 mb-8 max-w-xl mx-auto leading-relaxed">
            One email on Mondays: MCA, SEBI, RBI, NCLT, IBC and FEMA. No spam. Unsubscribe anytime.
          </p>
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 bg-gold text-navy font-bold py-3.5 px-8 rounded-xl hover:bg-amber-400 transition-all hover:shadow-glow-gold"
          >
            Subscribe free
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  )
}
