# Implement launch-ready local SEO for glamourstudio.mk

Status: DONE
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
- Launch-polish correction slice (address truth, mobile stroke choreography,
  and favicon): review posture `adversarial`. The slice crosses content/SEO,
  mobile motion, and application metadata while rendered validation remains
  owner-gated under the conservative policy; desktop and reduced-motion
  behavior must remain unchanged.
- Owner-rendered mobile correction remains part of that reviewed slice: soften
  narrow-screen direction changes and keep the custom visible scrollbar skin
  on fine-pointer devices while touch devices retain native auto-hiding page
  scrolling. This is a focused review correction with no expanded hard-risk
  surface, so it does not trigger a second adversarial review cycle.
- Production acceptance exposed a launch-blocking booking availability 503.
  The bounded diagnostic and recovery work uses review posture `adversarial`
  because it touches production observability, secrets-adjacent provider
  failures, and deployment state. Diagnostics must never log credentials,
  request bodies, customer fields, or provider payloads.
- Hero readability tuning: review posture `none`. Increase the existing warm
  hero veil from 52% to approximately 72% opacity so the foreground lettering
  reads more clearly, while preserving the current blur, media, and curtain
  behavior. This is a localized styling adjustment with no exceptional-risk
  trigger.
- Keratin hydration naming correction: review posture `none`. Rename the
  customer-facing keratin service to make clear that Glamour offers the
  hydration treatment, not keratin straightening, while preserving its stable
  service ID, price, duration, and booking behavior.

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

- Transition: complete at 2026-08-21T23:45:11.866Z
- Validation: Owner directed progression to the next independent outcome and requested committing all pending changes; SEO, launch-polish, hero-readability, and keratin-hydration changes have recorded validation evidence.
- Approved by: Owner

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
- Production recovery evidence (2026-08-10): the owner authorized Netlify CLI
  operations. The four Google Calendar variables were refreshed from the
  locally verified credential set and a production deploy completed, but the
  public availability endpoint still returned `CALENDAR_UNAVAILABLE` on both
  the custom domain and immutable deploy URL. Netlify function logs confirmed
  the requests reach the function but did not expose the sanitized dependency
  cause, so a minimal secret-safe diagnostic is required before correction.
- Production recovery diagnosis (2026-08-10): an adversarially reviewed,
  time-limited diagnostic isolated the failure to Upstash coordination at
  `rate-limit.check`. A second non-mutating `PING` probe also failed, proving
  this is an unavailable Redis database/credential pair rather than Google
  Calendar or the Redis Lua command path. Google FreeBusy succeeds locally with
  the refreshed credentials. The temporary diagnostic was removed from the
  live site by publishing clean commit `75a36f2`; deploy
  `6a7a1a8a297927e66800c029` reached `ready`. Booking remains unavailable until
  Redis is replaced. Upstash reported all Redis regions operational with no
  2026-08-10 incident. Its free-tier documentation says inactive databases are
  archived after a minimum of 14 days; this database last passed a live check
  exactly 14 days earlier, so archival is the leading account-level
  explanation, not a global provider outage.
