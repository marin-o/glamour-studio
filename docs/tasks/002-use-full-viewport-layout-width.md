# Use full viewport layout width

Status: DONE
Depends on: None
Owner: AI-assisted implementation

## Goal

Revise the existing salon page so the layout uses the full viewport width with
generous edge padding instead of sitting inside a narrow centered content rail.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- The first App Router page already exists in `src/app/`.
- User feedback: the page feels constrained to the middle third of the screen
  and should breathe across the viewport.

## Scope

- Remove the fixed page-width constraint from the main layout.
- Let hero, section headings, service cards, media placeholders, contact rows,
  and the bottom CTA use viewport width with responsive edge padding.
- Preserve mobile readability and avoid changing product facts or booking
  behavior.

## Suggested files

- src/app/globals.css
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Inspect the current page styling.
2. Replace the fixed content rail with full-viewport responsive layout rules.
3. Validate with conservative checks.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [x] The page no longer uses a fixed narrow centered content rail.
- [x] Core sections use the full viewport width with stable edge padding.
- [x] Product facts and booking behavior remain unchanged.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not add new content, booking features, localization, deployment, CMS,
  payments, accounts, or other unrelated systems.

## Risks and stop conditions

- Stop if required product details are missing and a reasonable provisional value would affect launch truth.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined for the slice.

## Validation

- Run `npm run build`.
- Run Sitewright Doctor.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.

## Completion notes

- Completed: Replaced the fixed `--content-width` rail with viewport-relative
  edge padding, widened hero and section compositions, expanded service/media
  grids, and let the bottom CTA span the page width.
- Validation: `npm run build` passed. Sitewright Doctor passed with
  IMPLEMENTATION_READY while this task was active.
- Deviations: No browser, screenshot, viewport, or visual automation was run
  because the repository validation policy is conservative.
- Follow-up: Create the next scoped task for any further visual tuning,
  confirmed salon content, real media, or contact/booking behavior.
