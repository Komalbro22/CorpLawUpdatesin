import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import NewsletterWidget from '@/components/NewsletterWidget'

export const metadata: Metadata = {
  title: 'Compliance Calendar 2026 — MCA SEBI RBI Deadlines',
  description: 'Complete compliance deadline calendar for FY 2026-27. MCA filing dates, SEBI LODR deadlines, RBI FEMA due dates and Income Tax dates for companies.',
  alternates: {
    canonical: 'https://www.corplawupdates.in/calendar',
  },
  keywords: [
    'compliance calendar 2026',
    'MCA filing deadlines 2026',
    'SEBI compliance dates 2026',
    'DIR-3 KYC due date 2026',
    'MGT-7 filing date',
    'AOC-4 due date',
    'income tax due dates companies 2026',
    'FLA return due date 2026',
  ],
}

const mcaData: React.ReactNode[][] = [
    ['DIR-3 KYC Web', 'Annual KYC for all directors with DIN', '30 Sep 2026', 'All directors with DIN', '₹5,000'],
    ['MGT-7 / MGT-7A', 'Annual Return filing', '60 days from AGM', 'All companies', '₹100/day'],
    ['AOC-4', 'Filing of Financial Statements', '30 days from AGM', 'All companies', '₹100/day'],
    ['ADT-1', 'Auditor Appointment intimation', '15 days from AGM', 'All companies', '₹300/day'],
    ['MSME-1', 'Outstanding payments to MSME vendors', <span key="msme" className="text-amber-600 font-medium">31 October 2026 (April deadline passed)</span>, 'Companies with MSME dues', '₹25,000'],
    ['BEN-2', 'Beneficial Ownership Return', '30 days of change', 'Companies with SBO', '₹1 lakh+'],
    ['DPT-3', 'Return of Deposits', '30 June 2026', 'Companies with deposits', '₹5,000/day'],
    ['Form 11', 'LLP Annual Return', '30 May 2026', 'All LLPs', '₹100/day'],
    ['Form 8', 'LLP Statement of Accounts & Solvency', '30 Oct 2026', 'All LLPs', '₹100/day'],
    ['CRA-4', 'Cost Audit Report filing', '30 days from Cost Audit Report', 'Turnover >₹35 Cr or net worth >₹5 Cr in specified industries', '₹25,000'],
    ['INC-20A', 'Declaration of Commencement of Business', '180 days of incorporation', 'Companies incorporated after Nov 2019', '₹50,000+'],
    ['PAS-6', 'Reconciliation of Share Capital Audit', '60 days from half year end', 'Unlisted public companies', '₹1,000/day'],
    ['DIR-12', 'Intimation of Change in Directors/KMP', '30 days of change', 'All companies', '₹500/day'],
    ['MGT-14', 'Filing of Board/Special Resolutions with RoC', '30 days of passing resolution', 'Public companies for specified resolutions', '₹500/day'],
]

const sebiData: React.ReactNode[][] = [
    ['Quarterly Financial Results', 'LODR Regulation 33', '45 days from quarter end', 'Listed companies'],
    ['Shareholding Pattern', 'LODR Regulation 31', '21 days from quarter end', 'Listed companies'],
    ['Corporate Governance Report', 'LODR Regulation 27', '21 days from quarter end', 'Listed companies'],
    ['Annual Report', 'LODR Regulation 34', '21 days from AGM', 'Listed companies'],
    ['Related Party Transactions', 'LODR Regulation 23', '30 days from quarter end', 'Listed companies'],
    ['Business Responsibility Report', 'LODR Regulation 34(2)(f)', 'With Annual Report', 'Top 1000 listed cos by market cap (BRSR); Top 250 for BRSR Core'],
    ['Secretarial Compliance Report', 'LODR Regulation 24A', '60 days from financial year end', 'Listed companies'],
    ['Statement of Investor Complaints', 'LODR Regulation 13(3)', '21 days from quarter end', 'Listed companies'],
    ['Reconciliation of Share Capital', 'SEBI Regulation 76', '60 days from quarter end', 'Listed companies'],
]

const rbiData: React.ReactNode[][] = [
    ['FLA Return', 'Foreign Liabilities & Assets Annual Return', '15 July 2026', 'Companies with FDI or ODI'],
    ['FC-GPR', 'FDI Reporting — Issue of Shares to non-resident', '30 days of allotment', 'Companies receiving FDI'],
    ['FC-TRS', 'Transfer of shares between resident and non-resident', '60 days of transfer', 'Buyer / Seller in FDI deal'],
    ['ODI-2', 'Overseas Direct Investment Annual Report', 'Annual', 'Indian companies with ODI'],
    ['ECB-2', 'External Commercial Borrowing Monthly Return', 'Monthly — 7th of next month', 'All ECB borrowers'],
    ['FIRMS Portal', 'All FEMA filings now through FIRMS', 'As applicable', 'All entities with FDI/ODI/ECB'],
]

const incomeTaxData: React.ReactNode[][] = [
  ['Advance Tax Q1', '15% of annual tax liability', '15 June 2026', 'All companies', '1% interest/month'],
  ['Advance Tax Q2', '45% of annual tax liability', '15 September 2026', 'All companies', '1% interest/month'],
  ['Advance Tax Q3', '75% of annual tax liability', '15 December 2026', 'All companies', '1% interest/month'],
  ['Advance Tax Q4', '100% of annual tax liability', '15 March 2027', 'All companies', '1% interest/month'],
  ['TDS Return Q1 (26Q)', 'TDS on non-salary payments', '31 July 2026', 'All deductors', '₹200/day'],
  ['TDS Return Q2 (26Q)', 'TDS on non-salary payments', '31 October 2026', 'All deductors', '₹200/day'],
  ['TDS Return Q3 (26Q)', 'TDS on non-salary payments Oct-Dec', '31 January 2027', 'All deductors', '₹200/day'],
  ['TDS Return Q4 (26Q)', 'TDS on non-salary payments Jan-Mar', '31 May 2027', 'All deductors', '₹200/day'],
  ['ITR Filing', 'Income Tax Return for companies', '31 October 2026', 'All companies', '₹5,000 + interest'],
  ['Tax Audit Report (3CD)', 'Form 3CA/3CB + 3CD', '30 September 2026', 'Companies with turnover >₹1 Cr', '₹1.5 lakh or 0.5% of turnover'],
]

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

export default function CalendarPage() {
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

            </div>
        </div>
    )
}
