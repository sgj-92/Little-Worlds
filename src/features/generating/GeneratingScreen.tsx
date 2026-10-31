import { Check, CloudOff, Home, Mic, Palette, PencilLine, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { STAGE_COPY, STAGE_ORDER, nextStage, overallProgress } from '@/domain/generation';
import type { GenerationJob, GenerationStage } from '@/domain/types';
import { useServices } from '@/services/ServicesContext';
import { useJob, useStory } from '@/state/hooks';
import { Button, ButtonLink } from '@/ui/Button';
import { IconLink } from '@/ui/IconButton';
import { ProgressBar } from '@/ui/Progress';
import { PrototypeNote } from '@/ui/PrototypeNote';
import { StateMessage } from '@/ui/StateMessage';
import { StoryCover } from '@/ui/StoryCover';
import { cn } from '@/ui/cn';
import { MagicBook } from '@/ui/art/MagicBook';

const STAGE_ICONS: Record<GenerationStage, typeof PencilLine> = { writing: PencilLine, illustrating: Palette, narrating: Mic };

const CHEERS = ['Sprinkling a little magic…', 'Choosing the very best words…', 'Finding a cosy ending…', 'Almost like magic…'];

export function GeneratingScreen() {
  const { jobId } = useParams();
  const job = useJob(jobId);

  if (!job) {
    return (
      <Frame>
        <StateMessage
          art={<CloudOff aria-hidden className="size-12" />}
          title="We couldn’t find that story"
          body="It may have finished already. Let’s look in your storybooks."
          actions={<ButtonLink to="/library" size="lg">My storybooks</ButtonLink>}
        />
      </Frame>
    );
  }

  return (
    <Frame>
      {job.status === 'complete' ? (
        <Ready job={job} />
      ) : job.status === 'failed' ? (
        <Failed job={job} />
      ) : job.status === 'cancelled' ? (
        <StateMessage
          art={<X aria-hidden className="size-12" />}
          title="Story stopped"
          body="No problem — we can make a new one whenever you like."
          actions={
            <ButtonLink to="/create" size="lg" icon={<Sparkles aria-hidden className="size-6" />}>
              Make a new story
            </ButtonLink>
          }
        />
      ) : (
        <Making job={job} />
      )}
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-end px-3 pt-[max(env(safe-area-inset-top),0.5rem)]">
        <IconLink to="/" label="Go home" tone="soft">
          <Home aria-hidden className="size-5" />
        </IconLink>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-12">{children}</div>
    </div>
  );
}

function Making({ job }: { job: GenerationJob }) {
  const { generator } = useServices();
  const navigate = useNavigate();
  const stage = nextStage(job);
  const [cheer, setCheer] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCheer((c) => (c + 1) % CHEERS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <MagicBook className="w-56 md:w-64" />
      <div aria-live="polite">
        <h1 className="text-3xl font-semibold">Making your story</h1>
        <p key={stage ?? 'x'} className="mt-1 animate-page-in text-lg font-bold text-navy-500">
          {stage ? STAGE_COPY[stage].running : CHEERS[cheer]}
        </p>
      </div>
      <ProgressBar value={overallProgress(job)} label="Story progress" className="h-3.5 w-full" />
      <StageList job={job} />
      {generator.isMock && <PrototypeNote>Simulated generation using sample story templates</PrototypeNote>}
      <div className="flex w-full flex-col gap-2">
        <Button variant="soft" size="lg" fullWidth icon={<Home aria-hidden className="size-5" />} onClick={() => navigate('/')}>
          Wait at home
        </Button>
        <Button
          variant="ghost"
          onClick={() => generator.cancel(job.id)}
          className="self-center text-sm"
        >
          Stop making this story
        </Button>
      </div>
    </div>
  );
}

function StageList({ job }: { job: GenerationJob }) {
  return (
    <ol className="w-full space-y-2 text-left">
      {STAGE_ORDER.filter((s) => job.stages[s] !== 'skipped').map((s) => {
        const status = job.stages[s];
        const Icon = STAGE_ICONS[s];
        return (
          <li
            key={s}
            className={cn(
              'flex min-h-14 items-center gap-3 rounded-2xl px-3 transition-colors',
              status === 'running' && 'bg-white shadow-soft',
              status === 'failed' && 'bg-rose-100',
            )}
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-full',
                status === 'done' ? 'bg-mint-500 text-white' : status === 'running' ? 'bg-honey-400 text-navy-950' : status === 'failed' ? 'bg-rose-500 text-white' : 'bg-navy-900/6 text-navy-300',
              )}
            >
              {status === 'done' ? <Check aria-hidden className="size-5" strokeWidth={3} /> : <Icon aria-hidden className={cn('size-5', status === 'running' && 'animate-breathe')} />}
            </span>
            <span className={cn('font-extrabold', status === 'pending' && 'text-navy-300')}>{STAGE_COPY[s].label}</span>
            <span className="sr-only">
              {' '}
              — {status === 'done' ? 'done' : status === 'running' ? 'in progress' : status === 'failed' ? 'needs another try' : 'waiting'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Failed({ job }: { job: GenerationJob }) {
  const { generator } = useServices();
  const stage = job.error?.stage ?? 'writing';
  const kept = STAGE_ORDER.filter((s) => job.stages[s] === 'done').map((s) => STAGE_COPY[s].label.toLowerCase().replace(/^\w+ing /, ''));
  return (
    <div className="flex flex-col items-center gap-6">
      <StateMessage
        tone="error"
        className="py-0"
        art={<MagicBook still className="w-20" />}
        title="Oops! Let’s try that again"
        body={
          <>
            <p>{STAGE_COPY[stage].failed}</p>
            {kept.length > 0 && <p className="mt-2 text-sm">Don’t worry — {kept.join(' and ')} are saved, so we only redo this step.</p>}
          </>
        }
        actions={
          <>
            <Button size="xl" fullWidth icon={<RotateCcw aria-hidden className="size-6" />} onClick={() => generator.retry(job.id)}>
              Try again
            </Button>
            <ButtonLink to="/" variant="ghost" size="lg">
              Finish later
            </ButtonLink>
          </>
        }
      />
      <StageList job={job} />
    </div>
  );
}

function Ready({ job }: { job: GenerationJob }) {
  const story = useStory(job.storyId ?? undefined);
  const { generator } = useServices();
  const navigate = useNavigate();
  if (!story) return null;
  const play = () => {
    generator.dismiss(job.id);
    navigate(`/story/${story.id}`, { replace: true });
  };
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative w-64 animate-pop-in md:w-72">
        <StoryCover story={story} showStatus={false} className="rounded-4xl shadow-lift" />
        <Sparkles aria-hidden className="absolute -top-4 -right-4 size-10 animate-twinkle text-honey-500" />
      </div>
      <div>
        <p className="font-extrabold text-mint-700">Your story is ready!</p>
        <h1 className="mt-1 text-3xl font-semibold text-balance">{story.title}</h1>
      </div>
      <Button size="xl" fullWidth icon={<Play aria-hidden className="size-7" fill="currentColor" />} onClick={play}>
        Play my story
      </Button>
      <Button variant="ghost" onClick={() => { generator.dismiss(job.id); navigate('/', { replace: true }); }}>
        Save for later
      </Button>
    </div>
  );
}
