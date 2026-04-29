/* eslint-disable */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Pagination from '@/components/Pagination'
import { formatDate } from '@/lib/utils'

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
                alert('Subscriber unsubscribed successfully')
            } else {
                const data = await res.json()
                alert('Error: ' + (data.error || 'Failed'))
            }
        } catch (err) {
            alert('Network error — please try again')
        }
    }

    async function handleDelete(id: string, email: string) {
        if (!confirm(`Permanently delete ${email}? This cannot be undone.`)) return
        
        try {
            const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setSubscribers(prev => prev.filter(s => s.id !== id))
                alert('Subscriber deleted successfully')
            } else {
                const data = await res.json()
                alert('Error: ' + (data.error || 'Failed'))
            }
        } catch (err) {
            alert('Network error — please try again')
        }
    }

    async function handleBulkDelete() {
        if (!selected.length) return
        if (!confirm(`Delete ${selected.length} subscribers?`)) return
        
        for (const id of selected) {
            await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
        }
        setSubscribers(prev => prev.filter(s => !selected.includes(s.id)))
        setSelected([])
    }

    const totalPages = Math.ceil(totalCount / 50)

    const currentPathParams = new URLSearchParams()
    if (debouncedSearch) currentPathParams.set('search', debouncedSearch)
    if (statusFilter !== 'all') currentPathParams.set('status', statusFilter)
    const basePathParams = currentPathParams.toString()
    const paginationBasePath = `/admin/subscribers${basePathParams ? '?' + basePathParams : ''}`

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="font-heading text-2xl font-bold text-navy">Subscribers</h1>
                <div className="flex gap-3">
                    {selected.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Delete Selected ({selected.length})
                        </button>
                    )}
                    <a 
                        href="/api/admin/subscribers?export=csv"
                        className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        ⬇ Export Active as CSV
                    </a>
                </div>
            </div>

            {/* STATS BAR */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-slate-500 text-sm font-medium mb-1">Total Active</span>
                    <span className="text-2xl font-bold text-navy">{stats.totalActive}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-slate-500 text-sm font-medium mb-1">Total Inactive</span>
                    <span className="text-2xl font-bold text-slate-400">{stats.totalInactive}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-emerald-600 text-sm font-medium mb-1">New This Month</span>
                    <span className="text-2xl font-bold text-emerald-700">{stats.newThisMonth}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                    <span className="text-gold text-sm font-medium mb-1">New This Week</span>
                    <span className="text-2xl font-bold text-navy">{stats.newThisWeek}</span>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:outline-none text-navy"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="flex-1 md:w-48 appearance-none bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-gold focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Unsubscribed</option>
                    </select>
                </div>
            </div>

            {/* SUBSCRIBERS TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium w-12">
                                    <input 
                                        type="checkbox" 
                                        checked={subscribers.length > 0 && selected.length === subscribers.length}
                                        onChange={e => {
                                            if (e.target.checked) setSelected(subscribers.map(s => s.id))
                                            else setSelected([])
                                        }}
                                        className="rounded border-slate-300"
                                    />
                                </th>
                                <th className="px-6 py-4 font-medium w-[40%]">Email Address</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Subscribed Date</th>
                                <th className="px-6 py-4 font-medium">Unsubscribed Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading subscribers...</td></tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No subscribers found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                subscribers.map(sub => (
                                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
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
                                                className="rounded border-slate-300"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-navy">
                                            {sub.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.is_active ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-600">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-500">
                                                    Unsubscribed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {formatDate(sub.subscribed_at)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {sub.unsubscribed_at ? formatDate(sub.unsubscribed_at) : '-'}
                                        </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                {sub.is_active && (
                                                    <button
                                                        onClick={() => handleUnsubscribe(sub.id)}
                                                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                                                    >
                                                        Unsubscribe
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(sub.id, sub.email)}
                                                    className="text-red-500 hover:text-red-600 text-sm font-medium ml-3"
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
