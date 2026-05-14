import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { submitToIndexNow } from '@/lib/indexnow'

export async function POST() {

      try {
        if (!verifyAdminSession()) {
        return NextResponse.json(
          { error: 'Unauthorized' }, 
          { status: 401 }
        )
      }

      const { data: articles } = await supabaseAdmin
        .from('updates')
        .select('slug')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(100)

      const BASE_URL = 'https://www.corplawupdates.in'
      
      const urls = [
        BASE_URL,
        `${BASE_URL}/updates`,
        `${BASE_URL}/calendar`,
        ...(articles || []).map(
          a => `${BASE_URL}/updates/${a.slug}`
        ),
      ]

      const success = await submitToIndexNow(urls)

      return NextResponse.json({
        success,
        count: urls.length,
      })
      } catch (error: any) {
  if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) throw error;

        console.error('[API Error]', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}
