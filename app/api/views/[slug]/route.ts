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

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    if (!redis) {
      return NextResponse.json({ success: true, batchViews: 0 })
    }
    const batchViews = await redis.get<number>(`view_batch:${slug}`)
    return NextResponse.json({ success: true, batchViews: batchViews || 0 })
  } catch (error) {
    return NextResponse.json({ success: false, batchViews: 0 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // 1. Validate slug format — alphanumeric and hyphens only, max 200 chars
    if (!slug || !/^[a-z0-9-]{1,200}$/.test(slug)) {
      return NextResponse.json({ success: false, error: 'Invalid slug' }, { status: 400 })
    }

    // 2. Verify the article actually exists (lightweight check)
    const { data: article, error: articleError } = await supabaseAdmin
      .from('updates')
      .select('id')
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .single()

    if (articleError || !article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
    }

    // 3. IP-based Rate Limiting (Server-Side)
    if (ratelimit) {
      // Parse x-forwarded-for safely — take only the first IP from the list
      const forwardedFor = request.headers.get('x-forwarded-for')
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
      const { success } = await ratelimit.limit(`views_${ip}_${slug}`)
      
      if (!success) {
        return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 })
      }
    }

    if (redis) {
      // Increment the batch count in Redis
      await redis.incr(`view_batch:${slug}`)
      
      // Also increment a sorted set for popular articles
      await redis.zincrby('popular_articles', 1, slug)
    } else {
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
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const err = error as Error & { digest?: string };
    if (err.digest === 'DYNAMIC_SERVER_USAGE' || err.message?.includes('Dynamic server usage')) {
      throw error;
    }

    console.error(`Failed to record view for ${params.slug}:`, error);
    return NextResponse.json({ success: false })
  }
}
