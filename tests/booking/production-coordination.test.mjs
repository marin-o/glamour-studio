import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { createProductionCoordinationPorts } from '../../src/lib/booking/production/coordination.mjs';

const digest = (value) => createHash('sha256').update(value).digest('hex');

function fakeRedis() {
  let now = 1_000_000;
  const values = new Map(); const fences = new Map(); const calls = [];
  const active = (key) => {
    const item = values.get(key);
    if (item && item.expiresAt <= now) values.delete(key);
    return values.get(key) ?? null;
  };
  return {
    calls,
    advance(milliseconds) { now += milliseconds; },
    now: () => now,
    async get(key) { return active(key)?.value ?? null; },
    async eval(script, keys, args) {
      calls.push({ script, keys, args });
      const key = keys[0];
      if (script.includes('booking:lease-acquire')) {
        if (active(key)) return [0];
        const fence = (fences.get(keys[1]) ?? 0) + 1; fences.set(keys[1], fence);
        values.set(key, { value: `${args[0]}|${fence}`, expiresAt: now + Number(args[1]) });
        return [1, fence, now + Number(args[1])];
      }
      if (script.includes('booking:lease-renew')) {
        const current = active(key); if (!current || current.value !== `${args[0]}|${args[1]}`) return [0];
        current.expiresAt = now + Number(args[2]); return [1, current.expiresAt];
      }
      if (script.includes('booking:lease-assert')) {
        const current = active(key); return current && current.value === `${args[0]}|${args[1]}` && current.expiresAt - now > Number(args[2]) ? [1, current.expiresAt - now] : [0];
      }
      if (script.includes('booking:lease-release')) {
        const current = active(key); if (!current || current.value !== `${args[0]}|${args[1]}`) return 0;
        values.delete(key); return 1;
      }
      if (script.includes('booking:idempotency-create')) {
        const current = active(key); if (current) return current.value;
        values.set(key, { value: args[0], expiresAt: now + Number(args[1]) * 1000 }); return args[0];
      }
      if (script.includes('booking:idempotency-transition')) {
        const current = active(key); if (!current) return [0, 'missing'];
        const record = JSON.parse(current.value);
        if (record.fingerprint !== args[0] || record.version !== Number(args[1]) || record.state !== args[2]) return [0, 'conflict'];
        values.set(key, { value: args[3], expiresAt: now + Number(args[4]) * 1000 }); return [1, args[3]];
      }
      if (script.includes('booking:rate-limit')) {
        const current = active(key); const count = current ? Number(current.value) + 1 : 1;
        values.set(key, { value: String(count), expiresAt: current?.expiresAt ?? now + Number(args[0]) });
        return [count, active(key).expiresAt - now];
      }
      throw new Error('unexpected Lua script');
    },
  };
}

function ports(redis) {
  return createProductionCoordinationPorts({
    redis,
    now: redis.now,
    ratePolicy: { availability: { limit: 2, windowMs: 1_000 }, booking: { limit: 1, windowMs: 1_000 } },
  });
}

test('production Redis lease uses owner/fence comparisons, expiry, and monotonic fences', async () => {
  const redis = fakeRedis(); const coordination = ports(redis);
  const first = await coordination.lock.acquire({ scope: 'studio-booking', owner: 'first', timeoutMs: 1, leaseMs: 1_000 });
  await assert.rejects(coordination.lock.acquire({ scope: 'studio-booking', owner: 'second', timeoutMs: 1, leaseMs: 1_000 }));
  await assert.rejects(coordination.lock.renew({ scope: 'studio-booking', owner: 'second', fencingToken: first.fencingToken, leaseMs: 1_000 }));
  await assert.rejects(coordination.lock.assertOwnership({ scope: 'studio-booking', owner: 'second', fencingToken: first.fencingToken }));
  await assert.rejects(first.release({ scope: 'studio-booking', owner: 'second', fencingToken: first.fencingToken }));
  await coordination.lock.assertOwnership({ scope: 'studio-booking', owner: 'first', fencingToken: first.fencingToken });
  const renewed = await coordination.lock.renew({ scope: 'studio-booking', owner: 'first', fencingToken: first.fencingToken, leaseMs: 1_000 });
  await renewed.release({ scope: 'studio-booking', owner: 'first', fencingToken: first.fencingToken });
  const second = await coordination.lock.acquire({ scope: 'studio-booking', owner: 'second', timeoutMs: 1, leaseMs: 1_000 });
  assert.ok(Number(second.fencingToken) > Number(first.fencingToken));
  redis.advance(1_001);
  await assert.rejects(second.release({ scope: 'studio-booking', owner: 'second', fencingToken: second.fencingToken }));
  const third = await coordination.lock.acquire({ scope: 'studio-booking', owner: 'third', timeoutMs: 1, leaseMs: 1_000 });
  assert.ok(Number(third.fencingToken) > Number(second.fencingToken));
});

