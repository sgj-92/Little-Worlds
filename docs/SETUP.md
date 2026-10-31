# Setup guide (project owner)

Little Worlds runs in two modes:

| Mode | When | What happens |
| --- | --- | --- |
| **Demo** | No Supabase variables set | Sample library, simulated account, everything stays in the browser |
| **Live** | `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set | Real parent accounts; stories and settings saved in Supabase |

Story making, voice capture and narration are still simulated in both modes (Milestones 3–4).

## 1. Create the database (once)

> ✅ Already done for project `mdswuatymersiwhvuqze` (applied through the Supabase connector on
> 2026-10-31). For a new project, run every file in `supabase/migrations/` in order.

1. Supabase dashboard → **SQL Editor** → **New query**.
2. Paste each file in [`supabase/migrations/`](../supabase/migrations/) in order → **Run**.
   It should finish with "Success. No rows returned". It is safe to run again.
3. Check **Table Editor**: `families`, `child_profiles`, `stories`, `story_scenes`, `listening_progress`,
   `generation_jobs` and `usage_events` should exist, each marked as RLS enabled.

## 2. Configure sign-in

Supabase → **Authentication → URL Configuration**

- **Site URL:** your production URL, e.g. `https://little-worlds.vercel.app`
- **Redirect URLs:** add
  - `https://little-worlds.vercel.app/**`
  - `https://*-sgj-92s-projects.vercel.app/**` (Vercel preview deployments; match your team slug)
  - `http://localhost:5173/**` (local development)

Supabase → **Authentication → Providers → Email**: keep **Confirm email** on (recommended).
Optionally set **Minimum password length** to 8 to match the app.

> The built-in email sender is rate-limited (a few emails per hour) and meant for testing.
> Before inviting families, add your own SMTP provider under **Authentication → Emails → SMTP Settings**
> and customise the email templates.

## 3. Connect Vercel

Vercel → project → **Settings → Environment Variables** (Production and Preview):

| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |

Then **Deployments → ⋯ → Redeploy**. Vite reads these at build time, so a redeploy is required.
Never add the secret / service-role key with a `VITE_` prefix.

## 4. Optional: Google and Apple sign-in

Both need accounts with the provider; the buttons stay hidden until you switch them on.

**Google** (free)
1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** (Web application).
2. Authorised redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Supabase → Authentication → Providers → **Google**: paste the client ID and secret, enable.

**Apple** (requires an Apple Developer Program membership)
1. Create a Services ID with **Sign in with Apple**, return URL `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Create a Sign in with Apple key; Supabase → Providers → **Apple**: enter the Services ID, team ID, key ID and key.
   Apple's client secret expires every 6 months — set a reminder to regenerate it.

Finally add `VITE_AUTH_PROVIDERS` = `google,apple` (or just one) in Vercel and redeploy.

## 5. Check it works

1. Open the site → **Create an account** → confirm the email → set up the child profile.
2. Make a story, play part of it, then sign in on another device: the story and position should be there.
3. Supabase → Table Editor → `stories`: one row, owned by your user id.
