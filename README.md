# Little Worlds

A private, AI-powered storytelling app that turns a child's imagination into narrated storybooks.

> **Milestone 2 — accounts and persistence.** With Supabase configured, parents sign in and
> stories, settings and listening progress are saved to their private family account. Without it,
> the app runs in a local demo mode. Story generation, voice capture and narration are still
> simulated and labelled in the UI. Setup steps: [`docs/SETUP.md`](docs/SETUP.md).

```bash
npm install
npm run dev          # http://localhost:5173
npm run check        # typecheck, lint, unit tests, production build
npm run test:e2e     # Playwright journeys on phone and tablet viewports
npm run test:db      # apply migrations to a throwaway Postgres and run RLS tests
```

Documentation:

- [`PROJECT_LEDGER.md`](PROJECT_LEDGER.md) — status, decisions, known issues, next actions
- [`CLAUDE.md`](CLAUDE.md) — coding standards
- [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) · [`docs/UX_PLAYBOOK.md`](docs/UX_PLAYBOOK.md) ·
  [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/ROADMAP.md`](docs/ROADMAP.md)
