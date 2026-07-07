# Research and remove AI-generated website tells

Status: DONE
Depends on: None
Owner: AI-assisted implementation

## Goal

Research common visible "AI-generated website" tells, compare those tells
against the current Glamour Studio single-page draft, and make the smallest
coherent design/code changes that make the site feel more specific, grounded,
and locally credible without inventing final salon facts.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- docs/implementation-plan.md
- REPO_MAP.md
- docs/agent-handoff.md
- public/media/README.md
- src/app/page.jsx
- src/app/globals.css
- src/components/FontLoader.jsx
- src/components/FontTester.jsx
- Research starting points:
  - Business Insider, July 7 2026, "There are 3 telltale signs that you used
    AI to make your app": https://www.businessinsider.com/ai-coded-app-user-interface-experience-design-2026-7
  - Business Insider, July 2 2026, "Base44's CEO says the company built its own
    model to stop churning out AI-slop designs": https://www.businessinsider.com/base44-ceo-maor-shlomo-built-llm-combat-ai-slop-design-2026-7
  - Duda / TechRadar, February 2026, AI-generated website issues including
    repetitive design and poor optimization: https://www.techradar.com/pro/website-building/dudas-new-feature-tackles-the-biggest-issues-of-ai-generated-websites
  - Krauss et al., November 2024, deceptive design risk in AI-generated websites:
    https://arxiv.org/abs/2411.03108
  - Dolezal et al., April 2026, AI-generated text on the internet and
    artificially positive/homogeneous content: https://arxiv.org/abs/2604.26965

## Current repo notes

- The product is a Macedonian-first, single-page salon website for Radovish.
- Current project focus is design refinement and polish. Content completion,
  real contact/location details, real media replacement, and booking/contact
  flow are deferred until after the design direction is stronger.
- Confirmed salon name is Glamour Studio. Draft service categories are
  haircuts, hairstyling, and makeup.
- Address, hours, phone, prices, staff names, final Macedonian copy, real
  photos, and video remain placeholders by owner decision.
- Booking is intentionally not live and must not imply real availability.
- Current source-level suspects to compare against research:
  - large generic editorial hero and section headings that may feel generated;
  - repeated rounded cards and placeholder panels across lookbook and services;
  - warm beige/gold dominance drifting away from `DESIGN.md` creamy pink,
    peach-beige, and warm brown contract;
  - runtime font-testing UI in the product page, which can read as internal
    tooling rather than a finished local business draft;
  - disabled booking form fields, which may look like a fake flow instead of an
    honest staged contact state;
  - generic placeholder phrasing that is truthful but may feel templated.

## Scope

- Do focused online research on common AI-generated website tells and record the
  distilled tells in this task's completion notes.
- Compare those tells to the current page source and styles before editing.
- Fix only visible or structural tells that can be improved without final owner
  content or real media.
- Make the page feel more like a credible local salon draft and less like a
  generic AI-generated template.
- Preserve all truthful placeholder boundaries for missing business facts,
  services, prices, staff, address, phone, hours, photos, video, and booking.
- Keep `DESIGN.md` authoritative. Update it only if this task creates a durable
  visual-system rule, anti-pattern, token, or component decision.
- Refresh `docs/agent-handoff.md` as current state after implementation.

## Suggested files

- src/app/page.jsx
- src/app/globals.css
- src/components/FontLoader.jsx
- src/components/FontTester.jsx
- docs/agent-handoff.md
- docs/tasks/006-research-and-remove-ai-generated-website-tells.md
- DESIGN.md, only if durable design guidance changes

## Implementation steps

1. Read this task, `docs/product-spec.md`, `DESIGN.md`,
   `docs/implementation-plan.md`, `docs/agent-handoff.md`, `REPO_MAP.md`, and
   the suggested source files before broad exploration.
2. Research at least three current credible sources on common AI-generated
   website tells. Use the links above as a starting set and add or replace them
   if better current sources are found.
3. Summarize the research into a short checklist of applicable tells, such as
   generic sameness, over-polished but under-specific UI, repetitive card grids,
   bland or overly positive copy, fake/disabled interactions, unsupported
   trust claims, stock-like visual choices, excessive rounded/pill styling, and
   poor edge/fallback states.
4. Audit the current page against that checklist using source inspection. Do not
   treat every generic tell as a bug; only act where it applies to this product
   and can be fixed without inventing owner facts.
5. Implement the smallest coherent set of fixes. Likely candidates include:
   removing or hiding runtime font-lab tooling from the product page; reducing
   repeated card/template patterns; making placeholder media states quieter and
   more intentional; aligning colors closer to the pink/peach/brown design
   contract; replacing the disabled booking form with a more honest pending
   contact module; and tightening generic placeholder copy while preserving
   truthfulness.
6. Preserve accessibility, semantic sections, focus states, reduced-motion
   behavior, and mobile-first structure.
7. Record what was researched, what tells were found in the site, what was
   fixed, validation results, and any deliberate non-fixes in this task.
8. Rewrite `docs/agent-handoff.md` as current state rather than appending
   history.

## Acceptance criteria

- [x] Completion notes include a concise research summary with source links.
- [x] The current page has been compared against the researched AI-generated
      website tells.
