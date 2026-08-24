import assert from 'node:assert/strict';
import test from 'node:test';

import { createBookingApi } from '../../src/lib/booking/client/booking-api.mjs';
import {
  managementCanCancel,
  managementCanReschedule,
  managementDates,
  managementSlotGroups,
  readManagementSecret,
} from '../../src/lib/booking/client/booking-flow.mjs';

const secret = 'a'.repeat(43);
const booking = {
  ok: true,
  booking: {
    serviceId: 'makeup',
    start: '2026-08-25T08:00:00Z',
    end: '2026-08-25T09:15:00Z',
    status: 'confirmed',
    canReschedule: true,
  },
};
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

test('management client keeps capability in the bearer header and enforces exact request shapes', async () => {
  const calls = [];
  const api = createBookingApi({ capability: () => secret, fetch: async (url, init) => {
    calls.push({ url, init });
    if (url.includes('/availability?')) return response({ ok: true, availability: { serviceId: 'makeup', date: '2026-08-26', starts: ['2026-08-26T08:00:00Z'] } });
    return response(booking);
  } });

  assert.deepEqual(await api.managementRead(), { ok: true, booking: booking.booking });
  assert.deepEqual(await api.managementAvailability({ date: '2026-08-26' }), { ok: true, availability: { serviceId: 'makeup', date: '2026-08-26', starts: ['2026-08-26T08:00:00Z'] } });
  assert.deepEqual(await api.managementReschedule({ start: booking.booking.start }), { ok: true, booking: booking.booking });
  assert.deepEqual(await api.managementCancel(), { ok: true, booking: booking.booking });

  assert.equal(calls[0].url, '/api/booking/manage');
  assert.equal(calls[1].url, '/api/booking/manage/availability?date=2026-08-26');
  assert.equal(calls[2].url, '/api/booking/manage');
  assert.equal(calls[3].url, '/api/booking/manage');
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${secret}`);
  assert.equal(calls[0].url.includes(secret), false);
  assert.equal(calls[0].init.body, undefined);
  assert.equal(calls[1].init.body, undefined);
  assert.equal(calls[2].init.method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[2].init.body), { start: booking.booking.start });
  assert.equal(calls[3].init.method, 'DELETE');
  assert.equal(calls[3].init.body, undefined);
});

test('management client rejects extra DTO fields and maps safe failure classes', async () => {
  const extra = { ...booking, booking: { ...booking.booking, email: 'hidden@example.com' } };
  assert.equal((await createBookingApi({ capability: secret, fetch: async () => response(extra) }).managementRead()).kind, 'provider');
  for (const [status, code, kind] of [[404, 'MANAGEMENT_UNAVAILABLE', 'safe'], [409, 'SLOT_UNAVAILABLE', 'conflict'], [409, 'RESCHEDULE_CUTOFF', 'cutoff'], [409, 'CANCELLATION_CUTOFF', 'cancellationCutoff'], [429, 'RATE_LIMITED', 'rateLimited'], [503, 'BOOKING_UNKNOWN', 'unknown']]) {
    const result = await createBookingApi({ capability: secret, fetch: async () => response({ ok: false, error: { code } }, status) }).managementRead();
    assert.equal(result.kind, kind);
  }
  let requests = 0;
  assert.equal((await createBookingApi({ capability: 'short', fetch: async () => { requests += 1; return response(booking); } }).managementRead()).kind, 'safe');
  assert.equal(requests, 0);
});

test('management flow validates fragments, builds seven local dates, groups slots, and guards cutoffs', () => {
  assert.equal(readManagementSecret(`#${secret}`), secret);
  assert.equal(readManagementSecret(`#${secret}x`), '');
  assert.equal(readManagementSecret(`?${secret}`), '');
  assert.equal(managementDates('2026-08-25').length, 7);
  const groups = managementSlotGroups(['2026-08-25T08:00:00Z', '2026-08-25T13:00:00Z'], 'mk');
  assert.deepEqual(groups.morning, ['2026-08-25T08:00:00Z']);
  assert.deepEqual(groups.afternoon, ['2026-08-25T13:00:00Z']);
  assert.equal(managementCanReschedule(booking.booking), true);
  assert.equal(managementCanReschedule({ ...booking.booking, canReschedule: false }), false);
  assert.equal(managementCanCancel(booking.booking, new Date('2026-08-24T20:14:59.999Z')), true);
  assert.equal(managementCanCancel(booking.booking, new Date('2026-08-24T20:15:00.000Z')), true);
  assert.equal(managementCanCancel(booking.booking, new Date('2026-08-24T20:15:00.001Z')), false);
});
