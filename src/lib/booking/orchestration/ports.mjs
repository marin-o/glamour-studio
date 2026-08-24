import 'server-only';

/**
 * Production adapters must implement these operations atomically in their
 * durable backend.  They are deliberately contracts, not fallbacks: process
 * memory is not safe for a serverless booking endpoint.
 */
export const IDEMPOTENCY_STATES = Object.freeze([
  'pending', 'creation_intent', 'event_created', 'confirmed_notification_pending',
  'confirmed', 'conflict', 'manual_review',
]);

function isObject(value) { return value !== null && typeof value === 'object'; }

export function assertCoordinationPorts(ports) {
  if (!isObject(ports) || !isObject(ports.lock) || !isObject(ports.idempotency) || !isObject(ports.rateLimit)
    || typeof ports.lock.acquire !== 'function' || typeof ports.lock.renew !== 'function' || typeof ports.lock.assertOwnership !== 'function'
    || typeof ports.idempotency.get !== 'function' || typeof ports.idempotency.create !== 'function'
    || typeof ports.idempotency.transition !== 'function' || typeof ports.rateLimit.check !== 'function') {
    throw new TypeError('Durable booking coordination providers are required.');
  }
}

export function assertLease(lease) {
  if (!isObject(lease) || typeof lease.owner !== 'string' || !lease.owner || typeof lease.fencingToken !== 'string'
    || !lease.fencingToken || !Number.isInteger(lease.expiresAt) || lease.expiresAt <= Date.now() || typeof lease.release !== 'function') {
    throw new TypeError('Lock provider returned an invalid lease.');
  }
  return lease;
}

export function assertState(record) {
  if (!isObject(record) || Object.getPrototypeOf(record) !== Object.prototype || typeof record.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(record.fingerprint) || !IDEMPOTENCY_STATES.includes(record.state)
    || !Number.isInteger(record.version) || record.version < 1 || Object.keys(record).some((key) => !['fingerprint', 'state', 'version', 'eventId', 'code', 'outcome', 'management'].includes(key))) throw new TypeError('Idempotency provider returned invalid state.');
  const keys = Object.keys(record).sort();
  const exactKeys = (expected) => keys.length === expected.length && keys.every((key, index) => key === expected[index]);
  if ((record.state === 'pending' || record.state === 'creation_intent') && !exactKeys(['fingerprint', 'state', 'version'])) throw new TypeError('Idempotency provider returned invalid state.');
  if (record.state === 'event_created' && (!exactKeys(['eventId', 'fingerprint', 'state', 'version']) || typeof record.eventId !== 'string' || !record.eventId)) throw new TypeError('Idempotency provider returned invalid state.');
  const confirmedKeys = record.management === undefined ? ['eventId', 'fingerprint', 'outcome', 'state', 'version'] : ['eventId', 'fingerprint', 'management', 'outcome', 'state', 'version'];
  if (['confirmed_notification_pending', 'confirmed'].includes(record.state) && (!exactKeys(confirmedKeys) || typeof record.eventId !== 'string' || !record.eventId)) throw new TypeError('Idempotency provider returned invalid state.');
  if (record.state === 'conflict' && (!exactKeys(['code', 'fingerprint', 'state', 'version']) && !(exactKeys(['code', 'eventId', 'fingerprint', 'state', 'version']) && typeof record.eventId === 'string' && record.eventId))) throw new TypeError('Idempotency provider returned invalid state.');
  if (record.state === 'manual_review' && (!exactKeys(['code', 'eventId', 'fingerprint', 'state', 'version']) || typeof record.eventId !== 'string' || !record.eventId)) throw new TypeError('Idempotency provider returned invalid state.');
  if (['confirmed', 'confirmed_notification_pending'].includes(record.state) && (!isObject(record.outcome) || Object.getPrototypeOf(record.outcome) !== Object.prototype || Object.keys(record.outcome).length !== 5 || record.outcome.status !== 'confirmed' || typeof record.outcome.serviceId !== 'string' || typeof record.outcome.start !== 'string' || typeof record.outcome.end !== 'string' || !['requested', 'unknown'].includes(record.outcome.notification))) throw new TypeError('Idempotency provider returned invalid state.');
  if (record.management !== undefined && (!isObject(record.management) || Object.getPrototypeOf(record.management) !== Object.prototype || Object.keys(record.management).some((key) => !['digest', 'status', 'attempts'].includes(key)) || !['pending', 'delivered'].includes(record.management.status) || !Number.isInteger(record.management.attempts) || record.management.attempts < 0 || record.management.attempts > 2 || (record.management.digest !== undefined && (typeof record.management.digest !== 'string' || !/^[a-f0-9]{64}$/.test(record.management.digest))) || (record.management.status === 'delivered' && !/^[a-f0-9]{64}$/.test(record.management.digest ?? '')))) throw new TypeError('Idempotency provider returned invalid state.');
  if (record.state === 'conflict' && record.code !== 'SLOT_UNAVAILABLE') throw new TypeError('Idempotency provider returned invalid state.');
  if (record.state === 'manual_review' && record.code !== 'COMPENSATION_UNKNOWN') throw new TypeError('Idempotency provider returned invalid state.');
  return record;
}
