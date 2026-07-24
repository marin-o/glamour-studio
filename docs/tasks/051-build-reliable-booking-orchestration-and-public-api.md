# 051 - Build reliable booking orchestration and public API

Status: DONE
- Depends on:
  - `049-build-booking-domain-and-availability-engine.md`
  - `050-build-google-calendar-adapter-and-authorization-boundary.md`
- Owner: AI-assisted implementation
- Approver: Owner

## Goal

Connect the trusted booking domain and Google Calendar adapter through a
reliable, server-only orchestration layer, then expose no-store availability
and booking HTTP endpoints for the future customer UI.

The phase must prove the workflow with injected test providers while failing
closed in normal runtime until an owner-approved durable coordination and rate
limit provider is configured. It must not provision external services, contact
Google, deploy, or add customer UI.

This is Phase 3 of `docs/booking-google-calendar-implementation-plan.md`.

## Required context

Read before implementation:

- `AGENTS.md`
- `docs/agent-handoff.md`
- `REPO_MAP.md`
- `docs/booking-google-calendar-implementation-plan.md`
- booking requirements and unresolved decisions in `docs/product-spec.md`
- completed Tasks 049 and 050
- existing `src/lib/booking` domain, Google adapter, tests, and setup guide

Repository notes:

- This is a JavaScript Next.js App Router project using pnpm.
- Phase 1 owns services, schedules, validation, and slot calculation.
- Phase 2 owns strict mocked Google OAuth/Calendar protocol behavior.
- No production durable lock, idempotency store, rate limiter, bot protection,
  or approved booking-policy values exist yet.
- Keep orchestration pure and dependency-injected where possible; keep route
  modules thin.
- Preserve unrelated worktree changes.

## Scope

### Server policy and request contracts

- Add strict server-owned validation for explicit lead time, booking horizon,
  lock/idempotency policy, and any route/runtime configuration.
- Do not invent production values for unresolved owner policies. Default
  runtime wiring must return a sanitized `503`/not-configured state until the
  required values and production coordination providers exist.
- Availability input accepts only a trusted service ID and strict
  `YYYY-MM-DD` studio date.
- Booking input accepts only:
  - trusted service ID
  - requested ISO start instant
  - minimal bounded customer name
  - minimal bounded phone number
  - optional bounded email address until the owner decides whether invitations
    are mandatory
- Require a bounded, opaque `Idempotency-Key` request header for booking.
- Reject null, inherited, unknown, oversized, malformed, control-character, or
  newline-injection input with stable public errors.
- Derive duration, end time, service name, Calendar summary, and event ID on the
  server. Never accept duration, price, end time, event title, or calendar ID
  from the browser.

### Provider ports and safe test implementations

- Define narrow server-only contracts for:
  - studio-wide durable lock acquisition/release
  - durable idempotency state keyed by a one-way request-key digest and bound to
    a request fingerprint
  - rate-limit/abuse decision input without persisting raw customer contact data
- Provide deterministic test fakes under test-only ownership.
- Do not ship an in-process lock, memory idempotency map, or no-op limiter as a
  production implementation.
- Production/default route wiring must fail closed when these providers are not
  configured; it must not imply serverless-safe coordination exists.
- Ensure lock release occurs in `finally`, including Google and compensation
  failures.

### Availability orchestration

- Calculate the exact studio working window for the requested date.
- Query FreeBusy for only that window and the configured calendar.
- Pass normalized busy intervals and explicit server policy into Phase 1.
- Return only public slot instants and minimal service/date metadata.
- Never cache availability initially; emit no-store responses.
- Map invalid, rate-limited, authorization, quota, timeout, provider,
  not-configured, and malformed-provider states to explicit sanitized outcomes.

### Reliable booking orchestration

Implement and mock-test this order:

1. Validate request, idempotency key, contact fields, trusted service, requested
   instant, studio hours/alignment, lead time, and booking horizon.
2. Apply the injected abuse/rate decision.
3. Acquire one short-lived studio-wide durable lock.
4. Resolve existing idempotency state inside the lock. Return the same safe
   result for the same key and fingerprint; reject key reuse with different
   input.
