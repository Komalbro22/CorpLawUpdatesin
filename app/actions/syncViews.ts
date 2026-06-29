'use server'

import { supabaseAdmin } from '@/lib/supabase-server'
import { Redis } from '@upstash/redis'
import { verifyAdminSession } from '@/lib/admin-auth'
import { revalidatePath } from 'next/cache'

const redisUrl = process.env.KV_REST_API_URL || process.env.corplawupdates_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.corplawupdates_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const hasUpstashConfig = redisUrl && redisToken
const redis = hasUpstashConfig ? new Redis({ url: redisUrl, token: redisToken }) : null

export async function syncViewsAction() {
    if (!verifyAdminSession()) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!redis) {
        return { success: false, error: 'Redis not configured' }
    }

    try {
        let cursor: string | number = 0
        const keys: string[] = []
        
        do {
            const result = await redis.scan(cursor, { match: 'view_batch:*', count: 100 })
            cursor = result[0]
            keys.push(...result[1])
        } while (cursor !== 0 && cursor !== '0')

        let syncedCount = 0

        if (keys.length > 0) {
            for (const key of keys) {
                const slug = key.replace('view_batch:', '')
                const batchViewsStr = await redis.get<number | string>(key)
                const batchViews = parseInt(String(batchViewsStr || '0'), 10)

                if (batchViews > 0) {
                    const { error: rpcError } = await supabaseAdmin.rpc('increment_views', {
                        article_slug: slug,
                    })
                    
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

                    await redis.decrby(key, batchViews)
                    syncedCount++
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
