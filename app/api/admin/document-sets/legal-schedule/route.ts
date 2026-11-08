import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { getAllLegalScheduleItems } from '@/lib/legal-data-schedule'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await verifyAdminOrKey(req, 'document-sets:read')
  if (!auth.success) return auth.response

  try {
    const items = await getAllLegalScheduleItems()
    return NextResponse.json({ schedule: items })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
