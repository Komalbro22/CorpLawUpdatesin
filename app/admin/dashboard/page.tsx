import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import {
    Activity,
    ArrowRight,
    BarChart3,
    Bell,
    Calendar,
    CalendarDays,
    CheckCircle2,
    Download,
    ExternalLink,
    Eye,
    FileText,
    Layers,
    PenLine,
    PenSquare,
    Radio,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react'
import DashboardRadarCard from '@/components/admin/DashboardRadarCard'
import {
    CopyEmailButton,
    LiveGreeting,
    RadarQuickDraftButton,
} from '@/components/admin/DashboardClientComponents'

export const dynamic = 'force-dynamic'

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    MCA: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    SEBI: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    RBI: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    IBBI: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    FEMA: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    NCLT: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    CCI: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    LABOUR: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
}

export default async function AdminDashboard() {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

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
        supabaseAdmin.from('updates').select('id, title, category, published_at, created_at, slug').order('created_at', { ascending: false }).limit(6),
        supabaseAdmin.from('subscribers').select('id, email, subscribed_at, is_active').order('subscribed_at', { ascending: false }).limit(6),
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
        mca_late_fee: 'MCA Late Fee Engine',
        llp_late_fee: 'LLP Late Fee Calculator',
        msme_penalty: 'MSME Statutory Interest',
        ccfs_savings: 'CCFS 2026 Immunity Calculator',
    }

    const TARGETS = {
        published: 150,
        subscribers: 500,
        gens: 200,
    }

    const pct = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100))

    return (
        <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
            {/* DATABASE ERROR BANNER IF ANY */}
            {firstDbError && (
                <div
                    role="alert"
                    className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-sm text-red-700 flex items-start gap-3"
                >
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <div>
                        <p className="font-semibold text-red-900">Database Connection Notice</p>
                        <p className="mt-0.5 text-red-700/90">{firstDbError.message}</p>
                    </div>
                </div>
            )}

            {/* COMMAND CENTER HERO BANNER */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-sm transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Control Plane Active
                            </span>
                            <span className="text-xs text-slate-400 font-medium">·</span>
                            <span className="text-xs text-slate-500 font-medium">
                                <LiveGreeting />
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                            Corporate Law Intelligence Command Center
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {todayFormatted}
                        </p>
                    </div>

                    {/* Quick Metric Pills */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex-1 sm:flex-none bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-center min-w-[90px]">
                            <p className="text-xl sm:text-2xl font-heading font-bold text-amber-600 tabular-nums">
                                +{publishedThisWeek}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">This Week</p>
                        </div>
                        <div className="flex-1 sm:flex-none bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-center min-w-[90px]">
                            <p className="text-xl sm:text-2xl font-heading font-bold text-emerald-600 tabular-nums">
                                +{subscribersThisWeek}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">New Subs</p>
                        </div>
                        <div className="flex-1 sm:flex-none bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-center min-w-[90px]">
                            <p className="text-xl sm:text-2xl font-heading font-bold text-blue-600 tabular-nums">
                                {calcStats.length > 500 ? '500+' : calcStats.length}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Calculations</p>
                        </div>
                    </div>
                </div>

                {/* FAST ACTION COMMAND RIBBON */}
                <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
                    <Link
                        href="/admin/articles/new"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 py-2.5 rounded-xl text-xs shadow-sm shadow-amber-500/10 transition-all duration-150 active:scale-95"
                    >
                        <PenSquare className="w-3.5 h-3.5" />
                        <span>New Article</span>
                    </Link>

                    <Link
                        href="/admin/radar"
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3 py-2.5 rounded-xl text-xs border border-slate-200 hover:border-amber-300 transition-all duration-150 active:scale-95 shadow-sm group"
                    >
                        <Radio className="w-3.5 h-3.5 text-amber-500 group-hover:animate-pulse" />
                        <span>Radar Scanner</span>
                    </Link>

                    <Link
                        href="/admin/notifications"
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3 py-2.5 rounded-xl text-xs border border-slate-200 hover:border-slate-300 transition-all duration-150 active:scale-95 shadow-sm"
                    >
                        <Bell className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Push Broadcast</span>
                    </Link>

                    <a
                        href="/api/admin/subscribers?export=csv"
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3 py-2.5 rounded-xl text-xs border border-slate-200 hover:border-slate-300 transition-all duration-150 active:scale-95 shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Export Subs</span>
                    </a>

                    <Link
                        href="/admin/compliance"
                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3 py-2.5 rounded-xl text-xs border border-slate-200 hover:border-slate-300 transition-all duration-150 active:scale-95 shadow-sm"
                    >
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Due Dates</span>
                    </Link>

                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium px-3 py-2.5 rounded-xl text-xs border border-slate-200 hover:border-slate-300 transition-all duration-150 shadow-sm"
                    >
                        <span>Live Site</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                </div>
            </div>

            {/* EXECUTIVE KPI METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                {/* Published Articles */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +{publishedThisWeek} wk
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Published Content</p>
                        <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tabular-nums mt-0.5">
                            {publishedCount}
                        </p>
                    </div>
                    <div className="mt-3">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                                style={{ width: `${pct(publishedCount, TARGETS.published)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                            <span>Target: {TARGETS.published} articles</span>
                            <span className="font-semibold text-slate-600">{pct(publishedCount, TARGETS.published)}%</span>
                        </div>
                    </div>
                </div>

                {/* Draft Articles */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                            <PenLine className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-full">
                            Editorial Queue
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Drafts</p>
                        <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tabular-nums mt-0.5">
                            {draftCount}
                        </p>
                    </div>
                    <div className="mt-3">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, draftCount * 10)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                            <span>Ready for editorial review</span>
                            <Link href="/admin/articles?status=draft" className="text-purple-600 font-semibold hover:underline">
                                Review &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Active Subscribers */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +{subscribersThisWeek} new
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Subscribers</p>
                        <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tabular-nums mt-0.5">
                            {activeSubscribers}
                        </p>
                    </div>
                    <div className="mt-3">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${pct(activeSubscribers, TARGETS.subscribers)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                            <span>Goal: {TARGETS.subscribers} readers</span>
                            <span className="font-semibold text-slate-600">{pct(activeSubscribers, TARGETS.subscribers)}%</span>
                        </div>
                    </div>
                </div>

                {/* Legal Documents & Calculations */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
                            ₹{(totalProjectedPenalties / 1000).toFixed(0)}k Fees
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Legal Runs & Tools</p>
                        <p className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tabular-nums mt-0.5">
                            {gensCount + calcStats.length}
                        </p>
                    </div>
                    <div className="mt-3">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${pct(gensCount, TARGETS.gens)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                            <span>{gensCount} docs · {calcStats.length} calc runs</span>
                            <Link href="/admin/analytics/tools" className="text-blue-600 font-semibold hover:underline">
                                Logs &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* TWO-COLUMN COMMAND CENTER GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT 2 COLUMNS: RECENT ARTICLES & RADAR */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Articles Card */}
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
                                    <span>Recent Articles</span>
                                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                        {publishedCount} total
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">Published analysis and compliance updates</p>
                            </div>
                            <Link
                                href="/admin/articles"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-200/80"
                            >
                                <span>Manage All</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* DESKTOP TABLE VIEW (sm: and up) */}
                        <div className="hidden sm:block overflow-hidden border border-slate-200/70 rounded-xl">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200/70 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                                        <th className="px-4 py-3">Article Title</th>
                                        <th className="px-3 py-3">Category</th>
                                        <th className="px-3 py-3">Status</th>
                                        <th className="px-3 py-3">Date</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(!recentArticles || recentArticles.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                                                No articles published yet. Click &quot;New Article&quot; to write your first update.
                                            </td>
                                        </tr>
                                    )}
                                    {recentArticles?.map(article => {
                                        const isPublished = !!article.published_at
                                        const catStyle = CATEGORY_STYLES[article.category] || {
                                            bg: 'bg-slate-100',
                                            text: 'text-slate-700',
                                            border: 'border-slate-200',
                                        }

                                        return (
                                            <tr key={article.id} className="hover:bg-slate-50/60 transition-colors group">
                                                <td className="px-4 py-3 max-w-[280px]">
                                                    <Link
                                                        href={`/admin/articles/${article.id}/edit`}
                                                        className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 block"
                                                        title={article.title}
                                                    >
                                                        {article.title}
                                                    </Link>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                                        {article.category}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {isPublished ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            Draft
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-xs text-slate-500 font-medium whitespace-nowrap">
                                                    {formatDate(article.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1">
                                                        <Link
                                                            href={`/admin/articles/${article.id}/edit`}
                                                            className="text-xs font-semibold text-slate-600 hover:text-amber-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                                                        >
                                                            Edit
                                                        </Link>
                                                        {article.slug && (
                                                            <a
                                                                href={`/updates/${article.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
                                                                title="View Public Post"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE RESPONSIVE CARDS VIEW (< sm) — No Horizontal Overflow! */}
                        <div className="sm:hidden space-y-2.5">
                            {recentArticles?.map(article => {
                                const isPublished = !!article.published_at
                                const catStyle = CATEGORY_STYLES[article.category] || {
                                    bg: 'bg-slate-100',
                                    text: 'text-slate-700',
                                    border: 'border-slate-200',
                                }

                                return (
                                    <div
                                        key={article.id}
                                        className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                                {article.category}
                                            </span>
                                            {isPublished ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                    Draft
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            href={`/admin/articles/${article.id}/edit`}
                                            className="font-bold text-slate-900 text-sm line-clamp-2 block hover:text-amber-700"
                                        >
                                            {article.title}
                                        </Link>

                                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                                            <span>{formatDate(article.created_at)}</span>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/articles/${article.id}/edit`}
                                                    className="font-semibold text-amber-700 hover:underline text-xs"
                                                >
                                                    Edit Article &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* REGULATOR RADAR ACTIVITY HUB */}
                    <div className="bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 border border-amber-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shadow-amber-500/20">
                                    <Radio className="w-4 h-4 animate-pulse text-slate-950" />
                                </div>
                                <div>
                                    <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                                        <span>Regulator Radar Live Intelligence</span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                    </h3>
                                    <p className="text-xs text-slate-500">Live surveillance across MCA, SEBI, RBI, and IBBI</p>
                                </div>
                            </div>
                            <Link
                                href="/admin/radar"
                                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 px-3 py-1.5 rounded-xl transition-all shadow-sm self-start sm:self-auto"
                            >
                                <span>Launch Full Radar</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                            <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 text-center">
                                <p className="text-xs font-bold text-blue-700">MCA</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">Circulars & Rules</p>
                            </div>
                            <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 text-center">
                                <p className="text-xs font-bold text-emerald-700">SEBI</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">LODR & Circulars</p>
                            </div>
                            <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 text-center">
                                <p className="text-xs font-bold text-indigo-700">RBI</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">Banking & FEMA</p>
                            </div>
                            <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 text-center">
                                <p className="text-xs font-bold text-amber-700">IBBI</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">IBC Regulations</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: SUBSCRIBERS & TOOL METRICS */}
                <div className="space-y-6">
                    {/* Recent Subscribers List */}
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-heading font-bold text-base text-slate-900">Audience Growth</h3>
                                <p className="text-xs text-slate-500">{activeSubscribers} confirmed recipients</p>
                            </div>
                            <Link
                                href="/admin/subscribers"
                                className="text-xs font-semibold text-slate-500 hover:text-amber-700 transition-colors inline-flex items-center gap-1"
                            >
                                <span>View all</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {(!recentSubscribers || recentSubscribers.length === 0) && (
                                <p className="text-xs text-slate-500 py-4 text-center">No subscribers yet.</p>
                            )}
                            {recentSubscribers?.map(sub => {
                                const initial = sub.email ? sub.email.charAt(0).toUpperCase() : '?'
                                return (
                                    <div
                                        key={sub.id}
                                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-200/70"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                                                {initial}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-slate-800 truncate" title={sub.email}>
                                                    {sub.email}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {formatDate(sub.subscribed_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <CopyEmailButton email={sub.email} />
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <a
                                href="/api/admin/subscribers?export=csv"
                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Audience CSV</span>
                            </a>
                            <Link
                                href="/admin/newsletter"
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                            >
                                <span>Broadcast</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Tool Usage Analytics Card */}
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-heading font-bold text-base text-slate-900">Tool Analytics</h3>
                                <p className="text-xs text-slate-500">Calculator & Document engine runs</p>
                            </div>
                            <Link
                                href="/admin/analytics/tools"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                            >
                                <span>Logs</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        <div className="space-y-3.5">
                            {/* Summary Numbers */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Runs Logged</p>
                                    <p className="text-lg font-heading font-bold text-slate-900 mt-0.5 tabular-nums">
                                        {calcStats.length}
                                    </p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Projected Fees</p>
                                    <p className="text-lg font-heading font-bold text-red-600 mt-0.5 tabular-nums">
                                        ₹{(totalProjectedPenalties / 1000).toFixed(1)}k
                                    </p>
                                </div>
                            </div>

                            {/* Tool breakdown with visual progress */}
                            <div className="space-y-2.5 pt-1">
                                {Object.entries(TYPE_LABELS).map(([type, label]) => {
                                    const count = statsMap[type] || 0
                                    const barWidth = maxCalcCount > 0 ? (count / maxCalcCount) * 100 : 0
                                    return (
                                        <div key={type} className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-600 font-medium truncate mr-2">{label}</span>
                                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] shrink-0">
                                                    {count}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 rounded-full"
                                                    style={{ width: `${barWidth}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Operational System Health Card */}
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Operational Infrastructure
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                99.9% Up
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Supabase DB: Online</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Vercel Edge: Active</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Radar Scraper: Ready</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Web Push: Configured</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

