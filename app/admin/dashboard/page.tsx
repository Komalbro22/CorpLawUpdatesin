import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
        { count: publishedCount },
        { count: draftCount },
        { count: activeSubscribers },
        { count: thisMonthCount },
        { data: recentArticles },
        { data: recentSubscribers }
    ] = await Promise.all([
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).not('published_at', 'is', null),
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).is('published_at', null),
        supabaseAdmin.from('subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabaseAdmin.from('updates').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
        supabaseAdmin.from('updates').select('id, title, category, published_at, created_at').order('created_at', { ascending: false }).limit(5),
        supabaseAdmin.from('subscribers').select('id, email, subscribed_at').order('subscribed_at', { ascending: false }).limit(5)
    ])

    return (
        <div className="space-y-8">
            {/* STATS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-2xl mr-4 shrink-0">📄</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Published Articles</p>
                        <p className="text-2xl font-heading font-bold text-navy">{publishedCount || 0}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-2xl mr-4 shrink-0">✏️</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Draft Articles</p>
                        <p className="text-2xl font-heading font-bold text-navy">{draftCount || 0}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-2xl mr-4 shrink-0">👥</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Subscribers</p>
                        <p className="text-2xl font-heading font-bold text-navy">{activeSubscribers || 0}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl mr-4 shrink-0">📅</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">This Month</p>
                        <p className="text-2xl font-heading font-bold text-navy">{thisMonthCount || 0}</p>
                    </div>
                </div>
            </div>

            {/* TWO COLUMN SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-heading font-bold text-navy mb-4">Recent Articles</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
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

                <div>
                    <h2 className="text-lg font-heading font-bold text-navy mb-4">Recent Subscribers</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2">
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
                <div className="flex flex-wrap gap-4">
                    <Link href="/admin/articles/new" className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-navy bg-gold hover:bg-[#E5B54E] transition-colors shadow-sm">
                        Write New Article
                    </Link>
                    <a href="/updates" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-slate-200 text-sm font-semibold rounded-lg text-navy hover:border-navy hover:bg-slate-50 transition-colors">
                        View All Updates ↗
                    </a>
                    <a href="/api/admin/subscribers?export=csv" className="inline-flex items-center justify-center px-5 py-2.5 border-2 border-slate-200 text-sm font-semibold rounded-lg text-navy hover:border-navy hover:bg-slate-50 transition-colors">
                        Export Subscribers 📥
                    </a>
                </div>
            </div>
        </div>
    )
}
