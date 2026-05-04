import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import NewsletterWidget from '@/components/NewsletterWidget'

import JsonLd from '@/components/JsonLd'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Compliance Calendar 2026-27 — MCA SEBI RBI Income Tax Due Dates',
  description: 'Complete compliance deadline calendar for FY 2026-27. MCA filing dates, SEBI LODR deadlines, RBI FEMA due dates, Income Tax due dates for Indian companies and CS professionals.',
  keywords: [
    'compliance calendar 2026',
    'MCA filing due dates 2026',
    'SEBI compliance calendar 2026',
    'company compliance deadlines India',
    'CS professional compliance dates',
    'MGT-7 due date 2026',
    'AOC-4 due date 2026',
    'DIR-3 KYC due date 2026',
    'income tax due dates companies 2026',
    'FEMA compliance dates 2026',
  ],
  alternates: { canonical: 'https://www.corplawupdates.in/calendar' },
  openGraph: {
    title: 'Compliance Calendar 2026-27 — All MCA SEBI RBI Due Dates',
    description: 'Complete compliance deadline calendar for Indian companies. MCA, SEBI, RBI, Income Tax due dates in one place.',
    url: 'https://www.corplawupdates.in/calendar',
  },
}

async function getCalendarEntries() {
  const { data } = await supabase
    .from('compliance_calendar')
    .select('*')
    .order('due_date_sort', { ascending: true, nullsFirst: false })
  return data || []
}

