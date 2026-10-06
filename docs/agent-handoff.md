# Agent Handoff

<!-- BEGIN:sitewright-handoff-state -->
<!-- sitewright:fingerprint=41d86c0d1b8c417e -->
## Sitewright state

- Sitewright Doctor reports `IMPLEMENTATION_READY` using `nextjs-app-router` policy pack.
- The repository has structured intent, coherent planning, and an executable task.
- Active task: 061-replace-lookbook-development-images-with-approved-owner-images.md.
<!-- END:sitewright-handoff-state -->

## Current state

- Owner-directed Macedonian copy is now customer-facing: the homepage has a
  brand-led hero with a concise customer introduction, three broad service
  groups, a short salon introduction, and concise contact/metadata copy.
  `/typography` is removed. English remains a later editorial refinement while
  the visit-local `EN`/`MK` behavior remains.
- Cormorant Garamond 300–700 and Manrope 200–800 are loaded as the current
  variable-font review pair with Cyrillic Extended subsets. This is a visual
  review candidate, not final owner approval.
- Booking requires name, phone, and a syntactically valid email in both the
  client flow and public server contract. The catalogue keeps the confirmed
  IDs, prices, and durations, with Hairstyling third after both haircut
  options. Accepted bookings request a Google Calendar invitation; the public
  confirmation reports `requested` or the safe `unknown` fallback.
- Task 059 completed work-track-aware booking in source: makeup and hair may
  overlap because separate employees provide them, while same-track and unknown
  legacy/manual Calendar events remain blocking. New private bookings carry a
  verified work-track marker; public request and response schemas remain
  track-free. The focused post-review suite and production build pass. The
  change is not deployed and no live booking write was performed.
- Task 060's accountless customer booking management remains implemented and
  adversarially reviewed in source, with digest-backed links, Google Calendar
  authority, bilingual Resend mail, and a generic `.ics` attachment. It was
  superseded for the owner-prioritized Lookbook update; rendered owner
  acceptance, attachment-bearing live email verification, and deployment were
  not completed. Resume that outcome in a separate task when requested.
- Booking availability uses the owner-confirmed seasonal schedule in
  `Europe/Skopje`: 10:00–18:00 from September through March and 06:00–18:00
  from April through August. The August/September boundary is covered by the
  focused availability tests.
- Task 057 completed migration to the owner-created Netlify site
  `fanciful-rolypoly-a33659.netlify.app`. Production booking availability was
  restored on 2026-08-10 by replacing the unavailable Upstash database,
  rotating the two Netlify production Redis secrets, and publishing ready
  deploy `6a7a227d55da1ecf2326154b`. The replacement database
  `4114d4bb-01f4-4512-bf42-67e2da268b06` passed non-mutating `PING` and Lua
  `EVAL` checks; live availability returned HTTP 200 on
  `www.glamourstudio.mk`, the default Netlify domain, and the immutable deploy
  URL. No temporary diagnostic gate remains live. The replacement must be
  claimed in Upstash by 2026-08-13 to avoid expiry. The reviewed runtime still
  uses Netlify's server-derived Functions context IP and fails closed on missing
  or contradictory platform context. The prior Vercel deployment was deleted,
  so no rollback remains.
- The canonical production domain is now `https://glamourstudio.mk`. On
  2026-08-10 the owner authorized switching Netlify's primary custom domain
  from `www.glamourstudio.mk` to the apex. The apex serves directly over
  verified HTTPS; `www` preserves paths and redirects once with HTTP 301 to
  the apex. Homepage and booking canonicals/Open Graph URLs, robots, sitemap,
  structured data, and live booking availability were reverified after the
  switch. The adversarial infrastructure review found no actionable issue.
- `/lookbook` now uses the eight owner-supplied JPEGs in numeric order. The
  owner approved public website use and recognizable-person consent for this
  set. The route retains its noindex horizontal sequence, bilingual alt text,
  quality-100 responsive images, route-local Lenis, and exact progress. The
  production build and privacy/content review pass; rendered order and crops
  await owner review under the conservative validation policy.
- Homepage scroll position is held in visit-local transition memory and
  restored behind the closed curtain on arrow or browser-history returns.
- The browser-history transition bridge remains a `beforeInteractive` script
  inside the root layout's explicit `<head>`, with a 2.4s fail-open path.
## Open owner decisions

- Keep unresolved product, launch, content, and business-truth decisions explicit in product specs or active tasks.
- Approve or replace the Cormorant Garamond + Manrope review pair after rendered
  Macedonian and English review.
- The displayed phone number, street address, Maps destination, and Instagram
  profile are owner-confirmed. Current Macedonian copy, services, prices,
  durations, and mandatory booking email are owner-directed; English editorial
  copy and any additional messaging channels remain open.
- The eight approved Lookbook originals are 900-1200px wide. Keep the route
  noindex until the owner separately requests and reviews search indexing.
  Rendered crops and bilingual descriptions still need owner acceptance.
- The owner rejected managed booking services and approved the phased custom
  Next.js and Google Calendar direction in
  `docs/booking-google-calendar-implementation-plan.md`. The earlier Vercel
  implementation was accepted, that deployment was deleted, and the owner has
  now accepted the completed Netlify production migration in task 057.
- The owner approved provisioning Upstash's official free no-signup replacement
  database `4114d4bb-01f4-4512-bf42-67e2da268b06`. It is live in Netlify
  production but must be claimed through the private claim link by 2026-08-13
  to become permanent.
- Task 056/057 code is pushed and the owner accepted the migration on
  2026-07-27. Live read-only availability was reverified on 2026-08-10 after
  Redis replacement. A write/invitation smoke test remains owner-controlled.
- Review and approve task 060's rendered `/booking/manage` experience and the
  delivered bilingual customer email before task completion or deployment.

## Durable gotchas

- Read `AGENTS.md`, `docs/agent-handoff.md`, `REPO_MAP.md`, and the active task before broad source exploration.
- Refresh this handoff whenever product, planning, policy, or active-task state changes.
- Keep history interception pre-hydration; reacting only after `usePathname`
  changes allows Next to visibly swap the route before the curtain.
- Same-page fragment history must bypass the route curtain because hash changes
  do not produce a new App Router pathname or reveal trigger.
- A root `beforeInteractive` history script must live inside the explicit
  `<head>`, never as a direct `<html>` child.
- When a dynamic Lookbook is defined, replace the fixed `lookbookMedia` sequence
  with a content model that preserves provenance, per-item Macedonian/English
  alt text, permission state, intrinsic dimensions, crop intent, and the
  separately controlled noindex setting.
