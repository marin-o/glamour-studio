import { SERVICES, getServiceOccupancyMinutes } from '../services.mjs';

const serviceById = new Map(SERVICES.map((service) => [service.id, service]));
const MAX_RESPONSE_BYTES = 16 * 1024;
const JSON_MEDIA = /^application\/json(?:\s*;\s*[!#$%&'*+.^_`|~0-9A-Za-z-]+=(?:[!#$%&'*+.^_`|~0-9A-Za-z-]+|"[^"\\]*"))*\s*$/iu;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.000)?Z$/u;
const DATE = /^\d{4}-\d{2}-\d{2}$/u;
const MANAGEMENT_SECRET = /^[A-Za-z0-9_-]{43}$/u;
const errorSchemas = Object.freeze({
  400: new Set(['INVALID_REQUEST', 'INVALID_IDEMPOTENCY_KEY']),
  409: new Set(['SLOT_UNAVAILABLE', 'IDEMPOTENCY_MISMATCH']),
  413: new Set(['REQUEST_TOO_LARGE']),
  415: new Set(['UNSUPPORTED_MEDIA_TYPE']),
  429: new Set(['RATE_LIMITED']),
  503: new Set(['BOOKING_NOT_CONFIGURED', 'BOOKING_UNAVAILABLE', 'CALENDAR_UNAVAILABLE', 'BOOKING_UNKNOWN']),
});
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const exactKeys = (value, keys) => value && Object.getPrototypeOf(value) === Object.prototype && Object.keys(value).length === keys.length && keys.every((key) => own(value, key));
const canonicalInstant = (value) => {
  if (typeof value !== 'string' || !INSTANT.test(value) || Number.isNaN(Date.parse(value))) return false;
  const milliseconds = new Date(value).toISOString();
  return value === milliseconds || value === milliseconds.replace('.000Z', 'Z');
};
const strictDate = (value) => typeof value === 'string' && DATE.test(value) && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
const expectedEnd = (start, serviceId) => {
  const end = new Date(Date.parse(start) + getServiceOccupancyMinutes(serviceId) * 60_000).toISOString();
  return start.endsWith('.000Z') ? end : end.replace('.000Z', 'Z');
};

const safeManagementErrorSchemas = Object.freeze({
  400: new Set(['INVALID_REQUEST']),
  404: new Set(['MANAGEMENT_UNAVAILABLE']),
  409: new Set(['SLOT_UNAVAILABLE', 'RESCHEDULE_CUTOFF', 'CANCELLATION_CUTOFF', 'BOOKING_UNKNOWN']),
  429: new Set(['RATE_LIMITED']),
  503: new Set(['BOOKING_UNAVAILABLE', 'CALENDAR_UNAVAILABLE', 'BOOKING_UNKNOWN']),
});

const resolveCapability = (value) => {
  const capability = typeof value === 'function' ? value() : value;
  return typeof capability === 'string' && MANAGEMENT_SECRET.test(capability) ? capability : '';
};

function managementError(response, body) {
  const permitted = safeManagementErrorSchemas[response.status];
  if (!permitted || !exactKeys(body, ['ok', 'error']) || body.ok !== false || !exactKeys(body.error, ['code']) || !permitted.has(body.error.code)) {
    return unavailable('provider');
  }
  if (body.error.code === 'MANAGEMENT_UNAVAILABLE' || response.status === 404) return unavailable('safe');
  if (body.error.code === 'SLOT_UNAVAILABLE') return unavailable('conflict');
  if (body.error.code === 'RESCHEDULE_CUTOFF') return unavailable('cutoff');
  if (body.error.code === 'CANCELLATION_CUTOFF') return unavailable('cancellationCutoff');
  if (body.error.code === 'BOOKING_UNKNOWN') return unavailable('unknown');
  if (body.error.code === 'RATE_LIMITED') return unavailable('rateLimited');
  if (body.error.code === 'INVALID_REQUEST') return unavailable('invalid');
  return unavailable('provider');
}

function safeManagementBooking(body) {
  const booking = body?.booking;
  if (!exactKeys(body, ['ok', 'booking']) || body.ok !== true || !booking || !exactKeys(booking, ['serviceId', 'start', 'end', 'status', 'canReschedule'])) return null;
  if (!serviceById.has(booking.serviceId) || !['confirmed', 'cancelled'].includes(booking.status) || typeof booking.canReschedule !== 'boolean' || !canonicalInstant(booking.start) || !canonicalInstant(booking.end) || booking.end <= booking.start || booking.end !== expectedEnd(booking.start, booking.serviceId)) return null;
  return { ok: true, booking: { serviceId: booking.serviceId, start: booking.start, end: booking.end, status: booking.status, canReschedule: booking.canReschedule } };
}

function safeManagementAvailability(body, date) {
  const availability = body?.availability;
  if (!exactKeys(body, ['ok', 'availability']) || body.ok !== true || !availability || !exactKeys(availability, ['serviceId', 'date', 'starts']) || !serviceById.has(availability.serviceId) || availability.date !== date || !Array.isArray(availability.starts) || !availability.starts.every(canonicalInstant)) return null;
  return { ok: true, availability: { serviceId: availability.serviceId, date: availability.date, starts: availability.starts } };
}

function unavailable(kind = 'unavailable') { return { ok: false, kind }; }
function contentIsJson(response) { return JSON_MEDIA.test(response.headers.get('content-type') ?? ''); }
async function boundedJson(response) {
  if (!contentIsJson(response) || !response.body) return null;
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_RESPONSE_BYTES) { await reader.cancel(); return null; } chunks.push(value); } }
  catch { return null; } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { return null; }
}
function publicError(response, body) {
  const permitted = errorSchemas[response.status];
  if (!permitted || !exactKeys(body, ['ok', 'error']) || body.ok !== false || !exactKeys(body.error, ['code']) || !permitted.has(body.error.code)) return unavailable();
  if (response.status === 409 && body.error.code === 'SLOT_UNAVAILABLE') return unavailable('taken');
  if (response.status === 429) return unavailable('rateLimited');
  if (response.status === 400 || response.status === 409 || response.status === 413 || response.status === 415) return unavailable('invalid');
  if (body.error.code === 'BOOKING_NOT_CONFIGURED') return unavailable('notConfigured');
  return unavailable();
}
function successAvailability(body, serviceId, date) {
  return exactKeys(body, ['ok', 'availability']) && body.ok === true && exactKeys(body.availability, ['serviceId', 'date', 'starts'])
    && body.availability.serviceId === serviceId && body.availability.date === date && Array.isArray(body.availability.starts)
    && body.availability.starts.every(canonicalInstant) ? { ok: true, starts: body.availability.starts } : null;
}
function successBooking(body, serviceId, start) {
  const booking = body?.booking;
  return exactKeys(body, ['ok', 'booking']) && body.ok === true && exactKeys(booking, ['status', 'serviceId', 'start', 'end', 'notification'])
    && booking.status === 'confirmed' && serviceById.has(booking.serviceId) && booking.serviceId === serviceId
    && canonicalInstant(booking.start) && booking.start === start && canonicalInstant(booking.end) && booking.end === expectedEnd(start, serviceId)
    && ['requested', 'unknown'].includes(booking.notification)
    ? { ok: true, booking: { serviceId: booking.serviceId, start: booking.start, notification: booking.notification } } : null;
}
function secureKey(cryptoApi = globalThis.crypto) {
  if (typeof cryptoApi?.randomUUID === 'function') { const key = cryptoApi.randomUUID(); if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(key)) return key; }
  if (typeof cryptoApi?.getRandomValues === 'function') { const bytes = new Uint8Array(16); cryptoApi.getRandomValues(bytes); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128; return [...bytes].map((byte, index) => `${byte.toString(16).padStart(2, '0')}${[3, 5, 7, 9].includes(index) ? '-' : ''}`).join(''); }
  return '';
}
function withDeadline(fetcher, input, init, signal, timeoutMs) {
  const controller = new AbortController(); let timedOut = false;
  const abort = () => controller.abort(); signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  return { request: fetcher(input, { ...init, signal: controller.signal }), timedOut: () => timedOut, finish: () => { clearTimeout(timer); signal?.removeEventListener('abort', abort); } };
}

