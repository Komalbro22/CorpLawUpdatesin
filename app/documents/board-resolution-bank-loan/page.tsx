import { HelpCircle, Landmark, Scale, ShieldCheck, FileText, CheckCircle2, Info } from 'lucide-react'
import BankLoanClient from './BankLoanClient'

const pageUrl = 'https://www.corplawupdates.in/documents/board-resolution-bank-loan'

const faqs = [
  {
    question: 'What is the format of board resolution for availing a bank loan?',
    answer:
      'Under Section 179(3)(d) of the Companies Act, 2013 read with the Companies (Meetings of Board and its Powers) Rules, 2014, a company can borrow monies only by passing a resolution at a duly convened Board meeting. The resolution approves the sanction letter terms (sanctioned limit, interest rate, tenure, repayment), authorizes designated directors to execute loan agreements and security documents, approves the creation of security/charge on assets, and directs filing of statutory e-Form CHG-1 with the ROC within 30 days.',
  },
  {
    question: 'Can a board resolution for borrowing money be passed by circular resolution?',
    answer:
      'No. Under Section 179(3)(d) of the Companies Act, 2013, the power to borrow monies must be exercised by the Board of Directors ONLY by means of resolutions passed at meetings of the Board. Passing this resolution by circulation under Section 175 is strictly invalid in law, unless specifically delegated under the provisos of Section 179(3) to a committee of directors or managing director within defined limits.',
  },
  {
    question: 'What is the statutory borrowing limit under Section 180(1)(c) of the Companies Act, 2013?',
    answer:
      'Under Section 180(1)(c), the Board of Directors cannot borrow money, where the money to be borrowed together with the money already borrowed by the company (apart from temporary loans obtained from the company’s bankers in the ordinary course of business) exceeds the aggregate of its Paid-up Share Capital + Free Reserves + Securities Premium, without prior shareholder approval via a Special Resolution at a General Meeting (EGM).',
  },
  {
    question: 'Does Section 180(1)(c) apply to Private Limited Companies?',
    answer:
      'No. By virtue of MCA Exemption Notification No. G.S.R. 464(E) dated 5th June 2015, Section 180 does NOT apply to a private limited company, provided it has not committed a default in filing its financial statements (AOC-4) or annual returns (MGT-7) with the ROC. Consequently, a private company can borrow funds exceeding its paid-up capital and free reserves purely through an Ordinary Board Resolution without seeking shareholder approval, unless its Articles of Association (AOA) expressly provide otherwise.',
  },
  {
    question: 'What is e-Form CHG-1 and when must it be filed with the ROC?',
    answer:
      'Form CHG-1 is the statutory electronic return filed under Section 77(1) of the Companies Act, 2013 read with Rule 3 of the Companies (Registration of Charges) Rules, 2014 for creation or modification of charges on company assets (other than debentures, which require CHG-9). It must be filed on the MCA V3 portal within 30 days of the execution of the loan agreement or hypothecation deed. Upon approval, the ROC issues a Certificate of Registration of Charge in Form CHG-2.',
  },
  {
    question: 'What happens if Form CHG-1 is not filed within 30 days of charge creation?',
    answer:
      'Under Section 77, if Form CHG-1 is not filed within 30 days, the ROC may allow filing within an additional 30 days (total 60 days from creation) upon payment of additional ad-valorem fees. If not filed within 60 days, an extension of another 60 days (total 120 days) may be granted on payment of ad-valorem fees. Beyond 120 days from creation, the company must file a formal condonation petition in Form CHG-8 before the Regional Director (RD) under Section 87.',
  },
  {
    question: 'Can an unsecured corporate loan be availed without filing Form CHG-1?',
    answer:
      'Yes. If the credit facility is clean or unsecured (i.e. no mortgage, hypothecation, pledge, or lien is created on any company assets or book debts), no charge is created under Section 2(16) of the Act. Consequently, Form CHG-1 is NOT required to be filed with the ROC. Only the Board Resolution under Section 179(3)(d) is required.',
  },
  {
    question: 'Is a Common Seal mandatory on bank loan agreements and hypothecation deeds?',
    answer:
      'No. The Companies (Amendment) Act, 2015 made the Common Seal optional for Indian companies. Under Section 22(2) and Section 22(3) of the Companies Act, 2013, documents and contracts can be validly executed on behalf of the company by any two Directors, or by one Director and the Company Secretary. If the company chooses not to have a common seal, banks accept execution by two directors.',
  },
  {
    question: 'What is the difference between an exclusive charge and a pari-passu charge?',
    answer:
      'An exclusive charge gives the lending bank the sole and primary right over the specified secured asset to recover dues before all other creditors. A pari-passu charge is created when multiple lenders (in a consortium or multiple banking arrangement) share equal ranking and proportionate rights over the same secured assets in proportion to their outstanding debt.',
  },
  {
    question: 'Can a director give a personal guarantee for the company bank loan?',
    answer:
      'Yes. Commercial banks frequently stipulate the unconditional personal guarantee of promoter directors as collateral credit comfort. Under RBI guidelines (RBI/2022-23/24), banks may obtain personal guarantees of promoters/directors without paying any guarantee commission to them. The board resolution authorizes the company to record and accept such third-party guarantee arrangements.',
  },
  {
    question: 'What items are included in Free Reserves for calculating Section 180(1)(c) limits?',
    answer:
      'Under Section 2(43) of the Companies Act, 2013, "free reserves" means such reserves which, as per the latest audited balance sheet, are available for distribution as dividend. It EXCLUDES: (1) Any unrealized gains or revaluation reserves; (2) Changes in carrying value of assets; and (3) Any reserve created on amalgamation. However, Section 180(1)(c) explicitly permits adding the Securities Premium balance to paid-up capital and free reserves.',
  },
  {
    question: 'What documents must be submitted to the bank along with the Board Resolution?',
    answer:
      'Standard banking documentation includes: (1) Certified True Copy of Board Resolution signed by a Director/CS; (2) Duplicate copy of Sanction Letter signed by authorized signatories; (3) Executed Loan Agreement and Hypothecation/Mortgage Deeds; (4) List of Directors with DIN and specimen signatures; (5) Statutory Declaration under Section 179(3)(d) / Section 180; (6) Certificate of Incorporation, MOA & AOA; and (7) MCA Form CHG-1 challan and CHG-2 certificate upon ROC registration.',
  },
  {
    question: 'What is the stamp duty payable on bank loan agreements and hypothecation deeds?',
    answer:
      'Stamp duty is a state subject and varies by jurisdiction. In Maharashtra, stamp duty on loan agreements under Article 6/33 is 0.1% to 0.2% of the loan amount (capped at ₹10 Lakhs). In Delhi, it is governed by Schedule 1A (Article 6/35) ranging from ₹100 to 0.5%. In Karnataka, stamp duty on loan agreements is 0.1% to 0.2%. Always pay the requisite stamp duty via e-stamping or franking before deed execution.',
  },
  {
    question: 'When is filing Form MGT-14 mandatory for bank borrowing?',
    answer:
      'Filing e-Form MGT-14 with the ROC is mandatory within 30 days whenever a Public Limited Company passes a Special Resolution under Section 180(1)(c) (for borrowing beyond capital + free reserves) or Section 180(1)(a) (for creating security on company undertakings). For Private Companies, filing MGT-14 for Section 179(3)(d) borrowing powers was exempted under MCA Notification No. G.S.R. 464(E).',
  },
  {
    question: 'Can a company borrow money from a director under Section 179(3)(d)?',
    answer:
      'Yes. A company can accept unsecured loans from its directors, provided the director submits a written declaration confirming that the funds are not given out of borrowed or accepted funds from others. Such director loans are exempt from the definition of "deposit" under Rule 2(1)(c)(viii) of the Companies (Acceptance of Deposits) Rules, 2014, and must be disclosed in Form DPT-3 and the Board Report.',
  },
  {
    question: 'Where can I download the Board Resolution for bank loan in Word (.docx) and PDF format?',
    answer:
      'You can download the official, ready-to-sign Board Resolution format in editable Microsoft Word (.docx) and printable PDF format directly from this page using the 1-click download buttons above. You can customize the facility type (Term Loan, Cash Credit, Overdraft, LC/BG), loan amount, bank particulars, and security covenants to generate an exact certified copy in seconds.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Board Resolution for Bank Loan & Credit Facilities: Master Suite (2026)',
      description:
        'Download official Board Resolution format for availing bank loan (Term Loan, Cash Credit, Overdraft, LC/BG) under Section 179(3)(d) and Section 180(1)(c) of the Companies Act, 2013.',
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://www.corplawupdates.in/#website' },
      about: { '@id': `${pageUrl}#generator` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${pageUrl}#generator`,
      name: 'Corporate Bank Loan Board Resolution Generator & Compliance Workstation',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Works in Chrome, Safari, Firefox, Edge.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      featureList: [
        'Certified True Copy Board Resolution under Section 179(3)(d)',
        'Section 180(1)(c) statutory borrowing limit calculator',
        'Private company exemption engine under G.S.R. 464(E)',
        'EGM Special Resolution & Section 102 Explanatory Statement generator',
        'Formal Bank Intimation / Submission Letter generator',
        'Form CHG-1 charge registration extract for MCA ROC filing',
        'Instant Word (.docx) and printable PDF downloads',
      ],
    },
    {
      '@type': 'HowTo',
      '@id': `${pageUrl}#howto`,
      name: 'How to Avail and Pass Board Resolution for Bank Loan under Companies Act, 2013',
      description:
        'Step-by-step statutory workflow for obtaining board approval, passing special resolutions, executing loan agreements, and registering charges with ROC.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Receive Sanction Letter and Verify Commercial Terms',
          text: 'Obtain the credit sanction letter from the lending bank detailing the sanctioned limit, floating/fixed interest rate, margin requirements, tenure, and security covenants.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Verify Statutory Borrowing Limits under Section 180(1)(c)',
          text: 'Compare total borrowings (existing + proposed) against the aggregate of Paid-up Capital + Free Reserves + Securities Premium. For public companies exceeding limits, convene an EGM to pass a Special Resolution.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Convene Board Meeting and Pass Board Resolution',
          text: 'Convene a meeting of the Board of Directors under Section 179(3)(d) with at least 7 days statutory notice. Approve the facility, authorize signing directors, and approve security creation.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Execute Loan Agreements and Pay State Stamp Duty',
          text: 'Execute the Loan Agreement, Hypothecation Deed, and Guarantee Deeds on requisite non-judicial stamp paper or e-stamp certificates as per state stamp laws.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'File e-Form CHG-1 with ROC within 30 Days (Section 77)',
          text: 'File statutory Form CHG-1 on the MCA portal within 30 days of charge execution. Obtain the Certificate of Registration of Charge (Form CHG-2) and submit it to the bank for loan disbursement.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    },
  ],
}

export default function BankLoanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Princeton GEO Direct Answer Block */}
        <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-blue-600 rounded-r-xl p-4 md:p-5 text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
                <Info className="size-4" />
                <span>Statutory Summary • Companies Act, 2013</span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed font-sans">
                A <strong>Board Resolution for availing a bank loan</strong> is a mandatory corporate resolution passed at a duly convened Board meeting under <strong>Section 179(3)(d)</strong> of the Companies Act, 2013. It formalizes acceptance of credit facilities, authorizes designated directors to sign loan and security deeds, approves hypothecation or mortgage of assets, and mandates filing <strong>e-Form CHG-1</strong> with the Registrar of Companies within 30 days.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Client Workspace */}
        <BankLoanClient />

        {/* 5 Statutory Master Reference Tables */}
        <section className="max-w-5xl mx-auto px-4 py-12 space-y-12">
          {/* Table 1: Section 179(3)(d) vs Section 180(1)(c) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold font-serif mb-2 text-navy dark:text-white flex items-center gap-2">
              <Scale className="size-5 text-blue-600" />
              <span>1. Section 179(3)(d) vs Section 180(1)(c): Borrowing Powers &amp; Private Company Exemption</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Statutory distinction between Board powers to borrow and shareholder approval thresholds under the Companies Act, 2013.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Statutory Parameter</th>
                    <th className="p-3">Section 179(3)(d) — Board Power</th>
                    <th className="p-3">Section 180(1)(c) — Shareholder Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Applicable Authority</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Board of Directors at a formal Board Meeting</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Members / Shareholders at General Meeting (EGM)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Nature of Resolution</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Board Resolution (Simple Majority)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Special Resolution (75% Majority)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Circulation Allowed?</td>
                    <td className="p-3 text-red-600 dark:text-red-400 font-medium">NO — Circular resolution barred by Section 179(3)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Postal Ballot or Physical/VC EGM</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Statutory Threshold</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Any borrowing from Banks, FIs, or Directors</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">When total borrowings exceed Paid-up Capital + Free Reserves + Securities Premium</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Private Company Status</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Mandatory for all companies</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      EXEMPT by MCA Notification G.S.R. 464(E) dt. 05/06/2015
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">ROC Filing Requirement</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">None for private cos (CHG-1 if secured)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">e-Form MGT-14 within 30 days (Public Cos only)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Credit Facility Types & Standard Resolution Covenants */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold font-serif mb-2 text-navy dark:text-white flex items-center gap-2">
              <Landmark className="size-5 text-emerald-600" />
              <span>2. Commercial Credit Facility Types &amp; Standard Resolution Covenants</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Overview of core banking facilities and necessary operational covenants required in the Board Resolution.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Facility Type</th>
                    <th className="p-3">Primary Purpose</th>
                    <th className="p-3">Repayment Structure</th>
                    <th className="p-3">Mandatory Resolution Clauses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Term Loan</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Capex, plant &amp; machinery, building purchase</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Fixed EMIs (36 to 84 months) with moratorium</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Moratorium period, EMI schedule, hypothecation of plant</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Cash Credit (CC)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Working capital (raw material, stock, debtors)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Revolving limit; monthly interest servicing</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Drawing power (DP), monthly stock statements, book debt audit</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Overdraft (OD)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Short-term liquidity / contingency cash flow</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Interest on utilized balance; payable on demand</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Lien on FDs, mutual funds, or personal property</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Letter of Credit (LC)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Domestic &amp; import procurement of materials</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Sight or usance (90-180 days) upon document acceptance</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Margin money, issuing bank authorization, counter-indemnity</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Bank Guarantee (BG)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Performance, bid bonds, advance payment security</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Invoked only on contractual default; annual commission</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Unconditional counter-guarantee and indemnity by company</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 3: Creation of Security: Hypothecation vs Mortgage & Form CHG-1 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold font-serif mb-2 text-navy dark:text-white flex items-center gap-2">
              <ShieldCheck className="size-5 text-purple-600" />
              <span>3. Creation of Security: Hypothecation vs Mortgage &amp; Form CHG-1 Timelines</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Statutory procedure for registering charges under Section 77 and Section 87 of the Companies Act, 2013.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Timeline from Deed Execution</th>
                    <th className="p-3">Statutory Window</th>
                    <th className="p-3">MCA V3 Filing Fee Bracket</th>
                    <th className="p-3">Governing Provision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Within 30 Calendar Days</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">Standard Statutory Window</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Normal filing fee (₹200 to ₹600 based on share capital)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Section 77(1)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Day 31 to Day 60</td>
                    <td className="p-3 text-amber-600 dark:text-amber-400 font-semibold">First Delayed Window</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Normal fee + Additional ad-valorem fee (3x to 6x)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Section 77(1) First Proviso</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Day 61 to Day 120</td>
                    <td className="p-3 text-orange-600 dark:text-orange-400 font-semibold">Second Delayed Window</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Normal fee + Higher ad-valorem fee (up to 0.05% of loan)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Section 77(1) Second Proviso</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Beyond 120 Days</td>
                    <td className="p-3 text-red-600 dark:text-red-400 font-bold">ROC Gateway Closed</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Requires Petition to Regional Director (RD) in Form CHG-8</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Section 87 (Condonation of Delay)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 4: State-Wise Stamp Duty Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold font-serif mb-2 text-navy dark:text-white flex items-center gap-2">
              <FileText className="size-5 text-blue-600" />
              <span>4. State-Wise Stamp Duty Schedule on Loan Agreements &amp; Hypothecation Deeds</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              State stamp acts determine the enforceability of loan agreements under the Indian Stamp Act, 1899.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">State / Jurisdiction</th>
                    <th className="p-3">Governing Stamp Act Article</th>
                    <th className="p-3">Rate on Loan Agreement</th>
                    <th className="p-3">Rate on Hypothecation / Mortgage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Maharashtra</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Maharashtra Stamp Act (Art. 6 &amp; 33)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.1% to 0.2% (Capped at ₹10 Lakhs)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.2% to 0.5% (Max ₹10 Lakhs)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">NCT of Delhi</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Schedule 1A (Art. 6 &amp; 35)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">₹100 / ₹200 (Fixed stamp)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.5% of loan secured</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Karnataka</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Karnataka Stamp Act (Art. 6 &amp; 34)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.1% to 0.2% of loan value</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.5% (Max ₹10 Lakhs)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Tamil Nadu</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Tamil Nadu Stamp Act (Art. 6 &amp; 40)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.5% (Capped at ₹40,000 for title deposit)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">1% for simple mortgage</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Uttar Pradesh</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">UP Stamp Act (Art. 6 &amp; 40)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">₹100 to ₹500 (Agreement)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.5% for deposit of title deeds</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Gujarat</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Gujarat Stamp Act (Art. 6)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.25% of loan amount</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.25% (Capped at ₹4.2 Lakhs)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">West Bengal</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">Bengal Stamp Act (Art. 6)</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">₹100 to 0.2%</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">0.5% of loan amount</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 5: Mandatory Banking Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold font-serif mb-2 text-navy dark:text-white flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <span>5. Mandatory Banking Checklist for Credit Facility Disbursement</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Standard compliance deliverables required by nationalised and private banks prior to fund drawdown.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="font-bold text-blue-600 uppercase tracking-wide block">
                  A. Secretarial &amp; Corporate Deliverables
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                  <li>Certified True Copy of Board Resolution under Section 179(3)(d)</li>
                  <li>Section 180(1)(c) Special Resolution &amp; Form MGT-14 challan (Public Cos)</li>
                  <li>Attested copies of Memorandum and Articles of Association (MOA/AOA)</li>
                  <li>List of Directors with DIN and specimen signatures certified by CS</li>
                  <li>Audited Balance Sheets and P&amp;L Statements for previous 3 financial years</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="font-bold text-emerald-600 uppercase tracking-wide block">
                  B. Execution &amp; Charge Deliverables
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 dark:text-slate-300">
                  <li>Original stamped Loan Agreement and Hypothecation / Mortgage Deed</li>
                  <li>Personal Guarantee deeds of promoter directors on non-judicial stamp</li>
                  <li>e-Form CHG-1 MCA portal filing challan with SRN acknowledgment</li>
                  <li>Certificate of Registration of Charge (Form CHG-2) issued by ROC</li>
                  <li>Comprehensive insurance policies on secured assets with Bank clause</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 16 Exhaustive FAQs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold font-serif mb-2 text-navy dark:text-white flex items-center gap-2">
              <HelpCircle className="size-6 text-blue-600" />
              <span>Frequently Asked Questions: Board Resolution for Bank Loans (2026)</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Statutory guidance covering borrowing limits, circular resolutions, stamp duties, and ROC charge creation under the Companies Act, 2013.
            </p>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-xs mt-0.5">
                      Q{idx + 1}.
                    </span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
