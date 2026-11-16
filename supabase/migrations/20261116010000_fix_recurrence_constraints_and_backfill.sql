-- Migration: Fix Compliance Entries Recurrence Constraints and Backfill
-- Migration ID: 20261116010000_fix_recurrence_constraints_and_backfill.sql

ALTER TABLE compliance_entries DROP CONSTRAINT IF EXISTS compliance_entries_frequency_check;
ALTER TABLE compliance_entries DROP CONSTRAINT IF EXISTS compliance_entries_recurrence_check;

-- Normalize existing rows based on original frequency
UPDATE compliance_entries
SET 
  recurrence = CASE 
    WHEN frequency IN ('annual', 'every_2_years', 'every_3_years', 'every_5_years') THEN 'annual'
    WHEN frequency = 'quarterly' THEN 'quarterly'
    WHEN frequency = 'half_yearly' THEN 'half-yearly'
    WHEN frequency IN ('one_time', 'event_based') THEN 'one-off'
    ELSE 'monthly'
  END,
  frequency = CASE 
    WHEN frequency IN ('annual', 'every_2_years', 'every_3_years', 'every_5_years') THEN 'annual'
    WHEN frequency = 'quarterly' THEN 'quarterly'
    WHEN frequency = 'half_yearly' THEN 'half-yearly'
    WHEN frequency IN ('one_time', 'event_based') THEN 'one-off'
    ELSE 'monthly'
  END;

-- Enforce canonical allowed values: 'one-off', 'monthly', 'quarterly', 'half-yearly', 'annual'
ALTER TABLE compliance_entries ADD CONSTRAINT compliance_entries_recurrence_check 
  CHECK (recurrence IN ('one-off', 'monthly', 'quarterly', 'half-yearly', 'annual'));

ALTER TABLE compliance_entries ADD CONSTRAINT compliance_entries_frequency_check 
  CHECK (frequency IN ('one-off', 'monthly', 'quarterly', 'half-yearly', 'annual'));
