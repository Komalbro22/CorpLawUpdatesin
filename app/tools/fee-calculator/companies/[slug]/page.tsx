import { mcaForms } from '@/data/mca-forms'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import FormSpecificCalc from './FormSpecificCalc'
import SPICePlusAdditions from './SPICePlusAdditions'

export function generateStaticParams() {
  return mcaForms.map((form) => ({
    slug: form.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const form = mcaForms.find(f => f.slug === slug)
  if (!form) return { title: 'Not Found' }

  return {
    title: form.metaTitle,
    description: form.metaDescription,
    keywords: form.aliases.join(', '),
    alternates: {
      canonical: `https://www.corplawupdates.in/tools/fee-calculator/companies/${form.slug}`,
    },
    openGraph: {
      title: form.metaTitle,
      description: form.ogDescription,
      url: `https://www.corplawupdates.in/tools/fee-calculator/companies/${form.slug}`,
      type: 'website'
    }
  }
}

export default async function FormSpecificPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const form = mcaForms.find(f => f.slug === slug)
  
  if (!form) {
    notFound()
  }

  // Generate Schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
      { '@type': 'ListItem', position: 3, name: 'Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator' },
      { '@type': 'ListItem', position: 4, name: 'Company Forms', item: 'https://www.corplawupdates.in/tools/fee-calculator/companies' },
      { '@type': 'ListItem', position: 5, name: form.formNumber, item: `https://www.corplawupdates.in/tools/fee-calculator/companies/${form.slug}` }
    ]
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: form.faqItems.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  }

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${form.formNumber} Fee Calculator`,
    url: `https://www.corplawupdates.in/tools/fee-calculator/companies/${form.slug}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    description: form.metaDescription
  }

  const howToSchema = form.slug === 'adt-1' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Form ADT-1 Filing Fees & Late Penalties on MCA V3',
    description: 'Step-by-step guide to calculating normal filing fees, Table B late fee multipliers, and statutory deadlines for Form ADT-1 auditor appointment.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Determine the Meeting & Appointment Date',
        text: 'Identify the date of the meeting where the auditor was appointed (AGM, EGM, or Board Meeting for first auditor/casual vacancy).'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Calculate the 15-Day Statutory Due Date',
        text: 'Form ADT-1 must be filed within 15 calendar days from the meeting date pursuant to Section 139(1) and Rule 4(2).'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Check Nominal Share Capital Bracket',
        text: 'Determine the normal base fee (₹200 to ₹600) based on authorized capital under Table A Items 5 & 6.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Apply Table B Delay Multiplier',
        text: 'If delayed, apply the Table B multiplier (1x for ≤15d, 2x for ≤30d, 4x for ≤60d, 6x for ≤90d, 10x for ≤180d, 12x for ≤270d).'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Verify Section 403 Condonation Requirement',
        text: 'If the delay exceeds 270 days, obtain prior Condonation of Delay from the Regional Director via Form CG-1 before filing on MCA V3.'
      }
    ]
  } : form.slug === 'chg-1' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Form CHG-1 Filing Fees & Ad Valorem Late Penalties on MCA V3',
    description: 'Step-by-step guide to calculating normal filing fees, Table B multipliers (3x/6x), ad valorem fees (0.025%/0.05% capped at ₹1L/₹5L), and Section 87 condonation for Form CHG-1 charge registration.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Identify the Date of Charge Creation or Modification',
        text: 'Determine the execution date of the sanction letter, loan agreement, or deed of hypothecation/mortgage (Day 0 of Chapter VI timeline).'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Verify the Initial 30-Day Statutory Window',
        text: 'Form CHG-1 filed within 30 days of creation attracts only the normal base filing fee (₹200 to ₹600) under Table A based on authorized share capital.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Calculate the First Extension Window (Days 31 to 60)',
        text: 'If delayed between 1 and 30 days beyond due date, pay the additional fee: 3× normal fee for Small Companies/OPCs or 6× normal fee for Other Companies.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Calculate the Second Extension Ad Valorem Fee (Days 61 to 120)',
        text: 'If delayed between 31 and 90 days, pay 3×/6× normal fee PLUS an Ad Valorem fee: 0.025% of secured amount (capped at ₹1,00,000) for Small/OPC or 0.05% of secured amount (capped at ₹5,00,000) for Others.'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Comply with Section 87 Hard Stop (> 120 Days from Creation)',
        text: 'If delayed beyond 120 days from creation (delay exceeds 90 days), direct ROC registration is legally barred under Section 77. The company must file Form CHG-8 with the Regional Director for condonation of delay.'
      }
    ]
  } : form.slug === 'aoc-4' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Form AOC-4 Filing Fees & Late Penalties on MCA V3',
    description: 'Step-by-step guide to calculating normal filing fees (Table A), flat ₹100/day uncapped late filing fee, 30-day AGM due date, OPC 180-day deadline, and Section 137(3) statutory penalties.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Determine Applicable AOC-4 Variant',
        text: 'Identify whether the company must file standard AOC-4 (standalone), AOC-4 CFS (has subsidiaries/JVs under Section 129(3)), AOC-4 XBRL (listed, paid-up capital ≥ ₹5 Cr, or turnover ≥ ₹100 Cr), or AOC-4 NBFC (Ind AS).'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Establish Statutory Due Date',
        text: 'For standard companies, determine the 30-day statutory due date from the AGM under Section 137(1) (standard: October 30). For One Person Companies (OPC), determine the 180-day deadline from FY closure under Section 137(1) third proviso (standard: September 27).'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Verify Cash Flow Statement Exemption',
        text: 'Check whether the company is exempt from attaching a Cash Flow Statement under the proviso to Section 2(40) (OPCs, Small Companies, Dormant Companies, and DPIIT Startups are exempt).'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Determine Nominal Share Capital Base Fee',
        text: 'Compute the Table A normal filing fee (₹200 to ₹600) based on authorized share capital bracket (or flat ₹200 for company without share capital).'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Calculate ₹100/Day Uncapped Delay Fee',
        text: 'If filing past the statutory due date, compute the additional late filing fee at flat ₹100 per day without upper ceiling under Table B Note Item 2.'
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Assess Section 137(3) Adjudication Exposure & 446B Relief',
        text: 'Evaluate indicative civil penalty exposure: Base ₹10,000 + ₹100/day continuing default (Company cap: ₹2 Lakhs; Officer cap: ₹50,000). Apply 50% discount if eligible for Section 446B relief.'
      }
    ]
  } : (form.slug === 'mgt-7' || form.slug === 'mgt-7a') ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Calculate Form ${form.formNumber} Annual Return Filing Fees & Late Penalties on MCA V3`,
    description: `Step-by-step guide to calculating normal filing fees (Table A), ₹100/day uncapped late filing fee, 60-day AGM deadline, and Section 92(5) adjudication penalties for Form ${form.formNumber}.`,
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Identify the Date of the AGM',
        text: 'Determine the date on which the Annual General Meeting (AGM) was held (Day 0), or for OPCs, the deemed resolution adoption date pursuant to Section 96 and Section 122.'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Calculate the 60-Day Statutory Due Date',
        text: 'Under Section 92(4), Form MGT-7/MGT-7A must be filed within 60 calendar days from the AGM date (standard due date: 29th November for 30th September AGM).'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Determine Small Company Qualification (MGT-7 vs MGT-7A)',
        text: 'Assess paid-up capital (≤ ₹10 Cr) and turnover (≤ ₹100 Cr) under Section 2(85) [amended by G.S.R. 880(E)]. Qualified Small Companies and OPCs file Form MGT-7A; others file Form MGT-7.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Determine Nominal Share Capital Base Fee',
        text: 'Check authorized share capital bracket under Table A (₹200 to ₹600) to find the normal government filing fee.'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Calculate ₹100/Day Uncapped Delay Fee & Section 92(5) Penalty',
        text: 'If filing past the 60-day deadline, compute additional fee at flat ₹100 per day without upper cap on MCA V3, and check potential Section 92(5) ROC adjudication exposure (with Section 446B relief if eligible).'
      }
    ]
  } : null

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <JsonLd data={breadcrumbSchema as any} />
      <JsonLd data={faqSchema as any} />
      <JsonLd data={webAppSchema as any} />
      {howToSchema && <JsonLd data={howToSchema as any} />}

      {/* 4A - Breadcrumb */}
      <div className="bg-navy pt-6 px-4">
        <div className="max-w-5xl mx-auto">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><span className="mx-2">›</span></li>
              <li><Link href="/tools" className="hover:text-white transition-colors">Tools</Link></li>
              <li><span className="mx-2">›</span></li>
              <li><Link href="/tools/fee-calculator" className="hover:text-white transition-colors">Fee Calculator</Link></li>
              <li><span className="mx-2">›</span></li>
              <li><Link href="/tools/fee-calculator/companies" className="hover:text-white transition-colors">Company Forms</Link></li>
              <li><span className="mx-2">›</span></li>
              <li className="text-slate-200 font-medium" aria-current="page">{form.formNumber}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* 4B - Hero Section */}
      <div className="bg-navy py-12 px-4 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <span className="bg-green-400/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              ✓ Updated for FY 2026-27
            </span>
            <span className="bg-blue-400/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {form.category.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-[2.25rem] font-bold font-serif text-white mb-4">
            {form.slug === 'adt-1'
              ? 'ADT-1 Late Fees & Penalty Calculator (FY 2026-27) — Auditor Appointment'
              : form.slug === 'chg-1'
              ? 'CHG-1 Late Fees & Ad Valorem Calculator (FY 2026-27) — Charge Creation'
              : form.slug === 'mgt-7'
              ? 'MGT-7 Late Fees & Penalty Calculator (FY 2026-27) — Annual Return'
              : form.slug === 'mgt-7a'
              ? 'MGT-7A Late Fees & Penalty Calculator (FY 2026-27) — Small Company & OPC'
              : form.slug === 'aoc-4'
              ? 'AOC-4 Late Fees & Penalty Calculator (FY 2026-27) — AOC Form Fees on MCA V3'
              : `${form.formNumber} — ${form.formName} Fee & Penalty Calculator (2026-27)`}
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-8">
            {form.slug === 'adt-1'
              ? 'Calculate statutory normal filing fees, 15-day due date from AGM/EGM, and Table B late fee multipliers (1× to 12×) for Form ADT-1 on MCA V3.'
              : form.slug === 'chg-1'
              ? 'Calculate exact normal filing fees, 30-60-120 day Section 77 timelines, 3×/6× extension multipliers, and ad valorem penalties (up to ₹5 Lakhs) for Form CHG-1 on MCA V3.'
              : form.slug === 'mgt-7'
              ? 'Calculate exact normal filing fees, 60-day AGM statutory deadlines, ₹100/day uncapped late fees, Form MGT-8 PCS certification, and Section 92(5) adjudication penalties on MCA V3.'
              : form.slug === 'mgt-7a'
              ? 'Calculate abridged annual return fees, 60-day due dates, ₹100/day late fees, Small Company limits (₹10 Cr / ₹100 Cr), and Section 446B 50% penalty relief for OPCs and Small Companies on MCA V3.'
              : form.slug === 'aoc-4'
              ? 'Calculate exact MCA V3 Form AOC-4 fees, Table A normal filing fees (₹200–₹600), ₹100/day uncapped late filing fee, OPC 180-day deadline, and Section 137(3) statutory penalties for FY 2026-27.'
              : `Calculate exact normal filing fees and late penalties for ${form.formNumber} (${form.formName}) based on authorized capital and delay.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-300">
              📅 <span className="font-semibold text-white ml-1">Due:</span> {form.dueDate}
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-300">
              ⚖️ <span className="font-semibold text-white ml-1">Penalty:</span> {form.penaltyRate}
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-300">
              📋 <span className="font-semibold text-white ml-1">Under:</span> {form.section}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 mb-16">
        {/* Princeton GEO Direct Answer Block (58 Words) */}
        {form.slug === 'aoc-4' && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 border-l-4 border-l-blue-600 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>⚡</span> Fast Statutory Summary • MCA V3 Portal
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              Form AOC-4 is the statutory electronic return for filing audited financial statements with the Registrar of Companies under Section 137 of the Companies Act, 2013. Normal filing fees range from ₹200 to ₹600 based on nominal share capital under Table A. Delayed filings attract a flat, uncapped statutory additional fee of ₹100 per day on MCA21 V3 portal.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Section 137(1) Due Date: 30 Days from AGM</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ OPC Deadline: 180 Days from FY Close</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Section 446B: 50% Penalty Relief</span>
            </div>
          </div>
        )}

        {/* 4C - Calculator */}
        <FormSpecificCalc form={form} />
      </div>

      <div className="max-w-5xl mx-auto px-4 mb-20">
        {/* 4D - Quick Reference Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">📌</span>
              Key Facts
            </h3>
            <ul className="space-y-4">
              <li className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Filed By</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{form.filedBy.join(', ')}</span>
              </li>
              <li className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Due Date</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{form.dueDate}</span>
              </li>
              <li className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Section Reference</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{form.section}</span>
              </li>
              <li className="flex flex-col">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Concessional Fee Applies?</span>
                <span className={`font-bold ${form.concessionApplies ? 'text-green-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {form.concessionApplies ? 'Yes (OPC / Small Company)' : 'No'}
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">📊</span>
              Fee Schedule
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              {form.normalFeeStructure === 'capital_slab' ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Nominal Capital Bracket</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Normal Filing Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3">Less than ₹1,00,000</td><td className="px-4 py-3 font-medium">₹200</td></tr>
                    <tr><td className="px-4 py-3">₹1,00,000 or more but less than ₹5,00,000</td><td className="px-4 py-3 font-medium">₹300</td></tr>
                    <tr><td className="px-4 py-3">₹5,00,000 or more but less than ₹25,00,000</td><td className="px-4 py-3 font-medium">₹400</td></tr>
                    <tr><td className="px-4 py-3">₹25,00,000 or more but less than ₹1 crore</td><td className="px-4 py-3 font-medium">₹500</td></tr>
                    <tr><td className="px-4 py-3">₹1 crore or more</td><td className="px-4 py-3 font-medium">₹600</td></tr>
                    <tr><td className="px-4 py-3 text-slate-500 italic">Company not having share capital</td><td className="px-4 py-3 font-medium">₹200</td></tr>
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-slate-600 dark:text-slate-400">
                  This form uses a {form.normalFeeStructure} fee structure. See calculator above for exact values.
                </div>
              )}
            </div>
          </div>
        </div>

        {form.slug === 'spice-plus' && <SPICePlusAdditions />}

        {/* 4E - Educational Content */}
        <article className="prose prose-slate dark:prose-invert prose-lg max-w-none mb-16">
          <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-4">What is {form.formNumber}?</h2>
          <div dangerouslySetInnerHTML={{ __html: form.contentSections.whatIsThisForm }} />

          <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-4">Who Must File {form.formNumber}?</h2>
          <div dangerouslySetInnerHTML={{ __html: form.contentSections.whoMustFile }} />

          <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-4">{form.formNumber} Due Date & Timeline</h2>
          <div dangerouslySetInnerHTML={{ __html: form.contentSections.dueDateExplained }} />

          <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-4">Consequences of Late Filing {form.formNumber}</h2>
          <div dangerouslySetInnerHTML={{ __html: form.contentSections.consequencesOfDelay }} />
        </article>

        {/* AOC-4 Dedicated Statutory Master Tables */}
        {form.slug === 'aoc-4' && (
          <div className="space-y-12 mb-16">
            {/* Table 1: Normal Fees */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📋</span> Table A: Normal Filing Fee Schedule (Items 5 & 6)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Statutory base fee payable upon filing Form AOC-4, AOC-4 CFS, or AOC-4 XBRL on MCA21 V3 portal based on authorized capital.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nominal / Authorized Capital Bracket</th>
                      <th className="px-4 py-3 font-semibold">Normal Filing Fee</th>
                      <th className="px-4 py-3 font-semibold">Statutory Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-medium">Less than ₹1,00,000</td><td className="px-4 py-3 font-bold text-blue-600">₹200</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹1,00,000 to ₹4,99,999</td><td className="px-4 py-3 font-bold text-blue-600">₹300</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹5,00,000 to ₹24,99,999</td><td className="px-4 py-3 font-bold text-blue-600">₹400</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹25,00,000 to ₹99,99,999</td><td className="px-4 py-3 font-bold text-blue-600">₹500</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹1,00,00,000 or more (≥ ₹1 Crore)</td><td className="px-4 py-3 font-bold text-blue-600">₹600</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30"><td className="px-4 py-3 font-medium italic">Company not having share capital</td><td className="px-4 py-3 font-bold text-blue-600">₹200</td><td className="px-4 py-3 text-slate-500">Table A, Item 6, Fees Rules 2014</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: ₹100/day Uncapped Delay Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⏱️</span> Form AOC-4 Late Fee Calculation Matrix (₹100/Day Uncapped)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Under Table B (Note Item 2), additional filing fees accrue at flat ₹100 per day indefinitely without any maximum ceiling on MCA V3.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Delay Period Beyond Due Date</th>
                      <th className="px-4 py-3 font-semibold">Late Fee Formula</th>
                      <th className="px-4 py-3 font-semibold">Additional Fee Amount</th>
                      <th className="px-4 py-3 font-semibold">Filing Remarks & Risk Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-medium">0 Days (Filed on or before due date)</td><td className="px-4 py-3">0 × ₹100</td><td className="px-4 py-3 font-bold text-green-600">₹0</td><td className="px-4 py-3 text-slate-500">Fully compliant with Section 137(1)</td></tr>
                    <tr><td className="px-4 py-3 font-medium">15 Days Delay</td><td className="px-4 py-3">15 × ₹100</td><td className="px-4 py-3 font-bold text-amber-600">₹1,500</td><td className="px-4 py-3 text-slate-500">Minor delay; portal fee payable online</td></tr>
                    <tr><td className="px-4 py-3 font-medium">30 Days Delay (1 Month)</td><td className="px-4 py-3">30 × ₹100</td><td className="px-4 py-3 font-bold text-amber-600">₹3,000</td><td className="px-4 py-3 text-slate-500">MGT-7 due date typically coincides here</td></tr>
                    <tr><td className="px-4 py-3 font-medium">60 Days Delay (2 Months)</td><td className="px-4 py-3">60 × ₹100</td><td className="px-4 py-3 font-bold text-amber-600">₹6,000</td><td className="px-4 py-3 text-slate-500">Increased risk of ROC inquiry notice</td></tr>
                    <tr><td className="px-4 py-3 font-medium">90 Days Delay (3 Months)</td><td className="px-4 py-3">90 × ₹100</td><td className="px-4 py-3 font-bold text-amber-600">₹9,000</td><td className="px-4 py-3 text-slate-500">Section 137(3) penalty exposure grows</td></tr>
                    <tr><td className="px-4 py-3 font-medium">180 Days Delay (6 Months)</td><td className="px-4 py-3">180 × ₹100</td><td className="px-4 py-3 font-bold text-red-600">₹18,000</td><td className="px-4 py-3 text-slate-500">Severe ongoing statutory default</td></tr>
                    <tr className="bg-red-50/40 dark:bg-red-950/20"><td className="px-4 py-3 font-medium text-red-700 dark:text-red-400">365 Days Delay (1 Full Year)</td><td className="px-4 py-3">365 × ₹100</td><td className="px-4 py-3 font-bold text-red-600">₹36,500</td><td className="px-4 py-3 text-red-600">Year 1 of Section 164(2)(a) 3-year clock</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: Section 137(3) Penalty vs Section 446B Relief */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⚖️</span> Section 137(3) Civil Adjudication Penalties vs Section 446B Relief
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of statutory adjudication exposure under Section 137(3) (as amended by Companies Act 2020) and concessional caps under Section 446B.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Liable Person / Entity</th>
                      <th className="px-4 py-3 font-semibold">Standard Statutory Formula</th>
                      <th className="px-4 py-3 font-semibold">Standard Maximum Cap</th>
                      <th className="px-4 py-3 font-semibold">Section 446B Concessional Cap (Small Co/OPC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">The Company</td>
                      <td className="px-4 py-3">₹10,000 + ₹100/day after 1st day</td>
                      <td className="px-4 py-3 font-bold text-red-600">₹2,00,000</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹1,00,000 (50% Relief)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">MD / CFO / In-Charge Director</td>
                      <td className="px-4 py-3">₹10,000 + ₹100/day after 1st day</td>
                      <td className="px-4 py-3 font-bold text-red-600">₹50,000 per person</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹25,000 per person (50% Relief)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">All Directors (if no MD/CFO)</td>
                      <td className="px-4 py-3">₹10,000 + ₹100/day per director</td>
                      <td className="px-4 py-3 font-bold text-red-600">₹50,000 per director</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹25,000 per director (50% Relief)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 4: Form AOC-4 Variants Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📑</span> Form AOC-4 Variants: Which Form Applies to Your Company?
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of the 4 statutory variants of Form AOC-4 on MCA21 V3 portal.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Form Code</th>
                      <th className="px-4 py-3 font-semibold">Form Title</th>
                      <th className="px-4 py-3 font-semibold">Applicability Criteria</th>
                      <th className="px-4 py-3 font-semibold">Key Statutory Attachment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">AOC-4</td>
                      <td className="px-4 py-3 font-medium">Standalone Financial Statements</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">All companies not mandated for XBRL/Ind AS</td>
                      <td className="px-4 py-3 text-slate-500">Balance sheet, P&L, Board report, Auditor report</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">AOC-4 CFS</td>
                      <td className="px-4 py-3 font-medium">Consolidated Financial Statements</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Companies having ≥ 1 subsidiary, JV, or associate (Sec 129(3))</td>
                      <td className="px-4 py-3 text-slate-500">Consolidated financials & Form AOC-1</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">AOC-4 XBRL</td>
                      <td className="px-4 py-3 font-medium">Financial Statements in XBRL</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Listed, Capital ≥ ₹5 Cr, Turnover ≥ ₹100 Cr, or Ind AS</td>
                      <td className="px-4 py-3 text-slate-500">XBRL instance document validated via MCA tool</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">AOC-4 NBFC</td>
                      <td className="px-4 py-3 font-medium">NBFC Financials (Ind AS)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">NBFCs complying with Indian Accounting Standards</td>
                      <td className="px-4 py-3 text-slate-500">Ind AS compliant standalone & consolidated financials</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 5: AOC-4 vs MGT-7 Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>🔄</span> AOC-4 vs MGT-7: Key Statutory Differences
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparative matrix between the two principal annual ROC compliance filings.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Feature / Parameter</th>
                      <th className="px-4 py-3 font-semibold">Form AOC-4</th>
                      <th className="px-4 py-3 font-semibold">Form MGT-7 / MGT-7A</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Subject Matter</td><td className="px-4 py-3">Audited Financial Statements & Accounts</td><td className="px-4 py-3">Annual Return (Shareholding, Directors, Governance)</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Governing Section</td><td className="px-4 py-3 font-medium">Section 137, Companies Act 2013</td><td className="px-4 py-3 font-medium">Section 92, Companies Act 2013</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Statutory Due Date</td><td className="px-4 py-3 font-bold text-blue-600">Within 30 days of AGM (30th October)</td><td className="px-4 py-3 font-bold text-purple-600">Within 60 days of AGM (29th November)</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">OPC Statutory Due Date</td><td className="px-4 py-3">Within 180 days of FY closure (27th Sept)</td><td className="px-4 py-3">Within 60 days of deemed adoption</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">MCA V3 Late Filing Fee</td><td className="px-4 py-3">Flat ₹100 per day (Uncapped)</td><td className="px-4 py-3">Flat ₹100 per day (Uncapped)</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Small Company Form</td><td className="px-4 py-3">Form AOC-4 (Cash flow exempt)</td><td className="px-4 py-3">Form MGT-7A (Abridged annual return)</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Civil Penalty Section</td><td className="px-4 py-3">Section 137(3) (Co: ₹2L, Off: ₹50k)</td><td className="px-4 py-3">Section 92(5) (Co: ₹2L, Off: ₹50k)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4F - Worked Example */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-600 p-6 md:p-8 rounded-r-2xl mb-16">
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-4">Fee Calculation Example</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: form.contentSections.workedExample }} />
        </div>

        {/* 10B - Filing Guide Panel */}
        {form.filingGuides && form.filingGuides.length > 0 && (
          <div className="mb-16">
            <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-1">
              Detailed Filing Guide for {form.formNumber}
            </h2>
            <p className="text-sm text-slate-500 mb-6">Step-by-step guidance to complement this calculator</p>
            <div className="flex flex-col gap-4">
              {form.filingGuides.map((guide, i) => (
                <div key={i} className="bg-[#EFF6FF] dark:bg-slate-900 border-l-[3px] border-[#1D4ED8] rounded-r-xl p-6 flex flex-col gap-2">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <h3 className="text-lg font-bold text-navy dark:text-white flex items-center gap-2">
                      <span>📄</span> {guide.title}
                    </h3>
                    {guide.isOfficial && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap">
                        CorpLawUpdates Guide
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">{guide.summary}</p>
                  <div className="mt-4 flex justify-between items-center text-sm font-medium pt-4 border-t border-blue-100 dark:border-slate-800">
                    <span className="text-slate-500">
                      Published: {new Date(guide.publishedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <Link href={guide.slug} className="text-[#1D4ED8] dark:text-blue-400 hover:underline font-bold">
                      Read Full Guide →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4G - FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {form.faqItems.map((faq, index) => (
              <details key={index} className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl">
                  {faq.question}
                  <span className="transition group-open:rotate-180 text-slate-400">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-400">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* 4H - Related & Cross Links */}
        <div className="mb-16 border-t border-slate-200 dark:border-slate-800 pt-12">
          <h3 className="text-xl font-bold text-navy dark:text-white mb-6">Often filed together with:</h3>
          <div className="flex flex-wrap gap-4 mb-10">
            {[...form.relatedForms, ...form.filedTogetherWith].filter((val, i, arr) => arr.indexOf(val) === i).map(slug => {
              const rel = mcaForms.find(f => f.slug === slug)
              if (!rel) return null
              return (
                <Link key={slug} href={`/tools/fee-calculator/companies/${slug}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{rel.formNumber}</span>
                  <span className="text-slate-500">— {rel.formName}</span>
                </Link>
              )
            })}
          </div>

          <h3 className="text-xl font-bold text-navy dark:text-white mb-6">Other calculators:</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/tools/fee-calculator/llp" className="bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 font-semibold px-6 py-3 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200 dark:border-teal-800">
              LLP Penalty Calculator →
            </Link>
            <Link href="/tools/fee-calculator/msme" className="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 font-semibold px-6 py-3 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200 dark:border-purple-800">
              MSME Interest Calculator →
            </Link>
          </div>
        </div>
      </div>

      {/* 4I - CTA Strip */}
      <div className="bg-slate-100 dark:bg-slate-900 py-12 border-t border-slate-200 dark:border-slate-800 text-center px-4">
        <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Need to calculate for a different company form?</h2>
        <Link href="/tools/fee-calculator/companies" className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors">
          View All Company Calculators
        </Link>
      </div>
    </div>
  )
}
