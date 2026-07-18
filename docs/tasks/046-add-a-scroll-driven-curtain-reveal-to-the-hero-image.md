# Add a scroll-driven curtain reveal to the hero image

Status: IN PROGRESS
Depends on: None
Owner: AI-assisted implementation
Approver: Owner (approved the interaction direction and task creation)

## Goal

Turn the existing hero interior image into a scroll-driven curtain reveal:
preserve the current softly blurred hero at rest, expose a cropped sharp window
onto that image as the hero's solid foreground moves away, then let the next
section's solid background cover most of the image while preserving a narrow
photographic slit before that section fully settles.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- `src/components/TypographySalonPage.jsx` is the shared homepage composition
  for `/` and `/typography`.
- The hero already uses `homepageMedia[0]` as an absolute full-section
  background with a 6px blur and one `bg-surface/52` veil.
- `src/lib/homepage-media.js` is the replaceable source of the current interior
  concept and its hero crop.
- `src/components/motion/MakeupStroke.jsx` owns the homepage's measured,
  scroll-scrubbed GSAP brushstroke and its reduced-motion behavior.
- Site-wide Lenis is already synchronized with GSAP. The reveal must cooperate
  with that scroll source instead of introducing a second smooth-scroll system.
- Validation policy is `conservative`; rendered/browser checks require separate
  owner authorization during implementation.

## Scope

- Preserve the current hero composition, type hierarchy, veil, blur, concept
  label, and readable initial state.
- Create a scroll-controlled opening between the hero and the following service
  section. The opening reveals a crisp crop of the same interior image already
  used behind the hero; it is a partial sliding window, not a requirement to
  expose the whole image.
- Move the hero's blur/veil away to open the window, then advance a
  services-colored solid surface over most of it while leaving a small,
  deliberate photographic slit before the service section reads as fully
  present.
- Keep the image visually underneath the two solid surfaces so the transition
  reads as one opening that expands and then narrows, not as a new gallery
  block or a second independent image. The existing hero image element must be
  the only photograph used by this transition.
- Remove the makeup brushstroke route from the hero and photographic opening.
  The following solid section's exact top edge must be the stroke's true first
  touch-down point, with no hidden or clipped hero continuation.
- Use the project-approved animation stack: GSAP/ScrollTrigger for this scroll
  choreography, integrated with the existing Lenis and stroke lifecycle.
- Preserve semantic document order, accessible content, native scrolling,
  responsive layout, and the persistent bottom navigation/contact path.
- Provide a static, readable reduced-motion and no-enhancement state that does
  not depend on completing the curtain sequence.
- Update `DESIGN.md` with the durable hero-reveal and brushstroke-interruption
  contract, then refresh the task notes and current handoff.

## Suggested files

- src/components/TypographySalonPage.jsx
- src/components/motion/MakeupStroke.jsx
- src/app/globals.css
- src/lib/homepage-media.js
- DESIGN.md
- docs/agent-handoff.md
- docs/tasks/046-add-a-scroll-driven-curtain-reveal-to-the-hero-image.md

## Implementation steps

1. Inspect the hero-to-services boundary in `TypographySalonPage.jsx` and the
   relevant geometry, progress, and lifecycle code in `MakeupStroke.jsx`.
2. Define one responsive scroll interval that opens a partial image window and
   then narrows it to a small slit with the following solid surface, without
   changing semantic section order or trapping document scroll.
3. Use the existing hero image element as the sharp source and move its
   blur/veil independently so the current blurred/veiled hero state stays
   intact at the top of the page without duplicating the photograph.
4. Implement the choreography with GSAP/ScrollTrigger and ensure cleanup,
   refresh, resize, Lenis, and reduced-motion behavior follow the existing
   motion lifecycle.
5. Start the brushstroke route at the following solid section's exact top edge
   so no stroke geometry exists in the hero or photographic window.
6. Update the durable visual contract in `DESIGN.md`.
7. Run the conservative validation set and record results, deviations, and the
   current state in this task and `docs/agent-handoff.md`.

