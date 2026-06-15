import { supabaseAdmin } from '@/lib/supabase-server'
import { getCached, setCached, invalidateCache } from '@/lib/redis-cache'

const ALL_SETTINGS_CACHE_KEY = 'settings:all'
const SETTING_KEY_PREFIX = 'settings:key:'

export async function getAllSettings(): Promise<Record<string, string>> {
  // Try Cache
  const cached = await getCached<Record<string, string>>(ALL_SETTINGS_CACHE_KEY)
  if (cached) return cached

  // Cache Miss
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')
  if (!data) return {}

  const settingsObj = data.reduce((acc, row) => {
    acc[row.key] = row.value || ''
    return acc
  }, {} as Record<string, string>)

  // Populate Cache (1 day TTL)
  await setCached(ALL_SETTINGS_CACHE_KEY, settingsObj, 86400)
  return settingsObj
}

export async function getSetting(key: string): Promise<string> {
  const cacheKey = `${SETTING_KEY_PREFIX}${key}`
  
  // Try Cache
  const cachedVal = await getCached<string>(cacheKey)
  if (cachedVal !== null) return cachedVal

  // Cache Miss
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()

  const value = data?.value || ''
  
  // Populate Cache (1 day TTL)
  await setCached(cacheKey, value, 86400)
  return value
}

export async function updateSetting(key: string, value: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('site_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (!error) {
    // Invalidate Caches
    await invalidateCache(ALL_SETTINGS_CACHE_KEY)
    await invalidateCache(`${SETTING_KEY_PREFIX}${key}`)
    return true
  }
  return false
}
