import { NextRequest, NextResponse } from 'next/server'
import { getOrFetchCompany } from '@/lib/company-sync'
import { calculateCompanyComplianceFlags } from '@/lib/company-compliance'
import { generateCompanyPdfBuffer } from '@/lib/pdf/generateCompanyPdf'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cin: string }> }
) {
  const { cin } = await params
  if (!cin) {
    return NextResponse.json({ error: 'CIN parameter required' }, { status: 400 })
  }

  const company = await getOrFetchCompany(cin)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const flags = calculateCompanyComplianceFlags(company)
  const pdfBuffer = generateCompanyPdfBuffer(company, flags)

  // Increment pdf_downloads_count
  if (supabaseDocumentsAdmin) {
    try {
      await supabaseDocumentsAdmin
        .from('companies_master')
        .update({ pdf_downloads_count: (company.pdf_downloads_count || 0) + 1 })
        .eq('cin', company.cin)
    } catch (e) {
      console.error('Failed to increment PDF count:', e)
    }
  }

  const filename = `${company.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Compliance_Report.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
