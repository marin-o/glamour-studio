# Create separate lookbook endpoint

Status: DONE
Depends on: 009-promote-typography-direction-and-preserve-old-homepage
Owner: AI-assisted implementation

## Goal

Create a separate `/lookbook` endpoint for a future image/media-oriented
Glamour Studio direction without cluttering the typography-led homepage.

The endpoint should eventually become the place for real salon media,
production notes, and lookbook rhythm once owner-approved photos or video are
available. Until real media exists, it must stay honest about placeholders and
must not fake a finished portfolio.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/agent-handoff.md
- public/media/README.md
- src/app/page.jsx
- src/app/old/page.jsx
- src/app/globals.css

## Current repo notes

- After task 009, `/` should be the typography-led homepage.
- `/old` should preserve the previous image-led/non-typography homepage.
- Confirmed salon name: Glamour Studio.
- Draft service categories: haircuts, hairstyling, and makeup.
- Address, hours, phone, prices, staff names, final Macedonian copy, real
  photos, and video remain pending.
- Existing placeholder media files are temporary and documented in
  `public/media/README.md`.

## Scope

- Add a new App Router endpoint at `/lookbook`.
- Decide whether `/lookbook` should reuse parts of `/old` or introduce a
  cleaner media-specific composition.
- Keep the typography-led homepage focused on type and practical status.
- Keep `/old` as backup unless the owner later asks to remove it.
- Use only owner-approved or explicitly temporary placeholder media.
- Refresh `docs/agent-handoff.md` after implementation.

## Suggested files

- src/app/lookbook/page.jsx
- src/app/globals.css
- public/media/README.md, only if media slot definitions change
- docs/agent-handoff.md
- docs/tasks/010-plan-lookbook-endpoint.md

## Implementation steps

1. Re-read this task, `DESIGN.md`, `docs/product-spec.md`,
   `public/media/README.md`, and current route files.
2. Define the `/lookbook` purpose as a media-focused comparison route, not the
   primary homepage.
3. Compose a semantic page with:
   - a restrained lookbook intro;
   - explicit media slots for hero/video, hair texture, studio interior,
     service process, and wide studio moment;
   - clear pending labels for any temporary media;
   - a route back to the typography-led homepage;
   - a practical contact/status note that does not imply live booking.
4. Style the route with the existing warm visual system and avoid generic stock
   luxury tropes.
5. Preserve accessibility, mobile-first behavior, focus states, reduced-motion
   behavior, and pending business-fact boundaries.
6. Validate with build, Sitewright Doctor, source scans, and manual source
   inspection. Do not run visual/browser validation unless the owner requests
   it.
7. Record completion notes and rewrite the handoff as current state.

## Acceptance criteria

- [x] `/lookbook` exists and renders independently from `/` and `/old`.
- [x] The endpoint is clearly media/lookbook-oriented while remaining honest
      about temporary or missing real media.
- [x] `/` remains the typography-led homepage.
- [x] `/old` remains available as the previous image-led homepage backup.
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

- Do not replace the typography-led homepage.
- Do not remove `/old`.
- Do not complete final Macedonian copy or invent business details.
- Do not replace media with generic stock, AI-generated final salon imagery, or
  non-owner-approved photos.
- Do not implement live booking, real appointment scheduling, calendar
  availability, payments, accounts, CMS, analytics, cookies, localization
  toggles, deployment, or legal policy text.
- Do not add browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.

## Risks and stop conditions

- Stop if a lookbook choice requires final salon photos, video, staff approval,
  real business facts, or owner-approved Macedonian copy.
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
  - Added `src/app/lookbook/page.jsx` as a separate `/lookbook` route for a
    media-focused Glamour Studio lookbook plan.
  - Used existing temporary media only for slots that already have documented
    placeholders: hero/video poster, hair texture, and studio interior.
  - Added explicit text-only pending slots for service process and wide studio
    moment, matching `public/media/README.md` target slots without inventing
    final media.
  - Added a route back to the typography-led homepage and a route to `/old` for
    comparison with the previous image-led backup.
  - Added scoped `.lookbook-*` styles in `src/app/globals.css` using the warm
    visual system, semantic sections, stable media areas, visible focus states,
    and mobile-first responsive behavior.
  - Preserved all pending owner-fact boundaries for media, contact details,
    prices, staff, address, hours, final Macedonian copy, and booking.
- Validation:
  - `npm run build` passed with Next.js 16.2.10 and prerendered `/lookbook` as
    a static route alongside `/`, `/old`, and `/typography`.
  - Sitewright Doctor passed while task 010 was active with `Status: TODO` and
    reported `IMPLEMENTATION_READY`.
  - Source scan found no `design-taste-frontend`, `FontTester`, `FontLoader`,
    runtime font-lab, or disabled-form references in `src/app` or
    `src/components`.
  - Fake-claim scan found matches only in explicit pending or not-live language
    for booking, contact, address, hours, prices, staff, and appointments.
  - Contact/form scan found only the explicit statement that `/lookbook` does
    not collect visitor details or confirm appointments.
  - Manually inspected the changed source against this task's acceptance
    criteria, product spec, media plan, and design contract.
- Deviations:
  - Did not run browser, viewport, screenshot, Playwright, visual, animation,
    or interaction validation, per the conservative validation policy and task
    non-goals.
  - The first Doctor run reported `PLANNING_REQUIRED` while task 010 was still
    `PLANNED`; this Sitewright CLI recognizes `TODO` as the active executable
    task status.
- Follow-up:
  - Owner can compare `/`, `/typography`, `/old`, and `/lookbook`, then decide
    whether the next task should refine lookbook rhythm, collect real salon
    media, or continue typography/homepage polish.
