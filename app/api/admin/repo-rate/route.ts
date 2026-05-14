import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {

      try {
        if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: history } = await supabaseAdmin
        .from('repo_rate_history')
        .select('*')
        .order('meeting_date', { ascending: false })

      const { data: settings } = await supabaseAdmin
        .from('site_settings')
        .select('key, value')
        .in('key', ['current_repo_rate', 'current_repo_rate_date', 'next_mpc_date', 'mpc_stance', 'sdf_rate', 'msf_rate'])

      const currentRate: Record<string, string> = {}
      settings?.forEach(s => { currentRate[s.key] = s.value || '' })

      return NextResponse.json({ history: history || [], currentRate })
      } catch (error: any) {
  if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) throw error;

        console.error('[API Error]', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}

export async function POST(request: Request) {

      try {
        if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const { action } = body

      if (action === 'update_current_rate') {
        const { repo_rate, sdf_rate, msf_rate, stance, meeting_name, meeting_date, change_amount, change_direction, next_mpc_date } = body

        // Save new entry to history
        const { error: historyError } = await supabaseAdmin
          .from('repo_rate_history')
          .insert({
            repo_rate,
            sdf_rate,
            msf_rate,
            stance,
            meeting_name,
            meeting_date,
            change_amount,
            change_direction,
          })

        if (historyError) {
          return NextResponse.json({ error: 'Failed to save history' }, { status: 500 })
        }

        // Update current rate in site_settings
        const updates = [
          { key: 'current_repo_rate', value: repo_rate },
          { key: 'sdf_rate', value: sdf_rate },
          { key: 'msf_rate', value: msf_rate },
          { key: 'mpc_stance', value: stance },
          { key: 'current_repo_rate_date', value: meeting_name },
          { key: 'next_mpc_date', value: next_mpc_date },
        ]

        for (const update of updates) {
          await supabaseAdmin
            .from('site_settings')
            .update({ value: update.value, updated_at: new Date().toISOString() })
            .eq('key', update.key)
        }

        return NextResponse.json({ success: true })
      }

      if (action === 'delete_history_entry') {
        const { id } = body
        const { error } = await supabaseAdmin
          .from('repo_rate_history')
          .delete()
          .eq('id', id)
        if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      } catch (error: any) {
  if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) throw error;

        console.error('[API Error]', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}
