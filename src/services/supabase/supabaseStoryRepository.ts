import type { SupabaseClient } from '@supabase/supabase-js';
import type { ListeningProgress, Story } from '@/domain/types';
import { createStore, type Store } from '../store';
import type { AuthState, LoadStatus, Result, StoryRepository } from '../types';
import { STORY_SELECT, progressToRow, storyFromRow, storyToRows, type StoryRow } from './mappers';

const PROGRESS_DEBOUNCE_MS = 1500;
const FAILED = { ok: false, message: 'We couldn’t reach Little Worlds. Please try again.' } as const;

/**
 * Stories for the signed-in family. Reads and writes are scoped by row-level security;
 * the local store is an optimistic cache so the UI stays instant.
 */
export function createSupabaseStoryRepository(client: SupabaseClient, auth: Store<AuthState>): StoryRepository {
  const stories = createStore<Story[]>([]);
  const status = createStore<LoadStatus>('idle');
  const progressTimers = new Map<string, ReturnType<typeof setTimeout>>();
  let userId: string | null = null;
  let loadToken = 0;

  async function load() {
    if (!userId) return;
    const token = ++loadToken;
    status.set('loading');
    const { data, error } = await client.from('stories').select(STORY_SELECT).order('created_at', { ascending: false });
    if (token !== loadToken) return;
    if (error) {
      status.set('error');
      return;
    }
    stories.set((data as unknown as StoryRow[]).map(storyFromRow));
    status.set('ready');
  }

  function onAuth(state: AuthState) {
    const next = state.status === 'signed-in' ? state.userId : null;
    if (next === userId) return;
    userId = next;
    loadToken++;
    progressTimers.forEach(clearTimeout);
    progressTimers.clear();
    stories.set([]);
    status.set(next ? 'loading' : 'idle');
    if (next) void load();
  }
  auth.subscribe(() => onAuth(auth.get()));
  onAuth(auth.get());

  return {
    stories,
    status,
    get: (id) => stories.get().find((s) => s.id === id),
    async save(story): Promise<Result> {
      if (!userId) return FAILED;
      stories.set((prev) => [story, ...prev.filter((s) => s.id !== story.id)]);
      const rows = storyToRows(story, userId);
      const a = await client.from('stories').upsert(rows.story);
      const b = a.error ? a : await client.from('story_scenes').upsert(rows.scenes, { onConflict: 'story_id,position' });
      if (a.error || b.error) {
        stories.set((prev) => prev.filter((s) => s.id !== story.id));
        return FAILED;
      }
      return { ok: true };
    },
    updateProgress(id: string, listening: ListeningProgress) {
      stories.set((prev) => prev.map((s) => (s.id === id ? { ...s, listening } : s)));
      const family = userId;
      if (!family) return;
      clearTimeout(progressTimers.get(id));
      progressTimers.set(
        id,
        setTimeout(() => {
          progressTimers.delete(id);
          // Best effort: the next save carries the latest position anyway.
          void client.from('listening_progress').upsert(progressToRow(id, family, listening));
        }, PROGRESS_DEBOUNCE_MS),
      );
    },
    async remove(id): Promise<Result> {
      const before = stories.get();
      stories.set(before.filter((s) => s.id !== id));
      const { error } = await client.from('stories').delete().eq('id', id);
      if (error) {
        stories.set(before);
        return FAILED;
      }
      return { ok: true };
    },
    async clear(): Promise<Result> {
      if (!userId) return FAILED;
      const { error } = await client.from('stories').delete().eq('family_id', userId);
      if (error) return FAILED;
      stories.set([]);
      return { ok: true };
    },
    reload: () => void load(),
  };
}
