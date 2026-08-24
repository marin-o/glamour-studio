import 'server-only';

import { Temporal } from '@js-temporal/polyfill';
import { assertState } from '../orchestration/ports.mjs';

const LOCAL_STATE = Symbol.for('glamour-studio.booking.local-coordination.v1');
const DIGEST = /^[a-f0-9]{64}$/;
const DEFAULT_RATE_POLICY = Object.freeze({
  availability: Object.freeze({ limit: 120, windowMs: 60_000 }),
  booking: Object.freeze({ limit: 20, windowMs: 60_000 }),
  management_read: Object.freeze({ limit: 60, windowMs: 60_000 }),
  management_availability: Object.freeze({ limit: 60, windowMs: 60_000 }),
  management_reschedule: Object.freeze({ limit: 12, windowMs: 60_000 }),
  management_cancel: Object.freeze({ limit: 12, windowMs: 60_000 }),
});

function plainClone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function positiveInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new TypeError(`${label} must be a positive bounded integer.`);
  }
  return value;
}

function requiredString(value, label, maximum = 512) {
  if (typeof value !== 'string' || !value || value.length > maximum) {
    throw new TypeError(`${label} must be a non-empty bounded string.`);
  }
  return value;
}

export function createLocalCoordinationState() {
  return {
    leases: new Map(),
    listeners: new Map(),
    idempotency: new Map(),
    management: new Map(),
    rateLimits: new Map(),
    fencingSequence: 0,
  };
}

function managementRecord(record, version = 1) {
  const allowed = new Set(['eventId', 'serviceId', 'start', 'end', 'workTrack', 'marker', 'state', 'operation', 'targetStart', 'targetEnd', 'version']);
  if (!record || Object.getPrototypeOf(record) !== Object.prototype || Object.keys(record).some((key) => !allowed.has(key)) || !Number.isInteger(version) || version < 1
    || !['active', 'mutation_intent', 'terminal'].includes(record.state) || typeof record.eventId !== 'string' || !record.eventId || record.eventId.length > 1024 || typeof record.serviceId !== 'string' || !record.serviceId || !['makeup', 'hair'].includes(record.workTrack)) throw new TypeError('Management record is invalid.');
  let start; let end; try { start = Temporal.Instant.from(record.start); end = Temporal.Instant.from(record.end); } catch { throw new TypeError('Management record is invalid.'); }
  if (Temporal.Instant.compare(end, start) <= 0 || (record.marker !== undefined && (typeof record.marker !== 'string' || !/^v1:[a-f0-9]{64}$/.test(record.marker)))) throw new TypeError('Management record is invalid.');
  const keys = Object.keys(record).filter((key) => key !== 'version').sort();
  const exact = (expected) => keys.length === expected.length && keys.every((key, index) => key === expected[index]);
  const base = ['end', 'eventId', 'serviceId', 'start', 'state', 'workTrack'];
  const marker = record.marker === undefined ? [] : ['marker'];
  if (record.state === 'active' || record.state === 'terminal') { if (!exact([...base, ...marker].sort())) throw new TypeError('Management record is invalid.'); }
  if (record.state === 'mutation_intent') {
    if (!['cancel', 'reschedule'].includes(record.operation)) throw new TypeError('Management record is invalid.');
    const intent = record.operation === 'cancel' ? ['operation'] : ['operation', 'targetEnd', 'targetStart'];
    if (!exact([...base, ...marker, ...intent].sort())) throw new TypeError('Management record is invalid.');
    if (record.operation === 'reschedule') { try { const targetStart = Temporal.Instant.from(record.targetStart); const targetEnd = Temporal.Instant.from(record.targetEnd); if (Temporal.Instant.compare(targetEnd, targetStart) <= 0) throw new Error(); } catch { throw new TypeError('Management record is invalid.'); } }
  }
  const next = { eventId: record.eventId, serviceId: record.serviceId, start: start.toString(), end: end.toString(), workTrack: record.workTrack, ...(record.marker === undefined ? {} : { marker: record.marker }), state: record.state, version };
  if (record.state === 'mutation_intent') { next.operation = record.operation; if (record.operation === 'reschedule') { next.targetStart = Temporal.Instant.from(record.targetStart).toString(); next.targetEnd = Temporal.Instant.from(record.targetEnd).toString(); } }
  return next;
}
function createManagementPort(state, now) {
  const get = (digest) => { const entry = state.management.get(digest); if (entry && entry.expiresAt <= now()) { state.management.delete(digest); return null; } return entry ?? null; };
  return Object.freeze({
    async get({ secretDigest }) { if (!DIGEST.test(secretDigest)) throw new TypeError('Management digest is invalid.'); const entry = get(secretDigest); return entry ? plainClone(entry.record) : null; },
    async create({ secretDigest, record, ttlSeconds }) { if (!DIGEST.test(secretDigest)) throw new TypeError('Management digest is invalid.'); positiveInteger(ttlSeconds, 'Management TTL', 63_158_400); const existing = get(secretDigest); if (existing) return plainClone(existing.record); const next = managementRecord(record); state.management.set(secretDigest, { record: next, expiresAt: now() + ttlSeconds * 1000 }); return plainClone(next); },
    async transition({ secretDigest, expectedVersion, expectedState, state: nextState, ttlSeconds, ...patch }) { if (!DIGEST.test(secretDigest)) throw new TypeError('Management digest is invalid.'); positiveInteger(expectedVersion, 'Management version'); positiveInteger(ttlSeconds, 'Management TTL', 63_158_400); const entry = get(secretDigest); if (!entry || entry.record.version !== expectedVersion || entry.record.state !== expectedState) throw new Error('Local management transition conflict.'); const { operation: _operation, targetStart: _targetStart, targetEnd: _targetEnd, version: _version, ...base } = entry.record; const next = managementRecord({ ...base, state: nextState, ...patch }, expectedVersion + 1); state.management.set(secretDigest, { record: next, expiresAt: now() + ttlSeconds * 1000 }); return plainClone(next); },
  });
}

