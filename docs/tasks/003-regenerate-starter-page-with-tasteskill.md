# Regenerate starter page with TasteSkill

Status: DONE
Depends on: None
Owner: AI-assisted implementation

## Goal

Regenerate the starter page using the installed TasteSkill
`design-taste-frontend` guidance while preserving the approved salon product
contract.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- TasteSkill was installed into `.agents/skills/design-taste-frontend`.
- Design read: local premium-consumer salon landing page for local clients,
  with a soft editorial studio language, using native CSS and generated
  placeholder media.
- Dials: DESIGN_VARIANCE 7, MOTION_INTENSITY 3, VISUAL_DENSITY 4.

## Scope

- Replace the starter page composition with a TasteSkill-informed layout.
- Avoid centered hero bias, three equal feature cards, generic template rhythm,
  invented salon facts, fake booking availability, and final-looking placeholder
  content.
- Use generated project-local placeholder media until real salon media exists.

## Suggested files

- src/app/page.jsx
- src/app/globals.css
- public/media/
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Read the installed TasteSkill instructions.
2. Regenerate the starter page composition.
3. Run the TasteSkill pre-flight checks that apply to this scope.
4. Validate with conservative project checks.
5. Record completion notes and refresh the handoff.

## Acceptance criteria

- [x] TasteSkill is installed and its instructions were applied.
- [x] The starter page is regenerated, not merely nudged.
- [x] The implementation follows the product spec and planning docs.
- [x] Any owner-only decisions remain explicit rather than invented.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not implement unrelated phases.
- Do not add live booking, localization toggle, deployment, CMS, payments,
  accounts, analytics, cookies, or other unapproved systems.

## Risks and stop conditions

- Stop if required product details are missing and a reasonable provisional value would affect launch truth.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined for the slice.

## Validation

- Run `npm run build`.
- Run Sitewright Doctor.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.

## Completion notes

- Completed: Installed TasteSkill `design-taste-frontend`, regenerated the
  starter page with an asymmetric image-led composition, removed the equal
  three-card service row, reduced repetitive labels, added two project-local
  temporary generated media assets, preserved honest placeholders, and kept
  booking non-live.
- Validation: `npm run build` passed. Sitewright Doctor passed with
  IMPLEMENTATION_READY while this task was active. HTTP smoke check returned
  200 and confirmed the regenerated hero text is served at `127.0.0.1:3000`.
  Mechanical page-source scan found no em dashes or common AI-tell strings in
  `src/app`.
- Deviations: No browser, screenshot, viewport, Lighthouse, or visual automation
  was run because the repository validation policy is conservative.
- Follow-up: Create the next scoped task for owner-approved content, real salon
  media, booking/contact behavior, or visual QA if the owner wants rendered
  screenshot review.
