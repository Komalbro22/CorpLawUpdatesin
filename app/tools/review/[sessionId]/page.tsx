// src/app/tools/review/[sessionId]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  CheckCircle2, Clock, MessageSquare, Printer, ShieldCheck, 
  AlertTriangle, FileText, ChevronRight, Share2 
} from 'lucide-react'
import { useToast } from '@/components/Toast'

const TEMPLATE_DETAILS: Record<string, { title: string; category: string; isCorporate: boolean }> = {
  board_resolution_bank_account: {
    title: 'Board Resolution for Opening Current Bank Account',
    category: 'Board Resolution',
    isCorporate: true
  },
  board_resolution_auditor_appointment: {
    title: 'Board Resolution for Appointment of First Statutory Auditor',
    category: 'Board Resolution',
    isCorporate: true
  },
  board_resolution_director_appointment: {
    title: 'Board Resolution for Director Appointment',
    category: 'Board Resolution',
    isCorporate: true
  },
  mutual_nda_agreement: {
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'Agreement',
    isCorporate: false
  },
  moa_private_limited: {
    title: 'Memorandum of Association (MoA)',
    category: 'Corporate Document',
    isCorporate: true
  },
  llp_agreement: {
    title: 'Limited Liability Partnership (LLP) Agreement',
    category: 'Agreement',
    isCorporate: true
  },
  employment_agreement: {
    title: 'Standard Employment Agreement',
    category: 'Agreement',
    isCorporate: true
  },
  share_transfer_deed_sh4: {
    title: 'Share Transfer Deed (Form SH-4)',
    category: 'Deed',
    isCorporate: true
  },
  agm_notice: {
    title: 'Notice of Annual General Meeting (AGM)',
    category: 'Corporate Document',
    isCorporate: true
  },
  deed_of_sale: {
    title: 'Deed of Sale (Sale Deed)',
    category: 'Deed',
    isCorporate: false
  },
  deed_of_mortgage: {
    title: 'Deed of Simple Mortgage',
    category: 'Deed',
    isCorporate: false
  },
  commercial_lease_agreement: {
    title: 'Commercial Lease Agreement',
    category: 'Agreement',
    isCorporate: false
  },
  general_power_of_attorney: {
    title: 'General Power of Attorney (GPA)',
    category: 'Deed',
    isCorporate: false
  },
  indemnity_bond_duplicate_shares: {
    title: 'Indemnity Bond for Duplicate Share Certificates',
    category: 'Deed',
    isCorporate: true
  },
  partnership_deed_commercial: {
    title: 'Partnership Deed',
    category: 'Deed',
    isCorporate: false
  },
  gift_deed_movable: {
    title: 'Gift Deed for Movable Property',
    category: 'Deed',
    isCorporate: false
  }
}

