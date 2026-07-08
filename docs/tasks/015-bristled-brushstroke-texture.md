# Bristled brushstroke texture for the makeup stroke

Status: DONE
Depends on: 014-scroll-driven-makeup-stroke-and-text-reveals
Owner: AI-assisted implementation

## Goal

Rework how the scroll-driven makeup stroke is rendered so it reads as a
bristled makeup brushstroke instead of a uniform-width "worm": a tapered
pigment core whose width varies along the gesture, flanked by a few fine
bristle strands with dry gaps. The scrub mechanic, measured routing, reveal
thresholds, and segment-local color inversion from task 014 stay as they are.

## Owner decisions already made

- Owner feedback: the task 014 mechanic works and is "VERY promising" but the
  constant-width ribbon "looks like a worm".
- Direction chosen (July 2026): **bristled brushstroke** — tapered pigment
  core plus fine bristle strands and dry gaps; reads as a makeup brush stroke
  first and subtly echoes flowing hair strands. Rejected alternatives:
  full hair-lock motif, clean strandless pigment swatch.
- Hair caution recorded: a single line that reads as "a hair" triggers the
  stray-hair reaction; hair connotations are acceptable only as multiple
  flowing strands, which the bristle treatment provides implicitly.
- Validation: the owner explicitly authorized browser/screenshot validation
  **for this rework only** (scroll-position screenshots at 390px and 1440px,
  reduced-motion check, temporary Playwright + system-Edge harness removed
  afterward). The conservative policy resumes after this task.

## Why the current render reads as a worm

All visible layers in `src/components/motion/MakeupStroke.jsx` are SVG
`stroke`s: constant width along the whole path, `strokeLinecap="round"`
semicircle ends. A uniform tube with rounded caps following a smooth spline
is geometrically a worm. Real brushstrokes taper at both ends, vary width
with pressure, and have dry, ragged, bristle-split edges.

## Scope

- Keep: measured anchors → grouped route points → smooth cubic route; GSAP
  ScrollTrigger scrub; reveal thresholds and the provider/Reveal contract;
  dark-band clip for local color inversion; reduced-motion and no-JS
  behavior; `pointer-events-none` `aria-hidden` layer.
- Replace the visible rendering:
  - Sample the existing cubic route mathematically (no DOM measurement) into
    dense points with tangents/normals.
  - **Tapered core**: a filled outline polygon built by offsetting samples
    perpendicular to the path by a width profile — near-zero at touchdown,
    swelling and easing with "pressure" through the gesture, thinning to a
    point at lift-off — with slight deterministic edge wobble so the edges
    are not extruded-smooth.
  - **Bristle strands**: 3–5 thin offset polylines that converge at the tips
    and drift/sway apart mid-gesture, dashed for dry gaps, at varied widths
    and opacities.
  - Keep a soft blush halo layer beneath.
- Draw-on reveal: since fills cannot dash-animate, wrap all artwork in an SVG
  `<mask>` whose content is a single fat round stroke along the route;
  GSAP scrubs that mask path's `stroke-dashoffset`. Reveal thresholds and
  progress mapping are unchanged.
- The dark-band light copy duplicates core + strands in `surface`/`peach`
  inside the existing clip, under the same mask.
- All randomness must be deterministic (seeded sine noise, no
  `Math.random()`), so SSR/hydration and re-measures are stable.

## Suggested files

- `src/components/motion/MakeupStroke.jsx` — geometry sampling, core/strand
  path builders, mask-based draw-on, render swap.
- `docs/agent-handoff.md`, this task file.
- Temporary: `screenshot.mjs` + `playwright-core` devDependency (removed
  before completion).

## Acceptance criteria

- [x] The stroke visibly tapers at both ends and varies width along the
      gesture; no constant-width rounded-cap tube remains.
- [x] Bristle strands are visible along the stroke with dry gaps; the whole
      still reads as one gesture, not a scribble.
- [x] Scroll scrub, reveal timing, and segment-local color inversion behave
      as in task 014.
- [x] Reduced motion renders the textured stroke fully drawn and static;
      no-JS leaves all text visible.
- [x] `npm run build` passes with all routes statically prerendered.
- [x] Verified via authorized screenshots at 390px and 1440px at multiple
      scroll positions; harness removed afterward.

## Risks and stop conditions

- Stop if the filled-outline approach causes visible self-intersection
  artifacts on tight curves that cheap sampling cannot fix — fall back to
  layered variable-dash strokes and record the trade.
- Stop if scroll performance degrades from the added geometry (target: same
  smoothness as task 014; the mask stroke is the only animated property).

## Completion notes

- Completed: the route's cubic segments are now sampled mathematically
  (Bézier evaluation, no DOM measurement) into ~170 points with unit normals
  and arc-length parameters. From those samples the layer builds a tapered
  filled core polygon (width profile: pointed touchdown/lift-off tips with
  sine "pressure" variation and slight independent left/right edge wobble),
  a denser inner pigment core at 0.58× width, a blurred blush halo at 1.9×
  width, four furrow streaks inside the core (offsets scaled by the width
  profile so they never escape it), and two faint long-dash flyaway bristles
  just outside. All randomness is seeded sine noise — fully deterministic.
- Completed: draw-on now works by masking the whole artwork group with a
  single fat round-cap stroke along the route whose `stroke-dashoffset` GSAP
  scrubs; reveal thresholds and the provider contract are unchanged. The
  same mask is applied to the dark-band clipped light copy (surface core,
  peach strands/halo), so the local inversion survives the rework.
- Fixed during validation: a stray dot floated at the stroke tip when fully
  undrawn — a zero-length dash under round line caps renders a cap dot. The
  dash pattern is now padded so no dash/gap boundary sits exactly at the
  path start.
- Tuned during validation: first pass read as a stitched seam (dark dashed
  rails outside a pale core) — bristles were moved inside the core as furrow
  streaks; desktop width raised from 34 to 58 (mobile 30); edge-noise
  amplitude and turbulence displacement halved after the wider core made
  the edges read scalloped.
- Validation: three screenshot rounds via temporary `playwright-core` +
  system Edge at 1440×900 and 390×844 across six scroll positions each,
  plus reduced-motion emulation (static fully-drawn textured stroke, no
  scrub). Hero at scroll 0 is clean; dark-band inversion flips only locally;
  the fixed CTA stays above the stroke. `npm run build` passed with all
  routes statically prerendered after every change. Harness (`screenshot.mjs`,
  `playwright-core`, `.shots/`) removed afterward.
- The conservative no-browser-validation policy applies again after this
  task; the owner's authorization was scoped to this rework only.
