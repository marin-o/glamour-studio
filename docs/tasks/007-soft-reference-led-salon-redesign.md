# Soft reference-led salon redesign

Status: DONE
Depends on: None
Owner: AI-assisted implementation

## Goal

Plan and implement a soft-to-moderate redesign of the current Glamour Studio
single-page draft inspired by Hagi's Barbering and Ever, while keeping Glamour
Studio's own creamy pink, peach-beige, warm-brown, local-salon visual language.

The outcome should feel more composed, editorial, and salon-specific, but not
like a full restart or a copy of either reference.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/agent-handoff.md
- public/media/README.md
- src/app/page.jsx
- src/app/globals.css

## Reference notes

- Hagi's Barbering: https://hagisbarbering.com/
  - Useful signals: sparse cinematic framing, large atmospheric media, simple
    navigation, confident brand title, ritual/craft language, and a calm
    editorial cadence around service culture.
  - Do not copy: barber-specific heritage styling, dark masculine craft tone,
    shop/ecommerce language, real booking links, or cultural claims unrelated
    to Glamour Studio.
- Ever: https://www.ever.co.id/
  - Useful signals: beauty-service indexing, direct appointment/contact access,
    image-led service rhythm, understated beauty language, and practical service
    grouping that still feels polished.
  - Do not copy: dense mega-menu structure, repeated slogan strips, real service
    details/prices/FAQs, WhatsApp/call links, or final business claims that
    Glamour Studio has not confirmed.

## Current repo notes

- The site is a Macedonian-first, single-page salon draft for Radovish.
- Confirmed salon name: Glamour Studio.
- Draft service categories: haircuts, hairstyling, and makeup.
- Address, hours, phone, prices, staff names, final Macedonian copy, real
  photos, and video remain pending.
- Booking is not live and must not imply real availability.
- The previous `design-taste-frontend` skill has been removed and must not be
  used for this task.
- Current implementation already removed the runtime font lab and fake disabled
  booking form.

## Design direction

- Preserve the current one-page IA: hero, media/gallery vibe, services, about,
  contact/status, and persistent bottom CTA.
- Moderate the layout rather than replacing the whole page:
  - make the hero feel more cinematic and composed, with the placeholder media
    carrying more of the first impression;
  - make services feel closer to a beauty-service index rather than a generic
    placeholder list;
  - make the media section feel like an intentional studio/texture sequence,
    not a card grid;
  - make the contact/status area more practical and local-client oriented
    without adding real contact details.
- Keep Glamour Studio's language: soft, elegant, local, creamy pink,
  peach-beige, warm brown, and honest placeholders.
- Keep typography as the current system fallback for now. Final font selection
  is intentionally deferred.

## Scope

- Make one coherent, visible redesign pass over `src/app/page.jsx` and
  `src/app/globals.css`.
- Use the two references as direction for composition, rhythm, service
  structure, and CTA placement, not for copied content or exact styling.
- Keep the redesign soft-to-moderate. Avoid a full visual reset unless a local
  section is unsalvageable.
- Preserve truthful pending states for all owner-unconfirmed facts.
- Keep the page accessible, mobile-first, semantic, and usable with reduced
  motion.
- Refresh `docs/agent-handoff.md` after implementation.

## Suggested files

- src/app/page.jsx
- src/app/globals.css
- docs/agent-handoff.md
- docs/tasks/007-soft-reference-led-salon-redesign.md
- DESIGN.md, only if the task creates durable visual-system guidance

## Implementation steps

1. Re-read this task, `docs/product-spec.md`, `DESIGN.md`,
   `docs/implementation-plan.md`, `docs/agent-handoff.md`, `REPO_MAP.md`,
   `public/media/README.md`, `src/app/page.jsx`, and `src/app/globals.css`.
2. Extract a small set of design moves from the references:
   - Hagi's: cinematic media-first hero, sparse navigation, ritual/craft calm.
   - Ever: service index rhythm, practical appointment surface, beauty-detail
     sequencing.
3. Audit the current page for the smallest changes that can express those moves
   without inventing final content.
4. Implement the redesign pass:
   - revise hero composition and placeholder treatment;
   - reshape the media/gallery section into a more intentional sequence;
   - reshape services into a polished draft service index;
   - keep contact/status honest and immediately reachable;
   - tighten CSS tokens, spacing, hierarchy, and responsive behavior.
5. Preserve all pending business-fact boundaries and no-live-booking language.
6. Record what changed, validation results, deviations, and deliberate
   non-fixes in this task.
