-- supabase/seed/legal_templates.sql
-- Seed pre-verified corporate and commercial templates (Week 2 Expanded Bundle)

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
  ),
  (
    'moa_private_limited',
    'Agreements',
    'Memorandum of Association (MOA)',
    'The standard Memorandum of Association (MOA) under Table A of the Companies Act.',
    '# MEMORANDUM OF ASSOCIATION OF {company_name} PRIVATE LIMITED

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
**Place:** {state_jurisdiction}',
    '[
      {"key": "company_name", "label": "Company Name", "type": "text"},
      {"key": "state_jurisdiction", "label": "State of Registered Office", "type": "text"},
      {"key": "business_domain", "label": "Primary Business Domain", "type": "text", "hint": "e.g., Logistics, IT Development, Solar Energy"},
      {"key": "authorized_capital", "label": "Authorized Capital (INR)", "type": "number"},
      {"key": "number_of_shares", "label": "Total Number of Equity Shares", "type": "number"},
      {"key": "nominal_value_per_share", "label": "Nominal Value Per Share (INR)", "type": "number"},
      {"key": "subscriber1_name", "label": "First Subscriber Name", "type": "text"},
      {"key": "subscriber1_din", "label": "First Subscriber DIN", "type": "text"},
      {"key": "subscriber1_address", "label": "First Subscriber Address", "type": "text"},
      {"key": "subscriber1_shares", "label": "First Subscriber Share Count", "type": "number"},
      {"key": "subscriber2_name", "label": "Second Subscriber Name", "type": "text"},
      {"key": "subscriber2_din", "label": "Second Subscriber DIN", "type": "text"},
      {"key": "subscriber2_address", "label": "Second Subscriber Address", "type": "text"},
      {"key": "subscriber2_shares", "label": "Second Subscriber Share Count", "type": "number"},
      {"key": "meeting_date", "label": "Execution Date", "type": "date"}
    ]'::jsonb,
    '{"MOA", "memorandum", "Table A", "incorporation", "object clause", "share capital", "Schedule I"}',
    'Section 4 of the Companies Act, 2013 read with Table A of Schedule I',
    'CS Ravi Kumar',
    'ICSI Membership No. A12345',
    '2026-05-25'
  ),
  (
    'llp_agreement',
    'Agreements',
    'LLP Agreement',
    'The standard Limited Liability Partnership (LLP) Agreement under Section 23 of the LLP Act.',
    '# LIMITED LIABILITY PARTNERSHIP AGREEMENT

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
2. **Witness 2 Name & Signature:** ____________________',
    '[
      {"key": "llp_name", "label": "LLP Name", "type": "text"},
      {"key": "registered_address", "label": "Registered Office Address", "type": "text"},
      {"key": "state_jurisdiction", "label": "State of Registration", "type": "text"},
      {"key": "business_domain", "label": "Business Domain", "type": "text"},
      {"key": "partner1_name", "label": "First Partner Name", "type": "text"},
      {"key": "partner1_dpin", "label": "First Partner DPIN", "type": "text"},
      {"key": "partner1_address", "label": "First Partner Address", "type": "text"},
      {"key": "partner1_capital", "label": "First Partner Contribution (INR)", "type": "number"},
      {"key": "partner1_share_percentage", "label": "First Partner Profit Share (%)", "type": "number"},
      {"key": "partner2_name", "label": "Second Partner Name", "type": "text"},
      {"key": "partner2_dpin", "label": "Second Partner DPIN", "type": "text"},
      {"key": "partner2_address", "label": "Second Partner Address", "type": "text"},
      {"key": "partner2_capital", "label": "Second Partner Contribution (INR)", "type": "number"},
      {"key": "partner2_share_percentage", "label": "Second Partner Profit Share (%)", "type": "number"},
      {"key": "bank_operation_mode", "label": "Bank Account Operating Mode", "type": "text", "hint": "singly / jointly"},
      {"key": "agreement_date", "label": "Agreement Execution Date", "type": "date"},
      {"key": "execution_city", "label": "Execution City", "type": "text"}
    ]'::jsonb,
    '{"LLP Agreement", "Designated Partners", "DPIN", "LLP Act", "partnership", "contribution"}',
    'Section 23 of the Limited Liability Partnership Act, 2008',
    'CS Ravi Kumar',
    'ICSI Membership No. A12345',
    '2026-05-25'
  ),
  (
    'employment_agreement',
    'Agreements',
    'Employment Agreement',
    'Executive Employment Agreement outlining designations, probationary limits, CTC, and notices.',
    '# EXECUTIVE EMPLOYMENT AGREEMENT

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
2. **Witness 2 Name & Signature:** ____________________',
    '[
      {"key": "employer_name", "label": "Employer Company Name", "type": "text"},
      {"key": "employer_address", "label": "Employer Registered Office Address", "type": "text"},
      {"key": "employee_name", "label": "Employee Name", "type": "text"},
      {"key": "employee_address", "label": "Employee Residential Address", "type": "text"},
      {"key": "employee_designation", "label": "Job Title / Designation", "type": "text"},
      {"key": "joining_date", "label": "Date of Joining", "type": "date"},
      {"key": "annual_ctc", "label": "Annual CTC (INR)", "type": "number"},
      {"key": "probation_months", "label": "Probation Period (Months)", "type": "number"},
      {"key": "notice_days", "label": "Notice Period (Days)", "type": "number"},
      {"key": "execution_date", "label": "Execution Date", "type": "date"}
    ]'::jsonb,
    '{"employment contract", "offer letter", "Notice Period", "Probation", "salary", "CTC", "Intellectual Property"}',
    'Section 10 of the Indian Contract Act, 1872',
    'CS Ravi Kumar',
    'ICSI Membership No. A12345',
    '2026-05-25'
  ),
  (
    'share_transfer_deed_sh4',
    'Agreements',
    'Share Transfer Deed (Form SH-4)',
    'Statutory share transfer deed (Form SH-4) under Section 56 of the Companies Act, 2013.',
    '# FORM NO. SH-4 - SHARE TRANSFER DEED

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
* **Father''s/Spouse Name:** {transferee_father_name}
* **Address:** {transferee_address}
* **PAN Number:** {transferee_pan}
* **Signature of Transferee:** [Signed]

---

**Attested by:**  
**(Signature of Witness)**  
**Name of Witness:** ____________________  
**Address:** ___________________________',
    '[
      {"key": "company_name", "label": "Company Name", "type": "text"},
      {"key": "company_cin", "label": "Company CIN", "type": "text"},
      {"key": "nominal_value_per_share", "label": "Nominal Value Per Share (INR)", "type": "number"},
      {"key": "number_of_shares", "label": "Number of Shares Transferred", "type": "number"},
      {"key": "consideration_amount", "label": "Consideration Amount (INR)", "type": "number"},
      {"key": "consideration_in_words", "label": "Consideration In Words", "type": "text"},
      {"key": "distinctive_number_from", "label": "Distinctive Number From", "type": "text"},
      {"key": "distinctive_number_to", "label": "Distinctive Number To", "type": "text"},
      {"key": "transferor_name", "label": "Transferor (Seller) Name", "type": "text"},
      {"key": "transferor_folio", "label": "Transferor Folio Number", "type": "text"},
      {"key": "transferee_name", "label": "Transferee (Buyer) Name", "type": "text"},
      {"key": "transferee_father_name", "label": "Transferee Father/Spouse Name", "type": "text"},
      {"key": "transferee_address", "label": "Transferee Residential Address", "type": "text"},
      {"key": "transferee_pan", "label": "Transferee PAN", "type": "text"},
      {"key": "execution_date", "label": "Execution Date", "type": "date"}
    ]'::jsonb,
    '{"SH-4", "SH4", "share transfer", "transfer deed", "Section 56", "equity shares", "folio"}',
    'Section 56, Companies Act 2013 read with Rule 11 of Companies (Share Capital and Debentures) Rules, 2014',
    'CS Ravi Kumar',
    'ICSI Membership No. A12345',
    '2026-05-25'
  ),
  (
    'agm_notice',
    'Agreements',
    'AGM Notice',
    'Statutory Notice of Annual General Meeting (AGM) along with agendas and proxy notes.',
    '# NOTICE OF THE ANNUAL GENERAL MEETING

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
1. A MEMBER ENTITLED TO ATTEND AND VOTE IS ENTITLED TO APPOINT A PROXY TO ATTEND AND VOTE ON A POLL INSTEAD OF HIMSELF AND A PROXY NEED NOT BE A MEMBER OF THE COMPANY. The instrument appointing the proxy (Form MGT-11) must be deposited at the registered office of the Company at least 48 hours before the meeting.',
    '[
      {"key": "company_name", "label": "Company Name", "type": "text"},
      {"key": "agm_number", "label": "AGM Number", "type": "text", "hint": "e.g., 1st, 2nd, 5th"},
      {"key": "meeting_date", "label": "AGM Meeting Date", "type": "date"},
      {"key": "meeting_time", "label": "AGM Meeting Time", "type": "text", "hint": "e.g., 11:00 AM"},
      {"key": "registered_address", "label": "Registered Office Address", "type": "text"},
      {"key": "financial_year", "label": "Financial Year Ending", "type": "number", "hint": "e.g., 2025"},
      {"key": "auditor_name", "label": "Auditor/Firm Name", "type": "text"},
      {"key": "auditor_frn", "label": "Firm Registration Number (FRN)", "type": "text"},
      {"key": "director_name", "label": "Additional Director Name", "type": "text"},
      {"key": "director_din", "label": "Additional Director DIN", "type": "text"},
      {"key": "chairperson_name", "label": "Chairperson Name", "type": "text"},
      {"key": "state_jurisdiction", "label": "Place / City", "type": "text"},
      {"key": "notice_date", "label": "Notice Issue Date", "type": "date"}
    ]'::jsonb,
    '{"AGM Notice", "Annual General Meeting", "MGT-11", "Section 101", "auditors", "directors", "Secretarial Standard"}',
    'Section 101 of the Companies Act, 2013 read with Secretarial Standard-2 (SS-2)',
    'CS Ravi Kumar',
    'ICSI Membership No. A12345',
    '2026-05-25'
  )
ON CONFLICT (slug) DO NOTHING;
