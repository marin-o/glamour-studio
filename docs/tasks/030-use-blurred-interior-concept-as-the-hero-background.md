# Use blurred interior concept as the hero background

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Use the existing wide interior concept as a full-section, blurred hero
background while preserving readable type-first content and the explicit
placeholder status.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- The shared homepage currently shows the wide interior concept as a foreground
  hero image and again in the after-services media band.
- `src/lib/homepage-media.js` owns the image source, intrinsic dimensions, and
  hero object position.
- The hero must remain type-first, readable, reduced-motion-safe, and honest
  about concept imagery.

## Scope

- Replace the foreground hero image with an absolute full-section background
  layer using the existing `next/image` asset, responsive sizing, a modest blur,
  and a warm contrast veil.
- Keep the title, intro copy, contact path, service/media band, and stroke route
  intact; remove the duplicate foreground hero image.
- Keep `Concept imagery — real studio photos pending` visible in the hero.
- Update `DESIGN.md` and the owner media intake with background-safe replacement
  guidance.

## Suggested files

- src/components/TypographySalonPage.jsx
- src/lib/homepage-media.js
- DESIGN.md
- docs/owner-content-media-intake.md
- docs/agent-handoff.md
- docs/tasks/030-use-blurred-interior-concept-as-the-hero-background.md

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] The shared `/` and `/typography` hero uses the interior concept as a
      full-section blurred background.
- [ ] A stable warm veil preserves readable contrast for the type-first title,
      intro, and label; no essential content depends on blur or motion.
- [ ] The foreground duplicate image is removed and the existing stroke,
      contact actions, reduced-motion behavior, and mobile flow remain intact.
- [ ] The background uses centralized metadata, intrinsic image dimensions,
      responsive sizing, and an empty decorative alt treatment.
- [ ] Design and owner intake docs describe the background replacement rules.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if the blur or veil competes with the type-first hero or reduces readable
  contrast.
- Stop if the image layer causes layout shifts, obscures focus/anchors, or
  changes the makeup-stroke route.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined.

## Validation

- Select commands and owner/manual checks before implementation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-13T23:38:09.130Z
- Validation: Hero now uses the wide interior concept as a blurred full-section background with a warm contrast veil; pnpm lint, pnpm build, git diff --check, and Sitewright Doctor passed; browser validation remained off under conservative policy.

- Transition: start at 2026-07-13T23:35:58.592Z

- Completed: Replaced the foreground hero image with the existing wide interior
  concept as an absolute, blurred full-section background. A warm contrast veil
  keeps the type-first title, intro copy, contact path, and provisional label
  readable; the duplicate foreground figure is removed.
- Validation: `pnpm lint` passed, `pnpm build` passed, `git diff --check`
  passed, and Sitewright Doctor returned `READY IMPLEMENTATION_READY`.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run because the repository's conservative validation
  policy forbids them without explicit owner approval.
- Follow-up: Replace the concept background with an owner-approved wide
  interior shot that has calm edges and tolerates blur/contrast treatment.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/components/TypographySalonPage.jsx`,
  `DESIGN.md`, `docs/owner-content-media-intake.md`, and this task note.
- Evidence: `.sitewright/evidence/030-use-blurred-interior-concept-as-the-hero-background-md.json`
