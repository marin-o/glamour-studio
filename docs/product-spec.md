# glamour-studio Product Spec

## Product thesis

This product is a single-page website for a salon in Radovish owned by the
client's aunt. Its job is to give the salon a credible, elegant online presence,
improve local search visibility, and help potential clients trust the salon
enough to visit, call, message, or request a booking.

The first release should make the salon feel real, local, polished, and easy to
contact. It should not pretend to have final content, real-time booking, or
confirmed business details before the owner provides them.

## Audience and outcomes

The primary audience is new local clients in or near Radovish who are searching
for a salon or comparing options. Secondary audiences are existing clients who
need quick practical information and occasional visitors passing through town.

A successful visit should let a potential client quickly understand:

- what kind of salon this is and whether it feels trustworthy;
- which service categories are likely offered, using clearly replaceable
  placeholders until the owner confirms the list;
- how to call, message, request a booking, or find the salon;
- whether the salon's tone feels elegant, soft, and connected to the real
  studio rather than generic beauty stock imagery.

## Scope And Navigation

The MVP is one polished multi-section page, not a multi-page site. The page
should support direct scanning and local-client action on mobile first.

Required page sections:

- striking elegant hero;
- services placeholder section;
- gallery or vibe section;
- about and trust section;
- contact and location section;
- persistent bottom booking/contact call to action.

The booking direction is intentionally staged. The ideal future is
Google Calendar-aware availability where phone bookings manually added to the
salon owner's calendar affect shown available slots. The MVP must not fake real
availability. If calendar integration is not part of the first implementation
slice, use a clear call/message CTA or simple booking request flow instead.

## Experience Direction

The experience should feel simple, rich, elegant, soft, and polished. The salon
interior direction is creamy pink with faint peach-beige warmth and warm brown
details. The site should feel connected to that real studio atmosphere.

The signature interaction should be a scroll-scrubbed hero video of hair
movement, ideally filmed in the actual studio with the studio blurred in the
background. Interface elements should reveal and unreveal around the video as
scroll progresses, while preserving a calm, accessible baseline when the motion
enhancement is unavailable or reduced motion is requested.

Anti-goals:

- harsh neon beauty branding;
- cluttered template layouts;
- generic stock-photo luxury;
- fake overdone glamour;
- any design direction that feels disconnected from the actual studio.

## Content Reality

The salon name, city, street address, Google Maps destination, phone number, and
Instagram profile are owner-confirmed. Services, prices, opening hours,
additional messaging channels, staff details, final marketing copy, photos, and
video remain provisional or missing.

Placeholder content must be visibly replaceable and must not read as final
business information. Final preferred media should come from the real salon when
available, especially the hero video and studio imagery.

The site is intended to be Macedonian-first. English placeholder copy is
acceptable during early planning and implementation. English should become a
toggleable option later, but localization is not part of discovery.

## Quality Boundaries

- Prioritize excellent mobile experience because local salon discovery and
  contact are likely to happen on phones.
- Use strong local SEO structure for a single local business page, without
  inventing address, hours, service names, or review claims.
- Keep loading fast even when video is introduced; video must have a graceful
  image or static fallback.
- Make text and controls accessible, with clear focus states and readable
  contrast.
- Respect reduced-motion preferences and keep the core call/contact path usable
  without scroll-scrub enhancement.
- Do not implement a fake scheduler or imply confirmed availability.
- Treat privacy as important if any booking or contact form collects personal
  data later.

## Open Owner Decisions

- Opening hours, additional contact channels, services, prices, and staff
  details.
- Final Macedonian copy and later English translation.
- Final photo and video assets, preferably filmed in the real studio.
- Booking implementation depth: contact CTA, request form, or Google
  Calendar-aware availability.
- Exact typography and font choices.
- Whether analytics or cookies are needed.
- Legal or privacy copy required if booking/contact forms collect personal data.
