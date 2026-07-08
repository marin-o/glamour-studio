# Scroll-driven makeup stroke and synced text reveals

Status: TODO
Depends on: 013-adopt-tailwind-and-mobile-editorial-rhythm
Owner: AI-assisted implementation

## Goal

On the typography-led homepage (`/` and its `/typography` alias), a drawn,
makeup-like brush stroke traces down the page as the visitor scrolls —
following the existing left/right/left editorial zigzag — and each text
segment reveals at the moment the stroke tip reaches its position. The
independently observable outcome is a scroll-scrubbed stroke that "applies"
the page section by section, with no layout shift, no content hidden from
no-JS or reduced-motion visitors, and desktop and mobile both choreographed.

## Owner decisions already made

- Medium: an abstract drawn SVG brush/lipstick stroke in the existing palette.
  No placeholder or stock video; real salon video remains a separate future
  owner deliverable per `DESIGN.md`.
- Scope: the stroke runs the full homepage, hero through contact, not just
  the hero.
- Segment-local color inversion: the stroke is warm brown (`accent` /
  `accent-deep`) over light sections and flips to the light `surface` color
  only along the parts that cross dark backgrounds (the `accent-deep`
  contact band) — never the whole line at once.
- Libraries: Framer Motion (`motion` package) for text animations; GSAP
  (with ScrollTrigger and `@gsap/react`) for everything else, including the
  stroke scrub.
- Validation: the owner explicitly authorized browser, screenshot, scroll,
  and interaction checks **for this task only**. The conservative policy
  remains in force for all other work.

## Relevant documents

- `DESIGN.md` — "Motion And Progressive Enhancement" (static fallback,
  reduced motion, no fake media, no motion blocking reading or contact) and
  "Imagery, Media, And Texture" (no generic stock).
- `docs/tasks/013-adopt-tailwind-and-mobile-editorial-rhythm.md` — the
  zigzag composition the stroke must trace.
- `docs/agent-handoff.md`, `REPO_MAP.md`.

## Current repo notes

- Styling is Tailwind v4; tokens live in the `@theme` block of
  `src/app/globals.css` (`--color-accent`, `--color-accent-deep`,
  `--color-surface`, `--color-blush`).
- `src/components/TypographySalonPage.jsx` is a server component shared by
  `/` and `/typography`. Sections in order: hero (light), service index
  (`surface-warm`), production brief (light), tone test (light), contact
  (dark `accent-deep`).
- Mobile rhythm: hero "Studio" right-aligned; even service rows
  right-aligned; production heading right; tone-test paragraph and contact
  list right-offset. The stroke path should pass through/near these
  alternating anchors on both mobile and desktop.
- No animation libraries are installed yet. `react`/`next` are `latest`.

## Scope

- Add dependencies: `motion`, `gsap`, `@gsap/react`.
- Build a stroke layer component (client) rendering a full-page, absolutely
  positioned, `pointer-events-none`, `aria-hidden` SVG behind the content:
  - a single snaking path whose waypoints are measured from the real
    section/text-anchor positions (ResizeObserver + recompute on resize),
    with distinct simplified geometry for narrow viewports;
  - brush-like treatment (tapered width, texture via stroke styling, SVG
    filter, or a masked texture) in the blush/brown palette — an artistic
    makeup gesture, not a plain hairline;
  - scroll scrub via GSAP ScrollTrigger driving stroke draw-on
    (`stroke-dashoffset` or equivalent);
  - segment-local color: hard-stop `userSpaceOnUse` gradient along the
    path's vertical extent, or a duplicated path clipped to the dark
    section's bounds, so only the dark-band portion renders in `surface`.
    Pick whichever proves crisper; record the choice here.
