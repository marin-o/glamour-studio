# Connect the studio media heading to the makeup stroke

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Make the `A calm place for careful work.` heading an intentional makeup-stroke
anchor and editorial reveal in the shared homepage.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- `/` and `/typography` share `src/components/TypographySalonPage.jsx`.
- The studio-media heading is currently a plain `h2`, so it affects layout but
  does not participate in the stroke anchor set.
- `Reveal` already provides the role-based motion and anchor attributes used by
  the existing sitewide stroke.

## Scope

- Render the studio-media heading through `Reveal` with a stable `revealId` and
  an editorial role so it contributes one intentional route point.
- Preserve the heading copy, alignment, accessibility, reduced-motion fallback,
  and all existing media/contact behavior.

## Suggested files

- src/components/TypographySalonPage.jsx
- docs/agent-handoff.md
- docs/tasks/031-connect-the-studio-media-heading-to-the-makeup-stroke.md

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] `A calm place for careful work.` renders through `Reveal` and contributes
      a named stroke anchor to the sitewide geometry.
- [ ] The heading remains semantic, readable, selectable, and visible without
      motion or JavaScript.
- [ ] Existing hero, service, media, contact, and reduced-motion behavior stays
      intact.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if the new anchor creates a sharp or implausible stroke turn.
- Stop if the heading becomes hidden, delayed, or inaccessible without motion.

## Validation

- Select commands and owner/manual checks before implementation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Follow-up (2026-07-14): Kept the studio heading's right-to-left editorial
  entrance while assigning its stroke anchor to the start side, moving the
  incoming route left before it reaches `A calm place for careful work.`
- Validation: `pnpm lint` and `git diff --check` passed; no browser validation
  was run under the conservative policy.

- Transition: complete at 2026-07-13T23:46:42.720Z
- Validation: The studio-media heading now renders through Reveal as studio-title and participates in the makeup-stroke anchor geometry; pnpm lint, pnpm build, git diff --check, and Sitewright Doctor passed; browser validation remained off under conservative policy.

- Transition: start at 2026-07-13T23:45:40.618Z

- Completed: Changed the studio-media heading to render through `Reveal` with
  `revealId="studio-title"`, preserving its semantic `h2`, editorial role,
  alignment, and static fallback while adding it as an intentional stroke
  anchor.
- Validation: `pnpm lint` passed, `pnpm build` passed, `git diff --check`
  passed, and Sitewright Doctor returned `READY IMPLEMENTATION_READY`.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run because the repository's conservative validation
  policy forbids them without explicit owner approval.
- Follow-up: If the resulting route turn is too strong, tune the dedicated
  anchor side or section-level geometry rather than removing the heading anchor.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/components/TypographySalonPage.jsx` and this task note.
- Evidence: `.sitewright/evidence/031-connect-the-studio-media-heading-to-the-makeup-stroke-md.json`
