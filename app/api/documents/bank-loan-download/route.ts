import { NextResponse } from 'next/server'
import {
  buildBankLoanBoardResolutionDocx,
  buildBankLoanBoardResolutionPdf,
  buildBankLoanSpecialResolutionDocx,
  buildBankLoanSpecialResolutionPdf,
  buildBankCoveringLetterDocx,
  buildBankCoveringLetterPdf,
  buildChg1ExtractDocx,
  buildChg1ExtractPdf,
  BankLoanFormData,
  LoanFacilityType,
} from '@/lib/doc-generator/bank-loan-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'blank-docx'
    const facility = (searchParams.get('facility') as LoanFacilityType) || 'term_loan'

    if (type === 'blank-docx') {
      const buffer = await buildBankLoanBoardResolutionDocx({ facilityType: facility })
      const filename = `Board_Resolution_Bank_Loan_${facility}.docx`
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
      const pdfBytes = await buildBankLoanBoardResolutionPdf({ facilityType: facility })
      const filename = `Board_Resolution_Bank_Loan_${facility}.pdf`
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    if (type === 'special-resolution-docx') {
      const buffer = await buildBankLoanSpecialResolutionDocx({ facilityType: facility })
      const filename = `Special_Resolution_Section_180_1_c_Borrowing.docx`
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    if (type === 'special-resolution-pdf') {
      const pdfBytes = await buildBankLoanSpecialResolutionPdf({ facilityType: facility })
      const filename = `Special_Resolution_Section_180_1_c_Borrowing.pdf`
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    if (type === 'bank-letter-docx') {
      const buffer = await buildBankCoveringLetterDocx({ facilityType: facility })
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="Bank_Submission_Covering_Letter.docx"',
        },
      })
    }

    if (type === 'bank-letter-pdf') {
      const pdfBytes = await buildBankCoveringLetterPdf({ facilityType: facility })
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Bank_Submission_Covering_Letter.pdf"',
        },
      })
    }

    if (type === 'chg1-extract-docx') {
      const buffer = await buildChg1ExtractDocx({ facilityType: facility })
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="CHG1_Board_Resolution_Extract.docx"',
        },
      })
    }

    if (type === 'chg1-extract-pdf') {
      const pdfBytes = await buildChg1ExtractPdf({ facilityType: facility })
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="CHG1_Board_Resolution_Extract.pdf"',
        },
      })
    }

    return NextResponse.json({ error: 'Invalid document type requested' }, { status: 400 })
  } catch (err: any) {
    console.error('Bank Loan Download GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, format, type = 'resolution' } = body as {
      data: BankLoanFormData
      format: 'docx' | 'pdf' | 'bank-letter'
      type?: 'resolution' | 'special-resolution' | 'bank-letter' | 'chg1-extract'
    }

    const companySlug = (data?.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')
    const facilitySlug = data?.facilityType || 'term_loan'

    // PDF Handlers
    if (format === 'pdf') {
      if (type === 'bank-letter') {
        const pdfBytes = await buildBankCoveringLetterPdf(data)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Bank_Covering_Letter_${companySlug}.pdf"`,
          },
        })
      }

      if (type === 'special-resolution') {
        const pdfBytes = await buildBankLoanSpecialResolutionPdf(data)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Special_Resolution_Section_180_${companySlug}.pdf"`,
          },
        })
      }

      if (type === 'chg1-extract') {
        const pdfBytes = await buildChg1ExtractPdf(data)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="CHG1_Resolution_Extract_${companySlug}.pdf"`,
          },
        })
      }

      // Default: Board Resolution PDF
      const pdfBytes = await buildBankLoanBoardResolutionPdf(data)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Board_Resolution_Bank_Loan_${facilitySlug}_${companySlug}.pdf"`,
        },
      })
    }

    // DOCX Handlers
    if (format === 'bank-letter' || type === 'bank-letter') {
      const buffer = await buildBankCoveringLetterDocx(data)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Bank_Covering_Letter_${companySlug}.docx"`,
        },
      })
    }

    if (type === 'special-resolution') {
      const buffer = await buildBankLoanSpecialResolutionDocx(data)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Special_Resolution_Section_180_${companySlug}.docx"`,
        },
      })
    }

    if (type === 'chg1-extract') {
      const buffer = await buildChg1ExtractDocx(data)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="CHG1_Resolution_Extract_${companySlug}.docx"`,
        },
      })
    }

    // Default: Board Resolution DOCX
    const buffer = await buildBankLoanBoardResolutionDocx(data)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Board_Resolution_Bank_Loan_${facilitySlug}_${companySlug}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('Bank Loan Download POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
