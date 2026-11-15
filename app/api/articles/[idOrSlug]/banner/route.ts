import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { RenderInputSchema, renderBanner, persistBannerOutputs } from '@/lib/banner'
import { checkBannerRateLimit } from '@/lib/banner/rate-limit'

export const dynamic = 'force-dynamic'

const MAX_PAYLOAD_BYTES = 64 * 1024

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'banner:preview')
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

  const { data: banners, error } = await supabaseAdmin
    .from('banner_assets')
    .select('*')
    .eq('article_id', article.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: { code: 'DATABASE_ERROR', message: error.message } },
      { status: 500 }
    )
  }

  const activeBanner = banners?.find((b) => b.status === 'active') || null
  const candidates = banners?.filter((b) => b.status === 'candidate') || []
  const history = banners?.filter((b) => b.status === 'archived') || []

  return NextResponse.json({
    article: {
      id: article.id,
      slug: article.slug,
      title: article.title,
      active_banner_id: article.active_banner_id,
      featured_image_url: article.featured_image_url,
    },
    active_banner: activeBanner,
    candidates,
    history,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'banner:write')
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

  if (authCheck.auth.type === 'api_key') {
    const rateCheck = checkBannerRateLimit(authCheck.auth.key.id, 'write')
    if (!rateCheck.ok) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Write rate limit of 20 requests/hour exceeded. Try again in ${rateCheck.retryAfter} seconds.`,
          },
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter || 60) } }
      )
    }
  }

  const rawBodyText = await request.text()
  if (Buffer.byteLength(rawBodyText, 'utf8') > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Payload exceeds 64 KB limit.' } },
      { status: 413 }
    )
  }

  let body: any
  try {
    body = JSON.parse(rawBodyText)
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Malformed JSON payload.' } },
      { status: 400 }
    )
  }

  const parseResult = RenderInputSchema.safeParse(body)
  if (!parseResult.success) {
    const errors = (parseResult.error.issues || []).map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }))
    return NextResponse.json({ errors }, { status: 400 })
  }

  const input = parseResult.data
  const shouldActivate = Boolean(body.activate)

  const canActivate =
    authCheck.auth.type === 'session' ||
    (authCheck.auth.type === 'api_key' &&
      (authCheck.auth.key.scopes.includes('banner:activate') ||
        process.env.BANNER_AGENT_AUTO_ACTIVATE === 'true'))

  if (shouldActivate && !canActivate) {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'Key lacks banner:activate scope or auto-activation is disabled.',
        },
      },
      { status: 403 }
    )
  }

  const clientIp = getClientIp(request)
  const creator =
    authCheck.auth.type === 'session'
      ? 'admin'
      : authCheck.auth.key.name || authCheck.auth.key.prefix || 'agent'

  try {
    const result = await renderBanner(input)

    // Idempotency: Check if banner with same article_id and hash already exists
    const { data: existingBanner } = await supabaseAdmin
      .from('banner_assets')
      .select('*')
      .eq('article_id', article.id)
      .eq('hash', result.hash)
      .maybeSingle()

    if (existingBanner) {
      if (shouldActivate && canActivate && existingBanner.status !== 'active') {
        await supabaseAdmin
          .from('banner_assets')
          .update({ status: 'archived' })
          .eq('article_id', article.id)
          .eq('status', 'active')

        await supabaseAdmin
          .from('banner_assets')
          .update({ status: 'active' })
          .eq('id', existingBanner.id)

        await supabaseAdmin
          .from('updates')
          .update({ active_banner_id: existingBanner.id })
          .eq('id', article.id)

        existingBanner.status = 'active'
      }

      return NextResponse.json(
        {
          banner_id: existingBanner.id,
          status: existingBanner.status,
          urls: existingBanner.formats,
          hash: existingBanner.hash,
          warnings: result.warnings,
        },
        { status: 200 }
      )
    }

    // Persist outputs to storage
    const urls = await persistBannerOutputs(
      article.slug,
      result.hash,
      result.png,
      result.webp
    )

    const initialStatus = shouldActivate && canActivate ? 'active' : 'candidate'

    if (initialStatus === 'active') {
      await supabaseAdmin
        .from('banner_assets')
        .update({ status: 'archived' })
        .eq('article_id', article.id)
        .eq('status', 'active')
    }

    const { data: newBanner, error: insertError } = await supabaseAdmin
      .from('banner_assets')
      .insert({
        article_id: article.id,
        source: input.mode,
        spec: input.mode === 'template' ? input.spec : null,
        code: input.mode === 'html' || input.mode === 'svg' ? input.code : null,
        alt: input.mode === 'template' ? input.spec.alt : input.alt,
        hash: result.hash,
        formats: urls,
        status: initialStatus,
        created_by: creator,
      })
      .select('*')
      .single()

    if (insertError || !newBanner) {
      throw new Error(`Failed to store banner: ${insertError?.message || 'unknown error'}`)
    }

    if (initialStatus === 'active') {
      await supabaseAdmin
        .from('updates')
        .update({ active_banner_id: newBanner.id })
        .eq('id', article.id)
    }

    await logApiAudit({
      keyId: authCheck.auth.type === 'api_key' ? authCheck.auth.key.id : undefined,
      keyName: creator,
      action: initialStatus === 'active' ? 'banner:create_and_activate' : 'banner:create_candidate',
      entityType: 'banner_asset',
      entityId: newBanner.id,
      ip: clientIp,
      status: 'success',
      details: {
        article_id: article.id,
        slug: article.slug,
        hash: result.hash,
        mode: input.mode,
        status: initialStatus,
      },
    })

    return NextResponse.json(
      {
        banner_id: newBanner.id,
        status: newBanner.status,
        urls: newBanner.formats,
        hash: newBanner.hash,
        warnings: result.warnings,
      },
      { status: 201 }
    )
  } catch (err: any) {
    const sanitizedMsg = (err?.message || 'Rendering failed')
      .replace(/[A-Za-z]:\\[^:\n]+/g, '[internal path]')
      .replace(/\/home\/[^:\n]+/g, '[internal path]')

    return NextResponse.json({ render_error: sanitizedMsg }, { status: 422 })
  }
}
