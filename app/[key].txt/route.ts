import { NextRequest } from 'next/server'
import { DEFAULT_INDEXNOW_KEY } from '@/lib/indexnow'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key?: string }> }
) {
  const systemKey = process.env.INDEXNOW_KEY || process.env.INDEXNOW_API_KEY || DEFAULT_INDEXNOW_KEY
  const { key } = await context.params

  // Next.js dynamic routing folder 'app/[key].txt' matches paths like /<any-key>.txt
  // and extracts the [key] dynamic segment.
  if (key === systemKey || key === DEFAULT_INDEXNOW_KEY) {
    return new Response(key || systemKey, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    })
  }

  return new Response('Not Found', { status: 404 })
}
