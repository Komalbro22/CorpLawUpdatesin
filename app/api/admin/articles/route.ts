/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils'
import { submitArticleToIndexNow } from '@/lib/indexnow'

export async function GET(request: NextRequest) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const status = searchParams.get('status') || 'all'

        let query = supabaseAdmin
            .from('updates')
            .select('*', { count: 'exact' })

        if (category) {
            query = query.eq('category', category)
        }
        if (search) {
            query = query.ilike('title', `%${search}%`)
        }
        if (status === 'published') {
            query = query.not('published_at', 'is', null)
        } else if (status === 'draft') {
            query = query.is('published_at', null)
        }

        const limit = 20
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.order('created_at', { ascending: false }).range(from, to)

        const { data: articles, count, error } = await query

        if (error) throw error

        const { data: allCats } = await supabaseAdmin.from('updates').select('category')
        const categoryCounts = allCats?.reduce((acc, row) => {
            acc[row.category] = (acc[row.category] || 0) + 1
            return acc
        }, {} as Record<string, number>) || {}

        return NextResponse.json({
            articles,
            total: count || 0,
            categoryCounts
        })
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { 
            title, slug, summary, content, category, tags, 
            source_url, source_name, sources,
            seo_title, seo_description, featured_image_url,
            published_at, is_featured, 
            key_change, key_changes, effective_date, impact_level
        } = body

        if (!title || !summary || !category) {
            return NextResponse.json({ error: 'Missing required fields: title, summary, category' }, { status: 400 })
        }

        let finalSlug = slug || slugify(title)
        let isUnique = false
        let attempt = 1

        while (!isUnique && attempt <= 10) {
            const { data } = await supabaseAdmin
                .from('updates')
                .select('slug')
                .eq('slug', finalSlug)
                .single()

            if (!data) {
                isUnique = true
            } else {
                attempt++
                finalSlug = `${slug || slugify(title)}-${attempt}`
            }
        }

        const { data: createdArticle, error } = await supabaseAdmin
            .from('updates')
            .insert({
                title,
                slug: finalSlug,
                summary,
                content: content || '',
                category,
                tags: tags || [],
                source_url,
                source_name,
                sources: sources || null,
                seo_title: seo_title || null,
                seo_description: seo_description || null,
                featured_image_url: featured_image_url || null,
                published_at,
                is_featured: is_featured || false,
                key_change: key_change || null,
                key_changes: key_changes || null,
                effective_date: effective_date || null,
                impact_level: impact_level || null
            })
            .select()
            .single()

        if (error) throw error

        if (createdArticle?.slug && createdArticle?.published_at) {
            submitArticleToIndexNow(createdArticle.slug).catch(
                err => console.error('IndexNow submit failed:', err)
            )
        }

        revalidatePath('/', 'layout')
        revalidatePath('/updates', 'layout')

        return NextResponse.json(createdArticle, { status: 201 })
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
