import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { glossarySchema } from '@/lib/admin-schemas'
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
      .from('glossary').select('id, term, slug, definition, category, keywords, synonyms, is_verified, created_at, updated_at')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }

    return NextResponse.json({ term: data })
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

    const rawBody = await request.json()
    const parsed = glossarySchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
    }
    const body = parsed.data

    const { data: oldTerm, error: fetchError } = await supabaseAdmin
      .from('glossary')
      .select('slug')
      .eq('id', params.id)
      .single()

    if (fetchError || !oldTerm) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('glossary')
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

    revalidatePath('/glossary', 'layout')
    revalidatePath('/sitemap.xml')
    revalidatePath(`/glossary/${oldTerm.slug}`, 'page')
    if (body.slug && body.slug !== oldTerm.slug) {
      revalidatePath(`/glossary/${body.slug}`, 'page')
    }

    return NextResponse.json({ term: data })
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

    const { data: term } = await supabaseAdmin
      .from('glossary')
      .select('slug')
      .eq('id', params.id)
      .single()

    const { error } = await supabaseAdmin
      .from('glossary')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/glossary', 'layout')
    revalidatePath('/sitemap.xml')
    if (term?.slug) {
      revalidatePath(`/glossary/${term.slug}`, 'page')
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

    const rawBody = await request.json()
    const parsed = glossarySchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
    }
    const body = parsed.data

    const { data, error } = await supabaseAdmin
      .from('glossary')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    revalidatePath('/glossary', 'layout')
    revalidatePath('/sitemap.xml')
    if (data?.slug) {
      revalidatePath(`/glossary/${data.slug}`, 'page')
    }

    return NextResponse.json({ term: data })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
