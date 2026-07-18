# Add interior concept placeholder to the hero

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Add the existing wide salon-interior concept image as a clearly provisional
secondary visual in the shared typography-led hero without making it read as
the real Glamour Studio.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- The `/` and `/typography` routes share `src/components/TypographySalonPage.jsx`.
- Task 028 already provides the wide interior concept and centralized metadata
  in `src/lib/homepage-media.js`.
- The hero must remain type-first, and concept imagery must stay visibly
  replaceable with honest alt text and no essential text over the image.

## Scope

- Add the existing wide interior concept to the hero as a secondary image
  moment, below or beside the type-led title depending on responsive width.
- Reuse centralized metadata and `next/image` intrinsic dimensions.
- Keep the concept label visible near the image and preserve the current hero
  copy, makeup stroke, service band, contact actions, and reduced-motion behavior.
- Update `DESIGN.md` and the owner media intake with the new hero replacement
  slot if the placement becomes durable.

## Suggested files

- src/components/TypographySalonPage.jsx
- src/lib/homepage-media.js
- DESIGN.md
- docs/owner-content-media-intake.md
- docs/agent-handoff.md
- docs/tasks/029-add-interior-concept-placeholder-to-the-hero.md

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] The shared `/` and `/typography` hero displays the wide interior concept
      as a secondary visual while the studio name remains the primary focal point.
- [ ] The image uses the centralized metadata, `next/image`, intrinsic
      dimensions, responsive sizing, and honest placeholder alt text.
- [ ] `Concept imagery — real studio photos pending` remains visible near the
      hero image, with no essential text placed over the image.
- [ ] Mobile reading order, contact actions, stroke behavior, and reduced-motion
      fallback remain intact.
- [ ] Design and owner intake docs describe the hero replacement slot.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if the placeholder competes with or obscures the type-first hero.
- Stop if the concept label cannot remain visible and unambiguous.
- Stop if the image requires a new animation treatment or a change to the
  existing makeup-stroke route.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined.

## Validation

- Select commands and owner/manual checks before implementation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-13T23:31:53.600Z
- Validation: Hero now includes the existing wide interior concept placeholder below the type-led intro; pnpm lint, pnpm build, git diff --check, and Sitewright Doctor passed; browser validation remained off under conservative policy.

- Transition: start at 2026-07-13T23:29:31.895Z

- Completed: Added the existing wide interior concept below the shared hero
  intro as a secondary visual. The studio title remains first, the image uses
  centralized metadata and `next/image`, and the shared provisional label sits
  beside the image without an essential text overlay.
- Validation: `pnpm lint` passed, `pnpm build` passed, `git diff --check`
  passed, and Sitewright Doctor returned `READY IMPLEMENTATION_READY`.
  The reused concept asset was previously inspected for readable text,
  branding, artifacts, and recognizable faces.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run because the repository's conservative validation
  policy forbids them without explicit owner approval.
- Follow-up: Replace the concept hero image with an owner-approved wide
  interior shot or crop when real salon media is available.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/components/TypographySalonPage.jsx`,
  `src/lib/homepage-media.js`, `DESIGN.md`,
  `docs/owner-content-media-intake.md`, and this task note.
- Evidence: `.sitewright/evidence/029-add-interior-concept-placeholder-to-the-hero-md.json`
