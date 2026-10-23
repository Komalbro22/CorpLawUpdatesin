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
  User,
  Check,
  AlertTriangle,
} from 'lucide-react'
import DirectorAppointmentClient from './DirectorAppointmentClient'
import JsonLd from '@/components/JsonLd'

export const revalidate = false

const pageUrl = 'https://www.corplawupdates.in/documents/director-appointment-letter'

export const metadata: Metadata = {
  title: 'Director Appointment Letter Format (India) — Free Word Download',
  description:
    'Free director appointment letter format for private limited companies in India. Companies Act, 2013 compliant — DIR-2, DIN, filing checklist included.',
  alternates: {
    canonical: pageUrl,
  },
  keywords: [
    'director appointment letter format',
    'appointment letter format for director of private limited company',
    'independent director appointment letter format',
    'additional director appointment letter',
    'board resolution for appointment of director',
  ],
  openGraph: {
    title: 'Director Appointment Letter Format (India) — Free Word Download',
    description:
      'Free director appointment letter format for private limited companies in India. Companies Act, 2013 compliant — DIR-2, DIN, filing checklist included.',
    url: pageUrl,
    type: 'website',
    images: [
      {
        url: 'https://www.corplawupdates.in/images/documents/director-appointment-letter-format.svg',
        width: 1200,
        height: 630,
        alt: 'Director appointment letter format India compliance framework infographic',
      },
    ],
  },
}

const faqs = [
  {
    question: 'Is DIR-2 consent mandatory before appointing a director?',
    answer:
      'Yes. Section 152(5) requires the appointee’s written consent in Form DIR-2; the company must file it with the ROC within 30 days along with DIR-12.',
  },
  {
    question: 'What is the deadline for filing DIR-12?',
    answer:
      'Within 30 days of the appointment (Section 170(2)). Late filing attracts additional fees.',
  },
  {
    question: 'Can a person without a DIN be appointed as director?',
    answer:
      'No. A valid DIN (Sections 153–159) is a pre-condition.',
  },
  {
    question: 'How long does an additional director stay in office?',
    answer:
      'Only until the next annual general meeting (Section 161(1)); shareholders must regularise the appointment there.',
  },
  {
    question: 'Is an appointment letter mandatory for an independent director?',
    answer:
      'Yes. Schedule IV requires the appointment to be formalised through a letter of appointment covering term, committees, duties and remuneration, plus a Section 149(7) independence declaration.',
  },
  {
    question: 'Does a director appointment letter need stamp paper?',
    answer:
      'No. It is issued on the company’s letterhead. (Stamp duty applies to the underlying filings only via ROC fees, not the letter.)',
  },
  {
    question: 'What disclosures must a new director make?',
    answer:
      'Disclosure of interest/concern in other entities in Form MBP-1 under Section 184(1), and declaration of non-disqualification under Section 164.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Director Appointment Letter Format (India) — Free Word Download',
      description:
        'Free director appointment letter format for private limited companies in India. Companies Act, 2013 compliant — DIR-2, DIN, filing checklist included.',
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
        { '@type': 'ListItem', position: 3, name: 'Director Appointment Letter', item: pageUrl },
      ],
    },
  ],
}

