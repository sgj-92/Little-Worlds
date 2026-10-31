import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  label: string;
  hint?: string;
  error?: string | null;
}

/** Labelled input with hint and error text. Password fields get a show/hide toggle. */
export function TextField({ label, hint, error, type = 'text', ...rest }: TextFieldProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-bold text-navy-900">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'min-h-14 w-full rounded-2xl bg-white px-4 text-lg font-semibold text-navy-900 shadow-soft ring-1 outline-none placeholder:font-normal placeholder:text-navy-300 focus:ring-2',
            error ? 'ring-rose-500 focus:ring-rose-500' : 'ring-navy-900/10 focus:ring-lilac-500',
            isPassword && 'pr-14',
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
            className="absolute top-1/2 right-1.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-xl text-navy-500 hover:bg-navy-900/5"
          >
            {reveal ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-navy-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-bold text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
