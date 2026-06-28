import Link from 'next/link'
import Image from 'next/image'
import { UpdateListItem } from '@/types'
import { formatDate, calculateReadingTime, extractFirstImage } from '@/lib/utils'
import CategoryBadge from '@/components/CategoryBadge'
import { ArrowUpRight, Clock } from 'lucide-react'

const categoryBorderColor: Record<string, string> = {
    MCA:  'border-t-blue-500',
    SEBI: 'border-t-emerald-500',
    RBI:  'border-t-violet-500',
    NCLT: 'border-t-orange-500',
    IBC:  'border-t-red-500',
    FEMA: 'border-t-teal-500',
}

interface UpdateCardProps {
    update: UpdateListItem
    showExcerpt?: boolean
    animationDelay?: number
    priority?: boolean
}

export default function UpdateCard({ update, showExcerpt = true, animationDelay = 0, priority = false }: UpdateCardProps) {
    // Favor the new DB column; fallback to regex for older articles during transition
    const imageUrl = update.featured_image_url || extractFirstImage(update.content || '') || '/images/og-default.png'
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
            className={`animate-fade-up group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 border-t-[3px] bg-white dark:bg-slate-900 shadow-card ring-1 ring-slate-900/[0.03] dark:ring-white/[0.03] ${borderColor} transition-all duration-300 ease-spring motion-safe:hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_20px_40px_-15px_rgba(201,168,76,0.12)]`}
        >
            {imageUrl && (
                <div className="relative w-full aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    <Image
                        src={imageUrl}
                        alt={update.title}
                        width={473}
                        height={266}
                        priority={priority}
                        sizes="(max-width: 768px) 100vw, 473px"
                        className="object-cover object-center w-full h-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                    />
                </div>
            )}

            <div className="p-5 flex flex-col flex-1">
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={update.category} />
                    {isNew && (
                        <span className="badge-pulse rounded-md bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-900/50">
                            New
                        </span>
                    )}
                    {update.impact_level && (
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${impactStyles[update.impact_level]}`}>
                            {impactLabels[update.impact_level]}
                        </span>
                    )}
                </div>

                <h3 className="font-heading text-[1.08rem] font-bold text-navy dark:text-white mb-2 line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
                    {update.title}
                </h3>

                {showExcerpt && (
                    <p className="text-slate-500 dark:text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {update.summary}
                    </p>
                )}

                <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100/80 dark:border-slate-800 pt-3 text-xs text-slate-500 dark:text-slate-500">
                    <div className="min-w-0 flex flex-col gap-0.5">
                        {update.source_name && (
                            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
                                {update.source_name}
                            </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                            {update.published_at && (
                                <span>{formatDate(update.published_at)}</span>
                            )}
                            {update.effective_date && (
                                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-medium whitespace-nowrap border border-emerald-100 dark:border-emerald-900/30">
                                    Eff. {formatDate(update.effective_date)}
                                </span>
                            )}

                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="flex items-center gap-1 whitespace-nowrap rounded-md bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-500">
                            <Clock className="w-3 h-3 text-slate-500" aria-hidden />
                            {update.reading_time || calculateReadingTime(update.content || update.summary || '')} min
                        </span>
                        <span className="hidden h-7 w-7 items-center justify-center rounded-md bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 transition-colors group-hover:bg-amber-500 dark:group-hover:bg-amber-500 sm:flex">
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
