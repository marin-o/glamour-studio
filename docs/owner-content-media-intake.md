# Owner Content And Media Intake

This checklist collects the owner-approved facts and assets needed before the
Glamour Studio site can move from a truthful draft to a launch-ready local salon
page. Leave unknown answers blank. Do not guess, approximate, or publish an item
until the owner confirms it.

## How To Use This

- Fill only the answers the owner can confirm.
- Keep prices, hours, address, staff names, client photos, reviews, and booking
  promises unpublished until approved.
- Provide Macedonian copy first. English can remain a later enhancement.
- Treat media with people as approval-sensitive, even when the photo looks
  casual or already exists on a phone.
- Use this file as input for a later content replacement task; it is not a
  runtime content source.

## Launch-Critical Business Facts

| Item | Priority | Owner answer | Current site surface |
| --- | --- | --- | --- |
| Final salon name and spelling | Required | Glamour Studio — owner confirmed 2026-07-13 | Root metadata, hero headings, nav labels |
| City/local area wording | Required | Radovish — owner confirmed 2026-07-13 | Root metadata, hero copy, local SEO copy |
| Street address or location description | Required for launch if visitors need directions | 11 Ilija Aleksov, Radovish — owner confirmed 2026-07-13 | Contact section, metadata, future map link |
| Map destination URL | Required if address is published | Google Maps search URL derived from confirmed address | Contact section, persistent CTA, future map action |
| Phone number | Required for call CTA | 077-643-005 — owner confirmed 2026-07-13 | Contact section, persistent CTA, metadata |
| Viber or WhatsApp contact | Required if used for booking |  | Contact section, persistent CTA |
| Instagram handle or URL | Optional but useful | https://www.instagram.com/glamourrstudiio/ — owner confirmed 2026-07-13 | Contact section, footer/social action |
| Opening hours | Required before publishing hours |  | Contact section, metadata/local SEO |
| Holiday or exception-hours policy | Later unless launch requires it |  | Contact section, future updates |

## Services And Pricing

| Item | Priority | Owner answer | Current site surface |
| --- | --- | --- | --- |
| Confirmed service categories | Required |  | `/`, `/typography`, metadata |
| Haircuts service names/details | Required if listed |  | Service index rows |
| Hairstyling service names/details | Required if listed |  | Service index rows |
| Makeup service names/details | Required if listed |  | Service index rows |
| Service duration or preparation notes | Optional |  | Service details, booking request copy |
| Prices or "ask for price" policy | Owner decision |  | Service rows, contact copy |
| Staff or artist names | Optional, approval-sensitive |  | About/trust copy, optional staff media |
| Any claims about specialties or products | Required before publishing claims |  | Service copy, about section |

## Macedonian-First Copy

| Item | Priority | Owner answer | Current site surface |
| --- | --- | --- | --- |
| Short homepage intro | Required |  | Hero copy on `/` and `/typography` |
| About/trust paragraph | Required |  | About section |
| Service descriptions | Required if services are listed |  | Service index |
| Contact instructions | Required before live contact CTA |  | Contact section, bottom CTA |
| Booking disclaimer or request wording | Required if booking requests are accepted |  | Contact section, bottom CTA |
| English translation | Later enhancement |  | Future language toggle or alternate copy |
| Tone notes | Optional |  | All visible copy |

## Contact And Booking Path

Choose one launch path before replacing the current "not live" wording.

| Option | Owner decision | Site implication |
| --- | --- | --- |
| Call only |  | Bottom CTA can become a `tel:` link after phone confirmation. |
| Viber or WhatsApp message |  | Bottom CTA can open the approved channel with clear request wording. |
| Instagram DM |  | Contact section can include Instagram as a secondary action. |
| Simple booking request form |  | Requires submission destination, privacy wording, and no auto-confirmation unless true. |
| Calendar-aware booking |  | Later enhancement; requires confirmed calendar rules and fallback behavior. |

Booking copy must make clear whether the action requests an appointment or
confirms one. Until a real scheduling system exists, do not say or imply that a
visitor has booked a confirmed slot.

## Media Assets

Use real Glamour Studio media where possible. Temporary placeholders may remain
until owner-approved assets exist.

