import { MagicBook } from './art/MagicBook';

/** Shown while the account and family settings load. */
export function Splash({ label = 'Opening your storybook…' }: { label?: string }) {
  return (
    <div role="status" className="paper flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <MagicBook className="w-40" />
      <p className="font-display text-xl font-semibold text-navy-700">{label}</p>
    </div>
  );
}
