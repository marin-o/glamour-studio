# 049 - Build booking domain and availability engine

Status: DONE
- Depends on: None
- Owner: AI-assisted implementation
- Approver: Owner

## Goal

Create the pure, server-owned booking domain that deterministically calculates
valid appointment starts from the confirmed studio rules and supplied busy
intervals. This phase must not connect to Google, persist bookings, expose
routes, or build customer UI.

This is Phase 1 of `docs/booking-google-calendar-implementation-plan.md`.

## Required context

Read before implementation:

- `AGENTS.md`
- `docs/agent-handoff.md`
- `REPO_MAP.md`
- `docs/booking-google-calendar-implementation-plan.md`
- the booking requirements in `docs/product-spec.md`

Repository notes:

- This is a JavaScript Next.js App Router project using pnpm.
- There is currently no booking runtime, test runner, Google integration,
  database, or locking system.
- Keep the domain under a clear server-owned boundary such as
  `src/lib/booking`.
- Prefer the smallest deterministic test mechanism that fits the existing
  project.
- Preserve unrelated worktree changes.

## Scope

- Define immutable records for exactly the ten confirmed services, each with a
  stable identifier, owner-confirmed English name, display-only price label,
  and duration in minutes.
- Define the studio rules:
  - time zone `Europe/Skopje`
  - open every day
  - April through September: `06:00–18:00`
  - October through March: `10:00–18:00`
  - appointment starts aligned to 30-minute increments
- Add strict service lookup and input validation for local dates and busy
  intervals.
- Build a pure availability engine that:
  - derives the correct local working window for a requested studio date
  - normalizes overlapping, duplicate, and adjacent busy intervals
  - returns only aligned starts where the complete service fits before closing
  - treats interval starts as inclusive and ends as exclusive
  - handles full-day blocking, boundary crossings, and exact closing times
  - converts correctly between `Europe/Skopje` local time and ISO instants,
    including daylight-saving transitions
- Allow lead-time or booking-horizon constraints only as explicit optional
  inputs. Do not invent production values.
- Add deterministic automated tests for the booking domain.
- Document the new ownership boundary in `REPO_MAP.md`.

## Suggested files

- `src/lib/booking/services.js`
- `src/lib/booking/studio-rules.js`
- `src/lib/booking/availability.js`
- `src/lib/booking/index.js`
- `tests/booking/availability.test.mjs`
- `package.json`
- `REPO_MAP.md`

The implementer may adjust filenames when a smaller or safer module boundary is
clearer, but must keep the phase isolated from UI, routes, and Google code.

## Acceptance criteria

- [ ] Exactly the ten confirmed services are represented with stable IDs,
      display price labels, and durations of 30, 60, 90, 240, or 300 minutes as
      applicable.
- [ ] Seasonal daily hours are selected from the requested
      `Europe/Skopje` calendar date.
- [ ] Returned starts are 30-minute aligned and include only appointments whose
      full duration fits within the working window.
- [ ] Supplied busy intervals remove every overlapping candidate without
      removing an appointment that begins exactly when a busy interval ends.
- [ ] Results are deterministic ISO instants with the correct Skopje UTC offset
      across standard time and daylight-saving time.
- [ ] Invalid dates, unknown services, malformed intervals, and intervals whose
      end is not after their start fail explicitly.
- [ ] Any lead-time or booking-horizon behavior is caller-supplied and has no
      invented default policy.
- [ ] Automated tests cover every service duration, both seasonal schedules,
      free days, partial conflicts, full-day blocking, duplicate/adjacent/
      overlapping intervals, opening and closing boundaries, and DST-relevant
      dates.
- [ ] No Google API, OAuth, route handler, customer UI, persistence, distributed
      lock, credential, or external service is added in this phase.
- [ ] `REPO_MAP.md` identifies the booking-domain ownership boundary.
- [ ] Unresolved production-policy decisions remain explicit rather than being
      silently encoded.

## Non-goals

