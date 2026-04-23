/* eslint-disable */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CategoryBadge from '@/components/CategoryBadge'
import Pagination from '@/components/Pagination'
import { formatDate } from '@/lib/utils'
import { Update } from '@/types'

type ArticleWithCounts = Update & { updated_at: string }

export default function AdminArticles() {
    const router = useRouter()
    const searchParams = useSearchParams()

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
            }
        } catch (err) {
            console.error('Error fetching articles:', err)
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, categoryFilter, statusFilter, currentPage])

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
            // Confirm optimistic update
            setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: true } : a))
        } else {
            setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: false } : a))
        }

        await fetch(`/api/admin/articles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_featured: !currentVal })
        })
        fetchArticles()
    }

    const performDelete = async () => {
        if (!deleteConfirm) return

        try {
            if (deleteConfirm === 'bulk') {
                await Promise.all(Array.from(selectedIds).map(id =>
                    fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
                ))
                setSelectedIds(new Set())
            } else {
                await fetch(`/api/admin/articles/${deleteConfirm}`, { method: 'DELETE' })
            }
            setDeleteConfirm(null)
            fetchArticles()
        } catch (err) {
            console.error('Delete failed:', err)
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="font-heading text-2xl font-bold text-navy">All Articles</h1>
                <Link href="/admin/articles/new" className="bg-gold text-navy font-semibold px-4 py-2 rounded-lg hover:bg-[#E5B54E] transition-colors">
                    Write New Article
                </Link>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:outline-none text-navy"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        value={categoryFilter}
                        onChange={handleCategoryChange}
                        className="flex-1 md:w-48 appearance-none bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold focus:outline-none"
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
                        className="flex-1 md:w-40 appearance-none bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold focus:outline-none"
                    >
                        <option value="All">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Drafts">Drafts</option>
                    </select>
                </div>
            </div>
            
            <div className="text-sm text-slate-500 font-medium">
                Showing {totalCount} articles
            </div>

            {/* BULK ACTIONS BAR */}
            {selectedIds.size > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="font-semibold text-amber-800">
                        {selectedIds.size} articles selected
                    </div>
                    <div className="space-x-3">
                        <button onClick={() => setSelectedIds(new Set())} className="text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors">
                            Clear Selection
                        </button>
                        <button onClick={() => setDeleteConfirm('bulk')} className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* ARTICLES TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 w-12">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-slate-300 text-navy focus:ring-navy" 
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
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Loading articles...</td></tr>
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <p className="text-slate-500 mb-4">No articles found. Try adjusting your filters.</p>
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
                                    const dateStr = article.published_at || article.created_at
                                    return (
                                        <tr key={article.id} className={`transition-colors ${selectedIds.has(article.id) ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-slate-300 text-navy focus:ring-navy"
                                                    checked={selectedIds.has(article.id)}
                                                    onChange={() => toggleSelection(article.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/articles/${article.id}/edit`} className="font-semibold text-navy hover:text-gold transition-colors block max-w-[300px] truncate" title={article.title}>
                                                    {article.title}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <CategoryBadge category={article.category} className="!text-xs" />
                                            </td>
                                            <td className="px-6 py-4">
                                                {isPublished ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {formatDate(dateStr)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-slate-300 text-gold focus:ring-gold"
                                                    checked={article.is_featured}
                                                    onChange={() => updateFeatured(article.id, article.is_featured)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <Link href={`/admin/articles/${article.id}/edit`} className="text-slate-400 hover:text-navy transition-colors">
                                                    Edit
                                                </Link>
                                                <button onClick={() => setDeleteConfirm(article.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                                    Delete
                                                </button>
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600 text-2xl">
                            ⚠
                        </div>
                        <h3 className="font-heading font-bold text-xl text-navy mb-2">Delete Article{deleteConfirm === 'bulk' ? 's' : ''}?</h3>
                        <p className="text-slate-500 mb-6 font-medium">
                            {deleteConfirm === 'bulk' 
                                ? `Are you sure you want to delete ${selectedIds.size} articles? This cannot be undone.`
                                : `Are you sure you want to delete this article? This cannot be undone.`
                            }
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={performDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
