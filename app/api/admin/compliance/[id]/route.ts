import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { invalidateCache } from '@/lib/redis-cache'
import { revalidatePath } from 'next/cache'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {

      try {
        void cookies()
      if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()

      const { data, error } = await supabaseAdmin
        .from('compliance_entries')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Invalidate active calendar entries cache
      await invalidateCache('compliance_entries:active')
      revalidatePath('/calendar')
      revalidatePath('/sitemap.xml')

      return NextResponse.json({ entry: data })
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {

      try {
        void cookies()
      if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { error } = await supabaseAdmin
        .from('compliance_entries')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Invalidate active calendar entries cache
      await invalidateCache('compliance_entries:active')
      revalidatePath('/calendar')
      revalidatePath('/sitemap.xml')

      return NextResponse.json({ success: true })
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
