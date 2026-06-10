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

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const form = mcaForms.find(f => f.slug === params.slug)
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

export default function FormSpecificPage({ params }: { params: { slug: string } }) {
  const form = mcaForms.find(f => f.slug === params.slug)
  
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <JsonLd data={breadcrumbSchema as any} />
      <JsonLd data={faqSchema as any} />
      <JsonLd data={webAppSchema as any} />

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
            {form.formNumber} — {form.formName} Fee & Penalty Calculator (2026-27)
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-8">
            Calculate exact normal filing fees and late penalties for {form.formNumber} ({form.formName}) based on authorized capital and delay.
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
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Capital Slab</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Normal Fee</th>
                      {form.concessionApplies && <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">OPC/Small</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3">Up to 1 Lakh</td><td className="px-4 py-3 font-medium">₹200</td>{form.concessionApplies && <td className="px-4 py-3 text-green-600">₹50</td>}</tr>
                    <tr><td className="px-4 py-3">1L to 5L</td><td className="px-4 py-3 font-medium">₹300</td>{form.concessionApplies && <td className="px-4 py-3 text-green-600">₹100</td>}</tr>
                    <tr><td className="px-4 py-3">5L to 25L</td><td className="px-4 py-3 font-medium">₹400</td>{form.concessionApplies && <td className="px-4 py-3 text-green-600">₹150</td>}</tr>
                    <tr><td className="px-4 py-3">25L to 1Cr</td><td className="px-4 py-3 font-medium">₹500</td>{form.concessionApplies && <td className="px-4 py-3 text-green-600">₹200</td>}</tr>
                    <tr><td className="px-4 py-3">Above 1Cr</td><td className="px-4 py-3 font-medium">₹600</td>{form.concessionApplies && <td className="px-4 py-3 text-green-600">₹200</td>}</tr>
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
