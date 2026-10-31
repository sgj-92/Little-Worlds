import { useMemo, useSyncExternalStore } from 'react';
import { remainingToday } from '@/domain/limits';
import type { Store } from '@/services/store';
import { useServices } from '@/services/ServicesContext';

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

export function useSettings() {
  const { settings } = useServices();
  return [useStore(settings.settings), settings.update] as const;
}

/** Stories newest first. */
export function useStories() {
  const { stories } = useServices();
  const list = useStore(stories.stories);
  return useMemo(() => [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [list]);
}

export function useStory(id: string | undefined) {
  const { stories } = useServices();
  const list = useStore(stories.stories);
  return id ? list.find((s) => s.id === id) : undefined;
}

export function useJobs() {
  const { generator } = useServices();
  return useStore(generator.jobs);
}

export function useJob(id: string | undefined) {
  return useJobs().find((j) => j.id === id);
}

export function useStoriesStatus() {
  const { stories } = useServices();
  return useStore(stories.status);
}

/**
 * Daily allowance counts stories made today plus stories still being made, so it holds
 * across devices in live mode. Monthly cost uses the local estimate until Milestone 3
 * moves metering server-side.
 */
export function useUsage() {
  const { generator, stories: repo, now } = useServices();
  const usage = useStore(generator.usage);
  const stories = useStore(repo.stories);
  const jobs = useStore(generator.jobs);
  const [settings] = useSettings();
  return useMemo(() => {
    const today = now();
    const made = stories.filter((s) => s.source !== 'sample').map((s) => s.createdAt);
    const inFlight = jobs.filter((j) => j.status === 'running' || j.status === 'failed').map((j) => j.createdAt);
    const month = usage.filter((u) => {
      const d = new Date(u.startedAt);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    });
    return {
      remainingToday: remainingToday(settings.limits, [...made, ...inFlight], today),
      monthCount: month.length,
      monthCostGbp: Math.round(month.reduce((s, u) => s + u.estimatedCostGbp, 0) * 100) / 100,
    };
  }, [usage, stories, jobs, settings.limits, now]);
}
