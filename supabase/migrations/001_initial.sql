-- ============================================
-- TABLES
-- ============================================

-- Updates (articles)
create table updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text not null,
  content text,
  category text not null check (category in ('MCA','SEBI','RBI','NCLT','IBC','FEMA')),
  tags text[] default '{}',
  source_url text,
  source_name text,
  published_at timestamptz,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscribers
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz,
  is_active boolean default true
);

-- Login attempts (DB-based rate limiting — works on serverless Vercel)
create table login_attempts (
  ip text primary key,
  attempts int default 1,
  window_start timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table updates enable row level security;
alter table subscribers enable row level security;
alter table login_attempts enable row level security;

-- Public can read published articles only
create policy "Public read published updates"
  on updates for select
  using (published_at is not null and published_at <= now());

-- Service role full access to all tables
create policy "Service role full access updates"
  on updates using (auth.role() = 'service_role');

create policy "Service role full access subscribers"
  on subscribers using (auth.role() = 'service_role');

create policy "Service role full access login_attempts"
  on login_attempts using (auth.role() = 'service_role');

-- ============================================
-- SUPABASE STORAGE
-- ============================================

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true);

create policy "Public read article images"
  on storage.objects for select
  using (bucket_id = 'article-images');

create policy "Service role upload article images"
  on storage.objects for insert
  with check (bucket_id = 'article-images');

create policy "Service role delete article images"
  on storage.objects for delete
  using (bucket_id = 'article-images');

-- ============================================
-- INDEXES
-- ============================================

create index updates_category_idx on updates(category);
create index updates_published_at_idx on updates(published_at desc);
create index updates_slug_idx on updates(slug);
create index updates_is_featured_idx on updates(is_featured);
