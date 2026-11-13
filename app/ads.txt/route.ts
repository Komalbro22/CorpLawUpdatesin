import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ADS_TXT_CONTENT = 'google.com, pub-8404756575471756, DIRECT, f08c47fec0942fa0\n'

export async function GET() {
  return new NextResponse(ADS_TXT_CONTENT, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
