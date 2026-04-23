/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
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
        <div className="flex flex-col md:flex-row gap-8 mt-8">
            {/* Sidebar Filter */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="sticky top-24 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="mb-6">
                        <label htmlFor="search" className="block text-sm font-bold text-navy mb-2">Search</label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Search updates..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                        />
                    </div>
                    <div>
                        <h3 className="block text-sm font-bold text-navy mb-3">Categories</h3>
                        <ul className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                            {CATEGORIES.map(cat => {
                                const count = cat === 'All' ? updates.length : (counts[cat] || 0)
                                const isActive = activeCategory === cat
                                return (
                                    <li key={cat}>
                                        <button
                                            onClick={() => handleCategoryClick(cat)}
                                            className={`text-left whitespace-nowrap md:whitespace-normal px-3 py-2 rounded-lg text-sm w-full flex justify-between items-center transition-colors ${isActive
                                                    ? 'bg-amber-50 text-navy font-bold border-l-4 border-gold'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className={isActive ? 'border-b-2 md:border-b-0 border-gold' : ''}>{cat}</span>
                                            <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-xs ml-2">
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
            <div className="flex-grow">
                <div className="mb-6 text-slate-600">
                    Showing <span className="font-bold text-navy">{filteredUpdates.length}</span> of {updates.length} updates
                </div>

                {paginatedUpdates.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    <div className="bg-white p-12 rounded-xl border border-slate-100 text-center shadow-sm">
                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-navy mb-2">No updates found</h3>
                        <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                        <button
                            onClick={() => {
                                setSearch('')
                                setDebouncedSearch('')
                                setActiveCategory('All')
                                router.push(`${pathname}?page=1`, { scroll: false })
                            }}
                            className="mt-6 text-gold font-medium hover:text-amber-600"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