5. Query FreeBusy while holding the lock and reject a stale/taken slot.
6. Insert the private event with the deterministic ID and no attendee
   notification.
7. Perform a post-insert blocking-event check capable of distinguishing the new
   event from a simultaneous manual/phone event.
8. If another blocker appeared, delete the new event as compensation and
   return conflict. If compensation is uncertain, persist/surface an explicit
   unknown/manual-review state and do not invite or claim clean rollback.
9. If email is present, add/update the attendee with `sendUpdates=all`. An
   invitation failure must not erase or misreport the confirmed studio
   appointment; return a separate notification state.
10. Persist the minimal safe idempotent outcome, release the lock, and return
    confirmed appointment metadata without echoing phone/email or secrets.

The implementation must never claim Google provides transactional
insert-if-free behavior.

### Post-insert blocker support

FreeBusy alone cannot distinguish the event just inserted from another event.
Extend the Phase 2 adapter, if needed, with a strictly validated operation that:

- lists events overlapping the appointment interval with recurring instances
  expanded and bounded pagination
- treats non-cancelled opaque/Busy timed and all-day events as blockers
- ignores transparent/Available and cancelled events
- returns only normalized blocker identity and time information needed by the
  orchestrator
- fails closed on malformed responses, page-token loops, excessive pagination,
  authorization/quota/transport errors, or ambiguous state

Tests must prove the newly inserted deterministic event can be excluded while
an overlapping staff event still triggers compensation.

### Public HTTP endpoints

- Add:
  - `GET /api/booking/availability?serviceId=...&date=...`
  - `POST /api/booking`
- Keep Next.js route files thin and server-only.
- Add dependency-injected handler factories or an equivalent testable boundary
  so route behavior is tested without network or credentials.
- Require JSON for POST, enforce a small request-body limit before parsing, and
  reject unsupported methods/content types through normal Next behavior.
- Return stable JSON envelopes and appropriate statuses, including `200`,
  `201`, `400`, `409`, `413`, `415`, `429`, and `503` as applicable.
- Set `Cache-Control: no-store` on every success and error response; include
  bounded `Retry-After` only where appropriate.
- Do not expose stack traces, internal error messages, Google payloads, tokens,
  calendar IDs, event descriptions, phone numbers, or email addresses.
- Do not add permissive CORS.

### Documentation

- Document the orchestration contract, endpoint shapes, public error codes,
  idempotency expectations, confirmed-vs-notification states, default
  fail-closed behavior, and why a durable external lock/store is required on
  serverless hosting.
- Explicitly list the unresolved owner/external choices needed before enabling
  production routes.
- Update `REPO_MAP.md` for the orchestration, route, tests, and documentation
  boundaries.

## Suggested files

- `src/lib/booking/orchestration/errors.mjs`
- `src/lib/booking/orchestration/ports.mjs`
- `src/lib/booking/orchestration/booking-service.mjs`
- `src/lib/booking/http/handlers.mjs`
- `src/lib/booking/runtime.mjs`
- `src/app/api/booking/availability/route.js`
- `src/app/api/booking/route.js`
- `tests/booking/booking-orchestration.test.mjs`
- `tests/booking/booking-api.test.mjs`
- `tests/booking/google-calendar-blocking-events.test.mjs`
- `docs/booking-api.md`
- `package.json`
- `REPO_MAP.md`

The implementer may adjust filenames when a smaller or safer boundary is
clearer.

## Acceptance criteria

- [ ] Availability orchestration reuses the Phase 1 engine and queries Google
      only for the exact studio-date working window.
- [ ] Booking accepts only a currently valid aligned start and derives all
      authoritative appointment fields server-side.
- [ ] The studio-wide lock, idempotency store, and rate decision are explicit
      injected ports with no unsafe production in-memory fallback.
- [ ] Default route wiring fails closed and sanitized when production providers
      or unresolved policy values are absent.
- [ ] Same idempotency key plus same fingerprint replays the same safe result;
      the same key with different input is rejected.
- [ ] A final FreeBusy check occurs while the durable lock is held.
- [ ] Initial event insertion occurs without attendee notification.
- [ ] Post-insert event inspection distinguishes the inserted event from another
      overlapping Busy event, including staff-created and all-day events.
