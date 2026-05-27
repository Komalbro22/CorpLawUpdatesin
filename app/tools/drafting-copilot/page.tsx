// src/app/tools/drafting-copilot/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sparkles, FileText, MessageSquare, BookOpen, CheckCircle, RefreshCw, X,
  Plus, Trash2, History, Building, Save, Share2, ExternalLink
} from 'lucide-react'
import { A4Preview } from '@/components/drafting/A4Preview'
import { ChatInterface } from '@/components/drafting/ChatInterface'
import { LetterheadToggle } from '@/components/drafting/LetterheadToggle'
import { PrintCalibrator } from '@/components/drafting/PrintCalibrator'
import { ExportControls } from '@/components/drafting/ExportControls'
import { generateDocx } from '@/lib/docx-builder'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

// Premium legally-compliant fallback templates cache (All Resolutions, Agreements, Deeds, and Notices)
const STATIC_TEMPLATES = [
  {
    slug: 'board_resolution_bank_account',
    title: 'Board Resolution for Opening Current Bank Account',
    category: 'Board Resolution',
    isCorporate: true,
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
    isCorporate: true,
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
    isCorporate: true,
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
    isCorporate: false,
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
  },
  {
    slug: 'moa_private_limited',
    title: 'Memorandum of Association (MOA)',
    category: 'MOA',
    isCorporate: true,
    legal_reference: 'Section 4 of the Companies Act, 2013 read with Table A of Schedule I',
    required_fields: [
      { key: "company_name", label: "Company Name", type: "text" },
      { key: "state_jurisdiction", label: "State of Registered Office", type: "text" },
      { key: "business_domain", label: "Primary Business Domain", type: "text", hint: "e.g., Logistics, IT, Solar Energy" },
      { key: "authorized_capital", label: "Authorized Capital (INR)", type: "number" },
      { key: "number_of_shares", label: "Total Number of Equity Shares", type: "number" },
      { key: "nominal_value_per_share", label: "Nominal Value Per Share (INR)", type: "number" },
      { key: "subscriber1_name", label: "First Subscriber Name", type: "text" },
      { key: "subscriber1_din", label: "First Subscriber DIN", type: "text" },
      { key: "subscriber1_address", label: "First Subscriber Address", type: "text" },
      { key: "subscriber1_shares", label: "First Subscriber Share Count", type: "number" },
      { key: "subscriber2_name", label: "Second Subscriber Name", type: "text" },
      { key: "subscriber2_din", label: "Second Subscriber DIN", type: "text" },
      { key: "subscriber2_address", label: "Second Subscriber Address", type: "text" },
      { key: "subscriber2_shares", label: "Second Subscriber Share Count", type: "number" },
      { key: "meeting_date", label: "Execution Date", type: "date" }
    ],
    master_text_markdown: `# MEMORANDUM OF ASSOCIATION OF {company_name} PRIVATE LIMITED

(Incorporated under the Companies Act, 2013)

---

**I. Name of the Company:**  
The name of the Company is **{company_name} Private Limited**.

**II. Registered Office:**  
The Registered Office of the Company will be situated in the State of **{state_jurisdiction}**, India.

**III. Objects of the Company:**  
The objects for which the Company is established are:

### **A. THE OBJECTS TO BE PURSUED BY THE COMPANY ON ITS INCORPORATION:**
1. To carry on the business of developers, consultants, manufacturers, traders, exporters, importers, wholesalers, retailers, and service providers in relation to **{business_domain}** and associated technology solutions.
2. To build, establish, run, maintain, operate, and manage platforms, infrastructures, digital systems, software models, and advisory frameworks required to support the primary operational domain of the Company.

### **B. MATTERS WHICH ARE NECESSARY FOR FURTHERANCE OF THE OBJECTS SPECIFIED IN PART A:**
- To enter into partnership or into any arrangement for sharing profits, union of interest, co-operation, joint venture, reciprocal concession, or otherwise with any person or company.
- To purchase, take on lease, or in exchange, hire, or otherwise acquire any real or personal property, patent rights, licences, or privileges necessary for furtherance of objects.

**IV. Liability of Members:**  
The liability of the member(s) is limited, and this liability is limited to the amount unpaid, if any, on the shares held by them.

**V. Share Capital:**  
The Authorized Share Capital of the Company is **Rs. {authorized_capital}** divided into **{number_of_shares}** Equity Shares of **Rs. {nominal_value_per_share}** each.

---

**VI. Association Clause & Subscription Table:**  
We, the several persons whose names and addresses are subscribed below, are desirous of being formed into a Company in pursuance of this Memorandum of Association, and we respectively agree to take the number of shares in the capital of the Company set opposite our respective names:

| Name of Subscriber & DIN | Address of Subscriber | Number of Shares Taken | Signature of Subscriber |
| :--- | :--- | :--- | :--- |
| **{subscriber1_name}** (DIN: {subscriber1_din}) | {subscriber1_address} | {subscriber1_shares} | [Signed] |
| **{subscriber2_name}** (DIN: {subscriber2_din}) | {subscriber2_address} | {subscriber2_shares} | [Signed] |

**Date:** {meeting_date}  
**Place:** {state_jurisdiction}`
  },
  {
    slug: 'llp_agreement',
    title: 'Limited Liability Partnership (LLP) Agreement',
    category: 'Agreement',
    isCorporate: false,
    legal_reference: 'Section 23 of the Limited Liability Partnership Act, 2008',
    required_fields: [
      { key: "llp_name", label: "LLP Name", type: "text" },
      { key: "registered_address", label: "Registered Office Address", type: "text" },
      { key: "state_jurisdiction", label: "State of Registration", type: "text" },
      { key: "business_domain", label: "Business Domain", type: "text" },
      { key: "partner1_name", label: "First Partner Name", type: "text" },
      { key: "partner1_dpin", label: "First Partner DPIN", type: "text" },
      { key: "partner1_address", label: "First Partner Address", type: "text" },
      { key: "partner1_capital", label: "First Partner Contribution (INR)", type: "number" },
      { key: "partner1_share_percentage", label: "First Partner Profit Share (%)", type: "number" },
      { key: "partner2_name", label: "Second Partner Name", type: "text" },
      { key: "partner2_dpin", label: "Second Partner DPIN", type: "text" },
      { key: "partner2_address", label: "Second Partner Address", type: "text" },
      { key: "partner2_capital", label: "Second Partner Contribution (INR)", type: "number" },
      { key: "partner2_share_percentage", label: "Second Partner Profit Share (%)", type: "number" },
      { key: "bank_operation_mode", label: "Bank Account Operating Mode", type: "text", hint: "singly / jointly" },
      { key: "agreement_date", label: "Agreement Execution Date", type: "date" },
      { key: "execution_city", label: "Execution City", type: "text" }
    ],
    master_text_markdown: `# LIMITED LIABILITY PARTNERSHIP AGREEMENT

This Limited Liability Partnership Agreement is executed on this **{agreement_date}** ("Effective Date") at **{execution_city}**, India:

**BY AND BETWEEN:**

1. **{partner1_name}**, residing at {partner1_address} (hereinafter referred to as "Partner 1 / Designated Partner");

**AND**

2. **{partner2_name}**, residing at {partner2_address} (hereinafter referred to as "Partner 2 / Designated Partner").

---

### **1. Name and Registered Office**
* **Name:** The Designated Partners agree to carry on the business in partnership under the name and style of **{llp_name} LLP**.
* **Office:** The Registered Office of the LLP will be situated at **{registered_address}** in the State of **{state_jurisdiction}**, India.

### **2. Business Domain & Objectives**
The business to be carried on by the LLP shall be:  
*To carry on the business of **{business_domain}** and associated consulting, trading, technical support, and logistics.*

### **3. Capital Contribution & Profit Sharing**
The Designated Partners shall contribute capital to the LLP and share profits/losses in the following ratio:

* **Partner 1 Contribution:** **Rs. {partner1_capital}** (Contribution Share: **{partner1_share_percentage}%**)
* **Partner 2 Contribution:** **Rs. {partner2_capital}** (Contribution Share: **{partner2_share_percentage}%**)

### **4. Designated Partners Duties and Bank Accounts**
* The Designated Partners shall have equal powers to sign, execute, and deliver standard commercial agreements on behalf of the LLP.
* **Bank Account:** Bank accounts in the name of the LLP shall be opened with HDFC Bank or any other bank and operated **{bank_operation_mode}** by the Designated Partners.

---

**IN WITNESS WHEREOF, the Designated Partners have set their hands on the day and year first written above.**




| Designated Partner 1 | Designated Partner 2 |
| :--- | :--- |
| **(Signature)** | **(Signature)** |
| **Name:** {partner1_name} | **Name:** {partner2_name} |
| **DIN/DPIN:** {partner1_dpin} | **DIN/DPIN:** {partner2_dpin} |




**WITNESSES:**

1. **Witness 1 Name & Signature:** ____________________  
2. **Witness 2 Name & Signature:** ____________________`
  },
  {
    slug: 'employment_agreement',
    title: 'Executive Employment Agreement',
    category: 'Agreement',
    isCorporate: true,
    legal_reference: 'Section 10 of the Indian Contract Act, 1872',
    required_fields: [
      { key: "employer_name", label: "Employer Company Name", type: "text" },
      { key: "employer_address", label: "Employer Registered Office Address", type: "text" },
      { key: "employee_name", label: "Employee Name", type: "text" },
      { key: "employee_address", label: "Employee Residential Address", type: "text" },
      { key: "employee_designation", label: "Job Title / Designation", type: "text" },
      { key: "joining_date", label: "Date of Joining", type: "date" },
      { key: "annual_ctc", label: "Annual CTC (INR)", type: "number" },
      { key: "probation_months", label: "Probation Period (Months)", type: "number" },
      { key: "notice_days", label: "Notice Period (Days)", type: "number" },
      { key: "execution_date", label: "Execution Date", type: "date" }
    ],
    master_text_markdown: `# EXECUTIVE EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is executed on this **{execution_date}** ("Effective Date") between:

**{employer_name}**, a company incorporated under the Companies Act, having its registered office at {employer_address} (hereinafter referred to as the "Company/Employer");

**AND**

**Mr./Ms. {employee_name}**, residing at {employee_address} (hereinafter referred to as the "Employee").

---

### **1. Appointment & Designation**
The Company hereby appoints and employs the Employee in the capacity of **{employee_designation}**, and the Employee accepts this professional employment starting from the joining date **{joining_date}**.

### **2. Remuneration & Compensation (CTC)**
* The Employee shall be paid an annual Cost to Company (CTC) of **Rs. {annual_ctc}** (payable in monthly parts, subject to statutory tax deductions).
* The Employee shall be entitled to standard benefits like provident fund and insurance according to company HR directives.

### **3. Probationary Period & Notice Period**
* **Probation:** The Employee shall serve a probation period of **{probation_months} months** from the joining date.
* **Notice Period:** Either party may terminate this employment agreement by giving **{notice_days} days** written notice, or payment of equivalent salary in lieu thereof.

### **4. Intellectual Property & Confidentiality**
All proprietary software models, digital systems, client records, and intellectual assets developed by the Employee during the course of employment shall belong solely to the Employer.

---

**IN WITNESS WHEREOF, the parties hereto have signed this Agreement on the day and year first written above.**




| For **{employer_name}** | **{employee_name}** |
| :--- | :--- |
| **(Signature)** | **(Signature)** |
| **Name:** [Representative Name] | **Name:** {employee_name} |
| **Designation:** Authorized Signatory | **Designation:** Employee |




**WITNESSES:**

1. **Witness 1 Name & Signature:** ____________________  
2. **Witness 2 Name & Signature:** ____________________`
  },
  {
    slug: 'share_transfer_deed_sh4',
    title: 'Share Transfer Deed (Form SH-4)',
    category: 'Agreement',
    isCorporate: true,
    legal_reference: 'Section 56 of the Companies Act, 2013 read with Rule 11 of the Companies (Share Capital and Debentures) Rules, 2014',
    required_fields: [
      { key: "company_name", label: "Company Name", type: "text" },
      { key: "company_cin", label: "Company CIN", type: "text" },
      { key: "nominal_value_per_share", label: "Nominal Value Per Share (INR)", type: "number" },
      { key: "number_of_shares", label: "Number of Shares Transferred", type: "number" },
      { key: "consideration_amount", label: "Consideration Amount (INR)", type: "number" },
      { key: "consideration_in_words", label: "Consideration In Words", type: "text" },
      { key: "distinctive_number_from", label: "Distinctive Number From", type: "text" },
      { key: "distinctive_number_to", label: "Distinctive Number To", type: "text" },
      { key: "transferor_name", label: "Transferor (Seller) Name", type: "text" },
      { key: "transferor_folio", label: "Transferor Folio Number", type: "text" },
      { key: "transferee_name", label: "Transferee (Buyer) Name", type: "text" },
      { key: "transferee_father_name", label: "Transferee Father/Spouse Name", type: "text" },
      { key: "transferee_address", label: "Transferee Residential Address", type: "text" },
      { key: "transferee_pan", label: "Transferee PAN", type: "text" },
      { key: "execution_date", label: "Execution Date", type: "date" }
    ],
    master_text_markdown: `# FORM NO. SH-4 - SHARE TRANSFER DEED

[Pursuant to Section 56 of the Companies Act, 2013 and Rule 11 of the Companies (Share Capital and Debentures) Rules, 2014]

---

**Date of Execution:** {execution_date}

**FOR THE CONSIDERATION** stated below, the Transferor(s) named do hereby transfer to the Transferee(s) named, the shares specified below, to be held by the Transferee(s) subject to the several conditions on which the Transferor(s) held the same immediately before execution.

---

### **1. Description of Shares:**
* **Name of Company:** **{company_name} Private Limited** (CIN: {company_cin})
* **Class of Shares:** **Equity Shares**
* **Nominal Value of Each Share:** **Rs. {nominal_value_per_share}**
* **Amount Paid-Up per Share:** **Rs. {nominal_value_per_share}**
* **Number of Shares Transferred:** **{number_of_shares}** Equity Shares
* **Consideration Amount:** **Rs. {consideration_amount}** (in words: {consideration_in_words})

### **2. Distinctive Numbers of Shares:**
* **From:** {distinctive_number_from}
* **To:** {distinctive_number_to}

---

### **3. Transferor Details (Seller):**
* **Name:** **{transferor_name}**
* **Folio Number:** {transferor_folio}
* **Signature of Transferor:** [Signed]

### **4. Transferee Details (Buyer):**
* **Name:** **{transferee_name}**
* **Father's/Spouse Name:** {transferee_father_name}
* **Address:** {transferee_address}
* **PAN Number:** {transferee_pan}
* **Signature of Transferee:** [Signed]

---

**Attested by:**  
**(Signature of Witness)**  
**Name of Witness:** ____________________  
**Address:** ___________________________`
  },
  {
    slug: 'agm_notice',
    title: 'Notice of Annual General Meeting (AGM)',
    category: 'Notice',
    isCorporate: true,
    legal_reference: 'Section 101 of the Companies Act, 2013 read with Secretarial Standard-2 (SS-2)',
    required_fields: [
      { key: "company_name", label: "Company Name", type: "text" },
      { key: "agm_number", label: "AGM Number", type: "text", hint: "e.g., 1st, 2nd, 5th" },
      { key: "meeting_date", label: "AGM Meeting Date", type: "date" },
      { key: "meeting_time", label: "AGM Meeting Time", type: "text", hint: "e.g., 11:00 AM" },
      { key: "registered_address", label: "Registered Office Address", type: "text" },
      { key: "financial_year", label: "Financial Year Ending", type: "number", hint: "e.g., 2025" },
      { key: "auditor_name", label: "Auditor/Firm Name", type: "text" },
      { key: "auditor_frn", label: "Firm Registration Number (FRN)", type: "text" },
      { key: "director_name", label: "Additional Director Name", type: "text" },
      { key: "director_din", label: "Additional Director DIN", type: "text" },
      { key: "chairperson_name", label: "Chairperson Name", type: "text" },
      { key: "state_jurisdiction", label: "Place / City", type: "text" },
      { key: "notice_date", label: "Notice Issue Date", type: "date" }
    ],
    master_text_markdown: `# NOTICE OF THE ANNUAL GENERAL MEETING

**NOTICE IS HEREBY GIVEN THAT** the **{agm_number} Annual General Meeting** of the members of **{company_name} Private Limited** will be held on **{meeting_date}** at **{meeting_time}** at the Registered Office of the Company at **{registered_address}** to transact the following business:

---

### **ORDINARY BUSINESS:**

#### **1. Adoption of Financial Statements:**
To receive, consider, and adopt the audited Balance Sheet of the Company as of March 31, **{financial_year}**, and the Statement of Profit and Loss for the year ended on that date, together with the Reports of the Directors and Auditors thereon.

#### **2. Appointment / Remuneration of Statutory Auditors:**
To ratify the appointment of **M/s. {auditor_name}**, Chartered Accountants (FRN: {auditor_frn}), as the Statutory Auditors of the Company and authorize the Board of Directors to fix their remuneration for the audited period.

---

### **SPECIAL BUSINESS:**

#### **3. Regularization of Additional Director:**
To consider and if thought fit, to pass with or without modification, the following resolution as an **Ordinary Resolution**:
"**RESOLVED THAT Mr./Ms. {director_name}** (bearing DIN: {director_din}), who was co-opted as an Additional Director by the Board of Directors of the Company and who holds office up to the date of this AGM, be and is hereby appointed as a Director of the Company."

---

**For and on behalf of the Board of Directors of {company_name} Private Limited**




**(Signature)**  
**Name:** {chairperson_name}  
**Designation:** Director/Chairperson  
**DIN:** [Insert Chairperson DIN]  

**Place:** {state_jurisdiction}  
**Date:** {notice_date}

---

#### **NOTES:**
1. A MEMBER ENTITLED TO ATTEND AND VOTE IS ENTITLED TO APPOINT A PROXY TO ATTEND AND VOTE ON A POLL INSTEAD OF HIMSELF AND A PROXY NEED NOT BE A MEMBER OF THE COMPANY. The instrument appointing the proxy (Form MGT-11) must be deposited at the registered office of the Company at least 48 hours before the meeting.`
  },
  {
    slug: 'deed_of_sale',
    title: 'Deed of Sale (Sale Deed)',
    category: 'Agreement',
    isCorporate: false,
    legal_reference: 'Section 54 of the Transfer of Property Act, 1882',
    required_fields: [
      { key: "seller_name", label: "Seller Name", type: "text" },
      { key: "seller_address", label: "Seller Address", type: "text" },
      { key: "buyer_name", label: "Buyer Name", type: "text" },
      { key: "buyer_address", label: "Buyer Address", type: "text" },
      { key: "property_description", label: "Property Description & Schedule", type: "text", hint: "Detailed location, area, and bounds" },
      { key: "sale_consideration", label: "Sale Consideration (INR)", type: "number" },
      { key: "stamp_duty_paid", label: "Stamp Duty Amount (INR)", type: "number" },
      { key: "execution_date", label: "Execution Date", type: "date" },
      { key: "state_jurisdiction", label: "Execution City & State", type: "text" }
    ],
    master_text_markdown: `# DEED OF SALE (SALE DEED)

This Deed of Sale is executed on this **{execution_date}** at **{state_jurisdiction}**, India:

**BY AND BETWEEN:**

**{seller_name}**, residing at {seller_address} (hereinafter referred to as the "SELLER", which expression shall include their heirs, executors, and administrators);

**AND**

**{buyer_name}**, residing at {buyer_address} (hereinafter referred to as the "BUYER", which expression shall include their heirs, executors, administrators, and assigns).

---

### **WHEREAS:**
The Seller is the absolute and lawful owner of the property fully described in the Schedule hereunder (hereinafter referred to as the "Scheduled Property"). The Seller has agreed to sell, and the Buyer has agreed to purchase the Scheduled Property for a total consideration of **Rs. {sale_consideration}**.

---

### **NOW THIS DEED OF SALE WITNESSETH AS UNDER:**

1. **Payment of Consideration:** That the Buyer has paid the full sale consideration of **Rs. {sale_consideration}** to the Seller, the receipt of which the Seller hereby acknowledges.
2. **Transfer of Ownership:** That in consideration of the said payment, the Seller hereby sells, transfers, conveys, and assigns all their rights, titles, interests, and claims in the Scheduled Property to the Buyer to hold the same absolutely forever.
3. **Delivery of Possession:** That the Seller has on this day handed over peaceful, vacant, and physical possession of the Scheduled Property to the Buyer, along with all original title deeds and relevant documents.
4. **Encumbrance Free:** That the Seller covenants with the Buyer that the Scheduled Property is free from all encumbrances, liens, mortgages, charges, litigation, and government acquisitions. Should any defect in title arise, the Seller shall indemnify the Buyer in full.
5. **Stamp Duty & Registration:** That the stamp duty of **Rs. {stamp_duty_paid}** and all registration fees have been fully paid in accordance with the local Registration Act, and both parties have executed this deed before the Sub-Registrar.

---

### **SCHEDULE OF THE PROPERTY:**
*(All that piece and parcel of the property transferred under this deed)*

**Description:** {property_description}  
**Execution Jurisdiction:** Sub-Registrar Office, {state_jurisdiction}

---

**IN WITNESS WHEREOF, both parties have signed this Deed of Sale on the day and year first written above.**




| SELLER (Seller Name) | BUYER (Buyer Name) |
| :--- | :--- |
| **(Signature)** | **(Signature)** |
| **Name:** {seller_name} | **Name:** {buyer_name} |




**WITNESSES:**

1. **Witness 1 Name & Signature:** ____________________  
2. **Witness 2 Name & Signature:** ____________________`
  },
  {
    slug: 'deed_of_mortgage',
    title: 'Deed of Simple Mortgage',
    category: 'Agreement',
    isCorporate: false,
    legal_reference: 'Section 58(b) of the Transfer of Property Act, 1882',
    required_fields: [
      { key: "mortgagor_name", label: "Mortgagor Name (Borrower)", type: "text" },
      { key: "mortgagor_address", label: "Mortgagor Address", type: "text" },
      { key: "mortgagee_name", label: "Mortgagee Name (Lender)", type: "text" },
      { key: "mortgagee_address", label: "Mortgagee Address", type: "text" },
      { key: "loan_amount", label: "Principal Loan Amount (INR)", type: "number" },
      { key: "interest_rate", label: "Interest Rate (% Per Annum)", type: "number" },
      { key: "property_description", label: "Mortgaged Property Details", type: "text", hint: "Detailed address and bounds of the collateral" },
      { key: "repayment_months", label: "Repayment Tenure (Months)", type: "number" },
      { key: "execution_date", label: "Execution Date", type: "date" }
    ],
    master_text_markdown: `# DEED OF SIMPLE MORTGAGE

This Deed of Mortgage is executed on this **{execution_date}** between:

**{mortgagor_name}**, residing at {mortgagor_address} (hereinafter referred to as the "MORTGAGOR", which expression shall include their heirs, executors, and administrators);

**AND**

**{mortgagee_name}**, residing at {mortgagee_address} (hereinafter referred to as the "MORTGAGEE", which expression shall include their successors, administrators, and assigns).

---

### **WHEREAS:**
The Mortgagor has requested the Mortgagee to advance a loan of **Rs. {loan_amount}** to support their requirements, which the Mortgagee has agreed to advance against the simple mortgage of the property described in the Schedule hereunder (hereinafter referred to as the "Mortgaged Property").

---

### **NOW THIS DEED WITNESSETH AS UNDER:**

1. **Covenant to Repay:** That in consideration of the sum of **Rs. {loan_amount}** advanced by the Mortgagee, the Mortgagor hereby covenants to repay the full principal along with interest at the rate of **{interest_rate}% per annum** within a period of **{repayment_months} months** from the execution date.
2. **Mortgage Charge:** That for securing the due repayment of the said loan and interest, the Mortgagor hereby transfers simple mortgage rights and creates a legal charge over the Mortgaged Property in favor of the Mortgagee.
3. **Simple Mortgage Rights:** That in the event of default by the Mortgagor in paying the principal or interest, the Mortgagee shall have the legal right to apply to the competent Court of Law to sell the Mortgaged Property under the Transfer of Property Act, 1882, and apply the sale proceeds towards the loan clearance.
4. **Maintenance & Taxes:** That during the subsistence of this mortgage, the Mortgagor shall maintain the Mortgaged Property in good condition and pay all municipal taxes regularly.

---

### **SCHEDULE OF THE MORTGAGED PROPERTY:**
*(The property charged under this simple mortgage)*

**Description:** {property_description}  

---

**IN WITNESS WHEREOF, the Mortgagor and Mortgagee have signed this Mortgage Deed on the day and year first written above.**




| MORTGAGOR (Borrower) | MORTGAGEE (Lender) |
| :--- | :--- |
| **(Signature)** | **(Signature)** |
| **Name:** {mortgagor_name} | **Name:** {mortgagee_name} |




**WITNESSES:**

1. **Witness 1 Name & Signature:** ____________________  
2. **Witness 2 Name & Signature:** ____________________`
  },
  {
    slug: 'commercial_lease_agreement',
    title: 'Commercial Lease Agreement',
    category: 'Agreement',
    isCorporate: false,
    legal_reference: 'Section 105 of the Transfer of Property Act, 1882',
    required_fields: [
      { key: "landlord_name", label: "Landlord / Lessor Name", type: "text" },
      { key: "landlord_address", label: "Landlord Address", type: "text" },
      { key: "tenant_name", label: "Tenant / Lessee Name", type: "text" },
      { key: "tenant_address", label: "Tenant Address", type: "text" },
      { key: "leased_premises", label: "Leased Premises Details", type: "text", hint: "Detailed commercial unit description" },
      { key: "monthly_rent", label: "Monthly Rent (INR)", type: "number" },
      { key: "security_deposit", label: "Security Deposit (INR)", type: "number" },
      { key: "lease_tenure_months", label: "Lease Tenure (Months)", type: "number" },
      { key: "execution_date", label: "Execution Date", type: "date" }
    ],
    master_text_markdown: `# COMMERCIAL LEASE AGREEMENT

This Commercial Lease Agreement is executed on this **{execution_date}** between:

**{landlord_name}**, residing at {landlord_address} (hereinafter referred to as the "LESSOR/LANDLORD", which expression shall include their heirs and assigns);

**AND**

**{tenant_name}**, residing at {tenant_address} (hereinafter referred to as the "LESSEE/TENANT", which expression shall include their successors and permitted assigns).

---

### **1. Leased Premises & Commercial Purpose**
The Lessor hereby leases the commercial premises fully described in the Schedule hereunder (hereinafter referred to as the "Leased Premises") to the Lessee for carrying on their lawful commercial business, and the Lessee agrees to take the same on lease.

### **2. Lease Tenure & Monthly Rent**
* **Tenure:** This lease is granted for a fixed period of **{lease_tenure_months} months** starting from the execution date.
* **Rent:** The Lessee shall pay to the Lessor a monthly lease rent of **Rs. {monthly_rent}** on or before the 5th day of every calendar month.

### **3. Security Deposit**
* The Lessee has paid an interest-free security deposit of **Rs. {security_deposit}** to the Lessor upon execution, which shall be fully refunded by the Lessor to the Lessee at the time of termination or vacation of the Leased Premises, subject to adjustments for damages.

### **4. Maintenance, Utilities & Covenants**
* **Utilities:** The Tenant shall pay all electricity, water, and telecom charges directly based on actual meter consumption.
* **Maintenance:** Minor day-to-day maintenance shall be borne by the Tenant, while major structural damages shall be repaired by the Landlord.

---

### **SCHEDULE OF LEASED PREMISES:**
*(The commercial unit leased under this agreement)*

**Premises Description:** {leased_premises}  

---

**IN WITNESS WHEREOF, the Landlord and Tenant have signed this Commercial Lease Agreement on the day and year first written above.**




| LANDLORD / LESSOR | TENANT / LESSEE |
| :--- | :--- |
| **(Signature)** | **(Signature)** |
| **Name:** {landlord_name} | **Name:** {tenant_name} |




**WITNESSES:**

1. **Witness 1 Name & Signature:** ____________________  
2. **Witness 2 Name & Signature:** ____________________`
  },
  {
    slug: 'general_power_of_attorney',
    title: 'General Power of Attorney (GPA)',
    category: 'Deed',
    isCorporate: false,
    legal_reference: 'Section 1A & 2 of the Powers of Attorney Act, 1882',
    required_fields: [
      { key: "principal_name", label: "Principal Name (Grantor)", type: "text" },
      { key: "principal_address", label: "Principal Address", type: "text" },
      { key: "attorney_name", label: "Attorney-in-Fact Name (Grantee)", type: "text" },
      { key: "attorney_address", label: "Attorney-in-Fact Address", type: "text" },
      { key: "purpose_description", label: "Scope of Powers / Properties", type: "text", hint: "e.g., managing residential properties, representing before registrar" },
      { key: "custom_powers", label: "Custom Points / Specific Covenants", type: "text", hint: "e.g., also collect money on behalf of me" },
      { key: "execution_city", label: "Execution City", type: "text" },
      { key: "execution_date", label: "Execution Date", type: "date" }
    ],
    master_text_markdown: `# GENERAL POWER OF ATTORNEY
    
**BY THIS POWER OF ATTORNEY**, I, **{principal_name}**, residing at {principal_address} (hereinafter referred to as the "Principal"), do hereby nominate, constitute, and appoint **Mr./Ms. {attorney_name}**, residing at {attorney_address} (hereinafter referred to as the "Attorney-in-Fact"), to be my lawful Attorney-in-Fact to act in my name, place, and stead, and on my behalf to execute all or any of the acts, deeds, and things hereinafter mentioned:

---

### **1. Scope of Powers & Authority**
My Attorney-in-Fact is authorized to execute the following administrative and legal actions on my behalf in relation to **{purpose_description}**:

* **Property Management:** To manage, supervise, look after, let out, collect rents, and execute standard tenant leases for any of my real properties.
* **Representation Before Authorities:** To represent me before any Government departments, municipal corporations, income tax authorities, sub-registrar offices, and regulatory boards.
* **Litigation Representation:** To sign pleadings, file plaints, appoint advocates, sign vakalatnamas, and represent me in any legal proceedings, suits, or arbitrations.
* **Financial Transactions:** To operate bank accounts in my name, deposit or withdraw money, sign checks, and carry out standard transactions with financial institutions.
* **Additional Specific Powers:** {custom_powers}

### **2. Ratification and Validity**
I hereby agree to ratify, confirm, and validate all lawful acts, deeds, signatures, and agreements executed by my said Attorney-in-Fact by virtue of these presents as if they were done by me personally.

### **3. Duration and Revocation**
This Power of Attorney shall remain in full force and effect from the date of execution until revoked by me in writing.

---

**IN WITNESS WHEREOF, I have executed this General Power of Attorney at {execution_city} on this {execution_date}.**




**(Signature of Principal)**  
**Name:** {principal_name}  




#### **SPECIMEN SIGNATURE OF ATTORNEY-IN-FACT:**




**(Signature of Attorney-in-Fact)**  
**Name:** {attorney_name}  

**Attested by:**  
**(Signature of Principal)**  




**WITNESSES:**

1. **Witness 1 Name & Signature:** ____________________  
2. **Witness 2 Name & Signature:** ____________________`
  },
  {
    slug: 'indemnity_bond_duplicate_shares',
    title: 'Indemnity Bond for Duplicate Share Certificates',
    category: 'Deed',
    isCorporate: true,
    legal_reference: 'Section 46 of the Companies Act, 2013 read with Rule 6 of Companies (Share Capital & Debentures) Rules, 2014',
    required_fields: [
      { key: "shareholder_name", label: "Shareholder Name (Indemnifier)", type: "text" },
      { key: "shareholder_address", label: "Shareholder Address", type: "text" },
      { key: "company_name", label: "Company Name", type: "text" },
      { key: "company_cin", label: "Company CIN", type: "text" },
      { key: "registered_address", label: "Registered Office Address", type: "text" },
      { key: "number_of_shares", label: "Number of Shares", type: "number" },
      { key: "folio_number", label: "Folio Number", type: "text" },
      { key: "certificate_numbers", label: "Lost Certificate Numbers", type: "text" },
      { key: "distinctive_numbers", label: "Distinctive Numbers Range", type: "text", hint: "e.g., 5001 to 5100" },
      { key: "execution_date", label: "Execution Date", type: "date" },
      { key: "execution_city", label: "Execution City", type: "text" }
    ],
    master_text_markdown: `# INDEMNITY BOND
    
**THIS INDEMNITY BOND** is executed on this **{execution_date}** at **{execution_city}** by:

**{shareholder_name}**, residing at {shareholder_address} (hereinafter referred to as the "Indemnifier / Shareholder", which expression shall include their heirs, executors, and administrators);

**IN FAVOR OF:**

**{company_name}**, a company incorporated under the Companies Act, having its registered office at {registered_address} (hereinafter referred to as the "Company").

---

### **WHEREAS:**
The Indemnifier is the registered shareholder of the Company holding **{number_of_shares}** Equity Shares, registered under Folio Number **{folio_number}**, represented by Share Certificate(s) Numbered **{certificate_numbers}** and bearing Distinctive Numbers **{distinctive_numbers}**. The said original Share Certificate(s) have been lost, misplaced, or destroyed, and are not traceable despite diligent search.

### **AND WHEREAS:**
The Indemnifier has applied to the Company for the issue of duplicate Share Certificate(s) in lieu of the lost ones, and the Company has agreed to issue the same subject to the Indemnifier executing this Indemnity Bond in the manner hereinafter appearing.

---

### **NOW THIS DEED WITNESSETH AS UNDER:**

1. **Covenant of Indemnity:** In consideration of the Company issuing duplicate Share Certificate(s), the Indemnifier hereby covenants to indemnify and hold the Company, its directors, and its officers completely harmless from and against all claims, actions, suits, demands, losses, damages, liabilities, costs, and expenses which may be brought against or incurred by the Company by reason of the issue of the duplicate Share Certificate(s).
2. **Surrender of Original Certificate:** The Indemnifier further covenants that if the original Share Certificate(s) are found or recovered at any time hereafter, they shall be immediately delivered up to the Company for cancellation, and that the Indemnifier shall not make any transaction, charge, or claim based on the original certificates.
3. **Statutory Compliance:** This bond is executed in full compliance with Rule 6 of the Companies (Share Capital and Debentures) Rules, 2014, and the board resolution requirements of the Company.

---

**IN WITNESS WHEREOF, the Indemnifier has set their hands on the day, month, and year first written above.**




**(Signature of Indemnifier)**  
**Name:** {shareholder_name}  




**WITNESSES:**

1. **Witness 1 Name & Signature:** ____________________  
2. **Witness 2 Name & Signature:** ____________________`
  },
  {
    slug: 'partnership_deed_commercial',
    title: 'Partnership Deed',
    category: 'Agreement',
    isCorporate: false,
    legal_reference: 'Section 4 & 58 of the Indian Partnership Act, 1932',
    required_fields: [
      { key: "partner1_name", label: "First Partner Name", type: "text" },
      { key: "partner1_address", label: "First Partner Address", type: "text" },
      { key: "partner2_name", label: "Second Partner Name", type: "text" },
      { key: "partner2_address", label: "Second Partner Address", type: "text" },
      { key: "firm_name", label: "Partnership Firm Name", type: "text" },
      { key: "business_nature", label: "Nature of Business", type: "text" },
      { key: "place_of_business", label: "Principal Place of Business", type: "text" },
      { key: "capital_contribution", label: "Total Capital Contribution (INR)", type: "number" },
      { key: "profit_sharing_ratio", label: "Profit & Loss Sharing Ratio", type: "text", hint: "e.g., 50:50 or 60:40" },
      { key: "execution_date", label: "Execution Date", type: "date" },
      { key: "execution_city", label: "Execution City", type: "text" }
    ],
    master_text_markdown: `# PARTNERSHIP DEED
    
**THIS DEED OF PARTNERSHIP** is executed on this **{execution_date}** at **{execution_city}** by and between:

1. **{partner1_name}**, residing at {partner1_address} (hereinafter referred to as the "First Partner", which expression shall include their heirs and assigns);

**AND**

2. **{partner2_name}**, residing at {partner2_address} (hereinafter referred to as the "Second Partner", which expression shall include their heirs and assigns).

---

### **1. Name and Business of the Firm**
* **Firm Name:** The partners agree to carry on the business in partnership under the name and style of **M/s. {firm_name}**.
* **Place of Business:** The principal place of business of the firm shall be at **{place_of_business}** or such other places as the partners may mutually decide from time to time.
* **Nature of Business:** The firm shall carry on the business of **{business_nature}** and any other allied business agreed upon by the partners.

### **2. Capital and Profit Sharing**
* **Capital Contribution:** The total capital of the firm is agreed to be **Rs. {capital_contribution}**, which shall be contributed by the partners in equal proportions or in such shares as mutually agreed.
* **Profit Sharing Ratio:** The partners shall share all net profits and bear all losses of the firm in the ratio of **{profit_sharing_ratio}**.
* **Interest on Capital:** Partners shall be entitled to interest on their capital contributions, if any, in accordance with the provisions of Section 40(b) of the Income Tax Act, 1961.

### **3. Banking and Accounts**
* Standard books of account shall be kept at the principal place of business, and bank accounts in the name of the firm shall be operated jointly by the partners.

---

**IN WITNESS WHEREOF, both partners have set their signatures on the day and year first written above.**




| First Partner | Second Partner |
| :--- | :--- |
| **(Signature)** | **(Signature)** |
| **Name:** {partner1_name} | **Name:** {partner2_name} |




**WITNESSES:**

1. **Witness 1 Name & Signature:** ____________________  
2. **Witness 2 Name & Signature:** ____________________`
  },
  {
    slug: 'gift_deed_movable',
    title: 'Deed of Gift (Movable Property)',
    category: 'Deed',
    isCorporate: false,
    legal_reference: 'Section 122 & 123 of the Transfer of Property Act, 1882',
    required_fields: [
      { key: "donor_name", label: "Donor Name (Giver)", type: "text" },
      { key: "donor_address", label: "Donor Address", type: "text" },
      { key: "donee_name", label: "Donee Name (Receiver)", type: "text" },
      { key: "donee_address", label: "Donee Address", type: "text" },
      { key: "gift_description", label: "Description of Gift Asset", type: "text", hint: "Detailed description of shares, cash, or jewellery" },
      { key: "gift_value", label: "Estimated Value (INR)", type: "number" },
      { key: "execution_date", label: "Execution Date", type: "date" },
      { key: "execution_city", label: "Execution City", type: "text" }
    ],
    master_text_markdown: `# DEED OF GIFT
    
**THIS DEED OF GIFT** is executed on this **{execution_date}** at **{execution_city}** by and between:

**{donor_name}**, residing at {donor_address} (hereinafter referred to as the "DONOR", which expression shall include their heirs and executors);

**AND**

**{donee_name}**, residing at {donee_address} (hereinafter referred to as the "DONEE", which expression shall include their heirs, administrators, and assigns).

---

### **WHEREAS:**
The Donor, out of natural love, affection, and goodwill which they bear towards the Donee (who is the relative of the Donor), is desirous of making a gift of the movable property fully described in the Schedule hereunder (hereinafter referred to as the "Gifted Asset") to the Donee to hold the same absolutely.

---

### **NOW THIS DEED WITNESSETH AS UNDER:**

1. **Transfer of Ownership:** That the Donor, out of natural love and affection, hereby transfers, conveys, and gifts the Gifted Asset valued at approximately **Rs. {gift_value}** to the Donee as an absolute gift.
2. **Delivery of Possession:** That the Donor has on this day handed over actual physical possession or constructive delivery of the Gifted Asset, along with all original registration forms or certificates, to the Donee.
3. **Acceptance of Gift:** That the Donee hereby accepts the said gift and has taken physical possession/delivery of the Gifted Asset during the lifetime of the Donor.
4. **Indemnity and Free of Charges:** The Donor covenants with the Donee that the Gifted Asset is their absolute property and is free from any lien, charge, or family dispute.

---

### **SCHEDULE OF THE GIFTED ASSET:**
*(Detailed description of the movable property gifted)*

**Description:** {gift_description}  

---

**IN WITNESS WHEREOF, the Donor and Donee have set their signatures on the day and year first written above.**




| DONOR (Giver) | DONEE (Receiver) |
| :--- | :--- |
| **(Signature)** | **(Signature)** |
| **Name:** {donor_name} | **Name:** {donee_name} |




**WITNESSES:**

1. **Witness 1 Name & Signature:** ____________________  
2. **Witness 2 Name & Signature:** ____________________`
  }
]

