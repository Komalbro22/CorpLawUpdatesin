import { NextRequest, NextResponse } from 'next/server'
import { getOrFetchCompany } from '@/lib/company-sync'
import { calculateCompanyComplianceFlags } from '@/lib/company-compliance'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cin: string }> }
) {
  const { cin } = await params
  if (!cin) {
    return NextResponse.json({ error: 'CIN is required' }, { status: 400 })
  }

  const company = await getOrFetchCompany(cin)

  if (!company) {
    return NextResponse.json({ error: 'Company not found or invalid CIN' }, { status: 404 })
  }

  const complianceFlags = calculateCompanyComplianceFlags(company)

  return NextResponse.json({
    company,
    complianceFlags,
  })
}
