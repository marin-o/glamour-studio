import 'server-only';

import { Redis } from '@upstash/redis';
import { createHash } from 'node:crypto';

import { assertState } from '../orchestration/ports.mjs';

const DIGEST = /^[a-f0-9]{64}$/;
const OWNER = /^[a-zA-Z0-9-]{1,128}$/;
const LUA = Object.freeze({
  acquire: `-- booking:lease-acquire\nlocal current = redis.call('GET', KEYS[1])\nif current then return {0} end\nlocal fence = redis.call('INCR', KEYS[2])\nredis.call('PSETEX', KEYS[1], ARGV[2], ARGV[1] .. '|' .. fence)\nlocal time = redis.call('TIME')\nreturn {1, fence, (time[1] * 1000) + math.floor(time[2] / 1000) + ARGV[2]}`,
  renew: `-- booking:lease-renew\nlocal current = redis.call('GET', KEYS[1])\nif not current or current ~= ARGV[1] .. '|' .. ARGV[2] then return {0} end\nlocal ttl = redis.call('PTTL', KEYS[1])\nif ttl <= 0 then return {0} end\nredis.call('PEXPIRE', KEYS[1], ARGV[3])\nlocal time = redis.call('TIME')\nreturn {1, (time[1] * 1000) + math.floor(time[2] / 1000) + ARGV[3]}`,
  assert: `-- booking:lease-assert\nlocal current = redis.call('GET', KEYS[1])\nif not current or current ~= ARGV[1] .. '|' .. ARGV[2] then return {0} end\nlocal ttl = redis.call('PTTL', KEYS[1])\nif ttl <= tonumber(ARGV[3]) then return {0} end\nreturn {1, ttl}`,
  release: `-- booking:lease-release\nlocal current = redis.call('GET', KEYS[1])\nif not current or current ~= ARGV[1] .. '|' .. ARGV[2] then return 0 end\nreturn redis.call('DEL', KEYS[1])`,
  create: `-- booking:idempotency-create\nlocal existing = redis.call('GET', KEYS[1])\nif existing then return existing end\nredis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2], 'NX')\nreturn redis.call('GET', KEYS[1])`,
  transition: `-- booking:idempotency-transition\nlocal current = redis.call('GET', KEYS[1])\nif not current then return {0, 'missing'} end\nlocal record = cjson.decode(current)\nif record.fingerprint ~= ARGV[1] or record.version ~= tonumber(ARGV[2]) or record.state ~= ARGV[3] then return {0, 'conflict'} end\nredis.call('SET', KEYS[1], ARGV[4], 'EX', ARGV[5])\nreturn {1, ARGV[4]}`,
  rate: `-- booking:rate-limit\nlocal count = redis.call('INCR', KEYS[1])\nif count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end\nlocal ttl = redis.call('PTTL', KEYS[1])\nreturn {count, ttl}`,
});

const digest = (value) => createHash('sha256').update(value, 'utf8').digest('hex');
const plainClone = (value) => JSON.parse(JSON.stringify(value));
function integer(value, label, minimum, maximum) { if (!Number.isInteger(value) || value < minimum || value > maximum) throw new TypeError(`${label} is invalid.`); return value; }
function key(kind, value) { return `booking:v1:${kind}:${digest(value)}`; }
function redisError() { return new Error('Production booking coordination failed.'); }
function asRecord(value) { try { return assertState(JSON.parse(value)); } catch { throw redisError(); } }
function responseFlag(value) { return Array.isArray(value) && Number(value[0]) === 1; }

export function createProductionRedisClient({ url, token } = {}) {
  if (typeof url !== 'string' || typeof token !== 'string') throw new TypeError('Production Redis configuration is invalid.');
  return new Redis({ url, token, readYourWrites: true, automaticDeserialization: false });
}

