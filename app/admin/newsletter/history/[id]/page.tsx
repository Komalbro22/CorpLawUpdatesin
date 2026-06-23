/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Download, RefreshCw, Mail, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react'
import { useToast } from '@/components/Toast'
import { sanitizeHtml } from '@/lib/sanitize'

export default function CampaignDetails() {
    const { id } = useParams()
    const { showToast } = useToast()
    
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
                showToast(d.message || 'Retry queued', 'success')
                fetchDetails()
            } else {
                showToast(d.error || 'Retry failed', 'error')
            }
        } catch (e: any) {
            showToast(e.message || 'Failed to retry', 'error')
        } finally {
            setRetrying(false)
        }
    }

    if (loading && !data) {
        return (
            <div className="flex justify-center py-20 text-slate-500">
                <RefreshCw className="animate-spin h-8 w-8 text-amber-500" />
            </div>
        )
    }

    if (!data || data.error || !data.campaign) {
        return <div className="text-rose-500 text-center py-10">Error loading campaign details</div>
    }

    const { campaign, recipients, total, statusCounts } = data
    const totalPages = Math.ceil(total / limit)

    const statusBadge = (status: string) => {
        switch(status) {
            case 'delivered': 
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Delivered</span>
            case 'opened': 
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Opened</span>
            case 'clicked': 
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Clicked</span>
            case 'failed': 
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">Failed</span>
            case 'bounced': 
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Bounced</span>
            default: 
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-350 border border-slate-700">{status}</span>
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10 text-slate-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/newsletter/history" className="p-2 bg-slate-100 border border-white/60 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-slate-900 truncate max-w-lg">{campaign.subject}</h1>
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
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg hover:bg-rose-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {retrying ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            {retrying ? 'Retrying...' : 'Retry Failed'}
                        </button>
                    )}
                    <a href={`/api/admin/newsletter/history/${id}/export`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-white/60 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors">
                        <Download size={16} /> Export CSV
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="admin-card p-4 text-center">
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Recipients</div>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{campaign.total_recipients || 0}</div>
                        </div>
                        <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 text-center">
                            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Delivered</div>
                            <div className="text-2xl font-bold text-emerald-300 mt-1">{statusCounts.delivered + statusCounts.opened + statusCounts.clicked}</div>
                        </div>
                        <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 text-center">
                            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Opened</div>
                            <div className="text-2xl font-bold text-blue-300 mt-1">{statusCounts.opened + statusCounts.clicked}</div>
                        </div>
                        <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/20 text-center">
                            <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">Failed/Bounced</div>
                            <div className="text-2xl font-bold text-rose-300 mt-1">{statusCounts.failed + statusCounts.bounced}</div>
                        </div>
                    </div>

                    {/* Recipients Table */}
                    <div className="admin-card overflow-hidden">
                        <div className="p-4 border-b border-white/60 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Mail size={18} /> Recipients</h3>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Search email..." 
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-805 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-900"
                                    />
                                </form>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="px-3 py-2 bg-slate-50 border border-white/60 rounded-lg text-sm focus:outline-none text-slate-900"
                                >
                                    <option className="bg-slate-100 text-white" value="all">All Status</option>
                                    <option className="bg-slate-100 text-white" value="delivered">Delivered</option>
                                    <option className="bg-slate-100 text-white" value="opened">Opened</option>
                                    <option className="bg-slate-100 text-white" value="clicked">Clicked</option>
                                    <option className="bg-slate-100 text-white" value="failed">Failed</option>
                                    <option className="bg-slate-100 text-white" value="bounced">Bounced</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto relative min-h-[300px]">
                            {loading && (
                                <div className="absolute inset-0 bg-slate-50/80 flex items-center justify-center z-10">
                                    <RefreshCw className="animate-spin text-amber-500" />
                                </div>
                            )}
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/60 border-b border-white/60 text-sm text-slate-500">
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Sent Time</th>
                                        <th className="p-4 font-medium">Error</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-200/50">
                                    {recipients?.length > 0 ? (
                                        recipients.map((r: any) => (
                                            <tr key={r.id} className="hover:bg-slate-100/50">
                                                <td className="p-4 font-medium text-slate-800">{r.email}</td>
                                                <td className="p-4">{statusBadge(r.status)}</td>
                                                <td className="p-4 text-slate-500">{r.sent_at ? new Date(r.sent_at).toLocaleString() : '-'}</td>
                                                <td className="p-4 text-xs text-rose-450 max-w-[200px] truncate" title={r.error_message || ''}>{r.error_message || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500 bg-slate-100/10">No recipients match your filters.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center p-4 border-t border-white/60 gap-2 bg-slate-50/20">
                                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 bg-slate-50 border border-white/60 rounded-lg hover:bg-slate-100 text-sm disabled:opacity-30">Prev</button>
                                <span className="px-3 py-1.5 text-sm font-medium text-slate-500">Page {page} of {totalPages}</span>
                                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-slate-50 border border-white/60 rounded-lg hover:bg-slate-100 text-sm disabled:opacity-30">Next</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Email Preview) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="admin-card overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-white/60 bg-slate-50/50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-400" /> HTML Preview</h3>
                            <p className="text-xs text-slate-500 mt-1">This is the exact snapshot of the email that was sent.</p>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-50 p-4">
                            {campaign.rendered_html ? (
                                <div className="bg-white mx-auto shadow-md overflow-hidden rounded border border-white/60" style={{maxWidth: '600px'}}>
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(campaign.rendered_html) }} 
                                        className="pointer-events-none" // Prevents accidentally clicking links in preview
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
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
