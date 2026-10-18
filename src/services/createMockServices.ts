import { seedStories } from '@/mocks/seedStories';
import { createMockSettingsRepository, createMockStoryRepository, createParentGateSession } from './mock/mockRepositories';
import { createMockSpeechCapture } from './mock/mockSpeechCapture';
import { createMockStoryGenerator, type MockGeneratorOptions, type MockStoryGenerator } from './mock/mockStoryGenerator';
import { browserStorage, memoryStorage, type KeyValueStorage } from './store';
import type { Services } from './types';

export interface MockServices extends Services {
  generator: MockStoryGenerator;
  resetDemo(): void;
}

export interface MockServiceOptions {
  storage?: KeyValueStorage;
  sessionStorage?: KeyValueStorage;
  now?: () => Date;
  stageMs?: MockGeneratorOptions['stageMs'];
  tickMs?: number;
  speechProcessingMs?: number;
}

/** Composition root for Milestone 1: every adapter is local and credential-free. */
export function createMockServices(options: MockServiceOptions = {}): MockServices {
  const storage = options.storage ?? browserStorage();
  const session = options.sessionStorage ?? (typeof window !== 'undefined' ? safeSession() : memoryStorage());
  const now = options.now ?? (() => new Date());
  const settings = createMockSettingsRepository(storage);
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
    stories,
    settings,
    generator,
    speech: createMockSpeechCapture(options.speechProcessingMs !== undefined ? { processingMs: options.speechProcessingMs } : {}),
    parentGate: createParentGateSession(session, now),
    now,
    resetDemo() {
      for (const job of generator.jobs.get()) generator.dismiss(job.id);
      generator.usage.set([]);
      settings.reset();
      stories.stories.set(seedStories(settings.settings.get().child.name, now()));
    },
  };
}

function safeSession(): KeyValueStorage {
  try {
    return window.sessionStorage;
  } catch {
    return memoryStorage();
  }
}
