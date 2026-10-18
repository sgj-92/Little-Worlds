# Project Ledger

_Canonical status for Little Worlds. Update after every meaningful change._

**Last updated:** 2026-10-18
**Current phase:** Milestone 1 — UX prototype — **complete, awaiting owner review**
**Do not start Milestone 2 until the prototype has been reviewed.**

## Status

| Area | State |
| --- | --- |
| Repository, tooling, CI | ✅ Vite 8 · React 19 · TS 6 strict · Tailwind 4 · ESLint · Vitest · Playwright · GitHub Actions |
| Documentation | ✅ CLAUDE.md, PRODUCT_SPEC, UX_PLAYBOOK, ARCHITECTURE, ROADMAP, this ledger |
| Design system | ✅ Tokens, typography, buttons, tiles, toggles, steppers, progress, states, toast, vector story art |
| Screens | ✅ Home · Create · Generating · Player · My Storybooks · Parent gate + Settings · Not found |
| Mock services | ✅ Repositories (localStorage), job-based generator, speech capture, sample library |
| Supabase schema | 📝 Draft migration with RLS (not applied) |
| Live AI / accounts / audio | ⛔ Not started (Milestones 2–4) |

## What is mocked (and labelled in the UI)

- **Voice input:** returns rotating sample ideas; the microphone is never opened.
- **Story generation:** timer-driven stages; text assembled from hand-written templates per world.
- **Illustrations:** hand-built SVG scenes (6 worlds × 4 variants), not generated images.
- **Narration:** silent playback timeline; read-along text shows the words.
- **Costs:** placeholder unit prices for the budget meter.
- **Account actions:** export / sign out disabled until accounts exist.

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

## Known issues / limitations

- Story text is templated, so different ideas within a world produce the same story.
- No narration audio; the player advances silently.
- Emoji avatars and starter icons render slightly differently per platform.
- Single bundle (~420 kB, 131 kB gzip); route-level code splitting not yet applied.
- Parent gate is a convenience barrier, not authentication (accounts arrive in M2).
- Completed generation jobs that are not dismissed remain in local storage (harmless; pruning TBD).
- No automated accessibility (axe) scan yet; manual semantics review only.

## Verification (Milestone 1)

- `npm run typecheck` ✅ · `npm run lint` ✅
- `npm test` ✅ 35 tests (domain, mock services, screens)
- `npm run build` ✅
- `npm run test:e2e` ✅ 6 tests (3 journeys × phone + tablet)

## Next actions

1. **Owner review of the prototype** (see "Decisions needed" below).
2. Apply review feedback to the UX.
3. Milestone 2: Supabase project, auth, live repositories, RLS tests.

## Decisions needed from the project owner

- Approve the visual direction and child journey (or list changes).
- Supabase: create a project (region — UK/EU recommended) and share URL + anon key; service role key
  goes to Vercel env only.
- Vercel project/team for hosting.
- Parent sign-in method: email magic link, passkeys, or Sign in with Apple/Google.
- AI providers for story text, narration voice(s) and illustrations; acceptable per-story cost.
- Default limits (stories per day, monthly budget) and the target age range.
- Legal: privacy policy owner, UK Children's Code / COPPA scope, data retention period.
