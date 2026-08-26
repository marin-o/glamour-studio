# Secure Customer Booking Management

Status: IN PROGRESS
Depends on: 059
Owner: AI-assisted implementation
Approver: Owner

## Goal

Let a customer securely reschedule or cancel an accepted online booking from an
accountless link delivered by a branded confirmation email, while Google
Calendar remains the staff-facing source of truth.

## Owner decisions

- Seasonal opening times are 10:00 from September through March and 06:00
  from April through August in `Europe/Skopje`; retain the existing closing
  time because the owner changed only the opening time.
- Send customer-facing booking mail through Resend from
  `Glamour Studio <bookings@glamourstudio.mk>` with replies directed to
  `glamourr.studio1@gmail.com`; keep the internal Gmail account for Calendar.
- Every customer email has a complete Macedonian section first and the
  equivalent English section beneath it.
- Allow online rescheduling and cancellation only when the appointment starts
  more than twelve hours in the future in `Europe/Skopje`.
- Inside the cutoff, direct customers to the confirmed salon phone number for
  changes.
- Keep the customer-facing policy at twelve hours, with an internal fifteen-
  minute operational grace period: online mutations remain accepted while at
  least eleven hours and forty-five minutes remain, including the exact 11:45
  boundary. Do not advertise the grace period in customer copy or email.
- Include a standard iCalendar (`.ics`) attachment in confirmation and
  rescheduling emails, with complete Macedonian-first/English-second guidance
  for adding the appointment to Google Calendar, Apple Calendar, Outlook, or
  another calendar client. Do not put the management capability in the calendar
  file.
- Present email actions as clear buttons while retaining each raw-URL fallback
  in a visually quiet, readable “button not working?” panel instead of as an
  equally prominent paragraph.

## Delta implementation note

- The advertised twelve-hour policy remains customer-facing, while both
  mutations use the same non-advertised fifteen-minute operational grace before
  and after the studio lease: at least 11:45 remaining is accepted, including
  exactly 11:45. The public reschedule flag and client-side cancellation
  affordance reflect that effective boundary. The HTTP DTO remains unchanged
  and endpoints remain authoritative.
- Confirmation and rescheduling notifications now add a safe Google Calendar
  URL and `glamour-studio-appointment.ics`; the opaque UID hashes the Calendar
  event identity and notification payloads never put contact data, capability,
  raw Calendar ID, or idempotency key in the calendar data. Cancellation has no
  calendar action or attachment.
- Keep the customer as an attendee on the private Google event, but suppress
  Google's initial invitation email with `sendUpdates=none`; the branded
  bilingual Resend message is the sole booking-confirmation email. Existing
  rescheduling and cancellation update notifications remain unchanged.
- After the feature is complete, reviewed, and validated, send the exact
  customer-facing confirmation template to `jakimoskimarino@gmail.com` as the
  owner-authorized live email test. Do not create or mutate a live Calendar
  booking for that test.

## Review posture

`adversarial`. Hard triggers apply: the feature introduces authorization by a
secret link, customer-data reads, persistent management state, Calendar
mutations, and lock-sensitive rescheduling/cancellation behavior.

The grace-period delta retains `adversarial` review because it changes the
authorization boundary for persistent Calendar mutations, even though the code
change is localized and fully boundary-testable.

The initial-invitation suppression delta retains `adversarial` review because
it changes an external provider's customer-facing notification side effect and
the handling of customer attendee data. Scope is limited to initial attendee
attachment; later rescheduling and cancellation updates remain unchanged.

The email-link presentation delta retains `adversarial` review because its HTML
renders the secret management capability and external calendar URL. The change
must remain presentational: preserve escaping, text-only fallbacks, URL values,
and capability boundaries.

The seasonal-opening-hours delta uses review posture `none`: it is a localized,
owner-specified policy constant with deterministic month-boundary tests and no
new data, authorization, provider, or architecture surface.

The owner-authorized Netlify production recovery uses review posture
`adversarial`: it changes production secrets and runtime configuration and
requires a new production deployment. Recovery is limited to the nine missing
variables documented by this task, followed by read-only live availability
verification and one bounded adversarial review.

