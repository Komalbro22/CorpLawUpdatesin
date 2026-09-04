import { NextResponse } from 'next/server'
import {
  buildRegisteredOfficeBoardResolutionDocx,
  buildRegisteredOfficeBoardResolutionPdf,
  buildBankIntimationLetterDocx,
  RegisteredOfficeFormData,
} from '@/lib/doc-generator/registered-office-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'blank-docx'

    if (type === 'blank-docx') {
      const buffer = await buildRegisteredOfficeBoardResolutionDocx({})
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Board_Resolution_Registered_Office_Change_Same_City.docx"',
        },
      })
    }

    if (type === 'blank-pdf') {
      const pdfBytes = await buildRegisteredOfficeBoardResolutionPdf({})
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Board_Resolution_Registered_Office_Change_Same_City.pdf"',
        },
      })
    }

    if (type === 'bank-letter-docx') {
      const buffer = await buildBankIntimationLetterDocx({})
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Bank_Intimation_Letter_Registered_Office_Address_Change.docx"',
        },
      })
    }

    return NextResponse.json({ error: 'Invalid document type requested' }, { status: 400 })
  } catch (err: any) {
    console.error('Registered Office Download GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, format } = body as {
      data: RegisteredOfficeFormData
      format: 'docx' | 'pdf' | 'bank-letter'
    }

    const companySlug = (data?.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')

    if (format === 'docx') {
      const buffer = await buildRegisteredOfficeBoardResolutionDocx(data)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Board_Resolution_Registered_Office_${companySlug}.docx"`,
        },
      })
    }

    if (format === 'pdf') {
      const pdfBytes = await buildRegisteredOfficeBoardResolutionPdf(data)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Board_Resolution_Registered_Office_${companySlug}.pdf"`,
        },
      })
    }

    if (format === 'bank-letter') {
      const buffer = await buildBankIntimationLetterDocx(data)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Bank_Intimation_Letter_${companySlug}.docx"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format requested' }, { status: 400 })
  } catch (err: any) {
    console.error('Registered Office Download POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
