# Promote typography direction and preserve old homepage

Status: DONE
Depends on: 008-typography-led-salon-iteration
Owner: AI-assisted implementation

## Goal

Make the typography-led direction the main Glamour Studio homepage at `/`, keep
the previous image-led/non-typography version available as a backup at `/old`,
and leave the typography route available as a comparison alias unless it becomes
confusing later.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/agent-handoff.md
- docs/tasks/008-typography-led-salon-iteration.md
- src/app/page.jsx
- src/app/typography/page.jsx
- src/app/globals.css

## Current repo notes

- The owner prefers the typography-led direction from `/typography` and wants
  it merged onto the non-typography homepage.
- The current `/` route is the task 007 image-led/editorial direction.
- The current `/typography` route is the task 008 typography-led iteration.
- Confirmed salon name: Glamour Studio.
- Draft service categories: haircuts, hairstyling, and makeup.
- Address, hours, phone, prices, staff names, final Macedonian copy, real
  photos, and video remain pending.
- Booking is not live and must not imply real availability.

## Scope

- Promote the typography-led page to `/`.
- Preserve the previous image-led homepage at `/old`.
- Avoid duplicating large typography markup where a shared component is
  simpler and safer.
- Keep `/typography` working unless implementation shows a strong reason to
  remove it.
- Refresh `docs/agent-handoff.md` after implementation.
- Record completion notes and validation in this task.

## Suggested files

- src/app/page.jsx
- src/app/old/page.jsx
- src/app/typography/page.jsx
- src/components/TypographySalonPage.jsx
- src/app/globals.css
- docs/agent-handoff.md
- docs/tasks/009-promote-typography-direction-and-preserve-old-homepage.md

## Implementation steps

1. Inspect the current `/` and `/typography` route files.
2. Extract the typography route markup into a shared server component if useful.
3. Make `/` render the typography-led direction.
4. Add `/old` with the current image-led homepage content as a backup.
5. Keep `/typography` available as a typography alias or comparison route.
6. Preserve semantic structure, focus states, mobile behavior, reduced-motion
   behavior, and all pending business-fact boundaries.
7. Validate with build, Sitewright Doctor, and source scans.
8. Rewrite `docs/agent-handoff.md` as current state rather than appending
   history.

## Acceptance criteria

- [x] `/` renders the typography-led design direction.
- [x] `/old` renders the previous image-led/non-typography homepage backup.
- [x] `/typography` remains available or is deliberately redirected with a
      documented reason.
- [x] Missing media, contact details, prices, staff, address, hours, and booking
      remain clearly pending.
- [x] No fake availability, fake testimonials, fake awards, fake review counts,
      fake staff claims, fake service details, fake address, fake hours, or fake
      prices are introduced.
- [x] Accessibility basics are preserved: semantic regions, readable contrast,
      keyboard focus, usable contact path, and reduced-motion behavior.
- [x] `docs/agent-handoff.md` reflects the current state and next owner
      decision.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not implement the future `/lookbook` endpoint in this task.
- Do not choose final fonts yet.
- Do not complete final Macedonian copy or invent business details.
- Do not replace media with generic stock, AI-generated final salon imagery, or
  non-owner-approved photos.
- Do not implement live booking, real appointment scheduling, calendar
  availability, payments, accounts, CMS, analytics, cookies, localization
  toggles, deployment, or legal policy text.
- Do not add browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.

## Risks and stop conditions

- Stop if promoting the typography direction requires final brand typography,
  real salon facts, real salon media, or owner-approved Macedonian copy.
- Stop before adding any claim that would affect launch truth, local trust, or
  legal/privacy obligations.
- Stop before introducing a form that collects personal data unless the owner
  confirms submission destination, privacy/legal copy, and expected behavior.

## Validation

- Run `npm run build`.
- Run Sitewright Doctor.
- Run a source scan for removed skill references and fake-claim terms in
  changed app files.
- Manually inspect the changed source against this task's acceptance criteria.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.

## Completion notes

- Completed:
  - Added `src/components/TypographySalonPage.jsx` as the shared typography-led
    page component.
  - Replaced `src/app/page.jsx` so `/` now renders the typography-led direction.
  - Replaced `src/app/typography/page.jsx` with a thin alias wrapper around the
    same typography component.
  - Added `src/app/old/page.jsx` to preserve the previous image-led homepage as
    the `/old` backup route.
  - Created `docs/tasks/010-plan-lookbook-endpoint.md` as a planned taskfile
    for a future `/lookbook` endpoint; it is intentionally not implemented in
    this task.
  - Preserved all pending owner-fact boundaries for media, contact details,
    prices, staff, address, hours, final Macedonian copy, and booking.
- Validation:
  - `npm run build` passed with Next.js 16.2.10 and prerendered `/`, `/old`,
    and `/typography` as static routes.
  - Sitewright Doctor passed while task 009 was active and reported
    `IMPLEMENTATION_READY`.
  - After closing task 009, Sitewright Doctor reported `PLANNING_REQUIRED`
    because no executable task is active. Task 010 is intentionally `PLANNED`,
    not active implementation.
  - Source scan found no `design-taste-frontend`, `FontTester`, `FontLoader`,
    runtime font-lab, or disabled-form references in `src/app` or
    `src/components`.
  - Fake-claim scan found no testimonials, awards, review counts, live
    availability, confirmed appointments, real-time booking, address labels,
    hours labels, currency, or prices in `src/app` or `src/components`; matches
    were limited to explicit pending-language boundaries.
  - Small HTTP smoke checks against the local dev server returned `200` for
    `/`, `/old`, and `/typography`.
  - Manually inspected the changed source against this task's acceptance
    criteria, product spec, and design contract.
- Deviations:
  - Did not run browser, viewport, screenshot, Playwright, visual, animation,
    or interaction validation, per the conservative validation policy and task
    non-goals.
  - Did not choose final fonts; the promoted homepage still uses current system
    and Georgia fallbacks only.
- Follow-up:
  - The next planned task is `docs/tasks/010-plan-lookbook-endpoint.md` for a
    separate `/lookbook` endpoint.
