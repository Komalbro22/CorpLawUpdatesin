import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  Building2,
  Scale,
  Landmark,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
  Gavel,
  Check,
  AlertTriangle,
  ChevronRight,
  Percent,
  FileCheck2,
} from 'lucide-react'
import BankGuaranteeClient from './BankGuaranteeClient'
import JsonLd from '@/components/JsonLd'

export const revalidate = 86400

const pageUrl = 'https://www.corplawupdates.in/documents/bank-guarantee'

export const metadata: Metadata = {
  title: 'Bank Guarantee Format India (Word) — Free BG Draft Generator',
  description:
    'Free bank guarantee format for India — financial, performance & advance payment BG drafts in Word/PDF. Stamp duty, invocation rules explained.',
  alternates: {
    canonical: pageUrl,
  },
  keywords: [
    'bank guarantee format',
    'bank guarantee format india',
    'performance bank guarantee format',
    'bank guarantee letter format',
    'advance payment guarantee format',
    'unconditional bank guarantee',
    'bg invocation format',
  ],
  openGraph: {
    title: 'Bank Guarantee Format India (Word) — Free BG Draft Generator',
    description:
      'Free bank guarantee format for India — financial, performance & advance payment BG drafts in Word/PDF. Stamp duty, invocation rules explained.',
    url: pageUrl,
    type: 'website',
    images: [
      {
        url: 'https://www.corplawupdates.in/images/documents/bank-guarantee-format-india.svg',
        width: 1200,
        height: 630,
        alt: 'Bank guarantee format India legal and stamp duty framework infographic',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bank Guarantee Format India (Word) — Free BG Draft Generator',
    description:
      'Free bank guarantee format for India — financial, performance & advance payment BG drafts in Word/PDF. Stamp duty, invocation rules explained.',
    images: ['https://www.corplawupdates.in/images/documents/bank-guarantee-format-india.svg'],
  },
}

const faqs = [
  {
    question: 'What is the difference between a performance guarantee and a financial guarantee?',
    answer:
      'A financial guarantee secures a direct monetary payment obligation (e.g. loan repayment, deferred customs duties, or advance recovery). A performance guarantee secures the timely and satisfactory completion of contractual deliverables (e.g. EPC works, turnkey projects, or tender obligations). Both are tripartite contracts of guarantee governed by Sections 126–147 of the Indian Contract Act, 1872.',
  },
  {
    question: 'Can a bank refuse to pay when a guarantee is invoked?',
    answer:
      'For an unconditional (on-demand) guarantee, no. The bank’s commitment to the beneficiary is autonomous and independent of underlying contractual disputes. The bank must honour a formally compliant demand. The Supreme Court of India recognises only two narrow exceptions where courts may grant an injunction against encashment: established egregious fraud known to the bank, and irretrievable injustice/special equities.',
  },
  {
    question: 'What is the stamp duty on a bank guarantee in Maharashtra?',
    answer:
      'Under Article 34A of the Maharashtra Stamp Act (inserted by the Maharashtra Stamp (Fourth Amendment) Act, 2026, notified 22 July 2026): (1) 0.1% of the amount secured (minimum ₹500) for guarantees up to ₹5 Lakh; (2) 0.3% of the amount secured (maximum ₹20 Lakh) for guarantees exceeding ₹5 Lakh; (3) ₹500 flat for guarantees executed in favour of a Government Corporation, Local Authority, or Statutory Body for public works or public procurement; (4) 0.25% (maximum ₹25,000) for renewals or extensions without enhancement.',
  },
  {
    question: 'What happens if the guarantee expires before invocation?',
    answer:
      'An expired guarantee cannot be legally invoked after the stated validity period and claim period have lapsed. Once the claim expiry date passes, the issuing bank’s liability is automatically extinguished, and the beneficiary forfeits the right to encash the guarantee. Failure to lodge a formal claim within the claim window is the single most common cause of failed BG invocations.',
  },
  {
    question: 'Is an e-bank guarantee valid?',
    answer:
      'Yes. Electronic bank guarantees (e-BGs) issued via National E-Governance Services Ltd. (NeSL) are fully recognised and legally enforceable under Indian law. They integrate digital stamping, electronic signatures (DSC), and direct depository messaging, eliminating the transmission delays, stamp paper custody challenges, and physical verification risks of paper guarantees.',
  },
  {
    question: 'Who are the three parties to a bank guarantee?',
    answer:
      'A bank guarantee involves three statutory parties under Section 126 of the Indian Contract Act, 1872: (1) The Principal Debtor (Applicant) on whose behalf the guarantee is issued; (2) The Creditor (Beneficiary) in whose favour the guarantee is executed; and (3) The Surety (Issuing Bank) who undertakes to pay the guaranteed amount upon default or formal demand.',
  },
  {
    question: 'Does the bank investigate the underlying dispute before paying?',
    answer:
      'No. In an unconditional or on-demand bank guarantee, the issuing bank is legally barred from adjudicating underlying contract claims, delay penalties, or quality disputes between the applicant and beneficiary. The bank must pay immediately upon presentation of a written demand complying with the guarantee terms, and subsequently recover the sum from the applicant under the counter-indemnity.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Bank Guarantee Format India (Word) — Free BG Draft Generator',
      description:
        'Free bank guarantee format for India — financial, performance & advance payment BG drafts in Word/PDF. Stamp duty, invocation rules explained.',
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://www.corplawupdates.in/#website' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Documents', item: 'https://www.corplawupdates.in/documents' },
        { '@type': 'ListItem', position: 3, name: 'Bank Guarantee', item: pageUrl },
      ],
    },
  ],
}

