import { Category } from '@/types'

const colorMap: Record<Category, string> = {
    MCA: 'bg-blue-600',
    SEBI: 'bg-emerald-700',
    RBI: 'bg-violet-600',
    NCLT: 'bg-orange-800',
    IBC: 'bg-red-700',
    FEMA: 'bg-teal-700',
}

export default function CategoryBadge({ category, className = '' }: { category: Category, className?: string }) {
    return (
        <span
            className={`inline-block text-white rounded-full px-2 py-0.5 text-xs font-semibold ${colorMap[category]} ${className}`}
        >
            {category}
        </span>
    )
}
