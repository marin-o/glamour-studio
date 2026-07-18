# Agent Handoff

<!-- BEGIN:sitewright-handoff-state -->
<!-- sitewright:fingerprint=bbdee09b56bf0be9 -->
## Sitewright state

- Sitewright Doctor reports `IMPLEMENTATION_READY` using `nextjs-app-router` policy pack.
- The repository has structured intent, coherent planning, and an executable task.
- Active task: 046-add-a-scroll-driven-curtain-reveal-to-the-hero-image.md.
<!-- END:sitewright-handoff-state -->

## Current state

- Task 046 now uses the existing hero image as its single source: GSAP retracts
  the backdrop-blur veil and hero foreground early to expose a held sharp window
  around 78% of viewport height, then advances a services-colored cover while
  retaining a narrow photo slit. The stroke has a permanent localized route
  break across the maximum photo band while downstream text and paint keep
  their normal viewport timing. Owner-authorized browser validation passed;
  owner completion approval remains pending.
- The browser-history transition bridge remains a `beforeInteractive` script
  inside the root layout's explicit `<head>`, with a 2.4s fail-open path.
- `/lookbook` retains quality-100 responsive images, generated dimensions,
  route-local horizontal Lenis, relaxed centering, and exact pip progress.
## Open owner decisions

- Keep unresolved product, launch, content, and business-truth decisions explicit in product specs or active tasks.
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
- A root `beforeInteractive` history script must live inside the explicit
  `<head>`, never as a direct `<html>` child.
