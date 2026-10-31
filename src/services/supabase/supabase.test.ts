import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../defaults';
import { readLiveConfig } from '../config';
import { authErrorMessage } from './authMessages';
import { childToRow, familyPatch, progressToRow, settingsFromRows, storyFromRow, storyToRows, type StoryRow } from './mappers';

const row: StoryRow = {
  id: 's1',
  title: 'The Little Fox',
  prompt: 'A fox',
  duration_minutes: 10,
  illustrated: true,
  theme: 'moonlit-forest',
  source: 'prototype-template',
  created_at: '2026-10-31T09:00:00Z',
  story_scenes: [
    { position: 1, text: 'Two', duration_sec: 150, art_variant: 1 },
    { position: 0, text: 'One', duration_sec: 150, art_variant: 0 },
  ],
  listening_progress: { position_sec: 42, completed: false, last_played_at: '2026-10-31T09:05:00Z' },
};

describe('story mapping', () => {
  it('maps rows to stories with ordered scenes and progress', () => {
    const story = storyFromRow(row);
    expect(story.scenes.map((s) => s.text)).toEqual(['One', 'Two']);
    expect(story.listening.positionSec).toBe(42);
    expect(story.durationMinutes).toBe(10);
  });

  it('copes with missing progress, array progress and unknown values', () => {
    expect(storyFromRow({ ...row, listening_progress: null }).listening).toEqual({ positionSec: 0, completed: false, lastPlayedAt: null });
    expect(storyFromRow({ ...row, listening_progress: [{ position_sec: 5, completed: true, last_played_at: null }] }).listening.completed).toBe(true);
    const odd = storyFromRow({ ...row, theme: 'volcano', duration_minutes: 7, story_scenes: [{ position: 0, text: 'x', duration_sec: null, art_variant: null }] });
    expect(odd.theme).toBe('moonlit-forest');
    expect(odd.durationMinutes).toBe(5);
    expect(odd.scenes[0]!.durationSec).toBe(300);
  });

  it('round-trips a story through rows', () => {
    const story = storyFromRow(row);
    const rows = storyToRows(story, 'fam');
    expect(rows.story).toMatchObject({ id: 's1', family_id: 'fam', source: 'prototype-template', moderation_status: 'approved' });
    expect(rows.scenes.map((s) => s.position)).toEqual([0, 1]);
    expect(progressToRow('s1', 'fam', { positionSec: 12.6, completed: false, lastPlayedAt: null })).toMatchObject({ position_sec: 13 });
  });
});

describe('settings mapping', () => {
  it('round-trips family limits and child preferences', () => {
    const s = defaultSettings();
    s.limits.monthlyBudgetGbp = 12;
    s.content.avoidTopics = ['storms'];
    const family = { id: 'fam', ...familyPatch(s) };
    const child = childToRow(s, 'fam');
    expect(family.monthly_budget_pence).toBe(1200);
    expect(settingsFromRows(family, child, s.prototype)).toEqual(s);
  });

  it('keeps the default length within the maximum', () => {
    const s = defaultSettings();
    const family = { id: 'fam', ...familyPatch(s), max_duration_minutes: 5, default_duration_minutes: 15 };
    expect(settingsFromRows(family, null, s.prototype).defaults.durationMinutes).toBe(5);
  });
});

describe('live config', () => {
  it('runs in demo mode without Supabase settings', () => {
    expect(readLiveConfig({})).toBeNull();
  });
  it('reads the publishable key and switched-on providers', () => {
    const c = readLiveConfig({ VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_abc', VITE_AUTH_PROVIDERS: 'Google, apple, myspace' });
    expect(c).toEqual({ supabaseUrl: 'https://x.supabase.co', supabaseKey: 'sb_publishable_abc', providers: ['google', 'apple'] });
  });
  it('refuses a secret key in the browser', () => {
    expect(() => readLiveConfig({ VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_abc' })).toThrow(/secret/);
  });
});

describe('auth messages', () => {
  it('turns provider errors into calm copy', () => {
    expect(authErrorMessage('Invalid login credentials')).toMatch(/don’t match/);
    expect(authErrorMessage('Email not confirmed')).toMatch(/confirm your email/);
    expect(authErrorMessage('Unsupported provider: provider is not enabled')).toMatch(/isn’t switched on/);
    expect(authErrorMessage('boom')).toBe('Something went wrong. Please try again.');
  });
});
