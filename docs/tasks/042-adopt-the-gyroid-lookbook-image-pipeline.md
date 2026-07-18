# Adopt the Gyroid lookbook image pipeline

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner request in current Codex task

## Goal

Port Gyroid's responsive quality-100 Next image contract to the lookbook while
making the current 640px development-source ceiling measurable and explicit.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- X:/_projects/gyroid/docs/media-workflow.md
- X:/_projects/gyroid/src/components/content/ContentFigure.tsx
- X:/_projects/gyroid/scripts/media/optimize.mjs

## Current repo notes

- Gyroid uses exact generated intrinsic dimensions, `quality={100}`, a Next
  quality allowlist, accurate `sizes`, responsive optimizer delivery, and a
  read-only build gate.
- The nine development JPEGs are only 640px wide and 27–68KB, unlike Gyroid's
  mostly 1920–3840px source media. The pipeline can prevent further degradation
  but cannot reconstruct missing source detail.

## Scope

- Add a repository-owned lookbook media manifest generator/check using Sharp.
- Add Next's image quality allowlist and render lookbook images at quality 100
  with manifest dimensions and accurate responsive sizes.
- Add media validation to the normal build without rewriting source pixels.
- Preserve development-only media disclosures and replacement requirements.

## Suggested files

- next.config.mjs
- package.json
- scripts/media/lookbook-manifest.mjs
- src/generated/lookbook-media-manifest.js
- src/components/lookbook/HorizontalLookbook.jsx
- public/media/lookbook/instagram-dev/README.md
- docs/agent-handoff.md
- docs/tasks/

## Implementation steps

1. Inspect the smallest relevant file set.
2. Implement one observable product slice.
3. Validate the slice in proportion to risk.
4. Record completion notes and refresh the handoff.

## Acceptance criteria

- [ ] Lookbook `next/image` requests quality 100 and uses generated intrinsic
      dimensions plus a viewport-accurate `sizes` contract.
- [ ] Next accepts the explicit quality-100 request.
- [ ] A generated manifest records all nine dimensions, and the build fails
      read-only when it becomes stale or an image exceeds its budget.
- [ ] Source pixels/formats are preserved; no fake upscaling is introduced.
- [ ] Documentation states that approved higher-resolution originals remain
      necessary for true Gyroid-level crispness.
- [ ] Validation results are recorded in this task.

## Non-goals

- Do not scrape Instagram CDN URLs or invent higher-resolution pixels.
- Do not remove noindex, disclosure, source links, or permission gates.

## Risks and stop conditions

- Stop rather than claiming the 640px development files can match Gyroid's
  high-resolution originals through configuration alone.

## Validation

- Run the media check, `pnpm lint`, `pnpm build`, `git diff --check`, and
  Sitewright Doctor.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Transition: complete at 2026-07-18T10:47:27.116Z
- Validation: pnpm media:check passed; pnpm lint passed; pnpm build passed; git diff --check passed; Sitewright Doctor IMPLEMENTATION_READY with only the expected pre-refresh handoff warning; browser and visual QA not run under conservative policy.
- Approved by: Owner request in current Codex task

- Transition: start at 2026-07-18T10:44:40.113Z

- Completed: Ported Gyroid's quality-100 `next/image` allowlist and rendering
  contract; generated exact lookbook dimensions; added a Sharp-backed
  generator/read-only build gate; preserved original pixels and responsive
  `sizes`; documented the 640px source ceiling.
- Validation: `pnpm media:check`, `pnpm lint`, `pnpm build`, and
  `git diff --check` passed. Sitewright Doctor reported
  `IMPLEMENTATION_READY` with only the expected pre-handoff stale-memory
  warning.
- Deviations: Browser and visual validation were not run under the repository's
  conservative validation policy. No higher-resolution files were generated or
  scraped because the current development sources contain no recoverable extra
  detail and CDN scraping is outside the approved media workflow.
- Follow-up: Replace the nine 640px development JPEGs with approved
  production-resolution originals, then run `pnpm media:optimize`. The component
  and delivery pipeline require no further structural change.

## Traceability

- Product outcome: Deliver the best responsive fidelity possible from approved
  source pixels and make media-quality regressions visible.
- Implementation phase: Phase 2 media-delivery refinement; source replacement
  remains owner-gated.
- Changed files: `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `scripts/media/lookbook-manifest.mjs`, `src/generated/lookbook-media-manifest.js`, `src/components/lookbook/HorizontalLookbook.jsx`, `public/media/lookbook/instagram-dev/README.md`, `DESIGN.md`, `REPO_MAP.md`, `docs/tasks/042-adopt-the-gyroid-lookbook-image-pipeline.md`, `docs/agent-handoff.md`
- Evidence: `.sitewright/evidence/042-adopt-the-gyroid-lookbook-image-pipeline.json`
