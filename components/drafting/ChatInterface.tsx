// src/components/drafting/ChatInterface.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, AlertTriangle, Users } from 'lucide-react'

interface DialogueMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  userPrompt: string
  setUserPrompt: (val: string) => void
  conversationHistory: DialogueMessage[]
  loading: boolean
  triggerAiCompilation: (promptText: string) => Promise<void>
}

export function ChatInterface({
  userPrompt,
  setUserPrompt,
  conversationHistory,
  loading,
  triggerAiCompilation
}: ChatInterfaceProps) {
  
  // Progress states
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [timeLeft, setTimeLeft] = useState(6.0)

  // Manage smooth progress bars and stages reactively
  useEffect(() => {
    if (!loading) {
      setProgress(0)
      return
    }

    setProgress(5)
    setStage('🔍 Analyzing request & legal context...')
    setTimeLeft(6.0)

    const startTime = Date.now()
    const duration = 6500 // 6.5s estimated total duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const calculatedProgress = Math.min(95, Math.round((elapsed / duration) * 100))
      setProgress(calculatedProgress)

      // Sub-second estimated time remaining countdown
      const secondsLeft = Math.max(0.5, parseFloat((Math.max(0, duration - elapsed) / 1000).toFixed(1)))
      setTimeLeft(secondsLeft)

      // Stage updating logic
      if (calculatedProgress < 25) {
        setStage('🔍 Analyzing request & legal context...')
      } else if (calculatedProgress < 50) {
        setStage('⚖️ Retrieving statutory templates...')
      } else if (calculatedProgress < 75) {
        setStage('🤖 Extracting variables & compiling clauses...')
      } else {
        setStage('🏛️ Formatting A4 letterhead margins...')
      }
    }, 150)

    return () => clearInterval(interval)
  }, [loading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userPrompt.trim() || loading) return
    triggerAiCompilation(userPrompt)
  }

  return (
    <div className="flex flex-col h-full space-y-5 text-white font-sans">
      
      {/* 1. Prompt Info Tag */}
      <div className="p-3.5 bg-brand-gold/10 border border-brand-gold/20 rounded-badge flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-brand-gold shrink-0 mt-0.5 animate-pulse" />
        <p className="text-[10px] text-brand-muted leading-relaxed font-semibold">
          Type a detailed description of your legal requirement. The AI will fuzzy match templates, dynamically extract variables, and populate the draft.
        </p>
      </div>

      {/* 2. Textarea Prompter Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="For example: 'Draft a Mutual NDA between Apex Logistics Pvt Ltd (New Delhi) and Quantum Softwares Pvt Ltd (Noida) dated today...'"
          rows={5}
          disabled={loading}
          className="w-full text-xs p-3.5 bg-brand-navy border border-white/10 rounded-card focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none placeholder:text-brand-muted/50 resize-none text-white disabled:opacity-50"
        />
        
        {!loading && (
          <button
            type="submit"
            disabled={loading || !userPrompt.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-gold text-brand-navy font-bold text-xs uppercase tracking-wider rounded-badge hover:bg-brand-gold-light transition-all disabled:opacity-50 shadow-md shadow-brand-gold/10"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            Draft with AI
          </button>
        )}
      </form>

      {/* 3. Stage-by-Stage Glowing Progress Loader */}
      {loading && (
        <div className="p-4 bg-brand-navy/60 border border-brand-gold/20 rounded-badge space-y-3 animate-fade-in">
          <div className="flex justify-between items-center text-[11px] font-sans">
            <span className="font-bold text-brand-gold flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-gold shrink-0" />
              {stage}
            </span>
            <span className="font-mono text-brand-gold font-bold">
              {progress}%
            </span>
          </div>

          {/* Glowing Progress Track */}
          <div className="w-full h-2.5 bg-brand-slate-blue/60 rounded-full overflow-hidden border border-white/5">
            <div 
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-brand-gold/60 to-brand-gold rounded-full transition-all duration-150 shadow-md"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-brand-muted font-medium">
            <span>Method: Hybrid Semantic Parser</span>
            <span>Est. remaining: <strong className="text-white font-mono">{timeLeft.toFixed(1)}s</strong></span>
          </div>
        </div>
      )}

      {/* 4. Conversation History Logs */}
      {conversationHistory.length > 0 && (
        <div className="border-t border-white/5 pt-5 space-y-4 overflow-y-auto max-h-[300px] pr-1.5 scrollbar-thin">
          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
            Dialogue Logs
          </span>
          <div className="space-y-3.5">
            {conversationHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-4.5 rounded-badge text-xs leading-relaxed border ${
                  item.role === 'user'
                    ? 'bg-brand-navy/60 text-brand-muted border-white/5'
                    : 'bg-brand-slate-blue/60 text-white border-brand-gold/10'
                }`}
              >
                <strong className={`block text-[10px] uppercase tracking-wider mb-1.5 ${
                  item.role === 'user' ? 'text-white' : 'text-brand-gold'
                }`}>
                  {item.role === 'user' ? '👤 Client Request' : '🏛️ AI Drafting Assistant'}
                </strong>
                <p className="whitespace-pre-wrap">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
