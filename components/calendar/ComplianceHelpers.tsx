import React from 'react'
import { ComplianceEntry } from './types'

export function EntryBadges({ entry }: { entry: ComplianceEntry }) {
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

export function googleCalendarUrl(entry: ComplianceEntry): string {
  const title = encodeURIComponent(
    `📋 ${entry.form_name} — ${entry.compliance_title}`
  )
  const details = encodeURIComponent(
    `Applicable to: ${entry.applicable_to || '—'}\n` +
    (entry.penalty 
      ? `Penalty: ${entry.penalty}\n` 
      : '') +
    `Source: https://www.corplawupdates.in/calendar`
  )
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&sf=true&output=xml`
}

export function icsDownloadUrl(entry: ComplianceEntry): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  let date = '20260101' // fallback
  try {
    const months: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03',
      'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09',
      'Oct': '10', 'Nov': '11', 'Dec': '12',
    }
    const match = entry.due_date.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/)
    if (match) {
      date = `${match[3]}${months[match[2]] || '01'}${match[1].padStart(2, '0')}`
    }
  } catch(e) {}

  const uid = `${entry.id}@corplawupdates.in`
  const title = `${entry.form_name} — ${entry.compliance_title}`
  const desc = [
    `Regulator: ${(entry.regulator || '').toUpperCase()}`,
    `Applicable to: ${entry.applicable_to}`,
    entry.penalty ? `Penalty: ${entry.penalty}` : '',
    entry.regulation_reference ? `Law: ${entry.regulation_reference}` : '',
    `Source: https://www.corplawupdates.in/calendar`,
  ].filter(Boolean).join('\\n')

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CorpLawUpdates.in//Compliance Calendar//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${date}`,
    `SUMMARY:📋 ${title}`,
    `DESCRIPTION:${desc}`,
    `URL:https://www.corplawupdates.in/calendar`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ical)}`
}
