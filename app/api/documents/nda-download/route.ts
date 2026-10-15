import { NextResponse } from 'next/server'
import {
  buildNdaDocx,
  buildNdaPdf,
  DEFAULT_SAMPLE_NDA_DATA,
  NdaFormData,
} from '@/lib/doc-generator/nda-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'docx'

    if (format === 'pdf') {
      const pdfBytes = await buildNdaPdf(DEFAULT_SAMPLE_NDA_DATA)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Non_Disclosure_Agreement_Sample.pdf"',
        },
      })
    }

    const buffer = await buildNdaDocx(DEFAULT_SAMPLE_NDA_DATA)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Non_Disclosure_Agreement_Sample.docx"',
      },
    })
  } catch (err: any) {
    console.error('[NDA GET Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate NDA document' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { format = 'docx', ...formData } = body
    const data: NdaFormData = { ...DEFAULT_SAMPLE_NDA_DATA, ...formData }

    const safeName = (data.disclosingPartyName || 'NDA')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30)

    if (format === 'pdf') {
      const pdfBytes = await buildNdaPdf(data)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="NDA_${safeName}.pdf"`,
        },
      })
    }

    const buffer = await buildNdaDocx(data)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="NDA_${safeName}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('[NDA POST Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate custom NDA document' }, { status: 500 })
  }
}
