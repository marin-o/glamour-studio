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
- Do not reload a skill or durable project document already read in the current
  turn unless it changed or a concrete missing detail requires it.

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

## Animation libraries

- Use an animation library for every implemented animation rather than bespoke
  CSS keyframes, Web Animations API sequences, or `requestAnimationFrame` loops.
- Default to Motion/Framer Motion for text animation.
- Default to GSAP for other motion, scroll choreography, and timeline work.
- Either library may be used outside its default role when it is the clearer
  technical fit.
- When the choice differs from the default and is not self-evident, record the
  reasoning in the active task.
- Do not automatically install Motion or GSAP. Add dependencies only when an
  approved task concretely requires them.

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

For an existing repository, do not invoke Sites building or hosting workflows
unless `.openai/hosting.json` exists or the owner explicitly requests Sites,
publishing, hosting, or deployment. Ordinary local application changes use the
repository's own development workflow.

## Validation policy

Validation posture: `conservative`.

- `conservative`: do not run browser, viewport, screenshot, Playwright, visual,
  animation, or interaction validation unless the owner explicitly requests it.
  Do not compensate by automatically running every static check. If rendered
  behavior is essential and cannot be checked, leave that criterion awaiting
  owner verification rather than claiming completion.
- `standard`: browser and viewport checks are allowed when a UI task's
  acceptance criteria depend on rendered behavior; keep them proportional.
- `visual`: screenshot, viewport matrix, animation, and interaction checks are
  allowed when proportional to visual or motion-heavy work.

When task instructions and this policy disagree, follow the stricter validation
boundary and record the deviation in task notes.

Choose validation by changed surface:

- Documentation, task metadata, evidence, and handoff-only changes need at most
  formatting or diff checks.
- Copy, constants, localized styling, and isolated component tuning normally
  need only a targeted static check when one adds confidence.
- Runtime structure, routing, dependencies, build configuration, or broad
  component changes may require lint, typecheck, tests, or a production build.
- Rendered UI, motion, and interaction behavior should use one proportional
  rendered check when policy permits it.

Run each selected check once after the implementation is final. Rerun only a
check invalidated by a subsequent runtime change or after fixing that check's
failure. Task notes, evidence, and handoff edits do not invalidate a successful
lint, test, or build. Run Doctor only when Sitewright configuration, product,
planning, task lifecycle, or handoff state changed, and run it once after those
changes settle.

## Configurable workflow policies

- Git policy: `manual`. Under `manual`, do not commit unless requested.
  Under `commit-required`, commit coherent file changes before handoff.
- Task policy: `single-active`. Under `single-active`, do not create or start a
  second executable task until the current one is completed or superseded.
- Design rigor: `standard`. Read and update `DESIGN.md` in proportion to
  this setting and the task's visual impact.
- Approval policy: `owner-decisions`. Keep required owner decisions or
  completion approvals explicit and record the approver in task evidence.
  Authorization to implement is not approval of the completed result.

## Task granularity and review

- A task represents one independently deliverable outcome, not every edit or
  owner message.
- Bug fixes, tuning, and corrections received while an outcome is still under
  review remain part of that task. Do not create a follow-up task merely because
  the first implementation attempt was marked complete too early.
- For UI, motion, or interaction work, keep the task active until observable
  acceptance criteria are verified under the configured policy or the owner
  explicitly accepts the result.
- Create a follow-up task only for a genuinely separate outcome or explicitly
  deferred work.

## Coding subagent orchestration

- For substantive coding work, the main agent must orchestrate implementation,
  adversarial review, and correction through role-appropriate subagents.

### Implementation role selection

- Use the `terra_high` role (Terra high) to implement complex non-UI coding.
- Choose Luna reasoning proportionally for non-complex implementation:
  - Use `luna_low` for a fully specified atomic mechanical edit that needs
    virtually no discovery or judgment, such as flipping an explicit boolean or
    literal, or replacing one asset with an exact source-to-target mapping.
  - Use `luna_medium` for a small localized change that needs light context or
    coordination, such as a batch of explicitly mapped image swaps,
    straightforward copy/prop/config updates, or a mechanical UI adjustment
    with no design decision.
  - Use `luna_xhigh` for simpler coding or UI implementation that still involves
    meaningful behavioral, visual, accessibility, compositional, or multi-file
    judgment.
- Choose by required judgment, not file type alone. A precisely mapped image
  swap may be Luna low or medium; an image-led layout change with responsive or
  art-direction decisions is Luna xhigh.

### Review and execution protocol

- Spawn a `sol_high` reviewer (Sol high) only after the implementer finishes.
  Give the reviewer the task, acceptance criteria, changed-file context, and
  instructions to inspect the implementation adversarially.
- If the review finds actionable issues, spawn a separate fixer. Choose
  `terra_high`, `luna_xhigh`, `luna_medium`, or `luna_low` from the correction's
  actual complexity and required judgment, not automatically from the original
  task. Give the fixer the complete adversarial review report plus focused
  correction and validation instructions.
- Spawn each subagent with no inherited conversation turns (`fork_turns:
  "none"`) unless the user explicitly asks for conversation context to be
  inherited. Never rely on prior chat context that the subagent did not receive.
- Give every implementer or fixer a self-contained brief, or point it to the
  active task file and add the missing execution detail. For coding and UI work,
  state what to change, where to change it, and how the result should work,
  including relevant constraints and acceptance checks.
- Treat implementation briefs as informed guidance, not an inflexible design.
  The subagent may choose a better approach when it explains the reason and
  still satisfies the task.
- The default substantive-work cycle is implementer, then reviewer, then fixer
  when review findings exist. The main agent remains responsible for
  orchestration, integrating the result, and final validation.
- User instructions override this workflow. The main agent may also handle very
  simple incremental fixes or implementations directly when the full cycle
  would be disproportionate.

## Workflow

1. Read `docs/README.md`, `AGENTS.md`, `docs/agent-handoff.md`, and
   `REPO_MAP.md`.
2. Read only the relevant task, spec, design, or ADR sections for the change.
3. Make the smallest coherent change and avoid duplicate guidance or scripts.
4. Update `DESIGN.md` when durable visual language, tokens, components, motion,
   media, interaction states, or anti-patterns change, not for correctness fixes
   or parameter tuning that preserve the existing contract.
5. Update `REPO_MAP.md` only when ownership boundaries or architecture change,
   preserving its one-line-per-file format.
6. Record task detail when scope, status, validation evidence, deviations, or
   durable implementation facts materially change.
7. Refresh `docs/agent-handoff.md` only at a real continuity boundary described
   below.

## Logging & handoff

- `docs/agent-handoff.md` is a short current-state file, not a changelog.
- An assistant response is not automatically a handoff boundary.
- Refresh the handoff when work will move to another task, thread, or agent;
  readiness or owner decisions materially change; or the owner explicitly asks
  for it. Do not refresh it after ordinary within-thread implementation,
  tuning, validation attempts, or review corrections.
- Preserve project-authored owner decisions and durable gotchas when refreshing
  managed Sitewright state.
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
