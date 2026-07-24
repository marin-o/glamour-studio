# 052 - Build the customer booking experience

Status: DONE
- Depends on:
  - `049-build-booking-domain-and-availability-engine.md`
  - `050-build-google-calendar-adapter-and-authorization-boundary.md`
  - `051-build-reliable-booking-orchestration-and-public-api.md`
- Owner: AI-assisted implementation
- Approver: Owner

## Goal

Add the visible, branded, Macedonian-first customer booking experience:

1. select one of the ten confirmed services
2. select an available date and appointment
3. enter minimal contact information and book

The flow must use the real Phase 3 API contract, preserve English switching,
make no account or employee selection, and handle the API's default fail-closed
state honestly. This phase must not configure production Google credentials,
coordination/rate providers, bot protection, or deployment.

This is Phase 4 of `docs/booking-google-calendar-implementation-plan.md`.

## Required context

Read before implementation:

- `AGENTS.md`
- `docs/agent-handoff.md`
- `REPO_MAP.md`
- root `DESIGN.md`
- `docs/booking-google-calendar-implementation-plan.md`
- booking requirements and open decisions in `docs/product-spec.md`
- completed Tasks 049, 050, and 051
- `docs/booking-api.md` and `docs/booking-google-calendar-setup.md`
- existing homepage, language provider, copy, navigation, motion primitives,
  global styles, booking catalog, and API routes

Repository notes:

- This is a JavaScript Next.js App Router project using pnpm and Tailwind-style
  utility classes.
- The homepage language state is Macedonian-first, memory-only, and shared
  across client navigation through `LanguageProvider`.
- No production booking policy/provider configuration exists; real route calls
  normally return a sanitized `503` until Phase 5 external decisions are made.
- The repository validation posture is conservative. Do not use browser,
  screenshot, viewport, animation, or interaction automation.
- Preserve unrelated worktree changes.

## Scope

### Route and entry points

- Add a dedicated `/booking` page inside the existing application and visual
  system.
- Make booking immediately reachable from the persistent homepage action by
  replacing the current primary `Call` navigation button with a clear `Book`
  action. Keep the confirmed phone number directly available in the contact
  section.
- Add an online-booking action to the contact section.
- Replace the provisional three-category homepage service list with the ten
  owner-confirmed services and connect each service to
  `/booking?service=<trusted-id>`.
- Use client-side internal navigation so the in-memory language selection
  follows the visitor to and from booking.
- Update `DESIGN.md` for the durable booking-route, service-row, and persistent
  navigation decisions.

### Presentation and language

- Follow the warm cream, peach-beige, muted-pink, and warm-brown system already
  defined in `DESIGN.md`; reuse existing tokens and typography.
- Keep the page calm and editorial rather than rendering every element as a
  floating card.
- Provide structurally aligned Macedonian and English booking copy in a
  dedicated copy module.
- Macedonian must be the server-rendered/full-reload default. The existing
  language toggle must update the booking page and `document.lang`.
- Treat newly written Macedonian/English UX tone as replaceable copy pending
  owner approval, while keeping confirmed service facts authoritative.
- Derive service IDs, durations, and price labels from the trusted shared
  catalog rather than duplicating them in presentation copy. Presentation copy
  may map localized service names by stable ID.
- Format all appointment dates/times explicitly in `Europe/Skopje`; never rely
  on the browser's local time zone.

### Three-step interaction

Use semantic controls and one clear current step:

1. **Service**
   - show all ten services with localized name, price, and duration
   - support a valid `service` query parameter without trusting unknown values
   - require explicit selection before proceeding
2. **Appointment**
   - accept a strict calendar date
   - request `/api/booking/availability` only after service and date exist
   - show accessible loading, empty-day, retryable error, unavailable/setup,
     and slot-list states
   - expose returned slots as one keyboard-accessible single-choice group
   - refetch when service/date changes and discard stale/out-of-order responses
3. **Contact and confirmation**
   - require bounded name and phone
   - keep email optional until the owner decides otherwise
   - explain that email is used for the Google Calendar invitation when supplied
   - state that the private studio Calendar receives the booking/contact details
   - require an explicit submit action; never imply success before the API
     confirms

