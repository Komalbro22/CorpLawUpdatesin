import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours

export async function GET() {
  const content = `# CorpLawUpdates.in does not sell digital advertising inventory.
# No authorized sellers.
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
