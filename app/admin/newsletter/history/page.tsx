/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3, Users, Mail, MousePointerClick, RefreshCw, Eye, Trash2, Calendar, Clock } from 'lucide-react'
import { useToast } from '@/components/Toast'

export default function HistoryDashboard({ searchParams }: { searchParams: { page?: string } }) {
    const { showToast } = useToast()
    const page = parseInt(searchParams.page || '1')
    const limit = 10
    
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/admin/newsletter/history?page=${page}&limit=${limit}`)
            .then(res => res.json())
            .then(d => {
                setData(d)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [page])

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this scheduled newsletter?')) return
        
        try {
            const res = await fetch(`/api/admin/newsletter/history?id=${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                // Refresh data
                setData((prev: any) => ({
                    ...prev,
                    scheduled: prev.scheduled.filter((s: any) => s.id !== id)
                }))
                showToast('Scheduled newsletter cancelled successfully.', 'success')
            } else {
                showToast('Failed to cancel scheduled newsletter.', 'error')
            }
        } catch (err) {
            console.error(err)
            showToast('Error canceling scheduled newsletter.', 'error')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20 text-slate-400">
                <RefreshCw className="animate-spin h-8 w-8 text-amber-500" />
            </div>
        )
    }

    if (!data || data.error) {
        return <div className="text-rose-500 text-center py-10">Error loading dashboard</div>
    }

    const { campaigns, total, stats, chartData } = data
    const totalPages = Math.ceil(total / limit)

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10 content-fade-in text-slate-200">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-extrabold text-white flex items-center gap-3">
                    <BarChart3 className="text-amber-500" />
                    Newsletter History
                </h1>
                <p className="text-slate-400 mt-2">Track campaign performance, delivery rates, and subscriber engagement.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Stats Sent */}
                <div className="admin-card p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <Mail size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm font-medium">Total Sent</div>
                        <div className="text-2xl font-bold text-white mt-1">{stats.totalSent.toLocaleString()}</div>
                    </div>
                </div>

                {/* Stats Delivered */}
                <div className="admin-card p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Users size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm font-medium">Delivered</div>
                        <div className="text-2xl font-bold text-white mt-1">{stats.totalDelivered.toLocaleString()}</div>
                    </div>
                </div>

                {/* Stats Delivery Rate */}
                <div className="admin-card p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm font-medium">Delivery Rate</div>
                        <div className="text-2xl font-bold text-white mt-1">{stats.deliveryRate}%</div>
                    </div>
                </div>

                {/* Stats Open Rate */}
                <div className="admin-card p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <MousePointerClick size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm font-medium">Open Rate</div>
                        <div className="text-2xl font-bold text-white mt-1">{stats.openRate}%</div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="admin-card p-6">
                <h3 className="font-semibold text-white mb-6">Emails Sent Over Time</h3>
                <div className="h-72 w-full">
                    {chartData && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#090d16', borderRadius: '8px', border: '1px solid #1e293b', color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="sent" stroke="#F59E0B" strokeWidth={3} dot={{r: 4, fill: '#F59E0B', strokeWidth: 0}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500">No chart data available</div>
                    )}
                </div>
            </div>

            {/* Scheduled Newsletters */}
            {data.scheduled && data.scheduled.length > 0 && (
                <div className="admin-card overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40">
                        <Calendar className="text-amber-500 w-5 h-5" />
                        <h3 className="font-semibold text-white">Scheduled Newsletters</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Subject</th>
                                    <th className="p-4 font-semibold">Scheduled For</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-800/40">
                                {data.scheduled.map((newsletter: any) => (
                                    <tr key={newsletter.id} className="hover:bg-slate-900/30 transition-colors">
                                        <td className="p-4 font-medium text-slate-200">{newsletter.subject}</td>
                                        <td className="p-4 text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-500" />
                                                {new Date(newsletter.scheduled_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleCancel(newsletter.id)}
                                                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-800"
                                            >
                                                <Trash2 size={14} className="mr-1.5" />
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Campaigns Table */}
            <div className="admin-card overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                    <h3 className="font-semibold text-white">Campaign History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950 border-b border-slate-800 text-sm text-slate-400">
                                <th className="p-4 font-medium">Subject</th>
                                <th className="p-4 font-medium">Date Sent</th>
                                <th className="p-4 font-medium">Recipients</th>
                                <th className="p-4 font-medium">Delivered</th>
                                <th className="p-4 font-medium">Failed</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-800/40">
                            {campaigns?.length > 0 ? (
                                campaigns.map((campaign: any) => (
                                    <tr key={campaign.id} className="hover:bg-slate-900/30 transition-colors">
                                        <td className="p-4 font-medium text-slate-200 max-w-xs truncate" title={campaign.subject}>
                                            {campaign.subject}
                                        </td>
                                        <td className="p-4 text-slate-400">
                                            {new Date(campaign.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-slate-300 font-medium">
                                            {campaign.total_recipients || 0}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {campaign.sent_count || 0}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${campaign.failed_count > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                                {campaign.failed_count || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link 
                                                href={`/admin/newsletter/history/${campaign.id}`}
                                                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-slate-950 border border-slate-850 text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                                            >
                                                <Eye size={16} className="mr-1.5" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 bg-slate-900/10">
                                        No campaigns found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Custom internal Pagination for Client Component using Next.js Link (assumes page refresh or soft nav) */}
                {totalPages > 1 && (
                    <div className="flex justify-center p-6 border-t border-slate-800 gap-2 bg-slate-950/20">
                        {page > 1 && (
                            <Link href={`/admin/newsletter/history?page=${page - 1}`} className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg hover:bg-slate-850 text-sm">Prev</Link>
                        )}
                        <span className="px-3 py-1.5 text-sm font-medium text-slate-400">Page {page} of {totalPages}</span>
                        {page < totalPages && (
                            <Link href={`/admin/newsletter/history?page=${page + 1}`} className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg hover:bg-slate-850 text-sm">Next</Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
