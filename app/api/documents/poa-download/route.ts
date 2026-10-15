import { NextResponse } from 'next/server'
import {
  buildPoaDocx,
  buildPoaPdf,
  DEFAULT_SAMPLE_POA_DATA,
  PoaFormData,
} from '@/lib/doc-generator/poa-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'docx'

    if (format === 'pdf') {
      const pdfBytes = await buildPoaPdf(DEFAULT_SAMPLE_POA_DATA)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Power_of_Attorney_Sample.pdf"',
        },
      })
    }

    const buffer = await buildPoaDocx(DEFAULT_SAMPLE_POA_DATA)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Power_of_Attorney_Sample.docx"',
      },
    })
  } catch (err: any) {
    console.error('[POA GET Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate Power of Attorney document' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { format = 'docx', ...formData } = body
    const data: PoaFormData = { ...DEFAULT_SAMPLE_POA_DATA, ...formData }

    const safeName = (data.attorneyName || 'Attorney')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30)

    if (format === 'pdf') {
      const pdfBytes = await buildPoaPdf(data)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Power_of_Attorney_${safeName}.pdf"`,
        },
      })
    }

    const buffer = await buildPoaDocx(data)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Power_of_Attorney_${safeName}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('[POA POST Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate custom Power of Attorney document' }, { status: 500 })
  }
}
