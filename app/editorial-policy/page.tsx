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
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">4. AI-Assisted Drafting Disclosure</h2>
            <p>
              Some articles and document templates use AI-assisted drafting tools. All AI-generated content is reviewed
              by our editorial desk against the original source material before publication. AI is used to improve
              clarity and structure — not to invent legal positions or regulatory requirements.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">5. Corrections & Updates</h2>
            <p>
              If you identify a factual error, outdated effective date, or missing source reference, please contact us
              at{' '}
              <a href="mailto:mail@corplawupdates.in" className="text-gold hover:underline font-semibold">
                mail@corplawupdates.in
              </a>
              . We aim to review correction requests within 2 business days and update affected articles with a revised
              publication date where material changes are made.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">6. Not Legal Advice</h2>
            <p>
              Content on CorpLawUpdates.in is for informational and educational purposes only. It does not constitute
              legal, tax, or professional advice. Readers should consult a qualified Company Secretary, Chartered
              Accountant, or Advocate before taking compliance action based on any summary published here.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-navy dark:text-slate-100 mb-3">7. Independence</h2>
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
