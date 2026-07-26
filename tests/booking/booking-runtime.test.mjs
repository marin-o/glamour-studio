import assert from 'node:assert/strict';
import test from 'node:test';
import { Temporal } from '@js-temporal/polyfill';

import {
  createLocalCoordinationPorts,
  createLocalCoordinationState,
} from '../../src/lib/booking/local/coordination.mjs';
import { createBookingRuntime } from '../../src/lib/booking/runtime.mjs';
import { getProductionRequestContext } from '../../src/lib/booking/production/request-context.mjs';

test('booking runtime remains fail-closed unless explicit local development mode is active', async () => {
  for (const runtime of [
    createBookingRuntime({ env: {}, nodeEnv: 'development' }),
    createBookingRuntime({ env: { BOOKING_LOCAL_TEST_MODE: '1' }, nodeEnv: 'production' }),
  ]) {
    await assert.rejects(runtime.availability({ serviceId: 'makeup', date: '2026-07-24' }), {
      code: 'BOOKING_NOT_CONFIGURED',
    });
  }
});

test('explicit local development mode composes the booking service with a local request identity', async () => {
  const calendar = {
    async getBusyIntervals() { return []; },
    async reconcilePrivateEvent() { throw Object.assign(new Error('not used'), { code: 'NOT_FOUND' }); },
    async createPrivateEvent() { throw new Error('not used'); },
    async listBlockingEvents() { return []; },
    async deleteEventForCompensation() { return { deleted: true }; },
    async addOrUpdateAttendee() {},
  };
  const runtime = createBookingRuntime({
    env: { BOOKING_LOCAL_TEST_MODE: '1' },
    nodeEnv: 'development',
    calendar,
    ports: createLocalCoordinationPorts({ state: createLocalCoordinationState() }),
    now: () => Temporal.Instant.from('2026-07-23T00:00:00Z'),
  });
  const result = await runtime.availability({ serviceId: 'makeup', date: '2026-07-24' });
  assert.equal(result.serviceId, 'makeup');
  assert.equal(result.date, '2026-07-24');
  assert.ok(result.starts.length > 0);
});

function productionEnv(overrides = {}) {
  return {
    BOOKING_PRODUCTION_ENABLED: '1', VERCEL: '1', UPSTASH_REDIS_REST_URL: 'https://example.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'a'.repeat(20), BOOKING_REQUEST_HMAC_SECRET: 'b'.repeat(20),
    GOOGLE_CALENDAR_ID: 'dedicated@example.com', GOOGLE_OAUTH_CLIENT_ID: '123456789012-client.apps.googleusercontent.com', GOOGLE_OAUTH_CLIENT_SECRET: 'c'.repeat(20), GOOGLE_OAUTH_REFRESH_TOKEN: 'd'.repeat(20),
    BOOKING_LEAD_TIME_MINUTES: '0', BOOKING_HORIZON_DAYS: '180', BOOKING_IDEMPOTENCY_TTL_SECONDS: '86400', BOOKING_LOCK_TIMEOUT_MS: '5000', BOOKING_LOCK_LEASE_MS: '60000', BOOKING_PROVIDER_OPERATION_BUDGET_MS: '45000', BOOKING_LEASE_SAFETY_MS: '5000',
    BOOKING_RATE_LIMIT_AVAILABILITY_LIMIT: '120', BOOKING_RATE_LIMIT_AVAILABILITY_WINDOW_SECONDS: '60', BOOKING_RATE_LIMIT_BOOKING_LIMIT: '20', BOOKING_RATE_LIMIT_BOOKING_WINDOW_SECONDS: '60',
    ...overrides,
  };
}

