import { describe, expect, it } from 'vitest';
import { cancelJob, completeStage, createJob, failStage, nextStage, overallProgress, retryJob, startStage } from './generation';

const now = new Date('2026-10-18T10:00:00Z');
const request = { prompt: 'A fox in the forest', durationMinutes: 5 as const, illustrated: true };

describe('generation job state machine', () => {
  it('skips illustration when pictures are off', () => {
    const job = createJob('j', { ...request, illustrated: false }, now);
    expect(job.stages.illustrating).toBe('skipped');
    const afterWriting = completeStage(job, 'writing', now);
    expect(nextStage(afterWriting)).toBe('narrating');
  });

  it('completes when every active stage is done', () => {
    let job = createJob('j', request, now);
    for (const s of ['writing', 'illustrating', 'narrating'] as const) job = completeStage(startStage(job, s, now), s, now);
    expect(job.status).toBe('complete');
    expect(overallProgress(job)).toBe(1);
  });

  it('retries only the failed stage and keeps completed work', () => {
    let job = createJob('j', request, now);
    job = completeStage(job, 'writing', now);
    job = completeStage(job, 'illustrating', now);
    job = failStage(startStage(job, 'narrating', now), 'narrating', 'oops', now);
    expect(job.status).toBe('failed');

    const retried = retryJob(job, now);
    expect(retried.status).toBe('running');
    expect(retried.attempts).toBe(2);
    expect(retried.stages).toEqual({ writing: 'done', illustrating: 'done', narrating: 'pending' });
    expect(nextStage(retried)).toBe('narrating');
  });

  it('reports overall progress across active stages', () => {
    let job = createJob('j', request, now);
    job = completeStage(job, 'writing', now);
    job = { ...startStage(job, 'illustrating', now), stageProgress: 0.5 };
    expect(overallProgress(job)).toBeCloseTo(0.5);
  });

  it('does not cancel a completed job', () => {
    const job = { ...createJob('j', request, now), status: 'complete' as const };
    expect(cancelJob(job, now).status).toBe('complete');
  });
});
