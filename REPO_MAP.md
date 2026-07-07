# glamour-studio Repository Map

Map one file or narrow ownership boundary per line. Add change recipes for
common work so agents can inspect the smallest relevant file set.

## Runtime flow

- Request enters the Next.js App Router under `src/app/`, composes product UI and content modules, then renders accessible HTML/CSS for the user.

## Ownership

- `src/app/`: route entrypoints, layouts, metadata, and page composition.
- `src/components/`: reusable UI, layout, and product section components.
- `src/lib/`: shared helpers and product-facing data utilities when needed.
- `docs/`: durable product intent, design constraints, implementation plan, tasks, ADRs, and handoff.

## Cross-file invariants

- Product-facing copy, structure, and launch blockers must stay aligned with `docs/product-spec.md`.
- Active implementation work must have exactly one scoped task in `docs/tasks/`.
- Current-state guidance belongs in `docs/agent-handoff.md`, not chat history.

## Change recipes

- Product slice: start with `docs/product-spec.md`, active task, `src/app/`, and relevant `src/components/`.
- Design refinement: start with `DESIGN.md`, active task, and affected components/styles.
- Planning or scope change: start with `docs/implementation-plan.md`, `docs/tasks/`, and `docs/agent-handoff.md`.
