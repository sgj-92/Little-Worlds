-- Little Worlds — initial schema (Milestone 2).
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.
--
-- Security model: every row belongs to one family (= one parent auth user). Row-level security
-- restricts each family to its own rows. Tables are NOT auto-exposed to the Data API, so access is
-- granted explicitly below, to signed-in users only (never `anon`).

create extension if not exists pgcrypto;

-- ── Families: one per parent account. Children never have their own login. ────────────────
create table if not exists public.families (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  monthly_budget_pence integer not null default 1000 check (monthly_budget_pence between 0 and 100000),
  stories_per_day smallint not null default 3 check (stories_per_day between 1 and 10),
  max_duration_minutes smallint not null default 15 check (max_duration_minutes in (5, 10, 15)),
  allow_illustrations boolean not null default true,
  default_duration_minutes smallint not null default 5 check (default_duration_minutes in (5, 10, 15)),
  default_illustrated boolean not null default true
);

-- ── Child profile. Data minimisation: first name/nickname, age band, picture. Nothing else. ─
create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique references public.families (id) on delete cascade, -- one child per family for the MVP
  display_name text not null check (char_length(display_name) between 1 and 24),
  age_band text not null check (age_band in ('3-4', '5-6', '7-8', '9-10')),
  avatar text not null default 'fox' check (avatar in ('fox', 'owl', 'bunny', 'bear', 'whale', 'dragon')),
  tone text not null default 'gentle' check (tone in ('gentle', 'playful', 'adventurous')),
  bedtime_endings boolean not null default true,
  avoid_topics text[] not null default '{monsters}',
  custom_blocked_words text[] not null default '{}' check (cardinality(custom_blocked_words) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Stories and scenes ─────────────────────────────────────────────────────────────────────
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  title text not null check (char_length(title) <= 200),
  prompt text not null check (char_length(prompt) <= 400),
  duration_minutes smallint not null check (duration_minutes in (5, 10, 15)),
  illustrated boolean not null,
  theme text not null,
  source text not null default 'ai' check (source in ('prototype-template', 'ai')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists stories_family_created on public.stories (family_id, created_at desc);

create table if not exists public.story_scenes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  position smallint not null check (position between 0 and 49),
  text text not null check (char_length(text) <= 4000),
  duration_sec integer check (duration_sec between 0 and 3600),
  art_variant smallint,
  image_path text,      -- storage: story-assets/{family_id}/{story_id}/scene-{position}.webp
  audio_path text,      -- storage: story-assets/{family_id}/{story_id}/scene-{position}.mp3
  unique (story_id, position)
);

create table if not exists public.listening_progress (
  story_id uuid primary key references public.stories (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  position_sec integer not null default 0 check (position_sec >= 0),
  completed boolean not null default false,
  last_played_at timestamptz
);
create index if not exists listening_progress_family on public.listening_progress (family_id);

-- ── Generation pipeline (used from Milestone 3; written only by server functions) ──────────
create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  story_id uuid references public.stories (id) on delete set null,
  request jsonb not null,
  status text not null check (status in ('running', 'failed', 'complete', 'cancelled')),
  stage_writing text not null default 'pending',
  stage_illustrating text not null default 'pending',
  stage_narrating text not null default 'pending',
  stage_progress real not null default 0,
  attempts smallint not null default 1,
  error_stage text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists generation_jobs_family_status on public.generation_jobs (family_id, status);

create table if not exists public.usage_events (
  id bigint generated always as identity primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  job_id uuid references public.generation_jobs (id) on delete set null,
  provider text not null,
  kind text not null check (kind in ('text', 'image', 'audio', 'moderation')),
  cost_pence integer not null,
  created_at timestamptz not null default now()
);
create index if not exists usage_events_family_time on public.usage_events (family_id, created_at);

-- ── Create the family row automatically when a parent signs up ─────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.families (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Families for any accounts created before this script ran.
insert into public.families (id) select id from auth.users on conflict (id) do nothing;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists child_profiles_touch on public.child_profiles;
create trigger child_profiles_touch before update on public.child_profiles
  for each row execute function public.touch_updated_at();

-- ── Row-level security ─────────────────────────────────────────────────────────────────────
alter table public.families enable row level security;
alter table public.child_profiles enable row level security;
alter table public.stories enable row level security;
alter table public.story_scenes enable row level security;
alter table public.listening_progress enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.usage_events enable row level security;

drop policy if exists "own family: read" on public.families;
drop policy if exists "own family: insert" on public.families;
drop policy if exists "own family: update" on public.families;
create policy "own family: read" on public.families for select to authenticated using (id = (select auth.uid()));
create policy "own family: insert" on public.families for insert to authenticated with check (id = (select auth.uid()));
create policy "own family: update" on public.families for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "own child" on public.child_profiles;
create policy "own child" on public.child_profiles for all to authenticated
  using (family_id = (select auth.uid())) with check (family_id = (select auth.uid()));

-- Families only ever see approved stories.
drop policy if exists "own stories: read" on public.stories;
drop policy if exists "own stories: delete" on public.stories;
create policy "own stories: read" on public.stories for select to authenticated
  using (family_id = (select auth.uid()) and moderation_status = 'approved');
create policy "own stories: delete" on public.stories for delete to authenticated
  using (family_id = (select auth.uid()));

-- TEMPORARY (Milestones 2–3): the prototype builds template stories in the browser, so a family
-- may write its own *template* stories. AI stories ('ai') can only be written by the server.
-- Drop these two policies when server-side generation ships.
drop policy if exists "prototype: insert template stories" on public.stories;
drop policy if exists "prototype: update template stories" on public.stories;
create policy "prototype: insert template stories" on public.stories for insert to authenticated
  with check (family_id = (select auth.uid()) and source = 'prototype-template');
create policy "prototype: update template stories" on public.stories for update to authenticated
  using (family_id = (select auth.uid()) and source = 'prototype-template')
  with check (family_id = (select auth.uid()) and source = 'prototype-template');

drop policy if exists "own scenes: read" on public.story_scenes;
drop policy if exists "prototype: write template scenes" on public.story_scenes;
create policy "own scenes: read" on public.story_scenes for select to authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.family_id = (select auth.uid())));
create policy "prototype: write template scenes" on public.story_scenes for all to authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.family_id = (select auth.uid()) and s.source = 'prototype-template'))
  with check (exists (select 1 from public.stories s where s.id = story_id and s.family_id = (select auth.uid()) and s.source = 'prototype-template'));

