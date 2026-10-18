import type { SpeechCapture } from '../types';

export const SAMPLE_TRANSCRIPTS = [
  'A little dragon who is scared of the dark and makes friends with a firefly',
  'A whale who sings to the fish in the ocean every night',
  'A bunny who plants magic rainbow seeds in the garden',
  'A robot who flies a rocket to count all the stars',
  'A penguin who wants to see the northern lights',
] as const;

/**
 * PROTOTYPE ONLY. Animates a fake input level and returns a sample idea.
 * No microphone access and no audio leaves the device. The UI labels the result
 * as a sample transcription so it is never mistaken for real speech recognition.
 */
export function createMockSpeechCapture(opts: { processingMs?: number } = {}): SpeechCapture {
  const processingMs = opts.processingMs ?? 900;
  let timer: ReturnType<typeof setInterval> | undefined;
  let index = 0;
  let t = 0;

  const clear = () => {
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
  };

  return {
    isMock: true,
    async start(onLevel) {
      clear();
      t = 0;
      timer = setInterval(() => {
        t += 1;
        onLevel(0.35 + 0.3 * Math.abs(Math.sin(t / 2.3)) + 0.25 * Math.abs(Math.sin(t / 0.9)));
      }, 90);
    },
    async stop() {
      clear();
      await new Promise((r) => setTimeout(r, processingMs));
      const text = SAMPLE_TRANSCRIPTS[index % SAMPLE_TRANSCRIPTS.length]!;
      index += 1;
      return text;
    },
    cancel: clear,
  };
}
