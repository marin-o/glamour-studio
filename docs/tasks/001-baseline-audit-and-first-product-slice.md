# Baseline audit and first product slice

Status: DONE
Depends on: None
Owner: AI-assisted implementation

## Goal

Deliver the first independently verifiable product slice for glamour-studio:
a mobile-first single-page salon shell with honest placeholders, the approved
visual direction, and no fake booking availability.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- Sitewright readiness is IMPLEMENTATION_READY.
- No application code exists yet; this task creates the initial App Router
  surface.
- Product thesis and visual rules are recorded in docs/product-spec.md and
  DESIGN.md.

## Scope

- Create the first Next.js App Router page shell.
- Include the required one-page sections: hero, services placeholders,
  gallery/vibe, about/trust, contact/location, and persistent bottom CTA.
- Use explicit pending labels for missing salon facts.
- Add a temporary project-local hero poster asset and label it as placeholder
  media.
- Preserve the approved product intent and current planning constraints.

## Suggested files

- src/app/layout.jsx
- src/app/page.jsx
- src/app/globals.css
- public/media/salon-hero-placeholder.png
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement the static one-page shell with placeholder content.
3. Validate with conservative checks only.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [x] The product slice is visible or otherwise independently verifiable.
- [x] The implementation follows the product spec and planning docs.
- [x] Any owner-only decisions remain explicit rather than invented.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, live booking, localization
  toggles, analytics, cookies, or other unapproved systems.

## Risks and stop conditions

- Stop if required product details are missing and a reasonable provisional value would affect launch truth.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined for the slice.

## Validation

- Run Sitewright Doctor.
- Run package validation if dependencies are available locally.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.

## Completion notes

- Completed: Created the initial App Router one-page salon shell with hero,
  services placeholders, gallery/vibe placeholders, about/trust, contact/location
  placeholders, persistent bottom CTA, metadata, global styles, and a project-local
  temporary hero poster asset.
- Validation: `npm run build` passed. Sitewright Doctor passed with
  IMPLEMENTATION_READY before closing this task.
- Deviations: Installed npm dependencies to validate the build; npm reported two
  moderate audit findings in the resolved dependency tree, not addressed in this
  task.
- Follow-up: Create the next scoped task after the owner chooses whether to
  prioritize confirmed content/media collection, contact/booking behavior, or
  visual refinement.