- Generate one opaque idempotency key for a selected appointment submission.
  Reuse it for safe retries of the identical request; replace it whenever the
  service, start time, or contact payload changes.
- Disable duplicate submission while one request is active.
- On stale-slot `409`, preserve the chosen service/date/contact values, return
  to appointment selection, refresh availability, and explain that the time was
  just taken.
- On confirmed booking, show service, Skopje date/time, and notification state
  without echoing phone/email or exposing event/calendar/internal identifiers.
- Distinguish invitation `requested`, `not_requested`, and `unknown` from the
  confirmed appointment itself.

### Accessible and resilient states

- Use semantic headings, fieldsets/legends, labels, validation associations,
  live regions, focus management on step/error/success changes, and visible
  focus states.
- Preserve browser-native form semantics and keyboard operation.
- Include clear Back actions without discarding already entered safe state.
- Respect reduced motion. Do not introduce a new animation dependency or custom
  CSS keyframes. If motion is used, reuse the approved Motion/GSAP system and
  keep it non-blocking.
- Provide a meaningful `<noscript>` fallback with the confirmed phone number and
  an honest explanation that online selection needs JavaScript.
- Provide a direct phone fallback in unavailable, empty, and persistent-error
  states.
- Do not add CAPTCHA, analytics, cookies, storage, customer login, employee
  selection, cancellation, or rescheduling.

### Browser API client and failure mapping

- Add a small client boundary for Phase 3 endpoints with injected `fetch` and
  `crypto`/key generation for deterministic tests.
- Strictly validate public JSON envelopes before the UI consumes them; malformed
  or non-JSON success/error responses become a generic safe unavailable state.
- Send only exact allowed booking fields and `Idempotency-Key`; never send
  duration, price, end time, event title, or Calendar identifiers.
- Keep responses and requests out of console logs.
- Map public API outcomes to actionable localized UI states without displaying
  internal provider/error detail.
- Treat network aborts from superseded availability requests as silent, while
  real timeouts/network failures remain retryable.

### Documentation and ownership

- Update `REPO_MAP.md` for the booking page, component, copy, client/state tests,
  and any homepage ownership changes.
- Update `DESIGN.md` only for durable visual/navigation/component decisions.
- Record in Task 052 that successful live booking cannot be owner-verified until
  Phase 5 production configuration exists.

## Suggested files

- `src/app/booking/page.jsx`
- `src/components/booking/BookingExperience.jsx`
- `src/lib/booking/client/booking-api.mjs`
- `src/lib/booking/client/booking-flow.mjs`
- `src/lib/booking/booking-copy.js`
- `src/lib/homepage-copy.js`
- `src/components/TypographySalonPage.jsx`
- `tests/booking/booking-client.test.mjs`
- `tests/booking/booking-flow.test.mjs`
- `DESIGN.md`
- `REPO_MAP.md`

The implementer may adjust filenames when a smaller boundary is clearer.

## Acceptance criteria

- [ ] `/booking` renders a Macedonian-first three-step service, appointment, and
      contact flow within the established visual system.
- [ ] English switching stays structurally aligned and persists through
      client-side homepage/booking navigation without cookies or storage.
- [ ] All ten confirmed services are presented from the trusted catalog with
      stable IDs, durations, and price labels.
- [ ] Homepage service rows, contact action, and persistent primary CTA lead to
      booking; the confirmed phone fallback remains available.
- [ ] Availability requests are exact, abort stale requests, validate response
      envelopes, and render loading, empty, retry, unavailable, and slot states.
- [ ] Appointment labels always use `Europe/Skopje`.
- [ ] Contact collection is limited to bounded name/phone and optional email
      with honest Calendar/privacy/confirmation disclosure.
- [ ] Identical submission retries reuse one idempotency key; material request
      changes rotate it; duplicate clicks cannot issue parallel bookings.
- [ ] A stale-slot conflict returns the customer to refreshed appointment
      selection without erasing service/date/contact state.
- [ ] Success distinguishes appointment confirmation from invitation state and
      exposes no contact, Calendar, event, or internal identifiers.
