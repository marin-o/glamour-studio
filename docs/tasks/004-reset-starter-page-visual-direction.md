# Reset starter page visual direction

Status: DONE
Depends on: None
Owner: AI-assisted implementation

## Goal

Nuke the weak starter-page visual direction and rebuild the app surface from
scratch using TasteSkill guidance while preserving the approved salon product
contract.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- TasteSkill `design-taste-frontend` is installed in `.agents/skills/`.
- Design read: local premium salon landing page for mobile-first local clients,
  with a soft editorial studio language and native CSS.
- Dials: DESIGN_VARIANCE 8, MOTION_INTENSITY 3, VISUAL_DENSITY 3.
- Current page was rejected by the owner as visually poor.
- Owner provided Framer reference:
  `https://cooperative-acknowledgment-789213.framer.app/`.

## Scope

- Replace `src/app/page.jsx` and `src/app/globals.css` wholesale.
- Preserve explicit placeholders for missing salon facts.
- Keep real booking unavailable until an owner-approved flow exists.
- Use image-led composition, asymmetric layout, restrained labels, and no equal
  three-card feature row.

## Suggested files

- src/app/page.jsx
- src/app/globals.css
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Apply TasteSkill design read and dials.
2. Replace the rejected starter page surface.
3. Run mechanical TasteSkill checks for visible page copy and layout tells.
4. Validate with conservative project checks.
5. Record completion notes and refresh the handoff.

## Acceptance criteria

- [x] The rejected visual direction is replaced, not patched.
- [x] TasteSkill guidance is applied to the visible page.
- [x] The implementation follows the product spec and planning docs.
- [x] Any owner-only decisions remain explicit rather than invented.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not add deployment, CMS, payments, accounts, analytics, live booking,
  localization toggles, or other unapproved systems.

## Risks and stop conditions

- Stop if required product details are missing and a reasonable provisional value would affect launch truth.
- Stop if accessibility, mobile behavior, or fallback behavior is undefined for the slice.

## Validation

- Run `npm run build`.
- Run Sitewright Doctor.
- Run a source scan for visible em dashes and obvious AI-tell strings.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.

## Completion notes

- Completed: Replaced the rejected page with an approved-reference-aligned
  surface: cream paper background, oversized centered serif hero, large rounded
  image/video placeholder, lookbook tile grid, artist placeholder cards, split
  about/booking section, and a slim sticky navbar with section links.
- Validation: `npm run build` passed. Sitewright Doctor passed with this task
  active. Source scan found no em dashes or obvious AI-tell strings in
  `src/app`.
- Deviations: Used a rendered Framer page as the visual reference. Browser
  screenshot automation through local Playwright was unavailable, so visual
  inspection used the in-app browser.
- Follow-up: Create the next scoped task for replacing placeholders with
  owner-approved salon facts, real media, or implementing the chosen contact
  flow.