export function getLocalCoordinationState(target = globalThis) {
  if (!target[LOCAL_STATE]) target[LOCAL_STATE] = createLocalCoordinationState();
  return target[LOCAL_STATE];
}

function notify(state, scope) {
  const listeners = state.listeners.get(scope);
  if (!listeners) return;
  state.listeners.delete(scope);
  for (const listener of listeners) listener();
}

function waitForLeaseChange(state, scope, waitMs) {
  return new Promise((resolve) => {
    const listeners = state.listeners.get(scope) ?? new Set();
    state.listeners.set(scope, listeners);
    let timer;
    const finish = () => {
      clearTimeout(timer);
      listeners.delete(finish);
      if (listeners.size === 0) state.listeners.delete(scope);
      resolve();
    };
    listeners.add(finish);
    timer = setTimeout(finish, waitMs);
  });
}

function activeLease(state, scope, now) {
  const lease = state.leases.get(scope);
  if (lease && lease.expiresAt <= now()) {
    state.leases.delete(scope);
    notify(state, scope);
    return null;
  }
  return lease ?? null;
}

function makeLease(state, scope, stored, now) {
  return {
    owner: stored.owner,
    fencingToken: stored.fencingToken,
    expiresAt: stored.expiresAt,
    async release(candidate) {
      const current = activeLease(state, scope, now);
      if (!current || candidate?.scope !== scope || candidate.owner !== current.owner
        || candidate.fencingToken !== current.fencingToken
        || current.owner !== stored.owner || current.fencingToken !== stored.fencingToken) {
        throw new Error('Local booking lease release rejected.');
      }
      state.leases.delete(scope);
      notify(state, scope);
    },
  };
}

function createLockPort(state, now) {
  return Object.freeze({
    async acquire({ scope, owner, timeoutMs, leaseMs }) {
      requiredString(scope, 'Lock scope', 128);
      requiredString(owner, 'Lock owner', 128);
      positiveInteger(timeoutMs, 'Lock timeout', 30_000);
      positiveInteger(leaseMs, 'Lock lease', 120_000);
      const deadline = now() + timeoutMs;
      while (true) {
        const current = activeLease(state, scope, now);
        if (!current) {
          const stored = {
            owner,
            fencingToken: `local-${++state.fencingSequence}`,
            expiresAt: now() + leaseMs,
          };
          state.leases.set(scope, stored);
          return makeLease(state, scope, stored, now);
        }
        const remaining = deadline - now();
        if (remaining <= 0) throw new Error('Local booking lease acquisition timed out.');
        await waitForLeaseChange(state, scope, Math.max(1, Math.min(remaining, current.expiresAt - now())));
      }
    },

    async renew({ scope, owner, fencingToken, leaseMs, minimumRemainingMs = 0 }) {
      requiredString(scope, 'Lock scope', 128);
      requiredString(owner, 'Lock owner', 128);
      requiredString(fencingToken, 'Lock fencing token', 128);
      positiveInteger(leaseMs, 'Lock lease', 120_000);
      if (!Number.isInteger(minimumRemainingMs) || minimumRemainingMs < 0 || minimumRemainingMs > 120_000) {
        throw new TypeError('Minimum remaining lease time is invalid.');
      }
      const current = activeLease(state, scope, now);
      if (!current || current.owner !== owner || current.fencingToken !== fencingToken
        || leaseMs <= minimumRemainingMs) {
        throw new Error('Local booking lease renewal rejected.');
      }
      current.expiresAt = now() + leaseMs;
      return makeLease(state, scope, current, now);
    },

    async assertOwnership({ scope, owner, fencingToken, minimumRemainingMs = 0 }) {
      requiredString(scope, 'Lock scope', 128);
      requiredString(owner, 'Lock owner', 128);
      requiredString(fencingToken, 'Lock fencing token', 128);
      if (!Number.isInteger(minimumRemainingMs) || minimumRemainingMs < 0 || minimumRemainingMs > 120_000) {
        throw new TypeError('Minimum remaining lease time is invalid.');
      }
      const current = activeLease(state, scope, now);
      if (!current || current.owner !== owner || current.fencingToken !== fencingToken
        || current.expiresAt - now() <= minimumRemainingMs) {
        throw new Error('Local booking lease ownership was lost.');
      }
    },
  });
}

