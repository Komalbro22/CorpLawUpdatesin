-- Migration: 20261114000000_create_banner_assets.sql
-- Description: Creates banner_assets table, unique indexes, active_banner_id foreign key on updates table, and RLS policies.

create table if not exists banner_assets (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references updates(id) on delete cascade,
  source text not null check (source in ('template', 'html', 'svg', 'upload', 'legacy')),
  spec jsonb,
  code text,
  alt text not null,
  hash text not null,
  formats jsonb not null,
  status text not null default 'candidate' check (status in ('candidate', 'active', 'archived')),
  created_by text not null,
  created_at timestamptz not null default now()
);

-- Index for fast lookup by article
create index if not exists idx_banner_assets_article_id on banner_assets(article_id);

-- Enforce idempotency: an article cannot have duplicate banners of the exact same content hash
create unique index if not exists banner_assets_article_hash on banner_assets(article_id, hash);

-- Enforce single active banner per article at database level
create unique index if not exists banner_assets_one_active on banner_assets(article_id) where status = 'active';

-- Add active_banner_id foreign key column to updates table (nullable, safe for existing articles)
alter table updates add column if not exists active_banner_id uuid references banner_assets(id) on delete set null;

-- Row Level Security
alter table banner_assets enable row level security;

-- Public can read banner assets (for CDN/image rendering and metadata verification)
create policy "Public can view banner_assets"
  on banner_assets for select
  using (true);

-- Service role has full CRUD access
create policy "Service role has full access to banner_assets"
  on banner_assets for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
