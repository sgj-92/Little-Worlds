# Little Worlds — Engineering Instructions

Little Worlds turns a child's spoken or typed idea into a narrated storybook. The child is the
primary user; a parent controls safety, costs and settings. **Central principle: a child's
imagination should become a beautiful audiobook with as little friction as possible.**

Read `PROJECT_LEDGER.md` first — it is the canonical status, decision log and next-actions list.
Update it after every meaningful change.

## Commands

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Typecheck / lint | `npm run typecheck` · `npm run lint` |
| Unit + component tests | `npm test` |
| End-to-end (phone + tablet) | `npm run test:e2e` |
| Everything before a push | `npm run check && npm run test:e2e` |

## Architecture rules

- `src/domain/` — pure TypeScript business logic and types. No React, no I/O. Unit-test it.
- `src/services/` — provider interfaces (`types.ts`) and adapters (`mock/` today; `supabase/` and
  server AI adapters later). UI must depend only on the interfaces via `useServices()`.
- `src/state/` — React hooks that bind stores to components.
- `src/ui/` — the design system. Reuse before creating; new primitives go here, not in features.
- `src/features/<screen>/` — screen components and screen-specific pieces.
- Provider secrets live **only** server-side (Vercel functions / Supabase edge functions).
  Never add a `VITE_` variable holding a secret.
- Generation is asynchronous and persistent: jobs move through `writing → illustrating → narrating`,
  retries resume from the failed stage, and completed assets are stored, never regenerated.

## Honesty about mocks

Anything simulated must be visibly marked with `<PrototypeNote>` and backed by an adapter whose
`isMock` is `true`. Never present template output, sample transcription or silent playback as
real AI behaviour.

## Quality bar

- Strict TypeScript (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). No `any`.
- Mobile-first, then deliberate tablet layouts (`md:` ≥768px, `lg:` ≥1024px). No horizontal scroll.
- Child-facing actions: icon + short word, touch targets ≥ 48px (primary ≥ 56px), no reading required
  to create or play a story.
- Use the shared `StateMessage` for empty / error / success states and `Button`/`IconButton` for actions.
- Copy is warm, short and never blames the child. British English.
- Respect `prefers-reduced-motion`; animations are subtle and purposeful.
- Every interactive element has an accessible name; prefer native semantics (radios, switches, dialog).
- Add or update tests for every behaviour change: domain → Vitest, screens → RTL, journeys → Playwright.
- Only confirm destructive, irreversible actions (e.g. deleting all storybooks).

See `docs/UX_PLAYBOOK.md` for the design system and `docs/ARCHITECTURE.md` for data and pipeline.
