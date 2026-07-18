# Build the editorial lookbook from temporary Instagram media

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Replace the internal-facing `/lookbook` media-plan route with a polished,
customer-facing editorial lookbook that uses the nine locally captured
Instagram development images while keeping their provisional permission status
explicit and making the route reachable from the typography-led homepage.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/owner-content-media-intake.md
- public/media/lookbook/instagram-dev/README.md

## Current repo notes

- `/lookbook` is currently an internal media inventory with its own sticky top
  navigation, production notes, and placeholder imagery.
- The homepage establishes the approved grammar: type-led hierarchy, warm
  cream/blush/brown surfaces, asymmetric media composition, and persistent
  bottom navigation rather than a separate top header.
- `public/media/lookbook/instagram-dev/` contains the nine newest public profile
  thumbnails captured on 2026-07-16: seven post images and two Reel covers.
- These files are development-only, feed-sized assets. Owner approval for
  website reuse and permission from every recognizable person remain open.

## Scope

- Replace the planning/status presentation in `src/app/lookbook/page.jsx` with
  one mobile-first editorial lookbook built around all nine development assets.
- Use a restrained repeating composition rather than a generic masonry grid,
  carousel, or nine identical cards. Preserve useful focal points with explicit
  crop and object-position metadata.
- Centralize the nine items in a small lookbook media module. Record a stable
  ID, local source, original Instagram permalink, post/Reel-cover kind,
  development status, and authored descriptive alt text for each item.
- Link every visual to its original Instagram post. Identify the two Reel cover
  frames without pretending that local video is available.
- Keep the page typography-led and consistent with `DESIGN.md`: warm surfaces,
  generous section rhythm, asymmetric alignment, minimal card framing, and the
  existing dark-brown contact treatment where appropriate.
- Use a route-appropriate persistent bottom navigation with safe final-section
  padding. Do not add a separate top navigation or let the bar cover content.
- Make `/lookbook` reachable from the persistent navigation on the shared
  typography-led homepage without removing the services, studio-media, or call
  paths that establish the current homepage outcome.
- Add a visible development-media disclosure and noindex metadata. The route
  must not imply that website publication permission, client consent, or
  production-resolution media has been approved.
- Keep the complete page semantic, keyboard accessible, readable without
  JavaScript, and useful under reduced motion. This slice should remain static;
  do not add a new animation or extend the homepage makeup-stroke system.
- Update `DESIGN.md` with the durable lookbook composition and media-status
  rules. Update `REPO_MAP.md` only if the new media module changes an ownership
  boundary, then refresh the current-state handoff.

## Suggested files

- src/app/lookbook/page.jsx
- src/components/TypographySalonPage.jsx
- src/lib/lookbook-media.js
- public/media/lookbook/instagram-dev/
- DESIGN.md
- docs/owner-content-media-intake.md
- REPO_MAP.md
- docs/agent-handoff.md
- docs/tasks/036-build-the-editorial-lookbook-from-temporary-instagram-media.md

## Implementation steps

1. Inspect the existing lookbook route, shared homepage bottom navigation,
   design contract, development-media manifest, and owner media-permission
   checklist.
2. Add centralized metadata for the nine local assets and write descriptive alt
   text based only on what is visibly present.
3. Recompose `/lookbook` as a static editorial route, including source links,
   Reel-cover labels, development disclosure, and noindex metadata.
4. Add a persistent homepage path to `/lookbook` without regressing its current
   service, studio-media, or phone actions.
5. Update durable design/media guidance and run the conservative validation
   checklist once.
6. Record completion notes and rewrite the handoff as current state.

## Acceptance criteria

- [ ] `/lookbook` is a customer-facing editorial page rather than an internal
      slot inventory or production-status document.
- [ ] All nine files under `public/media/lookbook/instagram-dev/` appear exactly
      once in a deliberate responsive composition, and each visual links to the
      matching Instagram post recorded in the media manifest.
- [ ] Photo posts and Reel covers are distinguished, every item has useful
      authored alt text, and Instagram captions are not reused as alt text or
      unverified marketing claims.
- [ ] The page uses the approved cream, blush, peach-beige, and warm-brown visual
      language with unframed/asymmetric section rhythm instead of a generic
      masonry gallery, carousel, or nested-card system.
- [ ] The route uses persistent bottom navigation, has enough bottom padding,
      and introduces no separate sticky top header.
