-- ============================================================
-- Agency Ops Suite — Full Schema
-- Run this entire file in Supabase SQL Editor (one paste, one run)
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text not null,
  domain text not null,
  plan text not null check (plan in ('starter', 'growth', 'pro')),
  monthly_fee numeric(12, 2) not null,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'quarterly')),
  status text not null check (status in ('active', 'paused', 'churned')),
  notes text not null default '',
  ready_for_deploy boolean not null default false,
  live_url text not null default '',
  created_at timestamptz not null default now()
);

alter table clients add column if not exists billing_cycle text not null default 'monthly';
alter table clients add column if not exists notes text not null default '';
alter table clients add column if not exists ready_for_deploy boolean not null default false;
alter table clients add column if not exists live_url text not null default '';

alter table clients drop constraint if exists clients_billing_cycle_check;
alter table clients add constraint clients_billing_cycle_check check (billing_cycle in ('monthly', 'quarterly'));

-- ============================================================
-- BILLING
-- ============================================================
create table if not exists billing (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  due_date date not null,
  amount numeric(12, 2) not null default 0,
  paid boolean not null default false,
  payment_method text not null check (payment_method in ('gcash', 'bank')),
  notes text not null default ''
);

alter table billing add column if not exists amount numeric(12, 2) not null default 0;

-- ============================================================
-- INVOICES
-- ============================================================
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  client_id uuid not null references clients(id) on delete cascade,
  project text not null default '',
  status text not null check (status in ('draft','sent','paid','overdue','canceled')) default 'draft',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  due_date date,
  paid_at timestamptz,
  notes text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table invoices enable row level security;
revoke all on table invoices from anon, authenticated;
grant select, insert, update, delete on table invoices to authenticated;

-- ============================================================
-- CONTRACTS
-- ============================================================
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  contract_number text not null unique,
  client_id uuid not null references clients(id) on delete cascade,
  proposal_id uuid,
  invoice_id uuid,
  contract_type text not null default 'service',
  status text not null check (status in ('draft','sent','signed','expired')) default 'draft',
  signed_name text,
  signed_ip text,
  signed_at timestamptz,
  file_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contracts_client_idx on contracts(client_id);
create index if not exists contracts_status_idx on contracts(status);

-- Signing columns
alter table contracts add column if not exists signing_token text;
alter table contracts add column if not exists signing_expires_at timestamptz;
alter table contracts add column if not exists signed_name text;
alter table contracts add column if not exists signed_email text;
alter table contracts add column if not exists signed_ip text;
alter table contracts add column if not exists signature_data text;
alter table contracts add column if not exists viewed_at timestamptz;
alter table contracts add column if not exists sent_at timestamptz;

create index if not exists contracts_signing_token_idx on contracts(signing_token);
create index if not exists contracts_signed_at_idx on contracts(signed_at);

alter table contracts enable row level security;
revoke all on table contracts from anon, authenticated;
grant select, insert, update, delete on table contracts to authenticated;



