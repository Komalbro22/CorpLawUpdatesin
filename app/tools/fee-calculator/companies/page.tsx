import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import CompanyFAQ from './CompanyFAQ'
import { mcaForms } from '@/data/mca-forms'
import UnifiedCalculator from './UnifiedCalculator'

export const metadata: Metadata = {
  title: 'Company ROC Fee Calculator | Late Fee Penalty & Stamp Duty',
  description: 'Calculate ROC filing fees, ₹100/day late fee, and state-wise stamp duty for AOC-4, MGT-7, ADT-1, INC-20A, SH-7 & 20+ Company forms for FY 2026-27.',
  keywords: ['Company ROC fee calculator', 'AOC-4 late fee penalty', 'MGT-7 late fee', 'ROC penalty calculator', 'Stamp duty calculator MCA'],
  alternates: {
    canonical: 'https://www.corplawupdates.in/tools/fee-calculator/companies',
  },
}

const companyJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.corplawupdates.in/tools/fee-calculator/companies#softwareapplication',
      name: 'Company ROC Fee Calculator',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR'
      },
      description: 'Calculate indicative ROC filing fees, late penalties, and state-wise stamp duty for Private, Public, OPC and Small Companies.',
      featureList: [
        'General Forms (ADT-1, INC-22) Penalty',
        'Annual Returns (AOC-4, MGT-7) Late Fee',
        'Share Capital (SH-7) Stamp Duty',
        'Charge Forms (CHG-1, CHG-4) Ad Valorem'
      ]
    },
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
        { '@type': 'ListItem', position: 3, name: 'Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator' },
        { '@type': 'ListItem', position: 4, name: 'Company Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator/companies' }
      ]
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is the normal fee for filing Company ROC forms?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'For all companies (Private, Public, OPC and Small Companies), normal filing fees range from ₹200 to ₹600 depending on the authorised share capital under items 5 & 6, Table A of the Companies (Registration Offices and Fees) Rules, 2014.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How is the late fee calculated for AOC-4 and MGT-7?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Annual returns like AOC-4 and MGT-7 have an uncapped penalty of ₹100 per day. For example, if you are 30 days late, the penalty will be ₹3,000 in addition to the normal filing fee.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What happens if I delay filing general forms like ADT-1 or INC-22?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'General forms attract a multiplier-based penalty under Table B, Rule 12. ADT-1 (Section 139) uses the same multiplier table: 1× for ≤15 days late, 2× for ≤30 days, up to 12× for ≤270 days. Beyond 270 days, condonation of delay is required under Section 403.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How is stamp duty calculated for Share Capital (SH-7)?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Stamp duty for increasing authorized share capital is determined by your state. For example, Maharashtra charges 0.2% subject to a cap of ₹50 Lakhs, while Delhi charges 0.15%. Our calculator provides an indicative estimate based on your selected state.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the penalty for late filing of CHG-1?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'If CHG-1 (Creation of Charge) is delayed beyond 30 days, an ad valorem fee is charged. This fee is a percentage of the secured amount (0.05% for normal companies, up to a cap of ₹5,00,000) on top of the standard late fee multiplier.'
          }
        }
      ]
    }
  ]
}

