-- Supabase Migration: Web Push Subscriptions Table

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  categories TEXT[] DEFAULT ARRAY['all'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN Index for fast array overlap & category filter queries
CREATE INDEX IF NOT EXISTS idx_push_sub_categories ON push_subscriptions USING GIN(categories);

-- Enable RLS (Row Level Security) - Access controlled via service role key in API routes
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
