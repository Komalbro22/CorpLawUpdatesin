/* eslint-disable */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CategoryBadge from '@/components/CategoryBadge'
import Pagination from '@/components/Pagination'
import { formatDate } from '@/lib/utils'
import { Update } from '@/types'
import { AlertTriangle, Plus, Search } from 'lucide-react'
import { useToast } from '@/components/Toast'

type ArticleWithCounts = Update & { updated_at: string }

export default function AdminArticles() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { showToast } = useToast()

    const initialPage = parseInt(searchParams.get('page') || '1', 10)

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')
    const [currentPage, setCurrentPage] = useState(initialPage)

    const [articles, setArticles] = useState<ArticleWithCounts[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [deleteConfirm, setDeleteConfirm] = useState<null | string | 'bulk'>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchArticles = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (debouncedSearch) params.set('search', debouncedSearch)
        if (categoryFilter !== 'All') params.set('category', categoryFilter)
        if (statusFilter !== 'All') params.set('status', statusFilter.toLowerCase())
        params.set('page', currentPage.toString())

        try {
            const res = await fetch(`/api/admin/articles?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setArticles(data.articles || [])
                setTotalCount(data.total || 0)
                setCategoryCounts(data.categoryCounts || {})
            } else {
                showToast('Could not load articles', 'error')
            }
        } catch (err) {
            console.error('Error fetching articles:', err)
            showToast('Could not load articles', 'error')
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, categoryFilter, statusFilter, currentPage, showToast])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        fetchArticles()
    }, [fetchArticles])

    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
        if (pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl)
        }
    }, [searchParams])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setCurrentPage(1)
        router.push('/admin/articles')
    }

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoryFilter(e.target.value)
        setCurrentPage(1)
        router.push('/admin/articles')
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value)
        setCurrentPage(1)
        router.push('/admin/articles')
    }

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    const toggleAll = () => {
        if (selectedIds.size === articles.length && articles.length > 0) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(articles.map(a => a.id)))
        }
    }

    const updateFeatured = async (id: string, currentVal: boolean) => {
        if (!currentVal) {
            setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: true } : a))
        } else {
            setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: false } : a))
        }

        try {
            const res = await fetch(`/api/admin/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_featured: !currentVal })
            })
            if (!res.ok) {
                showToast('Could not update featured flag', 'error')
            }
        } catch {
            showToast('Could not update featured flag', 'error')
        }
        fetchArticles()
    }

    const performDelete = async () => {
        if (!deleteConfirm) return

        setDeleting(true)
        try {
            if (deleteConfirm === 'bulk') {
                const results = await Promise.all(
                    Array.from(selectedIds).map(id =>
                        fetch(`/api/admin/articles/${id}`, { method: 'DELETE' }).then(r => r.ok)
                    )
                )
                if (results.some(ok => !ok)) {
                    showToast('Some articles could not be deleted', 'error')
                } else {
                    showToast(`${selectedIds.size} articles deleted`, 'success')
                }
                setSelectedIds(new Set())
            } else {
                const res = await fetch(`/api/admin/articles/${deleteConfirm}`, { method: 'DELETE' })
                if (!res.ok) {
                    showToast('Could not delete article', 'error')
                } else {
                    showToast('Article deleted', 'success')
                }
            }
            setDeleteConfirm(null)
            fetchArticles()
        } catch (err) {
            console.error('Delete failed:', err)
            showToast('Delete failed', 'error')
        } finally {
            setDeleting(false)
        }
    }

    const totalPages = Math.ceil(totalCount / 20)

    // Construct base path preserving search state but updating page
    const currentPathParams = new URLSearchParams()
    if (debouncedSearch) currentPathParams.set('search', debouncedSearch)
    if (categoryFilter !== 'All') currentPathParams.set('category', categoryFilter)
    if (statusFilter !== 'All') currentPathParams.set('status', statusFilter.toLowerCase())
    const basePathParams = currentPathParams.toString()
    const paginationBasePath = `/admin/articles${basePathParams ? '?' + basePathParams : ''}`

    const listStatusMessage = loading
        ? 'Loading articles.'
        : `Showing ${articles.length} of ${totalCount} articles.`

    return (
        <div className="space-y-6 content-fade-in">
            <p className="sr-only" aria-live="polite" aria-atomic="true">
                {listStatusMessage}
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="font-heading text-2xl font-bold text-slate-100">All articles</h1>
                <Link
                    href="/admin/articles/new"
                    className="inline-flex items-center justify-center gap-2 bg-gold text-navy font-semibold px-4 py-2.5 rounded-lg hover:bg-amber-400 transition-colors duration-200 shadow-sm"
                >
                    <Plus className="w-4 h-4" aria-hidden />
                    New article
                </Link>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-xl shadow-card border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-stretch md:items-center ring-1 ring-slate-900/[0.02]">
                <div className="flex-1 w-full relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                        aria-hidden
                    />
                    <input
                        type="search"
                        placeholder="Search titles…"
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-gold/45 focus:outline-none text-navy dark:text-slate-100 bg-white dark:bg-slate-950 transition-shadow"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={categoryFilter}
                        onChange={handleCategoryChange}
                        className="flex-1 md:w-48 appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold/45 focus:outline-none transition-shadow"
                    >
                        <option value="All">All Categories</option>
                        {Object.entries(categoryCounts).map(([cat, count]) => (
                            <option key={cat} value={cat}>{cat} ({count})</option>
                        ))}
                        {/* Fallback categories if empty initially */}
                        {Object.keys(categoryCounts).length === 0 && ['MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="flex-1 md:w-40 appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold/45 focus:outline-none transition-shadow"
                    >
                        <option value="All">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>
            </div>
            
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Showing {totalCount} articles
            </div>

            {/* BULK ACTIONS BAR */}
            {selectedIds.size > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="font-semibold text-amber-800 dark:text-amber-300">
                        {selectedIds.size} articles selected
                    </div>
                    <div className="space-x-3">
                        <button onClick={() => setSelectedIds(new Set())} className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors">
                            Clear Selection
                        </button>
                        <button onClick={() => setDeleteConfirm('bulk')} className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* ARTICLES TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200/80 dark:border-slate-800 overflow-hidden ring-1 ring-slate-900/[0.02]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 backdrop-blur-sm shadow-sm">
                            <tr>
                                <th className="px-6 py-4 w-12">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300 dark:border-slate-700 text-navy focus:ring-navy bg-white dark:bg-slate-950" 
                                        checked={articles.length > 0 && selectedIds.size === articles.length}
                                        onChange={toggleAll}
                                    />
                                </th>
                                <th className="px-6 py-4 font-medium w-[40%]">Title</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Featured</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded w-2/3 max-w-md" />
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <p className="text-slate-500 dark:text-slate-400 mb-4">No articles found. Try adjusting your filters.</p>
                                        {totalCount === 0 && (
                                            <Link href="/admin/articles/new" className="text-gold font-medium hover:underline">
                                                Write First Article
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                articles.map(article => {
                                    const isPublished = !!article.published_at
                                    const dateStr = article.published_at || article.created_at || ''
                                    return (
                                        <tr key={article.id} className={`transition-colors duration-150 ${selectedIds.has(article.id) ? 'bg-amber-50/40 dark:bg-amber-950/15' : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/50'}`}>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-slate-300 dark:border-slate-700 text-navy focus:ring-navy bg-white dark:bg-slate-950"
                                                    checked={selectedIds.has(article.id)}
                                                    onChange={() => toggleSelection(article.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/articles/${article.id}/edit`} className="font-semibold text-navy dark:text-slate-200 hover:text-gold dark:hover:text-amber-400 transition-colors block max-w-[300px] truncate" title={article.title}>
                                                    {article.title}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <CategoryBadge category={article.category} className="!text-xs" />
                                            </td>
                                            <td className="px-6 py-4">
                                                {isPublished ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border dark:border-emerald-900/30">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border dark:border-amber-900/30">
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                                {formatDate(dateStr)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-slate-300 dark:border-slate-700 text-gold focus:ring-gold bg-white dark:bg-slate-950"
                                                    checked={!!article.is_featured}
                                                    onChange={() => updateFeatured(article.id, !!article.is_featured)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 min-h-[44px]">
                                                    <Link href={`/admin/articles/${article.id}/edit`} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-navy dark:hover:text-slate-100 transition-colors px-2">
                                                        Edit
                                                    </Link>
                                                    <button type="button" onClick={() => setDeleteConfirm(article.id)} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-650 transition-colors px-2">
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} basePath={paginationBasePath} />
            )}

            {/* DELETE MODAL */}
            {deleteConfirm && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 content-fade-in"
                    role="presentation"
                    onClick={() => setDeleteConfirm(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200/80 dark:border-slate-800 ring-1 ring-slate-900/5"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-6 h-6" aria-hidden />
                        </div>
                        <h3 id="delete-dialog-title" className="font-heading font-bold text-xl text-navy dark:text-white mb-2">
                            Delete article{deleteConfirm === 'bulk' ? 's' : ''}?
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                            {deleteConfirm === 'bulk' 
                                ? `Are you sure you want to delete ${selectedIds.size} articles? This cannot be undone.`
                                : `Are you sure you want to delete this article? This cannot be undone.`
                            }
                        </p>
                        <div className="flex justify-center gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                                className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={performDelete}
                                disabled={deleting}
                                className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
