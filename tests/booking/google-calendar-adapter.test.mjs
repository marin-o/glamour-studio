import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Temporal } from '@js-temporal/polyfill';

import { createGoogleCalendarAdapter, eventIdFromIdempotencyKey } from '../../src/lib/booking/google/calendar-adapter.mjs';
import { getGoogleCalendarConfig } from '../../src/lib/booking/google/config.mjs';

const env = Object.freeze({
  GOOGLE_CALENDAR_ID: 'studio.calendar@example.com',
  GOOGLE_OAUTH_CLIENT_ID: '1234567890-salon.apps.googleusercontent.com',
  GOOGLE_OAUTH_CLIENT_SECRET: 'placeholder-client-secret',
  GOOGLE_OAUTH_REFRESH_TOKEN: 'placeholder-refresh-token',
});
const expected = { idempotencyKey: 'booking-key-12345678', start: '2026-07-15T08:00:00Z', end: '2026-07-15T09:00:00Z', summary: 'Makeup appointment', workTrack: 'makeup' };

function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }); }
function empty(status = 204) { return new Response(null, { status }); }
function mockFetch(responses, calls = []) {
  return async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return typeof next === 'function' ? next(url, init) : next;
  };
}
function token(value = 'access-1', expires = 3600) { return json({ access_token: value, expires_in: expires }); }
function eventFor({ eventId = eventIdFromIdempotencyKey(expected.idempotencyKey), visibility = 'private', ...changes } = {}) {
  return { id: eventId, visibility, start: { dateTime: expected.start }, end: { dateTime: expected.end }, summary: expected.summary, description: '', status: 'confirmed', extendedProperties: { private: { bookingIdempotencyDigest: `v1:${createHash('sha256').update(expected.idempotencyKey).digest('hex')}`, bookingWorkTrack: expected.workTrack } }, ...changes };
}

test('configuration accepts only complete, sanitized server values', () => {
  assert.deepEqual(getGoogleCalendarConfig(env).calendarId, env.GOOGLE_CALENDAR_ID);
  for (const [name, value] of [['GOOGLE_CALENDAR_ID', ''], ['GOOGLE_OAUTH_CLIENT_ID', 'wrong'], ['GOOGLE_OAUTH_CLIENT_SECRET', ' short '], ['GOOGLE_OAUTH_REFRESH_TOKEN', undefined]]) {
    assert.throws(() => getGoogleCalendarConfig({ ...env, [name]: value }), (error) => error.code === 'CONFIGURATION_INVALID' && !error.message.includes(env.GOOGLE_OAUTH_REFRESH_TOKEN));
  }
});

test('every importable Google runtime module is statically server-only guarded', async () => {
  for (const file of ['calendar-adapter.mjs', 'config.mjs', 'errors.mjs', 'index.mjs']) {
    assert.match(await readFile(new URL(`../../src/lib/booking/google/${file}`, import.meta.url), 'utf8'), /import 'server-only';/);
  }
});

test('event IDs are stable, Google-compatible, and distinct', () => {
  const first = eventIdFromIdempotencyKey(expected.idempotencyKey);
  assert.match(first, /^[a-v0-9]{5,1024}$/);
  assert.equal(first, eventIdFromIdempotencyKey(expected.idempotencyKey));
  assert.notEqual(first, eventIdFromIdempotencyKey('booking-key-87654321'));
});

test('reuses a token, refreshes after expiry, and deduplicates concurrent refreshes', async () => {
  const calls = [];
  let clock = 0;
  const adapter = createGoogleCalendarAdapter({ env, now: () => clock, fetch: mockFetch([token('one', 31), json({ items: [] }), json({ items: [] }), token('two'), json({ items: [] })], calls) });
  await Promise.all([adapter.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end }), adapter.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end })]);
  assert.equal(calls.filter((call) => call.url.includes('/token')).length, 1);
  clock = 2_000;
  await adapter.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end });
  assert.equal(calls.filter((call) => call.url.includes('/token')).length, 2);
});

