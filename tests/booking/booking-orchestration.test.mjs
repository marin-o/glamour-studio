import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { Temporal } from '@js-temporal/polyfill';
import { createBookingService } from '../../src/lib/booking/orchestration/booking-service.mjs';

const start = '2026-07-24T04:00:00Z'; const end = '2026-07-24T05:00:00Z';
const policy = { leadTimeMinutes: 0, bookingHorizonDays: 30, idempotencyTtlSeconds: 3600, lockTimeoutMs: 100, lockLeaseMs: 10_000, providerOperationBudgetMs: 8_000, leaseSafetyMs: 1_000 };
const now = () => Temporal.Instant.from('2026-07-23T00:00:00Z');
const input = { serviceId: 'makeup', start, name: 'Ana', phone: '+38970000000', email: 'ana@example.com' };
const context = { subjectDigest: 'a'.repeat(64) };

function fakes({ staffBlocker = false, productionTransition = false } = {}) {
  const records = new Map(); const events = new Map(); const attendeeEventIds = []; const busyQueries = []; const blockingQueries = []; let activeLease = null; let inserts = 0; let invites = 0; let deleted = false;
  const ports = {
    lock: {
      async acquire({ owner }) { while (activeLease) await new Promise((resolve) => setTimeout(resolve, 1)); const lease = { owner, fencingToken: `f-${owner}`, expiresAt: Date.now() + 10_000 }; activeLease = lease; return { ...lease, async release(candidate) { if (!candidate || candidate.owner !== lease.owner || candidate.fencingToken !== lease.fencingToken || activeLease !== lease) throw new Error('compare-owner release rejected'); activeLease = null; } }; },
      async renew({ owner, fencingToken, leaseMs, minimumRemainingMs }) { if (!activeLease || activeLease.owner !== owner || activeLease.fencingToken !== fencingToken || activeLease.expiresAt <= Date.now() || leaseMs < minimumRemainingMs) throw new Error('renew rejected'); activeLease.expiresAt = Date.now() + leaseMs; return { ...activeLease, async release(candidate) { if (!candidate || candidate.owner !== activeLease.owner || candidate.fencingToken !== activeLease.fencingToken) throw new Error('compare-owner release rejected'); activeLease = null; } }; },
      async assertOwnership({ owner, fencingToken, minimumRemainingMs }) { if (!activeLease || activeLease.owner !== owner || activeLease.fencingToken !== fencingToken || activeLease.expiresAt - Date.now() < minimumRemainingMs) throw new Error('lost lock'); },
    },
    idempotency: {
      async get({ keyDigest }) { return records.get(keyDigest) ?? null; },
      async create({ keyDigest, fingerprint, state }) { const existing = records.get(keyDigest); if (existing) return existing; const record = { fingerprint, state, version: 1 }; records.set(keyDigest, record); return record; },
      async transition({ keyDigest, expectedVersion, expectedState, state, ttlSeconds: _ttlSeconds, eventId, code, outcome, ...patch }) {
        const record = records.get(keyDigest); if (!record || record.version !== expectedVersion || record.state !== expectedState) throw new Error('transition conflict');
        if (productionTransition) {
          const next = { fingerprint: record.fingerprint, state, version: record.version + 1 };
          if (state === 'event_created') next.eventId = eventId;
          if (state === 'confirmed_notification_pending' || state === 'confirmed') { next.eventId = eventId; next.outcome = outcome; }
          if (state === 'conflict') { if (eventId !== undefined) next.eventId = eventId; next.code = code; }
          if (state === 'manual_review') { next.eventId = eventId; next.code = code; }
          records.set(keyDigest, next); return next;
        }
        const next = { ...record, ...patch, ...(eventId === undefined ? {} : { eventId }), ...(code === undefined ? {} : { code }), ...(outcome === undefined ? {} : { outcome }), state, version: record.version + 1 };
        records.set(keyDigest, next); return next;
      },
    },
    rateLimit: { async check() { return { allowed: true }; } },
  };
  const calendar = {
    async getBusyIntervals(request) { busyQueries.push(request); return [...events.values()].map(({ start: eventStart, end: eventEnd }) => ({ start: eventStart, end: eventEnd })); },
    async reconcilePrivateEvent(event) { const id = `b${event.idempotencyKey.replace(/[^a-v0-9]/g, 'a').padEnd(64, 'a').slice(0, 64)}`; if (!events.has(id)) throw Object.assign(new Error('event absent'), { code: 'NOT_FOUND' }); return { event: events.get(id) }; },
    async createPrivateEvent(event) { const id = `b${event.idempotencyKey.replace(/[^a-v0-9]/g, 'a').padEnd(64, 'a').slice(0, 64)}`; if (!events.has(id)) { inserts += 1; events.set(id, { id, ...event }); } return { event: events.get(id) }; },
    async listBlockingEvents(request) { blockingQueries.push(request); return [...events.values()].map(({ id, start: eventStart, end: eventEnd }) => ({ id, start: eventStart, end: eventEnd })).concat(staffBlocker ? [{ id: 'staff', start, end, allDay: false }] : []); },
    async deleteEventForCompensation(id) { deleted = events.delete(id); return { deleted }; },
    async addOrUpdateAttendee({ eventId }) { invites += 1; attendeeEventIds.push(eventId); },
  };
  return { ports, calendar, records, events, attendeeEventIds, busyQueries, blockingQueries, get inserts() { return inserts; }, get invites() { return invites; }, get deleted() { return deleted; } };
}

