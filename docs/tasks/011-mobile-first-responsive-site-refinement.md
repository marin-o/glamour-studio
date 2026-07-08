# Mobile-first responsive site refinement

Status: DONE
Depends on: 010-plan-lookbook-endpoint
Owner: AI-assisted implementation

## Goal

Refine all public Glamour Studio routes so the site is designed mobile-first,
not merely collapsed from desktop.

The independently observable outcome is that `/`, `/typography`, `/old`, and
`/lookbook` read as intentional phone layouts: oversized headings do not clip,
bottom CTAs do not cover essential content, section rhythm remains visually
guided, and the typography-led homepage keeps editorial energy on mobile.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/agent-handoff.md
- docs/tasks/008-typography-led-salon-iteration.md
- docs/tasks/009-promote-typography-direction-and-preserve-old-homepage.md
- docs/tasks/010-plan-lookbook-endpoint.md

## Current repo notes

- `/` and `/typography` share `src/components/TypographySalonPage.jsx`.
- `/old` is the preserved image-led backup route.
- `/lookbook` is the media-planning route.
- The reported mobile issue is most visible in the typography-led hero: the
  large heading can clip on the right, and later sections lose desktop
  eye-guidance when they collapse into a simple centered flow.
- Validation policy is `conservative`; do not run browser, viewport,
  screenshot, Playwright, visual, animation, or interaction checks unless the
  owner later changes this.

## Scope

- Make mobile layout rules the primary design baseline across current public
  routes.
- Prevent horizontal clipping or overflow in large display headings, especially
  the typography hero.
- Rebuild mobile section rhythm so collapsed sections still guide the eye
  through varied alignment, spacing, rule placement, content width, and
  text/media sequencing.
- Tighten persistent bottom CTA spacing so final content remains reachable.
- Preserve semantic sections, accessible links, focus states, reduced-motion
  behavior, and pending-content truthfulness.
- Refresh `docs/agent-handoff.md` after implementation.
- Record completion notes and validation in this task.

## Suggested files

- src/app/globals.css
- src/components/TypographySalonPage.jsx
- src/app/old/page.jsx, only if structural hooks are needed
- src/app/lookbook/page.jsx, only if structural hooks are needed
- docs/agent-handoff.md
- docs/tasks/011-mobile-first-responsive-site-refinement.md

## Implementation steps

1. Re-read this task, `DESIGN.md`, `docs/product-spec.md`, and the current
   route/component files.
2. Audit existing mobile breakpoints in `src/app/globals.css` for `.type-*`,
   `.site-*`, and `.lookbook-*` sections.
3. Revise the typography-led mobile hero so the `Glamour Studio` heading has
   stable inline bounds, no horizontal clipping, and readable line-height on
   narrow screens.
4. Rework mobile rhythm for typography-led sections:
   - avoid every section feeling centered and identical;
   - use deliberate left/right offsets, max-width changes, rule lines, spacing,
     or staggered content blocks;
   - keep body copy legible and scannable.
5. Apply equivalent mobile-first polish to `/old` and `/lookbook`, focusing on
   media block heights, heading scale, nav wrapping, CTA spacing, and text/media
   order.
6. Keep desktop behavior intact unless a desktop rule conflicts with the
   mobile-first baseline.
7. Preserve all pending owner-fact boundaries and avoid adding final-looking
   claims.
8. Validate with build, Sitewright Doctor, source scans, and manual source
   inspection only.
9. Rewrite `docs/agent-handoff.md` as current state rather than appending
   history.

## Acceptance criteria

- [x] `/`, `/typography`, `/old`, and `/lookbook` remain available.
- [x] The typography-led hero heading does not rely on overflow-prone sizing or
      rightward clipping on narrow mobile layouts.
- [x] Mobile sections have intentional visual rhythm beyond uniformly centered
      stacked text.
- [x] Persistent bottom CTAs do not obscure essential contact/status content.
- [x] No horizontal overflow-prone layout rules remain in changed mobile styles.
- [x] Desktop composition remains materially equivalent or intentionally
      improved.