test('recovers exactly once from a rejected access token and sanitizes refresh failure', async () => {
  const calls = [];
  const adapter = createGoogleCalendarAdapter({ env, fetch: mockFetch([token('first'), empty(401), token('second'), json({ items: [] })], calls) });
  await adapter.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end });
  assert.equal(calls.filter((call) => call.url.includes('/token')).length, 2);
  const rejected = createGoogleCalendarAdapter({ env, fetch: mockFetch([json({ error: 'do not leak' }, 400)]) });
  await assert.rejects(rejected.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end }), (error) => error.code === 'AUTHORIZATION_FAILED' && !error.message.includes('do not leak') && !error.message.includes(env.GOOGLE_OAUTH_REFRESH_TOKEN));
});

test('lists typed event blockers for availability and rejects malformed, rate-limited, and transport responses', async () => {
  const adapter = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json({ items: [eventFor()] })]) });
  assert.deepEqual(await adapter.getBusyIntervals({ timeMin: expected.start, timeMax: '2026-07-15T12:00:00Z' }), [{ start: '2026-07-15T08:00:00Z', end: '2026-07-15T09:00:00Z', track: 'makeup' }]);
  const malformed = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json({ items: {} })]) });
  await assert.rejects(malformed.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end }), { code: 'GOOGLE_REQUEST_FAILED' });
  const rate = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(429)]) });
  await assert.rejects(rate.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end }), (error) => error.code === 'RATE_LIMITED' && error.retryable);
  const transport = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), new Error('customer@example.com')]) });
  await assert.rejects(transport.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end }), (error) => error.code === 'TRANSPORT_FAILED' && !error.message.includes('customer@example.com'));
});

test('creates a private no-attendee event and URL-encodes the calendar ID', async () => {
  const calls = [];
  const adapter = createGoogleCalendarAdapter({ env: { ...env, GOOGLE_CALENDAR_ID: 'studio/calendar@example.com' }, fetch: mockFetch([token(), json(eventFor())], calls) });
  const result = await adapter.createPrivateEvent(expected);
  assert.equal(result.outcome, 'created');
  assert.match(calls[1].url, /studio%2Fcalendar%40example\.com/);
  const body = JSON.parse(calls[1].init.body);
  assert.equal(body.visibility, 'private');
  assert.equal('attendees' in body, false);
  assert.equal(body.extendedProperties.private.bookingWorkTrack, 'makeup');
  assert.match(calls[1].url, /sendUpdates=none/);
});

test('resolves duplicate and ambiguous inserts through deterministic verification, or surfaces ambiguity', async () => {
  const duplicate = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(409), json(eventFor())]) });
  assert.equal((await duplicate.createPrivateEvent(expected)).outcome, 'duplicate');
  const recovered = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(503), json(eventFor())]) });
  assert.equal((await recovered.createPrivateEvent(expected)).outcome, 'recovered');
  const ambiguous = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), new Error('network'), empty(404)]) });
  await assert.rejects(ambiguous.createPrivateEvent(expected), { code: 'AMBIGUOUS_MUTATION' });
  const mismatch = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(409), json(eventFor({ visibility: 'default' }))]) });
  await assert.rejects(mismatch.createPrivateEvent(expected), { code: 'VERIFICATION_FAILED' });
});

test('adds or updates an attendee without an initial Google invitation and preserves attendee verification', async () => {
  const calls = [];
  const adapter = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json({ attendees: [{ email: 'staff@example.com' }] }), json({}), json({ attendees: [{ email: 'staff@example.com' }, { email: 'client@example.com', displayName: 'Client' }] })], calls) });
  const eventId = eventIdFromIdempotencyKey(expected.idempotencyKey);
  assert.deepEqual(await adapter.addOrUpdateAttendee({ eventId, email: 'client@example.com', displayName: 'Client' }), { eventId, notificationPolicy: 'sendUpdates=none' });
  assert.match(calls[2].url, /sendUpdates=none/);
  assert.deepEqual(JSON.parse(calls[2].init.body).attendees, [{ email: 'staff@example.com' }, { email: 'client@example.com', displayName: 'Client' }]);
});

