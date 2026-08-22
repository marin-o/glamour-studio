# Google Calendar Booking Implementation Plan

## Status

The owner approved the custom Next.js and Google Calendar direction on
2026-07-23 after rejecting the managed-service options. This document defines
the phased program, but each phase must have its own Sitewright task and only
one phase task may be active at a time.

Production Google authorization, external service provisioning, deployment, and
launch remain separate owner-gated actions. Implementation must use mocks and
documented environment contracts until those actions are explicitly approved.

## Delivery protocol

Each phase follows the same review cycle:

1. Create and start one scoped Sitewright task.
2. Give a cold-start Terra Medium implementer curated context and require it to
   read the phase task.
3. Give a cold-start Sol Medium reviewer the resulting task, diff, and
   validation evidence.
4. Give a cold-start Terra Medium fixer the task and review findings.
5. Re-run only checks invalidated by the fixes and record final evidence.
6. Request owner completion approval before completing the task and creating
   the next phase task.

Agents must not inherit conversation history. They must be told that other work
exists in the repository, must preserve unrelated changes, and must not commit,
push, deploy, modify Google, or provision external services.

## Intended outcome

Provide a fully branded Macedonian-first booking flow inside the existing
Next.js application:

1. The customer selects a service.
2. The customer selects an available appointment.
3. The customer enters minimal contact information and books.

Customers do not create accounts or select an employee. Google Calendar remains
the calendar staff use for online, phone, text, move, and cancellation
workflows.

## Proposed architecture

- Keep the service catalog, prices, durations, seasonal hours, time zone,
  booking horizon, and lead-time rules in server-owned application
  configuration.
- Expose a read-only availability route that accepts a service identifier and
  date, applies studio rules in `Europe/Skopje`, queries Google Calendar
  Calendar events with trusted work-track markers, and returns only valid start times.
- Expose a booking route that accepts the service identifier, requested start,
  customer name, phone, email, and an idempotency key.
- Authenticate the server to a dedicated studio calendar through owner-granted
  Google OAuth with offline access. Customers never authenticate with Google.
- Store OAuth credentials only in server-side deployment secrets.
- Use Google Calendar as the appointment source of truth. Do not cache
  availability initially and do not maintain a second appointment database.
- Use a small durable Redis/KV or database-backed mutex only to serialize online
  booking attempts and retain minimal idempotency state.
- Do not add Google Calendar webhooks initially. Query Calendar events when a date is
  opened and recheck it during booking.

## Availability behavior

- Generate start times on 30-minute boundaries.
- April through September: allow appointments within 06:00-18:00.
- October through March: allow appointments within 10:00-18:00.
- Operate every day, subject to busy Calendar events and future approved
  closures or booking rules.
- Derive duration from the trusted service identifier; never trust a duration
  or price submitted by the browser.
- Remove starts that overlap an unknown or same-work-track busy interval or cause the service to finish
  after closing.
- Treat Google events marked `Busy` as blockers. Events marked `Available` do
  not block online booking. The `makeup` service is the makeup track; every
  other confirmed catalogue service is the hair track. Only private events with
  valid deterministic-booking and work-track markers are classified; legacy,
  manual, missing-marker, and invalid-marker blockers are unknown and block both tracks.
- Require staff to use the dedicated studio calendar for every phone, text, and
  walk-in appointment.

## Booking transaction

For each booking request:

1. Validate the service, customer fields, requested start, time zone, seasonal
   hours, lead time, and booking horizon.
2. Validate bot-protection and rate-limit signals.
3. Acquire a short-lived studio-wide durable lock. An in-process lock is not
   sufficient on serverless hosting.
4. Query typed Google Calendar events again while holding the lock.
5. Return a conflict response if the interval is no longer available.
6. Insert a private Google Calendar event using a deterministic event ID derived
   from the idempotency key.
7. Perform a post-insert overlap check before notifying the customer.
8. If another overlapping same-track or unknown event appeared, delete the new
   event and return that the appointment was just taken; ignore a known
   opposite-track event.
9. Otherwise add the customer as an attendee and request Google attendee
   notifications.
10. Return confirmed appointment details to the UI and release the lock.

This serializes online requests and makes a simultaneous manual Calendar edit
unlikely to collide, but it cannot provide an absolute transactional guarantee.
Google exposes FreeBusy checking and event creation as separate operations and
does not provide a conditional "insert only if still free" booking primitive.

If absolute no-double-booking guarantees become mandatory, a transactional
database must own appointment inventory and Google Calendar must become a
synchronized staff view rather than the sole source of truth.

## Customer notifications

- Creating the event on the studio calendar puts it directly in the staff
  calendar.
- Adding the customer's email as an attendee and using Google Calendar attendee
  notifications requests an invitation email.
- The owner confirmed on 2026-07-24 that email is required so every accepted
  online booking can request a Calendar invitation. Phone-only customers use
  an offline booking path.
- Google does not guarantee that every invitation appears automatically on the
  customer's calendar; recipient settings and spam controls still apply.
- A guest declining an invitation is not equivalent to cancelling the booking.
  Staff must manage the actual event in the studio calendar unless a later
  signed cancellation flow is approved.

## Staff workflow

- Staff use Google Calendar on the web or its existing mobile app; no custom
  staff application is required.
- Staff enter phone, text, and walk-in appointments directly into the dedicated
  calendar with the correct duration and `Busy` status.
- Staff move or delete events in the same calendar.
- Online bookings appear in that calendar with service and customer details.
- When an event retains a customer attendee, Google can send change or
  cancellation notifications as staff update it.

## Security and reliability requirements

- Use the narrowest practical Google Calendar OAuth scopes.
- Move the production OAuth project out of Testing; Testing authorizations for
  sensitive scopes expire after seven days.
