import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  FileText,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FolderArchive,
  ArrowRight,
  ExternalLink,
  Scale,
  Building2,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react'
import { getDocumentSet } from '@/lib/document-sets-data'
import { getDIR12FeeSchedule, getAllLegalScheduleItems } from '@/lib/legal-data-schedule'
import DirectorAppointmentChecklist from './DirectorAppointmentChecklist'
import JsonLd from '@/components/JsonLd'

export const revalidate = 3600 // 1 hour ISR cache

export async function generateMetadata(): Promise<Metadata> {
  const set = await getDocumentSet('director-appointment-set')
  const title = set?.seo_title || 'Documents Required for Appointment of Director | Complete Set & Formats (Companies Act 2013)'
  const description =
    set?.seo_description ||
    'Download the complete director appointment document set for private limited companies: DIR-2, DIR-8, Board Resolution, MBP-1, AGM notice, ordinary resolution, and Form DIR-12 guide.'

  return {
    title,
    description,
    alternates: {
      canonical: 'https://www.corplawupdates.in/documents/director-appointment-set',
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: 'https://www.corplawupdates.in/documents/director-appointment-set',
    },
  }
}

export default async function DirectorAppointmentSetPage() {
  const [fullSet, feeSchedule] = await Promise.all([
    getDocumentSet('director-appointment-set'),
    getDIR12FeeSchedule(),
  ])

  if (!fullSet) {
    notFound()
  }

  const { feeSlabs, lateFeeBands } = feeSchedule

  // JSON-LD Schemas
  const breadcrumbSchema = {
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
        name: 'Secretarial Documents',
        item: 'https://www.corplawupdates.in/documents',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Director Appointment Set',
        item: 'https://www.corplawupdates.in/documents/director-appointment-set',
      },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: fullSet.title,
    description: fullSet.description,
    numberOfItems: fullSet.documents.length,
    itemListElement: fullSet.documents.map((doc, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: doc.title,
      description: `Governing section: ${doc.governing_section}. Step ${doc.step_number} of 11.`,
      url: `https://www.corplawupdates.in/documents/${doc.spoke_slug}`,
    })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: fullSet.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={itemListSchema} />
      <JsonLd schema={faqSchema} />

      {/* Breadcrumb strip */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/documents" className="hover:text-foreground transition-colors">
              Documents
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Director Appointment Set</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header Block */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Document Set v1.0
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Private Limited Company
            </span>
            <span className="text-xs text-muted-foreground">
              Law as at {fullSet.law_as_at}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Documents Required for Appointment of Director
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-2">
            Complete secretarial pack: Board appointment as Additional Director (Sec 161(1)) followed by Shareholder regularisation (Sec 152).
          </p>

          {/* Quick Answer (40–60 words, self-contained) */}
          <div className="mt-6 p-5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border-l-4 border-blue-600 dark:border-blue-500 text-slate-800 dark:text-slate-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-blue-900 dark:text-blue-300 font-semibold block mb-1">
                  Quick Answer: Documents Required in Filing Sequence
                </strong>
                <p className="text-sm leading-relaxed">
                  {fullSet.quick_answer}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Complete Pack Download Action Strip */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 mb-12 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Verified Full Pack (11 Documents)
              </span>
              <h2 className="text-2xl font-bold tracking-tight">
                Download Director Appointment Complete Pack
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Get all notices, resolutions, Form DIR-2, DIR-8, MBP-1, minutes extracts, and register specimen in Bookman Old Style 12pt with statutory placeholders.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <a
                href="/api/documents/sets/director-appointment/download?file=pack-docx"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Single .docx
              </a>
              <a
                href="/api/documents/sets/director-appointment/download?file=pack-zip"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors border border-slate-600"
              >
                <FolderArchive className="w-4 h-4" />
                Download Complete ZIP
              </a>
            </div>
          </div>
        </div>

        {/* 1. Interactive Checklist */}
        <DirectorAppointmentChecklist steps={fullSet.steps} setSlug={fullSet.slug} />

        {/* 2. Documents in Filing Order */}
        <section className="mb-14" id="documents">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Documents in Filing Order
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Every document required across the appointment lifecycle, verified under the Companies Act, 2013 and Secretarial Standards (SS-1 & SS-2).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fullSet.documents.map((doc, idx) => {
              const isSpoke = doc.spoke_slug && !doc.spoke_slug.includes('#')
              return (
                <div
                  key={doc.id || idx}
                  className="p-5 rounded-xl border border-border bg-card hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        Document {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>Step {doc.step_number} of 11</span>
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doc.governing_section}
                    </p>

                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {doc.who_signs && (
                        <div>
                          <strong>Signatory:</strong> {doc.who_signs}
                        </div>
                      )}
                      {doc.when_filed && (
                        <div>
                          <strong>Timing:</strong> {doc.when_filed}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
                    {isSpoke ? (
                      <Link
                        href={`/documents/${doc.spoke_slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Full Format
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">Internal record</span>
                    )}

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/documents/sets/director-appointment/download?doc=${doc.spoke_slug}&format=docx`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors text-foreground"
                        title="Download Word format"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        .docx
                      </a>
                      <a
                        href={`/api/documents/sets/director-appointment/download?doc=${doc.spoke_slug}&format=pdf`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors text-foreground"
                        title="Download PDF rendition"
                      >
                        <Download className="w-3.5 h-3.5 text-rose-500" />
                        PDF
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 3. Deadlines & MCA Fees Table (Single Source of Truth from DB) */}
        <section className="mb-14" id="deadlines-and-fees">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Statutory Deadlines & MCA Form DIR-12 Fees
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Filing fee schedule under the Companies (Registration Offices and Fees) Rules, 2014 and statutory timelines under the Companies Act, 2013.
            </p>
          </div>

          {/* Slabs Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <div className="p-4 bg-muted/40 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                MCA Form DIR-12 Normal Filing Fee Slabs
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/20 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Authorised Share Capital Slab</th>
                    <th className="px-4 py-3">Normal Fee</th>
                    <th className="px-4 py-3">Governing Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {feeSlabs.map(slab => (
                    <tr key={slab.code} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{slab.description}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{slab.amount}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {slab.governingSection}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Late Multipliers Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <div className="p-4 bg-muted/40 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                Form DIR-12 Additional Late Fee Multipliers (Section 403 Table B)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/20 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Period of Delay</th>
                    <th className="px-4 py-3">Additional Fee Multiplier</th>
                    <th className="px-4 py-3">Applicability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lateFeeBands.map(band => (
                    <tr key={band.code} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {band.minDelayDays} {band.maxDelayDays ? `to ${band.maxDelayDays}` : '+'} days delay
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-600 dark:text-amber-400">
                        {band.displayText}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        Multiplied on standard normal filing fee slab
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key verified statutory callout */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div>
              <strong>Important Statutory Protections:</strong>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>DIR-12 Deadlines:</strong> Must be filed within <strong>30 days</strong> of the Board Meeting (initial appointment) and again within <strong>30 days</strong> of the General Meeting (regularisation).
              </li>
              <li>
                <strong>₹100/day Late Fee Exclusion:</strong> The punitive ₹100-per-day rate does <strong>NOT</strong> apply to Form DIR-12 (it applies exclusively to annual filing forms AOC-4 and MGT-7 under Section 403 second proviso).
              </li>
              <li>
                <strong>MGT-14 Exemption:</strong> Private limited companies are completely exempt from filing Form MGT-14 for Section 179(3) board resolutions under MCA Exemption Notification G.S.R. 464(E) dated 5 June 2015.
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Variant Notice */}
        <section className="mb-14 p-6 rounded-2xl bg-muted/40 border border-border">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-base font-bold text-foreground">
                Scope & Variant Notice
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {fullSet.variant_notice}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                Need guidance on MCA Form DIR-12 filing? Check our in-depth{' '}
                <Link
                  href="/updates/form-dir-12-director-kmp-appointment-filing-guide-companies-act-2013"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Form DIR-12 Step-by-Step Filing Guide
                </Link>
                .
              </div>
            </div>
          </div>
        </section>

        {/* 5. Common Compliance Mistakes */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">
            Common Compliance Pitfalls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fullSet.common_mistakes.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50/30 dark:bg-rose-950/10">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-sm mb-1">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {m.mistake}
                </div>
                <div className="text-xs text-rose-900/80 dark:text-rose-300/80 mb-2">
                  <strong>Risk:</strong> {m.consequence}
                </div>
                <div className="text-xs text-foreground bg-background/80 p-2.5 rounded-lg border border-border">
                  <strong>Solution:</strong> {m.correction}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Frequently Asked Questions */}
        <section className="mb-14" id="faqs">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {fullSet.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-border bg-card">
                <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Changelog Block */}
        <section className="mb-14 p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">
              Document Set Version Changelog
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {fullSet.version}
            </span>
          </div>
          <div className="space-y-3">
            {fullSet.changelog.map((log, idx) => (
              <div key={idx} className="text-xs border-l-2 border-blue-500 pl-3 py-1">
                <div className="font-semibold text-foreground">
                  Version {log.version} — {log.change_date}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  {log.change_note}
                </div>
                <div className="text-slate-500 text-[11px] mt-1 font-mono">
                  Ref: {log.instrument_reference}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Footer Block (Honesty Gate, Disclaimer & Error Report) */}
        <footer className="pt-8 border-t border-border text-xs text-muted-foreground space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong>Version:</strong> {fullSet.version} • <strong>Law as at:</strong> {fullSet.law_as_at} •{' '}
              <strong>Review Status:</strong>{' '}
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {fullSet.reviewer_status === 'signed_off' && fullSet.reviewer_name
                  ? `Reviewed by ${fullSet.reviewer_name} (FCS)`
                  : 'Under professional review'}
              </span>
            </div>

            <div>
              <Link
                href={`/feedback?type=document_set&title=${encodeURIComponent(fullSet.title)}&url=/documents/director-appointment-set`}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Report an error
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            <strong>Statutory Disclaimer:</strong> These are draft templates and secretarial guides for reference only. Corporate actions, drafting, and regulatory filings involve legal obligations under the Companies Act, 2013 and applicable rules. Always verify with a qualified Company Secretary or legal professional before execution or filing with the Ministry of Corporate Affairs.
          </p>
        </footer>
      </div>
    </div>
  )
}
