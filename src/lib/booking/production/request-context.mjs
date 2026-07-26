import 'server-only';

import { createHmac } from 'node:crypto';

import { BookingError } from '../orchestration/errors.mjs';
import { getProductionBookingConfig, isProductionBookingEnabled } from './config.mjs';

function clientAddress(request) {
  const header = request?.headers?.get?.('x-vercel-forwarded-for');
  if (typeof header !== 'string') throw new TypeError('Trusted request context is unavailable.');
  const value = header.split(',')[0]?.trim();
  if (!value || value.length > 128 || /[\x00-\x1f\x7f\s]/.test(value)) throw new TypeError('Trusted request context is unavailable.');
  return value;
}

export function getProductionRequestContext(request, { env = process.env, nodeEnv = process.env.NODE_ENV } = {}) {
  if (!isProductionBookingEnabled(env, nodeEnv)) return undefined;
  try {
    const { requestHmacSecret } = getProductionBookingConfig(env, nodeEnv);
    return Object.freeze({ subjectDigest: createHmac('sha256', requestHmacSecret).update(clientAddress(request), 'utf8').digest('hex') });
  } catch {
    throw new BookingError('BOOKING_NOT_CONFIGURED', 503);
  }
}
