import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { evictLruCompanies } from '@/lib/company-sync'

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const thresholdMb = body.thresholdMb ? parseInt(body.thresholdMb) : 400

    const result = await evictLruCompanies(thresholdMb)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Eviction failed' }, { status: 500 })
  }
}
