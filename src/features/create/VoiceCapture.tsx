import { Loader2, Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useServices } from '@/services/ServicesContext';
import { cn } from '@/ui/cn';

export type CaptureState = 'idle' | 'listening' | 'processing';

/** Big tap-to-talk button. Tap once to start, again to stop — no holding needed. */
export function VoiceCapture({ onTranscript, compact }: { onTranscript: (text: string) => void; compact?: boolean }) {
  const { speech } = useServices();
  const [state, setState] = useState<CaptureState>('idle');
  const [level, setLevel] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      speech.cancel();
    };
  }, [speech]);

  async function toggle() {
    if (state === 'idle') {
      setState('listening');
      await speech.start((l) => mounted.current && setLevel(l));
      return;
    }
    if (state === 'listening') {
      setState('processing');
      const text = await speech.stop();
      if (!mounted.current) return;
      setLevel(0);
      setState('idle');
      onTranscript(text);
    }
  }

  const label = state === 'listening' ? 'Stop and use my idea' : state === 'processing' ? 'Listening to your idea…' : 'Tap and tell me your idea';
  const size = compact ? 'size-20' : 'size-36 md:size-40';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        {state === 'listening' && (
          <>
            <span className="absolute inset-0 rounded-full bg-honey-300/50 transition-transform duration-100" style={{ transform: `scale(${1.15 + level * 0.45})` }} />
            <span className="absolute inset-0 rounded-full bg-honey-300/30 transition-transform duration-150" style={{ transform: `scale(${1.3 + level * 0.8})` }} />
          </>
        )}
        {state === 'idle' && !compact && <span className="absolute inset-0 animate-breathe rounded-full bg-honey-300/40" />}
        <button
          type="button"
          onClick={toggle}
          disabled={state === 'processing'}
          aria-label={label}
          aria-pressed={state === 'listening'}
          className={cn(
            'pressable relative flex items-center justify-center rounded-full shadow-[0_6px_0_0_var(--color-honey-700)] disabled:cursor-wait',
            state === 'listening' ? 'bg-rose-500 text-white shadow-[0_6px_0_0_var(--color-rose-700)]' : 'bg-honey-400 text-navy-950',
            size,
          )}
        >
          {state === 'processing' ? (
            <Loader2 aria-hidden className={cn('animate-spin', compact ? 'size-8' : 'size-14')} />
          ) : state === 'listening' ? (
            <Square aria-hidden className={compact ? 'size-7' : 'size-12'} fill="currentColor" />
          ) : (
            <Mic aria-hidden className={compact ? 'size-9' : 'size-16'} strokeWidth={2.2} />
          )}
        </button>
      </div>
      {!compact && (
        <p aria-live="polite" className="min-h-7 text-center text-lg font-bold text-navy-700">
          {state === 'listening' ? 'I’m listening… tap when you’re done' : state === 'processing' ? 'Thinking about your idea…' : 'Tap and tell me your story idea'}
        </p>
      )}
    </div>
  );
}
