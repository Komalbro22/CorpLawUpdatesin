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
  ChevronRight,
} from 'lucide-react'
import LeaseClient from './LeaseClient'

export const metadata: Metadata = {
  title: 'Rent Agreement Format India (Word) — Free Lease Deed Generator',
  description:
    'Free rent & lease agreement format for India in Word/PDF. 11-month and registered lease drafts, stamp duty calculator guide, police verification checklist. No sign-up.',
  keywords: [
    'rent agreement format india',
    'lease agreement format india',
    '11 month rent agreement format',
    'leave and license agreement format maharashtra',
    'house rent agreement format in word',
    'commercial lease deed format india',
    'rent agreement stamp duty',
  ],
  alternates: {
    canonical: 'https://www.corplawupdates.in/documents/lease-agreement',
  },
  openGraph: {
    title: 'Rent Agreement Format India (Word) — Free Lease Deed Generator',
    description:
      'Free rent & lease agreement format for India in Word/PDF. 11-month and registered lease drafts, stamp duty calculator guide, police verification checklist. No sign-up.',
    url: 'https://www.corplawupdates.in/documents/lease-agreement',
    type: 'article',
    images: [
      {
        url: '/images/documents/rent-agreement-format-india.svg',
        width: 1200,
        height: 630,
        alt: 'Rent Agreement Format India Legal Architecture',
      },
    ],
  },
}

const FAQS = [
  {
    q: 'Is an 11-month rent agreement legally valid without registration?',
    a: 'Yes. Under Section 17(1)(d) of the Registration Act, 1908, compulsory registration applies only to leases exceeding one year (or year-to-year). An 11-month agreement is legally valid without registration, provided proper stamp duty is paid under your state Stamp Act. However, registering the agreement is strongly recommended for stronger evidentiary enforceability in court.',
  },
  {
    q: 'What is the stamp duty on a rent agreement in Maharashtra?',
    a: 'Under the Maharashtra Stamp Act, stamp duty on Leave and License agreements for up to 5 years is 0.25% of the total consideration (total rent payable + non-refundable deposit + 10% notional annual interest on refundable deposit). For 5–10 years it is 0.50%, and above 10 years it is 1.00%. The registration fee is ₹1,000 in urban municipal corporation areas and ₹500 in rural areas. Digital stamping is mandatory w.e.f. 1 July 2025.',
  },
  {
    q: 'What is the difference between a lease and a leave and license agreement?',
    a: 'A lease (Transfer of Property Act, 1882, Section 105) transfers an interest in immovable property and confers exclusive possession to the tenant. A license (Indian Easements Act, 1882, Section 52) grants only a personal permission to occupy without transferring any legal interest or estate. In Maharashtra, residential and commercial rentals are framed as leave and license agreements to avoid rigid tenancy rights under state rent control statutes.',
  },
  {
    q: 'Is police verification of tenants mandatory?',
    a: 'Yes, in major urban centres including Delhi (under Delhi Police notifications) and Maharashtra (under local police commissionerate directives), landlords are legally required to submit a Tenant Police Verification form along with identity and address proofs. Failure to comply can invite prosecution under Section 188 of the Indian Penal Code (or Bharatiya Nyaya Sanhita).',
  },
  {
    q: 'What is the maximum security deposit a landlord can take?',
    a: 'The Union Model Tenancy Act, 2021 caps security deposits at a maximum of 2 months’ rent for residential properties and 6 months’ rent for commercial properties. However, because the Model Tenancy Act is a model framework adopted only by select states, prevailing market practices in cities like Bengaluru, Mumbai, and Hyderabad range from 2 to 10 months’ rent, governed by contract and state-specific laws.',
  },
  {
    q: 'Can the landlord increase rent during the agreement?',
    a: 'No, a landlord cannot unilaterally hike rent during the currency of an active term unless the agreement explicitly contains an escalation clause. Standard practice permits rent revision only at renewal (typically 5% to 10% per annum) with the execution of a fresh agreement or addendum.',
  },
  {
    q: 'Can a landlord evict a tenant before the term ends?',
    a: 'A landlord can only terminate an agreement before term expiry on specific grounds stipulated in the contract (such as non-payment of rent, unlawful subletting, or illegal activities) and must serve the agreed written notice period. Forcible eviction, locking the premise, or disconnecting electricity and water utilities is strictly illegal under Indian law; eviction must follow due process.',
  },
]

