import { NextResponse } from 'next/server'
import {
  buildMouDocx,
  buildMouPdf,
  buildNdaAddendumDocx,
  buildNdaAddendumPdf,
  MouFormData,
  MouType,
  MOU_TYPE_PRESETS,
} from '@/lib/doc-generator/mou-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') as MouType) || 'business_partnership'
    const format = searchParams.get('format') || 'docx'
    const isNda = searchParams.get('doc') === 'nda'

    const preset = MOU_TYPE_PRESETS[type] || MOU_TYPE_PRESETS.business_partnership

    const sampleData: Partial<MouFormData> = {
      mouType: type,
      title: preset.title,
      collaborationPurpose: preset.defaultPurpose,
      scopeOfWork: preset.scope,
      obligationsPartyA: preset.obligationsA,
      obligationsPartyB: preset.obligationsB,
      financialTermsDescription: preset.financials,
      intellectualPropertyTerms: preset.ipTerms,
      exclusivityTerms: preset.exclusivity,
    }

    if (isNda) {
      if (format === 'pdf') {
        const pdfBytes = await buildNdaAddendumPdf(sampleData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="MoU_NDA_Addendum_${type}.pdf"`,
          },
        })
      }
      const buffer = await buildNdaAddendumDocx(sampleData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="MoU_NDA_Addendum_${type}.docx"`,
        },
      })
    }

    // Default: Main MoU
    if (format === 'pdf') {
      const pdfBytes = await buildMouPdf(sampleData)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="MoU_Agreement_Format_${type}.pdf"`,
        },
      })
    }

    const buffer = await buildMouDocx(sampleData)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="MoU_Agreement_Format_${type}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('MoU specimen download error:', err)
    return NextResponse.json(
      { error: 'Failed to generate MoU specimen', details: err?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { formData, doc = 'mou', format = 'docx' } = body as {
      formData: Partial<MouFormData>
      doc: 'mou' | 'nda'
      format: 'docx' | 'pdf'
    }

    const safeName = (formData?.partyA?.name || 'MoU')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30)

    if (doc === 'nda') {
      if (format === 'pdf') {
        const pdfBytes = await buildNdaAddendumPdf(formData)
        return new Response(new Uint8Array(pdfBytes), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="MoU_NDA_Addendum_${safeName}.pdf"`,
          },
        })
      }
      const buffer = await buildNdaAddendumDocx(formData)
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="MoU_NDA_Addendum_${safeName}.docx"`,
        },
      })
    }

    // Default: Main MoU
    if (format === 'pdf') {
      const pdfBytes = await buildMouPdf(formData)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="MoU_Agreement_${safeName}.pdf"`,
        },
      })
    }

    const buffer = await buildMouDocx(formData)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="MoU_Agreement_${safeName}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('Custom MoU download error:', err)
    return NextResponse.json(
      { error: 'Failed to generate MoU document', details: err?.message },
      { status: 500 }
    )
  }
}
