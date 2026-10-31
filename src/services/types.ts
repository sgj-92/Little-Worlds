import type { ChildProfile, GenerationJob, ListeningProgress, ParentSettings, Story, StoryRequest } from '@/domain/types';
import type { Store } from './store';

/**
 * Provider interfaces. The UI only depends on these. Adapters:
 * - `mock/`     — local, credential-free (demo mode and tests)
 * - `supabase/` — accounts and persistence (Milestone 2)
 * Story generation stays mocked until the server pipeline lands in Milestone 3.
 */

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export type ProfileStatus = 'loading' | 'needs-onboarding' | 'ready' | 'error';

export type SaveStatus = 'saved' | 'saving' | 'error';

export type Result = { ok: true } | { ok: false; message: string };

export interface StoryRepository {
  readonly stories: Store<Story[]>;
  readonly status: Store<LoadStatus>;
  get(id: string): Story | undefined;
  /** Writes are optimistic: the store updates first, then the backend. */
  save(story: Story): Promise<Result>;
  updateProgress(id: string, progress: ListeningProgress): void;
  remove(id: string): Promise<Result>;
  clear(): Promise<Result>;
  reload(): void;
}

export interface SettingsRepository {
  readonly settings: Store<ParentSettings>;
  readonly profile: Store<ProfileStatus>;
  readonly saveStatus: Store<SaveStatus>;
  update(patch: (prev: ParentSettings) => ParentSettings): void;
  completeOnboarding(child: ChildProfile): Promise<Result>;
  reload(): void;
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

export type AuthProvider = 'google' | 'apple';

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; userId: string; email: string | null };

export type SignUpResult = { ok: true; needsConfirmation: boolean } | { ok: false; message: string };

/** Parent account. Children never have their own login. */
export interface AuthService {
  readonly isMock: boolean;
  readonly state: Store<AuthState>;
  /** Social providers switched on for this deployment. */
  readonly providers: readonly AuthProvider[];
  signUp(email: string, password: string): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<Result>;
  /** Redirects away to the provider; resolves only if the redirect could not start. */
  signInWithProvider(provider: AuthProvider): Promise<Result>;
  sendPasswordReset(email: string): Promise<Result>;
  updatePassword(password: string): Promise<Result>;
  signOut(): Promise<void>;
}

export type ServicesMode = 'demo' | 'live';

export interface Services {
  mode: ServicesMode;
  auth: AuthService;
  stories: StoryRepository;
  settings: SettingsRepository;
  generator: StoryGenerator;
  speech: SpeechCapture;
  parentGate: ParentGateSession;
  now: () => Date;
}
