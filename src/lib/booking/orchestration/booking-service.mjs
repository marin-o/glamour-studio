import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import { Temporal } from '@js-temporal/polyfill';
import { getAvailableStarts } from '../availability.mjs';
import { getService } from '../services.mjs';
import { getWorkingWindow, STUDIO_TIME_ZONE } from '../studio-rules.mjs';
import { BookingError, asBookingError } from './errors.mjs';
import { assertCoordinationPorts, assertLease, assertState } from './ports.mjs';

const digest = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const CONTROL = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u;
const instant = (value) => { try { return Temporal.Instant.from(value); } catch { throw new BookingError('INVALID_REQUEST', 400); } };
const overlaps = (a, b, c, d) => Temporal.Instant.compare(a, d) < 0 && Temporal.Instant.compare(b, c) > 0;

function validText(value, min, max) { return typeof value === 'string' && value === value.trim() && value.length >= min && value.length <= max && !CONTROL.test(value); }
function validatePolicy(policy) {
  if (!policy || !Number.isInteger(policy.leadTimeMinutes) || policy.leadTimeMinutes < 0 || !Number.isInteger(policy.bookingHorizonDays) || policy.bookingHorizonDays < 0 || !Number.isInteger(policy.idempotencyTtlSeconds) || policy.idempotencyTtlSeconds < 60 || policy.idempotencyTtlSeconds > 2_592_000 || !Number.isInteger(policy.lockTimeoutMs) || policy.lockTimeoutMs < 1 || policy.lockTimeoutMs > 30_000 || !Number.isInteger(policy.lockLeaseMs) || policy.lockLeaseMs < 1_000 || policy.lockLeaseMs > 120_000 || !Number.isInteger(policy.providerOperationBudgetMs) || policy.providerOperationBudgetMs < 1_000 || policy.providerOperationBudgetMs > 120_000 || !Number.isInteger(policy.leaseSafetyMs) || policy.leaseSafetyMs < 100 || policy.leaseSafetyMs > 30_000 || policy.lockLeaseMs <= policy.providerOperationBudgetMs + policy.leaseSafetyMs) throw new BookingError('BOOKING_NOT_CONFIGURED', 503);
  return policy;
}
function validateContact(input) {
  if (!input || Object.getPrototypeOf(input) !== Object.prototype || Object.keys(input).some((key) => !['serviceId', 'start', 'name', 'phone', 'email'].includes(key)) || !validText(input.name, 1, 80) || !validText(input.phone, 3, 40) || !validText(input.email, 3, 160) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(input.email)) throw new BookingError('INVALID_REQUEST', 400);
}
function publicOutcome(service, start, end, notification = 'unknown') { return Object.freeze({ status: 'confirmed', serviceId: service.id, start: start.toString(), end: end.toString(), notification }); }
function replay(record, expectedOutcome) {
  if (record.state === 'confirmed' || record.state === 'confirmed_notification_pending') {
    const outcome = record.outcome;
    if (!expectedOutcome || outcome.serviceId !== expectedOutcome.serviceId || outcome.start !== expectedOutcome.start || outcome.end !== expectedOutcome.end
      || (record.state === 'confirmed_notification_pending' ? outcome.notification !== 'unknown' : !['requested', 'unknown'].includes(outcome.notification))) throw new TypeError('Idempotency provider returned an incompatible replay outcome.');
    return outcome;
  }
  if (record.state === 'conflict') throw new BookingError(record.code, 409);
  if (record.state === 'manual_review') throw new BookingError('BOOKING_UNKNOWN', 503);
  return null;
}
function validRate(rate) {
  if (!rate || typeof rate.allowed !== 'boolean' || (rate.retryAfter !== undefined && (!Number.isInteger(rate.retryAfter) || rate.retryAfter < 1 || rate.retryAfter > 300))) throw new BookingError('BOOKING_UNAVAILABLE', 503);
  return rate;
}
function providerInstant(value) { try { return instant(value); } catch { throw new BookingError('CALENDAR_UNAVAILABLE', 503); } }

