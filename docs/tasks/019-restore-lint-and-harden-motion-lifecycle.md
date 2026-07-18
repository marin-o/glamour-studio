# Restore lint and harden motion lifecycle

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner

## Goal

Restore a working Next.js 16 lint quality gate and make the site-wide Lenis
integration respond correctly to reduced-motion changes without leaking its
GSAP ticker configuration after teardown.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Replace the removed `next lint` command with the supported ESLint CLI and
  Next.js Core Web Vitals flat configuration.
- Fix lint findings in the current application source when they represent
  concrete correctness or maintainability problems.
- Start or stop Lenis when `prefers-reduced-motion` changes at runtime.
- Remove Lenis, media-query, and GSAP ticker side effects during cleanup.
- Preserve current routes, copy, visual behavior, stroke geometry, and motion
  timing for users who have not requested reduced motion.

## Suggested files

- package.json
- package-lock.json
- eslint.config.mjs
- src/components/motion/SmoothScroll.jsx
- any application source named by the restored lint gate
- docs/agent-handoff.md
- docs/tasks/019-restore-lint-and-harden-motion-lifecycle.md

## Implementation steps

1. Add the supported ESLint CLI and Next.js Core Web Vitals configuration.
2. Run lint and repair actionable findings without broad style churn.
3. Refactor the Lenis effect into symmetric start/stop lifecycle handling.
4. Run lint, build, and Sitewright Doctor.
5. Record completion notes and refresh the handoff.

## Acceptance criteria

- [x] `npm run lint` invokes ESLint directly and exits successfully.
- [x] The lint configuration includes Next.js Core Web Vitals rules and ignores
      generated output.
- [x] Lenis is absent while reduced motion is requested, including after a
      live preference change, and can restart when the preference is removed.
- [x] Effect cleanup removes listeners/ticker callbacks and restores GSAP's
      default lag-smoothing behavior.
- [x] `npm run build` still statically prerenders all current routes.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not redesign the site or retune stroke geometry, reveal timing, or Lenis
  easing.
- Do not add browser, screenshot, or interaction validation under the current
  conservative policy.
- Do not change placeholder content or make owner-only business decisions.

## Risks and stop conditions

- Stop if the supported lint configuration requires suppressing substantive
  accessibility or React correctness rules; fix the source instead.
- Stop if lifecycle cleanup cannot preserve the task 017 smooth-scroll contract
  without owner-authorized interaction validation.

## Validation

- `npm run lint`
- `npm run build`
- Sitewright Doctor
- `git diff --check`
- No browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation is authorized for this task.

## Completion notes

- Transition: complete at 2026-07-09T23:20:51.779Z
- Validation: ESLint and build pass; Next internal-link lint violations fixed; Lenis reduced-motion lifecycle and stroke measurement cleanup hardened; dependency audit recorded with upstream PostCSS advisory.
- Approved by: Owner

- Transition: start at 2026-07-09T23:13:42.263Z

- Completed: replaced the removed Next 16 `next lint` command with the ESLint
  CLI and official Core Web Vitals flat config; repaired both internal-link
  violations the restored gate found on `/old`; made Lenis start/stop on live
  reduced-motion changes with symmetric media-query, ticker, event, and global
  lag-smoothing cleanup; prevented deferred font readiness from scheduling
  stroke measurement after unmount.
- Validation: `npm run lint` passed; `npm run build` passed and statically
  prerendered `/`, `/typography`, `/old`, and `/lookbook`; Sitewright Doctor
  reached `IMPLEMENTATION_READY` with only the expected stale-handoff warning;
  `git diff --check` passed. Lifecycle behavior was validated from the explicit
  start/stop source paths because browser/interaction validation was not
  authorized under the conservative policy.
- Deviations: no browser, screenshot, or interaction validation was run. A
  production dependency audit reports two moderate findings caused by Next
  16.2.10's bundled PostCSS 8.4.31; npm reports no fix available, while the
  separate Tailwind PostCSS dependency is already on 8.5.16.
- Follow-up: monitor the Next.js dependency for a PostCSS advisory fix; do not
  force an unsupported transitive override. Exact top-level framework versions
  remain expressed as `latest` and can be pinned in a separate dependency
  reproducibility task if the owner wants stricter update control.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `package.json`, `package-lock.json`, `eslint.config.mjs`,
  `src/app/old/page.jsx`, `src/components/motion/SmoothScroll.jsx`,
  `src/components/motion/MakeupStroke.jsx`, `REPO_MAP.md`, this task, and the
  refreshed handoff.
- Evidence: `.sitewright/evidence/019-restore-lint-and-harden-motion-lifecycle-md.json`
