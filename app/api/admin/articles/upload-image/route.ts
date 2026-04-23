/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
    if (!verifyAdminSession()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9)
        const fileExt = file.name.split('.').pop()
        const fileName = `temp/${uniqueId}.${fileExt}`

        const { data, error } = await supabaseAdmin
            .storage
            .from('article-images')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('article-images')
            .getPublicUrl(fileName)

        return NextResponse.json({ url: publicUrl })
    } catch (err) {
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }
}
