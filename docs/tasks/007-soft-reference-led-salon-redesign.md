# Soft reference-led salon redesign

Status: TODO
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

- [ ] The page clearly shows a soft-to-moderate redesign, not a full reset.
- [ ] The redesign visibly draws from Hagi's cinematic restraint and Ever's
      beauty-service structure while retaining Glamour Studio's own design
      contract.
- [ ] The page remains a single-page salon draft aligned with
      `docs/product-spec.md` and `DESIGN.md`.
- [ ] Missing media, contact details, prices, staff, address, hours, and booking
      remain clearly pending.
- [ ] No fake availability, fake testimonials, fake awards, fake review counts,
      fake staff claims, fake service details, fake address, fake hours, or fake
      prices are introduced.
- [ ] The persistent contact/status CTA remains accessible and does not cover
      essential content.
- [ ] Accessibility basics are preserved: semantic regions, readable contrast,
      keyboard focus, usable contact path, and reduced-motion behavior.
- [ ] `docs/agent-handoff.md` reflects the current state and next owner
      decision.
- [ ] Validation results are recorded in this task.

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
- Validation:
- Deviations:
- Follow-up:
