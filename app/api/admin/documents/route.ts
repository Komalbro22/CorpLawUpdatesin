import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    void cookies()
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .select('*')
      .order('usage_count', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ templates: data ?? [] })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    void cookies()
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Generate or clean slug from name if not provided
    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }

    // Set defaults if not provided
    if (body.is_active === undefined) body.is_active = true
    if (body.is_free === undefined) body.is_free = true
    if (body.usage_count === undefined) body.usage_count = 0
    if (body.display_order === undefined) body.display_order = 0
    if (!body.fields) body.fields = []

    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/documents', 'layout')
    if (data?.slug) {
      revalidatePath(`/documents/${data.slug}`, 'page')
    }

    return NextResponse.json({ template: data })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
