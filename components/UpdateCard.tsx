import Link from 'next/link'
import { Update } from '@/types'
import { formatDate, calculateReadingTime } from '@/lib/utils'
import CategoryBadge from '@/components/CategoryBadge'

interface UpdateCardProps {
    update: Update
    showExcerpt?: boolean
}

export default function UpdateCard({ update, showExcerpt = true }: UpdateCardProps) {
    return (
        <Link
            href={`/updates/${update.slug}`}
            className="block group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
        >
            <div className="p-6">
                <div className="mb-3">
                    <CategoryBadge category={update.category} />
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
                            <span className="font-medium text-slate-500">{update.source_name}</span>
                        )}
                        {update.published_at && (
                            <span>{formatDate(update.published_at)}</span>
                        )}
                    </div>
                    <div className="flex items-center font-medium bg-slate-50 px-2 py-1 rounded-md">
                        {calculateReadingTime(update.content || update.summary || '')} min read
                    </div>
                </div>
            </div>
        </Link>
    )
}
