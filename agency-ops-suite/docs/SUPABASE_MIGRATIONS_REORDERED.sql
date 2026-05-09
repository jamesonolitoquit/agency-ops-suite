-- =============================================================================
-- Agency Ops Suite
-- Supabase Migrations (Reordered, Defensive, Manual Review Edition)
--
-- Rollback notes:
-- 1. Apply each phase/table block manually in Supabase SQL Editor.
-- 2. If a block fails, stop immediately and fix the reported issue before continuing.
-- 3. Roll back by dropping the last applied table(s) in reverse dependency order.
-- 4. For production/staging, prefer restore-from-backup over ad hoc rollback if data was written.
--
-- Validation checklist after each table block:
-- - Table exists
-- - Indexes exist
-- - Insert works
-- - Update works
-- - Delete behavior matches FK strategy
-- - created_at auto-fills
-- - RLS enabled
-- - Policy allows authenticated access and blocks anon access
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- COMMON HELPERS
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- PHASE 1 - CORE PERSISTENCE
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Validation checklist: users
-- ----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users (role);

alter table public.users enable row level security;
drop policy if exists "authenticated users access" on public.users;
create policy "authenticated users access"
on public.users
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: clients
-- ----------------------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text not null,
  domain text not null,
  plan text not null check (plan in ('starter', 'growth', 'pro')),
  monthly_fee numeric(12, 2) not null default 0,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'quarterly')),
  status text not null default 'active' check (status in ('active', 'paused', 'churned')),
  notes text not null default '',
  ready_for_deploy boolean not null default false,
  live_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_business_type_idx on public.clients (business_type);
create index if not exists clients_domain_idx on public.clients (domain);
create index if not exists clients_status_idx on public.clients (status);
create index if not exists clients_ready_for_deploy_idx on public.clients (ready_for_deploy);

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
drop policy if exists "authenticated access" on public.clients;
create policy "authenticated access"
on public.clients
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: leads
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text,
  email text,
  phone text,
  source text not null default 'landing_page',
  status text not null default 'new' check (status in ('new', 'contacted', 'replied', 'closed', 'lost')),
  notes text not null default '',
  converted_to_client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  contacted_at timestamptz,
  last_contacted_at timestamptz,
  closed_at timestamptz
);

alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists phone text;

create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.leads enable row level security;
drop policy if exists "authenticated access" on public.leads;
create policy "authenticated access"
on public.leads
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: billing
-- FK strategy: billing -> clients ON DELETE CASCADE
-- ----------------------------------------------------------------------------
create table if not exists public.billing (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  amount numeric(12, 2) not null default 0,
  due_date date not null,
  paid boolean not null default false,
  payment_method text not null default 'bank' check (payment_method in ('gcash', 'bank', 'credit_card', 'paypal', 'stripe', 'check', 'cash', 'wire_transfer', 'invoice', 'pending', 'other')),
  notes text not null default '',
  last_paid_at timestamptz,
  next_due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_client_id_idx on public.billing (client_id);
create index if not exists billing_due_date_idx on public.billing (due_date);
create index if not exists billing_paid_idx on public.billing (paid);

drop trigger if exists billing_set_updated_at on public.billing;
create trigger billing_set_updated_at
before update on public.billing
for each row execute function public.set_updated_at();

alter table public.billing enable row level security;
drop policy if exists "authenticated access" on public.billing;
create policy "authenticated access"
on public.billing
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: requests
-- FK strategy: requests -> clients ON DELETE CASCADE
-- ----------------------------------------------------------------------------
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists requests_client_id_idx on public.requests (client_id);
create index if not exists requests_status_idx on public.requests (status);
create index if not exists requests_created_at_idx on public.requests (created_at desc);

drop trigger if exists requests_set_updated_at on public.requests;
create trigger requests_set_updated_at
before update on public.requests
for each row execute function public.set_updated_at();

alter table public.requests enable row level security;
drop policy if exists "authenticated access" on public.requests;
create policy "authenticated access"
on public.requests
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: provisioning_runs
-- FK strategy: provisioning_runs -> clients ON DELETE SET NULL
-- ----------------------------------------------------------------------------
create table if not exists public.provisioning_runs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  template_type text not null default 'default',
  domain text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'success', 'failed')),
  output_path text,
  error_message text,
  http_check_passed boolean,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  template text generated always as (template_type) stored
);

create index if not exists provisioning_runs_client_id_idx on public.provisioning_runs (client_id);
create index if not exists provisioning_runs_status_idx on public.provisioning_runs (status);
create index if not exists provisioning_runs_started_at_idx on public.provisioning_runs (started_at desc);

drop trigger if exists provisioning_runs_set_updated_at on public.provisioning_runs;
create trigger provisioning_runs_set_updated_at
before update on public.provisioning_runs
for each row execute function public.set_updated_at();

alter table public.provisioning_runs enable row level security;
drop policy if exists "authenticated access" on public.provisioning_runs;
create policy "authenticated access"
on public.provisioning_runs
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: report_runs
-- FK strategy: report_runs -> clients ON DELETE SET NULL
-- ----------------------------------------------------------------------------
create table if not exists public.report_runs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  period_start date,
  period_end date,
  generated_at timestamptz not null default now(),
  report_type text not null default 'manual',
  file_url text,
  report_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists report_runs_client_id_idx on public.report_runs (client_id);
create index if not exists report_runs_generated_at_idx on public.report_runs (generated_at desc);

