import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

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

      if (!key) {
        return NextResponse.json(
          { error: 'Key required' },
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
