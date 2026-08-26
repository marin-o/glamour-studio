import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { Temporal } from '@js-temporal/polyfill';

import { createLocalCoordinationPorts, createLocalCoordinationState } from '../../src/lib/booking/local/coordination.mjs';
import { createBookingManagementService } from '../../src/lib/booking/orchestration/management-service.mjs';

const secret = 'a'.repeat(43);
const digest = createHash('sha256').update(secret, 'utf8').digest('hex');
const marker = `v1:${'b'.repeat(64)}`;
const nowValue = '2027-01-03T08:00:00Z';
const start = '2027-01-10T09:00:00Z';
const end = '2027-01-10T10:15:00Z';
const movedStart = '2027-01-12T09:00:00Z';
const movedEnd = '2027-01-12T10:15:00Z';
const policy = { leadTimeMinutes: 0, bookingHorizonDays: 180, lockTimeoutMs: 100, lockLeaseMs: 60_000, providerOperationBudgetMs: 45_000, leaseSafetyMs: 5_000 };

test('management service persists normalized active and terminal records after authoritative mutations', async () => {
  let clock = Date.parse(nowValue); const ports = createLocalCoordinationPorts({ state: createLocalCoordinationState(), now: () => clock });
  await ports.management.create({ secretDigest: digest, ttlSeconds: 600_000, record: { eventId: 'event12345', serviceId: 'makeup', start, end, workTrack: 'makeup', marker, state: 'active' } });
  const calls = [];
  const calendar = {
    async listBlockingEvents() { return []; },
    async getVerifiedAttendee(input) { calls.push(['attendee', input]); return { email: 'client@example.com', etag: '"v1"' }; },
    async reschedulePrivateEvent(input) { calls.push(['reschedule', input]); return { eventId: input.eventId, start: input.start, end: input.end }; },
    async cancelPrivateEvent(input) { calls.push(['cancel', input]); return { cancelled: true }; },
    async reconcileCancelledPrivateEvent(input) { calls.push(['reconcile-cancel', input]); return { cancelled: true }; },
  };
  const notifications = []; const notifier = { async send(input) { notifications.push(input); return { delivered: true }; } };
  const service = createBookingManagementService({ calendar, ports, policy, notifier, now: () => Temporal.Instant.fromEpochMilliseconds(clock) });
  const context = { subjectDigest: 'c'.repeat(64) };
  const issued = await service.issueAcceptedBooking({ eventId: 'event-confirmation', serviceId: 'makeup', start, end, email: 'confirmed@example.com', marker: 'b'.repeat(64) });
  assert.equal(issued.delivered, true); assert.deepEqual(notifications[0].kind, 'confirmed'); assert.equal(notifications[0].start, start); assert.equal(notifications[0].end, end); assert.equal(notifications[0].eventId, 'event-confirmation'); assert.equal(notifications[0].sequence, 0);
  const moved = await service.reschedule(secret, { start: movedStart }, context);
  assert.equal(moved.start, movedStart);
  let record = await ports.management.get({ secretDigest: digest });
  assert.deepEqual(Object.keys(record).sort(), ['end', 'eventId', 'marker', 'serviceId', 'start', 'state', 'version', 'workTrack']);
  assert.equal(record.state, 'active'); assert.equal(record.start, movedStart); assert.equal(record.end, movedEnd);
  assert.equal(calls.some(([name]) => name === 'reschedule'), true);
  assert.equal(notifications[1].kind, 'rescheduled'); assert.equal(notifications[1].start, movedStart); assert.equal(notifications[1].end, movedEnd); assert.equal(notifications[1].eventId, 'event12345'); assert.equal(notifications[1].sequence > 0, true);
  const cancelled = await service.cancel(secret, context);
  assert.equal(cancelled.status, 'cancelled');
  record = await ports.management.get({ secretDigest: digest });
  assert.deepEqual(Object.keys(record).sort(), ['end', 'eventId', 'marker', 'serviceId', 'start', 'state', 'version', 'workTrack']);
  assert.equal(record.state, 'terminal');
  assert.equal(calls.some(([name]) => name === 'cancel'), true);
});

