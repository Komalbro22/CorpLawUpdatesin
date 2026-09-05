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
  ArrowRight,
} from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import HubExploreLinks from '@/components/HubExploreLinks'

export const revalidate = 43200

export const metadata: Metadata = {
  title: 'Browse Regulatory Updates by Authority',
  description:
    'Browse corporate law updates by regulator — MCA, SEBI, RBI, NCLT, IBC, FEMA, CCI and Labour Law. Daily circulars and notifications for CS, CA and compliance professionals.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/category',
  },
  openGraph: {
    title: 'Browse Regulatory Updates by Authority | CorpLawUpdates.in',
    description:
      'Browse MCA, SEBI, RBI, NCLT, IBC, FEMA, CCI and Labour Law updates — daily circulars for Indian compliance professionals.',
    url: 'https://www.corplawupdates.in/category',
    type: 'website',
    siteName: 'CorpLawUpdates.in',
  },
}

const categories = [
  {
    slug: 'mca',
    label: 'MCA',
    Icon: Building2,
    fullName: 'Ministry of Corporate Affairs',
    description: 'Companies Act circulars, ROC filings, incorporation and governance updates.',
    bg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/70 dark:border-blue-800/40 hover:bg-blue-100/60 dark:hover:bg-blue-900/40',
  },
  {
    slug: 'sebi',
    label: 'SEBI',
    Icon: TrendingUp,
    fullName: 'Securities and Exchange Board of India',
    description: 'LODR, ICDR, capital markets and investor protection notifications.',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40',
  },
  {
    slug: 'rbi',
    label: 'RBI',
    Icon: Landmark,
    fullName: 'Reserve Bank of India',
    description: 'Master directions, banking regulation and monetary policy circulars.',
    bg: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200/70 dark:border-purple-800/40 hover:bg-purple-100/60 dark:hover:bg-purple-900/40',
  },
  {
    slug: 'nclt',
    label: 'NCLT',
    Icon: Scale,
    fullName: 'National Company Law Tribunal',
    description: 'Company petition orders, mergers, acquisitions and tribunal judgments.',
    bg: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200/70 dark:border-orange-800/40 hover:bg-orange-100/60 dark:hover:bg-orange-900/40',
  },
  {
    slug: 'ibc',
    label: 'IBC',
    Icon: Gavel,
    fullName: 'Insolvency and Bankruptcy Code',
    description: 'IBBI regulations, CIRP processes and insolvency resolution updates.',
    bg: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200/70 dark:border-red-800/40 hover:bg-red-100/60 dark:hover:bg-red-900/40',
  },
  {
    slug: 'fema',
    label: 'FEMA',
    Icon: Globe2,
    fullName: 'Foreign Exchange Management Act',
    description: 'FDI, ODI, ECB and cross-border transaction compliance updates.',
    bg: 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-200/70 dark:border-teal-800/40 hover:bg-teal-100/60 dark:hover:bg-teal-900/40',
  },
  {
    slug: 'cci',
    label: 'CCI',
    Icon: ShieldCheck,
    fullName: 'Competition Commission of India',
    description: 'Merger control, anti-trust orders and combination regulation updates.',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/40 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40',
  },
  {
    slug: 'labour',
    label: 'Labour Law',
    Icon: Users,
    fullName: 'Ministry of Labour & Employment',
    description: 'Labour Codes, EPF ECR, ESIC compliance and employment notifications.',
    bg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/40 hover:bg-amber-100/60 dark:hover:bg-amber-900/40',
  },
]

export default function CategoryIndexPage() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
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
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-navy dark:text-slate-200 font-medium">Categories</span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-navy dark:text-white mb-3">
            Browse by Regulator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Track corporate law updates from India&apos;s primary regulatory authorities — MCA, SEBI, RBI, NCLT, IBC, FEMA, CCI and Labour Law.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {categories.map(({ slug, label, Icon, fullName, description, bg }) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className={`group flex flex-col gap-3 rounded-xl p-5 shadow-sm transition-[transform,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${bg}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="size-5 opacity-90" aria-hidden="true" />
                <span className="font-bold text-base">{label}</span>
              </div>
              <p className="text-xs font-medium opacity-80 leading-snug">{fullName}</p>
              <p className="text-xs opacity-70 leading-relaxed flex-grow">{description}</p>
              <span className="inline-flex items-center gap-1 text-xs font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                View updates
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        <HubExploreLinks className="mt-10" />
      </div>
    </div>
  )
}
