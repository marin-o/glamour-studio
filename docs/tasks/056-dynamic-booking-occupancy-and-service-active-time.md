# Dynamic booking occupancy and service active time

Status: DONE
Depends on: None
Owner: AI-assisted implementation
Approver: Unassigned

## Goal

Make offered booking times account for each service's calendar occupancy and a
shared 15-minute post-booking turnover buffer.

## Current repo notes

- Product thesis: This product is a single-page website for a salon in Radovish owned by the
- Core outcome: The primary audience is new local clients in or near Radovish who are searching

## Scope

- Add a 15-minute post-service buffer to booking occupancy.
- Recalculate offered start times against existing bookings using the full
  service occupancy plus buffer.
- Preserve the catalogue's customer-facing durations while allowing a separate
  bookable occupancy duration.
- Treat Balayage and highlights (shatiranje) as 60 minutes of bookable occupancy
  before the shared buffer.
- Keep the booking event and availability calculation aligned so accepted
  bookings reserve exactly the interval that availability used.
- On the successful confirmation screen, provide a localized New booking action
  that resets the client flow for another booking, beside a localized Back to
  home link replacing the generic Glamour Studio label.
- Keep review corrections and tuning in this task until the outcome is accepted.

## Review posture

- `none`: localized booking-domain logic with deterministic automated coverage;
  no exceptional-risk trigger applies.

## Suggested files

- `src/lib/booking/`
- `tests/booking/`
- `docs/booking-api.md` if the public scheduling semantics require clarification

## Acceptance criteria

- [x] A 30-minute appointment beginning at 12:00 occupies the calendar through
  12:45, and 12:45 remains a valid next appointment start.
- [x] Offered slots are recalculated from existing busy bookings and exclude any
  candidate whose service occupancy plus buffer overlaps a busy interval.
- [x] Balayage and highlights each use 60 minutes of bookable occupancy plus the
  shared 15-minute buffer without incorrectly changing their customer-facing
  catalogue duration.
- [x] Availability and event creation use the same occupancy semantics.
- [x] Targeted automated tests cover buffer adjacency, dynamic busy-interval
  overlap, and the two long-duration services.
- [x] Required owner decisions remain explicit rather than invented.
- [x] The confirmation screen shows localized New booking and Back to home
  actions side by side when space permits and stacked safely on narrow screens.
- [x] New booking clears the completed confirmation and returns to the service
  step without navigating away; Back to home retains the existing route
  transition to `/`.

## Non-goals

- Unrelated product or infrastructure work.
- Changing prices, working hours, slot cadence, or customer-facing translations.

## Validation

- Run the smallest targeted booking test command that covers availability,
  orchestration, and catalogue behavior.
- Run lint only if the changed runtime surface is not fully exercised by those
  targeted tests.
- Select the smallest commands and owner checks before implementation and run them once after the runtime change is final.
- Do not run browser, viewport, screenshot, Playwright, visual, animation, or interaction validation unless the owner explicitly requests it.
- Do not substitute every static check for unavailable rendered validation. Leave rendered criteria awaiting owner verification when necessary.
- Task, evidence, and handoff-only edits do not invalidate successful runtime checks.

## Completion notes

- Transition: complete at 2026-07-26T11:33:51.445Z
- Validation: Owner approved completion; all acceptance criteria are checked; focused availability/orchestration/client tests passed 47/47 and confirmation action tests passed 18/18. The unrelated legacy homepage-media contract mismatch remains outside this task.
- Approved by: Owner

- Transition: start at 2026-07-26T11:04:06.438Z

- Completed: Added a shared 15-minute post-service buffer, separate internal
  booking durations for highlights and Balayage, dynamic exact-adjacency starts,
  and aligned availability, conflict, Calendar event, response, and client
  validation semantics.
- Validation: Focused availability/orchestration/client suite passed 47/47. The
  full `pnpm test:booking` run passed 112/113; its sole failure is the unrelated
  existing homepage-media contract expecting the obsolete placeholder JPG while
  runtime metadata points to the current homepage PNG. Fold-in confirmation
  action static/flow tests passed 18/18; browser/visual validation was not run
  under the conservative policy.
- Deviations: Preserved the regular 30-minute start grid; exact 15-minute busy
  interval end boundaries are added dynamically, so a booking ending at 12:45
  makes 12:45 bookable without changing all ordinary starts to 15-minute cadence.
- Follow-up: Await owner confirmation of the responsive action layout and owner
  acceptance before completing the task.
