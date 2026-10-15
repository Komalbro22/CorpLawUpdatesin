import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  MapPin,
  Building2,
  User,
  ExternalLink,
  Lock,
  ArrowRight,
  Gavel,
  Calculator,
  HelpCircle,
  Globe,
  FileCheck,
  ChevronRight,
} from 'lucide-react'
import PoaClient from './PoaClient'

export const metadata: Metadata = {
  title: 'Power of Attorney Format (India) — Free Word Download',
  description:
    'Free General Power of Attorney (GPA) and Special Power of Attorney (SPA) format for India in Word/PDF. Stamp paper guide, registration rules, NRI process. No sign-up.',
  keywords: [
    'power of attorney format india',
    'general power of attorney format word',
    'special power of attorney format india',
    'gpa format for property india',
    'power of attorney stamp duty maharashtra',
    'nri power of attorney format india',
    'irrevocable power of attorney format',
  ],
  alternates: {
    canonical: 'https://www.corplawupdates.in/documents/general-power-of-attorney',
  },
  openGraph: {
    title: 'Power of Attorney Format (India) — Free Word Download',
    description:
      'Free General Power of Attorney (GPA) and Special Power of Attorney (SPA) format for India in Word/PDF. Stamp paper guide, registration rules, NRI process. No sign-up.',
    url: 'https://www.corplawupdates.in/documents/general-power-of-attorney',
    type: 'article',
    images: [
      {
        url: '/images/documents/power-of-attorney-format-india.svg',
        width: 1200,
        height: 630,
        alt: 'Power of Attorney Format India Legal Architecture',
      },
    ],
  },
}

const FAQS = [
  {
    q: 'Can a property be sold on GPA in India?',
    a: 'No. The Supreme Court in Suraj Lamp & Industries (2011) categorically ruled that a Power of Attorney is not an instrument of transfer and does not convey title. Property can only be legally transferred via a registered Deed of Conveyance (Sale Deed). A GPA can only authorize an agent to sign the conveyance deed on the principal’s behalf.',
  },
  {
    q: 'Is registration of Power of Attorney mandatory?',
    a: 'Under the Indian Registration Act, registration is generally optional for ordinary powers of attorney. However, registration is strictly mandatory when the POA authorizes the sale or conveyance of immovable property, or in states like Maharashtra where irrevocable POAs relating to property are compulsorily registrable under state amendments.',
  },
  {
    q: 'Can a Power of Attorney be irrevocable?',
    a: 'Only if it satisfies Section 202 of the Indian Contract Act, 1872 — where the agency is coupled with an interest (the agent has a financial or proprietary interest in the property). A standard POA without an underlying interest is revocable at will by the principal regardless of what the agreement is titled.',
  },
  {
    q: 'How can an NRI execute a POA for use in India?',
    a: 'An NRI must sign the POA abroad before an Indian Embassy/Consulate official or a Notary Public (with Apostille if in a Hague Convention country), courier the original to India, and have it stamped by the District Collector of Stamps within 3 months of its first receipt in India under Section 18 of the Indian Stamp Act, 1899.',
  },
  {
    q: 'What is the stamp duty on a POA in Maharashtra?',
    a: 'Under Article 48 of the Maharashtra Stamp Act: ₹500 if empowering close relatives to sell property without consideration; full conveyance duty (Article 25) if empowering non-relatives or for consideration; and ₹500 per authorized person for general administration, banking, and litigation powers.',
  },
  {
    q: 'What happens to a POA if the principal dies?',
    a: 'Under Section 201 of the Indian Contract Act, 1872, a Power of Attorney automatically terminates upon the death, unsoundness of mind, or insolvency of either the Principal or the Attorney. Any action taken by the attorney after the principal’s death is void ab initio, except where Section 202 (agency coupled with an interest) applies.',
  },
  {
    q: 'Does a POA survive the principal’s death?',
    a: 'No. Under Section 201 of the Indian Contract Act, 1872, agency automatically terminates upon the death, unsoundness of mind, or insolvency of either the Principal or the Attorney. The sole exception is agency coupled with an interest under Section 202 (where the agent has an existing financial interest in the property), which survives until that interest is satisfied.',
  },
]

export default function GeneralPowerOfAttorneyPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
      {/* JSON-LD Schema: strictly FAQPage, zero aggregateRating */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/documents" className="hover:text-slate-900 dark:hover:text-white transition">
              Documents
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Power of Attorney (GPA &amp; SPA)
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/70 px-3.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Powers of Attorney Act, 1882 &amp; Indian Contract Act, 1872
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
              Power of Attorney Format (India) — Free GPA &amp; SPA Generator
            </h1>

            <p className="text-base text-slate-600 sm:text-lg dark:text-slate-300">
              Generate court-compliant General Power of Attorney (GPA) and Special Power of Attorney (SPA)
              deeds in Word (.docx) and PDF. Includes Suraj Lamp (2011) title safeguards, Section 202 irrevocability
              rules, NRI 3-month stamping protocols, and Maharashtra Article 48 stamp duty guidance.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Free Word &amp; PDF Downloads
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> NRI Section 18 Stamping Guide
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Built-in AI Custom Clause Drafter
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Interactive Generator & Preview */}
        <PoaClient />

        {/* Infographic Section */}
        <div className="my-16 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Power of Attorney (POA) Statutory Architecture in India
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Legal overview: Powers of Attorney Act, Suraj Lamp Title Transfer Prohibition &amp; NRI Protocol
              </p>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Legal Infographic
            </span>
          </div>
          <div className="p-2 sm:p-4 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <Image
              src="/images/documents/power-of-attorney-format-india.svg"
              alt="Power of Attorney Format India Legal Architecture"
              width={1200}
              height={630}
              unoptimized
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Legal Guide & Statutory Framework */}
        <div className="mt-16 space-y-12 max-w-4xl">
          {/* Guide Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              1. Statutory Framework: Powers of Attorney Act &amp; Agency Law
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              A Power of Attorney is a formal instrument whereby one person (the <em>Principal</em>) delegates legal
              authority to another person (the <em>Attorney</em> or <em>Agent</em>) to perform acts in the Principal’s
              name. In India, POA instruments are governed by two foundational statutes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <Gavel className="w-4 h-4" />
                  <span>Powers of Attorney Act, 1882</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Section 1A:</strong> Defines a power-of-attorney as any instrument empowering a specified
                  person to act for and in the name of the person executing it.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Section 2:</strong> Any act executed by the donee in their own name has the same legal
                  efficacy as if executed by the donor in person.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <FileCheck className="w-4 h-4" />
                  <span>Indian Contract Act, 1872 (Agency)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Sections 182–238:</strong> Codifies the law of principal and agent.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Section 184:</strong> Any person of the age of majority and sound mind can be an agent.
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Section 201:</strong> Termination of agency upon revocation, death, or insolvency.
                </p>
                <div className="text-[11px] text-amber-700 dark:text-amber-300 border-t border-slate-100 dark:border-slate-800 pt-2 font-medium">
                  <strong>Section 202:</strong> Agency coupled with an interest is irrevocable by the principal.
                </div>
              </div>
            </div>
          </section>

          {/* Guide Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              2. General vs Special POA &amp; Irrevocability Rules (Section 202)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">General Power of Attorney (GPA)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Confers wide, comprehensive authority over the Principal's affairs—including banking, litigation,
                  property maintenance, tax filings, and document execution. Useful when the principal travels abroad
                  or is elderly, but carries significant risk if granted to untrusted parties.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Special Power of Attorney (SPA)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Restricted strictly to one specified transaction or purpose (e.g. presenting a specific conveyance
                  deed before the Sub-Registrar or defending a specific trial). Once that specific task is accomplished,
                  the SPA is spent and automatically extinguishes.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border-l-4 border-red-500 border border-slate-200 dark:border-slate-800 rounded-r-xl p-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 shadow-sm">
              <p className="font-bold text-red-700 dark:text-red-300">
                Warning on "Irrevocable" Powers of Attorney (Section 202 Indian Contract Act):
              </p>
              <p>
                Many generic online templates label POAs as "Irrevocable." Under Section 202 of the Indian Contract
                Act, 1872, an agency can be made legally irrevocable <strong>only where the agent himself has an
                interest in the property</strong> forming the subject matter of the agency (e.g., when a lender is
                authorized to sell collateral to recover unpaid debt). A standard POA granted without an underlying
                financial interest remains <em>revocable at the will of the principal</em>, regardless of how the clause
                is titled.
              </p>
            </div>
          </section>

          {/* Guide Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              3. The Suraj Lamp Doctrine: GPA Does NOT Transfer Property Title
            </h2>
            <div className="bg-gradient-to-br from-red-50 via-white to-red-100/40 dark:from-red-950/40 dark:via-slate-900 dark:to-slate-900 border border-red-200 dark:border-red-600/40 rounded-2xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Supreme Court of India Ruling: Suraj Lamp &amp; Industries (2011)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                In <strong>Suraj Lamp &amp; Industries Pvt. Ltd. v. State of Haryana (2011) 11 SCC 1</strong>, a
                three-judge bench of the Supreme Court categorically settled the law regarding property sales conducted
                through "SA/GPA/WILL" transfers:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>A Power of Attorney is not an instrument of transfer:</strong> A GPA is an instrument of
                  agency. It does not convey, transfer, or create any title or ownership in immovable property.
                </li>
                <li>
                  <strong>Conveyance Deed Mandatory:</strong> Immovable property can be transferred only by a registered
                  Deed of Conveyance (Sale Deed) under Section 54 of the Transfer of Property Act, 1882, duly stamped
                  and registered under the Registration Act, 1908.
                </li>
                <li>
                  <strong>Authorized Execution vs Sale:</strong> An owner can lawfully execute a registered POA authorizing
                  their agent to sign and execute a deed of conveyance on their behalf, but the POA itself is not a sale.
                </li>
              </ul>
              <p className="text-[11px] text-red-700 dark:text-red-300 italic border-t border-red-200 dark:border-red-800/60 pt-2">
                Purchasing property on GPA and Agreement to Sell without a registered conveyance deed confers no legal title.
              </p>
            </div>
          </section>

          {/* Guide Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              4. Registration Rules &amp; Maharashtra Article 48 Stamp Duty
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Registration requirements and stamp duty on powers of attorney depend on state legislation:
            </p>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs sm:text-sm shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Maharashtra Compulsory Registration (W.e.f. 1 April 2013):
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Under the <strong>Registration (Maharashtra Amendment) Act, 2010</strong>, Section 17 of the Registration
                Act was amended to make the registration of an <strong>irrevocable Power of Attorney relating to the
                transfer of immovable property compulsorily registrable</strong> in the State of Maharashtra.
              </p>
            </div>

            {/* Stamp Duty Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5 font-semibold">Situation / Powers Granted</th>
                    <th className="p-3.5 font-semibold">Stamp Duty (Article 48, Maharashtra)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                      Authorising sale/transfer of immovable property <strong>to close relatives without consideration</strong>{' '}
                      (father, mother, spouse, son, daughter, brother, sister, grandson, granddaughter)
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Flat ₹500</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                      Authorising sale/transfer of immovable property <strong>for consideration</strong>, or to a
                      <strong> non-relative without consideration</strong>, or to a <strong>promoter/developer</strong>
                    </td>
                    <td className="p-3.5 font-bold text-amber-700 dark:text-amber-400">
                      Same duty as Conveyance Deed (Article 25) based on market value
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                      Any other case (general non-property administration, banking, litigation)
                    </td>
                    <td className="p-3.5">Flat ₹500 per person authorized</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              Note on other states: In Delhi, stamp duty is typically ₹50 (General) or ₹10 (Special). Check your
              respective state's Stamp Act prior to execution.
            </p>
          </section>

          {/* Guide Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              5. NRI Protocol: Section 18 of the Indian Stamp Act, 1899
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Non-Resident Indians executing a Power of Attorney abroad for use in India must strictly adhere to the
              three-stage statutory adjudication process under Section 18 of the Indian Stamp Act, 1899:
            </p>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs sm:text-sm shadow-sm">
              <ol className="list-decimal pl-5 space-y-2.5 text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Step 1 — Execution Abroad:</strong> The NRI principal signs the POA on plain paper before an
                  authorized officer at the Indian Embassy / Consulate, or before a Notary Public in the foreign
                  country (followed by Apostille certification in Hague Convention nations).
                </li>
                <li>
                  <strong>Step 2 — Courier to India:</strong> The original attested POA is sent via registered courier to
                  the Attorney in India.
                </li>
                <li>
                  <strong>Step 3 — Stamping within 3 Months:</strong> Under <strong>Section 18</strong>, the document
                  must be presented to the District Collector of Stamps / Registrar for adjudication and payment of stamp
                  duty <strong>within three (3) months of its first receipt in India</strong>. The Collector endorses
                  the certificate of adjudication on the deed.
                </li>
              </ol>
            </div>
          </section>

          {/* Guide Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              6. Revocation Procedure for Powers of Attorney
            </h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 shadow-sm">
              <p>
                To legally terminate and cancel an existing revocable Power of Attorney, the Principal must follow
                these procedural steps:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Execute a Deed of Revocation:</strong> Draft and sign a formal Revocation Deed explicitly
                  identifying the original POA, date of execution, and cancellation of all powers.
                </li>
                <li>
                  <strong>Written Notice to Attorney:</strong> Serve the Revocation Deed upon the Attorney via Registered
                  Post with Acknowledgment Due (RPAD) and registered email.
                </li>
                <li>
                  <strong>Notice to Third Parties:</strong> Deliver formal written notice of revocation to banks,
                  housing societies, revenue authorities, and the Sub-Registrar where the POA was registered.
                </li>
                <li>
                  <strong>Public Notice:</strong> For property-related POAs, publish a revocation notice in one widely
                  circulated English newspaper and one regional vernacular newspaper.
                </li>
                <li>
                  <strong>Register Revocation Deed:</strong> If the original POA was registered, the revocation deed
                  must also be registered with the same Sub-Registrar office.
                </li>
              </ul>
            </div>
          </section>

          {/* Guide Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              7. Complete 7-Step Execution Checklist
            </h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs sm:text-sm shadow-sm">
              <ol className="list-decimal pl-5 space-y-2.5 text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Choose GPA vs SPA:</strong> Select General Power for ongoing management or Special Power for
                  a single designated transaction.
                </li>
                <li>
                  <strong>Enumerate Specific Powers:</strong> Clearly specify banking, property, tax, and litigation
                  powers in the generator. Avoid overly vague language.
                </li>
                <li>
                  <strong>Stamp Paper or E-Stamping:</strong> Print on non-judicial stamp paper of appropriate state
                  denomination (or e-stamp).
                </li>
                <li>
                  <strong>Signatures:</strong> Principal signs at the foot of each page and executes the final signature
                  block; Attorney signs specimen signature block.
                </li>
                <li>
                  <strong>Attestation by 2 Witnesses:</strong> Two adult, independent witnesses must sign with full
                  names, addresses, and ID details.
                </li>
                <li>
                  <strong>Notarization / Registration:</strong> Attest before a Notary Public. If granting property
                  sale authority or irrevocable power in Maharashtra, register before the Sub-Registrar.
                </li>
                <li>
                  <strong>Distribution &amp; Stamping:</strong> Deliver executed originals or certified copies to the
                  agent and concerned banking/revenue institutions.
                </li>
              </ol>
            </div>
          </section>

          {/* FAQs Section */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Questions (Power of Attorney)
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{faq.q}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Documents Navigation */}
          <section className="border-t border-slate-200 dark:border-slate-800 pt-8 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Related Corporate &amp; Legal Documents:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <Link
                href="/documents/lease-agreement"
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-between shadow-sm"
              >
                <span>Rent / Lease Agreement</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </Link>
              <Link
                href="/documents/non-disclosure-agreement"
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-between shadow-sm"
              >
                <span>Non-Disclosure Agreement</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </Link>
              <Link
                href="/documents/equitable-mortgage-deed"
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-between shadow-sm"
              >
                <span>Equitable Mortgage Deed</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </Link>
            </div>
          </section>

          {/* Statutory Disclaimer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 pt-6 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <p>
              <strong>Statutory Legal Disclaimer:</strong> The documents and guidance provided on this page are for
              educational and reference purposes under the Powers of Attorney Act, 1882, the Indian Contract Act, 1872,
              and state Stamp Acts. CorpLawUpdates is not a law firm. Powers of Attorney grant extensive legal authority
              that can involve property, financial, and criminal liabilities. Users are strongly advised to seek
              independent legal counsel from a qualified advocate or solicitor before executing or registering high-value
              powers of attorney.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
