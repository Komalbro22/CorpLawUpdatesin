/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, RefreshCw, Mail, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react'

export default function CampaignDetails() {
    const { id } = useParams()
    const router = useRouter()
    
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [retrying, setRetrying] = useState(false)

    const limit = 20

    const fetchDetails = () => {
        setLoading(true)
        fetch(`/api/admin/newsletter/history/${id}?page=${page}&limit=${limit}&status=${statusFilter}&search=${encodeURIComponent(search)}`)
            .then(res => res.json())
            .then(d => {
                setData(d)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }

    useEffect(() => {
        if (id) {
            fetchDetails()
        }
    }, [id, page, statusFilter, search])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setSearch(searchInput)
        setPage(1)
    }

    const handleRetry = async () => {
        if (!confirm('Are you sure you want to retry all failed and bounced emails for this campaign?')) return
        setRetrying(true)
        try {
            const res = await fetch(`/api/admin/newsletter/history/${id}/retry`, { method: 'POST' })
            const d = await res.json()
            if (res.ok) {
                alert(d.message)
                fetchDetails() // refresh table
            } else {
                alert(`Error: ${d.error}`)
            }
        } catch (e: any) {
            alert(`Failed to retry: ${e.message}`)
        } finally {
            setRetrying(false)
        }
    }

    if (loading && !data) {
        return <div className="flex justify-center py-20 text-slate-500"><RefreshCw className="animate-spin h-8 w-8 text-amber-500" /></div>
    }

    if (!data || data.error || !data.campaign) {
        return <div className="text-red-500 text-center py-10">Error loading campaign details</div>
    }

    const { campaign, recipients, total, statusCounts } = data
    const totalPages = Math.ceil(total / limit)

    const statusBadge = (status: string) => {
        switch(status) {
            case 'delivered': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>
            case 'opened': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Opened</span>
            case 'clicked': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">Clicked</span>
            case 'failed': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Failed</span>
            case 'bounced': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Bounced</span>
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status}</span>
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/newsletter/history" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-navy hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-navy truncate max-w-lg">{campaign.subject}</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Sent on {new Date(campaign.created_at).toLocaleString()} by {campaign.sent_by}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {(statusCounts.failed > 0 || statusCounts.bounced > 0) && (
                        <button 
                            onClick={handleRetry} 
                            disabled={retrying}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {retrying ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            {retrying ? 'Retrying...' : 'Retry Failed'}
                        </button>
                    )}
                    <a href={`/api/admin/newsletter/history/${id}/export`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                        <Download size={16} /> Export CSV
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                            <div className="text-sm text-slate-500 mb-1">Total Recipients</div>
                            <div className="text-xl font-bold text-navy">{campaign.total_recipients || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
                            <div className="text-sm text-emerald-600 mb-1">Delivered</div>
                            <div className="text-xl font-bold text-emerald-700">{statusCounts.delivered + statusCounts.opened + statusCounts.clicked}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm text-center">
                            <div className="text-sm text-blue-600 mb-1">Opened</div>
                            <div className="text-xl font-bold text-blue-700">{statusCounts.opened + statusCounts.clicked}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm text-center">
                            <div className="text-sm text-red-600 mb-1">Failed/Bounced</div>
                            <div className="text-xl font-bold text-red-700">{statusCounts.failed + statusCounts.bounced}</div>
                        </div>
                    </div>

                    {/* Recipients Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="font-semibold text-navy flex items-center gap-2"><Mail size={18} /> Recipients</h3>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search email..." 
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    />
                                </form>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="opened">Opened</option>
                                    <option value="clicked">Clicked</option>
                                    <option value="failed">Failed</option>
                                    <option value="bounced">Bounced</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto relative min-h-[300px]">
                            {loading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                    <RefreshCw className="animate-spin text-amber-500" />
                                </div>
                            )}
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Sent Time</th>
                                        <th className="p-4 font-medium">Error</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {recipients?.length > 0 ? (
                                        recipients.map((r: any) => (
                                            <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                                <td className="p-4 font-medium text-navy">{r.email}</td>
                                                <td className="p-4">{statusBadge(r.status)}</td>
                                                <td className="p-4 text-slate-500">{r.sent_at ? new Date(r.sent_at).toLocaleString() : '-'}</td>
                                                <td className="p-4 text-xs text-red-500 max-w-[200px] truncate" title={r.error_message || ''}>{r.error_message || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500">No recipients match your filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center p-4 border-t border-slate-100 gap-2">
                                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm disabled:opacity-50">Prev</button>
                                <span className="px-3 py-1.5 text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
                                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm disabled:opacity-50">Next</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Email Preview) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-semibold text-navy flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> HTML Preview</h3>
                            <p className="text-xs text-slate-500 mt-1">This is the exact snapshot of the email that was sent.</p>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-100 p-4">
                            {campaign.rendered_html ? (
                                <div className="bg-white mx-auto shadow-md overflow-hidden rounded" style={{maxWidth: '600px'}}>
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: campaign.rendered_html }} 
                                        className="pointer-events-none" // Prevents accidentally clicking links in preview
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                    No HTML preview available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