test('management cutoff accepts the operational grace and is enforced again after acquiring the lease', async () => {
  let clock = Date.parse('2027-01-03T08:00:00Z');
  const ports = createLocalCoordinationPorts({ state: createLocalCoordinationState(), now: () => clock });
  const cancelCalls = []; const rescheduleCalls = [];
  const calendar = { async listBlockingEvents() { return []; }, async getVerifiedAttendee() { return { email: 'client@example.com', etag: '"v1"' }; }, async reschedulePrivateEvent(input) { rescheduleCalls.push(input); }, async cancelPrivateEvent(input) { cancelCalls.push(input); }, async reconcileCancelledPrivateEvent() { return { cancelled: true }; } };
  const service = createBookingManagementService({ calendar, ports, policy, now: () => Temporal.Instant.fromEpochMilliseconds(clock) }); const context = { subjectDigest: 'c'.repeat(64) };
  const createRecord = async (value, suffix) => {
    const currentSecret = String.fromCharCode(97 + suffix).repeat(43); const currentDigest = createHash('sha256').update(currentSecret, 'utf8').digest('hex');
    const currentStart = `2027-01-03T${value}Z`; const currentEnd = `2027-01-03T${value === '20:00:00' ? '21:15:00' : '21:00:00'}Z`;
    await ports.management.create({ secretDigest: currentDigest, ttlSeconds: 600_000, record: { eventId: `event-${suffix}`, serviceId: 'makeup', start: currentStart, end: currentEnd, workTrack: 'makeup', marker, state: 'active' } });
    return currentSecret;
  };
  await service.cancel(await createRecord('20:00:00', 1), context);
  await service.cancel(await createRecord('19:50:00', 2), context);
  await service.cancel(await createRecord('19:45:00', 3), context);
  await assert.rejects(service.cancel(await createRecord('19:44:59', 4), context), { code: 'CANCELLATION_CUTOFF' });
  assert.equal(cancelCalls.length, 3);

  const laterStart = '2027-01-03T19:45:00.500Z'; const laterEnd = '2027-01-03T21:00:00Z'; const laterSecret = 'z'.repeat(43); const laterDigest = createHash('sha256').update(laterSecret, 'utf8').digest('hex');
  await ports.management.create({ secretDigest: laterDigest, ttlSeconds: 600_000, record: { eventId: 'event54321', serviceId: 'makeup', start: laterStart, end: laterEnd, workTrack: 'makeup', marker, state: 'active' } });
  const originalAcquire = ports.lock.acquire; const postLockPorts = { ...ports, lock: { acquire: async (input) => { const lease = await originalAcquire(input); clock = Date.parse('2027-01-03T08:01:00Z'); return lease; }, renew: ports.lock.renew, assertOwnership: ports.lock.assertOwnership } };
  const postLockService = createBookingManagementService({ calendar, ports: postLockPorts, policy: { ...policy, lockLeaseMs: 120_000 }, now: () => Temporal.Instant.fromEpochMilliseconds(clock) });
  clock = Date.parse('2027-01-03T08:00:00Z'); await assert.rejects(postLockService.cancel(laterSecret, context), { code: 'CANCELLATION_CUTOFF' });
  assert.equal(cancelCalls.length, 3); assert.equal(rescheduleCalls.length, 0);
});

