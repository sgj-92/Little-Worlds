import { ChevronRight, Lock, Mic, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { greeting } from '@/domain/greeting';
import { listeningFraction, listeningState } from '@/domain/story';
import { useServices } from '@/services/ServicesContext';
import { useSettings, useStories } from '@/state/hooks';
import { Avatar } from '@/ui/Avatar';
import { IconLink } from '@/ui/IconButton';
import { ProgressBar } from '@/ui/Progress';
import { StoryCover } from '@/ui/StoryCover';
import { StoryArt } from '@/ui/art/StoryArt';
import { ActiveJobBanner } from './ActiveJobBanner';

export function HomeScreen() {
  const { now } = useServices();
  const [settings] = useSettings();
  const stories = useStories();
  const keepListening = stories
    .filter((s) => listeningState(s) === 'listening')
    .sort((a, b) => (b.listening.lastPlayedAt ?? '').localeCompare(a.listening.lastPlayedAt ?? ''))[0];
  const recent = stories.filter((s) => s.id !== keepListening?.id).slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-36 md:px-8">
      <header className="flex items-center gap-3 py-3">
        <Avatar id={settings.child.avatar} />
        <h1 className="min-w-0 flex-1 text-[1.75rem] leading-tight font-semibold md:text-4xl">{greeting(settings.child.name, now())}</h1>
        <IconLink to="/parent" label="Grown-ups" tone="soft">
          <Lock aria-hidden className="size-5" strokeWidth={2.4} />
        </IconLink>
      </header>

      <ActiveJobBanner />

      <div className="mt-4 grid gap-6 md:grid-cols-[1.15fr_1fr] md:gap-8">
        <div className="flex min-w-0 flex-col gap-6">
          <CreateHero />
          {keepListening && (
            <section aria-labelledby="keep-listening">
              <h2 id="keep-listening" className="mb-3 text-xl font-semibold">
                Keep listening
              </h2>
              <Link
                to={`/story/${keepListening.id}`}
                className="pressable flex items-center gap-4 rounded-4xl bg-white/85 p-3 shadow-soft ring-1 ring-navy-900/5 hover:bg-white"
              >
                <StoryCover story={keepListening} showStatus={false} className="w-24 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-display text-lg leading-snug font-semibold">{keepListening.title}</p>
                  <ProgressBar className="mt-2.5" value={listeningFraction(keepListening)} label="Listening progress" />
                </div>
                <span className="mr-1 flex size-14 shrink-0 items-center justify-center rounded-full bg-navy-900 text-cream-50 shadow-[0_4px_0_0_var(--color-navy-950)]">
                  <Play aria-hidden className="ml-0.5 size-6" fill="currentColor" />
                  <span className="sr-only">Play</span>
                </span>
              </Link>
            </section>
          )}
        </div>

        <section aria-labelledby="recent" className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent" className="text-xl font-semibold">
              My storybooks
            </h2>
            {stories.length > 0 && (
              <Link to="/library" className="pressable flex min-h-12 items-center gap-1 rounded-full px-3 font-extrabold text-lilac-700 hover:bg-lilac-100">
                See all
                <ChevronRight aria-hidden className="size-5" />
              </Link>
            )}
          </div>
          {recent.length === 0 && !keepListening ? (
            <p className="rounded-3xl border-2 border-dashed border-navy-900/10 p-6 text-center text-navy-500">Your storybooks will live here.</p>
          ) : (
            <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {recent.map((story) => (
                <li key={story.id} className="w-36 shrink-0 snap-start md:w-auto">
                  <Link to={`/story/${story.id}`} className="pressable block rounded-3xl">
                    <StoryCover story={story} />
                    <p className="mt-2 line-clamp-2 px-1 text-sm leading-snug font-bold">{story.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function CreateHero() {
  return (
    <Link
      to="/create"
      className="group pressable relative isolate block overflow-hidden rounded-5xl bg-navy-900 text-cream-50 shadow-lift"
      aria-label="Make a new story"
    >
      <div className="absolute inset-0 -z-10 opacity-90 transition-transform duration-700 ease-(--ease-soft) group-hover:scale-105">
        <StoryArt theme="moonlit-forest" variant={2} animated />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent" />
      <div className="flex min-h-64 flex-col justify-end gap-4 p-6 md:min-h-80">
        <div className="flex items-center gap-4">
          <span className="relative flex size-20 shrink-0 items-center justify-center rounded-full bg-honey-400 text-navy-950 shadow-[0_5px_0_0_var(--color-honey-700)]">
            <span className="absolute inset-0 animate-breathe rounded-full bg-honey-300/50" />
            <Mic aria-hidden className="relative size-9" strokeWidth={2.4} />
          </span>
          <div>
            <p className="font-display text-3xl leading-tight font-semibold">Make a story</p>
            <p className="flex items-center gap-1.5 text-cream-100/85">
              <Sparkles aria-hidden className="size-4" />
              Tell me your idea
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
