import { Metadata } from 'next'
import Link from 'next/link'
import NewsletterWidget from '@/components/NewsletterWidget'

export const metadata: Metadata = {
    title: 'Compliance Calendar 2026 | CorpLawUpdates.in',
    description: 'Key Indian corporate law compliance deadlines for MCA, SEBI, RBI and FEMA. Free compliance calendar for CS professionals, corporate lawyers and compliance officers.',
    openGraph: {
        title: 'Compliance Calendar 2026 | CorpLawUpdates.in',
        description: 'Key compliance deadlines under Companies Act, SEBI LODR, FEMA and RBI regulations.',
    },
}

const mcaData = [
    ['DIR-3 KYC Web', 'Annual KYC for all directors with DIN', '30 Sep 2026', 'All directors with DIN', '₹5,000'],
    ['MGT-7 / MGT-7A', 'Annual Return filing', '60 days from AGM', 'All companies', '₹100/day'],
    ['AOC-4', 'Filing of Financial Statements', '30 days from AGM', 'All companies', '₹100/day'],
    ['ADT-1', 'Auditor Appointment intimation', '15 days from AGM', 'All companies', '₹300/day'],
    ['MSME-1', 'Outstanding payments to MSME vendors', '30 Apr & 31 Oct', 'Companies with MSME dues', '₹25,000'],
    ['BEN-2', 'Beneficial Ownership Return', '30 days of change', 'Companies with SBO', '₹1 lakh+'],
    ['DPT-3', 'Return of Deposits', '30 June 2026', 'Companies with deposits', '₹5,000/day'],
    ['Form 11', 'LLP Annual Return', '30 May 2026', 'All LLPs', '₹100/day'],
    ['Form 8', 'LLP Statement of Accounts & Solvency', '30 Oct 2026', 'All LLPs', '₹100/day'],
    ['CRA-4', 'Cost Audit Report filing', '30 days from Cost Audit Report', 'Applicable companies', '₹25,000'],
]

const sebiData = [
    ['Quarterly Financial Results', 'LODR Regulation 33', '45 days from quarter end', 'Listed companies'],
    ['Shareholding Pattern', 'LODR Regulation 31', '21 days from quarter end', 'Listed companies'],
    ['Corporate Governance Report', 'LODR Regulation 27', '15 days from quarter end', 'Listed companies'],
    ['Annual Report', 'LODR Regulation 34', '21 days from AGM', 'Listed companies'],
    ['Related Party Transactions', 'LODR Regulation 23', '30 days from quarter end', 'Listed companies'],
    ['Business Responsibility Report', 'LODR Regulation 34(2)(f)', 'With Annual Report', 'Top 1000 listed cos'],
]

const rbiData = [
    ['FLA Return', 'Foreign Liabilities & Assets Annual Return', '15 July 2026', 'Companies with FDI or ODI'],
    ['FC-GPR', 'FDI Reporting — Issue of Shares to non-resident', '30 days of allotment', 'Companies receiving FDI'],
    ['FC-TRS', 'Transfer of shares between resident and non-resident', '60 days of transfer', 'Buyer / Seller in FDI deal'],
    ['ODI-2', 'Overseas Direct Investment Annual Report', 'Annual', 'Indian companies with ODI'],
    ['ECB-2', 'External Commercial Borrowing Monthly Return', 'Monthly — 7th of next month', 'All ECB borrowers'],
    ['FIRMS Portal', 'All FEMA filings now through FIRMS', 'As applicable', 'All entities with FDI/ODI/ECB'],
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
    rows: string[][]
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
                        {rows.map((row, i) => (
                            <tr key={i}
                                className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
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
                        ))}
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
                        📅 Updated for FY 2025-26
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-sm text-slate-300">
                        Free for CS Professionals & Corporate Lawyers
                    </span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

                {/* DISCLAIMER */}
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

                {/* QUICK LINKS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'MCA Deadlines', href: '#mca', color: 'bg-blue-50 border-blue-200 text-blue-700', icon: '🏛️' },
                        { label: 'SEBI Deadlines', href: '#sebi', color: 'bg-green-50 border-green-200 text-green-700', icon: '📈' },
                        { label: 'RBI / FEMA', href: '#rbi', color: 'bg-purple-50 border-purple-200 text-purple-700', icon: '🏦' },
                        { label: 'Latest Updates', href: '/updates', color: 'bg-amber-50 border-amber-200 text-amber-700', icon: '📋' },
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
