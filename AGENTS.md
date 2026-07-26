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

- Start with `docs/README.md`, `AGENTS.md`, `docs/agent-handoff.md`, and
  `REPO_MAP.md`.
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

## Delegated reconnaissance

- Keep the main agent's direct reading compact: it may read the mandatory
  startup documents (`docs/README.md`, `AGENTS.md`, `docs/agent-handoff.md`,
  and `REPO_MAP.md`), the exact files named by the active task's change recipe,
  active task and review artifacts, final diffs, and the smallest
  integration-critical code regions needed for orchestration or verification.
  Exact targeted searches and a tiny, obvious code slice may remain direct main
  work. Broader spec, design, or ADR reading beyond those exact sections must
  be delegated to bounded Luna reconnaissance.
- Broad or multi-file codebase reading and understanding MUST use a read-only
  Luna reconnaissance subagent. Use `luna_medium` for bounded questions about
  symbols, modules, components, or flows across related files; use `luna_high`
  for ambiguous cross-module, cross-subsystem, architectural, or data-flow
  synthesis.
- Do not ask a reconnaissance subagent to "understand the whole repo" or give
  another vague scope. Spawn it with `fork_turns: "none"`, a self-contained
  bounded question, relevant paths, and the active-task pointer. It must not
  edit files. Require a report with file/line citations, relevant
  symbols/relationships, facts versus inferences, uncertainties, and suggested
  next reads.
- The main agent synthesizes reconnaissance reports and verifies only
  high-risk or integration-critical details. Do not reread everything already
  summarized by a report; read a new region only when a cited uncertainty or
  concrete dependency requires it.

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

### Mandatory implementation delegation

- Before making any implementation-file edit, the main agent MUST delegate
  every coding implementation to a role-appropriate subagent, regardless of
  size. This includes source code, tests, styles, scripts, migrations,
  implementation configuration, UI/component/layout implementation, generated
  code, direct asset files or replacements, and asset mappings.
- The main agent MUST NOT directly write or edit source code, tests, styles,
  scripts, migrations, implementation configuration, UI/components/layouts,
  generated code or generated files, direct asset files or replacements, or
  asset mappings.
- Atomic one-line changes such as flipping an explicit boolean or literal and a
  single exact image/asset replacement are not exceptions; delegate the single
  exact replacement to `luna_low`.
- The only override is an explicit user instruction for this task that the main
  agent should implement directly. General user preferences or instructions
  for another task do not authorize direct coding here. Urgency, perceived
  simplicity, unavailable subagents, or orchestration overhead are not implicit
  exceptions.
- If the required subagent role or capability is unavailable, the main agent
  must stop and report the blocker rather than silently implementing.
- The main agent may act directly on planning, bounded read-only inspection
  within the direct-read set above, task/lifecycle/handoff documentation, and
  spawning and orchestration. Direct validation is limited to read-only checks,
  build/test commands, and
  deterministic generation from already-delegated canonical sources. Auto-fix,
  codegen, and any command that authors implementation remain delegated. Git is
  limited to staging, committing, and integrating already-delegated changes;
  implementation conflict resolution remains delegated. Generated files cannot
  be manually corrected.

### Direct deterministic filesystem operations

- A narrow exception expressly supersedes mandatory implementation delegation
  only when the main agent executes fully specified filesystem choreography:
  create a known destination directory, then move, copy, or rename explicitly
  identified individual files using exact literal source and destination paths
  or an exact supplied mapping.
- Before any mutation, perform read-only verification that every source exists;
  resolve and verify that the destination remains within the intended
  repository or scope; confirm there is no destination collision, overwrite, or
  ambiguous merge; and preserve file contents. The operation must require no
  discovery, candidate selection, transformation, design judgment, or
  content/code edit. Exact targeted searches for old references are allowed as
  direct read-only verification.
- Source removal is allowed only when it is inherent to an exact move or
  rename. Independent deletion, recursive directory moves, wildcard or
  glob-driven mutation, destination overwrite, ambiguous merge, broad computed
  targets, unresolved environment variables, and guessed paths identifying
  mutation targets are excluded.
- Exact asset replacement remains delegated to `luna_low`. Image
  transformation or optimization, generated asset mappings,
  import/reference/manifest edits, code/config/test/style changes, and choosing
  or discovering which files should move remain delegated through the
  Luna/Terra ladder.
