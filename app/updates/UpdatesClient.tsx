'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import UpdateCard from '@/components/UpdateCard'
import Pagination from '@/components/Pagination'
import { Update } from '@/types'
import EmptyState from '@/components/EmptyState'

const CATEGORIES = ['All', 'MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA'] as const

interface UpdatesClientProps {
    paginatedUpdates: Update[]
    totalFilteredCount: number
    totalPublishedCount: number
    counts: Record<string, number>
}

function parseCategoryParam(raw: string | null): string {
    if (!raw) return 'All'
    const match = CATEGORIES.find(c => c !== 'All' && c.toLowerCase() === raw.toLowerCase())
    return match || 'All'
}

export default function UpdatesClient({
    paginatedUpdates,
    totalFilteredCount,
    totalPublishedCount,
    counts,
}: UpdatesClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const searchFromUrl = searchParams.get('search') ?? ''
    const activeCategory = parseCategoryParam(searchParams.get('category'))
    const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

    const [search, setSearch] = useState(searchFromUrl)
    const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl)

    const lastPushedSearchRef = useRef(searchFromUrl)
    const isInternalChangeRef = useRef(false)

    useEffect(() => {
        if (isInternalChangeRef.current) {
            isInternalChangeRef.current = false
            return
        }
        setSearch(prev => {
            if (searchFromUrl !== prev) {
                setDebouncedSearch(searchFromUrl)
                lastPushedSearchRef.current = searchFromUrl
                return searchFromUrl
            }
            return prev
        })
    }, [searchFromUrl])

    useEffect(() => {
        const id = window.setTimeout(() => setDebouncedSearch(search), 300)
        return () => window.clearTimeout(id)
    }, [search])

    const replaceQuery = useCallback(
        (mutate: (p: URLSearchParams) => void) => {
            const p = new URLSearchParams(searchParams.toString())
            mutate(p)
            const qs = p.toString()
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
        },
        [pathname, router, searchParams]
    )

    useEffect(() => {
        if (debouncedSearch === lastPushedSearchRef.current) return
        lastPushedSearchRef.current = debouncedSearch
        isInternalChangeRef.current = true
        replaceQuery(p => {
            if (debouncedSearch) p.set('search', debouncedSearch)
            else p.delete('search')
            p.set('page', '1')
        })
    }, [debouncedSearch, replaceQuery])

    const ITEMS_PER_PAGE = 10
    const totalPages = Math.max(1, Math.ceil(totalFilteredCount / ITEMS_PER_PAGE))
    const currentPage = Math.min(pageFromUrl, totalPages)

    useEffect(() => {
        if (pageFromUrl > totalPages) {
            replaceQuery(p => {
                p.set('page', String(totalPages))
            })
        }
    }, [pageFromUrl, totalPages, replaceQuery])

    const paginationBasePath = useMemo(() => {
        const p = new URLSearchParams()
        if (debouncedSearch) p.set('search', debouncedSearch)
        if (activeCategory !== 'All') p.set('category', activeCategory)
        const qs = p.toString()
        return qs ? `${pathname}?${qs}` : pathname
    }, [pathname, debouncedSearch, activeCategory])

    const handleSearchInput = (value: string) => {
        setSearch(value)
    }

    const handleQuickFilter = (tag: string) => {
        setSearch(tag)
    }

    const handleCategoryClick = (cat: string) => {
        replaceQuery(p => {
            if (cat === 'All') p.delete('category')
            else p.set('category', cat)
            p.set('page', '1')
        })
    }



    return (
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
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
                                onChange={e => handleSearchInput(e.target.value)}
                                autoComplete="off"
                                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/30 text-sm text-navy placeholder:text-slate-400 transition-shadow duration-200"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-xs text-slate-500 self-center font-semibold uppercase tracking-wide w-full md:w-auto mb-1 md:mb-0">
                                Quick filters
                            </span>
                            {[
                                'MCA',
                                'SEBI',
                                'RBI',
                                'IBC',
                                'FEMA',
                                'NCLT',
                                'Repo Rate',
                                'Compliance',
                                'Companies Act',
                                'Director KYC',
                                'Annual Filing',
                            ].map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleQuickFilter(tag)}
                                    className="text-xs bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-900 px-3 py-1.5 rounded-full border border-slate-200/90 hover:border-amber-200 transition-colors duration-200 motion-safe:active:scale-[0.98] min-h-[36px]"
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
                                const count = cat === 'All' ? totalPublishedCount : counts[cat] || 0
                                const isActive = activeCategory === cat
                                return (
                                    <li key={cat} className="md:w-full">
                                        <button
                                            type="button"
                                            onClick={() => handleCategoryClick(cat)}
                                            className={`text-left whitespace-nowrap md:whitespace-normal px-3 py-3 min-h-[44px] rounded-lg text-sm w-full flex justify-between items-center gap-2 transition-colors duration-150 ${
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

            <div className="flex-grow min-w-0">
                <div className="mb-6 flex flex-wrap items-baseline gap-2 text-slate-600 text-sm md:text-base">
                    <span>
                        Showing{' '}
                        <span className="font-semibold text-navy tabular-nums">{totalFilteredCount}</span>
                        {' '}
                        of{' '}
                        <span className="font-semibold text-navy tabular-nums">{totalPublishedCount}</span>
                    </span>
                    {totalFilteredCount !== totalPublishedCount && (
                        <span className="text-slate-400">· filtered</span>
                    )}
                </div>

                {paginatedUpdates.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 content-fade-in">
                            {paginatedUpdates.map((update, i) => (
                                <UpdateCard
                                    key={update.id}
                                    update={update}
                                    animationDelay={i * 50}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                basePath={paginationBasePath}
                            />
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-card ring-1 ring-slate-900/[0.03]">
                        <EmptyState
                            icon="🔍"
                            title="No results found"
                            description={debouncedSearch ? `No articles found for "${debouncedSearch}". Try a different keyword or browse all updates.` : "No articles found matching the current filters."}
                            actionLabel="Browse All Updates"
                            actionHref="/updates"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
