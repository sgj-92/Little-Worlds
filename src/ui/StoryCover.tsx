import { Check } from 'lucide-react';
import { listeningFraction, listeningState } from '@/domain/story';
import type { Story } from '@/domain/types';
import { StoryArt, PlainCover } from './art/StoryArt';
import { cn } from './cn';

export function StoryCover({ story, className, showStatus = true }: { story: Story; className?: string; showStatus?: boolean }) {
  const state = listeningState(story);
  const fraction = listeningFraction(story);
  return (
    <div className={cn('@container relative aspect-square overflow-hidden rounded-3xl bg-cream-200 shadow-soft ring-1 ring-navy-900/5', className)}>
      {story.illustrated ? <StoryArt theme={story.theme} variant={0} /> : <PlainCover theme={story.theme} />}
      {showStatus && state === 'new' && (
        <span className="absolute top-2.5 left-2.5 rounded-full bg-honey-400 px-2.5 py-0.5 text-xs font-extrabold text-navy-950 shadow-sm">New</span>
      )}
      {showStatus && state === 'finished' && (
        <span className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-full bg-mint-500 text-white shadow-sm">
          <Check aria-hidden className="size-5" strokeWidth={3} />
          <span className="sr-only">Finished</span>
        </span>
      )}
      {showStatus && state === 'listening' && (
        <div className="absolute inset-x-3 bottom-3 h-2 overflow-hidden rounded-full bg-white/50 backdrop-blur-sm">
          <div className="h-full rounded-full bg-honey-400" style={{ width: `${Math.round(fraction * 100)}%` }} />
          <span className="sr-only">{Math.round(fraction * 100)}% listened</span>
        </div>
      )}
    </div>
  );
}

/** Placeholder while storybooks load. */
export function StoryCoverSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('aspect-square animate-shimmer rounded-3xl bg-[linear-gradient(90deg,var(--color-cream-200),var(--color-cream-50),var(--color-cream-200))] bg-[length:200%_100%]', className)} />
  );
}
