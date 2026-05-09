import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Increment view count using Postgres function to avoid race conditions
    const { error } = await supabaseAdmin.rpc('increment_views', {
      article_slug: slug,
    })

    if (error) {
      // Fallback: manual increment
      const { data: article } = await supabaseAdmin
        .from('updates')
        .select('id, views')
        .eq('slug', slug)
        .single()

      if (article) {
        await supabaseAdmin
          .from('updates')
          .update({ views: (article.views || 0) + 1 })
          .eq('id', article.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
