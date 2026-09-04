import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Scale,
  Building2,
  FileCheck2,
  Download,
  Calendar,
  Layers,
  MapPin,
  Landmark,
  FileText,
  Compass,
  ArrowRight,
  BookOpen,
  Newspaper,
  Camera,
} from 'lucide-react'
import RegisteredOfficeClient from './RegisteredOfficeClient'

const pageUrl =
  'https://www.corplawupdates.in/documents/board-resolution-registered-office-change'
const mcaPortalUrl = 'https://www.mca.gov.in'

const faqs = [
  {
    question:
      'What is the format of board resolution for change of registered office within the same city?',
    answer:
      'Under Section 12(5)(a) of the Companies Act, 2013 read with Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014, a company can change its registered office within the local limits of the same city, town, or village simply by passing a Board Resolution at a duly convened Board meeting. The resolution approves shifting from the existing address to the new address, notes the proof of address (utility bill < 2 months old) and NOC from the landlord, and authorizes a Director or Company Secretary to file e-Form INC-22 with the ROC within 30 days.',
  },
  {
    question:
      'Is a Special Resolution or shareholder approval required for changing registered office within the same city?',
    answer:
      'No. Under Section 12(5)(a) of the Companies Act, 2013, shareholder approval (whether Ordinary or Special Resolution) is NOT required if the new registered office is located within the local limits of the same city, town, or village. Only a Board Resolution is required. Shareholder approval via Special Resolution (and Form MGT-14) is only mandatory if the office is shifted outside the local limits of the existing city/town/village under Section 12(5).',
  },
  {
    question:
      'What is the procedure for shifting registered office outside local limits but within the same State & RoC?',
    answer:
      'Under Section 12(5) of the Companies Act, 2013: (1) Pass a Board Resolution approving shifting subject to members\' approval and convene an EGM; (2) Pass a Special Resolution (75% majority) at the EGM; (3) File e-Form MGT-14 with the ROC within 30 days of passing the Special Resolution; and (4) File e-Form INC-22 within 30 days of actual shifting with Landlord NOC, utility bills, and the Special Resolution.',
  },
  {
    question:
      'What is the procedure for shifting registered office from one RoC to another within the same State?',
    answer:
      'Applicable in States having more than one RoC jurisdiction (e.g. Maharashtra: Mumbai vs Pune; Tamil Nadu: Chennai vs Coimbatore). Under Section 12(5) second proviso read with Rule 28: (1) Pass Board Resolution; (2) Pass Special Resolution at EGM and file Form MGT-14; (3) File an Application in e-Form INC-23 to the Regional Director (RD); (4) Publish public notice in Form INC-26 in an English daily and vernacular daily newspaper at least 14 days before hearing; (5) Obtain RD confirmation order; (6) File Form INC-28 within 60 days of order; and (7) File Form INC-22 with ROC within 30 days of INC-28.',
  },
  {
    question:
      'How to shift registered office from one State to another State (Inter-State Shifting)?',
    answer:
      'Inter-state shifting falls under Section 12(5) and Section 13(4) of Companies Act, 2013 read with Rule 30. It requires altering Clause II (Situation Clause) of the Memorandum of Association (MOA): (1) Board Resolution approving shifting and MOA alteration; (2) Special Resolution passed at EGM and Form MGT-14 filed within 30 days; (3) Preparation of list of creditors verified by affidavit of Directors and auditor certificate; (4) Petition in e-Form INC-23 to Regional Director; (5) Publication of Notice in Form INC-26 in English and vernacular newspapers; (6) Service of notices to all creditors, RoC, and State Chief Secretary; (7) Filing Regional Director confirmation order in Form INC-28 within 30 days; and (8) Filing Form INC-22 with ROC. The RoC issues a fresh Certificate of Incorporation with a new CIN reflecting the new state code.',
  },
  {
    question:
      'Does inter-state registered office shifting change the CIN of the company?',
    answer:
      'Yes. In India, digits 7 and 8 of the 21-digit Corporate Identification Number (CIN) indicate the State of registration (e.g., DL for Delhi, MH for Maharashtra, KA for Karnataka, TN for Tamil Nadu). When a company shifts its registered office to a new State, the Registrar of Companies in the destination State issues a fresh Certificate of Incorporation with an updated CIN reflecting the new two-letter state abbreviation.',
  },
  {
    question:
      'Which MCA e-Form must be filed for registered office change and what is the deadline?',
    answer:
      'Form INC-22 (Notice of situation or change of situation of registered office) must be filed with the Registrar of Companies (ROC) within 30 days of passing the Board Resolution (for same-city) or within 30 days of registration of Form INC-28 (for RD approvals). Failure to file within 30 days attracts additional late filing fees and penalty under Section 12(8).',
  },
  {
    question:
      'Where can I download the Board Resolution for address change in Word (.docx) and PDF format?',
    answer:
      'You can download the official MCA-compliant Board Resolution format in editable Microsoft Word (.docx) and printable PDF format directly from this page using the 1-click download buttons above. You can choose from all 4 shifting scopes (Same City, Outside Local Limits, Different RoC, or Inter-State) to generate an exact certified true copy with meeting particulars.',
  },
  {
    question:
      'What documents must be attached with e-Form INC-22 for registered office change?',
    answer:
      'Mandatory attachments under Rule 25(2) and Rule 27 include: (1) Certified True Copy of Board Resolution (or Special Resolution where applicable); (2) Registered Title Deed (if company-owned) or Lease/Rent Agreement along with rent receipt; (3) Utility Bill (electricity/telephone/gas bill in owner’s or company’s name not older than 2 months); (4) No Objection Certificate (NOC) from property owner; (5) Two geo-tagged photographs: one exterior showing company name board with CIN/address in English and local language, and one interior showing at least one Director/KMP inside the office; and (6) List of other companies sharing the same address (if any).',
  },
  {
    question:
      'What are the mandatory photo requirements under Rule 25(2) for Form INC-22?',
    answer:
      'Under Rule 25(2) of the Companies (Incorporation) Rules, 2014, two photographs are strictly mandatory: (1) Exterior Photograph showing the outside of the building and the company’s name board displaying Company Name, CIN, Registered Office Address, and Email ID in both English and local vernacular language; (2) Interior Photograph of the office room with at least one Director or Key Managerial Personnel (KMP) physically present inside.',
  },
  {
    question:
      'What is the letter format for intimating banks about registered office address change?',
    answer:
      'When the registered office changes, companies must submit a formal intimation letter printed on company letterhead to their bank branch manager. The letter states the resolution date, old address, new address, current account number, and encloses: (1) Certified True Copy of Board Resolution; (2) Copy of Form INC-22 along with MCA Challan / SRN acknowledgment; (3) Address proof (Electricity Bill / Rent Agreement); and (4) Company PAN card copy. You can generate and download this letter in Word (.docx) format under the Bank Intimation Letter tab on this page.',
  },
  {
    question:
      'Within how many days must GST address be updated after changing registered office?',
    answer:
      'Under GST law, if shifting within the same State, you must file an Amendment of Core Fields in Form GST REG-14 on the GST portal within 15 days of the effective change. If shifting to a different State, you must obtain a fresh GST registration (new GSTIN with the destination state code) and cancel/surrender the existing GSTIN in the origin state once operations cease.',
  },
  {
    question:
      'What are the penalties under Section 12(8) if Form INC-22 is not filed within 30 days?',
    answer:
      'If a company fails to maintain or notify the change of registered office within 30 days under Section 12, the company and every officer who is in default are liable to a penalty of ₹1,000 for every day during which the default continues, but not exceeding ₹1,00,000. Additionally, delayed filing attracts stepped-up MCA additional fees (up to 18 times normal filing fee) under Section 403.',
  },
  {
    question:
      'What is Form INC-26 and when is newspaper publication required?',
    answer:
      'Form INC-26 is the statutory notice published in newspapers when shifting registered office from one RoC to another RoC in the same state (under Rule 28) or from one State to another State (under Rule 30). It must be published in one English daily and one principal vernacular daily newspaper in the district where the registered office is situated at least 14 days before the hearing before the Regional Director, inviting objections from creditors and the general public.',
  },
  {
    question:
      'What updates must be made on company stationery and websites after changing address?',
    answer:
      'Under Section 12(3)(c) of the Companies Act, 2013, the company must print its new registered office address along with its CIN, telephone number, email ID, and website address on all business letters, billheads, letter papers, notices, invoices, official publications, and on the home page / footer of its official website.',
  },
  {
    question:
      'Can a residential property be used as the registered office of a private company?',
    answer:
      'Yes, a private limited company can use a residential property as its registered office, provided: (1) The owner gives a signed No Objection Certificate (NOC); (2) Latest utility bill (electricity/gas/water) not older than 2 months is available; and (3) The property has a visible name board displaying company name, CIN, and address as required by Section 12(3).',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Board Resolution for Change of Registered Office: Multi-Scope Generator (2026)',
      description:
        'Download official Board Resolution format for change of registered office across all 4 scopes: same city, outside local limits, different RoC & inter-state shifting under Companies Act 2013.',
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://www.corplawupdates.in/#website' },
      about: { '@id': `${pageUrl}#resolution` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${pageUrl}#generator`,
      name: 'Registered Office Shifting Master Suite & Resolution Generator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Works in Chrome, Safari, Firefox, Edge.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      featureList: [
        'Board Resolution generation for Same City shifting under Section 12(5)(a)',
        'Board Resolution & EGM Special Resolution for Outside Local Limits shifting under Section 12(5)',
        'Board Resolution, Special Resolution & Form INC-23/INC-26 drafting for Different RoC shifting',
        'Inter-State Shifting Suite with MOA Clause II alteration and Regional Director petition',
        'Instant Word (.docx) and printable PDF downloads',
        'Pre-filled Bank Intimation Letter with 4 statutory enclosures',
        'Interactive Form INC-22 compliance checklist and Rule 25(2) photo guide',
      ],
    },
    {
      '@type': 'HowTo',
      '@id': `${pageUrl}#howto`,
      name: 'How to Change Registered Office of a Company under Companies Act, 2013',
      description:
        'Complete statutory roadmap for shifting registered office within the same city, outside local limits, between RoCs, or from one State to another.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Convene Board Meeting and Pass Board Resolution',
          text: 'Convene a meeting of the Board of Directors by giving at least 7 days notice. Pass resolution approving the shifting of registered office, noting landlord NOC, and authorizing Director or CS to file forms.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Obtain Shareholder Approval via Special Resolution (If Outside Local Limits or State)',
          text: 'If shifting outside municipal limits or to another State, convene an EGM and pass a Special Resolution by 75% majority under Section 12(5) or Section 13. File Form MGT-14 within 30 days.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Regional Director Confirmation & Newspaper Notice (For Different RoC or Inter-State)',
          text: 'Publish notice in Form INC-26 in English and vernacular newspapers. File petition in Form INC-23 with verified list of creditors and obtain confirmation order. File Form INC-28 within 30 to 60 days.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'File Form INC-22 with Registrar of Companies',
          text: 'File e-Form INC-22 on the MCA portal within 30 days along with utility bill (< 2 months old), landlord NOC, registered lease deed, and Rule 25(2) exterior and interior geo-tagged photographs.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Update Bank Records, GST Registration, and Official Name Boards',
          text: 'File Form GST REG-14 on the GST portal within 15 days, submit formal intimation letter to banking partners, and arrange name boards in English and local language outside the new premises.',
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

export default function RegisteredOfficePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
        {/* Interactive Client Component */}
        <RegisteredOfficeClient />

        {/* In-Depth Statutory Reference Guide */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
          {/* 1. Comparison of 4 Shifting Scopes */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Statutory Scope Breakdown
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                4 Levels of Registered Office Shifting Under Companies Act, 2013
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                The procedural complexity, approvals, and MCA forms vary strictly according to the geographic scope of shifting.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Shifting Scope</th>
                    <th className="p-3">Governing Law</th>
                    <th className="p-3">Approvals Required</th>
                    <th className="p-3">MCA e-Forms</th>
                    <th className="p-3">Newspaper Notice (INC-26)</th>
                    <th className="p-3">CIN Change?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      1. Within Same City / Town / Village
                    </td>
                    <td className="p-3 font-mono">Sec 12(5)(a), Rule 25 & 27</td>
                    <td className="p-3 font-medium text-emerald-600 dark:text-emerald-400">
                      Board Resolution only
                    </td>
                    <td className="p-3 font-mono">INC-22 (within 30 days)</td>
                    <td className="p-3 text-slate-400">Not Required</td>
                    <td className="p-3 text-slate-400">No Change</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      2. Outside Local Limits (Same RoC & State)
                    </td>
                    <td className="p-3 font-mono">Sec 12(5), Rule 25 & 27</td>
                    <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">
                      Board Res. + Special Res. (EGM)
                    </td>
                    <td className="p-3 font-mono">MGT-14 + INC-22</td>
                    <td className="p-3 text-slate-400">Not Required</td>
                    <td className="p-3 text-slate-400">No Change</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      3. Different RoC (Same State)
                    </td>
                    <td className="p-3 font-mono">Sec 12(5) 2nd Proviso, Rule 28</td>
                    <td className="p-3 font-medium text-amber-600 dark:text-amber-400">
                      Board + Special Res. + Regional Director (RD)
                    </td>
                    <td className="p-3 font-mono">MGT-14 + INC-23 + INC-28 + INC-22</td>
                    <td className="p-3 font-semibold text-teal-600 dark:text-teal-400">
                      Mandatory (14 days before hearing)
                    </td>
                    <td className="p-3 text-slate-400">No Change</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      4. From One State to Another State (Inter-State)
                    </td>
                    <td className="p-3 font-mono">Sec 12, Sec 13(4), Rule 30</td>
                    <td className="p-3 font-medium text-rose-600 dark:text-rose-400">
                      Board + Special Res. (MOA Clause II) + Central Govt / RD Order
                    </td>
                    <td className="p-3 font-mono">MGT-14 + INC-23 + INC-28 + INC-22</td>
                    <td className="p-3 font-semibold text-teal-600 dark:text-teal-400">
                      Mandatory (English & Vernacular Daily)
                    </td>
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                      Yes (New CIN & Fresh COI)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Key Statutory Rules Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <ClockIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Strict 30-Day INC-22 Mandate
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Under Section 12(5), Form INC-22 must be submitted to the Registrar within 30 days. Failure attracts daily penalties under Section 12(8) of ₹1,000 per day (up to ₹1,00,000) and heavy additional late fees.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Rule 25(2) Geo-Tagged Photos
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Form INC-22 strictly requires 2 photographs: (1) Building exterior showing company name board with CIN, address, and email in English and local language; (2) Interior view showing at least one Director or KMP.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                15-Day GST REG-14 Amendment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Within 15 days of registered office shifting, companies must file an Amendment of Core Fields in Form GST REG-14 on the GST portal using approved Form INC-22 and latest utility bills.
              </p>
            </div>
          </div>

          {/* 3. Comprehensive Legal FAQs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Legal FAQ Knowledge Base
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Frequently Asked Questions on Registered Office Shifting
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Statutory answers verified under Companies Act, 2013 and ICSI Secretarial Standards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2"
                >
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    {faq.question}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
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

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}
