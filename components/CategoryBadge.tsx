import { Category } from '@/types'

const colorMap: Record<Category, string> = {
    MCA: 'bg-[#3B82F6]',
    SEBI: 'bg-[#10B981]',
    RBI: 'bg-[#8B5CF6]',
    NCLT: 'bg-[#F97316]',
    IBC: 'bg-[#EF4444]',
    FEMA: 'bg-[#14B8A6]',
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