export function createBookingApi({ fetch: injectedFetch, crypto = globalThis.crypto, timeoutMs = 10_000, managementSecret, capability } = {}) {
  if (typeof injectedFetch !== 'function') throw new TypeError('An injected fetch implementation is required.');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 30_000) throw new TypeError('timeoutMs must be bounded.');
  const getCapability = () => resolveCapability(capability ?? managementSecret);
  const managementRequest = async ({ method = 'GET', path, body, signal, parse }) => {
    const secret = getCapability();
    if (!secret) return unavailable('safe');
    const headers = { Accept: 'application/json', Authorization: `Bearer ${secret}` };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    const deadline = withDeadline(injectedFetch, path, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }, signal, timeoutMs);
    let response;
    try {
      response = await deadline.request;
    } catch (error) {
      const timedOut = deadline.timedOut();
      deadline.finish();
      return timedOut ? unavailable('timeout') : error?.name === 'AbortError' ? unavailable('aborted') : unavailable('network');
    }
    const responseBody = await boundedJson(response);
    const timedOut = deadline.timedOut();
    const externallyAborted = Boolean(signal?.aborted);
    deadline.finish();
    if (timedOut) return unavailable('timeout');
    if (externallyAborted) return unavailable('aborted');
    const result = parse(responseBody);
    return result ?? managementError(response, responseBody);
  };

  return {
    createKey: () => secureKey(crypto),
    async availability({ serviceId, date, signal }) {
      if (!serviceById.has(serviceId) || !strictDate(date)) return unavailable('invalid');
      const deadline = withDeadline(injectedFetch, `/api/booking/availability?${new URLSearchParams({ serviceId, date })}`, { headers: { Accept: 'application/json' } }, signal, timeoutMs);
      let response; try { response = await deadline.request; } catch (error) { const timedOut = deadline.timedOut(); deadline.finish(); return timedOut ? unavailable('timeout') : error?.name === 'AbortError' ? unavailable('aborted') : unavailable('network'); }
      const body = await boundedJson(response); const timedOut = deadline.timedOut(); const externallyAborted = Boolean(signal?.aborted); deadline.finish(); return timedOut ? unavailable('timeout') : externallyAborted ? unavailable('aborted') : successAvailability(body, serviceId, date) ?? publicError(response, body);
    },
    async book({ serviceId, start, name, phone, email, idempotencyKey, signal }) {
      if (!serviceById.has(serviceId) || !canonicalInstant(start) || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email) || typeof idempotencyKey !== 'string' || idempotencyKey.length < 8) return unavailable('invalid');
      const payload = { serviceId, start, name, phone, email };
      const deadline = withDeadline(injectedFetch, '/api/booking', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }, body: JSON.stringify(payload) }, signal, timeoutMs);
      let response; try { response = await deadline.request; } catch { const timedOut = deadline.timedOut(); deadline.finish(); return timedOut ? unavailable('timeout') : unavailable('network'); }
      const body = await boundedJson(response); const timedOut = deadline.timedOut(); const externallyAborted = Boolean(signal?.aborted); deadline.finish(); return timedOut ? unavailable('timeout') : externallyAborted ? unavailable('aborted') : successBooking(body, serviceId, start) ?? publicError(response, body);
    },
    async managementRead({ signal } = {}) {
      return managementRequest({ signal, path: '/api/booking/manage', parse: safeManagementBooking });
    },
    async managementAvailability({ date, signal } = {}) {
      const secret = getCapability();
      if (!secret || !strictDate(date)) return unavailable(secret ? 'invalid' : 'safe');
      return managementRequest({ signal, path: `/api/booking/manage/availability?${new URLSearchParams({ date })}`, parse: (body) => safeManagementAvailability(body, date) });
    },
    async managementReschedule({ start, signal } = {}) {
      if (!canonicalInstant(start)) return unavailable('invalid');
      return managementRequest({ method: 'PATCH', path: '/api/booking/manage', body: { start }, signal, parse: safeManagementBooking });
    },
    async managementCancel({ signal } = {}) {
      return managementRequest({ method: 'DELETE', path: '/api/booking/manage', signal, parse: safeManagementBooking });
    },
  };
}
