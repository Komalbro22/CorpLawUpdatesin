-- Set official Instagram account URL in site_settings
INSERT INTO site_settings (key, label, value, description)
VALUES 
  ('instagram_url', 'Instagram URL', 'https://www.instagram.com/corplawupdate', 'Official Instagram profile link')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
