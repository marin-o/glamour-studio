# Agent Handoff

## Current state

- Sitewright is initialized. `docs/tasks/013-adopt-tailwind-and-mobile-editorial-rhythm.md`
  is complete; until a new task is created, Doctor may report
  `PLANNING_REQUIRED` because there is no active executable task.
- The product is a Macedonian-first Glamour Studio salon site for Radovish.
- Root `DESIGN.md` is the authoritative visual-system contract.
- Styling is Tailwind CSS v4: tokens live in the `@theme` block of
  `src/app/globals.css`, layout lives in utility classes on the JSX. Do not
  reintroduce hand-rolled global class systems.
- Public routes `/`, `/typography`, `/old`, and `/lookbook` are mobile-first
  with fluid clamp-based heading scales and a deliberate left/right/left
  editorial stagger on phones (offset copy blocks, indented service rows,
  shifted media cards), matching the desktop typography-led flow.
- Content completion remains intentionally deferred. Address, hours, phone,
  prices, staff names, final Macedonian copy, real photos, and video are still
  owner decisions.
- `docs/owner-content-media-intake.md` is the owner-facing checklist for the
  remaining launch facts, media, permissions, privacy, and replacement surfaces.
- Booking is intentionally not live and must not imply real availability.
- The previous `design-taste-frontend` skill has been removed and should not
  guide future design work.
- Owner supplied Framer reference:
  `https://cooperative-acknowledgment-789213.framer.app/`.

## Current routes

- `/`: typography-led Glamour Studio homepage using
  `src/components/TypographySalonPage.jsx`.
- `/typography`: comparison alias for the same typography-led direction.
- `/old`: preserved task 007 image-led homepage backup.
- `/lookbook`: media-focused planning route for future real salon photos/video,
  with temporary or text-only placeholder slots clearly marked.

## Active task

- No active implementation task. Task 013 is complete and recorded in
  `docs/tasks/013-adopt-tailwind-and-mobile-editorial-rhythm.md`. The open
  verification step is an owner visual pass of the mobile rhythm on a real
  phone.

## Durable gotchas

- Do not invent final salon facts, prices, staff, address, hours, testimonials,
  awards, review counts, or live availability.
- Do not make `/lookbook` feel like a finished portfolio until real
  owner-approved media exists.
- Under conservative validation, do not run browser, viewport, screenshot,
  Playwright, visual, animation, or interaction checks unless the owner
  explicitly asks.
- Use `docs/owner-content-media-intake.md` before replacing placeholders with
  launch-ready content or media.
