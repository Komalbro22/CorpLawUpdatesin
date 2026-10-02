import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 86400

export async function GET() {
  return new NextResponse('Company sitemaps currently disabled under bandwidth fair-use policy.', { status: 404 })
}
