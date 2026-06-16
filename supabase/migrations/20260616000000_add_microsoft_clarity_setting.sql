-- Migration: Add Microsoft Clarity Project ID to site_settings
-- Created: 2026-06-16
-- Purpose: Allows the Clarity Project ID to be managed from the Admin Panel
--          without requiring a code deployment.

INSERT INTO site_settings (key, label, value, description)
VALUES (
  'microsoft_clarity_id',
  'Microsoft Clarity Project ID',
  'x7yxhrytqo',
  'Your Microsoft Clarity project ID (found in the Clarity dashboard URL or tracking script). Leave empty to disable Clarity tracking.'
)
ON CONFLICT (key) DO NOTHING;
