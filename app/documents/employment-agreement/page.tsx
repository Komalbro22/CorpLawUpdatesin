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
  Percent,
  Calculator,
  AlertTriangle,
  Laptop,
  Home,
  Check,
} from 'lucide-react'
import EmploymentAgreementClient from './EmploymentAgreementClient'
import {
  STATE_STAMP_SCHEDULE,
  formatInr,
} from '@/lib/doc-generator/employment-agreement-generator'

export const revalidate = 86400

const FAQS = [
  {
    q: 'What is an Employment Agreement under Indian law?',
    a: 'An Employment Agreement (also termed an Employment Contract) is a legally binding bilateral contract executed under Section 10 of the Indian Contract Act, 1872 between an employer and an employee. It defines the formal "contract of service", establishing job responsibilities, remuneration, hours of work, confidentiality, intellectual property assignment, restrictive covenants, probation, and grounds for termination.',
  },
  {
    q: 'Is an Employment Agreement legally binding in India?',
    a: 'Yes. An employment agreement is legally binding and enforceable in Indian courts provided it meets the essential requirements of Section 10 of the Indian Contract Act, 1872: competent parties (aged 18+, sound mind), free consent (no coercion or undue influence), lawful consideration (wages/CTC in exchange for professional services), and a lawful object. However, specific clauses that violate statutory law (such as post-employment non-compete clauses under Section 27) are void.',
  },
  {
    q: 'Is an Employment Agreement mandatory in India?',
    a: 'Under Section 6(1)(f) of the Occupational Safety, Health and Working Conditions Code, 2020 (OSH Code) and its Central Rules (notified May 8, 2026), every employer in an establishment has a statutory duty to issue a formal Letter of Appointment containing prescribed employment particulars to every employee. While a simple appointment letter fulfills this statutory minimum, executing a comprehensive Employment Agreement is standard commercial practice to safeguard intellectual property, protect confidential business data, define probation, and establish dispute resolution.',
  },
  {
    q: 'What is the difference between an Employment Agreement, an Appointment Letter, and an Offer Letter?',
    a: 'An Offer Letter is a preliminary conditional expression of intent issued during hiring, which does not create a full operational employment contract until accepted. An Appointment Letter is the statutory instrument mandated under Section 6(1)(f) of the OSH Code confirming joining date, wages, and designation. An Employment Agreement is the comprehensive, bilateral contract signed by both employer and employee containing detailed restrictive covenants (non-solicitation, confidentiality, IP assignment, dispute resolution, and asset return) governing the entire employment relationship.',
  },
  {
    q: 'Can an Employment Agreement contain a Non-Compete clause in India?',
    a: 'A non-compete covenant during the active subsistence of employment is legally valid (as held by the Supreme Court in Niranjan Shankar Golikari v. Century Spinning & Mfg. Co. Ltd., 1967). However, any post-employment non-compete clause that restricts an employee from joining a competitor or practicing their profession AFTER resignation or termination is VOID ab initio under Section 27 of the Indian Contract Act, 1872 (reaffirmed in Percept D\'Mark v. Zaheer Khan, 2006). Employers must instead rely on enforceable non-solicitation, perpetual confidentiality, and trade secret covenants.',
  },
  {
    q: 'Are Employment Bonds or Service Bonds enforceable in India?',
    a: 'Under Indian law, an employment bond is NOT enforceable as a punitive tool to force an employee to remain in service (specific performance of personal service is barred under Section 14 of the Specific Relief Act, 1963). However, under Section 74 of the Indian Contract Act, 1872, an employer CAN recover a reasonable, actual pre-estimate of direct specialized training expenditure incurred exclusively on the employee, provided the training is genuine and documented with invoices/vouchers (Sicpa India Ltd. v. Manas Pratim Deb; Toshniwal Brothers v. Eswarprasad). Withholding original educational certificates is strictly illegal.',
  },
  {
    q: 'What is the "50% Wage Rule" under the Code on Wages, 2019?',
    a: 'Under Section 2(y) of the Code on Wages, 2019, "wages" includes Basic Pay, Dearness Allowance (DA), and Retaining Allowance. If the sum of all excluded allowances (such as HRA, conveyance, travel allowance, and special allowances) exceeds 50% of total remuneration, the excess amount over 50% is statutorily added back to "wages". This directly increases employer and employee liabilities for Provident Fund (EPF), ESI, and Gratuity. Our generator features an automated 50% wage check.',
  },
  {
    q: 'What are the rights of Fixed-Term Employment (FTE) employees under the Labour Codes?',
    a: 'Under Section 2(o) of the Industrial Relations Code, 2020, Fixed-Term Employment (FTE) is statutorily recognized across all sectors. Fixed-term employees are entitled to equal wages, working hours, and benefits on par with permanent workers doing identical work. Crucially, under Section 53 of the Code on Social Security, 2020, fixed-term workers are eligible for pro-rata gratuity if they render continuous service for at least one (1) year (unlike the 5-year requirement for permanent employees). Natural expiry of an FTE contract does not constitute retrenchment under Section 2(zh).',
  },
  {
    q: 'Does an Employment Agreement require Stamp Duty, and how much is payable?',
    a: 'Yes. An employment agreement is an "Agreement or Memorandum of Agreement" chargeable with non-judicial stamp duty under Article 5 of the Indian Stamp Act, 1899 or respective State Stamp Acts. In Maharashtra, it attracts ₹500 under Article 5(h)(B); in Delhi, ₹50 to ₹100 under Article 5(c); in Karnataka, ₹200 under Article 5(j); and in Tamil Nadu/UP, ₹100. Duty can be paid via non-judicial stamp paper or e-stamping (SHCIL/GRAS).',
  },
  {
    q: 'Does an Employment Agreement require Notarization or Registration at the Sub-Registrar\'s Office?',
    a: 'No. Under Section 17 of the Registration Act, 1908, an employment contract is NOT a compulsorily registrable document because it does not create or transfer rights in immovable property. Notarization before a Notary Public is optional and purely evidentiary. Similarly, general employment agreements do NOT need to be filed with the Registrar of Companies (RoC/MCA) or entered into Company Minute Books.',
  },
  {
    q: 'Can an Employment Agreement be signed electronically in India?',
    a: 'Yes. Under Section 10A of the Information Technology Act, 2000, contracts formed through electronic communications and signed via valid electronic signatures (including Aadhaar eSign, digital signature certificates, or compliant e-signature platforms) are legally valid, effective, and enforceable in Indian courts.',
  },
  {
    q: 'How does the Digital Personal Data Protection Act, 2023 (DPDP Act) affect employment agreements?',
    a: 'Under Section 7(i) of the DPDP Act, 2023, an employer (as Data Fiduciary) may process the personal data of an employee (Data Principal) for the purposes of employment, employee benefits, employer asset security, or preventing corporate espionage without obtaining separate explicit consent for those legitimate operational purposes. However, the agreement must disclose data protection norms and prohibit unauthorized data extraction.',
  },
  {
    q: 'Who owns intellectual property created by an employee during work hours?',
    a: 'Under Section 17(c) of the Copyright Act, 1957, in the case of a work made in the course of employment under a "contract of service", the employer is the first owner of copyright, unless there is a contract to the contrary. Our employment agreement contains an explicit, worldwide IP assignment clause covering code, patents, trade secrets, and designs to ensure complete employer IP ownership.',
  },
  {
    q: 'What notice period is legally permissible in an Indian Employment Agreement?',
    a: 'Standard commercial practice in India specifies a notice period between 30 and 90 days following confirmation. During probation, notice is typically shorter (15 to 30 days). Employers may include a "pay-in-lieu of notice" clause allowing immediate separation by paying equivalent basic salary. Termination for cause (gross misconduct, fraud, continuous unauthorized absence of 8+ days) can be effected immediately without notice.',
  },
  {
    q: 'Can I download the Employment Agreement in Microsoft Word (.docx) and PDF for free?',
    a: 'Yes. You can customize your complete employment agreement and download it directly in both editable Microsoft Word (.docx) and print-ready PDF format completely free of charge. The draft includes Annexure A (Salary Breakdown), Annexure B (Job Responsibilities), and Annexure C (Asset Handover Receipt).',
  },
  {
    q: 'क्या रोजगार अनुबंध (Employment Agreement) हिंदी में निष्पादित किया जा सकता है?',
    a: 'हाँ, भारतीय अनुबंध अधिनियम, 1872 (Indian Contract Act, 1872) के तहत रोजगार अनुबंध हिंदी, अंग्रेजी या किसी भी आधिकारिक भारतीय भाषा में वैध रूप से निष्पादित किया जा सकता है। हमारे एआई असिस्टेंट की मदद से आप हिंदी या हिंग्लिश में निर्देश देकर अंग्रेजी अनुबंध और उसका हिंदी सारांश तैयार कर सकते हैं।',
  },
]