- Google Calendar authentication, free/busy queries, or event creation
- API routes or customer-facing booking components
- Persistence, idempotency storage, distributed locking, rate limiting,
  CAPTCHA, email, or SMS
- Choosing production lead time, booking horizon, cancellation policy, or
  customer-data retention
- Deployment, Google configuration, or external provisioning

## Risks and constraints

- Do not hand-roll time-zone arithmetic if it cannot be made demonstrably
  correct. A small focused dependency is acceptable only when justified by the
  task and kept out of unrelated runtime surfaces.
- Parse requested studio dates strictly as calendar dates; do not rely on
  environment-local date parsing.
- Do not invent translated service names or operational policy.
- Other work may exist in the worktree. Do not revert unrelated edits.
- Do not commit, push, deploy, or modify Google.

## Validation

After implementation has settled:

- Run the focused booking-domain test command once.
- Run `pnpm lint` once.
- Run `pnpm build` once.
- Do not run browser, screenshot, Playwright, viewport, animation, or interaction
  validation under the repository's conservative validation policy.
- Rerun only a check invalidated by a subsequent runtime fix.

## Completion notes

- Transition: complete at 2026-07-23T11:39:13.825Z
- Validation: Owner approved Phase 1 on 2026-07-23 after Terra implementation, independent Sol review, Terra correction pass, passing pnpm test:booking (8/8), pnpm lint, pnpm build on Next 16.2.10, and git diff --check.
- Approved by: Owner

- Transition: start at 2026-07-23T09:38:48.374Z
- Implementation files: `src/lib/booking/services.mjs`,
  `src/lib/booking/studio-rules.mjs`, `src/lib/booking/availability.mjs`, and
  `src/lib/booking/index.mjs`; focused coverage in
  `tests/booking/availability.test.mjs`; `package.json`, `pnpm-lock.yaml`, and
  `REPO_MAP.md` updated for the test command, Temporal dependency, and the new
  ownership boundary.
- Design/dependency decision: the pure domain uses
  `@js-temporal/polyfill` for strict calendar-date parsing and
  `Europe/Skopje` local-time/ISO-instant conversion, including DST. This avoids
  environment-local parsing and hand-written timezone arithmetic. The engine
  has no provider, route, persistence, UI, credential, or external-service
  dependency. `constraints.now` is deliberately mandatory whenever the caller
  requests `leadTimeMinutes` or `bookingHorizonDays`; no production lead time
  or horizon is encoded.
- Reviewer follow-up (2026-07-23): resolved all reported findings. The public
  `index.mjs` facade now imports `server-only`, while direct imports of the
  pure modules retain deterministic Node-test coverage. Availability requests
  and busy intervals now accept only exact own-key plain-object schemas;
  inherited records, unknown fields, non-array busy input, and non-string
  endpoints fail explicitly. Regression coverage now asserts all ten complete
  catalog records; seasonal month edges; closing-side conflicts; malformed,
  inherited, and unknown schemas; negative/fractional constraints; and local
  horizon equality. The duplicate `Status: TODO` metadata line was removed.
- Lockfile decision (2026-07-23): restored the tracked pre-task production
  resolutions for Next 16.2.10, React/React DOM 19.2.7, browser data, SWC, and
  Nano ID. Retained only the direct Phase 1 dependency additions:
  `@js-temporal/polyfill` with `jsbi`, and `server-only` for the public server
  boundary.
- Validation (2026-07-23, post-review fixes): `pnpm test:booking` passed 8/8
  Node tests; `pnpm lint` passed; `pnpm build` passed with Next.js 16.2.10 and
  the existing Lookbook media check. No browser, screenshot, Playwright,
  viewport, animation, or interaction validation was run under the
  conservative policy. The task remains in progress pending owner completion
  approval.
- Unresolved owner decisions remain explicit: production lead time, booking
  horizon, cancellation policy, required customer email, Google account and
  calendar, locking provider, bot protection, privacy/retention policy, and
  hosting. The dependency install refreshed the existing floating `latest`
  Next/React lockfile resolutions; package manifest specs remain unchanged.
