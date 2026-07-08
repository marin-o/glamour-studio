# Adopt Tailwind styling system and mobile editorial rhythm

Status: DONE
Depends on: 011-mobile-first-responsive-site-refinement
Owner: AI-assisted implementation

## Goal

Replace the hand-rolled global CSS with Tailwind CSS v4 as the project styling
system, and in the same pass deliver the mobile outcome task 011 aimed for but
did not achieve: phone layouts that carry the same typography-led left/right/
left editorial flow as desktop instead of a uniformly centered stack.

## Why

- The owner explicitly chose Tailwind adoption over another raw-CSS fix after
  the task 011 result still read as centered on mobile.
- Task 011 changed mobile styles under `max-width` media queries, but the
  offsets were too subtle (18px card shifts, small indents) to change how the
  page reads on a phone.

## Scope

- Install `tailwindcss` and `@tailwindcss/postcss` (v4) with a
  `postcss.config.mjs`.
- Rewrite `src/app/globals.css` to a Tailwind entry: `@theme` tokens carrying
  the existing palette, fonts, and the `--spacing-pad` gutter, plus a small
  base layer (body gradient, focus-visible outline, heading family, smooth
  scroll with reduced-motion opt-out).
- Convert all page markup to utility classes, mobile-first:
  - `src/components/TypographySalonPage.jsx` (`/` and `/typography`)
  - `src/app/old/page.jsx`
  - `src/app/lookbook/page.jsx`
- Mobile editorial rhythm on the typography-led page: hero wordmark keeps its
  em-scaled second-line indent at every viewport; the second hero paragraph,
  production list, and contact list sit right-offset at 88% width with rule
  lines; the tone-test heading is a right-shifted block against a left
  paragraph; even service rows stay indented.
- Equivalent staggering on `/old` and `/lookbook`: even media cards offset
  right, contact card offset on mobile, fluid clamp-based heading scales with
  no breakpoint jumps.
- Preserve semantics, focus states, reduced-motion behavior, CTA clearance,
  and all pending-content truthfulness.

## Validation

- `npm run build` passed (Next.js 16.2.10); `/`, `/typography`, `/old`,
  `/lookbook`, and `/_not-found` prerendered as static routes.
- Compiled CSS inspected for the custom-token utilities (`px-pad`,
  `inset-x-pad`, `border-t-line-strong`, `divide-line-strong`,
  `border-t-surface/25`, `even:` variants) — all present, no silently
  missing classes.
- No browser, viewport, screenshot, or interaction checks were run, per the
  conservative validation policy. The owner should visually confirm the
  mobile rhythm on a phone.

## Completion notes

- Heading scales are now fluid `clamp()` values instead of per-breakpoint
  fixed sizes, so type shrinks continuously and cannot clip at odd widths.
- The hero "Studio" indent is `padding-left: 0.55em`, which scales with the
  font size and keeps the diagonal wordmark stagger visible on phones.
- Tailwind preflight removes default link underlines; all previous
  `text-decoration: none` rules relied on that look already, so no visual
  regression is expected there.
- Tokens kept identical values to the previous CSS custom properties; they
  now live in the `@theme` block of `src/app/globals.css` and generate
  utilities (`bg-surface`, `text-muted`, `border-line`, `px-pad`, ...).
- Task 011 remains recorded as-is; this task supersedes its mobile-rhythm
  approach.

## Follow-up

- Owner visual pass on a real phone remains the open verification step.
- Future styling work should use Tailwind utilities and `@theme` tokens; do
  not reintroduce parallel hand-rolled class systems in `globals.css`.
