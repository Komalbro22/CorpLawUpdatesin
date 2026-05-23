'use client'
import { useMemo } from 'react'

interface SeoCheck {
  label: string
  pass: boolean
  message: string
  weight: number
}

interface SeoScorePanelProps {
  title: string
  summary: string
  content: string
  slug: string
  tags: string[]
  keyChange: string
}

export default function SeoScorePanel({
  title = '',
  summary = '',
  content = '',
  slug = '',
  tags = [],
  keyChange = '',
}: SeoScorePanelProps) {
  const checks = useMemo<SeoCheck[]>(() => {
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

    return [
      {
        label: 'Title Length',
        pass: title.length >= 25 && title.length <= 70,
        message: title.length < 25
          ? 'Title is too short (aim for at least 25 characters).'
          : title.length > 70
          ? 'Title is too long (keep under 70 characters for SERP visibility).'
          : 'Optimal title length (25-70 characters).',
        weight: 15,
      },
      {
        label: 'Summary / Meta Length',
        pass: summary.length >= 100 && summary.length <= 160,
        message: summary.length < 100
          ? 'Summary is too short. Expand it to serve as an optimized meta description.'
          : summary.length > 160
          ? 'Summary exceeds 160 characters (will be truncated in Google search).'
          : 'Perfect meta description length (100-160 characters).',
        weight: 15,
      },
      {
        label: 'Content Word Count',
        pass: wordCount >= 250,
        message: wordCount < 250
          ? `Short content (${wordCount} words). Add more details to reach at least 250 words.`
          : `Great content length (${wordCount} words).`,
        weight: 20,
      },
      {
        label: 'SEO Keywords in Slug',
        pass: slug.length > 3 && slug.includes('-') && !/[A-Z]/.test(slug),
        message: !slug
          ? 'Slug is missing.'
          : /[A-Z]/.test(slug)
          ? 'Slug should be all lowercase.'
          : !slug.includes('-')
          ? 'Slug should contain hyphenated words.'
          : 'Slug is clean, lowercase, and hyphenated.',
        weight: 10,
      },
      {
        label: 'Taxonomy (Tags)',
        pass: tags.length >= 3,
        message: tags.length < 3
          ? 'Add at least 3 descriptive tags for better internal linking and topical relevance.'
          : `${tags.length} tags defined (perfect for taxonomy).`,
        weight: 10,
      },
      {
        label: 'Key Takeaways & Pill',
        pass: keyChange.trim().length > 0,
        message: !keyChange.trim()
          ? 'Add a Key Change Pill to stand out in Google Discover and quick Scans.'
          : 'Key Change Pill configured.',
        weight: 10,
      },
      {
        label: 'Content Richness (Headings & Lists)',
        pass: content.includes('##') || content.includes('\n- ') || content.includes('\n* '),
        message: !(content.includes('##') || content.includes('\n- ') || content.includes('\n* '))
          ? 'Structure your content with headings (##) or bullet lists for readability.'
          : 'Content has great structure (headings/lists).',
        weight: 10,
      },
      {
        label: 'Rich Media Check',
        pass: content.includes('![') || content.includes('<img'),
        message: !(content.includes('![') || content.includes('<img'))
          ? 'Include at least one high-quality image or document reference in the body.'
          : 'Body includes rich image content.',
        weight: 10,
      },
    ]
  }, [title, summary, content, slug, tags, keyChange])

  const score = useMemo(() => {
    const earned = checks.reduce(
      (sum: number, c: SeoCheck) => sum + (c.pass ? c.weight : 0), 0
    )
    const total = checks.reduce(
      (sum: number, c: SeoCheck) => sum + c.weight, 0
    )
    return total > 0 ? Math.round((earned / total) * 100) : 0
  }, [checks])

  const ratingColor = score >= 80
    ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
    : score >= 50
    ? 'text-amber-600 border-amber-200 bg-amber-50'
    : 'text-rose-600 border-rose-200 bg-rose-50'

  const progressBg = score >= 80
    ? 'bg-emerald-500'
    : score >= 50
    ? 'bg-amber-500'
    : 'bg-rose-500'

  return (
    <div className="border border-slate-200/80 rounded-xl p-5 bg-white shadow-card ring-1 ring-slate-900/[0.02]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-navy text-base">Real-time SEO Audit</h3>
          <p className="text-xs text-slate-400">Continuous scoring as you edit</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold shadow-sm ${ratingColor}`}>
          <span>🎯</span>
          <span>{score}/100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${progressBg}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checks list */}
      <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 font-sans">
        {checks.map((check, idx) => (
          <div key={idx} className="flex gap-2.5 items-start text-left">
            <span className="text-sm shrink-0 mt-0.5 animate-pulse">
              {check.pass ? '✅' : '❌'}
            </span>
            <div className="min-w-0">
              <p className={`text-xs font-bold ${check.pass ? 'text-navy' : 'text-slate-500'}`}>
                {check.label}
              </p>
              <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                {check.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