function TableSection({
    title,
    color,
    dot,
    headers,
    rows,
}: {
    title: string
    color: string
    dot: string
    headers: string[]
    rows: React.ReactNode[][]
}) {
    return (
        <section>
            <h2 className="text-2xl font-heading font-bold text-navy 
                     mb-4 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${dot} inline-block`} />
                {title}
            </h2>
            <div className="overflow-x-auto rounded-xl border 
                      border-slate-200 shadow-sm">
                <table className="w-full text-sm min-w-[640px]">
                    <thead>
                        <tr className={color}>
                            {headers.map((h) => (
                                <th key={h} className="text-left px-4 py-3 
                                       font-semibold text-white">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => {
                            let rowBg = i % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                            const dateCell = row[2];
                            
                            let dateStr = '';
                            if (typeof dateCell === 'string') {
                                dateStr = dateCell;
                            } else if (React.isValidElement(dateCell)) {
                                const element = dateCell as React.ReactElement<{ children?: unknown }>;
                                if (typeof element.props.children === 'string') {
                                    dateStr = element.props.children;
                                }
                            }
                            
                            if (dateStr.includes('May 2026') || dateStr.includes('June 2026')) {
                                rowBg = 'bg-amber-100';
                            } else if (dateStr.includes('July 2026')) {
                                rowBg = 'bg-yellow-50';
                            }

                            return (
                                <tr key={i} className={rowBg}>
                                    {row.map((cell, j) => (
                                        <td key={j} className={`px-4 py-3 ${j === 0
                                                ? 'font-semibold text-blue-700 whitespace-nowrap'
                                                : j === row.length - 1 && headers.includes('Penalty')
                                                    ? 'text-red-600 font-medium whitespace-nowrap'
                                                    : 'text-slate-700'
                                            }`}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

interface CalendarEntry {
    category: string
    form_name: string
    compliance: string
    regulation: string
    due_date: string
    applicable_to: string
    penalty: string
    is_active: boolean
    notes: string
}

export default async function CalendarPage() {
    const entries = await getCalendarEntries()
    const activeEntries = entries.filter((e: CalendarEntry) => e.is_active !== false)

    const mcaData = activeEntries
        .filter((e: CalendarEntry) => e.category === 'MCA')
        .map((e: CalendarEntry) => [
            e.form_name || e.compliance,
            e.compliance,
            e.due_date,
            e.applicable_to || '—',
            e.penalty || '—'
        ])

    const sebiData = activeEntries
        .filter((e: CalendarEntry) => e.category === 'SEBI')
        .map((e: CalendarEntry) => [
            e.compliance,
            e.regulation || e.compliance,
            e.due_date,
            e.applicable_to || '—'
        ])

    const rbiData = activeEntries
        .filter((e: CalendarEntry) => e.category === 'RBI-FEMA')
        .map((e: CalendarEntry) => [
            e.form_name || e.compliance,
            e.compliance,
            e.due_date,
            e.applicable_to || '—'
        ])

    const incomeTaxData = activeEntries
        .filter((e: CalendarEntry) => e.category === 'Income Tax')
        .map((e: CalendarEntry) => [
            e.form_name || e.compliance,
            e.compliance,
            e.due_date,
            e.applicable_to || '—',
            e.penalty || '—'
        ])

    return (
        <div>
            {/* HERO */}
            <div className="bg-navy py-12 px-4 text-center">
                <h1 className="text-3xl md:text-4xl font-heading 
                       font-bold text-white mb-3">
                    Compliance Calendar 2026
                </h1>
                <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                    Key compliance deadlines under Companies Act,
                    SEBI LODR, FEMA and RBI regulations
                </p>
                <div className="flex items-center justify-center 
                        gap-4 mt-6 flex-wrap">
                    <span className="text-sm text-amber-400 font-medium">
                        📅 Updated for FY 2026-27
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-sm text-slate-300">
                        Free for CS Professionals & Corporate Lawyers
                    </span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

                {/* DISCLAIMER */}
                <div className="space-y-2">
                    <div className="bg-amber-50 border border-amber-200 
                            rounded-xl p-4 flex gap-3 items-start">
                        <span className="text-xl flex-shrink-0">⚠️</span>
                        <p className="text-amber-800 text-sm leading-relaxed">
                            <strong>Disclaimer:</strong> All dates are indicative
                            and subject to regulatory extensions, amendments or
                            circulars issued by MCA, SEBI or RBI from time to time.
                            Always verify with official government portals before
                            acting on any deadline. This is not legal advice.
                        </p>
                    </div>
                    <p className="text-xs text-slate-400 text-right">
                        Last verified: April 2026 | 
                        Source: MCA, SEBI, RBI official portals
                    </p>
                </div>

                {/* QUICK LINKS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'MCA Deadlines', href: '#mca', color: 'bg-blue-50 border-blue-200 text-blue-700', icon: '🏛️' },
                        { label: 'SEBI Deadlines', href: '#sebi', color: 'bg-green-50 border-green-200 text-green-700', icon: '📈' },
                        { label: 'RBI / FEMA', href: '#rbi', color: 'bg-purple-50 border-purple-200 text-purple-700', icon: '🏦' },
                        { label: 'Latest Updates', href: '/updates', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: '📋' },
                        { label: 'Income Tax', href: '#incometax', color: 'bg-orange-50 border-orange-200 text-orange-700', icon: '📊' },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-2 p-4 rounded-xl 
                         border font-medium text-sm 
                         hover:shadow-md transition-shadow
                         ${item.color}`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* MCA TABLE */}
                <div id="mca">
                    <TableSection
                        title="MCA — Companies Act Compliance"
                        color="bg-navy"
                        dot="bg-blue-500"
                        headers={['Form', 'Compliance', 'Due Date', 'Applicable To', 'Penalty']}
                        rows={mcaData}
                    />
                </div>

                {/* SEBI TABLE */}
                <div id="sebi">
                    <TableSection
                        title="SEBI — Listed Company Compliance"
                        color="bg-green-700"
                        dot="bg-green-500"
                        headers={['Compliance', 'Regulation', 'Due Date', 'Applicable To']}
                        rows={sebiData}
                    />
                </div>

                {/* RBI TABLE */}
                <div id="rbi">
                    <TableSection
                        title="RBI — FEMA Compliance"
                        color="bg-purple-800"
                        dot="bg-purple-500"
                        headers={['Form', 'Compliance', 'Due Date', 'Applicable To']}
                        rows={rbiData}
                    />
                </div>

                {/* INCOME TAX TABLE */}
                <div id="incometax">
                    <TableSection
                        title="📊 Income Tax Compliance"
                        color="bg-orange-600"
                        dot="bg-orange-500"
                        headers={['Compliance', 'Description', 'Due Date', 'Applicable To', 'Penalty']}
                        rows={incomeTaxData}
                    />
                </div>

                {/* USEFUL LINKS */}
                <section className="bg-slate-50 rounded-2xl p-6">
                    <h3 className="text-xl font-heading font-bold 
                         text-navy mb-4">
                        Official Portals for Verification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { name: 'MCA21 Portal', url: 'https://www.mca.gov.in', desc: 'All company filings and circulars' },
                            { name: 'SEBI Portal', url: 'https://www.sebi.gov.in', desc: 'Listed company regulations' },
                            { name: 'RBI / FIRMS', url: 'https://firms.rbi.org.in', desc: 'FEMA filings and reporting' },
                        ].map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col p-4 bg-white rounded-xl 
                           border border-slate-200 
                           hover:border-amber-400 
                           hover:shadow-md transition-all"
                            >
                                <span className="font-semibold text-navy text-sm">
                                    {link.name} ↗
                                </span>
                                <span className="text-xs text-slate-500 mt-1">
                                    {link.desc}
                                </span>
                            </a>
                        ))}
                    </div>
                </section>

                {/* NEWSLETTER CTA */}
                <section className="bg-navy rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-heading font-bold 
                         text-white mb-2">
                        Never Miss a Compliance Deadline
                    </h3>
                    <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                        Get weekly regulatory updates and deadline reminders
                        from MCA, SEBI and RBI. Free forever.
                    </p>
                    <div className="max-w-md mx-auto">
                        <NewsletterWidget />
                    </div>
                </section>

                <JsonLd data={{
                  '@context': 'https://schema.org',
                  '@type': 'Dataset',
                  name: 'India Corporate Law Compliance Calendar 2026',
                  description: 'Complete compliance deadline calendar for FY 2026-27 covering MCA, SEBI, RBI, FEMA and Income Tax filings.',
                  url: 'https://www.corplawupdates.in/calendar',
                  license: 'https://creativecommons.org/licenses/by/4.0/',
                  isAccessibleForFree: true,
                  keywords: [
                    'compliance calendar 2026',
                    'MCA filing deadlines',
                    'SEBI compliance dates',
                    'RBI FEMA deadlines',
                    'income tax due dates India',
                  ],
                  creator: {
                    '@type': 'Organization',
                    name: 'CorpLawUpdates.in',
                    url: 'https://www.corplawupdates.in',
                  },
                  temporalCoverage: '2026',
                  spatialCoverage: {
                    '@type': 'Place',
                    name: 'India',
                  },
                  inLanguage: 'en-IN',
                  dateModified: new Date().toISOString().split('T')[0],
                }} />

                <JsonLd data={{
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'What is the due date for DIR-3 KYC in 2026?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'The due date for DIR-3 KYC Web filing in 2026 is 30 September 2026. Late filing attracts a fee of ₹5,000.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What is the due date for MGT-7 annual return?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MGT-7 annual return must be filed within 60 days from the date of Annual General Meeting (AGM). Penalty for late filing is ₹100 per day.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What is the due date for FLA return 2026?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'The FLA (Foreign Liabilities and Assets) Return for FY 2025-26 must be filed by 15 July 2026 on the RBI FIRMS portal.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What is the MSME-1 due date 2026?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MSME-1 is filed half-yearly. The October 2026 deadline is 31 October 2026. The April 2026 deadline has passed.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'When is the income tax return due date for companies 2026?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'The Income Tax Return (ITR) filing due date for companies for FY 2025-26 is 31 October 2026.',
                      },
                    },
                  ],
                }} />

            </div>
        </div>
    )
}
