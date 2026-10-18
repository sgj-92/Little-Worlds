import type { GenerationJob, ListeningProgress, ParentSettings, Story, StoryRequest } from '@/domain/types';
import type { Store } from './store';

/**
 * Provider interfaces. The UI only depends on these; Milestone 1 ships mock adapters
 * (src/services/mock), later milestones add Supabase + server-side AI adapters.
 */

export interface StoryRepository {
  readonly stories: Store<Story[]>;
  get(id: string): Story | undefined;
  save(story: Story): void;
  updateProgress(id: string, progress: ListeningProgress): void;
  remove(id: string): void;
  clear(): void;
}

export interface SettingsRepository {
  readonly settings: Store<ParentSettings>;
  update(patch: (prev: ParentSettings) => ParentSettings): void;
  reset(): void;
}

export interface StoryGenerator {
  readonly jobs: Store<GenerationJob[]>;
  /** Live adapters must perform these server-side; the client never sees provider keys. */
  start(request: StoryRequest): GenerationJob;
  retry(jobId: string): void;
  cancel(jobId: string): void;
  dismiss(jobId: string): void;
  /** True when this adapter does not call real AI providers. */
  readonly isMock: boolean;
}

export interface SpeechCapture {
  readonly isMock: boolean;
  /** Begin listening. `onLevel` receives a 0..1 input level for visual feedback. */
  start(onLevel: (level: number) => void): Promise<void>;
  /** Stop listening and resolve with the transcription. */
  stop(): Promise<string>;
  cancel(): void;
}

export interface ParentGateSession {
  isUnlocked(): boolean;
  unlock(): void;
  lock(): void;
}

export interface Services {
  stories: StoryRepository;
  settings: SettingsRepository;
  generator: StoryGenerator;
  speech: SpeechCapture;
  parentGate: ParentGateSession;
  now: () => Date;
}
