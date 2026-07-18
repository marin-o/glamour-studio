# Integrate owner-approved salon identity and contact details

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Replace the homepage's identity and contact placeholders with the first
owner-approved salon facts, without implying live booking or inventing missing
business information.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- The visual, responsive, and motion systems are implemented through task 021.
- `docs/owner-content-media-intake.md` is the source checklist for missing facts.
- The current English salon copy and all contact information remain explicitly provisional.

## Scope

- Confirm the owner-approved public salon name and at least one real contact channel.
- Replace only the matching identity/contact placeholders and metadata.
- Keep address, hours, prices, services, booking, and other facts provisional unless separately approved.
- Preserve the shared `/` and `/typography` composition and honest booking state.

## Suggested files

- docs/owner-content-media-intake.md
- docs/product-spec.md
- src/app/layout.jsx
- src/components/TypographySalonPage.jsx
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Obtain and record the owner's approved public salon name and contact channel.
2. Update metadata and the shared homepage only where those facts replace placeholders.
3. Verify links use the correct protocol and do not claim booking confirmation.
4. Run conservative validation, record evidence, and refresh the handoff.

## Acceptance criteria

- [x] The displayed salon identity exactly matches owner-approved wording.
- [x] At least one real contact action uses an owner-approved destination.
- [x] Contact copy does not imply live scheduling or confirmed availability.
- [x] Unapproved business facts remain visibly provisional.
- [x] `/` and `/typography` stay aligned through their shared component.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not add a scheduler, form, CMS, analytics, localization, or real media.
- Do not infer address, hours, prices, services, staff, or social accounts.

## Risks and stop conditions

- Stop until the owner supplies the exact public salon name and contact destination.
- Stop if the supplied contact channel's intended public use is unclear.

## Validation

- Run `npm run lint` and `npm run build`.
- Run Sitewright Doctor and record readiness.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.

## Completion notes

- Transition: complete at 2026-07-12T23:23:26.787Z
- Validation: Owner-approved identity, phone, address, and Instagram integrated; lint, build, diff check, and Doctor passed.
- Approved by: owner

- Transition: start at 2026-07-12T23:21:38.480Z

- Completed: Owner confirmed `Glamour Studio`, phone `077-643-005`, location
  `11 Ilija Aleksov, Radovish`, and Instagram
  `https://www.instagram.com/glamourrstudiio/` on 2026-07-13. Updated root
  metadata, hero pending-copy accuracy, the contact section, and persistent
  call action. Added a Google Maps search link derived from the confirmed
  address. Recorded confirmed facts in the owner intake.
- Validation: `npm run lint`, `npm run build`, `git diff --check`, and
  Sitewright Doctor passed. `/` and `/typography` remain statically generated.
- Deviations: Viber was described as likely using the phone number but was not
  published because it is unconfirmed. WhatsApp remains omitted. No rendered
  browser validation was run under the conservative policy.
- Follow-up: Confirm opening hours, Viber availability, WhatsApp availability,
  service details, prices, booking-request wording, and final Macedonian copy.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `src/app/layout.jsx`,
  `src/components/TypographySalonPage.jsx`,
  `docs/owner-content-media-intake.md`, `docs/agent-handoff.md`, and this task.
- Evidence: `.sitewright/evidence/<task-id>.json`
