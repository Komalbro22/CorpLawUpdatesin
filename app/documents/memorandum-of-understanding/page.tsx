import Link from 'next/link'
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
  BookOpen,
  Sparkles,
  Download,
  ArrowRight,
  Gavel,
  Briefcase,
  Cpu,
  Users,
} from 'lucide-react'
import MouClient from './MouClient'

export const revalidate = 86400

const FAQS = [
  {
    q: 'What is an MoU? What is the full form and meaning of MoU?',
    a: 'MoU stands for Memorandum of Understanding. It is a formal bipartite or multipartite legal instrument that records mutual intent, strategic alignment, operational scope, and agreed preliminary terms between two or more parties intending to enter into a future commercial transaction, partnership, joint venture, or collaborative venture.',
  },
  {
    q: 'Is an MoU legally binding and enforceable in India under the Indian Contract Act, 1872?',
    a: 'In Indian jurisprudence, whether an MoU is legally binding depends strictly on the language and mutual intention of the parties, not on its title. Under Section 10 of the Indian Contract Act, 1872, an agreement is a binding contract if made by free consent of competent parties for lawful consideration with a lawful object. If an MoU expresses merely an "agreement to agree" or contingent future negotiations, it is non-binding. However, clauses explicitly drafted as binding (such as Confidentiality, Intellectual Property, Exclusivity, Governing Law, and Arbitration) are fully enforceable in Indian courts (Supreme Court ruling in Kollipara Sriramulu v. T. Aswathanarayana).',
  },
  {
    q: 'Which clauses in a commercial MoU should be legally binding vs non-binding?',
    a: 'In standard commercial practice, an MoU follows a hybrid structure: the substantive collaboration goals (e.g. proposed revenue split, tentative transaction timeline, investment commitments) are explicitly marked NON-BINDING, while procedural and protective covenants (Confidentiality, Exclusivity/No-Shop, Intellectual Property pre-existing ownership, Non-Solicitation, Dispute Resolution/Arbitration, and Governing Law) are explicitly declared LEGALLY BINDING and enforceable immediately upon signing.',
  },
  {
    q: 'What is the key difference between an MoU, a Letter of Intent (LOI), and a Definitive Agreement?',
    a: 'A Letter of Intent (LOI) is typically an unilateral expression of interest issued by one party to initiate talks. An MoU is a bilateral or multilateral memorandum recording mutually negotiated terms of preliminary collaboration. A Definitive Agreement (e.g. Share Purchase Agreement, Joint Venture Agreement, Master Services Agreement) is a comprehensive, fully binding, stamped legal contract governing exact commercial performance, remedies, indemnities, and liquidated damages.',
  },
  {
    q: 'What stamp duty is payable on an MoU in India under Article 5 of the State Stamp Acts?',
    a: 'An MoU falls under Article 5 ("Agreement or Memorandum of an Agreement") of the relevant State Stamp Act. If the MoU contains no immediate monetary conveyance or hypothecation, it attracts nominal stamp duty: ₹100 in Maharashtra (Article 5(h)), ₹50 in Delhi (Article 5(c)), ₹200 in Karnataka, and ₹20 to ₹100 in Tamil Nadu. However, if the MoU contains binding monetary payment clauses or possession transfer, it may be assessed as a conveyance, attracting ad-valorem duty.',
  },
  {
    q: 'Does an MoU require compulsory registration at the Sub-Registrar’s Office in India?',
    a: 'No. Under Section 17 of the Registration Act, 1908, only documents that create, declare, assign, limit, or extinguish rights in immovable property valued over ₹100 require compulsory registration. Since an MoU generally records prospective intent or commercial collaboration without transferring immovable property title or possession, registration at the Sub-Registrar is not mandatory.',
  },
  {
    q: 'Should an MoU be notarized by a Notary Public?',
    a: 'Notarization of an MoU is not a statutory prerequisite under the Indian Contract Act. However, commercial parties commonly notarize an MoU before a Notary Public to verify the identity of signatories, authenticate the date of execution, and prevent future disputes regarding signature forgery or fraudulent backdating under Section 85 of the Indian Evidence Act, 1872.',
  },
  {
    q: 'Can a party sue for breach of an MoU or claim monetary damages in Indian courts?',
    a: 'If a party breaches a covenant specifically designated as binding (e.g., unauthorized disclosure of proprietary data, violation of exclusivity by negotiating with a competitor, or infringement of pre-existing IP), the aggrieved party can seek temporary and permanent injunctions under the Specific Relief Act, 1963, as well as monetary damages. For non-binding clauses, courts will not grant specific performance to compel parties to enter into the final contract.',
  },
  {
    q: 'Is an Arbitration Clause in an MoU enforceable even if the substantive MoU is non-binding?',
    a: 'Yes. Under the doctrine of severability codified in Section 16(1) of the Arbitration and Conciliation Act, 1996, an arbitration agreement is treated as an independent clause separate from the underlying contract. The Supreme Court in Bhaven Construction (2022) affirmed that even if the substantive terms of an MoU are non-binding, a clearly drafted arbitration clause remains legally binding and valid to adjudicate disputes arising out of the MoU.',
  },
  {
    q: 'What is an Exclusivity or Lock-Out clause in an MoU, and how long does it last?',
    a: 'An exclusivity (or no-shop / lock-out) clause prohibits both parties from soliciting, discussing, or entering into similar negotiations or agreements with competing third parties for a specified duration (typically 30, 60, or 90 days). This protects both sides while investing time, legal costs, and technical due diligence toward drafting the final definitive agreement.',
  },
  {
    q: 'Can startup co-founders use an MoU before incorporating a Private Limited Company or LLP?',
    a: 'Yes. A Co-Founders MoU (or Pre-Incorporation Agreement) is vital before registering a company. It records initial equity percentage splits, sweat equity and time commitments, roles (e.g. CEO vs CTO), vesting schedules (e.g. 4-year vesting with 1-year cliff), assignment of pre-incorporation intellectual property to the upcoming company, and decision-making deadlocks.',
  },
  {
    q: 'What happens if an MoU expires without the parties signing a Definitive Agreement?',
    a: 'Upon the expiration date specified in the MoU, the parties’ obligations to negotiate terminate automatically without legal liability, provided neither party acted in bad faith or breached binding covenants. However, continuing covenants like Confidentiality and IP protection typically survive expiration for a stipulated period (usually 2 to 3 years).',
  },
  {
    q: 'What are the leading Supreme Court of India precedents on the enforceability of an MoU?',
    a: 'The foundational case is Kollipara Sriramulu v. T. Aswathanarayana (AIR 1968 SC 1028), where the Supreme Court held that the mere fact that parties agreed to prepare a formal contract later does not prevent an initial document from being a binding contract, provided the essential terms are settled. In Rickmers Verwaltung GMBH v. Indian Oil Corporation Ltd. (1999 1 SCC 1), the Apex Court reiterated that the true test is the intention of the parties gathered from the language and surrounding commercial conduct.',
  },
  {
    q: 'Can an MoU be executed digitally using Aadhaar eSign or Digital Signature Certificates (DSC)?',
    a: 'Yes. Under Sections 4, 5, and 10A of the Information Technology Act, 2000, contracts and MoUs executed through electronic records, electronic signatures, and DSCs are legally valid and enforceable in Indian courts. However, parties must ensure that appropriate state stamp duty is paid electronically (e-stamping via Stock Holding Corporation of India Ltd - SHCIL) to maintain admissibility under Section 35 of the Indian Stamp Act.',
  },
  {
    q: 'What is the consequence of executing an MoU on inadequate or deficient stamp paper?',
    a: 'Under Section 35 of the Indian Stamp Act, 1899, any instrument not duly stamped is inadmissible in evidence for any purpose before any public officer or civil court. If presented in court, the document will be impounded until the deficit stamp duty along with a penalty (which can be up to 10 times the deficit duty) is paid.',
  },
  {
    q: 'How does the CorpLawUpdates AI MoU Purpose Assistant customize the generated draft?',
    a: 'Our AI Purpose Assistant utilizes Google Gemini models fine-tuned on Indian commercial legal precedents. When you type or paste your business collaboration idea in plain English, the AI automatically analyzes the collaboration intent, determines the legal structure, generates custom recitals, allocates specific obligations to Party A and Party B, sets milestone deadlines, and configures binding confidentiality and IP clauses.',
  },
]

