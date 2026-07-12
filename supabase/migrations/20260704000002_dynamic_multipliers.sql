-- Migration: Add dynamic multiplier columns
ALTER TABLE public.penalty_provisions
ADD COLUMN IF NOT EXISTS custom_amount_label TEXT,
ADD COLUMN IF NOT EXISTS company_custom_multiplier NUMERIC,
ADD COLUMN IF NOT EXISTS company_custom_cap BIGINT,
ADD COLUMN IF NOT EXISTS officer_custom_multiplier NUMERIC,
ADD COLUMN IF NOT EXISTS officer_custom_cap BIGINT;