export function createProductionCoordinationPorts({ redis, ratePolicy, now = () => Date.now() } = {}) {
  if (!redis || typeof redis.eval !== 'function' || typeof now !== 'function' || !ratePolicy?.availability || !ratePolicy?.booking) throw new TypeError('Production coordination configuration is invalid.');
  for (const rule of Object.values(ratePolicy)) { integer(rule.limit, 'Rate limit', 1, 10_000); integer(rule.windowMs, 'Rate window', 1_000, 3_600_000); }
  const evaluate = async (script, keys, args) => {
    try { return await redis.eval(script, keys, args.map(String)); } catch { throw redisError(); }
  };
  const leaseKey = (scope) => key('lease', scope);
  const fenceKey = (scope) => key('fence', scope);
  const validateLease = ({ scope, owner, fencingToken, minimumRemainingMs = 0 }) => {
    if (typeof scope !== 'string' || !scope || scope.length > 128 || !OWNER.test(owner) || !/^\d+$/.test(String(fencingToken))) throw new TypeError('Production lease arguments are invalid.');
    integer(minimumRemainingMs, 'Minimum remaining lease time', 0, 120_000);
  };
  const makeLease = (scope, owner, fencingToken, expiresAt) => Object.freeze({
    owner,
    fencingToken: String(fencingToken),
    expiresAt,
    async release(candidate) {
      validateLease(candidate ?? {});
      if (candidate.scope !== scope || candidate.owner !== owner || String(candidate.fencingToken) !== String(fencingToken)
        || Number(await evaluate(LUA.release, [leaseKey(scope)], [owner, fencingToken])) !== 1) throw redisError();
    },
  });
  return Object.freeze({
    lock: Object.freeze({
      async acquire({ scope, owner, timeoutMs, leaseMs }) {
        if (typeof scope !== 'string' || !scope || scope.length > 128 || !OWNER.test(owner)) throw new TypeError('Production lease arguments are invalid.');
        integer(timeoutMs, 'Lock timeout', 1, 30_000); integer(leaseMs, 'Lock lease', 1_000, 120_000);
        const deadline = Date.now() + timeoutMs;
        while (true) {
          const result = await evaluate(LUA.acquire, [leaseKey(scope), fenceKey(scope)], [owner, leaseMs]);
          if (responseFlag(result) && /^\d+$/.test(String(result[1])) && Number.isSafeInteger(Number(result[2]))) return makeLease(scope, owner, result[1], Number(result[2]));
          if (Date.now() >= deadline) throw redisError();
          await new Promise((resolve) => setTimeout(resolve, Math.min(25, Math.max(1, deadline - Date.now()))));
        }
      },
      async renew({ scope, owner, fencingToken, leaseMs, minimumRemainingMs = 0 }) {
        validateLease({ scope, owner, fencingToken, minimumRemainingMs }); integer(leaseMs, 'Lock lease', 1_000, 120_000);
        // Renew an owned, unexpired lease first. The caller then asserts the new
        // TTL for its next bounded provider operation; old TTL must not strand it.
        const result = await evaluate(LUA.renew, [leaseKey(scope)], [owner, fencingToken, leaseMs]);
        if (!responseFlag(result) || !Number.isSafeInteger(Number(result[1]))) throw redisError();
        return makeLease(scope, owner, fencingToken, Number(result[1]));
      },
      async assertOwnership({ scope, owner, fencingToken, minimumRemainingMs = 0 }) {
        validateLease({ scope, owner, fencingToken, minimumRemainingMs });
        if (!responseFlag(await evaluate(LUA.assert, [leaseKey(scope)], [owner, fencingToken, minimumRemainingMs]))) throw redisError();
      },
    }),
    idempotency: Object.freeze({
      async get({ keyDigest }) {
        if (!DIGEST.test(keyDigest)) throw new TypeError('Idempotency digest is invalid.');
        let value; try { value = await redis.get(key('idempotency', keyDigest)); } catch { throw redisError(); }
        return value === null ? null : plainClone(asRecord(value));
      },
      async create({ keyDigest, fingerprint, state, ttlSeconds }) {
        if (!DIGEST.test(keyDigest) || !DIGEST.test(fingerprint)) throw new TypeError('Idempotency digest is invalid.');
        integer(ttlSeconds, 'Idempotency TTL', 60, 2_592_000);
        const record = assertState({ fingerprint, state, version: 1 });
        return plainClone(asRecord(await evaluate(LUA.create, [key('idempotency', keyDigest)], [JSON.stringify(record), ttlSeconds])));
      },
      async transition({ keyDigest, fingerprint, expectedVersion, expectedState, state, ttlSeconds, eventId, code, outcome }) {
        if (!DIGEST.test(keyDigest) || !DIGEST.test(fingerprint)) throw new TypeError('Idempotency digest is invalid.');
        integer(expectedVersion, 'Expected idempotency version', 1, Number.MAX_SAFE_INTEGER); integer(ttlSeconds, 'Idempotency TTL', 60, 2_592_000);
        let next = { fingerprint, state, version: expectedVersion + 1 };
        if (state === 'event_created') next.eventId = eventId;
        if (state === 'confirmed_notification_pending' || state === 'confirmed') { next.eventId = eventId; next.outcome = outcome; }
        if (state === 'conflict') { if (eventId !== undefined) next.eventId = eventId; next.code = code; }
        if (state === 'manual_review') { next.eventId = eventId; next.code = code; }
        next = assertState(next);
        const result = await evaluate(LUA.transition, [key('idempotency', keyDigest)], [fingerprint, expectedVersion, expectedState, JSON.stringify(next), ttlSeconds]);
        if (!responseFlag(result) || typeof result[1] !== 'string') throw redisError();
        return plainClone(asRecord(result[1]));
      },
    }),
    rateLimit: Object.freeze({
      async check({ action, subjectDigest, contactDigest, serviceId, date }) {
        const rule = ratePolicy[action];
        if (!rule || !DIGEST.test(subjectDigest) || (contactDigest !== undefined && !DIGEST.test(contactDigest))) throw new TypeError('Production rate-limit arguments are invalid.');
        // One action/subject bucket bounds untrusted request variation. Optional
        // contact, service, and date values are deliberately not key material.
        const rateDigest = digest(`${action}\u0000${subjectDigest}`);
        const result = await evaluate(LUA.rate, [key('rate', rateDigest)], [rule.windowMs]);
        const count = Number(result?.[0]); const ttl = Number(result?.[1]);
        if (!Number.isSafeInteger(count) || !Number.isSafeInteger(ttl) || ttl < 0) throw redisError();
        if (count <= rule.limit) return { allowed: true };
        return { allowed: false, retryAfter: Math.max(1, Math.min(300, Math.ceil(ttl / 1000))) };
      },
    }),
  });
}

export { LUA as PRODUCTION_COORDINATION_LUA };
