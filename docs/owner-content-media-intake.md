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
| Final salon name and spelling | Required |  | Root metadata, hero headings, nav labels |
| City/local area wording | Required |  | Root metadata, hero copy, local SEO copy |
| Street address or location description | Required for launch if visitors need directions |  | Contact section, metadata, future map link |
| Map destination URL | Required if address is published |  | Contact section, persistent CTA, future map action |
| Phone number | Required for call CTA |  | Contact section, persistent CTA, metadata |
| Viber or WhatsApp contact | Required if used for booking |  | Contact section, persistent CTA |
| Instagram handle or URL | Optional but useful |  | Contact section, footer/social action |
| Opening hours | Required before publishing hours |  | Contact section, metadata/local SEO |
| Holiday or exception-hours policy | Later unless launch requires it |  | Contact section, future updates |

## Services And Pricing

| Item | Priority | Owner answer | Current site surface |
| --- | --- | --- | --- |
| Confirmed service categories | Required |  | `/`, `/typography`, `/old`, metadata |
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
| Hair texture/detail photo | Useful |  | `/old`, `/lookbook`, future homepage media |
| Interior detail photo | Useful |  | `/old`, `/lookbook`, future homepage media |
| Service process photo | Optional |  | `/lookbook`, future service section |
| Wide studio image | Optional strong visual moment |  | `/lookbook`, future gallery/vibe section |
| Staff or owner photo | Optional, permission-sensitive |  | Future about/trust section |

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
| `src/app/old/page.jsx` | Keep as backup unless owner asks to remove or refresh it |
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
