# Run production booking on Vercel

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Make the existing fail-closed booking API operate safely on Vercel with Google
Calendar invitations and durable cross-instance coordination, then deploy a
preview that is ready for an owner-controlled production activation.

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Preserve the existing public availability and booking request/response
  contracts while adding an explicit Node.js production runtime composition.
- Replace development-only in-process locking, idempotency, and rate limiting
  with an atomic Redis-compatible production adapter suitable for concurrent
  Vercel Functions.
- Derive trusted, privacy-minimized request context server-side and keep booking
  contact data and Google credentials out of logs and client responses.
- Keep Google Calendar as the booking record and its attendee invitation as the
  initial email notification channel; do not add a separate mail provider.
- Keep production fail-closed behind validated configuration and an explicit
  activation gate.
- Provision/link Vercel and production-only managed Redis through the Vercel
  CLI where possible; pause for owner authentication, billing/plan acceptance,
  Google consent, secrets, domain, or final production-enable decisions.
- Keep review corrections and tuning in this task until the outcome is accepted.

Review posture: `adversarial` because the outcome touches production
infrastructure, secrets, privacy, concurrency, persistent coordination, and the
public booking contract.

## Suggested files

- `src/lib/booking/runtime.mjs`
- `src/lib/booking/orchestration/`
- `src/lib/booking/production/`
- `src/app/api/booking/`
- `.env.example`
- `docs/booking-api.md`
- `docs/booking-google-calendar-setup.md`
- `tests/booking/`

## Acceptance criteria

- [x] Production never uses the localhost-only global Maps or the
  `BOOKING_LOCAL_TEST_MODE` gate.
- [x] Concurrent Vercel instances share atomic lease, idempotency, and
  rate-limit state with bounded retention and no raw contact data in keys;
  the fixed-scope fencing sequence is deliberately persistent and monotonic so
  expired/released leases never reuse a token.
- [x] Booking rechecks availability while holding the distributed lease and
  preserves existing conflict, retry, idempotency, and sanitized-error behavior.
- [x] Both booking routes run on the Node.js runtime, stay dynamic/no-store, and
  receive trusted server-derived request context.
- [x] Google OAuth and currently available deployment secrets are server-only, validated, and
  configured as sensitive deployment variables without appearing in logs.
- [x] Google Calendar attendee invitations remain the only promised email
  behavior and the public `requested`/`unknown` contract remains truthful.
- [x] Missing or invalid production configuration returns the existing safe 503
  state; activation requires an explicit production enable value.
- [x] Focused concurrency, adapter, route, Google-failure, lint, and production
  build checks pass before deployment.
- [x] One preview deployment is provisioned and validated without activating
  production booking; production enablement remains owner-controlled.
- [x] Required owner decisions remain explicit rather than invented.

## Non-goals

- Branded transactional email, SMS, cancellation automation, payments, customer
  accounts, or a hosted Google reauthorization UI.
- Replacing Google Calendar with a second appointment database or promising an
  absolute no-double-booking guarantee across manual calendar edits.
- Changing the booking UI, service catalogue, public API schema, or unrelated
  product/infrastructure behavior.

## Validation

- Select the smallest commands and owner checks before implementation and run them once after the runtime change is final.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Do not substitute every static check for unavailable rendered validation. Leave rendered criteria awaiting owner verification when necessary.
- Task, evidence, and handoff-only edits do not invalidate successful runtime checks.

## Completion notes

- Transition: complete at 2026-07-26T02:38:04.120Z
- Validation: Production deployment dpl_Cv28EuSoEf2erfU7RS5fspcWpiPJ is READY at glamourstudio.vercel.app; availability returned 200; owner live retry returned POST /api/booking 201; 40 focused booking tests, lint, and production build passed.
- Approved by: Owner

- Transition: start at 2026-07-26T02:07:11.742Z

- Transition: block at 2026-07-26T02:05:55.552Z
- Reason: Owner must accept Upstash Marketplace terms in the Vercel dashboard before the CLI can create the production Redis resource.

- Transition: start at 2026-07-26T01:18:51.231Z

- Completed: Added a server-only `src/lib/booking/production/` Vercel
  composition. It validates an explicit production gate, Google secrets,
  Upstash REST credentials, HMAC identity secret, and every lock/idempotency/
  rate policy value before constructing the existing provider-neutral service.
  Local development remains exclusively behind `BOOKING_LOCAL_TEST_MODE=1`.
  The production Redis adapter uses injected official `@upstash/redis` client
  calls and single-key-set Lua operations for leases/fences, idempotency CAS,
  and fixed-window rate limits. Both API routes now explicitly request Node.js
  runtime and pass server-derived request context. Production hashes only
  Vercel `x-vercel-forwarded-for` with the required HMAC secret before
  coordination; it does not use a public forwarded header or raw identity.
- Validation: `pnpm lint` passed. Focused booking production, runtime, HTTP,
  orchestration, local coordination, and Google adapter tests passed (56/56).
  `pnpm build` passed, including the repository media check and a production
  Next.js build with both booking endpoints emitted as dynamic routes.
  The complete `pnpm test:booking` run exercised 101 tests; 100 passed and one
  unrelated existing homepage-media contract failed because another active
  worktree change now maps the hero to
  `/media/homepage/glamour-studio-hero-clean-4k.png` while its test still
  expects the removed placeholder JPEG. No browser, rendered, deployment, or
  external-provider check was run under the conservative policy.
- Deviations: No Vercel project was linked, no Upstash/Google account or
  secret was created, no deployment occurred, and no real request contacted
  an external provider. `@upstash/redis@1.38.0` was added; its lockfile diff is
  limited to that package and its `uncrypto@0.1.3` dependency, with pre-task
  Next/React resolutions restored.
