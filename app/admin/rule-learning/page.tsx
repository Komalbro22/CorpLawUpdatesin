'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Brain, FileText, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, RefreshCw, Trash2,
  Check, Play, Plus, X, Eye, HelpCircle
} from 'lucide-react'
import { useToast } from '@/components/Toast'

// --- Types ---
interface LearningQueueItem {
  id: string
  original_prompt: string
  generalized_prompt: string
  proposed_intent: string
  ai_clause_draft: string
  variables_schema: Record<string, string>
  document_type: string
  frequency_count: number
  validation_passed: boolean
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const DOC_TYPE_OPTIONS = [
  'BOARD_RESOLUTION',
  'DIRECTOR_APPOINTMENT_LETTER',
  'SERVICE_LEVEL_AGREEMENT',
  'JOINT_VENTURE_AGREEMENT',
  'SHARE_TRANSFER_DEED',
  'EMPLOYMENT_CONTRACT',
  'GENERAL',
]

const VARIABLE_TYPES = ['STRING', 'NUMBER', 'DATE', 'CURRENCY', 'NAME', 'CITY']

export default function RuleLearningDashboard() {
  const { showToast } = useToast()
  const [items, setItems] = useState<LearningQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Edit States for expanded item
  const [editIntent, setEditIntent] = useState('')
  const [editDocType, setEditDocType] = useState('')
  const [editClause, setEditClause] = useState('')
  const [editVars, setEditVars] = useState<{ key: string; type: string }[]>([])
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // Fetch pending queue
  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/rule-learning/queue')
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`)
      }
      const data = await res.json()
      setItems(data.items || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load rule learning queue.')
      showToast('Error loading queue', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Set up edit states when expanding an item
  const handleToggleExpand = (item: LearningQueueItem) => {
    if (expandedId === item.id) {
      setExpandedId(null)
      return
    }
    
    setExpandedId(item.id)
    setEditIntent(item.proposed_intent)
    setEditDocType(item.document_type || 'GENERAL')
    setEditClause(item.ai_clause_draft || item.generalized_prompt || '')
    
    // Parse schema Record<string, string> to array of {key, type}
    const schemaArray = Object.entries(item.variables_schema || {}).map(([key, val]) => ({
      key,
      type: val,
    }))
    setEditVars(schemaArray)
  }

  // Variables Schema mutations
  const handleAddVar = () => {
    setEditVars(prev => [...prev, { key: '', type: 'STRING' }])
  }

  const handleRemoveVar = (index: number) => {
    setEditVars(prev => prev.filter((_, i) => i !== index))
  }

  const handleVarChange = (index: number, field: 'key' | 'type', value: string) => {
    setEditVars(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  // Actions: Approve
  const handleApprove = async (itemId: string) => {
    setActionLoading(prev => ({ ...prev, [itemId]: true }))
    try {
      // 1. Build variables_schema object from array
      const variables_schema: Record<string, string> = {}
      for (const v of editVars) {
        const trimmedKey = v.key.trim()
        if (trimmedKey) {
          variables_schema[trimmedKey] = v.type
        }
      }

      const res = await fetch('/api/admin/rule-learning/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queueItemId: itemId,
          proposed_intent: editIntent.trim(),
          ai_clause_draft: editClause,
          variables_schema,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve item')
      }

      showToast('Successfully approved and compiled rule!', 'success')
      setExpandedId(null)
      // Remove approved item from list
      setItems(prev => prev.filter(item => item.id !== itemId))
    } catch (err: any) {
      showToast(err.message || 'Error approving rule', 'error')
    } finally {
      setActionLoading(prev => ({ ...prev, [itemId]: false }))
    }
  }

  // Actions: Reject
  const handleReject = async (itemId: string) => {
    if (!confirm('Are you sure you want to reject and discard this suggestion?')) return
    setActionLoading(prev => ({ ...prev, [itemId]: true }))
    try {
      const res = await fetch('/api/admin/rule-learning/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueItemId: itemId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to reject item')
      }

      showToast('Suggestion discarded.', 'success')
      setExpandedId(null)
      setItems(prev => prev.filter(item => item.id !== itemId))
    } catch (err: any) {
      showToast(err.message || 'Error rejecting rule', 'error')
    } finally {
      setActionLoading(prev => ({ ...prev, [itemId]: false }))
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 text-slate-900">
      
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
            <Brain className="w-5 h-5 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-heading">AI Rule Learning Queue</h1>
            <p className="text-xs text-slate-500">Review, configure, and approve parameterized clause templates gathered from manual user edits.</p>
          </div>
        </div>
        <button
          onClick={fetchQueue}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/10 hover:text-slate-900 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] rounded-2xl border border-white/[0.04] border-dashed">
          <RefreshCw className="h-8 w-8 text-amber-500/50 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Loading learning queue...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-200 text-sm">Loading Failed</h3>
            <p className="text-red-400 text-xs mt-1">{error}</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/[0.01] rounded-2xl border border-white/[0.04] text-center p-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Check className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Learning Queue Empty</h3>
          <p className="text-slate-500 text-xs max-w-sm mt-1 mx-auto leading-relaxed">
            All user-suggested edits have been processed. New items will appear automatically when users make edits that can be generalized.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500 px-2">
            <span>Showing {items.length} pending clause templates</span>
            <span>Sorted by Frequency</span>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const isExpanded = expandedId === item.id
              const isItemLoading = actionLoading[item.id]

              return (
                <div 
                  key={item.id}
                  className={`rounded-xl overflow-hidden border transition-all duration-200 ${
                    isExpanded 
                      ? 'bg-slate-100/90 border-amber-500/30 shadow-[0_4px_20px_-5px_rgba(245,158,11,0.08)]' 
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/10 hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Card Header Summary */}
                  <button
                    onClick={() => handleToggleExpand(item)}
                    className="w-full text-left p-4 flex items-start gap-4 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                      <Brain className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-slate-900 font-semibold text-sm font-mono tracking-tight truncate">
                          {item.proposed_intent}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                          {item.document_type || 'GENERAL'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold">
                          Requested {item.frequency_count} {item.frequency_count === 1 ? 'time' : 'times'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs line-clamp-1">
                        Original instruction:"{item.original_prompt}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-center">
                      <span className="text-xs text-slate-500">Review</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </button>

                  {/* Expanded Detail Editor */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] p-5 space-y-6 bg-slate-50/50">
                      
                      {/* Grid: Instructions vs Template Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Left Side: Context */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5" /> User Instruction
                            </h4>
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-sm text-slate-700 leading-relaxed font-medium">"{item.original_prompt}"
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" /> Target Document Type
                            </h4>
                            <select
                              value={editDocType}
                              onChange={(e) => setEditDocType(e.target.value)}
                              className="w-full bg-slate-100 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:border-amber-500 focus:outline-none"
                            >
                              {DOC_TYPE_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Right Side: Intent Configuration */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Proposed Intent Name</h4>
                            <input
                              type="text"
                              value={editIntent}
                              onChange={(e) => setEditIntent(e.target.value)}
                              className="w-full bg-slate-100 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
                              placeholder="e.g. ADD_DIRECTOR_AGE_LIMIT"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Uppercase letters, underscores only. Must start with ADD_, REMOVE_, or REPLACE_.</p>
                          </div>
                        </div>

                      </div>

                      {/* Full Width: Clause Template */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clause Template Draft</h4>
                        <textarea
                          rows={6}
                          value={editClause}
                          onChange={(e) => setEditClause(e.target.value)}
                          className="w-full bg-slate-100 border border-white/10 rounded-xl p-3.5 text-xs text-slate-800 font-mono leading-relaxed focus:border-amber-500 focus:outline-none"
                          placeholder="Clause text containing {{placeholders}}..."
                        />
                        <p className="text-[10px] text-slate-500">Wrap variable placeholders in double braces, e.g. <code className="text-amber-400 font-mono">{"{{age_limit}}"}</code> or <code className="text-amber-400 font-mono">{"{{director_name}}"}</code>.</p>
                      </div>

                      {/* Variables Schema Configurator */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Variables Schema</h4>
                          <button
                            type="button"
                            onClick={handleAddVar}
                            className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Variable
                          </button>
                        </div>

                        {editVars.length === 0 ? (
                          <p className="text-xs text-slate-500 italic py-2">No variables configured. Click 'Add Variable' to parameterize values in the clause.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {editVars.map((v, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white/[0.01] border border-white/[0.06] p-2.5 rounded-lg">
                                <input
                                  type="text"
                                  value={v.key}
                                  onChange={(e) => handleVarChange(idx, 'key', e.target.value)}
                                  className="flex-1 bg-slate-100 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
                                  placeholder="variable_name"
                                />
                                <select
                                  value={v.type}
                                  onChange={(e) => handleVarChange(idx, 'type', e.target.value)}
                                  className="w-28 bg-slate-100 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                                >
                                  {VARIABLE_TYPES.map(vt => (
                                    <option key={vt} value={vt}>{vt}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVar(idx)}
                                  className="p-1 text-slate-500 hover:text-red-400 transition-colors shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between border-t border-white/[0.06] pt-4 gap-4">
                        <button
                          disabled={isItemLoading}
                          onClick={() => handleReject(item.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg px-4 py-2 hover:bg-red-500/5 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Reject & Discard
                        </button>
                        
                        <div className="flex items-center gap-3">
                          <button
                            disabled={isItemLoading}
                            onClick={() => handleToggleExpand(item)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700 rounded-lg px-4 py-2 hover:bg-white/5 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={isItemLoading}
                            onClick={() => handleApprove(item.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#080f1e] bg-amber-400 hover:bg-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:shadow-[0_0_16px_rgba(245,158,11,0.35)] rounded-lg px-5 py-2.5 transition-all disabled:opacity-50"
                          >
                            {isItemLoading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                            Compile & Approve Rule
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
