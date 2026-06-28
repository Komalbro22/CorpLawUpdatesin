import { Category } from '@/types'

const colorMap: Record<Category, string> = {
    MCA: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20',
    SEBI: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20',
    RBI: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/20',
    NCLT: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20',
    IBC: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20',
    FEMA: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-400/10 dark:text-teal-400 dark:ring-teal-400/20',
}

export default function CategoryBadge({ category, className = '' }: { category: Category, className?: string }) {
    return (
        <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${colorMap[category]} ${className}`}
        >
            {category}
        </span>
    )
}
