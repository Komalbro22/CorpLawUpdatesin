import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Building2,
  TrendingUp,
  Landmark,
  Scale,
  Gavel,
  Globe2,
  ShieldCheck,
  Users,
  Coins,
  ArrowRight,
} from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import HubExploreLinks from '@/components/HubExploreLinks'
import { supabase } from '@/lib/supabase'

export const revalidate = 43200

export const metadata: Metadata = {
  title: 'Browse Regulatory Updates by Authority | MCA, SEBI, RBI & More',
  description:
    'Browse corporate law updates by regulator — MCA, SEBI, RBI, IFSCA (GIFT City), NCLT, IBC, FEMA, CCI and Labour Law. Daily circulars, master directions and compliance briefs for CS, CA and legal teams.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/category',
  },
  openGraph: {
    title: 'Browse Regulatory Updates by Authority | CorpLawUpdates.in',
    description:
      'Browse MCA, SEBI, RBI, IFSCA (GIFT City), NCLT, IBC, FEMA, CCI and Labour Law updates — daily circulars for Indian compliance professionals.',
    url: 'https://www.corplawupdates.in/category',
    type: 'website',
    siteName: 'CorpLawUpdates.in',
  },
}

const categories = [
  {
    slug: 'mca',
    label: 'MCA',
    categoryKey: 'MCA',
    Icon: Building2,
    fullName: 'Ministry of Corporate Affairs',
    description: 'Companies Act circulars, ROC V3 filing notifications, incorporation rules, and corporate governance updates.',
    accent: 'bg-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    borderHover: 'hover:border-blue-400/80 dark:hover:border-blue-500/60',
    tags: ['Companies Act 2013', 'ROC V3 Filings', 'LLP Rules', 'DIN & KYC'],
  },
  {
    slug: 'sebi',
    label: 'SEBI',
    categoryKey: 'SEBI',
    Icon: TrendingUp,
    fullName: 'Securities and Exchange Board of India',
    description: 'Listing obligations (LODR), ICDR amendments, mutual funds, insider trading regulations, and capital market master circulars.',
    accent: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderHover: 'hover:border-emerald-400/80 dark:hover:border-emerald-500/60',
    tags: ['LODR Regulations', 'ICDR Amendments', 'AIF & PMS', 'Insider Trading'],
  },
  {
    slug: 'rbi',
    label: 'RBI',
    categoryKey: 'RBI',
    Icon: Landmark,
    fullName: 'Reserve Bank of India',
    description: 'Master Directions, banking regulation, NBFC scale-based compliance, repo rates, and monetary policy guidelines.',
    accent: 'bg-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    borderHover: 'hover:border-purple-400/80 dark:hover:border-purple-500/60',
    tags: ['Master Directions', 'NBFC Scale-Based', 'Banking Rules', 'Digital Lending'],
  },
  {
    slug: 'ibc',
    label: 'IBC',
    categoryKey: 'IBC',
    Icon: Gavel,
    fullName: 'Insolvency and Bankruptcy Board of India',
    description: 'IBBI regulations, CIRP timeline directives, liquidation processes, and information utilities standards.',
    accent: 'bg-rose-500',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    borderHover: 'hover:border-rose-400/80 dark:hover:border-rose-500/60',
    tags: ['IBBI Regulations', 'CIRP Timelines', 'Liquidation Rules', 'Resolution Plans'],
  },
  {
    slug: 'fema',
    label: 'FEMA',
    categoryKey: 'FEMA',
    Icon: Globe2,
    fullName: 'Foreign Exchange Management Act',
    description: 'Foreign Direct Investment (FDI), Overseas Direct Investment (ODI), External Commercial Borrowings (ECB), and FLA returns.',
    accent: 'bg-teal-500',
    badgeBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    borderHover: 'hover:border-teal-400/80 dark:hover:border-teal-500/60',
    tags: ['FDI Regulations', 'Overseas Investment', 'ECB Guidelines', 'FLA Returns'],
  },
  {
    slug: 'ifsca',
    label: 'IFSCA (GIFT City)',
    categoryKey: 'IFSCA',
    Icon: Coins,
    fullName: 'International Financial Services Centres Authority',
    description: 'GIFT City regulatory framework, Fund Management Entities (FMEs), International Banking Units (IBUs), and aircraft leasing.',
    accent: 'bg-cyan-500',
    badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    borderHover: 'hover:border-cyan-400/80 dark:hover:border-cyan-500/60',
    tags: ['GIFT City Hub', 'Fund Management (FME)', 'Banking Units (IBUs)', 'Bullion Exchange'],
  },
  {
    slug: 'cci',
    label: 'CCI',
    categoryKey: 'CCI',
    Icon: ShieldCheck,
    fullName: 'Competition Commission of India',
    description: 'Merger control, combination regulations, antitrust inquiries, cartel investigations, and Section 43A penalties.',
    accent: 'bg-indigo-500',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    borderHover: 'hover:border-indigo-400/80 dark:hover:border-indigo-500/60',
    tags: ['Merger Control', 'Combinations', 'Antitrust Inquiries', 'Deal Value Threshold'],
  },
  {
    slug: 'nclt',
    label: 'NCLT',
    categoryKey: 'NCLT',
    Icon: Scale,
    fullName: 'National Company Law Tribunal',
    description: 'Tribunal orders on company petitions, mergers & amalgamations, insolvency admissions, and director disputes.',
    accent: 'bg-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderHover: 'hover:border-amber-400/80 dark:hover:border-amber-500/60',
    tags: ['Company Petitions', 'Mergers & Demergers', 'Section 241/242', 'Tribunal Judgments'],
  },
  {
    slug: 'labour',
    label: 'Labour Law',
    categoryKey: 'LABOUR',
    Icon: Users,
    fullName: 'Ministry of Labour & Employment',
    description: 'The 4 Labour Codes, EPF monthly ECR return updates, ESIC employer compliances, and POSH statutory guidelines.',
    accent: 'bg-slate-600',
    badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    borderHover: 'hover:border-slate-400/80 dark:hover:border-slate-500/60',
    tags: ['Labour Codes', 'EPF / ECR Returns', 'ESIC Compliance', 'Factory & Wage Rules'],
  },
]

