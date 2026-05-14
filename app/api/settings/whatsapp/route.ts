import { supabase } from '@/lib/supabase'
import { NextResponse } from "next/server";

export const revalidate = 0

export async function GET() {

      try {
        const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'whatsapp_channel')
        .single()

      return Response.json({ url: data?.value || '' })
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
