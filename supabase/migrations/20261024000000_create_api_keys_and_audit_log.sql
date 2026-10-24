-- Migration: 20261024000000_create_api_keys_and_audit_log.sql
-- Scoped API Key management, audit logging, idempotency, and IP throttle tracking for CorpLawUpdates Admin

-- 1. API Keys Table
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key_hash text not null unique,
  prefix text not null,
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  status text not null default 'active' check (status in ('active', 'revoked')),
  revoked_at timestamptz,
  created_by text default 'admin'
);

create index if not exists idx_api_keys_key_hash on api_keys(key_hash);
create index if not exists idx_api_keys_status on api_keys(status);

-- 2. API Audit Log Table
create table if not exists api_audit_log (
  id uuid primary key default gen_random_uuid(),
  key_id uuid references api_keys(id) on delete set null,
  key_name text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  ip_address text,
  status text not null check (status in ('success', 'failure')),
  details jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists idx_api_audit_log_timestamp on api_audit_log(timestamp desc);
create index if not exists idx_api_audit_log_action on api_audit_log(action);
create index if not exists idx_api_audit_log_key_name on api_audit_log(key_name);
create index if not exists idx_api_audit_log_entity on api_audit_log(entity_type, entity_id);

-- 3. Idempotency Keys Table
create table if not exists idempotency_keys (
  key text primary key,
  endpoint text not null,
  status_code int not null,
  response_body jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists idx_idempotency_keys_expires_at on idempotency_keys(expires_at);

-- 4. Persistent IP Throttle / Violation Table for Serverless Resilience
create table if not exists api_ip_violations (
  ip_address text primary key,
  attempt_count int not null default 1,
  first_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  locked_until timestamptz
);

create index if not exists idx_api_ip_violations_locked on api_ip_violations(locked_until);

-- Row Level Security (RLS)
alter table api_keys enable row level security;
alter table api_audit_log enable row level security;
alter table idempotency_keys enable row level security;
alter table api_ip_violations enable row level security;

-- Policy: Restrict all direct client access; only service role (used by supabaseAdmin) can operate on these
create policy "Service role full access on api_keys"
  on api_keys for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role full access on api_audit_log"
  on api_audit_log for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role full access on idempotency_keys"
  on idempotency_keys for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role full access on api_ip_violations"
  on api_ip_violations for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