export function createBookingService({ calendar, ports, policy, now = () => Temporal.Now.instant() }) {
  if (!calendar || typeof calendar.getBusyIntervals !== 'function' || typeof calendar.createPrivateEvent !== 'function' || typeof calendar.listBlockingEvents !== 'function' || typeof calendar.deleteEventForCompensation !== 'function' || typeof calendar.addOrUpdateAttendee !== 'function') throw new TypeError('Calendar provider is required.');
  assertCoordinationPorts(ports); validatePolicy(policy);
  const transition = async (keyDigest, record, state, patch = {}) => {
    const next = assertState(await ports.idempotency.transition({ keyDigest, expectedVersion: record.version, expectedState: record.state, state, ttlSeconds: policy.idempotencyTtlSeconds, ...patch }));
    if (next.state !== state || next.version !== record.version + 1 || next.fingerprint !== record.fingerprint || (patch.eventId !== undefined && next.eventId !== patch.eventId) || (patch.code !== undefined && next.code !== patch.code) || (patch.outcome !== undefined && JSON.stringify(next.outcome) !== JSON.stringify(patch.outcome))) throw new TypeError('Idempotency provider returned an invalid transition.');
    return next;
  };
  const protectOperation = async (lease) => {
    const renewed = assertLease(await ports.lock.renew({ scope: 'studio-booking', owner: lease.owner, fencingToken: lease.fencingToken, leaseMs: policy.lockLeaseMs, minimumRemainingMs: policy.providerOperationBudgetMs + policy.leaseSafetyMs }));
    if (renewed.owner !== lease.owner || renewed.fencingToken !== lease.fencingToken || renewed.expiresAt - Date.now() <= policy.providerOperationBudgetMs + policy.leaseSafetyMs) throw new BookingError('BOOKING_UNAVAILABLE', 503);
    await ports.lock.assertOwnership({ scope: 'studio-booking', owner: lease.owner, fencingToken: lease.fencingToken, minimumRemainingMs: policy.providerOperationBudgetMs + policy.leaseSafetyMs });
  };
  async function availability({ serviceId, date }, requestContext) {
    let service; let window;
    try { service = getService(serviceId); window = getWorkingWindow(date); } catch { throw new BookingError('INVALID_REQUEST', 400); }
    if (!requestContext || !validText(requestContext.subjectDigest, 32, 128)) throw new BookingError('BOOKING_NOT_CONFIGURED', 503);
    const rate = validRate(await ports.rateLimit.check({ action: 'availability', subjectDigest: requestContext.subjectDigest, serviceId: service.id, date }));
    if (!rate.allowed) throw new BookingError('RATE_LIMITED', 429, { retryAfter: rate.retryAfter });
    try { const busy = await calendar.getBusyIntervals({ timeMin: window.opening, timeMax: window.closing }); return { serviceId: service.id, date, starts: getAvailableStarts({ serviceId: service.id, date, busyIntervals: busy, constraints: { now: Temporal.Instant.from(now()).toString(), leadTimeMinutes: policy.leadTimeMinutes, bookingHorizonDays: policy.bookingHorizonDays } }) }; } catch (error) { throw error instanceof BookingError ? error : asBookingError(error); }
  }
  async function book(input, idempotencyKey, requestContext) {
    validateContact(input);
    if (!validText(idempotencyKey, 8, 512)) throw new BookingError('INVALID_IDEMPOTENCY_KEY', 400);
    if (!requestContext || !validText(requestContext.subjectDigest, 32, 128)) throw new BookingError('BOOKING_NOT_CONFIGURED', 503);
    let service; try { service = getService(input.serviceId); } catch { throw new BookingError('INVALID_REQUEST', 400); }
    const start = instant(input.start); const end = start.add({ minutes: service.durationMinutes }); const date = start.toZonedDateTimeISO(STUDIO_TIME_ZONE).toPlainDate().toString();
    try { if (!getAvailableStarts({ serviceId: service.id, date, busyIntervals: [], constraints: { now: Temporal.Instant.from(now()).toString(), leadTimeMinutes: policy.leadTimeMinutes, bookingHorizonDays: policy.bookingHorizonDays } }).includes(start.toString())) throw new BookingError('SLOT_UNAVAILABLE', 409); } catch (error) { throw error instanceof BookingError ? error : new BookingError('INVALID_REQUEST', 400); }
    const contactDigest = digest(`${input.name}\u0000${input.phone}\u0000${input.email}`); const rate = validRate(await ports.rateLimit.check({ action: 'booking', subjectDigest: requestContext.subjectDigest, contactDigest }));
    if (!rate.allowed) throw new BookingError('RATE_LIMITED', 429, { retryAfter: rate.retryAfter });
    let lease;
    try {
      lease = assertLease(await ports.lock.acquire({ scope: 'studio-booking', owner: randomUUID(), timeoutMs: policy.lockTimeoutMs, leaseMs: policy.lockLeaseMs }));
    } catch { throw new BookingError('BOOKING_UNAVAILABLE', 503); }
    const keyDigest = digest(idempotencyKey); const fingerprint = digest(JSON.stringify({ serviceId: service.id, start: start.toString(), contactDigest }));
    const expected = { idempotencyKey, start: start.toString(), end: end.toString(), summary: `Glamour Studio: ${service.name}`, description: `Customer: ${input.name}` };
    const replayExpected = { serviceId: service.id, start: expected.start, end: expected.end };
    try {
      await ports.lock.assertOwnership({ scope: 'studio-booking', owner: lease.owner, fencingToken: lease.fencingToken });
      let record = await ports.idempotency.get({ keyDigest });
      if (record) { record = assertState(record); if (record.fingerprint !== fingerprint) throw new BookingError('IDEMPOTENCY_MISMATCH', 409); const prior = replay(record, replayExpected); if (prior) return prior; }
      else { record = assertState(await ports.idempotency.create({ keyDigest, fingerprint, state: 'pending', ttlSeconds: policy.idempotencyTtlSeconds })); if (record.fingerprint !== fingerprint) throw new BookingError('IDEMPOTENCY_MISMATCH', 409); const prior = replay(record, replayExpected); if (prior) return prior; }
      if (record.state === 'pending') {
        await protectOperation(lease); const busy = await calendar.getBusyIntervals({ timeMin: start.toString(), timeMax: end.toString() });
        if (!Array.isArray(busy) || busy.some((entry) => !entry || typeof entry.start !== 'string' || typeof entry.end !== 'string')) throw new BookingError('CALENDAR_UNAVAILABLE', 503);
        if (busy.some((entry) => overlaps(start, end, providerInstant(entry.start), providerInstant(entry.end)))) {
          try { await transition(keyDigest, record, 'conflict', { code: 'SLOT_UNAVAILABLE' }); } catch { throw new BookingError('BOOKING_UNKNOWN', 503); }
          throw new BookingError('SLOT_UNAVAILABLE', 409);
        }
        try { record = await transition(keyDigest, record, 'creation_intent'); } catch { throw new BookingError('BOOKING_UNKNOWN', 503); }
      }
      // Creation intent is persisted before the irreversible deterministic insert. A retry
      // may safely reissue it: the Calendar adapter verifies the deterministic ID.
      if (record.state === 'creation_intent') {
        await protectOperation(lease);
        try { const created = await calendar.createPrivateEvent(expected); record = await transition(keyDigest, record, 'event_created', { eventId: created.event.id }); }
        catch (error) { throw asBookingError(error); }
      }
      await protectOperation(lease);
      const blockers = await calendar.listBlockingEvents({ timeMin: start.toString(), timeMax: end.toString() });
      if (!Array.isArray(blockers) || blockers.some((entry) => !entry || typeof entry.id !== 'string' || typeof entry.start !== 'string' || typeof entry.end !== 'string')) throw new BookingError('CALENDAR_UNAVAILABLE', 503);
      if (blockers.some((entry) => entry.id !== record.eventId && overlaps(start, end, providerInstant(entry.start), providerInstant(entry.end)))) {
        try { await protectOperation(lease); const compensation = await calendar.deleteEventForCompensation(record.eventId); if (!compensation || compensation.deleted !== true) throw new Error(); record = await transition(keyDigest, record, 'conflict', { code: 'SLOT_UNAVAILABLE' }); }
        catch { try { await transition(keyDigest, record, 'manual_review', { eventId: record.eventId, code: 'COMPENSATION_UNKNOWN' }); } catch {} throw new BookingError('BOOKING_UNKNOWN', 503); }
        throw new BookingError('SLOT_UNAVAILABLE', 409);
      }
      const base = publicOutcome(service, start, end, 'unknown');
      if (record.state === 'event_created') { try { record = await transition(keyDigest, record, 'confirmed_notification_pending', { outcome: base }); } catch { throw new BookingError('BOOKING_UNKNOWN', 503); } }
      // The persisted pending-notification state is itself the replayable safe outcome; never resend it.
      if (record.state === 'confirmed_notification_pending') {
        try { await protectOperation(lease); await calendar.addOrUpdateAttendee({ eventId: record.eventId, email: input.email, displayName: input.name }); const confirmed = publicOutcome(service, start, end, 'requested'); try { return (await transition(keyDigest, record, 'confirmed', { outcome: confirmed })).outcome; } catch { return base; } }
        catch { try { return (await transition(keyDigest, record, 'confirmed', { outcome: base })).outcome; } catch { return base; } }
      }
      return replay(record, replayExpected);
    } catch (error) { throw error instanceof BookingError ? error : asBookingError(error); }
    finally { try { if (lease) await lease.release({ scope: 'studio-booking', owner: lease.owner, fencingToken: lease.fencingToken }); } catch {} }
  }
  return Object.freeze({ availability, book });
}
