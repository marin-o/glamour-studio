# Remove the old draft and add a Macedonian-default language toggle

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner (approved the outcome and task creation)

## Goal

Retire the obsolete `/old` draft completely and make the live homepage
Macedonian-first. Render clearly provisional Macedonian copy by default and
provide an accessible control that switches the same interface to English
without presenting either language as final approved salon copy.

## Relevant documents

- docs/product-spec.md
- DESIGN.md
- REPO_MAP.md

## Current repo notes

- `src/app/old/page.jsx` owns the obsolete image-led draft and its `/old`
  metadata.
- `src/components/TypographySalonPage.jsx` owns the shared live homepage used by
  `/` and `/typography`; its persistent bottom bar still links to `/old` through
  the `homeHref` and `homeLabel` defaults.
- The current customer-facing homepage copy is English and already discloses
  that salon facts and final Macedonian wording are unfinished.
- Product intent is Macedonian-first with English available as a later
  toggleable option. All current salon-specific content remains provisional.
- Validation policy is `conservative`; rendered interaction checks require
  separate owner authorization during implementation.

## Scope

- Delete the `/old` route and remove every live link, label, prop default, and
  navigation affordance that exists only to expose the old draft.
- Remove old-draft-only code or static assets when they are confirmed
  unreferenced elsewhere; preserve shared assets and unrelated routes.
- Add one compact, accessible Macedonian/English language control to the live
  homepage experience without adding a second header or competing with the
  persistent bottom navigation.
- Make Macedonian (`mk`) the server-rendered and no-JavaScript default so the
  page does not initially render English and then visibly switch languages
  after hydration.
- Keep English (`en`) available from the same control and switch all
  customer-facing homepage text as one coherent language state, including
  navigation labels, section headings, service placeholders, disclosures, and
  calls to action.
- Use clearly marked provisional Macedonian wording. Preserve the current
  English draft as the English option where appropriate, and do not invent
  salon facts, prices, hours, contact details, or final brand language.
- Keep the two language sets centralized and structurally aligned so final
  owner-approved copy can replace placeholders without rewriting layout or
  interaction code.
- Update the document language metadata to match the selected language while
  preserving semantic HTML, keyboard access, focus visibility, and screen
  reader clarity.
- Keep the language state in root-level memory for the current app visit so it
  follows client-side navigation between the homepage and Lookbook. A full
  reload starts in Macedonian; cookies, local storage, locale routes, and
  URL-based language selection remain outside this task.
- Preserve the current layout, responsive behavior, hero curtain, makeup
  stroke, route transition, lookbook access, and contact affordances.
- Owner-expanded scope: make the development Lookbook's surrounding interface
  and meaningful accessibility copy follow the active homepage language while
  preserving `Lookbook` as its untranslated product label and Macedonian as the
  fresh-load default.

## Suggested files

- src/app/layout.jsx
- src/app/page.jsx
- src/app/typography/page.jsx
- src/app/lookbook/page.jsx
- src/components/LanguageProvider.jsx
- src/components/TypographySalonPage.jsx
- src/components/lookbook/HorizontalLookbook.jsx
- src/components/motion/PageTransition.jsx
- src/lib/
- docs/tasks/047-remove-the-old-draft-and-add-a-macedonian-default-language-toggl.md
- docs/agent-handoff.md

## Implementation steps

1. Trace `/old` references and route-only assets, then delete the route and
   remove only confirmed old-draft ownership.
2. Define aligned `mk` and `en` placeholder copy in one typed or otherwise
   structurally constrained source rather than scattering language conditionals
   throughout the component tree.
3. Render Macedonian on the server by default and isolate browser language
   state in the smallest practical client boundary.
4. Add an accessible two-language control with an unambiguous current state,
   keyboard operation, visible focus, and Macedonian/English labels that remain
   understandable in either mode.
5. Wire every customer-facing homepage string to the selected language and
   update the root document `lang` value when the user switches.
6. Confirm internal navigation no longer exposes `/old` and that removing it
   does not break `/`, `/typography`, `/lookbook`, or the existing route
   transition.
7. Record validation evidence and any owner-only copy decisions without
   claiming the placeholder Macedonian wording is final.

## Acceptance criteria

- [ ] `/old` is absent from the built route set, and no source or rendered
      navigation still links to or labels an "Old draft."
- [ ] Old-draft-only code and unreferenced assets are removed; shared runtime
      assets and unrelated routes remain intact.
- [ ] A fresh render of `/` and `/typography` displays Macedonian placeholder
      text by default without an English-first hydration flash.
- [ ] The page exposes a clearly labeled Macedonian/English control whose
      current selection is programmatically conveyed and operable by keyboard.
- [ ] Switching to English updates all customer-facing homepage copy
      coherently; switching back restores the Macedonian placeholders.
- [ ] The document language is `mk` by default and changes to `en` only while
      the English interface is selected.
- [ ] Both language sets explicitly remain provisional and make no invented
      claims about services, prices, hours, booking availability, address,
      contact details, or other unconfirmed business facts.
- [ ] Copy is centralized and replaceable so final Macedonian and English
      wording can be supplied without redesigning the page.
- [ ] The existing responsive layout, persistent navigation, hero curtain,
      makeup stroke, route transitions, lookbook link, and contact access
      remain structurally intact.
