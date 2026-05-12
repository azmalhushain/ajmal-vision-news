
# Phase 4 Execution Plan — News Upgrades + KPL3 Sports Portal

The combined ask is very large. To stay shippable and keep each turn reviewable, I'll split it into **three sub-phases (4A, 4B, 4C)**. Each ends in a working deploy.

---

## Sub-phase 4A — News upgrades (ship first, ~1 turn)

Scope is small and high-impact, unblocks everything else.

1. **Category chips + search bar** on `/news`
   - Chips: All, Development, Education, Health, Environment, Infrastructure, Events, Announcements (derived dynamically from existing post categories + a default set).
   - Debounced search input filters by `title`, `excerpt`, `content` (Postgres `ilike`).
   - URL-synced (`?cat=Health&q=road`) so filters survive refresh / share.

2. **RSS feed** at `/rss.xml`
   - New edge function `rss-feed` returns `application/rss+xml` of latest 50 published posts (title, link, description, pubDate, category, enclosure for image).
   - Add `<link rel="alternate" type="application/rss+xml">` to News page head.
   - Add a small "RSS" button on the News hero linking to `/rss.xml`.
   - Netlify redirect `/rss.xml → /functions/v1/rss-feed`.

3. **Auto OG/Twitter/FB share image per article**
   - `og-image` edge function already exists — extend it to render a branded card (title, category badge, mayor logo, gradient bg) using `@vercel/og`-style SVG.
   - `NewsModal`/article SEO already passes `image` prop. Update `SEOHead` so when an article has no `image_url`, it falls back to `https://…/functions/v1/og-image?postId={id}`.
   - Admin `PostEditor` already supports a featured image upload — add a small "Use auto-generated share image" toggle that simply leaves `image_url` blank.

4. **Infinite scroll on News** — already implemented in `NewsSection.tsx` (verified: IntersectionObserver + `ITEMS_PER_PAGE = 6`). I'll bump page size to 9 and add a graceful "Load more" button fallback for users without IO support.

5. **Admin News CMS** — `PostEditor.tsx` + `/admin/posts` already exist (create/edit/publish/category/featured image/scheduled publish). I'll audit and add: drag-to-reorder via `display_order` column (new migration), bulk publish/unpublish, and a category dropdown with the same canonical list as the public chips.

**Deliverables:** Updated `News.tsx`, `NewsSection.tsx`, new `NewsFilters.tsx`, new `rss-feed` edge function, `netlify.toml` redirect, OG fallback, migration adding `posts.display_order int default 0`.

---

## Sub-phase 4B — KPL3 backend + admin CMS (~1–2 turns)

1. **DB migration** for all KPL3 tables (`tournaments`, `teams`, `players`, `matches`, `match_innings`, `sports_news`, `sports_media`, `social_posts_cache`) with full RLS (public SELECT on published, admin ALL via `has_role`).
2. **Seed** `KPL3` tournament + the 7 announced teams (Birtamode Heats, Everest Thunders, Gorkha Avengers, BN Koshi Arnas, Namuna Blasters, Itahari Adarsh Giants, Purbeli Super Kings).
3. **Storage buckets** `sports-media` (public) and `sports-logos` (public).
4. **Admin sidebar group "Sports / KPL3"** with editors:
   - Tournaments • Teams (logo upload, colors) • Players (photo, role, jersey) • Fixtures (schedule a match) • **Live Score Console** (per-match form: runs, wickets, overs, status, result, commentary note) • Sports News (reuse rich-text editor pattern from `PostEditor`) • Media (bulk upload, no auto-crop, manual crop optional — reuses `GalleryBulkUploader` + `CropDialog`) • Facebook Sync placeholder (UI only in 4B).
5. Realtime enabled on `matches` and `match_innings`.

**Deliverables:** 1 large migration, ~10 new admin pages under `src/pages/admin/sports/`, sidebar update, route additions in `App.tsx`.

---

## Sub-phase 4C — KPL3 public portal + Home integration + Facebook sync (~1–2 turns)

1. Public routes under `/sports/*` (landing, fixtures, standings, teams, team detail, players, match center, sports news).
2. ESPN/Cricbuzz-style dark glass UI components: `LiveMatchBanner`, `MatchCard`, `ScorecardTable`, `StandingsTable`, `PlayerCard`, `TeamCard`, `CountdownToNextMatch`, `SponsorMarquee`.
3. Home page integration strip (live banner + next match countdown + featured sports news + sponsors).
4. Sitemap extension: `/sports`, `/sports/fixtures`, dynamic team/player/match URLs.
5. `SportsEvent` JSON-LD on each match page; `BreadcrumbList` on inner pages.
6. **Facebook auto-sync** via `fb-sync-kpl` edge function (Graph API + `pg_cron` every 30 min). Requires you to provide: **Facebook App ID, App Secret, KPL Page ID, long-lived Page Access Token** (I'll request via secrets at 4C start). Fallback: official Facebook Page Plugin embed.

**Deliverables:** ~12 public pages/components, edge function `fb-sync-kpl`, sitemap update, secrets request.

---

## Why split this way

Phase 4 alone touches 10+ database tables, 20+ new files, realtime, an external Graph API integration, and a fresh public section. Doing it plus the News work in one turn would be unreliable to review and almost certain to mix unrelated regressions. Splitting lets each turn build cleanly on a green deploy.

## Suggested order

1. Approve → I ship **4A** now (News chips + search + RSS + OG fallback + admin polish).
2. Then **4B** (KPL3 schema + admin CMS).
3. Then **4C** (KPL3 public + Facebook sync — needs your FB credentials).

Reply "go" to start with **4A**, or tell me to reorder/trim.
