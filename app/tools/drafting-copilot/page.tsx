'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sparkles, FileText, Printer, FileDown, Sliders, MessageSquare, 
  BookOpen, Share2, HelpCircle, CheckCircle, RefreshCw, ChevronRight, CheckSquare
} from 'lucide-react'
import PrintCalibrator from '@/components/PrintCalibrator'
import { supabase } from '@/lib/supabase'

// Seeding Fallback Templates (Static cache to guarantee Day-1 uptime if DB is blank)
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

### **RESOLVED FURTHER THAT** **Mr./Ms. {director_name}**, Director of the Company (bearing DIN: {director_din}), whose signature is attested below, be and is hereby authorized singly to sign, execute, and deliver all necessary application forms, agreements, KYC declarations, and documents required by the Bank for opening and operating the said account, and to operate the said account on behalf of the Company, including signing of cheques, drafts, and online internet banking/digital payment authorizations.

### **RESOLVED FURTHER THAT** the Bank be and is hereby authorized to honor all cheques, drafts, and bills drawn, accepted, or made on behalf of the Company by the said authorized signatory and to act on any instructions given by them relating to the operation of the said account.

### **RESOLVED FURTHER THAT** a copy of this resolution, certified to be true by the Chairperson of the meeting or the Company Secretary, be forwarded to the Bank for their records and action.

---

**For {company_name}**

\n\n\n\n

**(Signature)**  
**Name:** {chairperson_name}  
**Designation:** Chairperson of the Meeting  
**DIN:** [Insert Chairperson DIN]

\n\n

---

#### **SPECIMEN SIGNATURE OF AUTHORIZED SIGNATORY:**

\n\n

**(Signature of Mr./Ms. {director_name})**  

\n\n

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

\n\n\n\n

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

\n\n\n\n

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
      { key: "party1_address", "label": "First Party Address", "type": "text", hint: "" },
      { key: "party2_name", "label": "Second Party Name (Company/Ind)", "type": "text", hint: "" },
      { key: "party2_address", "label": "Second Party Address", "type": "text", hint: "" },
      { key: "agreement_date", "label": "Agreement Date", "type": "date", hint: "" },
      { key: "state_jurisdiction", "label": "State Jurisdiction", "type": "text", hint: "e.g., Delhi, Maharashtra" }
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
The receiving party agrees to hold the disclosing party\'s Confidential Information in strict trust and shall not disclose it to any third party without prior written consent. The receiving party shall restrict access to employees on a strict "need-to-know" basis.

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

\n\n

| For **{party1_name}** | For **{party2_name}** |
| :--- | :--- |
| **(Signature)** | **(Signature)** |
| **Name:** [Representative Name] | **Name:** [Representative Name] |
| **Designation:** Authorized Signatory | **Designation:** Authorized Signatory |

\n\n

**WITNESSES:**

1. **Witness 1 Name:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_  
   **Address:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
   **Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_

2. **Witness 2 Name:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_  
   **Address:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
   **Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_`
  },
  {
    slug: 'general_power_of_attorney',
    title: 'General Power of Attorney (GPA)',
    category: 'Agreement',
    legal_reference: 'Powers of Attorney Act, 1882',
    required_fields: [
      { key: "principal_name", label: "Principal Name (Grantor)", type: "text", hint: "" },
      { key: "principal_address", "label": "Principal Address", "type": "text", hint: "" },
      { key: "attorney_name", "label": "Attorney Name (Agent)", "type": "text", hint: "" },
      { key: "attorney_address", "label": "Attorney Address", "type": "text", hint: "" },
      { key: "execution_date", "label": "Execution Date", "type": "date", hint: "" },
      { key: "execution_city", "label": "Execution City", "type": "text", hint: "" }
    ],
    master_text_markdown: `# GENERAL POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS that I, **{principal_name}**, residing at {principal_address} (hereinafter referred to as the "Principal"), do hereby appoint **{attorney_name}**, residing at {attorney_address} (hereinafter referred to as the "Attorney"), as my true and lawful attorney to do all or any of the following acts, deeds, and things in my name and on my behalf:

---

### **1. General Management**
To manage, supervise, and look after all my affairs, assets, properties, and business operations in India.

### **2. Banking Operations**
To open, operate, and close bank accounts in my name in any bank, to sign cheques, execute banking documents, and withdraw or deposit funds.

### **3. Legal Proceedings**
To represent me before any court of law, registrar, municipal authority, tax department, or government body, and to sign petitions, affidavits, and appoint legal advocates.

### **4. Execution of Documents**
To sign, execute, register, and deliver all standard contracts, declarations, notices, and agreements on my behalf.

