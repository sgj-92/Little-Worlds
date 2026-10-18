import { Baby, BookOpen, Download, FlaskConical, Gauge, Lock, LogOut, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { allowedDurations, clampDuration, DURATION_OPTIONS } from '@/domain/durations';
import { AVOID_TOPIC_LABELS } from '@/domain/safety';
import type { AgeBand, AvatarId, AvoidTopic, DurationMinutes, ParentSettings, SimulatedFailure, StoryTone } from '@/domain/types';
import { useServices } from '@/services/ServicesContext';
import { useSettings, useStories, useUsage } from '@/state/hooks';
import { AVATARS } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { ChoiceTiles } from '@/ui/ChoiceTiles';
import { ProgressBar } from '@/ui/Progress';
import { PrototypeNote } from '@/ui/PrototypeNote';
import { Stepper } from '@/ui/Stepper';
import { useToast } from '@/ui/Toast';
import { Toggle } from '@/ui/Toggle';
import { TopBar } from '@/ui/TopBar';
import { cn } from '@/ui/cn';

const AGE_BANDS: AgeBand[] = ['3-4', '5-6', '7-8', '9-10'];
const TONES: { value: StoryTone; label: string }[] = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'playful', label: 'Playful' },
  { value: 'adventurous', label: 'Adventurous' },
];
const FAILURES: { value: SimulatedFailure; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'writing', label: 'Writing' },
  { value: 'illustrating', label: 'Pictures' },
  { value: 'narrating', label: 'Voice' },
];

