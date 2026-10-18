import type { DurationMinutes } from './types';

export interface DurationOption {
  minutes: DurationMinutes;
  label: string;
  /** Number of moons shown on the tile so non-readers can compare lengths. */
  moons: 1 | 2 | 3;
  sceneCount: number;
}

export const DURATION_OPTIONS: readonly DurationOption[] = [
  { minutes: 5, label: 'Short', moons: 1, sceneCount: 4 },
  { minutes: 10, label: 'Medium', moons: 2, sceneCount: 6 },
  { minutes: 15, label: 'Long', moons: 3, sceneCount: 8 },
];

export function durationOption(minutes: DurationMinutes): DurationOption {
  const option = DURATION_OPTIONS.find((o) => o.minutes === minutes);
  if (!option) throw new Error(`Unknown duration: ${minutes}`);
  return option;
}

export function allowedDurations(max: DurationMinutes): DurationOption[] {
  return DURATION_OPTIONS.filter((o) => o.minutes <= max);
}

/** Clamp a requested duration to the parent-configured maximum. */
export function clampDuration(requested: DurationMinutes, max: DurationMinutes): DurationMinutes {
  return requested <= max ? requested : max;
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