- [ ] `Lookbook` remains untranslated while its surrounding route interface,
      instructions, disclosures, source actions, image announcements, and alt
      descriptions follow the active homepage language. Direct and refreshed
      Lookbook loads default to Macedonian.
- [ ] Under the conservative validation policy, rendered language switching
      and default-language behavior remain awaiting owner verification unless
      the owner separately authorizes a browser check.

## Non-goals

- Do not write or approve final salon copy, translations, prices, services,
  hours, address, phone numbers, social handles, or booking behavior.
- Do not add a CMS, translation service, locale-routing package, browser
  language detection, cookies, local-storage persistence, or user accounts.
- Do not create `/mk` or `/en` routes or duplicate the homepage.
- Do not redesign the visual system, persistent bottom bar, motion sequences,
  media treatment, or overall information architecture.
- Do not retain an archive, redirect, or hidden navigation path for `/old`
  inside the runtime application.

## Risks and stop conditions

- Stop for owner direction if removing `/old` would delete media or code still
  used by the live homepage or another route.
- Stop rather than invent wording if a placeholder requires an unconfirmed
  business fact to remain grammatically coherent.
- Stop if the language control requires a new top-level navigation system or a
  broad motion/layout redesign beyond a compact control.
- Keep required final-copy review explicit; implementation acceptance is not
  approval of the Macedonian or English wording.

## Validation

- Run targeted source searches for `/old`, `Old draft`, and stale
  customer-facing English literals.
- Run `pnpm lint`, `pnpm build`, `git diff --check`, and Sitewright Doctor once
  after the implementation and lifecycle documentation settle.
- Inspect statically for a Macedonian server default, aligned copy keys,
  accessible control semantics, and document-language updates.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or
  interaction checks unless the owner explicitly authorizes them during
  implementation.
- Do not substitute extra static checks for unavailable rendered validation;
  leave visual switching and hydration behavior awaiting owner verification.

## Completion notes

- Transition: complete at 2026-07-19T16:24:05.628Z
- Validation: Owner reviewed the responsive navbar and approved completion after the final one-row layout with a leftmost language switch. pnpm lint, pnpm build, and git diff --check passed; production routes are /, /typography, and /lookbook with /old absent. Rendered language switching remains owner-verified through review rather than automated browser validation under the conservative policy.
- Approved by: Owner

- Transition: start at 2026-07-19T15:40:04.562Z

- Completed:
  - Removed the `/old` route, its navigation affordance, and the three
    old-draft-only placeholder PNGs. Updated the live Open Graph image to the
    current homepage interior concept.
  - Added one structurally aligned bilingual source in
    `src/lib/homepage-copy.js` for metadata, page copy, media descriptions,
    services, contact disclosures, navigation, and language-control labels.
  - Made Macedonian the deterministic server/no-JavaScript default. Added a
    root-persistent in-memory language provider and a plain-text homepage toggle;
    the selection updates the complete homepage copy, document `lang`, and
    Lookbook copy across client-side navigation, then resets on full reload.
  - Kept contact details visibly provisional in both languages and preserved
    the existing layout, hero curtain, makeup stroke, lookbook transition, and
    contact destinations.
  - Corrected the shared route curtain so same-page fragment/history navigation
    bypasses route animation instead of covering the page while waiting for a
    pathname change that cannot occur. Transition-link destinations are now
    normalized to pathnames before pending-route comparison.
  - Applied the owner-expanded bilingual language pass to the development
    Lookbook interface, disclosures, instructions, source actions, image
    announcements, and alt descriptions while retaining `Lookbook` as the
    untranslated label and a neutral browser-tab title.
  - Corrected the persistent navigation during owner review so every viewport
    uses one control row containing only the four navigation actions and the
    language switch; the redundant `Glamour Studio` label was removed. Narrow
    screens keep four always-visible, evenly sized navigation targets instead
    of horizontal overflow. The phone action uses a localized short mobile
    label while preserving its full number as the accessible name.
- Validation:
  - Targeted source searches found no live `/old`, `Old draft`, legacy
    navigation-prop, deleted-asset, or stale component-copy references.
  - `pnpm lint` passed, including after the responsive navigation and shared
    route-language corrections.
  - `pnpm build` passed after the shared route-language correction; the
    production route table contains `/`, `/typography`, and `/lookbook`, with no
    `/old` route.
  - `git diff --check` passed after the shared route-language correction.
  - Sitewright Doctor passed with `IMPLEMENTATION_READY` before completion. Its
    post-completion run reports `PLANNING_REQUIRED`, with no active executable
    task and no handoff mismatch.
  - Static inspection confirms a fixed `mk` initial state, aligned localized
    data, semantic plain-text toggle behavior, visible focus treatment, and
    document language synchronization. It also confirms that the narrow
    navigation exposes all four destinations and the language control in one
    row without the redundant brand label, while keeping the full phone number
    as the contact action's accessible name.
  - Browser, viewport, screenshot, animation, and interaction validation were
    not run under the conservative validation policy.
- Deviations:
  - Automated rendered language switching and hydration-flash checks were not
    run under the conservative policy; the owner approved completion after
    reviewing the implemented responsive navigation.
- Follow-up:
  - Final Macedonian copy, the final English translation, and confirmation of
    all displayed business/contact details remain separate owner inputs.
