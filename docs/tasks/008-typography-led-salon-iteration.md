# Typography-led salon iteration

Status: DONE
Depends on: None
Owner: AI-assisted implementation

## Goal

Create a separate `/typography` endpoint that explores a much more
typography-heavy Glamour Studio direction, using type, spacing, rules, and
plain surfaces as the primary design materials instead of imagery, repeated
cards, or gradient-heavy composition.

The outcome should be independently viewable without replacing the current
homepage, so the owner can compare this direction against the task 007
image-led redesign.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/agent-handoff.md
- src/app/layout.jsx
- src/app/page.jsx
- src/app/globals.css

## Current repo notes

- The site is a Macedonian-first, single-page salon draft for Radovish.
- Confirmed salon name: Glamour Studio.
- Draft service categories: haircuts, hairstyling, and makeup.
- Address, hours, phone, prices, staff names, final Macedonian copy, real
  photos, and video remain pending.
- Booking is not live and must not imply real availability.
- Task 007 created the current image-led/editorial homepage direction.
- This task should not replace task 007. It should add a parallel route for
  design comparison.
- The previous `design-taste-frontend` skill has been removed and must not be
  used.

## Design direction

- Make typography carry the atmosphere: oversized wordmark, editorial pacing,
  restrained serif display, readable sans body, plain labels, and confident
  rule lines.
- Avoid relying on images, card grids, decorative gradients, or placeholder
  media as the main visual language.
- Keep the palette aligned to `DESIGN.md`: warm cream, peach-beige, muted pink,
  and warm brown.
- Keep exact font selection deferred. Use current system/Georgia fallback only.
- Preserve honest placeholder states for every unconfirmed business fact.

## Scope

- Add a new App Router endpoint at `/typography`.
- Add route-scoped typography-led styles in `src/app/globals.css`.
- Keep the existing homepage route unchanged except for shared CSS safety if
  needed.
- Refresh `docs/agent-handoff.md` after implementation.
- Record completion notes and validation in this task.

## Suggested files

- src/app/typography/page.jsx
- src/app/globals.css
- docs/agent-handoff.md
- docs/tasks/008-typography-led-salon-iteration.md

## Implementation steps

1. Inspect the smallest relevant file set listed above.
2. Add a server component route at `src/app/typography/page.jsx`.
3. Compose the page as a typography-first single-page salon draft:
   - wordmark-heavy hero;
   - service categories as an editorial index;
   - media needs as a text-led production brief;
   - about/trust and contact/status sections with practical pending states;
   - persistent status CTA that does not imply live booking.
4. Style the route with scoped classes, using type scale, columns, line rules,
   whitespace, and restrained color rather than image/card/gradient emphasis.
5. Preserve accessibility, semantic sections, focus states, mobile behavior, and
   reduced-motion behavior.
6. Validate with build, Sitewright Doctor, and source scans.
7. Rewrite `docs/agent-handoff.md` as current state rather than appending
   history.

## Acceptance criteria

- [x] `/typography` exists and renders independently from the homepage.
- [x] The iteration is visibly typography-led and deemphasizes images, cards,
      and gradients.
- [x] The current homepage remains available for comparison.
- [x] The page remains aligned with `docs/product-spec.md` and `DESIGN.md`.
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

- Do not replace the task 007 homepage direction.
- Do not copy a reference site.
- Do not use the removed `design-taste-frontend` skill.
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

- Stop if the typography direction requires final brand typography, real salon
  facts, real salon media, or owner-approved Macedonian copy.
- Stop before adding any claim that would affect launch truth, local trust, or
  legal/privacy obligations.
- Stop before introducing a form that collects personal data unless the owner
  confirms submission destination, privacy/legal copy, and expected behavior.
- Stop if the typography-heavy direction would conflict with accessibility,
  mobile usability, or the established visual-system contract.

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
  - Added `src/app/typography/page.jsx` as a separate `/typography` endpoint
    for comparing a typography-led design direction against the current
    homepage.
  - Composed the route without images, media placeholders, or card grids. The
    page uses a large wordmark hero, editorial service rows, a text-led media
    production brief, a concise tone section, and an honest contact/status
    section.
  - Added route-scoped CSS in `src/app/globals.css` using type scale,
    whitespace, column rhythm, warm plain surfaces, and rule lines as the main
    visual materials.
  - Used `next/link` for the internal route back to the current draft.
  - Preserved all pending owner-fact boundaries for media, contact details,
    prices, staff, address, hours, final Macedonian copy, and booking.
- Validation:
  - `npm run build` passed with Next.js 16.2.10 and prerendered `/typography`
    as a static route.
  - Sitewright Doctor passed while task 008 was active and reported
    `IMPLEMENTATION_READY`.
  - After closing task 008, Sitewright Doctor reported `PLANNING_REQUIRED`
    because no executable task is active. This is the expected next-state
    warning after completing the task.
  - Source scan found no `design-taste-frontend`, `FontTester`, `FontLoader`,
    runtime font-lab, or disabled-form references in the changed app files.
  - Fake-claim scan found no testimonials, awards, review counts, live
    availability, confirmed appointments, real-time booking, address labels,
    hours labels, currency, or prices in the changed app files; matches were
    limited to explicit pending-language boundaries in `/typography` copy.
  - Manually inspected the changed source against this task's acceptance
    criteria, product spec, and design contract.
- Deviations:
  - Did not run browser, viewport, screenshot, Playwright, visual, animation,
    or interaction validation, per the conservative validation policy and task
    non-goals.
  - Did not choose final fonts; the route uses current system and Georgia
    fallbacks only.
- Follow-up:
  - Next owner decision is to compare `/` and `/typography`, then choose
    whether the typography-led direction should influence the main page or
    remain only an experiment.