test('production activation validates every policy/provider value and hashes only trusted Vercel request identity', async () => {
  const env = productionEnv();
  const context = getProductionRequestContext(new Request('https://example.test', { headers: { 'x-vercel-forwarded-for': '203.0.113.8, 10.0.0.1', 'x-forwarded-for': 'raw-untrusted' } }), { env, nodeEnv: 'production' });
  assert.match(context.subjectDigest, /^[a-f0-9]{64}$/); assert.doesNotMatch(JSON.stringify(context), /203\.0\.113\.8|raw-untrusted/);
  const calendar = { async getBusyIntervals() { return []; }, async reconcilePrivateEvent() { throw Object.assign(new Error('not used'), { code: 'NOT_FOUND' }); }, async createPrivateEvent() { throw new Error('not used'); }, async listBlockingEvents() { return []; }, async deleteEventForCompensation() { return { deleted: true }; }, async addOrUpdateAttendee() {} };
  const redis = { async eval(script) { if (script.includes('rate-limit')) return [1, 60_000]; throw new Error('not used'); } };
  const runtime = createBookingRuntime({ env, nodeEnv: 'production', calendar, redis, now: () => Temporal.Instant.from('2026-07-23T00:00:00Z') });
  assert.equal((await runtime.availability({ serviceId: 'makeup', date: '2026-07-24' }, context)).serviceId, 'makeup');
  const unavailable = createBookingRuntime({ env: { ...env, BOOKING_RATE_LIMIT_BOOKING_LIMIT: undefined }, nodeEnv: 'production', calendar, redis });
  await assert.rejects(unavailable.availability({ serviceId: 'makeup', date: '2026-07-24' }), { code: 'BOOKING_NOT_CONFIGURED' });
  assert.throws(() => getProductionRequestContext(new Request('https://example.test', { headers: { 'x-forwarded-for': 'spoofed' } }), { env, nodeEnv: 'production' }), { code: 'BOOKING_NOT_CONFIGURED' });
});

test('Netlify production booking requires the explicit server-side platform marker', () => {
  const netlifyEnv = productionEnv({ VERCEL: undefined, BOOKING_DEPLOYMENT_PLATFORM: 'netlify' });
  const context = getProductionRequestContext(
    new Request('https://example.test', { headers: { 'x-forwarded-for': 'spoofed' } }),
    { env: netlifyEnv, nodeEnv: 'production', getNetlifyContext: () => ({ ip: '203.0.113.9' }) },
  );
  assert.match(context.subjectDigest, /^[a-f0-9]{64}$/);

  for (const env of [
    productionEnv({ VERCEL: undefined, NETLIFY: 'true', CONTEXT: 'production' }),
    productionEnv({ VERCEL: undefined, BOOKING_DEPLOYMENT_PLATFORM: 'Netlify' }),
    productionEnv({ VERCEL: undefined, BOOKING_DEPLOYMENT_PLATFORM: 'netlify', BOOKING_PRODUCTION_ENABLED: '0' }),
  ]) {
    assert.equal(getProductionRequestContext(new Request('https://example.test'), { env, nodeEnv: 'production' }), undefined);
  }
  assert.equal(getProductionRequestContext(new Request('https://example.test'), { env: netlifyEnv, nodeEnv: 'development' }), undefined);
});

test('conflicting Vercel and Netlify production markers fail closed', async () => {
  const env = productionEnv({ BOOKING_DEPLOYMENT_PLATFORM: 'netlify' });
  const contextRequest = new Request('https://example.test', { headers: { 'x-vercel-forwarded-for': '203.0.113.8' } });
  assert.equal(getProductionRequestContext(contextRequest, { env, nodeEnv: 'production' }), undefined);

  const runtime = createBookingRuntime({ env, nodeEnv: 'production' });
  await assert.rejects(runtime.availability({ serviceId: 'makeup', date: '2026-07-24' }), { code: 'BOOKING_NOT_CONFIGURED' });
});

test('Netlify hashes only the official server context IP and fails closed when unavailable', () => {
  const env = productionEnv({ VERCEL: undefined, BOOKING_DEPLOYMENT_PLATFORM: 'netlify' });
  const context = getProductionRequestContext(
    new Request('https://example.test', { headers: { 'x-forwarded-for': 'spoofed', 'x-nf-client-connection-ip': 'also-spoofed' } }),
    { env, nodeEnv: 'production', getNetlifyContext: () => ({ ip: '2001:db8::8' }) },
  );
  assert.equal(context.subjectDigest, 'cc9f038c0110c61c729deed4c46b1429f54d97908872446597dee563114fa538');
  assert.doesNotMatch(JSON.stringify(context), /spoofed|2001:db8::8/);
  assert.throws(
    () => getProductionRequestContext(new Request('https://example.test'), { env, nodeEnv: 'production', getNetlifyContext: () => undefined }),
    { code: 'BOOKING_NOT_CONFIGURED' },
  );
  assert.throws(
    () => getProductionRequestContext(new Request('https://example.test'), { env, nodeEnv: 'production', getNetlifyContext: () => ({ ip: '203.0.113.9, spoofed' }) }),
    { code: 'BOOKING_NOT_CONFIGURED' },
  );
  assert.throws(
    () => getProductionRequestContext(new Request('https://example.test'), { env: { ...env, BOOKING_REQUEST_HMAC_SECRET: undefined }, nodeEnv: 'production', getNetlifyContext: () => ({ ip: '203.0.113.9' }) }),
    { code: 'BOOKING_NOT_CONFIGURED' },
  );
});
