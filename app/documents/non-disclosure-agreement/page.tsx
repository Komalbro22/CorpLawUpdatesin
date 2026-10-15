import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShieldCheck,
  Building2,
  Scale,
  FileCheck2,
  Landmark,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  ArrowRight,
  Gavel,
  Lock,
  Check,
  AlertTriangle,
} from 'lucide-react'
import NdaClient from './NdaClient'
import JsonLd from '@/components/JsonLd'

export const revalidate = 86400

const pageUrl = 'https://www.corplawupdates.in/documents/non-disclosure-agreement'

export const metadata: Metadata = {
  title: 'Free NDA Format India (Word) — Non-Disclosure Agreement Generator',
  description:
    'Generate a free Non-Disclosure Agreement (NDA) for India in Word/PDF. Mutual & one-way formats, stamp paper guide, clauses explained. No sign-up.',
  alternates: {
    canonical: pageUrl,
  },
  keywords: [
    'non disclosure agreement format india',
    'nda format india',
    'nda agreement format in word',
    'mutual nda format',
    'nda format for employees',
    'confidentiality agreement format india',
    'one-way nda vs mutual nda',
  ],
  openGraph: {
    title: 'Free NDA Format India (Word) — Non-Disclosure Agreement Generator',
    description:
      'Generate a free Non-Disclosure Agreement (NDA) for India in Word/PDF. Mutual & one-way formats, stamp paper guide, clauses explained. No sign-up.',
    url: pageUrl,
    type: 'website',
    images: [
      {
        url: 'https://www.corplawupdates.in/images/documents/non-disclosure-agreement-format-india.svg',
        width: 1200,
        height: 630,
        alt: 'Non-disclosure agreement format India legal guide infographic',
      },
    ],
  },
}

const faqs = [
  {
    question: 'Is an NDA legally valid in India?',
    answer:
      'Yes. It is enforceable as a contract under the Indian Contract Act, 1872, provided it has offer, acceptance, consideration, lawful object, and the parties are competent to contract. There is no separate "NDA Act".',
  },
  {
    question: 'What stamp paper value is required for an NDA?',
    answer:
      'It varies by state; typically ₹100–₹500. The duty is fixed, not value-based. Check the Stamp Act of the state where it is executed; e-stamping is equally valid.',
  },
  {
    question: 'Does an NDA need to be registered or notarised?',
    answer:
      'Neither is required for validity. Registration with the Sub-Registrar is not needed; notarisation is optional and only helps prove signature authenticity.',
  },
  {
    question: 'One-way vs mutual NDA — which do I need?',
    answer:
      'One-way when only one side shares secrets (e.g. employer→employee, startup→investor). Mutual when both sides will disclose (e.g. merger talks, JVs).',
  },
  {
    question: 'How long should an NDA last?',
    answer:
      'Commonly 2–5 years of confidentiality obligations, often surviving termination. Perpetual obligations are possible for true trade secrets but harder to justify for general business information.',
  },
  {
    question: 'Can an employee NDA stop someone from joining a competitor?',
    answer:
      'A confidentiality clause can stop them from disclosing your secrets to the competitor. A clause stopping them from joining the competitor is a restraint of trade and risks being void under Section 27 of the Contract Act.',
  },
  {
    question: 'Is a digitally signed / e-stamped NDA valid?',
    answer:
      'Yes. E-signatures are valid under the IT Act, 2000, and e-stamping is legally equivalent to physical stamp paper.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Free NDA Format India (Word) — Non-Disclosure Agreement Generator',
      description:
        'Generate a free Non-Disclosure Agreement (NDA) for India in Word/PDF. Mutual & one-way formats, stamp paper guide, clauses explained. No sign-up.',
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
        { '@type': 'ListItem', position: 3, name: 'Non-Disclosure Agreement', item: pageUrl },
      ],
    },
  ],
}

