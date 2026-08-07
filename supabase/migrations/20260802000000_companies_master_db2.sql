-- Enable pg_trgm extension for fuzzy company name searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Create companies_master table in DB2
CREATE TABLE IF NOT EXISTS public.companies_master (
    cin TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    date_of_registration DATE,
    company_status TEXT DEFAULT 'Active',
    company_class TEXT,
    company_category TEXT,
    company_subcategory TEXT,
    authorised_capital BIGINT DEFAULT 0,
    paid_up_capital BIGINT DEFAULT 0,
    registered_state TEXT,
    roc_office TEXT,
    registered_address TEXT,
    principal_business_activity TEXT,
    directors JSONB DEFAULT '[]'::jsonb,
    charges JSONB DEFAULT '[]'::jsonb,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_manually_corrected BOOLEAN DEFAULT false,
    corrected_by TEXT,
    corrected_at TIMESTAMPTZ,
    views_count INT DEFAULT 0,
    pdf_downloads_count INT DEFAULT 0
);

-- Indexes for companies_master
CREATE INDEX IF NOT EXISTS idx_companies_master_name_trgm ON public.companies_master USING gin (company_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_master_status ON public.companies_master (company_status);
CREATE INDEX IF NOT EXISTS idx_companies_master_state ON public.companies_master (registered_state);
CREATE INDEX IF NOT EXISTS idx_companies_master_last_accessed ON public.companies_master (last_accessed_at);

-- 2. Create compliance_rules table in DB2
CREATE TABLE IF NOT EXISTS public.compliance_rules (
    rule_id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    condition_logic JSONB DEFAULT '{}'::jsonb,
    consequence_text TEXT NOT NULL,
    legal_section_reference TEXT NOT NULL,
    effective_from DATE,
    last_verified_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true
);

-- Seed Phase 1 Compliance Rules
INSERT INTO public.compliance_rules (rule_id, category, condition_logic, consequence_text, legal_section_reference, effective_from, last_verified_date, is_active)
VALUES
    ('STATUS_CHECK', 'STATUS', '{"check": "company_status"}'::jsonb, 'Company statutory registration status based on MCA records.', 'Section 248 & 252, Companies Act 2013', '2014-04-01', CURRENT_DATE, true),
    ('AGM_DUE_DATE', 'AGM', '{"type": "annual_general_meeting"}'::jsonb, 'AGM must be held within 6 months from financial year end (or 9 months for first AGM).', 'Section 96, Companies Act 2013', '2014-04-01', CURRENT_DATE, true),
    ('BOARD_MEETING_GAP', 'BOARD_MEETING', '{"max_days": 120}'::jsonb, 'Maximum gap between two consecutive board meetings shall not exceed 120 days.', 'Section 173(1), Companies Act 2013', '2014-04-01', CURRENT_DATE, true),
    ('DIR3_KYC_UNIVERSAL', 'DIR3_KYC', '{"deadline": "09-30"}'::jsonb, 'Annual DIR-3 KYC filing deadline for all DIN holders is 30th September.', 'Rule 12A, Companies (Appointment and Qualification of Directors) Rules 2014', '2018-07-10', CURRENT_DATE, true),
    ('SMALL_COMPANY_ELIGIBILITY', 'SMALL_COMPANY', '{"capital_limit": 40000000, "turnover_limit": 400000000}'::jsonb, 'Paid-up capital does not exceed ₹4 crore (and turnover ≤ ₹40 crore). Privileges: lower penalties & reduced filings.', 'Section 2(85), Companies Act 2013 read with Companies (Specification of definitions details) Rules', '2022-09-15', CURRENT_DATE, true)
ON CONFLICT (rule_id) DO UPDATE SET
    consequence_text = EXCLUDED.consequence_text,
    legal_section_reference = EXCLUDED.legal_section_reference,
    last_verified_date = CURRENT_DATE;

-- 3. Create company_data_audit_log table in DB2
CREATE TABLE IF NOT EXISTS public.company_data_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    cin TEXT,
    performed_by TEXT NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_log_cin ON public.company_data_audit_log (cin);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at ON public.company_data_audit_log (performed_at DESC);

-- Enable RLS
ALTER TABLE public.companies_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_data_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow public read access to companies_master and compliance_rules
CREATE POLICY "Public read companies_master" ON public.companies_master FOR SELECT USING (true);
CREATE POLICY "Public read compliance_rules" ON public.compliance_rules FOR SELECT USING (true);

-- Allow service role / authenticated write access
CREATE POLICY "Admin write companies_master" ON public.companies_master FOR ALL USING (true);
CREATE POLICY "Admin write compliance_rules" ON public.compliance_rules FOR ALL USING (true);
CREATE POLICY "Admin write company_data_audit_log" ON public.company_data_audit_log FOR ALL USING (true);
