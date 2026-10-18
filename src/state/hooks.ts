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

export function useUsage() {
  const { generator, now } = useServices();
  const usage = useStore(generator.usage);
  const [settings] = useSettings();
  return useMemo(() => {
    const today = now();
    const month = usage.filter((u) => {
      const d = new Date(u.startedAt);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    });
    return {
      remainingToday: remainingToday(settings.limits, usage.map((u) => u.startedAt), today),
      monthCount: month.length,
      monthCostGbp: Math.round(month.reduce((s, u) => s + u.estimatedCostGbp, 0) * 100) / 100,
    };
  }, [usage, settings.limits, now]);
}
