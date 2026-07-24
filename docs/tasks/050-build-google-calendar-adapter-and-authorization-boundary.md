# 050 - Build Google Calendar adapter and authorization boundary

Status: DONE
- Depends on: `049-build-booking-domain-and-availability-engine.md`
- Owner: AI-assisted implementation
- Approver: Owner

## Goal

Create a tested, server-only adapter between the booking domain and one
dedicated Google Calendar. It must support the Google operations needed by the
later reliable-booking orchestration without exposing credentials, creating
routes, contacting a real calendar, or provisioning Google resources.

This is Phase 2 of `docs/booking-google-calendar-implementation-plan.md`.

## Required context

Read before implementation:

- `AGENTS.md`
- `docs/agent-handoff.md`
- `REPO_MAP.md`
- `docs/booking-google-calendar-implementation-plan.md`
- the booking requirements and unresolved decisions in `docs/product-spec.md`
- the completed Phase 1 task and `src/lib/booking`

Repository notes:

- This is a JavaScript Next.js App Router project using pnpm.
- Phase 1 provides pure booking rules and tests under `src/lib/booking`.
- Keep Google code behind a separately identifiable server-only boundary.
- Prefer direct, narrowly scoped Google REST calls with injected `fetch` over a
  large SDK unless an SDK is demonstrably safer and its cost is justified.
- All automated tests must use mocks. No test may require network access or real
  credentials.
- Preserve unrelated worktree changes.

## Scope

### Configuration and authorization

- Define strict server-side environment validation for:
  - dedicated calendar ID
  - OAuth client ID
  - OAuth client secret
  - OAuth refresh token
- Use fixed official Google OAuth and Calendar API origins rather than
  environment-controlled endpoint URLs in production configuration.
- Implement OAuth access-token refresh with safe expiry handling and bounded
  in-memory reuse suitable for a serverless instance.
- Prevent refresh stampedes within one adapter instance where practical.
- On authorization failure, fail closed with a typed/sanitized error that never
  includes credentials, tokens, customer data, or raw response bodies.
- Recommend only the narrowest practical Calendar scopes in setup
  documentation. Customers never authenticate with Google.

### Calendar operations

Expose a small provider-neutral or Google-specific server interface sufficient
for Phase 3 to:

- query FreeBusy for the one configured calendar and return normalized
  `{ start, end }` ISO intervals
- create a private appointment event with an ID deterministically derived from
  an idempotency key using Google-compatible event-ID characters
- fetch and verify an event by deterministic ID
- add or update the customer attendee and request `sendUpdates=all`
- delete a newly inserted event as compensation, with an explicit notification
  policy

The adapter must:

- URL-encode the configured calendar and event IDs
- keep event creation separate from attendee notification so the later
  orchestrator can perform its post-insert conflict check before inviting
- treat `Busy` Calendar data as blockers through FreeBusy and never infer
  availability from event titles
- use deterministic IDs to resolve duplicate inserts and ambiguous outcomes
  without blindly creating a second event
- distinguish authentication, validation, not-found, conflict/duplicate,
  quota/rate, retryable transport/server, ambiguous mutation, and invitation
  failures through a stable sanitized error contract
- retry a rejected access token only in a bounded, safe way; do not introduce
  unbounded retries
- apply a bounded request timeout
- avoid logging secrets or customer data

### Documentation

- Add a setup document describing the later owner-operated Google Cloud/OAuth
  steps, required APIs/scopes, dedicated calendar rule, environment-variable
  names, reconnect procedure, testing-mode refresh-token expiry risk, and
  operational failure modes.
- Clearly state that this phase does not create a Google project, authorize an
  account, validate real credentials, deploy, or contact Google.
- Use placeholders only; never store example values resembling usable secrets.
- Update `REPO_MAP.md` for the adapter, tests, and setup document.

### Tests

Use injected mock responses to cover at minimum:

- valid configuration and each missing/malformed environment value
- successful token refresh, bounded token reuse, expiry refresh, concurrent
  refresh deduplication, rejected refresh, and one bounded `401` recovery
- successful FreeBusy normalization and malformed Google responses
- quota/rate errors and sanitized error output
- deterministic Google-compatible event IDs
- successful private insert with attendee notification omitted
- duplicate event ID resolved by fetching and verifying the existing event
- ambiguous insert transport/server outcomes resolved through deterministic
  event verification, plus the unresolved ambiguous case
