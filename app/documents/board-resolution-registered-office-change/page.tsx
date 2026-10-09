import {
  HelpCircle,
  Camera,
  Landmark,
  Building2,
  MapPin,
  Compass,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  Sparkles,
  ShieldCheck,
  Newspaper,
  Layers,
  Globe,
  Users,
  ExternalLink
} from 'lucide-react'
import RegisteredOfficeClient from './RegisteredOfficeClient'
import JsonLd from '@/components/JsonLd'

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
      'Which section of the Companies Act, 2013 is applicable to shifting of registered office?',
    answer:
      'Shifting of registered office is governed primarily by Section 12 and Section 13 of the Companies Act, 2013. Section 12(5)(a) applies to shifting within the local limits of the same city (requiring only a Board Resolution). Section 12(5) applies to shifting outside local limits within the same State & RoC (requiring a Special Resolution). Section 12(5) second proviso and Rule 28 apply to shifting between different RoCs in the same State (requiring Regional Director approval). Section 13(4) and Rule 30 apply to inter-state shifting (requiring alteration of MOA Situation Clause II and Regional Director confirmation).',
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
      'What is the complete process for shifting registered office from one State to another State (Inter-State)?',
    answer:
      'Inter-state shifting falls under Section 12(5) and Section 13(4) of Companies Act, 2013 read with Rule 30. It requires altering Clause II (Situation Clause) of the Memorandum of Association (MOA): (1) Board Resolution approving shifting and MOA alteration; (2) Special Resolution passed at EGM and Form MGT-14 filed within 30 days; (3) Preparation of list of creditors verified by affidavit of Directors and auditor certificate; (4) Petition in e-Form INC-23 to Regional Director; (5) Publication of Notice in Form INC-26 in English and vernacular newspapers; (6) Service of notices to all creditors, RoC, and State Chief Secretary; (7) Filing Regional Director confirmation order in Form INC-28 within 30 days; and (8) Filing Form INC-22 with destination ROC. The RoC issues a fresh Certificate of Incorporation with a new CIN reflecting the new state code.',
  },
  {
    question:
      'Can a board resolution for shifting registered office be passed by circular resolution?',
    answer:
      'For shifting within the local limits of the same city/town/village under Section 12(5)(a), passing a resolution by circulation under Section 175 of the Companies Act, 2013 is legally permissible, provided the draft resolution is circulated to all directors with necessary papers. However, for shifting outside local limits or to another State, convening a formal Board Meeting (physical or via video conferencing) is standard secretarial practice because the Board must approve the EGM notice, explanatory statement under Section 102, and fix the date, time, and venue of the members\' meeting.',
  },
  {
    question:
      'What is the procedure and resolution for shifting the registered office of an LLP?',
    answer:
      'Under Section 13 of the Limited Liability Partnership Act, 2008 read with Rule 17 of the LLP Rules, 2009: (1) Obtain consent of all partners (or as specified in the LLP Agreement) and consent of secured creditors; (2) For intra-city shifting, file e-Form 15 with RoC within 30 days; (3) For inter-state shifting, publish a notice in one English daily and one vernacular daily newspaper in the district of the current office at least 21 days before filing Form 15; (4) File e-Form 15 with destination RoC; and (5) Execute a Supplementary LLP Agreement and file Form 3 within 30 days.',
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
      'What is Form INC-26 and when is newspaper publication required?',
    answer:
      'Form INC-26 is the statutory notice published in newspapers when shifting registered office from one RoC to another RoC in the same state (under Rule 28) or from one State to another State (under Rule 30). It must be published in one English daily and one principal vernacular daily newspaper in the district where the registered office is situated at least 14 days before the hearing before the Regional Director, inviting objections from creditors and the general public.',
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
      'What are the SEBI LODR stock exchange intimation requirements for listed companies shifting registered office?',
    answer:
      'Under Regulation 30 of the SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015, a listed company must inform the stock exchanges (BSE/NSE) about the proposal to shift its registered office within 24 hours of the Board meeting, and provide prompt disclosure upon receiving approval from shareholders (EGM) and confirmation orders from the Regional Director (RD).',
  },
  {
    question:
      'What are the penalties under Section 12(8) if Form INC-22 is not filed within 30 days?',
    answer:
      'If a company fails to maintain or notify the change of registered office within 30 days under Section 12, the company and every officer who is in default are liable to a penalty of ₹1,000 for every day during which the default continues, but not exceeding ₹1,00,000. Additionally, delayed filing attracts stepped-up MCA additional fees (up to 18 times normal filing fee) under Section 403.',
  },
  {
    question:
      'What are Form GNL-1 and Form GNL-2 used for in registered office shifting?',
    answer:
      'Under MCA rules, Form GNL-1 is used for filing applications to the Registrar of Companies or Regional Director where no specific e-Form is prescribed (though Form INC-23 is now the dedicated form for RD applications). Form GNL-2 is used for filing documents with the Registrar such as list of creditors or special prospectus attachments. In contemporary practice, Form INC-23 directly houses the RD petition attachments.',
  },
  {
    question:
      'What was the form for shifting registered office under the Companies Act, 1956?',
    answer:
      'Under the erstwhile Companies Act, 1956, shifting of registered office was notified to the Registrar of Companies using Form 18 (Notice of situation or change of situation of registered office). Under the Companies Act, 2013, Form 18 was superseded by e-Form INC-22.',
  },
  {
    question:
      'How does changing registered office in India compare with UK, US, or Singapore?',
    answer:
      'In India, registered office change is governed by MCA under Section 12 & 13 of the Companies Act 2013 via e-Form INC-22. In the UK, companies file Form AD01 with Companies House. In Singapore, companies file change of address via ACRA BizFile within 14 days. In the United States, companies file an Amendment to Registered Agent / Office with their respective Secretary of State (e.g. Delaware Division of Corporations, Texas Secretary of State, or Georgia Corporations Division).',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Board Resolution for Shifting of Registered Office: Multi-Scope Generator (2026)',
      description:
        'Download official Board Resolution format for shifting of registered office across all 4 scopes: same city, outside local limits, different RoC & inter-state shifting under Companies Act 2013 and LLP Act 2008.',
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://www.corplawupdates.in/#website' },
      about: { '@id': `${pageUrl}#resolution` },
    },
    {
      '@type': 'TechArticle',
      '@id': `${pageUrl}#article`,
      headline: 'Board Resolution for Shifting of Registered Office: Formats, Procedure & MCA Compliance (2026)',
      description:
        'Authoritative corporate secretarial guide on shifting registered office under Section 12 & 13 of Companies Act, 2013 and Section 13 of LLP Act, 2008. Covers Board Resolutions, Special Resolutions, Form INC-22, Form INC-23, Form INC-26 newspaper notices, and Rule 25(2) photo requirements.',
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
        { '@type': 'Thing', name: 'Shifting of Registered Office' },
        { '@type': 'Thing', name: 'Board Resolution' },
        { '@type': 'Thing', name: 'Special Resolution' },
        { '@type': 'Thing', name: 'Section 12 Companies Act 2013' },
        { '@type': 'Thing', name: 'Section 13 Companies Act 2013' },
        { '@type': 'Thing', name: 'Form INC-22' },
        { '@type': 'Thing', name: 'Limited Liability Partnership' },
      ],
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
        'LLP Registered Office Shifting guidance under Section 13 of LLP Act 2008',
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
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Documents', item: 'https://www.corplawupdates.in/documents' },
        { '@type': 'ListItem', position: 3, name: 'Board Resolution for Registered Office Shifting', item: pageUrl },
      ],
    },
  ],
}

export default function RegisteredOfficePage() {
  return (
    <>
      <JsonLd id="registered-office-change-schema" data={jsonLd} />

      <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-20">
        {/* Interactive Client Component */}
        <RegisteredOfficeClient />

        {/* In-Depth Statutory Reference Guide */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
          
          {/* ─── GEO Direct-Answer Block (AI Citations & LLM Grounding) ─────── */}
          <div className="bg-white dark:bg-slate-900 border-l-4 border-amber-500 border-y border-r border-slate-200 dark:border-slate-800 rounded-r-2xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Executive Statutory Synopsis (Section 12 & 13 Companies Act, 2013)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Under Indian corporate law, the shifting of a company's registered office is governed by <strong>Section 12</strong> (intra-state and local limits) and <strong>Section 13(4)</strong> (inter-state alteration of MOA Situation Clause) of the Companies Act, 2013, read with Rules 25, 27, 28, and 30 of the Companies (Incorporation) Rules, 2014. For shifting within the local limits of the same city, town, or village, only a <strong>Board Resolution</strong> is required under Section 12(5)(a). Shifting outside local limits within the same RoC requires a <strong>Special Resolution</strong> passed at an EGM (filed via Form MGT-14). Shifting between two RoCs in the same State (e.g. Mumbai to Pune) requires <strong>Regional Director (RD) approval</strong> via Form INC-23 and newspaper notice in Form INC-26. Inter-state shifting additionally requires altering Clause II of the MOA and obtaining Central Government / RD confirmation. All shifts mandate filing <strong>e-Form INC-22</strong> within 30 days with Rule 25(2) geo-tagged photos, failing which daily penalties of ₹1,000/day apply under Section 12(8). Limited Liability Partnerships follow <strong>Section 13 of the LLP Act, 2008</strong> and e-Form 15.
            </p>
          </div>

          {/* 1. Comparison of 4 Shifting Scopes */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Statutory Scope Breakdown
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                1. Which Section Applies? The 4 Levels of Registered Office Shifting
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                The procedural complexity, approvals, and MCA forms vary strictly according to the geographic scope of shifting under Section 12 and Section 13.
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
                      1. Within Same City / Town / Village (Local Limits)
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
                      3. Different RoC (Same State, e.g. Mumbai ↔ Pune)
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

          {/* 2. Step-by-Step Procedure by Shifting Scope */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Procedural Roadmap
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                2. Step-by-Step Procedure & Resolution Requirements by Scope
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Detailed secretarial workflow for company secretaries, directors, and compliance officers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scope A */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400">A</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Scope 1: Within Same City / Local Limits</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Section 12(5)(a) & Rule 25:</strong> The simplest shifting category. Does not require shareholder approval, EGM, or MGT-14.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-1.5">
                  <li><strong>Board Resolution:</strong> Convene a meeting of the Board of Directors (giving minimum 7 days notice under Section 173) or pass by circular resolution under Section 175. Approve the shifting and note landlord NOC.</li>
                  <li><strong>Form INC-22:</strong> File e-Form INC-22 with the RoC within <strong>30 days</strong> of passing the Board Resolution along with utility bill and Rule 25(2) photographs.</li>
                  <li><strong>No Newspaper Notice:</strong> Publication in Form INC-26 is completely exempt.</li>
                </ul>
              </div>

              {/* Scope B */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">B</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Scope 2: Outside Local Limits (Same RoC & State)</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Section 12(5) & Rule 25:</strong> When moving to another city or village under the same RoC jurisdiction.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-1.5">
                  <li><strong>Board Meeting:</strong> Pass resolution approving shifting subject to members' approval; approve EGM notice and Section 102 Explanatory Statement.</li>
                  <li><strong>EGM Special Resolution:</strong> Pass Special Resolution with 75% majority of shareholders present and voting.</li>
                  <li><strong>Form MGT-14:</strong> File e-Form MGT-14 with RoC within <strong>30 days</strong> of passing the Special Resolution.</li>
                  <li><strong>Form INC-22:</strong> File e-Form INC-22 within 30 days of actual shifting with registered lease and owner NOC.</li>
                </ul>
              </div>

              {/* Scope C */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400">C</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Scope 3: Different RoC (Within Same State)</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Section 12(5) Second Proviso & Rule 28:</strong> Applies in Maharashtra (Mumbai ↔ Pune) and Tamil Nadu (Chennai ↔ Coimbatore).
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-1.5">
                  <li><strong>Approvals:</strong> Board Resolution + EGM Special Resolution (filed in Form MGT-14 within 30 days).</li>
                  <li><strong>RD Application (Form INC-23):</strong> File application to the Regional Director at least 1 month after filing Form MGT-14.</li>
                  <li><strong>Newspaper Notice (Form INC-26):</strong> Publish public notice in one English daily and one vernacular daily in the district at least 14 days before RD hearing.</li>
                  <li><strong>Orders & INC-22:</strong> File RD confirmation order in Form INC-28 within 60 days, followed by Form INC-22 within 30 days.</li>
                </ul>
              </div>

              {/* Scope D */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-xs font-bold text-rose-700 dark:text-rose-400">D</span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Scope 4: Inter-State Shifting (One State to Another)</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Section 12 & Section 13(4) read with Rule 30:</strong> Requires altering Clause II (Situation Clause) of the Memorandum of Association.
                </p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-1.5">
                  <li><strong>MOA Alteration:</strong> Board Resolution and EGM Special Resolution to alter MOA Clause II (file MGT-14 within 30 days).</li>
                  <li><strong>List of Creditors:</strong> Prepare list of creditors and debenture holders (not older than 1 month before petition) verified by affidavit of at least 2 Directors (one MD) and Auditor Certificate.</li>
                  <li><strong>RD Petition & INC-26:</strong> File Form INC-23. Publish notice in Form INC-26 in English and vernacular dailies; serve notices to creditors, RoC, and State Chief Secretary.</li>
                  <li><strong>Fresh Certificate & New CIN:</strong> File RD order in Form INC-28 within 30 days, then file INC-22. Destination RoC issues fresh Certificate of Incorporation with updated CIN!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Limited Liability Partnership (LLP) Shifting */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                LLP Compliance Guide
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                3. Shifting of Registered Office of Limited Liability Partnership (LLP)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Governed by Section 13 of the Limited Liability Partnership Act, 2008 read with Rule 17 of the LLP Rules, 2009.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <p>
                Unlike companies that file Form INC-22, an LLP changes its registered office by filing <strong>e-Form 15</strong> (Notice for change of place of registered office) with the Registrar of Companies within <strong>30 days</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Intra-City & Intra-State LLP Shifting</h4>
                  <ul className="text-xs space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-400">
                    <li>Obtain written consent of all partners (or as prescribed in the LLP Agreement).</li>
                    <li>Obtain written consent of secured creditors (if any).</li>
                    <li>File e-Form 15 with RoC within 30 days with address proof and owner NOC.</li>
                    <li>Execute Supplementary LLP Agreement and file Form 3 within 30 days.</li>
                  </ul>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Inter-State LLP Shifting (State to State)</h4>
                  <ul className="text-xs space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-400">
                    <li>Publish general notice in daily English and daily vernacular newspapers in the district at least <strong>21 days</strong> before filing Form 15.</li>
                    <li>Serve individual notice to all secured creditors.</li>
                    <li>File e-Form 15 with destination RoC along with newspaper clippings.</li>
                    <li>Update LLP Agreement via Form 3 within 30 days.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Mandatory Document Checklist & Rule 25(2) Geo-Tagged Photos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Clock className="w-5 h-5" />
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
                Form INC-22 strictly requires 2 photographs: (1) Building exterior showing company name board with CIN, address, and email in English and local language; (2) Interior view showing at least one Director or KMP physically present.
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

          {/* 5. Post-Shifting Statutory Intimations Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Post-Shifting Compliance
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                5. Post-Shifting Statutory Intimations Checklist
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Actionable tasks following the approval of Form INC-22 by the Registrar of Companies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">1. Banking Partners</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Submit formal Bank Intimation Letter printed on company letterhead enclosing certified Board Resolution, INC-22 challan, and new address proof.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">2. SEBI LODR Reg 30</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  For listed companies, intimate BSE/NSE within 24 hours of Board approval, EGM shareholder results, and receipt of RD confirmation order.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">3. Section 12(3) Stationery</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Update new address, CIN, phone, email, and website on all official letterheads, billheads, invoices, notices, and website footers.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">4. Statutory Registrations</span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Update registered address on EPFO, ESIC, Professional Tax, Shops & Establishments, PAN/TAN databases, and DGFT (IEC portal).
                </p>
              </div>
            </div>
          </div>

          {/* 6. Section 12(8) Penalties for Non-Compliance */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-400 font-bold text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Section 12(8) Statutory Penalties & Consequences of Delayed Filing</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
              If any default is made in complying with the requirements of Section 12, the company and every officer who is in default shall be liable to a penalty of <strong>₹1,000 for every day</strong> during which the default continues, but not exceeding <strong>₹1,00,000</strong>. Furthermore, delay beyond 30 days triggers stepped-up MCA additional fees under Section 403 (up to 18 times standard filing fees). Crucially, failure to notify registered office renders any legal notices served at the previous address legally binding on the company under Section 20 of the Act.
            </p>
          </div>

          {/* 7. Historical Context & International Clarifications */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Jurisdictional Comparative Context
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Evolution & Global Practice Comparison
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Under the erstwhile <strong>Companies Act, 1956</strong>, registered office changes were notified via <strong>Form 18</strong>. In 2014, the Ministry of Corporate Affairs replaced Form 18 with <strong>e-Form INC-22</strong>, introducing strict verification safeguards including Rule 25(2) geo-tagged name board photographs to curb shell companies. 
              In international jurisdictions:
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc pl-4 space-y-1">
              <li><strong>United Kingdom:</strong> Companies notify address changes to Companies House using <strong>Form AD01</strong> within 14 days.</li>
              <li><strong>Singapore:</strong> Registered address updates are filed on the ACRA BizFile portal within 14 days under the Companies Act (Cap. 50).</li>
              <li><strong>United States:</strong> Domestic corporations file a Change of Registered Agent / Registered Office with their respective Secretary of State (e.g. Delaware, Texas, Georgia, California).</li>
            </ul>
          </div>

          {/* 8. Comprehensive Legal FAQs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
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
      </div>
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
