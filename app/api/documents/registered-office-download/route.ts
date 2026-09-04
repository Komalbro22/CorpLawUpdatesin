import { NextResponse } from 'next/server'
import {
  buildRegisteredOfficeBoardResolutionDocx,
  buildRegisteredOfficeBoardResolutionPdf,
  buildSpecialResolutionDocx,
  buildFormInc26Docx,
  buildBankIntimationLetterDocx,
  RegisteredOfficeFormData,
  ShiftingScope,
} from '@/lib/doc-generator/registered-office-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'blank-docx'
    const scope = (searchParams.get('scope') as ShiftingScope) || 'same_city'

    if (type === 'blank-docx') {
      const buffer = await buildRegisteredOfficeBoardResolutionDocx({ shiftingScope: scope })
      const filename = `Board_Resolution_Registered_Office_${scope}.docx`
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    if (type === 'blank-pdf') {
      const pdfBytes = await buildRegisteredOfficeBoardResolutionPdf({ shiftingScope: scope })
      const filename = `Board_Resolution_Registered_Office_${scope}.pdf`
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    if (type === 'special-resolution-docx') {
      const buffer = await buildSpecialResolutionDocx({ shiftingScope: scope })
      const filename = `Special_Resolution_EGM_Notice_Section102_${scope}.docx`
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    if (type === 'inc26-notice-docx') {
      const buffer = await buildFormInc26Docx({ shiftingScope: scope })
      const filename = `Form_INC26_Newspaper_Notice_${scope}.docx`
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    if (type === 'bank-letter-docx') {
      const buffer = await buildBankIntimationLetterDocx({})
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition':
            'attachment; filename="Bank_Intimation_Letter_Registered_Office_Address_Change.docx"',
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
    const { data, format, type = 'resolution' } = body as {
      data: RegisteredOfficeFormData
      format: 'docx' | 'pdf' | 'bank-letter'
      type?: 'resolution' | 'special-resolution' | 'inc26-notice' | 'bank-letter'
    }

    const companySlug = (data?.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')
    const scope = data?.shiftingScope || 'same_city'

    // 1. Bank Intimation Letter
    if (format === 'bank-letter' || type === 'bank-letter') {
      const buffer = await buildBankIntimationLetterDocx(data)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Bank_Intimation_Letter_${companySlug}.docx"`,
        },
      })
    }

    // 2. Special Resolution & Section 102 Explanatory Statement
    if (type === 'special-resolution') {
      const buffer = await buildSpecialResolutionDocx(data)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Special_Resolution_EGM_Notice_${companySlug}.docx"`,
        },
      })
    }

    // 3. Form INC-26 Newspaper Notice
    if (type === 'inc26-notice') {
      const buffer = await buildFormInc26Docx(data)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Form_INC26_Newspaper_Notice_${companySlug}.docx"`,
        },
      })
    }

    // 4. Board Resolution DOCX
    if (format === 'docx') {
      const buffer = await buildRegisteredOfficeBoardResolutionDocx(data)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Board_Resolution_Registered_Office_${scope}_${companySlug}.docx"`,
        },
      })
    }

    // 5. Board Resolution PDF
    if (format === 'pdf') {
      const pdfBytes = await buildRegisteredOfficeBoardResolutionPdf(data)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Board_Resolution_Registered_Office_${scope}_${companySlug}.pdf"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format requested' }, { status: 400 })
  } catch (err: any) {
    console.error('Registered Office Download POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
