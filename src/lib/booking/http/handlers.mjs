import 'server-only';

import { BookingError, asBookingError } from '../orchestration/errors.mjs';

const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
function response(status, body, retryAfter) { return new Response(JSON.stringify(body), { status, headers: { ...headers, ...(Number.isInteger(retryAfter) && retryAfter >= 1 && retryAfter <= 300 ? { 'Retry-After': String(retryAfter) } : {}) } }); }
function errorResponse(error) { const safe = asBookingError(error); return response(safe.status, { ok: false, error: { code: safe.code } }, safe.retryAfter); }
function exactQuery(url) { const keys = [...url.searchParams.keys()]; if (keys.length !== 2 || keys.some((key) => key !== 'serviceId' && key !== 'date') || keys.filter((key) => key === 'serviceId').length !== 1 || keys.filter((key) => key === 'date').length !== 1) throw new BookingError('INVALID_REQUEST', 400); return { serviceId: url.searchParams.get('serviceId'), date: url.searchParams.get('date') }; }

export function createAvailabilityHandler(runtime, { getRequestContext = () => undefined } = {}) {
  return async function availability(request) { try { const result = await runtime.availability(exactQuery(new URL(request.url)), getRequestContext(request)); return response(200, { ok: true, availability: { serviceId: result.serviceId, date: result.date, starts: result.starts } }); } catch (error) { return errorResponse(error); } };
}
function isJsonMediaType(value) {
  if (typeof value !== 'string') return false;
  const [type, ...parameters] = value.split(';').map((part) => part.trim());
  if (type.toLowerCase() !== 'application/json') return false;
  return parameters.every((parameter) => /^[!#$%&'*+.^_`|~0-9A-Za-z-]+=(?:[!#$%&'*+.^_`|~0-9A-Za-z-]+|"[\t !#-\[\]-~-ÿ]*")$/.test(parameter));
}
async function readBoundedBody(request, maximum) {
  const reader = request.body?.getReader(); if (!reader) return '';
  const chunks = []; let size = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > maximum) { await reader.cancel(); throw new BookingError('REQUEST_TOO_LARGE', 413); } chunks.push(value); } } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { throw new BookingError('INVALID_REQUEST', 400); }
}
export function createBookingHandler(runtime, { maxBodyBytes = 4096, getRequestContext = () => undefined } = {}) {
  if (!Number.isInteger(maxBodyBytes) || maxBodyBytes < 1 || maxBodyBytes > 65_536) throw new TypeError('maxBodyBytes must be a bounded integer.');
  return async function booking(request) {
    try {
      if (!isJsonMediaType(request.headers.get('content-type'))) throw new BookingError('UNSUPPORTED_MEDIA_TYPE', 415);
      const length = request.headers.get('content-length'); if (length && (!/^\d+$/.test(length) || Number(length) > maxBodyBytes)) throw new BookingError('REQUEST_TOO_LARGE', 413);
      const text = await readBoundedBody(request, maxBodyBytes);
      let input; try { input = JSON.parse(text); } catch { throw new BookingError('INVALID_REQUEST', 400); }
      const key = request.headers.get('idempotency-key'); const result = await runtime.book(input, key, getRequestContext(request));
      if (!result || result.status !== 'confirmed' || typeof result.serviceId !== 'string' || typeof result.start !== 'string' || typeof result.end !== 'string' || !['not_requested', 'requested', 'unknown'].includes(result.notification)) throw new BookingError('CALENDAR_UNAVAILABLE', 503);
      return response(201, { ok: true, booking: { status: 'confirmed', serviceId: result.serviceId, start: result.start, end: result.end, notification: result.notification } });
    } catch (error) { return errorResponse(error); }
  };
}
