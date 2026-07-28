import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/compliance/webmcp
// WebMCP tool: get_compliance_due_dates
// Returns upcoming compliance entries from the compliance_entries table.
// Supports filtering by regulator, month, and year.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const VALID_REGULATORS = [
  'mca', 'sebi', 'rbi', 'income_tax', 'fema', 'nclt', 'ibc', 'gst', 'labor_law', 'other',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const regulatorRaw = (searchParams.get('regulator') ?? '').toLowerCase().trim();
  const monthRaw = searchParams.get('month') ?? '';
  const yearRaw = searchParams.get('year') ?? '';

  // --- Build date range filter ---
  const now = new Date();
  const year = parseInt(yearRaw, 10) || now.getFullYear();
  const month = parseInt(monthRaw, 10); // 1–12, optional

  let fromDate: string;
  let toDate: string;

  if (month >= 1 && month <= 12) {
    // Specific month requested
    fromDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    toDate = new Date(year, month, 0).toISOString().split('T')[0]; // last day of month
  } else {
    // Default: next 90 days from today
    fromDate = now.toISOString().split('T')[0];
    const future = new Date(now);
    future.setDate(future.getDate() + 90);
    toDate = future.toISOString().split('T')[0];
  }

  // --- Build Supabase query ---
  let query = supabase
    .from('compliance_entries')
    .select(
      'id, regulator, form_name, compliance_title, due_date, applicable_to, penalty, regulation_reference, frequency'
    )
    .eq('is_active', true)
    .limit(50);

  if (regulatorRaw && VALID_REGULATORS.includes(regulatorRaw)) {
    query = query.eq('regulator', regulatorRaw);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch compliance data.' }, { status: 500 });
  }

  // Optional month filtering by matching month name or number in text
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const targetMonthName = (month >= 1 && month <= 12) ? monthNames[month - 1] : null;

  let filtered = data ?? [];
  if (targetMonthName) {
    filtered = filtered.filter(entry => {
      const text = (entry.due_date || '').toLowerCase();
      return text.includes(targetMonthName) || text.includes(String(month));
    });
  }

  const entries = filtered.map((entry) => ({
    formName: entry.form_name,
    title: entry.compliance_title,
    dueDate: entry.due_date,
    regulator: entry.regulator?.toUpperCase(),
    applicableTo: entry.applicable_to,
    penalty: entry.penalty ?? 'Refer notification',
    regulationRef: entry.regulation_reference ?? null,
    frequency: entry.frequency ?? null,
  }));

  return NextResponse.json({
    count: entries.length,
    fromDate,
    toDate,
    regulatorFilter: regulatorRaw || null,
    entries,
    calendarUrl: 'https://www.corplawupdates.in/calendar',
  });
}
