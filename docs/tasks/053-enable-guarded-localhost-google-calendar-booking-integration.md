# Enable guarded localhost Google Calendar booking integration

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Enable the existing booking UI and API to use the owner's dedicated Google
Calendar during localhost testing without weakening the production fail-closed
boundary.

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Compose the existing Google Calendar adapter and booking orchestration only
  when an explicit development-only environment flag is enabled.
- Add single-process in-memory lock, idempotency, and rate-limit providers that
  satisfy the existing ports for localhost testing and are impossible to select
  in production.
- Add a local installed-app OAuth helper using loopback redirect, state, and
  PKCE. Keep secrets in ignored `.env.local` and never print the refresh token.
- Document dedicated-calendar setup, test-user authorization, token lifetime,
  local operation, and recovery steps.
- Keep review corrections and tuning in this task until the outcome is accepted.

## Suggested files

- `src/lib/booking/runtime.mjs`
- `src/lib/booking/local/`
- `scripts/booking/`
- `.env.example`
- `package.json`
- `docs/booking-google-calendar-setup.md`
- `tests/booking/`

## Acceptance criteria

- [x] Without the local flag, booking remains fail-closed with
  `BOOKING_NOT_CONFIGURED`.
- [x] Local mode can only activate when `NODE_ENV=development` and all Google
  credentials are valid.
- [x] Local lock, idempotency, and rate-limit behavior satisfies targeted
  contract tests, while being clearly excluded from production use.
- [x] The OAuth helper uses a Desktop app loopback callback, validates state,
  uses PKCE, stores the refresh token without logging it, and preserves
  unrelated `.env.local` values.
- [x] Setup docs let the owner authorize a dedicated calendar without sharing
  credentials in chat or committing them.
- [x] The existing booking test suite, lint, and production build pass.
- [ ] A live localhost booking against the owner's Google test calendar remains
  an explicit owner verification step.

## Non-goals

- Production deployment or production-grade durable coordination.
- Creating or changing the owner's Google Cloud project or calendar on their
  behalf.
- Customer accounts, staff UI, calendar migration, or unrelated booking UI
  changes.

## Validation

- Select the smallest commands and owner checks before implementation and run them once after the runtime change is final.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Do not substitute every static check for unavailable rendered validation. Leave rendered criteria awaiting owner verification when necessary.
- Task, evidence, and handoff-only edits do not invalidate successful runtime checks.

## Completion notes

- Transition: complete at 2026-07-23T15:26:08.508Z
- Validation: Owner completed Google setup and confirmed the localhost booking flow appears to work after the live timestamp-shape correction. Final validation: 81/81 booking tests, lint, and production build passed; localhost availability API returned 200 with Google-backed slots.
- Approved by: owner

- Transition: start at 2026-07-23T14:21:50.440Z

- Completed: Added the explicit development-only runtime composition, shared
  single-process local coordination ports, Desktop OAuth loopback/PKCE helper,
  ignored environment template, focused tests, and owner setup/recovery
  documentation.
- Validation: Initial integration validation passed 80/80 tests. After the live
  API exposed the browser client's overly strict millisecond-only instant
  parsing, the corrected suite passed 81/81; `pnpm lint` passed; `pnpm build`
  passed and retained both booking routes as dynamic server routes.
- Deviations: No live Google request was made because `.env.local` does not yet
  exist and the owner must create/select the Google project, OAuth client,
  consent grant, and dedicated calendar.
- Follow-up: Owner follows `docs/booking-google-calendar-setup.md`, runs
  `pnpm booking:google:authorize`, restarts the dev server, and verifies a manual
  Busy event plus one online booking. Keep this task IN PROGRESS until that live
  owner check is accepted.
