import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Scale,
  Cloud,
  Server,
  FileText,
  Clock,
  Download,
  Users,
  Sparkles,
  Layers,
  Cpu,
  Building2,
  Headphones,
  Check,
  ArrowRight
} from 'lucide-react'
import SlaClient from './SlaClient'
import JsonLd from '@/components/JsonLd'

const pageUrl = 'https://www.corplawupdates.in/documents/service-level-agreement'

const faqs = [
  {
    question: 'What is a Service Level Agreement (SLA) and what is it used for?',
    answer:
      'A Service Level Agreement (SLA) is a legally binding commitment between a service provider and a client that defines the exact quality, availability, response times, and performance standards expected of the service. It is used to align operational expectations, establish objective performance metrics (such as 99.9% uptime), mitigate business risk, and prescribe non-litigious financial remedies (Service Credits) when thresholds are breached.',
  },
  {
    question: 'How is a Service Level Agreement (SLA) classified?',
    answer:
      'Legally, an SLA is classified as an accessory contract or conditional covenant governed by the Indian Contract Act, 1872 (specifically Section 74 regarding liquidated damages). Operationally, SLAs are classified into three types: (1) Customer-based SLA (covering all services delivered to a single customer); (2) Service-based SLA (a standardized baseline SLA across all customers using one service, such as AWS or SaaS); and (3) Multi-level SLA (combining Corporate, Customer, and Service level tiers).',
  },
  {
    question: 'What is the primary purpose of a Service Level Agreement?',
    answer:
      'The primary purpose of an SLA is fourfold: (1) Setting objective, measurable benchmarks for service delivery; (2) Allocating operational risk between vendor and client; (3) Establishing automated escalation and resolution timelines for system outages; and (4) Providing pre-determined financial compensation (service fee discounts) without the delay and expense of court litigation.',
  },
  {
    question: 'What are the core components of a Service Level Agreement?',
    answer:
      'A comprehensive SLA consists of eight core components: (1) Service Description & Scope; (2) Service Availability & Uptime Metrics; (3) 4-Tier Incident Severity Matrix (P1–P4 response and resolution times); (4) Service Credit & Liquidated Damages calculation formulas; (5) Client Dependencies and Responsibilities; (6) Exclusions & Excused Downtime; (7) Data Privacy & Security (DPDP Act 2023 & CERT-In reporting); and (8) Chronic Failure Exit Rights & Arbitration Governance.',
  },
  {
    question: 'What is the difference between a Service Level Agreement (SLA) and a Contract?',
    answer:
      'A Contract (such as a Master Services Agreement) is the overarching legal foundation establishing legal capacity, intellectual property ownership, indemnities, liability caps, and dispute resolution. An SLA is a specialized operational schedule or annexure attached to that contract that specifically measures performance quality, system uptime, and operational remedies.',
  },
  {
    question: 'What is the difference between a Service Agreement and a Service Level Agreement?',
    answer:
      'A Service Agreement outlines what services will be provided, commercial pricing, payment terms, and duration. A Service Level Agreement (SLA) defines how well those services must be performed—setting quantifiable technical standards (e.g. 99.95% availability, sub-1 hour P1 incident response) and penalties if the provider falls short.',
  },
  {
    question: 'What is the difference between an SLA and a Memorandum of Understanding (MoU)?',
    answer:
      'A Memorandum of Understanding (MoU) records mutual intent and preliminary alignment between parties before a definitive commercial agreement is drafted, and is often non-binding. In contrast, an SLA is a legally enforceable, binding contract with defined financial liabilities and service credit penalties executed under the Indian Contract Act, 1872.',
  },
  {
    question: 'What is a Service Level Agreement in cloud computing (e.g., AWS, Azure, SaaS)?',
    answer:
      'In cloud computing (IaaS, PaaS, SaaS), an SLA specifies infrastructure availability (such as 99.9% or 99.99% uptime), network latency thresholds, data durability (e.g. AWS S3 11-nines durability), Recovery Time Objectives (RTO), Recovery Point Objectives (RPO), and tiered service credit rebates for unscheduled cloud downtime or API outages.',
  },
  {
    question: 'How do AWS Service Level Agreements structure service credits?',
    answer:
      'AWS SLAs (such as for Amazon EC2 or Amazon S3) calculate Monthly Uptime Percentage (MUP). If MUP drops below 99.99% but remains above 99.0%, AWS provides a 10% service credit; if uptime drops between 99.0% and 95.0%, a 25% credit applies; and if uptime falls below 95.0%, AWS credits 100% of the affected service billing against future invoices.',
  },
  {
    question: 'What should be included in an SLA between two companies?',
    answer:
      'An SLA between two enterprise companies must clearly define: authorized corporate representatives, explicit in-scope and out-of-scope boundaries, service availability windows, escalation contact matrix, audit rights for SOC 2 / ISO certifications, data processing protocols under Section 8 of the DPDP Act 2023, Section 74 liquidated damages caps (15%–25%), and arbitration seated under the Arbitration and Conciliation Act, 1996.',
  },
  {
    question: 'What is a BPO Service Level Agreement and what metrics does it measure?',
    answer:
      'A BPO (Business Process Outsourcing) SLA governs customer support and back-office operations. It tracks operational metrics including First Contact Resolution (FCR ≥ 85%), Average Handle Time (AHT), Call Abandonment Rate (≤ 3%), Quality Assurance (QA ≥ 92%), and Customer Satisfaction (CSAT ≥ 90%).',
  },
  {
    question: 'Where can I download an SLA template in Word (.docx) and PDF format for India?',
    answer:
      'You can download professional, legally verified Service Level Agreement templates in editable Microsoft Word (.docx) and printable PDF format directly from this page using the 1-click download buttons above. Formats are fully vetted under Indian contract law for Cloud/IT SaaS, Vendor Management, Software AMC, and Recruitment workflows.',
  },
  {
    question: 'How are SLA penalties or service credits governed under Indian contract law?',
    answer:
      'Under Indian law, SLA financial remedies are governed by Section 74 of the Indian Contract Act, 1872. Indian courts enforce "liquidated damages" if they represent a genuine pre-estimate of loss suffered due to service failure. If the clause imposes an arbitrary, exorbitant penalty without relation to actual damage, courts will decline to enforce it as a penal forfeiture. Hence, SLAs typically cap service credits at 15% to 25% of monthly billing.',
  },
  {
    question: 'What are the standard incident severity levels in an IT/SaaS SLA?',
    answer:
      'Standard SLAs categorize incidents into four tiers: Severity 1 (Critical: core system outage, response within 1 hour, resolve within 4 hours); Severity 2 (High: major degradation without workaround, response within 2 hours, resolve within 8 hours); Severity 3 (Medium: partial function bug with workaround, response within 8 hours, resolve within 24 hours); and Severity 4 (Low: minor cosmetic query or documentation request, response within 24 hours, resolve within 72 hours).',
  },
  {
    question: 'What is the standard stamp duty on a Service Level Agreement in India?',
    answer:
      'Commercial agreements such as SLAs are executed on non-judicial stamp paper under Article 5 of the relevant State Stamp Act. Stamp duty varies by state: in Maharashtra, it is typically ₹500 (or 0.1%–0.2% depending on contract value); in Delhi, ₹100; in Karnataka, ₹200–₹500; and in Uttar Pradesh, ₹100. Unstamped agreements cannot be admitted as evidence in an Indian court under Section 35 of the Indian Stamp Act, 1899 until stamp duty and penalties are paid.',
  },
  {
    question: 'Does an SLA need to comply with the Digital Personal Data Protection Act, 2023 (DPDP Act)?',
    answer:
      'Yes. When an IT, cloud, or SaaS service provider processes personal data belonging to the client or its end-users, the provider acts as a Data Processor under Section 8 of the DPDP Act, 2023. The SLA must stipulate technical security safeguards, data confidentiality, strict breach notification timelines (recommended within 6 hours to align with CERT-In directives), and data erasure protocols upon contract termination.',
  },
  {
    question: 'What is the difference between 99.9% and 99.99% uptime in an SLA?',
    answer:
      '99.9% uptime ("Three Nines") permits up to 43.8 minutes of unscheduled downtime per month (8.76 hours per year). 99.99% uptime ("Four Nines") permits only 4.38 minutes of unscheduled downtime per month (52.6 minutes per year), requiring high-availability multi-region redundancy.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Service Level Agreement (SLA) Format: Word & PDF Download (2026)',
      description:
        'Download professional Service Level Agreement (SLA) format in Word (.docx) and PDF. Includes cloud computing SLA, uptime targets, incident severity matrix, penalty calculation formulas, DPDP Act 2023 clauses, and stamp duty guide under Indian Contract Act.',
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://www.corplawupdates.in/#website' },
      about: { '@id': `${pageUrl}#sla` },
    },
    {
      '@type': 'TechArticle',
      '@id': `${pageUrl}#article`,
      headline: 'Service Level Agreement (SLA): Format, Legal Definition, Cloud Computing & Download in Word & PDF',
      description:
        'Authoritative legal and operational guide on Service Level Agreements (SLA) in India. Covers legal classification, core components, cloud computing metrics (AWS/Azure), BPO benchmarks, Section 74 liquidated damages, and DPDP Act 2023 compliance.',
      url: pageUrl,
      inLanguage: 'en-IN',
      datePublished: '2026-03-01',
      dateModified: '2026-09-28',
      author: {
        '@type': 'Organization',
        name: 'CorpLawUpdates Legal Editorial Board',
        url: 'https://www.corplawupdates.in/about',
      },
      publisher: {
        '@type': 'Organization',
        name: 'CorpLawUpdates.in',
        url: 'https://www.corplawupdates.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.corplawupdates.in/icon.png',
        },
      },
      about: [
        { '@type': 'Thing', name: 'Service Level Agreement' },
        { '@type': 'Thing', name: 'Cloud Computing SLA' },
        { '@type': 'Thing', name: 'Indian Contract Act 1872 Section 74' },
        { '@type': 'Thing', name: 'Digital Personal Data Protection Act 2023' },
      ],
    },
    {
      '@type': 'WebApplication',
      '@id': `${pageUrl}#webapplication`,
      name: 'Service Level Agreement (SLA) Generator & Downloader',
      url: pageUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      description:
        'Free online SLA customizer and Word (.docx) & PDF document generator for Indian corporate, cloud computing, and vendor agreements.',
    },
    {
      '@type': 'HowTo',
      '@id': `${pageUrl}#howto`,
      name: 'How to Draft and Execute an Enforceable Service Level Agreement in India',
      description:
        'Step-by-step statutory guide to drafting, customizing, stamping, and executing a Service Level Agreement under the Indian Contract Act, 1872.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Define Scope & Exclusions',
          text: 'Detail the exact operational deliverables and explicitly list what is excluded to prevent scope creep.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Establish Uptime Targets & Measurement Windows',
          text: 'Specify monthly uptime percentages (e.g., 99.9% or 99.95%) and agreed maintenance windows.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Incorporate Incident Severity Matrix',
          text: 'Establish 4-tier incident severity definitions (P1-P4) with binding response and resolution times.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Structure Section 74 Service Credits',
          text: 'Set pre-estimated liquidated damages capped at 15%–25% of monthly billing to ensure legal enforceability under Indian law.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Execute on Non-Judicial Stamp Paper',
          text: 'Print on appropriate state non-judicial stamp paper (e.g. ₹100–₹500 under Article 5) and execute with authorized corporate signatories.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqs.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Documents', item: 'https://www.corplawupdates.in/documents' },
        { '@type': 'ListItem', position: 3, name: 'Service Level Agreement', item: pageUrl },
      ],
    },
  ],
}

