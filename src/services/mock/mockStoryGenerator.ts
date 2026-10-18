import { durationOption } from '@/domain/durations';
import {
  STAGE_COPY,
  cancelJob,
  completeStage,
  createJob,
  failStage,
  nextStage,
  reportProgress,
  retryJob,
  startStage,
} from '@/domain/generation';
import { estimateStoryCostGbp } from '@/domain/limits';
import type { GenerationJob, GenerationStage, ParentSettings, Story } from '@/domain/types';
import { createId, createPersistentStore, type KeyValueStorage, type Store } from '../store';
import type { StoryGenerator, StoryRepository } from '../types';
import { composeStory } from './storyTemplates';

export interface UsageEvent {
  startedAt: string;
  estimatedCostGbp: number;
}

export interface MockGeneratorOptions {
  storage: KeyValueStorage;
  repository: StoryRepository;
  getSettings: () => ParentSettings;
  now: () => Date;
  /** Simulated duration of each stage. */
  stageMs?: Record<GenerationStage, number>;
  tickMs?: number;
}

export interface MockStoryGenerator extends StoryGenerator {
  readonly usage: Store<UsageEvent[]>;
  dispose(): void;
}

const DEFAULT_STAGE_MS: Record<GenerationStage, number> = { writing: 3200, illustrating: 3800, narrating: 3000 };

/**
 * PROTOTYPE ONLY. Simulates the asynchronous generation pipeline with timers and builds
 * the story from local templates. No network calls, no AI providers.
 */
export function createMockStoryGenerator(opts: MockGeneratorOptions): MockStoryGenerator {
  const stageMs = opts.stageMs ?? DEFAULT_STAGE_MS;
  const tickMs = opts.tickMs ?? 100;
  const jobs = createPersistentStore<GenerationJob[]>(opts.storage, 'lw.jobs.v1', () => []);
  const usage = createPersistentStore<UsageEvent[]>(opts.storage, 'lw.usage.v1', () => []);
  const timers = new Map<string, ReturnType<typeof setInterval>>();

  const find = (id: string) => jobs.get().find((j) => j.id === id);
  const put = (job: GenerationJob) => jobs.set((prev) => prev.map((j) => (j.id === job.id ? job : j)));

  function stop(id: string) {
    const t = timers.get(id);
    if (t !== undefined) clearInterval(t);
    timers.delete(id);
  }

  function finish(job: GenerationJob): GenerationJob {
    const storyId = job.storyId ?? createId('story');
    const composed = composeStory(job.request, opts.getSettings().child.name, storyId);
    const story: Story = {
      id: storyId,
      title: composed.title,
      createdAt: job.createdAt,
      prompt: job.request.prompt,
      durationMinutes: job.request.durationMinutes,
      illustrated: job.request.illustrated,
      theme: composed.theme,
      scenes: composed.scenes,
      source: 'prototype-template',
      listening: { positionSec: 0, completed: false, lastPlayedAt: null },
    };
    opts.repository.save(story);
    return { ...job, storyId };
  }

  function tick(id: string) {
    let job = find(id);
    if (!job || job.status !== 'running') return stop(id);
    const stage = nextStage(job);
    if (!stage) return stop(id);
    const now = opts.now();

    if (job.stages[stage] !== 'running') {
      put(startStage(job, stage, now));
      return;
    }
    const progress = job.stageProgress + tickMs / stageMs[stage];
    const failing = opts.getSettings().prototype.simulateFailure === stage && job.attempts === 1;
    if (failing && progress >= 0.6) {
      put(failStage(job, stage, STAGE_COPY[stage].failed, now));
      return stop(id);
    }
    if (progress < 1) {
      put(reportProgress(job, progress, now));
      return;
    }
    job = completeStage(job, stage, now);
    if (job.status === 'complete') {
      job = finish(job);
      stop(id);
    }
    put(job);
  }

  function run(id: string) {
    if (timers.has(id)) return;
    timers.set(id, setInterval(() => tick(id), tickMs));
  }

  // Resume jobs that were running when the app was closed — job state is persistent.
  for (const job of jobs.get()) if (job.status === 'running') run(job.id);

  return {
    isMock: true,
    jobs,
    usage,
    start(request) {
      const now = opts.now();
      const job = createJob(createId('job'), request, now);
      jobs.set((prev) => [job, ...prev]);
      const { sceneCount } = durationOption(request.durationMinutes);
      usage.set((prev) => [
        ...prev,
        { startedAt: now.toISOString(), estimatedCostGbp: estimateStoryCostGbp(request.durationMinutes, request.illustrated, sceneCount) },
      ]);
      run(job.id);
      return job;
    },
    retry(id) {
      const job = find(id);
      if (!job) return;
      put(retryJob(job, opts.now()));
      run(id);
    },
    cancel(id) {
      const job = find(id);
      if (!job) return;
      stop(id);
      put(cancelJob(job, opts.now()));
    },
    dismiss(id) {
      stop(id);
      jobs.set((prev) => prev.filter((j) => j.id !== id));
    },
    dispose() {
      for (const id of [...timers.keys()]) stop(id);
    },
  };
}
