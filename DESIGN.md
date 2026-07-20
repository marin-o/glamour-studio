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
  display: "Elegant high-contrast serif or refined editorial display face; exact font remains owner-approved later."
  body: "Warm, readable sans-serif with calm spacing; exact font remains owner-approved later."
  label: "Small, clear sans-serif labels with normal letter spacing."
spacing:
  compact: "8px"
  rhythm: "16px"
  section: "64px mobile, 96px desktop as a planning baseline."
motion:
  feedback: "Subtle fades, opacity, and small transform changes only when useful."
  reveal: "Role-based system: reserve a one-time typewriter entrance for the hero studio name; use side-aware editorial line assembly for aligned headings and lists, selective makeup-stroke-connected reveals for supporting copy, and static text where motion adds no meaning."
  environmental: "Future real salon hair-movement video may join or replace the stroke when owner-approved media exists."
components:
  navigation: "Homepage navigation is consolidated into the persistent bottom bar; do not add a separate top header unless the information architecture materially expands."
  cta: "Persistent bottom contact or booking CTA, mobile-first, accessible, and direct."
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

Exact font choices are open owner decisions and should be validated for
Macedonian support before adoption.

## Layout And Spacing

Build a single-page, mobile-first flow with strong section rhythm:

- hero;
- service placeholders;
- gallery or studio vibe;
- about and trust;
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
use a wide interior image as the anchor and two smaller vertical supporting
images for craft and people-at-work context. Keep the layout calm and
asymmetric; this is one visual moment, not a gallery, carousel, or lookbook.

The type-first hero may also use the wide interior concept as a full-section,
softly blurred background behind the intro copy. Keep the studio name and
primary message first, use a warm stable contrast veil, and keep the shared
`Concept imagery — real studio photos pending` label visible in the foreground.
The background is decorative and static; it must not obscure focus, reading, or
the contact path, and it must not add a new animation treatment.

For motion-enabled visitors, the hero-to-services boundary may briefly open as
a scroll-driven curtain onto a sharp, tightly cropped band of that same
interior concept. Use the hero's existing image element as the only photograph:
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

Until owner-approved photography exists, all three assets must carry the shared
localized concept-media disclosure (English:
`Concept imagery — real studio photos pending`). Their alt text must say they
are concept placeholders and must not identify the real salon, staff, or
clients. Replace technical media metadata in `src/lib/homepage-media.js` and its
aligned localized label, alt text, and captions in
`src/lib/homepage-copy.js` so future real assets do not require a structural
homepage rewrite. The real
replacement set is an approved wide interior shot, a vertical hands-at-work
service-process shot, and a vertical distant/behind-the-scenes work shot with
permissions for every recognizable person.

## Components And States

The primary CTA should support calling, messaging, or requesting a booking
without implying live availability. Use direct, accessible labels and visible
focus states.

On desktop, the persistent bottom navigation should shrink-wrap its controls and
confirmed street-address action, remain centered and viewport-safe, and avoid
the sparse appearance of a near-full-width bar. The address action stays hidden
on mobile so the existing language, Services, Studio, Lookbook, and Call actions
remain in one row.

The services section uses one concise, centered display heading without an
eyebrow or an empty alignment column. Its provisional bilingual wording remains
replaceable without changing the section markup.

The homepage is Macedonian-first. Its server-rendered and no-JavaScript copy
must be Macedonian, with a single plain-text language toggle inside the
persistent bottom navigation. It shows `EN` as the action from Macedonian and
`MK` as the action from English, without a visible button container. The
selection is held in root-level memory for the current app visit, follows
client-side navigation to and from Lookbook, updates the document language, and
resets to Macedonian on a full reload. It must not introduce locale routes,
cookies, local storage, or a second header. Keep both provisional language sets
structurally aligned in
`src/lib/homepage-copy.js` so owner-approved replacements do not require layout
or interaction changes.

Services may use placeholder names and prices only if they are clearly marked as
replaceable. Gallery and media components should distinguish real salon media
from temporary placeholders.

Forms are not required during discovery. If a booking/contact form is introduced
later, it must state what data is collected, where the request goes, and that it
does not confirm a booking automatically unless the implementation truly does.

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

### Development Lookbook

`/lookbook` is a full-viewport, noindex horizontal editorial sequence rather
than a general gallery. Its development media should move sideways from one
large image to the next with stable cover crops and warm cream breathing room.
Keep `Lookbook` as the untranslated product label. Its surrounding interface,
development disclosures, instructions, and accessibility copy follow the
root-level language selected on the homepage; a direct or refreshed route load
uses Macedonian by default.
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

The utility header uses an arrow-only Studio return control with a localized
accessible name. On desktop, use its open right side for the visit-local
language control and direct Services, Studio, and Call actions; the Lookbook
label already marks the current route, so do not duplicate it as a navigation
item. Keep the compact mobile header free of those additional items. Visible
directional instructions are unnecessary. Keep the progress rail and image
count in the footer without a separate input-method legend. Linked images must
not enlarge on hover or keyboard focus, and their focus-visible treatment must
remain clear.

The current nine local Instagram frames are development-only media. Keep the
visible disclosure and noindex metadata until the owner records website-reuse
approval, recognizable-person permissions, and production-resolution
replacements. Descriptive alt text must describe only the visible frame and
must never reuse Instagram captions or make unverified service claims. Each
visual links to its original source and identifies Reel cover frames as stills
rather than local video. The route uses a compact fixed utility header and
progress footer instead of the homepage's persistent bottom navigation.

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
- Exact fonts, including Macedonian character support.
- Final media assets: hero video, studio photos, service imagery, and staff
  photos.
- Final Macedonian copy tone and later English translation tone.
- Exact booking/contact CTA wording once owner chooses CTA, request form, or
  calendar-aware availability.
- Whether analytics, cookie notices, or privacy copy are required by the chosen
  contact/booking approach.
