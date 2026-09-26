# Content planning, analytics, security, and search launch

## Build
- Finish the previously approved database policy hardening and deploy the protected backend functions.
- Add an admin content calendar that combines posts, gallery uploads, and podcast episodes, with month navigation, filters, dates, statuses, and links to their editors.
- Extend gallery and podcast records with optional scheduling dates and lifecycle statuses while preserving current content.
- Extend the SEO dashboard with post-level organic clicks and Search Console CTR/position.
- Add privacy-conscious first-party session engagement tracking to calculate an estimated bounce rate by landing page.
- Connect Google Analytics and add browser page-view and engagement events.

## Google Search Console
- Use the canonical `https://www.ajmalakhtar.com.np/` property.
- Put the exact verification tag in the live page, publish, verify the property, list it again, and submit the live sitemap.
- Confirm the sitemap includes published posts and active gallery images.

## Validation
- Check database access, protected functions, admin calendar behavior, analytics rendering, mobile layout, and the live sitemap.

## Technical details
- Admin-only write policies use the existing role checks; public content remains readable where intended.
- Search Console supplies clicks, impressions, CTR, and position. Bounce rate is calculated from first-party session engagement; Google Analytics is also initialized for future reporting.
