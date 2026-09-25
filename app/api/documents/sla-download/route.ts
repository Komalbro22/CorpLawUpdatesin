import { NextResponse } from 'next/server'
import {
  buildSlaDocx,
  buildSlaPdf,
  SlaFormData,
  SlaType,
  SLA_PRESETS,
} from '@/lib/doc-generator/sla-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') as SlaType) || 'it_saas'
    const format = searchParams.get('format') || 'docx'

    const preset = SLA_PRESETS[type] || SLA_PRESETS.it_saas

    const defaultData: Partial<SlaFormData> = {
      slaType: type,
      title: preset.title,
      effectiveDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      servicesDescription: preset.servicesDefault,
      uptimeTarget: preset.uptimeDefault,
      maintenanceWindow: preset.maintenanceDefault,
      creditPercentage: preset.creditDefault,
      penaltyCap: preset.capDefault,
      arbitrationSeat: 'New Delhi',
      termMonths: '12',
    }

    if (format === 'pdf') {
      const pdfBytes = await buildSlaPdf(defaultData)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Service_Level_Agreement_${type}.pdf"`,
        },
      })
    }

    // Default DOCX
    const buffer = await buildSlaDocx(defaultData)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Service_Level_Agreement_${type}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('[SLA Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate SLA document' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { format = 'docx', ...formData } = body

    if (format === 'pdf') {
      const pdfBytes = await buildSlaPdf(formData)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Service_Level_Agreement_Custom.pdf"`,
        },
      })
    }

    const buffer = await buildSlaDocx(formData)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Service_Level_Agreement_Custom.docx"`,
      },
    })
  } catch (err: any) {
    console.error('[SLA Custom Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate custom SLA document' }, { status: 500 })
  }
}
