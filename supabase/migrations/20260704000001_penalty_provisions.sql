-- Migration: penalty_provisions table
-- Creates the table to store the Companies Act 2013 Penalty Data

CREATE TABLE IF NOT EXISTS public.penalty_provisions (
    id TEXT PRIMARY KEY,
    sno INTEGER NOT NULL,
    section TEXT NOT NULL,
    act_chapter TEXT NOT NULL,
    title TEXT NOT NULL,
    plain_summary TEXT NOT NULL,
    penalty_type TEXT NOT NULL, -- 'penalty', 'fine', 'imprisonment', 'fine_or_imprisonment', 'fine_and_imprisonment', 'section_447_fraud', 'no_fixed_amount'
    
    -- Company Liability
    company_base_amount_min BIGINT,
    company_base_amount_max BIGINT,
    company_per_day_continuing BIGINT,
    company_max_cap BIGINT,
    company_notes TEXT,
    
    -- Officer Liability
    officer_base_amount_min BIGINT,
    officer_base_amount_max BIGINT,
    officer_per_day_continuing BIGINT,
    officer_max_cap BIGINT,
    officer_notes TEXT,
    
    -- Imprisonment
    imprisonment_applicable BOOLEAN DEFAULT FALSE,
    imprisonment_min_years NUMERIC,
    imprisonment_max_years NUMERIC,
    imprisonment_applies_to TEXT,
    
    refers_to_section_447 BOOLEAN DEFAULT FALSE,
    category TEXT NOT NULL,
    related_sections TEXT[] DEFAULT '{}',
    source_page INTEGER,
    last_verified DATE,
    amendment_watch TEXT[] DEFAULT '{}',
    flags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.penalty_provisions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on penalty_provisions" 
    ON public.penalty_provisions 
    FOR SELECT 
    USING (true);

-- Index for searching and filtering
CREATE INDEX idx_penalty_section ON public.penalty_provisions(section);
CREATE INDEX idx_penalty_category ON public.penalty_provisions(category);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_penalty_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_penalty_provisions_modtime
    BEFORE UPDATE ON public.penalty_provisions
    FOR EACH ROW
    EXECUTE FUNCTION update_penalty_updated_at_column();
