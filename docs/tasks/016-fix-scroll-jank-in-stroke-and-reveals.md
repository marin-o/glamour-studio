# Fix scroll jank in the makeup stroke and text reveals

Status: DONE
Depends on: 015-bristled-brushstroke-texture
Owner: AI-assisted implementation

## Goal

Eliminate the low-framerate feel the owner reported while scrolling the
typography-led homepage ("laggy as fuck... both the brushstroke and the
animations", present since the task 014 stroke). Scrolling must stay
compositor-smooth with the stroke and reveals active.

## Root causes found

1. **SVG filters re-rasterized per scroll frame.** The stroke artwork ran
   through `feTurbulence` + `feDisplacementMap` + `feGaussianBlur`. Every
   scroll frame changed the draw-on mask's `stroke-dashoffset`, invalidating
   and CPU-re-rasterizing the whole filtered, full-page-height group.
2. **Whole-path paint invalidation per frame.** Even with filters removed,
   scrubbing a dashoffset dirties the entire path's paint every frame, so
   every wheel tick forced a main-thread paint of the visible SVG slice.
   The no-stroke `/old` route scrolls with ~zero main-thread frames; the
   stroke page main-thread-rendered every frame.
3. **Text reveals animated `clip-path`.** The Reveal variants animated
   `clipPath: inset(...)`, forcing per-frame paint on each revealing element
   and violating the documented transform/opacity-only invariant.

## What changed

- `src/components/motion/MakeupStroke.jsx`:
  - All SVG filters removed. Dry-edge texture is baked into geometry
    (denser sampling at 36 samples/segment plus a high-frequency edge-noise
    term); the blurred halo became two stacked translucent tapered polygons.
  - The dash-scrubbed mask reveal was replaced by **arc-length chunks**:
    each chunk renders artwork slices and fades opacity over a graded,
    smoothstep-eased window as ScrollTrigger progress passes its threshold.
    Only the few fading tip chunks repaint on a scroll frame; settled chunks
    never invalidate. Opacity writes are guarded and quantized to 1/100 to
    skip no-op style sets.
  - Owner follow-up: the first chunking (~190px, fade ≈ 1.6 chunks) read as
    "segments appearing". Final tuning: chunks smaller than the stroke width
    (~48px desktop / ~56px mobile, capped 12–220) with the fade spanning
    ≈ 4.5 chunks, so the tip is a ~220px continuous gradient.
  - Transverse cuts through translucent fills leave antialiasing seam lines
    (a 1px same-color cover stroke was tried and produced dark rungs
    instead). Final solution: the layer stack is split across **two chunk
    sets staggered by half a chunk** — halo 2.1×, half the core, and
    even-index strands in set A; halo 1.5×, the other half-opacity core copy,
    the inner layer, and odd-index strands in set B. Each core copy renders
    at a = 0.293 (light: 0.471) so the pair composites to the intended
    density, and every seam in one set sits under the continuous middle of
    the other, making seams invisible with no cover strokes.
  - The dark-band light copy renders only the chunks whose y-range
    intersects the band, inside the existing `userSpaceOnUse` clip.
  - Owner follow-up: in the early curvy sections the drawn front fell
    behind the viewport and "caught up" later, because chunk thresholds were
    arc-length fractions while ScrollTrigger progress is a page fraction.
    Chunk AND text-reveal thresholds are now keyed to page y against a
    viewport line (`(y - 0.75·viewportHeight) / (endY - 0.75·viewportHeight)`),
    which pins the front at ~0.6–0.8 of the viewport at every scroll
    position (verified) and keeps text reveals in sync with the tip. The
    fade window is expressed in page pixels (~210px desktop / ~180px
    mobile).
  - Chunk-size floor measured: 28px and 38px chunks were tried per owner
    request and both trend worse in the wheel test (medians ~16% / ~7%
    dropped vs ~3% at 48px, high run variance); 48px desktop / 56px mobile
    is the sweet spot on the test machine. Perceived smoothness is governed
    by the eased fade window, not chunk size.
  - The layer div is compositor-isolated (`transform-gpu`,
    `will-change-transform`).
  - GSAP now uses a bare `ScrollTrigger.create` (no tween, no dash math);
    reveal thresholds and the provider/Reveal contract are unchanged.
- `src/components/motion/Reveal.jsx`: variants animate opacity and `y` only;
  `clipPath` removed.

## Validation (owner-authorized for this fix)

- Harness: temporary `playwright-core` + system Edge, headed, with CDP
  tracing counting compositor `DrawFrame`/`DroppedFrame` events during 4s of
  synthetic wheel scrolling at 2560×1300 css px, deviceScaleFactor 2.
  A rAF-based FPS counter was tried first and showed 165fps on both builds —
  main-thread timing cannot see raster/compositor drops; tracing can.
- Results (dropped-frame share, wheel test): task 015 code **17.2%**;
  filters removed + single mask **13.6–14.4%** (prod and dev alike); chunked
  reveal **0.8–3.8%** across chunk-size/stagger variants, matching the
  no-stroke `/old` control (0%) within run noise. Paced `scrollTo` scrolling
  and 1440/390 viewports showed no drops in any build.
- Screenshot passes after the fine-chunk + staggered-set rework confirmed a
  seamless settled stroke (no rungs, no seam ticks) and a soft continuous
  tip gradient at both viewports.
- Screenshots at 1440×900 and 390×844 across scroll stops confirmed the
  bristled look survived: seamless settled stroke, soft fading tip, local
  dark-band inversion, clean hero at scroll 0. Reduced-motion emulation
  renders the full static stroke with text visible.
- `npm run build` passed; all routes statically prerendered. Harness
  removed afterward; conservative validation policy applies again.

## Durable rules extracted

- Never attach SVG filters to the scroll-driven stroke layer.
- Never animate a property that invalidates the whole stroke's paint every
  scroll frame (dashoffset scrubbing, full-layer masks); reveal by fading
  small localized pieces instead.
- Text reveals must animate transform/opacity only.
