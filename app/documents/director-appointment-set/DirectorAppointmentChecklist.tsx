'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ExternalLink, RotateCcw, ShieldCheck, Clock, FileText } from 'lucide-react'
import { DocumentSetStep } from '@/lib/document-sets-data'

interface ChecklistProps {
  steps: DocumentSetStep[]
  setSlug: string
}

const STORAGE_KEY = 'corplaw_director_appointment_checklist_v1'

export default function DirectorAppointmentChecklist({ steps, setSlug }: ChecklistProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({})
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setCompletedSteps(JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Could not read checklist from localStorage', e)
    }
  }, [])

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const updated = { ...prev, [stepNumber]: !prev[stepNumber] }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (e) {}

      // Check if all steps completed
      const totalCompleted = Object.values(updated).filter(Boolean).length
      if (totalCompleted === steps.length) {
        fetch('/api/documents/sets/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            setSlug,
            eventType: 'checklist_complete',
          }),
        }).catch(() => {})
      }

      return updated
    })
  }

  const resetChecklist = () => {
    setCompletedSteps({})
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {}
  }

  const completedCount = Object.values(completedSteps).filter(Boolean).length
  const progressPercent = Math.round((completedCount / (steps.length || 11)) * 100)

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-12" id="checklist">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Interactive Checklist
            </span>
            <span className="text-xs text-muted-foreground">Saved locally in browser</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
            Filing Sequence & Execution Checklist
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetChecklist}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            title="Reset your checklist progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-5">
        <div className="flex justify-between items-center text-xs font-medium text-muted-foreground mb-1.5">
          <span>{completedCount} of {steps.length} steps completed</span>
          <span className="font-semibold text-foreground">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3 mt-6">
        {steps.map(step => {
          const isDone = isMounted && !!completedSteps[step.step_number]
          const isSpoke = step.spoke_slug && !step.spoke_slug.includes('#')

          return (
            <div
              key={step.step_number}
              onClick={() => toggleStep(step.step_number)}
              className={`p-4 rounded-lg border transition-all cursor-pointer flex items-start gap-3.5 ${
                isDone
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-background hover:bg-muted/40 border-border'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 focus:outline-none"
                aria-label={`Toggle step ${step.step_number}`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/60 hover:text-emerald-500" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Step {step.step_number}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.deadline_text}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {step.filing_authority}
                  </span>
                </div>

                <h3 className={`text-base font-semibold leading-snug ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {step.title}
                </h3>

                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {step.notes}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {step.document_name}
                  </span>

                  {isSpoke && (
                    <Link
                      href={`/documents/${step.spoke_slug}`}
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      View format & template
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  {step.spoke_slug === 'dir-12-guide' && (
                    <Link
                      href="/updates/form-dir-12-director-kmp-appointment-filing-guide-companies-act-2013"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                      Read MCA DIR-12 Filing Guide
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