function getIdempotencyEntry(state, keyDigest, now) {
  const entry = state.idempotency.get(keyDigest);
  if (entry && entry.expiresAt <= now()) {
    state.idempotency.delete(keyDigest);
    return null;
  }
  return entry ?? null;
}

function nextRecord(record, request) {
  const next = {
    fingerprint: record.fingerprint,
    state: request.state,
    version: record.version + 1,
  };
  const eventId = request.eventId ?? record.eventId;
  const code = request.code ?? record.code;
  const outcome = request.outcome ?? record.outcome;
  const management = request.management ?? record.management;
  if (request.state === 'event_created') next.eventId = eventId;
  if (request.state === 'confirmed_notification_pending' || request.state === 'confirmed') {
    next.eventId = eventId;
    next.outcome = plainClone(outcome);
    if (management !== undefined) next.management = plainClone(management);
  }
  if (request.state === 'conflict') {
    if (eventId !== undefined) next.eventId = eventId;
    next.code = code;
  }
  if (request.state === 'manual_review') {
    next.eventId = eventId;
    next.code = code;
  }
  return assertState(next);
}

function createIdempotencyPort(state, now) {
  return Object.freeze({
    async get({ keyDigest }) {
      if (!DIGEST.test(keyDigest)) throw new TypeError('Idempotency digest is invalid.');
      const entry = getIdempotencyEntry(state, keyDigest, now);
      return entry ? plainClone(entry.record) : null;
    },

    async create({ keyDigest, fingerprint, state: requestedState, ttlSeconds }) {
      if (!DIGEST.test(keyDigest) || !DIGEST.test(fingerprint)) throw new TypeError('Idempotency digest is invalid.');
      positiveInteger(ttlSeconds, 'Idempotency TTL', 2_592_000);
      const existing = getIdempotencyEntry(state, keyDigest, now);
      if (existing) return plainClone(existing.record);
      const record = assertState({ fingerprint, state: requestedState, version: 1 });
      state.idempotency.set(keyDigest, { record, expiresAt: now() + ttlSeconds * 1000 });
      return plainClone(record);
    },

    async transition(request) {
      if (!DIGEST.test(request.keyDigest)) throw new TypeError('Idempotency digest is invalid.');
      positiveInteger(request.expectedVersion, 'Expected idempotency version');
      positiveInteger(request.ttlSeconds, 'Idempotency TTL', 2_592_000);
      const existing = getIdempotencyEntry(state, request.keyDigest, now);
      if (!existing || existing.record.version !== request.expectedVersion
        || existing.record.state !== request.expectedState) {
        throw new Error('Local idempotency transition conflict.');
      }
      const record = nextRecord(existing.record, request);
      state.idempotency.set(request.keyDigest, {
        record,
        expiresAt: now() + request.ttlSeconds * 1000,
      });
      return plainClone(record);
    },
  });
}

function rateKey(request) {
  requiredString(request.action, 'Rate-limit action', 32);
  requiredString(request.subjectDigest, 'Rate-limit subject', 128);
  return `${request.action}:${request.subjectDigest}`;
}

function createRateLimitPort(state, now, policy) {
  return Object.freeze({
    async check(request) {
      const rule = policy[request.action];
      if (!rule) throw new TypeError('Unknown local rate-limit action.');
      const key = rateKey(request);
      const currentTime = now();
      let bucket = state.rateLimits.get(key);
      if (!bucket || bucket.resetAt <= currentTime) {
        bucket = { count: 0, resetAt: currentTime + rule.windowMs };
        state.rateLimits.set(key, bucket);
      }
      bucket.count += 1;
      if (bucket.count <= rule.limit) return { allowed: true };
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.min(300, Math.ceil((bucket.resetAt - currentTime) / 1000))),
      };
    },
  });
}

export function createLocalCoordinationPorts({
  state = createLocalCoordinationState(),
  now = () => Date.now(),
  ratePolicy = DEFAULT_RATE_POLICY,
} = {}) {
  if (typeof now !== 'function' || !state || !(state.leases instanceof Map)
    || !(state.idempotency instanceof Map) || !(state.management instanceof Map) || !(state.rateLimits instanceof Map)) {
    throw new TypeError('Local booking coordination configuration is invalid.');
  }
  return Object.freeze({
    lock: createLockPort(state, now),
    idempotency: createIdempotencyPort(state, now),
    management: createManagementPort(state, now),
    rateLimit: createRateLimitPort(state, now, ratePolicy),
  });
}
