# glamour-studio Repository Map

Map one file or narrow ownership boundary per line. Add change recipes for
common work so agents can inspect the smallest relevant file set.

## Runtime flow

- Request enters the Next.js App Router under `src/app/`, composes route-level
  pages and shared components, then renders accessible HTML/CSS for the user.

## Ownership

- `src/app/layout.jsx`: root metadata and app shell.
- `src/app/page.jsx`: typography-led Glamour Studio homepage at `/`.
- `src/app/typography/page.jsx`: comparison alias for the typography-led homepage.
- `src/app/old/page.jsx`: preserved task 007 image-led homepage backup.
- `src/app/lookbook/page.jsx`: media/lookbook planning route with honest placeholder states.
- `src/app/globals.css`: Tailwind v4 entry with `@theme` design tokens and a small base layer; route layout lives in JSX utility classes.
- `postcss.config.mjs`: PostCSS pipeline loading the Tailwind v4 plugin.
- `.gitignore`: ignores build output, dependencies, environment files, logs, and local validation artifacts.
- `src/components/TypographySalonPage.jsx`: shared server component for `/` and `/typography`.
- `src/components/motion/MakeupStroke.jsx`: client-only measured SVG makeup stroke layer, GSAP ScrollTrigger scrub, reveal timing provider, reduced-motion/static fallback.
- `src/components/motion/Reveal.jsx`: client-only Framer Motion primitive for semantic text/list reveal wrappers driven by the makeup stroke provider.
- `src/lib/`: shared helpers and product-facing data utilities when needed.
- `docs/`: durable product intent, design constraints, implementation plan, tasks, ADRs, and handoff.
- `docs/owner-content-media-intake.md`: owner-facing intake checklist for launch facts, copy, media, permissions, privacy, and replacement surfaces.
- `docs/tasks/012-prepare-owner-content-and-media-intake.md`: completed task for creating the owner content and media intake artifact.
- `docs/tasks/013-adopt-tailwind-and-mobile-editorial-rhythm.md`: completed Tailwind v4 migration and mobile editorial-rhythm fix.

## Cross-file invariants

- Product-facing copy, structure, and launch blockers must stay aligned with `docs/product-spec.md`.
- Active implementation work must have exactly one scoped task in `docs/tasks/`.
- Current-state guidance belongs in `docs/agent-handoff.md`, not chat history.
- `/lookbook` must remain honest about missing real salon media and must not present placeholders as final portfolio work.
- Booking/contact UI must not imply live scheduling, confirmed availability, real address, real hours, or real prices until owner-approved.
- Owner-approved content/media replacement should start from `docs/owner-content-media-intake.md`.

## Change recipes

- Product slice: start with `docs/product-spec.md`, active task, route file, and relevant shared component.
- Typography homepage refinement: start with `DESIGN.md`, `src/components/TypographySalonPage.jsx`, and the `@theme` tokens in `src/app/globals.css`.
- Homepage motion refinement: start with `DESIGN.md`, `src/components/TypographySalonPage.jsx`, `src/components/motion/MakeupStroke.jsx`, and `src/components/motion/Reveal.jsx`.
- Lookbook refinement: start with `DESIGN.md`, `public/media/README.md`, and `src/app/lookbook/page.jsx`.
- Styling changes: use Tailwind utilities in the route/component JSX; add or adjust tokens only in the `@theme` block of `src/app/globals.css`.
- Backup route changes: start with `src/app/old/page.jsx` and preserve comparison intent unless the owner asks to remove it.
- Content/media replacement: start with `docs/owner-content-media-intake.md`, `docs/product-spec.md`, `public/media/README.md`, current route copy, and metadata.
- Planning or scope change: start with `docs/implementation-plan.md`, `docs/tasks/`, and `docs/agent-handoff.md`.