test('preserves sanitized attendee notification failure', async () => {
  const calls = [];
  const adapter = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json({ attendees: [{ email: 'staff@example.com' }] }), json({ error: 'no invite' }, 500)], calls) });
  await assert.rejects(adapter.addOrUpdateAttendee({ eventId: eventIdFromIdempotencyKey(expected.idempotencyKey), email: 'client@example.com', displayName: 'Client' }), (error) => error.code === 'GOOGLE_UNAVAILABLE' && error.operation === 'invitation' && !error.message.includes('client@example.com'));
  assert.match(calls.at(-1).url, /sendUpdates=none/);
});

test('compensating deletion is explicit, idempotent for missing events, and uses no notification', async () => {
  const calls = [];
  const adapter = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(404)], calls) });
  assert.deepEqual(await adapter.deleteEventForCompensation(eventIdFromIdempotencyKey(expected.idempotencyKey)), { deleted: false, notificationPolicy: 'sendUpdates=none' });
  assert.match(calls[1].url, /sendUpdates=none/);
});

test('management updates require an exact snapshot, use If-Match, and fail closed on a stale precondition', async () => {
  const calls = []; const eventId = eventIdFromIdempotencyKey(expected.idempotencyKey); const marker = `v1:${createHash('sha256').update(expected.idempotencyKey).digest('hex')}`;
  const changedStart = '2026-07-15T10:00:00Z'; const changedEnd = '2026-07-15T11:00:00Z';
  const adapter = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(412)], calls) });
  await assert.rejects(adapter.reschedulePrivateEvent({ eventId, serviceId: 'makeup', workTrack: 'makeup', marker, previousStart: expected.start, previousEnd: expected.end, attendee: 'client@example.com', etag: '"old"', start: changedStart, end: changedEnd }), { code: 'VERIFICATION_FAILED' });
  assert.equal(calls[1].init.headers['if-match'], '"old"');

  const movedCalls = [];
  const moved = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(), json(eventFor({ etag: '"new"', start: { dateTime: changedStart }, end: { dateTime: changedEnd }, description: 'Customer: Ana\nPhone: +38970000000', attendees: [{ email: 'client@example.com' }] }))], movedCalls) });
  assert.deepEqual(await moved.reschedulePrivateEvent({ eventId, serviceId: 'makeup', workTrack: 'makeup', marker, previousStart: expected.start, previousEnd: expected.end, attendee: 'client@example.com', etag: '"old"', start: changedStart, end: changedEnd }), { eventId, start: changedStart, end: changedEnd });
  assert.equal(movedCalls[1].init.method, 'PATCH');
  assert.match(movedCalls[1].url, /sendUpdates=all/);
  assert.deepEqual(JSON.parse(movedCalls[1].init.body), { start: { dateTime: changedStart }, end: { dateTime: changedEnd } });

  const exact = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json(eventFor({ etag: '"current"', attendees: [{ email: 'client@example.com' }] }))]) });
  assert.deepEqual(await exact.getVerifiedAttendee({ eventId, start: expected.start, end: expected.end, workTrack: 'makeup', marker }), { email: 'client@example.com', etag: '"current"' });
  const ambiguous = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json(eventFor({ etag: '"current"', attendees: [{ email: 'client@example.com' }, { email: 'other@example.com' }] }))]) });
  await assert.rejects(ambiguous.getVerifiedAttendee({ eventId, start: expected.start, end: expected.end, workTrack: 'makeup', marker }), { code: 'VERIFICATION_FAILED' });
});

