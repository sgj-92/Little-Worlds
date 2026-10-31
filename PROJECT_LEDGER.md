# Project Ledger

_Canonical status for Little Worlds. Update after every meaningful change._

**Last updated:** 2026-10-31
**Current phase:** Milestone 2 — Accounts and persistence — **code complete; waiting for the owner to run the
database script and set Vercel variables** (see `docs/SETUP.md`)
**Milestone 1** was reviewed and approved by the owner ("a great start") and is deployed on Vercel.

## Status

| Area | State |
| --- | --- |
| Repository, tooling, CI | ✅ Vite 8 · React 19 · TS 6 strict · Tailwind 4 · ESLint · Vitest · Playwright · GitHub Actions |
| Documentation | ✅ CLAUDE.md, PRODUCT_SPEC, UX_PLAYBOOK, ARCHITECTURE, ROADMAP, this ledger |
| Design system | ✅ Tokens, typography, buttons, tiles, toggles, steppers, progress, states, toast, vector story art |
| Screens | ✅ Home · Create · Generating · Player · My Storybooks · Parent gate + Settings · Not found |
| Mock services | ✅ Repositories (localStorage), job-based generator, speech capture, sample library |
| Parent accounts | ✅ Email + password, password reset, optional Google/Apple, child onboarding, sign-out, data export |
| Persistence | ✅ Supabase repositories for stories, scenes, listening progress, family limits, child profile |
| Supabase schema | ✅ Idempotent migration + RLS, tested locally — ⏳ **not yet applied to the project** |
| Live AI / audio / voice | ⛔ Not started (Milestones 3–4) |

## Environment

| Item | Value |
| --- | --- |
| Hosting | Vercel, project `little-worlds` (team "sgj-92's projects") |
| Supabase project | `mdswuatymersiwhvuqze` (Europe). Recommended settings: Data API on, auto-expose off, automatic RLS on |
| Public config | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, optional `VITE_AUTH_PROVIDERS` |
| Secrets | None in the repo or client. Service-role key will live in Vercel only (Milestone 3) |
| Agent access | The cloud dev container cannot reach `*.supabase.co` (network policy), so migrations are applied by the owner in the SQL editor |

## What is mocked (and labelled in the UI)

- **Voice input:** returns rotating sample ideas; the microphone is never opened.
- **Story generation:** timer-driven stages; text assembled from hand-written templates per world.
- **Illustrations:** hand-built SVG scenes (6 worlds × 4 variants), not generated images.
- **Narration:** silent playback timeline; read-along text shows the words.
- **Costs:** placeholder unit prices for the budget meter.
- **Demo mode only:** the account is simulated on the device (any email/password works).

## Decisions

| # | Decision | Reason |
| --- | --- | --- |
| D1 | SPA on Vite + React Router (not Next.js) | Matches requested stack; app is client-heavy; server logic lives in Vercel/Supabase functions |
| D2 | Own design system on Tailwind 4 tokens, no UI kit | Distinctive storybook aesthetic; full control of touch sizes and motion |
| D3 | Provider interfaces + composition root (`Services`) | Swap mock → live adapters without UI changes; testable with fast fake services |
| D4 | Generation as a persisted stage state machine in `domain/` | Shared by mock and live; guarantees resume-from-failed-stage retries |
| D5 | Tiny observable stores + `useSyncExternalStore`, no state library | Small surface; adequate for this app; easy to replace with Supabase subscriptions |
| D6 | Tap-to-talk (not hold) | Easier for small children |
| D7 | Multiplication parent gate, 10-minute session unlock | Standard child-app pattern; no password needed on a shared device |
| D8 | Picture-first idea starters on Create | Pre-readers can make a story without speaking or typing |
| D9 | Vector story art as permanent fallback | Stories without pictures, failed images and loading states still look beautiful |
| D10 | TypeScript 6 instead of 7 | typescript-eslint peer range does not yet include TS 7 |
| D11 | Mock audio never touches the microphone; browser Web Speech API deliberately not used | Chrome sends audio to a third party — unsuitable for children's data |
| D12 | Email + password with optional Google/Apple (owner decision); provider buttons appear only when listed in `VITE_AUTH_PROVIDERS` | Avoids broken buttons before providers are configured |
| D13 | Demo mode kept alongside live mode, chosen by env vars | Credential-free tests, previews and local development |
| D14 | `families.id = auth.users.id`; family row created by a sign-up trigger; one child per family for the MVP (unique `family_id`) | Simple ownership checks in RLS; matches current UI |
| D15 | Tables not auto-exposed; explicit grants to `authenticated` only | Owner chose "don't auto-expose"; nothing is reachable signed-out |
| D16 | Temporary RLS policies let families write their own `prototype-template` stories | Generation still runs in the browser until Milestone 3; AI stories stay server-only |
| D17 | Repositories are optimistic caches over Supabase with rollback | Keeps the child UI instant; failures roll back and surface calmly |
| D18 | Supabase SDK lazy-loaded only in live mode | Keeps the initial bundle at ~138 kB gzip |
| D19 | Daily allowance counts stories made today + stories in progress | Holds across devices in live mode until server metering lands |

## Known issues / limitations

- Migration not yet applied to the Supabase project (owner action).
- Built-in Supabase email sending is rate-limited; custom SMTP needed before inviting families.
- Daily limit and monthly budget are still enforced in the browser (server enforcement in M3).
- Monthly cost estimate is per device (local usage log) until server metering.
- Template stories are written by the client, marked approved (temporary RLS policies, D16).
- No "delete my account" button yet (needs a server function with the secret key, M3).
- One child per family.
- Story text is templated, so different ideas within a world produce the same story.
- No narration audio; the player advances silently.
- Emoji avatars and starter icons render slightly differently per platform.
- Parent gate is a child barrier, not authentication (accounts protect the data).
- Completed generation jobs that are not dismissed remain in local storage (harmless; pruning TBD).
- No automated accessibility (axe) scan yet; manual semantics review only.

## Verification (Milestone 2)

- `npm run typecheck` ✅ · `npm run lint` ✅ · `npm run build` ✅ (main 138 kB gzip + 58 kB Supabase chunk)
- `npm test` ✅ 62 tests (domain, mock + Supabase adapters with a fake client, screens, account flows)
- `npm run test:db` ✅ migration applied twice + 15 RLS checks on Postgres 16
- `npm run test:e2e` ✅ 8 tests (4 journeys × phone + tablet)
- Live build exercised in Chromium against a simulated Supabase API: sign-in, onboarding upsert,
  story + scenes write all issued the expected requests
- Not yet verified against the real Supabase project (network policy; owner to run setup)

## Next actions

1. **Owner:** run the database script and set Vercel variables (`docs/SETUP.md` §1–3), then sign up.
2. Verify on the real project: sign-up email, onboarding, story saved, progress across devices.
3. Optional: configure Google (and Apple) sign-in (`docs/SETUP.md` §4).
4. Milestone 3: server-side generation pipeline, AI providers, moderation, server-enforced limits.

## Decisions needed from the project owner

- ~~Approve visual direction~~ ✅ approved · ~~Sign-in method~~ ✅ email + password, Google/Apple optional
  · ~~Age range~~ ✅ 3–10 · ~~Supabase project~~ ✅ created (Europe)
- Google Cloud OAuth client and/or Apple Developer membership, if social sign-in is wanted now.
- Custom email sender (SMTP provider) and sender address for account emails.
- AI providers for story text, narration voice(s) and illustrations; acceptable per-story cost (M3).
- Legal: privacy policy owner, UK Children's Code / COPPA scope, data retention period.
