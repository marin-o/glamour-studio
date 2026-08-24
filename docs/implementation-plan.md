# glamour-studio Implementation Plan

## Baseline

- Reconcile the current repository with the approved product contract before implementing product-facing slices.
- Start from the smallest slice that proves the core outcome: The implementation should preserve the approved product outcome.

## Phase map

- Phase 0: Baseline audit and truth reconciliation.
- Phase 1: First independently verifiable product slice.
- Phase 2: Design, interaction, and responsive refinement.
- Phase 3: Content completion and launch-readiness pass for accessibility, metadata, performance, and owner-approved details.

## Custom booking program

The owner approved a custom Next.js and Google Calendar booking direction on
2026-07-23. Deliver it sequentially under
`docs/booking-google-calendar-implementation-plan.md`:

1. Booking domain and deterministic availability engine.
2. Google Calendar adapter and authorization boundary.
3. Reliable booking orchestration and public API.
4. Macedonian-first customer booking experience.
5. Abuse protection, operations, and launch readiness.
6. Secure customer booking-management links, branded bilingual transactional
   email with calendar-add attachment/link, rescheduling, and cancellation.

Each phase is one Sitewright task. Under the single-active policy, create the
next phase task only after the current phase has passed implementation, review,
fixes, recorded validation, and explicit owner completion approval.

## Cross-phase rules

- Keep the product usable after every normal task.
- Do not combine unrelated content migration, redesign, and dependency adoption.
- Focus upcoming work on design quality, layout, motion direction, responsive behavior, and visual polish.
- Defer content completion until the final phase. Keep provisional content clearly labeled until the owner approves final copy and business facts.
- Prototype in the cheapest adequate medium.
- Delete rejected experiments after recording the decision.

## Stop conditions

- Return to the owner when business truth, brand direction, launch content, or user-facing commitments are missing.
- Always stop when mobile, accessibility, or fallback behavior is undefined for a feature that affects them.
