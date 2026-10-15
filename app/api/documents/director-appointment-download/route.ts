import { NextResponse } from 'next/server'
import {
  buildDirectorAppointmentDocx,
  buildDirectorAppointmentPdf,
  DEFAULT_SAMPLE_DIRECTOR_APPOINTMENT_DATA,
  DirectorAppointmentFormData,
} from '@/lib/doc-generator/director-appointment-generator'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'docx'

    if (format === 'pdf') {
      const pdfBytes = await buildDirectorAppointmentPdf(DEFAULT_SAMPLE_DIRECTOR_APPOINTMENT_DATA)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Director_Appointment_Letter_Sample.pdf"',
        },
      })
    }

    const buffer = await buildDirectorAppointmentDocx(DEFAULT_SAMPLE_DIRECTOR_APPOINTMENT_DATA)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Director_Appointment_Letter_Sample.docx"',
      },
    })
  } catch (err: any) {
    console.error('[Director Appointment GET Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate appointment letter' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { format = 'docx', ...formData } = body
    const data: DirectorAppointmentFormData = { ...DEFAULT_SAMPLE_DIRECTOR_APPOINTMENT_DATA, ...formData }

    const safeName = (data.directorName || 'Director')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30)

    if (format === 'pdf') {
      const pdfBytes = await buildDirectorAppointmentPdf(data)
      return new Response(new Uint8Array(pdfBytes), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Appointment_Letter_${safeName}.pdf"`,
        },
      })
    }

    const buffer = await buildDirectorAppointmentDocx(data)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Appointment_Letter_${safeName}.docx"`,
      },
    })
  } catch (err: any) {
    console.error('[Director Appointment POST Download Error]:', err)
    return NextResponse.json({ error: 'Failed to generate appointment letter' }, { status: 500 })
  }
}
