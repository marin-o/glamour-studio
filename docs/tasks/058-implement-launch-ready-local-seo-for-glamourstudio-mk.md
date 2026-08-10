# Implement launch-ready local SEO for glamourstudio.mk

Status: IN PROGRESS
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Make the public homepage and booking route accurately discoverable under
`https://glamourstudio.mk`, with crawl directives, canonical URLs, share
metadata, a sitemap, and truthful local-business structured data.

## Relevant documents

- `docs/product-spec.md` — local SEO quality boundary.
- `docs/owner-content-media-intake.md` — owner-confirmed business facts and
  the Lookbook permissions gate.
- Google Search Central guidance for LocalBusiness structured data,
  canonicalization, sitemaps, and crawl/index controls.
- Next.js App Router metadata, `robots`, and `sitemap` file conventions.

## Current repo notes

- Root metadata still uses `https://example.com` as `metadataBase` and does
  not declare the production canonical URL.
- `/booking` has distinct Macedonian title and description metadata.
- `/lookbook` is intentionally `noindex, nofollow` until media permissions are
  recorded; it must remain excluded from discovery surfaces.
- No App Router `robots` or `sitemap` metadata route exists.
- The owner has confirmed the salon name, Radovish address, phone number,
  Instagram profile, service categories, and canonical domain. Opening hours,
  reviews, and media permissions remain unconfirmed.
- Review posture: `none`. This is localized, deterministic metadata work with
  build-time validation and no exceptional-risk trigger.

## Scope

- Replace placeholder URL metadata with the canonical production origin.
- Add explicit canonical, Open Graph, and social metadata for the homepage and
  booking route using their existing truthful Macedonian copy.
- Add crawl/index directives and a sitemap containing only the canonical,
  indexable homepage and booking URLs.
- Add homepage JSON-LD using the most specific suitable LocalBusiness subtype
  and only owner-confirmed, visibly supported business facts.
- Keep SEO constants coherent so canonical URLs do not drift between metadata,
  sitemap, robots, and structured data.
- Keep review corrections and tuning in this task until the outcome is accepted.

## Suggested files

- `src/app/layout.jsx`
- `src/app/page.jsx`
- `src/app/booking/page.jsx`
- `src/app/robots.js`
- `src/app/sitemap.js`
- one small shared site/SEO data module under `src/lib/` if useful

## Acceptance criteria

- [x] Production metadata resolves against `https://glamourstudio.mk` and each
  indexable route declares its canonical URL.
- [x] `/robots.txt` permits the public site, avoids inviting crawlers into API
  endpoints, and advertises the canonical sitemap.
- [x] `/sitemap.xml` contains `/` and `/booking` as absolute canonical URLs,
  but excludes `/lookbook` and API routes.
- [x] The homepage emits valid JSON-LD for Glamour Studio with its confirmed
  name, URL, Radovish address, phone, Instagram, and representative image.
- [x] Structured data does not invent opening hours, ratings, reviews, staff,
  or other unconfirmed business claims.
- [x] `/lookbook` remains `noindex, nofollow`.
- [x] Required owner decisions remain explicit rather than invented.

## Non-goals

- Redesign, visible copy rewrites, analytics, paid SEO tooling, backlinks, or
  Google Business Profile management.
- Indexing the permission-gated Lookbook.
- Claiming rankings or immediate indexing.
- Google Search Console verification or sitemap submission before production
  DNS and HTTPS are stable; those remain owner-operated launch steps.

## Validation

- Run `pnpm lint` once after implementation.
- Run `pnpm build` once after implementation to verify App Router metadata
  generation, routes, and production compilation.
- Inspect the final diff and generated route summary for `/robots.txt` and
  `/sitemap.xml`; do not run visual/browser checks.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Do not substitute every static check for unavailable rendered validation. Leave rendered criteria awaiting owner verification when necessary.
- Task, evidence, and handoff-only edits do not invalidate successful runtime checks.

## Completion notes

- Transition: start at 2026-08-10T13:31:49.649Z

- Completed: Added one shared production SEO identity, homepage and booking
  canonicals/social metadata, a crawl policy, a two-URL sitemap, and homepage
  `BeautySalon` JSON-LD using only confirmed business facts. The Lookbook
  indexing gate remains unchanged.
- Validation: Targeted ESLint passed for all six changed/new runtime files.
  `pnpm build` passed with `/robots.txt` and `/sitemap.xml` emitted as static
  routes. `git diff --check` passed.
- Deviations: Repository-wide `pnpm lint` reached ignored/generated Netlify
  server bundles under `.netlify/functions-internal/` and failed on 24 bundled
  runtime lint errors unrelated to the source changes. Generated output was not
  edited; changed-source lint passed instead.
- Follow-up: Commit/push and allow Netlify to deploy after owner direction.
  Once DNS and HTTPS are stable, verify the `glamourstudio.mk` Domain property
  in Google Search Console, submit `/sitemap.xml`, request homepage indexing,
  and add or claim the free Google Business Profile. Task remains in progress
  pending deployment and owner acceptance.
