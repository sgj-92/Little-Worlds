import type { GenerationLimits } from './types';

/** Placeholder unit costs used only to illustrate the budget UI in the prototype. */
export const ESTIMATED_COST_GBP = { perMinuteNarration: 0.03, perStoryText: 0.02, perIllustration: 0.04 } as const;

export function estimateStoryCostGbp(minutes: number, illustrated: boolean, sceneCount: number): number {
  const cost =
    ESTIMATED_COST_GBP.perStoryText +
    minutes * ESTIMATED_COST_GBP.perMinuteNarration +
    (illustrated ? sceneCount * ESTIMATED_COST_GBP.perIllustration : 0);
  return Math.round(cost * 100) / 100;
}

function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function storiesCreatedToday(createdAt: readonly string[], now: Date): number {
  return createdAt.filter((iso) => sameLocalDay(new Date(iso), now)).length;
}

export function remainingToday(limits: GenerationLimits, createdAt: readonly string[], now: Date): number {
  return Math.max(0, limits.storiesPerDay - storiesCreatedToday(createdAt, now));
}
