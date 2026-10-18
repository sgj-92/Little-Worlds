import type { ParentSettings } from '@/domain/types';

export function defaultSettings(): ParentSettings {
  return {
    child: { name: 'Maya', ageBand: '5-6', avatar: 'fox' },
    content: { tone: 'gentle', bedtimeEndings: true, avoidTopics: ['monsters'], customBlockedWords: [] },
    limits: { storiesPerDay: 3, maxDurationMinutes: 15, allowIllustrations: true, monthlyBudgetGbp: 10 },
    defaults: { durationMinutes: 5, illustrated: true },
    prototype: { simulateFailure: 'none' },
  };
}

/** Merge persisted settings over defaults so new fields survive upgrades. */
export function reviveSettings(raw: unknown): ParentSettings {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<ParentSettings>;
  return {
    child: { ...base.child, ...r.child },
    content: { ...base.content, ...r.content },
    limits: { ...base.limits, ...r.limits },
    defaults: { ...base.defaults, ...r.defaults },
    prototype: { ...base.prototype, ...r.prototype },
  };
}