test('cancellation reconciliation accepts sparse cancelled tombstones but verifies retained managed fields', async () => {
  const eventId = eventIdFromIdempotencyKey(expected.idempotencyKey); const marker = `v1:${createHash('sha256').update(expected.idempotencyKey).digest('hex')}`;
  const input = { eventId, start: expected.start, end: expected.end, workTrack: 'makeup', marker };
  const missing = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(404)]) });
  assert.deepEqual(await missing.reconcileCancelledPrivateEvent(input), { cancelled: true });
  const sparse = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json({ id: eventId, status: 'cancelled' })]) });
  assert.deepEqual(await sparse.reconcileCancelledPrivateEvent(input), { cancelled: true });
  const cancelled = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json(eventFor({ status: 'cancelled' }))]) });
  assert.deepEqual(await cancelled.reconcileCancelledPrivateEvent(input), { cancelled: true });
  const active = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json(eventFor())]) });
  assert.deepEqual(await active.reconcileCancelledPrivateEvent(input), { cancelled: false });
  for (const tombstone of [eventFor({ visibility: 'default', status: 'cancelled' }), eventFor({ status: 'cancelled', extendedProperties: { private: { bookingIdempotencyDigest: marker, bookingWorkTrack: 'hair' } } }), eventFor({ status: 'cancelled', start: { dateTime: '2026-07-15T10:00:00Z' } })]) {
    const mismatch = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json(tombstone)]) });
    await assert.rejects(mismatch.reconcileCancelledPrivateEvent(input), { code: 'VERIFICATION_FAILED' });
  }
});

test('managed cancellation makes one DELETE and proves missing, cancelled, active, and mismatched follow-ups safely', async () => {
  const eventId = eventIdFromIdempotencyKey(expected.idempotencyKey); const marker = `v1:${createHash('sha256').update(expected.idempotencyKey).digest('hex')}`;
  const input = { eventId, start: expected.start, end: expected.end, workTrack: 'makeup', marker, attendee: 'client@example.com', etag: '"current"' };
  const cancelledCalls = []; const cancelled = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(), json({ id: eventId, status: 'cancelled' })], cancelledCalls) });
  assert.deepEqual(await cancelled.cancelPrivateEvent(input), { cancelled: true, notificationPolicy: 'sendUpdates=all' });
  assert.equal(cancelledCalls.filter((call) => call.init.method === 'DELETE').length, 1);
  assert.equal(cancelledCalls[1].init.method, 'DELETE');
  assert.match(cancelledCalls[1].url, /sendUpdates=all/);

  const missingCalls = []; const missing = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(), empty(404)], missingCalls) });
  assert.deepEqual(await missing.cancelPrivateEvent(input), { cancelled: true, notificationPolicy: 'sendUpdates=all' });
  assert.equal(missingCalls.filter((call) => call.init.method === 'DELETE').length, 1);

  const activeCalls = []; const active = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(), json(eventFor())], activeCalls) });
  await assert.rejects(active.cancelPrivateEvent(input), { code: 'AMBIGUOUS_MUTATION' });
  assert.equal(activeCalls.filter((call) => call.init.method === 'DELETE').length, 1);

  const mismatchCalls = []; const mismatch = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), empty(), json(eventFor({ visibility: 'default', status: 'cancelled' }))], mismatchCalls) });
  await assert.rejects(mismatch.cancelPrivateEvent(input), { code: 'VERIFICATION_FAILED' });
  assert.equal(mismatchCalls.filter((call) => call.init.method === 'DELETE').length, 1);
});

test('passes an abort signal for bounded request timeout', async () => {
  let signal;
  const adapter = createGoogleCalendarAdapter({
    env,
    timeoutMs: 1,
    fetch: async (_url, init) => new Promise((_resolve, reject) => {
      signal = init.signal;
      init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }),
  });
  await assert.rejects(adapter.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end }), { code: 'TRANSPORT_FAILED' });
  assert.ok(signal instanceof AbortSignal);
});