const CLAUSE_CHECKLIST = [
  {
    no: '1',
    name: 'Appointment & Designation',
    statutoryRef: 'Section 6(1)(f), OSH Code, 2020',
    importance: 'Clearly records formal job title, department, reporting officer, and effective commencement date.',
    pitfall: 'Omitting specific duties leaves employers unable to hold staff accountable for non-performance.',
  },
  {
    no: '2',
    name: 'Place of Work & Remote Policy',
    statutoryRef: 'DPDP Act, 2023 & IT Act, 2000',
    importance: 'Defines whether the role is in-office, hybrid, or fully remote, setting workstation cybersecurity standards.',
    pitfall: 'Failing to define transferability prevents moving staff between branches or subsidiaries.',
  },
  {
    no: '3',
    name: 'Probation & Confirmation Terms',
    statutoryRef: 'Model Standing Orders / HR Policy',
    importance: 'Establishes a 3 to 6 month evaluation window with a shorter exit notice period (e.g. 15 days).',
    pitfall: 'Silent confirmation clauses create disputes over whether an employee became permanent automatically.',
  },
  {
    no: '4',
    name: 'Working Hours & Weekly Rest',
    statutoryRef: 'Section 25, OSH Code, 2020',
    importance: 'Mandates standard 8-9 hours daily, 48 hours weekly maximum, and scheduled weekly rest days.',
    pitfall: 'Non-exempt operational staff working undocumented overtime can trigger labour inspector penalties.',
  },
  {
    no: '5',
    name: 'Remuneration & 50% Wage Parity',
    statutoryRef: 'Section 2(y), Code on Wages, 2019',
    importance: 'Itemizes Basic, HRA, Special Allowance, and PF. Guarantees Basic pay equals at least 50% of gross.',
    pitfall: 'Heavy allowance structuring (<50% Basic) triggers retrospective PF and gratuity demands.',
  },
  {
    no: '6',
    name: 'Social Security (EPF, ESI, Gratuity)',
    statutoryRef: 'Code on Social Security, 2020',
    importance: 'Incorporates statutory enrollment in EPFO, ESIC (if eligible), and gratuity entitlement.',
    pitfall: 'Denying pro-rata gratuity to Fixed-Term Employees after 1 year violates Section 53 of the Social Security Code.',
  },
  {
    no: '7',
    name: 'Exclusivity & No Moonlighting',
    statutoryRef: 'Niranjan Golikari (1967 SC 1098)',
    importance: 'Prohibits dual employment, freelancing, or side-businesses during active employment without Board approval.',
    pitfall: 'Without an exclusivity clause, employers cannot discipline staff for parallel gig work.',
  },
  {
    no: '8',
    name: 'Confidentiality & Trade Secrets',
    statutoryRef: 'Common Law & DPDP Act, 2023',
    importance: 'Perpetual non-disclosure covenant covering software code, client records, and financial models.',
    pitfall: 'Clauses that expire upon employment termination leave trade secrets unprotected post-exit.',
  },
  {
    no: '9',
    name: 'IP Assignment & Work-For-Hire',
    statutoryRef: 'Section 17(c), Copyright Act, 1957',
    importance: 'Explicitly assigns all patents, software code, designs, and inventions created by the employee to the employer.',
    pitfall: 'Failure to execute a written IP assignment deed can allow ex-developers to claim copyright ownership.',
  },
  {
    no: '10',
    name: 'Company Laptop & Asset Custody',
    statutoryRef: 'Section 405 IPC / BNS 2023',
    importance: 'Records laptop tags, cloud credentials, and mandates immediate physical return upon notice of resignation.',
    pitfall: 'Unenforceable recovery mechanisms when remote employees refuse to return expensive hardware.',
  },
  {
    no: '11',
    name: 'Non-Solicitation Covenant',
    statutoryRef: 'FL Smidth Pvt. Ltd. (Madras HC)',
    importance: 'Enforceable 12-24 month restriction against poaching co-workers or soliciting existing clients post-exit.',
    pitfall: 'Confusing non-solicitation with non-compete clauses and inadvertently drafting void covenants.',
  },
  {
    no: '12',
    name: 'Section 27 Non-Compete Caution',
    statutoryRef: 'Section 27, Indian Contract Act',
    importance: 'Statutory transparency disclosure confirming that post-employment non-competes are void in Indian courts.',
    pitfall: 'Relying on unenforceable post-employment non-compete clauses instead of confidentiality and non-solicitation.',
  },
  {
    no: '13',
    name: 'Training Cost Recovery (Section 74)',
    statutoryRef: 'Section 74, Indian Contract Act',
    importance: 'Enforces liquidated damages strictly for documented, specialized training expenses incurred on the employee.',
    pitfall: 'Imposing arbitrary, punitive penalties or illegally seizing educational certificates.',
  },
  {
    no: '14',
    name: 'Termination for Cause & Abandonment',
    statutoryRef: 'Principles of Natural Justice',
    importance: 'Enables immediate dismissal for fraud, sexual harassment, or voluntary abandonment (8+ days absence).',
    pitfall: 'Dismissing staff without documenting misconduct invites wrongful termination claims.',
  },
  {
    no: '15',
    name: 'Notice Period & Pay-in-Lieu',
    statutoryRef: 'Industrial Relations Code, 2020',
    importance: 'Establishes 30-90 days notice or basic salary pay-in-lieu, plus garden leave rights.',
    pitfall: 'Imposing one-sided notice periods that violate fairness and equity principles.',
  },
  {
    no: '16',
    name: 'Governing Law & Dispute Resolution',
    statutoryRef: 'Arbitration & Conciliation Act, 1996',
    importance: 'Fixes Indian law, city court jurisdiction, and optional sole-arbitrator commercial dispute resolution.',
    pitfall: 'Specifying foreign law or foreign jurisdiction for employment performed entirely in India.',
  },
]

export default function EmploymentAgreementPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* ─── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/documents" className="hover:text-blue-600 transition-colors">
            Legal Documents
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Employment Agreement Format India
          </span>
        </div>
      </nav>

      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Indian Contract Act, 1872 & Labour Codes (2025/2026) Verified
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
              Employment Agreement Format India
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Generate a legally vetted, customizable Indian employment agreement in Microsoft Word (.docx) and PDF.
              Fully updated for the <strong>four Labour Codes</strong>, <strong>Section 2(y) 50% wage parity</strong>,
              mandatory appointment terms under the OSH Code, state stamp duty, and enforceable IP/confidentiality covenants.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Vetted under Indian Labour Statutes
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Last Legally Verified: <strong>September 30, 2026</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Word (.docx) & PDF Downloads Included
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Direct Answer Box for AI Overviews / AEO */}
        <section className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 p-6 md:p-8 rounded-2xl border border-indigo-100 dark:border-indigo-950/80 mb-10 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            Quick Statutory Summary (Direct Answer)
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
            Is an Employment Agreement Legally Binding in India?
          </h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-4">
            <strong>Yes.</strong> An employment agreement executed in India is legally binding under Section 10 of the Indian Contract Act, 1872.
            It creates an enforceable <em>contract of service</em> provided it is executed by competent parties for lawful consideration (remuneration in exchange for professional services).
            While Section 6(1)(f) of the Occupational Safety, Health and Working Conditions Code, 2020 mandates issuing a formal <strong>Letter of Appointment</strong>,
            executing a bilateral <strong>Employment Agreement</strong> is crucial to legally secure intellectual property assignment under Section 17(c) of the Copyright Act, 1957,
            enforce non-solicitation, protect trade secrets, and establish lawful separation terms.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-indigo-100 dark:border-slate-800">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Non-Compete Caution:</strong> Post-employment non-compete clauses are VOID under Section 27.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>50% Wage Benchmark:</strong> Basic salary must comprise ≥50% of gross pay under the Code on Wages.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Stamp Duty:</strong> Article 5 non-judicial duty payable based on your state (e.g. ₹500 in MH, ₹100 in Delhi).</span>
            </div>
          </div>
        </section>

        {/* ─── Interactive AI Generator Component ───────────────────────────── */}
        <section id="generator" className="scroll-mt-16">
          <EmploymentAgreementClient />
        </section>

        {/* ─── Educational Pillar 1: Contract vs Letter Distinctions ────────── */}
        <section className="mt-16 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              Statutory Classification Matrix
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Employment Agreement vs Appointment Letter vs Offer Letter
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Employers often treat these documents as interchangeable, creating critical legal vulnerabilities. Under Indian jurisprudence, they possess distinct legal functions and binding weights.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3.5">Parameter</th>
                  <th className="p-3.5">Offer Letter</th>
                  <th className="p-3.5">Letter of Appointment</th>
                  <th className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">Employment Agreement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">Legal Nature</td>
                  <td className="p-3.5">Preliminary conditional proposal to enter into a contract.</td>
                  <td className="p-3.5">Statutory notice of employment issued upon joining.</td>
                  <td className="p-3.5 bg-blue-50/20 dark:bg-blue-950/10 font-semibold text-slate-900 dark:text-white">Comprehensive bilateral formal contract under Contract Act, 1872.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">Statutory Mandate</td>
                  <td className="p-3.5">Not mandated by statute; purely standard recruitment practice.</td>
                  <td className="p-3.5"><strong>Mandatory</strong> under Section 6(1)(f) of the OSH Code, 2020.</td>
                  <td className="p-3.5 bg-blue-50/20 dark:bg-blue-950/10">Commercial necessity to enforce covenants, IP assignment, and dispute resolution.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">Signatures Required</td>
                  <td className="p-3.5">Issued by employer; acknowledged/accepted by candidate.</td>
                  <td className="p-3.5">Signed by employer&apos;s authorized representative.</td>
                  <td className="p-3.5 bg-blue-50/20 dark:bg-blue-950/10 font-semibold">Dual execution: Signed by both parties on all pages with witnesses.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">IP & Invention Assignment</td>
                  <td className="p-3.5">Rarely detailed; minimal work-for-hire provisions.</td>
                  <td className="p-3.5">Basic statutory particulars; lacks full IP assignment deeds.</td>
                  <td className="p-3.5 bg-blue-50/20 dark:bg-blue-950/10 text-emerald-700 dark:text-emerald-300 font-semibold">Exhaustive Section 17(c) Copyright Act IP assignment and moral rights waiver.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">Restrictive Covenants</td>
                  <td className="p-3.5">Not enforceable prior to employment commencement.</td>
                  <td className="p-3.5">Minimal non-solicitation wording.</td>
                  <td className="p-3.5 bg-blue-50/20 dark:bg-blue-950/10 font-semibold">Detailed non-solicitation, perpetual trade secret NDA, and Section 27 disclosure.</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">Dispute Resolution</td>
                  <td className="p-3.5">No formal arbitration or jurisdiction framework.</td>
                  <td className="p-3.5">Subject to local labour authority jurisdictions.</td>
                  <td className="p-3.5 bg-blue-50/20 dark:bg-blue-950/10">Sole-arbitrator clause under Arbitration & Conciliation Act, 1996 and city courts.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Educational Pillar 2: Restrictive Covenants (Section 27) ────── */}
        <section className="mt-12 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
              <Scale className="w-4 h-4" />
              Critical Judicial Analysis
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              The Truth About Non-Compete Clauses in India (Section 27)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Many employers download generic US or UK contract templates containing 1-year or 2-year post-employment non-compete clauses. Under Indian law, these clauses are virtually worthless in a court of law.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-indigo-600" />
                The Statutory Bar: Section 27
              </h3>
              <p className="text-xs leading-relaxed mb-3">
                <strong>Section 27 of the Indian Contract Act, 1872</strong> establishes: <em>&quot;Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.&quot;</em>
              </p>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Unlike English common law or US state laws that permit &quot;reasonable restraints&quot;, Indian courts apply a strict statutory prohibition. In <strong>Percept D&apos;Mark (India) Pvt. Ltd. v. Zaheer Khan (2006) 4 SCC 227</strong>, the Supreme Court unequivocally ruled that the doctrine of restraint of trade applies to all post-employment restrictions without exception.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                What IS Enforceable in Indian Courts?
              </h3>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Negative Covenants DURING Employment:</strong> An employer can strictly prohibit moonlighting or consulting with competitors while employed (<em>Niranjan Shankar Golikari</em>, 1967).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Non-Solicitation of Clients & Employees:</strong> Restraining an ex-employee from actively enticing existing clients or poaching team members for 12–24 months is widely upheld by High Courts.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Trade Secrets & Confidentiality:</strong> Misappropriating proprietary software code, customer data, or confidential algorithms is actionable perpetually under breach of trust and the DPDP Act.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─── Educational Pillar 3: Employment Bonds & Section 74 ─────────── */}
        <section className="mt-12 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              <Scale className="w-4 h-4" />
              Service Commitments & Training Cost Recovery
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Are Employment Bonds Legal in India? (Section 74 Analysis)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Employers often search for &quot;2 years bond agreement format for employee Word&quot;. Here is what the law actually permits versus what is illegal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10">
              <div className="font-bold text-rose-800 dark:text-rose-300 text-sm mb-1.5">
                ❌ What is Strictly ILLEGAL
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>• Forcing an employee to stay through bonded servitude (violates Article 23 of the Constitution).</li>
                <li>• Withholding original 10th/12th/Degree certificates or Aadhaar cards (penalized under AICTE/UGC rules).</li>
                <li>• Demanding arbitrary punitive damages unrelated to actual expenses.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/10">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1.5">
                ✅ What IS Legally Valid
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>• Recovering <strong>actual, verified expenditure</strong> incurred on specialized external certifications.</li>
                <li>• Liquidated damages pre-estimate under <strong>Section 74 of the Contract Act</strong>.</li>
                <li>• Pro-rata reduction in recovery amount for every month of service completed.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/10">
              <div className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1.5">
                🏛️ Landmark High Court Precedents
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>• <strong>Sicpa India Ltd. v. Manas Pratim Deb (2011 Delhi HC):</strong> Training costs recoverable only when employer proves actual financial expenditure.</li>
                <li>• <strong>Toshniwal Brothers v. Eswarprasad (Madras HC):</strong> Liquidated sum cannot exceed genuine damages sustained by the employer.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─── Educational Pillar 4: Labour Codes 2025/2026 Transition ──────── */}
        <section className="mt-12 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              Statutory Modernization Guide
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              The 4 Labour Codes (2025/2026): Key Drafting Impacts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Following the Central Government notifications bringing the Labour Codes into force on <strong>21 November 2025</strong> and the notification of final Central Rules on <strong>8 May 2026</strong>, 29 legacy labour laws have been consolidated into 4 modern codes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                1. Code on Wages, 2019
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                Section 2(y) 50% Wage Rule
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Replaces Payment of Wages Act 1936 and Minimum Wages Act 1948. Mandates that excluded allowances cannot exceed 50% of monthly remuneration. Any excess allowance is added back to basic wages for PF, ESI, and gratuity calculations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                2. Industrial Relations Code, 2020
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                Section 2(o) Fixed-Term Employment
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Replaces Industrial Disputes Act 1947 and Standing Orders Act 1946. Formally sanctions Fixed-Term Employment (FTE) across all sectors. Automatic expiry upon term conclusion does not constitute retrenchment.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                3. Code on Social Security, 2020
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                Section 53 1-Year Gratuity Parity
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Consolidates EPF Act 1952, ESI Act 1948, and Gratuity Act 1972. Grants fixed-term employees pro-rata gratuity eligibility after just 1 year of continuous service, eliminating the legacy 5-year waiting period.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                4. OSH Code, 2020
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                Section 6(1)(f) Appointment Letters
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Consolidates Factories Act 1948 and Contract Labour Act 1970. Imposes a mandatory statutory obligation on every employer to issue formal Letters of Appointment containing 16 prescribed employment particulars.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Educational Pillar 5: State Stamp Duty Schedule ─────────────── */}
        <section className="mt-12 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
              <Landmark className="w-4 h-4" />
              Statutory Execution & Stamp Rates
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              State-by-State Stamp Duty Schedule on Employment Agreements
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Under Article 5 of the Indian Stamp Act, 1899 and respective State Stamp Acts, non-judicial stamp duty must be paid before or at the time of execution to ensure admissibility in evidence.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">State / UT</th>
                  <th className="p-3">Statutory Article</th>
                  <th className="p-3">Stamp Duty</th>
                  <th className="p-3">E-Stamp / Payment Mode</th>
                  <th className="p-3">State Authority Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                {Object.keys(STATE_STAMP_SCHEDULE).map(key => {
                  const rule = STATE_STAMP_SCHEDULE[key]
                  return (
                    <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{rule.stateName}</td>
                      <td className="p-3 font-mono text-xs">{rule.articleRef}</td>
                      <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{formatInr(rule.stampDutyAmount)}</td>
                      <td className="p-3">{rule.stampType}</td>
                      <td className="p-3">
                        <a
                          href={rule.eStampPortal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Educational Pillar 6: 16 Core Clauses Checklist ─────────────── */}
        <section className="mt-12 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
              <FileCheck2 className="w-4 h-4" />
              Drafting Architecture
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              The 16 Essential Clauses Every Indian Employment Agreement Must Include
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              A comprehensive Indian employment contract must be structured logically to avoid legal ambiguity during labor disputes, separation, or intellectual property audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLAUSE_CHECKLIST.map(item => (
              <div
                key={item.no}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.no}. {item.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-mono text-[10px]">
                      {item.statutoryRef}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">{item.importance}</p>
                </div>
                <div className="text-rose-700 dark:text-rose-400 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span><strong>Pitfall:</strong> {item.pitfall}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Educational Pillar 7: FAQ Accordion ─────────────────────────── */}
        <section className="mt-12 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4" />
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Indian Employment Agreement FAQs
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Direct, authoritative legal answers to the most common queries from employers, HR managers, and employees.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/40 open:bg-white dark:open:bg-slate-900 transition-colors"
              >
                <summary className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{faq.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ─── Statutory Sources & Verification Desk ────────────────────────── */}
        <section className="mt-12 p-6 md:p-8 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Authoritative Statutory & Judicial Sources
          </h3>
          <p className="mb-4 leading-relaxed">
            This educational resource and drafting engine has been developed through exhaustive primary research of Indian statutory enactments and landmark judicial authorities:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5 leading-relaxed">
            <li><strong>Indian Contract Act, 1872:</strong> Sections 10 (Essential elements of contract), 27 (Agreement in restraint of trade void), and 74 (Compensation for breach of contract).</li>
            <li><strong>Occupational Safety, Health and Working Conditions Code, 2020:</strong> Section 6(1)(f) (Mandatory appointment letters) and Central Rules notified on 8 May 2026.</li>
            <li><strong>Code on Wages, 2019:</strong> Section 2(y) (Uniform definition of wages and 50% allowance ceiling benchmark).</li>
            <li><strong>Industrial Relations Code, 2020:</strong> Section 2(o) (Fixed-Term Employment parity) and Section 2(zh) (Retrenchment exclusions).</li>
            <li><strong>Code on Social Security, 2020:</strong> Section 53 (Pro-rata gratuity for fixed-term workers) and Chapter III (EPFO statutory provisions).</li>
            <li><strong>Copyright Act, 1957:</strong> Section 17(c) (First owner of copyright under contract of service) and Section 57 (Moral rights).</li>
            <li><strong>Digital Personal Data Protection Act, 2023 (DPDP Act):</strong> Section 7(i) (Processing of personal data for employment purposes).</li>
            <li><strong>Supreme Court of India:</strong> <em>Percept D&apos;Mark (India) Pvt. Ltd. v. Zaheer Khan</em> (2006) 4 SCC 227 and <em>Niranjan Shankar Golikari v. Century Spinning</em> (1967 AIR 1098).</li>
          </ul>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-[11px] text-slate-500">
            <span>Prepared by the <strong>CorpLawUpdates Legal & Labour Law Editorial Desk</strong>.</span>
            <span>Last statutory audit: <strong>September 30, 2026</strong>.</span>
          </div>
        </section>

        {/* ─── Legal Disclaimer ────────────────────────────────────────────── */}
        <footer className="mt-8 text-center text-[11px] text-slate-500 dark:text-slate-500 max-w-4xl mx-auto leading-relaxed">
          <p>
            <strong>Legal Disclaimer:</strong> The information and documents generated by this tool are provided solely for educational, guidance, and drafting assistance purposes. They do not constitute formal legal advice or substitute for personalized counsel from an advocate, legal specialist, or labour law attorney. Employment laws, minimum wages, and state stamp duty vary based on state jurisdiction, establishment headcount, and industry sector. Users should review and verify the generated draft before physical execution.
          </p>
        </footer>
      </div>
    </main>
  )
}
