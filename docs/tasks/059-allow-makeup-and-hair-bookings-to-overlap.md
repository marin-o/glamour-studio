# Allow makeup and hair bookings to overlap

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Allow one makeup appointment and one hair appointment to occupy the same time
because separate employees provide those service groups, while preventing two
makeup appointments or two hair appointments from double-booking their shared
employee.

## Current repo notes

- The booking system currently derives availability from one undifferentiated
  busy-interval stream and coordinates accepted bookings atomically.
- Makeup is the only makeup-track service. All other confirmed services are
  hair-track services unless the owner later changes the catalogue.
- Review posture: `adversarial`. This changes concurrency and race-sensitive
  availability/booking coordination, which is an automatic hard trigger.
- Existing fail-closed behavior, idempotency, rate limiting, customer privacy,
  Google Calendar invitations, stable service IDs, prices, and durations must
  remain intact.

## Scope

- Introduce one authoritative service-to-work-track classification for `makeup`
  and `hair`.
- Make availability and booking conflict checks track-aware end to end.
- Permit cross-track overlap but reject same-track overlap, including concurrent
  booking attempts.
- Preserve a conservative conflict rule for legacy or unclassified external
  calendar events unless the existing provider model offers a safer explicit
  mapping.
- Update provider-neutral contracts, local/production coordination, Google
  Calendar integration, documentation, and deterministic tests only as needed.
- Keep review corrections and tuning in this task until the outcome is accepted.

## Suggested files

- `src/lib/booking/services.mjs`
- `src/lib/booking/availability.mjs`
- `src/lib/booking/orchestration/`
- `src/lib/booking/google/`
- `src/lib/booking/local/coordination.mjs`
- `src/lib/booking/production/`
- `src/lib/booking/http/handlers.mjs`
- `tests/booking/`
- `docs/booking-api.md`

## Acceptance criteria

- [x] A makeup booking and a hair booking can be accepted for overlapping time
  ranges without either hiding the other's availability.
- [x] Two overlapping makeup bookings cannot both be accepted.
- [x] Two overlapping hair bookings cannot both be accepted.
- [x] The same rules hold under concurrent requests, not only sequential checks.
- [x] Existing or unclassified calendar busy time fails safely rather than
  silently permitting an ambiguous double booking.
- [x] Stable service IDs, prices, durations, post-service buffers, booking
  validation, idempotency, rate limiting, and invitation behavior remain
  unchanged unless a documented integration requirement makes a minimal change
  necessary.
- [x] Provider and public API contracts document any track-aware shape changes.
- [x] Required owner decisions remain explicit rather than invented.

## Non-goals

- Staffing schedules beyond the two confirmed work tracks, employee selection,
  variable per-track capacity, rota management, or UI redesign.
- Deployment, production secret changes, live booking writes, or pushing Git
  commits.

## Validation

- Run the focused booking test suites that cover availability, orchestration,
  HTTP contracts, coordination, Google Calendar behavior, and client behavior.
- Run targeted ESLint on changed source/test files and one production build if
  runtime/provider composition changes.
- Run `git diff --check` after task evidence is final.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Do not substitute every static check for unavailable rendered validation. Leave rendered criteria awaiting owner verification when necessary.
- Task, evidence, and handoff-only edits do not invalidate successful runtime checks.

## Completion notes

- Transition: complete at 2026-08-22T00:12:27.749Z
- Validation: Work-track-aware booking passed 78 focused post-review tests and the final production build; adversarial review finding was corrected; full suite retains two documented unrelated stale contract failures.
- Approved by: Owner

- Transition: start at 2026-08-21T23:45:55.107Z

- Completed: Added an authoritative internal `makeup` / `hair` work-track map,
  track-aware availability and booking recovery, private Google Calendar track
  markers, conservative unknown-event handling, and same/unknown-track
  post-insert compensation. The public HTTP contract remains track-free and now
  rejects client-supplied `track` or `workTrack` fields.
- Validation: Focused post-review booking coverage passed 78/78 tests. The final
  `pnpm build` passed both media gates and production compilation. The earlier
  full booking run passed 123/125 tests; its two failures are unrelated stale
  source-contract expectations from prior SEO/media work, not task 059 behavior.
  Targeted ESLint and `git diff --check` passed in delegated implementation.
- Review: Adversarial review found one actionable fail-open classification edge
  for non-private events carrying valid-looking markers. The correction now
  requires private visibility and has regression coverage for public, default,
  and missing visibility, marker mismatch, both same-track races, cross-track
  overlap, recovery, compensation, and public-contract isolation.
- Deviations: Replaced the former Google FreeBusy read with the existing bounded,
  recurring-expanded event-list path because FreeBusy cannot expose trusted
  work-track metadata. Legacy, manual, missing-marker, invalid-marker, or
  non-private events remain `unknown` and block both tracks.
- Follow-up: No migration of legacy Calendar events was performed. Production
  deployment and live booking writes remain owner-controlled. No push was made.
