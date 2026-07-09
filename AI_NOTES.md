# AI tools used

The assignment explicitly allows AI tooling and asks for notes on what was used and how. This project was built with **Claude Code** (Anthropic's CLI agent) working under my direction; every architectural and design decision below was made or approved by me before implementation.

## How it was used

- **Planning.** Before writing code we produced a written plan: framework choice (Vite + Vue 3 over Nuxt, with the reasoning in the README), state/caching approach, styling, and how to handle an API surprise (see below). I made the calls; the agent argued trade-offs.
- **Brand extraction.** The agent fetched sporty.com, pulled the logo SVGs from its CDN, and extracted the brand palette (`#E41827`, `#FF3C4F`, dark ink neutrals) from the site's markup so the UI matches Sporty's identity.
- **API reconnaissance.** Probing the endpoints before coding revealed that the free tier now caps `all_leagues.php` at 5 soccer leagues and omits `strLeagueAlternate`. That discovery shaped the demo-dataset feature. It also found that `lookupleague.php` still returns complete records, which is how the bundled fallback data was harvested — it is real API data with genuine league IDs, collected by a small rate-limit-respecting script.
- **Scaffolding and implementation.** Component code, the cache composable, the Pinia store, tests, and the CI workflow were written by the agent following the agreed plan, then reviewed and iterated with screenshots at desktop and mobile widths.
- **Skills/guidance.** The agent loaded curated best-practice guides (Anthony Fu's Vue/Pinia/Vitest skills, a Tailwind v4 design-token guide) so the code follows current idioms — `<script setup lang="ts">`, setup-style stores, `storeToRefs`, CSS-first Tailwind theming.

## What I'd flag as beyond the 90-minute scope

The core brief (league list, search, sport dropdown, badge-on-click with caching, responsive layout) fits the budget. The additions — dark/light theming, the demo-data fallback with harvested real data, the unit tests, CI + GitHub Pages deploy, and this documentation — are extras made feasible by the tooling, included because they demonstrate how I'd actually ship.
