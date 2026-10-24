import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'analytics:read')
  if (!authCheck.success) {
    return authCheck.response
  }

  try {
    const { id } = await params

    const { data: article, error } = await supabaseAdmin
      .from('updates')
      .select('id, title, slug, category, views, created_at, published_at')
      .eq('id', id)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Article not found' } }, { status: 404 })
    }

    return NextResponse.json({
      article: {
        ...article,
        status: article.published_at ? 'published' : 'draft',
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err?.message || 'Failed to fetch article stats' } },
      { status: 500 }
    )
  }
}
