'use client'

import { useState } from 'react'
import Link from 'next/link'
import React from 'react'
import dynamic from 'next/dynamic'
import NewsletterWidget from '@/components/NewsletterWidget'
import JsonLd from '@/components/JsonLd'

const ComplianceSuggestModal = dynamic(
  () => import('@/components/ComplianceSuggestModal'),
  { ssr: false }
)

export interface ComplianceEntry {
  id: string
  regulator: string
  form_name: string
  compliance_title: string
  due_date: string
  applicable_to: string
  penalty: string | null
  regulation_reference: string | null
  is_active: boolean
  is_verified: boolean
  created_by: string | null
  contributor_name: string | null
  contributor_profession: string | null
  correction_count: number
  frequency: string
  display_order: number
}

interface CalendarPageClientProps {
  entries: ComplianceEntry[]
}

function EntryBadges({ entry }: { entry: ComplianceEntry }) {
  return (
    <>
      {entry.created_by?.startsWith('community:') && (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">
          👥 Community
        </span>
      )}
      {!entry.is_verified && (
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-1">
          ⏳ Pending Verification
        </span>
      )}
      {entry.contributor_name && entry.is_verified && (
        <span className="text-xs text-green-600 ml-1">
          ✓ {entry.contributor_name}
          {entry.contributor_profession ? `, ${entry.contributor_profession}` : ''}
        </span>
      )}
    </>
  )
}

