import { AlertCircle, ChevronRight, Wand2 } from 'lucide-react';
import { Link } from 'react-router';
import { overallProgress } from '@/domain/generation';
import { useJobs } from '@/state/hooks';
import { ProgressBar } from '@/ui/Progress';
import { cn } from '@/ui/cn';

/** Surfaces a story still being made (or needing a retry) so it is never lost. */
export function ActiveJobBanner() {
  const job = useJobs().find((j) => j.status === 'running' || j.status === 'failed');
  if (!job) return null;
  const failed = job.status === 'failed';
  return (
    <Link
      to={`/making/${job.id}`}
      className={cn(
        'pressable mt-2 flex animate-pop-in items-center gap-3 rounded-3xl p-3 pr-4 ring-1',
        failed ? 'bg-rose-100 ring-rose-500/25' : 'bg-lilac-100 ring-lilac-300/60',
      )}
    >
      <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-full', failed ? 'bg-rose-500 text-white' : 'bg-lilac-600 text-white')}>
        {failed ? <AlertCircle aria-hidden className="size-6" /> : <Wand2 aria-hidden className="size-6 animate-breathe" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold">{failed ? 'Your story needs a little help' : 'Your story is being made…'}</p>
        {failed ? (
          <p className="text-sm text-navy-700">Tap to try again</p>
        ) : (
          <ProgressBar className="mt-1.5" tone="lilac" value={overallProgress(job)} label="Story progress" />
        )}
      </div>
      <ChevronRight aria-hidden className="size-6 shrink-0 text-navy-500" />
    </Link>
  );
}
