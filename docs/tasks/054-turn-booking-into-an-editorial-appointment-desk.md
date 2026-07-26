# Turn booking into an editorial appointment desk

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Turn `/booking` from a sparse form card into a useful editorial appointment
desk that feels native to the existing salon site.

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Add a responsive image-led booking summary panel using the provisional
  disclosed real-studio interior asset.
- Give the working form a substantial companion sheet rather than leaving it
  isolated in empty page space.
- Make service selection denser on desktop, add a seven-day quick-date rail
  alongside the native date input, group available times by morning/afternoon,
  and carry the selected appointment summary through contact and success.
- Preserve the existing API flow, validation, keyboard behavior, live regions,
  global language, no-script fallback, and shared navigation.
- Keep review corrections and tuning in this task until the outcome is accepted.
- Tune the homepage services overview to four localized service groups with one
  full-catalog booking CTA, keeping the homepage decoupled from booking's
  authoritative service catalog.

## Suggested files

- `src/components/booking/BookingExperience.jsx`
- `src/lib/booking/booking-copy.js`
- `DESIGN.md`
- `tests/booking/`

## Acceptance criteria

- [x] Desktop uses a balanced two-column editorial desk with a sticky visual
  appointment summary and a clearly bounded working surface.
- [x] Mobile converts the visual panel into a compact summary above the controls
  without hiding essential information.
- [x] Services scan in a responsive grid; date selection offers seven immediate
  dates plus the obvious native picker; slots are grouped by time of day.
- [x] Service, duration, price, date, and time remain visible as the booking
  advances, with truthful pending states before selection.
- [x] The reused provisional interior photograph retains localized media
  disclosure and honest alt text.
- [x] Existing accessibility, state-management, API, language, and navigation
  contracts remain intact.
- [x] Homepage services now presents localized Haircuts, Styling, Colour &
  treatments, and Makeup groups without catalog prices, durations, or individual
  service names, plus one CTA into `/booking` for the full catalog.
- [x] Booking tests, lint, and production build pass; rendered appearance remains
  awaiting owner review under conservative validation.
- [ ] Homepage rendered appearance remains awaiting owner review under
  conservative validation.

## Non-goals

- New media generation, production photography claims, API changes, or another
  navigation redesign.
- Reintroducing inert numbered step bullets or adding decoration without a
  booking purpose.

## Validation

- Select the smallest commands and owner checks before implementation and run them once after the runtime change is final.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Do not substitute every static check for unavailable rendered validation. Leave rendered criteria awaiting owner verification when necessary.
- Task, evidence, and handoff-only edits do not invalidate successful runtime checks.

## Completion notes

- Transition: complete at 2026-07-26T01:18:11.297Z
- Validation: Owner approved the rendered booking/homepage UI outcome on 2026-07-26; focused booking/static tests, lint, and production build evidence are recorded in the task, with final hero media and veil tuning accepted.
- Approved by: Owner

- Transition: start at 2026-07-23T15:27:39.844Z

- Completed: Rebuilt the route as a responsive editorial booking desk with a
  disclosed image-led summary, live service/appointment state, responsive
  service grid, seven-day date rail, native alternate-date input, grouped
  morning/afternoon slots, denser contact sheet, and summary-aware success
  state. Removed the now-redundant visible masthead and made the summary and
  working sheet share exact desktop row edges. Added landing-page-equivalent
  live navigation-height measurement so the desktop desk occupies the remaining
  viewport without entering the bar's cubby. Compacted the Service step so it
  has no nested scrollbar and opted later overflow states out of global Lenis so
  their emergency sheet scrolling remains operable. Compacted the appointment
  date/time grids and added a global native scrollbar skin using the established
  warm palette while preserving Lookbook's intentionally hidden rail. Updated
  the working sheet with directional Motion transitions for forward, backward,
  stale-slot, and confirmation state changes, including reduced-motion and
  post-entry focus behavior. Updated bilingual booking copy and the durable
  Booking design contract.
- Validation: `pnpm test:booking` passed 81/81 before the final static-contract
  addition; the affected flow/static subset then passed 8/8. `pnpm lint` and
  `pnpm build` passed. After the owner alignment correction, the affected static
  contract passed 3/3 and lint/build passed again.
  The navigation-clearance correction also passed the affected 3/3 static
  contracts plus lint and build. The Service overflow/Lenis correction passed
  the same affected 3/3 contract set, lint, and build. Appointment compaction
  and the global scrollbar contract passed 4/4 affected tests, lint, and build.
  Directional screen transitions passed the affected flow/static set 10/10,
  lint, and build. The final motion correction replaced the crossfade with
  translate-only slide-out/slide-in movement and made the persistent progress
  rails animate their fill/drain state; the affected flow/static set passed
  10/10 again, with lint and build also passing. Owner review exposed that
  sequential presence timing still read as two disconnected movements. Reworked
  the step handoff as a true full-width carousel: outgoing and incoming keyed
  panels now overlap in one grid area and Motion animates both simultaneously
  on one easing curve. Motion remains the clearer fit than GSAP here because
  the transition is directly coupled to React mount/unmount presence and already
  uses `AnimatePresence`; no additional dependency or imperative timeline is
  needed. The carousel correction passed the affected flow/static set 10/10,
  lint, and the production build. Owner screenshot review then exposed moving
  panels painting through the sheet's padding gutter; the carousel grid now
  owns its horizontal clipping boundary so content remains inside the form
  viewport throughout the handoff. The clipping correction passed the affected
  flow/static set 10/10, lint, and the production build. Follow-up owner review
  found a smaller residual gutter leak, so the carousel now uses an isolated
  `overflow-hidden` viewport with an explicit inset clip path. Missing-slot
  validation also moved from the appointment content stack to an absolutely
  positioned message beside the Continue control, retaining live-region,
  described-by, and programmatic-focus relationships without reflowing the
  choices. These corrections passed the affected flow/static set 11/11, lint,
  and the production build. A subsequent development hydration warning exposed
  route-derived service preselection disagreeing with preserved client flow
  state on the first client render. The booking screen now uses an intentionally
  empty server/hydration snapshot through `useSyncExternalStore`, exposes the
  validated route preselection immediately after hydration, and commits that
  selection into flow state on progression. This keeps the initial button and
  radio attributes deterministic without suppressing hydration warnings. The
  affected flow/static set passed 12/12, lint and the production build passed,
  and localhost SSR now returns the same disabled initial button snapshot while
  retaining the validated `initialServiceId` in the React payload.
- Review corrections: removed the global notice renderer so availability,
  appointment-action, and contact/submission messages each have one contextual
  live region; correction edits clear stale feedback. The appointment action
  status now covers missing date, missing slot, and taken-slot feedback without
  reflow or a large shadow. The carousel viewport uses safe gutters without the
  prior inset clip-path, and exiting Motion panels become inert, aria-hidden,
  and pointer-inactive immediately. Confirmation service data now wins over a
  deep-link fallback, short desktop sheets remain vertically reachable, and
  contact fields carry phone/email autocomplete metadata. Quick-date generation
  is anchored to a server-provided Skopje date to keep SSR/hydration stable.
  Focused static/flow/navigation contracts pass 16/16 after the correction.
- Current carousel contract: owner-rendered review rejected the subsequent
  `AnimatePresence mode="popLayout"` result as well. The working flow now uses
  one persistent Motion track instead of swapping presence children: Service,
  Appointment, Contact, and Success sit at exact panel-width offsets and the
  track translates to the active index as one continuous object. A
  `ResizeObserver` keeps the viewport matched to the active panel's variable
  height, while inactive panels remain inert, aria-hidden, and pointer-inactive.
  The sheet is also split into a rounded overflow-hidden outer shell and a
  separate inner vertical scroller, preventing the scrollbar track from
  visually squaring the shell's right corners. Owner screenshot review exposed
  that putting the safe gutter on the clipped viewport left that gutter inside
  the track's paint area, revealing slivers of adjacent screens. The viewport
  now has zero padding and each exact-width panel owns its safe padding, so
  panel offsets and track translations meet the clip edge exactly. Final
  validation after this correction: `pnpm test:booking` passed 88/88,
  `pnpm lint` passed, and `pnpm build` passed.
- Summary-card tuning: the live card over the image now uses reduced-motion-aware
  Motion layout animation so changes in selected service and appointment detail
  interpolate the card's position and dimensions rather than snapping. The
  affected static/flow set passed 14/14, with lint and the production build also
  passing.
- Availability/transition tuning: selecting a service now starts a deduplicated,
  concurrency-limited background prefetch for the seven visible dates. Successful
  results are cached for 60 seconds, reused without a loading-state reflow, and
  invalidated when the authoritative booking write reports a taken slot. The
  booking endpoint remains the final conflict authority. During a carousel move,
  the measured viewport now retains the taller of the outgoing and incoming
  panels until Motion finishes, preventing lower slot rows from being clipped by
  the shorter contact panel. Validation after this correction:
  `pnpm test:booking` passed 89/89, targeted ESLint passed, and `pnpm build`
  passed.
- Deviations: Conservative validation prohibits browser, viewport, screenshot,
  and interaction inspection, so the responsive visual acceptance criteria are
  implemented statically but await owner review in the already-running local
  app.
- Homepage tuning: Replaced the catalog-derived homepage service rows with four
  localized service groups and a single `/booking` CTA. The homepage no longer
  imports booking `SERVICES` or `serviceNames`; `/booking` remains authoritative
  for the full catalog. Adversarial review then tightened the desktop row grid,
  the design wording, and the static contract. The final affected contract
  passed 9/9 and targeted ESLint passed; rendered homepage review remains
  pending under conservative validation.
- Scroll-performance correction: owner review reported intermittent scroll
  hitches, worst where the hero blur boundary meets the large STUDIO word and
  also around later reveal moments. The hero veil's backdrop blur is now a
  static child of a lightweight clipping wrapper; GSAP scrubs the veil and
  foreground boundaries directly without a per-frame `onUpdate`/`gsap.set`
  callback. Makeup reveal booleans now come from a stable external visibility
  store via `useSyncExternalStore`, so threshold updates notify only consumers
  whose snapshot changes while preserving the existing setter API, reduced
  motion, outside-provider fallback, and deterministic SSR snapshot. Added a
  focused static performance contract. Targeted tests and ESLint passed; no
  browser/viewport validation was run under the conservative policy, so the
  reported hitch correction remains pending owner-rendered review.
- Review correction: MakeupStroke trigger cleanup now only kills its
  ScrollTrigger and leaves the shared motion state intact across
  `revertOnUpdate` geometry/Strict Mode re-initialization. Motion is marked
  inactive only for reduced motion or a genuinely missing root/layer; the
  transient first-frame geometry gap keeps the initial concealed snapshot
  instead of flashing every reveal. The server visibility snapshot is
  immutable and independent of live scroll thresholds. The static performance
  contract now guards these lifecycle/SSR invariants, direct veil containment,
  a single curtain-hero image source, and the absence of per-frame curtain
  callbacks. The final targeted motion/booking contracts passed 11/11 and
  targeted ESLint passed; rendered validation remains pending under the
  conservative policy.
- Follow-up: Keep this task IN PROGRESS for owner-rendered review of the homepage
  and booking route, plus any tuning requested from either surface.
- Media selection update: renamed the three selected no-recognizable-person
  source photos in `public/media/placeholders` to the provisional interior,
  reception-detail, and styling-chairs set. Homepage and booking metadata/copy
  now describe real photos awaiting final owner approval; homepage rendered
  review remains pending under conservative validation.
- Media review correction: the exact source-to-role mappings are
  `iEo6KfZL.jpg` -> `glamour-studio-interior-wide.jpg` (interior, 2048x1536),
  `Cj79dfbO.jpg` -> `glamour-studio-reception-detail.jpg` (reception,
  1536x2048), and `AtpetAf3.jpg` -> `glamour-studio-styling-chairs.jpg`
  (stations, 1536x2048). The two deliberately renamed sources are
  `8T0VnkKo.jpg` -> `glamour-studio-work-area-source.jpg` and
  `tg6TAmIG.jpg` -> `glamour-studio-lounge-source.jpg`. The other 11
  source-named JPGs (`__O51Reg.jpg`, `-8OSyS49.jpg`, `0lStfNGN.jpg`,
  `d4hMbpe-.jpg`, `JkNUm0df.jpg`, `KjtlrimV.jpg`, `KVmRHVO-.jpg`,
  `Ru4q0gDw.jpg`, `tYXKMmAc.jpg`, `u8v-iDLz.jpg`, `w7gPDCz1.jpg`) and the
  three existing concept PNGs were left untouched.
  Homepage media alts and captions now describe only visible scenes; customer
  copy says the photographs are used provisionally without exposing internal
  directory wording. The `https://example.com` metadata base remains unchanged
  as an explicit pre-launch owner-origin blocker; tests cover selected asset
  wiring/dimensions and do not claim a usable public OG URL.
- Media role-separation correction: the current source-to-delivery mappings are
  `glamour-studio-interior-wide.jpg` ->
  `glamour-studio-hero-clean-4k.jpg` (hero/interior, 4096x3072),
  `glamour-studio-work-area-source.jpg` ->
  `glamour-studio-work-area-4k.jpg` (studio work-area anchor, 4096x3072),
  `glamour-studio-reception-detail.jpg` ->
  `glamour-studio-reception-detail-4k.jpg` (reception detail, 3072x4096),
  and `glamour-studio-lounge-source.jpg` ->
  `glamour-studio-lounge-clean-4k.jpg` (lounge detail, 3072x4096). The
  originals remain in `public/media/placeholders`; localized AI edits were
  object-removal only, and upscaling used localized patch compositing onto the
  originals before Lanczos3/sharpen/JPEG derivative export. The implementation
  now exports `homepageHeroMedia` separately from `homepageStudioMedia`, so the
  studio band cannot reuse the hero source while booking and Open Graph keep an
  explicit hero relationship. The focused media contract passed 3/3, including
  actual file/dimension checks, distinct-source checks, consumer wiring, and
  localized copy IDs. Targeted ESLint is recorded below; rendered homepage and
  booking review remains pending under conservative validation.
- Validation evidence for the media correction: `rtk pnpm exec node
  --conditions=react-server --test tests/booking/homepage-media-contract.test.mjs`
  passed 3/3, and `rtk pnpm exec eslint src/lib/homepage-media.js
  src/lib/homepage-copy.js src/components/TypographySalonPage.jsx
  src/components/booking/BookingExperience.jsx src/app/layout.jsx
  tests/booking/homepage-media-contract.test.mjs` passed. No browser,
  screenshot, viewport, Playwright, or interaction validation was run.
- Mobile service-selection correction: the booking sheet and its inner wrapper
  now use natural height and visible overflow below `lg`, so touch scrolling
  remains with the document instead of a nested form scroller. Service choices
  start as a compact two-column grid with full-card radio targets and wrapping
  duration/price metadata. Desktop retains a bounded, viewport-derived desk
  height with an inner emergency scroller for short viewports. The focused
  static contract passed 9/9 and scoped ESLint passed; rendered mobile behavior
  remains pending owner verification under the conservative validation policy.
- Calendar-invitation guidance: the confirmed-booking panel now gives aligned
  Macedonian and English guidance for Google's first-invitation unknown-sender
  handling, including the customer action required to add the appointment and
  conditional wording for future automatic additions. The existing
  `requested`/`unknown` invitation status remains authoritative and the
  guidance is ordinary text rather than a duplicate live region. Adversarial
  review strengthened the static truthfulness contract; the final focused
  contract passed 10/10 and targeted ESLint passed. No rendered validation was
  run under the conservative policy.
- Selected-time hover correction: a checked time pill now overrides the
  unselected cream hover with the same lighter `accent` brown used by the
  primary Continue action, while retaining its selected border, text, focus,
  and native radio behavior. Scoped ESLint passed; rendered hover behavior
  remains pending owner verification under the conservative validation policy.
- Homepage section-anchor correction: the Services and Studio nav hashes now
  target their section boundaries, so native hash scrolling aligns the
  Hero/Services and Services/Studio dividers with the viewport top. Each
  heading retains a distinct ID referenced by its section's `aria-labelledby`.
  Review posture was `none` for this localized, explicit correction. The
  focused navigation contract passed 3/3 and targeted ESLint passed; rendered
  scroll alignment remains pending owner verification under the conservative
  validation policy.
- Hero veil/text-boundary correction: the blur veil and hero foreground now
  derive their local clip insets from one fractional, rect-measured physical
  boundary. Function-valued `fromTo` starts and endpoints keep both layers
  synchronized through normal scroll progress and ScrollTrigger refreshes
  after resizing or wrapping changes, without hardcoded seam offsets, per-frame
  layout reads, or changes to the static blur child. Adversarial review first
  exposed and corrected negative-inset interpolation and stale refreshed-start
  defects; re-review approved the final implementation with no actionable
  findings. The focused motion/booking contracts passed 12/12, targeted ESLint
  passed, and the reviewer contract passed 2/2. Rendered confirmation remains
  pending owner verification under the conservative validation policy.
