import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import {
    ArrowRight,
    CalendarDays,
    Download,
    Eye,
    FileText,
    PenLine,
    PenSquare,
    Users,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const todayFormatted = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [
        publishedRes,
        draftRes,
        subscribersCountRes,
        gensRes,
        articlesListRes,
        subscribersListRes,
        calcStatsRes
    ] = await Promise.all([
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).not('published_at', 'is', null),
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).is('published_at', null),
        supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabaseAdmin.from('generated_documents').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('updates').select('id, title, category, published_at, created_at').order('created_at', { ascending: false }).limit(5),
        supabaseAdmin.from('subscribers').select('id, email, subscribed_at').order('subscribed_at', { ascending: false }).limit(5),
        supabaseAdmin.from('calculator_usage').select('calculator_type, input_data, result_data').gte('created_at', sevenDaysAgo)
    ])

    const publishedCount = publishedRes.count
    const draftCount = draftRes.count
    const activeSubscribers = subscribersCountRes.count
    const gensCount = gensRes.count
    const recentArticles = articlesListRes.data
    const recentSubscribers = subscribersListRes.data
    const calcStats = calcStatsRes.data || []

    const firstDbError =
        publishedRes.error ||
        draftRes.error ||
        subscribersCountRes.error ||
        gensRes.error ||
        articlesListRes.error ||
        subscribersListRes.error ||
        calcStatsRes.error

    // Group calculator usage statistics
    const statsMap: Record<string, number> = {}
    const formCounts: Record<string, number> = {}
    let totalProjectedPenalties = 0

    calcStats.forEach(row => {
        const type = row.calculator_type || 'unknown'
        statsMap[type] = (statsMap[type] || 0) + 1

        // Extract form name if available
        if (type === 'mca_late_fee' && row.input_data?.formSlug) {
            const formSlug = row.input_data.formSlug.toUpperCase()
            formCounts[formSlug] = (formCounts[formSlug] || 0) + 1
        } else if (type === 'llp_late_fee' && row.input_data?.formId) {
            const formId = row.input_data.formId.toUpperCase()
            formCounts[formId] = (formCounts[formId] || 0) + 1
        }

        // Aggregate penalties
        if (type === 'mca_late_fee' && row.result_data?.lateFee) {
            totalProjectedPenalties += Number(row.result_data.lateFee) || 0
        } else if (type === 'llp_late_fee' && row.result_data?.late) {
            totalProjectedPenalties += Number(row.result_data.late) || 0
        } else if (type === 'msme_penalty' && row.result_data?.accruedInterest) {
            totalProjectedPenalties += Number(row.result_data.accruedInterest) || 0
        }
    })

    const topForms = Object.entries(formCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)

    const TYPE_LABELS: Record<string, string> = {
        mca_late_fee: 'MCA Late Fee Calculator',
        llp_late_fee: 'LLP Late Fee Calculator',
        msme_penalty: 'MSME Penalty Viewer',
        ccfs_savings: 'CCFS 2026 Savings Calculator',
    }


    return (
        <div className="space-y-8">
            {/* ERROR BANNER */}
            {firstDbError && (
                <div
                    role="alert"
                    className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-sm text-red-300"
                >
                    <p className="font-semibold text-red-200">Could not load dashboard data</p>
                    <p className="mt-1 text-red-300/90">
                        {firstDbError.message}
                        {firstDbError.hint ? ` — ${firstDbError.hint}` : ''}
                    </p>
                    <p className="mt-2 text-red-400/80">
                        Check <code className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-200">NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
                        <code className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{' '}
                        <code className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-200">SUPABASE_SERVICE_ROLE_KEY</code> in{' '}
                        <code className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-200">.env.local</code> (copy from Vercel → Environment Variables if unsure).
                    </p>
                </div>
            )}

            {/* WELCOME BANNER */}
            <div className="admin-welcome-gradient rounded-2xl p-6 md:p-8">
                <h1 className="admin-gradient-text text-2xl md:text-3xl font-heading font-extrabold">
                    Welcome back, Admin
                </h1>
                <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm">
                    <CalendarDays className="w-4 h-4 text-slate-500" aria-hidden />
                    {todayFormatted}
                </p>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                {/* Published Articles Card */}
                <div className="admin-stat-amber rounded-2xl p-5 md:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="admin-icon-amber w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-admin-float">
                            <FileText className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Published articles</p>
                            <p className="text-white text-2xl font-heading font-extrabold tabular-nums mt-0.5">{publishedCount || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Draft Articles Card */}
                <div className="admin-stat-violet rounded-2xl p-5 md:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="admin-icon-violet w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-admin-float">
                            <PenLine className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Draft articles</p>
                            <p className="text-white text-2xl font-heading font-extrabold tabular-nums mt-0.5">{draftCount || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Active Subscribers Card */}
                <div className="admin-stat-emerald rounded-2xl p-5 md:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="admin-icon-emerald w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-admin-float">
                            <Users className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active subscribers</p>
                            <p className="text-white text-2xl font-heading font-extrabold tabular-nums mt-0.5">{activeSubscribers || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Document Gens Card */}
                <div className="admin-stat-blue rounded-2xl p-5 md:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="admin-icon-blue w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-admin-float">
                            <FileText className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Document Gens</p>
                            <p className="text-white text-2xl font-heading font-extrabold tabular-nums mt-0.5">{gensCount || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TWO COLUMN SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Articles */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-heading font-bold text-white mb-4">
                        Recent <span className="admin-gradient-text">Articles</span>
                    </h2>
                    <div className="admin-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="admin-table w-full min-w-[520px] text-left text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Title</th>
                                        <th className="px-6 py-4 font-semibold hidden sm:table-cell">Category</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold hidden md:table-cell">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!recentArticles || recentArticles.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No articles yet.</td>
                                        </tr>
                                    )}
                                    {recentArticles?.map(article => {
                                        const isPublished = !!article.published_at
                                        return (
                                            <tr key={article.id} className="border-t border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                                                <td className="px-6 py-4">
                                                    <Link href={`/admin/articles/${article.id}/edit`} className="font-semibold text-slate-200 hover:text-amber-400 transition-colors line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                                                        {article.title}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell">
                                                    <span className="bg-white/[0.06] text-slate-300 border border-white/[0.08] rounded-full px-2.5 py-0.5 text-xs">
                                                        {article.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isPublished ? (
                                                        <span className="admin-badge-published glow-dot-emerald px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="admin-badge-draft glow-dot-amber px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                            Draft
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell text-slate-500 font-medium">
                                                    {formatDate(article.created_at)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* View All Link */}
                        <div className="px-6 py-4 border-t border-white/[0.06]">
                            <Link
                                href="/admin/articles"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors group/link"
                            >
                                View All
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" aria-hidden />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Subscribers & Tool Usage Stats */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-heading font-bold text-white mb-4">Recent Subscribers</h2>
                        <div className="admin-card p-3">
                            {(!recentSubscribers || recentSubscribers.length === 0) && (
                                <div className="p-4 text-center text-sm text-slate-500">No subscribers yet.</div>
                            )}
                            <ul className="space-y-1">
                                {recentSubscribers?.map(sub => {
                                    const initial = sub.email ? sub.email.charAt(0).toUpperCase() : '?'
                                    return (
                                        <li key={sub.id} className="p-3 flex items-center gap-3 text-sm hover:bg-white/[0.04] transition-all duration-200 rounded-xl">
                                            <div
                                                className="admin-avatar shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
                                                style={{ width: 28, height: 28 }}
                                            >
                                                {initial}
                                            </div>
                                            <span className="font-semibold text-slate-200 truncate max-w-[140px]" title={sub.email}>{sub.email}</span>
                                            <span className="text-slate-500 text-xs ml-auto shrink-0">{formatDate(sub.subscribed_at)}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Tool Usage Analytics Card */}
                    <div>
                        <h2 className="text-lg font-heading font-bold text-white mb-4">🛠️ Tool Usage (7 Days)</h2>
                        <div className="admin-card p-5 space-y-5">
                            
                            {/* High-level summary */}
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Runs</p>
                                    <p className="text-xl text-white font-bold tabular-nums">{calcStats.length}</p>
                                </div>
                                <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Penalties Calc</p>
                                    <p className="text-xl text-red-400 font-bold tabular-nums">₹{(totalProjectedPenalties/1000).toFixed(1)}k</p>
                                </div>
                            </div>

                            {/* Top Forms */}
                            {topForms.length > 0 && (
                                <div>
                                    <p className="text-xs text-slate-400 font-semibold mb-2">MOST CALCULATED FORMS</p>
                                    <div className="flex flex-wrap gap-2">
                                        {topForms.map(([form, count]) => (
                                            <div key={form} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5">
                                                {form} <span className="opacity-60 text-[10px] bg-blue-500/20 px-1 rounded">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                                <p className="text-xs text-slate-400 font-semibold">BREAKDOWN BY TOOL</p>
                                {Object.entries(TYPE_LABELS).map(([type, label]) => {
                                    const count = statsMap[type] || 0
                                    return (
                                        <div key={type} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0 text-sm">
                                            <span className="text-slate-400 font-medium">{label}</span>
                                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2.5 py-0.5 rounded-lg text-xs">
                                                {count} runs
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="pt-2">
                <h2 className="text-lg font-heading font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* New Article */}
                    <Link
                        href="/admin/articles/new"
                        className="admin-card p-5 flex flex-col gap-3 hover:border-amber-500/20 transition-all duration-300 group"
                    >
                        <div className="admin-icon-amber w-10 h-10 rounded-xl flex items-center justify-center">
                            <PenSquare className="w-4.5 h-4.5" aria-hidden />
                        </div>
                        <div>
                            <p className="text-white font-heading font-bold text-sm">New Article</p>
                            <p className="text-slate-500 text-xs mt-0.5">Create and publish a new update</p>
                        </div>
                    </Link>

                    {/* View Updates */}
                    <a
                        href="/updates"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-card p-5 flex flex-col gap-3 hover:border-blue-500/20 transition-all duration-300 group"
                    >
                        <div className="admin-icon-blue w-10 h-10 rounded-xl flex items-center justify-center">
                            <Eye className="w-4.5 h-4.5" aria-hidden />
                        </div>
                        <div>
                            <p className="text-white font-heading font-bold text-sm">View Updates</p>
                            <p className="text-slate-500 text-xs mt-0.5">Preview public-facing updates page</p>
                        </div>
                    </a>

                    {/* Export CSV */}
                    <a
                        href="/api/admin/subscribers?export=csv"
                        className="admin-card p-5 flex flex-col gap-3 hover:border-emerald-500/20 transition-all duration-300 group"
                    >
                        <div className="admin-icon-emerald w-10 h-10 rounded-xl flex items-center justify-center">
                            <Download className="w-4.5 h-4.5" aria-hidden />
                        </div>
                        <div>
                            <p className="text-white font-heading font-bold text-sm">Export CSV</p>
                            <p className="text-slate-500 text-xs mt-0.5">Download subscriber list as CSV</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}