export default function MemorandumOfUnderstandingPage() {
  const jsonLdWebPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'MoU Format — Free Word (.docx) & PDF Download, Sample Draft & Generator (India)',
    url: 'https://www.corplawupdates.in/documents/memorandum-of-understanding',
    description:
      'Download free MoU format in Word (.docx) and PDF for India. Generate custom Memorandum of Understanding drafts with AI purpose assistant. Covers Business Partnership, Joint Venture, Vendor, Co-Founders, State Stamp Duty (Article 5), and Indian Contract Act 1872 enforceability.',
    breadcrumb: {
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
          name: 'Legal Documents',
          item: 'https://www.corplawupdates.in/documents',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Memorandum of Understanding (MoU)',
          item: 'https://www.corplawupdates.in/documents/memorandum-of-understanding',
        },
      ],
    },
  }

  const jsonLdSoftware = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MoU Format Generator & Legal Workstation',
    operatingSystem: 'Any (Web Browser)',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'INR',
    },
    description:
      'Free online generator for professional Memorandum of Understanding (MoU) drafts with 6 collaboration presets, AI purpose generator, NDA addendum, Word (.docx) and PDF export for Indian commercial practice.',
  }

  const jsonLdHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Draft, Sign and Transition an MoU into a Definitive Agreement in India',
    description:
      'Step-by-step statutory procedure for drafting, stamping, executing, and transitioning an MoU under the Indian Contract Act, 1872.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Define Commercial Purpose & Select Preset',
        text: 'Identify whether the collaboration is a Business Partnership, Joint Venture, Vendor Agreement, R&D Tech Sharing, Co-Founders Sweat Equity, or Inter-Company engagement.',
      },
      {
        '@type': 'HowToStep',
        name: 'Structure Binding vs Non-Binding Covenants',
        text: 'Clearly state that operational objectives are non-binding expressions of intent, while carving out Confidentiality, IP Ownership, Exclusivity, and Arbitration as legally binding.',
      },
      {
        '@type': 'HowToStep',
        name: 'Affix Non-Judicial State Stamp Duty',
        text: 'Procure non-judicial stamp paper or e-stamp under Article 5 ("Agreement or Memorandum of an Agreement") of your respective State Stamp Act (e.g., ₹100 in Maharashtra, ₹50 in Delhi, ₹200 in Karnataka).',
      },
      {
        '@type': 'HowToStep',
        name: 'Execute with Authorized Signatories & Two Witnesses',
        text: 'The MoU must be signed by authorized representatives (supported by Board Resolution or POA for companies/LLPs) and witnessed by two competent adult witnesses.',
      },
      {
        '@type': 'HowToStep',
        name: 'Conduct Due Diligence & Execute Definitive Agreement',
        text: 'Complete commercial due diligence and technical feasibility assessments within the lock-out period, then transition terms into a formal Definitive Agreement (SHA, JV Agreement, or Master Services Contract).',
      },
    ],
  }

  const jsonLdFaq = {
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-indigo-600 transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/documents" className="hover:text-indigo-600 transition">
              Legal Documents
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white font-medium">
              Memorandum of Understanding (MoU)
            </span>
          </nav>

          {/* Hero Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Indian Contract Act, 1872 (Sec 10 & 2(h))
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Article 5 State Stamp Acts
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                6 Pre-Configured Presets & AI Generator
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Word (.docx) & PDF Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              MoU Format, Sample Draft & Free Generator (India)
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
              Generate an official, lawyer-vetted Memorandum of Understanding (MoU) tailored for Indian commercial practice. Includes 6 industry presets, natural language AI drafting assistant, mutual obligations table, binding confidentiality addendum, and 1-click Word (.docx) & PDF exports.
            </p>
          </div>

          {/* Princeton GEO Direct Answer / Quick Answer Box (AI Overview Optimized) */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/80 shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-sm mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-2 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  What is an MoU and is it Legally Binding in India? (Quick Answer)
                </h3>
                <p>
                  A <strong>Memorandum of Understanding (MoU)</strong> is a formal legal document recording the mutual understanding, strategic intentions, and preliminary terms agreed between two or more parties before executing a definitive commercial contract.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Under the <strong>Indian Contract Act, 1872</strong> and landmark Supreme Court rulings (<em>Kollipara Sriramulu v. T. Aswathanarayana</em>), whether an MoU is legally binding depends strictly on the <strong>clear intention and drafted language</strong> of the parties. Modern commercial MoUs utilize a hybrid structure: operational roadmap terms are explicitly non-binding, while protective clauses — such as <strong>Confidentiality, Intellectual Property pre-existing rights, Exclusivity / No-Shop, Dispute Resolution (Arbitration), and Governing Law</strong> — are expressly declared legally binding and enforceable in court.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Document Generator Workstation */}
          <MouClient />

          {/* STATUTORY SECTION 1: MASTER COMPARISON TABLE */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Scale className="w-4 h-4" />
                Legal Jurisprudence & Commercial Analysis
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                MoU vs Letter of Intent (LOI) vs Definitive Contract: Master Comparison
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Parties frequently conflate MoUs with Letters of Intent and Definitive Agreements. Understanding their distinct legal status, stamp duty incidence, and judicial enforceability prevents costly disputes.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white dark:bg-slate-900">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 font-bold">Feature</th>
                    <th className="p-3 font-bold text-indigo-700 dark:text-indigo-300">Memorandum of Understanding (MoU)</th>
                    <th className="p-3 font-bold text-blue-700 dark:text-blue-300">Letter of Intent (LOI)</th>
                    <th className="p-3 font-bold text-emerald-700 dark:text-emerald-300">Definitive Agreement / Contract</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Legal Nature</td>
                    <td className="p-3">Bilateral or multilateral mutual alignment document</td>
                    <td className="p-3">Usually unilateral declaration of intent by one party</td>
                    <td className="p-3">Comprehensive, legally binding commercial contract</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Binding Enforceability</td>
                    <td className="p-3">Hybrid: operational terms non-binding; confidentiality & IP binding</td>
                    <td className="p-3">Generally non-binding except exclusivity covenants</td>
                    <td className="p-3">100% legally binding under Section 10 Indian Contract Act</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Monetary Consideration</td>
                    <td className="p-3">Not strictly required; records mutual promises</td>
                    <td className="p-3">None required; contingent on future contract</td>
                    <td className="p-3">Mandatory (Sec 2(d) Contract Act) for enforceability</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Stamp Duty Applicable</td>
                    <td className="p-3">Nominal under Article 5 (₹50 to ₹200 non-judicial)</td>
                    <td className="p-3">Usually nil unless stamped for evidentiary confidence</td>
                    <td className="p-3">Ad-valorem or fixed per State Stamp Act schedule</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Court Remedies</td>
                    <td className="p-3">Injunctions & damages for breach of binding covenants</td>
                    <td className="p-3">Limited to reliance damages if bad faith proved</td>
                    <td className="p-3">Specific performance, liquidated damages, termination rights</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Typical Lifespan</td>
                    <td className="p-3">6 to 12 months (terminates upon definitive contract)</td>
                    <td className="p-3">30 to 90 days during exclusive negotiation window</td>
                    <td className="p-3">Multi-year or perpetual until contract completion</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Primary Purpose</td>
                    <td className="p-3">Define project scope, roles, and due diligence roadmap</td>
                    <td className="p-3">Express acquisition or procurement interest</td>
                    <td className="p-3">Govern actual execution, risk allocation, and payments</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* STATUTORY SECTION 2: 6 PRE-CONFIGURED COLLABORATION TYPES */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Briefcase className="w-4 h-4" />
                Commercial Structuring Guide
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                The 6 Essential Types of MoUs in Indian Commercial Practice
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Choose the appropriate MoU model based on your commercial collaboration. Each type entails distinct risk allocations, intellectual property reservations, and transition paths.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
                  <Users className="w-5 h-5" />
                  1. Business Partnership & Referral
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Used by commercial enterprises, agencies, or consultants joining forces to co-market services, refer qualified clients, or package complementary offerings. Includes lead attribution protocols and referral fee splits.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500">
                  <span className="text-slate-900 dark:text-white font-semibold">Transition Target:</span> Strategic Partnership Agreement / Channel Partner Deed.
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
                  <Building2 className="w-5 h-5" />
                  2. Joint Venture (JV) Preliminary
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ideal for companies planning to incorporate a dedicated JV Special Purpose Vehicle (SPV). Details equity shareholding ratios, initial capital contributions, board composition, and regulatory clearances (CCI/FDI).
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500">
                  <span className="text-slate-900 dark:text-white font-semibold">Transition Target:</span> Definitive Shareholders Agreement (SHA) & Joint Venture Contract.
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                  <FileCheck2 className="w-5 h-5" />
                  3. Vendor & Service Provider
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Executed between a client enterprise and a specialized vendor or technology contractor before finalizing multi-year Service Level Agreements (SLAs). Establishes pilot milestones, testing criteria, and milestone pricing.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500">
                  <span className="text-slate-900 dark:text-white font-semibold">Transition Target:</span> Master Services Agreement (MSA) with Work Orders (SOW).
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-base">
                  <Cpu className="w-5 h-5" />
                  4. Academic & R&D Tech Sharing
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Standard between universities, research institutions, and private tech companies. Safeguards background intellectual property, defines joint patent application rights, and outlines laboratory access rules.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500">
                  <span className="text-slate-900 dark:text-white font-semibold">Transition Target:</span> Technology Transfer Agreement / Joint Patent Licensing Deed.
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                  <Sparkles className="w-5 h-5" />
                  5. Startup Co-Founders Agreement
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pre-incorporation document for early-stage founders. Fixes equity allocations, defines full-time commitment, establishes 4-year reverse vesting with a 1-year cliff, and assigns all code/IP to the upcoming company.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500">
                  <span className="text-slate-900 dark:text-white font-semibold">Transition Target:</span> Founders Agreement & Articles of Association (AoA).
                </div>
              </div>

              {/* Card 6 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
                  <Landmark className="w-5 h-5" />
                  6. Inter-Company & Subsidiaries
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Internal group protocol between parent holding companies, sister companies, and operating subsidiaries for shared infrastructure, IT tools, cross-company billing, and compliance with Section 188 arm&apos;s length rules.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500">
                  <span className="text-slate-900 dark:text-white font-semibold">Transition Target:</span> Inter-Company Shared Services Agreement (Arm&apos;s Length).
                </div>
              </div>
            </div>
          </section>

          {/* STATUTORY SECTION 3: STATE STAMP DUTY SCHEDULE (ARTICLE 5) */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Landmark className="w-4 h-4" />
                State Stamp Duty Compliance
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                State-Wise Stamp Duty Schedule on MoUs (Article 5: Agreement or Memorandum)
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Under the Indian Stamp Act, 1899 and state stamp enactments, an MoU must be executed on appropriate non-judicial stamp paper or e-stamp. Failure to adequately stamp renders the document inadmissible in evidence under Section 35.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white dark:bg-slate-900">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 font-bold">State / Union Territory</th>
                    <th className="p-3 font-bold text-indigo-700 dark:text-indigo-300">Statutory Article</th>
                    <th className="p-3 font-bold text-blue-700 dark:text-blue-300">Standard Stamp Duty (Non-Monetary)</th>
                    <th className="p-3 font-bold text-emerald-700 dark:text-emerald-300">Stamp Paper / e-Stamping Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Maharashtra</td>
                    <td className="p-3">Article 5(h)(B), Maharashtra Stamp Act</td>
                    <td className="p-3">₹100 (₹500 if recording financial commitments)</td>
                    <td className="p-3">e-SBTR / Physical Non-Judicial / GRAS</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Delhi (NCT)</td>
                    <td className="p-3">Article 5(c), Indian Stamp Act (Delhi)</td>
                    <td className="p-3">₹50</td>
                    <td className="p-3">SHCIL e-Stamping (Mandatory)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Karnataka</td>
                    <td className="p-3">Article 5(j), Karnataka Stamp Act</td>
                    <td className="p-3">₹200</td>
                    <td className="p-3">e-Stamping via Authorized Collection Centers</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Tamil Nadu</td>
                    <td className="p-3">Article 5(j), Indian Stamp Act (TN)</td>
                    <td className="p-3">₹20 to ₹100</td>
                    <td className="p-3">Non-Judicial Stamp Paper / SHCIL</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Telangana & AP</td>
                    <td className="p-3">Article 5, Indian Stamp Act (Telangana)</td>
                    <td className="p-3">₹100</td>
                    <td className="p-3">Non-Judicial / Online e-Stamp</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Gujarat</td>
                    <td className="p-3">Article 5(h), Gujarat Stamp Act</td>
                    <td className="p-3">₹300</td>
                    <td className="p-3">Jantri / SHCIL e-Stamping</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Uttar Pradesh</td>
                    <td className="p-3">Article 5(b), Indian Stamp Act (UP)</td>
                    <td className="p-3">₹100</td>
                    <td className="p-3">IGRSUP e-Stamping</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">West Bengal</td>
                    <td className="p-3">Article 5(c), Indian Stamp Act (WB)</td>
                    <td className="p-3">₹100</td>
                    <td className="p-3">GRIPS e-Stamping / Physical</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Haryana</td>
                    <td className="p-3">Article 5(c), Indian Stamp Act (Haryana)</td>
                    <td className="p-3">₹100</td>
                    <td className="p-3">e-GRAS Haryana Portal</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Rajasthan</td>
                    <td className="p-3">Article 5, Rajasthan Stamp Act</td>
                    <td className="p-3">₹500</td>
                    <td className="p-3">e-Gras Rajasthan e-Stamp</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Section 35 Impounding Rule (Indian Stamp Act, 1899)
              </div>
              <p>
                An unstamped or insufficiently stamped MoU cannot be admitted in evidence before any arbitrator or civil court. However, under the Constitution Bench ruling of the Supreme Court in <em>Re: Interplay between Arbitration Agreements under the Arbitration and Conciliation Act, 1996 and the Indian Stamp Act, 1899 (2023)</em>, non-stamping does not render the arbitration clause void ab initio — the defect is curable upon paying the deficit duty along with applicable statutory penalties.
              </p>
            </div>
          </section>

          {/* STATUTORY SECTION 4: 9 ESSENTIAL CLAUSES BREAKDOWN */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <FileText className="w-4 h-4" />
                Document Anatomy
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                9 Essential Clauses Every Indian Commercial MoU Must Contain
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                To prevent ambiguity and protect your organization&apos;s proprietary assets during preliminary discussions, ensure your MoU incorporates these 9 standard clauses:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Clause 1</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Preamble & Recitals</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Identifies corporate entities (with CIN/LLPIN/PAN) and contextualizes the commercial background and strategic reasons for exploring collaboration.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Clause 2</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Purpose & Scope</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Defines specific project boundaries, deliverables, and targets to ensure neither party expands scope unilaterally without written consensus.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Clause 3</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Mutual Obligations Matrix</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Itemizes exact responsibilities allocated to Party A and Party B, eliminating ambiguities about costs, staffing, and regulatory permits.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Clause 4</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Binding Intent Carve-Out</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The cornerstone clause explicitly declaring that substantive commercial terms are non-binding expressions of intent, while legal covenants are binding.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Clause 5</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Pre-Existing IP Reservation</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Affirms that background intellectual property, proprietary software, and patents remain the sole property of the originating party.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Clause 6</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Confidentiality & NDA</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Protects trade secrets, commercial data, and customer lists. Mandates survival for 2 to 3 years even after MoU expiration or termination.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Clause 7</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Exclusivity / Lock-Out</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Prevents parties from negotiating with or soliciting competing offers from third parties for a fixed duration (typically 30–90 days).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Clause 8</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Term & Termination</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Specifies sunset expiration date and unilateral exit rights upon 15 or 30 days written notice without penalty.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">Clause 9</span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Arbitration & Governing Law</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Provides sole arbitrator appointment mechanism under the Arbitration and Conciliation Act, 1996 with specified seat, venue, and state courts.
                </p>
              </div>
            </div>
          </section>

          {/* STATUTORY SECTION 5: CORRECTED 5-STEP ROADMAP: MOU TO DEFINITIVE AGREEMENT */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Clock className="w-4 h-4" />
                Execution Lifecycle
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Corrected 5-Step Roadmap: From MoU Execution to Definitive Commercial Contract
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                An MoU is not the end of a transaction — it is the procedural launchpad. Follow these authentic contract transition steps rather than inappropriate post-download statutory filings:
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Step 1: Preliminary Alignment & Bilateral Execution
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Generate the MoU draft, affix requisite Article 5 stamp duty, and obtain signatures from authorized directors/partners along with two witnesses. Execute the attached Non-Disclosure Undertaking.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Step 2: Mutual Commercial & Technical Due Diligence
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    During the exclusivity lock-out window (30–90 days), exchange technical architecture, financial records, customer audits, and regulatory certifications under the protection of the binding confidentiality covenant.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Step 3: Drafting the Definitive Commercial Contract
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Legal counsels convert the high-level roadmap into a definitive agreement (Shareholders Agreement, Master Services Agreement, or Partnership Deed) with comprehensive warranties, indemnities, and termination triggers.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                  4
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Step 4: Corporate Board Resolutions & Full Stamping
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Both companies pass formal Board Resolutions under Section 179(3) of the Companies Act, 2013 approving execution of the definitive contract and empowering specific signatories. Pay ad-valorem contract stamp duty.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                  5
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Step 5: Definitive Closing & MoU Supersession
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Upon signing the definitive contract, the Entire Agreement clause legally supersedes the MoU. All ongoing operations, invoices, and performance milestones are governed exclusively by the new contract.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* STATUTORY SECTION 6: SUPREME COURT PRECEDENTS */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Gavel className="w-4 h-4" />
                Judicial Precedents
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Supreme Court Precedents on Enforceability of MoUs in India
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Indian courts look past the label of the document and inspect the true commercial intent and language used. These landmark rulings establish the legal framework:
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Kollipara Sriramulu v. T. Aswathanarayana (AIR 1968 SC 1028)
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Supreme Court Bench Ruling
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>Ratio Decidendi:</strong> The mere fact that the parties stipulated that the agreement is to be embodied in a formal contract afterwards does not itself prevent the initial preliminary document (MoU) from becoming a binding contract, if the parties were ad idem on all essential terms and intended to be bound immediately.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Rickmers Verwaltung GMBH v. Indian Oil Corporation Ltd. (1999 1 SCC 1)
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Apex Court Commercial Precedent
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>Ratio Decidendi:</strong> The question of whether an MoU constitutes a binding contract depends upon the intention of the parties to be gathered from their correspondence, conduct, and drafted language. An agreement to enter into an agreement upon terms to be afterwards agreed upon is not valid as a contract.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Bhaven Construction v. Executive Engineer, Sardar Sarovar Narmada Nigam (2022 1 SCC 75)
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Doctrine of Severability
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>Ratio Decidendi:</strong> Reaffirmed the autonomy and severability of the arbitration clause under Section 16(1) of the Arbitration and Conciliation Act, 1996. Even where substantive obligations under an MoU fail or remain non-binding, the arbitration agreement contained therein survives to adjudicate pre-contractual disputes.
                </p>
              </div>
            </div>
          </section>

          {/* STATUTORY SECTION 7: 16 COMPREHENSIVE LEGAL FAQS */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <HelpCircle className="w-4 h-4" />
                Frequently Asked Questions
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                16 Statutory & Practical FAQs on MoUs in India
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Clear, legally cited answers to the most common queries regarding Memorandum of Understanding drafting, enforceability, stamp duty, and conversion into binding agreements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 shrink-0 font-extrabold">
                      Q{idx + 1}.
                    </span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* RELATED LEGAL DOCUMENTS & COMPLIANCE TOOLS */}
          <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Related Corporate & Banking Legal Workspaces
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/documents/equitable-mortgage-deed"
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-sm block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    MODT & Equitable Mortgage
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Section 58(f) TPA title deeds deposit deed, mortgagor affidavit & CHG-1 board resolution.
                </p>
              </Link>

              <Link
                href="/documents/board-resolution-bank-loan"
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-sm block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Board Resolution for Bank Loan
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Section 179(3)(d) & 180(1)(c) Companies Act credit borrowing resolution with sanction tracker.
                </p>
              </Link>

              <Link
                href="/documents"
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-sm block"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    All Corporate Legal Drafts
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Explore 50+ statutory corporate agreements, resolutions, NDAs, and compliance generators.
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
