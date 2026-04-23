/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: article, error } = await supabaseAdmin
            .from('updates')
            .select('*')
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
            .from('updates')
            .select('*')
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
