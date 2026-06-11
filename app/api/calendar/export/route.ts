import { supabase } from '@/lib/supabase'
import { COMPLIANCE_ENTRY_COLUMNS } from '@/lib/supabase-queries'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const regulator = searchParams.get('regulator')

  let query = supabase
    .from('compliance_entries')
    .select(COMPLIANCE_ENTRY_COLUMNS)
    .eq('is_active', true)
    .order('display_order')

  if (regulator && regulator !== 'all') {
    query = query.eq('regulator', regulator)
  }

  const { data: entries } = await query

  // Generate iCal format
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0] + 'Z'

  function parseDate(
    dueDateStr: string
  ): string | null {
    // Handle "30 Sep 2026" format
    const months: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03',
      'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09',
      'Oct': '10', 'Nov': '11', 'Dec': '12',
    }
    
    const match = dueDateStr.match(
      /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/
    )
    if (!match) return null
    
    const day = match[1].padStart(2, '0')
    const month = months[match[2]] || '01'
    const year = match[3]
    
    return `${year}${month}${day}`
  }

  const events = (entries || [])
    .map(entry => {
      const date = parseDate(entry.due_date)
      if (!date) return null

      const uid = `${entry.id}@corplawupdates.in`
      const title = `${entry.form_name} — ${entry.compliance_title}`
      const desc = [
        `Regulator: ${entry.regulator.toUpperCase()}`,
        `Applicable to: ${entry.applicable_to}`,
        entry.penalty 
          ? `Penalty: ${entry.penalty}` 
          : '',
        entry.regulation_reference 
          ? `Law: ${entry.regulation_reference}` 
          : '',
        `Source: https://www.corplawupdates.in/calendar`,
      ].filter(Boolean).join('\\n')

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=DATE:${date}`,
        `DTEND;VALUE=DATE:${date}`,
        `SUMMARY:📋 ${title}`,
        `DESCRIPTION:${desc}`,
        `URL:https://www.corplawupdates.in/calendar`,
        `CATEGORIES:${entry.regulator.toUpperCase()},COMPLIANCE`,
        `BEGIN:VALARM`,
        `TRIGGER:-P7D`,
        `ACTION:DISPLAY`,
        `DESCRIPTION:Reminder: ${title} due in 7 days`,
        `END:VALARM`,
        `BEGIN:VALARM`,
        `TRIGGER:-P1D`,
        `ACTION:DISPLAY`,
        `DESCRIPTION:Tomorrow: ${title}`,
        `END:VALARM`,
        'END:VEVENT',
      ].join('\r\n')
    })
    .filter(Boolean)
    .join('\r\n')

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CorpLawUpdates.in//Compliance Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Compliance Calendar 2026 — CorpLawUpdates.in',
    'X-WR-CALDESC:Indian Corporate Law Compliance Deadlines',
    'X-WR-TIMEZONE:Asia/Kolkata',
    events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 
        'attachment; filename="compliance-calendar-2026.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
