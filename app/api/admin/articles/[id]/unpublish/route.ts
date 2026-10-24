import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidateArticleMutation } from '@/lib/content-revalidation'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'articles:publish')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params
  const clientIp = getClientIp(request)

  try {
    const { data: updatedArticle, error } = await supabaseAdmin
      .from('updates')
      .update({ published_at: null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !updatedArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    revalidateArticleMutation({
      slug: updatedArticle?.slug,
      category: updatedArticle?.category,
    })

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'article:unpublish',
        entityType: 'article',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { slug: updatedArticle.slug },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Article unpublished successfully',
      article: updatedArticle,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
