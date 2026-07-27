-- Migration: Create partner_interests table with RLS policies
create table if not exists partner_interests (
  id uuid primary key default gen_random_uuid(),
  firm_or_individual_name text not null,
  services text[] not null,
  qualification text,
  experience_years int,
  website text,
  contact_preference text,
  contact_value text,
  additional_notes text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table partner_interests enable row level security;

-- Policy: Public can INSERT only (no client-side SELECT, UPDATE, or DELETE)
create policy "Public can insert partner interests"
  on partner_interests
  for insert
  to anon, authenticated
  with check (true);

-- Policy: Service role has full access for admin operations
create policy "Service role access"
  on partner_interests
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
