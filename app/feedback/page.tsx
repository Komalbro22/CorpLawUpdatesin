import { Metadata } from 'next'
import { Suspense } from 'react'
import FeedbackClient from './FeedbackClient'

export const metadata: Metadata = {
  title: 'Reader Feedback & Corrections — CorpLawUpdates',
  description: 'Submit feedback, report statutory inaccuracies, or suggest improvements for corporate law updates, calculators, and legal document templates.',
  alternates: { canonical: 'https://www.corplawupdates.in/feedback' },
  robots: {
    index: true,
    follow: true,
  },
}

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading feedback form...</div>}>
          <FeedbackClient />
        </Suspense>
      </div>
    </div>
  )
}
