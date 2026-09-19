import type { Metadata } from 'next'
import Link from 'next/link'
import { EDITORIAL_AUTHOR } from '@/lib/editorial'

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description:
    'How CorpLawUpdates.in researches, verifies, and publishes Indian corporate law updates — our editorial standards, sourcing rules, and correction process.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/editorial-policy',
  },
  openGraph: {
    title: 'Editorial Policy | CorpLawUpdates.in',
    description:
      'Our editorial standards for MCA, SEBI, RBI, and other Indian regulatory updates — sourcing, verification, and corrections.',
    url: 'https://www.corplawupdates.in/editorial-policy',
    type: 'website',
    siteName: 'CorpLawUpdates.in',
  },
}

export default function EditorialPolicyPage() {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav className="mb-6 text-sm text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-navy dark:text-slate-200 font-medium">Editorial Policy</span>
        </nav>

        <h1 className="text-3xl font-heading font-bold text-navy dark:text-slate-100 mb-2">
          Editorial Policy
        </h1>
        <p className="text-slate-400 text-sm mb-8">Last updated: 31 August 2026</p>

        <section className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">1. Our Mission</h2>
            <p>
              {EDITORIAL_AUTHOR.name} at CorpLawUpdates.in publishes free, plain-English summaries of Indian corporate
              law and regulatory developments for Company Secretaries, Chartered Accountants, compliance officers, and
              legal professionals. Our goal is accuracy, clarity, and practical relevance — not sensationalism.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">2. Source Standards</h2>
            <p className="mb-3">Every article is traced to primary or official sources, including:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Ministry of Corporate Affairs (MCA) circulars, notifications, and gazette entries</li>
              <li>SEBI circulars, master circulars, and consultation papers</li>
              <li>RBI master directions, notifications, and monetary policy statements</li>
              <li>NCLT / NCLAT orders, IBBI regulations, CCI orders, and Labour Ministry notifications</li>
            </ul>
            <p className="mt-3">
              We cite the original source document in each article and link to the official publication wherever
              available.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">3. Research & Verification Process</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Monitor official regulator portals and gazette notifications daily.</li>
              <li>Extract the operative provision, effective date, and compliance action required.</li>
              <li>Cross-check against the full circular or notification text — not press summaries alone.</li>
              <li>Publish a structured brief with key changes, practical implications, and source attribution.</li>
              <li>Re-verify articles when regulators issue corrigenda, extensions, or amendments.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">4. Editorial Verification & Four-Eye Review Standard</h2>
            <p className="mb-3">
              Every regulatory update published on CorpLawUpdates.in undergoes a strict four-eye editorial verification standard before publication:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Primary Source Authentication:</strong> No update is drafted from secondary press reports or unverified social commentary. Every notice is corroborated against official Gazette notifications, regulator circulars (MCA, SEBI, RBI, IBBI, EPFO, CBDT, CBIC), or direct tribunal orders.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Legal & Compliance Fact-Checking:</strong> Operative provisions, effective dates, penalty clauses, and required statutory filings are independently verified against the parent Act and governing rules.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Continuous Corrigenda Tracking:</strong> When government departments issue subsequent amendments, clarifications, or timeline extensions, our editorial desk updates existing articles with revision timestamps and updated compliance notes.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">5. Specialized Regulatory Research Desks</h2>
            <p className="mb-3">
              To ensure deep subject-matter expertise across diverse areas of Indian corporate law, our coverage is organized into specialized regulatory research desks:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">🏛️ MCA & Corporate Compliance Desk</span>
                <span className="text-slate-500 dark:text-slate-400">Companies Act 2013, LLP Act, RoC filings, statutory compliance calendars, and MCA circulars.</span>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">📈 Securities & Capital Markets Desk</span>
                <span className="text-slate-500 dark:text-slate-400">SEBI LODR, ICDR, PIT, Takeover Regulations, mutual funds, AIFs, and stock exchange circulars.</span>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">🏦 Banking & Monetary Regulations Desk</span>
                <span className="text-slate-500 dark:text-slate-400">RBI Master Directions, NBFC regulations, prudential frameworks, digital lending, and payments.</span>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">⚖️ Insolvency & Bankruptcy Desk</span>
                <span className="text-slate-500 dark:text-slate-400">Insolvency & Bankruptcy Code (IBC 2016), CIRP timelines, liquidation rules, and IBBI notifications.</span>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">👷 Labour & Employment Law Desk</span>
                <span className="text-slate-500 dark:text-slate-400">EPFO wage ceilings, ESIC compliance, minimum wages, POSH compliance, and Labour Code reforms.</span>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">🌐 FEMA & Cross-Border Desk</span>
                <span className="text-slate-500 dark:text-slate-400">FDI policy, Overseas Direct Investment (ODI), ECB regulations, and DGFT foreign trade notices.</span>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">📜 Company Law Tribunal & CCI Desk</span>
                <span className="text-slate-500 dark:text-slate-400">NCLT & NCLAT bench orders, corporate dispute rulings, and Competition Commission orders.</span>
              </div>
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">💰 Direct & Indirect Tax Desk</span>
                <span className="text-slate-500 dark:text-slate-400">CBDT Income Tax circulars, CBIC GST notifications, advance rulings, and statutory rate changes.</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">6. Corrections & Updates</h2>
            <p>
              If you identify a factual error, outdated effective date, or missing source reference, please contact our editorial desk
              at{' '}
              <a href="mailto:editorial@corplawupdates.in" className="text-gold hover:underline font-semibold">
                editorial@corplawupdates.in
              </a>
              . We aim to review correction requests within 2 business days and update affected articles with a revised
              publication date and changelog notes where material changes are made.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">7. Not Legal Advice</h2>
            <p>
              Content on CorpLawUpdates.in is for informational and educational purposes only. It does not constitute
              legal, tax, or professional advice. Readers should consult a qualified Company Secretary, Chartered
              Accountant, or Advocate before taking compliance action based on any summary published here.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">8. Independence</h2>
            <p>
              CorpLawUpdates.in does not accept payment from regulators, law firms, or service providers in exchange
              for editorial coverage. Partner listings on our{' '}
              <Link href="/partners" className="text-gold hover:underline font-semibold">
                Partners page
              </Link>{' '}
              are clearly labelled and separate from our regulatory news coverage.
            </p>
          </div>
        </section>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-sm">
          <Link href="/about" className="text-gold hover:underline font-semibold">
            About Us
          </Link>
          <Link href="/contact" className="text-gold hover:underline font-semibold">
            Contact
          </Link>
          <Link href="/privacy-policy" className="text-gold hover:underline font-semibold">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
