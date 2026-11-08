import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { updateLegalScheduleItemInDb, getAllLegalScheduleItems } from '@/lib/legal-data-schedule'

export const dynamic = 'force-dynamic'

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, props: RouteProps) {
  const auth = await verifyAdminOrKey(req, 'document-sets:write')
  if (!auth.success) return auth.response

  const { id } = await props.params

  try {
    const body = await req.json()
    const { data_value, source_reference, label, governing_section } = body

    if (!source_reference || typeof source_reference !== 'string' || source_reference.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            'Mandatory field missing: source_reference is required for every legal schedule update (§11.3 & §11.7).',
        },
        { status: 400 }
      )
    }

    if (!data_value || typeof data_value !== 'object') {
      return NextResponse.json(
        { error: 'Mandatory field missing or invalid: data_value object is required.' },
        { status: 400 }
      )
    }

    const updated = await updateLegalScheduleItemInDb(id, {
      data_value,
      source_reference: source_reference.trim(),
      label,
      governing_section,
    })

    return NextResponse.json({ ok: true, scheduleItem: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
