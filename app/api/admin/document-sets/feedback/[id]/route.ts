import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { getDocumentSet } from '@/lib/document-sets-data'

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
    const { status, admin_note, changelog_entry } = body

    if (!status) {
      return NextResponse.json({ error: 'Missing status field' }, { status: 400 })
    }

    // 1. Update feedback item status
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (admin_note) {
      updatePayload.admin_note = admin_note
    }

    const { data: updatedFeedback, error: updateErr } = await supabaseAdmin
      .from('reader_feedback')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // 2. If status is fixed and changelog_entry provided, attach changelog to set (§11.5)
    let attachedChangelog = null
    if (status === 'fixed' && changelog_entry && changelog_entry.change_note) {
      const setSlug = changelog_entry.set_slug || 'director-appointment-set'
      const set = await getDocumentSet(setSlug)

      if (set) {
        const { data: logData, error: logErr } = await supabaseAdmin
          .from('document_set_changelog')
          .insert({
            set_id: set.id,
            version: changelog_entry.version || set.version,
            change_date: new Date().toISOString().split('T')[0],
            change_note: changelog_entry.change_note.trim(),
            instrument_reference:
              changelog_entry.instrument_reference || 'Feedback remediation (Reader report #' + id.slice(0, 8) + ')',
          })
          .select('*')
          .single()

        if (!logErr) {
          attachedChangelog = logData
        }
      }
    }

    return NextResponse.json({
      ok: true,
      feedback: updatedFeedback,
      attachedChangelog,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
