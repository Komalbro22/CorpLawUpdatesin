import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 86400

export async function GET() {
  // Disabled under Hobby tier bandwidth safeguard to prevent aggressive bot crawler loops
  return new NextResponse('Company sitemaps currently disabled under bandwidth fair-use policy.', { status: 404 })
}