- [ ] Invalid, rate-limited, not-configured, provider, malformed-response, and
      network states have localized safe handling and a phone fallback.
- [ ] Semantic labels, fieldsets, live regions, focus movement, keyboard
      controls, visible focus, and reduced-motion behavior are present.
- [ ] A no-JavaScript phone fallback is meaningful and truthful.
- [ ] No account, artist selection, analytics, storage, CAPTCHA, production
      provider, credential, deployment, or Google modification is added.
- [ ] Client/state tests use injected fakes only and make no network calls.
- [ ] `DESIGN.md` and `REPO_MAP.md` reflect the durable new boundaries.
- [ ] Rendered appearance and interaction remain explicitly awaiting owner
      verification under conservative validation policy.

## Required tests

- service query: valid preselection, unknown value ignored, all ten catalog items
- availability client: exact URL encoding, successful/empty results, malformed
  envelope, non-JSON, public error classes, timeout/network, abort, and
  out-of-order response protection
- flow state: step progression/back behavior, selection changes, validation,
  retained contact data, stale-slot reset/refetch, confirmation states
- idempotency: same-payload retry reuse, service/start/contact change rotation,
  concurrent-submit guard
- formatting: standard/DST Skopje instants and both languages
- privacy: request allowlist and response/view state contain no phone/email,
  raw idempotency key, event ID, calendar ID, provider message, or secrets
- copy/catalog: aligned language keys and exact ten-service mapping
- homepage contract: booking links use trusted service IDs and phone fallback
  remains present

## Non-goals

- Production Google/lock/idempotency/rate configuration
- Live successful booking validation
- Bot protection, monitoring, privacy-policy approval, or deployment
- Customer accounts, employee selection, staff UI, cancellation, or reschedule
- Final owner-approved Macedonian/English marketing tone
- A browser-automated or screenshot-based visual pass

## Risks and constraints

- The real API intentionally returns `503` until Phase 5 configuration exists;
  UI copy must call this unavailable, not broken or confirmed.
- Browser locale/time zone must not change displayed appointment meaning.
- Stale availability is advisory; the booking API remains authoritative.
- Calendar invitation request/delivery is separate from appointment
  confirmation.
- Do not place raw contact data in URLs, storage, logs, analytics, error text, or
  confirmation output.
- Do not create a second service catalog or trust query/API presentation fields
  over the server-owned catalog.
- Other work may exist in the worktree. Do not revert unrelated edits.
- Do not commit, push, deploy, provision services, store credentials, or modify
  Google.

## Validation

After implementation has settled:

- Run focused booking client/state tests once.
- Run the combined booking suite once.
- Run `pnpm lint` once.
- Run `pnpm build` once.
- Run `git diff --check`.
- Do not run browser, screenshot, Playwright, viewport, animation, or interaction
  validation.
- Record rendered appearance and interaction as awaiting owner verification.
- Rerun only a check invalidated by a subsequent runtime fix.

## Completion notes

- Transition: complete at 2026-07-23T14:20:46.497Z
- Validation: Owner approved Phase 4 in-thread after reviewing the booking UI and navigation refinements; static validation previously passed with 73 tests, lint, and production build.
- Approved by: owner

- Transition: start at 2026-07-23T12:52:45.948Z

To be filled by the implementer and fixer with:

- files changed
- UX, accessibility, state, language, and API-client decisions
- exact focused/combined test, lint, build, and diff evidence
- unresolved owner/external decisions
- rendered criteria awaiting owner verification
- reviewer findings and their disposition

### Implementation notes (2026-07-23)

- Added `/booking`, `BookingExperience`, bilingual replaceable booking copy,
  strict injected-fetch browser client, and pure flow helpers/tests. The UI is
  Macedonian-first through the existing memory-only provider; catalog IDs,
  prices, and durations come from the shared catalog, while localized names map
  only by trusted ID. All displayed appointments use `Europe/Skopje`.