test('enforces one public-method deadline across response parsing and multi-request recovery', async () => {
  let bodySignal; const parsing = createGoogleCalendarAdapter({
    env,
    timeoutMs: 5,
    fetch: async (url, init) => {
      if (String(url).includes('/token')) return token();
      bodySignal = init.signal;
      return { ok: true, status: 200, json: () => new Promise((resolve) => setTimeout(() => resolve({ calendars: { [env.GOOGLE_CALENDAR_ID]: { busy: [] } } }), 30)) };
    },
  });
  await assert.rejects(parsing.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end }), { code: 'TRANSPORT_FAILED' });
  assert.equal(bodySignal.aborted, true);

  const signals = [];
  const retrying = createGoogleCalendarAdapter({
    env,
    timeoutMs: 15,
    fetch: async (url, init) => {
      signals.push(init.signal);
      await new Promise((resolve) => setTimeout(resolve, 10));
      return String(url).includes('/token') ? token() : empty(401);
    },
  });
  await assert.rejects(retrying.getBusyIntervals({ timeMin: expected.start, timeMax: expected.end }), { code: 'TRANSPORT_FAILED' });
  assert.ok(signals.some((signal) => signal.aborted));
});

test('lists only valid opaque timed or Skopje all-day blockers with bounded recurring pagination', async () => {
  const calls = [];
  const adapter = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json({ items: [
    { id: 'timed', status: 'confirmed', start: { dateTime: expected.start }, end: { dateTime: expected.end } },
    { id: 'all-day', status: 'confirmed', start: { date: '2026-07-15' }, end: { date: '2026-07-16' } },
    { id: 'free', status: 'confirmed', transparency: 'transparent', start: { dateTime: expected.start }, end: { dateTime: expected.end } },
  ], nextPageToken: 'next' }), json({ items: [{ id: 'cancelled', status: 'cancelled', start: { dateTime: expected.start }, end: { dateTime: expected.end } }] })], calls) });
  const blockers = await adapter.listBlockingEvents({ timeMin: expected.start, timeMax: '2026-07-16T00:00:00Z' });
  assert.equal(blockers.length, 2); assert.equal(blockers[1].start, '2026-07-14T22:00:00Z');
  assert.match(calls[1].url, /timeZone=Europe%2FSkopje/); assert.match(calls[1].url, /singleEvents=true/); assert.match(calls[2].url, /pageToken=next/);
  const malformed = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json({ items: [{ id: 'mixed', status: 'confirmed', start: { date: '2026-07-15' }, end: { dateTime: expected.end } }] })]) });
  await assert.rejects(malformed.listBlockingEvents({ timeMin: expected.start, timeMax: expected.end }), { code: 'GOOGLE_REQUEST_FAILED' });
});

test('classifies only verified booking markers as known work tracks', async () => {
  const missingVisibility = eventFor({ eventId: 'missing-visibility' });
  delete missingVisibility.visibility;
  const adapter = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json({ items: [
    eventFor(),
    { id: 'missing-marker', status: 'confirmed', start: { dateTime: expected.start }, end: { dateTime: expected.end } },
    { id: 'invalid-marker', status: 'confirmed', start: { dateTime: expected.start }, end: { dateTime: expected.end }, extendedProperties: { private: { bookingIdempotencyDigest: 'v1:not-a-digest', bookingWorkTrack: 'hair' } } },
    { id: 'invalid-track', status: 'confirmed', start: { dateTime: expected.start }, end: { dateTime: expected.end }, extendedProperties: { private: { bookingIdempotencyDigest: `v1:${'a'.repeat(64)}`, bookingWorkTrack: 'nails' } } },
    eventFor({ eventId: 'public-marker', visibility: 'public' }),
    eventFor({ eventId: 'default-marker', visibility: 'default' }),
    missingVisibility,
  ] })]) });
  const blockers = await adapter.listBlockingEvents({ timeMin: expected.start, timeMax: expected.end });
  assert.deepEqual(blockers.map(({ id, track }) => ({ id, track })), [
    { id: eventIdFromIdempotencyKey(expected.idempotencyKey), track: 'makeup' },
    { id: 'missing-marker', track: 'unknown' },
    { id: 'invalid-marker', track: 'unknown' },
    { id: 'invalid-track', track: 'unknown' },
    { id: 'public-marker', track: 'unknown' },
    { id: 'default-marker', track: 'unknown' },
    { id: 'missing-visibility', track: 'unknown' },
  ]);
});

