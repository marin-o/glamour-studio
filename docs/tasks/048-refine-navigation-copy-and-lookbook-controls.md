# 048 - Refine navigation, copy, and Lookbook controls

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Owner

## Goal

Make the site feel more intentional by tightening the desktop navigation,
replacing noisy placeholder language with concise bilingual copy, presenting
confirmed contact facts as confirmed, and removing unnecessary Lookbook labels
and hover enlargement.

## Relevant documents

- `DESIGN.md`, especially Layout And Spacing, Components And States,
  Development Lookbook, and Accessibility And Fallbacks.
- `docs/product-spec.md`, especially Content Reality and Open Owner Decisions.
- `docs/owner-content-media-intake.md`, whose business-facts table already
  records the phone number, street address, map destination, and Instagram URL
  as owner-confirmed on 2026-07-13.
- `.sitewright/config.json` and the conservative validation boundary in
  `AGENTS.md`.

## Current repo notes

- `src/components/TypographySalonPage.jsx` renders the persistent navigation
  nearly full-width at every breakpoint. It has no address action and leaves
  excess empty space on desktop.
- The services introduction is a two-column composition with a visible
  `services.eyebrow` (`Привремен индекс на услуги` / `Service index`) and a
  long display title.
- `src/lib/homepage-copy.js` visibly labels the phone, confirmed street address,
  and Instagram profile as provisional, and its disclosure incorrectly says all
  three await owner confirmation.
- The confirmed values are `077-643-005`,
  `ул. Илија Алексов 11, Радовиш` / `11 Ilija Aleksov, Radovish`, and
  `@glamourrstudiio`, using the existing `tel:`, Google Maps, and Instagram
  destinations.
- `src/components/lookbook/HorizontalLookbook.jsx` shows a text return
  breadcrumb, a horizontal-scroll instruction in the header, an input-method
  instruction beside the progress rail, and Motion scale transforms on image
  hover and focus.
- `src/lib/lookbook-copy.js` owns the aligned Macedonian and English return,
  direction, and control strings.
- Lookbook scrolling, snapping, progress, media disclosure, source links,
  noindex behavior, and localized accessibility copy are already established
  and must remain intact.

## Scope

- On desktop only, add the confirmed street address to the persistent
  navigation as a direct link to the existing Google Maps destination. Do not
  show the address in the mobile navigation.
- At the desktop breakpoint, make the persistent navigation shrink-wrap its
  controls and address plus modest horizontal padding, center the complete bar
  in the viewport, and retain a safe maximum width so long localized content
  cannot overflow. Preserve the current mobile bar structure and four primary
  navigation actions.
- Remove the visible services eyebrow in both languages. Remove the now-unused
  copy field and avoid leaving an empty grid column or layout placeholder.
- Replace the long services display title with a short, elegant, structurally
  aligned provisional pair and center it horizontally in its available heading
  space. Initial implementation candidate:
  `Внимание во секој детаљ.` / `Care in every detail.` Keep it easy to replace
  during owner review without changing markup.
- Remove provisional wording from the phone, address, and Instagram labels.
  Rewrite the contact disclosure so it does not imply those confirmed facts
  await approval. It may continue to state the still-true limitations that a
  call or message does not confirm an appointment and that hours or
  unimplemented messaging channels remain unapproved.
- Reconcile `docs/product-spec.md` and current-state documentation with the
  already-confirmed phone, address, map destination, and Instagram details.
  Do not broaden that approval to hours, services, prices, booking behavior,
  final marketing copy, or any media permissions.
- In the Lookbook header, replace the visible `Студио` / `Studio` breadcrumb
  text with a larger left arrow only. Keep the return link's localized,
  descriptive accessible name and existing reverse route transition.
- Remove the visible `Лизгај хоризонтално` / `Scroll sideways` instruction.
- Remove the visible input-method copy to the right of the progress rail
  (`Повлечи · тркалце · стрелки` / `Swipe · wheel · arrows`) and rebalance the
  footer layout without changing the progress rail or image count.
- Remove image enlargement on pointer hover. Also remove the matching focus
  scale transform so keyboard focus does not cause the same unwanted visual
  zoom; preserve a clear focus-visible treatment for the linked image.
- Update `DESIGN.md` only for the durable navigation, service-heading, and
  Lookbook interaction rules introduced by this task.

## Suggested files

- `src/components/TypographySalonPage.jsx`
- `src/lib/homepage-copy.js`
- `src/components/lookbook/HorizontalLookbook.jsx`
- `src/lib/lookbook-copy.js`
- `docs/product-spec.md`
- `DESIGN.md`
- `docs/agent-handoff.md` at the next real continuity boundary

## Implementation steps

1. Inspect only the named copy objects and the affected homepage and Lookbook
   component regions.
2. Update bilingual copy first, preserving the existing `mk`/`en` structural
   alignment and confirmed link destinations.
3. Refine the homepage navigation and services heading without changing mobile
   navigation behavior or section semantics.
4. Simplify the Lookbook return control and footer/header chrome, remove the
   hover/focus scale behavior, and preserve accessible names and focus states.
5. Align the durable product and design documentation with the confirmed
   business facts and new visual rules.
6. Run the selected static checks once after runtime changes settle, then leave
   the rendered criteria for owner verification under the conservative policy.

## Acceptance criteria

- [ ] At desktop width, the persistent navigation is centered and only as wide
      as its contents plus modest padding; it no longer reads as a sparse,
      near-full-width bar.
- [ ] The confirmed street address appears as a working Maps link in the
      desktop navigation and is absent from the mobile navigation.
- [ ] The language control, Services, Studio, Lookbook, and Call actions remain
      available in one mobile row with their current destinations and
      accessible names.
- [ ] The services section shows no `Привремен индекс на услуги`,
      `Service index`, or empty structural remnant of that eyebrow.
- [ ] The services display title is a short, elegant provisional Macedonian /
      English pair and is horizontally centered in its heading space.
- [ ] The contact section labels the phone, address, and Instagram profile
      without `привремено` / `provisional`, while their values and destinations
      remain unchanged.
- [ ] Contact disclosure copy treats those three business facts as confirmed
      and limits cautionary language to facts that are genuinely still open,
      such as booking confirmation, hours, and unimplemented message channels.
- [ ] `docs/product-spec.md` no longer lists the confirmed phone, address, or
      Instagram profile among missing owner inputs; other open business,
      content, booking, and media decisions stay explicit.
- [ ] The Lookbook return link visibly contains only a clearly legible, larger
      left arrow, retains a localized descriptive accessible name, and keeps
      the existing reverse transition to the homepage.
- [ ] Neither Lookbook language displays the horizontal-scroll instruction or
      the input-method instruction beside the progress rail.
- [ ] Hovering or focusing a Lookbook image link does not scale or enlarge the
      image, and keyboard focus remains clearly visible.
- [ ] The Lookbook progress rail, image count, horizontal input behavior,
      centered settling, source links, development disclosure, and noindex
      behavior are unchanged.
- [ ] Macedonian remains the default and all changed user-facing or accessible
      copy stays aligned with the English variant.
- [ ] `DESIGN.md` records the durable desktop navigation density, services
      heading, and Lookbook interaction decisions without duplicating
      implementation detail.

## Non-goals

- Redesigning or adding content to the mobile navigation.
- Changing the confirmed phone number, address, Maps query, Instagram handle,
  or their link destinations.
- Approving hours, prices, service details, booking availability, messaging
  channels, final marketing copy, or media permissions.
- Changing Lookbook media, crops, resolution, scrolling physics, Lenis setup,
  snapping, progress calculation, route-transition choreography, disclosure,
  accessibility descriptions, or indexing policy.
- Adding a new animation, dependency, route, localization mechanism, or contact
  channel.

## Risks and stop conditions

- If the compact desktop bar cannot contain the confirmed address and all
  controls without clipping at the existing desktop breakpoint, keep it
  viewport-safe and pause before changing which controls or address text are
  shown.
