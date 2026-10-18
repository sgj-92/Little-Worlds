import type { GenerationJob, GenerationStage, StageStatus, StoryRequest } from './types';

export const STAGE_ORDER: readonly GenerationStage[] = ['writing', 'illustrating', 'narrating'];

export const STAGE_COPY: Record<GenerationStage, { label: string; running: string; failed: string }> = {
  writing: {
    label: 'Writing the story',
    running: 'Dreaming up the words…',
    failed: 'The story-writer dropped their pencil.',
  },
  illustrating: {
    label: 'Painting the pictures',
    running: 'Mixing the colours…',
    failed: 'The paint got a little smudged.',
  },
  narrating: {
    label: 'Recording the voice',
    running: 'Warming up the storyteller…',
    failed: 'The storyteller needs a sip of water.',
  },
};

export function createJob(id: string, request: StoryRequest, now: Date): GenerationJob {
  const iso = now.toISOString();
  return {
    id,
    request,
    status: 'running',
    stages: {
      writing: 'pending',
      illustrating: request.illustrated ? 'pending' : 'skipped',
      narrating: 'pending',
    },
    stageProgress: 0,
    attempts: 1,
    error: null,
    storyId: null,
    createdAt: iso,
    updatedAt: iso,
  };
}

/** The next stage that still needs work, or null when everything is done/skipped. */
export function nextStage(job: GenerationJob): GenerationStage | null {
  return STAGE_ORDER.find((s) => job.stages[s] === 'pending' || job.stages[s] === 'running' || job.stages[s] === 'failed') ?? null;
}

function touch(job: GenerationJob, now: Date, patch: Partial<GenerationJob>): GenerationJob {
  return { ...job, ...patch, updatedAt: now.toISOString() };
}

function withStage(job: GenerationJob, stage: GenerationStage, status: StageStatus): GenerationJob['stages'] {
  return { ...job.stages, [stage]: status };
}

export function startStage(job: GenerationJob, stage: GenerationStage, now: Date): GenerationJob {
  return touch(job, now, { stages: withStage(job, stage, 'running'), stageProgress: 0 });
}

export function reportProgress(job: GenerationJob, progress: number, now: Date): GenerationJob {
  return touch(job, now, { stageProgress: Math.min(1, Math.max(0, progress)) });
}

export function completeStage(job: GenerationJob, stage: GenerationStage, now: Date): GenerationJob {
  const stages = withStage(job, stage, 'done');
  const done = STAGE_ORDER.every((s) => stages[s] === 'done' || stages[s] === 'skipped');
  return touch(job, now, { stages, stageProgress: 0, status: done ? 'complete' : 'running' });
}

export function failStage(job: GenerationJob, stage: GenerationStage, message: string, now: Date): GenerationJob {
  return touch(job, now, {
    stages: withStage(job, stage, 'failed'),
    status: 'failed',
    error: { stage, message },
  });
}

/**
 * Retry resumes from the failed stage. Completed stages keep their stored output,
 * so a narration failure never re-pays for the story text or the illustrations.
 */
export function retryJob(job: GenerationJob, now: Date): GenerationJob {
  if (job.status !== 'failed' || !job.error) return job;
  return touch(job, now, {
    status: 'running',
    stages: withStage(job, job.error.stage, 'pending'),
    error: null,
    attempts: job.attempts + 1,
    stageProgress: 0,
  });
}

export function cancelJob(job: GenerationJob, now: Date): GenerationJob {
  if (job.status === 'complete') return job;
  return touch(job, now, { status: 'cancelled' });
}

/** Overall 0..1 progress across all non-skipped stages. */
export function overallProgress(job: GenerationJob): number {
  const active = STAGE_ORDER.filter((s) => job.stages[s] !== 'skipped');
  if (active.length === 0) return 1;
  const done = active.filter((s) => job.stages[s] === 'done').length;
  const running = active.some((s) => job.stages[s] === 'running') ? job.stageProgress : 0;
  return Math.min(1, (done + running) / active.length);
}

export function isActive(job: GenerationJob): boolean {
  return job.status === 'running' || job.status === 'failed';
}
