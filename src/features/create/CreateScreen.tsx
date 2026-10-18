import { BookHeart, Headphones, Keyboard, Palette, Sparkles, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { allowedDurations, clampDuration } from '@/domain/durations';
import { PROMPT_MAX_CHARS, checkPrompt, normalisePrompt, promptIssueMessage, type PromptIssue } from '@/domain/safety';
import type { DurationMinutes } from '@/domain/types';
import { useServices } from '@/services/ServicesContext';
import { useSettings, useUsage } from '@/state/hooks';
import { Button, ButtonLink } from '@/ui/Button';
import { ChoiceTiles } from '@/ui/ChoiceTiles';
import { IconButton } from '@/ui/IconButton';
import { PrototypeNote } from '@/ui/PrototypeNote';
import { StateMessage } from '@/ui/StateMessage';
import { TopBar } from '@/ui/TopBar';
import { cn } from '@/ui/cn';
import { IdeaStarters } from './IdeaStarters';
import { MoonRow } from './MoonRow';
import { VoiceCapture } from './VoiceCapture';

type IdeaSource = 'voice' | 'typed' | 'starter';

export function CreateScreen() {
  const { generator, speech } = useServices();
  const navigate = useNavigate();
  const [settings] = useSettings();
  const usage = useUsage();
  const { limits, defaults } = settings;

  const [idea, setIdea] = useState('');
  const [source, setSource] = useState<IdeaSource | null>(null);
  const [typing, setTyping] = useState(false);
  const [duration, setDuration] = useState<DurationMinutes>(clampDuration(defaults.durationMinutes, limits.maxDurationMinutes));
  const [illustrated, setIllustrated] = useState(limits.allowIllustrations && defaults.illustrated);
  const [issue, setIssue] = useState<PromptIssue | null>(null);

  const hasIdea = normalisePrompt(idea).length > 0;
  const showEditor = typing || hasIdea;

  function applyIdea(text: string, from: IdeaSource) {
    setIdea(text);
    setSource(from);
    setIssue(null);
  }

  function reset() {
    setIdea('');
    setSource(null);
    setTyping(false);
    setIssue(null);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const problem = checkPrompt(idea, settings.content);
    setIssue(problem);
    if (problem) return;
    const job = generator.start({ prompt: normalisePrompt(idea), durationMinutes: duration, illustrated: illustrated && limits.allowIllustrations });
    navigate(`/making/${job.id}`);
  }

  if (usage.remainingToday === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <TopBar backTo="/" title="New story" />
        <StateMessage
          art={<BookHeart aria-hidden className="size-12" />}
          title="That’s all the new stories for today"
          body="Come back tomorrow for more. You can still listen to all your storybooks!"
          actions={
            <ButtonLink to="/library" size="lg" icon={<BookHeart aria-hidden className="size-6" />}>
              My storybooks
            </ButtonLink>
          }
        />
      </div>
    );
  }

  const durations = allowedDurations(limits.maxDurationMinutes);

  return (
    <form onSubmit={submit} className="mx-auto flex min-h-dvh max-w-5xl flex-col" noValidate>
      <TopBar backTo="/" title="New story" />

      <div className="grid flex-1 gap-8 px-5 pt-2 pb-40 md:grid-cols-[1.1fr_1fr] md:gap-10 md:px-8 md:pt-6">
        <section aria-labelledby="idea-heading" className="flex flex-col gap-6">
          <h1 id="idea-heading" className="text-center text-3xl font-semibold md:text-left md:text-4xl">
            What’s your story about?
          </h1>

          {!showEditor ? (
            <div className="flex flex-col gap-8">
              <VoiceCapture onTranscript={(t) => applyIdea(t, 'voice')} />
              {speech.isMock && <PrototypeNote className="self-center">Sample transcription — the microphone isn’t used yet</PrototypeNote>}
              <IdeaStarters onPick={(t) => applyIdea(t, 'starter')} />
              <Button variant="ghost" onClick={() => setTyping(true)} icon={<Keyboard aria-hidden className="size-5" />} className="self-center">
                Type it instead
              </Button>
            </div>
          ) : (
            <div className="flex animate-pop-in flex-col gap-3">
              <div className={cn('rounded-4xl bg-white p-4 shadow-soft ring-2', issue ? 'ring-rose-500/60' : 'ring-lilac-200')}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label htmlFor="idea" className="flex items-center gap-2 font-extrabold text-lilac-700">
                    <Sparkles aria-hidden className="size-5" />
                    Your idea
                  </label>
                  <IconButton label="Start again" size="md" onClick={reset}>
                    <X aria-hidden className="size-5" />
                  </IconButton>
                </div>
                <textarea
                  id="idea"
                  value={idea}
                  autoFocus={typing && !hasIdea}
                  onChange={(e) => {
                    setIdea(e.target.value);
                    setIssue(null);
                    if (!source) setSource('typed');
                  }}
                  maxLength={PROMPT_MAX_CHARS + 50}
                  rows={4}
                  placeholder="A brave little mouse who…"
                  aria-invalid={issue ? true : undefined}
                  aria-describedby={issue ? 'idea-issue' : undefined}
                  className="w-full resize-none bg-transparent font-display text-xl leading-relaxed text-navy-900 outline-none placeholder:text-navy-300"
                />
                {source === 'voice' && speech.isMock && <PrototypeNote>Sample transcription — edit it to make it yours</PrototypeNote>}
              </div>
              {issue && (
                <p id="idea-issue" role="alert" className="rounded-2xl bg-rose-100 px-4 py-3 font-bold text-rose-700">
                  {promptIssueMessage(issue)}
                </p>
              )}
              <div className="flex items-center justify-center gap-3">
                <VoiceCapture compact onTranscript={(t) => applyIdea(t, 'voice')} />
                <p className="font-bold text-navy-500">Say it again</p>
              </div>
            </div>
          )}
        </section>

        <section aria-label="Story options" className="flex flex-col gap-7 md:rounded-5xl md:bg-white/50 md:p-6 md:ring-1 md:ring-navy-900/5">
          <ChoiceTiles
            legend="How long?"
            columns={durations.length === 1 ? 2 : (durations.length as 2 | 3)}
            value={duration}
            onChange={setDuration}
            choices={durations.map((d) => ({
              value: d.minutes,
              label: d.label,
              hint: `${d.minutes} min`,
              art: <MoonRow count={d.moons} />,
            }))}
          />
          {limits.allowIllustrations ? (
            <ChoiceTiles
              legend="Pictures?"
              columns={2}
              value={illustrated ? 'yes' : 'no'}
              onChange={(v) => setIllustrated(v === 'yes')}
              choices={[
                { value: 'yes', label: 'With pictures', art: <Palette aria-hidden className="size-7" /> },
                { value: 'no', label: 'Just listen', art: <Headphones aria-hidden className="size-7" /> },
              ]}
            />
          ) : (
            <p className="flex items-center gap-2 rounded-2xl bg-cream-200/70 px-4 py-3 font-semibold text-navy-700">
              <Headphones aria-hidden className="size-5" />
              Listening stories only — pictures are switched off by a grown-up.
            </p>
          )}
        </section>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-cream-100 via-cream-100/95 to-transparent px-5 pt-8">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
          <Button type="submit" size="xl" fullWidth disabled={!hasIdea} icon={<Sparkles aria-hidden className="size-7" />}>
            Make my story
          </Button>
          <p className="flex items-center gap-1.5 text-sm font-bold text-navy-500" aria-label={`${usage.remainingToday} new stories left today`}>
            <span aria-hidden className="flex gap-1">
              {Array.from({ length: Math.min(usage.remainingToday, 10) }, (_, i) => (
                <span key={i} className="size-2 rounded-full bg-honey-400" />
              ))}
            </span>
            {usage.remainingToday} left today
          </p>
        </div>
      </div>
    </form>
  );
}
