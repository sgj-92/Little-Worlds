# Roadmap

## Milestone 1 — UX prototype ✅ (reviewed and approved)

Navigable prototype of all six screens on mock adapters, design system, docs, tests.

Acceptance: all screens reachable and connected; phone and tablet layouts; consistent
loading/empty/error/success states; mocks clearly labelled; typecheck, lint, unit, component
and e2e tests pass; production build succeeds.

## Milestone 2 — Accounts and persistence ✅ (code complete; awaiting owner setup in Supabase)

- Supabase project, apply schema + RLS, private storage bucket.
- Parent sign-up/sign-in with email + password, optional Google and Apple; password reset;
  family + child profile onboarding.
- `createLiveServices()` with Supabase repositories; demo mode kept for previews and tests.
- RLS tests with two families against a throwaway Postgres (`npm run test:db`).
- Deferred to Milestone 3: server-side parent gate/limits (the gate stays a child barrier).

Acceptance: a family's stories/settings persist across devices; another family cannot read them;
no secrets in the client bundle.

## Milestone 3 — Live generation

- Server endpoint + background worker; job table + Realtime progress.
- Provider adapters (LLM, TTS, image) behind a registry selected by env config.
- Input/output moderation (text and image), child-safe prompting by age and preferences.
- Real narration playback via `<audio>` with stored per-scene files; Media Session controls.
- Stored illustrations; vector art as fallback.
- Usage ledger, daily limit and monthly budget enforced server-side.

Acceptance: a 5-minute illustrated story is produced end-to-end; a failure in any stage can be
retried without re-paying earlier stages; costs recorded; moderation rejects unsafe output.

## Milestone 4 — Voice input

- MediaRecorder capture with permission UX for children and parents; server STT; audio discarded.
- Recorded voice guidance for pre-readers on key screens.

## Milestone 5 — Polish and launch readiness

- PWA install, offline playback of downloaded stories, performance budget, accessibility audit
  (WCAG 2.2 AA), analytics without personal data, error monitoring, privacy policy and
  age-appropriate design code review.
