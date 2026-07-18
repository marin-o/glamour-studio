# Fix lookbook scrolling and bidirectional route transition

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner feedback in current Codex task

## Goal

Make the lookbook reliably move image-to-image and replace the mount-only wipe
with a continuous route curtain that slides in before navigation and slides out
after the destination renders, reversing direction when returning home.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/tasks/037-rebuild-the-lookbook-as-a-horizontal-sequence.md

## Current repo notes

- Lenis remains active from the root layout and can compete with the
  lookbook-owned horizontal wheel handler.
- The current curtain mounts at full coverage on `/lookbook`, so it appears
  abruptly before animating away and cannot animate the route exit.
- Homepage and lookbook return links use plain `next/link`, so there is no
  pre-navigation phase for a shared transition.

## Scope

- Skip site-wide Lenis while `/lookbook` is active.
- Make vertical wheel input advance one horizontal image with Motion, while
  preserving native horizontal trackpad and touch behavior plus keyboard input.
- Add a root-persistent Motion route curtain and a transition-aware link.
- Entering `/lookbook` slides the curtain in from the right and out to the left;
  returning to `/` performs the exact directional reverse.
- Remove the lookbook-local mount curtain and its progressive-enhancement CSS.
- Preserve reduced-motion immediate navigation and all media/source safeguards.

## Suggested files

- src/app/layout.jsx
- src/app/globals.css
- src/components/TypographySalonPage.jsx
- src/components/lookbook/HorizontalLookbook.jsx
- src/components/motion/PageTransition.jsx
- src/components/motion/SmoothScroll.jsx
- DESIGN.md
- REPO_MAP.md
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Remove the root scrolling conflict on the lookbook route.
2. Replace incremental wheel mutation with Motion-owned image stepping.
3. Add the shared bidirectional route curtain and transition-aware links.
4. Update durable documentation, validate, record evidence, and refresh handoff.

## Acceptance criteria

- [ ] Wheel input advances the horizontal sequence image-to-image without
      Lenis intercepting it; touch, native horizontal input, and keyboard
      navigation remain supported.
- [ ] Navigation from `/` to `/lookbook` first slides a blush curtain in from
      the right, then slides it out left after the destination renders.
- [ ] Navigation from the lookbook's Studio link reverses that direction, with
      no abrupt full-screen curtain appearance.
- [ ] Reduced-motion users navigate immediately without the curtain.
- [ ] The old lookbook-local mount curtain and its CSS guard are removed.
- [ ] Lint, build, diff check, and Sitewright Doctor outcomes are recorded.

## Non-goals

- Do not add a router, transition, scroll, or animation dependency.
- Do not change lookbook media, disclosure, metadata, or visual composition.
- Do not animate browser back/forward history in this slice.

## Risks and stop conditions

- Stop if the shared curtain can block navigation after an interrupted route
  change.
- Stop if fixing vertical-wheel input breaks native touch or horizontal
  trackpad scrolling.

## Validation

- Run `pnpm lint`, `pnpm build`, `git diff --check`, and Sitewright Doctor.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-18T10:21:54.620Z
- Validation: pnpm lint passed; pnpm build passed; git diff --check passed; Sitewright Doctor IMPLEMENTATION_READY with only the expected pre-refresh handoff warning; browser and visual QA not run under conservative policy.
- Approved by: Owner feedback in current Codex task

- Transition: start at 2026-07-18T10:19:22.822Z

- Completed: Disabled Lenis on `/lookbook`; changed vertical-wheel input to a
  Motion-driven one-image step; added a root-persistent route curtain and
  transition-aware links with mirrored homepage/lookbook directions; removed
  the mount-local curtain that appeared at full coverage.
- Validation: `pnpm lint`, `pnpm build`, and `git diff --check` passed.
  Sitewright Doctor reported `IMPLEMENTATION_READY` with only the expected
  pre-handoff stale-memory warning.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run under the repository's conservative validation
  policy.
- Follow-up: Browser back/forward history remains immediate; the intentional
  curtain applies to the visible Lookbook and Studio links.

## Traceability

- Product outcome: Provide a reliable editorial lookbook with a coherent
  transition into and out of the experience.
- Implementation phase: Phase 2 corrective interaction refinement.
- Changed files: `src/components/motion/PageTransition.jsx`, `src/app/layout.jsx`, `src/components/motion/SmoothScroll.jsx`, `src/components/TypographySalonPage.jsx`, `src/components/lookbook/HorizontalLookbook.jsx`, `src/app/globals.css`, `DESIGN.md`, `REPO_MAP.md`, `docs/tasks/038-fix-lookbook-scrolling-and-bidirectional-route-transition.md`, `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/038-fix-lookbook-scrolling-and-bidirectional-route-transition.json`
