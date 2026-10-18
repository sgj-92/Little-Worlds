# UX Playbook

## Feeling

A well-loved picture book at bedtime: warm paper, soft night skies, gentle colour, rounded shapes.
Premium through restraint — few elements, each beautifully made.

## Colour tokens (`src/index.css` → `@theme`)

| Role | Token | Use |
| --- | --- | --- |
| Paper | `cream-50…300` | Backgrounds, inputs, quiet surfaces |
| Ink | `navy-900` (text), `navy-700/500` (secondary), `navy-300` (disabled) | All text ≥ 4.5:1 on cream |
| Lilac | `lilac-50…700` | Selection, navigation, secondary actions |
| Honey | `honey-50…700` | Primary actions (Make, Play), progress |
| Mint | `mint-50…700` | Success, finished, switches on |
| Rose | `rose-100/500/700` | Errors and destructive actions — soft, never alarming |

Backgrounds use the `paper` utility (cream with faint lilac/honey/mint glows). Body backgrounds are
never pure white; cards are `white/85` with a soft shadow and hairline ring.

## Typography

- **Display:** Fraunces Variable (soft axis) — headings, story titles, story text.
- **UI:** Nunito Variable — labels, buttons; extra-bold for actions.
- Scale: page title 28–36px, section 20px, body 16–18px, story read-along 18–20px.

## Shape, depth, motion

- Radii: 16px (inputs), 24px (tiles/covers), 32–40px (hero cards, artwork).
- Primary buttons have a tactile "ledge" shadow that compresses on press (`pressable` utility).
- Motion tokens: `page-in` (420ms ease-soft), `pop-in` (bounce), `float`, `twinkle`, `breathe`.
- Motion is decorative only, never required to understand state; disabled under reduced motion.

## Components (`src/ui`)

`Button`/`ButtonLink` (primary, secondary, soft, ghost, danger; md/lg/xl), `IconButton`/`IconLink`,
`ChoiceTiles` (native-radio picture tiles), `Toggle` (switch), `Stepper`, `ProgressBar`/`ProgressRing`,
`StoryCover`, `StoryArt`/`PlainCover`, `StateMessage`, `PrototypeNote`, `TopBar`, `Avatar`, `Toast`.

## Interaction principles

1. **One obvious next step** per screen, in honey.
2. **Icons + one word** for every child action; verbs a child would say ("Make my story").
3. **Touch targets** ≥ 48px; primary ≥ 56px; the Make/Mic buttons are 72–160px.
4. **Tap, don't hold** — holding is hard for small children.
5. **No dead ends** — every empty, error and limit state offers a way forward.
6. **Autosave** settings; confirm only irreversible destruction.
7. **Never shame** — errors are the app's fault ("the paint got a little smudged").
8. **Keep work safe** — background jobs, resumable retries, saved listening position.

## Layouts

- **Phone (<768px):** single column, floating bottom nav (Home · Make · Stories) on Home and Library;
  focused screens (Create, Generating, Player, Settings) replace the nav with a back button and,
  on Create, a sticky primary action.
- **Tablet (≥768px):** Home splits create/keep-listening and the library grid; Create puts the idea
  beside options; Library grid gains columns; Settings uses two columns.
- **Tablet landscape (≥1024px):** Player places artwork left, words and controls right.

## States

| State | Pattern |
| --- | --- |
| Loading/working | Animated illustration + stage list + progress bar + friendly line |
| Empty | `StateMessage` neutral with icon and a primary action |
| Error | `StateMessage` error (role=alert), retry first, then "later" |
| Success | Pop-in reveal + single primary action |
| Mocked | `PrototypeNote` dashed lilac pill |

## Illustration

Milestone 1 uses hand-built vector scenes for six worlds (moonlit forest, ocean, sky castle, space,
garden, snow) with four composition variants each. They define the art direction for AI
illustrations: soft gradients, simple rounded silhouettes, limited palette, cosy lighting,
no text in images, no frightening imagery.
