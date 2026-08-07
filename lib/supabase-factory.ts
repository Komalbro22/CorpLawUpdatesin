import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Unified Supabase Factory for CorpLawUpdates.in
 * Manages singleton client instances for both Primary and Secondary (Documents) databases.
 */

let anonInstance: SupabaseClient | null = null
let adminInstance: SupabaseClient | null = null
let documentsAnonInstance: SupabaseClient | null = null
let documentsAdminInstance: SupabaseClient | null = null

/**
 * Get the public/anon Supabase client for the primary database.
 */
export function getSupabaseAnonClient(): SupabaseClient {
  if (anonInstance) return anonInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase public environment variables (NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  }

  anonInstance = createClient(url, key)
  return anonInstance
}

/**
 * Get the service-role admin Supabase client for the primary database.
 * NEVER call or expose this client on the browser/client-side.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (adminInstance) return adminInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase admin environment variables (NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY)')
  }

  adminInstance = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return adminInstance
}

/**
 * Get the public/anon client for the secondary/documents database (if configured).
 */
export function getSupabaseDocumentsClient(): SupabaseClient | null {
  if (documentsAnonInstance) return documentsAnonInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  documentsAnonInstance = createClient(url, key)
  return documentsAnonInstance
}

/**
 * Get the service-role admin client for the secondary/documents database (if configured).
 */
export function getSupabaseDocumentsAdminClient(): SupabaseClient | null {
  if (documentsAdminInstance) return documentsAdminInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE2_URL
  const key = process.env.SUPABASE2_SERVICE_ROLE_KEY

  if (!url || !key) return null

  documentsAdminInstance = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return documentsAdminInstance
}
