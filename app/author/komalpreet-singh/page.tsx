import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import { supabase } from '@/lib/supabase'
import { UPDATE_LIST_COLUMNS } from '@/lib/supabase-queries'
import { UpdateListItem } from '@/types'
import UpdateCard from '@/components/UpdateCard'
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  Mail,
  MapPin,
  BookOpen,
  FileCheck,
  Building2,
  TrendingUp,
  Landmark,
  Globe2,
  FileText,
  ExternalLink,
} from 'lucide-react'

export const revalidate = 3600 // 1 hour

export const metadata: Metadata = {
  title: 'Komalpreet Singh – Founder & Independent Author | CorpLawUpdates.in',
  description:
    'Author profile & research dossier for Komalpreet Singh, Founder and Independent Author at CorpLawUpdates.in. Specializing in MCA, SEBI, RBI, FEMA, and IBC corporate jurisprudence.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/author/komalpreet-singh',
  },
  openGraph: {
    title: 'Komalpreet Singh – Founder & Independent Author | CorpLawUpdates.in',
    description:
      'Author profile & research dossier for Komalpreet Singh. Specializing in Indian corporate jurisprudence, Companies Act 2013, SEBI circulars, and RBI master directions.',
    url: 'https://www.corplawupdates.in/author/komalpreet-singh',
    type: 'profile',
    siteName: 'CorpLawUpdates.in',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Komalpreet Singh – Founder & Independent Author',
    description:
      'Author profile & research dossier for Komalpreet Singh at CorpLawUpdates.in. Tracking MCA, SEBI, RBI, FEMA, and IBC regulations.',
  },
}

