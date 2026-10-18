import { FlaskConical } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';

/**
 * Marks behaviour that is simulated in Milestone 1. Visible but quiet, so reviewers are
 * never misled while the child experience stays uncluttered.
 */
export function PrototypeNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      data-testid="prototype-note"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-dashed border-lilac-300 bg-lilac-50/80 px-3 py-1 text-xs font-bold text-lilac-700',
        className,
      )}
    >
      <FlaskConical aria-hidden className="size-3.5 shrink-0" />
      <span>
        <span className="sr-only">Prototype: </span>
        {children}
      </span>
    </p>
  );
}
