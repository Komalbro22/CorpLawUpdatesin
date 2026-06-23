'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen, Plus, Search, ChevronDown, ChevronUp,
  Zap, FileText, AlertCircle, CheckCircle2, X,
  RefreshCw, Tag, Scale, Clock, Layers
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rule {
  id: string
  document_type: string
  usage_count: number
  accepted_count: number
  rejected_count: number
  created_at: string
  intents: { id: string; name: string; description: string } | null
  clauses: {
    id: string
    content: string
    category: string
    variables: Record<string, string>
    placement_rules: Record<string, string>
    legal_basis: string
    related_forms: string[]
    compliance_deadline: string | null
    is_active: boolean
  } | null
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

const PLACEMENT_ACTIONS = ['INSERT_AFTER', 'INSERT_BEFORE', 'APPEND', 'REPLACE', 'REMOVE']
const ANCHOR_TYPES = ['HEADING', 'REGEX', 'CLAUSE_ID']
const FALLBACK_OPTIONS = ['BOTTOM', 'TOP', 'SKIP']
const CATEGORIES = ['INSERT', 'REMOVE', 'REPLACE']

// ─── Health score badge ───────────────────────────────────────────────────────
function HealthBadge({ accepted, rejected }: { accepted: number; rejected: number }) {
  const total = accepted + rejected
  const score = total > 0 ? Math.round((accepted / total) * 100) : null
  if (score === null) return <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full border border-white/10 bg-white/5">No data</span>
  const color = score >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
    score >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
      'text-red-400 border-red-500/30 bg-red-500/10'
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>{score}% health</span>
}

// ─── Rule Card ────────────────────────────────────────────────────────────────
function RuleCard({ rule }: { rule: Rule }) {
  const [expanded, setExpanded] = useState(false)
  const vars = rule.clauses?.variables || {}
  const hasVars = Object.keys(vars).length > 0

  return (
    <div className="admin-card rounded-xl overflow-hidden border border-white/[0.06] hover:border-amber-500/20 transition-all duration-200">
      {/* Card Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
        aria-expanded={expanded}
      >
        <div className="admin-icon-amber w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-slate-900 font-semibold text-sm font-mono">
              {rule.intents?.name || 'Unknown Intent'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
              {rule.document_type}
            </span>
            {rule.clauses?.is_active ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Active</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">Inactive</span>
            )}
            <HealthBadge accepted={rule.accepted_count} rejected={rule.rejected_count} />
          </div>
          <p className="text-slate-500 text-xs line-clamp-1">{rule.intents?.description || '—'}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-500">{rule.usage_count} uses</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-white/[0.06] p-4 space-y-4 bg-white/[0.01]">
          {/* Clause Content */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Clause Content
            </p>
            <pre className="bg-black/30 border border-white/[0.06] rounded-lg p-3 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto">
              {rule.clauses?.content || '—'}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Variables */}
            {hasVars && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Variables
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(vars).map(([k, v]) => (
                    <span key={k} className="text-xs px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 font-mono">
                      {`{{${k}}}`} <span className="text-violet-500">({v})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Placement */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> Placement
              </p>
              <div className="space-y-1 text-xs text-slate-500">
                <div>Action: <span className="text-amber-400 font-mono">{rule.clauses?.placement_rules?.action}</span></div>
                {rule.clauses?.placement_rules?.anchor && (
                  <div>Anchor: <span className="text-slate-700 font-mono">"{rule.clauses.placement_rules.anchor}"</span></div>
                )}
                <div>Fallback: <span className="text-slate-700">{rule.clauses?.placement_rules?.fallback}</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Legal Basis */}
            {rule.clauses?.legal_basis && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5">
                  <Scale className="w-3 h-3" /> Legal Basis
                </p>
                <p className="text-xs text-slate-500">{rule.clauses.legal_basis}</p>
              </div>
            )}

            {/* Compliance */}
            {rule.clauses?.compliance_deadline && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Deadline
                </p>
                <p className="text-xs text-amber-400/80">{rule.clauses.compliance_deadline}</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 pt-2 border-t border-white/[0.06]">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{rule.usage_count}</p>
              <p className="text-[10px] text-slate-500">Total Uses</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">{rule.accepted_count}</p>
              <p className="text-[10px] text-slate-500">Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-400">{rule.rejected_count}</p>
              <p className="text-[10px] text-slate-500">Rejected</p>
            </div>
            <div className="text-center ml-auto">
              <p className="text-xs text-slate-600">{new Date(rule.created_at).toLocaleDateString('en-IN')}</p>
              <p className="text-[10px] text-slate-600">Created</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Add Rule Modal ───────────────────────────────────────────────────────────
function AddRuleModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    intent_name: '',
    intent_description: '',
    aliases: '',
    document_type: 'BOARD_RESOLUTION',
    clause_content: '',
    clause_category: 'INSERT',
    variables_raw: '',
    placement_action: 'APPEND',
    placement_anchor: '',
    placement_anchor_type: 'REGEX',
    placement_fallback: 'BOTTOM',
    legal_basis: '',
    related_forms_raw: '',
    compliance_deadline: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create rule')
      onSuccess()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0d1627] to-[#080f1e] border border-white/[0.10] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="admin-icon-amber w-9 h-9 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-slate-900 font-heading font-bold text-base">Add New Rule</h2>
              <p className="text-slate-500 text-xs">Create intent + clause + rule in Supabase2</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form id="add-rule-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Intent Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Intent Name <span className="text-red-400">*</span></label>
            <input
              value={form.intent_name}
              onChange={e => set('intent_name', e.target.value)}
              placeholder="e.g. ADD_PENALTY_CLAUSE"
              required
              className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.06] transition-all font-mono"
            />
            <p className="text-[10px] text-slate-600 mt-1">Will be auto-uppercased and underscored. e.g. ADD_MY_CLAUSE</p>
          </div>

          {/* Intent Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Intent Description <span className="text-red-400">*</span></label>
            <input
              value={form.intent_description}
              onChange={e => set('intent_description', e.target.value)}
              placeholder="e.g. Add a penalty clause for breach of contract"
              required
              className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          {/* Aliases */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Trigger Aliases</label>
            <input
              value={form.aliases}
              onChange={e => set('aliases', e.target.value)}
              placeholder="add penalty, add breach penalty, insert penalty clause"
              className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
            />
            <p className="text-[10px] text-slate-600 mt-1">Comma-separated. Users can type these exact phrases to trigger this rule.</p>
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Document Type <span className="text-red-400">*</span></label>
            <select
              value={form.document_type}
              onChange={e => set('document_type', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all"
            >
              {DOC_TYPE_OPTIONS.map(t => <option key={t} value={t} className="bg-[#0d1627]">{t}</option>)}
            </select>
          </div>

          {/* Clause Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Clause Content <span className="text-red-400">*</span></label>
            <textarea
              value={form.clause_content}
              onChange={e => set('clause_content', e.target.value)}
              rows={5}
              required
              placeholder="PENALTY: In the event of breach... Use {{variable_name}} for dynamic values."
              className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all font-mono resize-none leading-relaxed"
            />
            <p className="text-[10px] text-slate-600 mt-1">Use {`{{variable_name}}`} syntax for dynamic values.</p>
          </div>

          {/* Category + Placement in 2 cols */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
              <select value={form.clause_category} onChange={e => set('clause_category', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d1627]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Placement Action</label>
              <select value={form.placement_action} onChange={e => set('placement_action', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all">
                {PLACEMENT_ACTIONS.map(a => <option key={a} value={a} className="bg-[#0d1627]">{a}</option>)}
              </select>
            </div>
          </div>

          {/* Anchor + Anchor Type + Fallback */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Anchor Keyword</label>
              <input value={form.placement_anchor} onChange={e => set('placement_anchor', e.target.value)}
                placeholder="TERMINATION"
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Anchor Type</label>
              <select value={form.placement_anchor_type} onChange={e => set('placement_anchor_type', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all">
                {ANCHOR_TYPES.map(t => <option key={t} value={t} className="bg-[#0d1627]">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Fallback</label>
              <select value={form.placement_fallback} onChange={e => set('placement_fallback', e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all">
                {FALLBACK_OPTIONS.map(f => <option key={f} value={f} className="bg-[#0d1627]">{f}</option>)}
              </select>
            </div>
          </div>

          {/* Variables JSON */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Variables Schema (JSON)</label>
            <input value={form.variables_raw} onChange={e => set('variables_raw', e.target.value)}
              placeholder='{"name":"STRING","amount":"NUMBER","date":"DATE"}'
              className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all font-mono" />
            <p className="text-[10px] text-slate-600 mt-1">Types: STRING, NUMBER, DATE, CITY, CURRENCY</p>
          </div>

          {/* Legal Basis */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Legal Basis</label>
            <input value={form.legal_basis} onChange={e => set('legal_basis', e.target.value)}
              placeholder="Section 74 of the Indian Contract Act, 1872"
              className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all" />
          </div>

          {/* Related Forms + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Related Forms</label>
              <input value={form.related_forms_raw} onChange={e => set('related_forms_raw', e.target.value)}
                placeholder="DIR-12, MBP-1"
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Compliance Deadline</label>
              <input value={form.compliance_deadline} onChange={e => set('compliance_deadline', e.target.value)}
                placeholder="Within 30 days of..."
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all" />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3 shrink-0 bg-black/20">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 rounded-lg hover:bg-white/[0.05] transition-all">
            Cancel
          </button>
          <button
            type="submit"
            form="add-rule-form"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Creating...' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RuleEnginePage() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterDoc, setFilterDoc] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchRules = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/rules')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load rules')
      setRules(data.rules || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRules() }, [fetchRules])

  const handleAddSuccess = () => {
    setShowAddModal(false)
    setSuccessMsg('Rule created successfully! ✅')
    fetchRules()
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Filter rules
  const filtered = rules.filter(r => {
    const matchDoc = filterDoc === 'ALL' || r.document_type === filterDoc
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.intents?.name.toLowerCase().includes(q) ||
      r.intents?.description.toLowerCase().includes(q) ||
      r.document_type.toLowerCase().includes(q) ||
      r.clauses?.content.toLowerCase().includes(q)
    return matchDoc && matchSearch
  })

  // Stats
  const totalUses = rules.reduce((a, r) => a + r.usage_count, 0)
  const docTypes = Array.from(new Set(rules.map(r => r.document_type)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold admin-gradient-text">Rule Engine</h1>
          <p className="text-slate-500 text-sm mt-1">Manage intents, clauses and rules for all document types</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          id="add-new-rule-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Rule
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="admin-stat-amber rounded-xl p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Rules</p>
          <p className="text-slate-900 text-2xl font-heading font-extrabold mt-1">{rules.length}</p>
        </div>
        <div className="admin-stat-violet rounded-xl p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Document Types</p>
          <p className="text-slate-900 text-2xl font-heading font-extrabold mt-1">{docTypes.length}</p>
        </div>
        <div className="admin-stat-emerald rounded-xl p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Uses</p>
          <p className="text-slate-900 text-2xl font-heading font-extrabold mt-1">{totalUses}</p>
        </div>
        <div className="admin-stat-blue rounded-xl p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Intents</p>
          <p className="text-slate-900 text-2xl font-heading font-extrabold mt-1">
            {Array.from(new Set(rules.map(r => r.intents?.id).filter(Boolean))).length}
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search rules, intents, clause content..."
            className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
          />
        </div>
        <select
          value={filterDoc}
          onChange={e => setFilterDoc(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all"
        >
          <option value="ALL" className="bg-[#0d1627]">All Document Types</option>
          {docTypes.map(t => <option key={t} value={t} className="bg-[#0d1627]">{t}</option>)}
        </select>
        <button onClick={fetchRules} className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-white/[0.04] transition-all text-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading rules...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-4 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No rules found{search ? ` for"${search}"` : ''}.</p>
          <button onClick={() => setShowAddModal(true)} className="mt-4 text-amber-400 text-sm hover:text-amber-300 transition-colors">
            + Add your first rule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Showing {filtered.length} of {rules.length} rules</p>
          {filtered.map(rule => <RuleCard key={rule.id} rule={rule} />)}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddRuleModal onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />
      )}
    </div>
  )
}
