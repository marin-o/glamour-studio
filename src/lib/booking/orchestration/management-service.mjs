import 'server-only';

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Temporal } from '@js-temporal/polyfill';
import { getAvailableStarts } from '../availability.mjs';
import { getService, getServiceOccupancyMinutes, getServiceWorkTrack } from '../services.mjs';
import { getWorkingWindow, STUDIO_TIME_ZONE } from '../studio-rules.mjs';
import { BookingError, asBookingError } from './errors.mjs';
import { assertLease } from './ports.mjs';

const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
export const MANAGEMENT_MAX_TTL_SECONDS = 63_158_400;
const secretDigest = (secret) => sha256(secret);
const validSecret = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
const parseInstant = (value) => { try { return Temporal.Instant.from(value); } catch { throw new BookingError('INVALID_REQUEST', 400); } };
export const MANAGEMENT_ADVERTISED_CUTOFF_HOURS = 12;
export const MANAGEMENT_OPERATIONAL_GRACE_MINUTES = 15;
const MANAGEMENT_EFFECTIVE_CUTOFF_MINUTES = MANAGEMENT_ADVERTISED_CUTOFF_HOURS * 60 - MANAGEMENT_OPERATIONAL_GRACE_MINUTES;
const canManageOnline = (record, current) => Temporal.Instant.compare(Temporal.Instant.from(current), parseInstant(record.start).subtract({ minutes: MANAGEMENT_EFFECTIVE_CUTOFF_MINUTES })) <= 0;
const publicRecord = (record, now) => Object.freeze({ serviceId: record.serviceId, start: record.start, end: record.end, status: record.state === 'terminal' ? 'cancelled' : 'confirmed', canReschedule: record.state === 'active' && canManageOnline(record, now()) });

function assertPorts(ports) {
  if (!ports?.management || typeof ports.management.get !== 'function' || typeof ports.management.create !== 'function' || typeof ports.management.transition !== 'function') throw new TypeError('Management coordination is required.');
}
function ttl(end, now) { const seconds = Math.ceil((parseInstant(end).epochMilliseconds - Temporal.Instant.from(now()).epochMilliseconds) / 1000); if (!Number.isInteger(seconds) || seconds < 1 || seconds > MANAGEMENT_MAX_TTL_SECONDS) throw new BookingError('BOOKING_UNAVAILABLE', 503); return seconds; }

