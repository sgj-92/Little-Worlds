import { useId, type ReactNode } from 'react';
import { cn } from './cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  const id = useId();
  return (
    <div className={cn('flex min-h-14 items-center justify-between gap-4 py-2', disabled && 'opacity-50')}>
      <div className="min-w-0">
        <label htmlFor={id} className="block font-bold text-navy-900">
          {label}
        </label>
        {description && <p className="text-sm text-navy-500">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'pressable relative h-8 w-14 shrink-0 rounded-full transition-colors',
          checked ? 'bg-mint-500' : 'bg-navy-300/60',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 size-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-(--ease-bounce)',
            checked && 'translate-x-6',
          )}
        />
      </button>
    </div>
  );
}
