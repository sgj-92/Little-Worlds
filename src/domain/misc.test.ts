import { describe, expect, it } from 'vitest';
import { allowedDurations, clampDuration, formatClock } from './durations';
import { greeting } from './greeting';
import { estimateStoryCostGbp, remainingToday } from './limits';
import { checkAnswer, createChallenge } from './parentGate';
import { sceneIndexAt } from './story';

describe('durations', () => {
  it('respects the parent maximum', () => {
    expect(allowedDurations(10).map((d) => d.minutes)).toEqual([5, 10]);
    expect(clampDuration(15, 10)).toBe(10);
  });
  it('formats clock time', () => {
    expect(formatClock(65)).toBe('1:05');
    expect(formatClock(-3)).toBe('0:00');
  });
});

describe('greeting', () => {
  it('follows the time of day', () => {
    expect(greeting('Maya', new Date('2026-10-18T08:00:00'))).toBe('Good morning, Maya');
    expect(greeting('', new Date('2026-10-18T21:00:00'))).toBe('Sleepy time, friend');
  });
});

describe('limits', () => {
  const limits = { storiesPerDay: 2, maxDurationMinutes: 15 as const, allowIllustrations: true, monthlyBudgetGbp: 10 };
  it('counts only today’s stories', () => {
    const now = new Date('2026-10-18T12:00:00');
    expect(remainingToday(limits, ['2026-10-18T09:00:00', '2026-10-17T09:00:00'], now)).toBe(1);
    expect(remainingToday(limits, ['2026-10-18T09:00:00', '2026-10-18T10:00:00', '2026-10-18T11:00:00'], now)).toBe(0);
  });
  it('charges more for illustrated stories', () => {
    expect(estimateStoryCostGbp(5, true, 4)).toBeGreaterThan(estimateStoryCostGbp(5, false, 4));
  });
});

describe('parent gate', () => {
  it('accepts only the right product', () => {
    const c = createChallenge(() => 0.5);
    expect(checkAnswer(c, String(c.answer))).toBe(true);
    expect(checkAnswer(c, String(c.answer + 1))).toBe(false);
    expect(checkAnswer(c, '')).toBe(false);
  });
});

describe('scene lookup', () => {
  it('finds the scene for a position', () => {
    const scenes = [10, 10, 10].map((d, i) => ({ id: String(i), text: '', artVariant: 0, durationSec: d }));
    expect(sceneIndexAt(scenes, 0)).toBe(0);
    expect(sceneIndexAt(scenes, 15)).toBe(1);
    expect(sceneIndexAt(scenes, 29)).toBe(2);
  });
});
