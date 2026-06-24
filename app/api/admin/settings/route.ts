import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { invalidateCache } from '@/lib/redis-cache'

const ALLOWED_SETTING_KEYS = new Set([
  'whatsapp_channel',
  'linkedin_url',
  'twitter_url',
  'instagram_url',
  'site_tagline',
  'contact_email',
  'newsletter_footer',
  'announcement_bar',
  'announcement_bar_url',
  'current_repo_rate',
  'current_repo_rate_date',
  'next_mpc_date',
  'mpc_stance',
  'sdf_rate',
  'msf_rate',
  'google_analytics_id',
  'microsoft_clarity_id',
  'google_search_console',
  'max_requests_per_ip_daily',
  'max_tokens_per_ip_daily',
  'whitelisted_ips',
])

// GET — fetch all settings
export async function GET() {

      try {
        if (!verifyAdminSession()) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const { data, error } = await supabaseAdmin
        .from('site_settings')
        .select('*')
        .order('key')

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch settings' },
          { status: 500 }
        )
      }

      return NextResponse.json({ settings: data })
      } catch (error) {
  const err = error as Error & { digest?: string };
            if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
              throw error;
            }

        console.error('[API Error]', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}

// POST — update a single setting
export async function POST(request: Request) {

      try {
        if (!verifyAdminSession()) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const body = await request.json()
      const { key, value } = body

      if (!key || !ALLOWED_SETTING_KEYS.has(key)) {
        return NextResponse.json(
          { error: 'Invalid or disallowed setting key' },
          { status: 400 }
        )
      }

      const { error } = await supabaseAdmin
        .from('site_settings')
        .update({
          value: value || '',
          updated_at: new Date().toISOString()
        })
        .eq('key', key)

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update setting' },
          { status: 500 }
        )
      }

      // Invalidate Redis caches properly
      const ALL_SETTINGS_CACHE_KEY = 'settings:all'
      const SETTING_KEY_PREFIX = 'settings:key:'
      await invalidateCache(ALL_SETTINGS_CACHE_KEY)
      await invalidateCache(`${SETTING_KEY_PREFIX}${key}`)

      return NextResponse.json({ success: true, key, value })
      } catch (error) {
  const err = error as Error & { digest?: string };
            if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
              throw error;
            }

        console.error('[API Error]', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}
