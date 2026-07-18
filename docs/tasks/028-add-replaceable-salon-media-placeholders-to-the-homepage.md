# Add replaceable salon-media placeholders to the homepage

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Add a small, clearly provisional set of generated salon-media placeholders to
the typography-led homepage so the owner can evaluate where real studio,
working, and staff imagery should live before photography and consent are
available. The result must strengthen the page's sense of place without
presenting generated people or spaces as the real Glamour Studio.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md

## Current repo notes

- The current `/` and `/typography` routes share
  `src/components/TypographySalonPage.jsx` and are intentionally typography-led.
- The hero, services, production brief, tone, and contact sections currently
  contain no real homepage imagery.
- The abstract makeup stroke is the current signature visual and must remain
  legible and performant.
- Real staff, client, interior, and exterior media remains owner-gated. Staff or
  client consent must not be inferred from this placeholder exercise.
- `docs/owner-content-media-intake.md` is the source checklist for future real
  media and permissions.

## Scope

- Generate three cohesive, editorial placeholder images in the established
  creamy pink, peach-beige, and warm-brown visual language:
  1. a wide, warm salon-interior concept with no identifying signage;
  2. a vertical craft image showing non-identifying hands at work with salon
     tools, with no recognizable client face;
  3. a vertical people-at-work concept framed from behind or at a distance so
     no generated person reads as a portrait of real Glamour Studio staff.
- Store the generated assets under a clearly provisional path such as
  `public/media/placeholders/`, with descriptive filenames and no text baked
  into the images.
- Preserve the type-first hero. Introduce the first image moment after the
  service index by replacing the internal-facing production brief with a
  customer-facing studio-media band.
- Use the wide interior concept as the anchor image and the two vertical images
  as supporting editorial crops. Keep the composition calm and asymmetric,
  with one strong image moment rather than a gallery or carousel.
- Add a visible shared label such as `Concept imagery — real studio photos
  pending` and honest alt text that identifies each asset as a concept
  placeholder rather than the real salon or staff.
- Centralize image metadata so each placeholder can later be replaced by a real
  asset without restructuring the page.
- Use `next/image` with intrinsic dimensions, responsive sizing, and deliberate
  object positioning. Do not place essential text over the images.
- Preserve the current makeup stroke, service content, contact details,
  persistent bottom navigation, accessibility, and reduced-motion behavior.
- Update `DESIGN.md` with the approved homepage media placement and replacement
  rules, and update `docs/owner-content-media-intake.md` with the exact real
  shots these placeholders request.

## Suggested files

- public/media/placeholders/
- src/components/TypographySalonPage.jsx
- DESIGN.md
- docs/owner-content-media-intake.md
- docs/agent-handoff.md
- docs/tasks/028-add-replaceable-salon-media-placeholders-to-the-homepage.md

## Implementation steps

1. Generate the three concept assets to the constraints above and inspect them
   for invented branding, recognizable faces, visual artifacts, and generic
   stock-luxury styling.
2. Add centralized placeholder metadata and build the responsive media band in
   the shared homepage component.
3. Replace internal production-copy language with honest customer-facing copy
   that makes the provisional status explicit.
4. Update the design contract and owner media intake with placement and future
   replacement requirements.
5. Run conservative validation, record evidence, and refresh the handoff.

## Acceptance criteria

- [ ] Three generated placeholder assets exist under a clearly provisional
      media path and form one coherent visual family.
- [ ] The shared `/` and `/typography` homepage composition displays one
      responsive studio-media band after the service index.
- [ ] The hero remains typography-led and the page does not become a lookbook.
- [ ] Every generated image is visibly identified as concept imagery and uses
      accurate alt text that does not claim it depicts the real salon, staff, or
      clients.
- [ ] No generated face, signage, service result, or embedded text implies a
      real Glamour Studio identity, employee, client, or business fact.
- [ ] Image metadata is centralized and the layout can accept future real
      replacements without structural rework.
- [ ] Images use `next/image`, provide intrinsic dimensions and responsive
      sizing, and do not carry essential text overlays.
- [ ] Mobile reading order, contact actions, reduced-motion behavior, and the
      makeup-stroke interaction remain intact.
- [ ] `DESIGN.md` and the owner media intake describe the new placement and the
      exact real shots needed to replace it.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not modify `/lookbook` or the preserved `/old` route.
- Do not add a carousel, lightbox, Instagram feed, CMS, hero video, or new
  animation treatment.
- Do not present generated imagery as evidence of the real premises, team,
  clients, services, or results.
- Do not publish names, biographies, likenesses, or portraits for actual staff
  until the owner supplies them and each person approves publication.
- Do not add before/after imagery or recognizable clients without explicit
  client permission.
- Do not change service claims, prices, hours, booking behavior, or confirmed
  contact information.

## Risks and stop conditions

- Stop and regenerate an asset if it contains invented signage, logos, readable
  text, implausible anatomy/tools, or a person who could be mistaken for a real
  named staff member or client.
- Stop if the concept label cannot remain visible and unambiguous in the final
  composition.
- Stop if the media band requires changing the stroke route, adding motion, or
  changing established responsive behavior beyond this task's scope.
- If rendered inspection becomes necessary to approve composition or cropping,
  request owner authorization before browser, viewport, screenshot, visual, or
  interaction validation.

## Validation

- Run `pnpm lint`.
- Run `pnpm build`.
- Run `git diff --check`.
- Run Sitewright Doctor and record the result.
- Inspect generated assets directly for artifacts, accidental text/branding,
  and identifiable faces; this asset inspection is not browser validation.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.

## Completion notes

- Transition: complete at 2026-07-13T23:21:15.231Z
- Validation: pnpm lint, pnpm build, git diff --check, and Sitewright Doctor passed; generated assets inspected directly; conservative policy kept browser validation off.

- Transition: start at 2026-07-13T23:11:33.553Z

- Completed: Added three generated concept assets under
  `public/media/placeholders/`, centralized their dimensions, alt text, and
  object positions in `src/lib/homepage-media.js`, and replaced the internal
  production brief with one responsive studio-media band in the shared
  homepage component. The band keeps the type-first hero and existing stroke,
  contact, and bottom navigation behavior intact.
- Validation: `pnpm lint` passed, `pnpm build` passed, `git diff --check`
  passed, and Sitewright Doctor returned `READY IMPLEMENTATION_READY`.
  Generated outputs were inspected directly for readable text, branding,
  artifacts, and recognizable faces; all three remain clearly provisional.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run because the repository's conservative validation
  policy forbids them without explicit owner approval.
- Follow-up: Replace the three metadata entries with owner-approved real shots
  using the exact wide-interior, hands-at-work, and distant/behind-the-scenes
  roles documented in `docs/owner-content-media-intake.md`.

## Traceability

- Product outcome: The primary audience is new local clients in or near Radovish who are searching
- Implementation phase: Current approved phase
- Changed files: `public/media/placeholders/`,
  `src/lib/homepage-media.js`, `src/components/TypographySalonPage.jsx`,
  `DESIGN.md`, `docs/owner-content-media-intake.md`, and this task note.
- Evidence: `.sitewright/evidence/028-add-replaceable-salon-media-placeholders-to-the-homepage-md.json`
