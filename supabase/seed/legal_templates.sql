-- supabase/seed/legal_templates.sql
-- Seed pre-verified corporate and commercial templates

INSERT INTO legal_templates (slug, category, title, description, body, required_fields, search_tags, statutory_basis, verified_by_name, verified_by_reg, verified_on) VALUES
  (
    'board_resolution_bank_account',
    'Board Resolutions',
    'Board Resolution for Opening Current Bank Account',
    'Authorize singular or joint operators to open and operate corporate bank accounts.',
    '# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {company_name} HELD ON {meeting_date} AT THE REGISTERED OFFICE OF THE COMPANY AT {registered_address}.

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
**(Signature of Chairperson)**',
    '[
      {"key": "company_name", "label": "Company Name", "type": "text"},
      {"key": "company_cin", "label": "Company CIN", "type": "text"},
      {"key": "company_pan", "label": "Company PAN", "type": "text"},
      {"key": "registered_address", "label": "Registered Office Address", "type": "text"},
      {"key": "bank_name", "label": "Bank Name", "type": "text"},
      {"key": "bank_branch", "label": "Bank Branch", "type": "text"},
      {"key": "meeting_date", "label": "Meeting Date", "type": "date"},
      {"key": "chairperson_name", "label": "Chairperson Name", "type": "text"},
      {"key": "director_name", "label": "Authorized Director Name", "type": "text"},
      {"key": "director_din", "label": "Director DIN", "type": "text"}
    ]'::jsonb,
    '{"bank account", "current account", "HDFC", "ICICI", "signing authority", "authorize signatory", "Section 179"}',
    'Section 179(3)(d), Companies Act 2013 read with Secretarial Standard-1 (SS-1)',
    'CS Ravi Kumar',
    'ICSI Membership No. A12345',
    '2026-05-25'
  ),
  (
    'board_resolution_auditor_appointment',
    'Board Resolutions',
    'Board Resolution for Appointment of First Statutory Auditor',
    'Appoint the first statutory auditor of the company within 30 days of incorporation.',
    '# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {company_name} HELD ON {meeting_date} AT THE REGISTERED OFFICE OF THE COMPANY AT {registered_address}.

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
**DIN:** [Insert Chairperson DIN]',
    '[
      {"key": "company_name", "label": "Company Name", "type": "text"},
      {"key": "company_cin", "label": "Company CIN", "type": "text"},
      {"key": "registered_address", "label": "Registered Office Address", "type": "text"},
      {"key": "auditor_name", "label": "Auditor/Firm Name", "type": "text"},
      {"key": "auditor_frn", "label": "Firm Registration Number (FRN)", "type": "text"},
      {"key": "meeting_date", "label": "Meeting Date", "type": "date"},
      {"key": "chairperson_name", "label": "Chairperson Name", "type": "text"}
    ]'::jsonb,
    '{"auditor", "appointment", "Section 139", "first auditor", "ADT-1", "statutory auditor"}',
    'Section 139(6), Companies Act 2013 read with Rule 4, Companies (Audit and Auditors) Rules, 2014',
    'CS Ravi Kumar',
    'ICSI Membership No. A12345',
    '2026-05-25'
  ),
  (
    'board_resolution_director_appointment',
    'Board Resolutions',
    'Board Resolution for Appointment of Additional Director',
    'Co-opt an additional director on the board to hold office until the next AGM.',
    '# CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF {company_name} HELD ON {meeting_date} AT THE REGISTERED OFFICE OF THE COMPANY AT {registered_address}.

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
**DIN:** [Insert Chairperson DIN]',
    '[
      {"key": "company_name", "label": "Company Name", "type": "text"},
      {"key": "company_cin", "label": "Company CIN", "type": "text"},
      {"key": "registered_address", "label": "Registered Office Address", "type": "text"},
      {"key": "appointee_name", "label": "New Director Name", "type": "text"},
      {"key": "appointee_din", "label": "New Director DIN", "type": "text"},
      {"key": "meeting_date", "label": "Meeting Date", "type": "date"},
      {"key": "chairperson_name", "label": "Chairperson Name", "type": "text"}
    ]'::jsonb,
    '{"director", "appointment", "Section 161", "DIR-12", "DIR-2", "additional director"}',
    'Section 161(1), Companies Act 2013 read with Rule 8, Companies (Appointment and Qualification of Directors) Rules, 2014',
    'CS Ravi Kumar',
    'ICSI Membership No. A12345',
    '2026-05-25'
  ),
  (
    'mutual_nda_agreement',
    'Agreements',
    'Mutual Non-Disclosure Agreement (NDA)',
    'Establish confidentiality safeguards and mutual personal data protection parameters.',
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
The receiving party agrees to hold the disclosing party''s Confidential Information in strict trust and shall not disclose it to any third party without prior written consent. The receiving party shall restrict access to employees on a strict "need-to-know" basis.

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
   **Signature:** ______________',
    '[
      {"key": "party1_name", "label": "First Party Name (Company)", "type": "text"},
      {"key": "party1_address", "label": "First Party Address", "type": "text"},
      {"key": "party2_name", "label": "Second Party Name (Company/Ind)", "type": "text"},
      {"key": "party2_address", "label": "Second Party Address", "type": "text"},
      {"key": "agreement_date", "label": "Agreement Date", "type": "date"},
      {"key": "state_jurisdiction", "label": "State Jurisdiction", "type": "text"}
    ]'::jsonb,
    '{"NDA", "confidentiality", "personal data", "DPDP Act", "non disclosure", "Indian Contract Act"}',
    'Section 10 of the Indian Contract Act, 1872 read with Section 8 of the Digital Personal Data Protection Act, 2023',
    'CS Ravi Kumar',
    'ICSI Membership No. A12345',
    '2026-05-25'
  )
ON CONFLICT (slug) DO NOTHING;