test('rescheduling uses the same grace boundary before and after the lease', async () => {
  let clock = Date.parse('2027-01-03T08:00:00Z');
  const ports = createLocalCoordinationPorts({ state: createLocalCoordinationState(), now: () => clock });
  const rescheduleCalls = [];
  const calendar = {
    async listBlockingEvents() { return []; },
    async getVerifiedAttendee() { return { email: 'client@example.com', etag: '"v1"' }; },
    async reschedulePrivateEvent(input) { rescheduleCalls.push(input); },
    async cancelPrivateEvent() {},
    async reconcileCancelledPrivateEvent() { return { cancelled: true }; },
  };
  const service = createBookingManagementService({ calendar, ports, policy, now: () => Temporal.Instant.fromEpochMilliseconds(clock) });
  const context = { subjectDigest: 'e'.repeat(64) };
  const createRecord = async (startValue, suffix) => {
    const currentSecret = String.fromCharCode(102 + suffix).repeat(43); const currentDigest = createHash('sha256').update(currentSecret, 'utf8').digest('hex');
    const currentStart = `2027-01-03T${startValue}Z`; const currentEnd = `2027-01-03T${startValue === '20:00:00' ? '21:15:00' : '21:00:00'}Z`;
    await ports.management.create({ secretDigest: currentDigest, ttlSeconds: 600_000, record: { eventId: `reschedule-event-${suffix}`, serviceId: 'makeup', start: currentStart, end: currentEnd, workTrack: 'makeup', marker, state: 'active' } });
    return currentSecret;
  };

  await service.reschedule(await createRecord('20:00:00', 0), { start: movedStart }, context);
  await service.reschedule(await createRecord('19:50:00', 1), { start: movedStart }, context);
  await service.reschedule(await createRecord('19:45:00', 2), { start: movedStart }, context);
  await assert.rejects(service.reschedule(await createRecord('19:44:59', 3), { start: movedStart }, context), { code: 'RESCHEDULE_CUTOFF' });
  assert.equal(rescheduleCalls.length, 3);

  const crossingSecret = await createRecord('19:45:00.500', 4);
  const originalAcquire = ports.lock.acquire;
  const crossingPorts = { ...ports, lock: { acquire: async (input) => { const lease = await originalAcquire(input); clock = Date.parse('2027-01-03T08:01:00Z'); return lease; }, renew: ports.lock.renew, assertOwnership: ports.lock.assertOwnership } };
  const crossingService = createBookingManagementService({ calendar, ports: crossingPorts, policy: { ...policy, lockLeaseMs: 120_000 }, now: () => Temporal.Instant.fromEpochMilliseconds(clock) });
  clock = Date.parse('2027-01-03T08:00:00Z');
  await assert.rejects(crossingService.reschedule(crossingSecret, { start: movedStart }, context), { code: 'RESCHEDULE_CUTOFF' });
  assert.equal(rescheduleCalls.length, 3);
});

test('a cancellation persistence interruption is reconciled without exposing details or repeating the Calendar cancellation', async () => {
  let clock = Date.parse(nowValue); const ports = createLocalCoordinationPorts({ state: createLocalCoordinationState(), now: () => clock });
  await ports.management.create({ secretDigest: digest, ttlSeconds: 600_000, record: { eventId: 'event12345', serviceId: 'makeup', start, end, workTrack: 'makeup', marker, state: 'active' } });
  let failTerminalTransition = true; const transition = ports.management.transition;
  const interruptedPorts = { ...ports, management: { ...ports.management, async transition(input) { if (failTerminalTransition && input.expectedState === 'mutation_intent' && input.state === 'terminal') { failTerminalTransition = false; throw new Error('persistence interrupted'); } return transition(input); } } };
  const calls = []; const calendar = {
    async listBlockingEvents() { return []; },
    async getVerifiedAttendee() { return { email: 'client@example.com', etag: '"v1"' }; },
    async reschedulePrivateEvent() {},
    async cancelPrivateEvent(input) { calls.push(['cancel', input]); return { cancelled: true }; },
    async reconcileCancelledPrivateEvent(input) { calls.push(['reconcile', input]); return { cancelled: true }; },
  };
  const notifications = []; const notifier = { async send(input) { notifications.push(input); return { delivered: true }; } };
  const service = createBookingManagementService({ calendar, ports: interruptedPorts, policy, notifier, now: () => Temporal.Instant.fromEpochMilliseconds(clock) }); const context = { subjectDigest: 'c'.repeat(64) };
  await assert.rejects(service.cancel(secret, context), { code: 'BOOKING_UNKNOWN' });
  assert.equal((await ports.management.get({ secretDigest: digest })).state, 'mutation_intent');
  await assert.rejects(service.read(secret, context), { code: 'MANAGEMENT_UNAVAILABLE' });
  assert.equal((await ports.management.get({ secretDigest: digest })).state, 'terminal');
  await assert.rejects(service.cancel(secret, context), { code: 'MANAGEMENT_UNAVAILABLE' });
  assert.deepEqual(calls.map(([name]) => name), ['cancel', 'reconcile']);
  // Recovery has only digest-bound event state, not a trusted attendee, so it
  // deliberately terminalizes without inventing or recovering a mail target.
  assert.deepEqual(notifications, []);
});

