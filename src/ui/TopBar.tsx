import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { IconButton } from './IconButton';
import { cn } from './cn';

export function TopBar({ title, backTo, trailing, className, onBack }: { title?: ReactNode; backTo?: string; trailing?: ReactNode; className?: string; onBack?: () => void }) {
  const navigate = useNavigate();
  const back = onBack ?? (() => (backTo ? navigate(backTo) : navigate(-1)));
  return (
    <header className={cn('flex min-h-16 items-center gap-2 px-3 pt-[max(env(safe-area-inset-top),0.5rem)]', className)}>
      <IconButton label="Go back" tone="soft" onClick={back}>
        <ChevronLeft aria-hidden className="size-6" strokeWidth={2.5} />
      </IconButton>
      <div className="min-w-0 flex-1 truncate text-center font-display text-lg font-semibold">{title}</div>
      <div className="flex min-w-12 justify-end">{trailing}</div>
    </header>
  );
}
