import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { getDocumentSet, updateDocumentSetInDb } from '@/lib/document-sets-data'

export const dynamic = 'force-dynamic'

interface RouteProps {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, props: RouteProps) {
  const auth = await verifyAdminOrKey(req, 'document-sets:read')
  if (!auth.success) return auth.response

  const { slug } = await props.params
  const fullSet = await getDocumentSet(slug)

  if (!fullSet) {
    return NextResponse.json({ error: `Document set '${slug}' not found` }, { status: 404 })
  }

  return NextResponse.json({ set: fullSet })
}

export async function PATCH(req: NextRequest, props: RouteProps) {
  const auth = await verifyAdminOrKey(req, 'document-sets:write')
  if (!auth.success) return auth.response

  const { slug } = await props.params
  const existing = await getDocumentSet(slug)

  if (!existing) {
    return NextResponse.json({ error: `Document set '${slug}' not found` }, { status: 404 })
  }

  try {
    const body = await req.json()
    const allowedFields = [
      'title',
      'quick_answer',
      'description',
      'variant_tags',
      'variant_notice',
      'reviewer_name',
      'reviewer_status',
      'reviewer_date',
      'law_as_at',
      'version',
      'common_mistakes',
      'faqs',
      'seo_title',
      'seo_description',
      'display_order',
    ]

    const updates: Record<string, any> = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key]
      }
    }

    const updated = await updateDocumentSetInDb(slug, updates)
    // Read-back pattern (§11.7)
    const refreshed = await getDocumentSet(slug)

    return NextResponse.json({ set: refreshed || updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
