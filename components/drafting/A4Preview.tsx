// src/components/drafting/A4Preview.tsx
'use client'

import React from 'react'

interface A4PreviewProps {
  aiResponse: string
  formValues: Record<string, string>
  letterheadMode: 'digital' | 'preprinted' | 'none'
  isStampPaper: boolean
  paddingTop: number
  paddingX: number
}

export function A4Preview({
  aiResponse,
  formValues,
  letterheadMode,
  isStampPaper,
  paddingTop,
  paddingX
}: A4PreviewProps) {
  
  const parseMarkdownCustom = (text: string) => {
    return text.split('\n').map((line, i) => {
      const cleanLine = line.trim()
      
      if (cleanLine.startsWith('# ')) {
        return (
          <h1 key={i} className="text-center text-sm font-bold font-sans text-brand-navy mb-5 uppercase tracking-wide border-b border-brand-navy/10 pb-2">
            {cleanLine.substring(2)}
          </h1>
        )
      } else if (cleanLine.startsWith('### ')) {
        return (
          <h3 key={i} className="text-xs font-bold text-brand-navy mt-4 mb-2 pl-4 relative before:absolute before:left-0 before:top-0 before:content-['•'] before:text-brand-gold">
            {cleanLine.substring(4)}
          </h3>
        )
      } else if (cleanLine.startsWith('---')) {
        return <hr key={i} className="border-brand-navy/10 my-4" />
      } else if (cleanLine.startsWith('|')) {
        // Table parsing placeholder
        const columns = cleanLine.split('|').map(c => c.trim()).filter(Boolean)
        if (columns.length === 0) return null
        return (
          <div key={i} className="grid grid-cols-2 gap-4 border border-brand-navy/5 p-2 bg-brand-cream/20 text-[10px] my-1">
            {columns.map((col, idx) => (
              <span key={idx} className="font-semibold text-brand-navy">{col}</span>
            ))}
          </div>
        )
      } else {
        if (!cleanLine) return <div key={i} className="h-2" />
        return (
          <p key={i} className="text-[11px] leading-relaxed text-slate-800 mb-2.5 text-justify font-serif">
            {cleanLine}
          </p>
        )
      }
    })
  }

  return (
    <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-a4 text-brand-navy p-[20mm] border border-slate-300 relative flex flex-col justify-between box-border">
      
      {/* 1. Main Preview Sheet Area */}
      <div 
        style={{ 
          paddingTop: isStampPaper ? '120px' : letterheadMode === 'preprinted' ? `${paddingTop}px` : '0px', 
          paddingLeft: `${paddingX}px`, 
          paddingRight: `${paddingX}px` 
        }}
        className="flex-grow transition-all"
      >
        
        {/* Digital Letterhead Header Block */}
        {letterheadMode === 'digital' && !isStampPaper && (
          <div className="border-b-2 border-brand-gold pb-3 mb-8 flex justify-between items-end">
            <div>
              <h2 className="font-sans font-bold text-sm text-brand-navy tracking-tight flex items-center gap-1.5 uppercase">
                🏛️ {formValues.company_name || formValues.party1_name || 'Apex Logistics Private Limited'}
              </h2>
            </div>
            <div className="text-[9px] text-brand-muted text-right leading-relaxed font-semibold">
              <strong>CIN:</strong> {formValues.company_cin || 'U74999DL2026PTC123456'}<br />
              <strong>Regd. Office:</strong> {formValues.registered_address || formValues.party1_address || '123 Connaught Place, Delhi'}
            </div>
          </div>
        )}

        {/* Dynamic Draft Body Canvas */}
        <div className="prose prose-slate max-w-none prose-sm">
          {parseMarkdownCustom(aiResponse)}
        </div>

      </div>

      {/* 2. Permanent Regulatory Disclaimer Footer */}
      <div className="mt-12 border-t border-slate-200/80 pt-4 text-center">
        <p className="text-[7.5px] text-brand-muted leading-relaxed max-w-lg mx-auto font-sans font-medium">
          <strong>IMPORTANT LEGAL NOTICE:</strong> This document is generated as an un-audited draft template by the CorpLawUpdates.in automated assistant. Verify all statutory items (including stamp duty, witness attestations, and state laws) with a qualified Company Secretary (CS) or advocate before execution.
        </p>
      </div>

    </div>
  )
}
