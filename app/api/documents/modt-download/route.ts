import { NextResponse } from 'next/server'
import {
  buildModtDocx,
  buildModtPdf,
  buildUndertakingDocx,
  buildUndertakingPdf,
  buildLetterOfDepositDocx,
  buildLetterOfDepositPdf,
  buildChg1ExtractDocx,
  buildChg1ExtractPdf,
  ModtFormData,
  ModtDocumentType,
} from '@/lib/doc-generator/modt-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') as ModtDocumentType) || 'modt'
    const format = searchParams.get('format') || 'docx'

    if (type === 'modt') {
      if (format === 'pdf') {
        const pdfBytes = await buildModtPdf({})
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="Memorandum_of_Deposit_of_Title_Deeds_MODT.pdf"',
          },
        })
      }
      const buffer = await buildModtDocx({})
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Memorandum_of_Deposit_of_Title_Deeds_MODT.docx"',
        },
      })
    }

    if (type === 'undertaking') {
      if (format === 'pdf') {
        const pdfBytes = await buildUndertakingPdf({})
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="Mortgagor_Declaration_Undertaking.pdf"',
          },
        })
      }
      const buffer = await buildUndertakingDocx({})
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Mortgagor_Declaration_Undertaking.docx"',
        },
      })
    }

    if (type === 'letter_of_deposit') {
      if (format === 'pdf') {
        const pdfBytes = await buildLetterOfDepositPdf({})
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="Bank_Covering_Letter_Deposit_of_Deeds.pdf"',
          },
        })
      }
      const buffer = await buildLetterOfDepositDocx({})
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Bank_Covering_Letter_Deposit_of_Deeds.docx"',
        },
      })
    }

    if (type === 'chg1_extract') {
      if (format === 'pdf') {
        const pdfBytes = await buildChg1ExtractPdf({})
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="Board_Resolution_MODT_CHG-1_Extract.pdf"',
          },
        })
      }
      const buffer = await buildChg1ExtractDocx({})
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Board_Resolution_MODT_CHG-1_Extract.docx"',
        },
      })
    }

    return NextResponse.json({ error: 'Invalid document type requested' }, { status: 400 })
  } catch (err: any) {
    console.error('Specimen download error:', err)
    return NextResponse.json(
      { error: 'Failed to generate specimen document', details: err?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { formData, documentType = 'modt', format = 'docx' } = body as {
      formData: Partial<ModtFormData>
      documentType: ModtDocumentType
      format: 'docx' | 'pdf'
    }

    const safeName = (formData?.companyName || formData?.mortgagorName || 'MODT')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 35)

    if (documentType === 'modt') {
      if (format === 'pdf') {
        const pdfBytes = await buildModtPdf(formData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="MODT_${safeName}.pdf"`,
          },
        })
      }
      const buffer = await buildModtDocx(formData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="MODT_${safeName}.docx"`,
        },
      })
    }

    if (documentType === 'undertaking') {
      if (format === 'pdf') {
        const pdfBytes = await buildUndertakingPdf(formData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Undertaking_${safeName}.pdf"`,
          },
        })
      }
      const buffer = await buildUndertakingDocx(formData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Undertaking_${safeName}.docx"`,
        },
      })
    }

    if (documentType === 'letter_of_deposit') {
      if (format === 'pdf') {
        const pdfBytes = await buildLetterOfDepositPdf(formData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Bank_Letter_${safeName}.pdf"`,
          },
        })
      }
      const buffer = await buildLetterOfDepositDocx(formData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Bank_Letter_${safeName}.docx"`,
        },
      })
    }

    if (documentType === 'chg1_extract') {
      if (format === 'pdf') {
        const pdfBytes = await buildChg1ExtractPdf(formData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="CHG1_Resolution_${safeName}.pdf"`,
          },
        })
      }
      const buffer = await buildChg1ExtractDocx(formData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="CHG1_Resolution_${safeName}.docx"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid document type requested' }, { status: 400 })
  } catch (err: any) {
    console.error('Custom document download error:', err)
    return NextResponse.json(
      { error: 'Failed to generate document', details: err?.message },
      { status: 500 }
    )
  }
}
