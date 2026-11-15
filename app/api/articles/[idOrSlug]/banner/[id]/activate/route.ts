import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

async function resolveArticle(idOrSlug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)
  let query = supabaseAdmin.from('updates').select('id, slug, title, active_banner_id')
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
  { params }: { params: Promise<{ idOrSlug: string; id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'banner:activate')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { idOrSlug, id: bannerId } = await params
  const article = await resolveArticle(idOrSlug)
  if (!article) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Article not found.' } },
      { status: 404 }
    )
  }

  // Find banner
  const { data: banner, error: bannerError } = await supabaseAdmin
    .from('banner_assets')
    .select('*')
    .eq('id', bannerId)
    .eq('article_id', article.id)
    .single()

  if (bannerError || !banner) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Banner asset not found for this article.' } },
      { status: 404 }
    )
  }

  // Archive any current active banner
  await supabaseAdmin
    .from('banner_assets')
    .update({ status: 'archived' })
    .eq('article_id', article.id)
    .eq('status', 'active')

  // Activate selected banner
  const { data: updatedBanner, error: updateError } = await supabaseAdmin
    .from('banner_assets')
    .update({ status: 'active' })
    .eq('id', banner.id)
    .select('*')
    .single()

  if (updateError || !updatedBanner) {
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: updateError?.message || 'Failed to activate banner' } },
      { status: 500 }
    )
  }

  // Update updates.active_banner_id
  await supabaseAdmin
    .from('updates')
    .update({ active_banner_id: banner.id })
    .eq('id', article.id)

  const clientIp = getClientIp(request)
  const creator =
    authCheck.auth.type === 'session'
      ? 'admin'
      : authCheck.auth.key.name || authCheck.auth.key.prefix || 'agent'

  await logApiAudit({
    keyId: authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : undefined,
    keyName: creator,
    action: 'banner:activate',
    entityType: 'banner_asset',
    entityId: banner.id,
    ip: clientIp,
    status: 'success',
    details: {
      article_id: article.id,
      slug: article.slug,
      banner_id: banner.id,
      hash: banner.hash,
    },
  })

  return NextResponse.json({
    success: true,
    banner_id: banner.id,
    status: 'active',
    urls: banner.formats,
  })
}
