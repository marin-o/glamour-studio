# Replace placeholders with owner content and media plan

Status: DONE
Depends on: None
Owner: AI-assisted implementation

## Goal

Turn the approved starter page from a visually workable placeholder into a
truthful salon draft by replacing only owner-confirmed content and preparing
clear media replacement slots for the real salon assets.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/agent-handoff.md
- src/app/page.jsx
- src/app/layout.jsx
- src/app/globals.css

## Current repo notes

- The approved starter direction is implemented in `src/app/` and follows the
  owner-provided visual reference.
- Confirmed salon name is Glamour Studio.
- Draft service categories are haircuts, hairstyling, and makeup.
- Address, hours, phone, prices, staff names, photos, and video remain
  placeholders by owner decision.
- Booking is intentionally not live. Do not imply real availability.
- Current media surfaces are placeholder slots, not final real salon assets.
- TasteSkill `design-taste-frontend` is installed at
  `.agents/skills/design-taste-frontend` and should guide visual restraint.

## Scope

- Replace placeholder text only where the owner provides confirmed facts.
- Update metadata in `src/app/layout.jsx` if the final salon name, location, or
  description is confirmed.
- Update visible page copy in `src/app/page.jsx` for confirmed:
  salon name, tagline, services, staff/service categories, contact channels,
  address, hours, and booking/contact wording.
- Prepare media replacement paths and labels for real salon assets, such as hero
  video/poster, studio photos, lookbook tiles, and staff/service imagery.
- Keep explicit placeholder language anywhere facts remain unconfirmed.
- Refresh `docs/agent-handoff.md` with current content/media state and the next
  owner decision.

## Suggested files

- src/app/page.jsx
- src/app/layout.jsx
- src/app/globals.css
- public/media/
- docs/agent-handoff.md
- docs/tasks/005-replace-placeholders-with-owner-content-and-media-plan.md

## Implementation steps

1. Inspect the active task, product spec, design contract, current page, and
   handoff.
2. Identify which salon facts and media assets are owner-confirmed in the
   current conversation or provided files.
3. Apply confirmed facts to metadata and page copy without inventing missing
   details.
4. Replace or prepare media references only for assets actually provided in the
   workspace or clearly confirmed by the owner.
5. Preserve the approved starter layout unless a confirmed content/media change
   requires a small fit adjustment.
6. Record remaining placeholders, validation, and next owner decision in the
   task and handoff.

## Acceptance criteria

- [x] Confirmed salon facts replace their corresponding placeholders.
- [x] Unconfirmed facts remain visibly placeholder or pending.
- [x] No fake availability, fake prices, fake address, fake testimonials, fake
  staff claims, or fake review/award claims are introduced.
- [x] Media slots are either connected to provided real assets or clearly marked
  as pending.
- [x] Metadata remains truthful and aligned with visible content.
- [x] The approved starter visual direction is preserved.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not redesign the approved starter direction.
- Do not implement live booking, Google Calendar availability, payments,
  accounts, CMS, analytics, cookies, localization toggles, deployment, or legal
  policy text unless explicitly provided and scoped by the owner.
- Do not generate or invent final salon photography, staff details, prices,
  address, hours, reviews, or service claims.
- Do not create a backlog of extra tasks.

## Risks and stop conditions

- Stop if the owner asks for launch-ready content but final business facts are
  still missing.
- Stop if a provided media asset is too low quality, incorrectly licensed,
  personally sensitive, or visually inconsistent enough that using it would make
  the site feel misleading.
- Stop before adding a form that collects personal data unless privacy/legal copy
  and submission destination are confirmed.
- Stop if copy needs Macedonian translation and the owner has not provided or
  approved the translation.

## Validation

- Run `npm run build`.
- Run Sitewright Doctor.
- Run a source scan for obvious placeholder leakage and banned fake claims.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.

## Completion notes

- Completed:
  - Applied the confirmed salon name: Glamour Studio.
  - Added owner-confirmed draft service categories: haircuts, hairstyling, and
    makeup.
  - Kept address, hours, phone, prices, staff names, photos, and video visibly
    pending by owner decision.
  - Connected existing project-local placeholder media to explicit page slots
    for hero, hair texture, and studio interior imagery.
  - Added pending replacement paths for service detail, signature wide imagery,
    hero video/poster, and optional staff/owner media.
  - Reworded the former staff-looking section into service/content placeholders
    so the page does not imply confirmed staff, services, or prices.
  - Added `public/media/README.md` with the owner media replacement plan.
- Validation:
  - `npm run build` passed with Next.js 16.2.10.
  - Sitewright Doctor passed repository checks and reported
    `PLANNING_REQUIRED` because task 005 is now closed and no new executable
    task is active.
  - Source scan found only explicit pending/placeholder language and no fake
    awards, reviews, prices, address, hours, live booking, or availability
    claims.
  - Source scan found no en dash or em dash characters in the changed app,
    media plan, handoff, or active task files.
- Deviations:
  - Task closed with address, hours, phone, prices, staff names, photos, and
    video still pending because the owner explicitly approved those placeholders
    for now.
- Follow-up:
  - Next task should focus on the next desired refinement rather than treating
    these remaining placeholders as blocking for this task.
