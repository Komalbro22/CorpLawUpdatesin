'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Shield,
  Search,
  Filter,
  RotateCw,
  ArrowLeft,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Code,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface AuditLogItem {
  id: string
  key_name: string
  action: string
  entity_type: string
  entity_id: string | null
  ip_address: string | null
  status: 'success' | 'failure'
  details: Record<string, any>
  timestamp: string
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [keyFilter, setKeyFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDetails, setSelectedDetails] = useState<Record<string, any> | null>(null)

  const limit = 25

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('limit', String(limit))
    params.set('offset', String((page - 1) * limit))
    if (keyFilter) params.set('key', keyFilter)
    if (actionFilter !== 'all') params.set('action', actionFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)

    try {
      const res = await fetch(`/api/admin/audit-log?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      setLoading(false)
    }
  }, [page, keyFilter, actionFilter, statusFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings/api-keys"
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Back to API Keys"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-500" />
              API Security & Write Audit Log
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time audit log of all write actions, publishing events, and key operations executed by API keys and automated agents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/settings/api-keys"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Key className="w-4 h-4 text-indigo-500" />
            Manage Keys
          </Link>
          <button
            onClick={() => fetchLogs()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by key name..."
            value={keyFilter}
            onChange={e => {
              setKeyFilter(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Loading audit log...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Shield className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No audit records found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When API keys execute create, edit, publish, delete, or send operations, they will be logged here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Key Name</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white font-sans">
                      {log.key_name}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-gray-800 dark:text-gray-200">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="text-gray-400 ml-1">({log.entity_id.substring(0, 16)})</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {log.ip_address || '—'}
                    </td>
                    <td className="px-5 py-3">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          ERR
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setSelectedDetails(log.details)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                        title="View payload / details"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing {logs.length} of {total} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= total}
              className="px-2.5 py-1 rounded border border-gray-300 dark:border-gray-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-500" />
                Audit Details Payload
              </h3>
              <button
                onClick={() => setSelectedDetails(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <pre className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto max-h-80">
              {JSON.stringify(selectedDetails, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedDetails(null)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