7. Rewrite `docs/agent-handoff.md` as current state rather than appending
   history.

## Acceptance criteria

- [x] The page clearly shows a soft-to-moderate redesign, not a full reset.
- [x] The redesign visibly draws from Hagi's cinematic restraint and Ever's
      beauty-service structure while retaining Glamour Studio's own design
      contract.
- [x] The page remains a single-page salon draft aligned with
      `docs/product-spec.md` and `DESIGN.md`.
- [x] Missing media, contact details, prices, staff, address, hours, and booking
      remain clearly pending.
- [x] No fake availability, fake testimonials, fake awards, fake review counts,
      fake staff claims, fake service details, fake address, fake hours, or fake
      prices are introduced.
- [x] The persistent contact/status CTA remains accessible and does not cover
      essential content.
- [x] Accessibility basics are preserved: semantic regions, readable contrast,
      keyboard focus, usable contact path, and reduced-motion behavior.
- [x] `docs/agent-handoff.md` reflects the current state and next owner
      decision.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not copy either reference site.
- Do not use the removed `design-taste-frontend` skill.
- Do not choose final fonts yet.
- Do not complete final Macedonian copy or invent business details.
- Do not replace media with generic stock, AI-generated final salon imagery, or
  non-owner-approved photos.
- Do not implement live booking, real appointment scheduling, calendar
  availability, payments, accounts, CMS, analytics, cookies, localization
  toggles, deployment, or legal policy text.
- Do not add browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.
- Do not create a backlog of extra tasks.

## Risks and stop conditions

- Stop if a redesign choice requires final brand direction, real salon facts,
  real salon media, or owner-approved Macedonian copy.
- Stop before adding any claim that would affect launch truth, local trust, or
  legal/privacy obligations.
- Stop before introducing a form that collects personal data unless the owner
  confirms submission destination, privacy/legal copy, and expected behavior.
- Stop if the reference-inspired direction would conflict with accessibility,
  mobile usability, or the established visual-system contract.

## Validation

- Run `npm run build`.
- Run Sitewright Doctor.
- Run a source scan for removed skill references and fake-claim terms in
  changed app files.
- Manually inspect the changed source against this task's reference notes and
  acceptance criteria.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Completed:
  - Initialized a Git repository before continuing implementation and created
    baseline commit `12262e5` (`Initial project baseline`) from the restored
    pre-task project state.
  - Reworked `src/app/page.jsx` into a soft reference-led salon composition:
    cinematic media-led hero, sparse navigation, honest launch-status cues,
    intentional media sequence, service-index rows, practical contact/status
    section, and persistent bottom status CTA.
  - Reworked `src/app/globals.css` around the same structure: warmer editorial
    hero framing, staggered media panels, calmer service rows, restrained
    warm-brown contact surface, mobile breakpoints, focus states, and
    reduced-motion behavior.
  - Preserved the current one-page IA and all product-truth boundaries for
    missing contact, address, hours, prices, staff, real media, final
    Macedonian copy, and live booking.
  - Did not update `DESIGN.md`; the task applied the existing visual-system
    contract rather than creating a new durable rule.
- Validation:
  - `npm run build` passed with Next.js 16.2.10.
  - Sitewright Doctor passed while task 007 was active and reported
    `IMPLEMENTATION_READY`.
  - After closing task 007, Sitewright Doctor reported `PLANNING_REQUIRED`
    because no executable task is active. This is the expected next-state
    warning after completing the task.
  - Source scan found no `design-taste-frontend`, `FontTester`, `FontLoader`,
    runtime font-lab, or disabled-form references in `src/app`.
  - Fake-claim scan found no testimonials, awards, review counts, live
    availability, confirmed appointments, real-time booking, address labels,
    hours labels, or prices in `src/app`; matches were limited to explicit
    pending-language boundaries in page metadata and page copy.
  - Manually inspected the changed source against the task's reference notes,
    acceptance criteria, product spec, and design contract.
- Deviations:
  - Did not run browser, viewport, screenshot, Playwright, visual, animation,
    or interaction validation, per the conservative validation policy and task
    non-goals.
  - Did not use stock, generated, or non-owner-approved replacement imagery.
- Follow-up:
  - Next owner decision is to choose the next active task, review the redesign
    direction, or provide real salon contact details, media, final Macedonian
    copy, service details, pricing, address, hours, and booking destination.
