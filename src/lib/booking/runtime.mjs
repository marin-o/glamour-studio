import 'server-only';

import { createHash } from 'node:crypto';

import { createGoogleCalendarAdapter } from './google/calendar-adapter.mjs';
import { createLocalCoordinationPorts, getLocalCoordinationState } from './local/coordination.mjs';
import { createBookingService } from './orchestration/booking-service.mjs';
import { BookingError } from './orchestration/errors.mjs';

const LOCAL_MODE_FLAG = 'BOOKING_LOCAL_TEST_MODE';
const RUNTIME = Symbol.for('glamour-studio.booking.runtime.v1');
const LOCAL_POLICY = Object.freeze({
  leadTimeMinutes: 0,
  bookingHorizonDays: 180,
  idempotencyTtlSeconds: 86_400,
  lockTimeoutMs: 5_000,
  lockLeaseMs: 60_000,
  providerOperationBudgetMs: 45_000,
  leaseSafetyMs: 5_000,
});
const LOCAL_REQUEST_CONTEXT = Object.freeze({
  subjectDigest: createHash('sha256').update('glamour-studio-localhost-tester', 'utf8').digest('hex'),
});

function unavailableRuntime() {
  return Object.freeze({
    async availability() { throw new BookingError('BOOKING_NOT_CONFIGURED', 503); },
    async book() { throw new BookingError('BOOKING_NOT_CONFIGURED', 503); },
  });
}

export function createBookingRuntime({
  env = process.env,
  nodeEnv = process.env.NODE_ENV,
  calendar,
  ports,
  now,
} = {}) {
  if (env?.[LOCAL_MODE_FLAG] !== '1' || nodeEnv !== 'development') return unavailableRuntime();
  const service = createBookingService({
    calendar: calendar ?? createGoogleCalendarAdapter({ env }),
    ports: ports ?? createLocalCoordinationPorts({ state: getLocalCoordinationState() }),
    policy: LOCAL_POLICY,
    ...(now ? { now } : {}),
  });
  return Object.freeze({
    availability(input, requestContext) {
      return service.availability(input, requestContext ?? LOCAL_REQUEST_CONTEXT);
    },
    book(input, idempotencyKey, requestContext) {
      return service.book(input, idempotencyKey, requestContext ?? LOCAL_REQUEST_CONTEXT);
    },
  });
}

export function getBookingRuntime() {
  if (!globalThis[RUNTIME]) globalThis[RUNTIME] = createBookingRuntime();
  return globalThis[RUNTIME];
}
