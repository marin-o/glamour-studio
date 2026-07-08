# Prepare owner content and media intake

Status: DONE
Depends on: 011-mobile-first-responsive-site-refinement
Owner: AI-assisted implementation

## Goal

Prepare an owner-facing content and media intake artifact that makes the
remaining launch blockers concrete without inventing salon facts.

The independently observable outcome is a concise checklist that maps every
missing owner decision, business fact, contact channel, service detail, and
media asset to the current Glamour Studio site surfaces so a later replacement
task can use approved truth instead of placeholders.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/agent-handoff.md
- public/media/README.md
- docs/tasks/005-replace-placeholders-with-owner-content-and-media-plan.md
- docs/tasks/010-plan-lookbook-endpoint.md
- docs/tasks/011-mobile-first-responsive-site-refinement.md

## Current repo notes

- The current public routes are visually polished drafts, but address, hours,
  phone, prices, final Macedonian copy, staff details, real photos, and video
  remain owner decisions.
- `public/media/README.md` already defines target media slots; this task should
  turn that into a fuller owner-ready intake checklist instead of changing
  runtime media.
- `/lookbook` is a planning route for future real salon media, not a finished
  portfolio.
- Booking is intentionally not live and must not imply real availability.
- Validation policy is `conservative`; do not run browser, viewport,
  screenshot, Playwright, visual, animation, or interaction validation unless
  the owner explicitly asks.

## Scope

- Add or update a durable docs artifact for owner content and media intake.
- Include required launch facts: salon name confirmation, address, map/location
  wording, hours, phone or Viber, Instagram, service categories, service
  descriptions, prices if desired, staff/owner names if desired, and preferred
  contact/booking CTA.
- Include Macedonian-first copy needs and mark English/localization as later
  unless the owner provides approved text.
- Include media needs aligned to `public/media/README.md`: hero video, poster,
  hair texture, interior detail, service moment, wide lookbook image, and
  optional staff/owner image.
- Include permission and privacy prompts for photos with people, contact forms,
  analytics, cookies, and booking request data.
- Map each intake item to affected current site surfaces such as `/`,
  `/typography`, `/old`, `/lookbook`, metadata, persistent CTA, and media slots.
- Refresh `docs/agent-handoff.md` after implementation.
- Record completion notes and validation in this task.

## Suggested files

- docs/owner-content-media-intake.md
- public/media/README.md, only if media slot naming or owner instructions need
  clarification
- docs/agent-handoff.md
- docs/tasks/012-prepare-owner-content-and-media-intake.md

## Implementation steps

1. Re-read this task, `docs/product-spec.md`, `DESIGN.md`,
   `docs/agent-handoff.md`, `public/media/README.md`, and the current route
   metadata/copy surfaces only as needed.
2. Create a concise owner-facing intake checklist with grouped sections for
   business facts, services/pricing, Macedonian copy, contact/booking path,
   media assets, permissions/privacy, and launch-readiness decisions.
3. For each item, identify whether it is required for launch, optional, or a
   later enhancement, and note where it appears in the current site.
4. Keep every unknown value blank or explicitly pending; do not fill in missing
   address, hours, prices, staff, phone, testimonials, reviews, or availability.
5. Update `public/media/README.md` only if the existing media slot guidance is
   inconsistent with the new intake artifact.
6. Rewrite `docs/agent-handoff.md` as current state with task 012 active or
   complete, depending on implementation progress.
7. Record validation results and any deviations in this task.

## Acceptance criteria

- [x] A durable owner content/media intake artifact exists in `docs/`.
- [x] The intake artifact covers business facts, contact channels, services,
      pricing, Macedonian copy, media assets, permissions/privacy, and
      launch-readiness decisions.
- [x] Each intake item is mapped to current site surfaces or marked as a later
      enhancement.
- [x] Required versus optional/later items are distinguishable.
- [x] Missing facts remain blank, pending, or framed as owner questions rather
      than filled with invented values.
- [x] No fake availability, fake prices, fake address, fake testimonials, fake
      staff claims, fake review counts, fake awards, or fake media claims are
      introduced.
- [x] `docs/agent-handoff.md` reflects the new current state.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not replace runtime page copy with final-looking content.
- Do not add real or stock media.
- Do not implement live booking, scheduling, payments, accounts, CMS,
  analytics, cookies, localization toggles, deployment, or legal policy text.
- Do not create multiple backlog tasks.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly changes the validation
  direction.

## Risks and stop conditions

- Stop if the intake format requires owner-specific answers that are not
  available; leave them as questions instead.
- Stop before changing public-facing claims or metadata to imply confirmed
  facts.
- Stop before adding any data-collection flow without confirmed privacy/legal
  requirements.
- Stop before making `/lookbook` feel like a finished portfolio.

## Validation

- Run Sitewright Doctor after the task is complete.
- Manually inspect the intake artifact against `docs/product-spec.md`,
  `DESIGN.md`, `public/media/README.md`, and the current route metadata/copy
  surfaces.
- Run a source scan of changed docs for invented-looking claims such as fake
  prices, hours, address, testimonials, awards, review counts, live booking, or
  availability.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction checks unless the owner explicitly requests them.

## Completion notes

- Completed:
  - Added `docs/owner-content-media-intake.md` as the durable owner-facing
    checklist for launch facts, services/pricing, Macedonian copy,
    contact/booking choices, media assets, permissions/privacy, and replacement
    surfaces.
  - Mapped intake items to current runtime surfaces including root metadata,
    the typography-led homepage component, `/typography`, `/old`, `/lookbook`,
    the persistent CTA, and media slots.
  - Kept all unconfirmed values blank or explicitly pending; no address, hours,
    phone, prices, staff, testimonials, awards, review counts, media, or live
    availability were invented.
  - Updated `REPO_MAP.md` and `docs/agent-handoff.md` for the new current
    state.
- Validation:
  - Sitewright Doctor passed core checks and reported `PLANNING_REQUIRED`
    because task 012 is now closed and no new executable task is active.
  - Manually inspected the intake artifact against `docs/product-spec.md`,
    `DESIGN.md`, `public/media/README.md`, and current route metadata/copy
    surfaces.
  - Source scan of changed docs for prices, hours, address, testimonials,
    awards, review counts, live booking, availability, contact channels, and
    staff terms found only intake questions, surface mappings, and explicit
    no-invention boundaries.
- Deviations:
  - No browser, viewport, screenshot, Playwright, visual, animation, or
    interaction validation was run, per the conservative validation policy.
- Follow-up:
  - Use `docs/owner-content-media-intake.md` with the owner to gather approved
    facts and media before creating the next replacement task.
