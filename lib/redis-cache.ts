import { Redis } from '@upstash/redis'

const redisUrl = process.env.KV_REST_API_URL || process.env.corplawupdates_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN || process.env.corplawupdates_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
const hasUpstashConfig = Boolean(redisUrl && redisToken) && !isBuildTime

export const redis = hasUpstashConfig ? new Redis({ url: redisUrl!, token: redisToken! }) : null

/**
 * Fetch a cached item from Redis, automatically parsing it back to JSON.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    const cached = await redis.get(key)
    if (!cached) return null
    // If it's a string from KV rest api, parse it
    if (typeof cached === 'string') {
      try {
        return JSON.parse(cached) as T
      } catch {
        return cached as unknown as T
      }
    }
    return cached as T
  } catch (err) {
    console.warn(`[Redis Cache Cache-Get Fail] Key: ${key}. Error:`, err)
    return null
  }
}

/**
 * Cache an item in Redis with an optional TTL.
 */
export async function setCached(key: string, data: any, ttlSeconds = 3600): Promise<void> {
  if (!redis) return
  try {
    const serialized = JSON.stringify(data)
    await redis.set(key, serialized, { ex: ttlSeconds })
  } catch (err) {
    console.warn(`[Redis Cache Cache-Set Fail] Key: ${key}. Error:`, err)
  }
}

/**
 * Remove an item or pattern from Redis.
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return
  try {
    await redis.del(key)
  } catch (err) {
    console.warn(`[Redis Cache Cache-Del Fail] Key: ${key}. Error:`, err)
  }
}
