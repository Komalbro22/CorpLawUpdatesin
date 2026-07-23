import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Initialize VAPID details once
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT || 'mailto:mail@corplawupdates.in'

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey)
}

function truncateString(str: string, maxLen: number): string {
  if (!str) return ''
  return str.length > maxLen ? `${str.slice(0, maxLen - 3)}...` : str
}

export async function POST(request: Request) {
  // 1. Strict Admin Authentication Guard
  if (!verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 })
  }

  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: 'Server VAPID keys missing in environment variables' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { title, body: rawBody, url, category, testOnly } = body

    if (!title) {
      return NextResponse.json({ error: 'Notification title is required' }, { status: 400 })
    }

    // 2. Safe Payload Truncation (Under 4KB Web Push Limit)
    const payload = JSON.stringify({
      title: truncateString(title, 120),
      body: truncateString(rawBody || 'New corporate law circular update published.', 240),
      url: url || '/updates',
      category: category || 'all',
      timestamp: Date.now(),
    })

    // 3. Category Filter Query using GIN Index
    let query = supabaseAdmin.from('push_subscriptions').select('id, endpoint, p256dh, auth, categories')

    const targetCategory = category ? category.toLowerCase() : null
    if (targetCategory && targetCategory !== 'all') {
      query = query.or(`categories.cs.{"${targetCategory}"},categories.cs.{"all"}`)
    }

    const { data: subscribers, error: fetchError } = await query

    if (fetchError) {
      console.error('[Push Send API] Error fetching subscribers:', fetchError)
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, message: 'No matching subscribers found', sentCount: 0 })
    }

    // If testOnly is true, only send to the first matching subscriber
    const targetSubscribers = testOnly ? subscribers.slice(0, 1) : subscribers

    let successCount = 0
    let failureCount = 0
    const staleEndpointsToDelete: string[] = []

    // 4. Chunked Batching (Batches of 50 using Promise.allSettled)
    const BATCH_SIZE = 50
    for (let i = 0; i < targetSubscribers.length; i += BATCH_SIZE) {
      const chunk = targetSubscribers.slice(i, i + BATCH_SIZE)

      const promises = chunk.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }

        return webpush.sendNotification(pushSubscription, payload)
      })

      const results = await Promise.allSettled(promises)

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          successCount++
        } else {
          failureCount++
          const error = result.reason
          const statusCode = error?.statusCode || error?.status

          // 5. Automatic 410 (Gone) / 404 (Not Found) Stale Subscription Pruning
          if (statusCode === 410 || statusCode === 404) {
            const staleEndpoint = chunk[idx]?.endpoint
            if (staleEndpoint) {
              staleEndpointsToDelete.push(staleEndpoint)
            }
          } else {
            console.warn('[Push Send API] Delivery failed for subscriber:', error?.message || error)
          }
        }
      })
    }

    // Async prune stale dead subscriptions if any failed with 410/404
    if (staleEndpointsToDelete.length > 0) {
      console.log(`[Push Send API] Pruning ${staleEndpointsToDelete.length} stale subscription(s) (410/404)...`)
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('endpoint', staleEndpointsToDelete)
    }

    return NextResponse.json({
      success: true,
      totalTargeted: targetSubscribers.length,
      sentCount: successCount,
      failedCount: failureCount,
      prunedCount: staleEndpointsToDelete.length,
    })
  } catch (err: any) {
    console.error('[Push Send API] Broadcast error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
