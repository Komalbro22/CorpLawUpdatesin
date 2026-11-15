import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

async function resolveArticle(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)
  let query = supabaseAdmin.from('updates').select('id, slug, title, active_banner_id, featured_image_url')
  if (isUuid) {
    query = query.eq('id', idOrSlug)
  } else {
    query = query.eq('slug', idOrSlug)
  }
  const { data, error } = await query.single()
  if (error || !data) return null
  return data
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'banner:activate')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { idOrSlug } = await params
  const article = await resolveArticle(idOrSlug)
  if (!article) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Article not found.' } },
      { status: 404 }
    )
  }

  // Archive any current active banner
  await supabaseAdmin
    .from('banner_assets')
    .update({ status: 'archived' })
    .eq('article_id', article.id)
    .eq('status', 'active')

  // Set updates.active_banner_id to null and clear featured_image_url if set to a banner asset
  await supabaseAdmin
    .from('updates')
    .update({
      active_banner_id: null,
      featured_image_url: null,
    })
    .eq('id', article.id)

  const clientIp = getClientIp(request)
  const creator =
    authCheck.auth.type === 'session'
      ? 'admin'
      : authCheck.auth.key.name || authCheck.auth.key.prefix || 'agent'

  await logApiAudit({
    keyId: authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : undefined,
    keyName: creator,
    action: 'banner:deactivate',
    entityType: 'banner_asset',
    entityId: article.id,
    ip: clientIp,
    status: 'success',
    details: {
      article_id: article.id,
      slug: article.slug,
      reverted_to: 'legacy_featured_image',
    },
  })

  return NextResponse.json({
    success: true,
    message: 'Active banner removed. Article reverted to legacy image fallback.',
    active_banner_id: null,
  })
}
