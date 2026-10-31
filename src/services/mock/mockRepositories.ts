import type { ListeningProgress, ParentSettings, Story } from '@/domain/types';
import { GATE_UNLOCK_MS } from '@/domain/parentGate';
import { defaultSettings, reviveSettings } from '../defaults';
import { createPersistentStore, createStore, type KeyValueStorage } from '../store';
import type { LoadStatus, ParentGateSession, ProfileStatus, SaveStatus, SettingsRepository, StoryRepository } from '../types';

const OK = { ok: true } as const;

export function createMockStoryRepository(storage: KeyValueStorage, seed: () => Story[]): StoryRepository {
  const stories = createPersistentStore<Story[]>(storage, 'lw.stories.v1', seed);
  return {
    stories,
    status: createStore<LoadStatus>('ready'),
    get: (id) => stories.get().find((s) => s.id === id),
    async save(story) {
      stories.set((prev) => [story, ...prev.filter((s) => s.id !== story.id)]);
      return OK;
    },
    updateProgress(id: string, listening: ListeningProgress) {
      stories.set((prev) => prev.map((s) => (s.id === id ? { ...s, listening } : s)));
    },
    async remove(id) {
      stories.set((prev) => prev.filter((s) => s.id !== id));
      return OK;
    },
    async clear() {
      stories.set([]);
      return OK;
    },
    reload() {},
  };
}

export function createMockSettingsRepository(storage: KeyValueStorage, opts: { needsOnboarding?: boolean } = {}): SettingsRepository {
  const settings = createPersistentStore<ParentSettings>(storage, 'lw.settings.v1', defaultSettings, reviveSettings);
  const profile = createStore<ProfileStatus>(opts.needsOnboarding ? 'needs-onboarding' : 'ready');
  return {
    settings,
    profile,
    saveStatus: createStore<SaveStatus>('saved'),
    update: (patch) => settings.set(patch),
    async completeOnboarding(child) {
      settings.set((s) => ({ ...s, child }));
      profile.set('ready');
      return OK;
    },
    reload() {},
  };
}

export function createParentGateSession(storage: KeyValueStorage, now: () => Date): ParentGateSession {
  const key = 'lw.parentGate.until';
  return {
    isUnlocked: () => Number(storage.getItem(key) ?? 0) > now().getTime(),
    unlock: () => storage.setItem(key, String(now().getTime() + GATE_UNLOCK_MS)),
    lock: () => storage.removeItem(key),
  };
}
