# Restore dark-band text after adaptive blend experiment

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Deliver restore dark-band text after adaptive blend experiment as one independently verifiable outcome for glamour-studio.

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

- Transition: complete at 2026-07-12T23:31:32.556Z
- Validation: Removed the failed difference blend and restored original dark-band text appearance; lint, build, and diff checks passed.
- Approved by: owner

- Transition: start at 2026-07-12T23:31:02.556Z

- Completed: Removed the adaptive difference blend from dark-band copy,
  restoring the original light text color and leaving the makeup stroke
  unchanged.
- Validation: `npm run lint`, `npm run build`, and `git diff --check` passed.
- Deviations: The contrast problem remains an open visual refinement; no new
  contrast treatment was added without a rendered visual check.
- Follow-up: Evaluate a localized glyph outline or stroke-routing adjustment
  during an owner-authorized visual pass.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/app/globals.css`, `DESIGN.md`, and this task file.
- Evidence: `.sitewright/evidence/<task-id>.json`
