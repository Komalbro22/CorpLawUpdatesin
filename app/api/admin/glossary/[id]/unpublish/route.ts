import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidateGlossaryMutation } from '@/lib/content-revalidation'
import { verifyAdminOrKey, logApiAudit, getClientIp } from '@/lib/api-key-auth'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminOrKey(request, 'glossary:write')
  if (!authCheck.success) {
    return authCheck.response
  }

  const { id } = await params
  const clientIp = getClientIp(request)

  try {
    const { data: updatedTerm, error } = await supabaseAdmin
      .from('glossary')
      .update({ is_verified: false })
      .eq('id', id)
      .select()
      .single()

    if (error || !updatedTerm) {
      return NextResponse.json({ error: 'Glossary term not found' }, { status: 404 })
    }

    revalidateGlossaryMutation(updatedTerm.slug)

    if (authCheck.auth.type === 'api_key') {
      await logApiAudit({
        keyId: authCheck.auth.key.id,
        keyName: authCheck.auth.key.name,
        action: 'glossary:unpublish',
        entityType: 'glossary',
        entityId: id,
        ip: clientIp,
        status: 'success',
        details: { slug: updatedTerm.slug, term: updatedTerm.term },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Glossary term unpublished successfully',
      term: updatedTerm,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
