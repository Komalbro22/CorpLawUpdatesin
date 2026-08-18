import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import {
    ArrowRight,
    BarChart3,
    CalendarDays,
    Download,
    Eye,
    FileText,
    PenLine,
    PenSquare,
    Radio,
    TrendingUp,
    Users,
} from 'lucide-react'
import DashboardRadarCard from '@/components/admin/DashboardRadarCard'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

    const todayFormatted = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const [
        publishedRes,
        draftRes,
        subscribersCountRes,
        gensRes,
        articlesListRes,
        subscribersListRes,
        calcStatsRes,
        publishedThisWeekRes,
        subscribersThisWeekRes,
    ] = await Promise.all([
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).not('published_at', 'is', null),
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).is('published_at', null),
        supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabaseAdmin.from('generated_documents').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('updates').select('id, title, category, published_at, created_at').order('created_at', { ascending: false }).limit(6),
        supabaseAdmin.from('subscribers').select('id, email, subscribed_at').order('subscribed_at', { ascending: false }).limit(5),
        supabaseAdmin.from('calculator_usage').select('calculator_type, input_data, result_data').order('created_at', { ascending: false }).limit(500),
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).not('published_at', 'is', null).gte('created_at', sevenDaysAgo),
        supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('subscribed_at', sevenDaysAgo),
    ])

    const publishedCount = publishedRes.count ?? 0
    const draftCount = draftRes.count ?? 0
    const activeSubscribers = subscribersCountRes.count ?? 0
    const gensCount = gensRes.count ?? 0
    const recentArticles = articlesListRes.data
    const recentSubscribers = subscribersListRes.data
    const calcStats = calcStatsRes.data || []
    const publishedThisWeek = publishedThisWeekRes.count ?? 0
    const subscribersThisWeek = subscribersThisWeekRes.count ?? 0

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

        if (type === 'mca_late_fee' && row.input_data?.formSlug) {
            const formSlug = row.input_data.formSlug.toUpperCase()
            formCounts[formSlug] = (formCounts[formSlug] || 0) + 1
        } else if (type === 'llp_late_fee' && row.input_data?.formId) {
            const formId = row.input_data.formId.toUpperCase()
            formCounts[formId] = (formCounts[formId] || 0) + 1
        }

        if (type === 'mca_late_fee' && row.result_data?.lateFee) {
            totalProjectedPenalties += Number(row.result_data.lateFee) || 0
        } else if (type === 'llp_late_fee' && row.result_data?.late) {
            totalProjectedPenalties += Number(row.result_data.late) || 0
        } else if (type === 'msme_penalty' && row.result_data?.accruedInterest) {
            totalProjectedPenalties += Number(row.result_data.accruedInterest) || 0
        }
    })

    const topForms = Object.entries(formCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
    const maxCalcCount = Math.max(1, ...Object.values(statsMap))

    const TYPE_LABELS: Record<string, string> = {
        mca_late_fee: 'MCA Late Fee Calculator',
        llp_late_fee: 'LLP Late Fee Calculator',
        msme_penalty: 'MSME Penalty Viewer',
        ccfs_savings: 'CCFS 2026 Savings Calculator',
    }

    // Progress bar targets
    const TARGETS = {
        published: 100,
        draft: 20,
        subscribers: 500,
        gens: 200,
    }

    const pct = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100))

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
                </div>
            )}

            {/* WELCOME BANNER */}
            <div className="admin-welcome-vibrant rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-slate-900 text-2xl md:text-3xl font-heading font-extrabold">
                        Welcome back, Admin 👋
                    </h1>
                    <p className="text-slate-500 mt-1.5 flex items-center gap-2 text-sm">
                        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
                        {todayFormatted}
                    </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                        <p className="text-2xl font-heading font-extrabold text-amber-600 tabular-nums">{publishedThisWeek}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Published this week</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                        <p className="text-2xl font-heading font-extrabold text-emerald-600 tabular-nums">{subscribersThisWeek}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">New subscribers</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                        <p className="text-2xl font-heading font-extrabold text-blue-600 tabular-nums">{calcStats.length > 500 ? '500+' : calcStats.length}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Tool runs (all time)</p>
                    </div>
                </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                {/* Published Articles */}
                <div className="admin-stat-vibrant-amber rounded-2xl p-5 md:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="admin-icon-vibrant-amber w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-admin-float">
                            <FileText className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Published</p>
                            <p className="text-slate-900 text-2xl font-heading font-extrabold tabular-nums mt-0.5">{publishedCount}</p>
                            {publishedThisWeek > 0 && (
                                <p className="admin-trend-up mt-0.5">
                                    <TrendingUp className="w-3 h-3" aria-hidden /> +{publishedThisWeek} this week
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="admin-progress-track mt-4">
                        <div className="admin-progress-fill amber" style={{ width: `${pct(publishedCount, TARGETS.published)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 text-right">{pct(publishedCount, TARGETS.published)}% of {TARGETS.published} target</p>
                </div>

                {/* Draft Articles */}
                <div className="admin-stat-vibrant-violet rounded-2xl p-5 md:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="admin-icon-vibrant-violet w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-admin-float">
                            <PenLine className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Drafts</p>
                            <p className="text-slate-900 text-2xl font-heading font-extrabold tabular-nums mt-0.5">{draftCount}</p>
                            <p className="admin-trend-neutral mt-0.5">Awaiting publish</p>
                        </div>
                    </div>
                    <div className="admin-progress-track mt-4">
                        <div className="admin-progress-fill violet" style={{ width: `${pct(draftCount, TARGETS.draft)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 text-right">{draftCount} draft{draftCount !== 1 ? 's' : ''} in queue</p>
                </div>

                {/* Active Subscribers */}
                <div className="admin-stat-vibrant-emerald rounded-2xl p-5 md:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="admin-icon-vibrant-emerald w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-admin-float">
                            <Users className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Subscribers</p>
                            <p className="text-slate-900 text-2xl font-heading font-extrabold tabular-nums mt-0.5">{activeSubscribers}</p>
                            {subscribersThisWeek > 0 && (
                                <p className="admin-trend-up mt-0.5">
                                    <TrendingUp className="w-3 h-3" aria-hidden /> +{subscribersThisWeek} this week
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="admin-progress-track mt-4">
                        <div className="admin-progress-fill emerald" style={{ width: `${pct(activeSubscribers, TARGETS.subscribers)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 text-right">{pct(activeSubscribers, TARGETS.subscribers)}% of {TARGETS.subscribers} goal</p>
                </div>

                {/* Document Gens */}
                <div className="admin-stat-vibrant-blue rounded-2xl p-5 md:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="admin-icon-vibrant-blue w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-admin-float">
                            <FileText className="w-5 h-5" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Doc Generations</p>
                            <p className="text-slate-900 text-2xl font-heading font-extrabold tabular-nums mt-0.5">{gensCount}</p>
                            <p className="admin-trend-neutral mt-0.5">Total all time</p>
                        </div>
                    </div>
                    <div className="admin-progress-track mt-4">
                        <div className="admin-progress-fill blue" style={{ width: `${pct(gensCount, TARGETS.gens)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 text-right">{pct(gensCount, TARGETS.gens)}% of {TARGETS.gens} milestone</p>
                </div>
            </div>

            {/* TWO COLUMN SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Articles */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-heading font-bold text-slate-900">
                            Recent <span className="text-amber-600">Articles</span>
                        </h2>
                        <Link
                            href="/admin/articles"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-amber-700 transition-colors"
                        >
                            View all <ArrowRight className="w-3 h-3" aria-hidden />
                        </Link>
                    </div>
                    <div className="admin-card-glass overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="admin-table w-full min-w-[520px] text-left text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-3.5 font-semibold">Title</th>
                                        <th className="px-5 py-3.5 font-semibold hidden sm:table-cell">Category</th>
                                        <th className="px-5 py-3.5 font-semibold">Status</th>
                                        <th className="px-5 py-3.5 font-semibold hidden md:table-cell">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!recentArticles || recentArticles.length === 0) && (
                                        <tr>
                                            <td colSpan={4}>
                                                <div className="admin-empty-state">
                                                    <div className="admin-empty-icon">
                                                        <FileText className="w-6 h-6" aria-hidden />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-500">No articles yet</p>
                                                    <p className="text-xs text-slate-400 mt-1">Create your first article to get started</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {recentArticles?.map(article => {
                                        const isPublished = !!article.published_at
                                        return (
                                            <tr key={article.id} className="border-t border-slate-100 hover:bg-white/60 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <Link href={`/admin/articles/${article.id}/edit`} className="font-semibold text-slate-800 hover:text-amber-700 transition-colors line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                                                        {article.title}
                                                    </Link>
                                                </td>
                                                <td className="px-5 py-3.5 hidden sm:table-cell">
                                                    <span className="bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
                                                        {article.category}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {isPublished ? (
                                                        <span className="admin-badge-published inline-flex items-center">
                                                            <span className="admin-badge-dot" />
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="admin-badge-draft inline-flex items-center">
                                                            Draft
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 hidden md:table-cell text-slate-500 text-xs font-medium">
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

                {/* Right column */}
                <div className="space-y-6">
                    {/* Recent Subscribers */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-heading font-bold text-slate-900">Recent Subscribers</h2>
                            <Link href="/admin/subscribers" className="text-xs font-semibold text-slate-500 hover:text-amber-700 transition-colors inline-flex items-center gap-1">
                                View all <ArrowRight className="w-3 h-3" aria-hidden />
                            </Link>
                        </div>
                        <div className="admin-card-glass p-3">
                            {(!recentSubscribers || recentSubscribers.length === 0) && (
                                <div className="admin-empty-state py-8">
                                    <div className="admin-empty-icon">
                                        <Users className="w-6 h-6" aria-hidden />
                                    </div>
                                    <p className="text-sm text-slate-500">No subscribers yet</p>
                                </div>
                            )}
                            <ul className="space-y-0.5">
                                {recentSubscribers?.map(sub => {
                                    const initial = sub.email ? sub.email.charAt(0).toUpperCase() : '?'
                                    return (
                                        <li key={sub.id} className="p-3 flex items-center gap-3 text-sm hover:bg-white/60 transition-all duration-200 rounded-xl">
                                            <div
                                                className="admin-avatar shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
                                                style={{ width: 30, height: 30 }}
                                            >
                                                {initial}
                                            </div>
                                            <span className="font-medium text-slate-700 truncate max-w-[140px] text-xs" title={sub.email}>{sub.email}</span>
                                            <span className="text-slate-400 text-[10px] ml-auto shrink-0">{formatDate(sub.subscribed_at)}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Tool Usage Analytics Card */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-heading font-bold text-slate-900">🛠️ Tool Usage <span className="text-slate-400 font-normal text-xs">(all time)</span></h2>
                            <Link href="/admin/analytics/tools" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1">
                                Logs <ArrowRight className="w-3 h-3" aria-hidden />
                            </Link>
                        </div>
                        <div className="admin-card-glass p-4 space-y-4">
                            {/* High-level summary */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/60 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Runs</p>
                                    <p className="text-xl text-slate-900 font-heading font-bold tabular-nums">{calcStats.length}</p>
                                </div>
                                <div className="bg-white/60 rounded-xl p-3 border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Penalties Calc</p>
                                    <p className="text-xl text-red-600 font-heading font-bold tabular-nums">₹{(totalProjectedPenalties / 1000).toFixed(1)}k</p>
                                </div>
                            </div>

                            {/* Top Forms */}
                            {topForms.length > 0 && (
                                <div>
                                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Top Forms</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {topForms.map(([form, count]) => (
                                            <div key={form} className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                                                {form} <span className="opacity-60 text-[10px] bg-blue-100 px-1 rounded">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Breakdown with visual bars */}
                            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Breakdown</p>
                                {Object.entries(TYPE_LABELS).map(([type, label]) => {
                                    const count = statsMap[type] || 0
                                    const barWidth = maxCalcCount > 0 ? (count / maxCalcCount) * 100 : 0
                                    return (
                                        <div key={type} className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-600 font-medium truncate mr-2">{label}</span>
                                                <span className="bg-amber-50 text-amber-700 border border-amber-100 font-bold px-2 py-0.5 rounded-md text-[10px] shrink-0">{count}</span>
                                            </div>
                                            <div className="admin-tool-bar-track">
                                                <div className="admin-tool-bar-fill" style={{ width: `${barWidth}%` }} />
                                            </div>
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
                <h2 className="text-base font-heading font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Regulator Radar */}
                    <DashboardRadarCard />

                    {/* New Article */}
                    <Link
                        href="/admin/articles/new"
                        className="admin-card-glass p-4 flex flex-col gap-2.5 hover:border-amber-200 transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="admin-icon-vibrant-amber w-9 h-9 rounded-xl flex items-center justify-center">
                            <PenSquare className="w-4 h-4" aria-hidden />
                        </div>
                        <div>
                            <p className="text-slate-900 font-heading font-bold text-sm">New Article</p>
                            <p className="text-slate-400 text-xs mt-0.5">Create & publish</p>
                        </div>
                    </Link>

                    {/* View Updates */}
                    <a
                        href="/updates"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-card-glass p-4 flex flex-col gap-2.5 hover:border-blue-200 transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="admin-icon-vibrant-blue w-9 h-9 rounded-xl flex items-center justify-center">
                            <Eye className="w-4 h-4" aria-hidden />
                        </div>
                        <div>
                            <p className="text-slate-900 font-heading font-bold text-sm">Live Preview</p>
                            <p className="text-slate-400 text-xs mt-0.5">View public site</p>
                        </div>
                    </a>

                    {/* Export CSV */}
                    <a
                        href="/api/admin/subscribers?export=csv"
                        className="admin-card-glass p-4 flex flex-col gap-2.5 hover:border-emerald-200 transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="admin-icon-vibrant-emerald w-9 h-9 rounded-xl flex items-center justify-center">
                            <Download className="w-4 h-4" aria-hidden />
                        </div>
                        <div>
                            <p className="text-slate-900 font-heading font-bold text-sm">Export CSV</p>
                            <p className="text-slate-400 text-xs mt-0.5">Subscriber list</p>
                        </div>
                    </a>

                    {/* Analytics */}
                    <Link
                        href="/admin/analytics"
                        className="admin-card-glass p-4 flex flex-col gap-2.5 hover:border-violet-200 transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="admin-icon-vibrant-violet w-9 h-9 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-4 h-4" aria-hidden />
                        </div>
                        <div>
                            <p className="text-slate-900 font-heading font-bold text-sm">Analytics</p>
                            <p className="text-slate-400 text-xs mt-0.5">Site performance</p>
                        </div>
                    </Link>

                    {/* Subscribers */}
                    <Link
                        href="/admin/subscribers"
                        className="admin-card-glass p-4 flex flex-col gap-2.5 hover:border-emerald-200 transition-all duration-300 group hover:-translate-y-1"
                    >
                        <div className="admin-icon-vibrant-emerald w-9 h-9 rounded-xl flex items-center justify-center">
                            <Users className="w-4 h-4" aria-hidden />
                        </div>
                        <div>
                            <p className="text-slate-900 font-heading font-bold text-sm">Subscribers</p>
                            <p className="text-slate-400 text-xs mt-0.5">Manage list</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
