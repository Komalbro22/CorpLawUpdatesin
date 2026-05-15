import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { CalendarDays, Download, ExternalLink, FileText, PenLine, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
        publishedRes,
        draftRes,
        subscribersCountRes,
        thisMonthRes,
        articlesListRes,
        subscribersListRes
    ] = await Promise.all([
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).not('published_at', 'is', null),
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).is('published_at', null),
        supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
        supabaseAdmin.from('updates').select('id, title, category, published_at, created_at').order('created_at', { ascending: false }).limit(5),
        supabaseAdmin.from('subscribers').select('id, email, subscribed_at').order('subscribed_at', { ascending: false }).limit(5)
    ])

    const publishedCount = publishedRes.count
    const draftCount = draftRes.count
    const activeSubscribers = subscribersCountRes.count
    const thisMonthCount = thisMonthRes.count
    const recentArticles = articlesListRes.data
    const recentSubscribers = subscribersListRes.data

    const firstDbError =
        publishedRes.error ||
        draftRes.error ||
        subscribersCountRes.error ||
        thisMonthRes.error ||
        articlesListRes.error ||
        subscribersListRes.error

    return (
        <div className="space-y-8">
            {firstDbError && (
                <div
                    role="alert"
                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                >
                    <p className="font-semibold text-navy">Could not load dashboard data</p>
                    <p className="mt-1 text-amber-900/90">
                        {firstDbError.message}
                        {firstDbError.hint ? ` — ${firstDbError.hint}` : ''}
                    </p>
                    <p className="mt-2 text-amber-900/80">
                        Check <code className="rounded bg-white/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
                        <code className="rounded bg-white/80 px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{' '}
                        <code className="rounded bg-white/80 px-1 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> in{' '}
                        <code className="rounded bg-white/80 px-1 py-0.5 text-xs">.env.local</code> (copy from Vercel → Environment Variables if unsure).
                    </p>
                </div>
            )}
            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white rounded-xl p-5 md:p-6 shadow-card border border-slate-200/80 flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 ring-1 ring-amber-100">
                        <FileText className="w-6 h-6" aria-hidden />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-500">Published articles</p>
                        <p className="text-2xl font-heading font-bold text-navy tabular-nums">{publishedCount || 0}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 md:p-6 shadow-card border border-slate-200/80 flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 ring-1 ring-slate-200/80">
                        <PenLine className="w-6 h-6" aria-hidden />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-500">Draft articles</p>
                        <p className="text-2xl font-heading font-bold text-navy tabular-nums">{draftCount || 0}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 md:p-6 shadow-card border border-slate-200/80 flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 ring-1 ring-emerald-100">
                        <Users className="w-6 h-6" aria-hidden />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-500">Active subscribers</p>
                        <p className="text-2xl font-heading font-bold text-navy tabular-nums">{activeSubscribers || 0}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 md:p-6 shadow-card border border-slate-200/80 flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 shrink-0 ring-1 ring-blue-100">
                        <CalendarDays className="w-6 h-6" aria-hidden />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-500">New this month</p>
                        <p className="text-2xl font-heading font-bold text-navy tabular-nums">{thisMonthCount || 0}</p>
                    </div>
                </div>
            </div>

            {/* TWO COLUMN SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-heading font-bold text-navy mb-4">Recent Articles</h2>
                    <div className="bg-white rounded-xl shadow-card border border-slate-200/80 overflow-hidden">
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 shadow-sm backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Title</th>
                                    <th className="px-6 py-4 font-medium hidden sm:table-cell">Category</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium hidden md:table-cell">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(!recentArticles || recentArticles.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No articles yet.</td>
                                    </tr>
                                )}
                                {recentArticles?.map(article => {
                                    const isPublished = !!article.published_at
                                    return (
                                        <tr key={article.id} className="hover:bg-slate-50 group transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/articles/${article.id}/edit`} className="font-medium text-navy group-hover:text-gold transition-colors line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                                                    {article.title}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    {article.category}
                                                </span>
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
                                            <td className="px-6 py-4 hidden md:table-cell text-slate-500">
                                                {formatDate(article.created_at)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-heading font-bold text-navy mb-4">Recent Subscribers</h2>
                    <div className="bg-white rounded-xl shadow-card border border-slate-200/80 p-2">
                        {(!recentSubscribers || recentSubscribers.length === 0) && (
                            <div className="p-4 text-center text-sm text-slate-500">No subscribers yet.</div>
                        )}
                        <ul className="divide-y divide-slate-100">
                            {recentSubscribers?.map(sub => (
                                <li key={sub.id} className="p-4 flex justify-between items-center text-sm hover:bg-slate-50 transition-colors rounded-lg">
                                    <span className="font-medium text-navy truncate max-w-[150px]" title={sub.email}>{sub.email}</span>
                                    <span className="text-slate-400 text-xs ml-2 shrink-0">{formatDate(sub.subscribed_at)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="pt-6">
                <h2 className="text-lg font-heading font-bold text-navy mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/admin/articles/new"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-navy bg-gold hover:bg-amber-400 transition-colors shadow-sm shadow-slate-900/5"
                    >
                        New article
                    </Link>
                    <a
                        href="/updates"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-sm font-semibold rounded-lg text-navy hover:border-slate-300 hover:bg-white bg-slate-50/80 transition-colors"
                    >
                        View public updates
                        <ExternalLink className="w-4 h-4 opacity-70" aria-hidden />
                    </a>
                    <a
                        href="/api/admin/subscribers?export=csv"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-sm font-semibold rounded-lg text-navy hover:border-slate-300 hover:bg-white bg-slate-50/80 transition-colors"
                    >
                        Export subscribers (CSV)
                        <Download className="w-4 h-4 opacity-70" aria-hidden />
                    </a>
                </div>
            </div>
        </div>
    )
}
