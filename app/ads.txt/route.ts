import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours

export async function GET() {
  const content = `google.com, pub-8404756575471756, DIRECT, f08c47fec0942fa0
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
