import type { Scene, Story } from './types';

export function totalDurationSec(story: Pick<Story, 'scenes'>): number {
  return story.scenes.reduce((sum, s) => sum + s.durationSec, 0);
}

/** Start offset (seconds) of each scene. */
export function sceneStarts(scenes: readonly Scene[]): number[] {
  const starts: number[] = [];
  let t = 0;
  for (const s of scenes) {
    starts.push(t);
    t += s.durationSec;
  }
  return starts;
}

export function sceneIndexAt(scenes: readonly Scene[], positionSec: number): number {
  const starts = sceneStarts(scenes);
  let index = 0;
  for (let i = 0; i < starts.length; i++) if (positionSec >= (starts[i] ?? 0)) index = i;
  return index;
}

export function listeningFraction(story: Story): number {
  if (story.listening.completed) return 1;
  const total = totalDurationSec(story);
  return total === 0 ? 0 : Math.min(1, story.listening.positionSec / total);
}

export type ListeningState = 'new' | 'listening' | 'finished';

export function listeningState(story: Story): ListeningState {
  if (story.listening.completed) return 'finished';
  if (story.listening.positionSec > 0) return 'listening';
  return 'new';
}
