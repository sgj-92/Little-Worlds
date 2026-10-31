import { seedStories } from '@/mocks/seedStories';
import { defaultSettings } from './defaults';
import { createMockAuth, type MockAuthOptions } from './mock/mockAuth';
import { createMockSettingsRepository, createMockStoryRepository, createParentGateSession } from './mock/mockRepositories';
import { createMockSpeechCapture } from './mock/mockSpeechCapture';
import { createMockStoryGenerator, type MockGeneratorOptions } from './mock/mockStoryGenerator';
import { browserStorage, memoryStorage, type KeyValueStorage } from './store';
import type { AppServices } from './appServices';

export interface MockServiceOptions {
  storage?: KeyValueStorage;
  sessionStorage?: KeyValueStorage;
  now?: () => Date;
  stageMs?: MockGeneratorOptions['stageMs'];
  tickMs?: number;
  speechProcessingMs?: number;
  auth?: MockAuthOptions;
  needsOnboarding?: boolean;
}

export function safeSessionStorage(): KeyValueStorage {
  try {
    return window.sessionStorage;
  } catch {
    return memoryStorage();
  }
}

/** Demo mode: every adapter is local and credential-free. */
export function createMockServices(options: MockServiceOptions = {}): AppServices {
  const storage = options.storage ?? browserStorage();
  const session = options.sessionStorage ?? (typeof window !== 'undefined' ? safeSessionStorage() : memoryStorage());
  const now = options.now ?? (() => new Date());
  const settings = createMockSettingsRepository(storage, options.needsOnboarding ? { needsOnboarding: true } : {});
  const stories = createMockStoryRepository(storage, () => seedStories(settings.settings.get().child.name, now()));
  const generator = createMockStoryGenerator({
    storage,
    repository: stories,
    getSettings: () => settings.settings.get(),
    now,
    ...(options.stageMs ? { stageMs: options.stageMs } : {}),
    ...(options.tickMs ? { tickMs: options.tickMs } : {}),
  });
  return {
    mode: 'demo',
    auth: createMockAuth(options.auth),
    stories,
    settings,
    generator,
    speech: createMockSpeechCapture(options.speechProcessingMs !== undefined ? { processingMs: options.speechProcessingMs } : {}),
    parentGate: createParentGateSession(session, now),
    now,
    resetDemo() {
      generator.reset();
      settings.update(() => defaultSettings());
      stories.stories.set(seedStories(settings.settings.get().child.name, now()));
    },
  };
}