test('occupancy end drives Calendar event, conflict-query, and public-response boundaries', async () => {
  const fake = fakes(); const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now });
  const result = await service.book({ ...input, serviceId: 'highlights' }, 'booking-key-occupancy-boundaries', context);
  assert.equal(result.end, '2026-07-24T05:15:00Z');
  assert.equal([...fake.events.values()][0].end, '2026-07-24T05:15:00Z');
  assert.deepEqual(fake.busyQueries[0], { timeMin: '2026-07-24T03:45:00Z', timeMax: '2026-07-24T05:15:00Z' });
  assert.deepEqual(fake.blockingQueries[0], { timeMin: start, timeMax: '2026-07-24T05:15:00Z' });
});

test('availability recalculates starts from busy booking occupancy', async () => {
  const fake = fakes(); const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now });
  await fake.calendar.createPrivateEvent({ idempotencyKey: 'busy-booking', start: '2026-07-24T07:00:00Z', end: '2026-07-24T07:45:00Z' });
  const availability = await service.availability({ serviceId: 'short-hair-haircut', date: '2026-07-24' }, context);
  assert.equal(availability.starts.includes('2026-07-24T07:00:00Z'), false);
  assert.equal(availability.starts.includes('2026-07-24T07:45:00Z'), true);
});

test('concurrent same-slot attempts serialize and only one confirms', async () => {
  const fake = fakes(); const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now });
  const [first, second] = await Promise.allSettled([service.book(input, 'booking-key-111', context), service.book({ ...input, name: 'Bora' }, 'booking-key-222', context)]);
  assert.equal([first, second].filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(fake.inserts, 1);
});

test('concurrent identical idempotency requests create and invite once, then replay the identical envelope', async () => {
  const fake = fakes(); const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now }); const withEmail = { ...input, email: 'ana@example.com' };
  const [a, b] = await Promise.all([service.book(withEmail, 'booking-key-333', context), service.book(withEmail, 'booking-key-333', context)]);
  assert.deepEqual(a, b); assert.equal(fake.inserts, 1); assert.equal(fake.invites, 1);
});

test('timed staff blocker compensates before conflict and all stored conflict replays as conflict', async () => {
  const fake = fakes({ staffBlocker: true }); const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now });
  await assert.rejects(() => service.book(input, 'booking-key-444', context), { code: 'SLOT_UNAVAILABLE' });
  await assert.rejects(() => service.book(input, 'booking-key-444', context), { code: 'SLOT_UNAVAILABLE' });
  assert.equal(fake.deleted, true);
});

test('invalid rate decisions and malformed contact/key values fail before Calendar mutations', async () => {
  const fake = fakes(); fake.ports.rateLimit.check = async () => ({ allowed: 'yes' }); const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now });
  await assert.rejects(() => service.book({ ...input, name: 'Ana\u2028X' }, 'booking-key-555', context), { code: 'INVALID_REQUEST' });
  await assert.rejects(() => service.book(input, ' booking-key-555', context), { code: 'INVALID_IDEMPOTENCY_KEY' });
  await assert.rejects(() => service.book(input, 'booking-key-555', context), { code: 'BOOKING_UNAVAILABLE' });
  assert.equal(fake.inserts, 0);
});

