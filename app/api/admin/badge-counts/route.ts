import { NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Reader Feedback: pending count
    const feedbackPromise = (async () => {
      try {
        const { count, error } = await supabaseAdmin
          .from('reader_feedback')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (!error && typeof count === 'number') return count
      } catch {
        // Fallback below
      }

      try {
        const { count } = await supabaseAdmin
          .from('compliance_suggestions')
          .select('*', { count: 'exact', head: true })
          .ilike('compliance_title', '[Feedback:%')
          .eq('status', 'pending')
        return count || 0
      } catch {
        return 0
      }
    })()

    // 2. Partner Interests: pending inquiries
    const partnerPromise = (async () => {
      try {
        const { count } = await supabaseAdmin
          .from('partner_interests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        return count || 0
      } catch {
        return 0
      }
    })()

    // 3. Compliance Suggestions: pending suggestions (excluding feedback items if logged in compliance_suggestions)
    const suggestionsPromise = (async () => {
      try {
        const { count } = await supabaseAdmin
          .from('compliance_suggestions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .not('compliance_title', 'ilike', '[Feedback:%')
        return count || 0
      } catch {
        return 0
      }
    })()

    // 4. All Articles: unpublished drafts awaiting review/publish
    const articlesPromise = (async () => {
      try {
        const { count } = await supabaseAdmin
          .from('updates')
          .select('*', { count: 'exact', head: true })
          .is('published_at', null)
        return count || 0
      } catch {
        return 0
      }
    })()

    // 5. Rule Learning: pending learning queue items
    const ruleLearningPromise = (async () => {
      try {
        const docDb = supabaseDocumentsAdmin || supabaseAdmin
        const { count } = await docDb
          .from('learning_queue')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        return count || 0
      } catch {
        return 0
      }
    })()

    // 6. Newsletter: pending scheduled newsletters
    const newsletterPromise = (async () => {
      try {
        const { count } = await supabaseAdmin
          .from('scheduled_newsletters')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        return count || 0
      } catch {
        return 0
      }
    })()

    const [
      feedbackCount,
      partnerCount,
      suggestionsCount,
      articlesCount,
      ruleLearningCount,
      newsletterCount,
    ] = await Promise.all([
      feedbackPromise,
      partnerPromise,
      suggestionsPromise,
      articlesPromise,
      ruleLearningPromise,
      newsletterPromise,
    ])

    const counts: Record<string, number> = {
      '/admin/feedback': feedbackCount,
      '/admin/partner-interests': partnerCount,
      '/admin/compliance/suggestions': suggestionsCount,
      '/admin/articles': articlesCount,
      '/admin/rule-learning': ruleLearningCount,
      '/admin/newsletter/history': newsletterCount,
    }

    const totalPending = Object.values(counts).reduce((acc, val) => acc + (val || 0), 0)

    return NextResponse.json({
      counts,
      totalPending,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error: any) {
    console.error('Error fetching admin badge counts:', error)
    return NextResponse.json({ error: 'Failed to fetch badge counts' }, { status: 500 })
  }
}