- The flow aborts superseded availability reads, treats aborts silently, rejects
  malformed/non-public envelopes, disables parallel submissions, reuses an
  opaque idempotency key only for an identical payload, and rotates it after a
  material change. A `409` clears only the selected slot, retains contact data,
  returns to appointment selection, and refreshes availability. Confirmation
  exposes only service, time, and invitation disposition.
- Homepage service rows now link by trusted service ID, Contact includes online
  booking, and the persistent action is Book while the confirmed telephone link
  remains directly available. The route uses semantic fieldsets/labels/live
  status, keyboard radio groups, focus movement, Back actions, visible focus,
  no-JavaScript, empty/error/unavailable phone fallbacks, and no new motion.
- Owner/external choices remain: Phase 5 policy/providers, Google setup,
  mandatory email, privacy/retention, monitoring, hosting, and activation.
  The normal default API `503` is honestly presented as unavailable; no runtime
  demo or live-success claim was introduced. Rendered layout, focus movement,
  responsive appearance, and interaction remain awaiting owner verification
  under the conservative policy.
- Validation evidence: focused injected client/state tests passed 4/4 with
  `node --test tests/booking/booking-client.test.mjs tests/booking/booking-flow.test.mjs`;
  combined `pnpm test:booking` passed 59/59 mock-only Node tests (with the
  pre-existing direct-route module-type warning); `pnpm lint` passed; `pnpm
  build` passed and prerendered `/booking`; and `git diff --check` passed. No
  browser, screenshot, Playwright, viewport, animation, interaction, live
  Google, credential, deployment, or provisioning validation was run.

### Review-fix notes (2026-07-23)

- Replaced the invented stale code with the Phase 3 `409 SLOT_UNAVAILABLE`
  contract. The client now exact-validates bounded JSON media/envelopes,
  canonical instants, trusted service/start/end binding, and notification
  disposition; malformed, oversized, non-JSON, or mismatched responses fail
  safely without rendering their contents.
- `/booking` now validates its initial query server-side and emits meaningful
  Macedonian no-script phone content. Availability is sequence-suppressed,
  aborts on service/date changes and unmount, and has a bounded timeout.
  Submission has validated secure idempotency generation, safe exact-payload
  retry, privacy-scrubbed confirmation state, and localized fallback states.
- Homepage service rows now enumerate `SERVICES` directly. Product and design
  text no longer characterize confirmed catalog facts or the approved booking
  direction as placeholders. `docs/agent-handoff.md` still contains stale
  authored business-truth wording and must be reconciled at the next real
  handoff boundary; it was intentionally not refreshed in this correction.
- Rendered focus, layout, no-script output, and interaction remain awaiting
  owner verification under the conservative policy.
- Review-fix evidence: focused client/flow/static tests passed with
  `node --test tests/booking/booking-client.test.mjs
  tests/booking/booking-flow.test.mjs tests/booking/booking-static-contract.test.mjs`;
  the combined mock-only suite passed 65/65; `pnpm lint`, `pnpm build`, and
  `git diff --check` passed. The combined suite retains the pre-existing Node
  module-type warning for direct ESM imports. No browser, screenshots,
  Playwright, viewport, interaction, live provider, credential, deployment, or
  provisioning checks were run.

### Post-fix review corrections (2026-07-23)

- Availability is now owned by one appointment/service/date/retry effect with
  an aborting generation gate. Service changes retain the date and automatically
  refetch for the new service; clear, step change, replacement, and unmount
  invalidate prior work without side effects inside state updaters. The client
  deadline remains active through streamed body validation.
- A Phase 3 `400 INVALID_REQUEST` availability envelope has its own localized
  invalid-date state with retry and phone fallback. Date and slot omissions now
  expose separate field associations and status focus; asynchronous availability
  and submission failures focus their status target, never loading or a generic
  heading. Confirmation disposition remains limited to requested,
  not_requested, or unknown.
- Focused tests cover public availability/submission outcome classes, stalled
  JSON-body timeout, request-gate clear/change/unmount/out-of-order semantics,
  concurrent-submit guard contract, confirmation dispositions, and static
  accessibility/no-bailout/no-script contracts. The combined booking suite,
  lint, and build remain mock/static only.
