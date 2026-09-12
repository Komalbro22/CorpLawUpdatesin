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
} from 'lucide-react'
import EquitableMortgageClient from './EquitableMortgageClient'

export const revalidate = 86400

const FAQS = [
  {
    q: 'What is MODT? What is the full form and meaning of MODT?',
    a: 'MODT stands for Memorandum of Deposit of Title Deeds. It is a formal legal document executed by a property owner (mortgagor) in favour of a lender (mortgagee/bank) confirming and evidencing the physical delivery of original property title deeds with the express intent to create an Equitable Mortgage under Section 58(f) of the Transfer of Property Act, 1882.',
  },
  {
    q: 'What is the legal difference between an Equitable Mortgage and an MODT?',
    a: 'An Equitable Mortgage (Mortgage by Deposit of Title Deeds) is a legal transaction created purely by the physical delivery of original title deeds in a notified town with the intent to secure a debt. The mortgage comes into legal existence at the exact moment of physical deposit. The MODT (Memorandum of Deposit of Title Deeds) is the contemporaneous or subsequent written instrument that records and proves the transaction, details the underlying loan amount, and specifies the exact schedule of deposited documents.',
  },
  {
    q: 'Why do commercial banks and home loan lenders prefer MODT over a Registered Mortgage?',
    a: 'Commercial banks prefer MODT because of immense cost and administrative savings for the borrower. Stamp duty on MODT is typically 0.1% to 0.5% (capped at ₹10,000 to ₹10 Lakhs in most states), whereas a Registered Simple Mortgage or English Mortgage attracts 2% to 5% ad-valorem stamp duty without any ceiling. Additionally, banks can enforce an equitable mortgage under the SARFAESI Act, 2002 without court intervention.',
  },
  {
    q: 'Is registration of MODT compulsory at the Sub-Registrar’s Office in India?',
    a: 'Under Section 59 of the Transfer of Property Act, 1882, an equitable mortgage does not require compulsory registration if the document merely records a past deposit. However, several states have amended their local registration laws: Karnataka, Tamil Nadu, and Telangana have made MODT registration compulsory under Section 17 of the Registration Act. In Maharashtra, if the MODT is not registered, filing a "Notice of Intimation" under Section 89B within 30 days is mandatory.',
  },
  {
    q: 'What is the Notice of Intimation under Section 89B of the Registration Act in Maharashtra?',
    a: 'Under Section 89B of the Registration Act, 1908 (Maharashtra Amendment), whenever an equitable mortgage is created by deposit of title deeds without registered deed, the mortgagor and lender must file an e-Notice of Intimation with the Sub-Registrar within 30 days of the deposit. Failure to file this Notice within 30 days is a punishable offence with imprisonment and monetary fines under Section 89C.',
  },
  {
    q: 'What is the stamp duty on MODT in Maharashtra, Karnataka, and Tamil Nadu?',
    a: 'In Maharashtra, under Article 6(1) of the Maharashtra Stamp Act, stamp duty is 0.2% of the loan amount, subject to a statutory cap of ₹10,00,000. In Karnataka, under Article 6 of the Karnataka Stamp Act, duty ranges from 0.1% to 0.2% capped at ₹10,00,000. In Tamil Nadu, stamp duty is 0.5% capped at ₹40,000 plus 1% registration fee capped at ₹40,000.',
  },
  {
    q: 'Can an Equitable Mortgage be created in any city or only in Notified Towns?',
    a: 'Under Section 58(f) of the Transfer of Property Act, 1882, the physical delivery/deposit of title deeds MUST occur in a notified town (such as Mumbai, Kolkata, Chennai, Delhi, Bengaluru, Hyderabad, Ahmedabad, etc.). However, as established by the Supreme Court in K.J. Nathan v. S.V. Maruthi Rao, the mortgaged immovable property itself can be situated anywhere in India.',
  },
  {
    q: 'What happens if the borrower is a Company or LLP? Is MCA Form CHG-1 mandatory?',
    a: 'Yes. Under Section 77(1) of the Companies Act, 2013, an equitable mortgage constitutes the creation of a statutory charge on the company’s immovable property. The company must file particulars of the mortgage in e-Form CHG-1 with the Registrar of Companies (ROC) within 30 days of execution. Failure to register renders the mortgage void against the liquidator and subsequent creditors.',
  },
  {
    q: 'Who signs the MODT? Does the bank manager also sign?',
    a: 'The MODT is primarily an unilateral or bilateral memorandum executed and signed by the Mortgagor (property owner) and verified by two attesting witnesses. In commercial banking practice, the bank branch manager or authorized credit officer signs a separate Safe Custody Acknowledgment or joins as a confirming party acknowledging receipt of original deeds.',
  },
  {
    q: 'What documents must be listed in the First Schedule of the MODT?',
    a: 'The First Schedule must contain the complete chain of original title documents for at least 30 years, including: the Original Registered Sale/Conveyance Deed, Mother/Parent Deeds, Khata/Patta/Mutation Sanction, Nil Encumbrance Certificate (Form 15), Sanctioned Building Plan, and Property Tax receipts.',
  },
  {
    q: 'Can agricultural land be mortgaged by deposit of title deeds?',
    a: 'Yes, agricultural land can be mortgaged by deposit of title deeds under Section 58(f) of the TPA, provided the deposit occurs in a notified town. However, state land reform laws (e.g. Karnataka Land Reforms Act, Maharashtra Tenancy Act) may restrict mortgaging agricultural land to non-agriculturists, though commercial banks and agricultural credit societies are generally exempt.',
  },
  {
    q: 'What is CERSAI registration and why is it mandatory for MODT?',
    a: 'CERSAI (Central Registry of Securitisation Asset Reconstruction and Security Interest of India) is a statutory registry established under Chapter IV-A of the SARFAESI Act, 2002. Banks must register every equitable mortgage on CERSAI within 30 days to prevent fraudulent multiple mortgaging of the same property to different lenders.',
  },
  {
    q: 'Can an equitable mortgage be created by depositing photocopies or certified copies of title deeds?',
    a: 'No. The Supreme Court in Syndicate Bank v. Estate Officer held that delivery of original title deeds is an indispensable prerequisite for creating an equitable mortgage. Depositing photocopies or certified copies does not create a valid equitable mortgage, unless the original deeds were conclusively proven to be lost/destroyed and secondary evidence was accepted with public notice.',
  },
  {
    q: 'Can an equitable mortgage be created through a Power of Attorney (POA) holder?',
    a: 'Yes, provided the Power of Attorney is registered and explicitly contains a specific clause authorizing the attorney to borrow money, deposit original title deeds, and create mortgage/security over the principal’s property in favour of banks or financial institutions.',
  },
  {
    q: 'How is an MODT released or discharged after full loan repayment?',
    a: 'Upon full repayment of the loan, the bank issues a No Dues Certificate (NDC), hands back the original title deeds against a physical acknowledgment, satisfies the charge on CERSAI, issues a Deed of Reconveyance/Release (if registered), and signs MCA Form CHG-4 for satisfaction of charge with the ROC.',
  },
  {
    q: 'What should a borrower do if the bank loses the original title deeds deposited under MODT?',
    a: 'Under Reserve Bank of India (RBI) circulars dated September 13, 2023, banks must return original title deeds within 30 days of loan payoff. If lost, the bank must bear the cost of obtaining certified duplicate copies, publish public notices in newspapers, issue an official certificate of loss, and compensate the borrower at ₹5,000 per day of delay beyond 30 days.',
  },
]

