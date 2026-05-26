// src/app/tools/drafting-copilot/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sparkles, FileText, MessageSquare, BookOpen, CheckCircle, RefreshCw, X
} from 'lucide-react'
import { A4Preview } from '@/components/drafting/A4Preview'
import { ChatInterface } from '@/components/drafting/ChatInterface'
import { LetterheadToggle } from '@/components/drafting/LetterheadToggle'
import { PrintCalibrator } from '@/components/drafting/PrintCalibrator'
import { ExportControls } from '@/components/drafting/ExportControls'
import { generateDocx } from '@/lib/docx-builder'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

// Premium legally-compliant fallback templates cache
const STATIC_TEMPLATES = [
  {
    slug: 'board_resolution_bank_account',
    title: 'Board Resolution for Opening Current Bank Account',
    category: 'Board Resolution',
    legal_reference: 'Section 179(3) of the Companies Act, 2013',
    required_fields: [
      { key: "company_name", label: "Company Name", type: "text", hint: "" },
      { key: "company_cin", label: "Company CIN", type: "text", hint: "21-character CIN" },
      { key: "company_pan", label: "Company PAN", type: "text", hint: "10-character PAN" },
      { key: "registered_address", label: "Registered Office Address", type: "text", hint: "" },
      { key: "bank_name", label: "Bank Name", type: "text", hint: "" },
      { key: "bank_branch", label: "Bank Branch", type: "text", hint: "" },
      { key: "meeting_date", label: "Meeting Date", type: "date", hint: "" },
      { key: "chairperson_name", label: "Chairperson Name", type: "text", hint: "" },
      { key: "director_name", label: "Authorized Director Name", type: "text", hint: "" },
      { key: "director_din", label: "Director DIN", type: "text", hint: "8-digit DIN" }
    ],
    master_text_markdown: `# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {company_name} HELD ON {meeting_date} AT THE REGISTERED OFFICE OF THE COMPANY AT {registered_address}.

---

**COMPANY CIN:** {company_cin}  
**COMPANY PAN:** {company_pan}

---

### **RESOLVED THAT** a Current Account in the name of the Company be opened with **{bank_name}**, **{bank_branch}** Branch, and the Company do accept the terms, conditions, and rules of the Bank for the operation of the said account, in accordance with RBI Master Directions on KYC and PMLA guidelines.

### **RESOLVED FURTHER THAT** Mr./Ms. {director_name}, Director of the Company (bearing DIN: {director_din}), whose signature is attested below, be and is hereby authorized singly to sign, execute, and deliver all necessary application forms, agreements, KYC declarations, and documents required by the Bank for opening and operating the said account, and to operate the said account on behalf of the Company, including signing of cheques, drafts, and online internet banking/digital payment authorizations.

### **RESOLVED FURTHER THAT** the Bank be and is hereby authorized to honor all cheques, drafts, and bills drawn, accepted, or made on behalf of the Company by the said authorized signatory and to act on any instructions given by them relating to the operation of the said account.

### **RESOLVED FURTHER THAT** a copy of this resolution, certified to be true by the Chairperson of the meeting or the Company Secretary, be forwarded to the Bank for their records and action.

---

**For {company_name}**




**(Signature)**  
**Name:** {chairperson_name}  
**Designation:** Chairperson of the Meeting  
**DIN:** [Insert Chairperson DIN]




---

#### **SPECIMEN SIGNATURE OF AUTHORIZED SIGNATORY:**




**(Signature of Mr./Ms. {director_name})**  




**Attested by:**  
**(Signature of Chairperson)**`
  },
  {
    slug: 'board_resolution_auditor_appointment',
    title: 'Board Resolution for Appointment of First Statutory Auditor',
    category: 'Board Resolution',
    legal_reference: 'Section 139(6) of the Companies Act, 2013',
    required_fields: [
      { key: "company_name", label: "Company Name", type: "text", hint: "" },
      { key: "company_cin", label: "Company CIN", type: "text", hint: "" },
      { key: "registered_address", label: "Registered Office Address", type: "text", hint: "" },
      { key: "auditor_name", label: "Auditor/Firm Name", type: "text", hint: "" },
      { key: "auditor_frn", label: "Firm Registration Number (FRN)", type: "text", hint: "e.g., 123456W" },
      { key: "meeting_date", label: "Meeting Date", type: "date", hint: "" },
      { key: "chairperson_name", label: "Chairperson Name", type: "text", hint: "" }
    ],
    master_text_markdown: `# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {company_name} HELD ON {meeting_date} AT THE REGISTERED OFFICE OF THE COMPANY AT {registered_address}.

---

**COMPANY CIN:** {company_cin}

---

### **RESOLVED THAT** pursuant to the provisions of Section 139(6) and other applicable provisions, if any, of the Companies Act, 2013, read with the Companies (Audit and Auditors) Rules, 2014, **M/s. {auditor_name}**, Chartered Accountants (bearing Firm Registration Number: {auditor_frn}), who have submitted their written consent and eligibility certificate under Section 139(1) read with Section 141 of the Act, be and are hereby appointed as the First Statutory Auditors of the Company to hold office from the conclusion of this Board Meeting until the conclusion of the First Annual General Meeting (AGM) of the Company.

### **RESOLVED FURTHER THAT** the Statutory Auditors be paid such remuneration as may be mutually agreed between the Board of Directors of the Company and the Auditors, plus reimbursement of actual out-of-pocket expenses incurred in connection with the audit.

### **RESOLVED FURTHER THAT** any Director of the Company be and is hereby authorized to file the mandatory intimation of this appointment in **Form ADT-1** with the Registrar of Companies (ROC) within 15 days of this meeting, and to do all such acts, deeds, and things as may be necessary to give effect to this resolution.

---

**For {company_name}**




**(Signature)**  
**Name:** {chairperson_name}  
**Designation:** Chairperson of the Meeting  
**DIN:** [Insert Chairperson DIN]`
  },
  {
    slug: 'board_resolution_director_appointment',
    title: 'Board Resolution for Appointment of Additional Director',
    category: 'Board Resolution',
    legal_reference: 'Section 161(1) of the Companies Act, 2013',
    required_fields: [
      { key: "company_name", label: "Company Name", type: "text", hint: "" },
      { key: "company_cin", label: "Company CIN", type: "text", hint: "" },
      { key: "registered_address", label: "Registered Office Address", type: "text", hint: "" },
      { key: "appointee_name", label: "New Director Name", type: "text", hint: "" },
      { key: "appointee_din", label: "New Director DIN", type: "text", hint: "8-digit DIN" },
      { key: "meeting_date", label: "Meeting Date", type: "date", hint: "" },
      { key: "chairperson_name", label: "Chairperson Name", type: "text", hint: "" }
    ],
    master_text_markdown: `# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {company_name} HELD ON {meeting_date} AT THE REGISTERED OFFICE OF THE COMPANY AT {registered_address}.

---

**COMPANY CIN:** {company_cin}

---

### **RESOLVED THAT** pursuant to the provisions of Section 161(1) and other applicable provisions, if any, of the Companies Act, 2013, read with the Rules made thereunder and the Articles of Association of the Company, **Mr./Ms. {appointee_name}** (bearing DIN: {appointee_din}), who has given consent in Form DIR-2 to act as a Director and submitted declaration in Form DIR-8 confirming that he/she is not disqualified under Section 164 of the Act, be and is hereby appointed as an Additional Director of the Company with effect from {meeting_date}, to hold office up to the date of the next Annual General Meeting (AGM) of the Company.

### **RESOLVED FURTHER THAT** the Board hereby notes that the appointee is not disqualified from being appointed as a Director of the Company.

### **RESOLVED FURTHER THAT** any Director or Company Secretary of the Company be and is hereby authorized to file the necessary return of appointment in **Form DIR-12** with the Registrar of Companies (ROC) within 30 days of this appointment, to make necessary entries in the statutory registers, and to execute all such documents as may be required to give effect to this resolution.

---

**For {company_name}**




**(Signature)**  
**Name:** {chairperson_name}  
**Designation:** Director/Chairperson  
**DIN:** [Insert Chairperson DIN]`
  },
  {
    slug: 'mutual_nda_agreement',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'Agreement',
    legal_reference: 'Section 10 of the Indian Contract Act, 1872',
    required_fields: [
      { key: "party1_name", label: "First Party Name (Company)", type: "text", hint: "" },
      { key: "party1_address", label: "First Party Address", type: "text", hint: "" },
      { key: "party2_name", label: "Second Party Name (Company/Ind)", type: "text", hint: "" },
      { key: "party2_address", label: "Second Party Address", type: "text", hint: "" },
      { key: "agreement_date", label: "Agreement Date", type: "date", hint: "" },
      { key: "state_jurisdiction", label: "State Jurisdiction", type: "text", hint: "e.g., Delhi, Maharashtra" }
    ],
    master_text_markdown: `# MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is executed on this **{agreement_date}** ("Effective Date") at **{state_jurisdiction}**, India:

**BY AND BETWEEN:**

1. **{party1_name}**, a company incorporated under the Companies Act, having its registered office at {party1_address} (hereinafter referred to as the "First Party");

**AND**

2. **{party2_name}**, having its principal address at {party2_address} (hereinafter referred to as the "Second Party").

---

### **1. Purpose**
The parties wish to disclose to each other certain proprietary business, technical, and financial information solely for the purpose of exploring a potential commercial association.

### **2. Confidential Information**
Confidential Information refers to any proprietary information disclosed by either party, whether in writing, oral, or digital, including but not limited to business plans, source codes, customer lists, and trade secrets.

### **3. Obligations of Confidentiality**
The receiving party agrees to hold the disclosing party's Confidential Information in strict trust and shall not disclose it to any third party without prior written consent. The receiving party shall restrict access to employees on a strict "need-to-know" basis.

### **4. Digital Personal Data Protection (DPDP) Compliance (2026 Statutory Update)**
To the extent that any Confidential Information shared under this Agreement includes "Personal Data" as defined under the **Digital Personal Data Protection (DPDP) Act, 2023**, both parties agree that:
* They shall act as independent Data Fiduciaries / Data Processors as applicable.
* Personal Data shall be processed strictly for the specified Purpose of this Agreement and in accordance with the security safeguards mandated under the DPDP Act, 2023.
* The receiving party shall implement appropriate technical and organizational measures to protect Personal Data against unauthorized access, loss, or security breaches.
* Upon termination of this Agreement, all Personal Data shared shall be securely deleted or returned in accordance with statutory requirements.

### **5. Governing Law & Dispute Resolution**
This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of this agreement shall be subject to exclusive arbitration in **{state_jurisdiction}** under the Indian Arbitration and Conciliation Act, 1996.

---

**IN WITNESS WHEREOF, the parties hereto have signed this Agreement on the day and year first written above.**




| For **{party1_name}** | For **{party2_name}** |
| :--- | :--- |
| **(Signature)** | **(Signature)** |
| **Name:** [Representative Name] | **Name:** [Representative Name] |
| **Designation:** Authorized Signatory | **Designation:** Authorized Signatory |




**WITNESSES:**

1. **Witness 1 Name:** ______________  
   **Address:** _____________________  
   **Signature:** ______________

2. **Witness 2 Name:** ______________  
   **Address:** _____________________  
   **Signature:** ______________`
  }
]

