# Increase visibility of the blurred hero image

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Make the blurred hero interior concept more visible while preserving the
type-first hierarchy and readable foreground content.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- The hero uses the interior concept as a blurred full-section background with
  a warm surface veil.
- The current veil is intentionally strong for text contrast, but the image
  should still register as a clear studio atmosphere.

## Scope

- Reduce the hero background veil and/or blur modestly so the interior reads
  more clearly.
- Preserve the title hierarchy, readable contrast, placeholder label, and all
  existing stroke/contact/reduced-motion behavior.

## Suggested files

- src/components/TypographySalonPage.jsx
- docs/agent-handoff.md
- docs/tasks/032-increase-visibility-of-the-blurred-hero-image.md

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] The blurred interior is visibly clearer than the previous veil treatment.
- [ ] Hero title, copy, label, focus behavior, and type-first hierarchy remain
      readable and intact.
- [ ] Existing stroke, reduced-motion, mobile, and contact behavior is unchanged.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if increased visibility reduces readable contrast or makes the concept
  look like confirmed real-salon media.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined.

## Validation

- Select commands and owner/manual checks before implementation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-14T00:02:42.466Z
- Validation: Reduced hero blur from 14px to 10px and warm veil opacity from 82/72% to 76/64% so the interior concept is more visible; pnpm lint, pnpm build, git diff --check, and Sitewright Doctor passed; browser validation remained off under conservative policy.

- Transition: start at 2026-07-14T00:01:47.600Z

- Completed: Made the hero interior more visible by reducing the background
  blur from 14px to 10px and easing the warm veil from 82/72% to 76/64%
  opacity across mobile/desktop. The type-first foreground and placeholder
  label remain unchanged.
- Validation: `pnpm lint` passed, `pnpm build` passed, `git diff --check`
  passed, and Sitewright Doctor returned `READY IMPLEMENTATION_READY`.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run because the repository's conservative validation
  policy forbids them without explicit owner approval.
- Follow-up: Confirm the final contrast and image visibility during the next
  owner-approved rendered review.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/components/TypographySalonPage.jsx` and this task note.
- Evidence: `.sitewright/evidence/032-increase-visibility-of-the-blurred-hero-image-md.json`
