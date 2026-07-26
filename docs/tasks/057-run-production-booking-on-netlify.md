# Run production booking on Netlify

Status: IN PROGRESS
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Run the existing production-safe booking system on the owner-created Netlify
site without weakening secret handling, request identity, Redis coordination,
Google Calendar behavior, or the current Vercel rollback path.

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Inspect the existing Netlify deployment and diagnose build/runtime failures.
- Configure production-only booking, Google, policy, HMAC, and Upstash values
  through Netlify's supported environment-variable workflow without copying
  local-only or provider-generated credentials.
- Adapt the fail-closed production composition only where Netlify differs from
  Vercel, including explicit platform activation and trusted server-derived
  request identity.
- Preserve atomic Upstash coordination and Google Calendar invitation behavior.
- Record that the owner had already deleted the Vercel deployment; do not
  invent or recreate a rollback deployment as part of this migration.
- Keep review corrections and tuning in this task until the outcome is accepted.

Review posture: `adversarial` because this outcome changes production hosting,
secrets, trusted request identity, deployment permissions, and rollback state.

## Suggested files

- `src/lib/booking/production/`
- `src/lib/booking/runtime.mjs`
- `src/app/api/booking/`
- Netlify configuration only if the platform requires repository configuration
- `tests/booking/`
- deployment and booking runbooks

## Acceptance criteria

- [ ] The Netlify site builds and serves the Next.js routes with the booking API
  emitted as a supported server runtime.
- [ ] Production booking activates explicitly on Netlify and remains fail-closed
  when required configuration or trusted request context is absent.
- [ ] No `.env.local`, Vercel OIDC token, raw contact identity, or secret value is
  committed, logged, or exposed to browser code.
- [ ] Google Calendar, HMAC, policy, and Upstash variables are scoped to Netlify
  Production and use deliberate values rather than local-development defaults.
- [ ] Netlify requests derive a privacy-minimized subject digest only from a
  platform-authenticated client identity source.
- [ ] Live availability succeeds through Netlify, Upstash, and Google Calendar;
  a write/invitation smoke test remains owner-controlled.
- [x] The rollback constraint is explicitly resolved: the owner reported that
  they had already deleted the Vercel deployment before this migration could
  preserve it.
- [ ] Required owner decisions remain explicit rather than invented.

## Non-goals

- UI, copy, pricing, service-duration, media, domain, or unrelated product work.
- Recreating the deleted Vercel project, rotating Google credentials, or
  decommissioning an owner-claimed Upstash resource without separate approval.

## Validation

- Select the smallest commands and owner checks before implementation and run them once after the runtime change is final.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Do not substitute every static check for unavailable rendered validation. Leave rendered criteria awaiting owner verification when necessary.
- Task, evidence, and handoff-only edits do not invalidate successful runtime checks.

## Completion notes

- Transition: start at 2026-07-26T11:34:32.032Z

- Completed: linked the owner-created Netlify site; staged Production-only
  Google, policy, HMAC, platform, and replacement Upstash values with
  `BOOKING_PRODUCTION_ENABLED=0`; added explicit Netlify activation and
  server-derived `getContext().ip` HMAC identity while preserving Vercel
  behavior; added fail-closed platform and identity tests.
- Validation: focused booking runtime/static contract tests pass 18/18;
  `pnpm build` passes and emits both booking routes dynamically; adversarial
  review found one conflicting-platform-marker downgrade, which was corrected
  and revalidated. A local Windows Netlify adapter packaging attempt reaches a
  reproducible generated pnpm-symlink `EEXIST`; inspection indicates a local
  generated-output issue, so the clean Linux cloud build remains required.
- Deviations: the owner had already deleted the Vercel deployment, so the
  planned rollback could not be preserved. An initial disposable 72-hour
  Upstash token appeared in diagnostic output after an unexpected response
  format; that database was removed from Netlify configuration and replaced
  before enablement. The unused original will expire automatically.
- Follow-up: the owner confirmed the replacement Upstash database was claimed;
  owner must explicitly authorize committing/pushing the current coherent work so
  Netlify can perform a clean cloud build; after a successful cloud deploy,
  enable the production gate and verify live availability before any
  owner-controlled booking/invitation smoke test.
