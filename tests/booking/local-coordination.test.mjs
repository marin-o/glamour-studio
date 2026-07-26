import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import {
  createLocalCoordinationPorts,
  createLocalCoordinationState,
} from '../../src/lib/booking/local/coordination.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');

test('local lock serializes contenders and rejects a stale compare-owner release', async () => {
  let currentTime = Date.now();
  const ports = createLocalCoordinationPorts({
    state: createLocalCoordinationState(),
    now: () => currentTime,
  });
  const first = await ports.lock.acquire({
    scope: 'studio-booking',
    owner: 'first',
    timeoutMs: 100,
    leaseMs: 1_000,
  });
  let secondSettled = false;
  const secondPromise = ports.lock.acquire({
    scope: 'studio-booking',
    owner: 'second',
    timeoutMs: 100,
    leaseMs: 1_000,
  }).then((lease) => {
    secondSettled = true;
    return lease;
  });
  await Promise.resolve();
  assert.equal(secondSettled, false);
  await first.release({
    scope: 'studio-booking',
    owner: first.owner,
    fencingToken: first.fencingToken,
  });
  const second = await secondPromise;
  assert.notEqual(second.fencingToken, first.fencingToken);

  currentTime += 1_001;
  const replacement = await ports.lock.acquire({
    scope: 'studio-booking',
    owner: 'replacement',
    timeoutMs: 100,
    leaseMs: 1_000,
  });
  await assert.rejects(first.release({
    scope: 'studio-booking',
    owner: first.owner,
    fencingToken: first.fencingToken,
  }));
  await replacement.release({
    scope: 'studio-booking',
    owner: replacement.owner,
    fencingToken: replacement.fencingToken,
  });
});

test('local idempotency records use CAS transitions and expire by TTL', async () => {
  let currentTime = Date.now();
  const ports = createLocalCoordinationPorts({
    state: createLocalCoordinationState(),
    now: () => currentTime,
  });
  const keyDigest = digest('key');
  const fingerprint = digest('fingerprint');
  const pending = await ports.idempotency.create({
    keyDigest,
    fingerprint,
    state: 'pending',
    ttlSeconds: 60,
  });
  assert.deepEqual(pending, { fingerprint, state: 'pending', version: 1 });
  const intent = await ports.idempotency.transition({
    keyDigest,
    expectedVersion: 1,
    expectedState: 'pending',
    state: 'creation_intent',
    ttlSeconds: 60,
  });
  assert.deepEqual(intent, { fingerprint, state: 'creation_intent', version: 2 });
  await assert.rejects(ports.idempotency.transition({
    keyDigest,
    expectedVersion: 1,
    expectedState: 'pending',
    state: 'creation_intent',
    ttlSeconds: 60,
  }));
  currentTime += 60_001;
  assert.equal(await ports.idempotency.get({ keyDigest }), null);
});

test('local rate limiting is bounded and resets without storing raw contact data', async () => {
  let currentTime = Date.now();
  const state = createLocalCoordinationState();
  const ports = createLocalCoordinationPorts({
    state,
    now: () => currentTime,
    ratePolicy: {
      availability: { limit: 2, windowMs: 1_000 },
      booking: { limit: 1, windowMs: 1_000 },
    },
  });
  const request = {
    action: 'booking',
    subjectDigest: digest('local'),
    contactDigest: digest('customer'),
  };
  assert.deepEqual(await ports.rateLimit.check(request), { allowed: true });
  assert.deepEqual(await ports.rateLimit.check(request), { allowed: false, retryAfter: 1 });
  assert.equal([...state.rateLimits.keys()].some((key) => key.includes('customer')), false);
  currentTime += 1_001;
  assert.deepEqual(await ports.rateLimit.check(request), { allowed: true });
});

test('local rate limiting mirrors the production action/subject aggregation', async () => {
  const state = createLocalCoordinationState(); const subject = digest('shared-subject');
  const ports = createLocalCoordinationPorts({ state, ratePolicy: { availability: { limit: 2, windowMs: 1_000 }, booking: { limit: 1, windowMs: 1_000 } } });
  await ports.rateLimit.check({ action: 'availability', subjectDigest: subject, serviceId: 'makeup', date: '2026-07-24' });
  await ports.rateLimit.check({ action: 'availability', subjectDigest: subject, serviceId: 'haircut', date: '2026-07-25' });
  assert.equal((await ports.rateLimit.check({ action: 'availability', subjectDigest: subject, serviceId: 'hair-styling', date: '2026-07-26' })).allowed, false);
  await ports.rateLimit.check({ action: 'booking', subjectDigest: subject, contactDigest: digest('first') });
  assert.equal((await ports.rateLimit.check({ action: 'booking', subjectDigest: subject, contactDigest: digest('second') })).allowed, false);
  assert.equal((await ports.rateLimit.check({ action: 'booking', subjectDigest: digest('independent') })).allowed, true);
  assert.equal(state.rateLimits.size, 3);
});
