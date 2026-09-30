import { NextResponse } from 'next/server'
import {
  buildEmploymentAgreementDocx,
  buildEmploymentAgreementPdf,
  EmploymentAgreementFormData,
  EmploymentType,
  EMPLOYMENT_PRESETS,
  DEFAULT_SAMPLE_EMPLOYMENT_DATA,
} from '@/lib/doc-generator/employment-agreement-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const preset = (searchParams.get('preset') as EmploymentType) || 'permanent_full_time'
    const format = searchParams.get('format') || 'docx'

    const presetConfig = EMPLOYMENT_PRESETS[preset] || EMPLOYMENT_PRESETS.permanent_full_time
    const sampleData: EmploymentAgreementFormData = {
      ...DEFAULT_SAMPLE_EMPLOYMENT_DATA,
      ...presetConfig.defaults,
    }

    const fileSlug = `Employment_Agreement_${sampleData.employeeName.replace(/[^a-zA-Z0-9]/g, '_')}_${sampleData.executionDate}`

    if (format === 'pdf') {
      const pdfBytes = await buildEmploymentAgreementPdf(sampleData)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileSlug}.pdf"`,
        },
      })
    }

    const docxBuffer = await buildEmploymentAgreementDocx(sampleData)
    return new Response(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileSlug}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('Employment Agreement GET download error:', err)
    return NextResponse.json(
      { error: 'Failed to generate specimen agreement', details: err?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, format = 'docx' } = body as {
      data: EmploymentAgreementFormData
      format: 'docx' | 'pdf'
    }

    const formData = data || DEFAULT_SAMPLE_EMPLOYMENT_DATA
    const cleanEmpName = (formData.employeeName || 'Employee').replace(/[^a-zA-Z0-9]/g, '_')
    const cleanDate = (formData.executionDate || '2026').replace(/[^a-zA-Z0-9]/g, '-')
    const fileSlug = `Employment_Agreement_${cleanEmpName}_${cleanDate}`

    if (format === 'pdf') {
      const pdfBytes = await buildEmploymentAgreementPdf(formData)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileSlug}.pdf"`,
        },
      })
    }

    const docxBuffer = await buildEmploymentAgreementDocx(formData)
    return new Response(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileSlug}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('Employment Agreement POST download error:', err)
    return NextResponse.json(
      { error: 'Failed to generate custom agreement', details: err?.message },
      { status: 500 }
    )
  }
}