The interrupted-cancellation correction retains review posture `adversarial`:
it repairs an authorization-bearing record that can diverge from an already
cancelled Calendar event. A `mutation_intent` must never be presented as an
active booking or expose another mutation affordance; safe reconciliation must
finalize a Calendar-confirmed cancellation without repeating the provider
mutation, and uncertain provider state must remain fail-closed.

## Implementation decisions

- Use `https://glamourstudio.mk/booking/manage#<secret>` and send the fragment
  secret to APIs only in an authorization header. The fragment must never be
  placed in query parameters, request URLs, analytics, or logs; the route uses
  `noindex` and `Referrer-Policy: no-referrer`.
- Store a digest-indexed, versioned management record containing only the
  minimum server data needed to bind the capability to the Calendar event and
  trusted catalog state. Do not persist customer name, phone, or email in the
  management store; retrieve the verified attendee only when a status email is
  needed.
- Derive management-record TTL from the authoritative appointment end and make
  the capability unusable once the appointment ends. Cancellation transitions
  the record to a terminal state rather than reviving or replacing the secret.
- Use direct bounded `fetch` for Resend rather than adding an SDK dependency.
  Notification attempts are synchronous and idempotent but non-authoritative:
  Calendar/management success remains success if Resend is unavailable.
- Persist mutation intent before Calendar PATCH/DELETE. Reconcile uncertain
  mutations against the exact event; expose a safe unknown state when the
  provider result cannot be proven rather than guessing or creating a new
  event.

## Scope

- Add a server-only Resend adapter with bounded requests, sanitized failures,
  and idempotent notification attempts. A notification failure must never
  reverse or falsely invalidate an accepted Calendar booking.
- Generate a cryptographically random management secret for each newly
  accepted online booking. Store only a digest in durable coordination state;
  never expose Google event IDs, idempotency keys, contact data, credentials,
  or predictable identifiers in the public URL.
- Add exact-schema, no-store management APIs for authenticated booking reads,
  availability, rescheduling, and cancellation. Apply rate limits, constant
  time secret verification where applicable, server-derived time policy, and
  the existing production fail-closed posture.
- Serialize Calendar mutations with the existing lease/fencing model.
  Rescheduling must exclude the managed event from its own availability check,
  preserve work-track behavior and the attendee, update the existing event,
  and fail safely on stale or ambiguous Calendar state. Cancellation must be
  idempotent and invalidate further management mutations.
- Add a customer route for the emailed link. It must show only the authenticated
  booking, reuse trusted catalog data, provide the available-date/time flow for
  moves, expose a deliberate cancellation confirmation, explain the twelve-hour
  cutoff, and retain the direct phone fallback.
- Send bilingual booking-confirmed, rescheduled, and cancelled emails using one
  shared production template system. The confirmation contains the management
  link; subsequent messages report the resulting state without placing
  customer contact data in URLs or logs.
- Update booking API/setup documentation, environment validation, the product
  contract, tests, and repository map for the new ownership boundaries.

## Suggested files

- `src/lib/booking/orchestration/`
- `src/lib/booking/google/`
- `src/lib/booking/production/`
- `src/lib/booking/http/`
- `src/lib/booking/client/`
- `src/app/api/booking/`
- `src/app/booking/`
- `src/components/booking/`
- `tests/booking/`
- `.env.example`
- `docs/booking-api.md`
- `docs/booking-google-calendar-setup.md`
- `REPO_MAP.md`

## Acceptance criteria

- [x] A newly accepted booking attempts one idempotent branded bilingual
  confirmation email containing a secure management link, without exposing the
  link in the booking API response.
- [x] Possessing a valid unexpired management secret is required to view or
  mutate the booking; invalid, expired, cancelled, and unknown links reveal no
  booking or customer details.
- [x] A customer can move an appointment to an actually available start while
  the effective 11:45 operational boundary allows it (the customer-facing
  policy remains twelve hours), with the same service,
  work-track rules, Calendar event identity, and attendee preserved.
- [x] A customer cannot reschedule once less than 11:45 remains and receives
  the direct phone fallback instead; customer copy continues to state twelve
  hours.
