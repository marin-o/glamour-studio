# Align lookbook progress with the centered first image

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner request in current Codex task

## Goal

Make zero horizontal scroll map exactly to the first progress pip, with no
visual head start toward image two.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Remove the artificial initial percentage from both the brush fill and moving
  tip.
- Preserve the full zero-to-one mapping for the remaining images.

## Suggested files

- src/components/lookbook/HorizontalLookbook.jsx
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] Image one places the moving tip exactly on pip one and draws no progress
      toward pip two.
- [ ] The final image still maps exactly to the final pip.
- [ ] Intermediate progress remains continuous with Lenis scroll.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if required product details are missing and a reasonable provisional value would affect launch truth.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined for the slice.

## Validation

- Run `pnpm lint`, `pnpm build`, `git diff --check`, and Sitewright Doctor.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-18T10:34:04.312Z
- Validation: pnpm lint passed; pnpm build passed; git diff --check passed; Sitewright Doctor IMPLEMENTATION_READY with only the expected pre-refresh handoff warning; browser and visual QA not run under conservative policy.
- Approved by: Owner request in current Codex task

- Transition: start at 2026-07-18T10:33:30.281Z

- Completed: Removed the 2.5% artificial head start from the brush fill and tip
  position, restoring an exact zero-to-one mapping across all image pips.
- Validation: `pnpm lint`, `pnpm build`, and `git diff --check` passed.
  Sitewright Doctor reported `IMPLEMENTATION_READY` with only the expected
  pre-handoff stale-memory warning.
- Deviations: Browser and visual validation were not run under the repository's
  conservative validation policy.
- Follow-up: None.

## Traceability

- Product outcome: Keep the progress indicator spatially honest to the centered
  image sequence.
- Implementation phase: Phase 2 corrective interaction refinement.
- Changed files: `src/components/lookbook/HorizontalLookbook.jsx`, `docs/tasks/040-align-lookbook-progress-with-the-centered-first-image.md`, `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/040-align-lookbook-progress-with-the-centered-first-image.json`
