# Relax lookbook auto-settle timing

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner request in current Codex task

## Goal

Make nearest-image settling wait longer after input and move with a gentler,
slower acceleration curve in either direction.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Increase the Lenis snap debounce so momentum can visibly finish before
  centering begins.
- Replace the fast quartic ease-out with a slower ease-in/out settle.
- Preserve continuous scrolling, nearest-image selection, and exact progress.

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

- [ ] Auto-settle waits noticeably longer after the last wheel/trackpad input.
- [ ] Backward and forward settling start gently and take longer to center.
- [ ] Continuous Lenis input remains unchanged.
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

- Transition: complete at 2026-07-18T10:38:02.579Z
- Validation: pnpm lint passed; pnpm build passed; git diff --check passed; Sitewright Doctor IMPLEMENTATION_READY with only the expected pre-refresh handoff warning; browser and visual QA not run under conservative policy.
- Approved by: Owner request in current Codex task

- Transition: start at 2026-07-18T10:37:21.069Z

- Completed: Increased input-end debounce from 220ms to 420ms, lengthened the
  settle from 0.7s to 0.9s, and replaced the fast quartic ease-out with a
  symmetric smoothstep curve.
- Validation: `pnpm lint`, `pnpm build`, and `git diff --check` passed.
  Sitewright Doctor reported `IMPLEMENTATION_READY` with only the expected
  pre-handoff stale-memory warning.
- Deviations: Browser and visual validation were not run under the repository's
  conservative validation policy.
- Follow-up: Tune these three values only from further owner-observed feel.

## Traceability

- Product outcome: Keep centered settling helpful without making the gallery
  feel impatient or self-propelled.
- Implementation phase: Phase 2 corrective interaction refinement.
- Changed files: `src/components/lookbook/HorizontalLookbook.jsx`, `docs/tasks/041-relax-lookbook-auto-settle-timing.md`, `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/041-relax-lookbook-auto-settle-timing.json`
