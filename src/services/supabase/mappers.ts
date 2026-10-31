import { defaultSettings } from '../defaults';
import type {
  AgeBand,
  ArtTheme,
  AvatarId,
  AvoidTopic,
  ChildProfile,
  DurationMinutes,
  ListeningProgress,
  ParentSettings,
  PrototypeOptions,
  Story,
  StorySource,
  StoryTone,
} from '@/domain/types';

/** Row shapes from supabase/migrations. Kept explicit so the mapping is unit-testable. */

export interface SceneRow {
  position: number;
  text: string;
  duration_sec: number | null;
  art_variant: number | null;
}

export interface ProgressRow {
  position_sec: number;
  completed: boolean;
  last_played_at: string | null;
}

export interface StoryRow {
  id: string;
  title: string;
  prompt: string;
  duration_minutes: number;
  illustrated: boolean;
  theme: string;
  source: string;
  created_at: string;
  story_scenes: SceneRow[] | null;
  listening_progress: ProgressRow | ProgressRow[] | null;
}

export interface FamilyRow {
  id: string;
  monthly_budget_pence: number;
  stories_per_day: number;
  max_duration_minutes: number;
  allow_illustrations: boolean;
  default_duration_minutes: number;
  default_illustrated: boolean;
}

export interface ChildRow {
  family_id: string;
  display_name: string;
  age_band: string;
  avatar: string;
  tone: string;
  bedtime_endings: boolean;
  avoid_topics: string[];
  custom_blocked_words: string[];
}

export const STORY_SELECT =
  'id,title,prompt,duration_minutes,illustrated,theme,source,created_at,story_scenes(position,text,duration_sec,art_variant),listening_progress(position_sec,completed,last_played_at)';

const THEMES: readonly ArtTheme[] = ['moonlit-forest', 'ocean', 'sky-castle', 'space', 'garden', 'snow'];
const AGE_BANDS: readonly AgeBand[] = ['3-4', '5-6', '7-8', '9-10'];
const AVATARS: readonly AvatarId[] = ['fox', 'owl', 'bunny', 'bear', 'whale', 'dragon'];
const TONES: readonly StoryTone[] = ['gentle', 'playful', 'adventurous'];
const TOPICS: readonly AvoidTopic[] = ['monsters', 'darkness', 'storms', 'getting-lost', 'villains', 'loud-noises'];
const SOURCES: readonly StorySource[] = ['sample', 'prototype-template', 'ai'];

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function toDuration(value: number): DurationMinutes {
  return value >= 15 ? 15 : value >= 10 ? 10 : 5;
}

export function storyFromRow(row: StoryRow): Story {
  const durationMinutes = toDuration(row.duration_minutes);
  const scenes = [...(row.story_scenes ?? [])].sort((a, b) => a.position - b.position);
  const fallbackSec = scenes.length ? Math.round((durationMinutes * 60) / scenes.length) : 0;
  const progress = Array.isArray(row.listening_progress) ? row.listening_progress[0] : row.listening_progress;
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    prompt: row.prompt,
    durationMinutes,
    illustrated: row.illustrated,
    theme: oneOf(row.theme, THEMES, 'moonlit-forest'),
    source: oneOf(row.source, SOURCES, 'ai'),
    scenes: scenes.map((s) => ({
      id: `${row.id}-${s.position}`,
      text: s.text,
      artVariant: s.art_variant ?? s.position % 4,
      durationSec: s.duration_sec ?? fallbackSec,
    })),
    listening: {
      positionSec: progress?.position_sec ?? 0,
      completed: progress?.completed ?? false,
      lastPlayedAt: progress?.last_played_at ?? null,
    },
  };
}

export function storyToRows(story: Story, familyId: string) {
  return {
    story: {
      id: story.id,
      family_id: familyId,
      title: story.title,
      prompt: story.prompt,
      duration_minutes: story.durationMinutes,
      illustrated: story.illustrated,
      theme: story.theme,
      source: story.source,
      // Template text is hand-written and pre-approved; AI stories are approved server-side.
      moderation_status: 'approved',
      created_at: story.createdAt,
    },
    scenes: story.scenes.map((s, position) => ({
      story_id: story.id,
      position,
      text: s.text,
      duration_sec: s.durationSec,
      art_variant: s.artVariant,
    })),
  };
}

export function progressToRow(storyId: string, familyId: string, p: ListeningProgress) {
  return {
    story_id: storyId,
    family_id: familyId,
    position_sec: Math.max(0, Math.round(p.positionSec)),
    completed: p.completed,
    last_played_at: p.lastPlayedAt,
  };
}

export function childFromRow(row: ChildRow): ChildProfile {
  return {
    name: row.display_name,
    ageBand: oneOf(row.age_band, AGE_BANDS, '5-6'),
    avatar: oneOf(row.avatar, AVATARS, 'fox'),
  };
}

export function settingsFromRows(family: FamilyRow | null, child: ChildRow | null, prototype: PrototypeOptions): ParentSettings {
  const base = defaultSettings();
  const maxDurationMinutes = family ? toDuration(family.max_duration_minutes) : base.limits.maxDurationMinutes;
  return {
    child: child ? childFromRow(child) : { ...base.child, name: '' },
    content: child
      ? {
          tone: oneOf(child.tone, TONES, 'gentle'),
          bedtimeEndings: child.bedtime_endings,
          avoidTopics: child.avoid_topics.filter((t): t is AvoidTopic => (TOPICS as readonly string[]).includes(t)),
          customBlockedWords: child.custom_blocked_words,
        }
      : base.content,
    limits: family
      ? {
          storiesPerDay: family.stories_per_day,
          maxDurationMinutes,
          allowIllustrations: family.allow_illustrations,
          monthlyBudgetGbp: Math.round(family.monthly_budget_pence / 100),
        }
      : base.limits,
    defaults: family
      ? {
          durationMinutes: Math.min(toDuration(family.default_duration_minutes), maxDurationMinutes) as DurationMinutes,
          illustrated: family.default_illustrated,
        }
      : base.defaults,
    prototype,
  };
}

export function familyPatch(s: ParentSettings): Omit<FamilyRow, 'id'> {
  return {
    monthly_budget_pence: Math.round(s.limits.monthlyBudgetGbp * 100),
    stories_per_day: s.limits.storiesPerDay,
    max_duration_minutes: s.limits.maxDurationMinutes,
    allow_illustrations: s.limits.allowIllustrations,
    default_duration_minutes: s.defaults.durationMinutes,
    default_illustrated: s.defaults.illustrated,
  };
}

export function childToRow(s: ParentSettings, familyId: string): ChildRow {
  return {
    family_id: familyId,
    display_name: s.child.name.trim().slice(0, 24) || 'Friend',
    age_band: s.child.ageBand,
    avatar: s.child.avatar,
    tone: s.content.tone,
    bedtime_endings: s.content.bedtimeEndings,
    avoid_topics: s.content.avoidTopics,
    custom_blocked_words: s.content.customBlockedWords,
  };
}
