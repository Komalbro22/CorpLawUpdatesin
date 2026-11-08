import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { getDocumentSet, archiveDocumentSetInDb } from '@/lib/document-sets-data'

export const dynamic = 'force-dynamic'

interface RouteProps {
  params: Promise<{ slug: string }>
}

export async function POST(req: NextRequest, props: RouteProps) {
  const auth = await verifyAdminOrKey(req, 'document-sets:write')
  if (!auth.success) return auth.response

  const { slug } = await props.params
  const existing = await getDocumentSet(slug)

  if (!existing) {
    return NextResponse.json({ error: `Document set '${slug}' not found` }, { status: 404 })
  }

  // Deleting a published set is refused per §11.1 & §11.7; archive instead
  const archived = await archiveDocumentSetInDb(slug)
  const refreshed = await getDocumentSet(slug)

  return NextResponse.json({ ok: true, status: 'archived', set: refreshed || archived })
}