export default function LeaseAgreementPage() {
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
              Rent / Lease Agreement
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
              Transfer of Property Act, 1882 &amp; Indian Easements Act, 1882
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
              Rent / Lease Agreement Format (India) — Free Generator
            </h1>

            <p className="text-base text-slate-600 sm:text-lg dark:text-slate-300">
              Generate an enforceable, court-ready 11-month Leave &amp; License or registered Lease Deed
              in Word (.docx) and PDF. Includes Maharashtra 0.25% stamp duty calculator, Model Tenancy Act
              caveats, digital stamping guidance, and AI custom clause drafter.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Free Word &amp; PDF Downloads
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Maharashtra Digital Stamping Ready
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
        <LeaseClient />

        {/* Infographic Section */}
        <div className="my-16 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Rent &amp; Lease Agreement Legal Architecture in India
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory comparison: Transfer of Property Act vs Easements Act &amp; Maharashtra Duty Formula
              </p>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Legal Infographic
            </span>
          </div>
          <div className="p-2 sm:p-4 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <Image
              src="/images/documents/rent-agreement-format-india.svg"
              alt="Rent Agreement Format India Legal Architecture"
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
              1. Legal Framework: Transfer of Property Act vs Indian Easements Act
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Under Indian jurisprudence, residential and commercial tenancy arrangements derive their validity
              from two distinct statutory regimes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <Gavel className="w-4 h-4" />
                  <span>Lease Deed (TPA, 1882)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Defined under <strong>Section 105 of the Transfer of Property Act, 1882</strong> as a transfer of a
                  right to enjoy immovable property for a certain time in consideration of price paid or promised.
                  A lease creates an <em>interest in the property</em> and transfers exclusive possession to the lessee.
                </p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <strong>Section 106 Notice:</strong> 15 days for monthly tenancies, 6 months for agricultural /
                  manufacturing leases.
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Leave &amp; License (Easements Act, 1882)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Defined under <strong>Section 52 of the Indian Easements Act, 1882</strong> as a grant of permission
                  to do something upon immovable property which would, in the absence of such right, be unlawful.
                  A license confers a <em>mere personal privilege</em> without creating any legal estate or tenancy.
                </p>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <strong>Maharashtra Convention:</strong> In Maharashtra, contracts are strictly Leave &amp; License
                  to prevent archaic tenant protections under the Rent Control Act.
                </div>
              </div>
            </div>
          </section>

          {/* Guide Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              2. The 11-Month Convention: Section 17(1)(d) Registration Act, 1908
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              The overwhelming prevalence of 11-month rental contracts across India is a deliberate legal construct
              rooted in <strong>Section 17(1)(d) of the Registration Act, 1908</strong>. Under this provision, leases
              of immovable property from year to year, or for any term <em>exceeding one year</em>, or reserving a
              yearly rent, are <strong>compulsorily registrable</strong>.
            </p>
            <div className="bg-white dark:bg-slate-900 border-l-4 border-amber-500 border border-slate-200 dark:border-slate-800 rounded-r-xl p-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 shadow-sm">
              <p className="font-semibold text-slate-900 dark:text-white">Why 11 Months and Not 12?</p>
              <p>
                By restricting the tenure to eleven (11) months, parties avoid mandatory registration before the
                Sub-Registrar of Assurances. This saves substantial registration surcharges and cumbersome physical
                appearances while keeping the document admissible under the Indian Evidence Act.
              </p>
              <p className="text-amber-700 dark:text-amber-300 font-medium">
                Note on Stamp Duty: Even if an 11-month deed is unregistered, stamp duty is legally mandatory.
                An unstamped or deficiently stamped agreement cannot be impounded as primary evidence in court.
              </p>
            </div>
          </section>

          {/* Guide Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              3. Maharashtra Stamp Duty Formula &amp; Digital Mandate (July 2025)
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Maharashtra maintains one of the most clearly codified stamp duty schedules in India for Leave and
              License agreements under Article 36A / 5(g-a) of the Maharashtra Stamp Act:
            </p>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5 font-semibold">Agreement Tenure</th>
                    <th className="p-3.5 font-semibold">Applicable Stamp Duty Rate</th>
                    <th className="p-3.5 font-semibold">Registration Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">Up to 5 Years (&le; 60 months)</td>
                    <td className="p-3.5">
                      <strong className="text-amber-700 dark:text-amber-400">0.25%</strong> of (Total Rent + Non-refundable deposit + 10%
                      notional annual interest on refundable deposit)
                    </td>
                    <td className="p-3.5">₹1,000 (Urban) / ₹500 (Rural)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">5 Years to 10 Years</td>
                    <td className="p-3.5">0.50% of the calculated taxable base</td>
                    <td className="p-3.5">₹1,000 (Urban) / ₹500 (Rural)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-slate-900 dark:text-white">Above 10 Years</td>
                    <td className="p-3.5">1.00% of the calculated taxable base</td>
                    <td className="p-3.5">₹1,000 (Urban) / ₹500 (Rural)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Worked Example */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 text-xs sm:text-sm shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Worked Example (Mumbai 24-Month Lease):
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Consider a monthly rent of <strong>₹25,000</strong> for <strong>24 months</strong> with a refundable
                security deposit of <strong>₹2,00,000</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li>Total Rent = ₹25,000 &times; 24 months = <strong>₹6,00,000</strong></li>
                <li>Notional 10% Interest on Deposit = ₹2,00,000 &times; 10% &times; 2 years = <strong>₹40,000</strong></li>
                <li>Taxable Base = ₹6,00,000 + ₹40,000 = <strong>₹6,40,000</strong></li>
                <li>
                  Stamp Duty (0.25%) = ₹6,40,000 &times; 0.25% ={' '}
                  <strong className="text-amber-700 dark:text-amber-400">₹1,600</strong>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-600/50 rounded-xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
              <span className="font-bold block text-emerald-900 dark:text-emerald-300">
                Mandatory Digital Stamping (W.e.f. 1 July 2025):
              </span>
              <p className="leading-relaxed">
                In Maharashtra, digital e-stamping and e-registration through the state IGR (Department of Registration
                and Stamps) portal is compulsory. Physical stamp paper and franking are no longer legally recognized
                for rent deeds, and contravention carries penalties up to ₹5,000.
              </p>
            </div>
          </section>

          {/* Guide Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              4. Stamp Duty in Other States (State-Specific Legislation)
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Stamp duty is a state subject under Entry 63 of the State List (List II) of the Seventh Schedule to
              the Constitution of India. Rates vary widely across jurisdictions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li>
                <strong>Delhi (NCT):</strong> Leases up to 11 months typically require 2% on average annual rent or
                ₹100/₹500 non-judicial e-stamp depending on classification.
              </li>
              <li>
                <strong>Karnataka (Bengaluru):</strong> Stamp duty for residential leases up to 11 months is 0.5% to
                1% of annual rent plus deposit or minimum stamp slabs.
              </li>
              <li>
                <strong>Uttar Pradesh &amp; Haryana:</strong> Slabs depend on tenure and consideration, typically
                levied via e-stamping counters.
              </li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              Always verify current local notification rates under your respective State Stamp Act prior to execution.
            </p>
          </section>

          {/* Guide Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              5. Model Tenancy Act, 2021: Scope and Essential Caveats
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              The Union Cabinet approved the <strong>Model Tenancy Act (MTA), 2021</strong> on 2 June 2021 to balance
              the rights of landlords and tenants and replace archaic post-colonial rent control laws.
            </p>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs sm:text-sm shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white">Key Tenets of the Model Tenancy Act:</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Mandatory Written Agreement:</strong> No tenancy is lawful without a registered formal contract
                  submitted to the local Rent Authority within 2 months.
                </li>
                <li>
                  <strong>Security Deposit Cap:</strong> Capped strictly at a maximum of <strong>2 months’ rent</strong>{' '}
                  for residential tenancies and <strong>6 months’ rent</strong> for non-residential commercial premises.
                </li>
                <li>
                  <strong>Fast-Track Dispute Adjudication:</strong> Three-tier hierarchy comprising Rent Authority,
                  Rent Court, and Rent Tribunal, barring civil court jurisdiction.
                </li>
                <li>
                  <strong>Subletting Ban:</strong> Prohibits subletting without prior supplementary agreement.
                </li>
              </ul>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-600/40 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
                <strong>Crucial Legal Caveat:</strong> The MTA is a <em>model law</em>. It has no direct legal force
                unless individual state legislatures enact corresponding state tenancy statutes. States such as Andhra
                Pradesh, Tamil Nadu, and UP have aligned legislation, while other states continue under legacy laws.
              </div>
            </div>
          </section>

          {/* Guide Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              6. Tenant Police Verification: Step-by-Step Procedure
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Tenant police verification is mandatory in metropolitan jurisdictions (Delhi, Mumbai, Bengaluru,
              Gurugram, Pune) to ensure security and prevent unlawful occupancy:
            </p>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 text-xs sm:text-sm shadow-sm">
              <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Collect Documents:</strong> Tenant’s government ID (Aadhaar/Passport/Voter ID), permanent
                  address proof, employment letter/ID card, and 2 passport photos.
                </li>
                <li>
                  <strong>Submission:</strong> File the prescribed Tenant Verification Form either through the state
                  police citizen portal (e.g., Mumbai Police / Delhi Police portal) or physically at the local police
                  station having jurisdiction over the property.
                </li>
                <li>
                  <strong>Acknowledgment:</strong> Obtain the police seal and stamped acknowledgment slip. Keep a copy
                  annexed to the original lease agreement.
                </li>
              </ol>
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
                  <strong>Choose Agreement Type:</strong> Select 11-month Leave &amp; License (for Maharashtra) or
                  standard Rent Agreement based on property location.
                </li>
                <li>
                  <strong>Complete Document Form:</strong> Fill party details, property description, rent, deposit,
                  and add any custom clauses via the AI builder.
                </li>
                <li>
                  <strong>Procure Stamp Paper:</strong> Pay requisite state stamp duty via online e-stamp portal or
                  IGR digital stamping (mandatory in Maharashtra).
                </li>
                <li>
                  <strong>Signature on Every Page:</strong> Both Owner (Licensor) and Tenant (Licensee) must sign or
                  initial at the bottom of every page, and affix full signature on the final execution block.
                </li>
                <li>
                  <strong>Attestation by 2 Witnesses:</strong> Two adult, independent witnesses must sign with their
                  full names and residential addresses.
                </li>
                <li>
                  <strong>Registration:</strong> Complete biometric e-registration (if in Maharashtra) or register at
                  the Sub-Registrar office if the tenure exceeds 11 months.
                </li>
                <li>
                  <strong>Police Verification &amp; Safekeeping:</strong> File tenant police verification and ensure
                  both parties retain a complete executed original or certified copy.
                </li>
              </ol>
            </div>
          </section>

          {/* FAQs Section */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Frequently Asked Questions (Rent &amp; Lease Agreements)
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
              Related Corporate &amp; Property Documents:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <Link
                href="/documents/equitable-mortgage-deed"
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-between shadow-sm"
              >
                <span>Equitable Mortgage Deed</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </Link>
              <Link
                href="/documents/partnership-deed"
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-between shadow-sm"
              >
                <span>Partnership Deed</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </Link>
              <Link
                href="/documents/non-disclosure-agreement"
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-between shadow-sm"
              >
                <span>Non-Disclosure Agreement</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </Link>
            </div>
          </section>

          {/* Statutory Disclaimer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 pt-6 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <p>
              <strong>Statutory Legal Disclaimer:</strong> The documents and information provided on this page are
              for educational and self-help reference purposes under the Transfer of Property Act, 1882, the Indian
              Easements Act, 1882, and state Stamp Acts. CorpLawUpdates is not a law firm and does not render formal legal
              counsel. Rental and lease contracts involve property rights and stamp duty liabilities that vary by state.
              Users are advised to consult a qualified legal practitioner or advocate for bespoke drafting, registration,
              and title verification.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
