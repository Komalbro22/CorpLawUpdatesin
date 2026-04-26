import { supabaseAdmin } from '@/lib/supabase-server'

export async function getAllSettings(): Promise<Record<string, string>> {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('key, value')

  if (!data) return {}

  return data.reduce((acc, row) => {
    acc[row.key] = row.value || ''
    return acc
  }, {} as Record<string, string>)
}

export async function getSetting(key: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()

  return data?.value || ''
}

export async function updateSetting(
  key: string, 
  value: string
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('site_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)

  return !error
}