test('a pending FreeBusy conflict whose terminal write fails is unknown and retries FreeBusy without inserting', async () => {
  const fake = fakes(); let checks = 0; fake.calendar.getBusyIntervals = async () => { checks += 1; return [{ start, end }]; };
  const original = fake.ports.idempotency.transition; fake.ports.idempotency.transition = async (request) => { if (request.state === 'conflict') throw new Error('store outage'); return original(request); };
  const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now });
  await assert.rejects(() => service.book(input, 'booking-key-666', context), { code: 'BOOKING_UNKNOWN' });
  await assert.rejects(() => service.book(input, 'booking-key-666', context), { code: 'BOOKING_UNKNOWN' });
  assert.equal(checks, 2); assert.equal(fake.inserts, 0);
});

test('lost fencing ownership prevents insert, and notification-pending replay never resends', async () => {
  const fake = fakes(); const originalAssert = fake.ports.lock.assertOwnership; let assertions = 0;
  fake.ports.lock.assertOwnership = async (request) => { assertions += 1; if (assertions === 2) throw new Error('owner replaced'); return originalAssert(request); };
  const lost = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now });
  await assert.rejects(() => lost.book(input, 'booking-key-777', context), { code: 'CALENDAR_UNAVAILABLE' }); assert.equal(fake.inserts, 0);
  const retryFake = fakes(); const originalTransition = retryFake.ports.idempotency.transition;
  retryFake.ports.idempotency.transition = async (request) => { if (request.state === 'confirmed') throw new Error('final write outage'); return originalTransition(request); };
  const service = createBookingService({ calendar: retryFake.calendar, ports: retryFake.ports, policy, now }); const withEmail = { ...input, email: 'ana@example.com' };
  const first = await service.book(withEmail, 'booking-key-888', context); const replay = await service.book(withEmail, 'booking-key-888', context);
  assert.equal(first.notification, 'unknown'); assert.deepEqual(replay, first); assert.equal(retryFake.invites, 1);
});

test('creation intent is durable before insert, and an event-created write outage reconciles deterministically on retry', async () => {
  const beforeInsert = fakes(); const originalBefore = beforeInsert.ports.idempotency.transition;
  beforeInsert.ports.idempotency.transition = async (request) => request.state === 'creation_intent' ? Promise.reject(new Error('store unavailable')) : originalBefore(request);
  await assert.rejects(createBookingService({ calendar: beforeInsert.calendar, ports: beforeInsert.ports, policy, now }).book(input, 'booking-key-901', context), { code: 'BOOKING_UNKNOWN' });
  assert.equal(beforeInsert.inserts, 0);

  const afterInsert = fakes(); const originalAfter = afterInsert.ports.idempotency.transition; let failOnce = true;
  afterInsert.ports.idempotency.transition = async (request) => {
    if (request.state === 'event_created' && failOnce) { failOnce = false; throw new Error('store unavailable'); }
    return originalAfter(request);
  };
  const service = createBookingService({ calendar: afterInsert.calendar, ports: afterInsert.ports, policy, now });
  await assert.rejects(service.book(input, 'booking-key-902', context), { code: 'CALENDAR_UNAVAILABLE' });
  const replay = await service.book(input, 'booking-key-902', context);
  assert.equal(replay.status, 'confirmed'); assert.equal(afterInsert.inserts, 1);
});

test('a recovered creation intent reconciles first, then rechecks availability before any absent-event insert', async () => {
  const key = 'booking-key-recovered-conflict'; const fake = fakes(); const keyDigest = createHash('sha256').update(key, 'utf8').digest('hex');
  const contactDigest = createHash('sha256').update(`${input.name}\u0000${input.phone}\u0000${input.email}`, 'utf8').digest('hex');
  const fingerprint = createHash('sha256').update(JSON.stringify({ serviceId: input.serviceId, start, contactDigest }), 'utf8').digest('hex');
  fake.records.set(keyDigest, { fingerprint, state: 'creation_intent', version: 2 });
  fake.calendar.getBusyIntervals = async () => [{ start, end }];
  await assert.rejects(createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now }).book(input, key, context), { code: 'SLOT_UNAVAILABLE' });
  assert.equal(fake.inserts, 0);
});

