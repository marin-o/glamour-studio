# Run production booking on Netlify

Status: DONE
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
- During live deployment review, optimize delivery of the four already-chosen
  homepage images without changing their visual roles, crops, or curtain behavior.
- Keep review corrections and tuning in this task until the outcome is accepted.

Review posture: `adversarial` because this outcome changes production hosting,
secrets, trusted request identity, deployment permissions, and rollback state.
Post-deploy homepage-image correction posture: `none`; it is a localized,
visual-preserving delivery optimization with no exceptional-risk trigger.

## Suggested files

- `src/lib/booking/production/`
- `src/lib/booking/runtime.mjs`
- `src/app/api/booking/`
- Netlify configuration only if the platform requires repository configuration
- `tests/booking/`
- deployment and booking runbooks
- `src/components/TypographySalonPage.jsx`
- `src/lib/homepage-media.js`
- the four referenced homepage delivery assets

## Acceptance criteria

- [x] The Netlify site builds and serves the Next.js routes with the booking API
  emitted as a supported server runtime.
- [x] Production booking activates explicitly on Netlify and remains fail-closed
  when required configuration or trusted request context is absent.
- [x] No active production `.env.local`, Vercel OIDC token, raw contact identity,
  or secret value is committed, logged, or exposed to browser code.
- [x] Google Calendar, HMAC, policy, and Upstash variables are scoped to Netlify
  Production and use deliberate values rather than local-development defaults.
- [x] Netlify requests derive a privacy-minimized subject digest only from a
  platform-authenticated client identity source.
- [x] Live availability succeeds through Netlify, Upstash, and Google Calendar;
  a write/invitation smoke test remains owner-controlled.
- [x] The rollback constraint is explicitly resolved: the owner reported that
  they had already deleted the Vercel deployment before this migration could
  preserve it.
- [x] Required owner decisions remain explicit rather than invented.
- [x] The same four chosen homepage images retain their roles and crops while
  responsive delivery avoids transferring oversized source PNGs to ordinary
  viewport sizes.
- [x] The hero remains prioritized and uses a higher-fidelity derivative and
  delivery quality beneath the existing veil; the three studio images begin
  loading on initial page load at low fetch priority instead of waiting for scroll.
- [x] Static media checks and a production build pass; the owner verified the
  final rendered loading speed after deployment.
- [x] Homepage SSR emits a responsive static-file hero preload and static
  studio `srcset` URLs, avoiding Netlify's first-request `/_next/image`
  transformation latency while preserving current scheduling and fidelity.

## Non-goals

- Copy, pricing, service-duration, lookbook media, domain, or unrelated product work.
- Recreating the deleted Vercel project, rotating Google credentials, or
  decommissioning an owner-claimed Upstash resource without separate approval.

## Validation

- Select the smallest commands and owner checks before implementation and run them once after the runtime change is final.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Do not substitute every static check for unavailable rendered validation. Leave rendered criteria awaiting owner verification when necessary.
- Task, evidence, and handoff-only edits do not invalidate successful runtime checks.

## Completion notes

- Transition: complete at 2026-07-27T01:40:55.321Z
- Validation: Netlify production booking and claimed Upstash-backed availability are live; adversarial runtime review was resolved; responsive homepage delivery bypasses cold image transforms; focused tests and production builds pass; live 1920px first-request total improved from 1.321s to 0.848s; owner verified and accepted the deployed result on 2026-07-27.
- Approved by: Owner

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
  commit `8e28905` was pushed to `master`; Netlify cloud deploy
  `6a65fb2c4958711decddc4f9` built successfully with the production gate enabled.
  A live read-only availability request returned HTTP 200 through Netlify,
  Upstash, and Google Calendar. Await owner verification/acceptance; any
  booking/invitation smoke test remains owner-controlled.
- Post-deploy media correction: generated same-dimension quality-90 WebP
  derivatives for the four selected homepage PNG masters and switched live
  delivery to explicit Next Image quality 82 while preserving quality 100 for
  Lookbook. Source payload fell from 63,586,147 bytes to 3,769,154 bytes
  (94.07%). The focused media contract passes 3/3, deterministic media checks
  pass, and the production build passes. Rendered loading speed awaits owner
  verification after deployment.
- Owner review correction: the first optimized deploy made the hero visibly too
  soft and the studio images visibly arrived during scrolling. Retune hero-only
  source/delivery quality and eagerly discover the studio images at low fetch
  priority while keeping the hero request highest priority.
- Retune validation: hero source WebP quality is 98 and homepage delivery quality
  is 95; studio images use eager discovery with low fetch priority. The hero
  derivative increased from 934,126 to 2,135,114 bytes while total WebP delivery
  assets remain 92.18% smaller than the PNG masters. Focused tests pass 3/3,
  deterministic media checks pass, and the production build passes. Owner-rendered
  verification remains pending after deployment.
- Live loading diagnosis: SSR already emitted the hero preload correctly. A
  production 1920px quality-95 `/_next/image` request measured 1.084s TTFB and
  1.321s total on the first request, then 0.163s TTFB and 0.368s total after the
  transformed variant was cached. The next correction should remove that cold
  transformation by pre-generating responsive static variants from PNG masters.
- Static responsive correction: generated all 47 widths requested by the current
  homepage `sizes` contracts directly from PNG masters and added a homepage-only
  custom loader. Generated SSR contains direct static preload/srcset URLs and no
  `/_next/image` homepage requests. The responsive set totals 8,194,238 bytes;
  the representative 1920px quality-95 hero is 545,740 bytes. Focused tests pass
  4/4, deterministic media checks pass, and the production build passes.
- Live static delivery validation: commit `982f278` deployed successfully as
  `6a66b5b8956465000851e342`. Production SSR contains the direct responsive hero
  preload and zero homepage `/_next/image` references. A first 1920px static
  request measured 0.474s TTFB / 0.848s total versus the prior transformed
  1.084s / 1.321s; its repeat measured 0.160s / 0.397s. A first 1080px request
  measured 0.291s / 0.458s. Owner-perceived verification remains pending.
- Owner acceptance: on 2026-07-27 the owner verified the final deployed image
  loading behavior and accepted the result (“good shit”).
