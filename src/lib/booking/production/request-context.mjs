import 'server-only';

import { createHmac } from 'node:crypto';
import { getContext } from '@netlify/functions';

import { BookingError } from '../orchestration/errors.mjs';
import { getProductionBookingConfig, isProductionBookingEnabled } from './config.mjs';

function trustedVercelClientAddress(request) {
  const header = request?.headers?.get?.('x-vercel-forwarded-for');
  if (typeof header !== 'string') throw new TypeError('Trusted request context is unavailable.');
  const value = header.split(',')[0]?.trim();
  if (!value || value.length > 128 || /[\x00-\x1f\x7f\s]/.test(value)) throw new TypeError('Trusted request context is unavailable.');
  return value;
}

function trustedNetlifyClientAddress(getNetlifyContext) {
  const value = getNetlifyContext()?.ip;
  if (typeof value !== 'string' || !value || value !== value.trim() || value.length > 128 || /[\x00-\x1f\x7f\s,]/.test(value)) throw new TypeError('Trusted request context is unavailable.');
  return value;
}

export function getProductionRequestContext(request, {
  env = process.env,
  nodeEnv = process.env.NODE_ENV,
  getNetlifyContext = getContext,
} = {}) {
  if (!isProductionBookingEnabled(env, nodeEnv)) return undefined;
  try {
    const { platform, requestHmacSecret } = getProductionBookingConfig(env, nodeEnv);
    const address = platform === 'vercel'
      ? trustedVercelClientAddress(request)
      : trustedNetlifyClientAddress(getNetlifyContext);
    return Object.freeze({ subjectDigest: createHmac('sha256', requestHmacSecret).update(address, 'utf8').digest('hex') });
  } catch {
    throw new BookingError('BOOKING_NOT_CONFIGURED', 503);
  }
}
