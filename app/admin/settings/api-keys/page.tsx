'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Key,
  Shield,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  RotateCw,
  Trash2,
  Clock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '@/components/Toast'
import { formatDate } from '@/lib/utils'

interface ApiKeyScopeInfo {
  scope: string
  label: string
  group: string
}

interface ApiKeyItem {
  id: string
  name: string
  prefix: string
  scopes: string[]
  created_at: string
  last_used_at: string | null
  status: 'active' | 'revoked'
  revoked_at: string | null
  created_by?: string
}

export default function ApiKeysPage() {
  const { showToast } = useToast()
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [availableScopes, setAvailableScopes] = useState<ApiKeyScopeInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // New Key Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  // One-time Key Display Modal
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Action states
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/api-keys')
      if (res.status === 403) {
        setError('Only Super Admin accounts have permission to manage API keys.')
        return
      }
      if (!res.ok) {
        throw new Error('Failed to load API keys')
      }
      const data = await res.json()
      setKeys(data.keys || [])
      setAvailableScopes(data.available_scopes || [])
    } catch (err: any) {
      setError(err?.message || 'Error loading API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) {
      showToast('Key name is required', 'error')
      return
    }
    if (selectedScopes.length === 0) {
      showToast('Select at least one permission scope', 'error')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim(), scopes: selectedScopes }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to create key')
      }

      setCreatedRawKey(data.raw_key)
      setShowCreateModal(false)
      setNewKeyName('')
      setSelectedScopes([])
      showToast('API key generated successfully', 'success')
      fetchKeys()
    } catch (err: any) {
      showToast(err?.message || 'Error creating key', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to REVOKE "${name}" immediately? Any agent or script using this key will immediately be blocked.`)) {
      return
    }

    setRevokingId(id)
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error?.message || 'Failed to revoke key')
      }
      showToast(`Key "${name}" revoked`, 'success')
      fetchKeys()
    } catch (err: any) {
      showToast(err?.message || 'Error revoking key', 'error')
    } finally {
      setRevokingId(null)
    }
  }

  const handleRegenerateKey = async (id: string, name: string) => {
    if (!confirm(`Regenerating "${name}" will immediately invalidate the current key and issue a brand-new token with identical permissions. Proceed?`)) {
      return
    }

    setRegeneratingId(id)
    try {
      const res = await fetch(`/api/admin/api-keys/${id}/regenerate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error?.message || 'Failed to regenerate key')
      }

      setCreatedRawKey(data.raw_key)
      showToast(`Key "${name}" regenerated successfully`, 'success')
      fetchKeys()
    } catch (err: any) {
      showToast(err?.message || 'Error regenerating key', 'error')
    } finally {
      setRegeneratingId(null)
    }
  }

  const handleCopyKey = () => {
    if (!createdRawKey) return
    navigator.clipboard.writeText(createdRawKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
    showToast('API key copied to clipboard', 'success')
  }

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    )
  }

  const selectAllScopes = () => {
    setSelectedScopes(availableScopes.map(s => s.scope))
  }

  const selectReadOnlyScopes = () => {
    setSelectedScopes(availableScopes.filter(s => s.scope.endsWith(':read')).map(s => s.scope))
  }

  const clearAllScopes = () => {
    setSelectedScopes([])
  }

  // Group scopes by category
  const groupedScopes = availableScopes.reduce((acc, curr) => {
    if (!acc[curr.group]) acc[curr.group] = []
    acc[curr.group].push(curr)
    return acc
  }, {} as Record<string, ApiKeyScopeInfo[]>)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Back to Settings"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-6 h-6 text-indigo-500" />
              API Key Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage scoped, revocable access keys for AI agents ("Muse") and automated background workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/audit-log"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            Audit Log
          </Link>
          <button
            onClick={() => {
              setSelectedScopes([])
              setNewKeyName('')
              setShowCreateModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Generate New Key
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {/* Security Banner */}
      <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/60 dark:bg-indigo-950/30 text-sm text-indigo-950 dark:text-indigo-200 space-y-1">
        <div className="font-semibold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
          <Shield className="w-4 h-4" />
          Strict Security Safeguards Active
        </div>
        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
          Keys authenticate exclusively via <code>Authorization: Bearer &lt;key&gt;</code> headers over HTTPS. The raw secret is hashed with SHA-256 and never stored in plain text. Keys can never alter site settings, manage user accounts, manage API keys, or delete published articles.
        </p>
      </div>

      {/* Keys Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Loading API keys...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">No API keys created yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Create a scoped API key to grant the AI agent "Muse" programmatic access to publish updates, maintain the glossary, and manage newsletter campaigns.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              Generate First API Key
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5">Key Name & Prefix</th>
                  <th className="px-6 py-3.5">Permission Scopes</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5">Last Used</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {keys.map((k) => {
                  const isRevoked = k.status === 'revoked'
                  return (
                    <tr key={k.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          {k.name}
                        </div>
                        <div className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {k.prefix}••••••••
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {k.scopes.map(s => (
                            <span
                              key={s}
                              className={`px-2 py-0.5 text-xs font-mono rounded-md border ${
                                s.endsWith(':delete')
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                                  : s.endsWith(':publish') || s.endsWith(':send')
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900'
                                  : s.endsWith(':write')
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(k.created_at)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                        {k.last_used_at ? formatDate(k.last_used_at) : (
                          <span className="italic text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isRevoked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                            <XCircle className="w-3.5 h-3.5" />
                            Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {!isRevoked ? (
                          <>
                            <button
                              onClick={() => handleRegenerateKey(k.id, k.name)}
                              disabled={regeneratingId === k.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                              title="Revoke and issue a new token with same scopes"
                            >
                              <RotateCw className={`w-3.5 h-3.5 ${regeneratingId === k.id ? 'animate-spin' : ''}`} />
                              Regenerate
                            </button>
                            <button
                              onClick={() => handleRevokeKey(k.id, k.name)}
                              disabled={revokingId === k.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                              title="Revoke key immediately"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No actions</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Create API Key */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" />
                  Generate New Scoped API Key
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  The generated key will be shown to you once. Grant only the required permissions.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Key Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Key Name / Client Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muse AI Production Agent"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Scope Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Granular Permission Scopes ({selectedScopes.length} selected)
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllScopes}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={selectReadOnlyScopes}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Read Only
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={clearAllScopes}
                      className="text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(groupedScopes).map(([group, groupScopes]) => (
                    <div key={group} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 bg-gray-50/50 dark:bg-gray-800/30">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        {group}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groupScopes.map(({ scope, label }) => {
                          const isChecked = selectedScopes.includes(scope)
                          return (
                            <label
                              key={scope}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                                isChecked
                                  ? 'bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800'
                                  : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleScope(scope)}
                                className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <div>
                                <div className="font-mono font-medium text-gray-900 dark:text-white">{scope}</div>
                                <div className="text-gray-500 dark:text-gray-400 text-[11px]">{label}</div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: One-time Raw Key Display Modal */}
      {createdRawKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Save Your API Key Now</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This key will NEVER be displayed again. If you lose it, you will need to regenerate it.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300 font-medium">
              ⚠️ Copy this secret token and store it into your agent's secure environment or vault immediately.
            </div>

            <div className="relative">
              <input
                type="text"
                readOnly
                value={createdRawKey}
                className="w-full px-4 py-3 font-mono text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white pr-24 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyKey}
                className="absolute right-2 top-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCreatedRawKey(null)}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white transition"
              >
                I have saved my key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
