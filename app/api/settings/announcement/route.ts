import { supabase } from '@/lib/supabase'
import { NextResponse } from "next/server";

export const revalidate = 0

export async function GET() {

      try {
        const { data } = await supabase
            .from('site_settings')
            .select('key, value')
            .in('key', ['announcement_bar', 'announcement_bar_url'])

        const text = data?.find(d => d.key === 'announcement_bar')?.value || ''
        const url = data?.find(d => d.key === 'announcement_bar_url')?.value || ''

        return Response.json({ text, url })
      } catch (error: any) {
  if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) throw error;

        console.error('[API Error]', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
}