export default function BankGuaranteePage() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
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
              Bank Guarantee Format
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 mb-4">
              <Landmark className="h-3.5 w-3.5" />
              Indian Contract Act, 1872 &bull; Sections 124–147 &bull; Maharashtra Article 34A
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              Bank Guarantee Format (India) — Free Generator
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Generate an ironclad Bank Guarantee draft for tender deposits, contractual performance, or advance mobilisation payments.
              Includes automatic Indian number-to-words conversion, Maharashtra July 2026 Article 34A stamp duty calculator, and verified Supreme Court invocation safeguards.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Financial, Performance &amp; Advance Payment BG Options
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Updated: <strong>14 October 2026</strong> (Post-July 2026 Amendment)
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Word (.docx) &amp; Print-Ready PDF
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Direct Answer Box for AI Overviews / Featured Snippets */}
        <section className="bg-linear-to-br from-blue-50/80 via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 p-6 md:p-8 rounded-2xl border border-blue-100 dark:border-blue-950/80 mb-10 shadow-2xs">
          <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            Statutory Legal Framework (Direct Answer)
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
            What is a Bank Guarantee under Indian Law?
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-4">
            Under <strong>Section 126 of the Indian Contract Act, 1872</strong>, a <strong>Bank Guarantee (BG)</strong> is an independent tripartite legal instrument whereby an issuing bank (the <em>surety</em>) irrevocably undertakes to pay a specified monetary sum to the beneficiary (the <em>creditor</em>) upon default or written demand on behalf of the customer (the <em>principal debtor</em>).
            For <strong>unconditional (on-demand) guarantees</strong>, the bank’s payment commitment is completely independent of the underlying commercial dispute, and Indian courts will strictly refrain from granting injunctions against invocation except in proven cases of established fraud or irretrievable injustice.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-blue-100 dark:border-slate-800">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Governing Law:</strong> Sections 124–147 Indian Contract Act, 1872; Section 128 co-extensive liability.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Maharashtra Duty:</strong> Article 34A (effective 22 July 2026): 0.1% up to ₹5L (min ₹500); 0.3% above ₹5L (max ₹20L).</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Autonomous Contract:</strong> Bank cannot enquire into contract disputes under unconditional on-demand BGs.</span>
            </div>
          </div>
        </section>

        {/* Interactive Generator Section */}
        <section id="generator" className="scroll-mt-16 mb-16">
          <BankGuaranteeClient />
        </section>

        {/* Infographic Overview */}
        <section className="mb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Bank Guarantee Lifecycle &amp; Invocation Framework
            </h2>
            <div className="relative aspect-1200/630 w-full overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
              <Image
                src="/images/documents/bank-guarantee-format-india.svg"
                alt="Bank guarantee format India legal and stamp duty framework infographic"
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </div>
          </div>
        </section>

        {/* Guide Section 1: Legal Basis & Tripartite Structure */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Legal Basis &amp; Tripartite Structure under the Indian Contract Act, 1872
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            A Bank Guarantee is statutorily classified as a <strong>contract of guarantee</strong> under <strong>Sections 124 to 147</strong> of the Indian Contract Act, 1872. Understanding the tripartite relationship is vital for both issuing banks and corporate beneficiaries:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800 font-bold text-sm mb-3 dark:bg-blue-950 dark:text-blue-300">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                The Principal Debtor (Applicant)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                The primary contractor, vendor, or borrower whose underlying performance or payment obligation is being secured. The applicant applies to the issuing bank, provides collateral or margin money, and executes a binding counter-indemnity.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800 font-bold text-sm mb-3 dark:bg-blue-950 dark:text-blue-300">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                The Creditor (Beneficiary)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                The project authority, buyer, government department, or lender in whose favour the guarantee is issued. The beneficiary holds the unilateral right to invoke the guarantee upon default without needing the applicant&apos;s concurrence.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800 font-bold text-sm mb-3 dark:bg-blue-950 dark:text-blue-300">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                The Surety (Issuing Bank)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Under <strong>Section 126</strong>, the bank acts as surety. Under <strong>Section 128</strong>, the surety’s liability is co-extensive with that of the principal debtor, but in unconditional guarantees, the bank’s undertaking is strictly primary and independent.
              </p>
            </div>
          </div>
        </section>

        {/* Guide Section 2: Types of Bank Guarantees */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Types of Bank Guarantees &amp; Their Commercial Applications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white text-base">
                <Landmark className="w-4 h-4 text-indigo-600" />
                Performance Guarantee (PBG)
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Secures the prompt and satisfactory completion of contractual commitments. Ubiquitous in EPC contracts, government tenders, and supply agreements. If the vendor fails to meet technical milestones or delays delivery, the buyer encashes the PBG as liquidated damages.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white text-base">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Financial Guarantee
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Secures a direct financial repayment obligation. Used for securing loan repayment, deferred customs duty payments, judicial security deposits, or electricity board billing guarantees. The bank acts as a financial backstop.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white text-base">
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                Advance Payment Guarantee (APG)
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Secures the mobilization or upfront advance funds disbursed by the project owner to the contractor. If the contractor fails to utilize the advance for project works or abandons the contract, the owner recovers the unadjusted balance immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Guide Section 3: The "On-Demand" Rule & Supreme Court Invocation Doctrine */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            The &quot;On-Demand&quot; Autonomy Rule &amp; Supreme Court Injunction Exceptions
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              In commercial transactions, the vast majority of bank guarantees are drafted as <strong>unconditional (on-demand) guarantees</strong>. Under settled Indian jurisprudence, an unconditional guarantee represents an <strong>autonomous and independent contract</strong> between the issuing bank and the beneficiary.
            </p>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              When the beneficiary issues a demand letter confirming default, the bank is legally obligated to honour the demand <strong>without reference to the applicant and without examining disputes</strong> regarding contractual performance, delay claims, or counter-claims.
            </p>

            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-4">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-2">
                <Gavel className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                The Two Exclusive Supreme Court Exceptions (Stay of Encashment)
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mb-3">
                Through a long line of landmark judgments &mdash; including <em>U.P. State Sugar Corporation v. Sumac International Ltd. (1997)</em>, <em>BSES Ltd. v. Fenner India Ltd. (2006)</em>, and <em>Standard Chartered Bank v. Heavy Engineering Corporation Ltd. (2020)</em> &mdash; the Supreme Court of India has established that courts will NOT grant an injunction restraining invocation of an unconditional bank guarantee, <strong>except under two strictly defined circumstances</strong>:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                <li>
                  <strong>Egregious Fraud:</strong> Fraud of an egregious nature that permeates the very foundation of the bank guarantee or the underlying contract, such that the beneficiary seeks to take fraudulent advantage of the bank, and the fraud is known to the bank. Ordinary breach of contract or disputable deductions do not constitute fraud.
                </li>
                <li>
                  <strong>Irretrievable Injustice / Special Equities:</strong> Circumstances where encashment would result in irretrievable damage or ruinous injustice of such exceptional magnitude that it would be impossible for the applicant to be reimbursed subsequently through arbitration or a civil suit.
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Guide Section 4: Validity Period vs Claim Period Callout */}
        <section className="mb-14">
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/70 p-6 dark:border-rose-900/60 dark:bg-rose-950/20">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm uppercase tracking-wider mb-2">
              <AlertTriangle className="w-5 h-5" />
              Critical Distinction: Validity Period vs. Claim Period
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
              Why Expired Guarantees Cannot Be Invoked
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Failure to appreciate the difference between the <strong>Validity Period</strong> and the <strong>Claim Period</strong> is the single most common cause of litigation and lost recoveries in Indian commercial contracts:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  Validity Period (Performance Horizon)
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  The operative duration during which the contractor is required to perform the underlying works or supply the goods. Any contractual default giving rise to a claim must occur within this period.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  Claim Period (Grace / Lodgement Window)
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  An additional window (typically 30, 60, or 90 days after validity expiry) during which the beneficiary is permitted to physically deliver its written demand letter at the issuing bank&apos;s counter. Once the claim expiry date passes, the bank’s legal liability is completely discharged under Section 28 (Exception 3) of the Contract Act.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guide Section 5: Continuing Guarantees & Discharge of Surety */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Continuing Guarantees &amp; Statutory Discharge of Surety
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The Indian Contract Act provides comprehensive rules governing the duration and termination of surety obligations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  Continuing Guarantee (Section 129 &amp; 130)
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  Under <strong>Section 129</strong>, a guarantee which extends to a series of transactions is a continuing guarantee. Under <strong>Section 130</strong>, it may be revoked by the surety as to future transactions by notice to the creditor. Standard commercial BGs contractually exclude Section 130 revocation to ensure uncompromised security.
                </p>
              </div>

              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  Discharge by Variance in Terms (Section 133–139)
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                  Under <strong>Section 133</strong>, any material variance made without the surety&apos;s consent in the terms of the underlying contract discharges the surety as to transactions subsequent to the variance. Similarly, release of principal debtor (Sec 134) or compromise (Sec 135) discharges the surety unless contractually waived.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guide Section 6: Stamp Duty Framework & Maharashtra July 2026 Amendment */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Stamp Duty on Bank Guarantees — Maharashtra July 2026 Amendment (Article 34A)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Stamp duty is an exclusive State subject under Entry 44 of the Concurrent List (Seventh Schedule of the Constitution of India).
            In Maharashtra, the <strong>Maharashtra Stamp (Fourth Amendment) Act, 2026</strong> (notified on <strong>22 July 2026</strong>) created a dedicated statutory regime by inserting <strong>Article 34A</strong> into Schedule I, superseding the earlier Article 5(h) treatment:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs mb-6">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3.5">Guarantee Category / Amount</th>
                  <th className="p-3.5">Current Duty (Article 34A, Post-22 July 2026)</th>
                  <th className="p-3.5">Prior Duty (Article 5(h), Pre-July 2026)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">Up to ₹5,00,000</td>
                  <td className="p-3.5 font-semibold text-emerald-600">0.1% of secured amount (Minimum ₹500)</td>
                  <td className="p-3.5">0.1% up to ₹10 Lakh (Minimum ₹100)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">Exceeding ₹5,00,000</td>
                  <td className="p-3.5 font-semibold text-blue-600">0.3% of secured amount (Maximum ₹20 Lakh)</td>
                  <td className="p-3.5">0.2% above ₹10 Lakh</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">In favour of Government / Local Body for Public Works / Procurement</td>
                  <td className="p-3.5 font-semibold text-purple-600">₹500 flat concession</td>
                  <td className="p-3.5">Standard ad-valorem rate</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">Renewal / Extension without Amount Enhancement</td>
                  <td className="p-3.5">0.25% of secured amount (Maximum ₹25,000)</td>
                  <td className="p-3.5">Re-stamped as fresh instrument</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">Letter of Guarantee (other than above)</td>
                  <td className="p-3.5">₹500 flat</td>
                  <td className="p-3.5">₹100 flat</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>State Variation Notice:</strong> Rates for other states (such as Delhi, Karnataka, Tamil Nadu, and Uttar Pradesh) differ substantially. In Delhi, bank guarantees are generally stamped under Article 37 (Letter of Guarantee); in Karnataka, Article 30 applies. Always verify rates against the specific Stamp Act of the state where the guarantee is executed or received.
          </div>
        </section>

        {/* Guide Section 7: Electronic Bank Guarantees (e-BGs) via NeSL */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Electronic Bank Guarantees (e-BGs) via NeSL Platform
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              In recent years, the Ministry of Finance and major public sector banks (including SBI, PNB, and Bank of Baroda) have transitioned towards <strong>Electronic Bank Guarantees (e-BGs)</strong> administered via the <strong>NeSL (National E-Governance Services Ltd.)</strong> platform:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Instant Digital Stamping</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Automated e-stamping integrated with State Stamp Treasuries eliminates physical stamp paper procurement and fraud.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Digital Signature (DSC)</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Executing bank officers sign electronically via Class-3 DSC; verified directly against the NeSL registry.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Zero Courier Delays</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Beneficiaries receive instantaneous, cryptographically verified e-BG records, accelerating tender execution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guide Section 8: Water-Tight Drafting Checklist */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Checklist for a Water-Tight Bank Guarantee Draft
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Issuing Branch &amp; Operative Counter:</strong> Exact branch address where demands must be physically lodged.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Full Party Details:</strong> Official corporate names, registered offices, and CIN / PAN of applicant and beneficiary.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Guarantee Amount in Words &amp; Figures:</strong> Unambiguous monetary ceiling in Indian Rupees.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Contract / Tender Reference:</strong> Precise LoA / tender number, agreement date, and subject matter.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Explicit On-Demand Covenant:</strong> Bank agrees to pay upon beneficiary’s first written demand without contest.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Distinct Validity &amp; Claim Expiry Dates:</strong> Explicit calendar cutoff dates for performance and claims.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Exclusion of Section 130:</strong> Waiver of applicant&apos;s right to revoke the guarantee.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Execution by Authorised Signatories:</strong> Bank officer power-of-attorney numbers (P.A. codes) and seal.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Guide Section 9: Practical Invocation Steps */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Practical 5-Step Bank Guarantee Invocation Procedure
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                1
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Step 1: Draft Formal Demand Letter on Beneficiary Letterhead
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Draft a formal invocation letter citing the BG Number, issue date, guaranteed sum, and a statement that the applicant has committed default under the underlying contract. Ensure the demand complies verbatim with the invocation clause.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                2
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Step 2: Lodge Demand Within Validity and Claim Window
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Deliver the demand letter in person via authorised representative or via registered speed post at the designated bank branch before the close of banking hours on or before the claim expiry date. Obtain an official stamp and acknowledgement receipt.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                3
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Step 3: Bank Scrutiny of Demand Notice
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  The bank’s trade finance team verifies that the demand is received within the claim period, is signed by an authorised officer of the beneficiary, and correctly cites the BG particulars.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                4
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Step 4: Immediate Remittance to Beneficiary
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  For unconditional guarantees, the bank remits the claimed amount via RTGS or demand draft. The bank does not request permission from the applicant or await adjudication of underlying contractual disputes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                5
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Step 5: Bank Recovers from Applicant under Counter-Indemnity
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Following pay-out, the bank exercises its right of set-off by debiting the applicant’s margin account, cash credit limit, or liquidating pledged fixed deposit receipts (FDRs) under the counter-indemnity agreement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Document Links */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            Related Trade Finance &amp; Corporate Instruments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/documents/letter-of-credit"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Letter of Credit (LC)</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Commercial documentary credit format aligned with UCP 600 guidelines.
              </p>
            </Link>

            <Link
              href="/documents/equitable-mortgage-deed"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Equitable Mortgage Deed</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Mortgage by deposit of title deeds for commercial bank credit facilities.
              </p>
            </Link>

            <Link
              href="/documents/board-resolution-bank-account"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Board Resolution: Bank Limits</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Board authority resolution for availing non-fund-based bank guarantee limits.
              </p>
            </Link>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions on Bank Guarantees
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
            Clear, authoritative guidance on Indian Contract Act provisions, stamp duty amendments, and court precedents:
          </p>

          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group p-5">
                <summary className="cursor-pointer list-none pr-8 text-sm sm:text-base font-semibold text-slate-900 dark:text-white marker:hidden flex items-center justify-between">
                  <span>{question}</span>
                  <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <div className="rounded-xl border border-slate-200 bg-slate-100/60 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 leading-relaxed">
          <strong>Disclaimer:</strong> This free Bank Guarantee draft generator and legal compliance guide are provided for informational and educational purposes only. Bank guarantee texts, margin requirements, counter-indemnities, and sanction terms are subject to the internal credit policies of the issuing bank and specific tender conditions. Parties should obtain professional legal counsel from an advocate or banking law specialist before executing commercial guarantees.
        </div>
      </div>

      <JsonLd id="bank-guarantee-faq-schema" data={jsonLd} />
    </div>
  )
}