export default function ServiceLevelAgreementPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <JsonLd id="sla-schema" data={jsonLd} />

      {/* ─── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/documents" className="hover:text-slate-900 transition-colors">
            Documents
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Service Level Agreement (SLA)</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* ─── Hero Section ───────────────────────────────────────────────── */}
        <div className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              Indian Contract Act, 1872
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              DPDP Act 2023 & CERT-In Compliant
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/15 to-indigo-500/15 text-indigo-900 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Live Legal Preview & Gemini AI Drafter
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Editable .docx & .pdf
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Updated September 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight leading-tight">
            Service Level Agreement (SLA) Format: Word & PDF Download (2026)
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Download institutional Service Level Agreement (SLA) templates in Word (.docx) and PDF, prepared using the statutory framework (review required before execution or filing). 
            Features real-time statutory paper preview, interactive Gemini AI legal drafter (draft clauses with prompts, customize operational metrics, adapt tone, and generate Hindi / bilingual summaries), 
            and Section 74 liquidated damages remedies.
          </p>
        </div>

        {/* ─── Client Interactive Suite Embed ─────────────────────────────── */}
        <SlaClient />

        {/* ─── GEO Direct-Answer Block (AI Citations & LLM Grounding) ─────── */}
        <div className="bg-white border-l-4 border-amber-500 border-y border-r border-slate-200 rounded-r-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Executive Legal Synopsis (SLA in Indian Law & Global IT)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            A <strong>Service Level Agreement (SLA)</strong> is a legally enforceable contract or covenant executed between a service provider and a client that defines quantifiable operational performance standards—such as 99.9% uptime, Severity 1 incident response within 1 hour, and sub-second API latency—along with predetermined financial remedies (Service Credits) if thresholds are breached. Legally, an SLA is classified under the <strong>Indian Contract Act, 1872</strong> as an accessory contract governed by Section 74 (liquidated damages) and Section 73. Operationally, SLAs are classified into three models: <strong>Customer-based SLAs</strong>, <strong>Service-based SLAs</strong>, and <strong>Multi-level SLAs</strong>. In modern technology infrastructure, cloud computing SLAs (e.g. AWS or Azure) establish recovery objectives (RPO/RTO) and data durability, while IT services contracts must strictly integrate data processor safeguards under Section 8 of the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
          </p>
        </div>

        {/* ─── Deep Authority Guide ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-12 text-slate-800 leading-relaxed text-sm sm:text-base">
            
            {/* Section 1: Meaning, Definition & Classification */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-600" />
                1. What is a Service Level Agreement (SLA)? Definition, Classification & Purpose
              </h2>
              <p>
                A <strong>Service Level Agreement (SLA)</strong> is an enforceable agreement between a service provider 
                (vendor, software developer, cloud provider, or outsourced agency) and a client that defines the quantitative 
                and qualitative performance metrics expected during service delivery.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  How is a Service Level Agreement Classified?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  In commercial jurisprudence and enterprise IT governance, a Service Level Agreement is classified under two distinct dimensions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-indigo-700 block mb-1">A. Legal Classification</span>
                    <p className="text-xs text-slate-600">
                      Under Indian law, an SLA is classified as an <strong>accessory bilateral contract</strong> or a <strong>conditional performance covenant</strong>. Governed by Sections 73 and 74 of the Indian Contract Act, 1872, its financial remedy clauses operate as agreed pre-estimates of liquidated damages.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-xs font-bold text-indigo-700 block mb-1">B. Operational Classification</span>
                    <p className="text-xs text-slate-600">
                      Under ITIL (Information Technology Infrastructure Library) standards, SLAs are classified into three operational categories:
                    </p>
                    <ul className="text-xs text-slate-600 list-disc pl-4 mt-1 space-y-1">
                      <li><strong>Customer-based SLA:</strong> Custom-tailored to cover all services delivered to one specific corporate client.</li>
                      <li><strong>Service-based SLA:</strong> A single, standardized baseline SLA applied uniformly to all customers using a specific service (e.g. AWS S3, Microsoft 365).</li>
                      <li><strong>Multi-level SLA:</strong> A tiered contract blending corporate-level, customer-level, and service-level commitments.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  What is a Service Level Agreement Used For and What is its Purpose?
                </h3>
                <p>
                  The foundational purpose of an SLA is to bridge the gap between high-level commercial expectations and day-to-day technical execution. Specifically, an SLA is used for:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
                  <li><strong>Setting Objective Benchmarks:</strong> Eliminating ambiguity by converting subjective promises ("reliable hosting") into mathematical commitments ("99.95% monthly uptime").</li>
                  <li><strong>Allocating Operational Risk:</strong> Clarifying which party bears the financial burden of unexpected downtime, network failure, or API degradation.</li>
                  <li><strong>Establishing Escalation & Incident Response Workflows:</strong> Binding support teams to strict MTTA (Mean Time to Acknowledge) and MTTR (Mean Time to Resolve) timelines based on incident severity.</li>
                  <li><strong>Providing Non-Litigious Remedies:</strong> Authorizing automated monthly invoice credits (Service Credits) so disputes are resolved commercially without invoking costly court litigation or arbitration.</li>
                </ul>
              </div>
            </section>

            {/* Section 2: SLA vs Contract vs Service Agreement vs MoU */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-600" />
                2. Comprehensive Comparison: SLA vs Contract vs Service Agreement vs MoU
              </h2>
              <p>
                Corporate leaders, procurement heads, and legal counsel frequently encounter four related legal instruments. Understanding their distinct boundaries prevents jurisdictional defects and scope ambiguity:
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900 text-white font-heading">
                    <tr>
                      <th className="p-3.5">Instrument</th>
                      <th className="p-3.5">Legal Enforceability</th>
                      <th className="p-3.5">Primary Focus & Scope</th>
                      <th className="p-3.5">Remedy for Breach</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">Master Services Agreement (MSA)</td>
                      <td className="p-3.5 text-emerald-700 font-semibold">Legally Binding Contract</td>
                      <td className="p-3.5">High-level legal rights: IP ownership, indemnification, liability caps, warranties, and termination.</td>
                      <td className="p-3.5">Contract damages, specific performance, injunction, or court litigation.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">Service Agreement</td>
                      <td className="p-3.5 text-emerald-700 font-semibold">Legally Binding Contract</td>
                      <td className="p-3.5">Commercial scope: specific deliverables, milestones, fee schedule, billing cadence, and payment terms.</td>
                      <td className="p-3.5">Withholding payment, contract termination for breach, interest on overdue sums.</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-amber-50/30">
                      <td className="p-3.5 font-bold text-amber-900">Service Level Agreement (SLA)</td>
                      <td className="p-3.5 text-emerald-700 font-semibold">Legally Binding (Schedule/Annexure)</td>
                      <td className="p-3.5 font-semibold">Technical performance metrics: 99.9% uptime, P1–P4 severity matrix, MTTR, maintenance windows, and DPDP 2023.</td>
                      <td className="p-3.5 font-semibold text-amber-900">Predetermined Service Credits deducted from future invoices (Sec 74 liquidated damages).</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">Memorandum of Understanding (MoU)</td>
                      <td className="p-3.5 text-slate-500">Generally Non-Binding (unless formal intent expressed)</td>
                      <td className="p-3.5">Preliminary roadmap expressing mutual intent to collaborate prior to executing definitive contracts.</td>
                      <td className="p-3.5">Reputational/relationship termination; damages rarely enforceable unless binding covenants exist.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Core Components of an SLA Between Two Companies */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                3. The 8 Core Components of an Enterprise SLA Between Two Companies
              </h2>
              <p>
                When two corporate entities execute a B2B Service Level Agreement, the document must contain eight structural pillars to ensure operational clarity and judicial enforceability in India:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
                    Scope of Services & Exclusions
                  </div>
                  <p className="text-xs text-slate-600">
                    Defines exact covered software modules, cloud instances, and API endpoints. Explicitly lists out-of-scope tasks (e.g. customized third-party plugins, user network errors) to prevent scope creep.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
                    Availability & Uptime Targets
                  </div>
                  <p className="text-xs text-slate-600">
                    Guarantees monthly availability percentage (99.9% or 99.95%). Defines the exact measurement formula: <code>[(Total Minutes - Downtime Minutes) / Total Minutes] × 100</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">3</span>
                    4-Tier Incident Severity Matrix
                  </div>
                  <p className="text-xs text-slate-600">
                    Categorizes incidents into P1 (Critical Outage: 1 hr response / 4 hr fix), P2 (Major Impact: 2 hr response), P3 (Minor Glitch: 8 hr response), and P4 (Support Query: 24 hr response).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">4</span>
                    Service Credit Remedies (Sec 74)
                  </div>
                  <p className="text-xs text-slate-600">
                    Establishes tiered invoice rebates (e.g. 5% credit for &lt;99.9%, 15% for &lt;98.5%) structured as genuine pre-estimated liquidated damages under Indian Contract Act, capped at 15%–25%.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">5</span>
                    Client Dependencies & Responsibilities
                  </div>
                  <p className="text-xs text-slate-600">
                    Stipulates the client’s duty to provide timely bug logs, designate authorized IT coordinators, maintain supported client-side hardware, and ensure prompt network connectivity.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">6</span>
                    Excused Outages & Maintenance
                  </div>
                  <p className="text-xs text-slate-600">
                    Excludes pre-notified scheduled maintenance windows (e.g. Sunday 01:00 AM–04:00 AM IST with 72h advance notice), government internet shutdowns, and Force Majeure events from downtime.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">7</span>
                    Data Protection & DPDP Act 2023
                  </div>
                  <p className="text-xs text-slate-600">
                    Appoints the vendor as Data Processor under Section 8 of DPDP Act 2023, requiring AES-256 encryption, role-based access, and mandatory 6-hour cybersecurity breach notice under CERT-In rules.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs">8</span>
                    Chronic Outage & Exit Transition
                  </div>
                  <p className="text-xs text-slate-600">
                    Grants the client immediate penalty-free contract termination rights if chronic breaches occur (e.g. 3 consecutive months of sub-98% uptime), coupled with 60-day data handover support.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: SLA in Cloud Computing (AWS, Azure & Enterprise SaaS) */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-blue-600" />
                4. Service Level Agreements in Cloud Computing (AWS, Azure & SaaS)
              </h2>
              <p>
                In cloud computing (covering Infrastructure-as-a-Service, Platform-as-a-Service, and Software-as-a-Service), 
                SLAs serve as the foundational trust mechanism between hyperscalers/SaaS providers and enterprise clients.
              </p>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                <h3 className="font-bold text-blue-950 text-sm sm:text-base flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  How Hyperscalers (AWS / Azure) Structure Cloud SLAs
                </h3>
                <p className="text-xs sm:text-sm text-blue-900">
                  Leading cloud providers like Amazon Web Services (AWS) structure their Service Level Agreements around <strong>Monthly Uptime Percentage (MUP)</strong> across multi-availability-zone deployments. For instance, in the Amazon EC2 and Amazon S3 SLAs:
                </p>
                <div className="overflow-x-auto border border-blue-200 rounded-xl bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-blue-900 text-white font-heading">
                      <tr>
                        <th className="p-2.5">Monthly Uptime Percentage</th>
                        <th className="p-2.5">Permitted Monthly Outage</th>
                        <th className="p-2.5">AWS Service Credit Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">99.99% or greater</td>
                        <td className="p-2.5 font-mono text-slate-600">0 to 4.38 minutes</td>
                        <td className="p-2.5 font-semibold text-emerald-700">0% (SLA Target Met)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">99.0% to &lt; 99.99%</td>
                        <td className="p-2.5 font-mono text-slate-600">4.38 minutes to 7.3 hours</td>
                        <td className="p-2.5 font-semibold text-amber-700">10% Service Credit</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">95.0% to &lt; 99.0%</td>
                        <td className="p-2.5 font-mono text-slate-600">7.3 hours to 36.5 hours</td>
                        <td className="p-2.5 font-semibold text-orange-700">25% Service Credit</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800">&lt; 95.0%</td>
                        <td className="p-2.5 font-mono text-slate-600">Over 36.5 hours</td>
                        <td className="p-2.5 font-semibold text-red-700">100% Service Credit</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Critical Cloud Infrastructure Metrics: RPO, RTO & Durability
                </h3>
                <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm">
                  <li>
                    <strong>Recovery Point Objective (RPO):</strong> Measures the maximum acceptable age of files recovered from backup storage during a primary database disaster (e.g. max 15 minutes of transactional data loss).
                  </li>
                  <li>
                    <strong>Recovery Time Objective (RTO):</strong> Specifies the maximum tolerable duration of system downtime from disaster declaration until service restoration (e.g. systems restored within 2 hours).
                  </li>
                  <li>
                    <strong>Data Durability vs Availability:</strong> While availability measures whether services are accessible right now (e.g. 99.99%), durability measures whether stored data will persist without corruption. AWS S3 Standard, for example, is architected for <strong>99.999999999% (11 nines)</strong> annual durability.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5: BPO, IT Outsourcing & Recruitment SLAs */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <Headphones className="w-6 h-6 text-emerald-600" />
                5. BPO, IT Managed Services & Recruitment Service Level Agreements
              </h2>
              <p>
                Service Level Agreements extend far beyond software code and cloud infrastructure. Outsourced business process vendors and staffing firms require domain-tailored Key Performance Indicators (KPIs):
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900 text-white font-heading">
                    <tr>
                      <th className="p-3">Outsourcing Vertical</th>
                      <th className="p-3">Core Operational Metrics</th>
                      <th className="p-3">Standard SLA Target Threshold</th>
                      <th className="p-3">Remedy / Penalty Trigger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">BPO & Contact Center</td>
                      <td className="p-3">First Contact Resolution (FCR), Average Handle Time (AHT), Call Abandonment Rate</td>
                      <td className="p-3 font-mono">FCR ≥ 85%, Abandonment &le; 3%, CSAT ≥ 90%</td>
                      <td className="p-3 text-xs">5%–10% invoice discount if monthly CSAT drops below 85%.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">IT Managed Services & AMC</td>
                      <td className="p-3">Mean Time Between Failures (MTBF), Mean Time to Repair (MTTR), Patch Cadence</td>
                      <td className="p-3 font-mono">MTTR &le; 2 hours, Security Patches deployed within 14 days</td>
                      <td className="p-3 text-xs">Per-hour delay deduction against monthly maintenance retainer.</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">Staffing & Recruitment</td>
                      <td className="p-3">Time-to-Shortlist, Candidate Screening Accuracy, Replacement Guarantee</td>
                      <td className="p-3 font-mono">Profiles submitted within 5 business days; 90-day replacement warranty</td>
                      <td className="p-3 text-xs">Free candidate replacement or 100% agency placement fee credit if candidate leaves within 90 days.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6: Section 74 Indian Contract Act Liquidated Damages vs Penalties */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <Scale className="w-6 h-6 text-amber-600" />
                6. Section 74 Indian Contract Act: Liquidated Damages vs Penalties
              </h2>
              <p>
                When drafting SLA penalty clauses in India, counsel must navigate the distinction between 
                <strong>liquidated damages</strong> and <strong>penalties</strong> under Section 74 of the Indian Contract Act, 1872.
              </p>
              <p>
                In the landmark decisions of <em>Fateh Chand v. Balkishan Dass (AIR 1963 SC 1405)</em>, 
                <em>Maula Bux v. Union of India (1969 2 SCC 554)</em>, and <em>ONGC v. Saw Pipes Ltd (2003 5 SCC 705)</em>, 
                the Supreme Court of India established binding principles:
              </p>
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-950 space-y-2">
                <p>
                  <strong>1. Genuine Pre-Estimate of Loss:</strong> If parties agree on a predetermined sum that genuinely reflects 
                  the foreseeable loss caused by delayed performance, the court will enforce it without requiring the injured party to 
                  prove actual financial loss.
                </p>
                <p>
                  <strong>2. Prohibition on Penal Forfeitures:</strong> If an SLA clause demands astronomical penalties completely 
                  disproportionate to the contract value, Indian courts will strike it down as an unenforceable penal forfeiture and award only reasonable 
                  compensation.
                </p>
                <p>
                  <strong>3. Best Practice for SLA Drafters:</strong> Always label remedies as <strong>"Service Credits"</strong>, explicitly 
                  recite that they represent a genuine pre-estimate of loss under Section 74, and cap them at a reasonable ceiling 
                  (15% to 25% of monthly billing).
                </p>
              </div>
            </section>

            {/* Section 7: DPDP Act 2023 & CERT-In Cybersecurity Reporting */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                7. DPDP Act 2023 & CERT-In Cybersecurity Incident Mandates
              </h2>
              <p>
                Under Section 8 of the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, whenever a cloud, IT, or BPO vendor processes personal data on behalf of an enterprise client (Data Fiduciary), the vendor acts as a <strong>Data Processor</strong>.
              </p>
              <p>
                To maintain statutory compliance, the SLA must incorporate:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm">
                <li><strong>Statutory Safeguards:</strong> Mandated technical and organizational measures including TLS 1.3 encryption in transit, AES-256 encryption at rest, and multi-factor authentication.</li>
                <li><strong>6-Hour CERT-In Incident Notification:</strong> Under CERT-In Directions issued pursuant to Section 70B(6) of the Information Technology Act, 2000, cybersecurity incidents (ransomware, unauthorized data exfiltration, system breaches) must be reported to the client and CERT-In within <strong>6 hours</strong> of detection.</li>
                <li><strong>Data Erasure on Termination:</strong> Mandatory data return and cryptographic erasure protocols across all hot, cold, and disaster recovery backup media within 30 days of SLA expiration.</li>
              </ul>
            </section>

            {/* Section 8: Stamp Duty Table Across Indian States */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3">
                8. Stamp Duty on Service Level Agreements Across Indian States
              </h2>
              <p>
                Under Section 35 of the Indian Stamp Act, 1899, any agreement that is not duly stamped is inadmissible as evidence in court 
                and cannot be acted upon by an arbitrator until the deficient duty and penalty (up to 10 times) are paid. 
                Standard commercial agreements are stamped under <strong>Article 5 (Agreement or Memorandum of Agreement)</strong> of the respective state stamp schedule:
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900 text-white font-heading">
                    <tr>
                      <th className="p-3">State / Union Territory</th>
                      <th className="p-3">Governing Stamp Schedule</th>
                      <th className="p-3">Prescribed Stamp Duty (General Commercial SLA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">Maharashtra</td>
                      <td className="p-3">Maharashtra Stamp Act (Article 5(h))</td>
                      <td className="p-3 font-mono">₹500 (or 0.1%–0.2% depending on contract value)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">Delhi (NCT)</td>
                      <td className="p-3">Indian Stamp (Delhi Amendment) Act (Article 5(c))</td>
                      <td className="p-3 font-mono">₹100 (Non-judicial stamp paper)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">Karnataka</td>
                      <td className="p-3">Karnataka Stamp Act, 1957 (Article 5(j))</td>
                      <td className="p-3 font-mono">₹200 to ₹500</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">Tamil Nadu</td>
                      <td className="p-3">Indian Stamp (Tamil Nadu Amendment) Act (Article 5(j))</td>
                      <td className="p-3 font-mono">₹100 to ₹300</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">Uttar Pradesh</td>
                      <td className="p-3">Indian Stamp (UP Amendment) Act (Article 5)</td>
                      <td className="p-3 font-mono">₹100</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">West Bengal</td>
                      <td className="p-3">Indian Stamp (West Bengal Amendment) Act (Article 5)</td>
                      <td className="p-3 font-mono">₹100 to ₹500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

          </div>

          {/* Right Sidebar: Key Highlights & Quick References (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                SLA Compliance Checklist
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Uptime threshold stated (99.9% / 99.95%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>4-tier incident severity matrix included</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Service credits capped at 15%–25%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>DPDP Act 2023 6-hr breach notice clause</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Stamped on appropriate non-judicial stamp paper</span>
                </li>
              </ul>
            </div>

            {/* Specimen Clause Snippet */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block font-mono">
                Standard Enforceable Clause
              </span>
              <h4 className="text-sm font-bold font-heading text-white">
                Liquidated Damages Recital (Sec 74)
              </h4>
              <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                "The parties agree that Service Credits constitute genuine pre-estimated liquidated damages under Section 74 of the Indian Contract Act, 1872, and not a penalty."
              </p>
            </div>

            {/* Related Contract Documents */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-slate-900 text-sm">
                Related Commercial Templates
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/documents/memorandum-of-understanding" className="text-blue-600 hover:underline font-medium">
                    → Memorandum of Understanding (MoU)
                  </Link>
                </li>
                <li>
                  <Link href="/documents/share-transfer-deed" className="text-blue-600 hover:underline font-medium">
                    → Form SH-4 Share Transfer Deed
                  </Link>
                </li>
                <li>
                  <Link href="/documents/partnership-deed" className="text-blue-600 hover:underline font-medium">
                    → Partnership Deed Format
                  </Link>
                </li>
                <li>
                  <Link href="/documents/board-resolution-bank-loan" className="text-blue-600 hover:underline font-medium">
                    → Board Resolution for Bank Loan
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ─── Frequently Asked Questions (FAQ) Section ──────────────────── */}
        <section className="space-y-6 pt-6 border-t border-slate-200">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-500" />
              Frequently Asked Questions on Service Level Agreements (SLA)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Statutory and operational answers for founders, company secretaries, and vendor managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-heading">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
