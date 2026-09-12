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
} from 'lucide-react'
import PartnershipDeedClient from './PartnershipDeedClient'

export const revalidate = 86400

const FAQS = [
  {
    q: 'What is a Partnership Deed? What is its legal definition under Indian law?',
    a: 'A Partnership Deed is a formal legal charter executed under the Indian Partnership Act, 1932 that defines the contractual relationship between two or more persons carrying on business in common with a view to profit (Section 4). It legally governs capital contributions, profit and loss sharing ratios, management rights, working partner remuneration under Section 40(b), interest on capital, admission, retirement, and dispute resolution.',
  },
  {
    q: 'Is registration of a Partnership Deed compulsory in India under the Indian Partnership Act, 1932?',
    a: 'No. Registration of a partnership deed with the Registrar of Firms (ROF) under Section 58 is optional. However, Section 69 of the Indian Partnership Act, 1932 imposes severe legal disabilities on unregistered firms: an unregistered firm cannot file a civil lawsuit in court against third parties to enforce contractual debts, and partners cannot sue co-partners or the firm. Therefore, registration is practically indispensable for commercial protection.',
  },
  {
    q: 'What is the maximum partner remuneration deductible under Section 40(b) for AY 2025-26?',
    a: 'Under Section 40(b) of the Income-tax Act, 1961 as amended by the Finance (No. 2) Act, 2024 (effective AY 2025-26 onwards), deductible working-partner remuneration is capped at: (1) on the first ₹6,00,000 of book profit or in case of a loss, ₹3,00,000 or 90% of book profit (whichever is higher); and (2) on the balance of book profit, 60%. Competitor deeds showing ₹1,50,000 are obsolete.',
  },
  {
    q: 'What is the critical drafting rule for partner remuneration to avoid income tax disallowance?',
    a: 'Assessing Officers routinely disallow partner remuneration under Section 40(b) if the deed merely states "remuneration shall be paid as per the provisions of Section 40(b)". Under established judicial precedents, the partnership deed must either explicitly quantify the monetary remuneration (e.g. ₹50,000 per month) or specify the exact statutory computation formula (90% on first ₹6L, 60% on balance) and identify the designated working partners by name.',
  },
  {
    q: 'What is Section 194T of the Income-tax Act and when does 10% TDS apply to partners?',
    a: 'Effective 1 April 2025, Section 194T mandates that partnership firms and LLPs must deduct TDS at 10% on any salary, remuneration, commission, bonus, or interest credited or paid to a partner if aggregate payments exceed ₹20,000 in a financial year. However, the partner’s share of net profit is exempt under Section 10(2A) and is not subject to Section 194T TDS.',
  },
  {
    q: 'What happens to a partnership firm when a partner dies under Section 42(c)?',
    a: 'Under Section 42(c) of the Indian Partnership Act, 1932, a partnership firm dissolves automatically upon the death of any partner by statutory default, UNLESS the partnership deed contains an explicit continuation covenant. All professionally drafted deeds override Section 42(c) by providing that the firm shall continue with the surviving partners, and the deceased partner’s legal heirs shall be settled in monetary terms.',
  },
  {
    q: 'What stamp duty is payable on a Partnership Deed in Maharashtra and Delhi?',
    a: 'In Maharashtra, under Article 46 of the Maharashtra Stamp Act, stamp duty is 1% of the firm’s capital contribution, subject to a minimum of ₹500 and a maximum cap of ₹50,000 (raised from ₹15,000 w.e.f. 14 October 2024). In Delhi, stamp duty is 1% of capital, minimum ₹200, maximum ₹5,000 under Article 46 of the Indian Stamp Act (Delhi Schedule).',
  },
  {
    q: 'What happens if a partnership firm operates without a written Partnership Deed?',
    a: 'Without a written deed, statutory defaults under Section 13 apply: (1) profits and losses are shared equally regardless of capital contribution; (2) partners receive zero salary or remuneration; (3) zero interest on capital is allowed; (4) income tax deductions under Section 40(b) are completely denied; and (5) scheduled banks will refuse to open a Current Account in the firm’s name.',
  },
  {
    q: 'What is the recent Maharashtra Partnership (Amendment) Act, 2026 update?',
    a: 'Notified on 20 July 2026, the Maharashtra Partnership (Amendment) Act, 2026 mandates electronic e-filing for firm registration, amendments (Form E), and notices with the Registrar of Firms (ROF) Maharashtra. This digital transition was enacted to eliminate manual paperwork backlogs at the Mumbai and Pune ROF offices and expedite the issuance of Registration Certificates.',
  },
  {
    q: 'What is ROF Form 1 (or Form A in Maharashtra) and who must sign it?',
    a: 'Form 1 (termed Form A in Maharashtra) is the statutory application statement for registration of a firm under Section 58 of the Indian Partnership Act, 1932. It records the firm name, principal place of business, other places of business, partner full names and permanent addresses, joining dates, and duration. It must be physically or digitally signed and verified by ALL partners before a Notary Public, Magistrate, or Gazetted Officer.',
  },
  {
    q: 'What is the maximum permissible interest on capital deductible under Section 40(b)?',
    a: 'Under Section 40(b)(iv) of the Income-tax Act, interest paid to partners on their capital contribution or current account balances is tax-deductible only up to a maximum rate of 12% per annum simple interest. Furthermore, interest is deductible only if it is explicitly authorized by the partnership deed from the date of execution.',
  },
  {
    q: 'Does a Partnership Deed require notarisation or registration at the Sub-Registrar’s office?',
    a: 'Notarisation of a partnership deed before a Notary Public is standard commercial practice to authenticate partner signatures and execution date. Registration under the Registration Act, 1908 at the Sub-Registrar’s office is mandatory ONLY if the partnership deed contributes or transfers immovable property (land, buildings) into the firm’s common stock (Section 17). Otherwise, registration with the Registrar of Firms (ROF) under Section 58 suffices.',
  },
  {
    q: 'Can a partnership deed be amended later, and how is an amendment executed?',
    a: 'Yes. Any alteration in profit sharing, capital, partner remuneration, firm address, or business objects is executed through a Supplementary Partnership Deed (Deed of Modification) signed by all partners on appropriate non-judicial stamp paper. If the firm is registered with the ROF, Form V (or Form E) must be filed with the Registrar within statutory time limits.',
  },
  {
    q: 'Can a minor be admitted as a partner in an Indian partnership firm?',
    a: 'Under Section 30 of the Indian Partnership Act, 1932, a minor cannot be a full partner because an agreement with a minor is void ab initio under the Indian Contract Act. However, with the consent of all existing partners, a minor can be admitted to the BENEFITS of partnership. The minor is not personally liable for firm debts; only their share in firm property is liable.',
  },
  {
    q: 'What documents are required to open a Bank Current Account for a partnership firm?',
    a: 'Banks require: (1) Certified copy of the Stamped Partnership Deed; (2) Firm PAN Card; (3) Registration Certificate from Registrar of Firms (if registered) or 2 secondary business proofs (GSTIN, Shop & Establishment, Udyam); (4) Partner PAN cards and Aadhaar/Passports; and (5) Firm Bank Account Opening Mandate signed by all partners specifying signing powers.',
  },
  {
    q: 'How does the CorpLawUpdates AI Business Objects Assistant customize the partnership deed?',
    a: 'Our AI Assistant leverages Google Gemini 2.5 models trained on Indian commercial precedents and the Indian Partnership Act, 1932. When you provide a brief prompt or select an industry preset, the engine generates an exhaustive business purpose clause covering core commercial activities, ancillary operational authority, intellectual property licensing, and statutory compliance powers.',
  },
]

