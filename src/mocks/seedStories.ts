import type { DurationMinutes, Story } from '@/domain/types';
import { composeStory } from '@/services/mock/storyTemplates';

interface Seed {
  id: string;
  prompt: string;
  minutes: DurationMinutes;
  illustrated: boolean;
  daysAgo: number;
  /** Fraction listened; 1 = finished. */
  listened: number;
}

const SEEDS: Seed[] = [
  { id: 'sample_fox', prompt: 'A fox in the forest who helps the moon', minutes: 10, illustrated: true, daysAgo: 0, listened: 0.45 },
  { id: 'sample_whale', prompt: 'A whale who sings in the ocean', minutes: 5, illustrated: true, daysAgo: 1, listened: 1 },
  { id: 'sample_dragon', prompt: 'A dragon at the cloud castle fair', minutes: 10, illustrated: true, daysAgo: 2, listened: 0 },
  { id: 'sample_robot', prompt: 'A robot in space counting stars', minutes: 15, illustrated: true, daysAgo: 4, listened: 0.12 },
  { id: 'sample_penguin', prompt: 'A penguin in the snow looking for the northern lights', minutes: 5, illustrated: true, daysAgo: 6, listened: 1 },
  { id: 'sample_bunny', prompt: 'A bunny in the garden with magic seeds', minutes: 5, illustrated: false, daysAgo: 9, listened: 0 },
];

/** Clearly-labelled sample storybooks so the library is reviewable on first launch. */
export function seedStories(childName: string, now: Date): Story[] {
  return SEEDS.map((seed) => {
    const composed = composeStory({ prompt: seed.prompt, durationMinutes: seed.minutes, illustrated: seed.illustrated }, childName, seed.id);
    const total = composed.scenes.reduce((sum, s) => sum + s.durationSec, 0);
    const created = new Date(now.getTime() - seed.daysAgo * 86_400_000 - 3_600_000);
    return {
      id: seed.id,
      title: composed.title,
      createdAt: created.toISOString(),
      prompt: seed.prompt,
      durationMinutes: seed.minutes,
      illustrated: seed.illustrated,
      theme: composed.theme,
      scenes: composed.scenes,
      source: 'sample',
      listening: {
        positionSec: seed.listened >= 1 ? total : Math.round(total * seed.listened),
        completed: seed.listened >= 1,
        lastPlayedAt: seed.listened > 0 ? created.toISOString() : null,
      },
    };
  });
}
