/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, SearchX } from 'lucide-react'
import UpdateCard from '@/components/UpdateCard'
import Pagination from '@/components/Pagination'
import { Update } from '@/types'

const CATEGORIES = ['All', 'MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA']

interface UpdatesClientProps {
    updates: Update[]
    counts: Record<string, number>
}

export default function UpdatesClient({ updates, counts }: UpdatesClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const pageParam = searchParams.get('page')
    const currentPage = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')

    const handleSearch = useCallback((value: string) => {
        setSearch(value)
        router.push(`${pathname}?page=1`, { scroll: false })
        setTimeout(() => {
            setDebouncedSearch(value)
        }, 300)
    }, [router, pathname])

    const filteredUpdates = useMemo(() => {
        return updates.filter(update => {
            const matchCategory = activeCategory === 'All' || update.category === activeCategory
            const searchLower = debouncedSearch.toLowerCase()
            const matchSearch = !debouncedSearch ||
                update.title.toLowerCase().includes(searchLower) ||
                (update.summary && update.summary.toLowerCase().includes(searchLower))
            return matchCategory && matchSearch
        })
    }, [updates, activeCategory, debouncedSearch])

    const ITEMS_PER_PAGE = 10
    const totalPages = Math.ceil(filteredUpdates.length / ITEMS_PER_PAGE)
    const paginatedUpdates = filteredUpdates.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const handleCategoryClick = (cat: string) => {
        setActiveCategory(cat)
        router.push(`${pathname}?page=1`, { scroll: false })
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
            {/* Sidebar Filter */}
            <aside className="w-full md:w-72 flex-shrink-0">
                <div className="sticky top-24 bg-white p-5 md:p-6 rounded-xl shadow-card border border-slate-200/80 ring-1 ring-slate-900/[0.03]">
                    <div className="mb-6">
                        <label htmlFor="search" className="block text-sm font-semibold text-navy mb-2">
                            Search
                        </label>
                        <div className="relative mb-4">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                                aria-hidden
                            />
                            <input
                                id="search"
                                type="search"
                                placeholder="Title or summary…"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoComplete="off"
                                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/30 text-sm text-navy placeholder:text-slate-400 transition-shadow duration-200"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-xs text-slate-500 self-center font-semibold uppercase tracking-wide w-full md:w-auto mb-1 md:mb-0">
                                Quick filters
                            </span>
                            {[
                                'MCA', 'SEBI', 'RBI', 'IBC', 'FEMA', 'NCLT',
                                'Repo Rate', 'Compliance', 'Companies Act',
                                'Director KYC', 'Annual Filing'
                            ].map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleSearch(tag)}
                                    className="text-xs bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-900 px-3 py-1.5 rounded-full border border-slate-200/90 hover:border-amber-200 transition-colors duration-200 motion-safe:active:scale-[0.98]"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="block text-sm font-semibold text-navy mb-3">Categories</h3>
                        <ul className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
                            {CATEGORIES.map(cat => {
                                const count = cat === 'All' ? updates.length : (counts[cat] || 0)
                                const isActive = activeCategory === cat
                                return (
                                    <li key={cat} className="md:w-full">
                                        <button
                                            type="button"
                                            onClick={() => handleCategoryClick(cat)}
                                            className={`text-left whitespace-nowrap md:whitespace-normal px-3 py-2.5 rounded-lg text-sm w-full flex justify-between items-center gap-2 transition-colors duration-150 ${
                                                isActive
                                                    ? 'bg-navy/5 text-navy font-semibold ring-1 ring-gold/40 shadow-sm'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span>{cat}</span>
                                            <span
                                                className={`tabular-nums py-0.5 px-2 rounded-md text-xs font-medium ${
                                                    isActive
                                                        ? 'bg-white text-navy ring-1 ring-slate-200/80'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-grow min-w-0">
                <div className="mb-6 flex flex-wrap items-baseline gap-2 text-slate-600 text-sm md:text-base">
                    <span>
                        Showing{' '}
                        <span className="font-semibold text-navy tabular-nums">{filteredUpdates.length}</span>
                        {' '}of{' '}
                        <span className="font-semibold text-navy tabular-nums">{updates.length}</span>
                    </span>
                    {filteredUpdates.length !== updates.length && (
                        <span className="text-slate-400">· filtered</span>
                    )}
                </div>

                {paginatedUpdates.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 content-fade-in">
                            {paginatedUpdates.map((update: any) => (
                                <UpdateCard key={update.id} update={update} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                basePath="/updates"
                            />
                        )}
                    </>
                ) : (
                    <div className="bg-white p-10 md:p-14 rounded-xl border border-slate-200/80 text-center shadow-card ring-1 ring-slate-900/[0.03] content-fade-in">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mb-5">
                            <SearchX className="w-7 h-7" strokeWidth={1.75} aria-hidden />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-navy mb-2">No updates match</h3>
                        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                            Try a different keyword, pick another category, or clear filters to see the full list.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('')
                                setDebouncedSearch('')
                                setActiveCategory('All')
                                router.push(`${pathname}?page=1`, { scroll: false })
                            }}
                            className="mt-8 inline-flex items-center justify-center rounded-lg bg-navy text-gold font-semibold px-5 py-2.5 text-sm hover:bg-slate-800 transition-colors duration-200"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