function TableSection({
  title,
  color,
  dot,
  headers,
  rows,
  entryIds,
  entryNames,
  rowDates,
  onReport,
}: {
  title: string
  color: string
  dot: string
  headers: string[]
  rows: React.ReactNode[][]
  entryIds?: string[]
  entryNames?: string[]
  rowDates?: string[]
  onReport?: (id: string, name: string) => void
}) {
  const displayHeaders = onReport ? [...headers, ''] : headers

  return (
    <section>
      <h2 className="text-2xl font-heading font-bold text-navy mb-4 flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${dot} inline-block`} />
        {title}
      </h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className={color}>
              {displayHeaders.map((h, idx) => (
                <th key={idx} className="text-left px-4 py-3 font-semibold text-white">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const dateStr = rowDates?.[i] || ''
              let rowBg = i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              if (dateStr.includes('May 2026') || dateStr.includes('June 2026')) {
                rowBg = 'bg-amber-100'
              } else if (dateStr.includes('July 2026')) {
                rowBg = 'bg-yellow-50'
              }
              const entryId   = entryIds?.[i] || ''
              const entryName = entryNames?.[i] || ''
              return (
                <tr key={entryId || i} data-entry-id={entryId} className={rowBg}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 ${
                        j === 0
                          ? 'font-semibold text-blue-700 whitespace-nowrap'
                          : j === row.length - 1 && headers.includes('Penalty')
                          ? 'text-red-600 font-medium whitespace-nowrap'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                  {onReport && (
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => onReport(entryId, entryName)}
                        className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-300 rounded px-2 py-1 transition-colors whitespace-nowrap"
                      >
                        ⚠️ Report
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function CalendarPageClient({ entries }: CalendarPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()
  const [selectedEntryName, setSelectedEntryName] = useState<string | undefined>()

  function openReportError(entryId: string, entryName: string) {
    setSelectedEntryId(entryId)
    setSelectedEntryName(entryName)
    setModalOpen(true)
  }

  function openSuggestNew() {
    setSelectedEntryId(undefined)
    setSelectedEntryName(undefined)
    setModalOpen(true)
  }

  const grouped = entries.reduce<Record<string, ComplianceEntry[]>>((acc, entry) => {
    const key = entry.regulator || 'other'
    if (!acc[key]) acc[key] = []
    acc[key]!.push(entry)
    return acc
  }, {})

  const mcaEntries  = grouped['mca']        || []
  const sebiEntries = grouped['sebi']       || []
  const femaEntries = grouped['fema']       || []
  const rbiEntries  = grouped['rbi']        || []
  const taxEntries  = grouped['income_tax'] || []

  function makeFormCell(entry: ComplianceEntry) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1">
        {entry.form_name}
        <EntryBadges entry={entry} />
      </span>
    )
  }

  // MCA — Form | Compliance | Due Date | Applicable To | Penalty
  const mcaRows   = mcaEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—', e.penalty || '—'])
  const mcaIds    = mcaEntries.map(e => e.id)
  const mcaNames  = mcaEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const mcaDates  = mcaEntries.map(e => e.due_date)

  // SEBI — Form | Compliance | Regulation | Due Date | Applicable To
  const sebiRows  = sebiEntries.map(e => [makeFormCell(e), e.compliance_title, e.regulation_reference || '—', e.due_date, e.applicable_to || '—'])
  const sebiIds   = sebiEntries.map(e => e.id)
  const sebiNames = sebiEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const sebiDates = sebiEntries.map(e => e.due_date)

  // FEMA — Form | Compliance | Due Date | Applicable To
  const femaRows  = femaEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—'])
  const femaIds   = femaEntries.map(e => e.id)
  const femaNames = femaEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const femaDates = femaEntries.map(e => e.due_date)

  // RBI — Form | Compliance | Due Date | Applicable To
  const rbiRows   = rbiEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—'])
  const rbiIds    = rbiEntries.map(e => e.id)
  const rbiNames  = rbiEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const rbiDates  = rbiEntries.map(e => e.due_date)

  // Income Tax — Form | Compliance | Due Date | Applicable To | Penalty
  const taxRows   = taxEntries.map(e => [makeFormCell(e), e.compliance_title, e.due_date, e.applicable_to || '—', e.penalty || '—'])
  const taxIds    = taxEntries.map(e => e.id)
  const taxNames  = taxEntries.map(e => `${e.form_name} — ${e.compliance_title}`)
  const taxDates  = taxEntries.map(e => e.due_date)

  return (
    <div>
      {/* HERO */}
      <div className="bg-navy py-12 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
          Compliance Calendar 2026
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-lg">
          Key compliance deadlines under Companies Act, SEBI LODR, FEMA and RBI regulations
        </p>
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          <span className="text-sm text-amber-400 font-medium">📅 Updated for FY 2026-27</span>
          <span className="text-slate-500">·</span>
          <span className="text-sm text-slate-300">Free for CS Professionals &amp; Corporate Lawyers</span>
          <span className="text-slate-500">·</span>
          <button
            onClick={openSuggestNew}
            className="text-sm text-amber-300 underline underline-offset-2 hover:text-amber-100 transition-colors"
          >
            ➕ Suggest a compliance
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* DISCLAIMER */}
        <div className="space-y-2">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-amber-800 text-sm leading-relaxed">
              <strong>Disclaimer:</strong> All dates are indicative and subject to regulatory extensions,
              amendments or circulars issued by MCA, SEBI or RBI from time to time. Always verify with
              official government portals before acting on any deadline. This is not legal advice.
            </p>
          </div>
          <p className="text-xs text-slate-400 text-right">
            Last verified: April 2026 | Source: MCA, SEBI, RBI official portals
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Income Tax', href: '#incometax', color: 'bg-orange-50 border-orange-200 text-orange-700', icon: '📊' },
            { label: 'ROC / MCA',  href: '#mca',       color: 'bg-blue-50 border-blue-200 text-blue-700',       icon: '🏛️' },
            { label: 'SEBI LODR',  href: '#sebi',      color: 'bg-green-50 border-green-200 text-green-700',    icon: '📈' },
            { label: 'RBI',        href: '#rbi',       color: 'bg-purple-50 border-purple-200 text-purple-700', icon: '🏦' },
            { label: 'FEMA',       href: '#fema',      color: 'bg-cyan-50 border-cyan-200 text-cyan-700',       icon: '🌐' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border font-medium text-sm text-center hover:shadow-md transition-shadow ${item.color}`}
            >
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* INCOME TAX */}
        {taxEntries.length > 0 && (
          <div id="incometax">
            <TableSection
              title="📊 Income Tax Compliance"
              color="bg-orange-600"
              dot="bg-orange-500"
              headers={['Form', 'Compliance', 'Due Date', 'Applicable To', 'Penalty']}
              rows={taxRows}
              entryIds={taxIds}
              entryNames={taxNames}
              rowDates={taxDates}
              onReport={openReportError}
            />
          </div>
        )}

        {/* MCA */}
        {mcaEntries.length > 0 && (
          <div id="mca">
            <TableSection
              title="🏛️ MCA — Companies Act Compliance"
              color="bg-navy"
              dot="bg-blue-500"
              headers={['Form', 'Compliance', 'Due Date', 'Applicable To', 'Penalty']}
              rows={mcaRows}
              entryIds={mcaIds}
              entryNames={mcaNames}
              rowDates={mcaDates}
              onReport={openReportError}
            />
          </div>
        )}

        {/* SEBI */}
        {sebiEntries.length > 0 && (
          <div id="sebi">
            <TableSection
              title="📈 SEBI — Listed Company Compliance"
              color="bg-green-700"
              dot="bg-green-500"
              headers={['Form', 'Compliance', 'Regulation', 'Due Date', 'Applicable To']}
              rows={sebiRows}
              entryIds={sebiIds}
              entryNames={sebiNames}
              rowDates={sebiDates}
              onReport={openReportError}
            />
          </div>
        )}

        {/* RBI */}
        {rbiEntries.length > 0 && (
          <div id="rbi">
            <TableSection
              title="🏦 RBI Compliance"
              color="bg-purple-800"
              dot="bg-purple-500"
              headers={['Form', 'Compliance', 'Due Date', 'Applicable To']}
              rows={rbiRows}
              entryIds={rbiIds}
              entryNames={rbiNames}
              rowDates={rbiDates}
              onReport={openReportError}
            />
          </div>
        )}

        {/* FEMA */}
        {femaEntries.length > 0 && (
          <div id="fema">
            <TableSection
              title="🌐 FEMA Compliance"
              color="bg-cyan-700"
              dot="bg-cyan-500"
              headers={['Form', 'Compliance', 'Due Date', 'Applicable To']}
              rows={femaRows}
              entryIds={femaIds}
              entryNames={femaNames}
              rowDates={femaDates}
              onReport={openReportError}
            />
          </div>
        )}

        {/* COMMUNITY NOTICE */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-bold text-green-800 text-lg mb-1">
            Help us keep this calendar accurate
          </h3>
          <p className="text-green-700 text-sm max-w-xl mx-auto mb-4">
            This calendar is maintained by our community of Company Secretaries, CAs, and corporate
            professionals. Spotted an error or a missing compliance? Use the button below to report
            it — approved corrections will credit you as a contributor.
          </p>
          <button
            onClick={openSuggestNew}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            ➕ Suggest New Compliance Entry
          </button>
        </div>

        {/* USEFUL LINKS */}
        <section className="bg-slate-50 rounded-2xl p-6">
          <h3 className="text-xl font-heading font-bold text-navy mb-4">
            Official Portals for Verification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'MCA21 Portal', url: 'https://www.mca.gov.in',   desc: 'All company filings and circulars' },
              { name: 'SEBI Portal',  url: 'https://www.sebi.gov.in',  desc: 'Listed company regulations' },
              { name: 'RBI / FIRMS',  url: 'https://firms.rbi.org.in', desc: 'FEMA filings and reporting' },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all"
              >
                <span className="font-semibold text-navy text-sm">{link.name} ↗</span>
                <span className="text-xs text-slate-500 mt-1">{link.desc}</span>
              </a>
            ))}
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="bg-navy rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-heading font-bold text-white mb-2">
            Never Miss a Compliance Deadline
          </h3>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto">
            Get weekly regulatory updates and deadline reminders from MCA, SEBI and RBI. Free forever.
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
          keywords: ['compliance calendar 2026', 'MCA filing deadlines', 'SEBI compliance dates', 'RBI FEMA deadlines', 'income tax due dates India'],
          creator: { '@type': 'Organization', name: 'CorpLawUpdates.in', url: 'https://www.corplawupdates.in' },
          temporalCoverage: '2026',
          spatialCoverage: { '@type': 'Place', name: 'India' },
          inLanguage: 'en-IN',
          dateModified: new Date().toISOString().split('T')[0],
        }} />

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What is the due date for DIR-3 KYC in 2026?', acceptedAnswer: { '@type': 'Answer', text: 'The due date for DIR-3 KYC Web filing in 2026 is 30 September 2026. Late filing attracts a fee of ₹5,000.' } },
            { '@type': 'Question', name: 'What is the due date for MGT-7 annual return?', acceptedAnswer: { '@type': 'Answer', text: 'MGT-7 annual return must be filed within 60 days from the date of Annual General Meeting (AGM). Penalty for late filing is ₹100 per day.' } },
            { '@type': 'Question', name: 'What is the due date for FLA return 2026?', acceptedAnswer: { '@type': 'Answer', text: 'The FLA Return for FY 2025-26 must be filed by 15 July 2026 on the RBI FIRMS portal.' } },
            { '@type': 'Question', name: 'When is the income tax return due date for companies 2026?', acceptedAnswer: { '@type': 'Answer', text: 'The Income Tax Return (ITR) filing due date for companies for FY 2025-26 is 31 October 2026.' } },
          ],
        }} />

      </div>

      {/* FLOATING SUGGEST BUTTON */}
      <button
        onClick={openSuggestNew}
        className="fixed bottom-6 right-6 z-40 bg-amber-400 hover:bg-amber-500 text-navy font-bold px-5 py-3 rounded-full shadow-lg text-sm flex items-center gap-2 transition-all hover:scale-105"
      >
        ➕ Suggest a Compliance
      </button>

      {/* MODAL */}
      {modalOpen && (
        <ComplianceSuggestModal
          entryId={selectedEntryId}
          entryName={selectedEntryName}
          defaultType={selectedEntryId ? 'error_report' : 'new_entry'}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
