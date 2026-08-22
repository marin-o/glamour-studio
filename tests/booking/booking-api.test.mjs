import assert from 'node:assert/strict';
import test from 'node:test';

import { createAvailabilityHandler, createBookingHandler } from '../../src/lib/booking/http/handlers.mjs';
import { GET as defaultAvailability } from '../../src/app/api/booking/availability/route.js';
import { POST as defaultBooking } from '../../src/app/api/booking/route.js';
import { BookingError } from '../../src/lib/booking/orchestration/errors.mjs';

test('availability handler rejects unknown query fields with no-store envelope', async () => {
  const handler = createAvailabilityHandler({ async availability() { throw new Error('should not run'); } });
  const response = await handler(new Request('http://test/api/booking/availability?serviceId=x&date=2026-07-24&x=1'));
  assert.equal(response.status, 400); assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ok: false, error: { code: 'INVALID_REQUEST' } });
});

test('booking handler enforces json, bounded body, and hides contact data', async () => {
  const handler = createBookingHandler({ async book() { return { status: 'confirmed', serviceId: 'x', start: 'a', end: 'b', notification: 'not_requested' }; } }, { maxBodyBytes: 30 });
  const nonJson = await handler(new Request('http://test/api/booking', { method: 'POST', body: '{}' }));
  assert.equal(nonJson.status, 415);
  const large = await handler(new Request('http://test/api/booking', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"name":"a very large body beyond cap"}' }));
  assert.equal(large.status, 413);
});

test('default routes fail closed with sanitized no-store 503 envelopes', async () => {
  const availability = await defaultAvailability(new Request('http://test/api/booking/availability?serviceId=makeup&date=2026-07-24'));
  const booking = await defaultBooking(new Request('http://test/api/booking', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': 'booking-key-default' }, body: JSON.stringify({ serviceId: 'makeup', start: '2026-07-24T04:00:00Z', name: 'Ana', phone: '+38970000000', email: 'ana@example.com' }) }));
  for (const response of [availability, booking]) { assert.equal(response.status, 503); assert.equal(response.headers.get('cache-control'), 'no-store'); assert.deepEqual(await response.json(), { ok: false, error: { code: 'BOOKING_NOT_CONFIGURED' } }); assert.equal(response.headers.get('access-control-allow-origin'), null); }
});

test('HTTP boundary maps every public error, bounds Retry-After, and allowlists DTO fields', async () => {
  const cases = [
    ['INVALID_REQUEST', 400], ['SLOT_UNAVAILABLE', 409], ['REQUEST_TOO_LARGE', 413], ['UNSUPPORTED_MEDIA_TYPE', 415], ['RATE_LIMITED', 429], ['CALENDAR_UNAVAILABLE', 503],
  ];
  for (const [code, status] of cases) {
    const handler = createBookingHandler({ async book() { throw new BookingError(code, status, { retryAfter: code === 'RATE_LIMITED' ? 20 : 999 }); } });
    const response = await handler(new Request('http://test/api/booking', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8', 'idempotency-key': 'booking-key-status' }, body: '{}' }));
    assert.equal(response.status, status); assert.equal(response.headers.get('cache-control'), 'no-store'); assert.equal(response.headers.get('retry-after'), code === 'RATE_LIMITED' ? '20' : null); assert.deepEqual(await response.json(), { ok: false, error: { code } });
  }
  const safe = createBookingHandler({ async book() { return { status: 'confirmed', serviceId: 'makeup', start: '2026-07-24T04:00:00Z', end: '2026-07-24T05:00:00Z', notification: 'requested', phone: '+389', email: 'a@b.c', calendarId: 'secret', track: 'makeup', workTrack: 'makeup' }; } });
  const response = await safe(new Request('http://test/api/booking', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': 'booking-key-safe' }, body: '{}' }));
  assert.deepEqual(await response.json(), { ok: true, booking: { status: 'confirmed', serviceId: 'makeup', start: '2026-07-24T04:00:00Z', end: '2026-07-24T05:00:00Z', notification: 'requested' } });
});

test('public HTTP contracts reject client track fields and omit internal tracks from availability', async () => {
  const availability = createAvailabilityHandler({ async availability() { return { serviceId: 'makeup', date: '2026-07-24', starts: [], track: 'makeup', workTrack: 'makeup' }; } });
  const availabilityResponse = await availability(new Request('http://test/api/booking/availability?serviceId=makeup&date=2026-07-24'));
  assert.deepEqual(await availabilityResponse.json(), { ok: true, availability: { serviceId: 'makeup', date: '2026-07-24', starts: [] } });

  for (const field of ['track', 'workTrack']) {
    let calls = 0;
    const booking = createBookingHandler({ async book() { calls += 1; return { status: 'confirmed', serviceId: 'makeup', start: '2026-07-24T04:00:00Z', end: '2026-07-24T05:00:00Z', notification: 'requested' }; } });
    const response = await booking(new Request('http://test/api/booking', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': `booking-key-public-${field}` },
      body: JSON.stringify({ serviceId: 'makeup', start: '2026-07-24T04:00:00Z', name: 'Ana', phone: '+38970000000', email: 'ana@example.com', [field]: 'hair' }),
    }));
    assert.equal(response.status, 400); assert.deepEqual(await response.json(), { ok: false, error: { code: 'INVALID_REQUEST' } }); assert.equal(calls, 0);
  }
});

test('exact JSON media types and streamed UTF-8/body limits are enforced before runtime calls', async () => {
  let calls = 0; const runtime = { async book() { calls += 1; return { status: 'confirmed', serviceId: 'makeup', start: 'a', end: 'b', notification: 'not_requested' }; } }; const handler = createBookingHandler(runtime, { maxBodyBytes: 12 });
  for (const type of ['application/jsonx', 'text/application/json', 'application/json; bad', 'application/json; charset=utf-8; =bad']) {
    const response = await handler(new Request('http://test/api/booking', { method: 'POST', headers: { 'content-type': type, 'idempotency-key': 'booking-key-type' }, body: '{}' })); assert.equal(response.status, 415);
  }
  let cancelled = false;
  const body = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{"x":"')); controller.enqueue(new TextEncoder().encode('more-than-cap"}')); }, cancel() { cancelled = true; } });
  const oversized = await handler(new Request('http://test/api/booking', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': 'booking-key-stream' }, body, duplex: 'half' }));
  assert.equal(oversized.status, 413); assert.equal(cancelled, true);
  const invalidUtf8 = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array([0xc3, 0x28])); controller.close(); } });
  const malformed = await handler(new Request('http://test/api/booking', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': 'booking-key-utf8' }, body: invalidUtf8, duplex: 'half' }));
  assert.equal(malformed.status, 400); assert.equal(calls, 0);
});

test('availability forwards only injected trusted context, not forwarded headers', async () => {
  let received; const handler = createAvailabilityHandler({ async availability(_input, requestContext) { received = requestContext; return { serviceId: 'makeup', date: '2026-07-24', starts: [] }; } }, { getRequestContext: () => ({ subjectDigest: 'a'.repeat(64) }) });
  const response = await handler(new Request('http://test/api/booking/availability?serviceId=makeup&date=2026-07-24', { headers: { 'x-forwarded-for': '8.8.8.8' } }));
  assert.equal(response.status, 200); assert.deepEqual(received, { subjectDigest: 'a'.repeat(64) });
});
