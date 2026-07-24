# Booking API (Phase 3)

`GET /api/booking/availability?serviceId=<trusted-id>&date=YYYY-MM-DD` returns
`{ ok: true, availability: { serviceId, date, starts } }`. `starts` contains
only server-calculated instants. The route is `Cache-Control: no-store`.

`POST /api/booking` accepts JSON with exactly `serviceId`, `start`, `name`,
`phone`, and optional `email`, plus a bounded opaque `Idempotency-Key` header.
It returns a confirmed booking with server-derived service/times and a
notification state: `not_requested`, `requested`, or `unknown`. Phone, email,
Calendar IDs, provider details, and event descriptions are never returned.

Public failures are stable envelopes `{ ok: false, error: { code } }`: invalid
requests use `400`, taken slots/idempotency mismatches use `409`, bodies over
the small limit use `413`, non-JSON uses `415`, rate limits use `429`, and
unconfigured or provider-uncertain states use `503`. Every response is
no-store and no CORS policy is added.

The same idempotency key and request fingerprint replays the identical public
semantic and HTTP status; a different fingerprint is rejected. The durable
store atomically creates a fingerprint-bound, versioned availability-unchecked
`pending` record before any Calendar mutation. Each pending retry repeats
FreeBusy; only a clear result atomically advances to `creation_intent`
immediately before the deterministic Calendar mutation, then permits only
`event_created`,
`confirmed_notification_pending`, `confirmed`, `conflict`, or `manual_review`
transitions with a configured TTL. A `creation_intent` retry reuses/verifies
the deterministic Calendar ID rather than creating a second appointment.
Terminal conflict and manual-review states replay as `409` and `503`
respectively; a notification-pending record replays the confirmed appointment
with `notification: "unknown"` and never sends a second invitation.

A booking locks, rechecks FreeBusy for a newly created pending record, inserts
privately without notification, lists recurring-expanded overlapping Calendar
events in `Europe/Skopje`, and compensates if a simultaneous opaque timed or
all-day staff event is found. Compensation uncertainty and any failed state
write after an appointment mutation are `503` unknown/manual-review outcomes,
never a clean conflict or rollback claim. A final state-write failure after an
invitation attempt safely returns the confirmed appointment with
`notification: "unknown"`; it does not resend the invitation. Invitation
failure likewise preserves the confirmed studio appointment.

Routes are intentionally disabled by default. An explicit
`BOOKING_LOCAL_TEST_MODE=1` exception composes the Google adapter with
single-process development providers only when `NODE_ENV=development`; it is
for owner-operated localhost evaluation and cannot activate in production.
Production activation still requires the owner to supply approved
lead time, horizon, state TTL, and lock timeout/lease values, plus durable
external lock, idempotency, trusted request-context, and rate providers. The
lock adapter must acquire with timeout, owner/fencing identity and lease,
renew immediately before each bounded provider operation, support ownership
assertion before mutations, and compare-owner release. Owner-approved policy
must set the lease longer than the adapter's worst-case bounded provider
operation (including its bounded retries/verification) plus a safety margin.
If an aborted remote mutation outlives that window, the route returns unknown
and later deterministic reconciliation is required; it never claims a
transaction. The
idempotency adapter must atomically create and compare-version transition
fingerprint-bound records. In-memory coordination is unsafe on serverless
hosts. Google
FreeBusy, insertion, and staff edits are not transactional, so the post-insert
check narrows but cannot eliminate the residual race. Owner decisions still
needed: production provider choices, bot protection, Google setup, required
email, retention/privacy, hosting, and activation policy.