function CompanySEO() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none mb-16">
      <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-6 border-b border-[#E2E8F0] dark:border-slate-800 pb-4">
        Understanding ROC Filing Fees and Penalties for Companies
      </h2>
      <p className="text-[#64748B] dark:text-slate-300 text-base leading-relaxed">
        Private Limited, Public Limited, OPCs, and Small Companies in India must adhere to strict filing deadlines set by the Ministry of Corporate Affairs (MCA). Failing to file statutory forms within the prescribed timeline incurs heavy penalties. The penalty structure is divided into two major categories: the <strong>flat ₹100/day penalty</strong> for annual returns, and the <strong>multiplier-based penalty</strong> for general forms.
      </p>

      <div className="my-10">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[#1D4ED8] dark:text-blue-400">📊</span>
          Normal Base Fees (Companies)
        </h3>
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm not-prose">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F1F5F9] dark:bg-slate-900/50 border-b border-[#E2E8F0] dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#64748B] dark:text-slate-300">Authorised Capital (₹)</th>
                <th className="px-4 py-3 font-semibold text-[#64748B] dark:text-slate-300">Normal Fee (All Companies)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800/50 bg-[#FFFFFF] dark:bg-slate-900">
              <tr className="bg-[#FFFFFF] even:bg-[#F8FAFC] dark:even:bg-slate-800/50"><td className="px-4 py-3">Up to ₹1 Lakh</td><td className="px-4 py-3 font-medium">₹ 200</td></tr>
              <tr className="bg-[#FFFFFF] even:bg-[#F8FAFC] dark:even:bg-slate-800/50"><td className="px-4 py-3">₹1 Lakh to ₹5 Lakhs</td><td className="px-4 py-3 font-medium">₹ 300</td></tr>
              <tr className="bg-[#FFFFFF] even:bg-[#F8FAFC] dark:even:bg-slate-800/50"><td className="px-4 py-3">₹5 Lakhs to ₹25 Lakhs</td><td className="px-4 py-3 font-medium">₹ 400</td></tr>
              <tr className="bg-[#FFFFFF] even:bg-[#F8FAFC] dark:even:bg-slate-800/50"><td className="px-4 py-3">₹25 Lakhs to ₹1 Crore</td><td className="px-4 py-3 font-medium">₹ 500</td></tr>
              <tr className="bg-[#FFFFFF] even:bg-[#F8FAFC] dark:even:bg-slate-800/50"><td className="px-4 py-3">More than ₹1 Crore</td><td className="px-4 py-3 font-medium">₹ 600</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mt-8 mb-4">
        AOC-4 and MGT-7 Late Filing Penalty
      </h3>
      <p className="text-[#64748B] dark:text-slate-300">
        Forms like AOC-4 (Financial Statements) and MGT-7 (Annual Return) do not follow the standard multiplier penalty. Instead, they attract an uncapped penalty of <strong>₹100 per day</strong>. A delay of one year can cost the company ₹36,500 in penalties alone per form.
      </p>
    </article>
  )
}

export default function CompaniesFeePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200 pb-20">
      <JsonLd data={companyJsonLd as any} />
      <div className="bg-[#0F172A] py-12 px-4 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <Link href="/tools/fee-calculator" className="text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6 inline-flex items-center gap-2">
            ← Back to Calculator Hub
          </Link>
          <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 text-[#16A34A] text-[0.75rem] font-bold px-[12px] py-[4px] rounded-full mb-5 uppercase tracking-wider block w-max">
            ✓ Updated for FY 2026-27
          </div>
          <h1 className="text-[2.25rem] font-bold text-white font-serif mb-4">
            Company ROC Fee & Penalty Calculators
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
            Select an MCA form below to calculate indicative ROC filing fees, late penalties, and state-wise stamp duty. Our programmatic calculators are tailored to specific form rules, including the ₹100/day penalties for annual filings.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10 -mt-8 mb-8">
        <UnifiedCalculator />
      </div>

      <div className="max-w-5xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mcaForms.map(form => (
            <Link 
              key={form.slug} 
              href={`/tools/fee-calculator/companies/${form.slug}`}
              className="bg-[#FFFFFF] dark:bg-slate-900 rounded-xl border border-[#E2E8F0] dark:border-slate-800 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-md hover:border-[#1D4ED8] dark:hover:border-blue-500 transition-all flex flex-col h-full group"
            >
              <div className="mb-4">
                <span className="bg-[#F1F5F9] dark:bg-slate-800 text-[#64748B] dark:text-slate-300 text-[0.75rem] font-bold px-[12px] py-[4px] rounded-full uppercase tracking-wider">
                  {form.category.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2 group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 transition-colors">
                {form.formNumber} — {form.formName}
              </h3>
              <p className="text-[#64748B] dark:text-slate-400 text-sm mt-auto">
                Due: {form.dueDate}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <CompanySEO />
        <CompanyFAQ />
        <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4 mt-8">
          Fees shown are indicative based on the Companies (Registration Offices and Fees) Rules, 2014 as amended. Always verify on the MCA portal before filing. This tool does not account for state stamp duty or professional charges.
        </p>
      </div>
    </div>
  )
}
