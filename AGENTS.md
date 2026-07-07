<!-- BEGIN:sitewright-agent-rules -->
# Sitewright Instructions for glamour-studio

Read `docs/README.md`, `docs/agent-handoff.md`, and `REPO_MAP.md` before broad
exploration. Then read only the active task and its named dependencies.

## Working rules

- Keep product intent, current implementation, and durable decisions aligned.
- Treat root `DESIGN.md` as the authoritative visual-system contract. Read it
  before changing layout, styling, typography, color, motion, visual hierarchy,
  imagery, component states, or interaction design.
- Make one independently verifiable outcome per task.
- Preserve semantic content, accessibility, and reduced-motion behavior.
- Prefer server components unless browser state or APIs require a client boundary.
- Use `next/link` for internal App Router navigation.
- Keep Sitewright out of the application runtime.
- Record durable decisions in ADRs and task-specific detail in task notes.
- Rewrite the handoff as current state rather than appending history.

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
<!-- END:sitewright-agent-rules -->
