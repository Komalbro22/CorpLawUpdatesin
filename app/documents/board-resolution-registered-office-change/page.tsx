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
      'No. Under Section 12(5)(a) of the Companies Act, 2013, shareholder approval (whether Ordinary or Special Resolution) is NOT required if the new registered office is located within the local limits of the same city, town, or village. Only a Board Resolution is required. Shareholder approval via Special Resolution (and Form MGT-14) is only mandatory if the office is shifted outside the local limits of the existing city/town/village under Section 12(5)(b).',
  },
  {
    question:
      'Which MCA e-Form must be filed for registered office change and what is the deadline?',
    answer:
      'Form INC-22 (Notice of situation or change of situation of registered office) must be filed with the Registrar of Companies (ROC) within 30 days of passing the Board Resolution, pursuant to Section 12(5) of the Companies Act, 2013. Failure to file within 30 days attracts additional late filing fees and penalty under Section 12(8).',
  },
  {
    question:
      'Where can I download the Board Resolution for address change in Word (.docx) and PDF format?',
    answer:
      'You can download the official MCA-compliant Board Resolution format in editable Microsoft Word (.docx) and printable PDF format directly from this page using the 1-click download buttons above. You can also customize company name, CIN, old/new address, meeting date, and director particulars to generate a ready-to-print certified true copy.',
  },
  {
    question:
      'What documents must be attached with e-Form INC-22 for registered office change?',
    answer:
      'Mandatory attachments under Rule 25(2) and Rule 27 include: (1) Certified True Copy of Board Resolution; (2) Registered Title Deed (if company-owned) or Lease/Rent Agreement along with rent receipt; (3) Utility Bill (electricity/telephone/gas bill in owner’s or company’s name not older than 2 months); (4) No Objection Certificate (NOC) from property owner; (5) Two geo-tagged photographs: one exterior showing company name board with CIN/address in English and local language, and one interior showing at least one Director/KMP inside the office; and (6) List of other companies sharing the same address (if any).',
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
      'Under the GST laws, any change in the Principal Place of Business (Registered Office) requires filing an Amendment of Core Fields in Form GST REG-14 on the GST portal within 15 days of the effective change. The approved Form INC-22 and latest electricity bill / rent agreement serve as valid proof.',
  },
  {
    question:
      'What are the penalties under Section 12(8) if Form INC-22 is not filed within 30 days?',
    answer:
      'If a company fails to maintain or notify the change of registered office within 30 days under Section 12, the company and every officer who is in default are liable to a penalty of ₹1,000 for every day during which the default continues, but not exceeding ₹1,00,000. Additionally, delayed filing attracts stepped-up MCA additional fees (up to 18 times normal filing fee) under Section 403.',
  },
  {
    question:
      'Is Regional Director (RD) or Central Government approval required for same-city shifting?',
    answer:
      'No. Regional Director approval in Form INC-23 is only required when shifting registered office from one ROC jurisdiction to another ROC within the same state (e.g. from ROC Mumbai to ROC Pune in Maharashtra, or ROC Chennai to ROC Coimbatore in Tamil Nadu), or from one State to another State under Section 13(4). Changing registered office within the same city never requires RD or Central Government approval.',
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
      name: 'Board Resolution for Change of Registered Office Format: Word & PDF Download (2026)',
      description:
        'Download official Board Resolution format for change of registered office within same city under Section 12(5) of Companies Act, 2013. Includes Word (.docx), PDF, Form INC-22 30-day checklist & Bank Intimation Letter.',
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://www.corplawupdates.in/#website' },
      about: { '@id': `${pageUrl}#resolution` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${pageUrl}#generator`,
      name: 'Board Resolution Registered Office Change Generator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Works in Chrome, Safari, Firefox, Edge.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      description:
        'Generate and download certified true copy of Board Resolution for registered office address change under Section 12 and Bank Intimation Letter in editable Word (.docx) and printable PDF.',
    },
    {
      '@type': 'HowTo',
      '@id': `${pageUrl}#procedure`,
      name: 'Procedure to Change Registered Office of Company Within Same City',
      description:
        'Step-by-step statutory procedure under Section 12(5)(a) of Companies Act, 2013 and Form INC-22 filing.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Issue Board Meeting Notice',
          text: 'Issue at least 7 days written notice with agenda to all directors under Section 173(3) and ICSI SS-1.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Convene Board Meeting & Pass Resolution',
          text: 'Pass Board Resolution approving the shifting of registered office from old address to new address within local limits.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Collect Proof of Address & Landlord NOC',
          text: 'Obtain utility bill (electricity bill not older than 2 months), rent agreement, and signed NOC from the property owner.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Affix Name Board & Take Rule 25(2) Photographs',
          text: 'Paint or affix name board in English and local language. Take exterior photo of name board and interior photo with at least one Director inside.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'File Form INC-22 on MCA V3 Portal',
          text: 'Digitally sign and submit e-Form INC-22 with ROC within 30 days of the board resolution.',
        },
        {
          '@type': 'HowToStep',
          position: 6,
          name: 'Intimate Banks, GST & Tax Authorities',
          text: 'Submit intimation letter to banks, file GST REG-14 within 15 days, and update letterheads and website.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faqs`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ],
}

export default function RegisteredOfficePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
      {/* Breadcrumbs Navigation */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/documents" className="hover:text-slate-900 dark:hover:text-white transition">
              Documents
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Board Resolution — Registered Office Change
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            2026 Compliant • Section 12(5)(a) Companies Act, 2013 • Rule 25 & 27
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Format of Board Resolution for Change of Registered Office (Same City)
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Download the official Certified True Copy <strong>Board Resolution for Address Change in Word (.docx) and PDF format</strong>. Specifically drafted for shifting within the same city, town, or village under <strong>Section 12(5)(a)</strong> and filing <strong>Form INC-22</strong> within 30 days. Includes free bank intimation letter.
          </p>
        </div>
      </div>

      {/* Main Interactive Studio & Downloads */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <RegisteredOfficeClient />
      </div>

      {/* Statutory Guide & Authority Section (GEO / AI-SEO) */}
      <section aria-labelledby="registered-office-guide-heading" className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl text-slate-700 dark:text-slate-300">
          {/* Direct Answer Summary Box */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 dark:border-blue-900/40 dark:bg-blue-950/20 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Direct Statutory Answer • Companies Act, 2013
            </p>
            <h2 id="registered-office-guide-heading" className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              How to Change Registered Office Within the Same City: Legal Requirements
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
              Under <strong>Section 12(5)(a) of the Companies Act, 2013</strong> read with <strong>Rule 25 and Rule 27 of the Companies (Incorporation) Rules, 2014</strong>, changing the registered office of a private limited company or public company <em>within the local limits of the same city, town, or village</em> requires <strong>only a Board Resolution</strong>. Shareholder approval (Special Resolution) and Central Government / Regional Director approval are <strong>not required</strong>. The company must submit notice of the change in <strong>e-Form INC-22 within 30 days</strong> of the board meeting.
            </p>
          </div>

          {/* Statutory Comparison Grid: 4 Scopes of Registered Office Shifting */}
          <div className="mt-14">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white sm:text-xl">
              <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Statutory Comparison: The 4 Scopes of Registered Office Shifting
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              The procedure, approvals, and MCA forms vary significantly based on whether the address changes within the same city, to another city, to another ROC, or to another State:
            </p>

            <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 sm:p-4">Scope of Shifting</th>
                    <th className="p-3.5 sm:p-4">Governing Section</th>
                    <th className="p-3.5 sm:p-4">Approvals Required</th>
                    <th className="p-3.5 sm:p-4">Mandatory MCA Forms</th>
                    <th className="p-3.5 sm:p-4">Statutory Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                      Within Same City / Town / Village
                      <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">Local limits change</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono">Sec 12(5)(a)</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-300">Board Resolution Only</td>
                    <td className="p-3.5 sm:p-4 font-mono font-semibold text-blue-600 dark:text-blue-400">Form INC-22</td>
                    <td className="p-3.5 sm:p-4">Within 30 days</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                      Outside Local Limits, Same ROC
                      <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">Different city in same state</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono">Sec 12(5)(b)</td>
                    <td className="p-3.5 sm:p-4">Special Resolution (EGM)</td>
                    <td className="p-3.5 sm:p-4 font-mono text-blue-600 dark:text-blue-400">Form MGT-14 + INC-22</td>
                    <td className="p-3.5 sm:p-4">Both within 30 days</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                      From One ROC to Another ROC
                      <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">e.g. Mumbai to Pune, Chennai to Coimbatore</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono">Sec 12(5) 2nd proviso</td>
                    <td className="p-3.5 sm:p-4">Special Resolution + Regional Director (RD)</td>
                    <td className="p-3.5 sm:p-4 font-mono text-blue-600 dark:text-blue-400">MGT-14 + INC-23 + INC-28 + INC-22</td>
                    <td className="p-3.5 sm:p-4">60–90 days total</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                      From One State to Another State
                      <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">Inter-state shifting & MOA alteration</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono">Sec 13(4) & 13(7)</td>
                    <td className="p-3.5 sm:p-4">Special Resolution + Central Govt / RD Approval</td>
                    <td className="p-3.5 sm:p-4 font-mono text-blue-600 dark:text-blue-400">MGT-14 + INC-23 + INC-26 + INC-28 + INC-22</td>
                    <td className="p-3.5 sm:p-4">90–120 days total</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Step-by-Step Procedure */}
          <div className="mt-14">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Step-by-Step Procedure for Changing Registered Office Within Same City
            </h3>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white">
                  Step 1: Issue Notice of Board Meeting (Section 173(3) & SS-1)
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Issue at least 7 days' written notice along with the agenda and draft resolution to all directors of the company at their registered addresses or emails.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white">
                  Step 2: Convene Board Meeting and Pass Resolution (Section 12(5)(a))
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  At the meeting, approve the change of registered office from the old address to the new address, approve the effective date, accept the landlord NOC and utility bill, and authorize a Director or Company Secretary to file Form INC-22.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white">
                  Step 3: Collect Address Proof, NOC, and Take Rule 25(2) Photos
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Ensure the utility bill is not older than 2 months. Obtain the registered rent agreement and owner NOC. Arrange to paint the name board outside the premises and capture the exterior geo-tagged photo and interior photo with director.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white">
                  Step 4: File e-Form INC-22 on MCA V3 Portal Within 30 Days
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Fill in Form INC-22 under Company Services on MCA V3, attach the board resolution, utility bill, rent deed, NOC, and photographs. The form must be digitally signed by an authorized Director (DSC) and certified by a practicing CA, CS, or CMA.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <p className="font-bold text-slate-900 dark:text-white">
                  Step 5: Post-Shifting Statutory Intimations (GST, Banks & Stationery)
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  File Form GST REG-14 within 15 days on the GST portal to amend your Principal Place of Business. Submit the formal intimation letter with certified board resolution to your bank branches. Update PAN/TAN records and print the new address on all letterheads and invoices.
                </p>
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Frequently Asked Questions (FAQs) on Registered Office Change
            </h3>
            <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              {faqs.map((faq, index) => (
                <div key={index} className={index === 0 ? 'pb-6' : 'py-6'}>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {faq.question}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
