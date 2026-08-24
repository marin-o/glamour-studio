# glamour-studio Product Spec

## Product thesis

This product is a single-page website for a salon in Radovish owned by the
client's aunt. Its job is to give the salon a credible, elegant online presence,
improve local search visibility, and help potential clients trust the salon
enough to visit, call, message, or request a booking.

The first release should make the salon feel real, local, polished, and easy to
contact. It must not pretend a booking is confirmed until the server confirms
it, or invent business details outside the owner-confirmed catalog.

## Audience and outcomes

The primary audience is new local clients in or near Radovish who are searching
for a salon or comparing options. Secondary audiences are existing clients who
need quick practical information and occasional visitors passing through town.

A successful visit should let a potential client quickly understand:

- what kind of salon this is and whether it feels trustworthy;
- which owner-confirmed services, prices, and durations are offered;
- how to call, message, request a booking, or find the salon;
- whether the salon's tone feels elegant, soft, and connected to the real
  studio rather than generic beauty stock imagery.

## Scope And Navigation

The homepage supports direct scanning and local-client action on mobile first;
the dedicated `/booking` route provides the appointment flow.

Required page sections:

- striking elegant hero;
- services section;
- gallery or vibe section with the concise about-and-trust copy integrated;
- contact and location section;
- persistent bottom booking/contact call to action.

The owner approved a custom Google Calendar-aware booking implementation on
2026-07-23. The customer flow is service selection, available appointment
selection, and minimal contact details followed by confirmation. Customers do
not create accounts or select an employee. Phone, text, and walk-in bookings
entered by staff into the dedicated studio calendar as `Busy` must remove those
times from online availability. Staff manage moves and cancellations from that
same calendar. Customers may manage an accepted online booking without an
account through a secure link in a branded bilingual confirmation email:
rescheduling and cancellation are presented as allowed only more than twelve
hours before the appointment. Internally, the server applies a non-advertised
fifteen-minute operational grace and accepts both through exactly 11:45
remaining; customer-facing wording remains twelve hours. The owner
confirmed on 2026-07-24 that customer email is mandatory so each accepted
online booking can request a Google Calendar invitation.

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

The salon name, city, street address, Google Maps destination, phone number,
Instagram profile, booking service catalog, booking prices/durations, seasonal
opening hours, and `Europe/Skopje` booking time zone are owner-confirmed.
Additional messaging channels, staff details, English editorial copy, photos,
and video remain provisional or missing. The current Macedonian homepage,
Lookbook interface, booking copy, and metadata direction were owner-directed on
2026-07-24.

The confirmed booking catalog is:

- Short-hair haircut: 400–500 MKD, 30 minutes.
- Long-hair haircut: 700–900 MKD, 30 minutes.
- Hairstyling: 1300–1800 MKD, 30 minutes.
- Hair straightening/ironing: 500 MKD, 30 minutes.
- Hair curling: 500–1500 MKD, 30 minutes.
- Hair coloring: 1200–2000 MKD, 90 minutes.
- Highlights: from 3500 MKD, 4 hours.
- Keratin Treatment for hydration: 1500–2000 MKD, 90 minutes.
- Makeup: 1500 MKD, 1 hour.
- Balayage: from 4500 MKD, 5 hours.

The studio is open every day. April through August hours are 06:00–18:00;
September through March hours are 10:00–18:00.

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
- Do not imply confirmed availability or a successful booking before the API
  confirms it.
- Treat privacy as important if any booking or contact form collects personal
  data later.

## Open Owner Decisions

- Additional contact channels and staff details.
- Later English editorial translation.
- Final photo and video assets, preferably filmed in the real studio.
- The final booking lead time and horizon, bot protection, and any future
  changes to the approved more-than-twelve-hour customer-management cutoff.
- Exact typography and font choices.
- Whether analytics or cookies are needed.
- Legal or privacy copy required if booking/contact forms collect personal data.
