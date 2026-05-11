
# Master Plan — Routing Fix, SEO, Gallery Upgrade, KPL3 Sports Portal

This is a large scope. To keep things shippable, the work is organized into **5 phases**. Each phase ends in a working, deployable site. You can pause/redirect after any phase.

---

## Phase 1 — Fix Netlify SPA 404 on refresh (HIGHEST PRIORITY)

**Problem:** `ajmalakhtar.com.np` is served from Netlify. Netlify treats `/vision`, `/about`, etc. as missing files and shows its built-in 404 instead of letting React Router handle them.

**Fix:**
1. Create `public/_redirects` containing:
   ```
   /*    /index.html   200
   ```
2. Create `netlify.toml` at project root with the same SPA fallback + cache headers for `/assets/*` and security headers (X-Frame-Options, Referrer-Policy, etc.).
3. Verify Vite copies `public/_redirects` into `dist/` on build (default behavior — confirmed).
4. After deploy: test `/vision`, `/about`, `/news`, `/gallery`, `/contact`, a deep article URL, and `/this-does-not-exist` (should hit our custom astronaut 404, not Netlify's).

**Outcome:** All routes work on refresh, direct link, and Google result clicks.

---

## Phase 2 — Per-page SEO + indexing

Project already has `SEOHead` and a sitemap edge function. Gaps to close:

1. **Audit + add `<SEOHead>`** to every public page that's missing one or has stale data: `Home`, `About`, `Vision`, `News`, `Podcasts`, `Contact` (Gallery already has it). Each gets unique title (<60 chars), description (<160), keywords, OG image, canonical.
2. **Per-article SEO:** when a `NewsModal`/article opens, push article-specific meta + `NewsArticle` JSON-LD (already partly supported in `SEOHead`).
3. **Sitemap:** extend the existing `sitemap` edge function to include all static routes + published posts + gallery + podcasts + (later) KPL3 pages. Make sure `robots.txt` already references it (it does).
4. **Heading hierarchy pass:** ensure exactly one `<h1>` per page, semantic `<main>`, `<article>`, `<nav>`, `<section>`.
5. **Schema markup:** `WebSite`, `Person`, `GovernmentOffice` already in `index.html`. Add `BreadcrumbList` to inner pages and `SportsEvent` later for KPL3.
6. **Performance basics:** add `loading="lazy"` + `decoding="async"` to all `<img>`, route-level code-splitting via `React.lazy` for admin and heavy public pages, preload primary font subset.

**Outcome:** Lighthouse SEO ≥ 95, every page indexable with unique metadata.

---

## Phase 3 — Gallery upgrade (no auto-crop)

Replace the current admin gallery editor and public gallery with a pro-grade flow.

**Admin (`/admin/gallery`):**
- Drag-and-drop **bulk upload** (react-dropzone) with multi-file queue, per-file progress, thumbnail preview before upload.
- **No automatic cropping or resizing.** Original file uploaded to `post-images` bucket (or new `gallery` bucket).
- Optional **manual crop/edit modal** (react-easy-crop) that the admin opens per image only if they want to.
- Client-side **lossless-ish compression** using `browser-image-compression` (quality 0.9, max dim 2400) — toggleable, off by default to fully preserve quality.
- Auto-detect orientation (landscape/portrait/square) and store `width`, `height`, `aspect_ratio` columns so the public grid can lay out without CLS.
- Drag-to-reorder, pin, category tagging, bulk delete.

**Schema change (migration):**
- `gallery_images` add: `width int`, `height int`, `aspect_ratio numeric`, `blur_hash text null`, `alt_text text`.

**Public (`/gallery`):**
- True **masonry layout** (`react-masonry-css`) honoring each image's natural aspect ratio — no cropping, no stretching, `object-fit: contain` fallback.
- **Lazy loading** + low-quality placeholder using stored dimensions (prevents CLS).
- Lightbox viewer (`yet-another-react-lightbox`) with swipe, zoom, share.
- Filter by category, "Pinned first" preserved.

**Outcome:** Admins can mass-upload originals; public gallery shows mixed sizes beautifully without distortion.

---

## Phase 4 — KPL3 Sports Portal (foundation + admin CMS)

New top-level section at `/sports` with sub-routes.

### Routes
```
/sports                  → KPL3 landing (live banner, next match, latest news, standings preview)
/sports/fixtures         → Full schedule, filterable by team/date
/sports/standings        → Points table, NRR
/sports/teams            → Team grid
/sports/teams/:slug      → Team detail (squad, fixtures, results)
/sports/players/:slug    → Player profile + stats
/sports/matches/:id      → Match center (scorecard, commentary, highlights)
/sports/news             → Sports news feed
/sports/news/:slug       → Article
/sports/gallery          → Match photos & videos
```

### Database (new tables, migrations)
- `tournaments` (id, name, slug, season, start_date, end_date, venue, sponsor_logo_urls jsonb, status)
- `teams` (id, tournament_id, name, slug, logo_url, jersey_url, captain_player_id, home_ground, founded, color_primary, color_secondary)
- `players` (id, team_id, name, slug, photo_url, role, jersey_number, batting_style, bowling_style, dob, bio, stats jsonb)
- `matches` (id, tournament_id, team_a_id, team_b_id, match_no, scheduled_at, venue, status enum: scheduled|live|completed|abandoned, toss_winner_id, toss_decision, result_text, winner_id, poster_url)
- `match_innings` (id, match_id, batting_team_id, runs, wickets, overs, extras, declared bool)
- `match_events` (id, match_id, over_no, ball_no, event_type, runs, batsman_id, bowler_id, fielder_id, commentary)  — for ball-by-ball if you ever want it
- `sports_news` (id, tournament_id, title, slug, excerpt, content, cover_url, tags[], status, published_at, author_id, views)
- `sports_media` (id, tournament_id, match_id null, type enum: image|video|reel, url, thumbnail_url, caption, source enum: upload|youtube|facebook, display_order, is_pinned)
- `social_posts_cache` (id, source enum: facebook|instagram, external_id unique, posted_at, message, media_urls jsonb, permalink, raw jsonb, fetched_at) — for Facebook feed sync
- All tables: RLS — public SELECT for published rows, admin ALL via `has_role(auth.uid(),'admin')`.

### Admin dashboard additions
New sidebar group **Sports / KPL3**:
- Tournaments • Teams • Players • Fixtures • Live Score Console (manual update form per match: runs/wickets/overs/result/commentary) • News (rich text editor, tags) • Media (bulk upload, no auto-crop, manual crop optional) • Sponsors • Facebook Sync (status + manual refresh button)

### Public UI components
- `LiveMatchBanner` (sticky on home + sports landing when a match is `live`) with auto-refresh every 30 s via Supabase Realtime on `matches` row.
- `MatchCard`, `ScorecardTable`, `StandingsTable` (computed from `matches` results), `PlayerCard`, `TeamCard`.
- `CountdownToNextMatch`, `NewsTickerBar`, `SponsorMarquee`.
- ESPN/Cricbuzz-inspired dark glass UI, framer-motion transitions, fully responsive.

### Homepage integration
Add to `Home`: Latest Match Result • Upcoming Match Countdown • Featured KPL3 Highlight • Trending Sports News strip • Sponsor showcase.

### Seed data
Migration seeds the 7 announced teams (Birtamode Heats, Everest Thunders, Gorkha Avengers, BN Koshi Arnas, Namuna Blasters, Itahari Adarsh Giants, Purbeli Super Kings), tournament `KPL3` with dates `2026-03-21 → 2026-04-03`, venue "Dr. Khalil Azad Cricket Khel Maidan, Sunsari".

**Outcome:** Fully manageable sports section even before any external API is wired.

---

## Phase 5 — Facebook auto-sync + finishing touches

### Facebook Page integration (policy-compliant)
- Edge function `fb-sync-kpl` runs on a `pg_cron` schedule (every 30 min).
- Uses **Facebook Graph API** `/{page-id}/posts?fields=id,message,created_time,full_picture,attachments,permalink_url` with a long-lived **Page Access Token**.
- **Required from you:** Facebook App ID, App Secret, KPL Page ID, long-lived Page Access Token. I'll request these via secrets when this phase starts.
- Cached in `social_posts_cache`; public component `FacebookFeed` renders newest-first card grid with lazy thumbnails and link-out to Facebook.
- Admin toggle: enable/disable sync, force refresh, hide individual posts.
- Fallback if API unavailable: Facebook Page Plugin embed.

### Live score (optional, deferred)
- Manual updates already cover requirement. If you later want auto, we can add CricAPI / RapidAPI cricket source behind another secret.

### Final polish
- Lighthouse pass (perf/SEO/a11y/best-practices).
- Add `SportsEvent` JSON-LD on each match page.
- Add `/sports`, `/sports/fixtures`, etc. + dynamic match/news URLs to sitemap.
- Caching: `react-query` `staleTime` tuning, image CDN headers.

---

## Technical notes (for implementation)

- All new colors/spacing via existing HSL design tokens — no hard-coded hex.
- Heavy admin pages and `/sports/*` lazy-loaded with `React.lazy` + `Suspense`.
- Realtime: enable replication on `matches`, `match_innings`, `social_posts_cache`.
- Storage bucket strategy: keep `post-images` for posts; add buckets `gallery` and `sports-media` (public read, admin write).
- New deps: `react-dropzone`, `react-easy-crop`, `browser-image-compression`, `react-masonry-css`, `yet-another-react-lightbox`.

---

## Suggested execution order after approval
1. Phase 1 (≈ 1 short turn) — unblocks the live site immediately.
2. Phase 2 (1–2 turns).
3. Phase 3 (2 turns: schema + admin, then public grid).
4. Phase 4 (3–4 turns: schema → admin CMS → public pages → home integration).
5. Phase 5 (1–2 turns, requires your Facebook credentials).

Approve this plan and I'll start with **Phase 1** so refresh-404s are gone first, then proceed through the rest.
