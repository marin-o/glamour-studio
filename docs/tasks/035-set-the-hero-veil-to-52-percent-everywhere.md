# Set the hero veil to 52 percent everywhere

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Set the hero background veil to exactly 52% at every breakpoint, as explicitly
requested by the owner.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- The hero currently uses one shared `60%` veil and a 6px blur.
- The owner explicitly requested `52%` on both mobile and desktop.

## Scope

- Change only the hero veil from 60% to 52%.
- Preserve the 6px blur and all foreground/stroke/contact behavior.

## Suggested files

- src/components/TypographySalonPage.jsx
- docs/agent-handoff.md
- docs/tasks/035-set-the-hero-veil-to-52-percent-everywhere.md

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] The hero veil is exactly `bg-surface/52` with no breakpoint override.
- [ ] The blur, type-first content, stroke anchor, and contact behavior are
      unchanged.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if the exact value is not applied consistently across breakpoints.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined.

## Validation

- Select commands and owner/manual checks before implementation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-14T00:17:05.778Z
- Validation: Set the hero veil to exactly bg-surface/52 with no breakpoint override; pnpm lint, pnpm build, git diff --check, and Sitewright Doctor passed; browser validation remained off under conservative policy.

- Transition: start at 2026-07-14T00:16:09.947Z

- Completed: Set the hero veil to exactly `bg-surface/52` with no breakpoint
  override. The 6px blur and all foreground/stroke/contact behavior remain
  unchanged.
- Validation: `pnpm lint` passed, `pnpm build` passed, `git diff --check`
  passed, and Sitewright Doctor returned `READY IMPLEMENTATION_READY`.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run because the repository's conservative validation
  policy forbids them without explicit owner approval.
- Follow-up: None; the requested value is now applied consistently.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/components/TypographySalonPage.jsx` and this task note.
- Evidence: `.sitewright/evidence/035-set-the-hero-veil-to-52-percent-everywhere-md.json`
