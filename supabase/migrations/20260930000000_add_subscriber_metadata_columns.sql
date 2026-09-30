-- Migration: 20260930000000_add_subscriber_metadata_columns.sql
-- Add optional audience segmentation and attribution columns to subscribers table

ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS profession_other TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'Weekly';
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'other';
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS source_page TEXT;
