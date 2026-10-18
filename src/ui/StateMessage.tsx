import type { ReactNode } from 'react';
import { cn } from './cn';

/** Shared layout for empty, error and success states so they always look consistent. */
export function StateMessage({
  art,
  title,
  body,
  actions,
  tone = 'neutral',
  className,
}: {
  art: ReactNode;
  title: string;
  body?: ReactNode;
  actions?: ReactNode;
  tone?: 'neutral' | 'error' | 'success';
  className?: string;
}) {
  const ring = { neutral: 'bg-lilac-100 text-lilac-700', error: 'bg-rose-100 text-rose-700', success: 'bg-mint-100 text-mint-700' }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : undefined} className={cn('mx-auto flex max-w-sm animate-pop-in flex-col items-center px-6 py-10 text-center', className)}>
      <div className={cn('mb-5 flex size-24 items-center justify-center rounded-full', ring)}>{art}</div>
      <h2 className="text-2xl font-semibold text-navy-900">{title}</h2>
      {body && <div className="mt-2 text-navy-500">{body}</div>}
      {actions && <div className="mt-6 flex w-full flex-col items-stretch gap-3">{actions}</div>}
    </div>
  );
}
