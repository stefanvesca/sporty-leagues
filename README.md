# Sporty Leagues

A single-page app that lists sports leagues from [TheSportsDB](https://www.thesportsdb.com/free_sports_api), with name search, a sport filter, and click-to-reveal season badges. Built for the Sporty frontend home assignment.

**Live demo:** _link added after deployment_

## Run it

```bash
npm install
npm run dev
```

Other scripts: `npm run test` (Vitest), `npm run lint`, `npm run typecheck`, `npm run build && npm run preview`.

No configuration is required — the app ships with TheSportsDB's public test key. To use your own key, copy `.env.example` to `.env` and set `VITE_SPORTSDB_KEY`.

## Features

- Fetches all leagues and displays `strLeague`, `strSport`, and `strLeagueAlternate` (when the API provides it)
- Debounced search by league name (also matches the alternate name)
- Sport dropdown, derived from the actual data rather than hardcoded
- Clicking a league expands the card in place and loads a season badge via the Season Badge API
- Every API response is cached (see below) — repeat clicks and reloads fire no duplicate requests
- Responsive layout, dark theme by default with a light-mode toggle, loading skeletons, and explicit empty/error states with retry

## A note on the API's free tier

While building this I found that the free/test API keys currently return **only 5 leagues (all Soccer) and omit `strLeagueAlternate`** — the full ~570-league dataset now requires a premium key. The assignment's display and filtering requirements are all implemented against the live response shape, defensively handling the missing field.

So the filters can actually be demonstrated, the app detects the capped response and offers a labelled **"Load demo dataset"** toggle. The bundled snapshot is real data — it was harvested from TheSportsDB's own `lookupleague.php` endpoint (which still returns complete records on the free key), so every league carries its genuine ID and **badge clicks on demo rows still hit the live API**.

## Architecture

```
src/
├── api/
│   ├── types.ts            API response types
│   └── sportsDb.ts         endpoint wrappers (key from env, defaults to test key)
├── composables/
│   ├── useCachedFetch.ts   response cache: memory Map + sessionStorage TTL + in-flight dedup
│   └── useTheme.ts         dark/light toggle, persisted to localStorage
├── stores/
│   └── leagues.ts          Pinia store: leagues, search term, sport filter, demo mode
├── components/
│   ├── AppHeader.vue       logo + theme toggle
│   ├── FilterToolbar.vue   search + sport dropdown + result count
│   ├── SearchBar.vue       debounced text input
│   ├── SportFilter.vue     dropdown fed by the store's derived sport list
│   ├── LeagueList.vue      grid, skeletons, empty and error states
│   ├── LeagueCard.vue      league row; expands inline to reveal the badge
│   ├── SeasonBadge.vue     cached badge lookup with loading/empty/error states
│   └── DemoDataNotice.vue  free-tier notice + demo dataset toggle
└── data/
    └── leagues.fallback.json  real league records harvested from the API
```

### Caching

The brief asks for cached responses, so the cache is written by hand rather than pulled from a library — `useCachedFetch.ts` is ~90 lines with three layers:

1. **In-memory `Map`** — instant repeat hits within the session
2. **`sessionStorage` with a 1-hour TTL** — survives page reloads, expires stale data
3. **In-flight request dedup** — concurrent requests for the same key share one promise, so double-clicking a league fires a single fetch

Both the league list and each badge lookup go through it. Failures are never cached, so a retry genuinely retries.

## Tech choices, argued

- **Vite + Vue 3 + TypeScript, no meta-framework.** The brief asks for an SPA consuming one public API. Nuxt's core value — SSR/SEO, file routing, server routes — would be unused weight here, and an unjustified dependency is a cost with no payoff. (Worth noting sporty.com itself is a Nuxt app; for a public, SEO-relevant league index, Nuxt with server rendering is exactly what I'd reach for.)
- **Pinia + a hand-rolled cache instead of TanStack Query.** State management and caching are the two things the brief explicitly evaluates; a library would reduce both to configuration. Pinia holds the list and filter state with derived `computed`s; the cache demonstrates the mechanism itself.
- **Tailwind CSS v4.** Matches Sporty's production stack (sporty.com ships Tailwind classes). Brand and semantic tokens are defined CSS-first with `@theme`, and the dark/light themes swap only the semantic layer.

## Design

Colors and logo are drawn from sporty.com's visual identity: brand red `#E41827` (hover `#FF3C4F`) on dark ink surfaces, dark theme as default. League names are set in Archivo with a narrowed width axis — a nod to scoreboard typography — while UI text is Inter. Fonts are self-hosted via Fontsource so the project runs fully offline. The one deliberate flourish is the red rule on each card that answers hover and locks in when a league is expanded; everything else stays quiet.

Accessibility floor: semantic buttons with `aria-expanded`, visible focus rings, `role="status"` on the result count, `prefers-reduced-motion` respected, and the layout holds down to 360 px.

## Time spent

The core requirements (list, filters, badge with caching) landed within the ~90-minute budget. The extras — theme toggle, demo-data fallback, tests, CI — were added beyond it and are detailed in [AI_NOTES.md](AI_NOTES.md) along with how AI tooling was used.
