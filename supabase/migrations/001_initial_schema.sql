-- ============================================================
-- Habitaly — Initial Schema Migration
-- Paste into Supabase SQL Editor and run in one shot.
--
-- Sprint breakdown:
--   Sprint 1 (wks 1–3): auth, photo upload, AI analysis, report
--                        builder, rights explainer, landlord letter
--   Sprint 2 (wks 4–5): case timeline, consent flow, lead creation,
--                        push notifications
--   Sprint 3 (wks 6–8): lawyer dashboard, Stripe pay-per-lead,
--                        contact release on payment
-- ============================================================


-- ============================================================
-- ENUMS
-- All declared up front so every table can reference them.
-- ============================================================

-- Sprint 1
create type report_status as enum (
  'draft',
  'pending',
  'submitted_hpd',
  'closed',
  'matched_lawyer'
);

-- Sprint 1
create type report_type as enum (
  'move_in_scan',
  'issue_report'
);

-- Sprint 1
create type issue_type as enum (
  'mold',
  'heat',
  'pests',
  'water',
  'structural',
  'electrical',
  'other'
);

-- Sprint 1
create type media_type as enum (
  'photo',
  'video',
  'document'
);

-- Sprint 2
create type consent_type as enum (
  'terms_of_service',
  'data_sharing_lawyers',
  'hpd_submission',
  'marketing'
);

-- Sprint 2
create type actor_type as enum (
  'user',
  'lawyer',
  'org_admin',
  'system'
);

-- Sprint 3
create type lead_status as enum (
  'available',
  'purchased',
  'expired',
  'opted_out'
);


-- ============================================================
-- SPRINT 1 — Core loop
-- Tables: users, reports, media
-- ============================================================

-- Auto-populated on signup via trigger below.
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text,
  phone        text,
  email        text,
  unit_address text,
  org_id       uuid,   -- future fk to orgs table, nullable for MVP
  created_at   timestamptz not null default now()
);

create table public.reports (
  id                uuid          primary key default gen_random_uuid(),
  user_id           uuid          not null references public.users(id) on delete cascade,
  org_id            uuid,
  status            report_status not null default 'draft',
  report_type       report_type   not null,
  issue_type        issue_type,
  location_tag      text,
  duration_tag      text,
  borough           text,
  building_type     text,
  ai_summary        text,
  ai_suggestions    jsonb,
  ai_case_strength  float         check (ai_case_strength >= 0 and ai_case_strength <= 1),
  lead_eligible     bool          not null default false,
  submitted_at      timestamptz,
  created_at        timestamptz   not null default now()
);

create table public.media (
  id           uuid        primary key default gen_random_uuid(),
  report_id    uuid        not null references public.reports(id) on delete cascade,
  type         media_type  not null,
  storage_url  text        not null,
  ai_analysis  jsonb,
  uploaded_at  timestamptz not null default now()
);


-- ============================================================
-- SPRINT 2 — Retention
-- Tables: case_updates, user_consents, audit_log, leads
-- ============================================================

create table public.case_updates (
  id             uuid          primary key default gen_random_uuid(),
  report_id      uuid          not null references public.reports(id) on delete cascade,
  update_text    text          not null,
  status_change  report_status,
  created_at     timestamptz   not null default now()
);

-- CRITICAL: write a row here before sharing any user data with anyone.
create table public.user_consents (
  id            uuid         primary key default gen_random_uuid(),
  user_id       uuid         not null references public.users(id) on delete cascade,
  consent_type  consent_type not null,
  granted       bool         not null,
  version       text         not null,
  recorded_at   timestamptz  not null default now(),
  revoked_at    timestamptz
);

