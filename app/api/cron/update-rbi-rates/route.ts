// src/app/api/cron/update-rbi-rates/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { validateCronAuth } from '@/lib/cron-auth'

export const maxDuration = 60 // Allow up to 60 seconds on Vercel

export async function GET(req: Request) {
  const startTime = Date.now()
  
  // 1. Authorize Cron trigger via shared helper (fails closed if CRON_SECRET missing)
  const authError = validateCronAuth(req)
  if (authError) return authError

  let previousValue = 5.50
  let fetchedValue = 5.50
  let changed = false
  let status = 'ok'
  let errorMessage: string | null = null
  const sourceUrl = 'https://www.rbi.org.in'

  try {
    // 2. Fetch the previous rate from the database cache (safely with maybeSingle)
    try {
      const { data: previousRate, error: readError } = await supabaseAdmin
        .from('compliance_rates')
        .select('rate_value')
        .eq('key', 'rbi_bank_rate')
        .maybeSingle()

      if (readError) {
        console.warn('[RBI Cron] Warning reading compliance_rates:', readError.message)
      } else if (previousRate?.rate_value) {
        previousValue = Number(previousRate.rate_value) || 5.50
      }
    } catch (readErr: any) {
      console.warn('[RBI Cron] Exception reading previous rate:', readErr?.message || readErr)
    }

    let isExtractionSuccessful = false
    let extractedRate: number | null = null

    // 3. Automated fetch / scraping of RBI Bank Rate
    try {
      const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.rbi.org.in/'), {
        signal: AbortSignal.timeout(15000) // 15s timeout
      })
      if (response.ok) {
        const payload = await response.json()
        const html = payload.contents || ''
        
        // Extract Bank Rate using regex (RBI lists Bank Rate in table format)
        // Match e.g. "Bank Rate : 6.75%" or similar text pattern
        const rateMatch = html.match(/Bank\s+Rate\s*:\s*([\d\.]+)/i) || html.match(/Bank\s+Rate[\s\S]*?([\d\.]+)\s*%/i)
        
        if (rateMatch && rateMatch[1]) {
          const parsed = parseFloat(rateMatch[1])
          if (!isNaN(parsed)) {
            if (parsed >= 4.0 && parsed <= 10.0) {
              isExtractionSuccessful = true
              extractedRate = parsed
              fetchedValue = parsed
            } else {
              errorMessage = `Extracted rate ${parsed}% fell outside safety bounds (4.0% - 10.0%). Verification required.`
            }
          }
        } else {
          errorMessage = 'Pattern match failed: Bank Rate not found in RBI response markup.'
        }
      } else {
        errorMessage = `Proxy HTTP error: status ${response.status}`
      }
    } catch (scrapeErr: any) {
      console.warn('[RBI Cron] Scraping RBI homepage failed:', scrapeErr?.message || scrapeErr)
      errorMessage = `Extraction network error: ${scrapeErr?.message || 'Unknown network error'}`
    }

    // 4. Process update only if extraction was positively verified
    if (isExtractionSuccessful && extractedRate !== null) {
      status = 'ok'
      if (fetchedValue !== previousValue) {
        changed = true
      }

      // Update or upsert the compliance_rates table cache
      const { error: upsertError } = await supabaseAdmin
        .from('compliance_rates')
        .upsert(
          {
            key: 'rbi_bank_rate',
            rate_value: fetchedValue,
            source_name: 'RBI Website',
            last_successful_fetch: new Date().toISOString(),
            last_verified: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        )

      if (upsertError) {
        if (upsertError.message?.includes('schema cache') || upsertError.code === 'PGRST204' || upsertError.code === 'PGRST205') {
          console.error('[RBI Cron] CRITICAL: Table "compliance_rates" missing in Supabase schema cache. Please ensure migration 20260526000002_create_compliance_rates.sql is applied.')
        }
        throw upsertError
      }
    } else {
      // Extraction failed or out-of-bounds: do NOT bump last_successful_fetch
      status = errorMessage?.includes('safety bounds') ? 'skipped' : 'failed'
      fetchedValue = previousValue
      console.warn(`[RBI Cron] Rate update skipped. Status: ${status}. Reason: ${errorMessage}`)
    }

  } catch (err: any) {
    status = 'failed'
    errorMessage = err.message || 'Unknown cron processing error.'
    console.error('[RBI Cron] Execution error:', err)
  } finally {
    // 5. Record the execution metrics into cron_log safely
    const duration = Date.now() - startTime
    try {
      await supabaseAdmin
        .from('cron_log')
        .insert({
          job_name: 'update-rbi-rates',
          status,
          fetched_value: fetchedValue,
          previous_value: previousValue,
          changed,
          error_message: errorMessage,
          source_url: sourceUrl,
          duration_ms: duration
        })
    } catch (logErr) {
      console.error('[RBI Cron] Failed to write cron metrics log:', logErr)
    }
  }

  return NextResponse.json({
    status,
    fetchedValue,
    previousValue,
    changed,
    durationMs: Date.now() - startTime,
    error: errorMessage
  })
}
