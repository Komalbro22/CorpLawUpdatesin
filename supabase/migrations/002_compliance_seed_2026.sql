-- =========================================================================
-- CorpLawUpdates Compliance Calendar Seeds for FY 2026-27
-- Adds GST Monthly & Annual filings, Labor Law EPF & ESIC, 
-- TDS Monthly Payments, and MCA LLP Form 11 & LLP Form 8 filings.
-- =========================================================================

-- 1. Insert LLP MCA Annual filings for FY 2025-26 (filing due in CY 2026)
INSERT INTO compliance_entries (
  regulator, 
  form_name, 
  compliance_title, 
  due_date, 
  applicable_to, 
  frequency, 
  penalty, 
  regulation_reference, 
  is_active, 
  is_verified, 
  display_order,
  official_link,
  created_by
) VALUES 
('mca', 'LLP Form 11', 'LLP Annual Return filing for FY 2025-26', '30 May 2026', 'All Registered Limited Liability Partnerships (LLPs) in India', 'annual', '₹100 per day of delay', 'Section 35(11) of LLP Act, 2008', true, true, 10, 'https://www.mca.gov.in', 'admin'),
('mca', 'LLP Form 8', 'LLP Statement of Account & Solvency for FY 2025-26', '30 October 2026', 'All Registered Limited Liability Partnerships (LLPs) in India', 'annual', '₹100 per day of delay', 'Section 34(4) of LLP Act, 2008', true, true, 11, 'https://www.mca.gov.in', 'admin');

-- 2. Insert GST Annual filings for FY 2025-26 (filing due in CY 2026)
INSERT INTO compliance_entries (
  regulator, 
  form_name, 
  compliance_title, 
  due_date, 
  applicable_to, 
  frequency, 
  penalty, 
  regulation_reference, 
  is_active, 
  is_verified, 
  display_order,
  official_link,
  created_by
) VALUES 
('gst', 'GSTR-9', 'GST Annual Return for FY 2025-26', '31 December 2026', 'All registered GST taxpayers (turnover above ₹2 Crore is mandatory)', 'annual', '₹200 per day of delay up to maximum 0.25% of State turnover', 'Section 44 of CGST Act, 2017', true, true, 1, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-9C', 'GST Reconciliation Statement for FY 2025-26', '31 December 2026', 'Registered GST taxpayers with aggregate turnover exceeding ₹5 Crore in FY 2025-26', 'annual', 'General penalty up to ₹50,000 (₹25,000 CGST + ₹25,000 SGST)', 'Section 35(5) and 44(2) of CGST Act, 2017', true, true, 2, 'https://www.gst.gov.in', 'admin');

-- 3. Insert GST Monthly Returns (GSTR-1 Outward Supplies)
INSERT INTO compliance_entries (regulator, form_name, compliance_title, due_date, applicable_to, frequency, penalty, regulation_reference, is_active, is_verified, display_order, official_link, created_by) VALUES
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — April 2026', '11 May 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — May 2026', '11 June 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — June 2026', '11 July 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — July 2026', '11 August 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — August 2026', '11 September 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — September 2026', '11 October 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — October 2026', '11 November 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — November 2026', '11 December 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — December 2026', '11 January 2027', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — January 2027', '11 February 2027', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — February 2027', '11 March 2027', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-1', 'GSTR-1 Monthly Return of Outward Supplies — March 2027', '11 April 2027', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) up to ₹5,000', 'Section 37 of CGST Act, 2017', true, true, 10, 'https://www.gst.gov.in', 'admin');

-- 4. Insert GST Monthly Summary Returns & Payments (GSTR-3B)
INSERT INTO compliance_entries (regulator, form_name, compliance_title, due_date, applicable_to, frequency, penalty, regulation_reference, is_active, is_verified, display_order, official_link, created_by) VALUES
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — April 2026', '20 May 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — May 2026', '20 June 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — June 2026', '20 July 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — July 2026', '20 August 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — August 2026', '20 September 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — September 2026', '20 October 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — October 2026', '20 November 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — November 2026', '20 December 2026', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — December 2026', '20 January 2027', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — January 2027', '20 February 2027', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — February 2027', '20 March 2027', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B', 'GSTR-3B Monthly Return & Tax Payment — March 2027', '20 April 2027', 'Registered taxpayers with turnover > ₹5 Crore or monthly filers', 'monthly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 20, 'https://www.gst.gov.in', 'admin');

