import { cn } from './cn';

export function ProgressBar({ value, label, className, tone = 'honey' }: { value: number; label: string; className?: string; tone?: 'honey' | 'lilac' | 'mint' }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const fill = { honey: 'bg-honey-400', lilac: 'bg-lilac-500', mint: 'bg-mint-500' }[tone];
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className={cn('h-2.5 overflow-hidden rounded-full bg-navy-900/8', className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-300 ease-out', fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 36, stroke = 4, label }: { value: number; size?: number; stroke?: number; label: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.18} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
    </svg>
  );
}
