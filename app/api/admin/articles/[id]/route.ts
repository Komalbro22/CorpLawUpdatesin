/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { submitArticleToIndexNow } from '@/lib/indexnow'
import { calculateReadingTime, extractFirstImage } from '@/lib/utils'
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: article, error } = await supabaseAdmin
            .from('updates').select('id, title, slug, summary, content, category, published_at, updated_at, is_featured, effective_date, featured_image_url, impact_level, source_name, source_url, sources, key_change, key_changes, tags, views, seo_title, seo_description, quick_answer, regulation_ref, last_verified, last_amended, key_takeaways, has_steps, steps_json')
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
            .from('updates').select('id, title, slug, summary, content, category, published_at, updated_at, is_featured, effective_date, featured_image_url, impact_level, source_name, source_url, sources, key_change, key_changes, tags, views, seo_title, seo_description, quick_answer, regulation_ref, last_verified, last_amended, key_takeaways, has_steps, steps_json')
            .eq('id', params.id)
            .single()

        if (fetchError || !oldArticle) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 })
        }

        const updateData = { ...body }
        if (body.content !== undefined) {
            updateData.reading_time = calculateReadingTime(body.content || '')
            if (!body.featured_image_url) {
                updateData.featured_image_url = extractFirstImage(body.content || '') || null
            }
        }

        const { data: updatedArticle, error: updateError } = await supabaseAdmin
            .from('updates')
            .update(updateData)
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
        revalidatePath('/sitemap.xml')

        if (updatedArticle?.category) {
            revalidatePath(`/category/${updatedArticle.category.toLowerCase()}`)
        }
        if (oldArticle?.category && oldArticle.category !== updatedArticle?.category) {
            revalidatePath(`/category/${oldArticle.category.toLowerCase()}`)
        }

        if (body.slug !== undefined && body.slug !== oldArticle.slug) {
            revalidatePath(`/updates/${oldArticle.slug}`, 'page')
            if (updatedArticle?.slug) {
                revalidatePath(`/updates/${updatedArticle.slug}`, 'page')
            }
        } else if (body.title !== undefined && body.title !== oldArticle.title) {
            revalidatePath(`/updates/${oldArticle.slug}`, 'page')
        } else {
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
        revalidatePath('/sitemap.xml')
        if (deletedArticle?.category) {
            revalidatePath(`/category/${deletedArticle.category.toLowerCase()}`)
        }
        revalidatePath(`/updates/${deletedArticle.slug}`, 'page')

        return NextResponse.json({ success: true, message: 'Article deleted' })
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