-- ============================================================
-- LEADS
-- ============================================================
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text not null,
  source text not null check (source in ('facebook', 'google')),
  status text not null check (status in ('new', 'contacted', 'replied', 'closed')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- REQUESTS (used by src/lib/db.ts as "requests")
-- ============================================================
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text not null,
  status text not null check (status in ('pending', 'in_progress', 'done')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- CLIENT_REQUESTS (used by agency-db.ts / app/ API routes)
-- ============================================================
create table if not exists client_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'new',
  priority text not null default 'medium',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TASKS
-- ============================================================
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  title text not null,
  description text not null,
  status text not null check (status in ('todo', 'in_progress', 'done')),
  due_date date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ASSETS
-- ============================================================
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  name text not null,
  asset_url text not null,
  asset_type text not null check (asset_type in ('image', 'video', 'document', 'other')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- DOMAINS
-- ============================================================
create table if not exists domains (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  domain text not null,
  registrar text not null,
  hosting_provider text not null,
  status text not null check (status in ('active', 'expiring_soon', 'expired', 'pending_transfer')),
  expiry_date date not null,
  auto_renew boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- MAINTENANCE
-- ============================================================
create table if not exists maintenance (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  uptime_percent numeric(5, 2) not null,
  last_updated_at timestamptz not null default now(),
  pending_tasks integer not null default 0,
  monthly_visits integer not null default 0,
  note text not null default ''
);

-- ============================================================
-- CONTENT OUTPUTS
-- ============================================================
create table if not exists content_outputs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  business_type text not null,
  location text not null,
  offer text not null,
  hero_title text not null,
  hero_subtitle text not null,
  about text not null,
  cta text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DEPLOYMENT CHECKLISTS
-- ============================================================
create table if not exists deployment_checklists (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients(id) on delete cascade,
  domain_connected boolean not null default false,
  ssl_active boolean not null default false,
  cta_works boolean not null default false,
  mobile_responsive boolean not null default false,
  seo_meta_tags boolean not null default false,
  domain_connected_at timestamptz,
  ssl_active_at timestamptz,
  cta_works_at timestamptz,
  mobile_responsive_at timestamptz,
  seo_meta_tags_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PROVISIONING RUNS
-- ============================================================
create table if not exists provisioning_runs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  template_type text not null,
  domain text not null,
  status text not null check (status in ('pending', 'success', 'failed')),
  output_path text,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

-- legacy column alias used by agency-db.ts
alter table provisioning_runs add column if not exists template text generated always as (template_type) stored;

-- ============================================================
-- REPORT RUNS
-- ============================================================
create table if not exists report_runs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  period_start date,
  period_end date,
  generated_at timestamptz not null default now(),
  report_type text not null default 'manual',
  file_url text,
  report_snapshot jsonb
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
create table if not exists system_events (
  id uuid primary key default gen_random_uuid(),
  event_type text,
  type text,
  severity text not null default 'info' check (severity in ('info', 'warning', 'error', 'critical')),
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  "timestamp" timestamptz,
  request_id text,
  endpoint text,
  method text,
  status_code integer,
  user_id uuid,
  user_email text,
  ip text
);

create index if not exists system_events_created_at_idx on system_events (created_at desc);
create index if not exists system_events_event_type_idx on system_events (event_type);
create index if not exists system_events_type_idx on system_events (type);

create or replace function normalize_system_events_row()
returns trigger
language plpgsql
as $$
begin
  new.event_type := coalesce(new.event_type, new.type, 'unknown');
  new.type := coalesce(new.type, new.event_type);
  new.metadata := coalesce(new.metadata, new.payload, new.data, '{}'::jsonb);
  new.payload := coalesce(new.payload, new.metadata, new.data, '{}'::jsonb);
  new.data := coalesce(new.data, new.payload, new.metadata, '{}'::jsonb);
  new.summary := coalesce(new.summary, new.metadata->>'summary', new.payload->>'summary', new.data->>'summary', new.event_type);
  new."timestamp" := coalesce(new."timestamp", new.created_at, now());
  new.created_at := coalesce(new.created_at, new."timestamp", now());
  return new;
end;
$$;

drop trigger if exists trg_normalize_system_events on system_events;
create trigger trg_normalize_system_events
before insert or update on system_events
for each row
execute function normalize_system_events_row();

alter table system_events enable row level security;
revoke all on table system_events from anon, authenticated;
grant select, insert, update, delete on table system_events to authenticated;

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on audit_logs (created_at desc);
create index if not exists audit_logs_entity_type_created_at_idx on audit_logs (entity_type, created_at desc);

-- ============================================================
-- RLS
-- ============================================================
alter table clients enable row level security;
alter table billing enable row level security;
alter table leads enable row level security;
alter table requests enable row level security;
alter table client_requests enable row level security;
alter table tasks enable row level security;
alter table assets enable row level security;
alter table domains enable row level security;
alter table maintenance enable row level security;
alter table content_outputs enable row level security;
alter table deployment_checklists enable row level security;
alter table provisioning_runs enable row level security;
alter table report_runs enable row level security;
alter table audit_logs enable row level security;

-- ============================================================
-- GRANTS (authenticated role only)
-- ============================================================
revoke all on table clients from anon, authenticated;
revoke all on table billing from anon, authenticated;
revoke all on table leads from anon, authenticated;
revoke all on table requests from anon, authenticated;
revoke all on table client_requests from anon, authenticated;
revoke all on table tasks from anon, authenticated;
revoke all on table assets from anon, authenticated;
revoke all on table domains from anon, authenticated;
revoke all on table maintenance from anon, authenticated;
revoke all on table content_outputs from anon, authenticated;
revoke all on table deployment_checklists from anon, authenticated;
revoke all on table provisioning_runs from anon, authenticated;
revoke all on table report_runs from anon, authenticated;
revoke all on table audit_logs from anon, authenticated;

grant select, insert, update, delete on table clients to authenticated;
grant select, insert, update, delete on table billing to authenticated;
grant select, insert, update, delete on table leads to authenticated;
grant select, insert, update, delete on table requests to authenticated;
grant select, insert, update, delete on table client_requests to authenticated;
grant select, insert, update, delete on table tasks to authenticated;
grant select, insert, update, delete on table assets to authenticated;
grant select, insert, update, delete on table domains to authenticated;
grant select, insert, update, delete on table maintenance to authenticated;
grant select, insert, update, delete on table content_outputs to authenticated;
grant select, insert, update, delete on table deployment_checklists to authenticated;
grant select, insert, update, delete on table provisioning_runs to authenticated;
grant select, insert, update, delete on table report_runs to authenticated;
grant select, insert, update, delete on table audit_logs to authenticated;

-- ============================================================
-- RLS POLICIES
-- ============================================================
drop policy if exists "authenticated clients access" on clients;
drop policy if exists "authenticated billing access" on billing;
drop policy if exists "authenticated leads access" on leads;
drop policy if exists "authenticated requests access" on requests;
drop policy if exists "authenticated client_requests access" on client_requests;
drop policy if exists "authenticated tasks access" on tasks;
drop policy if exists "authenticated assets access" on assets;
drop policy if exists "authenticated domains access" on domains;
drop policy if exists "authenticated maintenance access" on maintenance;
drop policy if exists "authenticated content outputs access" on content_outputs;
drop policy if exists "authenticated deployment_checklists access" on deployment_checklists;
drop policy if exists "authenticated provisioning runs access" on provisioning_runs;
drop policy if exists "authenticated report runs access" on report_runs;
drop policy if exists "authenticated audit logs access" on audit_logs;

create policy "authenticated clients access" on clients for all to authenticated using (true) with check (true);
create policy "authenticated billing access" on billing for all to authenticated using (true) with check (true);
create policy "authenticated leads access" on leads for all to authenticated using (true) with check (true);
create policy "authenticated requests access" on requests for all to authenticated using (true) with check (true);
create policy "authenticated client_requests access" on client_requests for all to authenticated using (true) with check (true);
create policy "authenticated tasks access" on tasks for all to authenticated using (true) with check (true);
create policy "authenticated assets access" on assets for all to authenticated using (true) with check (true);
create policy "authenticated domains access" on domains for all to authenticated using (true) with check (true);
create policy "authenticated maintenance access" on maintenance for all to authenticated using (true) with check (true);
create policy "authenticated content outputs access" on content_outputs for all to authenticated using (true) with check (true);
create policy "authenticated deployment_checklists access" on deployment_checklists for all to authenticated using (true) with check (true);
create policy "authenticated provisioning runs access" on provisioning_runs for all to authenticated using (true) with check (true);
create policy "authenticated report runs access" on report_runs for all to authenticated using (true) with check (true);
create policy "authenticated audit logs access" on audit_logs for all to authenticated using (true) with check (true);

-- ============================================================
-- SEED DATA
-- ============================================================
insert into clients (name, business_type, domain, plan, monthly_fee, status, ready_for_deploy, live_url, created_at)
values
  ('Coastline Resort Group', 'Hospitality', 'coastline-resort.example', 'pro', 1800, 'active', true, 'https://coastline-resort.example', now()),
  ('Northside Dental Studio', 'Clinic', 'northside-dental.example', 'growth', 1200, 'active', true, 'https://northside-dental.example', now()),
  ('Blue Plate Kitchen', 'Restaurant', 'blueplate.example', 'starter', 700, 'paused', false, '', now())
on conflict do nothing;