## Acceptance criteria

- [ ] At the top of `/` and `/typography`, the hero retains its current
      blurred, veiled, type-first appearance and visible temporary-media label.
- [ ] Scrolling away from the hero moves a solid foreground boundary to reveal
      a crisp, cropped window onto the same interior image.
- [ ] The revealed window remains intentionally partial; the effect does not
      turn the homepage into a full-screen gallery or require the complete
      image to be visible.
- [ ] Continuing to scroll moves a services-colored solid surface over most of
      the image while retaining a narrow photographic slit before the section
      reaches its normal settled presentation.
- [ ] The transition follows normal document scroll, is reversible when
      scrolling upward, and does not lock, hijack, or unexpectedly jump the
      page.
- [ ] The makeup brushstroke has no route or pigment in the hero or over the
      revealed photograph; its true first touch-down is flush with the next
      solid surface's top edge.
- [ ] Hero copy, service content, bottom navigation, focus behavior, and contact
      access remain usable throughout and do not rely on animation completion.
- [ ] The service heading and rows retain their normal viewport-led entrance
      timing; the curtain must not defer downstream text or stroke progress.
- [ ] Reduced-motion and no-enhancement users receive an immediate, readable
      static composition with no required scroll choreography.
- [ ] The implementation avoids new motion dependencies and preserves the
      existing localized-chunk brushstroke performance constraints.
- [ ] `DESIGN.md`, completion notes, validation evidence, and the current
      handoff describe the implemented contract accurately.

## Non-goals

- Do not add a hero video, new photography, parallax, a carousel, or a new
  standalone media section.
- Do not change the existing hero veil, blur, copy, media label, image source,
  or object position unless the reveal exposes a concrete defect that requires
  owner direction.
- Do not redesign the service section, homepage typography, brushstroke style,
  route transitions, lookbook, or persistent bottom navigation.
- Do not pin the visitor in a long cinematic sequence or introduce another
  smooth-scroll controller.
- Do not conduct a broad motion-system refactor when a bounded hero-to-services
  transition can satisfy the outcome.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop for owner direction if the transition requires changing the agreed
  partial-window sequence, current hero appearance, or which section covers the
  image.
- Stop if the proposed layering obscures readable hero/service content, traps
  focus, interferes with the bottom navigation, or lacks a clear reduced-motion
  fallback.
- Stop and simplify if the technique requires per-frame whole-layer paint,
  full-stroke masking, a second scroll controller, or otherwise regresses the
  brushstroke's established performance contract.
- Stop if responsive stroke clipping cannot remain aligned with the moving
  solid/image thresholds after resize and ScrollTrigger refresh.

## Validation

- Run `pnpm lint`, `pnpm build`, `git diff --check`, and Sitewright Doctor.
- Inspect the implementation for semantic section order, cleanup, responsive
  remeasurement, reduced-motion behavior, and a static no-enhancement baseline.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction checks unless the owner explicitly authorizes them during
  implementation.

## Completion notes

- Transition: start at 2026-07-18T11:12:16.113Z