const CLAUSE_CHECKLIST = [
  {
    no: '1',
    name: 'Preamble, Parties & Date',
    statutoryRef: 'Section 4, Indian Partnership Act',
    importance: 'Identifies all partners with legal names, fathers’ names, permanent addresses, PAN, and Aadhaar.',
    pitfall: 'Vague descriptions lead to identity challenges during firm PAN and bank KYC verification.',
  },
  {
    no: '2',
    name: 'Firm Name & Principal Place',
    statutoryRef: 'Section 58(1)(a) & (b)',
    importance: 'Defines the legal operating trade name and principal office address for statutory notices and ROF filings.',
    pitfall: 'Using restricted words like "Crown", "National", "Imperial" without Central Government sanction violates Section 58(3).',
  },
  {
    no: '3',
    name: 'Business Nature & AI Purpose Objects',
    statutoryRef: 'Section 12(a)',
    importance: 'Comprehensive description of core commercial operations, ancillary trading powers, and consultancy rights.',
    pitfall: 'Ultra-narrow purpose clauses prevent opening new product lines or obtaining bank working capital facilities.',
  },
  {
    no: '4',
    name: 'Commencement & Duration (At Will vs Fixed)',
    statutoryRef: 'Section 7 & Section 43',
    importance: 'Specifies whether the firm is "Partnership at Will" (dissolvable by written notice) or for a fixed duration.',
    pitfall: 'If silent, it is presumed "at will", enabling any individual partner to trigger dissolution by simple notice.',
  },
  {
    no: '5',
    name: 'Capital Contribution & Schedule',
    statutoryRef: 'Section 13(c) & Article 46 Stamp Act',
    importance: 'Records initial capital brought in by each partner (cash/kind) and procedures for additional capital calls.',
    pitfall: 'Failure to record capital invites ad-valorem stamp duty disputes and internal equity claims.',
  },
  {
    no: '6',
    name: 'Profit & Loss Sharing Ratios',
    statutoryRef: 'Section 13(b)',
    importance: 'Defines exact mathematical percentages (totalling 100%) for distributing net profits and bearing losses.',
    pitfall: 'If deed is silent, Section 13 mandates equal profit sharing regardless of whether one partner invested 95% capital.',
  },
  {
    no: '7',
    name: 'Working Partner Remuneration (AY 2025-26)',
    statutoryRef: 'Section 40(b), Income-tax Act, 1961',
    importance: 'Explicitly names working partners and sets statutory limits: 90%/₹3L on first ₹6L profit, 60% on balance.',
    pitfall: 'Vague drafting ("as per Section 40(b)") gets remuneration disallowed by tax Assessing Officers.',
  },
  {
    no: '8',
    name: 'Interest on Capital (Max 12% p.a.)',
    statutoryRef: 'Section 40(b)(iv) & Section 13(c)',
    importance: 'Authorises simple interest on partner capital/current balances up to the 12% p.a. tax-deductible ceiling.',
    pitfall: 'Deed silence means 0% interest. Interest exceeding 12% is disallowed and taxed in the firm’s hands at 30%.',
  },
  {
    no: '9',
    name: 'Section 194T TDS Compliance (w.e.f. 1 Apr 2025)',
    statutoryRef: 'Section 194T, Income-tax Act',
    importance: 'Obligates firm to deduct 10% TDS on partner salary/interest exceeding ₹20,000 per financial year.',
    pitfall: 'Failure to register for TAN and deduct TDS attracts interest, penalty, and disallowance under Section 40(a)(ia).',
  },
  {
    no: '10',
    name: 'Banking Operations & Signing Powers',
    statutoryRef: 'Section 19(2)(b)',
    importance: 'Prescribes operating mandate (singly or jointly) for cheques, RTGS, loans, and digital banking.',
    pitfall: 'Without specific deed authority, no partner has implied authority to open a bank account on behalf of the firm.',
  },
  {
    no: '11',
    name: 'Partner Duties, Restrictions & Non-Compete',
    statutoryRef: 'Sections 9, 11(2) & 16',
    importance: 'Enforces good faith, forbids secret profits, and restricts competing business during partnership.',
    pitfall: 'Lack of non-compete allows a partner to divert customers and lucrative contracts to their private firm.',
  },
  {
    no: '12',
    name: 'Admission, Retirement & Expulsion',
    statutoryRef: 'Sections 31, 32 & 33',
    importance: 'Sets notice period (standard 30 days), unanimous consent for new partners, and buyout settlement terms.',
    pitfall: 'Partners cannot expel a partner unless the deed expressly grants expulsion powers exercised in good faith.',
  },
  {
    no: '13',
    name: 'Succession & Non-Dissolution on Death',
    statutoryRef: 'Section 42(c) Override',
    importance: 'CRITICAL: Overrides automatic statutory dissolution upon a partner’s demise; firm continues with survivors.',
    pitfall: 'Without this clause, the firm dissolves instantly upon death, freezing bank accounts and business contracts.',
  },
  {
    no: '14',
    name: 'Arbitration & Dispute Resolution',
    statutoryRef: 'Arbitration & Conciliation Act, 1996',
    importance: 'Mandates confidential fast-track arbitration with designated seat and venue before civil litigation.',
    pitfall: 'Omission forces protracted civil court litigation, locking firm bank accounts under court receivership.',
  },
  {
    no: '15',
    name: 'Dissolution Waterfall & Supplementary Deed',
    statutoryRef: 'Section 48, Indian Partnership Act',
    importance: 'Codifies asset liquidation priority: (1) third-party debts; (2) partner advances; (3) capital; (4) surplus split.',
    pitfall: 'Disputes over priority during winding up lead to personal asset attachment by creditors.',
  },
]

const STAMP_DUTY_TABLE = [
  {
    state: 'Maharashtra',
    rate: '1% of total capital contribution',
    limits: 'Min ₹500, Max ₹50,000',
    notes: 'Cap increased from ₹15,000 to ₹50,000 w.e.f. 14 Oct 2024. Article 46 Maharashtra Stamp Act.',
  },
  {
    state: 'Delhi (NCT)',
    rate: '1% of total capital contribution',
    limits: 'Min ₹200, Max ₹5,000',
    notes: 'Indian Stamp Act (Delhi Amendment), Article 46. Available via SHCIL e-Stamping.',
  },
  {
    state: 'Karnataka',
    rate: 'Flat ₹2,000',
    limits: 'Flat fee',
    notes: 'Karnataka Stamp Act, 1957. Processed via Kaveri 2.0 e-stamping portal.',
  },
  {
    state: 'Gujarat / DNH',
    rate: '1% of capital contribution',
    limits: 'Min ₹500, Max ₹10,000',
    notes: 'Gujarat Stamp Act, Article 44. e-Stamping via SHCIL and cyber treasury.',
  },
  {
    state: 'Rajasthan',
    rate: '₹2,000 per ₹50,000 capital',
    limits: 'Min ₹2,000, Max ₹10,000',
    notes: 'Rajasthan Stamp Act, Article 44. Integrated with Rajasthan e-Gras.',
  },
  {
    state: 'Madhya Pradesh',
    rate: '2% of total capital contribution',
    limits: 'Min ₹2,000, Max ₹10,000',
    notes: 'MP Stamp Act. e-Stamping mandatory through MPIGR portal.',
  },
  {
    state: 'Bihar / Jharkhand',
    rate: '2.5% of total capital contribution',
    limits: 'Min ₹1,000, Max ₹10,000',
    notes: 'Bihar Stamp Act / Jharkhand Stamp Rules. Physical or e-stamp as applicable.',
  },
  {
    state: 'Chhattisgarh',
    rate: '₹1,000 up to ₹50k; else 2%',
    limits: 'Max ₹5,000',
    notes: 'Chhattisgarh Stamp Rules. SHCIL e-stamping.',
  },
  {
    state: 'Jammu & Kashmir',
    rate: '₹1,000 up to ₹50k; else 2%',
    limits: 'Max ₹5,000',
    notes: 'J&K Stamp Act. e-Stamping via SHCIL.',
  },
  {
    state: 'Goa',
    rate: '₹500 + ₹500 per ₹50k capital',
    limits: 'Max ₹5,000',
    notes: 'Goa Stamp Act, Article 46.',
  },
  {
    state: 'Kerala',
    rate: 'Flat ₹5,000',
    limits: 'Flat fee',
    notes: 'Kerala Stamp Act, 1959. Pearl e-stamping portal.',
  },
  {
    state: 'Punjab / Haryana',
    rate: 'Flat ₹1,000',
    limits: 'Flat fee',
    notes: 'Punjab / Haryana Stamp Rules. Flat duty regardless of capital.',
  },
  {
    state: 'Uttar Pradesh / UK',
    rate: 'Flat ₹750',
    limits: 'Flat fee',
    notes: 'UP Stamp Act, Article 46. Available via SHCIL e-stamp.',
  },
  {
    state: 'AP / Telangana',
    rate: 'Flat ₹500 (₹100 if cap ≤ ₹5k)',
    limits: 'Flat ₹500',
    notes: 'AP/TS Stamp Act. Both states feature fully digital firm registration.',
  },
  {
    state: 'Tamil Nadu',
    rate: 'Flat ₹300 (₹50 if cap ≤ ₹500)',
    limits: 'Flat ₹300',
    notes: 'Tamil Nadu Stamp Act, Article 46. SHCIL e-stamping.',
  },
  {
    state: 'West Bengal / Daman',
    rate: 'Flat ₹150',
    limits: 'Flat ₹150',
    notes: 'Bengal Stamp Act, 1935, Article 46. GRIPS e-portal.',
  },
  {
    state: 'Assam / Sikkim / NE',
    rate: 'Flat ₹100',
    limits: 'Flat ₹100',
    notes: 'Standard nominal non-judicial stamp paper under Indian Stamp Act.',
  },
  {
    state: 'Tripura',
    rate: 'Flat ₹2,000',
    limits: 'Flat fee',
    notes: 'Per Tripura Stamp (Amendment) Act, 2020.',
  },
]

export default function PartnershipDeedPage() {
  const jsonLdWebPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Partnership Deed Format — Free Word & PDF Download, Sample Draft & AI Generator (India, 2026)',
    url: 'https://www.corplawupdates.in/documents/partnership-deed',
    description:
      'Download free partnership deed format in Word (.docx) and PDF for India. Generate custom Partnership Deed drafts with AI business objects assistant, Section 40(b) (AY 2025-26) remuneration slabs, Section 194T TDS compliance, 18-state stamp duty calculator, and ROF Form 1.',
    inLanguage: 'en-IN',
    publisher: {
      '@type': 'Organization',
      name: 'CorpLawUpdates.in',
      url: 'https://www.corplawupdates.in',
    },
  }

  const jsonLdSoftware = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CorpLawUpdates AI Partnership Deed & ROF Form 1 Generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any (Web-based)',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'INR',
    },
    featureList: [
      'AY 2025-26 Section 40(b) Working Partner Remuneration Slabs (₹6L / ₹3L limit)',
      'Section 194T 10% TDS Compliance Clause (w.e.f. 1 April 2025)',
      'Section 42(c) Succession & Business Continuity Covenant',
      'Google Gemini 2.5 Flash Business Objects Generator',
      '18-State Article 46 Stamp Duty Auto-Calculator (Maharashtra ₹50k Cap)',
      'Multi-Partner Capital & Profit Sharing Engine (2 to 8 partners, auto-balancing to 100%)',
      'ROF Form 1 (Statement for Registration of Firm under Section 58)',
      'Bank Current Account Opening Mandate generator',
      'Export to unbranded Word (.docx, Bookman Old Style) and clean PDF',
    ],
  }

  const jsonLdHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Draft, Stamp, and Register a Partnership Firm in India',
    description:
      'Step-by-step statutory guide to drafting a partnership deed, calculating stamp duty, executing on non-judicial stamp paper, and filing Form 1 with the Registrar of Firms.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Draft the Deed with Essential Clauses',
        text: 'Draft the partnership deed incorporating capital contributions, profit ratios, Section 40(b) remuneration formula, 12% interest on capital, and Section 42(c) non-dissolution succession covenant.',
      },
      {
        '@type': 'HowToStep',
        name: 'Purchase Non-Judicial Stamp Paper',
        text: 'Calculate state stamp duty under Article 46 (e.g. 1% up to ₹50,000 in Maharashtra, flat ₹2,000 in Karnataka) and procure e-stamp paper from SHCIL or state treasury portal.',
      },
      {
        '@type': 'HowToStep',
        name: 'Execute and Notarize the Deed',
        text: 'All partners sign each page of the stamped deed in the physical presence of two independent witnesses. Attest before a Public Notary.',
      },
      {
        '@type': 'HowToStep',
        name: 'Obtain Firm PAN and TAN',
        text: 'Apply for the firm PAN card via NSDL/UTIITSL using the notarized deed. Obtain TAN if subject to Section 194T TDS deductions.',
      },
      {
        '@type': 'HowToStep',
        name: 'File Form 1 with Registrar of Firms (ROF)',
        text: 'Submit Form 1 (Form A in Maharashtra via e-filing portal) signed by all partners with certified deed copy and treasury challan to obtain Certificate of Registration.',
      },
      {
        '@type': 'HowToStep',
        name: 'Open Bank Current Account',
        text: 'Submit the Bank Mandate, stamped deed, firm PAN, and partner KYC to open a dedicated current account in the firm name.',
      },
    ],
  }

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Schema.org JSON-LD scripts */}
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

      {/* Hero Header */}
      <header className="border-b border-slate-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-emerald-700 transition">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <Link href="/documents" className="hover:text-emerald-700 transition">
              Documents
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-700">Partnership Deed</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Indian Partnership Act, 1932
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              <Calculator className="w-3.5 h-3.5" /> Sec 40(b) AY 2025-26 Slabs
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Percent className="w-3.5 h-3.5" /> Sec 194T TDS Ready (w.e.f. 1 Apr 2025)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" /> Gemini 2.5 AI Business Objects
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Partnership Deed Format — Free Word (.docx) & PDF Download, Sample Draft & AI Generator
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-4xl">
            Draft an institutional-grade, tax-optimized partnership deed in minutes. Includes the revised{' '}
            <strong className="text-slate-800 font-semibold">Finance (No. 2) Act, 2024 Section 40(b) remuneration slabs</strong>, Section 194T 10% TDS compliance, Section 42(c) business continuity covenant, 18-State Article 46 Stamp Duty schedule, ROF Form 1 statement, and Bank Current Account Mandate.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="/api/documents/partnership-deed-download?format=docx&type=deed"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 text-white font-medium text-sm hover:bg-emerald-800 shadow-sm transition"
            >
              <Download className="w-4 h-4" /> Download Sample Deed (.docx)
            </a>
            <a
              href="/api/documents/partnership-deed-download?format=pdf&type=deed"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-700 border border-slate-300 font-medium text-sm hover:bg-slate-50 shadow-sm transition"
            >
              <FileText className="w-4 h-4 text-rose-600" /> Download Sample PDF
            </a>
            <a
              href="/api/documents/partnership-deed-download?format=docx&type=rof"
              download
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white text-slate-700 border border-slate-300 font-medium text-sm hover:bg-slate-50 shadow-sm transition"
            >
              <Download className="w-4 h-4 text-blue-600" /> ROF Form 1 (.docx)
            </a>
            <a
              href="#interactive-generator"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> Jump to AI Generator
            </a>
          </div>
        </div>
      </header>

      {/* Princeton GEO Direct Answer Block */}
      <section className="bg-gradient-to-b from-slate-100 to-white py-8 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 hidden sm:block">
                <Gavel className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Direct Legal Answer
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Verified under Indian Partnership Act, 1932 & Income-tax Act, 1961
                  </span>
                </div>
                <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900">
                  What is a Partnership Deed?
                </h2>
                <div className="mt-3 text-slate-700 space-y-2.5 text-sm sm:text-base leading-relaxed">
                  <p>
                    A <strong>Partnership Deed</strong> is a formal written agreement executed among two or more persons entering into business together under Section 4 of the <strong>Indian Partnership Act, 1932</strong>. It legally establishes the firm name, registered principal place of business, capital contributions, profit and loss sharing ratios, operational authority, and banking arrangements.
                  </p>
                  <p>
                    <strong>Why is a written deed indispensable?</strong> While an oral partnership is legally recognised, operating without a written deed triggers severe statutory defaults under Section 13: <em>profits and losses must be shared equally regardless of capital contributed, no partner salary is allowed, and no interest on capital can be paid</em>. Furthermore, tax deductions for working partner remuneration under <strong>Section 40(b)</strong> are completely denied by the Income Tax Department without an explicit written deed.
                  </p>
                  <p>
                    <strong>Is registration compulsory?</strong> Firm registration with the Registrar of Firms (ROF) under Section 58 is optional. However, <strong>Section 69</strong> imposes disabling handicaps on unregistered firms: an unregistered firm cannot sue third parties or clients to recover commercial debts, and partners cannot sue co-partners in court.
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Governing Law:</strong> Act IX of 1932</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Tax Status:</strong> Flat 30% firm tax + 40(b) deductions</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Succession:</strong> Overrides Sec 42(c) dissolution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Workstation Component */}
      <section id="interactive-generator" className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-emerald-700" />
              Partnership Deed & ROF Form 1 Interactive Workstation
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select an industry preset, customize partner shares and profit ratios, generate exhaustive business purpose clauses with Gemini AI, simulate Section 40(b) tax deductions, and export professional DOCX & PDF packages.
            </p>
          </div>

          <PartnershipDeedClient />
        </div>
      </section>

      {/* Section 2: 15 Essential Clauses Checklist */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Statutory Checklist
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              15 Essential Clauses of a Legally Enforceable Partnership Deed
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              A partnership deed must withstand scrutiny from the Registrar of Firms, commercial banks, and Income Tax Assessing Officers. Ensure each of these 15 statutory clauses is drafted with precision.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-48">Clause Name</th>
                  <th className="py-3 px-4 w-52">Statutory Basis</th>
                  <th className="py-3 px-4">Drafting Objective & Legal Purpose</th>
                  <th className="py-3 px-4 w-64 text-rose-700">Hazard / Drafting Trap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {CLAUSE_CHECKLIST.map((clause) => (
                  <tr key={clause.no} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-semibold text-center text-slate-500">{clause.no}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{clause.name}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-emerald-800 bg-emerald-50/50 rounded">
                      {clause.statutoryRef}
                    </td>
                    <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-700">{clause.importance}</td>
                    <td className="py-3.5 px-4 text-xs text-rose-800 bg-rose-50/30">{clause.pitfall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 3: Stamp Duty by State (Article 46) */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              State Stamp Schedules
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              Stamp Duty on Partnership Deeds Across All 18 States & UTs (Article 46)
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              A partnership deed is charged as an <em>&ldquo;Instrument of Partnership&rdquo;</em> under Article 46 of the Indian Stamp Act, 1899 or corresponding State Stamp Acts. Under <strong>Section 35 of the Indian Stamp Act</strong>, any instrument not duly stamped is strictly inadmissible as evidence in court and attracts impounding with penalties up to 10 times the deficit duty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STAMP_DUTY_TABLE.map((item) => (
              <div
                key={item.state}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" /> {item.state}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {item.limits}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-800">{item.rate}</div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.notes}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs sm:text-sm text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Important E-Stamping Rule:</strong> In states like Maharashtra, Delhi, Gujarat, Karnataka, Tamil Nadu, and Uttar Pradesh, physical non-judicial stamp paper is largely phased out. The deed must be printed on an e-Stamp Certificate generated through Stock Holding Corporation of India Ltd (SHCIL), Maharashtra GRAS, or Karnataka Kaveri 2.0 with the First Party entered as the firm name and Second Party as the partners.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Section 40(b) Remuneration & Interest Engine (AY 2025-26) */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Income Tax Act Optimization
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                Partner Remuneration & Interest on Capital: Section 40(b) Slabs (AY 2025-26)
              </h2>
              <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
                The <strong>Finance (No. 2) Act, 2024</strong> introduced historic revisions to working partner remuneration deduction limits under <strong>Section 40(b)(v)</strong>, effective for Assessment Year 2025-26 and all subsequent financial years. This was the first major slab increase in over 15 years, doubling the base book-profit threshold from ₹3,00,000 to ₹6,00,000.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Book Profit Tier</th>
                      <th className="py-3 px-4 text-emerald-800">New Deductible Ceiling (AY 2025-26 onwards)</th>
                      <th className="py-3 px-4 text-slate-400 line-through">Old Limit (Pre-2024)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        On the first ₹6,00,000 of book profit (or in case of a loss)
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        ₹3,00,000 or 90% of book profit, whichever is higher
                      </td>
                      <td className="py-3 px-4 text-slate-400 line-through text-xs">
                        ₹1,50,000 or 90% of book profit on first ₹3L
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        On the balance of book profit
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        60% of book profit
                      </td>
                      <td className="py-3 px-4 text-slate-400 line-through text-xs">
                        60% of book profit
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>The Mathematical Quantification Rule:</strong> Income Tax Assessing Officers (AOs) strictly disallow partner remuneration if a deed vaguely states <em>&ldquo;salary shall be paid as per Section 40(b)&rdquo;</em>. Established judicial precedents (such as the Delhi High Court in <em>CIT v. Sood Brij & Associates</em>) mandate that the deed must either specify the exact rupee figure or articulate the precise computation slab formula.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                  <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Working Partner Designation:</strong> Remuneration deductions are permissible <em>solely</em> for partners explicitly designated in the deed as &ldquo;Working Partners&rdquo; actively engaged in conducting firm business. Sleeping or financing partners cannot draw deductible salaries.
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Calculator className="w-5 h-5" /> Section 40(b) Worked Examples
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Comparative tax deductibility under the new Finance Act 2024 provisions:
              </p>

              <div className="mt-5 space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span>Scenario A: Net Loss of ₹1,50,000</span>
                    <span className="text-emerald-400 font-bold">Max Remuneration: ₹3,00,000</span>
                  </div>
                  <p className="text-slate-400 mt-1">
                    Even when the firm incurs a financial loss, a minimum deductible remuneration of <strong>₹3,00,000</strong> is allowable to working partners.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span>Scenario B: Book Profit of ₹5,00,000</span>
                    <span className="text-emerald-400 font-bold">Max Remuneration: ₹4,50,000</span>
                  </div>
                  <p className="text-slate-400 mt-1">
                    Calculated as 90% of ₹5,00,000 = ₹4,50,000 (which exceeds the ₹3,00,000 statutory floor).
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-800/90 border border-slate-700">
                  <div className="flex justify-between font-semibold text-slate-200">
                    <span>Scenario C: Book Profit of ₹15,00,000</span>
                    <span className="text-emerald-400 font-bold">Max Remuneration: ₹10,80,000</span>
                  </div>
                  <p className="text-slate-400 mt-1">
                    Calculated as 90% of first ₹6,00,000 (₹5,40,000) + 60% on balance ₹9,00,000 (₹5,40,000) = ₹10,80,000. Under the old pre-2024 rules, this was only ₹9,90,000!
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400">
                <strong>Interest on Capital:</strong> Under Section 40(b)(iv), simple interest paid to partners is capped at <strong>12% per annum</strong>. Any excess interest is added back to firm income and taxed at the 30% firm rate.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Section 194T TDS Compliance (from 1 April 2025) */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
              New Statutory Compliance
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              Section 194T: 10% TDS on Payments to Partners (Effective 1 April 2025)
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
              Enacted via the Finance (No. 2) Act, 2024, <strong>Section 194T</strong> establishes an unprecedented withholding tax regime for partnership firms and LLPs paying remuneration, interest, or commissions to their partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg mb-3">
                10%
              </div>
              <h3 className="font-bold text-slate-900 text-base">TDS Deduction Rate</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                The firm must deduct tax at source at <strong>10%</strong> at the time of credit to the account of the partner or at the time of payment in cash or cheque, whichever is earlier.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg mb-3">
                ₹20k
              </div>
              <h3 className="font-bold text-slate-900 text-base">Annual Threshold Limit</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                TDS applies only when the aggregate amount of salary, remuneration, commission, bonus, or interest credited/paid to a specific partner exceeds <strong>₹20,000</strong> during the financial year.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-3">
                10(2A)
              </div>
              <h3 className="font-bold text-slate-900 text-base">Profit Share is Exempt</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                A partner’s share in the total income / net profits of the firm remains 100% tax-exempt in the hands of the partner under <strong>Section 10(2A)</strong> and is NOT subject to Section 194T TDS.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50/50 p-4 text-xs sm:text-sm text-purple-900">
            <strong>Actionable Requirement:</strong> Every partnership firm paying remuneration or interest to partners must obtain a Tax Deduction and Collection Account Number (<strong>TAN</strong>) under Section 203A and file quarterly Form 26Q TDS returns. Our generated deed includes Clause 9 explicitly obligating the firm to withhold Section 194T TDS.
          </div>
        </div>
      </section>

      {/* Section 6: Registration with Registrar of Firms & Section 69 Consequences */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
              Procedural Protection
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              Registrar of Firms (ROF) Registration & Section 69 Disabilities
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
              Under Indian jurisprudence, firm registration is voluntary under Section 58. However, an unregistered firm is practically crippled in commercial litigation due to the harsh procedural barriers codified in <strong>Section 69</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-rose-50/40 border border-rose-200 rounded-xl p-6">
              <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-700" />
                Disabilities of an Unregistered Firm (Section 69)
              </h3>
              <ul className="mt-4 space-y-3 text-xs sm:text-sm text-rose-950">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700 shrink-0">•</span>
                  <span><strong>Cannot Sue Third Parties:</strong> The firm cannot file a civil suit in any court against any customer, vendor, or third party to enforce a contract or recover pending commercial dues (Sec 69(2)).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700 shrink-0">•</span>
                  <span><strong>Partners Cannot Sue Co-Partners:</strong> No partner can institute a lawsuit against co-partners or the firm to enforce rights arising from the deed or the Partnership Act (Sec 69(1)).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-rose-700 shrink-0">•</span>
                  <span><strong>No Legal Set-Off Exceeding ₹100:</strong> If a third party sues the unregistered firm, the firm cannot claim a legal set-off or counterclaim in court if the disputed amount exceeds a paltry ₹100 (Sec 69(3)).</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-6">
              <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                Exceptions: Rights Retained Even Without Registration
              </h3>
              <ul className="mt-4 space-y-3 text-xs sm:text-sm text-emerald-950">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700 shrink-0">•</span>
                  <span><strong>Suit for Dissolution:</strong> A partner can sue for the dissolution of the firm and for taking accounts of a dissolved firm (Sec 69(3)(a)).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700 shrink-0">•</span>
                  <span><strong>Third Parties Can Always Sue the Firm:</strong> Third parties suffer no disability; they can sue the unregistered firm and its partners jointly and severally.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700 shrink-0">•</span>
                  <span><strong>Criminal Complaints & Statutory Tribunals:</strong> Section 69 applies strictly to civil suits arising from contracts; it does not bar criminal proceedings (e.g. cheque bounce under Section 138 NI Act) or labor disputes.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs sm:text-sm text-blue-900">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <strong>Maharashtra Partnership (Amendment) Act, 2026 Update:</strong> Notified on 20 July 2026, the Maharashtra Government has made online electronic filing mandatory for all partnership firm registrations (Form A) and amendments (Form E) through the ROF Maharashtra portal to eliminate manual office queues in Mumbai and Pune.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: With Deed vs Without Deed (Section 13 Defaults) */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-200 px-2.5 py-1 rounded">
              Comparative Analysis
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              What Happens Without a Partnership Deed? Section 13 Statutory Defaults
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              When business founders operate on verbal arrangements or execute an incomplete deed that omits crucial operational clauses, the Indian Partnership Act, 1932 imposes rigid default rules:
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-44">Subject Matter</th>
                  <th className="py-3.5 px-4 text-emerald-800">With Our Custom Partnership Deed</th>
                  <th className="py-3.5 px-4 text-rose-800">Without a Deed (Statutory Default)</th>
                  <th className="py-3.5 px-4 w-48">Statutory Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Profit & Loss Split</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">Divided strictly in agreed ratio (e.g. 70:30 or 50:50)</td>
                  <td className="py-3.5 px-4 text-rose-800">Must be shared EQUALLY regardless of unequal capital</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">Section 13(b)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Partner Salary / Remuneration</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">Deductible under Sec 40(b) (90%/60% slabs)</td>
                  <td className="py-3.5 px-4 text-rose-800">ZERO salary permitted; tax deductions 100% denied</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">Section 13(a)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Interest on Capital</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">Permitted up to 12% p.a. simple interest</td>
                  <td className="py-3.5 px-4 text-rose-800">ZERO interest on capital allowed</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">Section 13(c)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Partner Demise / Insolvency</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">Firm CONTINUES; succession settlement with heirs</td>
                  <td className="py-3.5 px-4 text-rose-800 font-bold">FIRM DISSOLVES AUTOMATICALLY</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">Section 42(c)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Bank Current Account</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">Opened smoothly using certified deed & bank mandate</td>
                  <td className="py-3.5 px-4 text-rose-800">Banks will refuse account opening under RBI KYC norms</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">RBI KYC Directions</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Admission of New Partner</td>
                  <td className="py-3.5 px-4 text-emerald-800 font-medium">Can define majority or unanimous voting rules</td>
                  <td className="py-3.5 px-4 text-rose-800">Requires consent of EVERY existing partner (veto risk)</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">Section 31(1)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 8: Partnership Deed Amendment & Supplementary Deeds */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              Post-Execution Maintenance
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              Partnership Deed Amendment: Supplementary Deed Execution & Filings
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
              When business dynamics evolve—such as admitting an investor partner, retiring an existing partner, changing capital, or revising remuneration slabs following the Finance Act 2024—the original deed cannot be altered by handwritten annotations. The partners must execute a formal <strong>Supplementary Partnership Deed (Deed of Modification)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center mb-2">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Mutual Partner Consent</h3>
              <p className="text-xs text-slate-600 mt-1">
                Every modification requires the unanimous written consent of all continuing, outgoing, and incoming partners.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center mb-2">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Drafting & Stamping</h3>
              <p className="text-xs text-slate-600 mt-1">
                Execute on non-judicial stamp paper. If capital increases, differential stamp duty must be paid under Article 46.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center mb-2">
                3
              </span>
              <h3 className="font-bold text-slate-900 text-sm">ROF Intimation (Form V / E)</h3>
              <p className="text-xs text-slate-600 mt-1">
                For registered firms, submit Form V (Form E in Maharashtra) within 90 days of alteration to maintain valid ROF records.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center mb-2">
                4
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Bank & Tax Re-KYC</h3>
              <p className="text-xs text-slate-600 mt-1">
                Submit certified supplementary deed copy to the bank manager, Income Tax portal, and GST portal to update authorized signatories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Step-by-Step Post-Drafting Execution Checklist */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Workflow Guide
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              8-Step Execution & Registration Checklist
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              Follow this verified legal roadmap to bring your partnership firm into full statutory compliance:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-emerald-700">Step 1</div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">Finalize & Proofread</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Review all partner names, permanent addresses, capital figures, and profit split (must total 100%).
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-emerald-700">Step 2</div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">Procure E-Stamp Paper</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Purchase non-judicial stamp paper or e-stamp certificate from SHCIL/treasury as per your State schedule.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-emerald-700">Step 3</div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">Execute & Witness</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                All partners sign on each page of the deed in the presence of 2 independent witnesses who sign the attestation page.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-emerald-700">Step 4</div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">Notarise before Notary</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Attest the executed deed before a Public Notary with notary stamps and registration ledger entry.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-emerald-700">Step 5</div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">Obtain Firm PAN & TAN</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Apply for firm PAN (Form 49A) and TAN (Form 49B for Sec 194T TDS) via NSDL or UTIITSL online portal.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-emerald-700">Step 6</div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">Open Bank Current Account</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Submit notarized deed copy, firm PAN, Bank Mandate, and partner KYC to bank to open current account.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-emerald-700">Step 7</div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">File ROF Form 1</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Submit Form 1 (Form A in MH) with certified deed copy and fees to Registrar of Firms to obtain Certificate of Registration.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-emerald-700">Step 8</div>
              <h3 className="font-bold text-slate-900 text-sm mt-1">GST & Udyam Registration</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Complete GST registration if turnover exceeds ₹20L/₹40L, and register on Udyam portal for MSME benefits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: FAQs Section with Accordions */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Got Questions?
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-7 h-7 text-emerald-700" />
              Frequently Asked Questions on Partnership Deeds in India
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              Comprehensive legal answers based on the Indian Partnership Act, 1932, Income-tax Act, 1961 (AY 2025-26), and judicial precedents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 p-5 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition"
              >
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-start gap-2">
                  <span className="text-emerald-700 font-extrabold shrink-0">Q{idx + 1}.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Legal Resources & Cross-Links */}
      <section className="py-10 bg-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700" />
            Related Legal Workstations & Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/documents/memorandum-of-understanding"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-sm transition block group"
            >
              <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                MoU Generator & Format →
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Draft pre-incorporation partnerships, joint ventures, and preliminary commercial MoUs with AI.
              </p>
            </Link>

            <Link
              href="/calculators/llp-stamp-duty-calculator"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-sm transition block group"
            >
              <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                LLP Agreement Stamp Duty →
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Calculate state-by-state stamp duty on Form 3 LLP Agreements under Article 35/46.
              </p>
            </Link>

            <Link
              href="/documents/equitable-mortgage-deed"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-sm transition block group"
            >
              <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                MODT / Equitable Mortgage Deed →
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sec 58(f) title deed deposit drafts, Notice of Intimation (Sec 89B), and Form CHG-1.
              </p>
            </Link>

            <Link
              href="/calculators/company-incorporation-fee-calculator"
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:shadow-sm transition block group"
            >
              <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                Company Incorporation Fee →
              </div>
              <p className="text-xs text-slate-500 mt-1">
                SPICe+ Part B ROC fees, state stamp duty on MoA & AoA, and PAN/TAN processing costs.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
