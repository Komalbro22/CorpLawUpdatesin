import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic'

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'ads.txt')
  const content = fs.readFileSync(filePath, 'utf8')
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
