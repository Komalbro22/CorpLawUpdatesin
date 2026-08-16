'use server'

import { supabaseAdmin } from '@/lib/supabase-server'
import { Redis } from '@upstash/redis'
import { verifyAdminSession } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

const redisUrl = process.env.KV_REST_API_URL || process.env.corplawupdates_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.corplawupdates_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const hasUpstashConfig = redisUrl && redisToken
const redis = hasUpstashConfig ? new Redis({ url: redisUrl, token: redisToken }) : null

export async function syncViewsAction(isCron = false) {
    if (!isCron && !await verifyAdminSession()) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!redis) {
        return { success: false, error: 'Redis not configured' }
    }

    try {
        let cursor: string | number = 0
        const keys: string[] = []
        
        do {
            const result = await redis.scan(cursor, { match: 'view_batch:*', count: 100 }) as [number | string, string[]]
            cursor = result[0]
            keys.push(...result[1])
        } while (cursor !== 0 && cursor !== '0')

        let syncedCount = 0

        if (keys.length > 0) {
            for (const key of keys) {
                const slug = key.replace('view_batch:', '')
                // Atomically extract and reset the batch counter in a single command
                const batchViewsStr = await redis.getset<number | string>(key, 0)
                const batchViews = parseInt(String(batchViewsStr || '0'), 10)

                if (batchViews > 0) {
                    const { error: rpcError } = await supabaseAdmin.rpc('increment_views', {
                        article_slug: slug,
                        increment_by: batchViews,
                    })
                    
                    if (rpcError) {
                        console.error(`[SyncViews] RPC increment_views failed for ${slug}:`, rpcError.message)
                        // Safely restore the views back to Redis so counts are never lost
                        await redis.incrby(key, batchViews)
                    } else {
                        syncedCount++
                        // Clean up key if it remains 0 (no new concurrent pageviews arrived during sync)
                        const remaining = await redis.get<number | string>(key)
                        if (parseInt(String(remaining || '0'), 10) === 0) {
                            await redis.del(key)
                        }
                    }
                } else {
                    await redis.del(key)
                }
            }
        }
        
        // Purge the homepage cache so the Popular Articles updates instantly
        revalidatePath('/')
        revalidatePath('/updates')
        
        return { success: true, syncedCount }
    } catch (error) {
        console.error('Failed to sync views manually:', error)
        return { success: false, error: 'Internal error' }
    }
}
