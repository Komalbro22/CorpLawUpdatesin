'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, FileText, Printer, FileDown, Layers, CheckCircle, RefreshCw, Sliders, MessageSquare, BookOpen, Share2 } from 'lucide-react'
import PrintCalibrator from '@/components/PrintCalibrator'

export default function DraftingCopilotPage() {
  // Config States
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form')
  const [letterheadMode, setLetterheadMode] = useState<'digital' | 'preprinted' | 'none'>('digital')
  const [isStampPaper, setIsStampPaper] = useState(false)
  const [paddingTop, setPaddingTop] = useState(240)
  const [paddingX, setPaddingX] = useState(15)

  // Document Fields State
  const [companyName, setCompanyName] = useState('Apex Logistics Private Limited')
  const [companyCin, setCompanyCin] = useState('U74999DL2026PTC123456')
  const [companyPan, setCompanyPan] = useState('ABCDE1234F')
  const [registeredAddress, setRegisteredAddress] = useState('123 Connaught Place, New Delhi - 110001')
  const [meetingDate, setMeetingDate] = useState('2026-05-25')
  const [chairpersonName, setChairpersonName] = useState('Rahul Sharma')
  const [directorName, setDirectorName] = useState('Amit Sharma')
  const [directorDin, setDirectorDin] = useState('09876543')
  const [bankName, setBankName] = useState('HDFC Bank')
  const [bankBranch, setBankBranch] = useState('Connaught Place Branch')
  const [stateJurisdiction, setStateJurisdiction] = useState('Delhi')

  // Chat/AI States
  const [userPrompt, setUserPrompt] = useState('')
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [aiResponse, setAiResponse] = useState("Fill out the parameters on the sidebar or describe your document in the AI tab to compile your first legal draft!")
  const [loading, setLoading] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')

  // Synchronization with local storage spacing calibration profiles
  useEffect(() => {
    const cachedTop = localStorage.getItem('letterhead_top_px')
    const cachedX = localStorage.getItem('letterhead_x_px')
    if (cachedTop) setPaddingTop(parseInt(cachedTop))
    if (cachedX) setPaddingX(parseInt(cachedX))
  }, [])

  // Call AI Routing Function
  const triggerAiCompilation = async (promptText: string, isCustom = false) => {
    setLoading(true)
    try {
      const response = await fetch('/app/api/tools/drafting-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: promptText,
          sessionId: 'session-' + Date.now(),
          conversationHistory,
          isCustomRequest: isCustom
        })
      })
      const result = await response.json()
      if (result.draftHtml) {
        setAiResponse(result.draftHtml)
      } else if (result.message) {
        setAiResponse(result.message)
      }
      if (result.status === 'prompt_more') {
        setActiveTab('chat')
      }
    } catch (error) {
      console.error('AI Call failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Populate dynamic A4 canvas manually from form variables
  const compileDraftFromForm = () => {
    let rawText = `# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${companyName.toUpperCase()} HELD ON ${meetingDate} AT THE REGISTERED OFFICE OF THE COMPANY AT ${registeredAddress}.

---

**COMPANY CIN:** ${companyCin}  
**COMPANY PAN:** ${companyPan}

---

### **RESOLVED THAT** a Current Account in the name of the Company be opened with **${bankName}**, **${bankBranch}** Branch, and the Company do accept the terms, conditions, and rules of the Bank for the operation of the said account, in accordance with RBI Master Directions on KYC and PMLA guidelines.

### **RESOLVED FURTHER THAT** **Mr./Ms. ${directorName}**, Director of the Company (bearing DIN: ${directorDin}), whose signature is attested below, be and is hereby authorized singly to sign, execute, and deliver all necessary application forms, agreements, KYC declarations, and documents required by the Bank for opening and operating the said account, and to operate the said account on behalf of the Company, including signing of cheques, drafts, and online internet banking/digital payment authorizations.

### **RESOLVED FURTHER THAT** the Bank be and is hereby authorized to honor all cheques, drafts, and bills drawn, accepted, or made on behalf of the Company by the said authorized signatory and to act on any instructions given by them relating to the operation of the said account.

### **RESOLVED FURTHER THAT** a copy of this resolution, certified to be true by the Chairperson of the meeting or the Company Secretary, be forwarded to the Bank for their records and action.

---

**For ${companyName}**

\n\n\n\n

**(Signature)**  
**Name:** ${chairpersonName}  
**Designation:** Chairperson of the Meeting  
**DIN:** [Insert Chairperson DIN]

\n\n

---

#### **SPECIMEN SIGNATURE OF AUTHORIZED SIGNATORY:**

\n\n

**(Signature of Mr./Ms. ${directorName})**  

\n\n

**Attested by:**  
**(Signature of Chairperson)**`

    setAiResponse(rawText)
  }

  useEffect(() => {
    compileDraftFromForm()
  }, [companyName, companyCin, companyPan, registeredAddress, meetingDate, chairpersonName, directorName, directorDin, bankName, bankBranch])

  // Direct print styling setup
  const printDocument = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Legal Document Print Preview</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; font-family: 'Lora', 'Georgia', serif; font-size: 14px; line-height: 1.6; color: #1E293B; }
            .print-container {
              box-sizing: border-box;
              min-height: 297mm;
              padding: 20mm ${paddingX}mm;
            }
            .stamp-paper-active {
              padding-top: ${isStampPaper ? '127mm' : '20mm'} !important; /* 5 inches of spacing on page 1 */
            }
            .digital-letterhead {
              border-bottom: 2px solid #D97706;
              padding-bottom: 12px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              font-family: sans-serif;
            }
            .lh-logo { font-size: 24px; font-weight: bold; color: #0F172A; }
            .lh-details { text-align: right; font-size: 10px; color: #64748B; }
            .legal-markdown {
              padding: 0 10px;
              text-align: justify;
            }
            .legal-markdown h1 { font-size: 18px; text-align: center; margin-bottom: 20px; font-family: sans-serif; }
            .legal-markdown h3 { font-size: 13px; font-weight: bold; margin-top: 15px; text-indent: 30px; }
            .legal-markdown hr { border: none; border-top: 1px solid #CBD5E1; margin: 20px 0; }
            .disclaimer-footer {
              margin-top: 40px;
              border-top: 1px solid #E2E8F0;
              padding-top: 10px;
              font-size: 8px;
              color: #94A3B8;
              font-family: sans-serif;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="print-container ${isStampPaper ? 'stamp-paper-active' : ''}">
            ${letterheadMode === 'digital' ? `
              <div class="digital-letterhead">
                <div class="lh-logo">🏛️ ${companyName.substring(0, 15)}</div>
                <div class="lh-details">
                  <strong>CIN:</strong> ${companyCin}<br/>
                  <strong>Regd. Office:</strong> ${registeredAddress}<br/>
                  <strong>Email:</strong> compliance@${companyName.toLowerCase().replace(/\s+/g, '')}.com
                </div>
              </div>
            ` : ''}
            <div class="legal-markdown">
              ${aiResponse
                .replace(/\n/g, '<br/>')
                .replace(/# (.*)/g, '<h1>$1</h1>')
                .replace(/### (.*)/g, '<h3>$1</h3>')
                .replace(/---/g, '<hr/>')
              }
            </div>
            <div class="disclaimer-footer">
              IMPORTANT LEGAL NOTICE: This document is generated as an un-audited draft template by the CorpLawUpdates.in automated assistant. Verify all statutory items before signature execution.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Share link generator for viral growth
  const generateShareLink = () => {
    const uniqueId = 'rev-' + Math.random().toString(36).substring(2, 9)
    const link = `https://www.corplawupdates.in/review/${uniqueId}`
    setShareLink(link)
    setShowShareModal(true)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      
      {/* Dynamic Sub-Navbar Controls */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          <span className="font-heading font-bold text-navy text-sm sm:text-base">AI Legal Drafting Co-Pilot</span>
        </div>
        
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Letterhead Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setLetterheadMode('digital')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                letterheadMode === 'digital' ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Digital Header
            </button>
            <button
              onClick={() => setLetterheadMode('preprinted')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                letterheadMode === 'preprinted' ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pre-Printed Paper
            </button>
            <button
              onClick={() => setLetterheadMode('none')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                letterheadMode === 'none' ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Blank Page
            </button>
          </div>

          {/* Stamp paper toggle */}
          <button
            onClick={() => setIsStampPaper(!isStampPaper)}
            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
              isStampPaper 
                ? 'bg-amber-600 border-amber-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isStampPaper ? 'Stamp Paper Spacing On' : 'Standard Margins'}
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Area */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Parameters Forms & Chat */}
        <div className="lg:col-span-4 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
          
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'form' 
                  ? 'border-amber-500 text-amber-600 bg-amber-50/20'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              Dynamic Form Editor
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'chat' 
                  ? 'border-amber-500 text-amber-600 bg-amber-50/20'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              AI Prompt Chat
            </button>
          </div>

          <div className="p-5 flex-grow space-y-6">
            
            {activeTab === 'form' ? (
              /* Form input fields */
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">Company CIN</label>
                    <input
                      type="text"
                      value={companyCin}
                      onChange={(e) => setCompanyCin(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">Company PAN</label>
                    <input
                      type="text"
                      value={companyPan}
                      onChange={(e) => setCompanyPan(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">Registered Address</label>
                  <input
                    type="text"
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">Bank Branch</label>
                    <input
                      type="text"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">Authorized Director</label>
                    <input
                      type="text"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">Director DIN</label>
                    <input
                      type="text"
                      value={directorDin}
                      onChange={(e) => setDirectorDin(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">Meeting Date</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">State Jurisdiction</label>
                    <input
                      type="text"
                      value={stateJurisdiction}
                      onChange={(e) => setStateJurisdiction(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Conversational AI Chat Interface */
              <div className="space-y-4">
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Describe your document. For example: 'Draft a board resolution to open HDFC current account' or 'Make a mutual NDA'..."
                  rows={4}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-amber-400 focus:ring-amber-400 resize-none bg-slate-50/50"
                />
                <button
                  onClick={() => triggerAiCompilation(userPrompt)}
                  disabled={loading || !userPrompt.trim()}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-navy text-gold hover:bg-slate-900 border border-navy text-xs font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Parsing Draft...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Compile with AI
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Injected Print margin Calibrator in form view */}
            {letterheadMode === 'preprinted' && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <PrintCalibrator />
              </div>
            )}

          </div>
        </div>

        {/* Right Side: WYSIWYG A4 Print Preview Sheet Container */}
        <div className="lg:col-span-8 bg-slate-100 p-8 flex justify-center overflow-y-auto h-full">
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl rounded-sm p-[20mm] border border-slate-300 relative flex flex-col justify-between box-border">
            
            {/* The Print Layout sheet container */}
            <div 
              style={{ 
                paddingTop: isStampPaper ? '120mm' : '0px', 
                paddingLeft: `${paddingX}px`, 
                paddingRight: `${paddingX}px` 
              }}
              className="flex-grow transition-all"
            >
              
              {/* Digital Letterhead Layout */}
              {letterheadMode === 'digital' && !isStampPaper && (
                <div className="border-b-2 border-amber-600 pb-3 mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-navy flex items-center gap-1.5">
                      🏛️ {companyName.substring(0, 20)}
                    </h2>
                  </div>
                  <div className="text-[9px] text-slate-400 text-right leading-relaxed font-semibold">
                    <strong>CIN:</strong> {companyCin}<br />
                    <strong>Address:</strong> {registeredAddress}
                  </div>
                </div>
              )}

              {/* Dynamic Draft Body Display */}
              <div className="prose prose-slate max-w-none prose-sm font-serif">
                {aiResponse.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-center text-lg font-bold font-sans text-navy mb-5 uppercase tracking-wide">{line.substring(2)}</h1>
                  } else if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-xs font-bold text-navy mt-4 mb-2 pl-6 relative before:absolute before:left-0 before:top-0 before:content-['•']">{line.substring(4)}</h3>
                  } else if (line.startsWith('---')) {
                    return <hr key={i} className="border-slate-200 my-4" />
                  } else {
                    return <p key={i} className="text-xs leading-relaxed text-slate-700 mb-2.5 text-justify">{line}</p>
                  }
                })}
              </div>

            </div>

            {/* Permanent Compliance Disclaimer Footer */}
            <div className="mt-12 border-t border-slate-200/80 pt-4 text-center">
              <p className="text-[7.5px] text-slate-400 leading-relaxed max-w-lg mx-auto font-sans">
                <strong>IMPORTANT LEGAL NOTICE:</strong> This document is generated as an un-audited draft template by the CorpLawUpdates.in automated assistant. Verify all statutory items (including stamp duty and witnesses) with a Company Secretary (CS) before execution.
              </p>
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute right-5 bottom-5 flex gap-2 print:hidden">
              <button
                onClick={generateShareLink}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-navy rounded-xl shadow-lg transition-colors flex items-center justify-center"
                title="Share Review Link"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={printDocument}
                className="p-3 bg-navy hover:bg-slate-900 border border-navy text-gold rounded-xl shadow-lg transition-colors flex items-center justify-center"
                title="Print Document"
              >
                <Printer className="h-5 w-5" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Share Review Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-navy flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Approval Link Generated!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Copy this read-only review link and WhatsApp it directly to your clients or directors. They can view the document and approve the draft in 1 click!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-grow text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink)
                  alert('Link copied!')
                }}
                className="bg-navy text-gold hover:bg-slate-900 border border-navy px-4 rounded-lg text-xs font-bold transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 py-2 px-3 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
