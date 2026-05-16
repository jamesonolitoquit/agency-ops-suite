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

alter table if exists system_events add column if not exists event_type text;
alter table if exists system_events add column if not exists type text;
alter table if exists system_events add column if not exists severity text;
alter table if exists system_events add column if not exists summary text;
alter table if exists system_events add column if not exists metadata jsonb;
alter table if exists system_events add column if not exists payload jsonb;
alter table if exists system_events add column if not exists data jsonb;
alter table if exists system_events add column if not exists created_at timestamptz;
alter table if exists system_events add column if not exists "timestamp" timestamptz;
alter table if exists system_events add column if not exists request_id text;
alter table if exists system_events add column if not exists endpoint text;
alter table if exists system_events add column if not exists method text;
alter table if exists system_events add column if not exists status_code integer;
alter table if exists system_events add column if not exists user_id uuid;
alter table if exists system_events add column if not exists user_email text;
alter table if exists system_events add column if not exists ip text;

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
