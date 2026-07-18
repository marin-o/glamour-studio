# Improve dark-band text contrast over the light makeup stroke

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Deliver improve dark-band text contrast over the light makeup stroke as one independently verifiable outcome for glamour-studio.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Implement only the outcome named by this task.
- Preserve the approved product intent and current planning constraints.
- Keep the repository usable after the task.

## Suggested files

- src/app/
- src/components/
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] The product slice is visible or otherwise independently verifiable.
- [ ] The implementation follows the product spec and planning docs.
- [ ] Any owner-only decisions remain explicit rather than invented.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if required product details are missing and a reasonable provisional value would affect launch truth.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined for the slice.

## Validation

- Select commands and owner/manual checks before implementation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-12T23:26:57.942Z
- Validation: Localized dark-band text halo preserves contrast over the light stroke; lint, build, and diff checks passed.
- Approved by: owner

- Transition: start at 2026-07-12T23:25:47.084Z

- Completed: Added a localized `dark-band-readable` text halo to the dark
  contact band. The existing z-index already places copy above the stroke;
  the inherited accent-deep shadow clears the light stroke around glyphs while
  keeping the brush route and chunking unchanged.
- Validation: `npm run lint`, `npm run build`, and `git diff --check` passed.
- Deviations: No browser or rendered contrast pass was run under the
  conservative validation policy.
- Follow-up: Owner may authorize a visual pass if the halo needs tuning after
  reviewing the contact band at phone and desktop widths.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/app/globals.css`,
  `src/components/TypographySalonPage.jsx`, and this task file.
- Evidence: `.sitewright/evidence/<task-id>.json`