- A command that formats, generates, rewrites, auto-fixes, or otherwise authors
  implementation content remains delegated even when it runs in a shell. The
  main agent should not spawn a subagent solely to type an allowed `mkdir`,
  move, copy, or rename command. If a relocation also requires reference or
  code changes, the main agent performs only the allowed filesystem portion
  directly and delegates the implementation edits.
- Mandatory coding delegation and the Luna/Terra ladder otherwise remain
  unchanged; an unavailable coding subagent remains a blocker for actual
  implementation edits. This exception does not alter the exceptional-risk
  review gate.

### Implementation role selection

- Use the `terra_high` role (Terra high) to implement complex non-UI coding.
- Choose Luna reasoning proportionally for non-complex implementation:
  - Use `luna_low` for a fully specified atomic mechanical edit that needs
    virtually no discovery or judgment, such as flipping an explicit boolean or
    literal, or a single exact image/asset replacement with an exact
    source-to-target mapping.
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

### Proportional review gate

  - Before implementation, the main agent MUST classify the changed surface and
    record the default review posture in the task brief or active task: `none`
    or `adversarial`. This default classification is mandatory unless the user
    explicitly requests a different review posture or review ceremony for this
    task. Do not infer or volunteer adversarial review for ordinary low-risk
    work merely because an override is possible.
#### Exceptional-risk threshold

  - Apply this automatic classification: use `adversarial` when one hard
    trigger applies, or when at least two distinct soft factors coexist. A
    single soft factor is insufficient. Otherwise use `none`. Concrete hard or
    combined-soft risk takes precedence over the non-triggers below, even for a
    mechanically small edit.
  - Hard triggers are security; authentication or authorization; secrets;
    privacy; payments; destructive or persistent data changes; migrations;
    concurrency or race-condition risk; production infrastructure, deployment,
    permissions, or rollback-sensitive changes; public API or schema
    compatibility; genuinely cross-cutting architecture with a large blast
    radius; or an explicit user request for adversarial review or a different
    review ceremony.
  - Soft factors are unresolved ambiguity; changes across several independently
    owned subsystems; meaningful automated validation unavailable; an unfamiliar
    or historically fragile area; a large dependency or runtime upgrade; and
    failure that is difficult to detect or recover from. Two distinct soft
    factors must coexist before they trigger `adversarial`.
  - Multiple files; an ordinary component or feature; UI, styling, or animation;
    copy or assets; a localized bug fix with clear reproduction and validation;
    and a behavior-preserving refactor are not adversarial triggers on their
    own.
  - Under `none`, use the default flow: implementer, then main-agent final-diff
    inspection, then proportional validation. Do not spawn Sol or plan a fixer.
    If validation fails, delegate a correction through the Luna or Terra ladder
    and revalidate; retain `none` unless new risk or scope changes the
    classification.
  - Under `adversarial`, use the exceptional flow: implementer, then main-agent
    integration inspection and proportional validation, then one `sol_high`
    reviewer (Sol high) for the coherent task. Give the reviewer the task,
    acceptance criteria, changed-file context, and instructions to inspect the
    implementation adversarially. Spawn a separate fixer only when the complete
    review report has actionable findings. Choose `terra_high`, `luna_xhigh`,
    `luna_medium`, or `luna_low` from the correction's actual complexity and
    required judgment, and give the fixer the complete report plus focused
    correction and validation instructions. No fixer is needed when the report
    has no actionable findings.
  - Review one coherent task once. Do not adversarially review incremental
    corrections or review the fixer again unless its correction materially
    expands scope or introduces a new hard-risk surface. Do not create a
    recursive review loop.
- Implementation and any review-fix corrections remain delegated through the
  role ladder, regardless of review posture.
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
- The `adversarial` cycle is exceptional and has one reviewer for the coherent
  task, then a conditional fixer when actionable findings exist. The main agent
  remains responsible for orchestration, integrating the result, and final
  validation.
- Any review-fix implementation must be delegated through the same role ladder,
  including atomic corrections. A direct review fix requires the same explicit
  per-task user instruction described above.

## Workflow

1. Read `docs/README.md`, `AGENTS.md`, `docs/agent-handoff.md`, and
   `REPO_MAP.md`.
2. Read only the exact task, review artifact, or spec, design, or ADR section
   named by the active task/change recipe or required for an integration-critical
   slice. Delegate broader spec, design, or ADR reading to bounded Luna
   reconnaissance.
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
