/**
 * Core domain types. These mirror the planned Supabase schema (see docs/ARCHITECTURE.md)
 * so that swapping mock adapters for live ones does not change UI code.
 */

export type ArtTheme = 'moonlit-forest' | 'ocean' | 'sky-castle' | 'space' | 'garden' | 'snow';

export type DurationMinutes = 5 | 10 | 15;

export type AgeBand = '3-4' | '5-6' | '7-8' | '9-10';

export type StoryTone = 'gentle' | 'playful' | 'adventurous';

export type AvoidTopic = 'monsters' | 'darkness' | 'storms' | 'getting-lost' | 'villains' | 'loud-noises';

export type AvatarId = 'fox' | 'owl' | 'bunny' | 'bear' | 'whale' | 'dragon';

/** Where a story came from — lets the UI be honest about mocked content. */
export type StorySource = 'sample' | 'prototype-template' | 'ai';

export interface Scene {
  id: string;
  text: string;
  /** Visual composition variant for the scene illustration. */
  artVariant: number;
  durationSec: number;
}

export interface ListeningProgress {
  positionSec: number;
  completed: boolean;
  lastPlayedAt: string | null;
}

export interface Story {
  id: string;
  title: string;
  createdAt: string;
  prompt: string;
  durationMinutes: DurationMinutes;
  illustrated: boolean;
  theme: ArtTheme;
  scenes: Scene[];
  source: StorySource;
  listening: ListeningProgress;
}

export interface StoryRequest {
  prompt: string;
  durationMinutes: DurationMinutes;
  illustrated: boolean;
}

export interface ChildProfile {
  name: string;
  ageBand: AgeBand;
  avatar: AvatarId;
}

export interface ContentPreferences {
  tone: StoryTone;
  bedtimeEndings: boolean;
  avoidTopics: AvoidTopic[];
  /** Extra words a parent never wants to appear in a story idea or story. */
  customBlockedWords: string[];
}

export interface GenerationLimits {
  storiesPerDay: number;
  maxDurationMinutes: DurationMinutes;
  allowIllustrations: boolean;
  monthlyBudgetGbp: number;
}

export type SimulatedFailure = 'none' | 'writing' | 'illustrating' | 'narrating';

export interface PrototypeOptions {
  /** Forces the first attempt of a stage to fail, to review recovery UX. */
  simulateFailure: SimulatedFailure;
}

export interface ParentSettings {
  child: ChildProfile;
  content: ContentPreferences;
  limits: GenerationLimits;
  defaults: { durationMinutes: DurationMinutes; illustrated: boolean };
  prototype: PrototypeOptions;
}

export type GenerationStage = 'writing' | 'illustrating' | 'narrating';

export type StageStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

export type JobStatus = 'running' | 'failed' | 'complete' | 'cancelled';

export interface GenerationJob {
  id: string;
  request: StoryRequest;
  status: JobStatus;
  stages: Record<GenerationStage, StageStatus>;
  /** 0..1 progress within the currently running stage. */
  stageProgress: number;
  attempts: number;
  error: { stage: GenerationStage; message: string } | null;
  storyId: string | null;
  createdAt: string;
  updatedAt: string;
}
