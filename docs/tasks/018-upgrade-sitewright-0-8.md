# Upgrade Sitewright to 0.8

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner requested the upgrade on 2026-07-10

## Goal

Bring Glamour Studio's repository-native Sitewright setup onto schema and
template version 0.8.0 without changing application behavior or overwriting
owner-authored product and design intent.

## Scope

- Migrate `.sitewright/config.json` from schema 1 to schema 2.
- Refresh only the marked Sitewright block in `AGENTS.md`.
- Normalize product-spec heading casing required by structured diagnosis.
- Add a handoff freshness fingerprint while preserving detailed current state.
- Keep generated rollback backups local and ignored by Git.

## Suggested files

- `.sitewright/config.json`
- `AGENTS.md`
- `.gitignore`
- `docs/product-spec.md`
- `docs/agent-handoff.md`

## Acceptance criteria

- [x] Doctor passes policy-pack, config, Intent Stack, agent-rule, product,
  planning, and handoff checks.
- [x] Owner-authored intent and application code remain unchanged.
- [x] Rollback backups exist locally but are not committed.
- [x] The only Doctor warning is the expected absence of an active task.

## Validation

- Sitewright Doctor: `PLANNING_REQUIRED`; all setup and intent checks pass.
- `git diff --check`: passed.
- No build or browser validation was needed because application code did not
  change.

## Completion notes

- Completed: schema/config migration, managed-rule refresh, structured heading
  normalization, handoff fingerprint, and backup ignore rule.
- Validation: Doctor and diff checks passed.
- Deviations: no implementation task was created; the repository remains
  intentionally idle until the owner selects product work.
- Follow-up: create one scoped task before changing product behavior.

## Traceability

- Product outcome: durable cold-start continuity for future work.
- Implementation phase: repository setup maintenance.
- Changed files: setup and documentation only; no runtime files.
- Evidence: Sitewright Doctor output from 2026-07-10.
