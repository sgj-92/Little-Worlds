# Architecture

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| UI | React 19, TypeScript 6 (strict), Vite 8 | SPA, mobile-first |
| Styling | Tailwind CSS 4 (`@theme` tokens in `src/index.css`) | No component library; own design system |
| Routing | React Router 8 (data router) | `createBrowserRouter`; memory router in tests |
| Icons / fonts | lucide-react; Fraunces + Nunito via Fontsource | Self-hosted fonts, no third-party font CDN |
| Backend (M2+) | Supabase: Auth, Postgres + RLS, private Storage | Draft schema in `supabase/migrations` |
| Server AI (M3+) | Vercel Functions / Supabase Edge Functions | Holds all provider secrets |
| Hosting | Vercel (`vercel.json` SPA rewrite) | |
| Tests | Vitest + RTL (jsdom), Playwright (phone + tablet) | CI in `.github/workflows/ci.yml` |

TypeScript 6 is used rather than 7 because `typescript-eslint` does not yet support TS 7.

## Source layout

```
src/
  app/        App, routes, shell, bottom navigation
  domain/     Pure types and rules: generation state machine, safety checks, limits, durations
  services/   Provider interfaces (types.ts), store primitives, composition root
    mock/     Milestone 1 adapters: repositories, story generator, speech capture, templates
  state/      React hooks over services (useStories, useSettings, useJobs, useUsage)
  ui/         Design system components and vector story art
  features/   home, create, generating, player, library, parent
  mocks/      Sample storybooks
supabase/     Draft SQL schema with RLS
e2e/          Playwright journeys
```

**Dependency rule:** `features → state/ui → services(types) → domain`. Features never import an
adapter directly; the composition root (`createMockServices`) wires adapters. Swapping to live
services means adding `createLiveServices()` with the same `Services` shape.

## Provider interfaces (`src/services/types.ts`)

- `StoryRepository` — list/get/save stories, update listening progress, delete.
- `SettingsRepository` — parent settings.
- `StoryGenerator` — `start`, `retry`, `cancel`, `dismiss`, observable `jobs`; `isMock` flag.
- `SpeechCapture` — `start(onLevel)`, `stop() → transcript`, `cancel`; `isMock` flag.
- `ParentGateSession` — short-lived unlock.

Live adapters planned:

| Interface | Live adapter |
| --- | --- |
| StoryRepository / SettingsRepository | Supabase tables via supabase-js (RLS-scoped) |
| StoryGenerator | `POST /api/stories` creates job; Supabase Realtime on `generation_jobs` for progress |
| SpeechCapture | MediaRecorder → `POST /api/transcribe` (server STT); audio never stored |
| Narration / illustration | Server-side TTS + image adapters behind a `ProviderRegistry` (configurable per env) |

## Data model

See `supabase/migrations/0001_initial_schema.sql`: `families`, `child_profiles`, `stories`,
`story_scenes`, `listening_progress`, `generation_jobs`, `usage_events`, private bucket
`story-assets/{family_id}/{story_id}/…`. RLS restricts every row to `auth.uid()`; story, job and
usage writes happen only through server functions using the service role.

The client domain types in `src/domain/types.ts` mirror these tables.

## Generation pipeline

```
Create ──POST /api/stories──▶ validate (limits, budget, input moderation)
                               │ insert generation_jobs(status=running) + usage reservation
                               ▼
                    worker (queue / background function)
        writing ──▶ story text (LLM, child-safe prompt) ──▶ output moderation ──▶ story_scenes
        illustrating ──▶ one image per scene (skipped if pictures off) ──▶ image moderation ──▶ Storage
        narrating ──▶ TTS per scene ──▶ Storage (mp3) + durations
                               ▼
                    status=complete, story released to the family
```

- **Persistent state:** every stage transition is written to `generation_jobs`; the UI subscribes.
- **Retryable:** `retryJob` resumes from the failed stage. Completed text, images and audio are
  stored and re-used — no repeated provider cost. Per-scene assets are idempotent by path.
- **Recoverable:** jobs survive app close; Home shows a banner for running or failed jobs.
- **Cost control:** daily limit and monthly budget checked before start; actual costs recorded
  in `usage_events`.

The Milestone 1 mock (`mockStoryGenerator.ts`) implements the same state machine with timers,
persists jobs to localStorage, resumes them after reload, and can simulate a failure at any stage.

## Child safety

1. Client checks (`domain/safety.ts`) for instant, gentle feedback — **not** a security boundary.
2. Server input moderation + parent exclusions + always-blocked list.
3. System prompt shaped by age band, tone, bedtime endings and exclusions.
4. Output moderation on text and images before release; rejected stories are never shown.
5. Parent gate before settings; no child accounts, no sharing, no external links in child UI.

## Privacy and secrets

- Only first name/nickname and age band stored for a child; voice audio discarded after STT.
- No provider keys in the browser. `VITE_*` variables are public by definition and may only hold
  the Supabase URL and anon key.
- Mock data lives in the browser's localStorage only.

## Testing strategy

| Level | Tooling | Covers |
| --- | --- | --- |
| Domain | Vitest | State machine, safety, limits, durations, parent gate, templates |
| Services | Vitest + fake timers | Mock generator completion, failure + retry, resume after reload |
| Screens | RTL + memory router | Create flow, validation, limit state, recovery, library filters, player, settings |
| Journeys | Playwright (Pixel 7, 1024×768 touch) | End-to-end child journey, reload + retry, no horizontal overflow |