- Document how the owner reconnects Google if consent is revoked or the refresh
  token fails.
- Add bot protection, a honeypot, IP/contact rate limits, lead time, a booking
  horizon, and limits on suspicious repeat bookings.
- Keep Calendar credentials and customer data out of browser code and logs.
- Restrict access to the studio calendar and avoid exposing telephone numbers in
  event titles or public notifications.
- Use bounded retries with exponential backoff for retryable Google errors.
- Return an explicit unavailable or temporarily unavailable state; never claim
  a booking succeeded until the Calendar event is confirmed.
- Monitor authorization failures, Google API errors, ambiguous insert results,
  notification failures, and lock failures.

Known residual failures include staff using the wrong calendar or `Available`
status, authorization revocation, Google API or invitation outages, a manual
event inserted during the final race window, and changes to Google OAuth,
invitation, or quota policies.

## Cost and effort estimate

- Google Calendar API: expected to remain free at studio volume under current
  standard-use thresholds; recheck current quota and billing policy before
  implementation.
- Durable lock, rate limiting, and bot protection: likely to fit within suitable
  free tiers at studio volume, but each introduces an external dependency.
- Website backend: deploys with the existing Next.js application, subject to the
  chosen host's commercial-use terms and server-runtime limits.
- Prototype estimate: approximately 3-5 developer days.
- Production-ready estimate: approximately 10-18 developer days, including
  OAuth, availability rules, locking, idempotency, abuse controls, failure
  handling, testing, deployment, and operating documentation.
- Ongoing cash cost can approach zero, but developer maintenance and incident
  ownership do not.

## Phased outline

### Phase 1: Booking domain and availability engine

- Define the authoritative service catalog, durations, price labels, seasonal
  hours, slot interval, time zone, and server-owned validation.
- Implement a pure availability engine that subtracts unknown and same-track
  busy intervals from working windows without calling Google.
- Cover all ten services, long-service closing boundaries, all-day blocks,
  overlapping busy intervals, DST behavior, invalid input, and lead/horizon
  rules with deterministic tests.
- Introduce provider-neutral interfaces for availability and booking without
  installing or configuring Google integrations.

Observable outcome: the repository can deterministically calculate valid studio
slots from trusted rules and supplied busy intervals.

### Phase 2: Google Calendar adapter and authorization boundary

- Implement the server-only Google Calendar client boundary for OAuth refresh,
  typed event-list reads, deterministic event insertion with private work-track
  markers, event verification, attendee
  updates, and compensating deletion.
- Add environment validation and setup documentation without creating a Google
  project, authorizing an account, or storing real credentials.
- Test the adapter through mocked Google responses, including token failure,
  quota/rate errors, ambiguous insert outcomes, duplicate event IDs, and
  invitation failure.

Observable outcome: the booking core has a tested Google adapter that can be
activated later by supplying approved server-side credentials.

### Phase 3: Reliable booking orchestration and public API

- Add durable-lock and rate-limit interfaces with an approved production
  adapter contract and a safe test implementation.
- Implement availability and booking route handlers with schema validation,
  no-store responses, idempotency, lock acquisition, final typed event-list recheck,
  post-insert conflict detection, compensation, and explicit HTTP outcomes.
- Keep customer data and credentials out of logs and browser bundles.
- Add unit/integration tests for simultaneous requests, stale slots, duplicate
  submissions, Google failures, lock failures, and retry behavior.

Observable outcome: a public API can return slots and create one reliable
booking without exposing Google credentials.

### Phase 4: Customer booking experience

- Add the Macedonian-first, English-aligned service, appointment, contact, and
  confirmation flow inside the existing visual system.
- Preserve no-account and no-employee-selection behavior.
- Require only owner-approved contact fields and clearly explain where data is
  sent and when a booking is confirmed.
- Implement accessible loading, empty, stale-slot, validation, retry, success,
  reduced-motion, and no-JavaScript/failure fallbacks.
- Connect the existing booking/contact actions to the real flow without
  disturbing homepage and Lookbook behavior.

Observable outcome: customers can complete the required three-step flow through
the real booking API.

### Phase 5: Abuse protection, operations, and launch readiness

- Add the approved bot challenge, rate-limit enforcement, privacy/retention
  copy, health diagnostics, sanitized operational logging, and recovery
  behavior.
- Document staff rules for the dedicated calendar, `Busy` events, phone/text
  bookings, moves, cancellations, OAuth reconnection, and incident handling.
- Validate the complete system with mocks and static/build checks. Real Calendar
  and rendered/browser validation remain owner-gated under repository policy.
- Produce a launch checklist covering production credentials, external service
  accounts, commercial hosting, monitoring, rollback, and owner acceptance.

Observable outcome: the implementation is ready for separately approved
production configuration and end-to-end owner verification.

Do not activate production credentials, provision services, deploy, or launch
without explicit owner approval.

## Research references

- [Google Calendar FreeBusy](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query)
- [Create Calendar events](https://developers.google.com/workspace/calendar/api/guides/create-events)
- [Invite attendees](https://developers.google.com/workspace/calendar/api/concepts/inviting-attendees-to-events)
- [Calendar event blocking behavior](https://developers.google.com/workspace/calendar/api/v3/reference/events)
- [Google OAuth behavior](https://developers.google.com/identity/protocols/oauth2)
- [OAuth verification exceptions](https://support.google.com/cloud/answer/13464323)
- [Calendar API quotas](https://developers.google.com/workspace/calendar/api/guides/quota)
- [Calendar push-notification limitations](https://developers.google.com/workspace/calendar/api/guides/push)
- [ScheduleQuest community reference](https://github.com/leoherzog/ScheduleQuest)
- [calendarX community reference](https://github.com/yksolanki9/calendarX)
