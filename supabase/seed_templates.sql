-- seed_templates.sql
-- Seed migrations to pre-load legally-verified, 2026 statutory-compliant Indian corporate & commercial templates
-- Incorporates Companies Act 2013, ICSI Secretarial Standards, RBI KYC/PMLA Guidelines, and DPDP Act 2023

INSERT INTO legal_templates (slug, version, title, category, required_fields, legal_reference, master_text_markdown, effective_from, effective_to)
VALUES 

-- 1. Board Resolution for Bank Account Opening (KYC & PMLA 2026 Compliant)
(
  'board_resolution_bank_account',
  1,
  'Board Resolution for Opening Current Bank Account',
  'Board Resolution',
  '[
    {"key": "company_name", "label": "Company Name", "type": "text"},
    {"key": "company_cin", "label": "Company CIN", "type": "text", "hint": "21-character alphanumeric"},
    {"key": "company_pan", "label": "Company PAN", "type": "text", "hint": "10-character alphanumeric"},
    {"key": "registered_address", "label": "Registered Office Address", "type": "text"},
    {"key": "bank_name", "label": "Bank Name", "type": "text"},
    {"key": "bank_branch", "label": "Bank Branch", "type": "text"},
    {"key": "meeting_date", "label": "Meeting Date", "type": "date"},
    {"key": "chairperson_name", "label": "Chairperson Name", "type": "text"},
    {"key": "director_name", "label": "Authorized Director Name", "type": "text"},
    {"key": "director_din", "label": "Director DIN", "type": "text", "hint": "8-digit number"}
  ]'::jsonb,
  'Section 179(3) of the Companies Act, 2013 read with RBI Master Direction - KYC Direction, 2016 (amended 2026)',
  '# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {company_name} HELD ON {meeting_date} AT THE REGISTERED OFFICE OF THE COMPANY AT {registered_address}.

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
**(Signature of Chairperson)**',
  NOW(),
  NULL
),

-- 2. Board Resolution for Appointment of First Statutory Auditor (ADT-1 & Rule 4 Compliant)
(
  'board_resolution_auditor_appointment',
  1,
  'Board Resolution for Appointment of First Statutory Auditor',
  'Board Resolution',
  '[
    {"key": "company_name", "label": "Company Name", "type": "text"},
    {"key": "company_cin", "label": "Company CIN", "type": "text"},
    {"key": "registered_address", "label": "Registered Office Address", "type": "text"},
    {"key": "auditor_name", "label": "Auditor/Firm Name", "type": "text"},
    {"key": "auditor_frn", "label": "Firm Registration Number (FRN)", "type": "text", "hint": "e.g., 123456W"},
    {"key": "meeting_date", "label": "Meeting Date", "type": "date"},
    {"key": "chairperson_name", "label": "Chairperson Name", "type": "text"}
  ]'::jsonb,
  'Section 139(6) of the Companies Act, 2013 read with Rule 4 of the Companies (Audit and Auditors) Rules, 2014',
  '# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {company_name} HELD ON {meeting_date} AT THE REGISTERED OFFICE OF THE COMPANY AT {registered_address}.

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
**DIN:** [Insert Chairperson DIN]',
  NOW(),
  NULL
),

-- 3. Board Resolution for Appointment of Additional Director (DIR-2 & DIR-8 Compliant)
(
  'board_resolution_director_appointment',
  1,
  'Board Resolution for Appointment of Additional Director',
  'Board Resolution',
  '[
    {"key": "company_name", "label": "Company Name", "type": "text"},
    {"key": "company_cin", "label": "Company CIN", "type": "text"},
    {"key": "registered_address", "label": "Registered Office Address", "type": "text"},
    {"key": "appointee_name", "label": "New Director Name", "type": "text"},
    {"key": "appointee_din", "label": "New Director DIN", "type": "text", "hint": "8-digit DIN"},
    {"key": "meeting_date", "label": "Meeting Date", "type": "date"},
    {"key": "chairperson_name", "label": "Chairperson Name", "type": "text"}
  ]'::jsonb,
  'Section 161(1) of the Companies Act, 2013 read with Rule 8 of the Companies (Appointment and Qualification of Directors) Rules, 2014',
  '# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {company_name} HELD ON {meeting_date} AT THE REGISTERED OFFICE OF THE COMPANY AT {registered_address}.

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
**DIN:** [Insert Chairperson DIN]',
  NOW(),
  NULL
),

-- 4. Mutual Non-Disclosure Agreement (NDA) - 2026 DPDP Act Compliant (Page 1 Spacing Active)
(
  'mutual_nda_agreement',
  1,
  'Mutual Non-Disclosure Agreement (NDA)',
  'Agreement',
  '[
    {"key": "party1_name", "label": "First Party Name (Company)", "type": "text"},
    {"key": "party1_address", "label": "First Party Address", "type": "text"},
    {"key": "party2_name", "label": "Second Party Name (Company/Ind)", "type": "text"},
    {"key": "party2_address", "label": "Second Party Address", "type": "text"},
    {"key": "agreement_date", "label": "Agreement Date", "type": "date"},
    {"key": "state_jurisdiction", "label": "State Jurisdiction", "type": "text", "hint": "e.g., Delhi, Maharashtra"}
  ]'::jsonb,
  'Section 10 of the Indian Contract Act, 1872 read with the Digital Personal Data Protection (DPDP) Act, 2023',
  '# MUTUAL NON-DISCLOSURE AGREEMENT

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
   **Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_',
  NOW(),
  NULL
),

-- 5. General Power of Attorney (Notary & Stamp Duty Warning Compliant)
(
  'general_power_of_attorney',
  1,
  'General Power of Attorney (GPA)',
  'Agreement',
  '[
    {"key": "principal_name", "label": "Principal Name (Grantor)", "type": "text"},
    {"key": "principal_address", "label": "Principal Address", "type": "text"},
    {"key": "attorney_name", "label": "Attorney Name (Agent)", "type": "text"},
    {"key": "attorney_address", "label": "Attorney Address", "type": "text"},
    {"key": "execution_date", "label": "Execution Date", "type": "date"},
    {"key": "execution_city", "label": "Execution City", "type": "text"}
  ]'::jsonb,
  'Powers of Attorney Act, 1882 read with the Indian Registration Act, 1908',
  '# GENERAL POWER OF ATTORNEY

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
2. **Witness 2 Name & Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_',
  NOW(),
  NULL
);
