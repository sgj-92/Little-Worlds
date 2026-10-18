import { BookOpenText, Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward, Sparkles, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { formatClock } from '@/domain/durations';
import type { Story } from '@/domain/types';
import { useStory } from '@/state/hooks';
import { Button, ButtonLink } from '@/ui/Button';
import { IconButton } from '@/ui/IconButton';
import { PrototypeNote } from '@/ui/PrototypeNote';
import { StateMessage } from '@/ui/StateMessage';
import { TopBar } from '@/ui/TopBar';
import { PlainCover, StoryArt, THEME_PALETTES } from '@/ui/art/StoryArt';
import { cn } from '@/ui/cn';
import { usePlayback } from './usePlayback';

export function PlayerScreen() {
  const { storyId } = useParams();
  const story = useStory(storyId);
  if (!story) {
    return (
      <div>
        <TopBar backTo="/library" />
        <StateMessage
          art={<BookOpenText aria-hidden className="size-12" />}
          title="This storybook is missing"
          body="It might have been tidied away by a grown-up."
          actions={<ButtonLink to="/library" size="lg">My storybooks</ButtonLink>}
        />
      </div>
    );
  }
  return <Player key={story.id} story={story} />;
}

function Player({ story }: { story: Story }) {
  const pb = usePlayback(story);
  const [showWords, setShowWords] = useState(true);
  const scene = story.scenes[pb.sceneIndex] ?? story.scenes[0]!;
  const palette = THEME_PALETTES[story.theme];
  const { toggle } = pb;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  return (
    <div className="relative min-h-dvh overflow-hidden" style={{ background: `linear-gradient(180deg, ${palette.skyBottom}33, transparent 60%)` }}>
      <TopBar
        backTo="/library"
        trailing={
          <IconButton label={showWords ? 'Hide the words' : 'Show the words'} tone={showWords ? 'soft' : 'plain'} aria-pressed={showWords} onClick={() => setShowWords((s) => !s)}>
            <BookOpenText aria-hidden className="size-5" />
          </IconButton>
        }
      />

      <div className="mx-auto grid max-w-5xl gap-6 px-5 pb-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-8">
        <div className="relative mx-auto aspect-square w-full max-w-[min(26rem,52dvh)] overflow-hidden rounded-5xl shadow-lift ring-1 ring-navy-900/5 lg:max-w-none">
          <div key={scene.id} className="absolute inset-0 animate-[page-in_700ms_var(--ease-soft)_both]">
            {story.illustrated ? (
              <StoryArt theme={story.theme} variant={scene.artVariant} animated={pb.playing} label={`Illustration for scene ${pb.sceneIndex + 1}`} />
            ) : (
              <PlainCover theme={story.theme} />
            )}
          </div>
          {pb.finished && <TheEnd onAgain={pb.restart} />}
        </div>

        <div className="flex flex-col gap-5">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl leading-tight font-semibold text-balance md:text-3xl">{story.title}</h1>
            <p className="mt-1 font-bold text-navy-500">
              Part {pb.sceneIndex + 1} of {story.scenes.length}
            </p>
          </div>

          {showWords && (
            <p key={scene.id} className="min-h-28 animate-page-in rounded-4xl bg-white/80 p-5 font-display text-lg leading-relaxed text-navy-900 shadow-soft ring-1 ring-navy-900/5 md:text-xl">
              {scene.text}
            </p>
          )}

          <div>
            <label htmlFor="scrub" className="sr-only">
              Story position
            </label>
            <input
              id="scrub"
              type="range"
              min={0}
              max={pb.total}
              step={1}
              value={Math.round(pb.position)}
              onChange={(e) => pb.seek(Number(e.target.value))}
              aria-valuetext={`${formatClock(pb.position)} of ${formatClock(pb.total)}`}
              className="lw-range h-11 w-full cursor-pointer"
              style={{ ['--fill' as string]: `${pb.total ? (pb.position / pb.total) * 100 : 0}%` }}
            />
            <div className="flex justify-between text-sm font-bold text-navy-500 tabular-nums">
              <span>{formatClock(pb.position)}</span>
              <span>{formatClock(pb.total)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <IconButton label="Previous part" size="lg" onClick={() => pb.goToScene(pb.sceneIndex - 1)} disabled={pb.sceneIndex === 0}>
              <SkipBack aria-hidden className="size-6" fill="currentColor" />
            </IconButton>
            <IconButton label="Back 15 seconds" size="lg" onClick={() => pb.skip(-15)}>
              <RotateCcw aria-hidden className="size-6" />
            </IconButton>
            <IconButton label={pb.playing ? 'Pause' : 'Play'} tone="dark" size="xl" onClick={pb.toggle}>
              {pb.playing ? <Pause aria-hidden className="size-9" fill="currentColor" /> : <Play aria-hidden className="ml-1 size-9" fill="currentColor" />}
            </IconButton>
            <IconButton label="Forward 15 seconds" size="lg" onClick={() => pb.skip(15)}>
              <RotateCw aria-hidden className="size-6" />
            </IconButton>
            <IconButton label="Next part" size="lg" onClick={() => pb.goToScene(pb.sceneIndex + 1)} disabled={pb.sceneIndex >= story.scenes.length - 1}>
              <SkipForward aria-hidden className="size-6" fill="currentColor" />
            </IconButton>
          </div>

          <nav aria-label="Story parts" className="flex flex-wrap justify-center gap-1.5">
            {story.scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pb.goToScene(i)}
                aria-label={`Go to part ${i + 1}`}
                aria-current={i === pb.sceneIndex ? 'step' : undefined}
                className="group flex size-11 items-center justify-center"
              >
                <span className={cn('block h-2.5 rounded-full transition-all', i === pb.sceneIndex ? 'w-7 bg-honey-500' : i < pb.sceneIndex ? 'w-2.5 bg-navy-700/50' : 'w-2.5 bg-navy-900/15 group-hover:bg-navy-900/30')} />
              </button>
            ))}
          </nav>

          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            <PrototypeNote>Silent preview — narration audio arrives in a later milestone</PrototypeNote>
            {story.source !== 'ai' && <PrototypeNote>{story.source === 'sample' ? 'Sample storybook' : 'Written from a template, not AI'}</PrototypeNote>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TheEnd({ onAgain }: { onAgain: () => void }) {
  return (
    <div className="absolute inset-0 flex animate-page-in flex-col items-center justify-center gap-4 bg-navy-950/60 p-6 text-center text-cream-50 backdrop-blur-sm">
      <div className="flex gap-2 text-honey-300">
        {[0, 1, 2].map((i) => (
          <Star key={i} aria-hidden className="size-8 animate-pop-in" fill="currentColor" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <p className="font-display text-4xl font-semibold">The End</p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button size="lg" onClick={onAgain} icon={<RotateCcw aria-hidden className="size-5" />}>
          Listen again
        </Button>
        <ButtonLink to="/create" variant="soft" size="lg" icon={<Sparkles aria-hidden className="size-5" />}>
          Make a new story
        </ButtonLink>
      </div>
    </div>
  );
}
