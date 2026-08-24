import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAvailableStarts,
  normalizeBusyIntervals,
} from '../../src/lib/booking/availability.mjs';
import { getService, getServiceBookingDurationMinutes, getServiceOccupancyMinutes, getServiceWorkTrack, SERVICES } from '../../src/lib/booking/services.mjs';
import { getWorkingWindow } from '../../src/lib/booking/studio-rules.mjs';

const summerDate = '2026-07-15';
const winterDate = '2026-01-15';

test('the catalog contains exactly the confirmed services', () => {
  assert.deepEqual(SERVICES, [
    { id: 'short-hair-haircut', name: 'Short-hair haircut', priceLabel: '400–500 MKD', durationMinutes: 30 },
    { id: 'long-hair-haircut', name: 'Long-hair haircut', priceLabel: '700–900 MKD', durationMinutes: 30 },
    { id: 'hairstyling', name: 'Hairstyling', priceLabel: '1300–1800 MKD', durationMinutes: 30 },
    { id: 'hair-straightening-ironing', name: 'Hair straightening/ironing', priceLabel: '500 MKD', durationMinutes: 30 },
    { id: 'hair-curling', name: 'Hair curling', priceLabel: '500–1500 MKD', durationMinutes: 30 },
    { id: 'hair-coloring', name: 'Hair coloring', priceLabel: '1200–2000 MKD', durationMinutes: 90 },
    { id: 'highlights', name: 'Highlights', priceLabel: 'from 3500 MKD', durationMinutes: 240 },
    { id: 'keratin-treatment', name: 'Keratin Treatment for hydration', priceLabel: '1500–2000 MKD', durationMinutes: 90 },
    { id: 'makeup', name: 'Makeup', priceLabel: '1500 MKD', durationMinutes: 60 },
    { id: 'balayage', name: 'Balayage', priceLabel: 'from 4500 MKD', durationMinutes: 300 },
  ]);
  assert.throws(() => getService('unconfirmed-service'), /confirmed service/);
  assert.equal(getServiceWorkTrack('makeup'), 'makeup');
  for (const service of SERVICES.filter(({ id }) => id !== 'makeup')) assert.equal(getServiceWorkTrack(service.id), 'hair');
});

test('seasonal working windows use the requested Skopje date and DST offset', () => {
  assert.deepEqual(getWorkingWindow(summerDate), {
    date: summerDate,
    opening: '2026-07-15T04:00:00Z',
    closing: '2026-07-15T16:00:00Z',
  });
  assert.deepEqual(getWorkingWindow(winterDate), {
    date: winterDate,
    opening: '2026-01-15T09:00:00Z',
    closing: '2026-01-15T17:00:00Z',
  });
  assert.equal(getWorkingWindow('2026-03-29').opening, '2026-03-29T08:00:00Z');
  assert.equal(getWorkingWindow('2026-10-25').opening, '2026-10-25T09:00:00Z');
  assert.equal(getWorkingWindow('2026-03-31').opening, '2026-03-31T08:00:00Z');
  assert.equal(getWorkingWindow('2026-04-01').opening, '2026-04-01T04:00:00Z');
  assert.equal(getWorkingWindow('2026-08-31').opening, '2026-08-31T04:00:00Z');
  assert.equal(getWorkingWindow('2026-09-01').opening, '2026-09-01T08:00:00Z');
  assert.equal(getWorkingWindow('2026-09-30').opening, '2026-09-30T08:00:00Z');
  assert.equal(getWorkingWindow('2026-10-01').opening, '2026-10-01T08:00:00Z');
});

test('every service occupancy produces aligned regular starts that fit the complete calendar reservation', () => {
  for (const service of SERVICES) {
    const starts = getAvailableStarts({ serviceId: service.id, date: summerDate });
    assert.ok(starts.length > 0);
    assert.equal(starts[0], '2026-07-15T04:00:00Z');
    const lastStart = starts.at(-1);
    const lastStartMinute = new Date(lastStart).getUTCMinutes();
    assert.equal(lastStartMinute % 30, 0);
    assert.ok(new Date(lastStart).getTime() + getServiceOccupancyMinutes(service.id) * 60_000 <= new Date('2026-07-15T16:00:00Z').getTime());
  }
  assert.equal(getAvailableStarts({ serviceId: 'balayage', date: summerDate }).at(-1), '2026-07-15T14:30:00Z');
});

test('a 30-minute service occupies its post-service buffer while an exact busy-end adjacency remains available', () => {
  const starts = getAvailableStarts({
    serviceId: 'short-hair-haircut',
    date: winterDate,
    busyIntervals: [{ start: '2026-01-15T12:00:00Z', end: '2026-01-15T12:45:00Z' }],
  });
  assert.equal(starts.includes('2026-01-15T12:00:00Z'), false);
  assert.equal(starts.includes('2026-01-15T12:30:00Z'), false);
  assert.equal(starts.includes('2026-01-15T12:45:00Z'), true);
});

test('long customer-facing durations retain their display values but reserve 60 active minutes plus the shared buffer', () => {
  assert.equal(getService('highlights').durationMinutes, 240);
  assert.equal(getService('balayage').durationMinutes, 300);
  assert.equal(getServiceBookingDurationMinutes('highlights'), 60);
  assert.equal(getServiceBookingDurationMinutes('balayage'), 60);
  assert.equal(getServiceOccupancyMinutes('highlights'), 75);
  assert.equal(getServiceOccupancyMinutes('balayage'), 75);
});