- Completed:
  - Added a progressive-enhancement GSAP/ScrollTrigger curtain around the
    existing hero and service sections without changing semantic document
    order or introducing another scroll controller.
  - Corrected the first implementation after owner review: the existing hero
    image is now the single sharp source, its independent backdrop-blur veil
    opens a substantially larger window, and the services-colored cover leaves
    a deliberate narrow photo slit.
  - Kept the closed composition as the no-script and reduced-motion baseline.
  - Passed live opening bounds to the makeup stroke, suppress only the
    localized paint chunks that intersect the maximum photograph opening, and
    restored all later text and stroke thresholds to their normal viewport
    timing so the interrupted route cannot refill backward or stall downstream.
  - Browser review exposed that the first corrected window still reached full
    size after most of it had left the viewport. The reveal now starts earlier,
    opens to roughly 78% of viewport height, holds before closing, and clips the
    hero foreground copy with the veil edge so the photograph stays clean.
  - The owner's Firefox HAR proved the corrected bundle was already loading and
    exposed a high-resolution geometry defect instead of a cache defect. Removed
    the 680px reveal ceiling, clamped the start to a valid document position,
    and shortened the opening phase so 1440px-tall viewports receive the same
    proportional window as compact screens.
  - Added a hard, ungrouped route anchor at the service section's top edge and
    replaced whole-chunk interruption with a static two-surface SVG clip. The
    resumed stroke is now cropped flush to the image/cream boundary instead of
    materializing around the padded heading.
  - Removed hero anchors from the painted route while retaining their text
    reveal thresholds. The service-edge anchor is now the actual first route
    point, so the stroke touches down once at that boundary instead of implying
    a clipped or resumed gesture from the hero.
  - Recorded the durable curtain and stroke-interruption contract in
    `DESIGN.md` and the new component ownership in `REPO_MAP.md`.
- Validation:
  - `pnpm lint` passed.
  - `pnpm build` passed, including the lookbook media gate, compilation,
    type analysis, and static generation for `/` and `/typography`.
  - `git diff --check` passed for the implementation files.
  - Sitewright Doctor passed with `IMPLEMENTATION_READY`.
  - Owner-authorized in-app browser validation covered forward and reverse
    scrolling at approximately 639x477 and 1174x737. The large sharp window
    remains visibly centered during its hold, the service heading is present as
    its section enters, Haircuts appears near the lower viewport edge, and the
    stroke resumes once on the service surface without backward refill.
  - The supplied Zen/Firefox HAR loaded only the corrected curtain chunk
    (`bottom 125%`, 0.78 depth, foreground clipping, no threshold remap) with
    `200` responses and `no-cache, must-revalidate`; no old curtain code was
    present. The sole failed request was an unrelated favicon `404`.
  - Follow-up rendered validation at 1920x1080 and 2560x1440 confirmed the
    uncapped reveal reaches 78% of viewport height (1123px at 1440px tall), the
    service heading and Haircuts are visible on entry, and downstream stroke
    chunks continue without a timing stall.
  - A screenshot-matched 1920x1080 browser check confirmed the resumed stroke
    touches the cream surface at the image edge, leaks no pigment into the
    photograph, and curves continuously toward the editorial heading.
  - After the owner changed the route contract, a fresh 1920x1080 browser check
    confirmed zero visible stroke chunks in the hero. At the service entry, the
    first visible chunk begins exactly at the measured cream-section boundary
    and continues forward from that touch-down point.
  - Browser console inspection found no runtime errors. The only warnings were
    expected Fast Refresh full-reload notices caused by editing during the
    validation session.
  - Static inspection confirms that reduced motion clears enhancement styles,
    cleanup kills the timeline and trigger, scroll remains native, and the
    existing service/contact semantics stay in document order.
  - Follow-up Sitewright Doctor remained `IMPLEMENTATION_READY`; it reported the
    expected stale-handoff warning after this within-task design refinement.
- Deviations:
  - Browser validation was run after the owner explicitly requested controlled
    browser inspection, satisfying the conservative-policy authorization gate.
- Follow-up:
  - Owner completion approval remains required before the task can transition
    from `IN PROGRESS` to complete.

## Traceability

- Product outcome: Interface elements reveal and unreveal around hero media as
  scroll progresses while preserving a calm, accessible baseline.
- Implementation phase: Phase 2 — design, interaction, and responsive
  refinement.
- Changed files: `src/components/TypographySalonPage.jsx`,
  `src/components/motion/HeroCurtainReveal.jsx`,
  `src/components/motion/MakeupStroke.jsx`, `DESIGN.md`, `REPO_MAP.md`,
  `docs/tasks/046-add-a-scroll-driven-curtain-reveal-to-the-hero-image.md`,
  `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/046-add-a-scroll-driven-curtain-reveal-to-the-hero-image-md.json`
