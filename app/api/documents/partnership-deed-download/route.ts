import { NextResponse } from 'next/server'
import {
  buildPartnershipDeedDocx,
  buildPartnershipDeedPdf,
  buildRofForm1Docx,
  buildRofForm1Pdf,
  buildBankMandateDocx,
  buildBankMandatePdf,
  PartnershipDeedFormData,
  FirmCategory,
  PARTNERSHIP_PRESETS,
  DEFAULT_SAMPLE_PARTNERSHIP_DATA,
} from '@/lib/doc-generator/partnership-deed-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = (searchParams.get('category') as FirmCategory) || 'general_at_will'
    const format = searchParams.get('format') || 'docx'
    const doc = searchParams.get('doc') || 'deed'

    const preset = PARTNERSHIP_PRESETS[category] || PARTNERSHIP_PRESETS.general_at_will

    const sampleData: Partial<PartnershipDeedFormData> = {
      category,
      firmName: preset.suggestedFirmName,
      durationYears: preset.defaultDuration,
      businessObjects: preset.defaultObjects,
    }

    const firmSlug = (preset.suggestedFirmName || 'Partnership_Firm').replace(/[^a-zA-Z0-9]/g, '_')

    if (doc === 'rof-form-1') {
      if (format === 'pdf') {
        const pdfBytes = await buildRofForm1Pdf(sampleData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="ROF_Form_1_${firmSlug}.pdf"`,
          },
        })
      }
      const buffer = await buildRofForm1Docx(sampleData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="ROF_Form_1_${firmSlug}.docx"`,
        },
      })
    }

    if (doc === 'bank-mandate') {
      if (format === 'pdf') {
        const pdfBytes = await buildBankMandatePdf(sampleData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Bank_Account_Mandate_${firmSlug}.pdf"`,
          },
        })
      }
      const buffer = await buildBankMandateDocx(sampleData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Bank_Account_Mandate_${firmSlug}.docx"`,
        },
      })
    }

    // Default: Main Partnership Deed
    if (format === 'pdf') {
      const pdfBytes = await buildPartnershipDeedPdf(sampleData)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Partnership_Deed_${category}.pdf"`,
        },
      })
    }

    const buffer = await buildPartnershipDeedDocx(sampleData)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Partnership_Deed_${category}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('Partnership Deed GET download error:', err)
    return NextResponse.json({ error: 'Failed to generate specimen document', details: err?.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      data,
      format = 'docx',
      doc = 'deed',
    } = body as {
      data: PartnershipDeedFormData
      format: 'docx' | 'pdf'
      doc?: 'deed' | 'rof-form-1' | 'bank-mandate'
    }

    const formData = data || DEFAULT_SAMPLE_PARTNERSHIP_DATA
    const firmSlug = (formData.firmName || 'Partnership_Firm').replace(/[^a-zA-Z0-9]/g, '_')

    if (doc === 'rof-form-1') {
      if (format === 'pdf') {
        const pdfBytes = await buildRofForm1Pdf(formData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="ROF_Form_1_${firmSlug}.pdf"`,
          },
        })
      }
      const buffer = await buildRofForm1Docx(formData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="ROF_Form_1_${firmSlug}.docx"`,
        },
      })
    }

    if (doc === 'bank-mandate') {
      if (format === 'pdf') {
        const pdfBytes = await buildBankMandatePdf(formData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Bank_Account_Mandate_${firmSlug}.pdf"`,
          },
        })
      }
      const buffer = await buildBankMandateDocx(formData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Bank_Account_Mandate_${firmSlug}.docx"`,
        },
      })
    }

    // Default: Main Partnership Deed
    if (format === 'pdf') {
      const pdfBytes = await buildPartnershipDeedPdf(formData)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Partnership_Deed_${firmSlug}.pdf"`,
        },
      })
    }

    const buffer = await buildPartnershipDeedDocx(formData)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Partnership_Deed_${firmSlug}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('Partnership Deed POST download error:', err)
    return NextResponse.json({ error: 'Failed to generate custom document', details: err?.message }, { status: 500 })
  }
}
