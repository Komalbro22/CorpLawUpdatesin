import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminOrKey } from '@/lib/api-key-auth'
import { listAllDocumentSets, seedDocumentSetsIfEmpty } from '@/lib/document-sets-data'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await verifyAdminOrKey(req, 'document-sets:read')
  if (!auth.success) return auth.response

  try {
    const sets = await listAllDocumentSets()
    return NextResponse.json({ sets })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminOrKey(req, 'document-sets:write')
  if (!auth.success) return auth.response

  try {
    const body = await req.json()
    const { slug, title, event, route_type, quick_answer, description } = body

    if (!slug || !title || !quick_answer || !description) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: slug, title, quick_answer, description' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('document_sets')
      .insert({
        slug: slug.trim(),
        title: title.trim(),
        event: event || 'Corporate Action',
        route_type: route_type || 'Standard',
        quick_answer: quick_answer.trim(),
        description: description.trim(),
        status: body.status || 'draft',
        version: body.version || 'v1.0',
        law_as_at: body.law_as_at || new Date().toISOString().split('T')[0],
        last_verified: new Date().toISOString().split('T')[0],
        variant_tags: body.variant_tags || [],
        variant_notice: body.variant_notice || null,
        common_mistakes: body.common_mistakes || [],
        faqs: body.faqs || [],
        seo_title: body.seo_title || null,
        seo_description: body.seo_description || null,
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ set: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