export function createBookingManagementService({ calendar, ports, policy, notifier, now = () => Temporal.Now.instant() } = {}) {
  assertPorts(ports);
  if (!calendar || typeof calendar.listBlockingEvents !== 'function' || typeof calendar.reschedulePrivateEvent !== 'function' || typeof calendar.cancelPrivateEvent !== 'function' || typeof calendar.getVerifiedAttendee !== 'function') throw new TypeError('Management calendar is required.');
  const protect = async (lease) => {
    const renewed = assertLease(await ports.lock.renew({ scope: 'studio-booking', owner: lease.owner, fencingToken: lease.fencingToken, leaseMs: policy.lockLeaseMs, minimumRemainingMs: policy.providerOperationBudgetMs + policy.leaseSafetyMs }));
    await ports.lock.assertOwnership({ scope: 'studio-booking', owner: renewed.owner, fencingToken: renewed.fencingToken, minimumRemainingMs: policy.providerOperationBudgetMs + policy.leaseSafetyMs });
  };
  const unknown = () => { throw new BookingError('BOOKING_UNKNOWN', 503); };
  const authenticated = async (secret) => {
    if (!validSecret(secret)) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404);
    let record; try { record = await ports.management.get({ secretDigest: secretDigest(secret) }); } catch { throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); }
    // A terminal capability is deliberately indistinguishable from an unknown
    // one.  In particular, a repeated DELETE must never disclose that a
    // cancellation already succeeded.
    if (!record || record.state === 'terminal' || parseInstant(record.end).epochMilliseconds <= Temporal.Instant.from(now()).epochMilliseconds) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404);
    return record;
  };
  const transition = async (digest, record, state, patch = {}) => {
    const authoritativeEnd = patch.end ?? record.end;
    try { return await ports.management.transition({ secretDigest: digest, expectedVersion: record.version, expectedState: record.state, state, ttlSeconds: ttl(authoritativeEnd, now), ...patch }); } catch { unknown(); }
  };
  async function issueAcceptedBooking({ eventId, serviceId, start, end, email, marker, revokeDigest }) {
    if (revokeDigest) {
      try {
        const previous = await ports.management.get({ secretDigest: revokeDigest });
        if (previous?.state === 'active') await ports.management.transition({ secretDigest: revokeDigest, expectedVersion: previous.version, expectedState: 'active', state: 'terminal', ttlSeconds: ttl(previous.end, now) });
      } catch { return Object.freeze({ issued: false, delivered: false }); }
    }
    const secret = randomBytes(32).toString('base64url'); const digest = secretDigest(secret);
    const record = { eventId, serviceId, start, end, workTrack: getServiceWorkTrack(serviceId), ...(typeof marker === 'string' ? { marker: `v1:${marker}` } : {}), state: 'active' };
    try { await ports.management.create({ secretDigest: digest, record, ttlSeconds: ttl(end, now) }); }
    catch { return Object.freeze({ issued: false, delivered: false }); }
    let delivered = false;
    if (notifier && email) {
      try { delivered = Boolean((await notifier.send({ to: email, kind: 'confirmed', serviceId, start, end, eventId, sequence: 0, manageUrl: `https://glamourstudio.mk/booking/manage#${secret}`, idempotencyKey: `confirm-${digest}` }))?.delivered); } catch { /* notification is non-authoritative */ }
    }
    return Object.freeze({ issued: true, delivered, digest });
  }
  async function read(secret, context) {
    const rate = await ports.rateLimit.check({ action: 'management_read', subjectDigest: context.subjectDigest });
    const record = await authenticated(secret);
    if (!rate.allowed) throw new BookingError('RATE_LIMITED', 429, { retryAfter: rate.retryAfter });
    return publicRecord(record, now);
  }
  async function availability(secret, date, context) {
    const rate = await ports.rateLimit.check({ action: 'management_availability', subjectDigest: context.subjectDigest });
    const record = await authenticated(secret);
    if (!rate.allowed) throw new BookingError('RATE_LIMITED', 429, { retryAfter: rate.retryAfter });
    if (record.state !== 'active' || !publicRecord(record, now).canReschedule) throw new BookingError('RESCHEDULE_CUTOFF', 409);
    let window; try { window = getWorkingWindow(date); } catch { throw new BookingError('INVALID_REQUEST', 400); }
    const busy = await calendar.listBlockingEvents({ timeMin: window.opening, timeMax: window.closing });
    const starts = getAvailableStarts({ serviceId: record.serviceId, date, busyIntervals: busy.filter((entry) => entry.id !== record.eventId), constraints: { now: Temporal.Instant.from(now()).toString(), leadTimeMinutes: policy.leadTimeMinutes, bookingHorizonDays: policy.bookingHorizonDays } });
    return Object.freeze({ serviceId: record.serviceId, date, starts });
  }
  async function mutate(secret, input, context, kind) {
    const digest = secretDigest(secret);
    const action = kind === 'cancel' ? 'management_cancel' : 'management_reschedule'; const rate = await ports.rateLimit.check({ action, subjectDigest: context.subjectDigest });
    if (!rate.allowed) throw new BookingError('RATE_LIMITED', 429, { retryAfter: rate.retryAfter });
    let record = await authenticated(secret);
    if (record.state !== 'active') unknown();
    const current = Temporal.Instant.from(now());
    if (!canManageOnline(record, current)) throw new BookingError(kind === 'cancel' ? 'CANCELLATION_CUTOFF' : 'RESCHEDULE_CUTOFF', 409);
    let nextStart; let nextEnd;
    if (kind === 'reschedule') {
      nextStart = parseInstant(input.start); nextEnd = nextStart.add({ minutes: getServiceOccupancyMinutes(record.serviceId) });
      const date = nextStart.toZonedDateTimeISO(STUDIO_TIME_ZONE).toPlainDate().toString();
      const window = getWorkingWindow(date); const busy = await calendar.listBlockingEvents({ timeMin: window.opening, timeMax: window.closing });
      const available = getAvailableStarts({ serviceId: record.serviceId, date, busyIntervals: busy.filter((entry) => entry.id !== record.eventId), constraints: { now: current.toString(), leadTimeMinutes: policy.leadTimeMinutes, bookingHorizonDays: policy.bookingHorizonDays } });
      if (!available.includes(nextStart.toString())) throw new BookingError('SLOT_UNAVAILABLE', 409);
    }
    let lease; try { lease = assertLease(await ports.lock.acquire({ scope: 'studio-booking', owner: randomUUID(), timeoutMs: policy.lockTimeoutMs, leaseMs: policy.lockLeaseMs })); } catch { throw new BookingError('BOOKING_UNAVAILABLE', 503); }
    try {
      await protect(lease); record = await authenticated(secret);
      if (record.state !== 'active') unknown();
      // Waiting for the lease is meaningful time.  Re-evaluate policy before
      // any attendee read, intent write, or provider mutation.
      const lockedNow = Temporal.Instant.from(now());
      if (!canManageOnline(record, lockedNow)) throw new BookingError(kind === 'cancel' ? 'CANCELLATION_CUTOFF' : 'RESCHEDULE_CUTOFF', 409);
      if (kind === 'reschedule') {
        const date = nextStart.toZonedDateTimeISO(STUDIO_TIME_ZONE).toPlainDate().toString(); const window = getWorkingWindow(date);
        const busy = await calendar.listBlockingEvents({ timeMin: window.opening, timeMax: window.closing });
        const available = getAvailableStarts({ serviceId: record.serviceId, date, busyIntervals: busy.filter((entry) => entry.id !== record.eventId), constraints: { now: Temporal.Instant.from(now()).toString(), leadTimeMinutes: policy.leadTimeMinutes, bookingHorizonDays: policy.bookingHorizonDays } });
        if (!available.includes(nextStart.toString())) throw new BookingError('SLOT_UNAVAILABLE', 409);
      }
      // Fetch the exact managed event before the irreversible intent.  The
      // adapter validates identity, times, marker, work-track and one
      // unambiguous customer attendee, and carries its ETag to mutation.
      const verified = await calendar.getVerifiedAttendee({ eventId: record.eventId, start: record.start, end: record.end, workTrack: record.workTrack, marker: record.marker });
      const attendee = typeof verified === 'string' ? verified : verified?.email;
      const etag = typeof verified === 'string' ? undefined : verified?.etag;
      if (!attendee) unknown();
      const intent = await transition(digest, record, 'mutation_intent', kind === 'reschedule' ? { operation: kind, targetStart: nextStart.toString(), targetEnd: nextEnd.toString() } : { operation: kind });
      if (kind === 'reschedule') await calendar.reschedulePrivateEvent({ eventId: intent.eventId, serviceId: intent.serviceId, workTrack: intent.workTrack, marker: intent.marker, previousStart: intent.start, previousEnd: intent.end, attendee, etag, start: intent.targetStart, end: intent.targetEnd });
      else await calendar.cancelPrivateEvent({ eventId: intent.eventId, start: intent.start, end: intent.end, workTrack: intent.workTrack, marker: intent.marker, attendee, etag });
      const final = await transition(digest, intent, kind === 'reschedule' ? 'active' : 'terminal', kind === 'reschedule' ? { start: intent.targetStart, end: intent.targetEnd } : {});
      if (notifier) {
        try { if (attendee) await notifier.send({ to: attendee, kind: kind === 'reschedule' ? 'rescheduled' : 'cancelled', serviceId: final.serviceId, start: final.start, ...(kind === 'reschedule' ? { end: final.end, eventId: final.eventId, sequence: final.version } : {}), idempotencyKey: `${kind}-${digest}-${final.version}` }); } catch { /* authoritative mutation remains successful */ }
      }
      return publicRecord(final, now);
    } catch (error) { throw error instanceof BookingError ? error : asBookingError(error); }
    finally { try { await lease?.release({ scope: 'studio-booking', owner: lease.owner, fencingToken: lease.fencingToken }); } catch {} }
  }
  return Object.freeze({ issueAcceptedBooking, read, availability, reschedule: (secret, input, context) => mutate(secret, input, context, 'reschedule'), cancel: (secret, context) => mutate(secret, {}, context, 'cancel') });
}
