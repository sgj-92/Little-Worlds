import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockServices } from '../createMockServices';
import { memoryStorage } from '../store';
import { composeStory, pickTheme } from './storyTemplates';

describe('story templates', () => {
  it('picks a theme from the idea', () => {
    expect(pickTheme('a whale in the sea')).toBe('ocean');
    expect(pickTheme('a dragon in a castle')).toBe('sky-castle');
    expect(pickTheme('something unknown')).toBe('moonlit-forest');
  });
  it('scales scenes with duration and personalises', () => {
    const short = composeStory({ prompt: 'rocket to space', durationMinutes: 5, illustrated: true }, 'Sam', 's');
    const long = composeStory({ prompt: 'rocket to space', durationMinutes: 15, illustrated: true }, 'Sam', 's');
    expect(short.scenes).toHaveLength(4);
    expect(long.scenes).toHaveLength(8);
    expect(short.scenes.reduce((t, s) => t + s.durationSec, 0)).toBe(300);
    expect(short.scenes.map((s) => s.text).join(' ')).toContain('Sam');
  });
});

describe('mock story generator', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup() {
    const storage = memoryStorage();
    const services = createMockServices({ storage, sessionStorage: memoryStorage(), stageMs: { writing: 100, illustrating: 100, narrating: 100 }, tickMs: 10 });
    return { storage, services };
  }

  it('runs a job to completion and saves the story', async () => {
    const { services } = setup();
    const before = services.stories.stories.get().length;
    const job = services.generator.start({ prompt: 'A penguin in the snow', durationMinutes: 5, illustrated: true });
    await vi.advanceTimersByTimeAsync(1000);
    const done = services.generator.jobs.get().find((j) => j.id === job.id)!;
    expect(done.status).toBe('complete');
    expect(services.stories.stories.get()).toHaveLength(before + 1);
    expect(services.stories.get(done.storyId!)?.source).toBe('prototype-template');
  });

  it('fails on the simulated stage, then recovers on retry', async () => {
    const { services } = setup();
    services.settings.update((s) => ({ ...s, prototype: { simulateFailure: 'narrating' } }));
    const job = services.generator.start({ prompt: 'A whale', durationMinutes: 5, illustrated: true });
    await vi.advanceTimersByTimeAsync(1000);
    let current = services.generator.jobs.get().find((j) => j.id === job.id)!;
    expect(current.status).toBe('failed');
    expect(current.stages.illustrating).toBe('done');

    services.generator.retry(job.id);
    await vi.advanceTimersByTimeAsync(1000);
    current = services.generator.jobs.get().find((j) => j.id === job.id)!;
    expect(current.status).toBe('complete');
  });

  it('resumes running jobs after a reload', async () => {
    const { storage, services } = setup();
    const job = services.generator.start({ prompt: 'A bunny', durationMinutes: 5, illustrated: false });
    services.generator.dispose();
    const reloaded = createMockServices({ storage, sessionStorage: memoryStorage(), stageMs: { writing: 100, illustrating: 100, narrating: 100 }, tickMs: 10 });
    await vi.advanceTimersByTimeAsync(1000);
    expect(reloaded.generator.jobs.get().find((j) => j.id === job.id)?.status).toBe('complete');
  });
});