export default function EquitableMortgagePage() {
  const jsonLdWebPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'MODT (Memorandum of Deposit of Title Deeds) Format & Generator',
    url: 'https://www.corplawupdates.in/documents/equitable-mortgage-deed',
    description:
      'Complete guide, statutory format, state stamp duty rates, and automated generator for MODT (Memorandum of Deposit of Title Deeds / Equitable Mortgage) under Section 58(f) of Transfer of Property Act, 1882.',
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
          name: 'MODT & Equitable Mortgage',
          item: 'https://www.corplawupdates.in/documents/equitable-mortgage-deed',
        },
      ],
    },
  }

  const jsonLdSoftware = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MODT & Equitable Mortgage Document Generator',
    operatingSystem: 'Any (Web Browser)',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'INR',
    },
    description:
      'Online statutory generator for Memorandum of Deposit of Title Deeds (MODT), Mortgagor Affidavit, Bank Covering Letter, and MCA Form CHG-1 Board Resolution in Word and PDF.',
  }

  const jsonLdHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create and Execute an Equitable Mortgage / MODT in India',
    description:
      'Step-by-step statutory procedure for creating a valid mortgage by deposit of title deeds under Section 58(f) of Transfer of Property Act, 1882.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Obtain Sanction Letter & Legal Search Report',
        text: 'Lender issues credit facility sanction letter stipulating equitable mortgage. Advocate conducts 30-year title search and issues Non-Encumbrance Certificate.',
      },
      {
        '@type': 'HowToStep',
        name: 'Physical Delivery of Original Title Deeds in Notified Town',
        text: 'The mortgagor visits the lender’s branch in a town notified under Section 58(f) of TPA and physically hands over original title deeds with intent to secure the loan.',
      },
      {
        '@type': 'HowToStep',
        name: 'Execution of Memorandum of Deposit of Title Deeds (MODT)',
        text: 'The parties execute the MODT recording the past deposit, specifying loan particulars, and detailing First Schedule title deeds and Second Schedule property boundaries.',
      },
      {
        '@type': 'HowToStep',
        name: 'Pay State Stamp Duty & Complete Registration / Notice of Intimation',
        text: 'Pay ad-valorem stamp duty under Article 6 of the relevant State Stamp Act. In Maharashtra, file Notice of Intimation under Sec 89B within 30 days. In Karnataka/TN, register at Sub-Registrar.',
      },
      {
        '@type': 'HowToStep',
        name: 'File CERSAI and MCA Form CHG-1 (For Companies)',
        text: 'Lender registers the security interest on CERSAI within 30 days. If borrower is a company, file e-Form CHG-1 on the MCA V3 portal under Section 77 of Companies Act, 2013.',
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
              MODT & Equitable Mortgage
            </span>
          </nav>

          {/* Hero Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Section 58(f) Transfer of Property Act, 1882
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Article 6 State Stamp Act
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Companies Act Sec 77 (CHG-1)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                SARFAESI Act Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              MODT (Memorandum of Deposit of Title Deeds) Format, Draft & Workstation
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
              Generate an official, bank-vetted Memorandum of Deposit of Title Deeds (MODT) evidencing creation of an Equitable Mortgage in India. Includes First Schedule Title Deeds checklist, Second Schedule property boundaries, Mortgagor Affidavit, Bank Covering Letter, and Form CHG-1 corporate borrowing resolution.
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
                  What is MODT? (Quick Answer & Statutory Definition)
                </h3>
                <p>
                  <strong>MODT</strong> stands for <strong>Memorandum of Deposit of Title Deeds</strong> — a formal legal instrument that records the physical delivery of original property title documents by a borrower to a bank or lending institution to create an <strong>Equitable Mortgage</strong> under <strong>Section 58(f) of the Transfer of Property Act, 1882</strong>.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  While the mortgage itself is legally constituted at the instant original title deeds are physically deposited in a notified town with the intent to secure credit, commercial banks require the MODT as contemporaneous written evidence. It attracts nominal stamp duty (0.1%–0.5% capped under State Stamp Article 6) compared to 2%–5% for registered mortgages.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Document Generator Workstation */}
          <EquitableMortgageClient />

          {/* STATUTORY SECTION 1: MASTER COMPARISON TABLE */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Scale className="w-4 h-4" />
                Legal Jurisprudence & Commercial Analysis
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                MODT vs Equitable Mortgage vs Registered Mortgage: Master Comparison
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Borrowers and commercial lenders frequently confuse Equitable Mortgage, MODT, and Registered Mortgage. The table below outlines their statutory origins, stamp duty impact, and enforcement mechanisms.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white dark:bg-slate-900">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 font-bold">Feature</th>
                    <th className="p-3 font-bold text-indigo-700 dark:text-indigo-300">Equitable Mortgage</th>
                    <th className="p-3 font-bold text-blue-700 dark:text-blue-300">MODT (Memorandum)</th>
                    <th className="p-3 font-bold text-slate-700 dark:text-slate-300">Registered Simple Mortgage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Statutory Governing Law</td>
                    <td className="p-3">Section 58(f), Transfer of Property Act, 1882</td>
                    <td className="p-3">Sec 58(f) TPA read with State Stamp Act (Article 6)</td>
                    <td className="p-3">Section 58(b), Transfer of Property Act, 1882</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Mode of Creation</td>
                    <td className="p-3">Physical delivery of original title deeds in notified town</td>
                    <td className="p-3">Written memorandum recording the physical deposit</td>
                    <td className="p-3">Bilateral mortgage deed transferring interest</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Typical Stamp Duty Rate</td>
                    <td className="p-3">Nil (if no written instrument executed)</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      0.1% to 0.5% (Capped at ₹10k–₹10 Lakhs)
                    </td>
                    <td className="p-3 text-rose-600 dark:text-rose-400 font-semibold">
                      2.0% to 5.0% (Uncapped ad-valorem in most states)
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Compulsory Registration</td>
                    <td className="p-3">Not required under Section 59 TPA</td>
                    <td className="p-3">
                      Mandatory in Karnataka, TN, Telangana; Notice of Intimation in Maharashtra
                    </td>
                    <td className="p-3">Compulsory under Section 17 of Registration Act, 1908</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Custody of Title Deeds</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">Physical custody with Lender</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">Physical custody with Lender</td>
                    <td className="p-3">Can remain with Mortgagor (unless covenant mandates)</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Enforcement upon Default</td>
                    <td className="p-3">SARFAESI Act, 2002 (Non-court) & Sec 67 TPA</td>
                    <td className="p-3">SARFAESI Act, 2002 (Non-court) & Sec 67 TPA</td>
                    <td className="p-3">Civil Court Mortgage Suit (Order 34 CPC) or SARFAESI</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Estimated Cost on ₹1 Cr Loan</td>
                    <td className="p-3 text-emerald-600 font-bold">~₹0 (oral deposit)</td>
                    <td className="p-3 text-emerald-600 font-bold">~₹20,000 to ₹50,000 (MODT duty)</td>
                    <td className="p-3 text-rose-600 font-bold">~₹2,00,000 to ₹5,00,000 (Uncapped)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* STATUTORY SECTION 2: STATE-WISE STAMP DUTY SCHEDULE */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Landmark className="w-4 h-4" />
                State Revenue & Registration Law
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                State-Wise Stamp Duty on MODT & Notice of Intimation Requirements (10 States)
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Under Entry 63, List II of the Indian Constitution, Stamp Duty is a state subject. Every state prescribes specific rates for instruments relating to deposit of title deeds under Article 6 of their respective Stamp Acts.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white dark:bg-slate-900">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 font-bold">State Jurisdiction</th>
                    <th className="p-3 font-bold">Applicable Article</th>
                    <th className="p-3 font-bold">Stamp Duty Rate</th>
                    <th className="p-3 font-bold">Maximum Cap</th>
                    <th className="p-3 font-bold">Filing / Registration Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Maharashtra</td>
                    <td className="p-3 font-mono text-xs">Article 6(1), Maharashtra Stamp Act</td>
                    <td className="p-3">0.2% of loan amount</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">₹10,00,000</td>
                    <td className="p-3 text-rose-600 dark:text-rose-400 font-medium">
                      Notice of Intimation under Sec 89B MANDATORY within 30 days
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Karnataka</td>
                    <td className="p-3 font-mono text-xs">Article 6, Karnataka Stamp Act</td>
                    <td className="p-3">0.1% to 0.2% of loan</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">₹10,00,000</td>
                    <td className="p-3 text-amber-600 dark:text-amber-400 font-medium">
                      Compulsory Registration under Karnataka Regn (Amendment) Act
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Tamil Nadu</td>
                    <td className="p-3 font-mono text-xs">Article 6, Tamil Nadu Stamp Act</td>
                    <td className="p-3">0.5% of loan amount</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">₹40,000 Cap</td>
                    <td className="p-3 text-amber-600 dark:text-amber-400 font-medium">
                      Mandatory registration under Section 17 within 4 months (+ 1% regn fee)
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Delhi (NCT)</td>
                    <td className="p-3 font-mono text-xs">Article 6, Indian Stamp Act (Delhi)</td>
                    <td className="p-3">0.5% of loan amount</td>
                    <td className="p-3">Subject to local schedule</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      Registration optional if memorandum merely records past deposit
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Gujarat</td>
                    <td className="p-3 font-mono text-xs">Article 6, Gujarat Stamp Act</td>
                    <td className="p-3">0.25% of loan amount</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">₹4,50,000</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      Franking or e-stamping mandatory before document deposit
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Telangana & AP</td>
                    <td className="p-3 font-mono text-xs">Article 6, Stamp Act (TS/AP)</td>
                    <td className="p-3">0.5% duty + 0.1% regn</td>
                    <td className="p-3">No uniform ceiling</td>
                    <td className="p-3 text-amber-600 dark:text-amber-400 font-medium">
                      Registered MODTD standardly mandated by commercial banks
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Uttar Pradesh</td>
                    <td className="p-3 font-mono text-xs">Article 6, UP Stamp Act</td>
                    <td className="p-3">0.5% of loan amount</td>
                    <td className="p-3">State schedule slabs</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      Deposit must be made in notified municipal corporations
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">West Bengal</td>
                    <td className="p-3 font-mono text-xs">Article 6, Bengal Stamp Act</td>
                    <td className="p-3">0.25% to 0.5%</td>
                    <td className="p-3">Slab based</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      Kolkata is a statutory presidential notified town under TPA
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Haryana</td>
                    <td className="p-3 font-mono text-xs">Article 6, Haryana Stamp Rules</td>
                    <td className="p-3">0.1% to 0.5%</td>
                    <td className="p-3">Capped under rules</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      Follows Supreme Court Narvir Singh jurisprudence on oral deposit
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Rajasthan</td>
                    <td className="p-3 font-mono text-xs">Article 6, Rajasthan Stamp Act</td>
                    <td className="p-3">0.5% of loan amount</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">₹10,00,000</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      Capped ad-valorem duty with standard banking safe custody
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* STATUTORY SECTION 3: CORPORATE BORROWER MANDATE & CHG-1 */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Building2 className="w-4 h-4" />
                Companies Act, 2013 Statutory Mandate
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Corporate Borrowers: Section 77 & Mandatory ROC e-Form CHG-1 Filing
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                When an Indian Company (Private, Public, or OPC) executes an MODT, it creates a charge on its immovable assets under the Companies Act, 2013. The transaction triggers mandatory secretarial steps that must be fulfilled alongside bank documentation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  Step 1: Board Resolution
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pass a resolution at a duly convened Board Meeting under <strong>Section 179(3)(d)</strong> (to borrow) and <strong>Section 179(3)(e)</strong> (to create security / mortgage). Circular resolution is strictly barred for borrowing.
                </p>
                <div className="pt-2">
                  <Link
                    href="/documents/board-resolution-bank-loan"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                  >
                    Draft Bank Loan Resolution &rarr;
                  </Link>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  Step 2: 30-Day CHG-1 Window
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Under <strong>Section 77(1)</strong>, the company must file <strong>e-Form CHG-1</strong> on the MCA portal within 30 days of executing the MODT. Attach certified copy of sanction letter, MODT, and title schedule.
                </p>
                <span className="inline-block text-[11px] text-amber-700 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded">
                  Max delay: 60 days (+ ad valorem)
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Consequence of Non-Filing
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Under <strong>Section 77(3)</strong>, an un-registered mortgage is <strong>VOID against the Official Liquidator and creditors</strong>. In insolvency under IBC 2016, the bank loses secured creditor status!
                </p>
                <span className="inline-block text-[11px] text-rose-700 dark:text-rose-300 font-medium bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                  Requires RD Condonation (CHG-8)
                </span>
              </div>
            </div>
          </section>

          {/* STATUTORY SECTION 4: SUPREME COURT JURISPRUDENCE */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <BookOpen className="w-4 h-4" />
                Landmark Supreme Court Precedents
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Essential Elements of a Valid Equitable Mortgage: Supreme Court Rulings
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Indian courts have rigorously interpreted Section 58(f) across four landmark Supreme Court decisions that define how MODT documents must be drafted to withstand judicial scrutiny.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. The Notified Town Rule: K.J. Nathan v. S.V. Maruthi Rao (AIR 1965 SC 430)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  The Supreme Court established three sine qua non conditions for a valid equitable mortgage: (i) a debt, (ii) a deposit of title deeds, and (iii) an intention that the deeds shall be security for the debt. Crucially, the Court ruled that <strong>while the physical delivery of documents must take place in a notified town, the mortgaged immovable property can be situated anywhere in India</strong>.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Recording Past Deposit vs Creating Mortgage: Rachpal Mahraj v. Bhagwandas (AIR 1950 SC 272)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  The Supreme Court drew a sharp distinction between a memorandum that merely records an already completed deposit of title deeds and a document that itself reduces the contract of mortgage into writing. If the memorandum merely serves as a record or memorandum of a past deposit, it does not require registration. If it embodies the mortgage bargain itself, it requires compulsory registration.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  3. Stamp Duty on Deposit of Title Deeds: State of Haryana v. Narvir Singh ((2014) 1 SCC 105)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  The Supreme Court reaffirmed that an equitable mortgage is completed solely by the physical act of depositing title deeds with intent to create security. No writing is necessary to validate the mortgage. However, where a written memorandum is executed and falls within the definition of an &quot;instrument&quot; under the relevant State Stamp Act, ad-valorem duty under Article 6 becomes payable.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  4. Indispensability of Original Documents: Syndicate Bank v. Estate Officer (AIR 2007 SC 3166)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  The Supreme Court held that delivery of <strong>original documents of title</strong> is an indispensable requirement for creating a mortgage by deposit of title deeds. Depositing secondary copies, photocopies, or certified extracts does not create an equitable mortgage, as allowing copies would open the door for unscrupulous borrowers to pledge the same asset with multiple lenders.
                </p>
              </div>
            </div>
          </section>

          {/* STATUTORY SECTION 5: FIRST SCHEDULE CHECKLIST */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <FileCheck2 className="w-4 h-4" />
                Legal Title & Chain of Custody
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                First Schedule Checklist: 7 Mandatory Original Documents for MODT
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                A legally defective First Schedule can render an equitable mortgage vulnerable in SARFAESI proceedings or DRT challenges. Ensure the following original instruments are listed in sequential chronological order:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-sm">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-sm">
                  1. Primary Registered Conveyance Deed
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Original registered Sale Deed, Gift Deed, Partition Deed, or Allotment / Perpetual Lease Deed establishing the Mortgagor&apos;s direct title.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-sm">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-sm">
                  2. 30-Year Mother / Link Deeds
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Prior conveyance deeds tracing unbroken chain of ownership from the original developer/landowner down to the current mortgagor.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-sm">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-sm">
                  3. Revenue Records & Mutation Sanctions
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Khata Certificate & Extract (Katha A/B in Karnataka), Jamabandi / Fard in North India, or 7/12 Extract in Maharashtra confirming mutation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-sm">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-sm">
                  4. 30-Year Nil Encumbrance Certificate
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Form 15 issued by the Sub-Registrar certifying that no registered charges, mortgages, or court attachments exist on the property.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-sm">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-sm">
                  5. Sanctioned Building & Floor Plans
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Duly approved architectural drawing and sanction order from the municipal corporation (MCD, BBMP, BMC, DDA, CMDA, etc.).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-sm">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-sm">
                  6. Property Tax Paid Receipts & NOC
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  Up-to-date assessment receipts confirming zero municipal arrears, plus No Objection Certificate from Cooperative Housing Society.
                </p>
              </div>
            </div>
          </section>

          {/* STATUTORY SECTION 6: RELEASE & DISCHARGE PROCEDURE */}
          <section className="space-y-6 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                <CheckCircle2 className="w-4 h-4" />
                Post-Loan Satisfaction & Discharge
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                How to Discharge an MODT & Retrieve Title Deeds after Loan Payoff
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                Closing a loan does not automatically clear the land registry records or MCA charge database. Borrowers must follow the 5-step statutory satisfaction procedure:
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold shrink-0 text-xs">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    No Dues Certificate (NDC) & Physical Handover of Original Deeds
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    The bank issues a formal NDC confirming zero outstanding balance. Under <strong>RBI Circular dated Sept 13, 2023</strong>, the bank must return all original title deeds within 30 days of full loan repayment. A penalty of ₹5,000/day applies thereafter.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold shrink-0 text-xs">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Deed of Reconveyance / Release Deed (If MODT was Registered)
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    If the MODT was registered at the Sub-Registrar (mandatory in Karnataka, TN, Telangana), the bank must execute and register a Deed of Reconveyance or Release Deed to remove the entry from the Encumbrance Certificate.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold shrink-0 text-xs">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    CERSAI Satisfaction Filing
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    The lender must update the Central Electronic Registry (CERSAI) reporting satisfaction of security interest within 30 days so that future title search reports show the property as free from all encumbrances.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold shrink-0 text-xs">
                  4
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Corporate Borrowers: MCA e-Form CHG-4 (Section 82)
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    For companies, file <strong>e-Form CHG-4</strong> with the Registrar of Companies within 30 days of full payment under Section 82 of Companies Act, 2013. The ROC issues a Certificate of Registration of Satisfaction of Charge (Form CHG-5).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQS SECTION WITH EXPANDABLE ANSWERS */}
          <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <HelpCircle className="w-4 h-4" />
                Frequently Asked Questions
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions on MODT & Equitable Mortgage (16 Answers)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {faq.q}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Tools Callout Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold">Availing a Commercial Bank Loan or Overdraft?</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Draft your Board Resolution under Section 179(3)(d), calculate Section 180(1)(c) statutory borrowing limits, and generate official Bank Covering Letters in minutes.
              </p>
            </div>
            <Link
              href="/documents/board-resolution-bank-loan"
              className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition inline-flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Board Resolution Tool
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
