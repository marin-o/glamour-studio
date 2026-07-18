# Make the hero interior much more visible

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Make the blurred hero interior concept substantially more visible while keeping
the type-first foreground legible and provisional.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- The hero currently uses a 10px blur and a warm veil at 76% mobile / 64%
  desktop opacity.
- The user requested a much more visible interior image while retaining the
  full-background treatment and type-first content.

## Scope

- Reduce blur and veil opacity substantially in the hero background layer.
- Preserve title hierarchy, readable foreground text, placeholder label, stroke,
  reduced-motion, mobile, and contact behavior.

## Suggested files

- src/components/TypographySalonPage.jsx
- docs/agent-handoff.md
- docs/tasks/033-make-the-hero-interior-much-more-visible.md

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] The interior is substantially more visible than the previous 10px / 76-64%
      treatment.
- [ ] Hero title, copy, label, focus behavior, and type-first hierarchy remain
      readable and intact.
- [ ] Existing stroke, reduced-motion, mobile, and contact behavior is unchanged.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if visibility reduces readable contrast or makes the concept look like
  confirmed real-salon media.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined.

## Validation

- Select commands and owner/manual checks before implementation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-14T00:07:41.936Z
- Validation: Reduced hero blur from 10px to 6px and warm veil opacity from 76/64% to 66/52% so the interior concept is substantially more visible; pnpm lint, pnpm build, git diff --check, and Sitewright Doctor passed; browser validation remained off under conservative policy.

- Transition: start at 2026-07-14T00:06:49.616Z

- Completed: Increased hero image visibility again by reducing the background
  blur from 10px to 6px and the warm veil from 76/64% to 66/52% opacity
  across mobile/desktop. The type-first foreground, stroke anchor, and label
  remain unchanged.
- Validation: `pnpm lint` passed, `pnpm build` passed, `git diff --check`
  passed, and Sitewright Doctor returned `READY IMPLEMENTATION_READY`.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run because the repository's conservative validation
  policy forbids them without explicit owner approval.
- Follow-up: Confirm final contrast and visibility during the next
  owner-approved rendered review.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/components/TypographySalonPage.jsx` and this task note.
- Evidence: `.sitewright/evidence/033-make-the-hero-interior-much-more-visible-md.json`
