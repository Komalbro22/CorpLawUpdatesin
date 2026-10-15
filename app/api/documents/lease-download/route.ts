import { NextResponse } from 'next/server'
import {
  buildLeaseDocx,
  buildLeasePdf,
  DEFAULT_SAMPLE_LEASE_DATA,
  LeaseFormData,
} from '@/lib/doc-generator/lease-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'docx'

    if (format === 'pdf') {
      const pdfBytes = await buildLeasePdf(DEFAULT_SAMPLE_LEASE_DATA)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Rent_Lease_Agreement_Sample.pdf"',
        },
      })
    }

    const buffer = await buildLeaseDocx(DEFAULT_SAMPLE_LEASE_DATA)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Rent_Lease_Agreement_Sample.docx"',
      },
    })
  } catch (err: any) {
    console.error('[Lease GET Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate Rent/Lease document' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { format = 'docx', ...formData } = body
    const data: LeaseFormData = { ...DEFAULT_SAMPLE_LEASE_DATA, ...formData }

    const safeName = (data.lesseeName || 'Tenant')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30)

    if (format === 'pdf') {
      const pdfBytes = await buildLeasePdf(data)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Rent_Agreement_${safeName}.pdf"`,
        },
      })
    }

    const buffer = await buildLeaseDocx(data)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Rent_Agreement_${safeName}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('[Lease POST Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate custom Lease document' }, { status: 500 })
  }
}
