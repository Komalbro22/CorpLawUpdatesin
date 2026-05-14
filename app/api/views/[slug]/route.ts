import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Upstash Redis and Ratelimit only if env vars are present (supports Vercel KV or direct Upstash)
const redisUrl = process.env.KV_REST_API_URL || process.env.corplawupdates_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.corplawupdates_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const hasUpstashConfig = redisUrl && redisToken
const redis = hasUpstashConfig ? new Redis({ url: redisUrl, token: redisToken }) : null

// Create a new ratelimiter, that allows 5 requests per minute
const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
    })
  : null

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // IP-based Rate Limiting (Server-Side)
    if (ratelimit) {
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
      const { success } = await ratelimit.limit(`views_${ip}_${slug}`)
      
      if (!success) {
        return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 })
      }
    }

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
  } catch (error) {
    const err = error as Error & { digest?: string };
    if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
      throw error;
    }

    return NextResponse.json({ success: false })
  }
}