test('a recovered creation intent with the deterministic event confirms without a duplicate insert', async () => {
  const key = 'booking-key-recovered-event'; const fake = fakes(); const keyDigest = createHash('sha256').update(key, 'utf8').digest('hex');
  const contactDigest = createHash('sha256').update(`${input.name}\u0000${input.phone}\u0000${input.email}`, 'utf8').digest('hex');
  const fingerprint = createHash('sha256').update(JSON.stringify({ serviceId: input.serviceId, start, contactDigest }), 'utf8').digest('hex');
  await fake.calendar.createPrivateEvent({ idempotencyKey: key, start, end, summary: 'Glamour Studio: Makeup', description: 'Customer: Ana' });
  fake.records.set(keyDigest, { fingerprint, state: 'creation_intent', version: 2 });
  const result = await createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now }).book(input, key, context);
  assert.equal(result.status, 'confirmed'); assert.equal(fake.inserts, 1);
});

test('a recovered event-created record preserves its event through notification and confirmation transitions', async () => {
  const key = 'booking-key-recovered-event-created'; const fake = fakes({ productionTransition: true }); const keyDigest = createHash('sha256').update(key, 'utf8').digest('hex');
  const contactDigest = createHash('sha256').update(`${input.name}\u0000${input.phone}\u0000${input.email}`, 'utf8').digest('hex');
  const fingerprint = createHash('sha256').update(JSON.stringify({ serviceId: input.serviceId, start, contactDigest }), 'utf8').digest('hex');
  const { event } = await fake.calendar.createPrivateEvent({ idempotencyKey: key, start, end, summary: 'Glamour Studio: Makeup', description: 'Customer: Ana' });
  fake.records.set(keyDigest, { fingerprint, state: 'event_created', version: 3, eventId: event.id });

  const result = await createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now }).book(input, key, context);
  const record = fake.records.get(keyDigest);
  assert.equal(result.notification, 'requested'); assert.equal(record.state, 'confirmed'); assert.equal(record.eventId, event.id);
  assert.equal(fake.inserts, 1); assert.equal(fake.invites, 1); assert.deepEqual(fake.attendeeEventIds, [event.id]);
});

test('a recovered creation-intent reconciliation failure remains safely unavailable', async () => {
  const key = 'booking-key-recovered-provider-failure'; const fake = fakes(); const keyDigest = createHash('sha256').update(key, 'utf8').digest('hex');
  const contactDigest = createHash('sha256').update(`${input.name}\u0000${input.phone}\u0000${input.email}`, 'utf8').digest('hex');
  const fingerprint = createHash('sha256').update(JSON.stringify({ serviceId: input.serviceId, start, contactDigest }), 'utf8').digest('hex');
  fake.records.set(keyDigest, { fingerprint, state: 'creation_intent', version: 2 });
  fake.calendar.reconcilePrivateEvent = async () => { throw Object.assign(new Error('provider unavailable'), { code: 'GOOGLE_UNAVAILABLE' }); };
  await assert.rejects(createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now }).book(input, key, context), { code: 'CALENDAR_UNAVAILABLE' });
  assert.equal(fake.inserts, 0);
});

test('blocker-list outage and compensation ambiguity stay unknown, preserve the event record, and release leases', async () => {
  const fake = fakes({ staffBlocker: true }); let releases = 0;
  const acquire = fake.ports.lock.acquire;
  fake.ports.lock.acquire = async (request) => { const lease = await acquire(request); const release = lease.release; return { ...lease, async release(candidate) { releases += 1; return release(candidate); } }; };
  let listCalls = 0;
  fake.calendar.listBlockingEvents = async () => { listCalls += 1; if (listCalls === 1) throw new Error('provider outage'); return [{ id: 'staff', start, end }]; };
  fake.calendar.deleteEventForCompensation = async () => { throw new Error('delete ambiguous'); };
  const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now });
  await assert.rejects(service.book(input, 'booking-key-903', context), { code: 'CALENDAR_UNAVAILABLE' });
  await assert.rejects(service.book(input, 'booking-key-903', context), { code: 'BOOKING_UNKNOWN' });
  await assert.rejects(service.book(input, 'booking-key-903', context), { code: 'BOOKING_UNKNOWN' });
  assert.equal(fake.inserts, 1); assert.equal(releases, 3);
});

