# Make the horizontal lookbook smoothly settle to center

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner request in current Codex task

## Goal

Replace discrete image stepping with continuous Lenis horizontal momentum, then
settle the nearest image into the viewport center after input stops.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/tasks/038-fix-lookbook-scrolling-and-bidirectional-route-transition.md

## Current repo notes

- The route currently turns each vertical wheel gesture into a single Motion
  step, which reads as abrupt image snapping.
- Lenis 1.3.25 and its bundled `lenis/snap` plugin are already installed.
- CSS scroll snap must not compete with Lenis snapping.

## Scope

- Create a route-local horizontal Lenis instance using the gallery as wrapper
  and the image sequence as content.
- Accept vertical wheel, horizontal wheel/trackpad, and native touch movement
  as continuous horizontal input.
- Use the bundled Lenis snap plugin with centered image elements and a short
  input-end debounce so the nearest image settles only after scrolling stops.
- Preserve immediate keyboard/reduced-motion behavior and the brushstroke
  progress mapping.

## Suggested files

- src/components/lookbook/HorizontalLookbook.jsx
- DESIGN.md
- REPO_MAP.md
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Replace the discrete wheel handler with route-local horizontal Lenis.
2. Add centered Lenis snap points and remove competing CSS snap behavior.
3. Preserve reduced-motion and keyboard fallbacks.
4. Update durable docs, validate, record evidence, and refresh handoff.

## Acceptance criteria

- [ ] Wheel and trackpad movement scroll continuously with Lenis momentum rather
      than jumping one image per gesture.
- [ ] After input ends, the nearest image eases to the viewport center.
- [ ] Native touch scrolling remains usable and settles to the nearest image.
- [ ] Keyboard navigation centers its requested image; reduced-motion avoids
      smooth animation while retaining centering.
- [ ] Brushstroke progress and active-image count follow the smooth position.
- [ ] Lint, build, diff check, and Sitewright Doctor outcomes are recorded.

## Non-goals

- Do not add a dependency or create a custom animation frame loop.
- Do not change route transitions, media, disclosure, or composition.

## Risks and stop conditions

- Stop if Lenis and CSS snap compete or if smooth scrolling cannot be scoped to
  the lookbook container.

## Validation

- Run `pnpm lint`, `pnpm build`, `git diff --check`, and Sitewright Doctor.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-18T10:29:12.745Z
- Validation: pnpm lint passed; pnpm build passed; git diff --check passed; Sitewright Doctor IMPLEMENTATION_READY with only the expected pre-refresh handoff warning; browser and visual QA not run under conservative policy.
- Approved by: Owner request in current Codex task

- Transition: start at 2026-07-18T10:26:53.274Z

- Completed: Replaced discrete vertical-wheel image steps with a route-local
  horizontal Lenis instance; added the bundled Lenis snap plugin with centered
  image targets and a 220ms input-end debounce; limited CSS snapping to
  reduced-motion/no-script fallback behavior.
- Validation: `pnpm lint`, `pnpm build`, and `git diff --check` passed.
  Sitewright Doctor reported `IMPLEMENTATION_READY` with only the expected
  pre-handoff stale-memory warning.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run under the repository's conservative validation
  policy.
- Follow-up: Tune Lenis `lerp`, wheel multiplier, snap debounce, or snap
  duration only from owner-observed feel; keep smooth movement and settling as
  separate phases.

## Traceability

- Product outcome: Make the editorial image sequence feel fluid while still
  landing on a clear centered frame.
- Implementation phase: Phase 2 corrective interaction refinement.
- Changed files: `src/components/lookbook/HorizontalLookbook.jsx`, `DESIGN.md`, `REPO_MAP.md`, `docs/tasks/039-make-the-horizontal-lookbook-smoothly-settle-to-center.md`, `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/039-make-the-horizontal-lookbook-smoothly-settle-to-center.json`
