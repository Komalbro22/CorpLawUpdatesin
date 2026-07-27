'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, Search, Trash2, Users, Clock, CheckCircle2, PhoneCall, UserCheck, Globe, ExternalLink } from 'lucide-react'
import Pagination from '@/components/Pagination'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/Toast'
import { PartnerInterest, PartnerInterestStatus } from '@/types'

interface Stats {
    total: number
    pending: number
    reviewed: number
    contacted: number
    onboarded: number
}

const SERVICE_OPTIONS = [
    'MCA Filings (DIR-12, DPT-3, AOC-4, MGT-7)',
    'ROC Compliance & Incorporation',
    'SEBI LODR & Secretarial Audit',
    'RBI & FEMA Compliance',
    'IBBI & Insolvency Advisory',
    'NCLT Drafting & Representations',
    'Tax & Statutory Audit',
    'Legal Due Diligence & Agreements',
]

const STATUS_BADGE_STYLES: Record<PartnerInterestStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
    contacted: 'bg-purple-50 text-purple-700 border-purple-200',
    onboarded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function AdminPartnerInterestsPage() {
    const { showToast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()

    const initialPage = parseInt(searchParams.get('page') || '1', 10)

    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [serviceFilter, setServiceFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(initialPage)

    const [items, setItems] = useState<PartnerInterest[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, reviewed: 0, contacted: 0, onboarded: 0 })
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set())

    const toggleExpandRow = (id: string) => {
        setExpandedRowIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }


    const fetchPartnerInterests = useCallback(async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (debouncedSearch) params.set('search', debouncedSearch)
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (serviceFilter !== 'all') params.set('service', serviceFilter)
        params.set('page', currentPage.toString())

        try {
            const res = await fetch(`/api/admin/partner-interests?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setItems(data.partnerInterests || [])
                setTotalCount(data.total || 0)
                setStats(data.stats || { total: 0, pending: 0, reviewed: 0, contacted: 0, onboarded: 0 })
            }
        } catch (err) {
            console.error('Error fetching partner interests:', err)
            showToast('Failed to load partner interest submissions', 'error')
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, statusFilter, serviceFilter, currentPage, showToast])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        fetchPartnerInterests()
    }, [fetchPartnerInterests])

    useEffect(() => {
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
        if (pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl)
        }
    }, [searchParams, currentPage])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setCurrentPage(1)
        router.push('/admin/partner-interests')
    }

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value)
        setCurrentPage(1)
        router.push('/admin/partner-interests')
    }

    const handleServiceFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setServiceFilter(e.target.value)
        setCurrentPage(1)
        router.push('/admin/partner-interests')
    }

    const handleStatusChange = async (id: string, newStatus: PartnerInterestStatus) => {
        setUpdatingId(id)
        try {
            const res = await fetch(`/api/admin/partner-interests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                setItems((prev) =>
                    prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
                )
                showToast(`Status updated to "${newStatus}"`, 'success')
            } else {
                const data = await res.json()
                showToast(`Failed: ${data.error || 'Could not update status'}`, 'error')
            }
        } catch (err) {
            console.error('Error updating status:', err)
            showToast('Network error — please try again', 'error')
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Permanently delete interest submission from "${name}"?`)) return

        try {
            const res = await fetch(`/api/admin/partner-interests/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setItems((prev) => prev.filter((item) => item.id !== id))
                setTotalCount((prev) => Math.max(0, prev - 1))
                showToast('Submission deleted successfully', 'success')
            } else {
                const data = await res.json()
                showToast(`Error: ${data.error || 'Failed to delete'}`, 'error')
            }
        } catch (err) {
            console.error('Error deleting submission:', err)
            showToast('Network error — please try again', 'error')
        }
    }

    const totalPages = Math.ceil(totalCount / 25)

    const currentPathParams = new URLSearchParams()
    if (debouncedSearch) currentPathParams.set('search', debouncedSearch)
    if (statusFilter !== 'all') currentPathParams.set('status', statusFilter)
    if (serviceFilter !== 'all') currentPathParams.set('service', serviceFilter)
    const basePathParams = currentPathParams.toString()
    const paginationBasePath = `/admin/partner-interests${basePathParams ? '?' + basePathParams : ''}`

    return (
        <div className="space-y-6 pb-12 content-fade-in">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-slate-900">Partner Interests</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Manage professional interest submissions from CS, CA, and legal firms looking to list compliance services.
                    </p>
                </div>
                <a
                    href="/api/admin/partner-interests?export=csv"
                    className="inline-flex items-center gap-2 bg-navy text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4 opacity-90" aria-hidden />
                    Export CSV
                </a>
            </div>

            {/* STATS BAR */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="admin-card-glass p-5 rounded-xl border border-slate-200/80 shadow-card flex flex-col gap-1">
                    <span className="inline-flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                        <Users className="w-4 h-4 text-navy" /> Total Submissions
                    </span>
                    <span className="text-2xl font-heading font-bold text-slate-900 tabular-nums">{stats.total}</span>
                </div>
                <div className="admin-card-glass p-5 rounded-xl border border-slate-200/80 shadow-card flex flex-col gap-1">
                    <span className="inline-flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wider">
                        <Clock className="w-4 h-4 text-amber-600" /> Pending
                    </span>
                    <span className="text-2xl font-heading font-bold text-amber-800 tabular-nums">{stats.pending}</span>
                </div>
                <div className="admin-card-glass p-5 rounded-xl border border-slate-200/80 shadow-card flex flex-col gap-1">
                    <span className="inline-flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Reviewed
                    </span>
                    <span className="text-2xl font-heading font-bold text-blue-800 tabular-nums">{stats.reviewed}</span>
                </div>
                <div className="admin-card-glass p-5 rounded-xl border border-slate-200/80 shadow-card flex flex-col gap-1">
                    <span className="inline-flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase tracking-wider">
                        <PhoneCall className="w-4 h-4 text-purple-600" /> Contacted
                    </span>
                    <span className="text-2xl font-heading font-bold text-purple-800 tabular-nums">{stats.contacted}</span>
                </div>
                <div className="admin-card-glass p-5 rounded-xl border border-slate-200/80 shadow-card flex flex-col gap-1">
                    <span className="inline-flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
                        <UserCheck className="w-4 h-4 text-emerald-600" /> Onboarded
                    </span>
                    <span className="text-2xl font-heading font-bold text-emerald-800 tabular-nums">{stats.onboarded}</span>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="admin-card-glass p-4 md:p-5 rounded-xl shadow-card border border-white/60 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="search"
                        placeholder="Search by firm name, contact, qualification..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 bg-white"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="w-full sm:w-44 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="onboarded">Onboarded</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={serviceFilter}
                        onChange={handleServiceFilterChange}
                        className="w-full sm:w-56 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                        <option value="all">All Services</option>
                        {SERVICE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* SUBMISSIONS TABLE */}
            <div className="admin-card-glass border border-slate-200 overflow-hidden rounded-xl shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Firm / Individual Name</th>
                                <th className="px-6 py-4 font-semibold">Qual / Exp</th>
                                <th className="px-6 py-4 font-semibold">Services Offered</th>
                                <th className="px-6 py-4 font-semibold">Contact Details</th>
                                <th className="px-6 py-4 font-semibold">Submitted</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-4">
                                            <div className="h-4 bg-slate-100 rounded w-1/2" />
                                        </td>
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No partner interest submissions found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                        {/* Name & Website */}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{item.firm_or_individual_name}</div>
                                            {item.website && (
                                                <a
                                                    href={item.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 mt-0.5"
                                                >
                                                    <Globe className="w-3 h-3" />
                                                    {item.website.replace(/^https?:\/\//, '')}
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            )}
                                        </td>

                                        {/* Qualification & Experience */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {item.qualification || 'N/A'}
                                            </span>
                                            <span className="text-xs text-slate-500 ml-2">
                                                {item.experience_years ? `${item.experience_years} yrs exp` : ''}
                                            </span>
                                        </td>

                                        {/* Services */}
                                        <td className="px-6 py-4 whitespace-normal max-w-sm">
                                            <div className="flex flex-wrap gap-1.5">
                                                {(expandedRowIds.has(item.id)
                                                    ? item.services || []
                                                    : (item.services || []).slice(0, 3)
                                                ).map((srv, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 inline-block"
                                                    >
                                                        {srv}
                                                    </span>
                                                ))}
                                                {(item.services || []).length > 3 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpandRow(item.id)}
                                                        className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                    >
                                                        {expandedRowIds.has(item.id)
                                                            ? 'Show less'
                                                            : `+${(item.services || []).length - 3} more`}
                                                    </button>
                                                )}
                                            </div>
                                            {item.additional_notes && (
                                                <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 whitespace-normal">
                                                    <span className="font-semibold text-slate-700">Notes:</span> {item.additional_notes}
                                                </div>
                                            )}
                                        </td>


                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 font-medium text-xs">
                                                {item.contact_value || 'Direct reach out'}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                Via: {item.contact_preference || 'Not specified'}
                                            </div>
                                        </td>

                                        {/* Submitted Date */}
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {formatDate(item.created_at)}
                                        </td>

                                        {/* Status Dropdown */}
                                        <td className="px-6 py-4">
                                            <select
                                                disabled={updatingId === item.id}
                                                value={item.status}
                                                onChange={(e) =>
                                                    handleStatusChange(item.id, e.target.value as PartnerInterestStatus)
                                                }
                                                className={`text-xs font-bold px-2.5 py-1 rounded-md border focus:outline-none transition-all ${
                                                    STATUS_BADGE_STYLES[item.status] || 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="onboarded">Onboarded</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(item.id, item.firm_or_individual_name)}
                                                className="text-red-500 hover:text-red-700 text-xs font-semibold p-1.5 rounded hover:bg-red-50 transition-colors"
                                                title="Delete Submission"
                                            >
                                                <Trash2 className="w-4 h-4" />
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