export default async function CategoryIndexPage() {
  const countsRes = await supabase.rpc('get_published_category_counts')
  const countsMap: Record<string, number> = {}
  if (Array.isArray(countsRes?.data)) {
    countsRes.data.forEach((item: any) => {
      if (item.category) countsMap[item.category.toUpperCase()] = Number(item.count) || 0
    })
  }

  return (
    <div className="min-h-dvh bg-slate-50/70 dark:bg-slate-950">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
            { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://www.corplawupdates.in/category' },
          ],
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <nav className="mb-6 text-sm text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Home
          </Link>
          <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
          <span className="text-navy dark:text-slate-200 font-medium">Categories</span>
        </nav>

        <header className="mb-12 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-500 mb-2">
            Institutional Directory
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-navy dark:text-white tracking-tight mb-4 text-balance">
            Browse by Regulator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed text-pretty">
            Comprehensive statutory tracking across India&apos;s primary corporate and financial authorities. Select any regulator below to view consolidated circulars, master directions, and procedural guidance.
          </p>
        </header>

        {/* 3x3 Perfectly Symmetrical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(({ slug, label, categoryKey, Icon, fullName, description, accent, badgeBg, borderHover, tags }) => {
            const count = countsMap[categoryKey] ?? 0
            return (
              <Link
                key={slug}
                href={`/category/${slug}`}
                className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:shadow-xl dark:hover:shadow-slate-950/60 ${borderHover} transition-[transform,box-shadow,border-color] duration-200 motion-safe:hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 overflow-hidden`}
              >
                {/* Top Subtle Brand Accent Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${accent} opacity-80 group-hover:opacity-100 transition-opacity`} />

                <div>
                  {/* Top Bar: Icon Badge + Count Pill */}
                  <div className="flex items-center justify-between gap-3">
                    <div className={`size-12 rounded-xl flex items-center justify-center border ${badgeBg} transition-transform duration-200 group-hover:scale-105 shadow-2xs`}>
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    {count > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tabular-nums bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {count} Updates
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        Active Hub
                      </span>
                    )}
                  </div>

                  {/* Regulator Titles */}
                  <div className="mt-4">
                    <h2 className="text-xl font-heading font-extrabold text-navy dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {label}
                    </h2>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                      {fullName}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
                    {description}
                  </p>

                  {/* Focus Chips */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-navy dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <span>Explore {label} Updates</span>
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1.5" aria-hidden="true" />
                </div>
              </Link>
            )
          })}
        </div>

        <HubExploreLinks className="mt-12" />
      </div>
    </div>
  )
}