- If removing the Lookbook helper text makes an accessibility label disappear,
  move the guidance to an accessible name or region description rather than
  restoring visible instructional chrome.
- Stop for owner direction before changing any confirmed contact value,
  destination, or the scope of business-fact approval.
- Keep copy tuning requested during owner review in this task rather than
  opening another task.

## Validation

- Run `pnpm lint` once after the runtime implementation is final.
- Run `pnpm build` once because the task changes shared runtime JSX and both
  homepage and Lookbook copy modules.
- Use targeted source searches to confirm the removed visible strings and
  image-link scale transforms are absent from live code.
- Under the conservative policy, do not run browser, viewport, screenshot,
  Playwright, visual, animation, or interaction validation unless the owner
  explicitly requests it.
- Leave these rendered checks awaiting owner verification:
  compact centered desktop navigation, desktop-only address visibility, stable
  mobile navigation, centered services title, arrow-only Lookbook return
  control, helper-text removal, and no image enlargement on hover/focus.
- Task, evidence, documentation, and handoff-only edits do not invalidate
  successful runtime checks.

## Completion notes

- Transition: complete at 2026-07-23T09:36:22.319Z
- Validation: Owner approved the already-implemented task on 2026-07-23; recorded lint and production build evidence remains valid, with rendered checks accepted by owner.
- Approved by: Owner

- Transition: block at 2026-07-23T09:32:24.157Z
- Reason: Owner reprioritized implementation to the custom booking system; rendered review for task 048 remains pending.

- Transition: start at 2026-07-19T23:40:30.110Z

- Completed: Implemented the compact, centered desktop navigation with a
  desktop-only confirmed-address Maps action; replaced the services eyebrow and
  long heading with the centered bilingual heading; corrected confirmed contact
  labels, disclosure, metadata, and product documentation; and simplified the
  Lookbook to an accessible arrow-only return control, a desktop utility
  navigation with language, Services, Studio, and Call actions, image count and
  progress rail without helper legends, and non-scaling linked images. Fixed a
  language-switch remeasurement loop in the decorative makeup-stroke overlay so
  its own scroll overflow can no longer inflate the homepage's bottom spacer.
  Added near-bottom anchoring for language changes: after translated copy
  settles, the shared scroll integration resizes and moves to the new true
  bottom only when the visitor switched within the bottom clearance. Added
  visit-local homepage scroll restoration for Lookbook trips: the transition
  controller captures the outgoing pixel/progress and restores it behind the
  closed curtain before arrow-link or browser-history returns reveal the page.
  Replaced breakpoint-specific terminal spacer values with a measured cubby on
  every viewport: a `ResizeObserver` tracks the rendered navigation height and
  keeps the page clearance at four-thirds of that height. The same measurement
  derives half of the surplus height as the bar's bottom inset, centering it
  vertically inside the cubby.
- Validation: `pnpm lint` passed. `pnpm build` passed, including the nine-file
  Lookbook media check, TypeScript, and static generation for `/`, `/lookbook`,
  and `/typography`. Targeted source searches found none of the removed visible
  strings or image-link scale props. The stroke geometry now derives its height
  from the root layout box rather than self-influenced scroll overflow. The
  language provider emits one settled-layout signal with the captured
  near-bottom state, and the scroll integration handles both Lenis and native
  reduced-motion scrolling. Homepage restoration uses the same integration to
  synchronize Lenis and ScrollTrigger, with a pre-paint native path for reduced
  motion.
- Deviations: Browser, viewport, screenshot, animation, and interaction
  validation were not run under the conservative validation policy.
- Follow-up: Owner verification remains pending for the compact desktop
  navigation, desktop-only address visibility, unchanged mobile row, centered
  services heading, arrow-only Lookbook return control, desktop Lookbook utility
  navigation, rebalanced chrome, stable bottom spacing after repeated language
  switches, exact homepage return position through both arrow and browser
  history, and absence of image enlargement on hover and focus. Keep this task
  in progress until that rendered review is accepted.
