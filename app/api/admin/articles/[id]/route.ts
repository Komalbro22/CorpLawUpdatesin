/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { submitArticleToIndexNow } from '@/lib/indexnow'
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: article, error } = await supabaseAdmin
            .from('updates').select('id, title, slug, summary, content, category, published_at, updated_at, is_featured, effective_date, featured_image_url, impact_level, source_name, source_url, sources, key_change, key_changes, tags, views, seo_title, seo_description')
            .eq('id', params.id)
            .single()

        if (error || !article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        return NextResponse.json(article)
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        const { data: oldArticle, error: fetchError } = await supabaseAdmin
            .from('updates').select('id, title, slug, summary, content, category, published_at, updated_at, is_featured, effective_date, featured_image_url, impact_level, source_name, source_url, sources, key_change, key_changes, tags, views, seo_title, seo_description')
            .eq('id', params.id)
            .single()

        if (fetchError || !oldArticle) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        const { data: updatedArticle, error: updateError } = await supabaseAdmin
            .from('updates')
            .update(body)
            .eq('id', params.id)
            .select()
            .single()

        if (updateError) throw updateError

        if (body.published_at && updatedArticle?.slug) {
            submitArticleToIndexNow(updatedArticle.slug).catch(
                err => console.error('IndexNow error:', err)
            )
        }

        revalidatePath('/', 'layout')
        revalidatePath('/updates', 'layout')

        if (body.slug !== undefined && body.slug !== oldArticle.slug) {
            revalidatePath(`/updates/${oldArticle.slug}`, 'page')
        } else if (body.title !== undefined && body.title !== oldArticle.title) {
            revalidatePath(`/updates/${oldArticle.slug}`, 'page')
        }

        return NextResponse.json(updatedArticle)
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: deletedArticle, error } = await supabaseAdmin
            .from('updates')
            .delete()
            .eq('id', params.id)
            .select()
            .single()

        if (error || !deletedArticle) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        revalidatePath('/', 'layout')
        revalidatePath('/updates', 'layout')

        return NextResponse.json({ success: true, message: 'Article deleted' })
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