- [ ] The shared homepage provides an accessible persistent-navigation link to
      `/lookbook` while retaining its current services, studio-media, and call
      destinations.
- [ ] A visible development-media disclosure and route-level noindex metadata
      remain in place until the owner approves website reuse and recognizable
      people; the page makes no booking, pricing, service-detail, or consent
      claims.
- [ ] The page is semantic, keyboard accessible, readable without JavaScript,
      and introduces no new motion or homepage makeup-stroke dependency.
- [ ] `DESIGN.md`, the media-permission intake, the task completion notes, and
      current-state handoff accurately describe the implemented route and the
      remaining owner gate.
- [ ] `pnpm lint`, `pnpm build`, `git diff --check`, and Sitewright Doctor pass,
      with results recorded here. Browser and visual validation remain unrun
      under the conservative policy unless the owner separately authorizes it.

## Non-goals

- Do not add Instagram OAuth, Graph API fetching, scraping, scheduled refresh,
  webhooks, token storage, remote CDN image configuration, or a CMS.
- Do not download more Instagram media, replace these thumbnails with
  production originals, or edit/retouch recognizable people in this slice.
- Do not add filtering, category claims, lightboxes, before/after controls,
  carousels, likes/comments, or copied Instagram captions.
- Do not change service facts, pricing, hours, contact facts, booking behavior,
  homepage media-band assets, or the homepage makeup-stroke route.
- Do not remove the existing `/old` or `/typography` comparison routes.

## Risks and stop conditions

- Stop before removing the disclosure or noindex metadata unless the owner has
  recorded website reuse approval and permission for every recognizable person
  in `docs/owner-content-media-intake.md`.
- Stop rather than inventing a service category, technique, staff/client name,
  testimonial, or result claim from an image or Instagram caption.
- Stop and ask the owner if a source post disappears, an asset does not match
  its recorded permalink, or a crop cannot preserve the visible subject within
  the planned editorial composition.
- Keep the current route intact if the implementation would require new motion,
  changing the homepage stroke route, or weakening accessible/static fallbacks.

## Validation

- Run `pnpm lint`.
- Run `pnpm build`.
- Run `git diff --check`.
- Run Sitewright Doctor.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.

## Completion notes

- Transition: complete at 2026-07-16T15:37:54.148Z
- Validation: Implemented editorial lookbook; lint/build passed; Git diff check unavailable because workspace is not a Git worktree; browser validation intentionally unrun under conservative policy.

- Transition: start at 2026-07-16T15:32:34.838Z

- Completed: Replaced the planning route with a static customer-facing editorial lookbook. The nine local development images are centralized in `src/lib/lookbook-media.js`, each appears once, links to its recorded Instagram source, and carries authored descriptive alt text plus crop metadata. Reel cover frames are visibly identified, the route has a noindex directive and a development-media disclosure, and the homepage persistent navigation now links to `/lookbook`.
- Validation: `pnpm lint` passed. `pnpm build` passed and statically rendered `/lookbook`. Sitewright Doctor passed with `IMPLEMENTATION_READY` before handoff refresh and then reported expected `PLANNING_REQUIRED` with no active task after completion. `git diff --check` could not run because the supplied workspace is not a Git worktree (`Not a git repository`). Browser, viewport, screenshot, animation, and interaction validation were not run under the conservative policy.
- Deviations: No new motion was added. The required diff-whitespace check is unavailable until this workspace is provided as a Git worktree.
- Follow-up: Before launch or removing noindex/disclosure, the owner must record website reuse approval, permission from every recognizable person, approved original files/crops, and final Macedonian alt text in `docs/owner-content-media-intake.md`.

## Traceability

- Product outcome: Help potential local clients judge the salon's real work and
  atmosphere while keeping contact immediately reachable and provisional media
  truth explicit.
- Implementation phase: Phase 2 design and responsive refinement using
  development-only media; final content and permission approval remain Phase 3.
- Changed files: `src/app/lookbook/page.jsx`, `src/components/TypographySalonPage.jsx`, `src/lib/lookbook-media.js`, `DESIGN.md`, `docs/owner-content-media-intake.md`, `REPO_MAP.md`, and `docs/agent-handoff.md`.
- Evidence: `.sitewright/evidence/036-build-the-editorial-lookbook-from-temporary-instagram-media-.json`
