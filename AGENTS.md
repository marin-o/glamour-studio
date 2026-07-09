<!-- BEGIN:sitewright-agent-rules -->
# Sitewright Instructions for glamour-studio

## Project map

Policy pack: `nextjs-app-router` (Next.js App Router).

- `src/app` or `app`: routes, layouts, server components, and page composition.
- `src/components` or `components`: reusable interface components.
- `public`: static assets shipped directly by Next.js.

- `docs/`: durable product, implementation, ADR, task, and handoff documents.
- `DESIGN.md`: authoritative visual-system contract.
- `REPO_MAP.md`: current ownership map; read it before broad code exploration.

## Commands

- Package manager: use the project `packageManager` field when present.
- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`
- Lint: `pnpm lint`

If the generated project uses npm, yarn, or bun instead of pnpm, translate the
commands to that package manager without changing the workflow.

## Context budget rules

- Start with `AGENTS.md`, `docs/agent-handoff.md`, and `REPO_MAP.md`.
- Read only the smallest file set needed for the current task.
- Prefer durable docs and helper output over long chat history.
- Use targeted searches and file-scoped reads instead of broad source scans.
- Do not re-read large specs unless the task actually depends on them.
- Keep always-loaded instructions short; move lasting detail into docs.

## Command output rules

- Prefer compact summaries over raw logs, full diffs, or recursive listings.
- Keep Git inspection commands to the minimum needed for the task.
- When a diff is necessary, inspect only the relevant files.
- Quote only the lines that matter when reporting command results.
- Do not dump build, lint, or test output unless failure details are needed.

## Token discipline

- Locate symbols with search first, then open only the relevant range.
- Start from the task's suggested files and read outward only when a concrete
  dependency requires it.
- Do not inspect generated, dependency, build, cache, or binary/media folders
  unless the task explicitly depends on them.
- Decide the validation checklist up front and measure each item once.

## Working rules

- Keep product intent, current implementation, and durable decisions aligned.
- Treat root `DESIGN.md` as the authoritative visual-system contract. Read it
  before changing layout, styling, typography, color, motion, visual hierarchy,
  imagery, component states, or interaction design.
- Make one independently verifiable outcome per task.
- Preserve semantic content, accessibility, and reduced-motion behavior.
- Framework guidance: Prefer server components until browser state or browser APIs require a client boundary. Use `next/link` for internal navigation.
- Keep Sitewright out of the application runtime.
- Record durable decisions in ADRs and task-specific detail in task notes.
- Rewrite the handoff as current state rather than appending history.
- Use semantic HTML and accessible React composition for real product content.
- Prefer co-located component styles or the project-approved styling system;
  keep global styles for tokens, base elements, and shared primitives.

## Optional tooling

Do not install optional packages just because they were useful in the source
repo. Mention and add them only when product intent, design direction, or an
approved task makes the need concrete:

- `culori`: color math for OKLCH palette generation, contrast repair, and
  advanced theme tooling.
- `sharp`: image processing for optimization, intrinsic dimensions, and media
  manifests.
- `puppeteer-core`: browser automation for screenshots, performance inspection,
  or Chrome diagnostics. Do not add it under conservative validation unless the
  owner explicitly approves browser-based validation.
- `subset-font`: custom font subsetting for font-production workflows.

## Validation policy

Validation posture: `conservative`.

- `conservative`: do not run browser, viewport, screenshot, Playwright, visual,
  animation, or interaction validation unless the owner explicitly requests it.
  Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.
- `standard`: browser and viewport checks are allowed when a UI task's
  acceptance criteria depend on rendered behavior; keep them proportional.
- `visual`: screenshot, viewport matrix, animation, and interaction checks are
  allowed when proportional to visual or motion-heavy work.

When task instructions and this policy disagree, follow the stricter validation
boundary and record the deviation in task notes.

Run the smallest verification set that proves the active task. Under
`conservative`, request owner permission before browser or visual checks. Under
`standard` or `visual`, rendered checks are allowed when acceptance criteria
depend on them.

## Configurable workflow policies

- Git policy: `manual`. Under `manual`, do not commit unless requested.
  Under `commit-required`, commit coherent file changes before handoff.
- Task policy: `single-active`. Under `single-active`, do not create or start a
  second executable task until the current one is completed or superseded.
- Design rigor: `standard`. Read and update `DESIGN.md` in proportion to
  this setting and the task's visual impact.
- Approval policy: `owner-decisions`. Keep required owner decisions or
  completion approvals explicit and record the approver in task evidence.

## Workflow

1. Read `docs/README.md`, `AGENTS.md`, `docs/agent-handoff.md`, and
   `REPO_MAP.md`.
2. Read only the relevant task, spec, design, or ADR sections for the change.
3. Make the smallest coherent change and avoid duplicate guidance or scripts.
4. Update `DESIGN.md` when durable visual language, tokens, components, motion,
   media, interaction states, or anti-patterns change.
5. Update `REPO_MAP.md` only when ownership boundaries or architecture change,
   preserving its one-line-per-file format.
6. Before ending the session, record durable per-task detail in the relevant
   `docs/tasks/*.md` file and refresh `docs/agent-handoff.md` per
   "Logging & handoff".

## Logging & handoff

- `docs/agent-handoff.md` is a short current-state file, not a changelog.
- Rewrite its sections in place to reflect the present state; never append a
  running history.
- Keep it to current state, open task, parked directions needing owner reopen,
  and durable gotchas not recorded elsewhere.
- Put per-task completion notes, deviations, and validation results in that
  task's `docs/tasks/*.md` file.
- Keep `REPO_MAP.md` to one line per file; deeper implementation detail belongs
  in the file itself, `DESIGN.md`, an ADR, or task docs.

## Source control

- Follow the configured Git policy above.
- Never push unless the owner explicitly requests or confirms the push.
- Never add co-author trailers or otherwise credit an agent in commit messages.
<!-- END:sitewright-agent-rules -->
