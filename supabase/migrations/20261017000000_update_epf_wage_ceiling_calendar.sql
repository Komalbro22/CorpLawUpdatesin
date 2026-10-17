-- Update EPF ECR & ESIC compliance entries to reflect the revised statutory wage ceiling of ₹25,000/month (S.O. 5109(E) w.e.f. 17 Sept 2026)
UPDATE compliance_entries
SET 
  applicable_to = 'EPF: Establishments with 20+ employees (statutory wage threshold ₹25,000/month). ESIC: Establishments with 10+ employees in notified areas (wage ceiling ₹21,000/month; ₹25,000 for PwD).',
  updated_at = NOW()
WHERE regulator = 'labor_law'
  AND (form_name ILIKE '%EPF%' OR compliance_title ILIKE '%EPF%');