export default function DraftingCopilotPage() {
  const { showToast } = useToast()

  // Available templates list
  const [templates, setTemplates] = useState<any[]>(STATIC_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(STATIC_TEMPLATES[0])

  // UI States
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form')
  const [letterheadMode, setLetterheadMode] = useState<'digital' | 'preprinted' | 'none'>('digital')
  const [isStampPaper, setIsStampPaper] = useState(false)
  const [paddingTop, setPaddingTop] = useState(240)
  const [paddingX, setPaddingX] = useState(15)

  // Dynamic Form values
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  
  // AI Co-Pilot chat states
  const [userPrompt, setUserPrompt] = useState('')
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [exportingWord, setExportingWord] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')

  // Load physical page printer spacing from local storage cache
  useEffect(() => {
    const cachedTop = localStorage.getItem('letterhead_top_px')
    const cachedX = localStorage.getItem('letterhead_x_px')
    if (cachedTop) setPaddingTop(parseInt(cachedTop, 10))
    if (cachedX) setPaddingX(parseInt(cachedX, 10))
  }, [])

  // Sync latest template library from database with static fail-safe fallbacks
  useEffect(() => {
    async function loadTemplates() {
      try {
        const { data } = await supabase
          .from('legal_templates')
          .select('*')
          .is('effective_to', null)
        if (data && data.length > 0) {
          setTemplates(data)
          setSelectedTemplate(data[0])
        }
      } catch (err) {
        console.warn('Failed to load database templates, utilizing high-reliability static cache:', err)
      }
    }
    loadTemplates()
  }, [])

  // Seed default placeholders for form keys to demonstrate layouts instantly
  useEffect(() => {
    if (!selectedTemplate) return
    const defaults: Record<string, string> = {}
    selectedTemplate.required_fields.forEach((field: any) => {
      if (field.key.includes('company_name') || field.key.includes('party1_name')) defaults[field.key] = 'Apex Logistics Private Limited'
      else if (field.key.includes('company_cin')) defaults[field.key] = 'U74999DL2026PTC123456'
      else if (field.key.includes('company_pan')) defaults[field.key] = 'ABCDE1234F'
      else if (field.key.includes('registered_address') || field.key.includes('party1_address')) defaults[field.key] = '123 Connaught Place, New Delhi - 110001'
      else if (field.key.includes('meeting_date') || field.key.includes('agreement_date') || field.key.includes('execution_date')) defaults[field.key] = new Date().toISOString().split('T')[0]
      else if (field.key.includes('chairperson_name')) defaults[field.key] = 'Rahul Sharma'
      else if (field.key.includes('director_name') || field.key.includes('appointee_name') || field.key.includes('principal_name')) defaults[field.key] = 'Amit Sharma'
      else if (field.key.includes('director_din') || field.key.includes('appointee_din')) defaults[field.key] = '09876543'
      else if (field.key.includes('bank_name')) defaults[field.key] = 'HDFC Bank'
      else if (field.key.includes('bank_branch')) defaults[field.key] = 'Connaught Place Branch'
      else if (field.key.includes('state_jurisdiction') || field.key.includes('execution_city')) defaults[field.key] = 'Delhi'
      else if (field.key.includes('auditor_name')) defaults[field.key] = 'M/s. R. Gupta & Associates'
      else if (field.key.includes('auditor_frn')) defaults[field.key] = '123456W'
      else if (field.key.includes('party2_name') || field.key.includes('attorney_name')) defaults[field.key] = 'Quantum Softwares Private Limited'
      else if (field.key.includes('party2_address') || field.key.includes('attorney_address')) defaults[field.key] = '45 Tech Park, Sector 62, Noida - 201301'
      else defaults[field.key] = ''
    })
    setFormValues(defaults)
  }, [selectedTemplate])

  // Populate dynamic form changes reactively into raw Markdown
  useEffect(() => {
    if (!selectedTemplate) return
    let text = selectedTemplate.master_text_markdown
    Object.entries(formValues).forEach(([key, val]) => {
      text = text.replaceAll(`{${key}}`, val || `[Insert ${key.replace('_', ' ').toUpperCase()}]`)
    })
    setAiResponse(text)
  }, [formValues, selectedTemplate])

  // Call the conversational prompt variable parser API
  const triggerAiCompilation = async (promptText: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: promptText,
          sessionId: 'session-' + Date.now(),
          conversationHistory
        })
      })
      const result = await response.json()
      
      // Update history bubble logs
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: promptText },
        { role: 'assistant', content: result.message }
      ])

      if (result.draftHtml) {
        setAiResponse(result.draftHtml)
        showToast('AI Draft Compiled Successfully!', 'success')
      } else if (result.message) {
        setAiResponse(result.message)
      }
      
      // Sync dynamic keys back to form variables
      if (result.extracted) {
        setFormValues(prev => ({
          ...prev,
          ...result.extracted
        }))
      }
    } catch (error) {
      console.error('Co-Pilot API connection error:', error)
      showToast('AI Compilation Connection Error', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle inputs changes
  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Generate Review Approvals
  const generateShareLink = () => {
    const randomId = 'rev-' + Math.random().toString(36).substring(2, 9)
    const link = `https://www.corplawupdates.in/review/${randomId}`
    setShareLink(link)
    setShowShareModal(true)
    showToast('Approval Link Generated!', 'info')
  }

  // Print layout browser engine
  const printDocument = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedTemplate.title}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; font-family: 'Lora', 'Georgia', serif; font-size: 14px; line-height: 1.6; color: #1E293B; }
            .print-container {
              box-sizing: border-box;
              min-height: 297mm;
              padding: 20mm ${paddingX}mm;
            }
            .stamp-paper-active {
              padding-top: ${isStampPaper ? '127mm' : '20mm'} !important; /* 5-inch spacing strictly on page 1 */
            }
            .digital-letterhead {
              border-bottom: 2px solid #D97706;
              padding-bottom: 12px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              font-family: sans-serif;
            }
            .lh-logo { font-size: 20px; font-weight: bold; color: #0F172A; }
            .lh-details { text-align: right; font-size: 9px; color: #64748B; line-height: 1.4; }
            .legal-markdown {
              padding: 0 10px;
              text-align: justify;
              font-size: 12px;
            }
            .legal-markdown h1 { font-size: 16px; text-align: center; margin-bottom: 25px; font-family: sans-serif; text-transform: uppercase; color: #0F172A; }
            .legal-markdown h3 { font-size: 12px; font-weight: bold; margin-top: 15px; margin-bottom: 10px; }
            .legal-markdown hr { border: none; border-top: 1px solid #CBD5E1; margin: 25px 0; }
            .legal-markdown p { margin-bottom: 12px; }
            .disclaimer-footer {
              margin-top: 50px;
              border-top: 1px solid #E2E8F0;
              padding-top: 12px;
              font-size: 8px;
              color: #94A3B8;
              font-family: sans-serif;
              text-align: center;
              line-height: 1.3;
            }
          </style>
        </head>
        <body>
          <div class="print-container ${isStampPaper ? 'stamp-paper-active' : ''}">
            ${letterheadMode === 'digital' ? `
              <div class="digital-letterhead">
                <div class="lh-logo">🏛️ ${formValues.company_name ? formValues.company_name.substring(0, 22) : 'Company Letterhead'}</div>
                <div class="lh-details">
                  <strong>CIN:</strong> ${formValues.company_cin || 'Pending'}<br/>
                  <strong>Regd. Office:</strong> ${formValues.registered_address || 'Pending'}<br/>
                  <strong>Email:</strong> compliance@${(formValues.company_name || 'company').toLowerCase().replace(/\s+/g, '')}.com
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
              IMPORTANT LEGAL NOTICE: This document is generated as an un-audited draft template by the CorpLawUpdates.in automated assistant. Verify all statutory items (including state stamp duty and witness signatures) with a CS or auditor before final signature execution.
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

  // Programmatic Word Document Downloader
  const downloadWordDoc = async () => {
    setExportingWord(true)
    try {
      const companyName = formValues.company_name || formValues.party1_name || 'CorpLawUpdates'
      const companyCin = formValues.company_cin
      const blob = await generateDocx(aiResponse, companyName, companyCin, letterheadMode)
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedTemplate.slug || 'legal_draft'}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast('Editable Word Document Exported!', 'success')
    } catch (err) {
      console.error('Word export failed:', err)
      showToast('Export MS Word failed', 'error')
    } finally {
      setExportingWord(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col text-white">
      
      {/* Sub-Navbar Control Panels */}
      <div className="bg-brand-slate-blue border-b border-white/10 py-3.5 px-4 flex flex-wrap items-center justify-between gap-4 shadow-md z-10">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-gold animate-pulse" />
            <span className="font-serif font-bold text-white text-sm sm:text-base">AI Legal Drafting Co-Pilot</span>
          </div>
          
          <select
            value={selectedTemplate.slug}
            onChange={(e) => {
              const matched = templates.find(t => t.slug === e.target.value)
              if (matched) setSelectedTemplate(matched)
            }}
            className="text-xs font-bold border-white/10 focus:border-brand-gold focus:ring-brand-gold rounded-badge py-1.5 px-3 bg-brand-navy text-white focus:outline-none"
          >
            {templates.map(t => (
              <option key={t.slug} value={t.slug}>{t.title}</option>
            ))}
          </select>
        </div>
        
        {/* Dynamic Spacing Overlays and Stamps */}
        <div className="flex items-center gap-4 flex-wrap">
          <LetterheadToggle
            letterheadMode={letterheadMode}
            setLetterheadMode={setLetterheadMode}
            isStampPaper={isStampPaper}
            setIsStampPaper={setIsStampPaper}
          />
          <ExportControls
            onShare={generateShareLink}
            onPrint={printDocument}
            onWordExport={downloadWordDoc}
            isExporting={exportingWord}
          />
        </div>
      </div>

      {/* Main Dual Pane Workspace */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-130px)] bg-brand-navy">
        
        {/* Left Sidebar Pane: Form inputs vs prompt chat */}
        <div className="lg:col-span-4 bg-brand-slate-blue border-r border-white/5 flex flex-col h-full overflow-y-auto">
          
          <div className="flex border-b border-white/5 bg-brand-navy/40">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'form' 
                  ? 'border-brand-gold text-brand-gold bg-brand-slate-blue/50'
                  : 'border-transparent text-brand-muted hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4" />
              Dynamic Form Editor
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'chat' 
                  ? 'border-brand-gold text-brand-gold bg-brand-slate-blue/50'
                  : 'border-transparent text-brand-muted hover:text-white'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              AI Prompt Co-Pilot
            </button>
          </div>

          <div className="p-5 flex-grow space-y-6">
            
            {activeTab === 'form' ? (
              /* dynamic input forms matching the template's required variables */
              <div className="space-y-4">
                <div className="p-3 bg-brand-navy/60 rounded-badge border border-white/5 mb-2 font-sans text-xs">
                  <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider block mb-1">
                    Statutory Rule Basis
                  </span>
                  <span className="text-white font-semibold flex items-center gap-1.5 leading-tight">
                    <BookOpen className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                    {selectedTemplate.legal_reference}
                  </span>
                </div>

                {selectedTemplate.required_fields.map((field: any) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest block font-sans">
                      {field.label}
                    </label>
                    <input
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={formValues[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.hint || `Enter ${field.label.toLowerCase()}`}
                      className="w-full text-xs p-2.5 bg-brand-navy border border-white/10 rounded-badge text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Conversation prompts tab */
              <ChatInterface
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                conversationHistory={conversationHistory}
                loading={loading}
                triggerAiCompilation={triggerAiCompilation}
              />
            )}

            {/* Injected spacing slider when preprinted paper spacing is configured */}
            {letterheadMode === 'preprinted' && (
              <div className="mt-6 border-t border-white/5 pt-5">
                <PrintCalibrator
                  paddingTop={paddingTop}
                  setPaddingTop={setPaddingTop}
                  paddingX={paddingX}
                  setPaddingX={setPaddingX}
                />
              </div>
            )}

          </div>
        </div>

        {/* Right Pane: A4 Preview container */}
        <div className="lg:col-span-8 bg-brand-navy/80 p-8 flex justify-center overflow-y-auto h-full scrollbar-thin">
          <A4Preview
            aiResponse={aiResponse}
            formValues={formValues}
            letterheadMode={letterheadMode}
            isStampPaper={isStampPaper}
            paddingTop={paddingTop}
            paddingX={paddingX}
          />
        </div>

      </div>

      {/* Share approvals overlay modals */}
      {showShareModal && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-slate-blue rounded-card border border-white/10 p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-start">
              <h3 className="font-serif font-bold text-lg text-brand-gold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-status-verified" />
                Approval Link Ready!
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-brand-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              WhatsApp this read-only review link directly to your clients or corporate board directors. They can inspect the draft, suggest adjustments, and approve in 1 click!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-grow text-xs p-2.5 bg-brand-navy border border-white/10 rounded-badge text-brand-muted focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink)
                  showToast('Link Copied to Clipboard!', 'success')
                }}
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-4 rounded-badge text-xs font-bold transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
