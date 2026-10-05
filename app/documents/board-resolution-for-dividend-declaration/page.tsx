import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, Landmark, ShieldCheck } from 'lucide-react'
import DividendResolutionClient from './DividendResolutionClient'
import JsonLd from '@/components/JsonLd'

const pageUrl = 'https://www.corplawupdates.in/documents/board-resolution-for-dividend-declaration'
const title = 'Board Resolution for Dividend Declaration: Free Word & PDF Format'
const description = 'Draft a board resolution for final or interim dividend declaration in India. Free editable Word and PDF downloads, specimen wording, Companies Act Section 123 guide and payment checklist.'

export const revalidate = 86400
export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'board resolution for dividend declaration', 'dividend declaration board resolution',
    'sample board resolution for dividend declaration', 'board resolution for declaration of dividend',
    'board resolution format for dividend declaration', 'format of board resolution for declaration of dividend',
    'board resolution for interim dividend declaration', 'sample board resolution for interim dividend declaration',
    'draft board resolution for declaration of interim dividend', 'board resolution for final dividend declaration',
    'board resolution for declaration of final dividend', 'draft board resolution for declaration of final dividend',
    'board resolution dividend distribution template', 'board resolution to declare dividend',
    'board resolution dividend declaration Word PDF India', 'Companies Act 2013 Section 123 dividend',
    'board resolution for dividend declaration private company', 'board resolution vs shareholder resolution dividend',
    'what is the entry for dividend declaration',
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: 'website', url: pageUrl, siteName: 'CorpLawUpdates.in', title,
    description,
    images: [{ url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent('Board Resolution for Dividend Declaration')}&type=Document%20Generator`, width: 1200, height: 630, alt: 'Dividend declaration board resolution generator with Word and PDF download' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [`https://www.corplawupdates.in/api/og?title=${encodeURIComponent('Board Resolution for Dividend Declaration')}&type=Document%20Generator`] },
}

const faqs = [
  {
    question: 'What is the correct board resolution for a final dividend?',
    answer: 'For a final dividend, the Board ordinarily recommends a specific dividend per share and aggregate amount for the financial year, subject to members’ approval at the Annual General Meeting. Members may declare a lower amount than the Board recommends, but cannot increase it. The Board resolution should therefore recommend the dividend; it should not state that the Board itself declares the final dividend.',
  },
  {
    question: 'How is an interim dividend different from a final dividend?',
    answer: 'Under Section 123(3) of the Companies Act, 2013, the Board may declare an interim dividend during a financial year or between the close of the financial year and the AGM, from the sources permitted by that section. A final dividend is recommended by the Board and declared by members at the AGM. The generator changes the operative wording to reflect this distinction.',
  },
  {
    question: 'Can interim dividend be declared by circular resolution?',
    answer: 'The ICSI Secretarial Standard on Dividend (SS-3) states that interim dividend should be declared at a Board meeting and not by a resolution by circulation. Use a duly convened Board meeting for this resolution and confirm the current applicable standard, the company’s Articles and any sector-specific rules.',
  },
  {
    question: 'Can a Board resolution declare a final dividend?',
    answer: 'The Board recommends the final dividend, but members declare it at the AGM. The members cannot declare more than the amount recommended by the Board. Record the Board’s action as a recommendation and place the proposal before members for decision.',
  },
  {
    question: 'What is the difference between a Board resolution and a shareholders’ resolution for dividend?',
    answer: 'For a final dividend, the Board resolution recommends the amount and members decide whether to declare it at the AGM. For an interim dividend, the Board makes the declaration under Section 123(3); member approval is not the declaration step. Record the decision and its date accurately in the relevant meeting minutes.',
  },
  {
    question: 'What should the dividend declaration resolution include?',
    answer: 'The specimen covers the company and meeting particulars, financial year, dividend type, amount per share, face value, estimated eligible shares and aggregate amount, entitlement date if applicable, statutory payment directions and authorisations. Verify all figures against approved financial information and the register of members / beneficial owners’ records.',
  },
  {
    question: 'What is the accounting entry for dividend declaration?',
    answer: 'As a general illustration, when a dividend becomes a present obligation, the company debits the appropriate retained earnings / surplus account and credits dividend payable; on payment, it debits dividend payable and credits bank, accounting separately for any tax withheld. The recognition date differs: members declare final dividend at the AGM, while the Board declares interim dividend. Under Ind AS 10, a dividend declared after the reporting period is not recognised as a liability at that reporting date and is disclosed in the notes. Apply the company’s accounting framework and chart of accounts.',
  },
  {
    question: 'What is the five-day bank deposit requirement for a declared dividend?',
    answer: 'Section 123(4) requires the total dividend amount, including interim dividend, to be deposited in a separate account in a scheduled bank within five days from declaration. For a final dividend, declaration occurs at the members’ meeting, not when the Board recommends it.',
  },
  {
    question: 'When must a declared dividend be paid?',
    answer: 'Section 127 generally requires a declared dividend to be paid or the warrant posted within thirty days, subject to the statutory exceptions. If an amount remains unpaid or unclaimed after that period, Section 124 requires transfer to the Unpaid Dividend Account within the next seven days.',
  },
  {
    question: 'Does this format apply in Malaysia, Singapore or the Philippines?',
    answer: 'No. This specimen is for Indian companies under the Companies Act, 2013. Malaysia, Singapore and the Philippines have separate company laws, filing practices and resolution conventions; use a jurisdiction-specific form reviewed against that country’s current law.',
  },
  {
    question: 'Is this board resolution a prescribed MCA form?',
    answer: 'No. This is a specimen board-resolution format, not a prescribed MCA form. Adapt it to the company’s facts, Articles of Association, applicable rules and professional advice before signing or circulating it.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: title, description, inLanguage: 'en-IN',
      isPartOf: { '@id': 'https://www.corplawupdates.in/#website' }, about: { '@id': `${pageUrl}#generator` },
    },
    {
      '@type': 'SoftwareApplication', '@id': `${pageUrl}#generator`, name: 'Dividend Declaration Board Resolution Generator',
      applicationCategory: 'BusinessApplication', operatingSystem: 'Any', url: pageUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      featureList: ['Final dividend recommendation wording for AGM', 'Interim dividend declaration wording under Section 123(3)', 'Editable Microsoft Word download', 'Print-ready PDF download', 'Automatic aggregate dividend estimate'],
    },
    {
      '@type': 'FAQPage', mainEntity: faqs.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
    },
    {
      '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Documents', item: 'https://www.corplawupdates.in/documents' },
        { '@type': 'ListItem', position: 3, name: 'Dividend Declaration Board Resolution', item: pageUrl },
      ],
    },
  ],
}