drop policy if exists "own progress" on public.listening_progress;
create policy "own progress" on public.listening_progress for all to authenticated
  using (family_id = (select auth.uid()))
  with check (family_id = (select auth.uid()) and exists (select 1 from public.stories s where s.id = story_id and s.family_id = (select auth.uid())));

drop policy if exists "own jobs: read" on public.generation_jobs;
drop policy if exists "own usage: read" on public.usage_events;
create policy "own jobs: read" on public.generation_jobs for select to authenticated using (family_id = (select auth.uid()));
create policy "own usage: read" on public.usage_events for select to authenticated using (family_id = (select auth.uid()));

-- ── Data API access (explicit, because tables are not auto-exposed) ────────────────────────
revoke all on public.families, public.child_profiles, public.stories, public.story_scenes,
  public.listening_progress, public.generation_jobs, public.usage_events from anon;

grant select, insert, update on public.families to authenticated;
grant select, insert, update, delete on public.child_profiles to authenticated;
grant select, insert, update, delete on public.stories to authenticated;
grant select, insert, update, delete on public.story_scenes to authenticated;
grant select, insert, update, delete on public.listening_progress to authenticated;
grant select on public.generation_jobs to authenticated;
grant select on public.usage_events to authenticated;

-- ── Private storage for narration and illustrations (used from Milestone 3) ────────────────
insert into storage.buckets (id, name, public) values ('story-assets', 'story-assets', false) on conflict (id) do nothing;
drop policy if exists "read own assets" on storage.objects;
create policy "read own assets" on storage.objects for select to authenticated
  using (bucket_id = 'story-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