- Production recovery completed (2026-08-10): with owner approval, provisioned
  official 72-hour claimable Upstash database
  `4114d4bb-01f4-4512-bf42-67e2da268b06`. Its non-mutating `PING` and Lua
  `EVAL` checks both passed. Rotated the existing secret Netlify production
  variables `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, then
  published deploy `6a7a227d55da1ecf2326154b`, which reached `ready` at
  2026-08-10T19:12:37.729Z. The availability endpoint returned HTTP 200 with
  `ok: true` on `www.glamourstudio.mk`, the default Netlify domain, and the
  immutable deploy URL. The owner must claim the replacement database through
  the private capability link by 2026-08-13; no token or claim link is stored
  in the repository.
- Production canonical-domain verification (2026-08-10): the owner authorized
  changing Netlify's primary custom domain from `www.glamourstudio.mk` to
  `glamourstudio.mk`. Netlify now reports the apex as `custom_domain`,
  `url`, and `ssl_url`. The apex homepage, booking route, and sitemap return
  HTTP 200 directly with verified TLS; their `www` equivalents preserve the
  path and redirect once with HTTP 301 to the apex. Plain HTTP terminates at
  the HTTPS apex. Homepage and booking canonical/Open Graph URLs, the
  `BeautySalon` JSON-LD, robots sitemap directive/API exclusion, and the
  two-entry apex sitemap all align. Live apex availability remained HTTP 200
  with `ok: true`. The adversarial review found no actionable issue; restoring
  `www` as primary remains the traffic rollback, but would conflict with the
  deployed apex SEO signals if kept permanently.
- Launch-polish correction (2026-08-12): updated the owner-confirmed address
  from street number 11 to 6 in Macedonian/English contact copy, the Maps
  query, and `BeautySalon` JSON-LD. Narrow-screen makeup-stroke routing now
  keeps alternating service anchors in separate side-aware groups and eases
  through edge corridors; the desktop branch, GSAP/ScrollTrigger lifecycle,
  reduced-motion behavior, and reveal thresholds remain unchanged. Added the
  App Router `src/app/icon.svg` GS monogram using the existing warm palette.
  Focused ESLint and `git diff --check` passed in the delegated implementation;
  the final-source CI-mode `pnpm build` passed, including both media gates, and
  emitted `/icon.svg` as a static metadata route. Adversarial static review
  found no actionable issue. Conservative policy leaves phone-width stroke
  appearance and 16/32px favicon legibility for owner-rendered verification.
- Owner-rendered mobile correction (2026-08-12): reduced narrow-route lateral
  bias, kept every explicit side change as its own group, and added synthetic
  midpoint turn waypoints for sparse Makeup-to-Studio-to-Contact transitions.
  The waypoints shape only the spline; reveal thresholds still use the real
  measured text anchors. Custom scrollbar styling is now limited to
  hover-capable fine-pointer devices, so touch devices retain their native
  auto-hiding vertical page scrollbar without disabling document scrolling or
  Lenis. Focused ESLint, CSS parsing/static selector checks, `git diff --check`,
  both media checks, and the final-source CI-mode `pnpm build` passed. The
  dependency links disturbed by an interrupted sandboxed pnpm recreation were
  repaired with the cached lockfile before validation.
- Rendered mobile correction follow-up (2026-08-13): the owner reported that
  the first midpoint-only correction was not visibly different in `pnpm dev`.
  Inspection at an explicit 390x844 viewport confirmed the generated route
  still stayed near the center from Makeup through Studio and only drifted
  slightly right in Contact. Sparse opposite-side turns now use staged
  departure/approach/arrival waypoints; the Studio heading and paragraph share
  one stroke direction; and explicit outer-end Contact groups converge near the
  right corridor. The same running dev page was reloaded and visually checked
  across Services, Studio, the studio paragraph/media, and Contact: the route
  now makes broad continuous sweeps without the prior direct beeline or
  near-90-degree reversal. Focused ESLint, both media checks, `git diff --check`,
  and the final-source production build passed. Owner acceptance remains open.
- Hero readability tuning (2026-08-18): increased the existing warm hero veil
  from 52% to 72% opacity, preserving its 6px backdrop blur, foreground
  structure, and scroll-driven curtain behavior. File-scoped `git diff
  --check` passed. Conservative validation leaves rendered readability for
  owner verification.
- Keratin hydration naming correction (2026-08-22): renamed the confirmed
  service to “Keratin Treatment for hydration” / “Кератински третман за
  хидратација” across the homepage, localized booking display, canonical
  catalogue, and product specification. The stable service ID, price, duration,
  ordering, and booking behavior are unchanged. Catalogue and booking-flow
  tests passed; the static-contract suite passed 28 of 29 tests and retains one
  unrelated pre-existing SSR heading expectation failure. `git diff --check`
  passed.
