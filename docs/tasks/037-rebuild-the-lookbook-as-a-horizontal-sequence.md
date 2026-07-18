# Rebuild the lookbook as a horizontal sequence

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner request in current Codex task

## Goal

Replace the vertically scrolling editorial `/lookbook` with a full-viewport
horizontal image sequence. The route should transition in deliberately, move
sideways from image to image, and use a makeup-brushstroke progress line that
travels rightward with the active image.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/owner-content-media-intake.md
- docs/tasks/036-build-the-editorial-lookbook-from-temporary-instagram-media.md
- src/lib/lookbook-media.js

## Current repo notes

- `/lookbook` currently scrolls vertically through an asymmetric editorial
  sequence and uses a persistent bottom navigation bar.
- `src/lib/lookbook-media.js` supplies the nine development-only local images,
  their Instagram permalinks, authored alt text, crop positions, and Reel-cover
  status. Do not duplicate or rewrite this source-tracing data.
- Motion 12 is already installed and should own the entrance and scroll-progress
  animation. No additional animation dependency is needed.
- The images remain development-only. Noindex metadata, a visible permission
  disclosure, source links, and Reel-cover labels are mandatory until owner
  approvals are recorded.

## Scope

- Recompose `/lookbook` into one `100svh` horizontal scroller with no
  document-level vertical scrolling at supported breakpoints.
- Present all nine images exactly once in a native horizontal, snap-aligned
  sequence. Touch swiping, trackpad scrolling, mouse-wheel translation, and
  keyboard navigation must all remain usable.
- Add a short non-blocking route entrance built with Motion. Reduced-motion
  users receive the finished page immediately.
- Add a layered cosmetic-brushstroke progress rail that advances from left to
  right as the user moves image to image, with a visible current-image count.
- Remove the `/lookbook` persistent bottom navigation and long-form contact
  section. Keep a compact path back to the homepage.
- Retain a compact visible development-media notice and identify Reel cover
  frames without obscuring most of any image.
- Preserve semantic figures/images, meaningful alt text, original-source links,
  `noindex` metadata, and accessible focus states.
- Update `DESIGN.md`, add the client component to `REPO_MAP.md`, record
  completion notes here, and refresh the handoff after completion.

## Suggested files

- src/app/lookbook/page.jsx
- src/components/lookbook/HorizontalLookbook.jsx
- src/lib/lookbook-media.js
- DESIGN.md
- REPO_MAP.md
- docs/agent-handoff.md
- docs/tasks/037-rebuild-the-lookbook-as-a-horizontal-sequence.md

## Acceptance criteria

- [ ] `/lookbook` fills one viewport, does not document-scroll vertically, and
      contains all nine development images exactly once in a horizontal
      snap-aligned sequence.
- [ ] The sequence supports touch, trackpad, translated vertical mouse-wheel,
      arrow/Page/Home/End keyboard input, and visible keyboard focus.
- [ ] The page enters with a short Motion transition, while reduced-motion
      users see an immediate static render.
- [ ] A cosmetic brushstroke progress rail moves rightward with horizontal
      progress and communicates the active image number.
- [ ] Every image preserves its existing authored alt text and original
      Instagram link. Reel covers remain explicitly labelled as still frames.
- [ ] Noindex metadata and a compact visible development-media disclosure stay
      in place; no bottom navigation, long contact section, carousel controls,
      modal, or lightbox remain.
- [ ] `DESIGN.md`, `REPO_MAP.md`, task completion notes, and the handoff describe
      the final behavior and outstanding permission gate.
- [ ] `pnpm lint`, `pnpm build`, `git diff --check`, and Sitewright Doctor are
      run once, with outcomes recorded. Browser and visual validation remain
      unrun unless the owner explicitly authorizes them.

## Non-goals

- Do not add a third-party gallery, lightbox, animation, or component package.
- Do not alter the development-media manifest, download new assets, remove
  noindex/disclosure protections, or claim permission/consent.
- Do not change homepage navigation, contact facts, the `/old` comparison
  route, or the homepage makeup-stroke system.

## Risks and stop conditions

- Stop if horizontal input handling traps the user at either edge or blocks
  source links and keyboard focus.
- Stop if the progress treatment obscures image content or creates a second
  competing navigation system.

## Validation

- Run `pnpm lint`.
- Run `pnpm build`.
- Run `git diff --check`.
- Run Sitewright Doctor.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.

## Completion notes

- Transition: complete at 2026-07-18T10:14:17.756Z
- Validation: pnpm lint passed; pnpm build passed; git diff --check passed; Sitewright Doctor IMPLEMENTATION_READY with only the expected pre-refresh handoff warning; browser and visual QA not run under conservative policy.
- Approved by: Owner request in current Codex task

- Transition: start at 2026-07-18T10:08:15.234Z

- Completed: Replaced the vertical route with a full-viewport native horizontal
  sequence; added scroll snapping, vertical-wheel translation, keyboard
  navigation, a Motion entrance wipe, and a scroll-linked layered brushstroke
  progress rail with active-image count.
- Validation: `pnpm lint`, `pnpm build`, and `git diff --check` passed.
  Sitewright Doctor reported `IMPLEMENTATION_READY`; its pre-handoff run warned
  only that the current-state handoff needed refreshing.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run under the repository's conservative validation
  policy.
- Follow-up: Replace the nine temporary Instagram frames only after website
  reuse, recognizable-person permissions, and production-resolution assets are
  approved and recorded.

## Traceability

- Product outcome: Help potential local clients explore a focused visual sample
  through an editorial, image-led sequence while retaining honest media status.
- Implementation phase: Phase 2 design and responsive refinement; owner media
  approvals remain a Phase 3 gate.
- Changed files: `src/app/lookbook/page.jsx`, `src/components/lookbook/HorizontalLookbook.jsx`, `src/app/globals.css`, `DESIGN.md`, `REPO_MAP.md`, `docs/tasks/037-rebuild-the-lookbook-as-a-horizontal-sequence.md`, `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/037-rebuild-the-lookbook-as-a-horizontal-sequence.json`
