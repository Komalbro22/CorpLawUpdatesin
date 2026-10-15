import { NextResponse } from 'next/server'
import {
  buildBankGuaranteeDocx,
  buildBankGuaranteePdf,
  DEFAULT_SAMPLE_BANK_GUARANTEE_DATA,
  BankGuaranteeFormData,
} from '@/lib/doc-generator/bank-guarantee-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'docx'

    if (format === 'pdf') {
      const pdfBytes = await buildBankGuaranteePdf(DEFAULT_SAMPLE_BANK_GUARANTEE_DATA)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Bank_Guarantee_Sample.pdf"',
        },
      })
    }

    const buffer = await buildBankGuaranteeDocx(DEFAULT_SAMPLE_BANK_GUARANTEE_DATA)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Bank_Guarantee_Sample.docx"',
      },
    })
  } catch (err: any) {
    console.error('[Bank Guarantee GET Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate Bank Guarantee' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { format = 'docx', ...formData } = body
    const data: BankGuaranteeFormData = { ...DEFAULT_SAMPLE_BANK_GUARANTEE_DATA, ...formData }

    const safeNumber = (data.bgNumber || 'BG')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30)

    if (format === 'pdf') {
      const pdfBytes = await buildBankGuaranteePdf(data)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Bank_Guarantee_${safeNumber}.pdf"`,
        },
      })
    }

    const buffer = await buildBankGuaranteeDocx(data)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Bank_Guarantee_${safeNumber}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('[Bank Guarantee POST Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate Bank Guarantee' }, { status: 500 })
  }
}
