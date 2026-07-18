# Replace generic text reveals with a role-based motion system

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Replace the homepage's generic repeated text reveal with a restrained,
role-based motion system: a typewriter entrance for the hero studio name,
side-aware editorial line assembly for suitable copy, and selective reveals
whose timing and direction are spatially motivated by the makeup stroke.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- `/` and `/typography` share `src/components/TypographySalonPage.jsx`.
- `src/components/motion/Reveal.jsx` currently provides the repeated text
  entrance primitive through Motion/Framer Motion.
- `src/components/motion/MakeupStroke.jsx` and GSAP/ScrollTrigger own the
  scroll-scrubbed stroke and its progress context.
- The current animation reads as a generic fade/transform reveal and does not
  express the editorial layout or makeup-stroke concept strongly enough.

## Scope

- Give the studio name in the hero a one-time typewriter entrance. Keep the
  complete name available to assistive technology and expose it immediately in
  reduced-motion, no-JavaScript, and static fallbacks.
- Define a small role-based API or explicit variants for editorial line
  assembly. Lines should enter from the side established by their existing
  left- or right-aligned composition rather than sharing one global direction.
- Apply makeup-stroke-connected reveals only where the stroke's local passage
  gives the entrance a clear spatial reason; reuse the existing stroke progress
  model rather than introducing a competing scroll observer.
- Audit the shared homepage text and assign treatments intentionally. Content
  that does not benefit from motion may remain static.
- Use an animation library for every animation. Default to Motion/Framer Motion
  for text and GSAP for stroke-linked timing or other non-text choreography;
  choose the other library when it is demonstrably the clearer fit and record
  that reasoning in completion notes.
- Preserve semantic HTML, selectable text, responsive line wrapping, current
  layout alignment, reduced-motion behavior, and no-JavaScript readability.

## Suggested files

- DESIGN.md
- src/components/TypographySalonPage.jsx
- src/components/motion/Reveal.jsx
- src/components/motion/MakeupStroke.jsx
- docs/agent-handoff.md
- docs/tasks/020-replace-generic-text-reveals-with-a-role-based-motion-system.md

## Implementation steps

1. Map each animated text element to typewriter, editorial assembly,
   stroke-connected reveal, or static treatment before changing code.
2. Refactor or replace the current reveal primitive with explicit role-based
   variants while keeping full semantic text in the document.
3. Apply the hero-only typewriter treatment and side-aware/stroke-aware variants
   to the shared homepage component.
4. Confirm cleanup, reduced-motion behavior, responsive wrapping, and static
   fallbacks through code inspection and the conservative validation commands.
5. Record the final treatment map, library ownership, validation, and any
   deviations; then refresh the handoff.

## Acceptance criteria

- [ ] The hero studio name uses a typewriter entrance, and no other text uses
  the typewriter treatment.
- [ ] Suitable editorial lines enter from their composition side; the effect
  respects the existing alternating left/right layout rather than normalizing
  it.
- [ ] Stroke-connected reveals are selective and derive their timing from the
  existing makeup-stroke progress system.
- [ ] The generic universal fade-up/blur/word-stagger appearance is removed;
  each animated element has an explicit role, while some text may stay static.
- [ ] Every animation is implemented through Motion/Framer Motion or GSAP, with
  Motion preferred for text and GSAP preferred for scroll/timeline motion unless
  the task notes explain a better-fit exception.
- [ ] Full text remains semantic, selectable, promptly readable, and visible
  under reduced motion, without JavaScript, and after animation cleanup.
- [ ] `/` and `/typography` remain behaviorally aligned through the shared page
  component, with no unintended layout or content changes.
- [ ] Validation results and the final motion-treatment map are recorded here.

## Non-goals

- Do not change the makeup stroke's rendered texture, route, chunking, Lenis
  behavior, or established performance strategy unless a minimal integration
  fix is required for text timing.
- Do not add the parked ScrollMap concept or any map/route visualization.
- Do not redesign layout, rewrite salon copy, choose final fonts, add content,
  or change booking behavior.
- Do not add scramble, typewriter-for-body-copy, bouncing-character, universal
  blur, or decorative per-character motion merely to increase variety.
- Do not add another animation dependency unless the owner approves a concrete
  capability that Motion and GSAP cannot reasonably provide.

## Risks and stop conditions

- Stop for owner direction if the studio-name source or hero text structure is
  ambiguous enough that implementing the typewriter would alter product copy.
- Stop before adding a dependency or changing the stroke performance model.
- Do not solve text splitting by duplicating accessible text or exposing each
  character as a separate screen-reader utterance.
- Preserve the conservative validation boundary: rendered animation checks need
  explicit owner authorization for this task.

## Validation

- Run `npm run lint`.
- Run `npm run build`.
- Run Sitewright Doctor and record its readiness result.
- Inspect cleanup, full-text semantics, reduced-motion branches, and static
  fallback behavior in the changed source.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.

## Completion notes

- Transition: complete at 2026-07-12T22:37:39.059Z
- Validation: Role-based text motion implemented; lint and production build passed; Doctor validated the active task; semantic, reduced-motion, and no-JS fallbacks inspected.

- Transition: start at 2026-07-12T22:35:08.454Z

- Completed: Replaced the universal vertical fade with explicit Motion roles.
  The hero studio name alone uses the typewriter treatment. Aligned section
  headings, labels, service rows, and production/status lists use side-aware
  editorial assembly. Hero pending copy, alternating service rows, and tone
  copy use the smaller stroke-pass response. Tone-test eyebrow copy remains
  static. Contact copy retains explicit editorial roles while its existing
  synthetic anchors preserve the light stroke route through the dark band.
- Validation: `npm run lint` passed; `npm run build` passed with `/` and
  `/typography` statically generated; Sitewright Doctor found the active task
  valid and reported `PLANNING_REQUIRED` only because of one pre-existing
  unresolved planning prompt plus the expected pre-refresh stale handoff.
  Source inspection confirmed one semantic hero heading, an `aria-hidden`
  visual typing overlay, `useReducedMotion` fallbacks, server-rendered full
  text, and no new observer or animation dependency.
- Deviations: Motion owns all text animation, including stroke-pass text;
  GSAP remains the source of scroll/stroke timing through the existing reveal
  context. This avoids a second scroll observer and leaves the stroke's
  performance model untouched.
- Follow-up: Rendered animation/viewport validation was not run because the
  repository uses the conservative validation posture and the owner did not
  authorize a visual pass for this task.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `DESIGN.md`, `REPO_MAP.md`,
  `src/components/TypographySalonPage.jsx`,
  `src/components/motion/Reveal.jsx`,
  `src/components/motion/TypewriterTitle.jsx`, `docs/agent-handoff.md`, and
  this task file.
- Evidence: `.sitewright/evidence/<task-id>.json`