export default function DraftingCopilotPage() {
  const { showToast } = useToast()

  // Persistent Session ID
  const [currentSessionId, setCurrentSessionId] = useState<string>('')

  // Available templates list
  const [templates, setTemplates] = useState<any[]>(STATIC_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(STATIC_TEMPLATES[0])

  // UI States
  const [activeTab, setActiveTab] = useState<'form' | 'chat' | 'history'>('form')
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

  // Saved Company Profiles
  const [profiles, setProfiles] = useState<any[]>([])
  const [showAddProfileForm, setShowAddProfileForm] = useState(false)
  const [newProfileNick, setNewProfileNick] = useState('')
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileCin, setNewProfileCin] = useState('')
  const [newProfilePan, setNewProfilePan] = useState('')
  const [newProfileAddress, setNewProfileAddress] = useState('')
  const [newProfileDirector, setNewProfileDirector] = useState('')
  const [newProfileDin, setNewProfileDin] = useState('')

  // Document Draft History
  const [history, setHistory] = useState<any[]>([])

  // Real-time Approved Sessions indicators
  const [approvedSessions, setApprovedSessions] = useState<Record<string, boolean>>({})

  // Inline Field-Level Refinement States
  const [activeRefineField, setActiveRefineField] = useState<string | null>(null)
  const [refineCondition, setRefineCondition] = useState('')
  const [refineLoading, setRefineLoading] = useState(false)

  // Load session id, profiles and history from cache
  useEffect(() => {
    setCurrentSessionId('session-' + Date.now())
    
    const cachedTop = localStorage.getItem('letterhead_top_px')
    const cachedX = localStorage.getItem('letterhead_x_px')
    if (cachedTop) setPaddingTop(parseInt(cachedTop, 10))
    if (cachedX) setPaddingX(parseInt(cachedX, 10))

    try {
      const savedProfiles = localStorage.getItem('corplaw_company_profiles')
      if (savedProfiles) setProfiles(JSON.parse(savedProfiles))
      
      const savedHistory = localStorage.getItem('corplaw_document_history')
      if (savedHistory) setHistory(JSON.parse(savedHistory))

      const savedTemplateSlug = localStorage.getItem('corplaw_selected_template_slug')
      if (savedTemplateSlug) {
        const matched = STATIC_TEMPLATES.find(t => t.slug === savedTemplateSlug)
        if (matched) setSelectedTemplate(matched)
      }
    } catch (err) {
      console.warn('Failed to load local storage items:', err)
    }
  }, [])

  // Cache selected template to keep view state on page refresh
  useEffect(() => {
    if (selectedTemplate?.slug) {
      localStorage.setItem('corplaw_selected_template_slug', selectedTemplate.slug)
    }
  }, [selectedTemplate])

  // Cache form values for the active template to persist changes on refresh
  useEffect(() => {
    if (selectedTemplate?.slug && Object.keys(formValues).length > 0) {
      localStorage.setItem(`corplaw_form_values_${selectedTemplate.slug}`, JSON.stringify(formValues))
    }
  }, [formValues, selectedTemplate])

  // Load approved sessions from localStorage to display real-time status in history & active editor
  const refreshApprovedSessions = () => {
    if (typeof window !== 'undefined') {
      try {
        const localSessionsStr = localStorage.getItem('corplaw_local_draft_sessions')
        if (localSessionsStr) {
          const localSessions = JSON.parse(localSessionsStr)
          const approvedMap: Record<string, boolean> = {}
          Object.keys(localSessions).forEach(sid => {
            if (localSessions[sid]?.draft_status === 'approved') {
              approvedMap[sid] = true
            }
          })
          setApprovedSessions(approvedMap)
        }
      } catch (e) {
        console.warn('Failed to parse approved sessions:', e)
      }
    }
  }

  // Poll or listen for tab updates to reflect client approvals in real-time
  useEffect(() => {
    refreshApprovedSessions()
  }, [activeTab, currentSessionId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleFocus = () => {
      refreshApprovedSessions()
    }

    window.addEventListener('focus', handleFocus)
    // Also run an interval every 3 seconds to auto-update
    const interval = setInterval(refreshApprovedSessions, 3000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
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
          const formatted = data.map((t: any) => ({
            ...t,
            isCorporate: t.is_corporate !== undefined ? t.is_corporate : (t.category !== 'Agreement' && t.category !== 'Deed')
          }))
          setTemplates(formatted)
          setSelectedTemplate(formatted[0])
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

    // Restore cached form values if available
    const cachedFormValuesStr = localStorage.getItem(`corplaw_form_values_${selectedTemplate.slug}`)
    if (cachedFormValuesStr) {
      try {
        const parsed = JSON.parse(cachedFormValuesStr)
        if (Object.keys(parsed).length > 0) {
          setFormValues(parsed)
          return
        }
      } catch (e) {
        console.warn('Failed to parse cached form values:', e)
      }
    }

    const defaults: Record<string, string> = {}
    selectedTemplate.required_fields.forEach((field: any) => {
      if (field.key.includes('company_name') || field.key.includes('party1_name') || field.key.includes('employer_name') || field.key.includes('landlord_name')) defaults[field.key] = 'Apex Logistics Private Limited'
      else if (field.key.includes('company_cin')) defaults[field.key] = 'U74999DL2026PTC123456'
      else if (field.key.includes('company_pan') || field.key.includes('transferee_pan')) defaults[field.key] = 'ABCDE1234F'
      else if (field.key.includes('registered_address') || field.key.includes('party1_address') || field.key.includes('employer_address') || field.key.includes('landlord_address') || field.key.includes('seller_address') || field.key.includes('mortgagor_address') || field.key.includes('shareholder_address') || field.key.includes('donor_address') || field.key.includes('place_of_business')) defaults[field.key] = '123 Connaught Place, New Delhi - 110001'
      else if (field.key.includes('meeting_date') || field.key.includes('agreement_date') || field.key.includes('execution_date') || field.key.includes('joining_date') || field.key.includes('notice_date')) defaults[field.key] = new Date().toISOString().split('T')[0]
      else if (field.key.includes('chairperson_name')) defaults[field.key] = 'Rahul Sharma'
      else if (field.key.includes('director_name') || field.key.includes('appointee_name') || field.key.includes('principal_name') || field.key.includes('transferor_name') || field.key.includes('employee_name') || field.key.includes('seller_name') || field.key.includes('mortgagor_name') || field.key.includes('landlord_name') || field.key.includes('shareholder_name') || field.key.includes('donor_name')) defaults[field.key] = 'Amit Sharma'
      else if (field.key.includes('director_din') || field.key.includes('appointee_din') || field.key.includes('subscriber1_din') || field.key.includes('subscriber2_din')) defaults[field.key] = '09876543'
      else if (field.key.includes('bank_name')) defaults[field.key] = 'HDFC Bank'
      else if (field.key.includes('bank_branch')) defaults[field.key] = 'Connaught Place Branch'
      else if (field.key.includes('state_jurisdiction') || field.key.includes('execution_city')) defaults[field.key] = 'Delhi'
      else if (field.key.includes('auditor_name')) defaults[field.key] = 'M/s. R. Gupta & Associates'
      else if (field.key.includes('auditor_frn')) defaults[field.key] = '123456W'
      else if (field.key.includes('buyer_name') || field.key.includes('mortgagee_name') || field.key.includes('tenant_name') || field.key.includes('transferee_name') || field.key.includes('party2_name') || field.key.includes('attorney_name') || field.key.includes('partner1_name') || field.key.includes('donee_name')) defaults[field.key] = 'Mandeep Singh'
      else if (field.key.includes('party2_address') || field.key.includes('attorney_address') || field.key.includes('partner1_address') || field.key.includes('buyer_address') || field.key.includes('mortgagee_address') || field.key.includes('tenant_address') || field.key.includes('donee_address')) defaults[field.key] = '45 Tech Park, Sector 62, Noida - 201301'
      else if (field.key.includes('partner2_name')) defaults[field.key] = 'Komalpreet Kaur'
      else if (field.key.includes('partner2_address')) defaults[field.key] = '88 Ring Road, Lajpat Nagar, Delhi - 110024'
      else if (field.key.includes('llp_name')) defaults[field.key] = 'Apex Logistics'
      else if (field.key.includes('partner1_capital') || field.key.includes('partner2_capital') || field.key.includes('authorized_capital') || field.key.includes('consideration_amount') || field.key.includes('sale_consideration') || field.key.includes('loan_amount') || field.key.includes('capital_contribution') || field.key.includes('gift_value')) defaults[field.key] = '100000'
      else if (field.key.includes('partner1_share_percentage') || field.key.includes('partner2_share_percentage')) defaults[field.key] = '50'
      else if (field.key.includes('number_of_shares')) defaults[field.key] = '10000'
      else if (field.key.includes('nominal_value_per_share')) defaults[field.key] = '10'
      else if (field.key.includes('business_domain')) defaults[field.key] = 'IT Consulting and Software Development'
      else if (field.key.includes('subscriber1_name')) defaults[field.key] = 'Ravi Kumar'
      else if (field.key.includes('subscriber1_address')) defaults[field.key] = 'Block C, Vasant Kunj, New Delhi'
      else if (field.key.includes('subscriber1_shares')) defaults[field.key] = '5000'
      else if (field.key.includes('subscriber2_name')) defaults[field.key] = 'Sanjay Gupta'
      else if (field.key.includes('subscriber2_address')) defaults[field.key] = 'Sector 15, Rohini, New Delhi'
      else if (field.key.includes('subscriber2_shares')) defaults[field.key] = '5000'
      else if (field.key.includes('employee_designation')) defaults[field.key] = 'Senior Compliance Officer'
      else if (field.key.includes('annual_ctc')) defaults[field.key] = '1200000'
      else if (field.key.includes('probation_months')) defaults[field.key] = '6'
      else if (field.key.includes('notice_days')) defaults[field.key] = '60'
      else if (field.key.includes('agm_number')) defaults[field.key] = '3rd'
      else if (field.key.includes('financial_year')) defaults[field.key] = '2025'
      else if (field.key.includes('meeting_time')) defaults[field.key] = '11:00 AM'
      else if (field.key.includes('distinctive_number_from')) defaults[field.key] = '00001'
      else if (field.key.includes('distinctive_number_to')) defaults[field.key] = '10000'
      else if (field.key.includes('transferor_folio')) defaults[field.key] = 'F-102'
      else if (field.key.includes('consideration_in_words')) defaults[field.key] = 'One Lakh Rupees Only'
      else if (field.key.includes('property_description')) defaults[field.key] = 'Flat No. 402, 4th Floor, Block A, Lajpat Nagar III, New Delhi - 110024, measuring approximately 1200 sq. ft.'
      else if (field.key.includes('stamp_duty_paid')) defaults[optionValue(field.key)] = '6000'
      else if (field.key.includes('interest_rate')) defaults[field.key] = '12'
      else if (field.key.includes('repayment_months') || field.key.includes('lease_tenure_months')) defaults[field.key] = '36'
      else if (field.key.includes('monthly_rent')) defaults[field.key] = '45000'
      else if (field.key.includes('security_deposit')) defaults[field.key] = '90000'
      else if (field.key.includes('leased_premises')) defaults[field.key] = 'Commercial Office Space No. 101, First Floor, Tech Park, Sector 62, Noida - 201301, measuring 800 sq. ft.'
      else if (field.key.includes('purpose_description')) defaults[field.key] = 'management of residential properties and representation before municipal corporations'
      else if (field.key.includes('custom_powers')) defaults[field.key] = 'To collect, receive, and acknowledge all payments, monies, debts, and outstanding dues payable to me, and to issue valid and binding receipts and discharges for the same.'
      else if (field.key.includes('certificate_numbers')) defaults[field.key] = '10234 to 10235'
      else if (field.key.includes('distinctive_numbers')) defaults[field.key] = '5001 to 5100'
      else if (field.key.includes('firm_name')) defaults[field.key] = 'Apex Corporate Services'
      else if (field.key.includes('business_nature')) defaults[field.key] = 'Corporate Advisory, Management Consulting, and Secretarial Auditing Services'
      else if (field.key.includes('profit_sharing_ratio')) defaults[field.key] = '50:50'
      else if (field.key.includes('gift_description')) defaults[field.key] = '1000 Equity Shares of Apex Logistics Private Limited (CIN: U74999DL2026PTC123456)'
      else defaults[field.key] = ''
    })
    setFormValues(defaults)
  }, [selectedTemplate])

  // Helper utility to satisfy typescript
  const optionValue = (key: string) => key

  // Populate dynamic form changes reactively into raw Markdown
  useEffect(() => {
    if (!selectedTemplate) return
    let text = selectedTemplate.master_text_markdown || selectedTemplate.body
    Object.entries(formValues).forEach(([key, val]) => {
      text = text.replaceAll(`{${key}}`, val || `[Insert ${key.replace('_', ' ').toUpperCase()}]`)
    })
    setAiResponse(text)
  }, [formValues, selectedTemplate])

  // Reset letterhead mode based on template type
  useEffect(() => {
    if (!selectedTemplate) return
    if (selectedTemplate.isCorporate === false) {
      setLetterheadMode('none')
    } else {
      setLetterheadMode('digital')
    }
  }, [selectedTemplate])

  // Save document draft into local history
  const saveToHistory = (slug: string, title: string, vars: any, text: string, token: string) => {
    try {
      const savedHistory = localStorage.getItem('corplaw_document_history')
      const historyList = savedHistory ? JSON.parse(savedHistory) : []
      
      const filtered = historyList.filter((item: any) => item.sessionId !== token)
      
      const newItem = {
        sessionId: token,
        slug,
        title,
        timestamp: new Date().toISOString(),
        formValues: vars,
        draftHtml: text
      }
      
      const updated = [newItem, ...filtered].slice(0, 50)
      setHistory(updated)
      localStorage.setItem('corplaw_document_history', JSON.stringify(updated))
    } catch (err) {
      console.warn('Failed to save document history:', err)
    }
  }

  // Clear history cache
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('corplaw_document_history')
    showToast('Document history cleared', 'info')
  }

  // Load a document from local history
  const loadHistoryItem = (item: any) => {
    try {
      const matchedTemplate = templates.find(t => t.slug === item.slug)
      if (matchedTemplate) {
        setSelectedTemplate(matchedTemplate)
      } else {
        // Fallback placeholder template for custom templates
        setSelectedTemplate({
          slug: item.slug || 'custom',
          title: item.title || 'Custom AI Legal Draft',
          legal_reference: 'Custom Indian Regulatory Review',
          required_fields: Object.keys(item.formValues).map(k => ({ key: k, label: k.replace('_', ' ').toUpperCase(), type: 'text' })),
          master_text_markdown: item.draftHtml
        })
      }
      setCurrentSessionId(item.sessionId)
      setFormValues(item.formValues)
      setAiResponse(item.draftHtml)
      setActiveTab('form')
      showToast('Document draft reloaded successfully!', 'success')
    } catch (err) {
      showToast('Failed to load history item', 'error')
    }
  }

  // Save current active form values as a company profile nickname
  const saveCurrentAsProfile = () => {
    const name = formValues.company_name || formValues.party1_name || formValues.employer_name || formValues.landlord_name || formValues.seller_name
    if (!name) {
      showToast('Please enter a name in the form first', 'error')
      return
    }
    const nickname = prompt('Enter a nickname for this profile:', name)
    if (!nickname) return

    const newProfile = {
      id: 'prof-' + Date.now(),
      nickname,
      company_name: name,
      company_cin: formValues.company_cin || '',
      company_pan: formValues.company_pan || '',
      registered_address: formValues.registered_address || formValues.party1_address || formValues.employer_address || formValues.landlord_address || formValues.seller_address || '',
      director_name: formValues.director_name || formValues.appointee_name || formValues.chairperson_name || formValues.partner1_name || '',
      director_din: formValues.director_din || formValues.appointee_din || formValues.partner1_dpin || ''
    }

    const updated = [...profiles, newProfile]
    setProfiles(updated)
    localStorage.setItem('corplaw_company_profiles', JSON.stringify(updated))
    showToast(`Profile "${nickname}" saved successfully!`, 'success')
  }

  // Save a custom company profile using form inputs
  const addNewProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProfileNick || !newProfileName) {
      showToast('Profile nickname and company name are required', 'error')
      return
    }

    const newProfile = {
      id: 'prof-' + Date.now(),
      nickname: newProfileNick,
      company_name: newProfileName,
      company_cin: newProfileCin,
      company_pan: newProfilePan,
      registered_address: newProfileAddress,
      director_name: newProfileDirector,
      director_din: newProfileDin
    }

    const updated = [...profiles, newProfile]
    setProfiles(updated)
    localStorage.setItem('corplaw_company_profiles', JSON.stringify(updated))
    
    // Clear inputs
    setNewProfileNick('')
    setNewProfileName('')
    setNewProfileCin('')
    setNewProfilePan('')
    setNewProfileAddress('')
    setNewProfileDirector('')
    setNewProfileDin('')
    setShowAddProfileForm(false)
    showToast('Company profile saved!', 'success')
  }

  // Delete a saved profile
  const deleteProfile = (id: string) => {
    const updated = profiles.filter(p => p.id !== id)
    setProfiles(updated)
    localStorage.setItem('corplaw_company_profiles', JSON.stringify(updated))
    showToast('Profile deleted', 'info')
  }

  // Auto-fill active form values using a saved profile
  const applyProfile = (profile: any) => {
    if (!profile) return
    const updatedValues = { ...formValues }
    
    selectedTemplate.required_fields.forEach((field: any) => {
      const k = field.key.toLowerCase()
      if (k.includes('company_name') || k.includes('party1_name') || k.includes('employer_name') || k.includes('landlord_name')) {
        updatedValues[field.key] = profile.company_name
      } else if (k.includes('company_cin')) {
        updatedValues[field.key] = profile.company_cin
      } else if (k.includes('company_pan')) {
        updatedValues[field.key] = profile.company_pan
      } else if (k.includes('registered_address') || k.includes('party1_address') || k.includes('employer_address') || k.includes('landlord_address') || k.includes('seller_address')) {
        updatedValues[field.key] = profile.registered_address
      } else if (k.includes('director_name') || k.includes('appointee_name') || k.includes('chairperson_name') || k.includes('principal_name') || k.includes('partner1_name') || k.includes('seller_name')) {
        updatedValues[field.key] = profile.director_name
      } else if (k.includes('director_din') || k.includes('appointee_din') || k.includes('partner1_dpin')) {
        updatedValues[field.key] = profile.director_din
      }
    })
    
    setFormValues(updatedValues)
    showToast(`Applied profile: ${profile.nickname}`, 'success')
  }

  // Persist drafting session state to Supabase database
  const saveSessionToDatabase = async () => {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const sessionData = {
        session_token: currentSessionId,
        template_slug: selectedTemplate?.slug || null,
        variables: formValues,
        conversation: conversationHistory,
        draft_html: aiResponse,
        draft_status: 'complete',
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }

      // Save to localStorage fallback
      if (typeof window !== 'undefined') {
        try {
          const localSessionsStr = localStorage.getItem('corplaw_local_draft_sessions')
          const localSessions = localSessionsStr ? JSON.parse(localSessionsStr) : {}
          localSessions[currentSessionId] = {
            ...sessionData,
            letterhead_mode: letterheadMode
          }
          localStorage.setItem('corplaw_local_draft_sessions', JSON.stringify(localSessions))
        } catch (e) {
          console.warn('Failed to save to localStorage:', e)
        }
      }

      const { error } = await supabase
        .from('draft_sessions')
        .upsert(sessionData, { onConflict: 'session_token' })

      if (error) throw error
    } catch (err) {
      console.warn('Failed to save session to Supabase database:', err)
    }
  }

  // Call the conversational prompt variable parser API
  const triggerAiCompilation = async (promptText: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: promptText,
          sessionId: currentSessionId,
          conversationHistory,
          currentDraft: aiResponse
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
        
        saveToHistory(
          selectedTemplate?.slug || 'custom',
          selectedTemplate?.title || 'Custom AI Legal Draft',
          result.extracted || formValues,
          result.draftHtml,
          currentSessionId
        )
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

  // Handle field-level AI refinement
  const handleRefineField = async (fieldKey: string, fieldLabel: string) => {
    if (refineLoading) return
    setRefineLoading(true)

    try {
      const response = await fetch('/api/ai/refine-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldName: fieldLabel,
          rawValue: formValues[fieldKey] || '',
          condition: refineCondition
        })
      })

      const result = await response.json()

      if (result.polishedText) {
        setFormValues(prev => ({
          ...prev,
          [fieldKey]: result.polishedText
        }))
        setActiveRefineField(null)
        setRefineCondition('')
        showToast(`Field "${fieldLabel}" polished professionally!`, 'success')
      } else {
        showToast('Refinement failed. Please try again.', 'error')
      }
    } catch (err) {
      console.error('Field refinement error:', err)
      showToast('Connection error during AI field refinement', 'error')
    } finally {
      setRefineLoading(false)
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
  const generateShareLink = async () => {
    setLoading(true)
    await saveSessionToDatabase()
    setLoading(false)

    const link = `${window.location.origin}/tools/review/${currentSessionId}`
    setShareLink(link)
    setShowShareModal(true)
    
    // Save to history on share
    saveToHistory(
      selectedTemplate?.slug || 'custom',
      selectedTemplate?.title || 'Custom AI Legal Draft',
      formValues,
      aiResponse,
      currentSessionId
    )

    showToast('Secure Client Review Link Generated!', 'success')
  }

  // Helper to compile markdown to beautiful print-ready raw HTML string
  const parseMarkdownCustomToHtml = (text: string) => {
    const lines = text.split('\n')
    let html = ''
    
    // Inline bold helper
    const parseInlineBolding = (textVal: string) => {
      return textVal.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
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
        
        if (tableLines.length > 0) {
          const rows = tableLines.filter(row => !row.match(/^\|\s*[:\-|\s]+\s*\|$/))
          html += '<table style="width: 100%; margin-top: 16px; margin-bottom: 16px; border-collapse: collapse; table-layout: fixed; font-size: 10px; font-family: sans-serif;"><tbody>'
          
          rows.forEach(row => {
            const cells = row
              .split('|')
              .map(c => c.trim())
              .slice(1, -1)
            
            html += '<tr>'
            cells.forEach(cell => {
              html += `<td style="padding: 4px 8px; text-align: left; line-height: 1.5; width: 50%; vertical-align: top; font-family: sans-serif; color: #0B1F3A;">${parseInlineBolding(cell)}</td>`
            })
            html += '</tr>'
          })
          html += '</tbody></table>'
        }
        continue
      }
      
      if (cleanLine.startsWith('# ')) {
        html += `<h1 style="text-align: center; font-size: 14px; font-weight: bold; font-family: sans-serif; color: #0B1F3A; margin-bottom: 20px; text-transform: uppercase; border-bottom: 1px solid rgba(11, 31, 58, 0.1); padding-bottom: 8px;">${cleanLine.substring(2)}</h1>`
      } else if (cleanLine.startsWith('### ')) {
        html += `<h3 style="font-size: 12px; font-weight: bold; color: #0B1F3A; margin-top: 16px; margin-bottom: 8px; font-family: sans-serif;">• ${cleanLine.substring(4)}</h3>`
      } else if (cleanLine.startsWith('---')) {
        html += '<hr style="border: none; border-top: 1px solid rgba(11, 31, 58, 0.1); margin: 16px 0;" />'
      } else {
        if (!cleanLine) {
          html += '<div style="height: 8px;"></div>'
        } else {
          html += `<p style="font-size: 11px; line-height: 1.6; color: #1E293B; margin-bottom: 10px; text-align: justify; font-family: Georgia, serif;">${parseInlineBolding(cleanLine)}</p>`
        }
      }
      
      i++
    }
    
    return html
  }

  // Get approved timestamp for current session
  const getApprovedAtDate = () => {
    if (typeof window !== 'undefined') {
      try {
        const localSessionsStr = localStorage.getItem('corplaw_local_draft_sessions')
        if (localSessionsStr) {
          const localSessions = JSON.parse(localSessionsStr)
          return localSessions[currentSessionId]?.updated_at || undefined
        }
      } catch (e) {
        console.warn('Failed to parse approved sessions:', e)
      }
    }
    return undefined
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
          </style>
        </head>
        <body>
          <div class="print-container ${isStampPaper ? 'stamp-paper-active' : ''}">
            ${letterheadMode === 'digital' && selectedTemplate?.isCorporate !== false ? `
              <div class="digital-letterhead">
                <div class="lh-logo">🏛️ ${formValues.company_name || formValues.party1_name || 'Apex Logistics Private Limited'}</div>
                <div class="lh-details">
                  <strong>CIN:</strong> ${formValues.company_cin || 'Pending'}<br/>
                  <strong>Regd. Office:</strong> ${formValues.registered_address || 'Pending'}<br/>
                  <strong>Email:</strong> compliance@${(formValues.company_name || 'company').toLowerCase().replace(/\s+/g, '')}.com
                </div>
              </div>
            ` : ''}
            <div class="legal-markdown">
              ${parseMarkdownCustomToHtml(aiResponse)}
            </div>
            
            ${approvedSessions[currentSessionId] ? `
              <div style="margin-top: 48px; display: flex; justify-content: flex-end;">
                <div style="border: 2px dashed #10B981; padding: 12px; border-radius: 4px; text-align: center; transform: rotate(-3deg); max-width: 220px; font-family: sans-serif;">
                  <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #10B981; display: flex; align-items: center; justify-content: center; gap: 4px;">
                    <svg style="height: 12px; width: 12px; color: #10B981;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    APPROVED CLIENT COPY
                  </div>
                  <div style="font-size: 8px; color: #64748B; margin-top: 4px;">
                    Verified securely online via link<br />
                    Timestamp: ${getApprovedAtDate() ? new Date(getApprovedAtDate()).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ` : ''}
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
      const blob = await generateDocx(
        aiResponse, 
        companyName, 
        companyCin, 
        selectedTemplate?.isCorporate === false ? 'none' : letterheadMode
      )
      
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
      <div className="bg-brand-slate-blue border-b border-white/10 py-3.5 px-4 flex flex-wrap items-center justify-between gap-4 shadow-md z-10 font-sans">
        <div className="flex items-center gap-4 flex-wrap">
          <a href="/" className="flex items-center gap-2 text-brand-gold hover:text-brand-gold-light transition-colors group">
            <span className="font-serif font-bold text-lg tracking-tight text-white group-hover:text-brand-gold">CorpLaw<span className="text-brand-gold">Updates</span></span>
          </a>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-gold animate-pulse" />
            <span className="font-serif font-bold text-brand-muted text-xs">AI Co-Pilot</span>
          </div>
          
          <select
            value={selectedTemplate.slug}
            onChange={(e) => {
              const matched = templates.find(t => t.slug === e.target.value)
              if (matched) setSelectedTemplate(matched)
            }}
            className="text-xs font-bold border-white/10 focus:border-brand-gold focus:ring-brand-gold rounded-badge py-1.5 px-3 bg-brand-navy text-white focus:outline-none font-sans cursor-pointer"
          >
            {templates.map(t => (
              <option key={t.slug} value={t.slug}>{t.title}</option>
            ))}
          </select>

          {approvedSessions[currentSessionId] && (
            <span className="bg-status-verified/15 text-status-verified border border-status-verified/35 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 font-sans animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-status-verified animate-ping" />
              Approved by Client
            </span>
          )}
        </div>
        
        {/* Dynamic Spacing Overlays and Stamps */}
        <div className="flex items-center gap-4 flex-wrap">
          <LetterheadToggle
            letterheadMode={letterheadMode}
            setLetterheadMode={setLetterheadMode}
            isStampPaper={isStampPaper}
            setIsStampPaper={setIsStampPaper}
            isCorporate={selectedTemplate?.isCorporate !== false}
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
        
        {/* Left Sidebar Pane: Form inputs vs prompt chat vs history */}
        <div className="lg:col-span-4 bg-brand-slate-blue border-r border-white/5 flex flex-col h-full overflow-y-auto">
          
          <div className="flex border-b border-white/5 bg-brand-navy/40 scrollbar-none overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 min-w-[80px] py-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'form' 
                  ? 'border-brand-gold text-brand-gold bg-brand-slate-blue/50'
                  : 'border-transparent text-brand-muted hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline font-sans">Form Editor</span>
              <span className="xs:hidden font-sans">Form</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 min-w-[80px] py-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'chat' 
                  ? 'border-brand-gold text-brand-gold bg-brand-slate-blue/50'
                  : 'border-transparent text-brand-muted hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xs:inline font-sans">Prompt Co-Pilot</span>
              <span className="xs:hidden font-sans">AI</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 min-w-[80px] py-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'history' 
                  ? 'border-brand-gold text-brand-gold bg-brand-slate-blue/50'
                  : 'border-transparent text-brand-muted hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5 shrink-0" />
              <span className="font-sans">Saved & History</span>
            </button>
          </div>

          <div className="p-5 flex-grow space-y-6 font-sans">
            
            {activeTab === 'form' ? (
              /* dynamic input forms matching the template's required variables */
              <div className="space-y-4 font-sans">
                <div className="p-3 bg-brand-navy/60 rounded-badge border border-white/5 mb-2 font-sans text-xs">
                  <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider block mb-1">
                    Statutory Rule Basis
                  </span>
                  <span className="text-white font-semibold flex items-center gap-1.5 leading-tight">
                    <BookOpen className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                    {selectedTemplate.legal_reference}
                  </span>
                </div>

                <div className="p-3 bg-status-warning/5 rounded-badge border border-status-warning/15 font-sans text-[10px] text-brand-muted leading-relaxed">
                  <span className="font-bold text-status-warning block mb-1">⚠️ REGULATORY DISCLAIMER NOTICE</span>
                  This system generates draft reference models. All calculations and text output must be verified with a certified Company Secretary (CS) or advocate before execution.
                </div>

                {selectedTemplate.required_fields.map((field: any) => (
                  <div key={field.key} className="space-y-1.5 border border-transparent p-1 rounded-badge transition-all font-sans">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest block font-sans">
                        {field.label}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeRefineField === field.key) {
                            setActiveRefineField(null)
                          } else {
                            setActiveRefineField(field.key)
                            setRefineCondition('')
                          }
                        }}
                        className="text-[9px] text-brand-gold hover:text-brand-gold-light font-bold flex items-center gap-1 transition-all bg-brand-navy border border-white/10 hover:border-brand-gold/40 px-2 py-0.5 rounded cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3 animate-pulse text-brand-gold shrink-0" />
                        Refine
                      </button>
                    </div>

                    <input
                      type={field.type === 'date' ? 'date' : 'text'}
                      value={formValues[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.hint || `Enter ${field.label.toLowerCase()}`}
                      className="w-full text-xs p-2.5 bg-brand-navy border border-white/10 rounded-badge text-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold focus:outline-none font-sans"
                    />

                    {/* Inline AI Field Refinement Panel */}
                    {activeRefineField === field.key && (
                      <div className="bg-brand-navy/60 border border-brand-gold/25 p-3 rounded-badge mt-2 space-y-2.5 animate-fade-in font-sans">
                        <div className="text-[9px] font-bold text-brand-gold uppercase tracking-wider">
                          AI Field Professional Refiner
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Add 12% annual interest and monthly payments"
                          value={refineCondition}
                          onChange={(e) => setRefineCondition(e.target.value)}
                          className="w-full text-[11px] p-2 bg-brand-navy border border-white/15 rounded text-white focus:outline-none focus:border-brand-gold font-sans"
                        />
                        <button
                          type="button"
                          disabled={refineLoading}
                          onClick={() => handleRefineField(field.key, field.label)}
                          className="w-full py-1.5 bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-[10px] uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1 font-sans cursor-pointer disabled:opacity-50"
                        >
                          {refineLoading ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin shrink-0" />
                              Polishing Clause...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 shrink-0" />
                              AI Polish Field
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : activeTab === 'chat' ? (
              /* Conversation prompts tab */
              <ChatInterface
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                conversationHistory={conversationHistory}
                loading={loading}
                triggerAiCompilation={triggerAiCompilation}
              />
            ) : (
              /* Profiles and History tab */
              <div className="space-y-6 animate-fade-in font-sans">
                
                {/* A. COMPANY PROFILES */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-sans">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5 font-serif">
                      <Building className="h-4 w-4 shrink-0 text-brand-gold" />
                      Company Profiles
                    </h3>
                    <button
                      onClick={() => setShowAddProfileForm(!showAddProfileForm)}
                      className="text-[10px] bg-brand-navy border border-white/10 hover:border-brand-gold/45 text-brand-gold font-bold px-2 py-1 rounded transition-colors font-sans"
                    >
                      {showAddProfileForm ? 'Cancel' : '+ Create'}
                    </button>
                  </div>

                  {showAddProfileForm ? (
                    <form onSubmit={addNewProfile} className="bg-brand-navy/40 p-4 border border-white/5 rounded-badge space-y-3 font-sans">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-gold border-b border-white/5 pb-1 font-sans">
                        New Company Profile
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-semibold text-brand-muted uppercase">Profile Nickname *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Tata/Apex"
                            value={newProfileNick}
                            onChange={(e) => setNewProfileNick(e.target.value)}
                            className="w-full text-[11px] p-2 bg-brand-navy border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold font-sans"
                          />
                        </div>
                        
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-semibold text-brand-muted uppercase">Company Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Full Legal Name"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            className="w-full text-[11px] p-2 bg-brand-navy border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-brand-muted uppercase">Company CIN</label>
                          <input
                            type="text"
                            placeholder="21-char CIN"
                            value={newProfileCin}
                            onChange={(e) => setNewProfileCin(e.target.value)}
                            className="w-full text-[11px] p-2 bg-brand-navy border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-brand-muted uppercase">Company PAN</label>
                          <input
                            type="text"
                            placeholder="10-char PAN"
                            value={newProfilePan}
                            onChange={(e) => setNewProfilePan(e.target.value)}
                            className="w-full text-[11px] p-2 bg-brand-navy border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold font-sans"
                          />
                        </div>
                        
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] font-semibold text-brand-muted uppercase">Registered Office Address</label>
                          <textarea
                            placeholder="Full Registered Address"
                            value={newProfileAddress}
                            onChange={(e) => setNewProfileAddress(e.target.value)}
                            rows={2}
                            className="w-full text-[11px] p-2 bg-brand-navy border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold resize-none font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-brand-muted uppercase">Director Name</label>
                          <input
                            type="text"
                            placeholder="Authorized Signatory"
                            value={newProfileDirector}
                            onChange={(e) => setNewProfileDirector(e.target.value)}
                            className="w-full text-[11px] p-2 bg-brand-navy border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-brand-muted uppercase">Director DIN</label>
                          <input
                            type="text"
                            placeholder="8-digit DIN"
                            value={newProfileDin}
                            onChange={(e) => setNewProfileDin(e.target.value)}
                            className="w-full text-[11px] p-2 bg-brand-navy border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold font-sans"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs uppercase tracking-wider rounded transition-colors font-sans cursor-pointer"
                      >
                        Save Company Profile
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={saveCurrentAsProfile}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-navy border border-white/10 hover:border-brand-gold/30 hover:bg-brand-navy/60 text-xs font-bold text-white rounded-badge transition-colors font-sans cursor-pointer"
                      >
                        <Save className="h-4 w-4 text-brand-gold shrink-0" />
                        Save Current Form as Profile
                      </button>

                      {profiles.length === 0 ? (
                        <div className="p-4 bg-brand-navy/20 border border-white/5 rounded-badge text-center text-xs text-brand-muted font-sans">
                          No profiles saved yet. Auto-fill legal forms in 1 click by saving your info.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {profiles.map(p => (
                            <div key={p.id} className="p-3 bg-brand-navy/40 border border-white/5 rounded-badge flex justify-between items-start gap-2 group hover:border-brand-gold/20 transition-all font-sans">
                              <div className="min-w-0 flex-grow">
                                <div className="font-bold text-white text-xs truncate leading-snug font-sans">{p.nickname}</div>
                                <div className="text-[10px] text-brand-muted truncate mt-0.5 font-sans">{p.company_name}</div>
                                {p.company_cin && (
                                  <div className="text-[9px] text-brand-muted mt-1 truncate font-sans font-mono">CIN: {p.company_cin}</div>
                                )}
                              </div>
                              <div className="flex gap-1.5 shrink-0 items-center">
                                <button
                                  onClick={() => applyProfile(p)}
                                  className="text-[9px] font-bold uppercase bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-brand-navy px-2.5 py-1 rounded transition-all font-sans cursor-pointer"
                                >
                                  Apply
                                </button>
                                <button
                                  onClick={() => deleteProfile(p.id)}
                                  className="text-brand-muted hover:text-status-failed p-1 transition-colors cursor-pointer"
                                  title="Delete profile"
                                >
                                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* B. DOCUMENT DRAFT HISTORY */}
                <div className="space-y-3 border-t border-white/5 pt-5">
                  <div className="flex items-center justify-between font-sans">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5 font-serif">
                      <History className="h-4 w-4 shrink-0 text-brand-gold" />
                      Draft History
                    </h3>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-[9px] text-brand-muted hover:text-white font-semibold transition-colors font-sans cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="p-4 bg-brand-navy/20 border border-white/5 rounded-badge text-center text-xs text-brand-muted font-sans">
                      No recently generated documents found.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {history.map((item, idx) => {
                        const isApproved = approvedSessions[item.sessionId]
                        return (
                          <button
                            key={idx}
                            onClick={() => loadHistoryItem(item)}
                            className="w-full p-3 bg-brand-navy/40 border border-white/5 rounded-badge text-left flex justify-between items-start gap-2 hover:border-brand-gold/30 hover:bg-brand-navy/20 group transition-all font-sans cursor-pointer"
                          >
                            <div className="min-w-0 flex-grow">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white text-xs truncate leading-snug group-hover:text-brand-gold transition-colors font-sans max-w-[170px]">
                                  {item.title}
                                </span>
                                {isApproved && (
                                  <span className="bg-status-verified/15 text-status-verified border border-status-verified/25 text-[8px] font-bold uppercase tracking-wider px-1 rounded-sm flex items-center font-sans">
                                    Approved
                                  </span>
                                )}
                              </div>
                              <div className="text-[9px] text-brand-muted mt-1 font-sans">
                                {new Date(item.timestamp).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-brand-muted group-hover:text-brand-gold shrink-0 mt-0.5 transition-colors" />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>
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
            isCorporate={selectedTemplate?.isCorporate !== false}
            isApproved={!!approvedSessions[currentSessionId]}
            approvedAt={getApprovedAtDate()}
          />
        </div>

      </div>

      {/* Share approvals overlay modals */}
      {showShareModal && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-slate-blue rounded-card border border-white/10 p-6 max-w-md w-full shadow-2xl space-y-4 text-white font-sans">
            <div className="flex justify-between items-start">
              <h3 className="font-serif font-bold text-lg text-brand-gold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-status-verified shrink-0" />
                Approval Link Ready!
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-brand-muted hover:text-white"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>
            
            <p className="text-xs text-brand-muted leading-relaxed font-sans">
              WhatsApp this read-only review link directly to your clients or corporate board directors. They can inspect the draft, suggest adjustments, and approve in 1 click!
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-grow text-xs p-2.5 bg-brand-navy border border-white/10 rounded-badge text-brand-muted focus:outline-none font-sans"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareLink)
                  showToast('Link Copied to Clipboard!', 'success')
                }}
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light px-4 rounded-badge text-xs font-bold transition-colors font-sans cursor-pointer"
              >
                Copy
              </button>
            </div>

            <button
              onClick={() => {
                const docTitle = selectedTemplate?.title || 'Custom AI Legal Draft'
                const name = formValues.company_name || formValues.party1_name || 'your company'
                const message = `Hello, please review the drafted copy of "${docTitle}" prepared for ${name}. You can inspect and approve it directly via this secure link: ${shareLink}`
                const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
                window.open(waUrl, '_blank')
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs uppercase tracking-wider rounded-badge transition-colors shadow-md shadow-[#25D366]/10 font-sans cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.472 5.353 1.473 5.4 0 9.795-4.386 9.798-9.774.001-2.61-1.01-5.063-2.846-6.904C17.062 2.11 14.611.992 12.012 1c-5.4 0-9.8 4.386-9.803 9.775a9.67 9.67 0 0 0 1.54 5.163l-.99 3.61 3.733-.974z"/>
              </svg>
              Share via WhatsApp
            </button>
            
          </div>
        </div>
      )}

    </div>
  )
}