- verification mismatch
- successful attendee update with `sendUpdates=all` and invitation failure
- compensating deletion, not-found handling, and explicit notification behavior
- URL encoding, request timeout, and proof that secrets/customer data do not
  appear in thrown errors

## Suggested files

- `src/lib/booking/google/config.mjs`
- `src/lib/booking/google/errors.mjs`
- `src/lib/booking/google/calendar-adapter.mjs`
- `src/lib/booking/google/index.mjs`
- `tests/booking/google-calendar-adapter.test.mjs`
- `docs/booking-google-calendar-setup.md`
- `package.json`
- `REPO_MAP.md`

The implementer may adjust filenames when a smaller boundary is clearer.

## Acceptance criteria

- [ ] Importing the supported Google adapter entry point from a Client
      Component is build-blocked by a `server-only` boundary.
- [ ] Configuration fails closed for absent, empty, or malformed values without
      revealing their contents.
- [ ] OAuth refresh and token reuse are bounded, concurrency-safe within an
      adapter instance, and fully mock-tested.
- [ ] FreeBusy queries only the configured calendar and return strictly
      validated normalized intervals usable by Phase 1.
- [ ] Event IDs are deterministic, stable for the same idempotency key,
      different for different keys, and valid for Google Calendar.
- [ ] Initial event insertion is private and sends no attendee notification.
- [ ] Duplicate and ambiguous insertion outcomes cannot silently create a
      second event and are resolved or surfaced explicitly.
- [ ] Event verification rejects an ID/time/content mismatch rather than
      claiming success.
- [ ] Attendee updates explicitly request Google notifications and surface
      invitation failure without erasing the underlying appointment.
- [ ] Compensating deletion has explicit, test-covered not-found and
      notification semantics.
- [ ] Errors are typed, stable, sanitized, and distinguish operationally useful
      failure classes without leaking secrets or customer data.
- [ ] All adapter tests are deterministic and use injected mocks only.
- [ ] Setup documentation is actionable but contains no credentials and makes
      all owner/external actions explicit.
- [ ] No API route, UI, database, lock provider, real network call, credential,
      Google project change, or deployment is added.
- [ ] `REPO_MAP.md` identifies the new ownership boundary.

## Non-goals

- Creating or configuring a Google Cloud project, OAuth consent screen,
  production app, calendar, or credentials
- Testing against a real Google account or Calendar API
- Public availability or booking routes
- Booking locking, idempotency persistence, rate limiting, bot protection, or
  customer form validation
- Customer-facing UI or staff UI
- Deciding whether email is mandatory
- Deployment or production activation

## Risks and constraints

- Google Calendar FreeBusy and event insertion are separate operations; this
  adapter must not claim transactional no-double-booking guarantees.
- An invitation request is not proof of delivery or calendar placement.
- A guest declining an invitation is not a booking cancellation.
- OAuth testing-mode refresh tokens may expire after seven days for sensitive
  scopes; document this operational risk.
- Do not accept arbitrary API/token origins from runtime environment variables.
- Do not return or log raw Google error payloads.
- Do not introduce general retry machinery that could duplicate mutations.
- Other work may exist in the worktree. Do not revert unrelated edits.
- Do not commit, push, deploy, provision services, or modify Google.

## Validation

After implementation has settled:

- Run the focused booking/Google adapter tests once.
- Run `pnpm lint` once.
- Run `pnpm build` once.
- Run `git diff --check`.
- Do not run browser, screenshot, Playwright, viewport, animation, interaction,
  or live-Google validation.
- Rerun only a check invalidated by a subsequent runtime fix.

## Completion notes

- Transition: complete at 2026-07-23T12:08:12.422Z
- Validation: Owner approved Phase 2 and directed progression to Phase 3 on 2026-07-23 after Terra implementation, independent Sol review, Terra correction pass, passing pnpm test:booking-google (11/11), combined pnpm test:booking (19/19), pnpm lint, pnpm build, and git diff --check; no live Google action occurred.
- Approved by: Owner

- Transition: start at 2026-07-23T11:40:46.243Z

- Implementation files: `src/lib/booking/google/config.mjs`, `errors.mjs`,
  `calendar-adapter.mjs`, and server-only `index.mjs`; focused injected-fetch
  coverage in `tests/booking/google-calendar-adapter.test.mjs`; owner setup
  guidance in `docs/booking-google-calendar-setup.md`; script and ownership-map
  entries in `package.json` and `REPO_MAP.md`.