-- 5. Insert GST Quarterly Return (GSTR-3B under QRMP)
INSERT INTO compliance_entries (regulator, form_name, compliance_title, due_date, applicable_to, frequency, penalty, regulation_reference, is_active, is_verified, display_order, official_link, created_by) VALUES
('gst', 'GSTR-3B (QRMP)', 'GSTR-3B Quarterly Return & Payment — Q1 (Apr-Jun 2026)', '22 July 2026', 'Registered taxpayers under QRMP scheme (turnover up to ₹5 Crore) - Category A States', 'quarterly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 30, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B (QRMP)', 'GSTR-3B Quarterly Return & Payment — Q2 (Jul-Sep 2026)', '22 October 2026', 'Registered taxpayers under QRMP scheme (turnover up to ₹5 Crore) - Category A States', 'quarterly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 30, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B (QRMP)', 'GSTR-3B Quarterly Return & Payment — Q3 (Oct-Dec 2026)', '22 January 2027', 'Registered taxpayers under QRMP scheme (turnover up to ₹5 Crore) - Category A States', 'quarterly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 30, 'https://www.gst.gov.in', 'admin'),
('gst', 'GSTR-3B (QRMP)', 'GSTR-3B Quarterly Return & Payment — Q4 (Jan-Mar 2027)', '22 April 2027', 'Registered taxpayers under QRMP scheme (turnover up to ₹5 Crore) - Category A States', 'quarterly', '₹50 per day (₹20 for Nil return) + 18% p.a. interest on net tax liability', 'Section 39 of CGST Act, 2017', true, true, 30, 'https://www.gst.gov.in', 'admin');

-- 6. Insert GST CMP-08 Quarterly Challan (Composition Scheme)
INSERT INTO compliance_entries (regulator, form_name, compliance_title, due_date, applicable_to, frequency, penalty, regulation_reference, is_active, is_verified, display_order, official_link, created_by) VALUES
('gst', 'CMP-08', 'CMP-08 Quarterly Statement & Tax Payment — Q1 (Apr-Jun 2026)', '18 July 2026', 'Registered composition taxpayers under GST', 'quarterly', 'Interest at 18% p.a. for late tax payment', 'Rule 62(1)(ii) of CGST Rules, 2017', true, true, 40, 'https://www.gst.gov.in', 'admin'),
('gst', 'CMP-08', 'CMP-08 Quarterly Statement & Tax Payment — Q2 (Jul-Sep 2026)', '18 October 2026', 'Registered composition taxpayers under GST', 'quarterly', 'Interest at 18% p.a. for late tax payment', 'Rule 62(1)(ii) of CGST Rules, 2017', true, true, 40, 'https://www.gst.gov.in', 'admin'),
('gst', 'CMP-08', 'CMP-08 Quarterly Statement & Tax Payment — Q3 (Oct-Dec 2026)', '18 January 2027', 'Registered composition taxpayers under GST', 'quarterly', 'Interest at 18% p.a. for late tax payment', 'Rule 62(1)(ii) of CGST Rules, 2017', true, true, 40, 'https://www.gst.gov.in', 'admin'),
('gst', 'CMP-08', 'CMP-08 Quarterly Statement & Tax Payment — Q4 (Jan-Mar 2027)', '18 April 2027', 'Registered composition taxpayers under GST', 'quarterly', 'Interest at 18% p.a. for late tax payment', 'Rule 62(1)(ii) of CGST Rules, 2017', true, true, 40, 'https://www.gst.gov.in', 'admin');

-- 7. Insert PF & ESIC Monthly Returns & Contributions
INSERT INTO compliance_entries (regulator, form_name, compliance_title, due_date, applicable_to, frequency, penalty, regulation_reference, is_active, is_verified, display_order, official_link, created_by) VALUES
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — April 2026', '15 May 2026', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — May 2026', '15 June 2026', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — June 2026', '15 July 2026', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — July 2026', '15 August 2026', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — August 2026', '15 September 2026', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — September 2026', '15 October 2026', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — October 2026', '15 November 2026', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — November 2026', '15 December 2026', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — December 2026', '15 January 2027', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — January 2027', '15 February 2027', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — February 2027', '15 March 2027', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin'),
('labor_law', 'EPF & ESIC ECR', 'Monthly EPF Return Filing & ECR Deposit — March 2027', '15 April 2027', 'All establishments with 20+ employees (PF) and 10+ employees (ESIC)', 'monthly', 'PF: 12% p.a. interest (Sec 7Q) + damages (Sec 14B) up to 25%; ESIC: 12% p.a. interest', 'EPF Act, 1952 & ESI Act, 1948', true, true, 10, 'https://www.epfindia.gov.in', 'admin');

-- 8. Insert TDS Monthly Payments
INSERT INTO compliance_entries (regulator, form_name, compliance_title, due_date, applicable_to, frequency, penalty, regulation_reference, is_active, is_verified, display_order, official_link, created_by) VALUES
('income_tax', 'Challan 281', 'TDS Monthly Deposit — April 2026', '7 May 2026', 'All deductors who deducted TDS during April 2026', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — May 2026', '7 June 2026', 'All deductors who deducted TDS during May 2026', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — June 2026', '7 July 2026', 'All deductors who deducted TDS during June 2026', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — July 2026', '7 August 2026', 'All deductors who deducted TDS during July 2026', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — August 2026', '7 September 2026', 'All deductors who deducted TDS during August 2026', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — September 2026', '7 October 2026', 'All deductors who deducted TDS during September 2026', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — October 2026', '7 November 2026', 'All deductors who deducted TDS during October 2026', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — November 2026', '7 December 2026', 'All deductors who deducted TDS during November 2026', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — December 2026', '7 January 2027', 'All deductors who deducted TDS during December 2026', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — January 2027', '7 February 2027', 'All deductors who deducted TDS during January 2027', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — February 2027', '7 March 2027', 'All deductors who deducted TDS during February 2027', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin'),
('income_tax', 'Challan 281', 'TDS Monthly Deposit — March 2027', '30 April 2027', 'All deductors who deducted TDS during March 2027', 'monthly', '1.5% interest per month for late payment from the date of deduction', 'Section 200 of Income Tax Act, 1961', true, true, 15, 'https://www.incometax.gov.in', 'admin');