| Asset | Priority | Owner/source notes | Current site surface |
| --- | --- | --- | --- |
| Hero hair-movement video | Optional for MVP, preferred final direction |  | Future hero enhancement, `/lookbook` planning |
| Hero poster image | Required if hero video is used |  | Metadata image, hero fallback, `/lookbook` |
| Homepage hero interior background image/crop | Useful strong visual moment | A wide interior shot with calm edges and no essential signage, documents, or readable text; it should crop safely on mobile and tolerate blur/contrast treatment | Homepage hero, future replacement for the concept background |
| Hair texture/detail photo | Useful |  | `/lookbook`, future homepage media |
| Interior detail photo | Useful |  | `/lookbook`, future homepage media |
| Service process photo | Optional |  | `/lookbook`, future service section |
| Wide studio image | Optional strong visual moment |  | `/lookbook`, future gallery/vibe section |
| Staff or owner photo | Optional, permission-sensitive |  | Future about/trust section |

### Homepage Media-Band Replacement Set

The current homepage media band uses three clearly labeled concept placeholders.
Replace them by role so the layout and metadata can stay stable:

| Placeholder role | Exact real shot requested | Approval and capture notes |
| --- | --- | --- |
| Wide interior anchor | A horizontal, warm view of the real styling space with a chair, mirror, materials, or tools | Avoid accidental private documents or unapproved signage; confirm the owner approves the space and crop. |
| Craft detail | A vertical close or medium shot of approved hands working with hair and salon tools | Keep faces out unless separately approved; confirm whether the client, hands, and service process may be published. |
| People-at-work context | A vertical, distant or behind-the-scenes view of approved salon work | Obtain permission from every recognizable staff member or client; prefer backs, distance, or an empty scene when consent is not available. |

The replacement images should preserve the current roles, proportions, and
responsive crops. Provide the file name/source, what the frame shows, approved
Macedonian alt text, permission owner, people visible, crop permission, and any
privacy limits for each shot.

For every approved image or video, collect:

- File name or source location:
- What the asset shows:
- Permission confirmed by:
- People visible:
- Preferred alt text in Macedonian:
- Can it be cropped for mobile:
- Any privacy or sensitivity limits:

## Permissions, Privacy, And Legal Checks

| Decision | Required when | Owner answer |
| --- | --- | --- |
| Permission for staff/client photos | Any recognizable person appears |  |
| Permission for reposted social media images | Any image comes from Instagram or another account |  |
| Contact-form privacy wording | A form collects names, phone numbers, messages, or dates |  |
| Submission destination | A request form is introduced |  |
| Analytics choice | Analytics or tracking is added |  |

### Development Instagram Lookbook Gate

The nine files in `public/media/lookbook/instagram-dev/` are only approved for
local composition work. Before removing the `/lookbook` disclosure or noindex
metadata, record all of the following for every frame: owner approval for
website reuse, permission from each recognizable person, the approved original
file, an approved crop, and final Macedonian alt text. The original Instagram
permalinks are preserved in `src/lib/lookbook-media.js` for source tracing;
they are not a substitute for those permissions.
| Cookie notice requirement | Cookies or tracking scripts are added |  |
| Review/testimonial approval | Reviews or client quotes are shown |  |

Do not publish testimonials, review counts, awards, or "trusted by" claims
unless the owner provides the exact approved source and wording.

## Replacement Map

| Current surface | Replace after owner provides |
| --- | --- |
| `src/app/layout.jsx` metadata | Final salon description, contact/location wording, final social image |
| `src/components/TypographySalonPage.jsx` hero | Final Macedonian intro and truthful launch-status copy |
| `src/components/TypographySalonPage.jsx` services | Confirmed service names, details, prices or price policy |
| `src/components/TypographySalonPage.jsx` contact | Approved contact channel and booking/request wording |
| `src/app/typography/page.jsx` metadata | Keep aligned with the active homepage direction if route remains |
| `src/app/lookbook/page.jsx` | Real media assets, alt text, and production notes |
| `public/media/README.md` | Final media filenames or updated asset rules |

## Ready For Content Replacement When

- Required business facts are confirmed.
- Launch contact path is chosen.
- Macedonian copy is provided or approved.
- Any published service details and prices are approved.
- Media permissions are clear.
- Booking copy does not imply live availability unless live scheduling truly
  exists.
