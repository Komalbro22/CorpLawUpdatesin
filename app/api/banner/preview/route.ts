import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { RenderInputSchema, renderBanner } from '@/lib/banner'
import { checkBannerRateLimit } from '@/lib/banner/rate-limit'

export const dynamic = 'force-dynamic'

const MAX_PAYLOAD_BYTES = 64 * 1024 // 64 KB

export async function POST(request: NextRequest) {
  const authCheck = await verifyAdminOrKey(request, 'banner:preview')
  if (!authCheck.success) {
    return authCheck.response
  }

  // Rate limit check for API keys (30 previews / hour)
  if (authCheck.auth.type === 'api_key') {
    const rateCheck = checkBannerRateLimit(authCheck.auth.key.id, 'preview')
    if (!rateCheck.ok) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Preview rate limit of 30 requests/hour exceeded. Try again in ${rateCheck.retryAfter} seconds.`,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfter || 60),
          },
        }
      )
    }
  }

  // Payload size check (< 64 KB)
  const rawBodyText = await request.text()
  if (Buffer.byteLength(rawBodyText, 'utf8') > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      {
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request payload exceeds maximum allowed size of 64 KB.`,
        },
      },
      { status: 413 }
    )
  }

  let body: unknown
  try {
    body = JSON.parse(rawBodyText)
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_JSON',
          message: 'Malformed JSON payload.',
        },
      },
      { status: 400 }
    )
  }

  // Zod validation
  const parseResult = RenderInputSchema.safeParse(body)
  if (!parseResult.success) {
    const errors = (parseResult.error.issues || []).map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }))
    return NextResponse.json({ errors }, { status: 400 })
  }

  try {
    const result = await renderBanner(parseResult.data)

    return NextResponse.json({
      png_base64: `data:image/png;base64,${result.png.toString('base64')}`,
      warnings: result.warnings,
      hash: result.hash,
      render_ms: result.renderTimeMs,
    })
  } catch (err: any) {
    // Sanitize any server paths from error message
    const sanitizedMsg = (err?.message || 'Rendering failed')
      .replace(/[A-Za-z]:\\[^:\n]+/g, '[internal path]')
      .replace(/\/home\/[^:\n]+/g, '[internal path]')

    return NextResponse.json(
      {
        render_error: sanitizedMsg,
      },
      { status: 422 }
    )
  }
}
