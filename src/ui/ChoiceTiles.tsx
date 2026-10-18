import { useId, type ReactNode } from 'react';
import { cn } from './cn';

export interface Choice<T extends string | number> {
  value: T;
  label: string;
  hint?: string;
  art?: ReactNode;
  disabled?: boolean;
}

/**
 * Radio group rendered as large picture tiles. Uses native radios, so arrow keys,
 * screen readers and form semantics work without extra code.
 */
export function ChoiceTiles<T extends string | number>({
  legend,
  choices,
  value,
  onChange,
  columns = 3,
  size = 'lg',
  hideLegend,
}: {
  legend: string;
  choices: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
  size?: 'md' | 'lg';
  hideLegend?: boolean;
}) {
  const name = useId();
  const cols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];
  return (
    <fieldset>
      <legend className={cn(size === 'lg' ? 'mb-3 font-display text-xl font-semibold' : 'mb-2 font-bold', hideLegend && 'sr-only')}>{legend}</legend>
      <div className={cn('grid gap-3', cols)}>
        {choices.map((c) => {
          const checked = c.value === value;
          return (
            <label
              key={String(c.value)}
              className={cn(
                'pressable relative flex cursor-pointer flex-col items-center justify-center rounded-3xl text-center ring-2 transition-colors',
                'has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-lilac-500',
                size === 'lg' ? 'min-h-28 gap-1.5 p-3' : 'min-h-14 gap-0.5 px-3 py-2',
                checked ? 'bg-lilac-100 text-lilac-700 ring-lilac-500' : 'bg-white/80 text-navy-900 ring-navy-900/8 hover:bg-white',
                c.disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={checked}
                disabled={c.disabled}
                onChange={() => onChange(c.value)}
              />
              {c.art}
              <span className="font-extrabold leading-tight">{c.label}</span>
              {c.hint && <span className={cn('text-sm font-semibold', checked ? 'text-lilac-600' : 'text-navy-500')}>{c.hint}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
