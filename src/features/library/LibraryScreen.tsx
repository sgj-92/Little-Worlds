import { BookHeart, Check, CloudOff, Headphones, Library, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { listeningState, type ListeningState } from '@/domain/story';
import { useServices } from '@/services/ServicesContext';
import { useStories, useStoriesStatus } from '@/state/hooks';
import { Button, ButtonLink } from '@/ui/Button';
import { StateMessage } from '@/ui/StateMessage';
import { StoryCover, StoryCoverSkeleton } from '@/ui/StoryCover';
import { cn } from '@/ui/cn';

type Filter = 'all' | ListeningState;

const FILTERS: { value: Filter; label: string; icon: typeof Library }[] = [
  { value: 'all', label: 'All', icon: Library },
  { value: 'listening', label: 'Listening', icon: Headphones },
  { value: 'new', label: 'New', icon: Star },
  { value: 'finished', label: 'Finished', icon: Check },
];

const EMPTY_COPY: Record<Exclude<Filter, 'all'>, string> = {
  listening: 'Stories you’re partway through will wait for you here.',
  new: 'You’ve listened to every story. Time to make a new one!',
  finished: 'Stories you listen to all the way to the end will appear here.',
};

export function LibraryScreen() {
  const stories = useStories();
  const status = useStoriesStatus();
  const { stories: repo } = useServices();
  const [filter, setFilter] = useState<Filter>('all');
  const shown = filter === 'all' ? stories : stories.filter((s) => listeningState(s) === filter);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-36 md:px-8">
      <header className="flex items-end justify-between gap-4 py-3">
        <h1 className="text-[2rem] leading-tight font-semibold md:text-4xl">My storybooks</h1>
        {stories.length > 0 && <p className="pb-1 font-bold text-navy-500">{stories.length} stories</p>}
      </header>

      {status === 'loading' && stories.length === 0 ? (
        <ul aria-label="Loading storybooks" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i}>
              <StoryCoverSkeleton />
            </li>
          ))}
        </ul>
      ) : status === 'error' ? (
        <StateMessage
          tone="error"
          art={<CloudOff aria-hidden className="size-12" />}
          title="We couldn’t fetch your storybooks"
          body="Please check your connection and try again."
          actions={
            <Button size="lg" onClick={repo.reload}>
              Try again
            </Button>
          }
        />
      ) : stories.length === 0 ? (
        <StateMessage
          art={<BookHeart aria-hidden className="size-12" />}
          title="Your bookshelf is empty"
          body="Every story you make will be saved here, ready to listen again."
          actions={
            <ButtonLink to="/create" size="xl" icon={<Sparkles aria-hidden className="size-6" />}>
              Make my first story
            </ButtonLink>
          }
        />
      ) : (
        <>
          <div role="radiogroup" aria-label="Show stories" className="-mx-5 flex gap-2 overflow-x-auto px-5 py-2">
            {FILTERS.map(({ value, label, icon: Icon }) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFilter(value)}
                  className={cn(
                    'pressable flex min-h-12 shrink-0 items-center gap-2 rounded-full px-4 font-extrabold ring-1',
                    active ? 'bg-navy-900 text-cream-50 ring-navy-900' : 'bg-white/80 text-navy-700 ring-navy-900/8 hover:bg-white',
                  )}
                >
                  <Icon aria-hidden className="size-5" />
                  {label}
                </button>
              );
            })}
          </div>

          {shown.length === 0 ? (
            <StateMessage art={<Library aria-hidden className="size-12" />} title="Nothing here yet" body={EMPTY_COPY[filter as Exclude<Filter, 'all'>]} />
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
              {shown.map((story, i) => (
                <li key={story.id} className="animate-pop-in" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                  <Link to={`/story/${story.id}`} className="pressable block rounded-3xl">
                    <StoryCover story={story} />
                    <p className="mt-2 line-clamp-2 px-1 leading-snug font-extrabold">{story.title}</p>
                    <p className="px-1 text-sm font-bold text-navy-500">
                      {story.durationMinutes} min{story.source === 'sample' ? ' · Sample' : ''}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
