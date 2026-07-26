import 'server-only';

import { getGoogleCalendarConfig } from '../google/config.mjs';

const SECRET = /^[^\s\x00-\x1f]{16,}$/;
const URL_VALUE = /^https:\/\/[^\s\x00-\x1f]+$/;

function required(env, name, pattern = /\S/) {
  const value = env?.[name];
  if (typeof value !== 'string' || value !== value.trim() || !pattern.test(value)) throw new TypeError('Production booking configuration is invalid.');
  return value;
}

function integer(env, name, minimum, maximum) {
  const value = required(env, name, /^\d+$/);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) throw new TypeError('Production booking configuration is invalid.');
  return parsed;
}

export function isProductionBookingEnabled(env = process.env, nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === 'production' && env?.BOOKING_PRODUCTION_ENABLED === '1' && env?.VERCEL === '1';
}

export function getProductionBookingConfig(env = process.env, nodeEnv = process.env.NODE_ENV) {
  if (!isProductionBookingEnabled(env, nodeEnv)) throw new TypeError('Production booking is not enabled.');
  const lockTimeoutMs = integer(env, 'BOOKING_LOCK_TIMEOUT_MS', 1, 30_000);
  const lockLeaseMs = integer(env, 'BOOKING_LOCK_LEASE_MS', 1_000, 120_000);
  const providerOperationBudgetMs = integer(env, 'BOOKING_PROVIDER_OPERATION_BUDGET_MS', 1_000, 120_000);
  const leaseSafetyMs = integer(env, 'BOOKING_LEASE_SAFETY_MS', 100, 30_000);
  if (lockLeaseMs <= providerOperationBudgetMs + leaseSafetyMs) throw new TypeError('Production booking configuration is invalid.');
  try { getGoogleCalendarConfig(env); } catch { throw new TypeError('Production booking configuration is invalid.'); }
  return Object.freeze({
    redisUrl: required(env, 'UPSTASH_REDIS_REST_URL', URL_VALUE),
    redisToken: required(env, 'UPSTASH_REDIS_REST_TOKEN', SECRET),
    requestHmacSecret: required(env, 'BOOKING_REQUEST_HMAC_SECRET', SECRET),
    policy: Object.freeze({
      leadTimeMinutes: integer(env, 'BOOKING_LEAD_TIME_MINUTES', 0, 10_080),
      bookingHorizonDays: integer(env, 'BOOKING_HORIZON_DAYS', 0, 730),
      idempotencyTtlSeconds: integer(env, 'BOOKING_IDEMPOTENCY_TTL_SECONDS', 60, 2_592_000),
      lockTimeoutMs,
      lockLeaseMs,
      providerOperationBudgetMs,
      leaseSafetyMs,
    }),
    ratePolicy: Object.freeze({
      availability: Object.freeze({
        limit: integer(env, 'BOOKING_RATE_LIMIT_AVAILABILITY_LIMIT', 1, 10_000),
        windowMs: integer(env, 'BOOKING_RATE_LIMIT_AVAILABILITY_WINDOW_SECONDS', 1, 3_600) * 1000,
      }),
      booking: Object.freeze({
        limit: integer(env, 'BOOKING_RATE_LIMIT_BOOKING_LIMIT', 1, 10_000),
        windowMs: integer(env, 'BOOKING_RATE_LIMIT_BOOKING_WINDOW_SECONDS', 1, 3_600) * 1000,
      }),
    }),
  });
}