- After the production build, `.next/server/app/booking.html` was absent:
  `/booking` is correctly dynamic because it awaits the Next server
  `searchParams` contract to validate a query. Therefore no static HTML content
  assertion was claimed; the source static contract verifies Macedonian
  no-script fallback and no client search bailout. Rendered owner verification
  remains pending.
- Final post-fix evidence: focused Phase 4 tests passed; `pnpm test:booking`
  passed 69/69 mock-only tests, `pnpm lint` passed, `pnpm build` passed, the
  booking HTML artifact lookup returned `0 for 'booking.html'`, and `git diff
  --check` passed. The existing direct-ESM Node module-type warning remains
  non-failing.

### Release-safety corrections (2026-07-23)

- Step transitions now focus their respective stable service, appointment, or
  contact target without moving focus on initial load or loading. A stale-slot
  rollback focuses its live stale message; success and actionable errors retain
  their dedicated focus paths.
- External aborts remain `aborted` even after response headers when a body is
  stalled. Effect cleanup aborts and disposes the availability generation gate,
  preventing an unmounted late result from writing state. A synchronous
  submission gate now blocks same-render re-entrant POST attempts before key
  creation and releases in `finally`.
- Final release-safety evidence: focused tests passed; `pnpm test:booking`
  passed 71/71 mock-only tests, `pnpm lint` passed, `pnpm build` passed, and
  `git diff --check` passed.

### Owner UI correction pass (2026-07-23)

- Reworked `BookingExperience` into a contained editorial booking surface with
  visible warm control boundaries, generous targets, immediate hover changes,
  and consistent focus-visible rings. Service and appointment choices retain
  native radios while presenting as semantic selectable cards; selected states
  use a brown/blush marker, surface, and localized selected announcement.
- Replaced the inert numbered step list with a single accessible `Step n of 3 —
  Label` progress treatment and advancing track. Appointment/contact steps now
  include a structured selected-service summary (name, duration, price, marker)
  and a Change service action that preserves safe date/contact state.
- Date selection remains a native date input but now has a full-width warm field,
  calendar icon, helper copy, pointer affordance, and explicit invalid/loading
  treatment. Continue/Confirm, Back, Change, Retry, and language controls are
  separated action buttons with responsive gaps and disabled/loading semantics.
- Updated bilingual booking copy for progress, service summary, date guidance,
  and contact-step headings while keeping the catalog and reviewed flow/API
  behavior unchanged. Rendered visual acceptance remains owner verification
  under conservative policy.

### Owner geometry and language correction (2026-07-23)

- Replaced the remaining sharp booking rectangles with a coherent softened
  geometry: a rounded main surface and progress panel, generously rounded
  service cards and selected-service summary, rounded date/contact inputs and
  notices, pill-shaped appointment choices, and pill primary/secondary actions.
- Strengthened the chosen service card with a rounded blush surface, accent
  border, check marker, and shadow so selection is not communicated by text
  weight alone.
- Removed the duplicate booking-page language picker. The route now only
  consumes the global in-memory language selected from the homepage, as required
  by the owner.
- No booking state, API, privacy, SSR, stale-slot, focus, or submission behavior
  changed. Rendered geometry remains awaiting owner verification.

### Shared navigation correction (2026-07-23)

- Extracted the homepage bar into `SiteNavigation` and placed it on all current
  customer-facing page compositions. Homepage, `/typography`, and `/booking`
  use the bottom placement; Lookbook uses the same bar at the top.
- Removed Lookbook's duplicate language, Services, Studio, and Call utility
  controls while preserving its arrow-only Studio return action as the leading
  control in the shared top bar. Lookbook is represented as the current item
  while its gallery-specific disclosure and progress footer remain.
- Kept language switching exclusive to the homepage bar. Booking and Lookbook
  consume the visit-global language without introducing duplicate pickers.
- Updated the durable navigation contract and repository ownership map.
  Responsive placement and overlap remain awaiting owner verification.
- Added the same leading Studio return control to Booking and Lookbook. The
  shared control now uses one SVG arrow so it is geometrically centered inside
  its rounded target in both top and bottom placements.
