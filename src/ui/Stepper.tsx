import { Minus, Plus } from 'lucide-react';
import { IconButton } from './IconButton';

export function Stepper({ label, value, min, max, step = 1, format = String, onChange, description }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  description?: string;
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 py-2">
      <div>
        <p className="font-bold">{label}</p>
        {description && <p className="text-sm text-navy-500">{description}</p>}
      </div>
      <div className="flex items-center gap-1 rounded-full bg-cream-100 p-1 ring-1 ring-navy-900/8">
        <IconButton label={`Decrease ${label.toLowerCase()}`} onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min}>
          <Minus aria-hidden className="size-5" />
        </IconButton>
        <output aria-live="polite" aria-label={label} className="min-w-12 text-center text-lg font-extrabold tabular-nums">
          {format(value)}
        </output>
        <IconButton label={`Increase ${label.toLowerCase()}`} onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max}>
          <Plus aria-hidden className="size-5" />
        </IconButton>
      </div>
    </div>
  );
}
