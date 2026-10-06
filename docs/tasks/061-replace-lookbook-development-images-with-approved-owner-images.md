# Replace Lookbook development images with approved owner images

Status: IN PROGRESS
Depends on: None
Owner: AI-assisted implementation
Approver: Owner

## Goal

Replace the nine temporary Instagram Lookbook frames with the eight owner-supplied
photographs in `lookbook0.jpg` through `lookbook7.jpg` order, while preserving the
horizontal Lookbook experience and honest bilingual accessibility copy.

## Owner decisions

- On 2026-10-06, the owner directed use of the eight available JPEGs in numeric
  order; `lookbook8` is not needed.
- The owner confirmed public website use and consent from recognizable people.
- This task changes Lookbook media only. The route's existing noindex setting
  remains until search indexing is separately requested and reviewed.

## Scope and change recipe

- Inspect the eight supplied files under
  `Z:\Users\onira\Documents\ViberDownloads` and preserve their visual content.
- Replace the development-only media set and Instagram source-link assumptions
  in the Lookbook media model and rendered sequence. Do not attribute owner
  photos to Instagram.
- Write accurate Macedonian and English alt descriptions for each frame; keep
  the current visual layout, count/progress behavior, reduced-motion behavior,
  and keyboard/touch navigation.
- Keep the intrinsic-dimension manifest and media build gate aligned with the
  new files. Remove unapproved development assets from the shipped public
  Lookbook directory and update media provenance documentation.
- Update `DESIGN.md` only for the durable change from development frames to
  approved owner photography. Update `REPO_MAP.md` only if ownership changes.

## Relevant documents

- `DESIGN.md`, Lookbook media contract.
- `REPO_MAP.md`, Lookbook ownership entries.
- `docs/agent-handoff.md`, current Lookbook and booking task state.

## Suggested files

- `src/lib/lookbook-media.js`
- `src/components/lookbook/HorizontalLookbook.jsx`
- `src/lib/lookbook-copy.js`
- `scripts/media/lookbook-manifest.mjs`
- `src/generated/lookbook-media-manifest.js`
- `public/media/lookbook/` and its media README
- `src/app/lookbook/page.jsx` only if the route contract requires it

## Review posture

- Changed surface: public photographs with recognizable people, media metadata,
  and Lookbook content/UI.
- Default review posture: `adversarial` because public client photography is a
  privacy and permission-sensitive surface. One coherent review after
  implementation and proportional static validation.

## Acceptance criteria

- [x] `/lookbook` uses exactly the eight owner JPEGs in numeric order; no
  Instagram frame or stale Instagram destination appears in the sequence.
- [x] Each image has accurate, distinct Macedonian and English alt text.
- [ ] The rendered image crops are sensible at customer viewports.
- [x] Progress/count and existing navigation still derive from the actual
  eight-item sequence.
- [x] The media manifest reports the actual dimensions and its build check
  passes. Public image copies have no location or personal EXIF metadata.
- [x] The route remains noindex. Public-use and recognizable-person permission
  decisions are recorded without implying approval of unrelated media.
- [ ] The owner can review the rendered image sequence and crops; this check
  remains pending under the conservative validation policy.

## Non-goals

- Homepage, booking, SEO indexing, new layout, or transition redesign.
- Browser, viewport, screenshot, or interaction automation.

## Validation

- Run the lookbook media check, a targeted static check for changed JS/JSX,
  and `git diff --check` after implementation. Run the production build only
  if the changed runtime structure or manifest gate makes it necessary.
- Do not run rendered validation under the repository's conservative policy;
  record the owner-visible crop/sequence review as pending.

## Completion notes

- Transition: start at 2026-10-06T11:36:25.767Z

- Completed: Copied `lookbook0.jpg` through `lookbook7.jpg` byte-for-byte into
  `public/media/lookbook/approved/` in numeric order and removed the nine public
  development frames. Replaced the media records and bilingual alt text,
  removed Instagram-only links and Reel labels, switched the dimension generator
  to the approved directory, regenerated the manifest, and updated provenance
  documentation and the Lookbook design contract. The route stays noindex.
- Validation: Supplied and public JPEG hashes matched. Nested EXIF/IFD review
  found no GPS, names, timestamps, or other personal identifiers. `pnpm build`
  passed, including `media:check` for exactly eight images and static generation
  of `/lookbook`; targeted ESLint passed. Exact source-reference search found no
  stale Instagram paths or link fields in the active Lookbook source. One Sol
  high adversarial review found a local-path disclosure in the publicly served
  README and an inaccurate design sentence; a separate narrow correction
  removed the path and aligned the design text with the static images. The
  reviewer found no other actionable defect.
- Deviations: The user supplied eight files rather than the initially described
  nine and directed use of all eight. Rendered, viewport, screenshot, and
  interaction checks were not run under the conservative validation policy.
- Follow-up: Owner review of rendered order, crops, and bilingual image
  descriptions remains pending. The required adversarial review was retried
  after its initial workspace-credit error and completed with the two
  documentation corrections above.