function Section({ icon, title, children, className }: { icon: ReactNode; title: string; children: ReactNode; className?: string }) {
  const id = title.toLowerCase().replace(/\W+/g, '-');
  return (
    <section aria-labelledby={id} className={cn('rounded-4xl bg-white/85 p-5 shadow-soft ring-1 ring-navy-900/5 md:p-6', className)}>
      <h2 id={id} className="mb-3 flex items-center gap-2.5 text-xl font-semibold">
        <span className="flex size-9 items-center justify-center rounded-full bg-lilac-100 text-lilac-700">{icon}</span>
        {title}
      </h2>
      <div className="divide-y divide-navy-900/6">{children}</div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="py-3 first:pt-0 last:pb-0">{children}</div>;
}

export function ParentSettingsScreen({ onLock }: { onLock: () => void }) {
  const services = useServices();
  const [settings, update] = useSettings();
  const stories = useStories();
  const usage = useUsage();
  const toast = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const [newWord, setNewWord] = useState('');

  const set = (patch: (s: ParentSettings) => ParentSettings) => update(patch);
  const { child, content, limits, defaults } = settings;

  function toggleTopic(topic: AvoidTopic) {
    set((s) => ({
      ...s,
      content: {
        ...s.content,
        avoidTopics: s.content.avoidTopics.includes(topic) ? s.content.avoidTopics.filter((t) => t !== topic) : [...s.content.avoidTopics, topic],
      },
    }));
  }

  function addWord() {
    const w = newWord.trim().toLowerCase();
    if (!w || content.customBlockedWords.includes(w)) return setNewWord('');
    set((s) => ({ ...s, content: { ...s.content, customBlockedWords: [...s.content.customBlockedWords, w] } }));
    setNewWord('');
  }

  function setMax(max: DurationMinutes) {
    set((s) => ({ ...s, limits: { ...s.limits, maxDurationMinutes: max }, defaults: { ...s.defaults, durationMinutes: clampDuration(s.defaults.durationMinutes, max) } }));
  }

  const budgetUsed = limits.monthlyBudgetGbp > 0 ? usage.monthCostGbp / limits.monthlyBudgetGbp : 0;

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <TopBar
        backTo="/"
        title="Grown-ups"
        trailing={
          <Button variant="ghost" onClick={onLock} icon={<Lock aria-hidden className="size-4" />}>
            Lock
          </Button>
        }
      />
      <div className="px-5 md:px-8">
        <p className="mb-5 text-center text-sm font-semibold text-navy-500">Changes save automatically.</p>

        <div className="grid gap-5 md:grid-cols-2 md:items-start">
          <Section icon={<Baby aria-hidden className="size-5" />} title="Child profile">
            <Row>
              <label htmlFor="child-name" className="mb-1.5 block font-bold">
                First name or nickname
              </label>
              <input
                id="child-name"
                value={child.name}
                maxLength={24}
                autoComplete="off"
                onChange={(e) => set((s) => ({ ...s, child: { ...s.child, name: e.target.value } }))}
                className="min-h-12 w-full rounded-2xl bg-cream-100 px-4 text-lg font-bold ring-1 ring-navy-900/8 outline-none focus:ring-2 focus:ring-lilac-500"
              />
              <p className="mt-1.5 text-sm text-navy-500">Used in greetings and stories. We never need a surname or birthday.</p>
            </Row>
            <Row>
              <ChoiceTiles
                legend="Age"
                size="md"
                columns={4}
                value={child.ageBand}
                onChange={(ageBand) => set((s) => ({ ...s, child: { ...s.child, ageBand } }))}
                choices={AGE_BANDS.map((a) => ({ value: a, label: a.replace('-', '–') }))}
              />
            </Row>
            <Row>
              <fieldset>
                <legend className="mb-2 font-bold">Picture</legend>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(AVATARS) as AvatarId[]).map((id) => (
                    <label
                      key={id}
                      className={cn(
                        'pressable flex size-14 cursor-pointer items-center justify-center rounded-full text-3xl ring-2 has-focus-visible:outline-3 has-focus-visible:outline-lilac-500',
                        AVATARS[id].bg,
                        child.avatar === id ? 'ring-lilac-500' : 'ring-transparent',
                      )}
                    >
                      <input type="radio" name="avatar" className="sr-only" checked={child.avatar === id} onChange={() => set((s) => ({ ...s, child: { ...s.child, avatar: id } }))} aria-label={AVATARS[id].label} />
                      <span aria-hidden>{AVATARS[id].emoji}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Row>
          </Section>

          <Section icon={<ShieldCheck aria-hidden className="size-5" />} title="Story content">
            <Row>
              <ChoiceTiles legend="Tone" size="md" value={content.tone} onChange={(tone) => set((s) => ({ ...s, content: { ...s.content, tone } }))} choices={TONES} />
            </Row>
            <Row>
              <Toggle
                label="Calm bedtime endings"
                description="Stories wind down gently at the end."
                checked={content.bedtimeEndings}
                onChange={(bedtimeEndings) => set((s) => ({ ...s, content: { ...s.content, bedtimeEndings } }))}
              />
            </Row>
            <Row>
              <p className="mb-2 font-bold">Leave these out</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(AVOID_TOPIC_LABELS) as AvoidTopic[]).map((t) => {
                  const on = content.avoidTopics.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleTopic(t)}
                      className={cn('pressable min-h-11 rounded-full px-4 font-bold ring-1', on ? 'bg-navy-900 text-cream-50 ring-navy-900' : 'bg-cream-100 text-navy-700 ring-navy-900/10')}
                    >
                      {AVOID_TOPIC_LABELS[t]}
                    </button>
                  );
                })}
              </div>
            </Row>
            <Row>
              <label htmlFor="blocked-word" className="mb-1.5 block font-bold">
                Other words to avoid
              </label>
              <div className="flex gap-2">
                <input
                  id="blocked-word"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addWord();
                    }
                  }}
                  placeholder="e.g. spiders"
                  className="min-h-12 min-w-0 flex-1 rounded-2xl bg-cream-100 px-4 font-bold ring-1 ring-navy-900/8 outline-none focus:ring-2 focus:ring-lilac-500"
                />
                <Button variant="soft" onClick={addWord} icon={<Plus aria-hidden className="size-5" />} disabled={!newWord.trim()}>
                  Add
                </Button>
              </div>
              {content.customBlockedWords.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {content.customBlockedWords.map((w) => (
                    <li key={w} className="flex items-center gap-1 rounded-full bg-cream-200 py-1 pr-1 pl-3 font-bold">
                      {w}
                      <button
                        type="button"
                        aria-label={`Remove ${w}`}
                        onClick={() => set((s) => ({ ...s, content: { ...s.content, customBlockedWords: s.content.customBlockedWords.filter((x) => x !== w) } }))}
                        className="flex size-8 items-center justify-center rounded-full hover:bg-navy-900/8"
                      >
                        <X aria-hidden className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Row>
          </Section>

          <Section icon={<BookOpen aria-hidden className="size-5" />} title="Length and pictures">
            <Row>
              <ChoiceTiles
                legend="Longest story allowed"
                size="md"
                value={limits.maxDurationMinutes}
                onChange={setMax}
                choices={DURATION_OPTIONS.map((d) => ({ value: d.minutes, label: `${d.minutes} min` }))}
              />
            </Row>
            <Row>
              <ChoiceTiles
                legend="Starting length"
                size="md"
                value={defaults.durationMinutes}
                onChange={(durationMinutes) => set((s) => ({ ...s, defaults: { ...s.defaults, durationMinutes } }))}
                choices={allowedDurations(limits.maxDurationMinutes).map((d) => ({ value: d.minutes, label: `${d.minutes} min` }))}
              />
            </Row>
            <Row>
              <Toggle
                label="Allow illustrations"
                description="Pictures cost more to make than narration."
                checked={limits.allowIllustrations}
                onChange={(allowIllustrations) => set((s) => ({ ...s, limits: { ...s.limits, allowIllustrations } }))}
              />
            </Row>
            <Row>
              <Toggle
                label="Pictures on by default"
                disabled={!limits.allowIllustrations}
                checked={limits.allowIllustrations && defaults.illustrated}
                onChange={(illustrated) => set((s) => ({ ...s, defaults: { ...s.defaults, illustrated } }))}
              />
            </Row>
          </Section>

          <Section icon={<Gauge aria-hidden className="size-5" />} title="Limits and spending">
            <Row>
              <Stepper
                label="New stories per day"
                value={limits.storiesPerDay}
                min={1}
                max={10}
                onChange={(storiesPerDay) => set((s) => ({ ...s, limits: { ...s.limits, storiesPerDay } }))}
                description={`${usage.remainingToday} left today`}
              />
            </Row>
            <Row>
              <Stepper
                label="Monthly budget"
                value={limits.monthlyBudgetGbp}
                min={2}
                max={50}
                format={(v) => `£${v}`}
                onChange={(monthlyBudgetGbp) => set((s) => ({ ...s, limits: { ...s.limits, monthlyBudgetGbp } }))}
                description="Story making pauses when reached."
              />
            </Row>
            <Row>
              <div className="flex items-baseline justify-between">
                <p className="font-bold">This month</p>
                <p className="font-extrabold tabular-nums">
                  £{usage.monthCostGbp.toFixed(2)} <span className="font-bold text-navy-500">of £{limits.monthlyBudgetGbp}</span>
                </p>
              </div>
              <ProgressBar className="mt-2" tone={budgetUsed > 0.85 ? 'honey' : 'mint'} value={budgetUsed} label="Monthly budget used" />
              <p className="mt-2 text-sm text-navy-500">
                {usage.monthCount} {usage.monthCount === 1 ? 'story' : 'stories'} made · {stories.length} saved
              </p>
              <PrototypeNote className="mt-3">Estimated with placeholder prices — no real charges</PrototypeNote>
            </Row>
          </Section>

          <Section icon={<ShieldCheck aria-hidden className="size-5" />} title="Privacy and account">
            <Row>
              <ul className="space-y-2 text-sm text-navy-700">
                <li>• Voice ideas are turned into text, then the recording is discarded.</li>
                <li>• Stories are private to your family account.</li>
                <li>• We only store a first name and age range for your child.</li>
              </ul>
            </Row>
            <Row>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="soft" disabled icon={<Download aria-hidden className="size-5" />} className="flex-1">
                  Export data
                </Button>
                <Button variant="soft" disabled icon={<LogOut aria-hidden className="size-5" />} className="flex-1">
                  Sign out
                </Button>
              </div>
              <PrototypeNote className="mt-3">Accounts arrive with Supabase sign-in</PrototypeNote>
            </Row>
            <Row>
              <Button variant="danger" fullWidth icon={<Trash2 aria-hidden className="size-5" />} onClick={() => dialog.current?.showModal()} disabled={stories.length === 0}>
                Delete all storybooks
              </Button>
            </Row>
          </Section>

          <Section icon={<FlaskConical aria-hidden className="size-5" />} title="Prototype tools" className="border-2 border-dashed border-lilac-300 bg-lilac-50/70">
            <Row>
              <p className="text-sm text-navy-700">
                This build uses local mock services only: sample transcription, template stories, simulated progress and silent playback. Nothing is sent to AI providers.
              </p>
            </Row>
            <Row>
              <ChoiceTiles
                legend="Simulate a failure"
                size="md"
                columns={4}
                value={settings.prototype.simulateFailure}
                onChange={(simulateFailure) => set((s) => ({ ...s, prototype: { simulateFailure } }))}
                choices={FAILURES}
              />
              <p className="mt-2 text-sm text-navy-500">The first attempt fails at this step so you can review recovery.</p>
            </Row>
            <Row>
              <Button
                variant="soft"
                fullWidth
                onClick={() => {
                  services.resetDemo();
                  toast.show('Demo data reset');
                }}
              >
                Reset demo data
              </Button>
            </Row>
          </Section>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="confirm-title"
        className="m-auto w-[min(92vw,24rem)] rounded-4xl bg-cream-50 p-6 text-navy-900 shadow-lift backdrop:bg-navy-950/50 backdrop:backdrop-blur-sm"
      >
        <h2 id="confirm-title" className="text-2xl font-semibold">
          Delete all {stories.length} storybooks?
        </h2>
        <p className="mt-2 text-navy-700">This removes every story, picture and narration. It can’t be undone.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            variant="danger"
            size="lg"
            onClick={() => {
              services.stories.clear();
              dialog.current?.close();
              toast.show('All storybooks deleted');
            }}
          >
            Delete everything
          </Button>
          <Button variant="ghost" size="lg" onClick={() => dialog.current?.close()} autoFocus>
            Keep them
          </Button>
        </div>
      </dialog>
    </div>
  );
}
