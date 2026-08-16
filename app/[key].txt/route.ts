import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key?: string }> }
) {
  const systemKey = process.env.INDEXNOW_KEY

  if (!systemKey) {
    console.warn('[IndexNow] INDEXNOW_KEY environment variable is not configured')
    return new Response('Not Found', { status: 404 })
  }

  const { key } = await context.params

  // Next.js dynamic routing folder 'app/[key].txt' matches paths like /<any-key>.txt
  // and extracts the [key] dynamic segment.
  if (key === systemKey) {
    return new Response(systemKey, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    })
  }

  return new Response('Not Found', { status: 404 })
}

