import Link from 'next/link'
import { Update } from '@/types'
import { formatDate, calculateReadingTime } from '@/lib/utils'
import CategoryBadge from '@/components/CategoryBadge'
import { ArrowUpRight, Clock } from 'lucide-react'

function extractFirstImage(content: string): string | null {
    if (!content) return null
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/)
    if (mdMatch && mdMatch[1]) return mdMatch[1]
    const htmlMatch = content.match(/<img.*?src=["'](.*?)["']/)
    if (htmlMatch && htmlMatch[1]) return htmlMatch[1]
    return null
}

const categoryBorderColor: Record<string, string> = {
    MCA:  'border-t-blue-500',
    SEBI: 'border-t-emerald-500',
    RBI:  'border-t-violet-500',
    NCLT: 'border-t-orange-500',
    IBC:  'border-t-red-500',
    FEMA: 'border-t-teal-500',
}

interface UpdateCardProps {
    update: Update
    showExcerpt?: boolean
    animationDelay?: number
}

export default function UpdateCard({ update, showExcerpt = true, animationDelay = 0 }: UpdateCardProps) {
    const imageUrl = extractFirstImage(update.content || '')
    const isNew = Boolean(
        update.published_at &&
        (Date.now() - new Date(update.published_at).getTime()) <
        3 * 24 * 60 * 60 * 1000
    )

    const borderColor = categoryBorderColor[update.category as string] || 'border-t-slate-200'

    const impactStyles: Record<string, string> = {
        high:   'bg-red-100 text-red-700',
        medium: 'bg-amber-100 text-amber-700',
        low:    'bg-green-100 text-green-700',
    }

    const impactLabels: Record<string, string> = {
        high:   'High impact',
        medium: 'Medium impact',
        low:    'Lower impact',
    }

    return (
        <Link
            href={`/updates/${update.slug}`}
            style={{ '--delay': `${animationDelay}ms` } as React.CSSProperties}
            className={`animate-fade-up group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200/80 border-t-[3px] bg-white shadow-card ${borderColor} transition-all duration-300 ease-spring hover:-translate-y-1 hover:border-slate-300 hover:shadow-card-hover`}
        >
            {imageUrl && (
                <div className="relative w-full aspect-video overflow-hidden bg-slate-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={update.title}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            )}

            <div className="p-5 flex flex-col flex-1">
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={update.category} />
                    {isNew && (
                        <span className="badge-pulse rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
                            New
                        </span>
                    )}
                    {update.impact_level && (
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${impactStyles[update.impact_level]}`}>
                            {impactLabels[update.impact_level]}
                        </span>
                    )}
                </div>

                <h3 className="font-heading text-[1.08rem] font-bold text-navy mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors leading-snug">
                    {update.title}
                </h3>

                {showExcerpt && (
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {update.summary}
                    </p>
                )}

                <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100/80 pt-3 text-xs text-slate-400">
                    <div className="min-w-0 flex flex-col gap-0.5">
                        {update.source_name && (
                            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                {update.source_name}
                            </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                            {update.published_at && (
                                <span>{formatDate(update.published_at)}</span>
                            )}
                            {update.effective_date && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium whitespace-nowrap border border-emerald-100">
                                    Eff. {formatDate(update.effective_date)}
                                </span>
                            )}
                            {(update.views || 0) > 0 && (
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                    {update.views!.toLocaleString('en-IN')} views
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="flex items-center gap-1 whitespace-nowrap rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" aria-hidden />
                            {calculateReadingTime(update.content || update.summary || '')} min
                        </span>
                        <span className="hidden h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white transition-colors group-hover:bg-amber-500 sm:flex">
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