- Follow-up: Owner must provision the dedicated Redis database, production
  Google OAuth grant, and Vercel server secrets; explicitly choose every
  documented policy value; verify a preview with production still disabled;
  then approve activation. Resolve the unrelated homepage-media contract
  mismatch before treating the full suite as green. Adversarial Sol review is
  still required before task completion.

- Review correction (2026-07-26): Redis lease renewal now atomically renews a
  still-owned, unexpired lease before asserting the *new* TTL against the next
  provider-operation budget and safety margin. The Google adapter receives the
  production provider budget as one abortable public-method deadline covering
  refresh, retries, pagination, verification, fetch, and body reads.
  Recovered `creation_intent` records reconcile the deterministic event first;
  an absent event repeats FreeBusy under the lease before insert. Rate limiting
  now uses one aggregate action-plus-subject bucket in both production and
  local adapters, independent of date/service/contact. The fence counter is
  documented and tested as intentionally persistent and monotonic; only
  lease/idempotency/rate records are TTL-bounded. No provider was contacted,
  provisioned, linked, deployed, or enabled.
- Review-correction validation: passed `pnpm exec node
  --conditions=react-server --test tests/booking/production-coordination.test.mjs
  tests/booking/booking-runtime.test.mjs tests/booking/booking-api.test.mjs
  tests/booking/booking-orchestration.test.mjs
  tests/booking/local-coordination.test.mjs
  tests/booking/google-calendar-adapter.test.mjs
  tests/booking/booking-static-contract.test.mjs`; passed `pnpm lint` and
  `pnpm build` (including `pnpm media:check` and dynamic booking routes);
  `git diff --check` passed. The dependency scope remains only the previously
  approved `@upstash/redis` plus transitive `uncrypto`; this correction added
  no dependency. The unrelated homepage-media contract remains out of scope.

- Vercel setup (2026-07-26): Linked the repository to
  `marin-os-projects/glamour-studio-5bn8`. Configured the four existing Google
  Calendar variables and a newly generated cryptographic request-HMAC secret as
  sensitive Production variables. Configured the owner-approved initial policy
  values documented in `.env.example`, with `BOOKING_PRODUCTION_ENABLED=0`.
  A read-only live check exchanged the Google refresh token and successfully
  queried FreeBusy for the configured calendar without creating an event.
- Preview evidence: deployment `dpl_5QMpUDYW23wm5VH55fnaUqRoRWg1` reached
  `READY` at
  `https://glamour-studio-5bn8-f6xz1w2hl-marin-os-projects.vercel.app` after a
  successful Vercel production build. An authenticated `vercel curl` request to
  `/api/booking/availability` returned the intended `503` response with
  `BOOKING_NOT_CONFIGURED`, confirming the preview remains fail-closed.
- Resolved blocker: after owner acceptance of the Upstash Marketplace terms,
  Vercel provisioned production-only free-plan resource
  `store_SzRPWPGGNsGfg1v7` in `iad1` and connected it to the project. Vercel's
  injected `KV_REST_API_*` credentials were copied to the runtime's reviewed
  `UPSTASH_REDIS_REST_*` names as sensitive Production aliases without printing
  their values; the temporary pull file was removed.
- Production activation: the owner-approved explicit gate was changed to
  `BOOKING_PRODUCTION_ENABLED=1` and deployment
  `dpl_52xBWZ7AujoWxsAQLsYzeGczd1rf` reached `READY`, with the production alias
  set to `https://glamourstudio.vercel.app`. Both `/` and `/booking` returned
  HTTP 200. A no-write live availability request for `makeup` on 2026-07-28
  returned HTTP 200 with slots, exercising Vercel, the production Upstash rate
  limiter, and Google Calendar FreeBusy end to end. No calendar event or attendee
  invitation was created because no designated test recipient was supplied.

- Live write-path correction (2026-07-26): owner testing produced two
  `POST /api/booking` 503 responses while the surrounding availability requests
  remained 200. A privacy-safe Upstash inspection found one durable record at
  `event_created`, version 3, with an event ID and no public outcome. The
  production adapter rebuilds transition records rather than merging them, but
  the service omitted the existing event ID when advancing to
  `confirmed_notification_pending` and `confirmed`; local merging fakes had
  masked the mismatch. The transition boundary now explicitly carries the
  trusted current record's event ID through those notification states. A
  production-shaped regression verifies recovery from `event_created`, no
  duplicate insert, attendee update against the same event, and final
  `requested` confirmation.
- Correction validation: 40 focused booking orchestration, production
  coordination, runtime, and API tests passed; `pnpm lint` passed; `pnpm build`
  passed. Production deployment `dpl_Cv28EuSoEf2erfU7RS5fspcWpiPJ` reached
  `READY` and was aliased to `https://glamourstudio.vercel.app`; a post-deploy
  availability request returned HTTP 200. Final write-path recovery awaits an
  owner retry from the still-open failed-booking tab so the original private
  idempotency key is reused. If that tab was refreshed or closed, the orphaned
  event must be handled deliberately before a fresh booking attempt.
- Owner verification: the owner retried from the original live tab and reported
  that the booking worked. Vercel production logs independently recorded
  `POST /api/booking` returning HTTP 201 on deployment
  `dpl_Cv28EuSoEf2erfU7RS5fspcWpiPJ`, after the earlier availability HTTP 200.
  This verifies recovery of the existing durable event through the corrected
  notification/confirmation transitions without a duplicate insert. Owner
  accepted the deployed outcome on 2026-07-26.
