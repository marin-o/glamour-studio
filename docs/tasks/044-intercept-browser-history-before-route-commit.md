# Intercept browser history before route commit

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner correction in current Codex task

## Goal

Intercept Back and Forward before Next receives `popstate`, cover the current
page, then release the original history state to the router under the curtain.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Install a pre-hydration history bridge before Next's router listener.
- Pause the original `popstate`, dispatch a transition request, and replay the
  same history state only after full curtain coverage.
- Preserve link transitions, direction, reduced motion, and fail-open behavior.

## Suggested files

- src/app/layout.jsx
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

- [ ] Back/Forward cannot commit the destination route before curtain coverage.
- [ ] The intercepted state is replayed exactly once to Next under the curtain.
- [ ] Forward and reverse directions remain consistent.
- [ ] Missing/unmounted transition listeners fail open instead of trapping
      browser navigation.
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

- Transition: complete at 2026-07-18T10:59:31.905Z
- Validation: pnpm lint passed; pnpm build passed; git diff --check passed; Sitewright Doctor IMPLEMENTATION_READY with only the expected pre-refresh handoff warning; browser and interaction QA not run under conservative policy.
- Approved by: Owner correction in current Codex task

- Transition: start at 2026-07-18T10:57:44.231Z

- Completed: Added a `beforeInteractive` history bridge that registers before
  Next, stops the original `popstate`, requests curtain coverage, and replays
  the same state once fully covered. Added a 2.4s fail-open release and wired
  the provider to the bridge without changing normal link transitions.
- Validation: `pnpm lint`, `pnpm build`, and `git diff --check` passed.
  Sitewright Doctor reported `IMPLEMENTATION_READY` with only the expected
  pre-handoff stale-memory warning.
- Deviations: Browser and interaction validation were not run under the
  repository's conservative validation policy.
- Follow-up: Owner should verify browser Back and Forward in a freshly loaded
  session so the pre-hydration bridge is present from document startup.

## Traceability

- Product outcome: Ensure history traversal and visible links share the same
  pre-commit transition ordering.
- Implementation phase: Phase 2 corrective interaction refinement.
- Changed files: `src/app/layout.jsx`, `src/components/motion/PageTransition.jsx`, `DESIGN.md`, `REPO_MAP.md`, `docs/tasks/044-intercept-browser-history-before-route-commit.md`, `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/044-intercept-browser-history-before-route-commit.json`
