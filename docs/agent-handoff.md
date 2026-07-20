# Agent Handoff

<!-- BEGIN:sitewright-handoff-state -->
<!-- sitewright:fingerprint=1bc0055f77debc08 -->
## Sitewright state

- Sitewright Doctor reports `IMPLEMENTATION_READY` using `nextjs-app-router` policy pack.
- The repository has structured intent, coherent planning, and an executable task.
- Active task: 048-refine-navigation-copy-and-lookbook-controls.md.
<!-- END:sitewright-handoff-state -->

## Current state

- Task 047 is owner-approved and complete. `/old` and its route-only assets are
  removed; the app server-renders provisional Macedonian copy by default and
  exposes a plain-text `EN`/`MK` toggle as the leftmost control in the
  single-row persistent bottom navigation. Root-level in-memory language state
  follows client-side navigation between the homepage and Lookbook and resets
  on full reload. Static checks and the production build pass; automated
  rendered validation was not run under the conservative policy.
- Task 048 remains active for owner-rendered review. Its runtime and
  documentation changes are implemented: desktop navigation now shrink-wraps
  around a desktop-only confirmed-address action and the existing controls; the
  services heading is concise and centered; confirmed contact facts no longer
  read as provisional; and the Lookbook has an accessible arrow-only return,
  desktop utility navigation, no visible helper legends, and no linked-image
  scale behavior. Homepage scroll position is held in visit-local transition
  memory and restored behind the closed curtain on arrow or browser-history
  returns. Lint and the production build pass. Conservative policy leaves the
  affected desktop, mobile, hover, focus, scroll-continuity, and layout
  presentation awaiting owner verification.
- Task 046 is owner-approved and complete. The existing hero image remains the
  curtain's single source: GSAP opens and holds the sharp window while the real
  services section arrives through normal scroll, and the makeup stroke begins
  at the service surface rather than crossing the photograph.
- The browser-history transition bridge remains a `beforeInteractive` script
  inside the root layout's explicit `<head>`, with a 2.4s fail-open path.
- `/lookbook` retains quality-100 responsive images, generated dimensions,
  route-local horizontal Lenis, relaxed centering, and exact pip progress. The
  label `Lookbook` remains untranslated while the surrounding route copy and
  meaningful accessibility text follow the visit-local language.
## Open owner decisions

- Keep unresolved product, launch, content, and business-truth decisions explicit in product specs or active tasks.
- The displayed phone number, street address, Maps destination, and Instagram
  profile are owner-confirmed. Final Macedonian and English marketing copy,
  services, prices, hours, booking behavior, and any additional messaging
  channels remain unapproved and replaceable.
- All nine development lookbook JPEGs are only 640px wide; approved
  production-resolution originals remain required for true high-density
  crispness.
- Website reuse and recognizable-person permissions remain unapproved; keep the
  route noindex and visibly disclosed.

## Durable gotchas

- Read `AGENTS.md`, `docs/agent-handoff.md`, `REPO_MAP.md`, and the active task before broad source exploration.
- Refresh this handoff whenever product, planning, policy, or active-task state changes.
- Keep history interception pre-hydration; reacting only after `usePathname`
  changes allows Next to visibly swap the route before the curtain.
- Same-page fragment history must bypass the route curtain because hash changes
  do not produce a new App Router pathname or reveal trigger.
- A root `beforeInteractive` history script must live inside the explicit
  `<head>`, never as a direct `<html>` child.
