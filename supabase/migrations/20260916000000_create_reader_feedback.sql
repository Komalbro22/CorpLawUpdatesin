-- Migration: Create reader_feedback table with RLS policies
create table if not exists reader_feedback (
  id uuid primary key default gen_random_uuid(),
  context_type text not null, -- 'article', 'calculator', 'document'
  context_title text not null,
  context_url text not null,
  sentiment text not null, -- 'positive' or 'negative'
  tags text[] default '{}',
  comment text,
  user_email text,
  status text default 'pending', -- 'pending', 'reviewed', 'resolved'
  created_at timestamptz default now()
);

-- Indexes for rapid admin filtering
create index if not exists idx_reader_feedback_created_at on reader_feedback(created_at desc);
create index if not exists idx_reader_feedback_context_type on reader_feedback(context_type);
create index if not exists idx_reader_feedback_sentiment on reader_feedback(sentiment);
create index if not exists idx_reader_feedback_status on reader_feedback(status);

-- Enable Row Level Security
alter table reader_feedback enable row level security;

-- Policy: Public can insert feedback anonymously
create policy "Public can insert reader feedback"
  on reader_feedback
  for insert
  to anon, authenticated
  with check (true);

-- Policy: Service role has full access for admin dashboard
create policy "Service role access"
  on reader_feedback
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
