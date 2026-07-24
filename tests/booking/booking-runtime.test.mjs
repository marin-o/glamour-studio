import assert from 'node:assert/strict';
import test from 'node:test';
import { Temporal } from '@js-temporal/polyfill';

import {
  createLocalCoordinationPorts,
  createLocalCoordinationState,
} from '../../src/lib/booking/local/coordination.mjs';
import { createBookingRuntime } from '../../src/lib/booking/runtime.mjs';

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
