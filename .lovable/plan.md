# Sports Portal Redesign + Feature Expansion

Inspired by the attached **Cricket League 2025** mockup (dark stadium background, neon-lime accents, glassmorphism cards, team logo battles, animated stat counters, side leaderboard rail).

You've listed ~80 features. Many already exist (live ticker, ball-by-ball, match center, AI summary, fixtures, teams, news, gallery, push, dark mode, admin CMS, KPL scraping, social feeds). The plan focuses on **redesign + filling visible gaps** in phases so each phase ships working.

## Phase 1 — Home + Sports landing redesign (this turn)

**Home page**
- Remove the existing "KPL banner / SportsHomeStrip" from `Home.tsx` (per request).
- Keep hero, news, podcasts, vision — untouched in scope.

**Sports landing (`/sports`) — full redesign** inspired by mockup:
- **Stadium hero**: dark gradient + animated stadium-light radial glow, neon-lime accent (`--sports-accent`), "KPL 2025" wordmark with scripted year, dual CTA (Join League / Explore Teams).
- **Stat strip** (glass card): Teams • Matches • Days to Final • Prize Pool — animated count-up via `framer-motion` `useMotionValue`.
- **Next Big Battles**: 3 upcoming-fixture glass cards with team-vs-team logos, date/venue, Watch Live pill. Swipeable on mobile (horizontal snap scroll).
- **Two-column lower band** (desktop) / stacked (mobile):
  - Left: "Feel the Excitement" feature list (Live Streaming, Real-Time Stats, Exclusive Rewards) with trophy video poster.
  - Right rail (desktop only, ≥lg): **Featured Teams grid** (2-col mini cards w/ logos) + **Points Table** (compact, M/W/L/Pts, animated row highlight on rank change).
- **"Ready for the Challenge?" CTA card** with trophy image + Join Now / View Schedule.
- Sticky in-page tab strip (Fixtures · Teams · Results · Stats · News) — keep existing tabs but restyle as neon pills.
- All cards: glassmorphism (`bg-white/[0.03] backdrop-blur border border-white/10`), hover neon glow (`shadow-[0_0_40px_-10px_hsl(var(--sports-accent)/0.6)]`).

**Design tokens** added to `index.css` under a `.sports-theme` scope (won't affect rest of site):
- `--sports-bg: 140 30% 4%`
- `--sports-accent: 80 95% 60%` (neon lime)
- `--sports-card: 0 0% 100% / 0.04`

## Phase 2 — Feature gaps (follow-up turn after Phase 1 approved)

Implement the highest-impact missing features:
1. **Points table** with NRR (compute from `match_innings`) + admin edit.
2. **Orange/Purple cap leaderboards** — new `player_stats` table, admin entry, top-N cards on landing.
3. **Player profiles** — new `players` table linked to teams, profile pages `/sports/player/:id`, AI-generated bio from stats.
4. **Win-probability strip** on live match center — simple AI call (`sports-ai` action `win-prob`) using current score/overs.
5. **Run-rate graph** on match center — Recharts area chart from `match_events`.
6. **Breaking news ticker** — horizontal marquee at top of `/sports` pulling `news` tagged `sports`.
7. **Fan poll** per match (vote which team wins) — `match_polls` + `match_poll_votes` tables.
8. **Stadium info** on each fixture — add `venue_info` jsonb to `matches`.

## Phase 3 — Polish + nice-to-haves

- Fantasy-style "pick your XI" (local-storage only, no backend complexity).
- Ticket booking link field per match (admin URL, external redirect).
- Sponsor showcase strip (already has `sponsors` table? if not, add).
- Match-result archive page with season + team filters.
- Animated chart counters, scroll-triggered reveals (Intersection Observer + framer-motion `whileInView`).

## Admin panel

All Phase 2 entities get CRUD inside `SportsManager.tsx` as new tabs (Players, Stats, Polls, Sponsors). Existing match/team/fixture admin untouched.

## AI integrations (reuse `sports-ai` edge function)

Add actions:
- `win-prob` — current score → win % per team (Gemini 2.5 Flash, JSON out).
- `player-bio` — career stats → 100-word bio.
- `news-headline` — match result → 3 punchy headlines.

Image-caption + post-match summary already exist.

## Data seeding

After redesign, run `kpl-import` to refresh from kplt20.org and **insert dummy fallback** rows (4 teams, 6 fixtures, 1 live match, points-table seed) via migration so the page never looks empty when KPL data is missing.

## Out of scope (this plan)

- Real third-party live-score API (we already have admin ball-by-ball + AI recompute; pulling from a paid feed needs a paid key).
- Real fantasy backend (just local pick XI).
- Real ticket payments (link only).
- Real-time push for every wicket (existing push infra handles it once admin wires triggers).

## Files (Phase 1)

- edit `src/pages/Home.tsx` — remove SportsHomeStrip mount
- edit `src/pages/Sports.tsx` — full rewrite to mockup-inspired layout
- edit `src/index.css` — add `.sports-theme` tokens + utility classes
- new `src/components/sports/StadiumHero.tsx`
- new `src/components/sports/StatCountStrip.tsx`
- new `src/components/sports/FeaturedTeamsRail.tsx`
- new `src/components/sports/PointsTableCompact.tsx`
- new `src/components/sports/NextBattles.tsx`
- new `src/components/sports/ExcitementBand.tsx`
- reuse existing `LiveScoreTicker`, `MatchCard`, social feed.

---

**Confirm to proceed with Phase 1**, or tell me to reorder/expand a phase.