export default async function AuthorProfilePage() {
  let updatesList: UpdateListItem[] = []
  try {
    const { data: recentUpdates } = await supabase
      .from('updates')
      .select(UPDATE_LIST_COLUMNS)
      .eq('hide_from_listings', false)
      .not('published_at', 'is', null)
      .eq('is_sponsored', false)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(8)
    if (recentUpdates) {
      updatesList = recentUpdates as unknown as UpdateListItem[]
    }
  } catch (err) {
    console.error('Failed to fetch recent updates for author profile:', err)
  }

  const authorJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://www.corplawupdates.in/author/komalpreet-singh#person',
    name: 'Komalpreet Singh',
    givenName: 'Komalpreet',
    familyName: 'Singh',
    jobTitle: 'Founder & Independent Author',
    description:
      'Independent author and legal researcher specializing in Indian corporate jurisprudence, Companies Act 2013, SEBI capital market regulations, RBI master directions, FEMA, and IBC restructuring.',
    url: 'https://www.corplawupdates.in/author/komalpreet-singh',
    email: 'mailto:legal@corplawupdates.in',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lucknow',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'CorpLawUpdates.in',
      url: 'https://www.corplawupdates.in',
    },
    knowsAbout: [
      'Companies Act 2013',
      'MCA21 V3 Compliance',
      'SEBI (LODR) Regulations',
      'SEBI Prohibition of Insider Trading (PIT)',
      'RBI Master Directions',
      'Foreign Exchange Management Act (FEMA)',
      'Insolvency and Bankruptcy Code (IBC 2016)',
      'ICSI Secretarial Standards (SS-1 and SS-2)',
    ],
    sameAs: [
      'https://www.linkedin.com/company/corplawupdates/',
      'https://x.com/CorpLawUpdates',
      'https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A',
      'https://t.me/corplawupdate',
    ],
  }

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.corplawupdates.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Editorial Policy',
        item: 'https://www.corplawupdates.in/editorial-policy',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Komalpreet Singh',
        item: 'https://www.corplawupdates.in/author/komalpreet-singh',
      },
    ],
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-16">
      <JsonLd data={authorJsonLd as any} />
      <JsonLd data={breadcrumbsJsonLd as any} />

      {/* Breadcrumb Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-600 transition-colors font-medium">
              Home
            </Link>
            <span>/</span>
            <Link href="/editorial-policy" className="hover:text-amber-600 transition-colors font-medium">
              Editorial Policy
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-200 font-semibold">Komalpreet Singh</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-10">
        {/* Main Author Hero Card */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            {/* Avatar badge */}
            <div className="size-24 sm:size-28 rounded-3xl bg-gradient-to-br from-navy via-slate-850 to-slate-900 dark:from-amber-500 dark:to-amber-600 text-white dark:text-slate-950 flex items-center justify-center font-heading font-extrabold text-3xl sm:text-4xl shadow-xl ring-8 ring-amber-500/10 dark:ring-amber-400/20 shrink-0">
              KS
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy dark:text-white tracking-tight">
                    Komalpreet Singh
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Verified Author &amp; Researcher
                  </span>
                </div>
                <p className="text-base sm:text-lg text-amber-700 dark:text-amber-400 font-medium">
                  Founder &amp; Independent Author
                </p>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-slate-400" />
                    Regulatory Desk: Lucknow, Uttar Pradesh, India
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5 text-slate-400" />
                    <a href="mailto:legal@corplawupdates.in" className="hover:text-amber-600 underline">
                      legal@corplawupdates.in
                    </a>
                  </span>
                </div>
              </div>

              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                Komalpreet Singh is the Founder and Independent Author at CorpLawUpdates.in. He operates the
                statutory research desk, tracking official government gazettes, tribunal orders, and regulator circulars
                across the Ministry of Corporate Affairs (MCA), Securities and Exchange Board of India (SEBI), Reserve
                Bank of India (RBI), Insolvency and Bankruptcy Board of India (IBBI), and the Foreign Exchange Management
                Act (FEMA).
              </p>

              {/* Research Specialties Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  '🏛️ MCA & Companies Act 2013',
                  '📈 SEBI LODR & PIT Regulations',
                  '🏦 RBI Master Directions',
                  '🌐 FEMA Cross-Border Directives',
                  '⚖️ IBC & CIRP Timelines',
                  '📜 Secretarial Standards (SS-1/SS-2)',
                ].map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href="mailto:legal@corplawupdates.in?subject=Editorial%20Inquiry%20%2F%20Regulatory%20Research"
                  className="inline-flex items-center gap-2 rounded-xl bg-navy dark:bg-amber-500 px-4 py-2.5 text-xs font-bold text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors shadow-sm"
                >
                  <Mail className="size-3.5" />
                  Contact Desk
                </a>
                <Link
                  href="/editorial-policy"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <ShieldCheck className="size-3.5 text-amber-500" />
                  Editorial Standards &amp; Verification
                </Link>
                <a
                  href="https://www.linkedin.com/company/corplawupdates/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="size-3" />
                </a>
                <a
                  href="https://x.com/CorpLawUpdates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                >
                  <span>X (Twitter)</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* E-E-A-T Pillars Grid: Methodology & Responsibilities */}
        <section className="mb-14 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white">
              Editorial Responsibilities &amp; Research Standards
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              How our regulatory intelligence desk sources, evaluates, and verifies compliance changes for Indian professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileCheck className="size-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Primary Source Authenticity</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero reliance on secondary press commentary. Every article is grounded directly in official Gazette of
                India entries, regulator circulars, and certified NCLT/NCLAT bench orders.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Scale className="size-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Statutory Rule Cross-Checking</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Operative provisions, compliance action triggers, and penalty schedules are independently verified
                against the parent Act (e.g. Companies Act 2013, SEBI Act 1992, IBC 2016).
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 space-y-3 shadow-xs">
              <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Corrigenda &amp; Amendment Tracking</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Continuous monitoring of subsequent ministry clarifications, date extensions, and errata slips to
                ensure published guidance remains legally dependable.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Areas of Coverage */}
        <section className="mb-14">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
            <h2 className="text-2xl font-heading font-bold text-navy dark:text-white">
              Subject-Matter Research Focus
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Key statutory domains researched and curated by Komalpreet Singh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl flex gap-4">
              <Building2 className="size-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  Ministry of Corporate Affairs (MCA) &amp; RoC
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Companies Act 2013 governance, MCA21 V3 e-forms (AOC-4, MGT-7, DIR-3 KYC, PAS-3, SH-7), Section 446B
                  small company relief, and adjudication order trends.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl flex gap-4">
              <TrendingUp className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  SEBI &amp; Capital Market Regulations
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  SEBI (Listing Obligations and Disclosure Requirements) 2015, Prohibition of Insider Trading (PIT),
                  takeover regulations, and stock exchange compliance circulars.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl flex gap-4">
              <Landmark className="size-6 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  Reserve Bank of India (RBI)
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Master Directions for NBFCs, prudential frameworks, digital lending norms, payment aggregators, and
                  Monetary Policy Committee (MPC) repo rate decisions.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl flex gap-4">
              <Globe2 className="size-6 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  FEMA, FDI &amp; Cross-Border
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Foreign Direct Investment (FDI) reporting (FIRMS / FC-GPR), Overseas Direct Investment (ODI) rules,
                  External Commercial Borrowings (ECB), and DGFT trade policies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Regulatory Updates Authored */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-2xl font-heading font-bold text-navy dark:text-white">
                Recent Regulatory Updates Authored
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Latest statutory analyses and circular briefs authored and fact-checked by Komalpreet Singh.
              </p>
            </div>
            <Link
              href="/updates"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
            >
              Browse All Updates &rarr;
            </Link>
          </div>

          {updatesList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {updatesList.map((item, idx) => (
                <UpdateCard key={item.id} update={item} showExcerpt={false} animationDelay={idx * 50} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic py-4">No recent updates loaded.</p>
          )}
        </section>

        {/* Institutional Contact Strip */}
        <div className="mt-14 rounded-2xl bg-navy text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-heading font-bold">Have a Regulatory Question or Correction?</h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Our research desk welcomes factual feedback, corrigenda notifications, or statutory queries from Company
              Secretaries, CAs, and compliance practitioners.
            </p>
          </div>
          <a
            href="mailto:legal@corplawupdates.in"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 font-bold text-sm transition-all shrink-0 shadow-sm"
          >
            <Mail className="size-4" />
            Email Editorial Desk
          </a>
        </div>
      </div>
    </div>
  )
}
