This is a large multi-feature batch. I'll ship it in 5 sequential commits inside this response so the preview keeps working between steps.

## 1. OG / Social tags everywhere
Wire `<SEOHead>` (already exists) into every public page that's missing it: `Sports`, `MatchCenter` (done), `UserProfile`, `SubscriberPreferences`, plus per-section `image` overrides on Home, About, Vision, News, Podcasts, Gallery, Contact. Add a generated default OG fallback for sports.

## 2. Sports portal redesign (IPL-inspired) + pinned live ticker
- Rebuild `SportsLanding` with a hero scoreboard, gradient team-color cards, sticky tab strip, modern fixture rail, points-table stripes, animated number tickers (Framer Motion).
- New `LiveScoreTicker` component: a fixed-bottom pill on mobile (and top strip on desktop) that follows the user across **every** page when a match is `live`. Tap → `/sports/match/:id`. Auto-hides when no live match. Realtime via Supabase channel.
- Mount in `App.tsx` so it persists across routes.

## 3. YouTube live embed flow
Already have `youtube_url` + `is_live_stream` columns. Surface them prominently:
- Banner CTA "🔴 Watch Live on YouTube" on Home + Sports + MatchCenter
- Admin: validate URL (accept watch?v=, youtu.be/, live/) and preview the embed inline.

## 4. AI features (Lovable AI Gateway, no extra keys)
New edge function `sports-ai` with three actions:
- `caption` → suggest 3 captions for an uploaded image (used in Gallery/Posts/Sports admin)
- `match-summary` → generate post-match recap from match + innings rows
- `recompute-score` → given ball-by-ball events, compute totals, overs, RR, result, and write back to `matches` + `match_innings`
Add a `match_events` table (ball-by-ball: runs, wicket, extras, over, ball, batter, bowler) so admin enters one event per ball and AI/SQL aggregates. Add admin UI: ball-entry pad with quick buttons (0,1,2,3,4,6,W,WD,NB) → calls `recompute-score` after each ball. Realtime pushes update to public viewers instantly.

## 5. KPL data import via Firecrawl
Use Firecrawl connector to scrape `https://kplt20.org` (teams page, fixtures page). New edge function `kpl-import`:
- scrape pages
- AI-extract structured JSON (team name, short name, logo url, primary color; match no, date, teams, venue, status, scores)
- upsert into `tournaments` / `teams` / `matches`
Admin button "Import from kplt20.org" with progress + summary.

## Technical details
- New tables: `match_events (id, match_id, innings_no, over, ball, runs, is_wicket, extra_type, batter, bowler, note, created_at)` with RLS (admins write, public read).
- New edge functions: `sports-ai`, `kpl-import`.
- New components: `LiveScoreTicker`, `BallByBallPad`, `MatchSummaryPanel`, `AICaptionButton`.
- Connector: link Firecrawl via `standard_connectors--connect`.
- All AI calls via `LOVABLE_API_KEY` → `google/gemini-2.5-flash` (cheap/fast) for scoring & captions, `google/gemini-2.5-pro` for match summary.
- Animations: Framer Motion for ticker pulse, score count-up, tab transitions. Keep semantic tokens; no hardcoded colors.

## Order of execution (this turn)
1. Migration: `match_events` table + RLS.
2. Edge function `sports-ai` (3 actions).
3. Edge function `kpl-import` (after Firecrawl link).
4. `LiveScoreTicker` + mount in `App.tsx`.
5. Redesign `SportsLanding` (hero, animations, modern cards).
6. Admin `BallByBallPad` + `AICaptionButton` + import button.
7. OG tags pass on remaining pages.

Approve and I'll ship.