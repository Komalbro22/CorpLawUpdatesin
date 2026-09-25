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
  Sparkles
} from 'lucide-react'
import SlaClient from './SlaClient'

const pageUrl = 'https://www.corplawupdates.in/documents/service-level-agreement'

const faqs = [
  {
    question: 'What is a Service Level Agreement (SLA)?',
    answer:
      'A Service Level Agreement (SLA) is a legally binding contract (or formal annexure to a Master Services Agreement) between a service provider and a client that defines the exact quality, availability, response times, and performance standards expected of the service, along with predetermined financial remedies (Service Credits) if those standards are not met.',
  },
  {
    question: 'What is a service level agreement in cloud computing?',
    answer:
      'In cloud computing (IaaS, PaaS, SaaS), an SLA specifies infrastructure availability (such as 99.9% or 99.95% uptime), network latency thresholds, data durability, Recovery Time Objectives (RTO), Recovery Point Objectives (RPO), and service credit compensation for unscheduled cloud downtime or API outages.',
  },
  {
    question: 'Where can I download an SLA template in Word (.docx) and PDF format for India?',
    answer:
      'You can download professional, legally verified Service Level Agreement templates in editable Microsoft Word (.docx) and printable PDF format directly from this page using the 1-click download buttons above. Formats are available for Cloud/IT SaaS, Vendor Management, Software AMC, and Recruitment workflows.',
  },
  {
    question: 'How are SLA penalties or service credits governed under Indian contract law?',
    answer:
      'Under Indian law, SLA financial remedies are governed by Section 74 of the Indian Contract Act, 1872. Indian courts enforce "liquidated damages" if they represent a genuine pre-estimate of loss suffered due to service failure. If the clause imposes an arbitrary, exorbitant penalty without relation to actual damage, courts may decline to enforce it as a penal forfeiture. Hence, SLAs typically cap service credits at 15% to 25% of monthly billing.',
  },
  {
    question: 'What is the difference between an SLA, an MSA, and an SOW?',
    answer:
      'A Master Services Agreement (MSA) establishes the overarching legal and commercial relationship (indemnity, IP ownership, liability caps, termination). A Statement of Work (SOW) defines the specific deliverables, project milestones, and pricing. A Service Level Agreement (SLA) establishes the operational performance metrics, uptime commitments, and remedy mechanisms governing those deliverables.',
  },
  {
    question: 'What are the standard incident severity levels in an IT/SaaS SLA?',
    answer:
      'Standard SLAs categorize incidents into four tiers: Severity 1 (Critical: core system outage, response within 1 hour, resolve within 4 hours); Severity 2 (High: major degradation without workaround, response within 2 hours, resolve within 8 hours); Severity 3 (Medium: partial function bug with workaround, response within 8 hours, resolve within 24 hours); and Severity 4 (Low: minor cosmetic query or documentation request, response within 24 hours, resolve within 72 hours).',
  },
  {
    question: 'What is a recruitment service level agreement?',
    answer:
      'A Recruitment SLA is an agreement between an employer and a staffing agency that defines hiring turn-around-times (e.g. candidate shortlists within 5 business days), screening standards, interview scheduling coordination, and replacement guarantees (e.g. free candidate replacement if a hired employee leaves within 90 days).',
  },
  {
    question: 'What is the standard stamp duty on a Service Level Agreement in India?',
    answer:
      'Commercial agreements such as SLAs are executed on non-judicial stamp paper under Article 5 of the relevant State Stamp Act. Stamp duty varies by state: in Maharashtra, it is typically ₹500 (or 0.1%–0.2% depending on contract value); in Delhi, ₹100; in Karnataka, ₹200–₹500; and in Uttar Pradesh, ₹100. Unstamped agreements cannot be admitted as evidence in an Indian court under Section 35 of the Indian Stamp Act, 1899 until stamp duty and penalties are paid.',
  },
  {
    question: 'Does an SLA need to comply with the Digital Personal Data Protection Act, 2023 (DPDP Act)?',
    answer:
      'Yes. When an IT, cloud, or SaaS service provider processes personal data belonging to the client or its end-users, the provider acts as a Data Processor under Section 8 of the DPDP Act, 2023. The SLA must stipulate technical security safeguards, data confidentiality, strict breach notification timelines (recommended within 6 hours), and data return/erasure protocols upon contract termination.',
  },
  {
    question: 'What is the difference between 99.9% and 99.99% uptime in an SLA?',
    answer:
      '99.9% uptime ("Three Nines") permits up to 43.8 minutes of unscheduled downtime per month (8.76 hours per year). 99.99% uptime ("Four Nines") permits only 4.38 minutes of unscheduled downtime per month (52.6 minutes per year), requiring high-availability multi-region redundancy.',
  },
  {
    question: 'Can a client terminate an SLA immediately upon an uptime breach?',
    answer:
      'Typically, single isolated uptime breaches trigger Service Credits rather than immediate termination. However, standard SLAs include a "Chronic Failure" or "Material Breach" clause permitting the client to terminate without penalty if uptime falls below a critical threshold (e.g. below 95% in any single month or below 98% for three consecutive months).',
  },
  {
    question: 'What should be excluded from SLA downtime calculations?',
    answer:
      'Standard exclusions include: (1) Agreed scheduled maintenance windows communicated in advance; (2) Force Majeure events (natural disasters, war, government internet shutdowns); (3) Client-caused errors, improper configuration, or hardware failures; and (4) Third-party upstream failures outside provider control (e.g. DNS failure at client domain registrar).',
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
          text: 'Specify monthly uptime percentages (e.g., 99.9%) and agreed maintenance windows.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Incorporate Incident Severity Matrix',
          text: 'Establish 4-tier incident severity definitions with binding response and resolution times.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Structure Section 74 Service Credits',
          text: 'Set pre-estimated liquidated damages capped at 15%–25% of monthly billing to ensure legal enforceability.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Execute on Non-Judicial Stamp Paper',
          text: 'Print on appropriate state non-judicial stamp paper (e.g. ₹100–₹500) and execute with authorized signatory signatures.',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
              DPDP Act 2023 Compliant
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
            Download institutional, legally vetted Service Level Agreement (SLA) templates in Word (.docx) and PDF. 
            Tailored for cloud computing, IT SaaS, vendor outsourcing, software maintenance, and recruitment services in India, 
            with enforceable uptime metrics, severity response matrices, and Section 74 liquidated damages remedies.
          </p>
        </div>

        {/* ─── Client Interactive Suite Embed ─────────────────────────────── */}
        <SlaClient />

        {/* ─── GEO Direct-Answer Block (AI Citations) ─────────────────────── */}
        <div className="bg-white border-l-4 border-amber-500 border-y border-r border-slate-200 rounded-r-2xl p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Executive Legal Synopsis (SLA in Indian Law)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
            "A Service Level Agreement (SLA) in India is a legally binding commercial instrument governed by the Indian Contract Act, 1872. 
            It formalizes measurable performance standards (such as 99.9% uptime, Severity 1 incident response within 1 hour) and pre-agreed 
            remedies (Service Credits) for service failures. Under Section 74 of the Contract Act, service credits must represent a genuine 
            pre-estimate of loss rather than an arbitrary penalty, and are typically capped between 15% and 25% of monthly billing. 
            SLAs involving data processing must strictly integrate security safeguards under the Digital Personal Data Protection Act, 2023."
          </p>
        </div>

        {/* ─── Deep Authority Guide ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-12 text-slate-800 leading-relaxed text-sm sm:text-base">
            
            {/* Section 1: Meaning & What is an SLA */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3">
                1. What is a Service Level Agreement (SLA) and Its Meaning?
              </h2>
              <p>
                A <strong>Service Level Agreement (SLA)</strong> is an enforceable agreement between a service provider 
                (vendor, software developer, cloud provider, or outsourced agency) and a client that defines the quantitative 
                and qualitative performance metrics expected during service delivery.
              </p>
              <p>
                In Indian commercial law, an SLA can exist as an independent standalone contract or, more commonly, as a critical 
                annexure/schedule to a <strong>Master Services Agreement (MSA)</strong>. While the MSA establishes high-level legal 
                obligations (such as intellectual property ownership, indemnification, and liability caps), the SLA governs day-to-day 
                operational commitments, uptime guarantees, escalation protocols, and financial remedies for delayed performance.
              </p>
            </section>

            {/* Section 2: SLA vs MSA vs SOW Table */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3">
                2. Comparative Analysis: SLA vs MSA vs SOW
              </h2>
              <p>
                In technology and enterprise procurement, professionals often confuse the roles of an SLA, an MSA, and an SOW. 
                The table below illustrates their distinct legal purposes:
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900 text-white font-heading">
                    <tr>
                      <th className="p-3.5">Contract Document</th>
                      <th className="p-3.5">Primary Legal Purpose</th>
                      <th className="p-3.5">Key Clauses Covered</th>
                      <th className="p-3.5">Amendment Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">Master Services Agreement (MSA)</td>
                      <td className="p-3.5">Governs overarching commercial relationship and legal risk allocation.</td>
                      <td className="p-3.5">Confidentiality, IP Assignment, Limitation of Liability, Indemnity, Termination.</td>
                      <td className="p-3.5">Rarely (typically 3–5 year lifespan).</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">Statement of Work (SOW)</td>
                      <td className="p-3.5">Specifies project scope, deliverables, timelines, and commercial billing.</td>
                      <td className="p-3.5">Project milestones, sprint deliverables, billable hours, fee schedule.</td>
                      <td className="p-3.5">Project-specific (created per project or release).</td>
                    </tr>
                    <tr className="hover:bg-slate-50 bg-amber-50/30">
                      <td className="p-3.5 font-bold text-amber-900">Service Level Agreement (SLA)</td>
                      <td className="p-3.5 font-semibold">Defines operational performance standards, uptime, and breach credits.</td>
                      <td className="p-3.5">99.9% Uptime, Severity Matrix, Service Credits, Scheduled Maintenance, DPDP 2023.</td>
                      <td className="p-3.5">Periodic (reviewed annually or upon scale upgrades).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: SLA in Cloud Computing */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <Cloud className="w-6 h-6 text-blue-600" />
                3. Service Level Agreement in Cloud Computing & IT SaaS
              </h2>
              <p>
                In cloud computing (covering Infrastructure-as-a-Service, Platform-as-a-Service, and Software-as-a-Service), 
                SLAs serve as the foundational trust mechanism between hyperscalers/SaaS providers and Indian enterprise clients.
              </p>
              <p>
                A robust cloud computing SLA must define:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Availability Target ("The Nines"):</strong> Most enterprise cloud contracts warrant <strong>99.9%</strong> 
                  (Three Nines, permitting 43.8 minutes outage/month) or <strong>99.95%</strong> uptime. Mission-critical financial 
                  and banking workloads often demand <strong>99.99%</strong> (Four Nines, allowing just 4.38 minutes outage/month).
                </li>
                <li>
                  <strong>Recovery Objectives (RPO & RTO):</strong> Recovery Point Objective (RPO) dictates maximum allowable data loss 
                  measured in time (e.g. max 15 minutes of transactional data). Recovery Time Objective (RTO) dictates how fast systems must 
                  be restored following disaster declaration (e.g. max 2 hours).
                </li>
                <li>
                  <strong>Scheduled vs Unscheduled Maintenance:</strong> Maintenance windows must be restricted to off-peak hours 
                  (such as Sunday 01:00 AM to 04:00 AM IST) with mandatory advance written notice (minimum 72 hours). Unnotified downtime 
                  is classified as an actionable outage triggering service credits.
                </li>
              </ul>
            </section>

            {/* Section 4: 10 Essential Clauses of an Enforceable SLA */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3">
                4. The 10 Essential Clauses of an Enforceable Indian SLA
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 1: Scope of Services & Explicit Exclusions</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Defines exact covered applications, server instances, API endpoints, and support channels. Crucially, it must enumerate 
                    out-of-scope items to prevent scope creep (e.g. customized third-party integrations, on-premise hardware issues).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 2: Uptime Measurement Formula</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    The legal standard formula is: <code>Uptime % = [(Total Monthly Minutes - Unscheduled Downtime Minutes) / Total Monthly Minutes] × 100</code>. 
                    Scheduled maintenance and force majeure events are subtracted from the denominator.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 3: 4-Tier Incident Severity Matrix</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Establishes binding response (acknowledgment) and resolution (workaround or fix) timelines across Severity 1 (Critical), 
                    Severity 2 (High), Severity 3 (Medium), and Severity 4 (Low).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 4: Service Credit Deduction Mechanism</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Specifies exact percentage reductions credited against future monthly invoices. Structured under Section 74 of the Indian 
                    Contract Act as pre-estimated liquidated damages and capped at 15%–25% of monthly billing.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 5: Data Protection & DPDP Act 2023 Compliance</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Mandates the provider’s duties as a Data Processor under Section 8 of the Digital Personal Data Protection Act, 2023. 
                    Includes data encryption in transit and at rest, employee confidentiality, and a strict 6-hour cybersecurity breach notice.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 6: Limitation of Liability & Consequential Damage Exclusions</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Protects the provider against indirect, punitive, or loss-of-profit damages. Liability is commonly capped at total fees 
                    paid in the preceding 6 or 12 months, with carve-outs for gross negligence and willful data theft.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 7: Chronic Failure & Termination Rights</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Gives the client an exit right without penalties if the provider experiences chronic outages (e.g. 3 consecutive months of 
                    sub-98% uptime or 3 Severity 1 breaches in a single quarter).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 8: Transition Assistance & Exit Management</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Obligates the provider to assist in transferring data, configuration files, and workflows to the client or an incoming 
                    vendor over a 60–90 day disengagement window.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 9: Audit & Reporting Rights</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Entitles the client to inspect monthly automated uptime logs, SOC 2 Type II compliance reports, and ISO 27001 certifications.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base mb-1">Clause 10: Arbitration & Dispute Resolution</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Refers technical disputes to independent technical evaluators and legal disputes to sole arbitrator arbitration under the 
                    Arbitration and Conciliation Act, 1996 with a fixed seat (e.g. New Delhi, Mumbai, Bengaluru).
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Section 74 Indian Contract Act Liquidated Damages vs Penalties */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <Scale className="w-6 h-6 text-amber-600" />
                5. Section 74 Indian Contract Act: Liquidated Damages vs Penalties
              </h2>
              <p>
                When drafting SLA penalty clauses in India, counsel must navigate the distinction between 
                <strong>liquidated damages</strong> and <strong>penalties</strong> under Section 74 of the Indian Contract Act, 1872.
              </p>
              <p>
                In the landmark decisions of <em>Fateh Chand v. Balkishan Dass (AIR 1963 SC 1405)</em>, 
                <em>Maula Bux v. Union of India (1969 2 SCC 554)</em>, and <em>ONGC v. Saw Pipes Ltd (2003 5 SCC 705)</em>, 
                the Supreme Court of India laid down clear principles:
              </p>
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-950 space-y-2">
                <p>
                  <strong>1. Genuine Pre-Estimate of Loss:</strong> If parties agree on a predetermined sum that genuinely reflects 
                  the foreseeable loss caused by delayed performance, the court will enforce it without requiring the injured party to 
                  prove actual financial loss.
                </p>
                <p>
                  <strong>2. Prohibition on Penal Forfeitures:</strong> If an SLA clause demands astronomical penalties completely 
                  disproportionate to the contract value, Indian courts will strike it down as a penal forfeiture and award only reasonable 
                  compensation.
                </p>
                <p>
                  <strong>3. Best Practice for SLA Drafters:</strong> Always label remedies as <strong>"Service Credits"</strong>, explicitly 
                  recite that they represent a genuine pre-estimate of loss under Section 74, and cap them at a reasonable ceiling 
                  (15% to 25% of monthly billing).
                </p>
              </div>
            </section>

            {/* Section 6: Stamp Duty Table Across Indian States */}
            <section className="space-y-4">
              <h2 className="text-2xl font-bold font-heading text-slate-900 border-b border-slate-200 pb-3">
                6. Stamp Duty on Service Level Agreements Across Indian States
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
