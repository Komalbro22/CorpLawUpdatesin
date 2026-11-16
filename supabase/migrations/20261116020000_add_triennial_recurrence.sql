-- Migration: Add triennial recurrence to compliance entries
-- Migration ID: 20261116020000_add_triennial_recurrence.sql

ALTER TABLE compliance_entries DROP CONSTRAINT IF EXISTS compliance_entries_recurrence_check;
ALTER TABLE compliance_entries DROP CONSTRAINT IF EXISTS compliance_entries_frequency_check;

ALTER TABLE compliance_entries ADD CONSTRAINT compliance_entries_recurrence_check 
  CHECK (recurrence IN ('one-off', 'monthly', 'quarterly', 'half-yearly', 'annual', 'triennial'));

ALTER TABLE compliance_entries ADD CONSTRAINT compliance_entries_frequency_check 
  CHECK (frequency IN ('one-off', 'monthly', 'quarterly', 'half-yearly', 'annual', 'triennial'));
