import 'server-only';

import { assertState } from '../orchestration/ports.mjs';

const LOCAL_STATE = Symbol.for('glamour-studio.booking.local-coordination.v1');
const DIGEST = /^[a-f0-9]{64}$/;
const DEFAULT_RATE_POLICY = Object.freeze({
  availability: Object.freeze({ limit: 120, windowMs: 60_000 }),
  booking: Object.freeze({ limit: 20, windowMs: 60_000 }),
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
    rateLimits: new Map(),
    fencingSequence: 0,
  };
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
  if (request.state === 'event_created') next.eventId = eventId;
  if (request.state === 'confirmed_notification_pending' || request.state === 'confirmed') {
    next.eventId = eventId;
    next.outcome = plainClone(outcome);
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
  return [
    request.action,
    request.subjectDigest,
    request.contactDigest ?? '',
    request.serviceId ?? '',
    request.date ?? '',
  ].join(':');
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
    || !(state.idempotency instanceof Map) || !(state.rateLimits instanceof Map)) {
    throw new TypeError('Local booking coordination configuration is invalid.');
  }
  return Object.freeze({
    lock: createLockPort(state, now),
    idempotency: createIdempotencyPort(state, now),
    rateLimit: createRateLimitPort(state, now, ratePolicy),
  });
}