test('partial busy intervals use inclusive starts and exclusive ends', () => {
  const starts = getAvailableStarts({
    serviceId: 'short-hair-haircut',
    date: winterDate,
    busyIntervals: [{ start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z' }],
  });
  assert.equal(starts.includes('2026-01-15T09:30:00Z'), false);
  assert.equal(starts.includes('2026-01-15T10:00:00Z'), false);
  assert.equal(starts.includes('2026-01-15T11:00:00Z'), true);
});

test('opening and exact-closing boundaries remain available unless a crossing interval overlaps', () => {
  const unblocked = getAvailableStarts({ serviceId: 'makeup', date: winterDate });
  assert.equal(unblocked[0], '2026-01-15T09:00:00Z');
  assert.equal(unblocked.at(-1), '2026-01-15T15:30:00Z');
  assert.equal(getAvailableStarts({
    serviceId: 'makeup',
    date: winterDate,
    busyIntervals: [{ start: '2026-01-15T08:30:00Z', end: '2026-01-15T09:15:00Z' }],
  }).includes('2026-01-15T09:00:00Z'), false);
  assert.equal(getAvailableStarts({
    serviceId: 'makeup',
    date: winterDate,
    busyIntervals: [{ start: '2026-01-15T16:30:00Z', end: '2026-01-15T17:30:00Z' }],
  }).includes('2026-01-15T16:00:00Z'), false);
});

test('full-day blocks and normalized duplicate, overlapping, and adjacent intervals block correctly', () => {
  assert.deepEqual(normalizeBusyIntervals([
    { start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z' },
    { start: '2026-01-15T10:30:00Z', end: '2026-01-15T11:30:00Z' },
    { start: '2026-01-15T11:30:00Z', end: '2026-01-15T12:00:00Z' },
    { start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z' },
  ]), [{ start: '2026-01-15T10:00:00Z', end: '2026-01-15T12:00:00Z', track: 'unknown' }]);
  assert.deepEqual(getAvailableStarts({
    serviceId: 'makeup',
    date: winterDate,
    busyIntervals: [{ start: '2026-01-14T00:00:00Z', end: '2026-01-16T00:00:00Z' }],
  }), []);
});

test('availability blocks only the requested work track while unknown intervals block both', () => {
  const interval = { start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:15:00Z' };
  assert.equal(getAvailableStarts({ serviceId: 'makeup', date: winterDate, busyIntervals: [{ ...interval, track: 'hair' }] }).includes(interval.start), true);
  assert.equal(getAvailableStarts({ serviceId: 'makeup', date: winterDate, busyIntervals: [{ ...interval, track: 'makeup' }] }).includes(interval.start), false);
  assert.equal(getAvailableStarts({ serviceId: 'short-hair-haircut', date: winterDate, busyIntervals: [{ ...interval, track: 'makeup' }] }).includes(interval.start), true);
  assert.equal(getAvailableStarts({ serviceId: 'short-hair-haircut', date: winterDate, busyIntervals: [{ ...interval, track: 'hair' }] }).includes(interval.start), false);
  assert.equal(getAvailableStarts({ serviceId: 'makeup', date: winterDate, busyIntervals: [interval] }).includes(interval.start), false);
});

test('normalization retains overlapping intervals from distinct work tracks', () => {
  assert.deepEqual(normalizeBusyIntervals([
    { start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z', track: 'makeup' },
    { start: '2026-01-15T10:30:00Z', end: '2026-01-15T11:30:00Z', track: 'hair' },
    { start: '2026-01-15T10:45:00Z', end: '2026-01-15T11:15:00Z', track: 'makeup' },
  ]), [
    { start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:15:00Z', track: 'makeup' },
    { start: '2026-01-15T10:30:00Z', end: '2026-01-15T11:30:00Z', track: 'hair' },
  ]);
});

test('strict validation rejects malformed request and interval schemas', () => {
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: '2026-2-03' }), /calendar date/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: '2026-02-30' }), /valid calendar date/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, busyIntervals: [{ start: 'not-an-instant', end: '2026-01-15T11:00:00Z' }] }), /ISO instant/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, busyIntervals: [{ start: '2026-01-15T11:00:00Z', end: '2026-01-15T11:00:00Z' }] }), /after its start/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, typo: true }), /Unknown availability request field/);
  assert.throws(() => getAvailableStarts(Object.create({ serviceId: 'makeup', date: winterDate })), /availability request must be a plain object/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, busyIntervals: 'not-an-array' }), /must be an array/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, busyIntervals: [{ start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z', typo: true }] }), /Unknown busyIntervals\[0\] field/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, busyIntervals: [Object.create({ start: '2026-01-15T10:00:00Z', end: '2026-01-15T11:00:00Z' })] }), /busyIntervals\[0\] must be a plain object/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, busyIntervals: [{ start: 1, end: '2026-01-15T11:00:00Z' }] }), /must be strings/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, constraints: { leadTimeMinutes: 30 } }), /constraints.now/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, constraints: { now: '2026-01-15T09:00:00Z', leadTimeMinutes: -1 } }), /non-negative integer/);
  assert.throws(() => getAvailableStarts({ serviceId: 'makeup', date: winterDate, constraints: { now: '2026-01-15T09:00:00Z', bookingHorizonDays: 1.5 } }), /non-negative integer/);
});

test('lead time and horizon are applied only when callers explicitly provide them', () => {
  const constraints = { now: '2026-01-15T09:15:00Z', leadTimeMinutes: 60, bookingHorizonDays: 2 };
  const starts = getAvailableStarts({ serviceId: 'short-hair-haircut', date: winterDate, constraints });
  assert.equal(starts[0], '2026-01-15T10:30:00Z');
  assert.deepEqual(getAvailableStarts({
    serviceId: 'short-hair-haircut',
    date: '2026-01-18',
    constraints,
  }), []);
  assert.ok(getAvailableStarts({
    serviceId: 'short-hair-haircut',
    date: '2026-01-17',
    constraints,
  }).length > 0);
});