- [x] At least two applicable visible tells are removed or substantially
      softened in the implementation.
- [x] The page still clearly communicates that missing media, contact details,
      prices, staff, address, hours, and booking are pending.
- [x] No fake availability, fake testimonials, fake awards, fake review counts,
      fake staff claims, fake service details, fake address, fake hours, or fake
      prices are introduced.
- [x] The page remains a single-page salon draft aligned with `docs/product-spec.md`
      and `DESIGN.md`.
- [x] Accessibility basics are preserved: semantic regions, readable contrast,
      keyboard focus, usable contact path, and reduced-motion behavior.
- [x] `docs/agent-handoff.md` reflects the current state and next owner decision.
- [x] Validation results are recorded in this task.

## Non-goals

- Do not complete final Macedonian copy or invent business details.
- Do not replace media with generic stock, AI-generated final salon imagery, or
  non-owner-approved photos.
- Do not implement live booking, calendar availability, payments, accounts, CMS,
  analytics, cookies, localization toggles, deployment, or legal policy text.
- Do not redesign the entire site from scratch unless the research/audit shows
  that a localized rewrite is the smallest coherent fix.
- Do not add browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.
- Do not create a backlog of extra tasks.

## Risks and stop conditions

- Stop if a fix requires final brand direction, real salon facts, real media, or
  owner-approved Macedonian copy.
- Stop before adding any claim that would affect launch truth, local trust, or
  legal/privacy obligations.
- Stop before introducing a form that collects personal data unless the owner
  confirms submission destination, privacy/legal copy, and expected behavior.
- Stop if making the page less "AI-looking" would conflict with accessibility,
  mobile usability, or the established visual-system contract.

## Validation

- Run `npm run build`.
- Run Sitewright Doctor.
- Run a source scan for known fake-claim terms and lingering internal tooling
  labels if those were removed.
- Manually inspect the changed source against the research checklist.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction validation unless the owner explicitly requests it.
- Prefer lint/build/typecheck/Doctor and small HTTP smoke checks when useful.

## Completion notes

- Completed:
  - Researched current AI-generated website tells from:
    - Business Insider, July 7 2026:
      https://www.businessinsider.com/ai-coded-app-user-interface-experience-design-2026-7
    - TechRadar / Duda, January 29 2026:
      https://www.techradar.com/pro/website-building/dudas-new-feature-tackles-the-biggest-issues-of-ai-generated-websites
    - Krauß et al., November 2024:
      https://arxiv.org/abs/2411.03108
    - Dolezal et al., April 2026:
      https://arxiv.org/abs/2604.26965
  - Distilled the applicable checklist to: regression-to-the-mean visual
    sameness, polished UI that implies unavailable functionality, missing or
    weak edge states, repetitive card grids, internal tooling visible in the
    product, generic overly positive copy, unsupported trust claims, and
    deceptive or pressure-oriented booking patterns.
  - Audited the current page against that checklist. Applicable tells were the
    product-visible font lab, the disabled booking form that looked like a fake
    workflow, repeated rounded card/panel patterns, developer-facing media
    replacement paths, section-label repetition, and a beige/gold drift away
    from `DESIGN.md`.
  - Removed the runtime font testing surface from the product page and deleted
    the unused `FontLoader.jsx` and `FontTester.jsx` components.
  - Replaced the disabled booking form with an honest contact/booking status
    module that does not collect visitor details or imply live availability.
  - Reworked media placeholder copy so it stays clear and truthful without
    showing internal file paths as visible page content.
  - Changed services from three equal portrait-style cards to a restrained
    service list, preserving draft categories and pending prices/details.
  - Recalibrated `src/app/globals.css` toward the documented blush, peach, and
    warm-brown palette, reduced decorative circles, reduced overline repetition,
    and tightened corner radii for the page components.
  - Preserved the single-page salon draft, mobile-first structure, semantic
    sections, focus states, reduced-motion behavior, and all pending owner-fact
    boundaries.
- Validation:
  - `npm run build` passed with Next.js 16.2.10.
  - Sitewright Doctor passed while task 006 was active and reported
    `IMPLEMENTATION_READY`.
  - After closing task 006, Sitewright Doctor reported `PLANNING_REQUIRED`
    because no new executable task is active. This is the expected next-state
    warning after completing the task.
  - Source scan found no lingering product-source references to removed
    internal font tooling, disabled form labels, fake booking-flow labels, or
    the previous runtime font-lab UI.
  - Source scan found no en dash or em dash characters in `src/app`.
  - Fake-claim scan found no awards, testimonials, review counts, live booking,
    available slots, fake staff claims, fake address, or fake prices in
    `src/app`. It found only explicit negative pending language about not
    confirming appointments.
  - Manually inspected the changed source against the research checklist.
- Deviations:
  - Did not run browser, viewport, screenshot, Playwright, visual, animation, or
    interaction validation, per the conservative validation policy and task
    non-goals.
  - Did not use generated or stock replacement media because real owner-approved
    salon media remains the product boundary.
- Follow-up:
  - Next owner decision is to choose the next design refinement or provide real
    salon facts/media. Do not treat missing address, hours, phone, prices,
    staff names, final Macedonian copy, photos, video, or booking destination as
    solved by this task.