drop trigger if exists report_runs_set_updated_at on public.report_runs;
create trigger report_runs_set_updated_at
before update on public.report_runs
for each row execute function public.set_updated_at();

alter table public.report_runs enable row level security;
drop policy if exists "authenticated access" on public.report_runs;
create policy "authenticated access"
on public.report_runs
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: audit_logs
-- FK strategy: keep history if client is removed, so entity_id is nullable
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_type_entity_id_idx on public.audit_logs (entity_type, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;
drop policy if exists "authenticated access" on public.audit_logs;
create policy "authenticated access"
on public.audit_logs
for select
to authenticated
using (true);

-- =============================================================================
-- PHASE 2 - SUPPORTING SYSTEMS
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Validation checklist: assets
-- ----------------------------------------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  asset_url text not null,
  asset_type text not null check (asset_type in ('image', 'video', 'document', 'other')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assets_client_id_idx on public.assets (client_id);
create index if not exists assets_asset_type_idx on public.assets (asset_type);

drop trigger if exists assets_set_updated_at on public.assets;
create trigger assets_set_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

alter table public.assets enable row level security;
drop policy if exists "authenticated access" on public.assets;
create policy "authenticated access"
on public.assets
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: domains
-- ----------------------------------------------------------------------------
create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  domain text not null,
  registrar text not null,
  hosting_provider text not null,
  status text not null check (status in ('active', 'expiring_soon', 'expired', 'pending_transfer')),
  expiry_date date not null,
  auto_renew boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists domains_client_id_idx on public.domains (client_id);
create index if not exists domains_domain_idx on public.domains (domain);
create index if not exists domains_status_idx on public.domains (status);

drop trigger if exists domains_set_updated_at on public.domains;
create trigger domains_set_updated_at
before update on public.domains
for each row execute function public.set_updated_at();

alter table public.domains enable row level security;
drop policy if exists "authenticated access" on public.domains;
create policy "authenticated access"
on public.domains
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: tasks
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_client_id_idx on public.tasks (client_id);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.tasks enable row level security;
drop policy if exists "authenticated access" on public.tasks;
create policy "authenticated access"
on public.tasks
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: backup_logs
-- ----------------------------------------------------------------------------
create table if not exists public.backup_logs (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('pending', 'success', 'failed')),
  file_path text,
  file_exists boolean,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists backup_logs_status_idx on public.backup_logs (status);
create index if not exists backup_logs_created_at_idx on public.backup_logs (created_at desc);

drop trigger if exists backup_logs_set_updated_at on public.backup_logs;
create trigger backup_logs_set_updated_at
before update on public.backup_logs
for each row execute function public.set_updated_at();

alter table public.backup_logs enable row level security;
drop policy if exists "authenticated access" on public.backup_logs;
create policy "authenticated access"
on public.backup_logs
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: deployment_checklists
-- ----------------------------------------------------------------------------
create table if not exists public.deployment_checklists (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients(id) on delete cascade,
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

create index if not exists deployment_checklists_client_id_idx on public.deployment_checklists (client_id);

drop trigger if exists deployment_checklists_set_updated_at on public.deployment_checklists;
create trigger deployment_checklists_set_updated_at
before update on public.deployment_checklists
for each row execute function public.set_updated_at();

alter table public.deployment_checklists enable row level security;
drop policy if exists "authenticated access" on public.deployment_checklists;
create policy "authenticated access"
on public.deployment_checklists
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: deployment_checklist_items
-- ----------------------------------------------------------------------------
create table if not exists public.deployment_checklist_items (
  id uuid primary key default gen_random_uuid(),
  deployment_checklist_id uuid not null references public.deployment_checklists(id) on delete cascade,
  key text not null,
  label text not null,
  description text not null default '',
  completed boolean not null default false,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (deployment_checklist_id, key)
);

create index if not exists deployment_checklist_items_checklist_id_idx on public.deployment_checklist_items (deployment_checklist_id);
create index if not exists deployment_checklist_items_completed_idx on public.deployment_checklist_items (completed);
create index if not exists deployment_checklist_items_sort_order_idx on public.deployment_checklist_items (sort_order);

drop trigger if exists deployment_checklist_items_set_updated_at on public.deployment_checklist_items;
create trigger deployment_checklist_items_set_updated_at
before update on public.deployment_checklist_items
for each row execute function public.set_updated_at();

alter table public.deployment_checklist_items enable row level security;
drop policy if exists "authenticated access" on public.deployment_checklist_items;
create policy "authenticated access"
on public.deployment_checklist_items
for all
to authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------------
-- Validation checklist: system_events
-- ----------------------------------------------------------------------------
create table if not exists public.system_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists system_events_type_idx on public.system_events (type);
create index if not exists system_events_severity_idx on public.system_events (severity);
create index if not exists system_events_created_at_idx on public.system_events (created_at desc);

alter table public.system_events enable row level security;
drop policy if exists "authenticated access" on public.system_events;
create policy "authenticated access"
on public.system_events
for all
to authenticated
using (true)
with check (true);

-- =============================================================================
-- SEED DATA (OPTIONAL)
-- =============================================================================
-- Keep seed data minimal and removable. Run only after schema validation.
-- Example:
-- insert into public.users (id, role) values (gen_random_uuid(), 'admin') on conflict do nothing;
-- insert into public.clients (name, business_type, domain, plan, monthly_fee, status, ready_for_deploy, live_url)
-- values ('QA Temp Client', 'services', 'qa-temp.example', 'starter', 0, 'active', false, '')
-- on conflict do nothing;
