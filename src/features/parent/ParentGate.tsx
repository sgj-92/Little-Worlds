import { Delete, Lock } from 'lucide-react';
import { useState } from 'react';
import { checkAnswer, createChallenge } from '@/domain/parentGate';
import { TopBar } from '@/ui/TopBar';
import { cn } from '@/ui/cn';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'] as const;

/** Keeps the settings area for grown-ups without needing an account password. */
export function ParentGate({ onUnlock }: { onUnlock: () => void }) {
  const [challenge, setChallenge] = useState(() => createChallenge());
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);

  function press(key: (typeof KEYS)[number]) {
    setWrong(false);
    if (key === 'del') return setInput((v) => v.slice(0, -1));
    if (key === 'ok') {
      if (checkAnswer(challenge, input)) return onUnlock();
      setWrong(true);
      setInput('');
      setChallenge(createChallenge());
      return;
    }
    setInput((v) => (v.length >= 3 ? v : v + key));
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar backTo="/" />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-10">
        <span className="flex size-16 items-center justify-center rounded-full bg-lilac-100 text-lilac-700">
          <Lock aria-hidden className="size-8" />
        </span>
        <div className="text-center">
          <h1 className="text-3xl font-semibold">For grown-ups</h1>
          <p className="mt-1 text-navy-500">Answer to open settings</p>
        </div>
        <p className="font-display text-4xl font-semibold" id="gate-question">
          {challenge.a} × {challenge.b} = ?
        </p>
        <div
          aria-live="polite"
          aria-labelledby="gate-question"
          className={cn(
            'flex h-16 w-40 items-center justify-center rounded-2xl bg-white text-3xl font-extrabold tabular-nums shadow-soft ring-2 transition-colors',
            wrong ? 'animate-[pop-in_400ms_var(--ease-bounce)] ring-rose-500' : 'ring-navy-900/8',
          )}
        >
          {input || <span className="text-navy-300">—</span>}
        </div>
        <p role={wrong ? 'alert' : undefined} className={cn('-mt-3 h-5 text-sm font-bold text-rose-700', !wrong && 'invisible')}>
          Not quite — here’s a new one.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={k === 'del' ? 'Delete' : k === 'ok' ? 'Check answer' : k}
              className={cn(
                'pressable flex size-18 items-center justify-center rounded-3xl text-2xl font-extrabold',
                k === 'ok' ? 'bg-lilac-600 text-white shadow-[0_4px_0_0_var(--color-lilac-700)]' : 'bg-white text-navy-900 shadow-soft ring-1 ring-navy-900/6',
              )}
            >
              {k === 'del' ? <Delete aria-hidden className="size-6" /> : k === 'ok' ? 'OK' : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
