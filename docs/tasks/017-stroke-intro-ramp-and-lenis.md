# Stroke intro ramp and Lenis smooth scrolling

Status: DONE
Depends on: 016-fix-scroll-jank-in-stroke-and-reveals
Owner: AI-assisted implementation

## Goal

Two owner requests (July 2026):

1. The stroke's start "just sort of fades in super quickly" at load. Instead
   it should begin undrawn and, as scrolling begins, animate from the top of
   the path slightly faster than the scroll until the tip reaches the
   ~75%-viewport tracking line, then continue tracking smoothly.
2. Activate Lenis smooth scrolling now, "since it is gonna be a hassle later
   down the line".

## What changed

- `src/components/motion/MakeupStroke.jsx`: chunk thresholds now use a
  piecewise mapping. At progress 0 the stroke is undrawn (only the path's
  first pixel has threshold 0). Over the first ~1.2 viewports of scrolling
  (`rampProgress`, clamped 0.02–0.35 of total progress) the front sweeps
  from the path start to the catch point `catchY = lead + rampProgress ×
  denominator`; past that it uses the task 016 viewport-line mapping. Both
  mappings agree exactly at `catchY`, so the handoff is continuous. Text
  reveal thresholds are unchanged (above-fold text stays visible at load —
  the landing must not render blank).
- `src/components/motion/SmoothScroll.jsx` (new, client): instantiates
  Lenis (`anchors: true`, `autoRaf: false`), drives it from the GSAP ticker
  (`lagSmoothing(0)`), and calls `ScrollTrigger.update` on Lenis scroll so
  the stroke and reveals track the smoothed position. Mounted site-wide
  from `src/app/layout.jsx`. Under `prefers-reduced-motion` the component
  does nothing and native scrolling is untouched.
- `package.json`: added `lenis`.
- `DESIGN.md`: records Lenis as an owner-approved exception with the
  reduced-motion and anchor/focus conditions.

## Validation (owner grant continued from this fix cycle)

- Front tracking at load and early scroll re-measured; the tip starts at
  the top of the path and reaches the tracking band within ~1.2 viewports.
- Lenis smoke-tested: html carries the `lenis` class, wheel scrolling moves
  the smoothed scroll and the stroke follows, and the `#type-contact`
  anchor still navigates.
- Wheel-scroll frame trace re-run to confirm Lenis + ramp did not regress
  the task 016 numbers.
- `npm run build` passed with all routes statically prerendered. Harness
  removed afterward; conservative validation policy applies again.
