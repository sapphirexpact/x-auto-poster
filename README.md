# X Auto Poster / Watcher (Milestone 1)

Mobile-first Next.js frontend shell for exact posts, watches (max 3), and calm auto-drafts — one connected X account.

## Run

Install dependencies from `package.json`, then use the `dev`, `build`, and `start` scripts.

Open http://localhost:3000 — use **Settings → Load demo connected state** for a populated mock, or complete onboarding.

## Stack

- Next.js App Router + TypeScript + Tailwind
- `src/` directory
- React context (`src/lib/context`) + mock API (`src/lib/mock`)
- API contracts in `src/lib/api/types.ts` (SexyBot-facing)

## Product locks (Milestone 1)

- 1 connected X account (mock OAuth)
- Exact **Post** skips the AI review gate
- Watch max **3**; notify on every post; no keyword filters
- Auto modes: **Trending memes** (default) | Crypto | Custom prompts
- Review-before-post **ON** for Auto days 1–7; Day-8 full-auto banner; early unlock with confirm
- Loud auth / rate-limit errors
- Kill switch (**Pause**) pauses **Auto only** — Post and Watch still work
- Disconnect keeps watches, pauses alerts, pauses Auto

## Defaults

| Area | Default |
|------|---------|
| Post | Text-only v1 |
| Watch alerts | In-app |
| Times | Labeled **America/Los_Angeles (PT)** |
| Custom prompts | Free-text + presets |
| Auto cadence | **6h** |
| Review-before-post | **ON** |
| Skip onboarding (after connect) | Defaults applied; **Auto paused** until enabled |
| Quiet hours | 22:00–07:00 PT |

## Screens

- **Onboarding** (~3 steps): Connect X → Auto defaults → Add 0–3 watches (skippable)
- **Home**: account chip, write/post CTA, Auto pause/edit, next draft, watch strip, activity, reconnect banner
- **Post**: compose + 280, Post now / Schedule, exact history, failures + Retry
- **Watch**: n/3 rows, alert inbox, Open on X, limit copy at 3/3
- **Auto**: mode / cadence / quiet hours / review, queue, history, pause/resume, Day-8 banner
- **Settings**: reconnect/disconnect, notifications, review-gate mirror, danger clears

## Mock vs real boundary

| Layer | Milestone 1 | Later |
|-------|-------------|-------|
| `src/lib/api/types.ts` | Shared contracts | Unchanged / versioned |
| `src/lib/mock/*` | In-memory + `localStorage` | Replace with HTTP client |
| UI / context | Calls mock helpers | Same shapes from SexyBot API |
| Auth | Mock Connect with X | Real OAuth |
| Posting / watches / auto | Simulated | SexyBot backend |

No real X API calls are made from this app yet.

## Demo tips

- Include the words `rate limit` in an exact post to force a loud failure + Retry path.
- Settings → **(Demo) Auth error** shows the reconnect banner.
- Auto → **(Demo) Jump to Day 8** shows the full-auto banner once.
