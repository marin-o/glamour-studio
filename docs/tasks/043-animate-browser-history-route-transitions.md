# Animate browser history route transitions

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner request in current Codex task

## Goal

Apply the same bidirectional blush curtain to browser Back and Forward while
preventing the destination route from appearing before the curtain covers it.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Keep rendering the departing route when App Router history changes.
- Slide the curtain in, swap the held route only while fully covered, then
  reveal the history destination.
- Infer the established forward direction for `/lookbook` and reverse direction
  for the homepage; preserve immediate reduced-motion traversal.

## Suggested files

- src/components/motion/PageTransition.jsx
- DESIGN.md
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] Browser Back from `/lookbook` retains the lookbook until the reverse
      curtain covers it, then reveals the homepage.
- [ ] Browser Forward to `/lookbook` retains the homepage until the forward
      curtain covers it, then reveals the lookbook.
- [ ] Existing transition-aware links behave unchanged.
- [ ] Reduced-motion history traversal swaps immediately without animation.
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

- Transition: complete at 2026-07-18T10:54:01.041Z
- Validation: pnpm lint passed; pnpm build passed; git diff --check passed; Sitewright Doctor IMPLEMENTATION_READY with only the expected pre-refresh handoff warning; browser and interaction QA not run under conservative policy.
- Approved by: Owner request in current Codex task

- Transition: start at 2026-07-18T10:51:18.042Z

- Completed: Added a held-route buffer to the root transition provider.
  Browser history changes now keep rendering the departing route while the
  curtain enters, swap to the new App Router child tree only at full coverage,
  and reveal with the established forward/reverse direction.
- Validation: `pnpm lint`, `pnpm build`, and `git diff --check` passed.
  Sitewright Doctor reported `IMPLEMENTATION_READY` with only the expected
  pre-handoff stale-memory warning.
- Deviations: Browser and interaction validation were not run under the
  repository's conservative validation policy.
- Follow-up: Owner should verify Back and Forward between `/` and `/lookbook`
  in the current browser session, including repeated traversal and reduced
  motion if used.

## Traceability

- Product outcome: Make link and browser-history navigation feel like one
  coherent transition system.
- Implementation phase: Phase 2 corrective interaction refinement.
- Changed files: `src/components/motion/PageTransition.jsx`, `DESIGN.md`, `REPO_MAP.md`, `docs/tasks/043-animate-browser-history-route-transitions.md`, `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/043-animate-browser-history-route-transitions.json`
