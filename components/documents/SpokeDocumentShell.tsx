import React from 'react'
import Link from 'next/link'
import {
  FileText,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { DocumentSetDocument, DocumentSetStep, DocumentSet } from '@/lib/document-sets-data'

interface SpokeShellProps {
  document: DocumentSetDocument
  set: DocumentSet
  currentStep: DocumentSetStep | null
  prevStep?: DocumentSetStep | null
  nextStep?: DocumentSetStep | null
  quickAnswer?: string
  faqs?: Array<{ question: string; answer: string }>
  commonMistakes?: Array<{ mistake: string; consequence: string; correction: string }>
  children?: React.ReactNode
}

export default function SpokeDocumentShell({
  document: doc,
  set,
  currentStep,
  prevStep,
  nextStep,
  quickAnswer,
  faqs = [],
  commonMistakes = [],
  children,
}: SpokeShellProps) {
  const downloadDocxUrl = `/api/documents/sets/director-appointment/download?doc=${doc.spoke_slug}&format=docx`
  const downloadPdfUrl = `/api/documents/sets/director-appointment/download?doc=${doc.spoke_slug}&format=pdf`

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Breadcrumb strip */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/documents" className="hover:text-foreground transition-colors">
              Documents
            </Link>
            <span>/</span>
            <Link
              href="/documents/director-appointment-set"
              className="hover:text-foreground transition-colors"
            >
              Director Appointment Set
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{doc.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Step Strip Banner Linking to Hub */}
        <div className="mb-6 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/25 border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-bold bg-blue-600 text-white text-[11px]">
              STEP {doc.step_number} OF 11
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              Part of the{' '}
              <Link
                href="/documents/director-appointment-set"
                className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2 hover:text-blue-700"
              >
                Director Appointment Document Set
              </Link>
            </span>
          </div>

          <Link
            href="/documents/director-appointment-set#checklist"
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            View 11-step checklist
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded bg-muted font-medium text-foreground">
              {doc.governing_section}
            </span>
            <span>•</span>
            <span>Version {doc.version}</span>
            <span>•</span>
            <span>Law as at {set.law_as_at}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {doc.title} Format (Companies Act, 2013)
          </h1>

          {quickAnswer && (
            <div className="mt-4 p-4 rounded-xl bg-muted/40 border-l-4 border-blue-500 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <strong>Quick Summary:</strong> {quickAnswer}
            </div>
          )}
        </header>

        {/* Action Downloads Strip */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">
              Download Verified Drafting Template
            </span>
            <span className="text-sm font-medium text-foreground">
              Bookman Old Style 12pt with statutory placeholders
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={downloadDocxUrl}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Download Word (.docx)
            </a>
            <a
              href={downloadPdfUrl}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-rose-500" />
              Download PDF
            </a>
          </div>
        </div>

        {/* Statutory Filing Facts Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs">
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-muted-foreground block mb-1 font-medium">Who Signs:</span>
            <span className="font-semibold text-foreground text-sm">
              {doc.who_signs || 'Authorized Signatory'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <span className="text-muted-foreground block mb-1 font-medium">When Needed / Filed:</span>
            <span className="font-semibold text-foreground text-sm">
              {doc.when_filed || currentStep?.deadline_text || 'Prior to execution'}
            </span>
          </div>
        </div>

        {/* Optional Embedded Interactive Tool (for Appointment Letter & Board Resolution) */}
        {children && <div className="mb-10">{children}</div>}

        {/* Full Text Display in HTML */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">
              Specimen Format (Complete Text)
            </h2>
            <span className="text-xs text-muted-foreground">Draft template for reference</span>
          </div>

          <div className="p-6 sm:p-8 rounded-xl bg-card border border-border font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text shadow-sm">
            {doc.template_text}
          </div>
        </section>

        {/* Common Mistakes */}
        {commonMistakes.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Common Compliance Mistakes
            </h2>
            <div className="space-y-3">
              {commonMistakes.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50/30 dark:bg-rose-950/10 text-xs">
                  <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400 mb-1">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {m.mistake}
                  </div>
                  <p className="text-muted-foreground mb-2">
                    <strong>Risk:</strong> {m.consequence}
                  </p>
                  <p className="text-foreground bg-background p-2 rounded border border-border">
                    <strong>Correct procedure:</strong> {m.correction}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-card text-xs">
                  <h3 className="font-bold text-foreground mb-1.5 flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed pl-5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Step Navigation Strip (Previous / Next Step) */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          {prevStep ? (
            <Link
              href={
                prevStep.spoke_slug === 'dir-12-guide'
                  ? '/updates/form-dir-12-director-kmp-appointment-filing-guide-companies-act-2013'
                  : prevStep.spoke_slug && !prevStep.spoke_slug.includes('#')
                  ? `/documents/${prevStep.spoke_slug}`
                  : `/documents/director-appointment-set#step-${prevStep.step_number}`
              }
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Step {prevStep.step_number}: {prevStep.title}</span>
            </Link>
          ) : (
            <div />
          )}

          {nextStep ? (
            <Link
              href={
                nextStep.spoke_slug === 'dir-12-guide'
                  ? '/updates/form-dir-12-director-kmp-appointment-filing-guide-companies-act-2013'
                  : nextStep.spoke_slug && !nextStep.spoke_slug.includes('#')
                  ? `/documents/${nextStep.spoke_slug}`
                  : `/documents/director-appointment-set#step-${nextStep.step_number}`
              }
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Step {nextStep.step_number}: {nextStep.title}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/documents/director-appointment-set"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Back to Hub & Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Footer Block */}
        <footer className="pt-8 border-t border-border text-xs text-muted-foreground space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <strong>Version:</strong> {doc.version} • <strong>Law as at:</strong> {set.law_as_at} •{' '}
              <strong>Review:</strong>{' '}
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {set.reviewer_status === 'signed_off' && set.reviewer_name
                  ? `Reviewed by ${set.reviewer_name} (FCS)`
                  : 'Under professional review'}
              </span>
            </div>

            <div>
              <Link
                href={`/feedback?type=document_set&title=${encodeURIComponent(doc.title)}&url=/documents/${doc.spoke_slug}`}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Report an error
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            <strong>Statutory Disclaimer:</strong> These are draft templates for reference only. Always verify with a qualified legal professional before filing.
          </p>
        </footer>
      </div>
    </div>
  )
}
