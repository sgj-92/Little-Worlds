-- Row-level security tests: two families must never see or change each other's data.
-- Run with scripts/test-db.sh. Any failed check raises an exception and stops the run.
\set ON_ERROR_STOP on

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'a@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'b@example.com');

create or replace function pg_temp.check(ok boolean, label text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAILED: %', label; end if;
  raise notice 'ok - %', label;
end $$;

select pg_temp.check((select count(*) from public.families) = 2, 'sign-up trigger creates a family per parent');
select pg_temp.check(not has_function_privilege('anon', 'public.handle_new_user()', 'execute')
  and not has_function_privilege('authenticated', 'public.handle_new_user()', 'execute'), 'sign-up trigger function is not callable via the API');

-- ── Family A ──
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);

insert into public.child_profiles (family_id, display_name, age_band) values ('11111111-1111-4111-8111-111111111111', 'Maya', '5-6');
insert into public.stories (id, family_id, title, prompt, duration_minutes, illustrated, theme, source, moderation_status)
  values ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Fox', 'A fox', 5, true, 'moonlit-forest', 'prototype-template', 'approved');
insert into public.story_scenes (story_id, position, text, duration_sec, art_variant) values ('aaaaaaaa-0000-4000-8000-000000000001', 0, 'Once…', 75, 0);
insert into public.listening_progress (story_id, family_id, position_sec) values ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 30);
select pg_temp.check((select count(*) from public.stories) = 1, 'A sees own story');
select pg_temp.check((select count(*) from public.families) = 1, 'A sees only own family');

do $$ begin
  insert into public.stories (family_id, title, prompt, duration_minutes, illustrated, theme, source, moderation_status)
    values ('11111111-1111-4111-8111-111111111111', 'Fake AI', 'x', 5, true, 'ocean', 'ai', 'approved');
  raise exception 'FAILED: client could write an AI story';
exception when insufficient_privilege then raise notice 'ok - clients cannot write AI stories';
end $$;

do $$ begin
  insert into public.child_profiles (family_id, display_name, age_band) values ('22222222-2222-4222-8222-222222222222', 'Intruder', '5-6');
  raise exception 'FAILED: A wrote a child profile into family B';
exception when insufficient_privilege then raise notice 'ok - cannot write into another family';
end $$;

-- ── Family B ──
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false);
select pg_temp.check((select count(*) from public.stories) = 0, 'B cannot read A''s stories');
select pg_temp.check((select count(*) from public.story_scenes) = 0, 'B cannot read A''s scenes');
select pg_temp.check((select count(*) from public.child_profiles) = 0, 'B cannot read A''s child profile');
select pg_temp.check((select count(*) from public.listening_progress) = 0, 'B cannot read A''s progress');

delete from public.stories where id = 'aaaaaaaa-0000-4000-8000-000000000001';
update public.families set stories_per_day = 10 where id = '11111111-1111-4111-8111-111111111111';
do $$ begin
  insert into public.listening_progress (story_id, family_id, position_sec) values ('aaaaaaaa-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 1);
  raise exception 'FAILED: B attached progress to A''s story';
exception when insufficient_privilege then raise notice 'ok - cannot attach progress to another family''s story';
end $$;

-- ── Signed-out visitors ──
reset role;
set role anon;
do $$ begin
  perform 1 from public.stories;
  raise exception 'FAILED: anon could query stories';
exception when insufficient_privilege then raise notice 'ok - signed-out visitors have no table access';
end $$;

reset role;
select pg_temp.check((select count(*) from public.stories) = 1, 'B''s delete did not touch A''s story');
select pg_temp.check((select stories_per_day from public.families where id = '11111111-1111-4111-8111-111111111111') = 3, 'B''s update did not touch A''s limits');

-- Pending (unmoderated) stories stay hidden from the family.
update public.stories set moderation_status = 'pending';
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false);
select pg_temp.check((select count(*) from public.stories) = 0, 'unmoderated stories are hidden');
reset role;

-- Deleting a parent removes everything they own.
delete from auth.users where id = '11111111-1111-4111-8111-111111111111';
select pg_temp.check((select count(*) from public.stories) = 0 and (select count(*) from public.child_profiles) = 0, 'account deletion cascades');
