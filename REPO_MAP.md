# glamour-studio Repository Map

Map one file or narrow ownership boundary per line. Add change recipes for
common work so agents can inspect the smallest relevant file set.

## Runtime flow

- Request enters the Next.js App Router under `src/app/`, composes product UI and content modules, then renders accessible HTML/CSS for the user.

## Ownership

- `src/app/layout.jsx`: root metadata/app shell, visit-local language provider, and pre-hydration browser-history transition bridge.
- `src/app/page.jsx`: typography-led homepage at `/`.
- `src/app/typography/page.jsx`: comparison alias for the shared homepage.
- `src/app/lookbook/page.jsx`: noindex lookbook route and development-media handoff to the client sequence.
- `src/app/globals.css`: Tailwind v4 tokens, base styles, and progressive-enhancement reveal guard.
- `next.config.mjs`: Next image quality allowlist for quality-100 responsive delivery.
- `src/components/TypographySalonPage.jsx`: shared `/` and `/typography` composition, including the persistent bottom navigation.
- `src/components/LanguageProvider.jsx`: root-persistent in-memory language state and document-language synchronization across client-side routes.
- `src/components/lookbook/HorizontalLookbook.jsx`: full-viewport horizontal media sequence, route-local Lenis momentum/settling, responsive quality-100 images, input handling, and brushstroke progress.
- `src/lib/lookbook-media.js`: development-only lookbook image metadata, source links, bilingual alt text, and crop positions.
- `src/components/motion/MakeupStroke.jsx`: measured GSAP/ScrollTrigger brushstroke and shared reveal timing provider.
- `src/components/motion/HeroCurtainReveal.jsx`: progressive-enhancement GSAP curtain between the hero and services, with live stroke-interruption bounds.
- `src/components/motion/PageTransition.jsx`: root-persistent bidirectional Motion curtain, pre-commit history release controller, held-route fallback, and transition-aware internal link.
- `src/components/motion/Reveal.jsx`: role-based Motion editorial and stroke-pass text entrances.
- `src/components/motion/TypewriterTitle.jsx`: hero-only sequential typewriter with semantic static fallback.
- `src/components/motion/SmoothScroll.jsx`: reduced-motion-aware document Lenis integration, disabled in favor of route-local horizontal Lenis on the lookbook.
- `src/lib/homepage-copy.js`: structurally aligned Macedonian-default and English provisional homepage copy, metadata, and language-control labels.
- `src/lib/lookbook-copy.js`: aligned Macedonian and English Lookbook interface, disclosure, instruction, and accessibility copy.
- `src/lib/homepage-media.js`: technical metadata for the live homepage concept imagery.
- `src/generated/lookbook-media-manifest.js`: generated intrinsic dimensions for lookbook `next/image` rendering.
- `scripts/media/lookbook-manifest.mjs`: lookbook dimension-manifest generator and read-only media build gate.
- `src/lib/`: shared helpers and product-facing data utilities when needed.
- `docs/`: durable product intent, design constraints, implementation plan, tasks, ADRs, and handoff.
- `docs/owner-content-media-intake.md`: owner checklist for launch facts, copy, media, permissions, and privacy.
- `docs/tasks/012-021`: completed preparation, responsive-design, motion, lifecycle, and bottom-navigation slices.
- `docs/tasks/022-first-product-slice.md`: next owner-gated identity and contact integration slice.

## Cross-file invariants

- Product-facing copy, structure, and launch blockers must stay aligned with `docs/product-spec.md`.
- Active implementation work must have exactly one scoped task in `docs/tasks/`.
- Current-state guidance belongs in `docs/agent-handoff.md`, not chat history.
- Booking/contact UI must not imply live availability or invented business facts.
- Owner-approved replacements start from `docs/owner-content-media-intake.md`.

## Change recipes

- Product slice: start with `docs/product-spec.md`, active task, `src/app/`, and relevant `src/components/`.
- Design refinement: start with `DESIGN.md`, active task, and affected components/styles.
- Content/media replacement: start with `docs/owner-content-media-intake.md`, `docs/product-spec.md`, and the active route/component.
- Planning or scope change: start with `docs/implementation-plan.md`, `docs/tasks/`, and `docs/agent-handoff.md`.
