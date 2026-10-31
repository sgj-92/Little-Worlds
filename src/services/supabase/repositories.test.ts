import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore, memoryStorage } from '../store';
import type { AuthState } from '../types';
import { createFakeClient, has } from './fakeClient';
import type { StoryRow } from './mappers';
import { createSupabaseSettingsRepository } from './supabaseSettingsRepository';
import { createSupabaseStoryRepository } from './supabaseStoryRepository';

const signedIn: AuthState = { status: 'signed-in', userId: 'fam-1', email: 'p@example.com' };
const flush = () => new Promise((r) => setTimeout(r, 0));

const storyRow: StoryRow = {
  id: 'story-1',
  title: 'The Little Fox',
  prompt: 'A fox',
  duration_minutes: 5,
  illustrated: true,
  theme: 'moonlit-forest',
  source: 'prototype-template',
  created_at: '2026-10-31T09:00:00Z',
  story_scenes: [{ position: 0, text: 'Once…', duration_sec: 300, art_variant: 0 }],
  listening_progress: null,
};

describe('Supabase story repository', () => {
  it('loads the family’s stories after sign-in and clears them on sign-out', async () => {
    const auth = createStore<AuthState>({ status: 'signed-out' });
    const { client } = createFakeClient((c) => (c.table === 'stories' && has(c, 'select') ? { data: [storyRow] } : {}));
    const repo = createSupabaseStoryRepository(client, auth);
    expect(repo.status.get()).toBe('idle');

    auth.set(signedIn);
    expect(repo.status.get()).toBe('loading');
    await flush();
    expect(repo.status.get()).toBe('ready');
    expect(repo.get('story-1')?.title).toBe('The Little Fox');

    auth.set({ status: 'signed-out' });
    expect(repo.stories.get()).toEqual([]);
  });

  it('reports a load error so the UI can offer a retry', async () => {
    const { client } = createFakeClient(() => ({ error: { message: 'offline' } }));
    const repo = createSupabaseStoryRepository(client, createStore<AuthState>(signedIn));
    await flush();
    expect(repo.status.get()).toBe('error');
  });

  it('rolls back an optimistic save that fails', async () => {
    const { client, calls } = createFakeClient((c) => (has(c, 'upsert') ? { error: { message: 'denied' } } : { data: [] }));
    const repo = createSupabaseStoryRepository(client, createStore<AuthState>(signedIn));
    await flush();
    const story = { ...repo.stories.get()[0], id: 'new', title: 'New', createdAt: '', prompt: 'x', durationMinutes: 5 as const, illustrated: false, theme: 'ocean' as const, scenes: [], source: 'prototype-template' as const, listening: { positionSec: 0, completed: false, lastPlayedAt: null } };
    const pending = repo.save(story);
    expect(repo.get('new')).toBeDefined();
    expect(await pending).toMatchObject({ ok: false });
    expect(repo.get('new')).toBeUndefined();
    expect(calls.find((c) => c.table === 'stories' && has(c, 'upsert'))?.ops[0]?.args[0]).toMatchObject({ family_id: 'fam-1' });
  });
});

describe('Supabase settings repository', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('asks for onboarding when there is no child profile, then saves it', async () => {
    const family = { id: 'fam-1', monthly_budget_pence: 1000, stories_per_day: 3, max_duration_minutes: 15, allow_illustrations: true, default_duration_minutes: 5, default_illustrated: true };
    const { client, calls } = createFakeClient((c) => {
      if (c.table === 'families') return { data: family };
      if (c.table === 'child_profiles' && has(c, 'select')) return { data: [] };
      return {};
    });
    const repo = createSupabaseSettingsRepository(client, createStore<AuthState>(signedIn), memoryStorage());
    await vi.advanceTimersByTimeAsync(0);
    expect(repo.profile.get()).toBe('needs-onboarding');

    const result = await repo.completeOnboarding({ name: 'Leo', ageBand: '7-8', avatar: 'owl' });
    expect(result.ok).toBe(true);
    expect(repo.profile.get()).toBe('ready');
    expect(repo.settings.get().child.name).toBe('Leo');
    const upsert = calls.find((c) => c.table === 'child_profiles' && has(c, 'upsert'));
    expect(upsert?.ops[0]?.args[0]).toMatchObject({ family_id: 'fam-1', display_name: 'Leo', age_band: '7-8' });

    repo.update((s) => ({ ...s, limits: { ...s.limits, storiesPerDay: 5 } }));
    expect(repo.saveStatus.get()).toBe('saving');
    await vi.advanceTimersByTimeAsync(700);
    const update = calls.find((c) => c.table === 'families' && has(c, 'update'));
    expect(update?.ops.find((o) => o.op === 'update')?.args[0]).toMatchObject({ stories_per_day: 5 });
    expect(repo.saveStatus.get()).toBe('saved');
  });

  it('creates a missing family row instead of failing', async () => {
    const { client, calls } = createFakeClient((c) => {
      if (c.table === 'families' && has(c, 'maybeSingle')) return { data: null };
      if (c.table === 'families' && has(c, 'upsert')) return { data: { id: 'fam-1', monthly_budget_pence: 1000, stories_per_day: 3, max_duration_minutes: 15, allow_illustrations: true, default_duration_minutes: 5, default_illustrated: true } };
      return { data: [] };
    });
    const repo = createSupabaseSettingsRepository(client, createStore<AuthState>(signedIn), memoryStorage());
    await vi.advanceTimersByTimeAsync(0);
    expect(calls.some((c) => c.table === 'families' && has(c, 'upsert'))).toBe(true);
    expect(repo.profile.get()).toBe('needs-onboarding');
  });
});
