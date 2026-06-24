/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { slugify, calculateReadingTime, extractFirstImage } from '@/lib/utils'
import { submitArticleToIndexNow } from '@/lib/indexnow'
import { articleSchema } from '@/lib/admin-schemas'

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

        const categories = ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA']
        const categoryCounts: Record<string, number> = {}

        await Promise.all(
            categories.map(async (cat) => {
                const { count: catCount } = await supabaseAdmin
                    .from('updates')
                    .select('*', { count: 'exact', head: true })
                    .eq('category', cat)
                categoryCounts[cat] = catCount || 0
            })
        )

        const articlesWithCounts = articles?.map(a => {
            const wordCount = a.content ? a.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
            const { content, ...rest } = a; // Strip content to save bandwidth
            return { ...rest, word_count: wordCount };
        });

        return NextResponse.json({
            articles: articlesWithCounts || [],
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
        const rawBody = await request.json()
        const parsed = articleSchema.safeParse(rawBody)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
        }
        const body = parsed.data
        const { 
            title, slug, summary, content, category, tags, 
            source_url, source_name, sources,
            seo_title, seo_description, featured_image_url,
            published_at, is_featured, 
            key_change, key_changes, effective_date, impact_level,
            quick_answer, regulation_ref, last_verified, last_amended, key_takeaways, has_steps, steps_json
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
                featured_image_url: featured_image_url || extractFirstImage(content || '') || null,
                published_at,
                is_featured: is_featured || false,
                key_change: key_change || null,
                key_changes: key_changes || null,
                effective_date: effective_date || null,
                impact_level: impact_level || null,
                quick_answer: quick_answer || null,
                regulation_ref: regulation_ref || null,
                last_verified: last_verified || null,
                last_amended: last_amended || null,
                key_takeaways: key_takeaways || null,
                has_steps: has_steps || false,
                steps_json: steps_json || null,
                reading_time: calculateReadingTime(content || '')
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
        revalidatePath('/sitemap.xml')
        if (category) {
            revalidatePath(`/category/${category.toLowerCase()}`)
        }

        return NextResponse.json(createdArticle, { status: 201 })
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