test('missing email is rejected and notification-pending persistence outages never claim success or send an invite', async () => {
  const noEmail = fakes();
  await assert.rejects(createBookingService({ calendar: noEmail.calendar, ports: noEmail.ports, policy, now }).book({ ...input, email: undefined }, 'booking-key-904', context), { code: 'INVALID_REQUEST' });
  assert.equal(noEmail.inserts, 0);
  const pending = fakes(); const pendingTransition = pending.ports.idempotency.transition;
  pending.ports.idempotency.transition = async (request) => request.state === 'confirmed_notification_pending' ? Promise.reject(new Error('store unavailable')) : pendingTransition(request);
  await assert.rejects(createBookingService({ calendar: pending.calendar, ports: pending.ports, policy, now }).book({ ...input, email: 'ana@example.com' }, 'booking-key-905', context), { code: 'BOOKING_UNKNOWN' });
  assert.equal(pending.invites, 0);
});

test('invitation failures and ambiguity keep the appointment confirmed without replaying the invitation', async () => {
  for (const failure of [new Error('invite failed'), Object.assign(new Error('unknown invite'), { code: 'AMBIGUOUS_MUTATION' })]) {
    const fake = fakes(); fake.calendar.addOrUpdateAttendee = async () => { fake.calendar.invites = (fake.calendar.invites ?? 0) + 1; throw failure; };
    const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now }); const withEmail = { ...input, email: 'ana@example.com' };
    const first = await service.book(withEmail, `booking-key-906-${failure.code ?? 'fail'}`, context); const replay = await service.book(withEmail, `booking-key-906-${failure.code ?? 'fail'}`, context);
    assert.equal(first.notification, 'unknown'); assert.deepEqual(replay, first);
  }
});

test('malformed CAS records and transition results fail closed before Calendar mutation', async (t) => {
  const malformed = [
    { state: 'pending', version: 1, fingerprint: 'a'.repeat(64), outcome: {} },
    { state: 'event_created', version: 2, fingerprint: 'a'.repeat(64) },
    { state: 'confirmed', version: 3, fingerprint: 'a'.repeat(64), eventId: 'event', outcome: { status: 'confirmed', serviceId: 'makeup', start, end, notification: 'bad' } },
    { state: 'conflict', version: 2, fingerprint: 'a'.repeat(64), code: 'SLOT_UNAVAILABLE', extra: true },
  ];
  for (const record of malformed) await t.test(record.state, async () => {
    const fake = fakes(); fake.ports.idempotency.get = async () => record;
    const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now });
    await assert.rejects(service.book(input, `booking-key-cas-${record.state}`, context), { code: 'CALENDAR_UNAVAILABLE' }); assert.equal(fake.inserts, 0);
  });
});

test('confirmed replay is bound to the trusted current service, canonical instants, and email disposition', async (t) => {
  const keyDigest = (key) => createHash('sha256').update(key, 'utf8').digest('hex');
  const cases = [
    ['wrong service', { serviceId: 'hair-styling' }, input],
    ['wrong canonical start', { start: '2026-07-24T04:15:00Z' }, input],
    ['wrong derived end', { end: '2026-07-24T05:00:00Z' }, input],
    ['missing invitation disposition', { notification: 'not_requested' }, input],
  ];
  for (const [name, patch, request] of cases) await t.test(name, async () => {
    const fake = fakes(); const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now }); const key = `booking-key-replay-${name.replaceAll(' ', '-')}`;
    await service.book(request, key, context);
    const record = fake.records.get(keyDigest(key));
    fake.records.set(keyDigest(key), { ...record, outcome: { ...record.outcome, ...patch } });
    await assert.rejects(service.book(request, key, context), { code: 'CALENDAR_UNAVAILABLE' });
    assert.equal(fake.inserts, 1);
  });
});

test('notification-pending replay accepts only its unknown email disposition', async () => {
  const fake = fakes(); const original = fake.ports.idempotency.transition;
  fake.ports.idempotency.transition = async (request) => request.state === 'confirmed' ? Promise.reject(new Error('final write outage')) : original(request);
  const service = createBookingService({ calendar: fake.calendar, ports: fake.ports, policy, now }); const key = 'booking-key-pending-disposition'; const withEmail = { ...input, email: 'ana@example.com' };
  const first = await service.book(withEmail, key, context);
  assert.equal(first.notification, 'unknown');
  const digest = createHash('sha256').update(key, 'utf8').digest('hex'); const record = fake.records.get(digest);
  assert.equal(record.state, 'confirmed_notification_pending');
  fake.records.set(digest, { ...record, outcome: { ...record.outcome, notification: 'requested' } });
  await assert.rejects(service.book(withEmail, key, context), { code: 'CALENDAR_UNAVAILABLE' });
  assert.equal(fake.invites, 1);
});
