# glamour-studio Repository Map

Map one file or narrow ownership boundary per line. Add change recipes for
common work so agents can inspect the smallest relevant file set.

## Runtime flow

- Request enters the Next.js App Router under `src/app/`, composes product UI and content modules, then renders accessible HTML/CSS for the user.

## Ownership

- `src/app/layout.jsx`: root metadata/app shell, visit-local language provider, and pre-hydration browser-history transition bridge.
- `src/app/page.jsx`: typography-led homepage at `/`.
- `src/app/booking/page.jsx`: server route entry for the customer booking experience.
- `src/app/lookbook/page.jsx`: noindex lookbook route and development-media handoff to the client sequence.
- `src/app/globals.css`: Tailwind v4 tokens, base styles, and progressive-enhancement reveal guard.
- `next.config.mjs`: Next image quality allowlist for quality-100 responsive delivery.
- `src/components/TypographySalonPage.jsx`: homepage composition with a brand-led hero, role-separated work-area studio media band, localized three-group service overview, salon introduction, contact booking action, and shared bottom navigation placement.
- `src/components/LanguageProvider.jsx`: root-persistent in-memory language state and document-language synchronization across client-side routes.
- `src/components/SiteNavigation.jsx`: shared language-aware site navigation, bottom-positioned on standard routes and top-positioned with current-route state on Lookbook.
- `src/components/lookbook/HorizontalLookbook.jsx`: full-viewport horizontal media sequence with shared top navigation, route-local Lenis momentum/settling, responsive quality-100 images, input handling, and brushstroke progress.
- `src/lib/lookbook-media.js`: development-only lookbook image metadata, source links, bilingual alt text, and crop positions.
- `src/lib/booking/`: server-owned, provider-neutral ordered service catalog, studio rules, mandatory customer-email validation, and pure availability calculation from supplied busy intervals.
- `src/lib/booking/google/`: server-only Google Calendar/OAuth adapter with strict secret configuration, injected-fetch REST boundary, deterministic event IDs, and sanitized operational errors.
- `src/lib/booking/orchestration/`: server-only dependency-injected booking coordination, safe public failure mapping, and test-only fakes.
- `src/lib/booking/orchestration/management-service.mjs`: capability-authenticated customer booking reads, availability, lease-fenced Calendar mutations, cutoff enforcement, and terminal revocation.
- `src/lib/booking/notifications/resend.mjs`: branded Macedonian-first/English-second booking notification template and bounded Resend adapter.
- `src/lib/booking/production/`: Vercel-only fail-closed composition, HMAC request context, validated policy/configuration, and atomic Upstash Redis coordination ports.
- `src/lib/booking/local/coordination.mjs`: explicitly localhost-only single-process lock, idempotency, and rate-limit ports shared across development hot reloads.
- `src/lib/booking/http/handlers.mjs`: no-store, exact-schema, injectable public booking HTTP boundary.
- `src/components/booking/BookingExperience.jsx`: language-aware service, availability, contact, and confirmation client flow with an explicit booking-route hero media relationship and shared bottom navigation.
- `src/lib/booking/booking-copy.js`: replaceable bilingual booking UX and stable-ID localized service names.
- `src/lib/booking/client/`: injected browser API boundary and pure booking-flow helpers.
- `tests/booking/booking-client.test.mjs` and `tests/booking/booking-flow.test.mjs`: injected client and pure customer-flow coverage.
- `src/lib/booking/runtime.mjs`: production fail-closed runtime gate with an explicit development-only Google Calendar/local-coordination composition.
- `src/app/api/booking/`: thin no-store availability and booking route handlers.
- `src/app/api/booking/manage/route.js` and `src/app/api/booking/manage/availability/route.js`: no-store, bearer-capability customer booking-management APIs.
- `src/app/booking/manage/page.jsx` and `src/components/booking/BookingManagementExperience.jsx`: fragment-capability customer management route and accessible booking-management UI.
- `tests/booking/google-calendar-adapter.test.mjs`: injected-fetch deterministic coverage for the Google adapter; never contacts Google.
- `tests/booking/booking-management-*.test.mjs`, `tests/booking/local-coordination.test.mjs`, and `tests/booking/production-coordination.test.mjs`: mock-only capability, CAS/TTL/privacy, HTTP, client, and Calendar-management coverage.
- `docs/booking-api.md`: public endpoint contract, idempotency behavior, failure states, and production prerequisites.
- `src/components/motion/MakeupStroke.jsx`: measured GSAP/ScrollTrigger brushstroke and shared reveal timing provider.
- `src/components/motion/HeroCurtainReveal.jsx`: progressive-enhancement GSAP curtain between the hero and services, with live stroke-interruption bounds.
- `src/components/motion/PageTransition.jsx`: root-persistent bidirectional Motion curtain, pre-commit history release controller, held-route fallback, and transition-aware internal link.
- `src/components/motion/Reveal.jsx`: role-based Motion editorial and stroke-pass text entrances.
- `src/components/motion/TypewriterTitle.jsx`: hero-only sequential typewriter with semantic static fallback.
- `src/components/motion/SmoothScroll.jsx`: reduced-motion-aware document Lenis integration, disabled in favor of route-local horizontal Lenis on the lookbook.
- `src/lib/homepage-copy.js`: structurally aligned Macedonian-default and English homepage copy, metadata, and language-control labels.
- `src/lib/lookbook-copy.js`: aligned Macedonian and English Lookbook interface, source-link, instruction, and accessibility copy.
- `src/lib/homepage-media.js`: explicit hero and studio-band role metadata for canonical provisional real-studio 4K delivery derivatives.
- `src/lib/homepage-image-loader.js`: browser/server-safe role-aware loader mapping homepage Image requests to static responsive WebP variants.
- `src/generated/lookbook-media-manifest.js`: generated intrinsic dimensions for lookbook `next/image` rendering.
- `scripts/media/lookbook-manifest.mjs`: lookbook dimension-manifest generator and read-only media build gate.
- `scripts/media/homepage-webp.mjs`: deterministic canonical and responsive homepage WebP generator/check using PNG masters.
- `src/lib/`: shared helpers and product-facing data utilities when needed.
- `docs/`: durable product intent, design constraints, implementation plan, tasks, ADRs, and handoff.
- `docs/owner-content-media-intake.md`: owner checklist for launch facts, copy, media, permissions, and privacy.
- `docs/booking-google-calendar-implementation-plan.md`: owner-approved phased custom Next.js and Google Calendar booking architecture.
- `docs/booking-google-calendar-setup.md`: owner-operated localhost OAuth, dedicated-calendar verification, security, expiry, and recovery runbook.
- `scripts/booking/google-oauth-local.mjs`: Desktop OAuth loopback/PKCE helper that verifies the selected calendar and stores an unlogged refresh token in ignored local environment state.
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
