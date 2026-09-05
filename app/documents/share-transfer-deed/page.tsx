import Link from 'next/link'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Scale,
} from 'lucide-react'
import Sh4DeedClient from './Sh4DeedClient'

const pageUrl = 'https://www.corplawupdates.in/documents/share-transfer-deed'
const mcaPortalUrl = 'https://www.mca.gov.in'

const faqs = [
  {
    question: 'What is Form SH-4 in share transfer?',
    answer:
      'Form SH-4 is the official statutory Securities Transfer Form prescribed under Section 56 of the Companies Act, 2013 and Rule 11 of the Companies (Share Capital and Debentures) Rules, 2014. It is used to record and execute the transfer of physical securities (equity shares, preference shares, debentures) from an existing holder (Transferor) to an incoming buyer or donee (Transferee).',
  },
  {
    question: 'Where can I download Form SH-4 in Word (.docx) and PDF format?',
    answer:
      'You can download the official MCA-prescribed Form SH-4 in both editable Microsoft Word (.docx) and printable PDF format directly from this page using the 1-click download buttons above. You can also customize all fields online with your company CIN, party names, folio, and distinctive numbers to generate a ready-to-print deed.',
  },
  {
    question: 'What is the current stamp duty rate on share transfer in India?',
    answer:
      'The uniform stamp duty rate on the transfer of shares in physical form is 0.015% (i.e. ₹15 per ₹1,00,000 or ₹0.015 per ₹100 of consideration) across all Indian states. This uniform rate was enacted via amendments to Schedule I, Article 56A of the Indian Stamp Act, 1899 by the Finance Act, 2019, which came into effect on 1st July 2020. Many outdated sources still mention 0.25% (25 paise per ₹100), which is no longer applicable.',
  },
  {
    question: 'Why do some websites cite 0.005% (or 0.05%) for share stamp duty? Does Form SH-4 use 0.015% or 0.005%?',
    answer:
      'There is a crucial legal difference between the issuance of new share certificates and the transfer of existing shares under Schedule I of the Indian Stamp Act, 1899 (as amended by Finance Act, 2019 w.e.f. July 1, 2020): (1) When a company issues fresh share certificates (Form SH-1) upon incorporation or further allotment, the stamp duty rate is 0.005% (₹5 per ₹1,00,000) payable by the issuing company. Some portals cite this 0.005% issuance rate, which readers sometimes mistake for 0.05%. (2) When an existing shareholder transfers shares to another person using Form SH-4 (Securities Transfer Form), the stamp duty is strictly 0.015% (₹15 per ₹1,00,000) on the consideration amount, payable by the transferor. Form SH-4 share transfer deeds always attract 0.015%, not 0.005% or 0.05%.',
  },
  {
    question: 'What is the mandatory 2022 declaration in Form SH-4 under FEMA Non-debt Instruments Rules?',
    answer:
      'Vide the Companies (Share Capital and Debentures) Amendment Rules, 2022 (notified by MCA on 4th May, 2022), a mandatory declaration was inserted into Form SH-4. The Transferee must explicitly declare whether or not prior Government approval is required under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019 (specifically concerning FDI restrictions under Press Note 3 for entities from countries sharing land borders with India). If approval is required, proof of approval must be enclosed with Form SH-4. Older Form SH-4 formats lacking this declaration are non-compliant and rejected by company secretarial teams.',
  },
  {
    question: 'What is the time limit for submitting Form SH-4 to the company?',
    answer:
      'Under Section 56(1) of the Companies Act, 2013, Form SH-4 duly stamped, dated, and executed by or on behalf of both the transferor and transferee must be delivered to the company within 60 days from the date of its execution, accompanied by the original share certificate or letter of allotment.',
  },
  {
    question: 'What is the deadline for the company to approve and register the share transfer?',
    answer:
      'Under Section 56(4) of the Companies Act, 2013, the company must register the transfer, endorse the share certificate, and deliver the endorsed certificate to the transferee within one month (30 days) from the date of receipt of the instrument of transfer.',
  },
  {
    question: 'Can private companies still use physical Form SH-4 after the MCA demat mandate (Rule 9B)?',
    answer:
      'Yes, physical Form SH-4 is legally applicable for Small Companies under Section 2(85) of the Companies Act, 2013. Effective from December 1, 2025, a Small Company is defined as a private company with paid-up share capital not exceeding ₹10 Crore and annual turnover not exceeding ₹100 Crore. Rule 9B of the PAS Rules expressly exempts Small Companies from mandatory dematerialisation, allowing them to continue issuing and transferring shares in physical certificate form via Form SH-4.',
  },
  {
    question: 'How is stamp duty calculated for a gift of shares without monetary consideration?',
    answer:
      'When shares are gifted without consideration, stamp duty @ 0.015% is payable on the Fair Market Value (FMV) or the face value / net asset value of the shares on the date of execution of Form SH-4. In addition, the tax implications of Section 56(2)(x) of the Income Tax Act, 1961 must be reviewed if the gift is made to non-relatives.',
  },
  {
    question: 'What documents must be attached with Form SH-4?',
    answer:
      'Mandatory attachments include: (1) Original Share Certificate(s) or Letter of Allotment; (2) Self-attested PAN card copy of the Transferee; (3) Address proof (Aadhaar / Passport / Utility Bill) of the Transferee; (4) Certified True Copy of Board Resolution and Power of Attorney (if Transferor or Transferee is a Company, LLP, or Body Corporate); and (5) Form SH-5 notice and NOC if shares are partly paid up.',
  },
  {
    question: 'Who is responsible for paying stamp duty on share transfer?',
    answer:
      'Under Section 9A of the Indian Stamp Act, 1899, the transferee (buyer) is generally liable to pay stamp duty in the case of a transfer of securities for consideration. However, the parties may mutually agree otherwise in their share purchase agreement.',
  },
  {
    question: 'How are physical share transfer stamps cancelled?',
    answer:
      'Under Section 12 of the Indian Stamp Act, 1899, adhesive share transfer stamps must be effectively cancelled at the time of execution by writing the transferor’s name or initials across the stamps, drawing intersecting lines, or punching them so that they cannot be reused. An uncancelled stamp renders the transfer deed invalid.',
  },
  {
    question: 'What happens if Form SH-4 is not delivered to the company within 60 days?',
    answer:
      'If Form SH-4 is not delivered within 60 days of execution, the instrument becomes legally invalid under Section 56(1), and the company’s Board cannot register the transfer. The parties must re-execute a fresh Form SH-4 with a new execution date and pay fresh stamp duty.',
  },
  {
    question: 'What registers must the company update after approving the share transfer?',
    answer:
      'Upon approving the transfer in a Board Meeting or Share Transfer Committee, the company must enter the particulars in the Register of Transfers maintained in Form SH-6 (Rule 11) and update the Register of Members in Form MGT-1 under Section 88 of the Companies Act, 2013.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'Form SH-4 Share Transfer Deed Format: Word & PDF Download (2026)',
      description:
        'Download official MCA Form SH-4 share transfer deed format in Word (.docx) and PDF. Includes 0.015% stamp duty calculator, 60-day lodging checklist, specimen board resolution & legal guide under Section 56.',
      inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://www.corplawupdates.in/#website' },
      about: { '@id': `${pageUrl}#form-sh4` },
    },
    {
      '@type': 'DigitalDocument',
      '@id': `${pageUrl}#form-sh4`,
      name: 'Form SH-4 — Securities Transfer Form',
      url: pageUrl,
      inLanguage: 'en-IN',
      encodingFormat: [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf',
      ],
      legislationIdentifier:
        'Companies Act, 2013, Section 56; Companies (Share Capital and Debentures) Rules, 2014, Rule 11; Indian Stamp Act, 1899',
      publisher: {
        '@type': 'Organization',
        name: 'CorpLawUpdates.in',
        url: 'https://www.corplawupdates.in',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${pageUrl}#generator`,
      name: 'Form SH-4 Share Transfer Deed Generator & Stamp Duty Calculator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any',
      url: pageUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      featureList: [
        'Download official blank Form SH-4 in Word (.docx) format',
        'Download official blank Form SH-4 in PDF format',
        'Interactive statutory Form SH-4 customizer with live preview',
        '0.015% uniform share transfer stamp duty calculator',
        'Specimen Board Resolution generator under Section 56',
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Execute and Submit Form SH-4 Share Transfer Deed in India',
      description:
        'Complete legal procedure for executing and lodging Form SH-4 for transfer of physical shares in a private company under Section 56 of the Companies Act, 2013.',
      totalTime: 'P30D',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Check AOA Restrictions and Pre-emption Rights',
          text: 'Verify the Articles of Association (AOA) for Right of First Refusal (ROFR), pre-emption clauses, and transfer restrictions before entering into any transfer agreement.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Complete Form SH-4 with Exact Particulars',
          text: 'Fill the company CIN, company name, security class, distinctive numbers, certificate numbers, folio number, consideration, and transferee particulars.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Pay Uniform Stamp Duty @ 0.015%',
          text: 'Calculate stamp duty at 0.015% of consideration (Finance Act, 2019) and affix physical Share Transfer Stamps or attach an e-Stamping certificate from SHCIL. Cancel stamps by writing signature across.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Signatures and Independent Witness Attestation',
          text: 'Both the transferor and transferee must sign the deed. An independent adult witness must attest the transferor’s signature with full name, address, and PIN code.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Deliver to Company within 60 Days',
          text: 'Lodge the duly stamped and executed Form SH-4 along with original share certificates and transferee PAN/address proof with the company within 60 days from execution date.',
        },
        {
          '@type': 'HowToStep',
          position: 6,
          name: 'Board Approval and Certificate Endorsement within 1 Month',
          text: 'The Board of Directors passes a resolution approving the transfer within 30 days, endorses the share certificate, and updates the Register of Transfers (Form SH-6) and Register of Members (Form MGT-1).',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Documents', item: 'https://www.corplawupdates.in/documents' },
        { '@type': 'ListItem', position: 3, name: 'Form SH-4 Share Transfer Deed', item: pageUrl },
      ],
    },
  ],
}

