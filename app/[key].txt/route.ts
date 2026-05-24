export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  const systemKey = process.env.INDEXNOW_KEY

  if (!systemKey) {
    console.error('INDEXNOW_KEY environment variable is not configured')
    return new Response('Verification key is not configured', { status: 500 })
  }

  // Next.js dynamic routing folder 'app/[key].txt' matches paths like /<any-key>.txt
  // and extracts the [key] dynamic segment.
  if (params.key === systemKey) {
    return new Response(systemKey, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    })
  }

  return new Response('Not Found', { status: 404 })
}
