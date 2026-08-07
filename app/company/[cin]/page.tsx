import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOrFetchCompany } from '@/lib/company-sync'
import { calculateCompanyComplianceFlags } from '@/lib/company-compliance'
import { decodeCIN } from '@/lib/cin-decoder'
import CompanyStatusBadge from '@/components/CompanyStatusBadge'
import ComplianceFlagCard from '@/components/ComplianceFlagCard'
import DirectorsTable from '@/components/DirectorsTable'
import ChargesTable from '@/components/ChargesTable'
import { supabase } from '@/lib/supabase'
import { Building2, Landmark, Sparkles, FileText, HelpCircle, ShieldCheck, Lock, Binary, MapPin, Calendar, Briefcase, Award } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

type Props = {
  params: Promise<{ cin: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cin } = await params
  const company = await getOrFetchCompany(cin)

  if (!company) {
    return { title: 'Company Not Found | CorpLawUpdates.in' }
  }

  const title = `${company.company_name} (CIN: ${company.cin}) — Compliance Status & Details | CorpLawUpdates`
  const paidUpCr = company.paid_up_capital ? (company.paid_up_capital / 10000000).toFixed(2) : '0'
  const description = `${company.company_name} (CIN: ${company.cin}) is an ${company.company_status || 'Active'} ${company.company_class || ''} company registered in ${company.registered_state || 'India'} with paid-up capital of ₹${paidUpCr} Cr. View directors list, bank charges, AGM due date, and compliance risk flags.`

  const canonicalUrl = `https://www.corplawupdates.in/company/${company.cin}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CompanyProfilePage({ params }: Props) {
  const { cin } = await params
  const company = await getOrFetchCompany(cin)

  if (!company) {
    notFound()
  }

  const flags = calculateCompanyComplianceFlags(company)
  const cinDecoded = decodeCIN(company.cin)

  // Fetch related compliance articles
  let relatedArticles: { title: string; slug: string; published_at: string }[] = []
  if (supabase) {
    const searchWord = company.company_name.split(' ')[0] || 'MCA'
    const { data } = await supabase
      .from('updates')
      .select('title, slug, published_at')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .or(`title.ilike.%${searchWord}%,summary.ilike.%${searchWord}%`)
      .order('published_at', { ascending: false })
      .limit(3)

    if (data) relatedArticles = data
  }

  const paidUpCr = company.paid_up_capital ? (company.paid_up_capital / 10000000).toFixed(2) : '0'
  const authCapCr = company.authorised_capital ? (company.authorised_capital / 10000000).toFixed(2) : '0'
  const incDate = company.date_of_registration ? new Date(company.date_of_registration).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'
  const currentYear = new Date().getFullYear()

  const cinUpper = (company.cin || '').toUpperCase()
  const isPublicCompany = cinUpper.startsWith('L') || cinUpper.includes('PLC') || (company.company_class || '').toLowerCase() === 'public'
  const paidUpVal = company.paid_up_capital || 0
  const isSmallCompanyEligible = !isPublicCompany && paidUpVal <= 40000000

  const directorNames = (company.directors || []).map(d => d.name).slice(0, 3).join(', ')
  const openChargesCount = (company.charges || []).filter(c => c.status === 'OPEN').length

  // AI-SEO / GEO 2-sentence dense summary
  const geoSummary = `${company.company_name} (CIN: ${company.cin}) is a ${company.company_status || 'Active'} ${company.company_class || 'Private'} company incorporated on ${incDate} in ${company.registered_state || 'India'}, with a paid-up capital of ₹${paidUpCr} crore. Board leadership includes ${directorNames || 'active directors'} with ${openChargesCount} registered bank charge(s). Next AGM for FY${currentYear} is due by 30th September ${currentYear} under Section 96 of Companies Act, 2013.`

  // Auto-generated FAQs
  const autoFaqs = [
    {
      q: `What is the CIN and registration status of ${company.company_name}?`,
      a: `${company.company_name} holds Corporate Identification Number (CIN) ${company.cin}. According to MCA records, its current statutory registration status is ${company.company_status || 'Active'}.`
    },
    {
      q: `Who are the key directors of ${company.company_name}?`,
      a: `${company.company_name} is managed by ${company.directors?.length || 2} active directors including ${directorNames || 'registered directors'} with MCA active DIN status.`
    },
    {
      q: `Does ${company.company_name} have any registered bank loans or mortgages?`,
      a: `${company.company_name} has ${openChargesCount} active open secured bank charge(s) registered under Form CHG-1 with MCA.`
    },
    {
      q: `What do the characters in CIN ${company.cin} mean?`,
      a: cinDecoded
        ? `The first letter (${cinDecoded.listingStatus.code}) indicates that the company is ${cinDecoded.listingStatus.label}. The next 5 digits (${cinDecoded.nicCode.code}) represent its primary industry NIC code (${cinDecoded.nicCode.industry}). The 2 letters (${cinDecoded.state.code}) represent the registered state (${cinDecoded.state.name}), followed by incorporation year (${cinDecoded.incorporationYear}), ownership type (${cinDecoded.companyType.code} - ${cinDecoded.companyType.label}), and 6-digit registration serial number (${cinDecoded.registrationNumber}).`
        : `CIN ${company.cin} is a 21-character alphanumeric identifier issued by MCA.`
    },
    {
      q: `When was ${company.company_name} incorporated?`,
      a: `${company.company_name} was incorporated on ${incDate} under the jurisdiction of Registrar of Companies (${company.roc_office || 'RoC'}, ${company.registered_state || 'India'}).`
    },
    {
      q: `Is ${company.company_name} eligible for Small Company status under Section 2(85)?`,
      a: isPublicCompany
        ? `No. Under Section 2(85) of the Companies Act 2013, Public Limited Companies are strictly excluded from Small Company status regardless of capital or turnover.`
        : isSmallCompanyEligible
          ? `Yes, ${company.company_name} is a Private Limited Company with paid-up capital (₹${paidUpCr} Cr ≤ ₹4.00 Cr) within the Small Company threshold.`
          : `No. ${company.company_name} exceeds the Small Company paid-up capital cap of ₹4.00 Crore.`
    }
  ]

  const pageUrl = `https://www.corplawupdates.in/company/${company.cin}`

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${company.company_name} — CIN & Compliance Details`,
        description: geoSummary,
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
        mainEntity: { '@id': `${pageUrl}#organization` }
      },
      {
        '@type': 'Organization',
        '@id': `${pageUrl}#organization`,
        legalName: company.company_name,
        identifier: {
          '@type': 'PropertyValue',
          name: 'CIN',
          value: company.cin
        },
        foundingDate: company.date_of_registration || undefined,
        address: company.registered_address ? {
          '@type': 'PostalAddress',
          streetAddress: company.registered_address,
          addressRegion: company.registered_state || undefined,
          addressCountry: 'IN'
        } : undefined,
        employee: (company.directors || []).map(d => ({
          '@type': 'Person',
          name: d.name,
          jobTitle: d.designation,
          identifier: d.din
        })),
        additionalType: company.company_class || undefined,
        url: pageUrl
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
          { '@type': 'ListItem', position: 2, name: 'Company Search', item: 'https://www.corplawupdates.in/company-search' },
          { '@type': 'ListItem', position: 3, name: company.registered_state || 'India', item: 'https://www.corplawupdates.in/company-search' },
          { '@type': 'ListItem', position: 4, name: company.company_name, item: pageUrl }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: autoFaqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a
          }
        }))
      }
    ]
  }

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">

        {/* 1. Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/company-search" className="hover:text-gold transition-colors">Company Search</Link>
          <span>/</span>
          <span className="text-slate-400">{company.registered_state || 'India'}</span>
          <span>/</span>
          <span className="text-navy dark:text-white font-bold truncate max-w-xs">{company.company_name}</span>
        </nav>

        {/* 2. Company Header Banner */}
        <header className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <CompanyStatusBadge status={company.company_status} size="lg" />
              {company.is_manually_corrected && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5" /> Manually Verified
                </span>
              )}
            </div>
            {/* PDF Export Trigger */}
            <form action={`/api/company/${company.cin}/pdf`} method="POST" target="_blank">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-navy hover:bg-slate-800 text-white dark:bg-amber-400 dark:hover:bg-amber-500 dark:text-navy font-bold px-4 py-2 rounded-xl text-xs md:text-sm transition-all shadow-sm active:scale-95"
              >
                <FileText className="w-4 h-4" /> Download PDF Report
              </button>
            </form>
          </div>

          <h1 className="text-2xl md:text-4xl font-heading font-bold text-navy dark:text-white mb-2 leading-snug">
            {company.company_name}
          </h1>

          <p className="text-xs md:text-sm font-mono text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
            <span>CIN: <strong className="text-slate-700 dark:text-slate-200">{company.cin}</strong></span>
            <span>•</span>
            <span>ROC: <strong className="text-slate-700 dark:text-slate-200">{company.roc_office || 'N/A'}</strong></span>
            <span>•</span>
            <span>Incorporated: <strong className="text-slate-700 dark:text-slate-200">{incDate}</strong></span>
          </p>
        </header>

        {/* 3. Quick Answer Box (AI-SEO GEO Summary) */}
        <section className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent rounded-2xl p-5 md:p-6 border border-amber-300/40 dark:border-amber-500/20 shadow-sm relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              Quick AI Summary & Practitioner Overview
            </h2>
          </div>
          <p className="text-sm md:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {geoSummary}
          </p>
        </section>

        {/* 4. CIN Structure Decoder Section */}
        {cinDecoded && (
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Binary className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-navy dark:text-white font-heading">
                CIN Decoder & Structure Breakdown
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              Decoded breakdown of Corporate Identification Number <strong>{company.cin}</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {/* 1. Listing Status */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                  <Award className="w-4 h-4" /> 1. Listing Status ({cinDecoded.listingStatus.code})
                </div>
                <div className="font-bold text-sm text-navy dark:text-white mb-1">{cinDecoded.listingStatus.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{cinDecoded.listingStatus.description}</div>
              </div>

              {/* 2. NIC Industry Code */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  <Briefcase className="w-4 h-4" /> 2. NIC Code ({cinDecoded.nicCode.code})
                </div>
                <div className="font-bold text-sm text-navy dark:text-white mb-1">Industrial Activity</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{cinDecoded.nicCode.industry}</div>
              </div>

              {/* 3. State & RoC */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                  <MapPin className="w-4 h-4" /> 3. State ({cinDecoded.state.code})
                </div>
                <div className="font-bold text-sm text-navy dark:text-white mb-1">{cinDecoded.state.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Jurisdiction: {cinDecoded.state.rocOffice}</div>
              </div>

              {/* 4. Incorporation Year */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                  <Calendar className="w-4 h-4" /> 4. Year ({cinDecoded.incorporationYear})
                </div>
                <div className="font-bold text-sm text-navy dark:text-white mb-1">Incorporated {cinDecoded.incorporationYear}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Year of registration under MCA.</div>
              </div>

              {/* 5. Company Class / Type */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  <Building2 className="w-4 h-4" /> 5. Ownership ({cinDecoded.companyType.code})
                </div>
                <div className="font-bold text-sm text-navy dark:text-white mb-1">{cinDecoded.companyType.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{cinDecoded.companyType.description}</div>
              </div>

              {/* 6. Registration Serial No */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                  <ShieldCheck className="w-4 h-4" /> 6. Serial No ({cinDecoded.registrationNumber})
                </div>
                <div className="font-bold text-sm text-navy dark:text-white mb-1">RoC Serial Number</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Unique 6-digit registration serial code.</div>
              </div>
            </div>
          </section>
        )}

        {/* 5 & 6. Registered Details & Capital Structure Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Registered Details Card */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-navy dark:text-white font-heading mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" /> Registered Details
            </h2>

            <dl className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs md:text-sm">
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Registration Date</dt>
                <dd className="font-semibold text-navy dark:text-slate-200">{incDate}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Company Class</dt>
                <dd className="font-semibold text-navy dark:text-slate-200">{company.company_class || 'Private'}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Category</dt>
                <dd className="font-semibold text-navy dark:text-slate-200 text-right">{company.company_category || 'Company limited by shares'}</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">State & ROC</dt>
                <dd className="font-semibold text-navy dark:text-slate-200">{company.registered_state} ({company.roc_office})</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Registered Address</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-xs truncate" title={company.registered_address || ''}>
                  {company.registered_address || 'Registered with RoC'}
                </dd>
              </div>
            </dl>
          </section>

          {/* Capital Structure Card */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-navy dark:text-white font-heading mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-500" /> Capital Structure
            </h2>

            <dl className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs md:text-sm">
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Authorised Capital</dt>
                <dd className="font-bold text-navy dark:text-white">₹{authCapCr} Crore</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Paid-Up Capital</dt>
                <dd className="font-bold text-emerald-600 dark:text-emerald-400">₹{paidUpCr} Crore</dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400 font-medium">Small Company Eligibility</dt>
                <dd className="font-semibold text-navy dark:text-slate-200">
                  {isPublicCompany ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">❌ Ineligible (Public Company)</span>
                  ) : isSmallCompanyEligible ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✅ Meets Capital Cap</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">ℹ️ Exceeds Capital Cap</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

        </div>

        {/* 7. Board of Directors Table Component */}
        <DirectorsTable directors={company.directors || []} companyName={company.company_name} />

        {/* 8. Secured Bank Charges Table Component */}
        <ChargesTable charges={company.charges || []} companyName={company.company_name} />

        {/* 9. Compliance Snapshot Section */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Differentiator Feature
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-navy dark:text-white font-heading">
              Phase 1 Compliance Snapshot & Statutory Flags
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated statutory compliance evaluation based on MCA public master records.
            </p>
          </div>

          <div className="space-y-4">
            {flags.map((flag) => (
              <ComplianceFlagCard key={flag.rule_id} flag={flag} />
            ))}
          </div>

          {/* Turnover Placeholder Toggle */}
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300">
                Is Turnover above ₹50 Crore? (CARO, Secretarial Audit & XBRL Flags)
              </span>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-300/60">
              Phase 2 — Coming Soon
            </span>
          </div>
        </section>

        {/* 10. Data Freshness Disclaimer */}
        <div className="text-center py-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
          Disclaimer: Based on last available MCA public record as of {company.last_synced_at ? new Date(company.last_synced_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'recent sync'}. Not a substitute for professional legal verification.
        </div>

        {/* 11. Contextual Regulatory Updates */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-navy dark:text-white font-heading mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" /> Contextual Compliance Articles
            </h3>
            <div className="space-y-3">
              {relatedArticles.map((art) => (
                <Link
                  key={art.slug}
                  href={`/updates/${art.slug}`}
                  className="block p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-amber-400 transition-all text-xs md:text-sm font-bold text-navy dark:text-white hover:text-amber-600"
                >
                  {art.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 12. Auto-Generated FAQ Accordion */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-bold text-navy dark:text-white font-heading mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" /> Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {autoFaqs.map((faq, index) => (
              <details key={index} className="group border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                <summary className="flex justify-between items-center p-4 font-bold text-navy dark:text-slate-200 text-xs md:text-sm cursor-pointer list-none select-none">
                  <span>Q{index + 1}. {faq.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 pt-1 text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-xl">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

      </div>
    </article>
  )
}
