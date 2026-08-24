import 'server-only';

import { BookingError, asBookingError } from '../orchestration/errors.mjs';

const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
function response(status, body, retryAfter) { return new Response(JSON.stringify(body), { status, headers: { ...headers, ...(Number.isInteger(retryAfter) && retryAfter >= 1 && retryAfter <= 300 ? { 'Retry-After': String(retryAfter) } : {}) } }); }
function errorResponse(error) { const safe = asBookingError(error); return response(safe.status, { ok: false, error: { code: safe.code } }, safe.retryAfter); }
function exactQuery(url) { const keys = [...url.searchParams.keys()]; if (keys.length !== 2 || keys.some((key) => key !== 'serviceId' && key !== 'date') || keys.filter((key) => key === 'serviceId').length !== 1 || keys.filter((key) => key === 'date').length !== 1) throw new BookingError('INVALID_REQUEST', 400); return { serviceId: url.searchParams.get('serviceId'), date: url.searchParams.get('date') }; }
const BOOKING_INPUT_KEYS = new Set(['serviceId', 'start', 'name', 'phone', 'email']);
function exactBookingInput(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype || Object.keys(value).some((key) => !BOOKING_INPUT_KEYS.has(key))) throw new BookingError('INVALID_REQUEST', 400);
  return value;
}

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
      const key = request.headers.get('idempotency-key'); const result = await runtime.book(exactBookingInput(input), key, getRequestContext(request));
      if (!result || result.status !== 'confirmed' || typeof result.serviceId !== 'string' || typeof result.start !== 'string' || typeof result.end !== 'string' || !['requested', 'unknown'].includes(result.notification)) throw new BookingError('CALENDAR_UNAVAILABLE', 503);
      return response(201, { ok: true, booking: { status: 'confirmed', serviceId: result.serviceId, start: result.start, end: result.end, notification: result.notification } });
    } catch (error) { return errorResponse(error); }
  };
}

function managementSecret(request) {
  const value = request.headers.get('authorization'); const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(value ?? '');
  if (!match) throw new BookingError('MANAGEMENT_UNAVAILABLE', 404); return match[1];
}
function exactManagementDate(url) { const keys = [...url.searchParams.keys()]; if (keys.length !== 1 || keys[0] !== 'date' || !/^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('date') ?? '')) throw new BookingError('INVALID_REQUEST', 400); return url.searchParams.get('date'); }
export function createBookingManagementHandlers(runtime, { getRequestContext = () => undefined, maxBodyBytes = 512 } = {}) {
  const context = (request) => getRequestContext(request);
  const safeBooking = (booking) => { if (!booking || typeof booking !== 'object' || !['confirmed', 'cancelled'].includes(booking.status) || typeof booking.serviceId !== 'string' || typeof booking.start !== 'string' || typeof booking.end !== 'string' || typeof booking.canReschedule !== 'boolean') throw new BookingError('BOOKING_UNKNOWN', 503); return { serviceId: booking.serviceId, start: booking.start, end: booking.end, status: booking.status, canReschedule: booking.canReschedule }; };
  const read = async (request) => { try { if (new URL(request.url).search) throw new BookingError('INVALID_REQUEST', 400); const booking = safeBooking(await runtime.managementRead(managementSecret(request), context(request))); return response(200, { ok: true, booking }); } catch (error) { return errorResponse(error); } };
  const availability = async (request) => { try { const secret = managementSecret(request); const result = await runtime.managementAvailability(secret, exactManagementDate(new URL(request.url)), context(request)); return response(200, { ok: true, availability: { serviceId: result.serviceId, date: result.date, starts: result.starts } }); } catch (error) { return errorResponse(error); } };
  const reschedule = async (request) => { try { if (new URL(request.url).search) throw new BookingError('INVALID_REQUEST', 400); const secret = managementSecret(request); if (!isJsonMediaType(request.headers.get('content-type'))) throw new BookingError('UNSUPPORTED_MEDIA_TYPE', 415); const text = await readBoundedBody(request, maxBodyBytes); let body; try { body = JSON.parse(text); } catch { throw new BookingError('INVALID_REQUEST', 400); } if (!body || Object.getPrototypeOf(body) !== Object.prototype || Object.keys(body).length !== 1 || typeof body.start !== 'string') throw new BookingError('INVALID_REQUEST', 400); const booking = safeBooking(await runtime.managementReschedule(secret, { start: body.start }, context(request))); return response(200, { ok: true, booking }); } catch (error) { return errorResponse(error); } };
  const cancel = async (request) => { try { if (new URL(request.url).search) throw new BookingError('INVALID_REQUEST', 400); const secret = managementSecret(request); const length = request.headers.get('content-length'); if (length && length !== '0') throw new BookingError('INVALID_REQUEST', 400); if (request.body) { const body = await readBoundedBody(request, 1); if (body) throw new BookingError('INVALID_REQUEST', 400); } const booking = safeBooking(await runtime.managementCancel(secret, context(request))); return response(200, { ok: true, booking }); } catch (error) { return errorResponse(error); } };
  return Object.freeze({ read, availability, reschedule, cancel });
}
