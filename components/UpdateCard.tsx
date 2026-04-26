import Link from 'next/link'
import { Update } from '@/types'
import { formatDate, calculateReadingTime } from '@/lib/utils'
import CategoryBadge from '@/components/CategoryBadge'

function extractFirstImage(content: string): string | null {
    if (!content) return null
    const mdMatch = content.match(/!\[.*?\]\((.*?)\)/)
    if (mdMatch && mdMatch[1]) return mdMatch[1]
    const htmlMatch = content.match(/<img.*?src=["'](.*?)["']/)
    if (htmlMatch && htmlMatch[1]) return htmlMatch[1]
    return null
}

interface UpdateCardProps {
    update: Update
    showExcerpt?: boolean
}

export default function UpdateCard({ update, showExcerpt = true }: UpdateCardProps) {
    const imageUrl = extractFirstImage(update.content || '')
    const isNew = Boolean(
        update.published_at &&
        (Date.now() - new Date(update.published_at).getTime()) <
        3 * 24 * 60 * 60 * 1000
    )

    const impactStyles: Record<string, string> = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-amber-100 text-amber-700',
        low: 'bg-green-100 text-green-700',
    }

    const impactLabels: Record<string, string> = {
        high: '🔴 High Impact',
        medium: '🟡 Medium Impact',
        low: '🟢 Low Impact',
    }

    return (
        <Link
            href={`/updates/${update.slug}`}
            className="block group bg-white flex flex-col h-full rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
        >
            {imageUrl && (
                <div className="relative w-full h-40 overflow-hidden bg-slate-50 border-b border-slate-100 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={update.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                        loading="lazy"
                    />
                </div>
            )}

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-3 flex items-center gap-2">
                    <CategoryBadge category={update.category} />
                    {isNew && (
                        <span className="bg-amber-400 text-navy text-xs font-bold px-2 py-0.5 rounded-full">
                            NEW
                        </span>
                    )}
                    {update.impact_level && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${impactStyles[update.impact_level]}`}>
                            {impactLabels[update.impact_level]}
                        </span>
                    )}
                </div>

                <h3 className="font-heading text-xl font-bold text-navy mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                    {update.title}
                </h3>

                {showExcerpt && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {update.summary}
                    </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-4 border-t border-slate-50">
                    <div className="flex flex-col gap-1">
                        {update.source_name && (
                            <p className="text-sm text-slate-400 truncate max-w-[220px]">
                                {update.source_name}
                            </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                            {update.published_at && (
                                <span>{formatDate(update.published_at)}</span>
                            )}
                            {update.effective_date && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                                    📅 Effective: {formatDate(update.effective_date)}
                                </span>
                            )}
                            {(update.views || 0) > 0 && (
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                    · {update.views!.toLocaleString('en-IN')} views
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center font-medium bg-slate-50 px-2 py-1 rounded-md">
                        {calculateReadingTime(update.content || update.summary || '')} min read
                    </div>
                </div>
            </div>
        </Link>
    )
}
