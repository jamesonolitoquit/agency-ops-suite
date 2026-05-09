-- Production RLS hardening for agency-ops-suite
-- Apply this after schema.sql in Supabase SQL editor.

begin;

create table if not exists public.app_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

revoke all on table public.app_admins from anon, authenticated;
grant select on table public.app_admins to authenticated;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to authenticated;

-- Replace permissive policies with admin-only policies.
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

create policy "admin clients access" on clients for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin billing access" on billing for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin leads access" on leads for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin requests access" on requests for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin client_requests access" on client_requests for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin tasks access" on tasks for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin assets access" on assets for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin domains access" on domains for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin maintenance access" on maintenance for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin content_outputs access" on content_outputs for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin deployment_checklists access" on deployment_checklists for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin provisioning_runs access" on provisioning_runs for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin report_runs access" on report_runs for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

create policy "admin audit_logs access" on audit_logs for all to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

commit;
