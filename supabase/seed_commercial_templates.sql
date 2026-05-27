-- ═══════════════════════════════════════════════════════════════════════
-- SEED: Commercial Contracts & Company Drafts Templates
-- Run this in Supabase SQL Editor → paste and Execute
-- ═══════════════════════════════════════════════════════════════════════
-- 5 Templates:
--   1. Mutual Non-Disclosure Agreement (NDA) — commercial_contracts
--   2. Service Level Agreement (SLA) — commercial_contracts
--   3. Joint Venture Agreement — commercial_contracts
--   4. Share Transfer Deed — company_drafts
--   5. Board Resolution for Alteration of MOA — company_drafts
-- ═══════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════
-- STEP 1: Update the category CHECK constraint to allow new categories
-- ═══════════════════════════════════════════════════════════════════════
ALTER TABLE document_templates
  DROP CONSTRAINT IF EXISTS document_templates_category_check;

ALTER TABLE document_templates
  ADD CONSTRAINT document_templates_category_check
  CHECK (category IN (
    'board_resolution',
    'shareholders_meeting',
    'agreements',
    'appointments',
    'mca_forms',
    'notices',
    'commercial_contracts',
    'company_drafts'
  ));

-- ─────────────────────────────────────────────
-- 1. MUTUAL NON-DISCLOSURE AGREEMENT (NDA)
-- ─────────────────────────────────────────────
INSERT INTO document_templates (
  name, slug, description, category,
  template_content, fields, regulation_reference,
  source, last_verified, ai_system_prompt,
  is_active, is_free, usage_count, display_order, tags
) VALUES (
  'Mutual Non-Disclosure Agreement (NDA)',
  'mutual-nda',
  'Standard mutual NDA for protecting confidential business information between two corporate parties. Covers pre-deal discussions, JV talks, and vendor engagements.',
  'commercial_contracts',

  -- template_content
  E'MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Mutual Non-Disclosure Agreement ("Agreement") is entered into on {{EFFECTIVE_DATE}} ("Effective Date")\n\nBETWEEN:\n\n1. {{PARTY_A_NAME}}, a company incorporated under the laws of India, having its registered office at {{PARTY_A_ADDRESS}} (hereinafter referred to as "Party A", which expression shall include its successors and permitted assigns);\n\nAND\n\n2. {{PARTY_B_NAME}}, a company incorporated under the laws of India, having its registered office at {{PARTY_B_ADDRESS}} (hereinafter referred to as "Party B", which expression shall include its successors and permitted assigns);\n\n(Party A and Party B are hereinafter individually referred to as a "Party" and collectively as the "Parties")\n\nWHEREAS:\n\nA. The Parties wish to explore a potential business relationship regarding {{PURPOSE_OF_DISCLOSURE}} ("Purpose").\n\nB. In connection with the Purpose, each Party may disclose to the other certain confidential and proprietary information.\n\nC. The Parties wish to protect such confidential information and define the terms under which it may be disclosed.\n\nNOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:\n\n1. DEFINITION OF CONFIDENTIAL INFORMATION\n\n1.1 "Confidential Information" means any and all information or data, whether in written, oral, electronic or visual form, that has been or may hereafter be disclosed by either Party ("Disclosing Party") to the other Party ("Receiving Party"), including but not limited to:\n\n(a) business plans, strategies, forecasts, and financial information;\n(b) trade secrets, know-how, inventions, processes, and techniques;\n(c) customer and supplier lists, pricing information, and marketing plans;\n(d) technical data, designs, drawings, specifications, and software;\n(e) any information marked as "Confidential", "Proprietary" or with similar legend;\n(f) any information that, by its nature, a reasonable person would consider confidential.\n\n1.2 Confidential Information shall not include information that:\n\n(a) is or becomes publicly available through no fault of the Receiving Party;\n(b) was already known to the Receiving Party prior to disclosure, as evidenced by written records;\n(c) is independently developed by the Receiving Party without use of the Confidential Information;\n(d) is lawfully obtained from a third party without restriction on disclosure;\n(e) is required to be disclosed by law, regulation, or court order, provided the Receiving Party gives prompt written notice to the Disclosing Party.\n\n2. OBLIGATIONS OF THE RECEIVING PARTY\n\n2.1 The Receiving Party shall:\n\n(a) hold the Confidential Information in strict confidence and not disclose it to any third party without the prior written consent of the Disclosing Party;\n(b) use the Confidential Information solely for the Purpose;\n(c) limit access to Confidential Information to those employees, officers, directors, advisors and consultants ("Representatives") who have a need to know and who are bound by confidentiality obligations no less restrictive than those contained herein;\n(d) exercise at least the same degree of care to protect the Confidential Information as it uses to protect its own confidential information of like kind, but in no event less than reasonable care;\n(e) promptly notify the Disclosing Party of any unauthorized use or disclosure of Confidential Information.\n\n3. TERM AND SURVIVAL\n\n3.1 This Agreement shall remain in effect for a period of {{CONFIDENTIALITY_PERIOD}} from the Effective Date ("Term"), unless terminated earlier by either Party upon thirty (30) days prior written notice to the other Party.\n\n3.2 The obligations of confidentiality under this Agreement shall survive the termination or expiration of this Agreement for a period of three (3) years from the date of termination or expiration.\n\n4. RETURN OF CONFIDENTIAL INFORMATION\n\n4.1 Upon written request by the Disclosing Party, or upon termination or expiration of this Agreement, the Receiving Party shall promptly:\n\n(a) return all tangible materials containing Confidential Information;\n(b) destroy all copies, extracts, or reproductions of Confidential Information in any form;\n(c) provide written certification of such return or destruction.\n\n4.2 Notwithstanding the foregoing, the Receiving Party may retain one (1) copy of the Confidential Information in its legal files solely for the purpose of monitoring compliance with this Agreement.\n\n5. REMEDIES\n\n5.1 The Parties acknowledge that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages would be inadequate.\n\n5.2 In addition to any other remedies available at law or in equity, the Disclosing Party shall be entitled to seek injunctive relief, specific performance, or other equitable remedies without the necessity of proving actual damages or posting a bond.\n\n6. NO LICENSE OR WARRANTY\n\n6.1 Nothing in this Agreement grants any license or right to the Receiving Party in or to the Confidential Information, except the limited right to use it for the Purpose.\n\n6.2 All Confidential Information is provided "AS IS" without any warranty, express or implied, as to its accuracy or completeness.\n\n7. NO OBLIGATION\n\n7.1 This Agreement does not obligate either Party to enter into any further agreement or transaction. Either Party may terminate discussions at any time without liability.\n\n8. GENERAL PROVISIONS\n\n8.1 Governing Law: This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes arising out of this Agreement shall be subject to the exclusive jurisdiction of the courts at {{GOVERNING_STATE}}.\n\n8.2 Entire Agreement: This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, and agreements.\n\n8.3 Amendment: This Agreement may not be amended or modified except by a written instrument signed by both Parties.\n\n8.4 Assignment: Neither Party may assign this Agreement without the prior written consent of the other Party.\n\n8.5 Severability: If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.\n\n8.6 Notices: All notices under this Agreement shall be in writing and shall be deemed given when delivered personally, sent by registered post, or sent by email with confirmation of receipt.\n\nIN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.\n\n\nFor and on behalf of {{PARTY_A_NAME}}\n\nSignature: ____________________________\nName: ________________________________\nDesignation: __________________________\nDate: ________________________________\n\n\nFor and on behalf of {{PARTY_B_NAME}}\n\nSignature: ____________________________\nName: ________________________________\nDesignation: __________________________\nDate: ________________________________\n\n\nWITNESSES:\n\n1. Name: ____________________________\n   Address: __________________________\n   Signature: ________________________\n\n2. Name: ____________________________\n   Address: __________________________\n   Signature: ________________________',

  -- fields (JSON array)
  '[
    {"id":"PARTY_A_NAME","label":"Party A — Company Name","type":"text","placeholder":"e.g. ABC Technologies Pvt Ltd","required":true,"help_text":"Full legal name of the first company"},
    {"id":"PARTY_A_ADDRESS","label":"Party A — Registered Office Address","type":"textarea","placeholder":"Full registered office address","required":true,"help_text":"As per MCA records"},
    {"id":"PARTY_B_NAME","label":"Party B — Company Name","type":"text","placeholder":"e.g. XYZ Solutions Ltd","required":true,"help_text":"Full legal name of the second company"},
    {"id":"PARTY_B_ADDRESS","label":"Party B — Registered Office Address","type":"textarea","placeholder":"Full registered office address","required":true,"help_text":"As per MCA records"},
    {"id":"PURPOSE_OF_DISCLOSURE","label":"Purpose of Disclosure","type":"textarea","placeholder":"e.g. Evaluation of a potential strategic partnership for cloud services","required":true,"help_text":"Briefly describe the business purpose for sharing confidential information"},
    {"id":"CONFIDENTIALITY_PERIOD","label":"Confidentiality Period","type":"select","required":true,"options":["1 (One) year","2 (Two) years","3 (Three) years","5 (Five) years"],"help_text":"How long the NDA remains in effect"},
    {"id":"GOVERNING_STATE","label":"Governing Jurisdiction","type":"text","placeholder":"e.g. Mumbai, Maharashtra","required":true,"help_text":"City/State where disputes will be adjudicated"},
    {"id":"EFFECTIVE_DATE","label":"Effective Date","type":"date","required":true,"help_text":"Date from which the NDA comes into force"}
  ]'::jsonb,

  'Indian Contract Act 1872 s.27 (Restraint of Trade), Information Technology Act 2000 s.72 (Breach of Confidentiality)',
  'ICSI Professional Programme — Drafting, Appearances & Pleadings',
  '2026-05-27',

  -- ai_system_prompt
  'You are a senior Company Secretary and corporate legal expert specializing in Indian commercial law. Generate a Mutual Non-Disclosure Agreement that:
