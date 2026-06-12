import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    void cookies()
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .select('*')
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    void cookies()
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: oldTemplate, error: fetchError } = await supabaseAdmin
      .from('document_templates')
      .select('slug')
      .eq('id', params.id)
      .single()

    if (fetchError || !oldTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    revalidatePath('/documents', 'layout')
    revalidatePath('/sitemap.xml')
    revalidatePath(`/documents/${oldTemplate.slug}`, 'page')
    if (body.slug && body.slug !== oldTemplate.slug) {
      revalidatePath(`/documents/${body.slug}`, 'page')
    }

    return NextResponse.json({ template: data })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    void cookies()
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: template } = await supabaseAdmin
      .from('document_templates')
      .select('slug')
      .eq('id', params.id)
      .single()

    const { error } = await supabaseAdmin
      .from('document_templates')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/documents', 'layout')
    revalidatePath('/sitemap.xml')
    if (template?.slug) {
      revalidatePath(`/documents/${template.slug}`, 'page')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    void cookies()
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('document_templates')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/documents', 'layout')
    revalidatePath('/sitemap.xml')
    if (data?.slug) {
      revalidatePath(`/documents/${data.slug}`, 'page')
    }

    return NextResponse.json({ template: data })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
