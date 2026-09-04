import { NextResponse } from 'next/server'
import {
  buildSh4Docx,
  buildBoardResolutionDocx,
  buildSh4Pdf,
  Sh4FormData,
} from '@/lib/doc-generator/sh4-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'blank-docx'

    if (type === 'blank-docx') {
      const buffer = await buildSh4Docx({})
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Form_SH-4_Securities_Transfer_Deed_Blank.docx"',
        },
      })
    }

    if (type === 'blank-pdf') {
      const pdfBytes = await buildSh4Pdf({})
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Form_SH-4_Securities_Transfer_Deed_Blank.pdf"',
        },
      })
    }

    if (type === 'board-resolution-docx') {
      const buffer = await buildBoardResolutionDocx({})
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Board_Resolution_Share_Transfer_Section_56.docx"',
        },
      })
    }

    return NextResponse.json({ error: 'Invalid document type requested' }, { status: 400 })
  } catch (err: any) {
    console.error('SH-4 Download GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, format } = body as { data: Sh4FormData; format: 'docx' | 'pdf' | 'board-resolution' }

    if (format === 'board-resolution') {
      const buffer = await buildBoardResolutionDocx(data)
      const companySlug = (data.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Board_Resolution_Share_Transfer_${companySlug}.docx"`,
        },
      })
    }

    if (format === 'pdf') {
      const pdfBytes = await buildSh4Pdf(data)
      const companySlug = (data.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Form_SH-4_${companySlug}.pdf"`,
        },
      })
    }

    // Default to docx
    const buffer = await buildSh4Docx(data)
    const companySlug = (data.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Form_SH-4_${companySlug}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('SH-4 Download POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
