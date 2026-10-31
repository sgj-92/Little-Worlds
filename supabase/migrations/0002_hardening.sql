-- Little Worlds — hardening after Supabase advisor review (Milestone 2). Idempotent.

-- Trigger/event-trigger functions must not be callable through the Data API (/rest/v1/rpc/...).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
do $$
begin
  -- Created by Supabase's "Enable automatic RLS" project option, when switched on.
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

-- Cover the remaining foreign keys.
create index if not exists generation_jobs_story on public.generation_jobs (story_id);
create index if not exists usage_events_job on public.usage_events (job_id);

-- One SELECT policy per table: split the template-scene write policy by command.
drop policy if exists "prototype: write template scenes" on public.story_scenes;
drop policy if exists "prototype: insert template scenes" on public.story_scenes;
drop policy if exists "prototype: update template scenes" on public.story_scenes;
drop policy if exists "prototype: delete template scenes" on public.story_scenes;
create policy "prototype: insert template scenes" on public.story_scenes for insert to authenticated
  with check (exists (select 1 from public.stories s where s.id = story_id and s.family_id = (select auth.uid()) and s.source = 'prototype-template'));
create policy "prototype: update template scenes" on public.story_scenes for update to authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.family_id = (select auth.uid()) and s.source = 'prototype-template'))
  with check (exists (select 1 from public.stories s where s.id = story_id and s.family_id = (select auth.uid()) and s.source = 'prototype-template'));
create policy "prototype: delete template scenes" on public.story_scenes for delete to authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.family_id = (select auth.uid()) and s.source = 'prototype-template'));