test('production Redis renews a live owner lease before enforcing the next-operation safety window', async () => {
  const redis = fakeRedis(); const coordination = ports(redis);
  const lease = await coordination.lock.acquire({ scope: 'studio-booking', owner: 'owner', timeoutMs: 1, leaseMs: 60_000 });
  redis.advance(11_000);
  const renewed = await coordination.lock.renew({ scope: 'studio-booking', owner: lease.owner, fencingToken: lease.fencingToken, leaseMs: 60_000, minimumRemainingMs: 50_000 });
  await coordination.lock.assertOwnership({ scope: 'studio-booking', owner: renewed.owner, fencingToken: renewed.fencingToken, minimumRemainingMs: 50_000 });
  redis.advance(60_001);
  await assert.rejects(coordination.lock.renew({ scope: 'studio-booking', owner: renewed.owner, fencingToken: renewed.fencingToken, leaseMs: 60_000, minimumRemainingMs: 50_000 }));
});

test('production Redis idempotency is atomic, fingerprint-bound, versioned, and expires', async () => {
  const redis = fakeRedis(); const coordination = ports(redis); const keyDigest = digest('key'); const fingerprint = digest('fingerprint');
  const pending = await coordination.idempotency.create({ keyDigest, fingerprint, state: 'pending', ttlSeconds: 60 });
  assert.deepEqual(await coordination.idempotency.create({ keyDigest, fingerprint: digest('other'), state: 'pending', ttlSeconds: 60 }), pending);
  const intent = await coordination.idempotency.transition({ keyDigest, fingerprint, expectedVersion: 1, expectedState: 'pending', state: 'creation_intent', ttlSeconds: 60 });
  assert.equal(intent.version, 2);
  await assert.rejects(coordination.idempotency.transition({ keyDigest, fingerprint: digest('other'), expectedVersion: 2, expectedState: 'creation_intent', state: 'event_created', eventId: 'event', ttlSeconds: 60 }));
  await assert.rejects(coordination.idempotency.transition({ keyDigest, fingerprint, expectedVersion: 1, expectedState: 'pending', state: 'creation_intent', ttlSeconds: 60 }));
  redis.advance(60_001);
  assert.equal(await coordination.idempotency.get({ keyDigest }), null);
  await assert.rejects(coordination.idempotency.transition({ keyDigest, fingerprint, expectedVersion: 2, expectedState: 'creation_intent', state: 'event_created', eventId: 'event', ttlSeconds: 60 }));
});

test('production Redis rate limits are atomic, bounded, expiring, and privacy-minimized', async () => {
  const redis = fakeRedis(); const coordination = ports(redis); const request = { action: 'booking', subjectDigest: digest('ip'), contactDigest: digest('contact') };
  assert.deepEqual(await coordination.rateLimit.check(request), { allowed: true });
  assert.deepEqual(await coordination.rateLimit.check(request), { allowed: false, retryAfter: 1 });
  redis.advance(1_001);
  assert.deepEqual(await coordination.rateLimit.check(request), { allowed: true });
  for (const call of redis.calls) for (const key of call.keys) assert.match(key, /^booking:v1:(?:lease|fence|idempotency|rate):[a-f0-9]{64}$/);
});

test('production Redis rate limits aggregate only by action and subject, with bounded keys', async () => {
  const redis = fakeRedis(); const coordination = ports(redis); const subject = digest('subject');
  for (const request of [
    { action: 'availability', subjectDigest: subject, serviceId: 'makeup', date: '2026-07-24' },
    { action: 'availability', subjectDigest: subject, serviceId: 'hair-styling', date: '2026-07-25' },
    { action: 'availability', subjectDigest: subject, serviceId: 'haircut', date: '2026-07-26' },
  ]) await coordination.rateLimit.check(request);
  assert.deepEqual(await coordination.rateLimit.check({ action: 'booking', subjectDigest: subject, contactDigest: digest('one') }), { allowed: true });
  assert.deepEqual(await coordination.rateLimit.check({ action: 'booking', subjectDigest: subject, contactDigest: digest('two') }), { allowed: false, retryAfter: 1 });
  assert.deepEqual(await coordination.rateLimit.check({ action: 'booking', subjectDigest: digest('other'), contactDigest: digest('three') }), { allowed: true });
  const rateKeys = new Set(redis.calls.filter((call) => call.script.includes('booking:rate-limit')).map((call) => call.keys[0]));
  assert.equal(rateKeys.size, 3);
});

test('production Redis transport failures remain sanitized adapter failures', async () => {
  const coordination = createProductionCoordinationPorts({ redis: { async eval() { throw new Error('token must not leak'); } }, ratePolicy: { availability: { limit: 1, windowMs: 1_000 }, booking: { limit: 1, windowMs: 1_000 } } });
  await assert.rejects(coordination.rateLimit.check({ action: 'availability', subjectDigest: digest('ip') }));
});