export default function ClientReviewPage() {
  const params = useParams()
  const sessionId = params?.sessionId as string
  const { showToast } = useToast()

  // States
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [templateData, setTemplateData] = useState<any>(null)
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved'>('pending')
  const [approvedAt, setApprovedAt] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

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

  const parseMarkdownCustom = (text: string) => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    
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

  // Fetch session data
  useEffect(() => {
    if (!sessionId) return

    async function fetchSession() {
      try {
        setLoading(true)
        
        let data = null
        try {
          const { data: dbData, error } = await supabase
            .from('draft_sessions')
            .select('*')
            .eq('session_token', sessionId)
            .single()

          if (!error && dbData) {
            data = dbData
          } else {
            console.warn('Draft session not found in Supabase or query failed, checking localStorage...')
          }
        } catch (dbErr) {
          console.warn('Failed to query Supabase draft_sessions:', dbErr)
        }

        // Check localStorage fallback
        if (!data && typeof window !== 'undefined') {
          try {
            const localSessionsStr = localStorage.getItem('corplaw_local_draft_sessions')
            const localSessions = localSessionsStr ? JSON.parse(localSessionsStr) : {}
            if (localSessions[sessionId]) {
              data = localSessions[sessionId]
              console.log('Successfully loaded draft session from localStorage fallback:', data)
            }
          } catch (e) {
            console.warn('Failed to read from localStorage fallback:', e)
          }
        }

        if (data) {
          setSessionData(data)
          setApprovalStatus(data.draft_status === 'approved' ? 'approved' : 'pending')
          if (data.draft_status === 'approved') {
            setApprovedAt(data.updated_at || new Date().toISOString())
          }

          // Fetch template details
          let templateFetched = false
          if (data.template_slug) {
            try {
              const { data: temp, error: tempErr } = await supabase
                .from('legal_templates')
                .select('*')
                .eq('slug', data.template_slug)
                .maybeSingle()
              if (!tempErr && temp) {
                setTemplateData(temp)
                templateFetched = true
              }
            } catch (err) {
              console.warn('Failed to query Supabase legal_templates:', err)
            }

            // Reconstruct templateData if database fetch failed
            if (!templateFetched && TEMPLATE_DETAILS[data.template_slug]) {
              const localTemp = {
                slug: data.template_slug,
                ...TEMPLATE_DETAILS[data.template_slug]
              }
              setTemplateData(localTemp)
            }
          }
        } else {
          showToast('Failed to load draft. The link may have expired or is invalid.', 'error')
        }
      } catch (err) {
        console.error('Failed to load review draft:', err)
        showToast('Failed to load draft. The link may have expired or is invalid.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  // Handle 1-click approval
  const handleApprove = async () => {
    if (approvalStatus === 'approved') return

    const now = new Date().toISOString()

    // Always update localStorage if we are in browser
    if (typeof window !== 'undefined') {
      try {
        const localSessionsStr = localStorage.getItem('corplaw_local_draft_sessions')
        const localSessions = localSessionsStr ? JSON.parse(localSessionsStr) : {}
        if (localSessions[sessionId]) {
          localSessions[sessionId] = {
            ...localSessions[sessionId],
            draft_status: 'approved',
            updated_at: now
          }
          localStorage.setItem('corplaw_local_draft_sessions', JSON.stringify(localSessions))
        }
      } catch (e) {
        console.warn('Failed to update approval in localStorage:', e)
      }
    }

    try {
      const { error } = await supabase
        .from('draft_sessions')
        .update({
          draft_status: 'approved',
          updated_at: now
        })
        .eq('session_token', sessionId)

      if (error) throw error
    } catch (err) {
      console.warn('DB approval update failed, relying on localStorage:', err)
    }

    setApprovalStatus('approved')
    setApprovedAt(now)
    setShowConfetti(true)
    showToast('Document Approved Successfully!', 'success')

    // Trigger standard client-side confetti burst effect
    setTimeout(() => setShowConfetti(false), 5000)
  }

  // Trigger browser print
  const handlePrint = () => {
    window.print()
  }

  // Generate revision link (pre-fill WhatsApp with draft title)
  const getRevisionWhatsAppLink = () => {
    const docTitle = templateData?.title || 'Legal Document'
    const message = `Hello, I reviewed the draft of "${docTitle}" on CorpLawUpdates.in (${window.location.href}). I have some revisions to suggest regarding: `
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center text-white p-6">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
          <FileText className="absolute h-5 w-5 text-brand-gold animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-semibold text-brand-muted tracking-wider uppercase animate-pulse">
          Retrieving Secured Review copy...
        </p>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center text-white p-6">
        <div className="bg-brand-slate-blue border border-white/10 rounded-card p-8 max-w-md text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-brand-gold mx-auto" />
          <h2 className="font-serif font-bold text-xl text-brand-gold">Draft Not Found</h2>
          <p className="text-xs text-brand-muted leading-relaxed">
            This review link may have expired (24-hour transient TTL limit), been deleted, or contains a typo.
          </p>
          <a
            href="/tools/drafting-copilot"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-gold text-brand-navy hover:bg-brand-gold-light text-xs font-bold uppercase tracking-wider rounded-badge transition-colors mx-auto"
          >
            Create New Draft
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    )
  }

  const documentTitle = templateData?.title || 'Custom AI Legal Draft'
  const companyName = sessionData.variables?.company_name || sessionData.variables?.party1_name || 'CorpLaw Client'

  return (
    <div className="min-h-screen bg-brand-navy text-white flex flex-col relative overflow-x-hidden">
      
      {/* 1. Dynamic Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-navy/10 backdrop-blur-[1px] animate-fade-in" />
          <div className="text-center space-y-2 scale-up">
            <CheckCircle2 className="h-20 w-20 text-status-verified mx-auto animate-bounce" />
            <h2 className="font-serif font-bold text-2xl text-white">Document Approved!</h2>
            <p className="text-xs text-brand-gold">Official confirmation timestamp saved securely.</p>
          </div>
        </div>
      )}

      {/* 2. Client Review Header Bar */}
      <div className="bg-brand-slate-blue border-b border-white/10 py-4 px-6 sticky top-0 z-40 shadow-lg print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Client Review Portal
              </span>
              {approvalStatus === 'approved' ? (
                <span className="bg-status-verified/10 text-status-verified border border-status-verified/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Approved
                </span>
              ) : (
                <span className="bg-brand-muted/10 text-brand-muted border border-white/10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="h-3 w-3 animate-pulse" />
                  Awaiting Review
                </span>
              )}
            </div>
            <h1 className="font-serif font-bold text-base sm:text-lg text-white">
              {documentTitle}
            </h1>
            <p className="text-xs text-brand-muted">
              Prepared for: <strong className="text-white">{companyName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-navy border border-white/10 hover:border-brand-gold/30 hover:bg-brand-navy/60 text-xs font-bold uppercase tracking-wider rounded-badge transition-all"
            >
              <Printer className="w-4 h-4 text-brand-gold" />
              Print / Save PDF
            </button>

            {approvalStatus === 'pending' ? (
              <>
                <a
                  href={getRevisionWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-navy border border-white/10 hover:border-brand-gold/30 hover:bg-brand-navy/60 text-xs font-bold uppercase tracking-wider rounded-badge transition-all text-white"
                >
                  <MessageSquare className="w-4 h-4 text-brand-gold" />
                  Request Revisions
                </a>

                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-gold text-brand-navy hover:bg-brand-gold-light text-xs font-bold uppercase tracking-wider rounded-badge transition-all shadow-md shadow-brand-gold/10"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  1-Click Approve
                </button>
              </>
            ) : (
              <div className="bg-brand-navy/60 border border-status-verified/20 p-2.5 rounded-badge text-[11px] text-brand-muted max-w-xs font-medium">
                Approved on <strong className="text-status-verified">{new Date(approvedAt || '').toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</strong> via secure client portal.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Top Alert Banner */}
      <div className="bg-brand-slate-blue/30 border-b border-white/5 py-2.5 px-6 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-[10px] text-brand-muted leading-relaxed">
          <AlertTriangle className="h-4 w-4 text-brand-gold shrink-0 animate-pulse" />
          <span>
            <strong>IMPORTANT REGULATORY NOTICE:</strong> This document was generated and approved via the automated tools hub of CorpLawUpdates.in. Verify all state-specific stamp duty, board minute registration schedules, and statutory declarations with a certified Company Secretary (CS) before legal submission.
          </span>
        </div>
      </div>

      {/* 3. A4 Document Viewer Canvas */}
      <div className="flex-grow p-4 sm:p-8 flex justify-center bg-brand-navy/90 overflow-y-auto">
        <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-a4 text-brand-navy p-[20mm] border border-slate-300 relative flex flex-col justify-between box-border">
          
          <div className="flex-grow">
            
            {/* Read-Only Digital Letterhead Block */}
            {sessionData.letterhead_mode === 'digital' && 
             (templateData ? (templateData.isCorporate !== undefined ? templateData.isCorporate : (templateData.category !== 'Agreement' && templateData.category !== 'Deed')) : true) && (
              <div className="border-b-2 border-brand-gold pb-3 mb-8 flex justify-between items-end">
                <div>
                  <h2 className="font-sans font-bold text-sm text-brand-navy tracking-tight uppercase">
                    🏛️ {companyName}
                  </h2>
                </div>
                <div className="text-[9px] text-brand-muted text-right leading-relaxed font-semibold">
                  {sessionData.variables?.company_cin && (
                    <><strong>CIN:</strong> {sessionData.variables.company_cin}<br /></>
                  )}
                  {sessionData.variables?.registered_address && (
                    <><strong>Regd. Office:</strong> {sessionData.variables.registered_address}</>
                  )}
                </div>
              </div>
            )}

            {/* Compiled Legal Markdown Body */}
            <div className="prose prose-slate max-w-none prose-sm font-serif">
              {sessionData.draft_html ? (
                parseMarkdownCustom(sessionData.draft_html)
              ) : (
                <p className="text-xs text-brand-muted italic">No text drafted yet.</p>
              )}
            </div>

            {/* Approved Stamp Seal in Print Form */}
            {approvalStatus === 'approved' && (
              <div className="mt-12 flex justify-end">
                <div className="border-2 border-dashed border-status-verified p-3 rounded text-center rotate-[-3deg] max-w-[220px] font-sans">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-status-verified flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    APPROVED CLIENT COPY
                  </div>
                  <div className="text-[8px] text-slate-500 mt-1">
                    Verified securely online via link<br />
                    Timestamp: {new Date(approvedAt || '').toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}

          </div>


        </div>
      </div>

    </div>
  )
}
