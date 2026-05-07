/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3, Users, Mail, MousePointerClick, RefreshCw, Eye } from 'lucide-react'

export default function HistoryDashboard({ searchParams }: { searchParams: { page?: string } }) {
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

    if (loading) {
        return <div className="flex justify-center py-20 text-slate-500"><RefreshCw className="animate-spin h-8 w-8 text-amber-500" /></div>
    }

    if (!data || data.error) {
        return <div className="text-red-500 text-center py-10">Error loading dashboard</div>
    }

    const { campaigns, total, stats, chartData } = data
    const totalPages = Math.ceil(total / limit)

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-navy flex items-center gap-3">
                    <BarChart3 className="text-amber-500" />
                    Newsletter History
                </h1>
                <p className="text-slate-500 mt-2">Track campaign performance, delivery rates, and subscriber engagement.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Mail size={20} />
                        </div>
                    </div>
                    <div className="text-slate-500 text-sm font-medium">Total Sent</div>
                    <div className="text-2xl font-bold text-navy mt-1">{stats.totalSent.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="text-slate-500 text-sm font-medium">Delivered</div>
                    <div className="text-2xl font-bold text-navy mt-1">{stats.totalDelivered.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                    <div className="text-slate-500 text-sm font-medium">Delivery Rate</div>
                    <div className="text-2xl font-bold text-navy mt-1">{stats.deliveryRate}%</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                            <MousePointerClick size={20} />
                        </div>
                    </div>
                    <div className="text-slate-500 text-sm font-medium">Open Rate</div>
                    <div className="text-2xl font-bold text-navy mt-1">{stats.openRate}%</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-semibold text-navy mb-6">Emails Sent Over Time</h3>
                <div className="h-72 w-full">
                    {chartData && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="sent" stroke="#F59E0B" strokeWidth={3} dot={{r: 4, fill: '#F59E0B', strokeWidth: 0}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">No chart data available</div>
                    )}
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-navy">Campaign History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
                                <th className="p-4 font-medium">Subject</th>
                                <th className="p-4 font-medium">Date Sent</th>
                                <th className="p-4 font-medium">Recipients</th>
                                <th className="p-4 font-medium">Delivered</th>
                                <th className="p-4 font-medium">Failed</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {campaigns?.length > 0 ? (
                                campaigns.map((campaign: any) => (
                                    <tr key={campaign.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-medium text-navy max-w-xs truncate" title={campaign.subject}>
                                            {campaign.subject}
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {new Date(campaign.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-slate-600 font-medium">
                                            {campaign.total_recipients || 0}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                {campaign.sent_count || 0}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${campaign.failed_count > 0 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {campaign.failed_count || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link 
                                                href={`/admin/newsletter/history/${campaign.id}`}
                                                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-navy transition-colors"
                                            >
                                                <Eye size={16} className="mr-1.5" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        No campaigns found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Custom internal Pagination for Client Component using Next.js Link (assumes page refresh or soft nav) */}
                {totalPages > 1 && (
                    <div className="flex justify-center p-6 border-t border-slate-100 gap-2">
                        {page > 1 && (
                            <Link href={`/admin/newsletter/history?page=${page - 1}`} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm">Prev</Link>
                        )}
                        <span className="px-3 py-1.5 text-sm font-medium text-slate-600">Page {page} of {totalPages}</span>
                        {page < totalPages && (
                            <Link href={`/admin/newsletter/history?page=${page + 1}`} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm">Next</Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

