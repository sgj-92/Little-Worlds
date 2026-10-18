import type { ListeningProgress, ParentSettings, Story } from '@/domain/types';
import { defaultSettings, reviveSettings } from '../defaults';
import { createPersistentStore, type KeyValueStorage } from '../store';
import type { ParentGateSession, SettingsRepository, StoryRepository } from '../types';
import { GATE_UNLOCK_MS } from '@/domain/parentGate';

export function createMockStoryRepository(storage: KeyValueStorage, seed: () => Story[]): StoryRepository {
  const stories = createPersistentStore<Story[]>(storage, 'lw.stories.v1', seed);
  return {
    stories,
    get: (id) => stories.get().find((s) => s.id === id),
    save(story) {
      stories.set((prev) => [story, ...prev.filter((s) => s.id !== story.id)]);
    },
    updateProgress(id: string, listening: ListeningProgress) {
      stories.set((prev) => prev.map((s) => (s.id === id ? { ...s, listening } : s)));
    },
    remove(id) {
      stories.set((prev) => prev.filter((s) => s.id !== id));
    },
    clear() {
      stories.set([]);
    },
  };
}

export function createMockSettingsRepository(storage: KeyValueStorage): SettingsRepository {
  const settings = createPersistentStore<ParentSettings>(storage, 'lw.settings.v1', defaultSettings, reviveSettings);
  return {
    settings,
    update: (patch) => settings.set(patch),
    reset: () => settings.set(defaultSettings()),
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
