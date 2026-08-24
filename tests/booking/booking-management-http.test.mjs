import assert from 'node:assert/strict';
import test from 'node:test';

import { createBookingManagementHandlers } from '../../src/lib/booking/http/handlers.mjs';

const secret = 'a'.repeat(43);
const safe = { serviceId: 'makeup', start: '2026-08-25T08:00:00Z', end: '2026-08-25T09:15:00Z', status: 'confirmed', canReschedule: true };
const context = { subjectDigest: 'b'.repeat(64) };

test('management HTTP requires a bearer capability and returns only exact safe DTOs', async () => {
  let seen; const handlers = createBookingManagementHandlers({ async managementRead(value, received) { seen = { value, received }; return { ...safe, eventId: 'hidden', email: 'hidden@example.com', track: 'makeup' }; } }, { getRequestContext: () => context });
  const unauthorized = await handlers.read(new Request('https://example.test/api/booking/manage'));
  assert.equal(unauthorized.status, 404); assert.deepEqual(await unauthorized.json(), { ok: false, error: { code: 'MANAGEMENT_UNAVAILABLE' } });
  const response = await handlers.read(new Request('https://example.test/api/booking/manage', { headers: { authorization: `Bearer ${secret}` } }));
  assert.equal(response.headers.get('cache-control'), 'no-store'); assert.deepEqual(await response.json(), { ok: true, booking: safe }); assert.deepEqual(seen, { value: secret, received: context });
});

test('management availability and mutations enforce exact URL/body contracts without token body fallback', async () => {
  const calls = []; const handlers = createBookingManagementHandlers({
    async managementAvailability(...args) { calls.push(['availability', ...args]); return { serviceId: 'makeup', date: '2026-08-25', starts: ['2026-08-25T08:00:00Z'], eventId: 'hidden' }; },
    async managementReschedule(...args) { calls.push(['reschedule', ...args]); return safe; },
    async managementCancel(...args) { calls.push(['cancel', ...args]); return { ...safe, status: 'cancelled', canReschedule: false }; },
  }, { getRequestContext: () => context });
  const badQuery = await handlers.availability(new Request(`https://example.test/api/booking/manage/availability?date=2026-08-25&secret=${secret}`, { headers: { authorization: `Bearer ${secret}` } })); assert.equal(badQuery.status, 400);
  const availability = await handlers.availability(new Request('https://example.test/api/booking/manage/availability?date=2026-08-25', { headers: { authorization: `Bearer ${secret}` } })); assert.deepEqual(await availability.json(), { ok: true, availability: { serviceId: 'makeup', date: '2026-08-25', starts: ['2026-08-25T08:00:00Z'] } });
  const patched = await handlers.reschedule(new Request('https://example.test/api/booking/manage', { method: 'PATCH', headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' }, body: JSON.stringify({ start: safe.start }) })); assert.deepEqual(await patched.json(), { ok: true, booking: safe });
  for (const [method, handler] of [['PATCH', handlers.reschedule], ['DELETE', handlers.cancel]]) {
    const rejected = await handler(new Request(`https://example.test/api/booking/manage?secret=${secret}`, { method, headers: method === 'PATCH' ? { authorization: `Bearer ${secret}`, 'content-type': 'application/json' } : { authorization: `Bearer ${secret}` }, ...(method === 'PATCH' ? { body: JSON.stringify({ start: safe.start }) } : {}) }));
    assert.equal(rejected.status, 400, `${method} rejects every query before capability mutation`);
  }
  const cancelled = await handlers.cancel(new Request('https://example.test/api/booking/manage', { method: 'DELETE', headers: { authorization: `Bearer ${secret}` } })); assert.deepEqual(await cancelled.json(), { ok: true, booking: { ...safe, status: 'cancelled', canReschedule: false } });
  assert.equal(calls.every((entry) => entry[1] === secret), true);
});