export default function ShareTransferDeedPage() {
  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-20 transition-colors">
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
            <span className="font-semibold text-slate-900 dark:text-slate-100">Form SH-4 Share Transfer Deed</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            2026 Compliant • Section 56 Companies Act, 2013 • Rule 11
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Form SH-4 Share Transfer Deed Format: Word & PDF Download
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Download the official MCA-prescribed <strong>Securities Transfer Form (Form SH-4)</strong> in editable Word (.docx) and PDF format. Includes real-time <strong>0.015% stamp duty calculator</strong>, 60-day statutory timeline checklist, specimen board resolution, and complete compliance guide for private companies.
          </p>
        </div>
      </div>

      {/* Main Interactive Studio & Downloads */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Sh4DeedClient />
      </div>

      {/* Legal & Procedural Guide (Authority & AI SEO / GEO Section) */}
      <section aria-labelledby="sh4-guide-heading" className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl text-slate-700 dark:text-slate-300">
          {/* Section 1: Definition Box */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 dark:border-blue-900/40 dark:bg-blue-950/20 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Direct Answer & Statutory Authority</p>
            <h2 id="sh4-guide-heading" className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              What is Form SH-4 in Corporate Law?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
              <strong>Form No. SH-4 (Securities Transfer Form)</strong> is the statutory instrument mandated under <strong>Section 56 of the Companies Act, 2013</strong> and <strong>Rule 11(1) of the Companies (Share Capital and Debentures) Rules, 2014</strong> for transferring physical securities (such as equity shares, preference shares, and debentures) in Indian companies.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
              Under Indian law, no transfer of securities in physical form shall be registered by a company unless a proper instrument of transfer in Form SH-4, duly stamped with the requisite stamp duty, dated and executed by or on behalf of both the transferor and transferee, is delivered to the company within <strong>60 days</strong> of execution.
            </p>
          </div>

          {/* Section 2: Statutory Quick Reference Matrix */}
          <div className="mt-14">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Form SH-4 Statutory Quick Reference Matrix (2026)
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Key parameters, governing provisions, and compliance requirements at a glance:
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <table className="w-full border-collapse bg-white dark:bg-slate-900 text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold">
                  <tr>
                    <th className="p-3.5 sm:p-4">Parameter</th>
                    <th className="p-3.5 sm:p-4">Statutory Reference</th>
                    <th className="p-3.5 sm:p-4">Requirement / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Governing Act</td>
                    <td className="p-3.5 sm:p-4">Section 56(1) & (4), Companies Act, 2013</td>
                    <td className="p-3.5 sm:p-4">Governs transfer and transmission of securities</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Governing Rules</td>
                    <td className="p-3.5 sm:p-4">Rule 11, Companies (Share Capital & Debentures) Rules, 2014</td>
                    <td className="p-3.5 sm:p-4">Prescribes Form SH-4 layout and procedure</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Stamp Duty Rate</td>
                    <td className="p-3.5 sm:p-4">Indian Stamp Act, 1899 (Article 56A, Finance Act 2019)</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-600 dark:text-emerald-400">0.015% (₹15 per ₹1 Lakh consideration / FMV)</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Lodging Deadline</td>
                    <td className="p-3.5 sm:p-4">Section 56(1), Companies Act, 2013</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-amber-600 dark:text-amber-400">Within 60 days from date of execution</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Registration Deadline</td>
                    <td className="p-3.5 sm:p-4">Section 56(4), Companies Act, 2013</td>
                    <td className="p-3.5 sm:p-4">Within 1 month (30 days) from delivery date</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Demat Mandate Exemption</td>
                    <td className="p-3.5 sm:p-4">Rule 9B, PAS Rules & Section 2(85)</td>
                    <td className="p-3.5 sm:p-4">Small Companies (Paid-up capital ≤ ₹10 Cr & Turnover ≤ ₹100 Cr) are exempt</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Statutory Registers</td>
                    <td className="p-3.5 sm:p-4">Rule 11 & Section 88, Companies Act, 2013</td>
                    <td className="p-3.5 sm:p-4">Register of Transfers (Form SH-6) & Members (Form MGT-1)</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Default Penalty</td>
                    <td className="p-3.5 sm:p-4">Section 56(6), Companies Act, 2013</td>
                    <td className="p-3.5 sm:p-4 text-red-600 dark:text-red-400">Fine of ₹50,000 on company and defaulting officer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Clarification: 0.015% Share Transfer vs 0.005% Share Certificate Issuance */}
          <div className="mt-14 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 p-6 shadow-sm dark:border-indigo-900/50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white sm:text-lg">
                <Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Statutory Comparison: Share Transfer (0.015%) vs. Share Certificate Issuance (0.005%)
              </div>
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
                Indian Stamp Act, 1899 (Schedule I)
              </span>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              A very common point of confusion among corporate practitioners and investors is whether stamp duty on shares is <strong>0.005%</strong> (or misread as 0.05%) versus <strong>0.015%</strong>. The Indian Stamp Act, 1899 (amended via the Finance Act, 2019 w.e.f. 1st July 2020) draws a strict statutory distinction based on the nature of the transaction:
            </p>

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="p-3.5 sm:p-4">Transaction Type</th>
                    <th className="p-3.5 sm:p-4">Governing Form</th>
                    <th className="p-3.5 sm:p-4">Statutory Stamp Duty</th>
                    <th className="p-3.5 sm:p-4">Duty Per ₹1,00,000</th>
                    <th className="p-3.5 sm:p-4">Liable Payer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                      Transfer of Shares (Delivery Basis)
                      <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">Sale/gift of existing shares between shareholders</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">Form SH-4</td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 dark:text-emerald-300">0.015%</td>
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">₹15</td>
                    <td className="p-3.5 sm:p-4 text-slate-700 dark:text-slate-300">Transferor (or agreed in SPA)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                      Issue / Allotment of Shares
                      <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">Fresh issuance upon incorporation, rights, or private placement</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono text-slate-700 dark:text-slate-300">Form SH-1 (Share Cert.)</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-blue-700 dark:text-blue-300">0.005%</td>
                    <td className="p-3.5 sm:p-4 font-medium text-slate-700 dark:text-slate-300">₹5</td>
                    <td className="p-3.5 sm:p-4 text-slate-700 dark:text-slate-300">Issuer (The Company)</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">
                      Transfer of Shares (Non-Delivery)
                      <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">Intraday / square-off trading via stock exchange</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono text-slate-700 dark:text-slate-300">Contract Note</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-700 dark:text-slate-300">0.003%</td>
                    <td className="p-3.5 sm:p-4 font-medium text-slate-700 dark:text-slate-300">₹3</td>
                    <td className="p-3.5 sm:p-4 text-slate-700 dark:text-slate-300">Transferee (Buyer)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Why some portals mention 0.005% or &quot;0.05%&quot;:</strong> Legal portals (such as IndiaFilings or ComplianceCalendar) frequently publish guides on <em>Share Certificates</em>, explaining that fresh share certificates attract <strong>0.005%</strong> stamp duty upon initial allotment. Readers sometimes accidentally misread 0.005% as 0.05%, or mistakenly assume this applies to share transfer deeds. For <strong>Form SH-4 Share Transfer Deeds</strong>, the statutory rate enacted under the Finance Act, 2019 is strictly <strong>0.015%</strong>.
            </div>
          </div>

          {/* Section 3: Step-by-Step Procedure Guide */}
          <div className="mt-14">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Step-by-Step Procedure: Transfer of Physical Shares in a Private Company
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Follow these statutory steps to ensure the share transfer is legally binding and registered without risk of penal action:
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Check Articles of Association (AOA) & Pre-emption Rights</h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Private companies invariably have restrictions on the right to transfer shares in their Articles of Association (AOA). Review the Right of First Refusal (ROFR), pre-emptive offer requirements to existing shareholders, and valuation rules. Ensure notices have been given and waivers obtained where required.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Draft Form SH-4 with Exact Particulars</h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Fill every statutory field accurately: Company CIN, Name, Class of shares, Nominal/Paid-up values, Distinctive Numbers (From & To), Certificate Number(s), Folio Numbers, and full Transferee details. Discrepancies between distinctive numbers and original share certificates are the most common reason for rejection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Pay Stamp Duty @ 0.015% & Cancel Stamps</h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Calculate stamp duty at 0.015% of the total consideration amount (or FMV in case of gift). Affix physical adhesive Share Transfer Stamps or attach an e-Stamping certificate from Stock Holding Corporation of India (SHCIL) or state treasury portal. Under Section 12 of the Indian Stamp Act, 1899, physical stamps must be cancelled by writing signature or drawing lines across them.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Signatures & Independent Witness Attestation</h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      The Transferor and Transferee (or their authorized attorneys) must execute the deed. An independent adult witness must attest that the Transferor signed in their presence, recording the witness’s signature, full name, address, and PIN code.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    5
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Lodge with Company within 60 Days (Strict Deadline)</h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      The executed and stamped Form SH-4 must be delivered to the company at its registered office within <strong>60 days from the date of execution</strong>, along with the original Share Certificate(s) and transferee KYC documents (PAN and address proof). If delivered after 60 days, the deed expires and the Board cannot register it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    6
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Board Approval & Certificate Endorsement (within 30 Days)</h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      The Board of Directors considers and approves the transfer in a meeting or committee. The company makes necessary endorsements on the reverse of the share certificate and delivers the endorsed certificate to the Transferee within <strong>one month (30 days)</strong> from receipt under Section 56(4).
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    7
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Update Statutory Registers (Form SH-6 & MGT-1)</h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Enter the transfer details in the <strong>Register of Transfers (Form SH-6)</strong> and update the <strong>Register of Members in Form MGT-1</strong> pursuant to Section 88 of the Companies Act, 2013.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Checklist of Mandatory Enclosures */}
          <div className="mt-14">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Mandatory Document Checklist for Share Transfer
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Ensure all supporting documents are attached when submitting Form SH-4 to the company:
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 dark:text-white">Original Share Certificate(s):</strong> Must accompany Form SH-4. If not issued yet, the original Letter of Allotment is required.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 dark:text-white">Self-Attested PAN Card:</strong> Mandatory copy of PAN card of the Transferee (buyer or donee) for statutory records.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 dark:text-white">Transferee Address Proof:</strong> Copy of Aadhaar card, Passport, Voter ID, or Utility bill showing current residential address.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 dark:text-white">Corporate Board Resolution / POA:</strong> Certified true copy of board resolution and list of authorized signatories if the transferor or transferee is a company or LLP.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 dark:text-white">Cancelled Stamp / e-Stamp Receipt:</strong> Evidence of payment of 0.015% stamp duty with cancelled stamp or e-stamping certificate.
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="text-slate-900 dark:text-white">Form SH-5 Notice (Partly Paid Only):</strong> If shares are partly paid and application is made by transferor alone, NOC notice under Section 56(3) is mandatory.
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Demat Mandate (Rule 9B) & Latest Small Company Threshold (10/100) */}
          <div className="mt-14 rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/60 dark:bg-amber-950/30 sm:p-8 text-amber-950 dark:text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              MCA Dematerialisation Mandate: Who Can Still Use Physical Form SH-4?
            </div>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed">
              Under <strong>Rule 9B</strong> of the Companies (Prospectus and Allotment of Securities) Rules, 2014, the Ministry of Corporate Affairs (MCA) mandated that unlisted private companies must facilitate the dematerialisation of their securities.
            </p>
            <div className="mt-3 space-y-2 text-xs sm:text-sm">
              <p>
                <strong>The Small Company Exemption (₹10 Crore / ₹100 Crore Limits):</strong> Under Section 2(85) of the Companies Act, 2013, a <em>Small Company</em> is defined as a private company having:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm font-semibold">
                <li>Paid-up share capital not exceeding <strong>₹10 Crore</strong>; AND</li>
                <li>Annual turnover not exceeding <strong>₹100 Crore</strong> (as per immediately preceding financial year).</li>
              </ul>
              <p className="pt-1">
                Rule 9B(1) explicitly provides that <strong>Small Companies are completely EXEMPT from mandatory dematerialisation</strong>. Therefore, small private companies can continue to issue share certificates and process share transfers physically using Form SH-4!
              </p>
              <p>
                <strong>When Form SH-4 is Legally Mandatory:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>All share transfers in <strong>Small Private Companies</strong> (capital ≤ ₹10 Cr & turnover ≤ ₹100 Cr).</li>
                <li>Transfer of physical share certificates held prior to demat conversion in covered companies.</li>
                <li>Transmission of physical shares where the legal heir does not have a demat account yet.</li>
              </ul>
            </div>
          </div>

          {/* Section 6: Official Statutory Sources & Acts */}
          <div className="mt-14">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Official Statutory Framework & Authority</h3>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-xs sm:text-sm leading-relaxed">
              <li>
                <span className="font-semibold text-slate-900 dark:text-white">Companies Act, 2013 — Section 56:</span> Governs the transfer and transmission of securities, execution of Form SH-4, and the 60-day delivery timeline.
              </li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-white">Companies (Share Capital & Debentures) Rules, 2014 — Rule 11:</span> Prescribes Form SH-4 (Securities Transfer Form) and Form SH-6 (Register of Transfers).
              </li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-white">Companies (Share Capital & Debentures) Amendment Rules, 2022:</span> Notified by MCA on 4th May, 2022, mandating the Transferee declaration regarding Government approval under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019.
              </li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-white">Indian Stamp Act, 1899 — Article 56A (Schedule I):</span> Amended by the Finance Act, 2019 (effective 1st July 2020) to establish a uniform 0.015% stamp duty rate on physical transfer of shares across all states in India.
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  href={mcaPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ministry of Corporate Affairs (MCA) Portal <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Section 7: Comprehensive FAQ Accordion */}
          <div className="mt-14">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                Frequently Asked Questions about Form SH-4 & Share Transfer
              </h3>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Clear, practical answers based on the Companies Act, 2013 and Indian Stamp Act, 1899:
            </p>

            <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {faqs.map(({ question, answer }) => (
                <details key={question} className="group p-5">
                  <summary className="cursor-pointer list-none pr-8 text-sm sm:text-base font-semibold text-slate-900 dark:text-white marker:hidden flex items-center justify-between">
                    <span>{question}</span>
                    <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">{answer}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 leading-relaxed">
            <strong>Disclaimer:</strong> The formats, guides, and stamp duty calculators provided on CorpLawUpdates.in are for educational and informational compliance purposes only. They do not constitute formal legal advice. Please consult a qualified Company Secretary (CS) or corporate lawyer for specific transactions.
          </div>
        </div>
      </section>

      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