export default function DirectorAppointmentPage() {
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
              Director Appointment Letter
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Companies Act, 2013 &bull; Sections 149, 152, 161 &amp; Schedule IV
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              Director Appointment Letter Format (India) — Free Generator
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Generate a formal Letter of Appointment for Directors and Independent Directors under the Companies Act, 2013.
              Customise tenures, remuneration, committee mandates, and access a comprehensive 30-day MCA compliance checklist with Form DIR-2, DIR-12, and MBP-1 requirements.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Schedule IV Code for Independent Directors Included
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Verified: <strong>14 October 2026</strong>
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
        {/* Direct Answer Box for AI Overviews / Google Search */}
        <section className="bg-linear-to-br from-emerald-50/80 via-teal-50/50 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 p-6 md:p-8 rounded-2xl border border-emerald-100 dark:border-emerald-950/80 mb-10 shadow-2xs">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            Statutory Compliance Summary (Direct Answer)
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
            What is a Director Appointment Letter under Indian Law?
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-4">
            A <strong>Director Appointment Letter</strong> is an official corporate charter issued on the company&apos;s letterhead formalizing the engagement, roles, fiduciary responsibilities, and remuneration terms of a newly inducted director.
            Under <strong>Schedule IV of the Companies Act, 2013</strong>, issuing a formal appointment letter is a statutory prerequisite for Independent Directors.
            For private and public limited companies appointing Additional Directors or Executive Directors, it defines the contractual relationship, sitting fees, and indemnities, establishing clear documentation before filing <strong>Form DIR-12</strong> with the Registrar of Companies (ROC).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-emerald-100 dark:border-slate-800">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Pre-requisite:</strong> DIN (Sec 153) + Form DIR-2 written consent (Sec 152(5)) mandatory before appointment.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>ROC Deadline:</strong> File Form DIR-12 within 30 days of appointment date (Sec 170(2)).</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>No Stamp Paper:</strong> Issued on company letterhead &mdash; no non-judicial stamp paper required.</span>
            </div>
          </div>
        </section>

        {/* Interactive Generator Section */}
        <section id="generator" className="scroll-mt-16 mb-16">
          <DirectorAppointmentClient />
        </section>

        {/* Infographic Overview */}
        <section className="mb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Director Appointment &amp; MCA Filing Lifecycle
            </h2>
            <div className="w-full overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
              <Image
                src="/images/documents/director-appointment-letter-format.svg"
                alt="Director appointment letter format India compliance framework infographic"
                width={1200}
                height={630}
                unoptimized
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* Guide Section 1: Pre-Appointment Conditions */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Mandatory Pre-Conditions for Appointing a Director
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Under the Companies Act, 2013, the Board of Directors cannot pass a resolution or issue an appointment letter without satisfying these non-negotiable statutory requirements:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                1. Valid Director Identification Number (DIN)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Under <strong>Sections 153 to 159</strong>, every individual proposed to be appointed as a director must hold an active Director Identification Number (DIN) allotted by the Ministry of Corporate Affairs (MCA). An appointment made without a valid DIN is legally void ab initio.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Form DIR-2 Written Consent (Section 152(5))
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Under <strong>Section 152(5)</strong> and Rule 8 of the Companies (Appointment and Qualification of Directors) Rules, 2014, the appointee must execute and furnish a written consent to act as director in <strong>Form DIR-2</strong> prior to the date of appointment.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. Non-Disqualification Declaration (Section 164)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                The director must declare in writing in <strong>Form DIR-8</strong> that they are not disqualified under Section 164(1) or Section 164(2) (e.g. not undischarged insolvent, no court conviction, and not a director of a defaulting company failing to file annual returns for 3 consecutive years).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                4. Disclosure of Interest in Form MBP-1 (Section 184(1))
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Under <strong>Section 184(1)</strong>, the incoming director must disclose their concern or interest in other companies, bodies corporate, firms, or associations in <strong>Form MBP-1</strong> at the first Board meeting in which they participate as a director.
              </p>
            </div>
          </div>
        </section>

        {/* Guide Section 2: Post-Appointment Compliance Checklist */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Post-Appointment ROC Filings &amp; Statutory Compliance Checklist
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                1
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  File Form DIR-12 with ROC within 30 Days (Section 170(2))
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  The company must file an electronic return in <strong>Form DIR-12</strong> on the MCA V3 portal within <strong>30 calendar days</strong> of the appointment. Attachments include: (a) Certified true copy of the Board Resolution, (b) Form DIR-2 consent, (c) Formal Letter of Appointment, and (d) Section 164 declaration. Late filing attracts compounding additional fees.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                2
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Update Register of Directors and Key Managerial Personnel (Section 170(1))
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Enter the particulars of the newly appointed director (DIN, PAN, residential address, nationality, date of birth, date of board resolution, and shares held in the company) in the statutory <strong>Register of Directors and KMP</strong> maintained at the registered office.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                3
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Form MGT-14 Verification Note (Section 117(3))
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Note: In private limited companies, the appointment of an ordinary director or additional director under Section 161 is generally NOT a matter covered under Section 117(3), and therefore Form MGT-14 is not required. However, if the appointment involves a Managing Director, Whole-time Director, or key managerial personnel in a public company, Form MGT-14 must be filed within 30 days.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guide Section 3: Additional Director vs Regular Director */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Additional Director (Section 161(1)) vs Regular Director vs Independent Director
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Appointing Authority</th>
                  <th className="p-3.5">Tenure in Office</th>
                  <th className="p-3.5">Governing Provision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">Additional Director</td>
                  <td className="p-3.5">Board of Directors</td>
                  <td className="p-3.5">Holds office up to the next AGM or due date of AGM</td>
                  <td className="p-3.5 font-mono">Section 161(1)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">Regular Director</td>
                  <td className="p-3.5">Shareholders in General Meeting</td>
                  <td className="p-3.5">As per Articles / rotational or non-rotational term</td>
                  <td className="p-3.5 font-mono">Section 152(2)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">Independent Director</td>
                  <td className="p-3.5">Shareholders (on Board recommendation)</td>
                  <td className="p-3.5">Up to 5 consecutive years; max 2 consecutive terms</td>
                  <td className="p-3.5 font-mono">Section 149(10) &amp; Schedule IV</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Guide Section 4: Section 166 Fiduciary Duties & Stamp Paper */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Fiduciary Duties (Section 166) &amp; Stamp Duty Clarification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 leading-relaxed space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Fiduciary Duties Codified under Section 166
              </h3>
              <p>
                Section 166 of the Companies Act, 2013 imposes strict statutory duties upon all directors:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Act in accordance with the company&apos;s Articles of Association.</li>
                <li>Act in good faith to promote the objects of the company for its members and community.</li>
                <li>Exercise due and reasonable care, skill, and independent judgment.</li>
                <li>Avoid any conflict of interest; make no undue personal gain or advantage.</li>
                <li>Never assign the office of director &mdash; any assignment made is void.</li>
              </ul>
              <p className="text-[11px] text-rose-600 font-semibold pt-1">
                Breach of Section 166 attracts a mandatory statutory fine of ₹1 Lakh to ₹5 Lakh.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 leading-relaxed space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Stamp Paper: Why None is Required for the Letter
              </h3>
              <p>
                Unlike commercial deeds (such as Form SH-4 Share Transfer Deeds or Partnership Deeds), a <strong>Director Appointment Letter is NOT an instrument chargeable with stamp duty</strong> under State Stamp Acts.
              </p>
              <p>
                The appointment letter is an official executive communication issued on the <strong>formal letterhead of the company</strong> signed by an authorized director or company secretary.
              </p>
              <p>
                Statutory filing fees and ROC stamp fees apply exclusively to the online filing of <strong>Form DIR-12</strong> on the MCA portal, not to the underlying physical letterhead appointment letter.
              </p>
            </div>
          </div>
        </section>

        {/* Related Document Links */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            Related Corporate Secretarial Documents &amp; Resolutions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/documents/board-resolution-for-dividend-declaration"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Board Resolution: Dividend</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Statutory board resolution for interim and final dividend under Section 123.
              </p>
            </Link>

            <Link
              href="/documents/share-transfer-deed"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Form SH-4 Share Transfer</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Official physical share transfer deed format with 0.015% stamp duty calculator.
              </p>
            </Link>

            <Link
              href="/documents/partnership-deed"
              className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-xs transition dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                <span>Partnership Deed</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Partnership deed format aligned with Section 40(b) and Income-tax Act, 2025.
              </p>
            </Link>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions about Director Appointments
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6">
            Clear, authoritative answers based on the Companies Act, 2013 and MCA guidelines:
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
          <strong>Disclaimer:</strong> This free Director Appointment Letter generator and compliance guide are provided for educational and secretarial informational purposes only. Appointing directors involves statutory filings under the Companies Act, 2013 with strict penal consequences for non-compliance. Always verify with a practising Company Secretary (CS) or corporate lawyer for transaction-specific advice.
        </div>
      </div>

      <JsonLd id="director-appointment-faq-schema" data={jsonLd} />
    </div>
  )
}
