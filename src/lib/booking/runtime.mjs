import 'server-only';

import { createHash } from 'node:crypto';

import { createGoogleCalendarAdapter } from './google/calendar-adapter.mjs';
import { createLocalCoordinationPorts, getLocalCoordinationState } from './local/coordination.mjs';
import { createBookingService } from './orchestration/booking-service.mjs';
import { createBookingManagementService } from './orchestration/management-service.mjs';
import { BookingError } from './orchestration/errors.mjs';
import { createResendNotifier } from './notifications/resend.mjs';
import { createProductionCoordinationPorts, createProductionRedisClient, getProductionBookingConfig } from './production/index.mjs';

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
    async managementRead() { throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); },
    async managementAvailability() { throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); },
    async managementReschedule() { throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); },
    async managementCancel() { throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); },
  });
}

export function createBookingRuntime({
  env = process.env,
  nodeEnv = process.env.NODE_ENV,
  calendar,
  ports,
  redis,
  now,
} = {}) {
  if (env?.[LOCAL_MODE_FLAG] === '1' && nodeEnv === 'development') {
    const selectedCalendar = calendar ?? createGoogleCalendarAdapter({ env }); const selectedPorts = ports ?? createLocalCoordinationPorts({ state: getLocalCoordinationState() });
    const management = ['reschedulePrivateEvent', 'cancelPrivateEvent', 'reconcileCancelledPrivateEvent', 'getVerifiedAttendee'].every((method) => typeof selectedCalendar[method] === 'function') ? createBookingManagementService({ calendar: selectedCalendar, ports: selectedPorts, policy: LOCAL_POLICY, notifier: env?.RESEND_API_KEY ? createResendNotifier({ env }) : undefined, ...(now ? { now } : {}) }) : null;
    const service = createBookingService({
      calendar: selectedCalendar,
      ports: selectedPorts, management,
      policy: LOCAL_POLICY,
      ...(now ? { now } : {}),
    });
    return Object.freeze({
      availability(input, requestContext) { return service.availability(input, requestContext ?? LOCAL_REQUEST_CONTEXT); },
      book(input, idempotencyKey, requestContext) { return service.book(input, idempotencyKey, requestContext ?? LOCAL_REQUEST_CONTEXT); },
      managementRead(secret, requestContext) { if (!management) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); return management.read(secret, requestContext ?? LOCAL_REQUEST_CONTEXT); },
      managementAvailability(secret, date, requestContext) { if (!management) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); return management.availability(secret, date, requestContext ?? LOCAL_REQUEST_CONTEXT); },
      managementReschedule(secret, input, requestContext) { if (!management) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); return management.reschedule(secret, input, requestContext ?? LOCAL_REQUEST_CONTEXT); },
      managementCancel(secret, requestContext) { if (!management) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); return management.cancel(secret, requestContext ?? LOCAL_REQUEST_CONTEXT); },
    });
  }
  try {
    const config = getProductionBookingConfig(env, nodeEnv);
    const selectedCalendar = calendar ?? createGoogleCalendarAdapter({ env, timeoutMs: config.policy.providerOperationBudgetMs }); const selectedPorts = ports ?? createProductionCoordinationPorts({ redis: redis ?? createProductionRedisClient({ url: config.redisUrl, token: config.redisToken }), ratePolicy: config.ratePolicy });
    const management = ['reschedulePrivateEvent', 'cancelPrivateEvent', 'reconcileCancelledPrivateEvent', 'getVerifiedAttendee'].every((method) => typeof selectedCalendar[method] === 'function') ? createBookingManagementService({ calendar: selectedCalendar, ports: selectedPorts, policy: config.policy, notifier: createResendNotifier({ env }), ...(now ? { now } : {}) }) : null;
    const service = createBookingService({
      calendar: selectedCalendar,
      ports: selectedPorts, management,
      policy: config.policy,
      ...(now ? { now } : {}),
    });
    return Object.freeze({ availability: (input, requestContext) => service.availability(input, requestContext), book: (input, idempotencyKey, requestContext) => service.book(input, idempotencyKey, requestContext), managementRead: (secret, context) => { if (!management) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); return management.read(secret, context); }, managementAvailability: (secret, date, context) => { if (!management) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); return management.availability(secret, date, context); }, managementReschedule: (secret, input, context) => { if (!management) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); return management.reschedule(secret, input, context); }, managementCancel: (secret, context) => { if (!management) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); return management.cancel(secret, context); } });
  } catch {
    return unavailableRuntime();
  }
}

export function getBookingRuntime() {
  if (!globalThis[RUNTIME]) globalThis[RUNTIME] = createBookingRuntime();
  return globalThis[RUNTIME];
}
