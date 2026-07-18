# Place the history bridge in the root head

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner (reported the Next.js console and hydration errors)

## Goal

Restore valid root-document markup while keeping the browser-history transition
bridge early enough to intercept Back/Forward navigation before Next.js.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Scope

- Move the `beforeInteractive` history bridge into the root layout's explicit
  `<head>`.
- Preserve the bridge code and transition behavior.
- Record the corrected document-structure requirement in the current handoff.

## Suggested files

- src/app/layout.jsx
- docs/agent-handoff.md
- docs/tasks/045-place-the-history-bridge-in-the-root-head.md

## Implementation steps

1. Place the existing `beforeInteractive` script within an explicit root
   `<head>`.
2. Run lint, production build, diff checks, and Sitewright Doctor.
3. Record completion notes and refresh the handoff.

## Acceptance criteria

- [x] `<html>` contains the explicit `<head>` and `<body>` document children,
  rather than a direct `<script>` child.
- [x] The bridge remains a `beforeInteractive` Next.js script.
- [x] The existing transition bridge implementation is otherwise unchanged.
- [x] Lint, production build, diff checks, and Sitewright Doctor pass.

## Non-goals

- Do not implement unrelated phases.
- Do not redesign or retime the page transition.
- Do not add deployment, CMS, payments, accounts, or other unapproved systems.

## Risks and stop conditions

- Stop if Next.js does not support the bridge in the explicit root `<head>`.

## Validation

- Select commands and owner/manual checks before implementation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-18T11:04:39.752Z
- Validation: pnpm lint, pnpm build, git diff --check, and Sitewright Doctor passed; browser validation not run under conservative policy

- Transition: start at 2026-07-18T11:03:34.698Z

- Completed: Moved the existing history transition `<Script>` from a direct
  `<html>` child into an explicit root `<head>`, preserving
  `strategy="beforeInteractive"` and the bridge implementation.
- Validation: `pnpm lint`, `pnpm build` (including the lookbook media check),
  `git diff --check`, and Sitewright Doctor passed. Browser validation was not
  run under the repository's conservative validation policy.
- Deviations: None.
- Follow-up: If the transition timing or behavior still differs in a live
  browser, the owner can explicitly authorize browser interaction validation.

## Traceability

- Product outcome: Browser history navigation preserves the shared page-transition experience.
- Implementation phase: Route-transition defect correction
- Changed files: `src/app/layout.jsx`, `docs/tasks/045-place-the-history-bridge-in-the-root-head.md`, `docs/agent-handoff.md`
  `docs/tasks/045-place-the-history-bridge-in-the-root-head.md`,
  `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/<task-id>.json`
