/* eslint-disable */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarDays, Download, Search, Trash2, UserMinus, Users } from 'lucide-react'
import Pagination from '@/components/Pagination'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/Toast'

interface Subscriber {
    id: string
    email: string
    is_active: boolean
    subscribed_at: string
    unsubscribed_at: string | null
}

interface Stats {
    totalActive: number
    totalInactive: number
    newThisWeek: number
    newThisMonth: number
}

export default function AdminSubscribers() {
    const { showToast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()

    const initialPage = parseInt(searchParams.get('page') || '1', 10)

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(initialPage)

    const [subscribers, setSubscribers] = useState<Subscriber[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [stats, setStats] = useState<Stats>({ totalActive: 0, totalInactive: 0, newThisMonth: 0, newThisWeek: 0 })
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<string[]>([])

    const fetchSubscribers = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (debouncedSearch) params.set('search', debouncedSearch)
        if (statusFilter !== 'all') params.set('status', statusFilter)
        params.set('page', currentPage.toString())

        try {
            const res = await fetch(`/api/admin/subscribers?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setSubscribers(data.subscribers || [])
                setTotalCount(data.total || 0)
                setStats(data.stats || { totalActive: 0, totalInactive: 0, newThisMonth: 0, newThisWeek: 0 })
            }
        } catch (err) {
            console.error('Error fetching subscribers:', err)
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, statusFilter, currentPage])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        fetchSubscribers()
    }, [fetchSubscribers])

    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
        if (pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl)
        }
    }, [searchParams])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setCurrentPage(1)
        router.push('/admin/subscribers')
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value)
        setCurrentPage(1)
        router.push('/admin/subscribers')
    }

    async function handleUnsubscribe(id: string) {
        if (!confirm('Unsubscribe this email? They will stop receiving newsletters.')) return
        
        try {
            const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'PATCH' })
            if (res.ok) {
                setSubscribers(prev => prev.map(s => s.id === id ? { ...s, is_active: false } : s))
                showToast('Subscriber unsubscribed successfully.', 'success')
            } else {
                const data = await res.json()
                showToast('Error: ' + (data.error || 'Failed to unsubscribe'), 'error')
            }
        } catch (err) {
            showToast('Network error — please try again', 'error')
        }
    }

    async function handleDelete(id: string, email: string) {
        if (!confirm(`Permanently delete ${email}? This cannot be undone.`)) return
        
        try {
            const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setSubscribers(prev => prev.filter(s => s.id !== id))
                showToast('Subscriber deleted successfully.', 'success')
            } else {
                const data = await res.json()
                showToast('Error: ' + (data.error || 'Failed to delete'), 'error')
            }
        } catch (err) {
            showToast('Network error — please try again', 'error')
        }
    }

    async function handleBulkDelete() {
        if (!selected.length) return
        if (!confirm(`Delete ${selected.length} subscribers?`)) return
        
        let count = 0
        for (const id of selected) {
            const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
            if (res.ok) count++
        }
        setSubscribers(prev => prev.filter(s => !selected.includes(s.id)))
        showToast(`Successfully deleted ${count} subscriber(s).`, 'success')
        setSelected([])
    }

    const totalPages = Math.ceil(totalCount / 50)

    const currentPathParams = new URLSearchParams()
    if (debouncedSearch) currentPathParams.set('search', debouncedSearch)
    if (statusFilter !== 'all') currentPathParams.set('status', statusFilter)
    const basePathParams = currentPathParams.toString()
    const paginationBasePath = `/admin/subscribers${basePathParams ? '?' + basePathParams : ''}`

    return (
        <div className="space-y-6 pb-12 content-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="font-heading text-2xl font-bold text-slate-100">Subscribers</h1>
                <div className="flex flex-wrap gap-3">
                    {selected.length > 0 && (
                        <button
                            type="button"
                            onClick={handleBulkDelete}
                            className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" aria-hidden />
                            Delete ({selected.length})
                        </button>
                    )}
                    <a
                        href="/api/admin/subscribers?export=csv"
                        className="inline-flex items-center gap-2 bg-navy dark:bg-slate-950 text-white dark:text-slate-200 border border-transparent dark:border-slate-800 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-900 transition-colors duration-200 shadow-sm"
                    >
                        <Download className="w-4 h-4 opacity-90" aria-hidden />
                        Export CSV
                    </a>
                </div>
            </div>

            {/* STATS BAR */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-805 shadow-card ring-1 ring-slate-900/[0.02] flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                        <Users className="w-4 h-4 text-emerald-600" aria-hidden />
                        Active
                    </span>
                    <span className="text-2xl font-heading font-bold text-navy dark:text-slate-100 tabular-nums">{stats.totalActive}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-805 shadow-card ring-1 ring-slate-900/[0.02] flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold">
                        <UserMinus className="w-4 h-4 text-slate-400" aria-hidden />
                        Inactive
                    </span>
                    <span className="text-2xl font-heading font-bold text-slate-550 dark:text-slate-400 tabular-nums">{stats.totalInactive}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-805 shadow-card ring-1 ring-slate-900/[0.02] flex flex-col gap-2">
                    <span className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold">New this month</span>
                    <span className="text-2xl font-heading font-bold text-emerald-800 dark:text-emerald-500 tabular-nums">{stats.newThisMonth}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-805 shadow-card ring-1 ring-slate-900/[0.02] flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 text-amber-800 dark:text-amber-400 text-sm font-semibold">
                        <CalendarDays className="w-4 h-4" aria-hidden />
                        This week
                    </span>
                    <span className="text-2xl font-heading font-bold text-navy dark:text-slate-100 tabular-nums">{stats.newThisWeek}</span>
                </div>
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
                        placeholder="Search by email…"
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-gold/45 focus:outline-none text-navy dark:text-slate-100 bg-white dark:bg-slate-950 transition-shadow"
                    />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="flex-1 md:w-48 appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-gold/45 focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Unsubscribed</option>
                    </select>
                </div>
            </div>

            {/* SUBSCRIBERS TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200/80 dark:border-slate-800 overflow-hidden ring-1 ring-slate-900/[0.02]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/95 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-medium w-12">
                                    <input 
                                        type="checkbox" 
                                        checked={subscribers.length > 0 && selected.length === subscribers.length}
                                        onChange={e => {
                                            if (e.target.checked) setSelected(subscribers.map(s => s.id))
                                            else setSelected([])
                                        }}
                                        className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-navy dark:text-amber-500 focus:ring-gold"
                                    />
                                </th>
                                <th className="px-6 py-4 font-medium w-[40%]">Email Address</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Subscribed Date</th>
                                <th className="px-6 py-4 font-medium">Unsubscribed Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded w-1/2 max-w-sm" />
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No subscribers found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map(sub => (
                                    <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/80 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(sub.id)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setSelected(prev => [...prev, sub.id])
                                                    } else {
                                                        setSelected(prev => 
                                                            prev.filter(id => id !== sub.id)
                                                        )
                                                    }
                                                }}
                                                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-navy dark:text-amber-500 focus:ring-gold"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-navy dark:text-slate-100">
                                            {sub.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.is_active ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                    Unsubscribed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                            {formatDate(sub.subscribed_at)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                            {sub.unsubscribed_at ? formatDate(sub.unsubscribed_at) : '-'}
                                        </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                {sub.is_active && (
                                                    <button
                                                        onClick={() => handleUnsubscribe(sub.id)}
                                                        className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 text-sm font-medium"
                                                    >
                                                        Unsubscribe
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(sub.id, sub.email)}
                                                    className="text-red-500 hover:text-red-650 text-sm font-medium ml-3"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} basePath={paginationBasePath} />
            )}
        </div>
    )
}