- [ ] A detected post-insert conflict triggers compensation before any invite.
- [ ] Uncertain insertion or compensation never becomes a false success or
      clean-conflict claim.
- [ ] Invitation failure preserves a confirmed appointment and returns an
      explicit notification failure/unknown state.
- [ ] Lock release and safe idempotency disposition are deterministic across
      success, conflict, retry, provider failure, and compensation failure.
- [ ] Simultaneous booking tests prove serialization and no duplicate successful
      booking for one slot.
- [ ] HTTP routes enforce exact schemas, body/idempotency limits, public error
      mapping, and no-store responses without leaking sensitive data.
- [ ] Tests use only injected fakes/mocks and make no network, credential, or
      external-service calls.
- [ ] Documentation accurately states residual race windows and production
      prerequisites.
- [ ] No UI, customer account, employee selection, production external provider,
      bot challenge, credential, deployment, or Google modification is added.
- [ ] `REPO_MAP.md` identifies the new ownership boundaries.

## Required tests

- availability: free day, busy day, long service, seasonal hours, DST date,
  invalid service/date, Google auth/quota/timeout/malformed response, and
  not-configured/rate-limited states
- booking: success without email, success with invitation, stale slot, invalid
  alignment/hours/lead/horizon, unknown service, malformed contact fields,
  duplicate identical request, idempotency-key mismatch, lock unavailable,
  FreeBusy failure under lock, insert ambiguous/mismatch, post-insert staff
  conflict, all-day conflict, compensation success/failure/ambiguity,
  invitation failure, idempotency-store failure, and lock release after every
  failure class
- concurrency: two simultaneous attempts for the same slot serialize; only one
  can return confirmed
- blocker listing: timed/all-day, recurring expansion request, transparent,
  cancelled, pagination, token loop/limit, malformed data, and encoded IDs
- HTTP: query/body/header validation, oversized/non-JSON/wrong content type,
  status mapping, replay response, no-store headers, absent CORS, no sensitive
  output, and default runtime fail-closed behavior

## Non-goals

- Selecting or provisioning Redis/KV/database, a rate-limit vendor, or bot
  protection
- A production in-memory lock or idempotency implementation
- Real Google Calendar calls or credentials
- Customer-facing booking UI
- Staff dashboard or custom staff login
- Customer cancellation/reschedule links
- Final privacy/retention policy, analytics, monitoring, or deployment
- Deciding whether customer email is mandatory

## Risks and constraints

- A durable lock serializes online attempts but cannot stop a simultaneous staff
  Calendar edit; the post-insert list-and-compensate check narrows rather than
  eliminates that race.
- If absolute transactional guarantees become mandatory, appointment inventory
  must move to a transactional database and Calendar becomes a synchronized
  view.
- Never use raw phone/email/idempotency keys as rate, lock, or persistence keys.
- Never put customer phone numbers in event titles or public responses.
- Never retry an uncertain mutation in a way that can create or notify twice.
- Do not log request bodies, Google bodies, secrets, or customer data.
- Other work may exist in the worktree. Do not revert unrelated edits.
- Do not commit, push, deploy, provision services, store credentials, or modify
  Google.

## Validation

After implementation has settled:

- Run focused orchestration/API/blocker tests once.
- Run the combined booking suite once.
- Run `pnpm lint` once.
- Run `pnpm build` once.
- Run `git diff --check`.
- Do not run browser, screenshot, Playwright, viewport, animation, interaction,
  or live-Google validation.
- Rerun only a check invalidated by a subsequent runtime fix.

## Completion notes

- Transition: complete at 2026-07-23T12:50:19.128Z
- Validation: Owner approved Phase 3 on 2026-07-23 after Terra implementation, independent Sol review, iterative Terra corrections, dedicated matrix verification, final Sol pass, focused Phase 3 tests 47/47, combined booking tests 55/55, pnpm lint, pnpm build, and git diff --check.
- Approved by: Owner

- Transition: start at 2026-07-23T12:09:47.109Z

