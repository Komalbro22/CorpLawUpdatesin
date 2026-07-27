import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/rbi/webmcp
// WebMCP tool: get_rbi_rates
// Returns current RBI policy rates and 3 most recent MPC decisions.
// Data sourced from site_settings (current rates) + repo_rate_history (decisions).

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RATE_SETTINGS_KEYS = [
  'current_repo_rate',
  'current_repo_rate_date',
  'next_mpc_date',
  'mpc_stance',
  'sdf_rate',
  'msf_rate',
];

export async function GET() {
  // Fetch current rate settings in parallel with recent history
  const [settingsRes, historyRes] = await Promise.all([
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', RATE_SETTINGS_KEYS),
    supabase
      .from('repo_rate_history')
      .select('meeting_date, meeting_name, repo_rate, change_amount, change_direction, stance')
      .order('meeting_date', { ascending: false })
      .limit(3),
  ]);

  if (settingsRes.error) {
    return NextResponse.json({ error: 'Failed to fetch RBI rate data.' }, { status: 500 });
  }

  // Build settings map
  const settings: Record<string, string> = {};
  for (const row of settingsRes.data ?? []) {
    if (row.key && row.value) settings[row.key] = row.value;
  }

  const recentDecisions = (historyRes.data ?? []).map((h) => ({
    meetingDate: h.meeting_date,
    meetingName: h.meeting_name ?? null,
    repoRate: h.repo_rate,
    changeAmount: h.change_amount ?? null,
    changeDirection: h.change_direction ?? null, // 'increase' | 'decrease' | 'unchanged'
    stance: h.stance ?? null,
  }));

  return NextResponse.json({
    currentRepoRate: settings['current_repo_rate'] ? parseFloat(settings['current_repo_rate']) : null,
    currentRateEffectiveDate: settings['current_repo_rate_date'] ?? null,
    sdfRate: settings['sdf_rate'] ? parseFloat(settings['sdf_rate']) : null,
    msfRate: settings['msf_rate'] ? parseFloat(settings['msf_rate']) : null,
    currentStance: settings['mpc_stance'] ?? null,
    nextMpcDate: settings['next_mpc_date'] ?? null,
    recentDecisions,
    sourceUrl: 'https://www.corplawupdates.in/rbi/repo-rate',
    rbiOfficialUrl: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx',
  });
}