-- Append-only. Never UPDATE or DELETE rows.
-- Writes must go through a service-role Edge Function — never the client.
create table public.audit_log (
  id           uuid        primary key default gen_random_uuid(),
  actor_type   actor_type  not null,
  actor_id     uuid        not null,
  action       text        not null,  -- e.g. 'report.submitted', 'consent.revoked'
  target_type  text,
  target_id    uuid,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

-- Created in Sprint 2 when a tenant opts into lawyer matching.
create table public.leads (
  id             uuid        primary key default gen_random_uuid(),
  report_id      uuid        not null references public.reports(id) on delete cascade,
  status         lead_status not null default 'available',
  issue_preview  text,       -- anonymized, safe to show lawyers
  borough        text,
  price          decimal(10, 2),
  max_purchases  int         not null default 1,
  listed_at      timestamptz not null default now()
);


-- ============================================================
-- SPRINT 3 — First sale
-- Tables: lead_purchases
-- ============================================================

create table public.lead_purchases (
  id                  uuid        primary key default gen_random_uuid(),
  lead_id             uuid        not null references public.leads(id) on delete cascade,
  lawyer_id           uuid        not null references public.users(id),
  purchased_at        timestamptz not null default now(),
  amount_paid         decimal(10, 2),
  contact_released_at timestamptz,
  outcome             text
);


-- ============================================================
-- INDEXES
-- ============================================================

-- Sprint 1
create index on public.reports (user_id);
create index on public.reports (status);
create index on public.media (report_id);

-- Sprint 2
create index on public.case_updates (report_id);
create index on public.user_consents (user_id);
create index on public.audit_log (actor_id);
create index on public.audit_log (action);
create index on public.leads (report_id);
create index on public.leads (status);

-- Sprint 3
create index on public.lead_purchases (lead_id);
create index on public.lead_purchases (lawyer_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users          enable row level security;
alter table public.reports        enable row level security;
alter table public.media          enable row level security;
alter table public.case_updates   enable row level security;
alter table public.user_consents  enable row level security;
alter table public.audit_log      enable row level security;
alter table public.leads          enable row level security;
alter table public.lead_purchases enable row level security;


-- -------- Sprint 1 --------

create policy "users: select own row" on public.users
  for select using (id = auth.uid());

create policy "users: insert own row" on public.users
  for insert with check (id = auth.uid());

create policy "users: update own row" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());


create policy "reports: select own" on public.reports
  for select using (user_id = auth.uid());

create policy "reports: insert own" on public.reports
  for insert with check (user_id = auth.uid());

create policy "reports: update own" on public.reports
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reports: delete own" on public.reports
  for delete using (user_id = auth.uid());


create policy "media: select own" on public.media
  for select using (
    exists (
      select 1 from public.reports
      where reports.id = media.report_id
        and reports.user_id = auth.uid()
    )
  );

create policy "media: insert own" on public.media
  for insert with check (
    exists (
      select 1 from public.reports
      where reports.id = media.report_id
        and reports.user_id = auth.uid()
    )
  );

create policy "media: delete own" on public.media
  for delete using (
    exists (
      select 1 from public.reports
      where reports.id = media.report_id
        and reports.user_id = auth.uid()
    )
  );


-- -------- Sprint 2 --------

create policy "case_updates: select own" on public.case_updates
  for select using (
    exists (
      select 1 from public.reports
      where reports.id = case_updates.report_id
        and reports.user_id = auth.uid()
    )
  );

create policy "case_updates: insert own" on public.case_updates
  for insert with check (
    exists (
      select 1 from public.reports
      where reports.id = case_updates.report_id
        and reports.user_id = auth.uid()
    )
  );


create policy "user_consents: select own" on public.user_consents
  for select using (user_id = auth.uid());

create policy "user_consents: insert own" on public.user_consents
  for insert with check (user_id = auth.uid());

create policy "user_consents: update own" on public.user_consents
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());


-- Users can only read their own audit entries.
-- No client INSERT/UPDATE/DELETE — all writes via service-role Edge Function.
create policy "audit_log: select own" on public.audit_log
  for select using (actor_type = 'user' and actor_id = auth.uid());


-- Tenants can see leads tied to their own reports.
create policy "leads: select own" on public.leads
  for select using (
    exists (
      select 1 from public.reports
      where reports.id = leads.report_id
        and reports.user_id = auth.uid()
    )
  );


-- -------- Sprint 3 --------

-- Lawyers see only their own purchases.
create policy "lead_purchases: select own" on public.lead_purchases
  for select using (lawyer_id = auth.uid());


-- ============================================================
-- TRIGGER: auto-create user profile row on signup (Sprint 1)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
