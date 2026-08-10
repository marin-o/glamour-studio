# Agent Handoff

<!-- BEGIN:sitewright-handoff-state -->
<!-- sitewright:fingerprint=574455ecc0c77d62 -->
## Sitewright state

- Sitewright Doctor reports `IMPLEMENTATION_READY` using `nextjs-app-router` policy pack.
- The repository has structured intent, coherent planning, and an executable task.
- Active task: 058-implement-launch-ready-local-seo-for-glamourstudio-mk.md.
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
- Task 057 completed production booking migration to the owner-created Netlify site
  `fanciful-rolypoly-a33659.netlify.app`. Netlify Production has the Google,
  policy, HMAC, explicit platform, and owner-claimed replacement Upstash
  variables configured. Production booking is enabled; a live read-only
  availability request returned HTTP 200 through Netlify, Upstash, and Google
  Calendar. The reviewed runtime uses Netlify's server-derived Functions
  context IP and fails closed on missing or contradictory platform context.
  Homepage media now uses prebuilt static responsive WebPs instead of cold
  Netlify image transforms; deploy `6a66b5b8956465000851e342` from commit
  `982f278` passed live timing checks and owner review. The prior Vercel
  deployment was already deleted, so no rollback remains.
- `/lookbook` retains its noindex horizontal sequence, source tracing,
  meaningful bilingual alt text, quality-100 responsive images, route-local
  Lenis, and exact progress. Owner-directed customer copy removes visible
  development/disclosure wording without recording media permissions.
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
- All nine development lookbook JPEGs are only 640px wide; approved
  production-resolution originals remain required for true high-density
  crispness.
- Website reuse and recognizable-person permissions remain unapproved; keep the
  route noindex. The owner explicitly removed the visible development
  disclosure, which does not itself approve the media.
- The owner rejected managed booking services and approved the phased custom
  Next.js and Google Calendar direction in
  `docs/booking-google-calendar-implementation-plan.md`. The earlier Vercel
  implementation was accepted, that deployment was deleted, and the owner has
  now accepted the completed Netlify production migration in task 057.
- The owner confirmed replacement Upstash database
  `f2218049-c728-44af-97e3-6223a5811ed1` was claimed with the Glamour Studio
  account. The initial disposable database was removed from Netlify
  configuration after its token appeared in diagnostics and will expire unused.
- Task 056/057 code is pushed, the enabled Netlify deployment passed live
  availability and media timing checks, and the owner accepted the result on
  2026-07-27. Any further write/invitation smoke test remains owner-controlled.

## Durable gotchas

- Read `AGENTS.md`, `docs/agent-handoff.md`, `REPO_MAP.md`, and the active task before broad source exploration.
- Refresh this handoff whenever product, planning, policy, or active-task state changes.
- Keep history interception pre-hydration; reacting only after `usePathname`
  changes allows Next to visibly swap the route before the curtain.
- Same-page fragment history must bypass the route curtain because hash changes
  do not produce a new App Router pathname or reveal trigger.
- A root `beforeInteractive` history script must live inside the explicit
  `<head>`, never as a direct `<html>` child.
- When the planned dynamic Lookbook is defined, replace the fixed
  `lookbookMedia` sequence with a content model that preserves source tracing,
  per-item Macedonian/English alt text, permission state, intrinsic dimensions,
  crop intent, and the current noindex gate until reuse approvals are recorded.