- Protocol/security/dependency decisions: direct narrow REST calls use fixed
  official OAuth and Calendar origins, URL-encoded calendar/event IDs,
  AbortController timeouts, a single bounded 401 recovery, and in-instance
  refresh-token deduplication with expiry skew. The adapter emits stable
  sanitized `GoogleCalendarError` codes without raw Google bodies, secrets,
  tokens, or customer details. It adds no SDK or dependency. Initial inserts
  are `private` with `sendUpdates=none`; attendee PATCH requests use
  `sendUpdates=all`; compensation DELETE uses `sendUpdates=none`. Deterministic
  lower-case base32hex-compatible IDs resolve duplicate/ambiguous inserts by
  fetch-and-verify, but do not claim transactional no-double-booking.
- Mocked evidence: `pnpm test:booking-google` passed 10/10 deterministic Node
  tests covering configuration validation, refresh/reuse/expiry/deduplication,
  bounded 401 recovery, token failure, FreeBusy normalization/malformed data,
  rate and transport errors, deterministic IDs, encoded URLs, private inserts,
  duplicate/recovered/unresolved ambiguous inserts, verification mismatch,
  attendee invitation failure, compensating delete semantics, and timeout
  signal injection. Tests use injected fetch only and make no network calls.
- Validation: `pnpm test:booking-google` passed; `pnpm lint` passed; `pnpm
  build` passed on Next.js 16.2.10 (including the existing Lookbook media
  check); `git diff --check` passed. No browser, screenshot, Playwright,
  viewport, animation, interaction, live-Google, credential, deployment, or
  provisioning validation was run under the conservative policy.
- Unresolved owner/external decisions remain explicit: production Google Cloud
  project/account/calendar and consent, production OAuth verification/state,
  required customer email, lead time/horizon, durable lock, bot protection,
  privacy/retention, hosting, monitoring, and owner acceptance. Phase 2 did
  not configure or contact Google and the task remains in progress pending
  owner review/approval.

To be filled by the implementer and fixer with:

- files changed
- protocol, security, and dependency decisions
- focused test, lint, build, and diff evidence
- mocked failure cases covered
- unresolved owner/external decisions
- reviewer findings and their disposition

### Review-fix notes (2026-07-23)

- Resolved all Phase 2 review findings in the authorized Google adapter,
  injected-fetch tests, setup guide, package script, and this task note. Every
  importable Google runtime module now imports `server-only`; Node tests use the
  package `react-server` export condition explicitly via `test:booking-google`.
- FreeBusy uses strict Temporal instants, rejects per-calendar errors and
  malformed/non-JSON provider data as provider failures, and delegates sorted,
  merged interval normalization to Phase 1. The adapter uses SHA-256 derived
  Google-compatible IDs and stores only a versioned digest marker in private
  extended properties. Verification binds ID, marker, content, instants,
  private visibility, and a present non-cancelled status.
- Every insert 2xx is resolved by deterministic GET; transport, 5xx, and 409
  outcomes use the same resolver and report `AMBIGUOUS_MUTATION` for every
  inconclusive verification, including 409 plus 404. Attendee PATCH responses
  are not trusted: valid fetched attendees are case-insensitively merged and a
  follow-up GET verifies the result; unresolved notification state is explicit
  and does not assert invitation success.
- OAuth now rejects empty/fractional/unbounded token payloads, caps TTL, tracks
  token generations, joins forced refreshes, and permits only one 401 replay.
  Error classification safely inspects a bounded 403 reason allowlist without
  retaining response bodies and preserves base error codes plus operation
  context. Config schemas reject inherited/unknown fields and sanitize messages.
- Setup documents the exact event-write and FreeBusy scopes, their account-wide
  resource semantics, and the dedicated owner-controlled account model.
- Validation after these fixes: `pnpm test:booking-google` passed 11/11;
  `pnpm test:booking` passed 19/19 (Phase 1 plus Google coverage); `pnpm lint`
  and `pnpm build` passed; `git diff --check` passed. The initial shared-test
  command exposed that its broad glob loaded server-only runtime modules
  without the required Node `react-server` condition, so both booking scripts
  now declare that condition explicitly. No browser, live-Google, credential,
  deployment, or provisioning validation was run under the conservative policy.
  No production account, OAuth consent, credential, Google request, route, UI,
  persistence, lock, or deployment was added.
