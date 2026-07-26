# Google Calendar booking setup

The repository can connect the existing booking UI to a dedicated Google
Calendar for **localhost evaluation only**. Customers never authenticate with
Google. The server uses the calendar owner's offline OAuth grant.

Production remains intentionally fail-closed. The local coordination providers
are process memory, so they cannot safely coordinate multiple server instances,
survive restarts, or provide durable recovery.

## What the local integration does

- A date selection makes a fresh server-side Google FreeBusy request. Busy
  Google events, including phone/text appointments entered by staff, remove
  online slots.
- A booking is rechecked while holding the local single-process lock, then a
  private event is created on the configured calendar.
- Customer email is required. Google Calendar is asked to add that address as
  an attendee with `sendUpdates=all`. The invitation is an
  email/calendar invitation, not proof of delivery or acceptance.
- Staff move and cancel appointments in the same Google Calendar. The next
  availability request sees the current Calendar state.

## One-time Google setup

Do these steps yourself in the Google account being used for the test. Never
paste the client secret or refresh token into chat.

1. In Google Cloud, create or select an owner-controlled project and enable the
   **Google Calendar API**.
2. Configure the Google Auth consent screen as **External** and leave it in
   **Testing** for this localhost evaluation. Add your Google account as a test
   user.
3. Create an OAuth client whose application type is **Desktop app**. Downloading
   a JSON file is optional; the repository only needs the client ID and client
   secret values.
4. In Google Calendar, create a dedicated secondary calendar such as
   `Glamour Studio Local Test`. In that calendar's settings, copy its Calendar
   ID. Do not use `primary` or a personal calendar as the configured booking
   calendar.
5. From the repository root, create the ignored local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

6. Edit `.env.local` locally and replace these placeholders:

   ```dotenv
   BOOKING_LOCAL_TEST_MODE=1
   GOOGLE_CALENDAR_ID=your-dedicated-calendar-id
   GOOGLE_OAUTH_CLIENT_ID=your-desktop-client-id.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=your-desktop-client-secret
   ```

   Leave `GOOGLE_OAUTH_REFRESH_TOKEN` absent. The authorization helper adds it
   without printing it.

7. Run:

   ```powershell
   pnpm booking:google:authorize
   ```

   Open the displayed Google URL, choose the test account, and approve the
   requested Calendar access. The helper uses a random loopback port on
   `127.0.0.1`, validates OAuth state, uses PKCE, verifies FreeBusy access to the
   configured Calendar ID, and stores the refresh token in `.env.local`.

8. Start or restart the application so Next.js reloads the environment:

   ```powershell
   pnpm dev
   ```

   Open `http://localhost:3000/booking` (HTTP, not HTTPS).

## Owner verification

1. Add a manual `Busy` test event to the dedicated calendar and verify its time
   is absent after selecting that date and service in the booking page.
2. Remove the manual test event and submit an online booking.
3. Verify exactly one private event appears in the dedicated calendar.
4. Verify the customer address receives an invitation.
5. Move or cancel the event in Google Calendar and verify a new availability
   request reflects that change.

Do not put real customer data into the local test calendar unless you are
comfortable storing it in the personal Google account used for this test.

## Scopes and security boundary

The helper requests:

- `https://www.googleapis.com/auth/calendar.events.owned`
- `https://www.googleapis.com/auth/calendar.events.freebusy`

These are narrower than full Calendar access, but OAuth scopes are not
restricted to `GOOGLE_CALENDAR_ID`. With a personal account, the token can
potentially access events on every calendar that account owns and availability
on calendars it can access. The adapter is coded to call only the configured
calendar, but a stolen refresh token could be abused outside the adapter. A
dedicated least-privilege Google account is preferable before production.

`.env.local` is ignored by Git. Do not expose it to browser code, copy it into
documentation, log it, commit it, or deploy this local configuration.

## Expiry and recovery

Google states that an External OAuth app in **Testing** normally receives a
refresh token that expires after seven days when Calendar scopes are requested.
When local booking starts returning authorization failures, rerun
`pnpm booking:google:authorize` and restart the dev server. Revoking the app
grant, changing scopes, losing the token, long inactivity, or account security
changes can also require reauthorization.

If authorization fails:

- Confirm the Calendar API is enabled.
- Confirm the OAuth client type is Desktop app.
- Confirm the authorizing account is listed as a test user.
- Confirm `GOOGLE_CALENDAR_ID` belongs to a calendar owned by that account.
- Confirm the callback URL uses `127.0.0.1`; do not substitute an HTTPS
  localhost URL.
- If Google returns no refresh token despite `prompt=consent`, revoke the test
  app grant in the Google account and run the helper again.

Current Google references:

- [OAuth 2.0 for Desktop apps and loopback redirects](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google Calendar API scopes](https://developers.google.com/workspace/calendar/api/auth)
- [OAuth refresh-token expiration](https://developers.google.com/identity/protocols/oauth2)
- [Calendar event creation and attendee notifications](https://developers.google.com/workspace/calendar/api/guides/create-events)

## Why this is not production infrastructure

The local lock, idempotency records, and rate counters live only in the current
Node.js process. A restart forgets them; two Next.js instances do not share
them; and a serverless platform may run concurrent isolated instances. Before
deployment, replace all three ports with one durable, atomic backend and add
monitoring, secret management, trusted request identity/rate limiting, recovery
procedures, and production OAuth review. Until then, any non-development
runtime returns `BOOKING_NOT_CONFIGURED`.

## Owner-gated Vercel production runbook

The code now has a separate Vercel composition, but this repository has not
provisioned Upstash, linked a Vercel project, created production Google OAuth
credentials, set secrets, or deployed anything. Those actions remain owner
controlled.

Before setting `BOOKING_PRODUCTION_ENABLED=1`, the owner must:

1. Create one owner-controlled Upstash Redis database and provide its REST URL
   and token as Vercel server secrets using the common
   `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` names.
2. Create a production Google OAuth grant for the dedicated booking calendar,
   move the consent configuration out of Testing as appropriate, and add the
   existing `GOOGLE_*` values as Vercel server secrets. Never reuse the local
   desktop-evaluation token without an owner security review.
3. Generate and store a separate random `BOOKING_REQUEST_HMAC_SECRET`; do not
   reuse a Google or Redis secret. Vercel supplies `VERCEL=1`; do not manually
   emulate it in a public environment.
4. Deliberately choose and set every `BOOKING_*` policy/rate-limit value listed
   in `.env.example`. The examples are not studio policy approval. The lock
   lease must exceed the provider-operation budget plus safety margin. That
   budget is one whole Google adapter method, including token refresh, retry,
   pagination, verification, and response-body parsing.
5. Keep production disabled while verifying the preview environment. When all
   secrets and policy decisions are present, the owner may set the exact value
   `BOOKING_PRODUCTION_ENABLED=1` for the intended Vercel environment.

Both API routes use the Node.js runtime and derive a privacy-minimized rate
subject from Vercel's `x-vercel-forwarded-for`, HMAC-hashed before Redis sees
it. No raw client address, customer contact, or OAuth token is a Redis key,
API response, or log value. Google Calendar attendee invitations remain the
only booking-email behavior; no SMTP or transactional provider is configured.
Each action has one aggregate subject bucket; varying service, date, or contact
does not create another rate-limit bucket. Lease, idempotency, and rate records
expire, while the one fixed-scope fencing sequence deliberately persists for
the Redis database lifetime so expired/released leases cannot reuse a token.
