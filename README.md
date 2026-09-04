# X Auto Poster / Watcher

Milestone 1 frontend - Next.js App Router, TypeScript, Tailwind.

Exact posts, watches (max 3), and auto-draft modes for one X account.
Local mock API mirrors contracts in src/lib/api/types.ts.

## Run

nmp install
nmp run dev

Open http://localhost:3000

nmp run build
nmp start

## Defaults (product locks)

- 1 connected X account (mock OAuth)
- Post: text-only exact; skips AI review gate
- Watch: max 3; alert on every post; no keyword filters; in-app
- Auto modes: Trending memes (default), Crypto, Custom prompts
- Cadence 6h; quiet hours 22:00-07:00 America/Los_Angeles (PT)
- Review-before-post ON days 1-7; Day-8 full-auto banner once; early unlock with confirm
- Skip after connect: Auto paused until enabled
- Kill switch pauses Auto only (Post + Watch still work)

## Screens

- Onboarding (3 steps): Connect, Auto defaults, Watches
- Home, Post, Watch, Auto, Settings - all functional mocks

## Mock vs real API

| Layer | Role |
| --- | --- |
| src/lib/api/types.ts | Backend contracts |
| src/lib/mock/ | In-memory mutations |
| src/lib/context/AppContext.tsx | UI state + localStorage (xap-milestone1-state) |

Swap src/lib/mock/api.ts for a real HTTP client with the same response shapes.

### Demo tips

Settings - Load demo connected state.

Include the phrase rate-limit in an exact post body to simulate a loud failure.