- [x] Missing media, contact details, prices, staff, address, hours, final copy,
      and booking remain clearly pending.
- [x] No fake availability, fake testimonials, fake awards, fake review counts,
      fake staff claims, fake service details, fake address, fake hours, or fake
      prices are introduced.
- [x] Accessibility basics are preserved: semantic regions, readable contrast,
      keyboard focus, usable contact/status path, and reduced-motion behavior.
- [x] `docs/agent-handoff.md` reflects the new current state.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not replace the typography-led homepage direction.
- Do not remove `/old` or `/lookbook`.
- Do not choose final fonts.
- Do not complete final Macedonian copy or invent business details.
- Do not add new final media, stock media, AI-generated final salon imagery, or
  non-owner-approved photos.
- Do not implement live booking, scheduling, payments, accounts, CMS, analytics,
  cookies, localization toggles, deployment, or legal policy text.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly changes the validation
  direction.

## Risks and stop conditions

- Stop if a mobile fix requires final brand typography, final Macedonian copy,
  real salon facts, real salon media, or owner-approved booking behavior.
- Stop before changing route purpose, deleting comparison routes, or making
  `/lookbook` feel like a finished portfolio.
- Stop before introducing any claim that affects local trust, launch truth,
  privacy, or legal obligations.
- Stop if responsive behavior cannot be made coherent without rendered viewport
  validation under the current conservative policy.

## Validation

- Run `npm run build`.
- Run Sitewright Doctor.
- Run source scans for horizontal-overflow risks in changed CSS, such as large
  fixed widths, unsafe viewport-based heading sizes, or unbounded grid columns.
- Run source scans for fake-claim terms in changed app/component files.
- Manually inspect the changed source against this task, `DESIGN.md`, and
  `docs/product-spec.md`.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction checks unless the owner explicitly requests them.

## Completion notes

- Completed:
  - Refined `src/app/globals.css` for mobile-first behavior across the
    typography-led homepage and `/typography`, the preserved `/old` route, and
    `/lookbook`.
  - Replaced overflow-prone mobile heading scales in the typography hero and
    lookbook headings with fixed mobile sizes and bounded line boxes.
  - Added mobile rhythm through staggered copy widths, retained editorial
    service-number columns, offset media cards, tighter media aspect ratios,
    and deliberate section spacing instead of uniformly centered stacks.
  - Increased route and final contact/status section bottom clearance so fixed
    CTAs have room without covering essential pending/contact status content.
  - Kept all salon facts, booking behavior, media, prices, staff, address,
    hours, and final copy explicitly pending.
- Validation:
  - `npm run build` passed with Next.js 16.2.10 and prerendered `/`,
    `/typography`, `/old`, and `/lookbook` as static routes.
  - Sitewright Doctor passed while task 011 was active and reported
    `IMPLEMENTATION_READY`.
  - Horizontal-overflow source scan of `src/app/globals.css` found matches only
    in pre-existing desktop/tablet grid minimums and short nowrap nav/CTA
    labels; changed mobile styles avoid unsafe viewport-width type sizing,
    unbounded grid columns, and fixed-width content.
  - Fake-claim scan of `src/app` and `src/components` found matches only in
    explicit pending/not-live language for prices, hours, address, staff, and
    booking status.
  - Removed-skill/source scan found no runtime references to the removed
    design-taste/font-lab tooling; the remaining handoff mention is the durable
    "do not use" gotcha.
  - Manually inspected the changed source against this task, `DESIGN.md`, and
    `docs/product-spec.md`.
- Deviations:
  - Did not run browser, viewport, screenshot, Playwright, visual, animation,
    or interaction validation, per the conservative validation policy and task
    non-goals.
- Follow-up:
  - Next owner decision is whether to collect real salon media/content, create
    another scoped visual refinement task, or begin replacing pending business
    details after owner approval.
