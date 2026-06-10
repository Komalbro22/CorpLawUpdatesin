'use client'

import { useState } from 'react'
import JsonLd from '@/components/JsonLd'
import CompanyFeeCalc from './components/CompanyFeeCalc'
import LLPFeeCalc from './components/LLPFeeCalc'
import MSMEFeeCalc from './components/MSMEFeeCalc'
import SEOContent from './components/SEOContent'
import FAQSection from './components/FAQSection'
import FeeTables from './components/FeeTables'

export default function ClientPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'llp' | 'msme'>('company')

  const calculatorJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'MCA Fee Calculator',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR'
        },
        description: 'Calculate MCA filing fees for Company and LLP forms including AOC-4, MGT-7, Form 8, Form 11, with late filing penalties and MSME interest calculations.',
        featureList: [
          '20+ MCA Forms Supported',
          'Late Filing Penalty Calculator',
          'State-wise Stamp Duty',
          'Multiple Company & LLP Types',
          'Instant Fee Breakdown'
        ],
      },
      {
        '@type': 'HowTo',
        name: 'How to Calculate MCA Filing Fees',
        description: 'Step-by-step guide to calculate MCA filing fees using our Free Calculator',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Select Entity Type',
            text: 'Choose between Company, LLP, or MSME from the main tabs.'
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Select Calculator Type',
            text: 'Choose from General Filing, Annual Returns, Share Capital, or Charges based on your filing requirement.'
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Enter Details',
            text: 'Select your specific company/LLP type, authorized capital, and delay in days if applicable.'
          },
          {
            '@type': 'HowToStep',
            position: 4,
            name: 'Get Fee Breakdown',
            text: 'Click Calculate Fee to view normal fees, additional fees, stamp duty, and total amount payable.'
          }
        ]
      }
    ]
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 pb-20">
      <JsonLd data={calculatorJsonLd as any} />

      {/* Hero Header */}
      <div className="bg-navy py-12 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-400/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            ✓ Updated for FY 2026-27
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-4">
            MCA Fees & Penalty Calculator
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Calculate exact ROC filing fees, ₹100/day late filing penalties, state-wise stamp duty, and MSME delayed payment interest instantly.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        
        {/* Main Entity Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-sm border border-b-0 border-slate-200 dark:border-slate-800 p-2 flex gap-2">
          <button
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm md:text-base transition-all ${
              activeTab === 'company' 
              ? 'bg-navy text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🏢 Companies
          </button>
          <button
            onClick={() => setActiveTab('llp')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm md:text-base transition-all ${
              activeTab === 'llp' 
              ? 'bg-navy text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🤝 LLPs
          </button>
          <button
            onClick={() => setActiveTab('msme')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm md:text-base transition-all ${
              activeTab === 'msme' 
              ? 'bg-navy text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🏭 MSMEs
          </button>
        </div>

        {/* Calculator Body Area */}
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-b-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-8 mb-16">
          {activeTab === 'company' && <CompanyFeeCalc />}
          {activeTab === 'llp' && <LLPFeeCalc />}
          {activeTab === 'msme' && <MSMEFeeCalc />}
        </div>
      </div>

      {/* SEO & Educational Content */}
      <div className="max-w-5xl mx-auto px-4">
        <FeeTables />
        <SEOContent />
        <FAQSection />
      </div>

    </div>
  )
}
