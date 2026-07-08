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
  reveal: "Current signature enhancement: a scroll-scrubbed abstract makeup stroke with synced text reveals and static fallback."
  environmental: "Future real salon hair-movement video may join or replace the stroke when owner-approved media exists."
components:
  navigation: "Minimal single-page anchors or compact header only if useful."
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

The bottom CTA must not cover essential content. Give the final section enough
padding so contact/location details remain reachable.

## Components And States

The primary CTA should support calling, messaging, or requesting a booking
without implying live availability. Use direct, accessible labels and visible
focus states.

Services may use placeholder names and prices only if they are clearly marked as
replaceable. Gallery and media components should distinguish real salon media
from temporary placeholders.

Forms are not required during discovery. If a booking/contact form is introduced
later, it must state what data is collected, where the request goes, and that it
does not confirm a booking automatically unless the implementation truly does.

## Motion And Progressive Enhancement

The current signature motion is a scroll-scrubbed abstract makeup stroke that
traces the typography-led homepage from hero through contact. It should feel
like a soft brush or lipstick gesture in the existing blush and warm-brown
palette, not like a plain chart line or a generic decorative flourish.

The stroke follows measured text/section anchors instead of hardcoded page
pixels. Text reveals may be synchronized to the stroke, with GSAP owning scroll
timing and Framer Motion owning the entrance animation. Over the dark contact
band, the stroke may flip locally to the light surface color, but only where it
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

A future scroll-scrubbed hero video of real salon hair movement remains an
owner-gated direction. If that media exists later, it may join or replace the
stroke, but generic stock video must not be used as a substitute.

Motion must be progressive enhancement:

- provide static readable content, and a poster/fallback image for any future video;
- respect reduced-motion preferences;
- keep contact and service discovery usable without scroll-linked effects;
- avoid motion that blocks reading, tapping, or page performance.

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
