import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidateDocumentMutation } from '@/lib/content-revalidation'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { documentTemplateSchema } from '@/lib/admin-schemas'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void cookies()
    if (!await verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .select('*')
      .eq('id', (await params).id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ template: data })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void cookies()
    if (!await verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json()
    const parsed = documentTemplateSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
    }
    const body = parsed.data

    const { data: oldTemplate, error: fetchError } = await supabaseAdmin
      .from('document_templates')
      .select('slug')
      .eq('id', (await params).id)
      .single()

    if (fetchError || !oldTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .update(body)
      .eq('id', (await params).id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    revalidateDocumentMutation(body.slug || oldTemplate.slug, oldTemplate.slug)

    return NextResponse.json({ template: data })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void cookies()
    if (!await verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: template } = await supabaseAdmin
      .from('document_templates')
      .select('slug')
      .eq('id', (await params).id)
      .single()

    const { error } = await supabaseAdmin
      .from('document_templates')
      .delete()
      .eq('id', (await params).id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateDocumentMutation(template?.slug)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void cookies()
    if (!await verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rawBody = await request.json()
    const parsed = documentTemplateSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
    }
    const body = parsed.data

    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .update(body)
      .eq('id', (await params).id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidateDocumentMutation(data?.slug)

    return NextResponse.json({ template: data })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
