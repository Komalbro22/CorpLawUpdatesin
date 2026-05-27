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
  isCorporate?: boolean
  isApproved?: boolean
  approvedAt?: string
}

export function A4Preview({
  aiResponse,
  formValues,
  letterheadMode,
  isStampPaper,
  paddingTop,
  paddingX,
  isCorporate = true,
  isApproved = false,
  approvedAt
}: A4PreviewProps) {
  
  const parseMarkdownCustom = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    
    // Support basic inline bolding e.g. **BY AND BETWEEN:** -> <strong>BY AND BETWEEN:</strong>
    const parseInlineElements = (textVal: string) => {
      const parts = textVal.split('**')
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="font-bold text-brand-navy">{part}</strong>
        }
        return part
      })
    }

    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      const cleanLine = line.trim()
      
      // If it starts a table block
      if (cleanLine.startsWith('|')) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim())
          i++
        }
        
        // Parse the accumulated table lines
        if (tableLines.length > 0) {
          // Filter out the separator row (e.g. | :--- | :--- |)
          const rows = tableLines.filter(row => !row.match(/^\|\s*[:\-|\s]+\s*\|$/))
          
          elements.push(
            <table key={`table-${i}`} className="w-full my-4 border-collapse text-[10px] font-sans text-brand-navy table-fixed">
              <tbody>
                {rows.map((row, rowIdx) => {
                  const cells = row
                     .split('|')
                     .map(c => c.trim())
                     .slice(1, -1) // Remove leading and trailing empty elements from split
                  
                  return (
                    <tr key={rowIdx}>
                      {cells.map((cell, cellIdx) => (
                        <td 
                          key={cellIdx} 
                          className="py-1 px-2 text-left leading-relaxed w-1/2 align-top font-sans text-brand-navy"
                        >
                          {parseInlineElements(cell)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }
        continue
      }
      
      // Standard elements parsing
      if (cleanLine.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-center text-sm font-bold font-sans text-brand-navy mb-5 uppercase tracking-wide border-b border-brand-navy/10 pb-2">
            {cleanLine.substring(2)}
          </h1>
        )
      } else if (cleanLine.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-xs font-bold text-brand-navy mt-4 mb-2 pl-4 relative before:absolute before:left-0 before:top-0 before:content-['•'] before:text-brand-gold">
            {cleanLine.substring(4)}
          </h3>
        )
      } else if (cleanLine.startsWith('---')) {
        elements.push(<hr key={`hr-${i}`} className="border-brand-navy/10 my-4" />)
      } else {
        if (!cleanLine) {
          elements.push(<div key={`empty-${i}`} className="h-2" />)
        } else {
          elements.push(
            <p key={`p-${i}`} className="text-[11px] leading-relaxed text-slate-850 mb-2.5 text-justify font-serif">
              {parseInlineElements(cleanLine)}
            </p>
          )
        }
      }
      
      i++
    }
    
    return elements
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
        className="flex-grow transition-all flex flex-col justify-between"
      >
        <div>
          {/* Digital Letterhead Header Block */}
          {letterheadMode === 'digital' && !isStampPaper && isCorporate !== false && (
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

        {/* Approved Stamp Seal in Print Form */}
        {isApproved && (
          <div className="mt-12 flex justify-end">
            <div className="border-2 border-dashed border-status-verified p-3 rounded text-center rotate-[-3deg] max-w-[220px] font-sans">
              <div className="text-[10px] font-bold uppercase tracking-wider text-status-verified flex items-center justify-center gap-1">
                <svg className="h-3.5 w-3.5 text-status-verified shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                APPROVED CLIENT COPY
              </div>
              <div className="text-[8px] text-slate-500 mt-1">
                Verified securely online via link<br />
                Timestamp: {approvedAt ? new Date(approvedAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