export default function DividendResolutionPage() {
  return (
    <div className="min-h-dvh bg-slate-50 pb-20 dark:bg-slate-950">
      <JsonLd id="dividend-resolution-schema" data={jsonLd} />
      <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <nav aria-label="Breadcrumb" className="mx-auto flex max-w-6xl items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link><span aria-hidden="true">/</span>
          <Link href="/documents" className="hover:text-slate-900 dark:hover:text-white">Documents</Link><span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-slate-900 dark:text-slate-100">Dividend Board Resolution</span>
        </nav>
      </div>

      <header className="border-b border-slate-200 bg-white px-4 py-10 dark:border-slate-800 dark:bg-slate-900 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <ShieldCheck className="size-4" aria-hidden="true" /> India • Companies Act, 2013 • Section 123
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">Board Resolution for Dividend Declaration</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">Create a clear specimen for recommending a final dividend to members or declaring an interim dividend by the Board. Download an editable Word format or PDF, with the correct approval distinction and a practical compliance guide.</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
            {['Free to use', 'No login required', 'Final and interim formats', 'Word and PDF'].map(item => <span key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />{item}</span>)}
          </div>
          <a href="#generator" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Create my resolution <ArrowRight className="size-4" aria-hidden="true" /></a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 sm:py-12">
        <DividendResolutionClient />

        <section aria-labelledby="answer-heading" className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/20 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">Quick legal answer</p>
          <h2 id="answer-heading" className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">A board resolution should distinguish final and interim dividend</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300"><strong>Final dividend:</strong> the Board recommends the amount; members decide whether to declare it at the AGM. <strong>Interim dividend:</strong> the Board may declare it under Section 123(3) from the sources permitted by that section, subject to the company’s financial position and applicable requirements. This distinction changes the operative resolution wording.</p>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">This page and generator are for Indian companies. The formats used in Malaysia, Singapore and the Philippines are not interchangeable with this Indian specimen.</p>
        </section>

        <section aria-labelledby="sample-heading" className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(16rem,.75fr)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Sample wording</p>
            <h2 id="sample-heading" className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Sample Board Resolution for Dividend Declaration</h2>
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">Final dividend — recommendation by the Board</p>
              <p className="mt-2">“RESOLVED THAT, subject to approval of the members at the ensuing Annual General Meeting, a final dividend of Rs. [amount] per fully paid-up equity share of face value Rs. [face value] each for the financial year [year] be and is hereby recommended for declaration by the members.”</p>
              <p className="mt-4 font-semibold text-slate-900 dark:text-white">Interim dividend — declaration by the Board</p>
              <p className="mt-2">“RESOLVED THAT pursuant to section 123(3) and other applicable provisions of the Companies Act, 2013, an interim dividend of Rs. [amount] per fully paid-up equity share of face value Rs. [face value] each for the financial year [year] be and is hereby declared, subject to the company’s entitlement and compliance with applicable law.”</p>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Specimen extracts only. Complete supporting financial and shareholder particulars before adoption.</p>
            </div>
          </div>
          <aside className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white"><Landmark className="size-5 text-amber-700 dark:text-amber-400" aria-hidden="true" /><h3 className="font-bold">Quick reference</h3></div>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-semibold text-slate-800 dark:text-slate-200">Final dividend</dt><dd className="text-slate-600 dark:text-slate-400">Board recommends; members declare at AGM.</dd></div>
              <div><dt className="font-semibold text-slate-800 dark:text-slate-200">Interim dividend</dt><dd className="text-slate-600 dark:text-slate-400">Board declares under Section 123(3).</dd></div>
              <div><dt className="font-semibold text-slate-800 dark:text-slate-200">Separate bank account</dt><dd className="text-slate-600 dark:text-slate-400">Deposit declared dividend within 5 days (Section 123(4)).</dd></div>
              <div><dt className="font-semibold text-slate-800 dark:text-slate-200">Payment</dt><dd className="text-slate-600 dark:text-slate-400">Generally within 30 days of declaration (Section 127).</dd></div>
            </dl>
          </aside>
        </section>

        <section aria-labelledby="steps-heading">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Before signing</p>
          <h2 id="steps-heading" className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Dividend declaration compliance checklist</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ['Confirm lawful profits', 'Check Section 123, depreciation, prior losses and the applicable financial statements before proposing a dividend.'],
              ['Confirm who approves it', 'For final dividend, record a Board recommendation for member approval at the AGM. For interim dividend, record the Board declaration.'],
              ['Verify entitlement and amount', 'Reconcile paid-up shares, class rights, record date / entitlement date, and aggregate liability with the register and depository records.'],
              ['Check interim dividend limits', 'If the company incurred a loss in the current financial year up to the preceding quarter, apply the rate cap in the proviso to Section 123(3).'],
              ['Deposit and pay on time', 'Deposit the declared amount in a separate scheduled-bank account within five days and pay within the Section 127 period.'],
              ['Handle unpaid or unclaimed sums', 'Transfer unpaid or unclaimed dividend to the Unpaid Dividend Account as required by Section 124; maintain the related statements and follow-up.'],
              ['Check additional obligations', 'Review Articles, preference-share rights, tax withholding, sector-specific rules and, for listed entities, applicable SEBI LODR and exchange disclosure requirements.'],
              ['Record the decision', 'Keep the signed minutes / resolution, supporting financial papers, shareholder entitlement working and payment evidence with company records.'],
            ].map(([heading, body], index) => <li key={heading} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><span className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-400">Step {index + 1}</span><h3 className="mt-1 font-semibold text-slate-900 dark:text-white">{heading}</h3><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p></li>)}
          </ol>
        </section>

        <section aria-labelledby="circular-heading" className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <h2 id="circular-heading" className="text-2xl font-bold text-slate-900 dark:text-white">Can dividend be declared by circular resolution?</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">Use a duly convened Board meeting for an interim-dividend declaration. ICSI’s Secretarial Standard on Dividend (SS-3) says interim dividend should be declared at a Board meeting and not by circulation. A final dividend is not declared by the Board at all: the Board recommends it and members decide at the AGM. Apply the current version of the standard and the company’s Articles.</p>
        </section>

        <section aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="text-xl font-bold text-slate-900 dark:text-white">Official legal sources</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li><a className="font-medium text-blue-700 underline dark:text-blue-300" href="https://www.indiacode.nic.in/bitstream/123456789/2114/5/A2013-18.pdf?v=20260526072457" target="_blank" rel="noreferrer">Companies Act, 2013 — Sections 123 to 127 (India Code)</a></li>
            <li><a className="font-medium text-blue-700 underline dark:text-blue-300" href="https://www.mca.gov.in/Ministry/pdf/NCARules_Chapter8.pdf" target="_blank" rel="noreferrer">Companies (Declaration and Payment of Dividend) Rules, 2014 (MCA Gazette publication)</a></li>
            <li><a className="font-medium text-blue-700 underline dark:text-blue-300" href="https://www.icsi.edu/secretarial_standars/" target="_blank" rel="noreferrer">ICSI Secretarial Standards, including SS-3 on Dividend</a></li>
            <li><a className="font-medium text-blue-700 underline dark:text-blue-300" href="https://www.mca.gov.in/bin/ebook/dms/getdocument?doc=MTk1MTA5NDk0&docCategory=Accounting+Standards&type=open" target="_blank" rel="noreferrer">MCA — Indian Accounting Standard (Ind AS) 10, paragraphs 12–13</a></li>
          </ul>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Legal references reviewed for this specimen on 29 September 2026. Check later amendments, notifications, rules and applicable company-specific requirements before use.</p>
        </section>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold text-slate-900 dark:text-white">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-5 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {faqs.map(({ question, answer }) => <details key={question} className="py-4"><summary className="cursor-pointer font-semibold text-slate-900 marker:text-amber-700 dark:text-white">{question}</summary><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{answer}</p></details>)}
          </div>
        </section>

        <section className="rounded-xl bg-navy p-6 text-white sm:flex sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-bold">Need another company resolution?</h2><p className="mt-1 text-sm text-slate-200">Browse the free document library and related board resolution formats.</p></div>
          <Link href="/documents" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 sm:mt-0">Browse documents <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </section>
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">This specimen is general information and a drafting aid, not legal or tax advice, and not a prescribed MCA form. Have the final draft reviewed by a qualified professional familiar with the company’s Articles, financial position and applicable law.</p>
      </div>
    </div>
  )
}