test('reconciliation and direct verification reject missing or wrong work-track markers', async () => {
  const marker = `v1:${createHash('sha256').update(expected.idempotencyKey).digest('hex')}`;
  const variants = [
    { private: { bookingIdempotencyDigest: marker } },
    { private: { bookingIdempotencyDigest: marker, bookingWorkTrack: 'hair' } },
  ];
  for (const extendedProperties of variants) {
    const reconciled = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json(eventFor({ extendedProperties }))]) });
    await assert.rejects(reconciled.reconcilePrivateEvent(expected), { code: 'VERIFICATION_FAILED' });

    const verified = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json(eventFor({ extendedProperties }))]) });
    await assert.rejects(verified.verifyEvent({
      eventId: eventIdFromIdempotencyKey(expected.idempotencyKey),
      start: Temporal.Instant.from(expected.start),
      end: Temporal.Instant.from(expected.end),
      summary: expected.summary,
      description: '',
      marker,
      workTrack: expected.workTrack,
    }), { code: 'VERIFICATION_FAILED' });
  }
});

test('blocker listing encodes calendar IDs, sends its complete bounded query, and fails closed on token loops and page exhaustion', async () => {
  const calls = [];
  const adapter = createGoogleCalendarAdapter({ env: { ...env, GOOGLE_CALENDAR_ID: 'studio/calendar@example.com' }, fetch: mockFetch([token(), json({ items: [], nextPageToken: 'again' }), json({ items: [], nextPageToken: 'again' })], calls) });
  await assert.rejects(adapter.listBlockingEvents({ timeMin: expected.start, timeMax: expected.end }), { code: 'GOOGLE_REQUEST_FAILED' });
  assert.match(calls[1].url, /studio%2Fcalendar%40example\.com/);
  for (const query of ['singleEvents=true', 'timeZone=Europe%2FSkopje', 'maxResults=250', 'timeMin=', 'timeMax=']) assert.match(calls[1].url, new RegExp(query));
  const pages = [token()]; for (let index = 0; index < 5; index += 1) pages.push(json({ items: [], nextPageToken: `page-${index}` }));
  const exhausted = createGoogleCalendarAdapter({ env, fetch: mockFetch(pages) });
  await assert.rejects(exhausted.listBlockingEvents({ timeMin: expected.start, timeMax: expected.end }), { code: 'GOOGLE_REQUEST_FAILED' });
});

test('blocker listing rejects provider malformed identities, statuses, tokens, and all-day date endpoints', async (t) => {
  const payloads = [
    { items: [{ id: '', status: 'confirmed', start: { dateTime: expected.start }, end: { dateTime: expected.end } }] },
    { items: [{ id: 'event', status: 4, start: { dateTime: expected.start }, end: { dateTime: expected.end } }] },
    { items: [], nextPageToken: '' },
    { items: [{ id: 'event', status: 'confirmed', start: { date: 'not-a-date' }, end: { date: '2026-07-16' } }] },
    { items: [{ id: 'event', status: 'confirmed', start: { dateTime: expected.end }, end: { dateTime: expected.start } }] },
  ];
  for (const payload of payloads) await t.test(JSON.stringify(payload).slice(0, 24), async () => {
    const adapter = createGoogleCalendarAdapter({ env, fetch: mockFetch([token(), json(payload)]) });
    await assert.rejects(adapter.listBlockingEvents({ timeMin: expected.start, timeMax: expected.end }), { code: 'GOOGLE_REQUEST_FAILED' });
  });
});