1. Complies with Indian Contract Act 1872, specifically Section 27 regarding restraint of trade
2. Uses professional legal language appropriate for corporate parties
3. Includes comprehensive definition of Confidential Information covering both tangible and intangible forms
4. Contains proper exclusions clause (public domain, prior knowledge, independent development)
5. Specifies clear obligations for the Receiving Party including need-to-know basis and standard of care
6. Includes return/destruction of information provisions
7. Contains injunctive relief and equitable remedies clause
8. Adds proper governing law and jurisdiction clause
9. Includes witness attestation section
10. Do NOT include any individual/personal clauses — this is purely corporate
Output only the final document text, no commentary.',

  true, true, 0, 70,
  ARRAY['nda','non-disclosure','confidentiality','commercial contract','mutual nda','trade secret']
);


-- ─────────────────────────────────────────────
-- 2. SERVICE LEVEL AGREEMENT (SLA)
-- ─────────────────────────────────────────────
INSERT INTO document_templates (
  name, slug, description, category,
  template_content, fields, regulation_reference,
  source, last_verified, ai_system_prompt,
  is_active, is_free, usage_count, display_order, tags
) VALUES (
  'Service Level Agreement (SLA)',
  'service-level-agreement',
  'Comprehensive SLA for outsourced services, IT contracts, and vendor management. Includes performance metrics, penalties, escalation matrix, and data protection clauses.',
  'commercial_contracts',

  -- template_content
  E'SERVICE LEVEL AGREEMENT\n\nThis Service Level Agreement ("Agreement" or "SLA") is entered into on {{EFFECTIVE_DATE}} ("Effective Date")\n\nBETWEEN:\n\n1. {{CLIENT_NAME}}, a company incorporated under the Companies Act, 2013, having CIN {{CLIENT_CIN}}, with its registered office at {{CLIENT_ADDRESS}} (hereinafter referred to as the "Client", which expression shall include its successors and permitted assigns);\n\nAND\n\n2. {{PROVIDER_NAME}}, a company incorporated under the Companies Act, 2013, having its registered office at {{PROVIDER_ADDRESS}} (hereinafter referred to as the "Service Provider", which expression shall include its successors and permitted assigns);\n\n(The Client and the Service Provider are hereinafter individually referred to as a "Party" and collectively as the "Parties")\n\nWHEREAS:\n\nA. The Client desires to engage the Service Provider to provide certain services as described herein.\n\nB. The Service Provider has the expertise, resources, and capability to provide such services.\n\nC. The Parties wish to set forth the terms and conditions governing the provision of such services, including performance standards, metrics, and remedies.\n\nNOW, THEREFORE, in consideration of the mutual covenants herein, the Parties agree as follows:\n\n1. DEFINITIONS\n\n1.1 "Services" means the services described in Schedule A attached hereto.\n1.2 "Service Levels" means the performance standards set forth in Schedule B.\n1.3 "Service Credits" means the credits or penalties payable by the Service Provider for failure to meet Service Levels, as set forth in Schedule B.\n1.4 "Downtime" means any period during which the Services are unavailable or materially degraded.\n1.5 "Response Time" means the time between the Client reporting an incident and the Service Provider acknowledging the incident.\n1.6 "Resolution Time" means the time between the Client reporting an incident and the Service Provider resolving the incident.\n\n2. SCOPE OF SERVICES\n\n2.1 The Service Provider shall provide the following services to the Client:\n\n{{SERVICE_DESCRIPTION}}\n\n2.2 The Service Provider shall perform the Services in a professional and workmanlike manner, using personnel with the requisite skills, experience, and qualifications.\n\n2.3 The Service Provider shall comply with all applicable laws, regulations, and industry standards in the performance of the Services.\n\n3. SERVICE LEVELS AND PERFORMANCE METRICS\n\n3.1 The Service Provider shall meet or exceed the following performance metrics:\n\n{{PERFORMANCE_METRICS}}\n\n3.2 The Service Provider shall provide monthly performance reports to the Client detailing actual performance against the agreed Service Levels.\n\n3.3 If the Service Provider fails to meet any Service Level for two (2) or more consecutive months, the Client shall be entitled to the Service Credits specified in this Agreement.\n\n4. SERVICE CREDITS AND PENALTIES\n\n4.1 In the event the Service Provider fails to meet the agreed Service Levels, the following penalties shall apply:\n\n(a) For each percentage point below the agreed uptime/performance target: {{PENALTY_RATE}} of the monthly service fee shall be credited to the Client.\n(b) Maximum aggregate Service Credits in any calendar month shall not exceed 30% of the monthly service fee.\n\n4.2 Service Credits shall be applied as a credit against the next monthly invoice.\n\n4.3 Service Credits are the Client''s sole and exclusive remedy for the Service Provider''s failure to meet Service Levels, unless such failure constitutes a material breach of this Agreement.\n\n5. TERM AND TERMINATION\n\n5.1 This Agreement shall commence on the Effective Date and shall continue for a period of {{CONTRACT_DURATION}} ("Initial Term"), unless terminated earlier in accordance with this Agreement.\n\n5.2 Either Party may terminate this Agreement:\n(a) For cause, upon thirty (30) days written notice if the other Party materially breaches this Agreement and fails to cure such breach within the notice period;\n(b) For convenience, upon ninety (90) days prior written notice;\n(c) Immediately, if the other Party becomes insolvent, files for bankruptcy, or enters liquidation.\n\n5.3 Upon termination, the Service Provider shall:\n(a) Provide reasonable transition assistance for a period of sixty (60) days;\n(b) Return all Client data and materials;\n(c) Destroy all copies of Client Confidential Information.\n\n6. PAYMENT TERMS\n\n6.1 The Client shall pay the Service Provider as follows:\n\n{{PAYMENT_TERMS}}\n\n6.2 All invoices shall be payable within thirty (30) days of receipt.\n\n6.3 All amounts are exclusive of applicable Goods and Services Tax (GST), which shall be charged additionally as per prevailing rates.\n\n7. DATA PROTECTION AND SECURITY\n\n7.1 The Service Provider shall implement and maintain appropriate technical and organizational measures to protect the Client''s data against unauthorized or unlawful processing and against accidental loss, destruction, or damage.\n\n7.2 The Service Provider shall comply with the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.\n\n7.3 The Service Provider shall not transfer Client data outside India without the prior written consent of the Client.\n\n7.4 The Service Provider shall promptly notify the Client of any data security breach and cooperate fully in the investigation and remediation thereof.\n\n8. CONFIDENTIALITY\n\n8.1 Each Party shall maintain the confidentiality of all Confidential Information received from the other Party and shall not disclose such information to any third party without prior written consent.\n\n8.2 The obligations of confidentiality shall survive the termination of this Agreement for a period of three (3) years.\n\n9. INDEMNIFICATION\n\n9.1 The Service Provider shall indemnify, defend, and hold harmless the Client from and against any claims, damages, losses, and expenses arising out of:\n(a) any breach of this Agreement by the Service Provider;\n(b) any negligent or wrongful act or omission of the Service Provider;\n(c) any violation of applicable law by the Service Provider;\n(d) any infringement of third-party intellectual property rights.\n\n10. LIMITATION OF LIABILITY\n\n10.1 Neither Party''s aggregate liability under this Agreement shall exceed the total fees paid or payable during the twelve (12) months preceding the event giving rise to liability.\n\n10.2 Neither Party shall be liable for any indirect, incidental, special, consequential, or punitive damages.\n\n11. FORCE MAJEURE\n\n11.1 Neither Party shall be liable for any failure or delay in performance due to causes beyond its reasonable control, including but not limited to acts of God, war, terrorism, pandemic, government action, or natural disaster.\n\n11.2 The affected Party shall promptly notify the other Party and use reasonable efforts to mitigate the effects of the force majeure event.\n\n12. ESCALATION MATRIX\n\n12.1 Any disputes or issues shall be escalated as follows:\nLevel 1: Project Manager level — resolution within 5 business days\nLevel 2: Department Head level — resolution within 10 business days\nLevel 3: CXO / Director level — resolution within 15 business days\nLevel 4: Mediation / Arbitration as per Clause 13\n\n13. DISPUTE RESOLUTION\n\n13.1 Any dispute arising out of this Agreement shall first be attempted to be resolved through good faith negotiations.\n\n13.2 If negotiations fail, the dispute shall be referred to arbitration under the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted by a sole arbitrator mutually appointed by the Parties, in {{GOVERNING_STATE}}, in the English language.\n\n14. GOVERNING LAW\n\n14.1 This Agreement shall be governed by and construed in accordance with the laws of India.\n\n14.2 The courts at {{GOVERNING_STATE}} shall have exclusive jurisdiction.\n\n15. GENERAL PROVISIONS\n\n15.1 Entire Agreement: This Agreement constitutes the entire agreement between the Parties.\n15.2 Amendment: No amendment shall be effective unless in writing signed by both Parties.\n15.3 Waiver: No waiver of any term shall constitute a continuing waiver.\n15.4 Severability: Invalid provisions shall be severed without affecting remaining provisions.\n15.5 Assignment: Neither Party may assign without prior written consent.\n15.6 Notices: All notices shall be in writing via registered post or email with acknowledgment.\n\nIN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.\n\n\nFor and on behalf of {{CLIENT_NAME}}\n\nSignature: ____________________________\nName: ________________________________\nDesignation: __________________________\nDate: ________________________________\n\n\nFor and on behalf of {{PROVIDER_NAME}}\n\nSignature: ____________________________\nName: ________________________________\nDesignation: __________________________\nDate: ________________________________\n\n\nWITNESSES:\n\n1. Name: ____________________________\n   Address: __________________________\n   Signature: ________________________\n\n2. Name: ____________________________\n   Address: __________________________\n   Signature: ________________________',

  -- fields (JSON array)
  '[
    {"id":"CLIENT_NAME","label":"Client — Company Name","type":"text","placeholder":"e.g. Reliance Industries Ltd","required":true,"help_text":"Full legal name of the client company"},
    {"id":"CLIENT_CIN","label":"Client — CIN","type":"text","placeholder":"e.g. L17110MH1973PLC019786","required":false,"help_text":"Corporate Identification Number from MCA"},
    {"id":"CLIENT_ADDRESS","label":"Client — Registered Office Address","type":"textarea","placeholder":"Full registered office address","required":true},
    {"id":"PROVIDER_NAME","label":"Service Provider — Company Name","type":"text","placeholder":"e.g. TCS Ltd","required":true,"help_text":"Full legal name of the service provider"},
    {"id":"PROVIDER_ADDRESS","label":"Service Provider — Registered Office Address","type":"textarea","placeholder":"Full registered office address","required":true},
    {"id":"SERVICE_DESCRIPTION","label":"Description of Services","type":"textarea","placeholder":"Describe the services to be provided in detail","required":true,"help_text":"Be specific — e.g. IT infrastructure management, payroll processing, etc."},
    {"id":"PERFORMANCE_METRICS","label":"Performance Metrics / KPIs","type":"textarea","placeholder":"e.g. 99.9% uptime, <2 hour response time for P1 incidents","required":true,"help_text":"Define measurable targets the provider must meet"},
    {"id":"PENALTY_RATE","label":"Penalty Rate (per % point below target)","type":"text","placeholder":"e.g. 2%","required":true,"help_text":"Percentage of monthly fee credited for each point below target"},
    {"id":"CONTRACT_DURATION","label":"Contract Duration","type":"select","required":true,"options":["1 (One) year","2 (Two) years","3 (Three) years","5 (Five) years"]},
    {"id":"PAYMENT_TERMS","label":"Payment Terms","type":"textarea","placeholder":"e.g. Monthly retainer of ₹5,00,000 + GST, payable within 30 days of invoice","required":true,"help_text":"Include amount, frequency, and payment window"},
    {"id":"GOVERNING_STATE","label":"Governing Jurisdiction","type":"text","placeholder":"e.g. Mumbai, Maharashtra","required":true},
    {"id":"EFFECTIVE_DATE","label":"Effective Date","type":"date","required":true}
  ]'::jsonb,

  'Indian Contract Act 1872 s.73-75 (Compensation for breach), IT Act 2000 s.43A (Data Protection), Arbitration & Conciliation Act 1996',
  'ICSI Professional Programme — Company Law Practice, IICA Commercial Contracts',
  '2026-05-27',

  -- ai_system_prompt
  'You are a senior Company Secretary and commercial law expert in India. Generate a Service Level Agreement that:
1. Complies with Indian Contract Act 1872, particularly Sections 73-75 on breach compensation
2. Includes comprehensive service description with measurable KPIs
3. Contains clear penalty/service credit mechanism tied to performance
4. Includes data protection clauses compliant with IT Act 2000 and SPDI Rules 2011
5. Has structured escalation matrix (L1-L4)
6. Contains indemnification and limitation of liability clauses
7. Includes force majeure provisions
8. Specifies arbitration under Arbitration and Conciliation Act 1996
9. Addresses transition and exit management
10. Uses professional corporate legal language throughout
Output only the final document text, no commentary.',

  true, true, 0, 71,
  ARRAY['sla','service level','vendor agreement','outsourcing','performance metrics','it contract']
);


-- ─────────────────────────────────────────────
-- 3. JOINT VENTURE AGREEMENT
-- ─────────────────────────────────────────────
INSERT INTO document_templates (
  name, slug, description, category,
  template_content, fields, regulation_reference,
  source, last_verified, ai_system_prompt,
  is_active, is_free, usage_count, display_order, tags
) VALUES (
  'Joint Venture Agreement',
  'joint-venture-agreement',
  'Comprehensive JV agreement for corporate partnerships and strategic alliances. Covers capital contribution, profit sharing, board composition, deadlock resolution, and exit mechanisms.',
  'commercial_contracts',

  -- template_content
  E'JOINT VENTURE AGREEMENT\n\nThis Joint Venture Agreement ("Agreement") is entered into on {{EFFECTIVE_DATE}} ("Effective Date")\n\nBETWEEN:\n\n1. {{PARTY_A_NAME}}, a company incorporated under the Companies Act, 2013, having CIN {{PARTY_A_CIN}}, with its registered office at {{PARTY_A_ADDRESS}} (hereinafter referred to as "Party A" or "First Venturer", which expression shall include its successors and permitted assigns);\n\nAND\n\n2. {{PARTY_B_NAME}}, a company incorporated under the Companies Act, 2013, having CIN {{PARTY_B_CIN}}, with its registered office at {{PARTY_B_ADDRESS}} (hereinafter referred to as "Party B" or "Second Venturer", which expression shall include its successors and permitted assigns);\n\n(Party A and Party B are hereinafter individually referred to as a "Party" or "Venturer" and collectively as the "Parties" or "Venturers")\n\nWHEREAS:\n\nA. Party A is engaged in the business of {{PARTY_A_BUSINESS}} and possesses expertise, resources, and capabilities relevant to the proposed joint venture.\n\nB. Party B is engaged in the business of {{PARTY_B_BUSINESS}} and possesses complementary expertise, resources, and capabilities.\n\nC. The Parties wish to establish a joint venture for the purpose of {{JV_PURPOSE}} ("Purpose") and desire to set forth the terms and conditions governing their relationship.\n\nNOW, THEREFORE, in consideration of the mutual covenants and agreements herein, the Parties agree as follows:\n\n1. FORMATION OF JOINT VENTURE ENTITY\n\n1.1 The Parties shall incorporate a private limited company under the Companies Act, 2013 with the name "{{JV_ENTITY_NAME}}" or such other name as may be approved by the Central Registration Centre ("JV Company").\n\n1.2 The registered office of the JV Company shall be at {{JV_REGISTERED_OFFICE}}.\n\n1.3 The authorized share capital of the JV Company shall be ₹{{AUTHORIZED_CAPITAL}} (Rupees {{AUTHORIZED_CAPITAL_WORDS}} only).\n\n2. CAPITAL CONTRIBUTION\n\n2.1 The initial paid-up share capital of the JV Company shall be subscribed as follows:\n\n(a) Party A: ₹{{CAPITAL_A}} (Rupees {{CAPITAL_A_WORDS}} only), representing {{SHAREHOLDING_A}} of the total paid-up share capital;\n\n(b) Party B: ₹{{CAPITAL_B}} (Rupees {{CAPITAL_B_WORDS}} only), representing {{SHAREHOLDING_B}} of the total paid-up share capital.\n\n2.2 Additional capital requirements shall be contributed by the Parties in proportion to their respective shareholding percentages, unless otherwise agreed in writing.\n\n2.3 Neither Party shall dilute or transfer its shareholding without the prior written consent of the other Party and compliance with the right of first refusal provisions set forth herein.\n\n3. MANAGEMENT AND BOARD COMPOSITION\n\n3.1 The Board of Directors of the JV Company shall comprise {{BOARD_COMPOSITION}}.\n\n3.2 Party A shall have the right to nominate the Managing Director / CEO for the first {{INITIAL_TERM}} of operations.\n\n3.3 Party B shall have the right to nominate the Chief Financial Officer.\n\n3.4 The Chairperson shall be nominated by {{CHAIRMAN_NOMINATOR}} and shall have a casting vote in the event of a tie.\n\n3.5 The following matters shall require the unanimous consent of all directors nominated by both Parties ("Reserved Matters"):\n(a) Amendment of the MOA or AOA of the JV Company;\n(b) Issue of new shares or securities;\n(c) Borrowings exceeding ₹{{BORROWING_LIMIT}};\n(d) Appointment or removal of key management personnel;\n(e) Any related party transaction;\n(f) Merger, amalgamation, or restructuring;\n(g) Voluntary winding up or dissolution;\n(h) Any change in the nature of business.\n\n4. PROFIT SHARING AND DIVIDENDS\n\n4.1 Profits and losses of the JV Company shall be shared between the Parties in the ratio of {{PROFIT_SHARING_RATIO}} (Party A : Party B).\n\n4.2 The JV Company shall distribute dividends at least once in each financial year, subject to availability of distributable profits and compliance with the Companies Act, 2013.\n\n4.3 The dividend distribution policy shall be approved by the Board with the consent of directors nominated by both Parties.\n\n5. NON-COMPETE AND NON-SOLICITATION\n\n5.1 During the term of this Agreement and for a period of two (2) years following its termination, neither Party shall, directly or indirectly:\n(a) engage in any business that competes with the JV Company within India;\n(b) solicit or hire any employee of the JV Company or the other Party.\n\n5.2 This clause shall be enforceable to the extent permitted under Section 27 of the Indian Contract Act, 1872.\n\n6. INTELLECTUAL PROPERTY\n\n6.1 Each Party shall retain ownership of its pre-existing intellectual property ("Background IP").\n\n6.2 Any intellectual property created by or for the JV Company during the term of this Agreement ("Foreground IP") shall be owned by the JV Company.\n\n6.3 Each Party grants the JV Company a non-exclusive, royalty-free license to use its Background IP solely for the Purpose.\n\n7. DEADLOCK RESOLUTION\n\n7.1 In the event of a deadlock at the Board level on any Reserved Matter, the following mechanism shall apply:\n\n(a) Step 1: The matter shall be escalated to the CEO/MD of each Party for resolution within fifteen (15) days;\n(b) Step 2: If unresolved, the matter shall be referred to mediation by a mutually agreed mediator within thirty (30) days;\n(c) Step 3: If mediation fails, either Party may initiate the buy-out procedure under Clause 8.\n\n8. EXIT MECHANISM AND RIGHT OF FIRST REFUSAL\n\n8.1 If either Party wishes to sell, transfer, or dispose of its shares in the JV Company, it shall first offer such shares to the other Party ("Right of First Refusal" or "ROFR").\n\n8.2 The offering Party shall provide a written notice specifying the number of shares, proposed price, and terms. The other Party shall have sixty (60) days to accept or decline the offer.\n\n8.3 If the other Party declines, the offering Party may sell to a third party on terms no more favorable than those offered under the ROFR.\n\n8.4 Tag-Along Rights: If either Party sells its shares to a third party, the other Party shall have the right to sell its shares on the same terms.\n\n8.5 Drag-Along Rights: If a Party holding more than 75% of the shares receives a bona fide offer from a third party, it may require the other Party to sell its shares on the same terms.\n\n9. TERM AND TERMINATION\n\n9.1 This Agreement shall commence on the Effective Date and shall continue for a period of {{JV_DURATION}} ("Initial Term"), automatically renewable for successive periods of five (5) years unless terminated.\n\n9.2 This Agreement may be terminated:\n(a) By mutual written consent of both Parties;\n(b) By either Party upon material breach by the other Party that is not cured within sixty (60) days of written notice;\n(c) Upon the insolvency, winding up, or dissolution of either Party;\n(d) Upon the exercise of drag-along or buy-out rights.\n\n9.3 Upon termination, the Parties shall cooperate in the orderly winding up of the JV Company''s affairs.\n\n10. CONFIDENTIALITY\n\n10.1 Each Party shall maintain strict confidentiality of all proprietary and confidential information of the other Party and the JV Company.\n\n10.2 This obligation shall survive termination for a period of five (5) years.\n\n11. REPRESENTATIONS AND WARRANTIES\n\n11.1 Each Party represents and warrants that:\n(a) It is duly incorporated and validly existing under the laws of India;\n(b) It has the corporate power and authority to enter into this Agreement;\n(c) The execution of this Agreement has been duly authorized;\n(d) This Agreement constitutes a valid and binding obligation;\n(e) There is no litigation or proceeding that would materially affect its ability to perform.\n\n12. INDEMNIFICATION\n\n12.1 Each Party shall indemnify the other against any losses arising from breach of this Agreement, negligence, or violation of applicable law.\n\n13. DISPUTE RESOLUTION\n\n13.1 Any dispute shall be resolved through arbitration under the Arbitration and Conciliation Act, 1996, by a panel of three arbitrators (one nominated by each Party, and the third mutually appointed) in {{GOVERNING_STATE}}, in the English language.\n\n14. GOVERNING LAW\n\n14.1 This Agreement shall be governed by and construed in accordance with the laws of India.\n\n15. GENERAL PROVISIONS\n\n15.1 Entire Agreement: This constitutes the entire agreement.\n15.2 Amendment: Only by written instrument signed by both Parties.\n15.3 Severability: Invalid provisions severed without affecting remainder.\n15.4 Notices: In writing via registered post or email with acknowledgment.\n15.5 No Partnership: Nothing herein creates a general partnership.\n\nIN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.\n\n\nFor and on behalf of {{PARTY_A_NAME}}\n\nSignature: ____________________________\nName: ________________________________\nDesignation: __________________________\nDate: ________________________________\n\n\nFor and on behalf of {{PARTY_B_NAME}}\n\nSignature: ____________________________\nName: ________________________________\nDesignation: __________________________\nDate: ________________________________\n\n\nWITNESSES:\n\n1. Name: ____________________________\n   Address: __________________________\n   Signature: ________________________\n\n2. Name: ____________________________\n   Address: __________________________\n   Signature: ________________________',

  -- fields (JSON array)
  '[
    {"id":"PARTY_A_NAME","label":"Party A — Company Name","type":"text","placeholder":"e.g. Tata Sons Pvt Ltd","required":true},
    {"id":"PARTY_A_CIN","label":"Party A — CIN","type":"text","placeholder":"e.g. U74999MH2017PTC123456","required":false,"help_text":"Corporate Identification Number"},
    {"id":"PARTY_A_ADDRESS","label":"Party A — Registered Office","type":"textarea","required":true},
    {"id":"PARTY_A_BUSINESS","label":"Party A — Nature of Business","type":"text","placeholder":"e.g. Information Technology Services","required":true},
    {"id":"PARTY_B_NAME","label":"Party B — Company Name","type":"text","placeholder":"e.g. Infosys Ltd","required":true},
    {"id":"PARTY_B_CIN","label":"Party B — CIN","type":"text","placeholder":"e.g. L85110KA1981PLC013115","required":false},
    {"id":"PARTY_B_ADDRESS","label":"Party B — Registered Office","type":"textarea","required":true},
    {"id":"PARTY_B_BUSINESS","label":"Party B — Nature of Business","type":"text","placeholder":"e.g. Cloud Computing Solutions","required":true},
    {"id":"JV_PURPOSE","label":"Purpose of Joint Venture","type":"textarea","placeholder":"e.g. Development and marketing of AI-based compliance solutions for Indian corporates","required":true,"help_text":"Clearly describe the business objective of the JV"},
    {"id":"JV_ENTITY_NAME","label":"Proposed JV Company Name","type":"text","placeholder":"e.g. TataInfosys AI Solutions Pvt Ltd","required":true},
    {"id":"CAPITAL_A","label":"Party A — Capital Contribution (₹)","type":"text","placeholder":"e.g. 50,00,000","required":true},
    {"id":"SHAREHOLDING_A","label":"Party A — Shareholding %","type":"text","placeholder":"e.g. 51%","required":true},
    {"id":"CAPITAL_B","label":"Party B — Capital Contribution (₹)","type":"text","placeholder":"e.g. 49,00,000","required":true},
    {"id":"SHAREHOLDING_B","label":"Party B — Shareholding %","type":"text","placeholder":"e.g. 49%","required":true},
    {"id":"PROFIT_SHARING_RATIO","label":"Profit Sharing Ratio (A:B)","type":"text","placeholder":"e.g. 51:49","required":true},
    {"id":"BOARD_COMPOSITION","label":"Board Composition","type":"textarea","placeholder":"e.g. 5 directors — 3 nominated by Party A, 2 by Party B","required":true},
    {"id":"JV_DURATION","label":"JV Duration","type":"select","required":true,"options":["5 (Five) years","10 (Ten) years","15 (Fifteen) years","20 (Twenty) years"]},
    {"id":"GOVERNING_STATE","label":"Governing Jurisdiction","type":"text","placeholder":"e.g. New Delhi","required":true},
    {"id":"EFFECTIVE_DATE","label":"Effective Date","type":"date","required":true},
    {"id":"JV_REGISTERED_OFFICE","label":"Proposed Registered Office of JV Company","type":"textarea","required":true,"placeholder":"Full registered office address of the new joint venture entity"},
    {"id":"AUTHORIZED_CAPITAL","label":"Authorized Share Capital of JV (₹)","type":"text","required":true,"placeholder":"e.g. 10,00,000"},
    {"id":"AUTHORIZED_CAPITAL_WORDS","label":"Authorized Capital in Words","type":"text","required":true,"placeholder":"e.g. Ten Lakhs"},
    {"id":"CAPITAL_A_WORDS","label":"Party A Capital in Words","type":"text","required":true,"placeholder":"e.g. Fifty-One Lakhs"},
    {"id":"CAPITAL_B_WORDS","label":"Party B Capital in Words","type":"text","required":true,"placeholder":"e.g. Forty-Nine Lakhs"},
    {"id":"INITIAL_TERM","label":"Initial Term for Nominated CEO/MD (Years)","type":"text","required":true,"placeholder":"e.g. 3"},
    {"id":"CHAIRMAN_NOMINATOR","label":"Party Nominating the Chairperson","type":"text","required":true,"placeholder":"e.g. Party A / Party B / Alternating annually"},
    {"id":"BORROWING_LIMIT","label":"Board Borrowing Consent Limit (₹)","type":"text","required":true,"placeholder":"e.g. 1,00,00,000"}
  ]'::jsonb,

  'Companies Act 2013 s.2(87) (Subsidiary), s.186 (Investment), s.188 (Related Party Transactions), Indian Contract Act 1872, Arbitration & Conciliation Act 1996',
  'ICSI Professional Programme — Company Law Practice, IICA Commercial Contracts',
  '2026-05-27',

  -- ai_system_prompt
  'You are a senior Company Secretary and M&A legal expert specializing in Indian corporate joint ventures. Generate a Joint Venture Agreement that:
1. Complies with Companies Act 2013, especially sections on subsidiary, investment, and RPT
2. Includes detailed capital contribution and shareholding structure
3. Specifies board composition with clear nomination rights
4. Lists comprehensive Reserved Matters requiring unanimous consent
5. Contains profit sharing and dividend distribution policy
6. Includes non-compete clause within limits of Indian Contract Act s.27
7. Has structured deadlock resolution mechanism (escalation → mediation → buyout)
8. Contains ROFR, tag-along, and drag-along rights
9. Addresses IP ownership (Background IP vs Foreground IP)
10. Uses professional corporate legal language appropriate for Indian companies
Output only the final document text, no commentary.',

  true, true, 0, 72,
  ARRAY['joint venture','jv agreement','partnership','strategic alliance','collaboration','shareholder agreement']
);


-- ─────────────────────────────────────────────
-- 4. SHARE TRANSFER DEED
-- ─────────────────────────────────────────────
INSERT INTO document_templates (
  name, slug, description, category,
  template_content, fields, regulation_reference,
  source, last_verified, ai_system_prompt,
  is_active, is_free, usage_count, display_order, tags
) VALUES (
  'Share Transfer Deed (Form SH-4)',
  'share-transfer-deed',
  'Standard share transfer deed as per Companies Act 2013 Section 56 and Form SH-4. Mandatory for transfer of shares in a company. Includes stamp duty declaration and witness attestation.',
  'company_drafts',

  -- template_content
  E'SHARE TRANSFER DEED\n(Pursuant to Section 56 of the Companies Act, 2013 and Rule 11 of the Companies (Share Capital and Debentures) Rules, 2014)\n\nFORM SH-4\n\nDate of Execution: {{TRANSFER_DATE}}\n\nI/We, the undersigned transferor(s) and transferee(s), agree to the following transfer of shares:\n\n═══════════════════════════════════════════════\n                  TRANSFEROR DETAILS\n═══════════════════════════════════════════════\n\nFull Name              : {{TRANSFEROR_NAME}}\nFather''s/Husband''s Name: {{TRANSFEROR_FATHER_NAME}}\nAddress                : {{TRANSFEROR_ADDRESS}}\nOccupation             : {{TRANSFEROR_OCCUPATION}}\nFolio No. / DP ID      : {{TRANSFEROR_FOLIO}}\nClient ID              : {{TRANSFEROR_CLIENT_ID}}\n\n═══════════════════════════════════════════════\n                  TRANSFEREE DETAILS\n═══════════════════════════════════════════════\n\nFull Name              : {{TRANSFEREE_NAME}}\nFather''s/Husband''s Name: {{TRANSFEREE_FATHER_NAME}}\nAddress                : {{TRANSFEREE_ADDRESS}}\nOccupation             : {{TRANSFEREE_OCCUPATION}}\n\n═══════════════════════════════════════════════\n                  COMPANY DETAILS\n═══════════════════════════════════════════════\n\nName of the Company    : {{COMPANY_NAME}}\nCIN                    : {{COMPANY_CIN}}\nRegistered Office      : {{COMPANY_ADDRESS}}\n\n═══════════════════════════════════════════════\n                  SHARE DETAILS\n═══════════════════════════════════════════════\n\nNumber of Shares       : {{NUM_SHARES}}\nClass of Shares        : {{SHARE_CLASS}}\nDistinctive Nos.       : {{DISTINCTIVE_FROM}} to {{DISTINCTIVE_TO}}\nShare Certificate No(s): {{CERTIFICATE_NOS}}\nFace Value per Share   : ₹{{FACE_VALUE}}\nTotal Face Value       : ₹{{TOTAL_FACE_VALUE}}\n\n═══════════════════════════════════════════════\n              CONSIDERATION DETAILS\n═══════════════════════════════════════════════\n\nConsideration Amount   : ₹{{CONSIDERATION}} (Rupees {{CONSIDERATION_WORDS}} only)\nMode of Payment        : {{PAYMENT_MODE}}\n\n═══════════════════════════════════════════════\n\nI/We, {{TRANSFEROR_NAME}} ("Transferor"), do hereby transfer to {{TRANSFEREE_NAME}} ("Transferee"), the above-described shares standing in my/our name in the books of {{COMPANY_NAME}}, subject to the conditions on which I/we held the same at the time of execution hereof.\n\nI/We, {{TRANSFEREE_NAME}} ("Transferee"), do hereby agree to accept and take the said shares subject to the conditions aforesaid.\n\nWe hereby declare that:\n1. The transfer is in accordance with the provisions of the Companies Act, 2013 and the Articles of Association of the Company.\n2. The shares are free from all liens, charges, and encumbrances.\n3. This transfer is made voluntarily and with full knowledge of the terms and conditions.\n4. The consideration mentioned herein is the true and correct consideration for this transfer.\n5. Appropriate stamp duty as per the Indian Stamp Act, 1899 and applicable State stamp laws has been paid on this instrument.\n\nSTAMP DUTY DECLARATION:\nThe stamp duty payable on this transfer deed is ₹{{STAMP_DUTY}} as per the applicable Stamp Act.\n\n\n═══════════════════════════════════════════════\n              TRANSFEROR SIGNATURE\n═══════════════════════════════════════════════\n\nSignature      : ____________________________\nName           : {{TRANSFEROR_NAME}}\nDate           : {{TRANSFER_DATE}}\nPlace          : {{EXECUTION_PLACE}}\n\n\n═══════════════════════════════════════════════\n              TRANSFEREE SIGNATURE\n═══════════════════════════════════════════════\n\nSignature      : ____________________________\nName           : {{TRANSFEREE_NAME}}\nDate           : {{TRANSFER_DATE}}\nPlace          : {{EXECUTION_PLACE}}\n\n\n═══════════════════════════════════════════════\n                    WITNESSES\n═══════════════════════════════════════════════\n\nWitness 1:\nName           : ____________________________\nAddress        : ____________________________\nSignature      : ____________________________\n\nWitness 2:\nName           : ____________________________\nAddress        : ____________________________\nSignature      : ____________________________\n\n\nNOTE: This transfer deed must be presented to the Company within sixty (60) days from the date of execution along with the relevant share certificates for registration of transfer as per Section 56(1) of the Companies Act, 2013.',

  -- fields (JSON array)
  '[
    {"id":"COMPANY_NAME","label":"Company Name","type":"text","placeholder":"e.g. Bajaj Finance Ltd","required":true,"help_text":"Full legal name of the company whose shares are being transferred"},
    {"id":"COMPANY_CIN","label":"Company CIN","type":"text","placeholder":"e.g. L65910MH1987PLC042961","required":true,"help_text":"Corporate Identification Number from MCA portal"},
    {"id":"COMPANY_ADDRESS","label":"Company Registered Office","type":"textarea","required":false},
    {"id":"TRANSFEROR_NAME","label":"Transferor — Full Name","type":"text","placeholder":"Name of person/entity transferring shares","required":true},
    {"id":"TRANSFEROR_FATHER_NAME","label":"Transferor — Father/Husband Name","type":"text","required":false},
    {"id":"TRANSFEROR_ADDRESS","label":"Transferor — Address","type":"textarea","required":true},
    {"id":"TRANSFEROR_OCCUPATION","label":"Transferor — Occupation","type":"text","placeholder":"e.g. Business, Service, Professional","required":false},
    {"id":"TRANSFEROR_FOLIO","label":"Transferor — Folio No. / DP ID","type":"text","placeholder":"e.g. IN300123-10001234","required":false,"help_text":"Demat account DP ID or physical folio number"},
    {"id":"TRANSFEREE_NAME","label":"Transferee — Full Name","type":"text","placeholder":"Name of person/entity receiving shares","required":true},
    {"id":"TRANSFEREE_FATHER_NAME","label":"Transferee — Father/Husband Name","type":"text","required":false},
    {"id":"TRANSFEREE_ADDRESS","label":"Transferee — Address","type":"textarea","required":true},
    {"id":"TRANSFEREE_OCCUPATION","label":"Transferee — Occupation","type":"text","required":false},
    {"id":"NUM_SHARES","label":"Number of Shares","type":"text","placeholder":"e.g. 10000","required":true},
    {"id":"SHARE_CLASS","label":"Class of Shares","type":"select","required":true,"options":["Equity Shares","Preference Shares","Redeemable Preference Shares"]},
    {"id":"DISTINCTIVE_FROM","label":"Distinctive Numbers — From","type":"text","placeholder":"e.g. 00001","required":false,"help_text":"Only for physical shares"},
    {"id":"DISTINCTIVE_TO","label":"Distinctive Numbers — To","type":"text","placeholder":"e.g. 10000","required":false},
    {"id":"CERTIFICATE_NOS","label":"Share Certificate Number(s)","type":"text","placeholder":"e.g. C-001 to C-010","required":false},
    {"id":"FACE_VALUE","label":"Face Value per Share (₹)","type":"text","placeholder":"e.g. 10","required":true},
    {"id":"CONSIDERATION","label":"Total Consideration Amount (₹)","type":"text","placeholder":"e.g. 5,00,000","required":true,"help_text":"Total price paid for the shares"},
    {"id":"PAYMENT_MODE","label":"Mode of Payment","type":"select","required":true,"options":["Cheque","NEFT/RTGS","Demand Draft","Cash (if permissible)","Nil Consideration (Gift)"]},
    {"id":"TRANSFER_DATE","label":"Date of Transfer","type":"date","required":true},
    {"id":"EXECUTION_PLACE","label":"Place of Execution","type":"text","placeholder":"e.g. Mumbai","required":true}
  ]'::jsonb,

  'Companies Act 2013 s.56 (Transfer of Shares), Rule 11 Companies (Share Capital & Debentures) Rules 2014, Indian Stamp Act 1899',
  'ICSI Professional Programme — Company Law Practice',
  '2026-05-27',

  -- ai_system_prompt
  'You are a senior Company Secretary specializing in Indian company law and share transfers. Generate a Share Transfer Deed (Form SH-4) that:
1. Strictly complies with Section 56 of the Companies Act, 2013
2. Follows Rule 11 of Companies (Share Capital and Debentures) Rules, 2014
3. Includes complete transferor and transferee details
4. Specifies share details — number, class, distinctive numbers, face value
5. Contains consideration details with payment mode
6. Includes proper declarations regarding liens, encumbrances, and voluntary transfer
7. Contains stamp duty declaration as per Indian Stamp Act, 1899
8. Includes witness attestation (minimum 2 witnesses)
9. Notes the 60-day filing requirement with the Company
10. Uses formal, legally precise language appropriate for a statutory form
Output only the final document text, no commentary.',

  true, true, 0, 80,
  ARRAY['share transfer','sh-4','transfer deed','equity transfer','shares','company draft']
);


-- ─────────────────────────────────────────────
-- 5. BOARD RESOLUTION FOR ALTERATION OF MOA (OBJECTS CLAUSE)
-- ─────────────────────────────────────────────
INSERT INTO document_templates (
  name, slug, description, category,
  template_content, fields, regulation_reference,
  source, last_verified, ai_system_prompt,
  is_active, is_free, usage_count, display_order, tags
) VALUES (
  'Board Resolution — Alteration of Memorandum of Association (Objects Clause)',
  'board-resolution-alteration-moa',
  'Board resolution for altering the Objects Clause of MOA under Section 13 of Companies Act, 2013. Includes authority for calling EGM, passing Special Resolution, and filing with ROC.',
  'company_drafts',

  -- template_content
  E'CERTIFIED TRUE COPY OF THE RESOLUTION\nPASSED AT THE MEETING OF THE BOARD OF DIRECTORS\nOF {{COMPANY_NAME}}\n\nCIN: {{COMPANY_CIN}}\nRegistered Office: {{REGISTERED_OFFICE}}\n\n═══════════════════════════════════════════════\n\nBoard Meeting No.  : {{BOARD_MEETING_NUMBER}}\nDate               : {{BOARD_MEETING_DATE}}\nTime               : {{MEETING_TIME}}\nVenue              : {{MEETING_VENUE}}\nQuorum             : Present and verified\n\n═══════════════════════════════════════════════\n\nDirectors Present:\n{{DIRECTORS_PRESENT}}\n\nDirectors Absent (Leave of Absence granted):\n{{DIRECTORS_ABSENT}}\n\nIn the Chair: {{CHAIRPERSON_NAME}} (DIN: {{CHAIRPERSON_DIN}})\nCompany Secretary: {{CS_NAME}}\n\n═══════════════════════════════════════════════\n\nRESOLUTION NO. {{RESOLUTION_NUMBER}}\n\nSUBJECT: ALTERATION OF THE OBJECTS CLAUSE OF THE MEMORANDUM OF ASSOCIATION OF THE COMPANY UNDER SECTION 13 OF THE COMPANIES ACT, 2013\n\n═══════════════════════════════════════════════\n\nWHEREAS:\n\n(a) The existing Main Objects Clause (Clause III(A)) of the Memorandum of Association of the Company currently reads as follows:\n\n"{{EXISTING_OBJECTS_CLAUSE}}"\n\n(b) The Board of Directors is of the opinion that it is desirable and in the interest of the Company to alter the Objects Clause of the Memorandum of Association to include additional objects to enable the Company to carry on the following new business activities:\n\n"{{PROPOSED_NEW_OBJECTS}}"\n\n(c) Such alteration requires the approval of the members of the Company by way of a Special Resolution pursuant to Section 13(1) of the Companies Act, 2013.\n\n(d) Upon passing of the Special Resolution, the Company is required to file Form MGT-14 with the Registrar of Companies within thirty (30) days of passing such resolution, as per Section 117(1) of the Companies Act, 2013.\n\n(e) The Company is also required to file Form INC-27 for alteration of the Memorandum of Association, as per Rule 7 of the Companies (Incorporation) Rules, 2014.\n\nNOW, THEREFORE, IT IS HEREBY:\n\nRESOLVED THAT, subject to the approval of the members of the Company by way of a Special Resolution, the Objects Clause (Clause III) of the Memorandum of Association of the Company be and is hereby proposed to be altered by inserting the following as additional main objects:\n\n"{{PROPOSED_NEW_OBJECTS}}"\n\nRESOLVED FURTHER THAT, an Extraordinary General Meeting ("EGM") of the members of the Company be and is hereby convened to be held on {{EGM_DATE}} at {{EGM_TIME}} at {{EGM_VENUE}} for the purpose of considering and, if thought fit, passing the above alteration as a Special Resolution.\n\nRESOLVED FURTHER THAT, the Notice of the EGM, along with the Explanatory Statement under Section 102 of the Companies Act, 2013, be and is hereby approved, and the Company Secretary be and is hereby authorized to issue the same to all the members of the Company in accordance with Section 101 of the Companies Act, 2013.\n\nRESOLVED FURTHER THAT, upon passing of the Special Resolution by the members:\n\n(a) Form MGT-14 be filed with the Registrar of Companies, {{ROC_JURISDICTION}}, within thirty (30) days of passing the Special Resolution, along with the prescribed fees and enclosures;\n\n(b) Form INC-27 for alteration of the Memorandum of Association be filed with the Registrar of Companies within the prescribed time limit;\n\n(c) A copy of the altered Memorandum of Association be printed and kept at the registered office of the Company.\n\nRESOLVED FURTHER THAT, {{AUTHORIZED_PERSON_NAME}}, {{AUTHORIZED_PERSON_DESIGNATION}} of the Company, be and is hereby authorized to do all such acts, deeds, matters, and things as may be considered necessary, proper, or expedient, including signing and filing of all forms, applications, documents, and papers with the Registrar of Companies, Ministry of Corporate Affairs, or any other statutory authority, and to take all necessary steps to give effect to this resolution.\n\nRESOLVED FURTHER THAT, the Common Seal of the Company, if any, be affixed on the altered Memorandum of Association and all related documents, in the presence of {{SEAL_WITNESS_1}} and {{SEAL_WITNESS_2}}, who shall sign the same in token thereof.\n\n═══════════════════════════════════════════════\n\nThe resolution was passed unanimously by all the Directors present.\n\n═══════════════════════════════════════════════\n\nCERTIFIED TRUE COPY\n\nFor and on behalf of {{COMPANY_NAME}}\n\n\nSignature: ____________________________\nName: {{CS_NAME}}\nDesignation: Company Secretary\nMembership No.: {{CS_MEMBERSHIP_NO}}\nDate: {{BOARD_MEETING_DATE}}\nPlace: {{EXECUTION_PLACE}}\n\n\nCountersigned by:\n\nSignature: ____________________________\nName: {{CHAIRPERSON_NAME}}\nDesignation: Chairperson\nDIN: {{CHAIRPERSON_DIN}}\nDate: {{BOARD_MEETING_DATE}}',

  -- fields (JSON array)
  '[
    {"id":"COMPANY_NAME","label":"Company Name","type":"text","placeholder":"e.g. Wipro Technologies Pvt Ltd","required":true},
    {"id":"COMPANY_CIN","label":"Company CIN","type":"text","placeholder":"e.g. U72200KA2000PTC123456","required":true,"help_text":"From MCA portal"},
    {"id":"REGISTERED_OFFICE","label":"Registered Office Address","type":"textarea","required":true},
    {"id":"BOARD_MEETING_NUMBER","label":"Board Meeting Number","type":"text","placeholder":"e.g. 45th","required":true},
    {"id":"BOARD_MEETING_DATE","label":"Board Meeting Date","type":"date","required":true},
    {"id":"MEETING_TIME","label":"Meeting Time","type":"text","placeholder":"e.g. 11:00 AM IST","required":true},
    {"id":"MEETING_VENUE","label":"Meeting Venue","type":"text","placeholder":"e.g. Registered Office of the Company","required":true},
    {"id":"DIRECTORS_PRESENT","label":"Directors Present (with DIN)","type":"textarea","placeholder":"1. Mr. Amit Sharma (DIN: 00112233)\n2. Ms. Priya Gupta (DIN: 00445566)","required":true,"help_text":"List all directors present with their DIN numbers"},
    {"id":"DIRECTORS_ABSENT","label":"Directors Absent","type":"textarea","placeholder":"1. Mr. Rahul Verma (DIN: 00778899) — on leave","required":false},
    {"id":"CHAIRPERSON_NAME","label":"Chairperson Name","type":"text","placeholder":"e.g. Mr. Amit Sharma","required":true},
    {"id":"CHAIRPERSON_DIN","label":"Chairperson DIN","type":"text","placeholder":"e.g. 00112233","required":true},
    {"id":"CS_NAME","label":"Company Secretary Name","type":"text","placeholder":"e.g. CS Neha Joshi","required":true},
    {"id":"CS_MEMBERSHIP_NO","label":"CS Membership Number","type":"text","placeholder":"e.g. ACS 45678","required":true},
    {"id":"RESOLUTION_NUMBER","label":"Resolution Number","type":"text","placeholder":"e.g. BR/2026/45-03","required":true},
    {"id":"EXISTING_OBJECTS_CLAUSE","label":"Existing Objects Clause (Current MOA Text)","type":"textarea","placeholder":"Paste the current main objects from your MOA","required":true,"help_text":"Copy exact text from your current MOA Clause III(A)"},
    {"id":"PROPOSED_NEW_OBJECTS","label":"Proposed New Objects to Add","type":"textarea","placeholder":"e.g. To carry on the business of software-as-a-service (SaaS) platforms for regulatory compliance...","required":true,"help_text":"Describe new business activities to be added to MOA"},
    {"id":"EGM_DATE","label":"Proposed EGM Date","type":"date","required":true,"help_text":"Must be at least 21 clear days from notice date"},
    {"id":"EGM_TIME","label":"Proposed EGM Time","type":"text","placeholder":"e.g. 3:00 PM IST","required":true},
    {"id":"EGM_VENUE","label":"Proposed EGM Venue","type":"text","placeholder":"e.g. Registered Office of the Company","required":true},
    {"id":"ROC_JURISDICTION","label":"ROC Jurisdiction","type":"text","placeholder":"e.g. ROC Mumbai, Maharashtra","required":true,"help_text":"Registrar of Companies jurisdiction for your company"},
    {"id":"AUTHORIZED_PERSON_NAME","label":"Authorized Person Name","type":"text","placeholder":"e.g. CS Neha Joshi","required":true,"help_text":"Person authorized to file forms and execute documents"},
    {"id":"AUTHORIZED_PERSON_DESIGNATION","label":"Authorized Person Designation","type":"text","placeholder":"e.g. Company Secretary","required":true},
    {"id":"EXECUTION_PLACE","label":"Place of Execution","type":"text","placeholder":"e.g. Mumbai","required":true}
  ]'::jsonb,

  'Companies Act 2013 s.13 (Alteration of MOA), s.14 (Alteration of AOA), s.102 (Explanatory Statement), s.117 (Filing of Resolutions), Rule 7 Companies (Incorporation) Rules 2014',
  'ICSI Secretarial Standards SS-1, ICSI Professional Programme',
  '2026-05-27',

  -- ai_system_prompt
  'You are a senior Company Secretary with deep expertise in Indian company law and ICSI Secretarial Standards. Generate a Board Resolution for Alteration of MOA (Objects Clause) that:
1. Strictly complies with Section 13 of the Companies Act, 2013
2. Follows ICSI Secretarial Standard SS-1 for Board Meetings
3. Includes proper recitals explaining the rationale for alteration
4. Authorizes convening of EGM for passing Special Resolution
5. Includes filing requirements — MGT-14 (within 30 days) and INC-27
6. Authorizes a specific person for all filings and execution
7. Includes Common Seal clause (if applicable)
8. Contains proper certification by Company Secretary with membership number
9. Is countersigned by the Chairperson with DIN
10. Uses formal secretarial language as per ICSI standards
Output only the final document text, no commentary.',

  true, true, 0, 81,
  ARRAY['moa alteration','objects clause','board resolution','special resolution','memorandum','company draft','section 13']
);


-- ═══════════════════════════════════════════════════════════════════════
-- VERIFICATION: Count inserted templates
-- ═══════════════════════════════════════════════════════════════════════
SELECT 
  name, 
  slug, 
  category, 
  is_active
FROM document_templates 
WHERE slug IN (
  'mutual-nda',
  'service-level-agreement',
  'joint-venture-agreement',
  'share-transfer-deed',
  'board-resolution-alteration-moa'
)
ORDER BY display_order;
