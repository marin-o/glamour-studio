# Use one hero background veil across breakpoints

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Use one shared hero background veil value on mobile and desktop so image
visibility is consistent across breakpoints.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- The hero background currently uses different veil opacity values at mobile and
  desktop breakpoints.
- The user explicitly requested the veil treatment be the same everywhere.

## Scope

- Replace the breakpoint-specific veil classes with one shared `60%` surface
  veil while preserving the existing 6px blur and all foreground content.
- Keep type contrast, stroke, reduced-motion, mobile, and contact behavior
  intact.

## Suggested files

- src/components/TypographySalonPage.jsx
- docs/agent-handoff.md
- docs/tasks/034-use-one-hero-background-veil-across-breakpoints.md

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] The hero uses one identical veil opacity at all viewport widths.
- [ ] The 6px blur, type-first foreground, label, stroke, and contact path remain
      intact.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if the shared veil makes foreground text unreadable at either breakpoint.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined.

## Validation

- Select commands and owner/manual checks before implementation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-14T00:14:24.272Z
- Validation: Applied one shared 60% hero background veil across mobile and desktop; pnpm lint, pnpm build, git diff --check, and Sitewright Doctor passed; browser validation remained off under conservative policy.

- Transition: start at 2026-07-14T00:13:27.162Z

- Completed: Replaced the breakpoint-specific `66%` mobile / `52%` desktop
  veil with one shared `60%` surface veil. The 6px blur and all foreground
  content remain unchanged.
- Validation: `pnpm lint` passed, `pnpm build` passed, `git diff --check`
  passed, and Sitewright Doctor returned `READY IMPLEMENTATION_READY`.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run because the repository's conservative validation
  policy forbids them without explicit owner approval.
- Follow-up: Confirm the shared veil's final contrast and image visibility
  during the next owner-approved rendered review.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/components/TypographySalonPage.jsx` and this task note.
- Evidence: `.sitewright/evidence/034-use-one-hero-background-veil-across-breakpoints-md.json`
