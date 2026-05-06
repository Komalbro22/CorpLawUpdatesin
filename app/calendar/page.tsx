import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import CalendarPageClient, { type ComplianceEntry } from '@/components/CalendarPageClient'

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

export default async function CalendarPage() {
  const { data: rawEntries } = await supabase
    .from('compliance_entries')
    .select('*')
    .eq('is_active', true)
    .order('regulator')
    .order('display_order')

  return <CalendarPageClient entries={(rawEntries || []) as ComplianceEntry[]} />
}