export default function NdaPage() {
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
              Non-Disclosure Agreement
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Indian Contract Act, 1872 &bull; Validated 14 October 2026
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              Non-Disclosure Agreement (NDA) Format for India — Free Generator
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Generate a legally enforceable Non-Disclosure Agreement (NDA) for India in Microsoft Word (.docx) and PDF.
              Customise mutual or one-way confidentiality covenants, specific business purpose clauses, trade-secret protections,
              and state-level stamp paper guidance.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No Standalone &ldquo;NDA Act&rdquo; &mdash; Contract Act Governed
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Updated: <strong>October 2026</strong>
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
        {/* Quick Statutory Summary (Direct Answer Box) */}
        <section className="bg-linear-to-br from-indigo-50/80 via-blue-50/50 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-950/80 mb-10 shadow-2xs">
          <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            Quick Statutory Summary (Direct Answer)
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
            What is a Non-Disclosure Agreement (NDA) in India?
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-4">
            A <strong>Non-Disclosure Agreement (NDA)</strong>, also termed a Confidentiality Agreement or Proprietary Information Agreement,
            is a private contract governed under the <strong>Indian Contract Act, 1872</strong>.
            India has <strong>no standalone NDA statute</strong> &mdash; confidentiality covenants derive legal force from general contract law,
            equitable breach-of-confidence principles, and the Information Technology Act, 2000.
            An NDA legally restricts the recipient from disclosing, using, or exploiting trade secrets, technical source code, financials,
            and business plans without authorization.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-indigo-100 dark:border-slate-800">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Section 27 Caution:</strong> Reasonable confidentiality is valid; post-employment non-compete is VOID.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Stamp Paper:</strong> State subject &mdash; typically ₹100 to ₹500 non-judicial or e-Stamp.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Registration:</strong> NOT required with Sub-Registrar; proper stamping ensures admissibility.</span>
            </div>
          </div>
        </section>

        {/* Interactive Generator Section */}
        <section id="generator" className="scroll-mt-16 mb-16">
          <NdaClient />
        </section>

        {/* Infographic Overview */}
        <section className="mb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              Non-Disclosure Agreement Legal Architecture at a Glance
            </h2>
            <div className="w-full overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
              <Image
                src="/images/documents/non-disclosure-agreement-format-india.svg"
                alt="Non-disclosure agreement format India legal guide infographic"
                width={1200}
                height={630}
                unoptimized
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* Guide Section 1: Types of NDAs */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Types of Non-Disclosure Agreements in India
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Depending on commercial circumstances and the direction of information flow, Indian transactions employ two primary types:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="rounded-sm bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Unilateral / One-Way
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                One-Way Non-Disclosure Agreement
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Used when only one party discloses confidential assets to the other. Common scenarios include an employer disclosing proprietary code to an employee, a startup pitching to an angel investor, or a business sharing customer databases with an outsourced contractor.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="rounded-sm bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                Bilateral / Mutual
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                Mutual Non-Disclosure Agreement
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Used when both parties share confidential information with each other. Standard in joint-venture negotiations, merger and acquisition (M&amp;A) discussions, technology integration partnerships, and co-development ventures where mutual data exchange is necessary.
              </p>
            </div>
          </div>
        </section>

        {/* Guide Section 2: Essential Clauses */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Essential Clauses in an Indian NDA &amp; Drafting Analysis
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            To survive judicial scrutiny in Indian courts, an NDA must be balanced, time-bound, and clear. Our generator incorporates these verified statutory clauses:
          </p>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                1. Definition of Confidential Information
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Must specifically enumerate protected categories (customer lists, proprietary source code, financial models, pricing algorithms) rather than claiming &ldquo;all information exchanged&rdquo;. Overly broad definitions risk ambiguity during enforcement.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Exclusions from Confidentiality
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Standard legal carve-outs where confidentiality does not apply: information already in the public domain without breach, information already known to the recipient, independently developed data, or disclosures compelled by court orders or Indian regulatory authorities.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. Standard of Care &amp; Non-Use
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Explicitly restricts the recipient from using confidential data for any purpose other than the agreed &ldquo;Authorized Purpose&rdquo;. Imposes an obligation to use at least reasonable care and restricts disclosures to need-to-know personnel.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                4. Term &amp; Survival (2 to 5 Years vs Trade Secrets)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Confidentiality obligations typically survive for 2 to 5 years following termination of discussions. For core proprietary trade secrets (e.g. source formulas or algorithms), survival can be perpetual.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5. Remedies &amp; Injunctions under Specific Relief Act, 1963
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                In trade secret breaches, monetary damages are almost always inadequate because a leaked secret cannot be un-leaked. The NDA must explicitly entitle the disclosing party to seek interim injunctions and specific performance under the Specific Relief Act, 1963.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                6. Dispute Resolution under Arbitration and Conciliation Act, 1996
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Parties can opt for confidential sole-arbitrator arbitration with a designated seat, preventing sensitive commercial disputes from becoming matter of public record in civil court records.
              </p>
            </div>
          </div>
        </section>

        {/* Guide Section 3: Section 27 Restraint of Trade & IT Act */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Section 27 of Contract Act &amp; Employee Non-Compete Distinctions
          </h2>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/40 dark:bg-amber-950/20 leading-relaxed text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              Under <strong>Section 27 of the Indian Contract Act, 1872</strong>, every agreement by which anyone is restrained from exercising a lawful profession, trade, or business of any kind is <strong>void to that extent</strong>.
            </p>
            <p>
              Indian courts (including landmark Supreme Court rulings such as <em>Percept D&apos;Mark (India) (P) Ltd. v. Zaheer Khan</em>) have established that while a <strong>post-employment non-compete clause is completely void</strong>, a <strong>reasonable confidentiality clause is NOT a restraint of trade</strong>.
              A confidentiality obligation does not prevent an employee or partner from earning a livelihood; it merely prevents them from stealing and exploiting proprietary trade secrets.
            </p>
            <p>
              <strong>Digital Data &amp; IT Act, 2000:</strong> Where confidential information includes sensitive digital personal data or software source code, <strong>Section 43A</strong> and <strong>Section 72A</strong> of the Information Technology Act, 2000 impose strict statutory compensation for negligence in maintaining security practices. Parties must also adhere to the <strong>Digital Personal Data Protection Act, 2023 (DPDP)</strong>.
            </p>
          </div>
        </section>

        {/* Guide Section 4: Stamp Duty & Supreme Court 2023 Ruling */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Stamp Duty, Registration &amp; The Supreme Court 2023 Ruling
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Stamp Paper Requirements (State Subject)
              </h3>
              <p>
                Stamp duty on agreements is a <strong>state subject</strong> under Entry 63 of List II (State List) of the Constitution of India.
                There is <strong>no single all-India stamp duty rate</strong> for an NDA.
                Typically, an NDA attracts nominal non-judicial stamp duty under Article 5 (&ldquo;Agreement&rdquo;) of the respective State Stamp Act, commonly ranging from <strong>₹100 to ₹500</strong>.
                E-stamping via Stock Holding Corporation of India (SHCIL) or state cyber treasuries is legally equivalent to physical stamp paper. Check the specific Stamp Act of the state where execution takes place.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Registration with Sub-Registrar is NOT Required
              </h3>
              <p>
                An NDA does not create or transfer any interest in immovable property and therefore does <strong>not require compulsory registration</strong> under Section 17 of the Registration Act, 1908. Proper stamping with payment of the requisite state duty is sufficient for legal admissibility.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Unstamped NDA: Supreme Court 7-Judge Bench Ruling (December 2023)
              </h3>
              <p>
                Under Section 35 of the Indian Stamp Act, 1899, an unstamped or insufficiently stamped agreement is inadmissible in evidence until impounded and the deficit duty plus penalty is paid.
                However, in a historic verdict (<em>In re: Interplay Between Arbitration Agreements under the Arbitration and Conciliation Act, 1996 and the Indian Stamp Act, 1899</em>, delivered in <strong>December 2023</strong>), a 7-judge Constitution Bench of the Supreme Court held that <strong>an arbitration clause in an unstamped agreement is NOT void ab initio</strong>.
                The court will impound the agreement and direct payment of duty rather than refusing arbitration, ensuring contractual dispute mechanisms remain protected.
              </p>
            </div>
          </div>
        </section>

        {/* Guide Section 5: Step-by-Step Execution Checklist */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Practical Step-by-Step NDA Execution Checklist
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <ol className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
              <li>
                <strong>Select Agreement Type:</strong> Determine whether the relationship warrants a One-Way NDA (startup to investor, employer to worker) or a Mutual NDA (merger discussions, joint development).
              </li>
              <li>
                <strong>Customise Form Inputs:</strong> Specify the exact commercial purpose, defining clear boundaries so the confidentiality covenants cannot be challenged as vague or overbroad.
              </li>
              <li>
                <strong>Procure Correct Stamp Paper:</strong> Obtain non-judicial stamp paper or e-Stamping certificate of appropriate value (commonly ₹100&ndash;₹500 depending on the state of execution).
              </li>
              <li>
                <strong>Execute on Every Page:</strong> Authorized signatories of both entities must sign on the signature block and initial the bottom of <strong>every single page</strong> of the document.
              </li>
              <li>
                <strong>Witness Attestation:</strong> While not strictly mandatory under the Contract Act, having two independent adult witnesses attest the signatures reinforces evidential proof.
              </li>
              <li>
                <strong>Retain Counterparts:</strong> In mutual NDAs, execute two original counterparts so each party retains a fully stamped and signed original in corporate records.
              </li>
            </ol>
          </div>
        </section>

        {/* Related Document Generator Links */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            Related Document Formats &amp; Commercial Charters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/documents/employment-agreement"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Employment Agreement</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Full-time employment agreement with IP assignment and statutory wage compliance.
              </p>
            </Link>

            <Link
              href="/documents/memorandum-of-understanding"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Memorandum of Understanding</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Preliminary commercial MoU format with binding confidentiality covenants.
              </p>
            </Link>

            <Link
              href="/documents/service-level-agreement"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Service Level Agreement</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                B2B vendor &amp; SaaS SLA covering uptime targets, response times, and penalties.
              </p>
            </Link>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions about Non-Disclosure Agreements (NDAs)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
            Authoritative answers based on the Indian Contract Act, 1872 and judicial precedents:
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
          <strong>Disclaimer:</strong> This free Non-Disclosure Agreement template is provided for general informational and educational compliance purposes only and does not constitute formal legal advice. While drafted in accordance with the Indian Contract Act, 1872 and judicial precedents, complex IP transactions, mergers, and high-value commercial ventures should be reviewed by a qualified advocate or corporate legal counsel prior to execution.
        </div>
      </div>

      <JsonLd id="nda-faq-schema" data={jsonLd} />
    </div>
  )
}