- Text reveal system:
  - a thin client wrapper (Framer Motion) around existing text segments:
    hero kicker/paragraphs, section headings, service rows, production list
    items, tone-test copy, contact list items;
  - GSAP owns timing: ScrollTrigger progress is mapped to per-segment
    thresholds (each segment's position along the path); crossing a
    threshold flips state that triggers the Framer Motion variant. Framer
    owns the entrance itself (e.g., masked line rise / soft fade-up
    consistent with the calm editorial tone).
- Progressive enhancement invariants:
  - SSR/no-JS output shows all text fully visible; hidden initial states
    are applied only after hydration when motion is permitted;
  - `prefers-reduced-motion`: no scrub, no reveals; render the stroke fully
    drawn and static (or omit it) and all text visible;
  - transform/opacity only; zero cumulative layout shift; scrolling is
    never hijacked or slowed; the fixed bottom CTA and all anchors/focus
    behavior keep working.
- Keep `TypographySalonPage` a server component; isolate client boundaries
  to the stroke layer and reveal wrappers.
- Leave a documented seam for a future owner-media video scrub to join or
  replace the stroke (per `DESIGN.md`'s long-term hero-video vision).

## Suggested files

- `src/components/TypographySalonPage.jsx` — anchor hooks (ids/data
  attributes) and reveal wrappers around text segments.
- `src/components/motion/MakeupStroke.jsx` (new, client) — SVG layer + GSAP
  scrub + threshold events.
- `src/components/motion/Reveal.jsx` (new, client) — Framer Motion wrapper
  consuming threshold state.
- `src/app/globals.css` — only if a token or small base rule is needed.
- `package.json` — new dependencies.
- `DESIGN.md` — update the Motion section with the stroke as the current
  signature motion and its rules.
- `docs/agent-handoff.md`, this task file.

## Implementation steps

1. Re-read `DESIGN.md` motion rules and the current homepage component;
   inventory the text segments and their alternating anchors at mobile and
   desktop widths.
2. Install `motion`, `gsap`, `@gsap/react`.
3. Build the stroke layer: measured waypoints → path generation → brush
   treatment → ScrollTrigger scrub. Verify draw-on tracks scroll position
   convincingly at 390px and 1440px.
4. Implement the segment-local color inversion over the dark contact band;
   confirm the flip happens only along that band.
5. Add threshold → state plumbing and Framer Motion reveals; tune so
   segments appear as the stroke tip reaches them (roughly mid-viewport).
6. Enforce the progressive-enhancement invariants (no-JS, reduced motion,
   CLS, scroll performance).
7. Validate per below, iterating on screenshots/scroll captures.
8. Update `DESIGN.md` (motion section), `docs/agent-handoff.md`, and this
   file's completion notes.

## Acceptance criteria

- [ ] A makeup-like drawn stroke scrubs with scroll along the full homepage
      zigzag on both mobile and desktop viewports.
- [ ] Text segments reveal when the stroke reaches them; GSAP drives the
      timing, Framer Motion renders the entrances.
- [ ] The stroke renders brown over light sections and light `surface` only
      along the dark contact band, flipping locally, not globally.
- [ ] With JavaScript disabled, all content is visible and correctly laid
      out; no text is missing.
- [ ] With `prefers-reduced-motion: reduce`, there is no scrub or reveal
      animation and all content is visible.
- [ ] No horizontal overflow, no cumulative layout shift, no scroll
      hijacking; the bottom CTA, anchors, and focus states still work.
- [ ] `/old` and `/lookbook` are unaffected.
- [ ] No fake media, business claims, or availability implications are
      introduced.
- [ ] `DESIGN.md`, `docs/agent-handoff.md`, and this task record the final
      state.

## Non-goals

- No video (stock or placeholder); the real-media video scrub stays a
  future owner-gated task.
- No animation on `/old` or `/lookbook`.
- No parallax, scroll-jacking, cursor effects, or motion beyond the stroke
  and its synced reveals.
- No final salon facts, media, copy, or booking behavior.

## Risks and stop conditions

- Stop if the stroke cannot track the zigzag reliably across viewport sizes
  without hardcoding fragile pixel positions — resolve with measured
  waypoints or renegotiate scope (e.g., hero-first slice).
- Stop if reveal choreography requires hiding SSR content in a way that
  harms no-JS visitors or SEO.
- Stop if scroll performance on mid-range mobile degrades (jank while
  scrubbing) and cannot be fixed with cheap rendering (path simplification,
  will-change, fewer filter effects).
- Pause for owner direction before adding any imagery beyond the abstract
  stroke.

## Validation

- Owner-authorized for this task only: browser checks, screenshots at
  multiple scroll positions and viewports (390px and 1440px minimum),
  reduced-motion emulation, JS-disabled render, and scroll interaction
  checks. Reuse the temporary Playwright + system-Edge harness pattern from
  task 013 and remove it afterward.
- `npm run build` must pass; routes must stay statically prerendered.
- Source scans: no content hidden in SSR markup, no fake-claim terms, no
  new horizontal-overflow risks.
- After this task completes, the conservative no-browser-validation policy
  applies again.

## Completion notes

- Completed:
- Validation:
- Deviations:
- Follow-up:
