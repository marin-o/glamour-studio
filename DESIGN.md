---
version: alpha
name: "glamour-studio Visual System"
description: "A soft, elegant, Macedonian-first salon presence shaped by creamy pink, peach-beige warmth, warm browns, real studio media, and graceful motion."
colors:
  primary: "#D8A6A6"
  secondary: "#F1D5C8"
  accent: "#8A5F4A"
  surface: "#FFF8F5"
  surface-muted: "#F6E7DE"
  on-surface: "#34241F"
  on-muted: "#6F5650"
  outline: "#D8BDB2"
typography:
  display: "Review candidate: Cormorant Garamond variable, weights 300–700, with Cyrillic Extended coverage; use 600 as the default heading weight."
  body: "Review candidate: Manrope variable, weights 200–800, with Cyrillic Extended coverage."
  label: "Manrope in clear 600–800 weights with restrained letter spacing."
spacing:
  compact: "8px"
  rhythm: "16px"
  section: "64px mobile, 96px desktop as a planning baseline."
motion:
  feedback: "Subtle fades, opacity, and small transform changes only when useful."
  reveal: "Role-based system: reserve a one-time typewriter entrance for the hero studio name; use side-aware editorial line assembly for aligned headings and lists, selective makeup-stroke-connected reveals for supporting copy, and static text where motion adds no meaning."
  environmental: "Future real salon hair-movement video may join or replace the stroke when owner-approved media exists."
components:
  navigation: "Use one shared persistent site bar on every customer-facing route: bottom-positioned on standard pages and top-positioned on Lookbook."
  cta: "The shared bar keeps booking primary, mobile-first, accessible, and direct."
  card: "Used sparingly for repeated service or gallery items; avoid nested cards."
  section: "Full-width bands or unframed constrained layouts, not floating page-section cards."
---

# glamour-studio Design

`DESIGN.md` is the authoritative visual contract for agents. Start here before
changing layout, typography, color, component styling, motion, visual hierarchy,
texture, imagery, or interaction states.

## Overview

The website should feel like a calm, elegant local salon rather than a generic
beauty template. The visual mood is creamy pink, faint peach-beige, and warm
brown, with soft polish and enough restraint to feel credible to local clients
in Radovish.

The design should make the actual studio feel present once real media exists.
Until then, placeholders must be honest, replaceable, and visually marked as
temporary.

## Experience Principles

- Lead with trust and atmosphere before decoration.
- Make contact and booking intent immediately reachable on mobile.
- Keep the page simple and refined; avoid clutter and overbuilt luxury tropes.
- Let real salon media carry the emotional weight when available.
- Preserve a strong static experience when video, scroll effects, or JavaScript
  enhancements are unavailable.
- Treat placeholders as planning materials, not final business claims.

## Colors

The palette should start from soft creamy pink and peach-beige surfaces, grounded
by warm brown text and accents. Pink should feel atmospheric and interior-led,
not candy, neon, or cosmetic-counter bright.

Use the accent brown for primary CTAs, active states, small separators, and
high-value details. Keep surfaces warm and light. Avoid monochrome pink overload
by using brown, cream, and restrained neutral contrast to give the page depth.

Contrast must be checked during implementation, especially for text placed over
video or photography.

## Typography

The direction is refined and readable. Display type may use an elegant serif or
editorial face if it supports Macedonian characters well; body and UI labels
should stay highly legible on mobile.

Do not use cramped tracking, tiny all-caps labels, or decorative scripts for
critical information. Button text, contact labels, hours, prices, and address
details must be plain and scannable.

The current review pair is Cormorant Garamond for editorial display text and
Manrope for body/interface text. Both are loaded as variable fonts with
`cyrillic` and `cyrillic-ext` subsets. Keep fallbacks in place until the owner
accepts or replaces the pair.

## Layout And Spacing

Build a single-page, mobile-first flow with strong section rhythm:

- hero;
- localized three-group service overview leading to the authoritative `/booking` catalog;
- gallery or studio vibe with the concise about-and-trust copy integrated;
- contact and location;
- persistent bottom contact or booking CTA.

Sections should be full-width bands or unframed layouts with constrained inner
content. Avoid treating every page section as a floating card. Cards are
acceptable for repeated service placeholders, gallery items, or contact methods
when they improve scanning.

The bottom navigation/CTA bar must not cover essential content. Give the final
section enough padding so contact/location details remain reachable.

## Homepage Media Placement

After the service index, the homepage has one customer-facing studio-media band:
use the work-area image as the anchor and two smaller vertical supporting images
for the reception detail and lounge detail. Keep the layout calm and asymmetric;
this is one visual moment, not a gallery, carousel, or lookbook. The band must
never reuse the hero source.

The type-first hero uses its separate interior hero image as a full-section,
softly blurred background behind the intro copy. Keep the studio name and
primary message first, use a warm stable contrast veil, and keep the shared
`Provisional selection of real photographs — final media approval is pending` label visible in the foreground.
The background is decorative and static; it must not obscure focus, reading, or
the contact path, and it must not add a new animation treatment.

For motion-enabled visitors, the hero-to-services boundary may briefly open as
a scroll-driven curtain onto a sharp, tightly cropped band of that same
interior photograph. Use the hero's existing image element as the only photograph:
the resting veil supplies the soft blur, then retracts to expose the sharp
pixels already beneath it. The warm services-colored surface advances across
the page only as the real services section reaches it through normal document
scroll. Do not add a synthetic upward-closing cover after the sharp window
opens; let the revealed hero image leave the viewport naturally. Keep the
opening partial, reversible, and tied to native page progress; do not pin the
page, add a second scroll controller, duplicate the hero photograph, or turn
the transition into a standalone media section. Reduced-motion and no-script
presentations keep the normal closed boundary.

The makeup stroke must not appear in the hero or cross the photographic band.
The following solid section owns a hard, ungrouped route anchor at its exact
top edge; that anchor is the stroke's true first touch-down point, not a resumed
or clipped continuation. Keep one static, non-animated surface clip as a safety
boundary around the maximum photographic band while preserving the localized
opacity chunks that draw the stroke. Leave all downstream chunks on their
normal viewport-based thresholds so pigment begins once at the solid edge and
continues only in its original forward direction. Never synthesize hidden hero
geometry, reveal already-passed chunks backward to create a connection, delay
service-copy entrances for the curtain, animate the surface clip, or trigger a
whole-layer repaint.

The role-separated contract lives in `src/lib/homepage-media.js`: the hero is
`homepageHeroMedia`, while `homepageStudioMedia` contains the work-area anchor,
reception-detail support image, and lounge-detail support image. The originals
remain in `public/media/placeholders`; live routes use the corresponding 4K
delivery derivatives. The localized AI edits were object-removal edits only.
Where an original needed upscaling, a localized patch was composited onto the
original before Lanczos3/sharpen processing and JPEG derivative export. These
are high-quality 4K delivery derivatives, not a claim of recovered true detail.

The imagery does not carry a visible provisional disclosure. Accurate alt text
and captions remain required: describe only visible scenes and must not identify
people, approval state, internal placeholder wording, or unseen claims. Booking may
reuse the hero image because it is a separate route; Open Graph metadata also
uses the hero role. Client images remain unused pending explicit permission.

## Components And States

The primary CTA leads to the booking route while direct phone contact remains
visible. Use direct, accessible labels and visible focus states; never claim a
booking until the server confirms it.

On desktop, the shared navigation should shrink-wrap its controls and confirmed
street-address action, remain centered and viewport-safe, and avoid
the sparse appearance of a near-full-width bar. The address action stays hidden
on mobile so Services, Studio, Lookbook, and Book remain in one row. Standard
pages place the bar at the bottom; Lookbook uses the same bar at the top so its
horizontal progress footer remains unobstructed.

The services section uses one concise, centered display heading without an
eyebrow or an empty alignment column. It presents three broad localized groups —
haircuts and styling, colour and treatments, and makeup — without prices,
durations, or individual catalog names. One clear localized CTA routes to
`/booking` for the full authoritative service catalog.

The homepage is Macedonian-first. Its server-rendered and no-JavaScript copy
must be Macedonian, with a single plain-text language toggle inside the homepage
instance of the shared navigation. It shows `EN` as the action from Macedonian and
`MK` as the action from English, without a visible button container. The
selection is held in root-level memory for the current app visit, follows
client-side navigation to Booking and Lookbook, updates the document language, and
resets to Macedonian on a full reload. It must not introduce locale routes,
cookies, local storage, or duplicate language controls on subpages. Keep both
language sets structurally aligned in
`src/lib/homepage-copy.js` so owner-approved replacements do not require layout
or interaction changes.

The hero is brand-led and pairs the studio name with one concise,
customer-facing introduction. It does not carry concept, provisional, or
launch-status paragraphs. The studio-media band relies on its heading and
accurate image alternatives rather than visible media-status copy. The brief
salon introduction belongs inside that media band rather than in a standalone
full-width section. It and the contact section use owner-directed Macedonian
customer-facing copy; English remains a later editorial refinement.

Gallery and media components should distinguish real salon media from temporary
placeholders. Confirmed services, prices, durations, and studio time zone are
not placeholders.

The booking route is a three-step service, appointment, and contact flow. It
states what data is collected and where it goes, has a direct phone/no-script
fallback, and presents confirmation only after the API returns it.

## Motion And Progressive Enhancement

The current signature motion is a scroll-scrubbed abstract makeup stroke that
traces the typography-led homepage from the services edge through contact. It
should feel like a soft brush or lipstick gesture in the existing blush and
warm-brown palette, not like a plain chart line or a generic decorative
flourish.

Text motion uses a small, role-based vocabulary instead of one repeated reveal
preset:

- reserve a typewriter entrance for the studio name in the hero only;
- let editorial text lines enter from the side established by their existing
  left- or right-aligned layout;
- use makeup-stroke-connected reveals selectively where the stroke's passage
  gives the entrance a clear spatial reason.

Motion/Framer Motion owns every text entrance. The existing makeup-stroke
provider supplies timing to both editorial and stroke-pass treatments so text
does not add another scroll observer; the `stroke` role is reserved for the
smaller directional response near a local stroke passage. Hero title characters
are duplicated only in an `aria-hidden` visual overlay while the complete,
selectable heading remains the single accessible text source.

Do not apply the typewriter treatment site-wide or turn every text element into
an individually staggered word or character sequence. Body copy must become
readable promptly, and all three treatments need static and reduced-motion
fallbacks that expose the complete text without waiting for animation.

The stroke follows measured text/section anchors instead of hardcoded page
pixels. Text reveals may be synchronized to the stroke, with GSAP owning scroll
timing and Framer Motion owning the entrance animation. Over the dark contact
band, the stroke uses a restrained blush/peach palette, but only where it
crosses the dark band. It must not globally change color or reduce contact text
readability.



The stroke route should be simplified into an elegant spline rather than
connecting every reveal point. Keep turns long, soft, and editorial; avoid
hairline, pencil-like, chart-like, or sharply kinked paths. The brush rendering
should read as a translucent cosmetic swipe with a soft wash and subtle texture,
not as a hard vector outline.

The stroke must render as a bristled brushstroke, never a constant-width
rounded-cap tube: pointed tapered tips where the gesture touches down and lifts
off, width that varies like brush pressure, furrow streaks inside the pigment
band, and at most faint flyaway bristles outside it. Hair connotations are
welcome only as multiple flowing strands within one gesture; nothing may read
as a single stray hair lying on the page.

Motion must hold scroll framerate. The stroke layer must not use SVG filters,
and no scroll-driven effect may invalidate the whole stroke's paint on every
frame (no dashoffset scrubbing or full-layer animated masks); reveal the
stroke in small localized pieces instead. Text reveals animate transform and
opacity only.

A future scroll-scrubbed hero video of real salon hair movement remains an
owner-gated direction. If that media exists later, it may join or replace the
stroke, but generic stock video must not be used as a substitute.

Motion must be progressive enhancement:

- provide static readable content, and a poster/fallback image for any future video;
- respect reduced-motion preferences;
- keep contact and service discovery usable without scroll-linked effects;
- avoid motion that blocks reading, tapping, or page performance.

Owner-approved exception: Lenis smooth scrolling is active site-wide, driven
by the GSAP ticker so scroll-linked motion stays in sync. It must be skipped
under prefers-reduced-motion (native scrolling untouched) and must never
break anchors, focus behavior, or keyboard access.

Do not fake video presence with unrelated generic stock glamour. If real video
is missing, use an explicit placeholder treatment until media is available.

## Imagery, Media, And Texture

Preferred final media should come from the real salon: interior details, service
moments, tools, textures, and the planned hair-movement hero video. Backgrounds
may feel soft and warm, but should not obscure the need for real local trust.

Temporary imagery must remain visibly replaceable. Avoid dark, blurred,
generic-luxury stock images that could belong to any salon anywhere.

Texture, if used, should be subtle: soft grain, paper-like warmth, or gentle
material cues that support the creamy studio mood. Avoid decorative blobs,
heavy gradients, neon glow, or ornate glamour effects.

### Lookbook

`/lookbook` is a full-viewport, noindex horizontal editorial sequence rather
than a general gallery. Its media should move sideways from one
large image to the next with stable cover crops and warm cream breathing room.
Keep `Lookbook` as the untranslated product label. Its surrounding interface,
instructions, source links, and accessibility copy follow the root-level
language selected on the homepage; a direct or refreshed route load uses
Macedonian by default.
A route-local horizontal Lenis instance owns continuous wheel and trackpad
momentum; after input stops, the bundled Lenis snap layer eases the nearest
image into the viewport center. Touch swiping remains native and receives the
same settled center, while CSS snapping is reserved for reduced-motion and
no-script fallbacks. Keyboard image-to-image navigation must center the
requested frame. Do not collapse the route into masonry, a carousel with
separate controls, a modal, or a vertically scrolling page.

The route transition is one continuous blush curtain owned by Motion: from the
homepage it slides in from the right before navigation and exits left after the
lookbook renders; the localized Studio return link reverses that direction. The
curtain must never mount at full coverage or appear abruptly between its two
movements.
Browser Back and Forward use the same choreography: retain the departing route
by intercepting `popstate` before App Router receives it, move the curtain to
full coverage, replay the original history state to the router behind the
curtain, then reveal the destination in the corresponding direction. History
must fail open if the transition controller is unavailable. Same-document
fragment traversal must bypass the curtain because it does not change the App
Router pathname and therefore has no route commit to trigger a reveal.
When a visit moves from the homepage into Lookbook, retain its vertical scroll
position in visit-local memory. Returning with the arrow control or browser
history must restore that position behind the fully closed curtain before the
homepage is revealed, without visible automatic scrolling. Preserve the exact
pixel when layout height is unchanged and equivalent normalized progress when
localized copy changes the page height. Explicit Services or Studio links from
the Lookbook continue to target their named sections instead.
A layered cosmetic-brushstroke rail at the bottom grows continuously from left
to right with horizontal progress and pairs with a current-image count; it
supports the sequence without covering the photography. Under reduced motion
navigation is immediate and the progress state remains legible without
depending on animated movement.

Lookbook uses the same shared site-navigation bar as every other route, fixed at
the top rather than the bottom. Preserve its arrow-only Studio return action as
the leading control inside that shared bar, while removing the old header's
duplicate language, Services, Studio, and Call controls. Mark Lookbook as the
current item in the shared bar. Keep the progress rail and image count in the
footer without a separate input-method legend. Linked images must
not enlarge on hover or keyboard focus, and their focus-visible treatment must
remain clear.

The current nine local Instagram frames are development-only media. Keep the
route noindex until the owner records website-reuse approval,
recognizable-person permissions, and production-resolution replacements. The
owner directed removal of the visible development disclosure on 2026-07-24;
that content decision does not itself record or imply media permission.
Descriptive alt text must describe only the visible frame and
must never reuse Instagram captions or make unverified service claims. Each
visual links to its original source and identifies Reel cover frames as stills
rather than local video. The route uses the top-positioned shared navigation and
retains its route-specific progress footer.

Lookbook raster delivery follows the Gyroid media contract: preserve source
pixels, generate and validate intrinsic dimensions, request quality 100 through
`next/image`, and let responsive `sizes` plus browser format negotiation control
transfer cost. The current development frames are only 640px wide, so this
contract prevents additional degradation but does not make them
production-crisp; approved higher-resolution originals remain required.

## Accessibility And Fallbacks

Design decisions must support readable contrast, keyboard focus, semantic
sections, accessible buttons/links, reduced motion, and graceful media failure.

Important contact actions must work without relying on animation. Any text over
media needs an implementation-level contrast strategy, such as a stable overlay,
solid band, or alternate layout.

## Booking Experience

`/booking` is a calm, editorial three-step route rather than a separate card
system. It reuses the warm surface, ink, line, and accent tokens; service rows
link directly to trusted catalog IDs, while the persistent primary action leads
to online booking and the phone remains directly visible in Contact. Appointment
selection, form messages, and confirmation use semantic native controls and
plain visible state changes with no motion dependency. Repeated service and
appointment choices use generously padded, softly rounded warm radio cards with
visible borders, hover/focus rings, and a decisive blush/brown selected
treatment; the native radio remains in the accessibility tree. The main booking
surface, date and contact fields, notices, and selected-service summary use the
same generous rounded geometry instead of sharp rectangular boxes. Primary
actions are rounded pills; secondary actions remain clearly bounded and rounded
rather than reading as adjacent text. Appointment/contact steps show one
editorial selected-service summary strip with duration, price, and a bordered
Change service action. The three-step position is communicated by one compact
`Step n of 3 — Label` progress treatment and track rather than inert numbered
bullets. Date input remains native but is presented as a full-width warm field
with helper copy and a calendar cue. Primary Continue/Confirm actions are filled
warm-brown buttons; Back, Change, and Retry use bordered warm surfaces, all with
clear hover, disabled, and focus-visible states. Action bars keep controls
separated and stack on narrow screens. The booking route consumes the global
language selected on the homepage and must not duplicate the language picker.
It has a meaningful phone fallback when JavaScript or online availability is
unavailable. Name, phone, and a syntactically valid customer email are mandatory
at both the client and public server boundary so every accepted booking can
request a Calendar invitation.

On wide screens, compose Booking as one editorial appointment desk: one
image-led summary at the left and one substantial working sheet at the right,
top- and bottom-aligned to the same row height. The summary reuses the
interior photograph with honest localized alt text and no visible media-status
label. It shows only useful live state—service, duration, price, date, and time—
with truthful pending copy before selection. On narrow screens it becomes a
compact summary above the working sheet rather than disappearing. Service
choices may use a two-column grid where space permits. Appointment selection
presents the next seven local studio dates as obvious rounded buttons while
retaining the native date input for any other date; returned times are grouped
into morning and afternoon for scanning. Carry the same live summary through
Contact and confirmation instead of repeating separate nested summary cards.
When that summary card gains or loses service and appointment detail, Motion
layout animation interpolates its position and dimensions instead of snapping;
reduced-motion preference keeps the immediate static resize.
Do not fill the route with ornamental statistics, generic feature claims, or
additional progress furniture.

Do not repeat a visible route masthead above this desk. The image summary
already establishes the booking context, so retain only a semantic page heading
for assistive technology and place state-specific headings inside the working
sheet.

Booking uses the same measured navigation cubby as the landing page: observe
the rendered bottom bar height, reserve a four-thirds-height cubby around it,
and center the fixed bar inside that space. On desktop, subtract that measured
space and the route's top inset from the aligned image/form row so the page
itself stays within one dynamic viewport and the bar never overlaps either
surface. Keep the ten-choice Service step compact enough to fit without its own
scrollbar. If a short desktop viewport cannot contain a later active form,
scroll only the working sheet, mark that nested region to bypass global Lenis,
and keep the image and page frame fixed. Mobile retains normal document flow
plus the measured bottom cubby.

Keep the appointment step compact before relying on overflow: the seven-day
rail uses one desktop row, time pills use a dense six-column desktop grid, and
morning/afternoon spacing stays restrained. When scrolling is still necessary,
use the platform scrollbar with one global site skin—thin warm track, rounded
accent-brown thumb, darker hover—rather than page-specific JavaScript
scrollbars. Preserve Lookbook's intentionally hidden horizontal rail scrollbar.

Booking step changes use one restrained Motion-owned directional transition
inside the working sheet. Forward progression enters from the right while the
prior screen leaves left; Back and Change service reverse that direction. Keep
the image summary and outer desk stationary. Treat the step handoff like one
continuous carousel movement: the departing and incoming screens travel a full
panel width at the same time, on the same easing curve, with no pause or
crossfade. Implement this as one persistent horizontal Motion track with each
step positioned at an exact panel-width offset; animate the track itself to the
active index instead of swapping overlapping presence children. Measure the
active panel so variable-height mobile content keeps the correct viewport
height. The track viewport is explicitly relative, rounded, overflow-hidden,
and has no padding of its own, so every 100%-offset panel meets the clip edge
exactly and adjacent screens cannot show through a gutter. Each panel owns the
internal safe padding that protects focus rings, selected-card shadows, and
action validation. Transfer programmatic focus to the incoming step heading
after the track settles. Reduced-motion preference removes the movement and
duration without changing the state flow.

Appointment validation belongs beside the control that exposes it. In
particular, missing-slot feedback sits next to the Continue/Confirm appointment
button and is overlaid rather than inserted into the date-and-slot content
stack, so validation does not shift the appointment choices.
All customer-facing booking messages remain contextual and singular: availability
status belongs in the date area, appointment action validation shares one
stationary status beside Continue, and contact/submission feedback sits beside
Confirm. Taken-slot feedback returns to that appointment status and clears when
the client changes the slot or edits contact fields. Inactive carousel screens
remain inert, aria-hidden, and pointer-inactive throughout track movement; only
the settled active heading receives focus.
The working sheet keeps emergency vertical reachability on short desktop
viewports. Its rounded outer shell owns the visible corners while a separate
inner element owns vertical scrolling, so the scrollbar track cannot square off
the shell's right edge. The carousel uses a dedicated rounded viewport with safe
gutters so focus rings and selected-card shadows remain visible without clipping
hacks.
The three progress tracks remain mounted and animate their accent fill from the
left when advancing, or drain it when returning, instead of snapping between
complete background colors.

Booking and Lookbook both retain a leading arrow-only Studio return control
inside their shared navigation instance. Use the same geometrically centered
SVG arrow rather than a font glyph so its alignment is consistent in the
rounded control at both top and bottom placements.

## Do's And Don'ts

Do:

- use warm cream, peach-beige, muted pink, and warm brown together;
- keep content calm, polished, and mobile-scannable;
- make temporary content visibly replaceable;
- let real studio media shape the final feel;
- keep the bottom CTA clear and reachable.

Don't:

- use harsh neon beauty colors;
- use cluttered template sections;
- imply live booking availability before it exists;
- use generic stock-photo luxury as a substitute for salon identity;
- hide practical contact/location information behind motion.

## Open Design Decisions

- Final salon name and any wordmark direction.
- Owner approval or replacement of the Cormorant Garamond + Manrope review pair.
- Final media assets: hero video, studio photos, service imagery, and staff
  photos.
- Final Macedonian copy tone and later English translation tone.
- Final booking CTA wording and tone, plus production activation after the
  owner-approved calendar-aware architecture is configured.
- Whether analytics, cookie notices, or privacy copy are required by the chosen
  contact/booking approach.
