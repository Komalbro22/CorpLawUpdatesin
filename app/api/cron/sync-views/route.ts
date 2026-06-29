import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

const redisUrl = process.env.KV_REST_API_URL || process.env.corplawupdates_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.corplawupdates_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const hasUpstashConfig = redisUrl && redisToken
const redis = hasUpstashConfig ? new Redis({ url: redisUrl, token: redisToken }) : null

export async function GET(request: Request) {
    if (!redis) {
        return NextResponse.json({ success: false, error: 'Redis not configured' }, { status: 500 })
    }

    try {
        // Secure this endpoint - verify Vercel Cron header or custom secret
        const authHeader = request.headers.get('authorization')
        if (
            authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
            request.headers.get('x-vercel-cron') !== '1'
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all keys with prefix view_batch:
        let cursor: string | number = 0
        const keys: string[] = []
        
        do {
            const result = await redis.scan(cursor, { match: 'view_batch:*', count: 100 })
            cursor = result[0]
            keys.push(...result[1])
        } while (cursor !== 0 && cursor !== '0')

        if (keys.length === 0) {
            return NextResponse.json({ success: true, message: 'No batched views to sync' })
        }

        let syncedCount = 0

        for (const key of keys) {
            const slug = key.replace('view_batch:', '')
            const batchViewsStr = await redis.get<number | string>(key)
            const batchViews = parseInt(String(batchViewsStr || '0'), 10)

            if (batchViews > 0) {
                // Try RPC first (if it exists)
                const { error: rpcError } = await supabaseAdmin.rpc('increment_views', {
                    article_slug: slug,
                })
                
                // If RPC fails (maybe not created), fallback to manual
                if (rpcError) {
                    const { data: article } = await supabaseAdmin
                        .from('updates')
                        .select('id, views')
                        .eq('slug', slug)
                        .single()

                    if (article) {
                        await supabaseAdmin
                            .from('updates')
                            .update({ views: (article.views || 0) + batchViews })
                            .eq('id', article.id)
                    }
                }

                // If successful (or even if we tried), reset the batch count in Redis.
                // We use DECRBY instead of DEL just in case new views came in while we were syncing.
                await redis.decrby(key, batchViews)
                syncedCount++
            } else {
                // Cleanup 0s
                await redis.del(key)
            }
        }

        return NextResponse.json({ success: true, syncedCount })
    } catch (error) {
        console.error('Failed to sync views:', error)
        return NextResponse.json({ success: false, error: 'Failed to sync views' }, { status: 500 })
    }
}
