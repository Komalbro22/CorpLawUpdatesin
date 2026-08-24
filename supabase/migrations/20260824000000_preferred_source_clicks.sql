-- Create table for tracking Google Preferred Source clicks
CREATE TABLE IF NOT EXISTS preferred_source_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  location text not null, -- 'article_top', 'article_banner', 'footer', 'custom'
  page_url text,
  slug text,
  device text -- 'mobile', 'desktop'
);

-- Enable RLS
ALTER TABLE preferred_source_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insertion for event tracking
CREATE POLICY "Allow public insert to preferred_source_clicks"
  ON preferred_source_clicks FOR INSERT
  WITH CHECK (true);

-- Policy to grant service role full access
CREATE POLICY "Service role full access preferred_source_clicks"
  ON preferred_source_clicks USING (auth.role() = 'service_role');