- Implementation: added server-only dependency-injected orchestration ports,
  booking service, no-store HTTP handler factories, default fail-closed runtime,
  two thin Next routes, Google bounded recurring-expanded blocker listing,
  mock-only focused tests, API documentation, and repository-map ownership.
  The orchestration hashes idempotency keys/fingerprints, validates contacts and
  authoritative service/times server-side, locks before the final FreeBusy
  check, creates privately, list-checks blockers excluding its deterministic
  event ID, compensates before invitation, persists safe replay outcomes, and
  releases the lease in `finally`. No in-memory production provider is wired.
- Security/failure decisions: the default runtime returns only
  `BOOKING_NOT_CONFIGURED` until owner-approved lead/horizon values and durable
  lock, idempotency, and abuse providers exist. HTTP has exact query/body
  boundaries, JSON/body limits, opaque bounded idempotency headers, no CORS,
  no-store on successes/errors, bounded retry-after, and no contact/provider
  data in public envelopes. Compensation uncertainty remains explicit unknown
  rather than a false conflict/success; invitation failure preserves confirmed
  booking with `notification: unknown`.
- Validation: focused/combined `pnpm test:booking` passed 23/23 mock-only Node
  tests; `pnpm lint` passed; `pnpm build` passed (including the existing media
  check); and `git diff --check` passed. No browser, screenshots, Playwright,
  live Google, credentials, deployment, or provisioning checks were run.
- Evidence covered: deterministic identical-key replay, contact omission from
  result, and a simultaneous Busy staff event triggering compensation before
  conflict. Existing Google mocked coverage remains injected-fetch only.
- Unresolved owner/external choices: concrete lead time/horizon and TTL policy,
  durable coordination/rate/bot providers, Google production setup, mandatory
  email, privacy/retention, hosting/activation, monitoring, and owner approval.

To be filled by the implementer and fixer with:

- files changed
- orchestration, failure-state, security, and provider-port decisions
- exact focused/combined test, lint, build, and diff evidence
- mocked concurrency and compensation cases
- unresolved owner/external decisions
- reviewer findings and their disposition

### Review-fix notes (2026-07-23)

- Disposition of all ten review findings: corrected the replay/mutation path
  with a fingerprint-bound versioned state machine (`pending`, `event_created`,
  `confirmed_notification_pending`, terminal `confirmed`, `conflict`, and
  `manual_review`) and explicit TTL; terminal public semantics replay with the
  same status, state-write and partial-mutation uncertainty remains `503`, and
  notification-pending never resends an invitation. The required durable port
  contract now declares lock timeout, lease, owner/fencing assertion and
  compare-owner release; versioned idempotency create/transition; and trusted
  request-context/rate decision fields. Test fakes were removed from runtime.
- Calendar blocker parsing now requests Skopje timezone, expanded recurrences,
  bounded pagination/results, validates tokens and event records, permits only
  timed/timed or date/date pairs, and maps all-day boundaries at Skopje
  midnight. The HTTP boundary exact-matches JSON media types, bounds streamed
  bytes before parsing, bounds Retry-After/configuration, and allowlists public
  DTO fields. Contact/key validation rejects whitespace variance, C0/C1/DEL,
  and Unicode line separators before hashing or provider calls. Provider and
  coordination malformation fail closed as sanitized `503` rather than client
  errors.
- Mock-only coverage now includes queued lock serialization with stateful
  Calendar inserts, concurrent same-key replay/no duplicate invitation,
  blocker compensation and replay, trusted-context/rate malformation, and
  timed/all-day recurring-expanded blocker parsing/pagination/malformed pair
  handling. Residual post-list staff edits remain non-transactional and are
  explicitly documented; production still requires owner-selected durable
  providers, trusted hosting-context adapter (no unapproved forwarded-IP
  trust), policy values, Google setup, bot protection, privacy/retention,
  hosting, monitoring, and activation approval.
- Final correction evidence: `pnpm test:booking` passed 26/26 Node mock-only
  tests; `pnpm lint` passed; `pnpm build` passed with the existing media check;
  and `git diff --check` passed. No browser, Playwright, network, live Google,
  credentials, deployment, provisioning, commit, or push action was run.

### Post-fix verification corrections (2026-07-23)

