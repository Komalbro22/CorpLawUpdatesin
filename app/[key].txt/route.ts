import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_INDEXNOW_KEY = '3d13aae2e0c040d89f050b27aadfa4c7'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key?: string }> }
) {
  const systemKey = process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY
  const { key } = await context.params

  // Next.js dynamic routing folder 'app/[key].txt' matches paths like /<any-key>.txt
  // and extracts the [key] dynamic segment.
  if (key === systemKey || key === DEFAULT_INDEXNOW_KEY) {
    return new Response(key, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    })
  }

  return new Response('Not Found', { status: 404 })
}