I hereby agree to ratify and confirm all acts, deeds, and things lawfully done by my said Attorney under this General Power of Attorney.

---

**IN WITNESS WHEREOF, I have executed this Power of Attorney at {execution_city} on this {execution_date}.**

\n\n\n\n

**[Signature of Principal]**  
**Name:** {principal_name} (Principal)

\n\n

**I accept the powers delegated herein:**  
**[Signature of Attorney]**  
**Name:** {attorney_name} (Attorney)

\n\n

---

#### **NOTARY PUBLIC ATTESTATION BLOCK:**

Before me, a Notary Public in and for **{execution_city}**, personally appeared **{principal_name}**, who has proved to me on the basis of satisfactory identity credentials to be the person who executed the within instrument and acknowledged that he/she executed the same.

**Date:** {execution_date}  
**Place:** {execution_city}

\n\n

**(Signature & Seal of Notary Public)**  
**Registration Number:** \_\_\_\_\_\_\_\_\_\_\_\_  
**Commission Expires On:** \_\_\_\_\_\_\_\_\_\_

\n\n

**WITNESSES:**

1. **Witness 1 Name & Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_
2. **Witness 2 Name & Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_`
  }
]

export default function DraftingCopilotPage() {
  // Available templates list
  const [templates, setTemplates] = useState<any[]>(STATIC_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(STATIC_TEMPLATES[0])

  // UI Modes
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form')
  const [letterheadMode, setLetterheadMode] = useState<'digital' | 'preprinted' | 'none'>('digital')
  const [isStampPaper, setIsStampPaper] = useState(false)
  const [paddingTop, setPaddingTop] = useState(240)
  const [paddingX, setPaddingX] = useState(15)

  // Dynamic Form values matching the selected template's keys
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  
  // AI Co-Pilot chat states
  const [userPrompt, setUserPrompt] = useState('')
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLink, setShareLink] = useState('')

  // Load from local storage spacing calibration configurations
  useEffect(() => {
    const cachedTop = localStorage.getItem('letterhead_top_px')
    const cachedX = localStorage.getItem('letterhead_x_px')
    if (cachedTop) setPaddingTop(parseInt(cachedTop))
    if (cachedX) setPaddingX(parseInt(cachedX))
  }, [])

  // Sync templates list from Supabase on load (with static fallback)
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

  // Populate default form values when template shifts
  useEffect(() => {
    if (!selectedTemplate) return
    const defaults: Record<string, string> = {}
    selectedTemplate.required_fields.forEach((field: any) => {
      // Intelligently seed realistic placeholder defaults so the user sees a beautiful compiled A4 instantly
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

  // Compile A4 sheet Markdown text reactively based on formValues
  useEffect(() => {
    if (!selectedTemplate) return
    let text = selectedTemplate.master_text_markdown
    Object.entries(formValues).forEach(([key, val]) => {
      text = text.replaceAll(`{${key}}`, val || `[Insert ${key.replace('_', ' ').toUpperCase()}]`)
    })
    setAiResponse(text)
  }, [formValues, selectedTemplate])

  // Call Co-Pilot API (Dynamic prompt variable parser)
  const triggerAiCompilation = async (promptText: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/tools/drafting-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: promptText,
          sessionId: 'session-' + Date.now(),
          conversationHistory
        })
      })
      const result = await response.json()
      
      // Update history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: promptText },
        { role: 'assistant', content: result.message }
      ])

      if (result.draftHtml) {
        setAiResponse(result.draftHtml)
      } else if (result.message) {
        // If missing variables are found, prompt is shown
        setAiResponse(result.message)
      }
      
      // Sync variables back into form editor if extracted
      if (result.extracted) {
        setFormValues(prev => ({
          ...prev,
          ...result.extracted
        }))
      }
    } catch (error) {
      console.error('Co-Pilot API connection error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle manual input shifts
  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Generate viral Share Review Link
  const generateShareLink = () => {
    const randomId = 'rev-' + Math.random().toString(36).substring(2, 9)
    setShareLink(`https://www.corplawupdates.in/review/${randomId}`)
    setShowShareModal(true)
  }

  // High-fidelity browser printing trigger
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
              padding-top: ${isStampPaper ? '127mm' : '20mm'} !important; /* 5 inches first-page margin */
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
            .legal-markdown table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .legal-markdown th, .legal-markdown td { border: 1px solid #CBD5E1; padding: 8px; font-size: 11px; text-align: left; }
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
                .replace(/\| (.*) \|/g, '<tr><td>$1</td></tr>') // Simple table conversion for print preview
              }
            </div>
            <div class="disclaimer-footer">
              IMPORTANT LEGAL NOTICE: This document is generated as an un-audited draft template by the CorpLawUpdates.in automated assistant. Verify all statutory items (including state stamp duty and witness attestations) with a qualified Company Secretary before execution.
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

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      
      {/* Sub-Navbar Control Suite */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 flex flex-wrap items-center justify-between gap-4 shadow-sm z-10">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="font-heading font-bold text-navy text-sm sm:text-base">AI Legal Drafting Co-Pilot</span>
          </div>
          
          {/* Template Selector dropdown */}
          <select
            value={selectedTemplate.slug}
            onChange={(e) => {
              const matched = templates.find(t => t.slug === e.target.value)
              if (matched) setSelectedTemplate(matched)
            }}
            className="text-xs font-bold border-slate-200 focus:border-amber-400 focus:ring-amber-400 rounded-lg py-1.5 px-3 bg-slate-50 text-navy"
          >
            {templates.map(t => (
              <option key={t.slug} value={t.slug}>{t.title}</option>
            ))}
          </select>
        </div>
        
        {/* Letterhead Modes and Stamp options */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
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

          <button
            onClick={() => setIsStampPaper(!isStampPaper)}
            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
              isStampPaper 
                ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {isStampPaper ? 'Stamp Paper Spacing On' : 'Standard Margins'}
          </button>
        </div>
      </div>

      {/* Main Dual Pane Workspace */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-120px)]">
        
        {/* Left Sidebar Pane: Form/Chat tab selection */}
        <div className="lg:col-span-4 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
          
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
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
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'chat' 
                  ? 'border-amber-500 text-amber-600 bg-amber-50/20'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              AI Prompt Co-Pilot
            </button>
          </div>

          <div className="p-5 flex-grow space-y-6">
            
            {activeTab === 'form' ? (
              /* DYNAMIC SIDEBAR FORM: Generates input fields matching the selected template's schema */
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mb-2">
                  <span className="text-[10px] font-bold text-navy uppercase tracking-wider block mb-1">Active Template Basis</span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                    {selectedTemplate.legal_reference}
                  </span>
                </div>

                {selectedTemplate.required_fields.map((field: any) => (
                  <div key={field.key}>
                    <label className="text-[10px] font-bold text-navy uppercase tracking-widest block mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={formValues[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.hint || `Enter ${field.label.toLowerCase()}`}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Conversational AI Prompter Tab */
              <div className="space-y-4">
                <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl text-[10px] text-amber-800 leading-relaxed font-semibold">
                  🚀 Type a prompt below to automatically identify templates, extract details, and fill out the document in real-time!
                </div>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Tell the AI what you want to draft. For example: 'Board resolution for bank account opening at HDFC Bank Connaught Place branch on 2026-05-25 with Amit Sharma...'"
                  rows={5}
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

                {conversationHistory.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dialogue Logs</span>
                    {conversationHistory.slice(-2).map((item, idx) => (
                      <div key={idx} className={`p-3 rounded-lg text-xs leading-relaxed ${item.role === 'user' ? 'bg-slate-50 text-slate-600' : 'bg-amber-50 text-amber-800'}`}>
                        <strong>{item.role === 'user' ? 'You:' : 'AI Co-Pilot:'}</strong>
                        <p className="mt-1 whitespace-pre-wrap">{item.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Print padding calibrator integrated inside the form panel tab */}
            {letterheadMode === 'preprinted' && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <PrintCalibrator />
              </div>
            )}

          </div>
        </div>

        {/* Right Pane: A4 Print Preview Sheet Canvas Container */}
        <div className="lg:col-span-8 bg-slate-100 p-8 flex justify-center overflow-y-auto h-full">
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl rounded-sm p-[20mm] border border-slate-300 relative flex flex-col justify-between box-border">
            
            {/* The Print Layout sheet content */}
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
                    <h2 className="font-heading text-base font-bold text-navy flex items-center gap-1.5">
                      🏛️ {formValues.company_name || formValues.party1_name || 'Corporate Letterhead'}
                    </h2>
                  </div>
                  <div className="text-[9px] text-slate-400 text-right leading-relaxed font-semibold">
                    <strong>CIN:</strong> {formValues.company_cin || 'U74999DL2026PTC123456'}<br />
                    <strong>Address:</strong> {formValues.registered_address || formValues.party1_address || 'Registered Office Address'}
                  </div>
                </div>
              )}

              {/* Dynamic Draft Body Display */}
              <div className="prose prose-slate max-w-none prose-sm font-serif">
                {aiResponse.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-center text-base font-bold font-sans text-navy mb-5 uppercase tracking-wide">{line.substring(2)}</h1>
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
            <div className="absolute right-5 bottom-5 flex gap-2 print:hidden z-10">
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