- [x] A customer can cancel while at least 11:45 remains (the advertised policy
  remains twelve hours);
  repeated cancellation
  is safe, the Calendar attendee update is requested, and the management link
  cannot perform another mutation afterward.
- [x] Concurrent or stale booking-management attempts serialize and fail closed
  without double booking, reviving a cancellation, or claiming an uncertain
  Calendar mutation succeeded.
- [x] Confirmation and rescheduling emails include a bilingual calendar-add
  option backed by a standards-compatible `.ics` attachment that contains no
  management secret or customer contact data.
- [x] Reschedule and cancellation success attempts one idempotent bilingual
  status email; notification failure remains separate from the authoritative
  booking result.
- [ ] The management experience is semantic, keyboard operable, Macedonian-first,
  visually aligned with the existing booking desk, and has clear loading,
  expired, cutoff, conflict, error, success, and phone-fallback states.
- [x] Secrets and customer data stay out of public responses, logs, source,
  client configuration, Redis key names, and committed files.
- [x] Focused mock-only tests, lint, and production build pass. Browser,
  screenshot, viewport, motion, and interaction checks remain awaiting owner
  verification under the conservative validation policy.

## Non-goals

- Customer accounts, passwords, a staff dashboard, automated fees, refund or
  payment policy, SMS, marketing email, deployment, or a live Calendar booking
  write.
- Allowing the customer to change service or contact details.
- Replacing Google Calendar as the staff source of truth.

## Validation

- Run the focused mock-only booking tests once after implementation settles.
- Run lint and a production build once after the runtime change is final.
- Run one adversarial `sol_high` review after main-agent integration inspection
  and validation; delegate one correction pass only if it reports actionable
  findings.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation under the conservative policy. Leave rendered criteria
  awaiting owner verification.
- After review/fixes, send exactly one owner-authorized live Resend template test
  to `jakimoskimarino@gmail.com` with a non-functional example management URL.

## Completion notes

- Transition: start at 2026-08-23T18:16:26.478Z

- Completed: secure fragment-capability issuance, digest-only management state,
  authenticated management APIs, Calendar-backed rescheduling/cancellation,
  bilingual Resend notifications, and the Macedonian-first customer management
  experience. Repository ownership and Netlify setup/API guidance are aligned.
- Validation: the focused calendar/cutoff delta tests passed 8/8, and the final
  management-service correction suite passed 2/2. Targeted ESLint and the final
  `pnpm build` passed. The full booking suite is 139/141 with the same two
  unrelated stale static failures. `git diff --check` passed. The current
  attachment-bearing live-template email/E2E remains pending; no live provider
  call was made.
- Adversarial review: one `sol_high` review reported stale Calendar mutation,
  post-lock cutoff, TTL, fragment lifecycle, issuance recovery, terminal-link,
  query-schema, persistence-validation, rate-limit, documentation, test, and
  accessibility findings. One delegated correction pass addressed them. Main
  integration inspection then caught and corrected mutation-intent field
  normalization, with end-to-end reschedule/cancel persistence tests added. The
  owner-expanded 12-hour/calendar-attachment delta received a second bounded
  adversarial review because it materially changed the privacy-sensitive email
  surface; it found no blocker, and one correction pass resolved its four low
  documentation/copy/test findings.
- Deviations: the full booking suite is 139/141. Its two failures are stale
  static assertions in untouched booking metadata and homepage media/root-layout
  contracts. Repository-wide lint also traverses generated `.netlify` output;
  targeted lint for this task is clean.
- Final grace-delta evidence: focused management/client tests passed 6/6. The
  full booking suite is 140/142, with the same two unrelated stale failures in
  untouched booking metadata and homepage media/root-layout contracts. Targeted
  ESLint and the final production build passed. A bounded adversarial
  authorization-boundary review found no functional blockers; its only finding
  was this stale-evidence correction. The attachment-bearing live email/E2E
  remains pending, and no live provider call was made.
- Seasonal-hours correction: booking availability now opens at 10:00 from
  September through March and 06:00 from April through August, retaining the
  existing 18:00 close. Focused availability tests passed 12/12, including the
  August 31/September 1 boundary; targeted ESLint, the final production build,
  and `git diff --check` passed. The full booking suite remains 140/142 with the
  same two unrelated stale static failures. Review posture was `none` and no
  live provider call was made.
