-- Little Worlds — initial schema (DRAFT for Milestone 2; not yet applied to any project).
-- Every table is private to the owning family via row-level security.

create extension if not exists "pgcrypto";

-- One row per parent account (auth.users). Children never have their own login.
create table public.families (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  monthly_budget_pence integer not null default 1000 check (monthly_budget_pence between 0 and 100000),
  stories_per_day smallint not null default 3 check (stories_per_day between 1 and 10),
  max_duration_minutes smallint not null default 15 check (max_duration_minutes in (5, 10, 15)),
  allow_illustrations boolean not null default true
);

-- Data minimisation: first name/nickname and age band only. No DOB, no surname, no photos.
create table public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  age_band text not null check (age_band in ('3-4', '5-6', '7-8', '9-10')),
  avatar text not null default 'fox',
  tone text not null default 'gentle' check (tone in ('gentle', 'playful', 'adventurous')),
  bedtime_endings boolean not null default true,
  avoid_topics text[] not null default '{}',
  custom_blocked_words text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  child_id uuid references public.child_profiles (id) on delete set null,
  title text not null,
  prompt text not null check (char_length(prompt) <= 400),
  duration_minutes smallint not null check (duration_minutes in (5, 10, 15)),
  illustrated boolean not null,
  theme text not null,
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.story_scenes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  position smallint not null,
  text text not null,
  duration_sec integer,
  image_path text,      -- storage: story-assets/{family_id}/{story_id}/scene-{position}.webp
  audio_path text,      -- storage: story-assets/{family_id}/{story_id}/scene-{position}.mp3
  unique (story_id, position)
);

create table public.listening_progress (
  story_id uuid primary key references public.stories (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  position_sec integer not null default 0,
  completed boolean not null default false,
  last_played_at timestamptz
);

-- Asynchronous, resumable generation pipeline. Written only by the server (service role).
create table public.generation_jobs (
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
create index generation_jobs_family_status on public.generation_jobs (family_id, status);

-- Cost ledger used for daily limits and the monthly budget cap.
create table public.usage_events (
  id bigint generated always as identity primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  job_id uuid references public.generation_jobs (id) on delete set null,
  provider text not null,
  kind text not null check (kind in ('text', 'image', 'audio', 'moderation')),
  cost_pence integer not null,
  created_at timestamptz not null default now()
);
create index usage_events_family_time on public.usage_events (family_id, created_at);

-- Row-level security: a family can only ever see its own rows.
alter table public.families enable row level security;
alter table public.child_profiles enable row level security;
alter table public.stories enable row level security;
alter table public.story_scenes enable row level security;
alter table public.listening_progress enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.usage_events enable row level security;

create policy "own family" on public.families for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own children" on public.child_profiles for all using (family_id = auth.uid()) with check (family_id = auth.uid());
create policy "read own stories" on public.stories for select using (family_id = auth.uid());
create policy "delete own stories" on public.stories for delete using (family_id = auth.uid());
create policy "read own scenes" on public.story_scenes for select
  using (exists (select 1 from public.stories s where s.id = story_id and s.family_id = auth.uid()));
create policy "own progress" on public.listening_progress for all using (family_id = auth.uid()) with check (family_id = auth.uid());
create policy "read own jobs" on public.generation_jobs for select using (family_id = auth.uid());
create policy "read own usage" on public.usage_events for select using (family_id = auth.uid());
-- Stories, scenes, jobs and usage are inserted/updated only by server functions using the service role.

-- Private storage bucket; objects are namespaced by family id.
insert into storage.buckets (id, name, public) values ('story-assets', 'story-assets', false) on conflict do nothing;
create policy "read own assets" on storage.objects for select
  using (bucket_id = 'story-assets' and (storage.foldername(name))[1] = auth.uid()::text);
