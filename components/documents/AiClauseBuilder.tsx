'use client'

import { useState } from 'react'
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export interface CustomClauseItem {
  id: string
  title: string
  text: string
  riskWarning?: string | null
  plainExplanation?: string | null
}

interface AiClauseBuilderProps {
  documentType: string
  existingClauseTitles?: string[]
  customClauses: CustomClauseItem[]
  onAddClause: (clause: CustomClauseItem) => void
  onRemoveClause: (id: string) => void
  presetSuggestions?: string[]
}

const DEFAULT_SUGGESTIONS: Record<string, string[]> = {
  'Lease / Rent Agreement': [
    'tenant cannot keep pets',
    'landlord will repaint every 2 years',
    'no subletting without written permission',
  ],
  'General Power of Attorney': [
    'attorney cannot sell the property, only manage it',
    'POA valid for 1 year only',
    'power to represent and sign before Sub-Registrar',
  ],
  'Non-Disclosure Agreement': [
    'obligations survive 5 years after termination',
    'receiver must notify within 48 hours of a data leak',
    'whistleblower protection carve-out for statutory reporting',
  ],
  'Director Appointment Letter': [
    'Director & Officer (D&O) liability insurance coverage requirement',
    'clawback of performance bonuses upon financial restatement',
    'prior board approval required before taking up other advisory roles',
  ],
  'Bank Guarantee': [
    'invocation notice by registered email with scanned claim letter',
    'automatic 30-day grace period for BG renewal before expiry',
    'extension of claim period upon written request by beneficiary',
  ],
}

export default function AiClauseBuilder({
  documentType,
  existingClauseTitles = [],
  customClauses,
  onAddClause,
  onRemoveClause,
  presetSuggestions,
}: AiClauseBuilderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftedResult, setDraftedResult] = useState<{
    title: string
    clauseText: string
    plainExplanation: string
    riskWarning: string | null
    safeAlternative: string | null
  } | null>(null)

  const suggestions =
    presetSuggestions || DEFAULT_SUGGESTIONS[documentType] || [
      'specific indemnity for third-party regulatory claims',
      'electronic notice clause via registered email',
      'dispute escalation to senior executives prior to arbitration',
    ]

  const handleGenerate = async () => {
    if (!instruction.trim()) {
      setError('Please describe the custom clause you wish to add.')
      return
    }

    setIsLoading(true)
    setError(null)
    setDraftedResult(null)

    try {
      const res = await fetch('/api/ai-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          userInstruction: instruction,
          existingClauseTitles,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Clause builder is temporarily unavailable — please try later.')
      }

      if (!data.success && data.refusalReason) {
        setError(data.refusalReason)
      } else {
        setDraftedResult({
          title: data.title || 'Custom Clause',
          clauseText: data.clauseText,
          plainExplanation: data.plainExplanation,
          riskWarning: data.riskWarning,
          safeAlternative: data.safeAlternative,
        })
      }
    } catch (err: any) {
      setError(err.message || 'Clause builder is temporarily unavailable — please try later.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsert = (textToUse?: string) => {
    if (!draftedResult) return
    const id = 'custom-' + Date.now().toString(36)
    onAddClause({
      id,
      title: draftedResult.title,
      text: textToUse || draftedResult.clauseText,
      riskWarning: draftedResult.riskWarning,
      plainExplanation: draftedResult.plainExplanation,
    })
    setDraftedResult(null)
    setInstruction('')
  }

  return (
    <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 sm:p-5 text-slate-100 shadow-lg my-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                Need a custom clause? Describe it in plain words
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gemini 2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft bespoke Indian-law compliant clauses & audit legal enforceability
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-auto text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          {isOpen ? (
            <>
              Hide Drafter <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Open Clause Builder <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
          {/* Example prompt chips */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
              Example prompts (click to fill):
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInstruction(s)}
                  className="text-xs bg-slate-800/90 hover:bg-slate-750 hover:border-amber-500/40 text-slate-300 hover:text-white px-3 py-1.5 rounded-md border border-slate-700 text-left transition"
                >
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Prompt textarea */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Describe the clause in plain English:
            </label>
            <textarea
              value={instruction}
              onChange={e => setInstruction(e.target.value.slice(0, 500))}
              placeholder={`e.g. "Add a clause stating that tenant can keep a cat with an extra refundable deposit for deep cleaning."`}
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 transition resize-none outline-none"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
              <span>Under 500 characters. Enforceability audited against Indian statutes.</span>
              <span className={instruction.length >= 480 ? 'text-amber-400 font-bold' : ''}>
                {instruction.length}/500
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isLoading || !instruction.trim()}
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Drafting your clause…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Add clause with AI
                </>
              )}
            </button>
            {draftedResult && (
              <button
                type="button"
                onClick={() => setDraftedResult(null)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white transition"
              >
                Clear Preview
              </button>
            )}
          </div>

          {/* Drafted Result Review Card */}
          {draftedResult && (
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 sm:p-5 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wide">
                  Drafted Clause: {draftedResult.title}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Indian Law Compatible
                </span>
              </div>

              {/* Plain English explanation */}
              {draftedResult.plainExplanation && (
                <div className="text-xs bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-slate-300">
                  <span className="font-semibold text-slate-100">Plain-English Meaning:</span>{' '}
                  {draftedResult.plainExplanation}
                </div>
              )}

              {/* Legal Risk Warning Banner */}
              {draftedResult.riskWarning && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-600/60 rounded-lg text-xs text-amber-200 space-y-2">
                  <div className="flex items-start gap-2 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Statutory Enforceability Warning:</span>
                  </div>
                  <p className="text-slate-300 pl-6 leading-relaxed">
                    {draftedResult.riskWarning}
                  </p>
                  {draftedResult.safeAlternative && (
                    <div className="pl-6 pt-1 text-slate-300">
                      <span className="font-semibold text-emerald-400">Lawful Recommendation:</span>{' '}
                      {draftedResult.safeAlternative}
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => handleInsert(draftedResult.safeAlternative!)}
                          className="text-xs bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Insert Safe Alternative Instead
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Legal Clause Text Preview */}
              <div className="text-xs sm:text-sm font-mono bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {draftedResult.clauseText}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleInsert()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-lg inline-flex items-center gap-1.5 shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  Insert into document
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs text-slate-300 hover:text-white transition"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => setDraftedResult(null)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Compliance Disclaimer */}
          <p className="text-[11px] text-slate-400 italic">
            AI-drafted clauses are a starting point. Have them reviewed by a qualified professional for high-value matters.
          </p>
        </div>
      )}

      {/* Inserted Custom Clauses List */}
      {customClauses.length > 0 && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Inserted Custom Clauses ({customClauses.length}):
            </span>
            <span className="text-[10px] text-slate-400">
              Renumbered automatically in preview
            </span>
          </div>
          <div className="space-y-1.5">
            {customClauses.map((clause, idx) => (
              <div
                key={clause.id}
                className="flex items-center justify-between text-xs bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                  <span className="font-medium text-slate-200 truncate">{clause.title}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 shrink-0">
                    Custom clause
                  </span>
                  {clause.riskWarning && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60 shrink-0">
                      Risk noted
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveClause(clause.id)}
                  title="Remove clause"
                  className="text-slate-400 hover:text-red-400 transition shrink-0 p-1 rounded hover:bg-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