- Owner-authorized production recovery (2026-08-26): Netlify production was
  missing `RESEND_API_KEY` and the eight documented management rate-limit
  variables, so commit `049c767` deployed successfully but public availability
  failed closed with HTTP 503 `BOOKING_NOT_CONFIGURED`. Added exactly those nine
  production-context variables through the authenticated Netlify API without
  exposing secret values, then published deploy `6a8f56e543ff84ce9142919e`
  from unchanged commit `049c767`. Read-only availability returned HTTP 200 and
  `ok: true` on the canonical, default Netlify, and immutable deploy domains.
  One bounded `sol_high` adversarial review found no actionable issues and
  confirmed the intended keys, values, contexts, scopes, secret handling,
  deployed commit, and live recovery. No live booking or Calendar mutation was
  performed; production email delivery remains to be exercised by the planned
  owner-authorized E2E test.
- Interrupted-cancellation correction (2026-08-26): a customer-observed live
  cancellation could leave the capability in `mutation_intent`, after which a
  retry incorrectly exposed the appointment details and another cancellation
  affordance. Management reads now reconcile cancellation intents under the
  studio lease with one read-only exact-event Calendar check, reassert lease
  ownership before terminal CAS, accept a matching missing or cancelled Google
  tombstone, and never repeat Calendar DELETE. Active, mismatched, uncertain,
  or lost-lease states remain sanitized and fail closed. The UI independently
  clears stale details and suppresses mutation controls whenever the capability
  or `canReschedule` state is unavailable. Recovery cannot resend the branded
  cancellation email because the privacy-preserving digest record contains no
  trusted customer address; ordinary uninterrupted cancellation still attempts
  its idempotent email after terminal persistence. One bounded `sol_high`
  adversarial review found cancelled-GET, sparse-tombstone, post-provider lease,
  recovered-notification, and stale-availability UI issues; one correction pass
  addressed the actionable correctness issues while preserving the deliberate
  no-contact-data persistence boundary. Final focused tests passed 41/41,
  targeted ESLint, `pnpm build`, and `git diff --check` passed. No live booking,
  management-link, Calendar mutation, commit, push, or deployment was performed;
  the fix is not live yet.
- Initial-invitation suppression correction (2026-08-27): initial attendee
  attachment now uses Google Calendar `sendUpdates=none`, so the customer stays
  attached to the private event without receiving a duplicate Google invitation
  email. Rescheduling and cancellation retain `sendUpdates=all`; the branded
  bilingual Resend message remains the customer booking email. Macedonian and
  English confirmation copy now describes the saved appointment and best-effort
  branded email/calendar actions without promising delivery or instructing the
  customer to accept a Google invitation. One bounded `sol_high` adversarial
  review found the stale invitation copy and a missing reschedule-policy test;
  one correction pass addressed both while preserving the public response
  schema. Final focused tests passed 65/65, targeted ESLint, `pnpm build`, and
  `git diff --check` passed. No live booking, email, Calendar mutation, commit,
  push, or deployment was performed; the correction is local and uncommitted.
- Email-link presentation refinement (2026-08-27): HTML notification actions
  retain their prominent buttons while each raw management or calendar URL now
  sits in a muted warm fallback panel with a localized “button not working?”
  label and defensive long-link wrapping. Plain-text URLs, escaping, provider
  payloads, calendar attachments, and capability boundaries are unchanged. One
  bounded `sol_high` adversarial review found no implementation defect and one
  low test-structure gap; the single correction pass now binds every MK-first/
  EN-second label to its intended URL and asserts exact capability occurrences.
  The focused notifier suite passed 4/4, targeted ESLint, `pnpm build`, and
  `git diff --check` passed. Cross-client rendered review remains owner-gated;
  no live email, commit, push, or deployment was performed.
- Owner verification pending: rendered browser behavior, including visual fit,
  focus movement, keyboard operation, and the customer-visible email rendering.
  Completion approval remains with the owner.
