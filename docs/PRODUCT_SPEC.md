# Product Specification

## Vision

Little Worlds transforms a child's spoken or typed imagination into original narrated storybooks
with optional illustrations. It should feel like a premium, calm children's book — not a dashboard.

## Users

| User | Needs | Constraints |
| --- | --- | --- |
| **Child (3–10)** — primary | Say an idea, hear a story, find favourites again | May not read; small hands; short attention; must be safe |
| **Parent** — account owner | Safety controls, cost control, privacy, simple setup | Busy; wants confidence without micromanaging |

## Principles

1. **Imagination to audiobook with minimum friction** — two taps from Home to "making".
2. **No reading required** for the core child journey: pictures, icons, colour and voice.
3. **Safe by default** — gentle tone, parent-chosen exclusions, server-side moderation.
4. **Honest** — never pretend a mock is live; never surprise parents with costs.
5. **Calm** — few choices per screen, generous but controlled spacing, soft motion.

## MVP screens

### 1. Home
- Personalised greeting by time of day with the child's avatar.
- Prominent illustrated **Make a story** action (mic icon).
- **Keep listening** card for the most recent in-progress story.
- Recent storybooks row with covers and "See all".
- Banner for a story still being made or needing a retry.
- Discreet grown-ups (lock) entry.

### 2. Create
- Large tap-to-talk microphone (tap to start, tap to stop — no holding).
- Editable transcription; re-record or clear.
- Typed alternative ("Type it instead").
- Picture-led idea starters (Dragon, Ocean, Space, Forest, Garden, Snow) for pre-readers.
- Duration: Short 5 min / Medium 10 / Long 15, shown as 1–3 moons; capped by parent maximum.
- Illustrations: With pictures / Just listen; hidden when a parent disables pictures.
- Friendly validation (too short, too long, excluded topic) that never repeats a blocked word back.
- Daily remaining stories shown as dots; friendly limit state when none remain.

### 3. Generating
- Clear stages: Writing the story → Painting the pictures → Recording the voice.
- Overall progress bar, rotating friendly messages, animated book.
- "Wait at home" (job continues in background) and "Stop making this story".
- Failure: friendly explanation, **Try again** (resumes the failed step only), "Finish later".
- Ready: cover reveal, title, **Play my story**, "Save for later".

### 4. Story Player
- Scene artwork with cross-fade per part; title; "Part n of N".
- Play/pause, ±15 s, previous/next part, scrubber with times, part dots for navigation.
- Optional read-along words (toggle).
- Progress saved automatically; resume where the child left off.
- "The End" moment with Listen again / Make a new story.

### 5. My Storybooks
- Grid of covers with status: New badge, listening progress bar, finished tick.
- Filters: All, Listening, New, Finished. Empty states for each.

### 6. Parent Settings (behind a grown-up check)
- Gate: multiplication question with keypad; unlock lasts 10 minutes per session.
- Child profile: first name/nickname, age band, avatar.
- Story content: tone, calm bedtime endings, topics to leave out, custom blocked words.
- Length & pictures: maximum length, default length, allow illustrations, pictures default.
- Limits & spending: stories per day, monthly budget, this month's usage.
- Privacy & account: data practices summary, export, sign out, delete all storybooks (confirmed).
- Prototype tools (Milestone 1 only): simulate a stage failure, reset demo data.

## Child safety & privacy requirements

- Collect only first name/nickname and age band for the child. No photos, DOB, location.
- Voice audio is transcribed and discarded; only text is stored.
- Server-side: input moderation, a child-safe system prompt shaped by age band, tone and
  exclusions, and output moderation of text **and** images before a story is released.
- Stories, assets and progress are private to the family (RLS + private storage bucket).
- Parents can delete everything at any time.
- Hard daily limits and monthly budget cap enforced server-side.

## Out of scope for MVP

Sharing/social, multiple children per account UI, offline downloads, printing, in-app purchases,
voice cloning, and any child-to-child interaction.