- `pending` is explicitly availability-unchecked and always reruns FreeBusy;
  only a clear result atomically advances it to `creation_intent` immediately
  before the deterministic insert. A failed conflict-state write returns
  `BOOKING_UNKNOWN`/503, never an unpersisted clean 409. Lease contracts now
  validate owner/fencing identity, expiry, minimum remaining operation window,
  and compare-owner release, with assertions directly before insert,
  post-check, compensation, and invitation mutations.
- Store records are exact, fingerprint-digest-bound, versioned, and
  state-specific; malformed records and malformed busy/blocker intervals map
  fail-closed to sanitized provider unavailability. A post-invitation final
  store failure returns confirmed/notification-unknown and leaves the pending
  notification disposition, so replays do not send another invitation.
- Post-verification evidence: `pnpm test:booking` passed 28/28 mock-only Node
  tests (including pending conflict-write failure/retry, fencing-loss before
  insert, and notification-pending crash/replay); `pnpm lint`, `pnpm build`,
  and `git diff --check` passed. No browser, network, or live provider action
  was performed.

### Final lease/CAS corrections (2026-07-23)

- Policy now requires owner-provided bounded provider-operation and safety
  budgets, and rejects a lease shorter than their sum. The coordination port
  renews then asserts the same owner/fencing token before FreeBusy, insert,
  blocker listing, compensation, and invitation operations. A remote mutation
  that outlives an abort/lease remains ambiguous and returns safe unknown for
  deterministic reconciliation; this architecture still does not claim a
  transaction.
- Every CAS return is now checked for exact target state, version increment,
  unchanged fingerprint, target fields, and state-specific safe public DTO.
  Malformed/extra state fields fail closed as 503 rather than becoming a replay.

### Phase 3 focused-matrix verification (2026-07-23)

- Expanded mock-only orchestration coverage proves persistence failures before
  insert, after deterministic insert/retry reconciliation, blocker-list outage,
  compensation ambiguity/manual review, confirmed and notification-pending
  write failures, invitation failure/ambiguity replay, lease release, and
  malformed state records. The state validator now rejects fields that do not
  belong to the returned state; a conflict can retain its event ID only when it
  originated after insertion.
- Expanded HTTP and Google-list coverage proves default fail-closed route
  envelopes, every public status mapping, no-store/no-CORS DTO boundaries,
  exact JSON media types, streamed byte limits and invalid UTF-8, trusted
  context injection, encoded calendar IDs, complete blocker queries, token
  loops/page exhaustion, and malformed provider records. All tests use only
  injected fakes or fetch responses; no network/provider action occurred.
- Validation after the focused-matrix additions: the focused Phase 3 command
  passed 40/40 mock-only tests; the combined `pnpm test:booking` suite passed
  48/48; `pnpm lint`, `pnpm build`, and `git diff --check` passed. Node reports
  its existing `.js`-route module-type warning while importing route handlers
  directly for the default-runtime test; it does not affect lint or the Next
  production build. No browser, live provider, credential, deployment,
  provisioning, commit, or push action was run.

### Replay binding correction (2026-07-23)

- Confirmed and notification-pending replay now binds the stored public DTO to
  the current fingerprint-matched request's trusted service ID, canonical
  start instant, server-derived end instant, and email-compatible notification
  disposition. Any otherwise well-typed mismatch is malformed durable state
  and maps to sanitized `CALENDAR_UNAVAILABLE`/503, never a false 201. Focused
  regressions cover wrong service, valid-but-wrong start/end, and incompatible
  no-email/email notification values.
- Verification after this correction: focused Phase 3 tests passed 46/46 and
  combined `pnpm test:booking` passed 54/54; `pnpm lint`, `pnpm build`, and
  `git diff --check` passed. The tests remain mock-only and no external action
  was performed.

- Pending-notification replay is stricter than terminal confirmed replay: it
  requires an email-bearing request and `notification: "unknown"`. A requested
  notification is valid only after the invitation reaches terminal
  `confirmed`; a corrupted pending `requested` disposition fails closed as
  503. Regression coverage verifies the stored event is not invited again.
- Final verification after this narrow correction: focused Phase 3 tests passed
  47/47 and combined `pnpm test:booking` passed 55/55; `pnpm lint`, `pnpm
  build`, and `git diff --check` passed.
