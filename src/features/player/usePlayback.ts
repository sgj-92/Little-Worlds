import { useCallback, useEffect, useRef, useState } from 'react';
import { sceneIndexAt, sceneStarts, totalDurationSec } from '@/domain/story';
import type { Story } from '@/domain/types';
import { useServices } from '@/services/ServicesContext';

const TICK_MS = 250;
const SAVE_EVERY_MS = 4000;

/**
 * Playback clock for the prototype player. Milestone 1 has no narration audio, so this
 * advances a timeline silently. The same interface will wrap an <audio> element once
 * stored narration files exist.
 */
export function usePlayback(story: Story) {
  const { stories, now } = useServices();
  const total = totalDurationSec(story);
  const [position, setPosition] = useState(() => (story.listening.completed ? 0 : Math.min(story.listening.positionSec, total)));
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const positionRef = useRef(position);
  const lastSave = useRef(0);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const save = useCallback(
    (pos: number, completed: boolean) => {
      stories.updateProgress(story.id, {
        positionSec: Math.round(pos),
        completed: completed || story.listening.completed,
        lastPlayedAt: now().toISOString(),
      });
      lastSave.current = Date.now();
    },
    [stories, story.id, story.listening.completed, now],
  );

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPosition((p) => {
        const next = Math.min(total, p + TICK_MS / 1000);
        if (next >= total) {
          setPlaying(false);
          setFinished(true);
          save(total, true);
        } else if (Date.now() - lastSave.current > SAVE_EVERY_MS) {
          save(next, false);
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, [playing, total, save]);

  // Persist the position when leaving the player.
  useEffect(() => () => {
    if (positionRef.current > 0 && positionRef.current < total) save(positionRef.current, false);
  }, [save, total]);

  const starts = sceneStarts(story.scenes);
  const sceneIndex = sceneIndexAt(story.scenes, position);

  const seek = useCallback(
    (sec: number) => {
      const clamped = Math.max(0, Math.min(total - 0.5, sec));
      setFinished(false);
      setPosition(clamped);
      save(clamped, false);
    },
    [total, save],
  );

  const toggle = useCallback(() => {
    if (finished) {
      setFinished(false);
      setPosition(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => {
      if (p) save(positionRef.current, false);
      return !p;
    });
  }, [finished, save]);

  return {
    position,
    total,
    playing,
    finished,
    sceneIndex,
    toggle,
    seek,
    skip: (delta: number) => seek(positionRef.current + delta),
    goToScene: (i: number) => seek((starts[Math.max(0, Math.min(starts.length - 1, i))] ?? 0) + 0.01),
    restart: () => {
      setFinished(false);
      setPosition(0);
      setPlaying(true);
    },
  };
}
