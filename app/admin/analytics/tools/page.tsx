import { supabaseAdmin } from '@/lib/supabase-server'
import { formatDate } from '@/lib/utils'
import { Activity, Clock, Wrench } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ToolUsagePage() {
    // Fetch last 500 tool usage logs
    const { data: logs, error } = await supabaseAdmin
        .from('calculator_usage')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

    if (error) {
        return (
            <div className="p-6 text-red-500">
                Failed to load tool usage: {error.message}
            </div>
        )
    }

    const TYPE_LABELS: Record<string, string> = {
        mca_late_fee: 'MCA Late Fee Calc',
        llp_late_fee: 'LLP Late Fee Calc',
        msme_penalty: 'MSME Penalty Viewer',
        ccfs_savings: 'CCFS 2026 Savings Calc',
    }

    // Calculate basic stats
    const totalRuns = logs.length
    const typeCounts = logs.reduce((acc, log) => {
        acc[log.calculator_type] = (acc[log.calculator_type] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold font-heading text-slate-900">Tool Usage Analytics</h1>
                    <p className="text-slate-500 mt-1 text-sm">Detailed logs of recent tool runs.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Runs (Recent)</p>
                            <p className="text-2xl font-bold text-slate-900">{totalRuns}</p>
                        </div>
                    </div>
                </div>
                {Object.entries(typeCounts).slice(0, 2).map(([type, count]) => (
                    <div key={type} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{TYPE_LABELS[type] || type}</p>
                                <p className="text-2xl font-bold text-slate-900">{String(count)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Usage Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Tool Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Form / Subject</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Timestamp</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Penalty / Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => {
                                const formName = log.input_data?.formSlug || log.input_data?.formId || 'N/A'
                                
                                let resultDisplay = '-'
                                if (log.calculator_type === 'mca_late_fee' && log.result_data?.lateFee) {
                                    resultDisplay = '₹' + Number(log.result_data.lateFee).toLocaleString('en-IN')
                                } else if (log.calculator_type === 'llp_late_fee' && log.result_data?.late) {
                                    resultDisplay = '₹' + Number(log.result_data.late).toLocaleString('en-IN')
                                } else if (log.calculator_type === 'msme_penalty' && log.result_data?.accruedInterest) {
                                    resultDisplay = '₹' + Number(log.result_data.accruedInterest).toLocaleString('en-IN')
                                } else if (log.calculator_type === 'ccfs_savings' && log.result_data?.savings) {
                                    resultDisplay = 'Save ₹' + Number(log.result_data.savings).toLocaleString('en-IN')
                                }

                                return (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900">
                                                {TYPE_LABELS[log.calculator_type] || log.calculator_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {formName !== 'N/A' ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">
                                                    {formName}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDate(log.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-medium text-slate-700">
                                                {resultDisplay}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
