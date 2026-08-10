-- The Weekend Film School. saturday/
-- Paste this into the Supabase SQL editor and run it once, top to bottom.
-- Then put the project URL and the anon key into assets/js/config.js.
--
-- Why the anon key is safe in a public file: RLS is on, RLS defaults to
-- deny-all, and the only policy below grants INSERT on named columns. There is
-- no SELECT policy, so the key cannot read a single row. There is no UPDATE and
-- no DELETE policy, so nothing can be changed or destroyed.
--
-- The service_role key must never leave Supabase. If it is ever pasted into
-- config.js, rotate it in the dashboard. Deleting the commit is not enough.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- leads

create table public.leads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null,
  phone_e164      text not null,
  workshop_id     text,
  workshop_label  text,
  preference      text not null default 'either',
  experience      text,
  source          text,
  utm             jsonb,
  page_path       text,
  status          text not null default 'new',
  notes           text,
  constraint leads_name_len   check (char_length(btrim(name)) between 2 and 80),
  constraint leads_phone_fmt  check (phone_e164 ~ '^\+91[6-9][0-9]{9}$'),
  constraint leads_pref_vals  check (preference in ('mobile','ai','either')),
  constraint leads_exp_vals   check (experience is null or experience in
                                     ('nothing','phone_videos','short_film','acting','writing')),
  constraint leads_status_val check (status in ('new','messaged','booked','paid','lost')),
  constraint leads_notes_len  check (notes is null or char_length(notes) <= 2000),
  constraint leads_label_len  check (workshop_label is null or char_length(workshop_label) <= 120),
  constraint leads_source_len check (source is null or char_length(source) <= 60)
);

-- Stops a duplicate open lead but lets the same person come back once they
-- have been marked booked or lost.
create unique index leads_phone_open_idx
  on public.leads (phone_e164) where status in ('new','messaged');
create index leads_created_idx on public.leads (created_at desc);

-- ------------------------------------------------------------- throttle

create table public.lead_throttle (
  ip_hash      text primary key,
  window_start timestamptz not null default now(),
  hits         int not null default 0
);
alter table public.lead_throttle enable row level security;
-- deliberately zero policies: no client role can ever touch this table

-- ------------------------------------------------------------------ RLS

alter table public.leads enable row level security;

revoke all on public.leads from anon, authenticated;

-- Column-scoped, so a client cannot set id, created_at, status or notes.
-- A spammer cannot mark their own lead as paid.
grant insert (name, phone_e164, workshop_id, workshop_label,
              preference, experience, source, utm, page_path)
  on public.leads to anon;

create policy "anon may insert a lead"
  on public.leads for insert to anon with check (true);

-- -------------------------------------------------------- rate limiting
-- Five submissions per IP per hour. The stored value is a daily-salted
-- SHA-256 hash, never a raw IP, so this table holds no personal data and
-- becomes meaningless the next day.

create or replace function public.leads_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  fwd text := coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', 'unknown');
  ip  text := split_part(fwd, ',', 1);
  h   text := encode(digest(ip || current_date::text, 'sha256'), 'hex');
  t   public.lead_throttle%rowtype;
begin
  insert into public.lead_throttle(ip_hash) values (h) on conflict (ip_hash) do nothing;
  select * into t from public.lead_throttle where ip_hash = h for update;

  if t.window_start < now() - interval '1 hour' then
    update public.lead_throttle set window_start = now(), hits = 1 where ip_hash = h;
  elsif t.hits >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  else
    update public.lead_throttle set hits = t.hits + 1 where ip_hash = h;
  end if;

  new.name := btrim(new.name);
  return new;
end $$;

create trigger leads_guard_trg before insert on public.leads
  for each row execute function public.leads_guard();

-- ------------------------------------------------------------- worklist
-- Bookmark this view on your phone. Work it from the top down: change status
-- to messaged, then booked, then paid. notes is yours to write in.

create or replace view public.leads_worklist as
select to_char(created_at at time zone 'Asia/Kolkata', 'DD Mon HH24:MI') as when,
       name, phone_e164 as phone, workshop_label as wants,
       coalesce(experience,'-') as made, status, notes
from public.leads
where status in ('new','messaged')
order by created_at desc;

-- ------------------------------------------------------------- analytics
-- Same insert-only pattern. No cookie, no third party, no IP. session_id is a
-- random string that dies with the browser tab.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  props jsonb,
  session_id text,
  page_path text,
  constraint events_name_len check (char_length(name) <= 40),
  constraint events_props_len check (props is null or pg_column_size(props) <= 1024)
);
alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
grant insert (name, props, session_id, page_path) on public.events to anon;
create policy "anon may insert an event" on public.events for insert to anon with check (true);

-- Once a month:
-- delete from public.events where created_at < now() - interval '90 days';
