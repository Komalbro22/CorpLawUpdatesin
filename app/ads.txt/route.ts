import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.redirect(
    'https://adstxt.journeymv.com/sites/bb9707b8-bfe3-4206-9309-6bc7e7923faf/ads.txt',
    {
      status: 301,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
      },
    }
  )
}