test('cancellation reconciliation never terminalizes after its lease is lost', async () => {
  let clock = Date.parse(nowValue); const ports = createLocalCoordinationPorts({ state: createLocalCoordinationState(), now: () => clock });
  await ports.management.create({ secretDigest: digest, ttlSeconds: 600_000, record: { eventId: 'event12345', serviceId: 'makeup', start, end, workTrack: 'makeup', marker, state: 'mutation_intent', operation: 'cancel' } });
  let terminalTransitions = 0; const transition = ports.management.transition;
  const lostLeasePorts = { ...ports, management: { ...ports.management, async transition(input) { if (input.expectedState === 'mutation_intent' && input.state === 'terminal') terminalTransitions += 1; return transition(input); } } };
  const calendar = {
    async listBlockingEvents() { return []; },
    async getVerifiedAttendee() { throw new Error('not used'); },
    async reschedulePrivateEvent() { throw new Error('not used'); },
    async cancelPrivateEvent() { throw new Error('must not repeat cancellation'); },
    async reconcileCancelledPrivateEvent() { clock += policy.lockLeaseMs; return { cancelled: true }; },
  };
  const service = createBookingManagementService({ calendar, ports: lostLeasePorts, policy, now: () => Temporal.Instant.fromEpochMilliseconds(clock) });
  await assert.rejects(service.read(secret, { subjectDigest: 'c'.repeat(64) }), { code: 'BOOKING_UNKNOWN' });
  assert.equal(terminalTransitions, 0);
  assert.equal((await ports.management.get({ secretDigest: digest })).state, 'mutation_intent');
});

test('an active or uncertain cancellation reconciliation stays fail-closed', async () => {
  let clock = Date.parse(nowValue); const ports = createLocalCoordinationPorts({ state: createLocalCoordinationState(), now: () => clock });
  await ports.management.create({ secretDigest: digest, ttlSeconds: 600_000, record: { eventId: 'event12345', serviceId: 'makeup', start, end, workTrack: 'makeup', marker, state: 'mutation_intent', operation: 'cancel' } });
  let reconciliationAttempts = 0; const calls = []; const calendar = {
    async listBlockingEvents() { return []; },
    async getVerifiedAttendee() { throw new Error('not used'); },
    async reschedulePrivateEvent() { throw new Error('not used'); },
    async cancelPrivateEvent() { calls.push('cancel'); throw new Error('must not repeat cancellation'); },
    async reconcileCancelledPrivateEvent() { calls.push('reconcile'); reconciliationAttempts += 1; if (reconciliationAttempts === 1) return { cancelled: false }; throw new Error('provider state uncertain'); },
  };
  const service = createBookingManagementService({ calendar, ports, policy, now: () => Temporal.Instant.fromEpochMilliseconds(clock) }); const context = { subjectDigest: 'c'.repeat(64) };
  await assert.rejects(service.read(secret, context), { code: 'BOOKING_UNKNOWN' });
  await assert.rejects(service.read(secret, context), { code: 'BOOKING_UNKNOWN' });
  assert.equal((await ports.management.get({ secretDigest: digest })).state, 'mutation_intent');
  await assert.rejects(service.cancel(secret, context), { code: 'BOOKING_UNKNOWN' });
  assert.deepEqual(calls, ['reconcile', 'reconcile']);
});
