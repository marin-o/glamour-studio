import 'server-only';

import { createHash } from 'node:crypto';
import { Temporal } from '@js-temporal/polyfill';

import { normalizeBusyIntervals } from '../availability.mjs';
import { STUDIO_TIME_ZONE } from '../studio-rules.mjs';
import { getGoogleCalendarConfig } from './config.mjs';
import { GoogleCalendarError, googleErrorFromResponse } from './errors.mjs';

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';
const EVENT_ID = /^[a-v0-9]{5,1024}$/;
const TOKEN_SKEW_MS = 30_000;
const MAX_TOKEN_TTL_SECONDS = 86_400;
const DEFAULT_TIMEOUT_MS = 8_000;
const PRIVATE_MARKER_KEY = 'bookingIdempotencyDigest';
const PRIVATE_WORK_TRACK_KEY = 'bookingWorkTrack';
const DIGEST_VERSION = 'v1';
const IDEMPOTENCY_MARKER = /^v1:[a-f0-9]{64}$/;
const WORK_TRACKS = new Set(['makeup', 'hair']);

function isPlainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertExactRecord(value, label, keys, required) {
  if (!isPlainRecord(value)) throw new GoogleCalendarError('VALIDATION_FAILED', `${label} must be a plain object.`);
  for (const key of Object.keys(value)) if (!keys.has(key)) throw new GoogleCalendarError('VALIDATION_FAILED', `${label} contains an unknown field.`);
  for (const key of required) if (!Object.hasOwn(value, key)) throw new GoogleCalendarError('VALIDATION_FAILED', `${label} is incomplete.`);
}

function parseInstant(value, label, source = 'caller') {
  if (typeof value !== 'string') throw new GoogleCalendarError(source === 'caller' ? 'VALIDATION_FAILED' : 'GOOGLE_REQUEST_FAILED', `${label} must be an ISO instant.`);
  try { return Temporal.Instant.from(value); } catch { throw new GoogleCalendarError(source === 'caller' ? 'VALIDATION_FAILED' : 'GOOGLE_REQUEST_FAILED', `${label} must be an ISO instant.`); }
}

function assertEventId(eventId) {
  if (typeof eventId !== 'string' || !EVENT_ID.test(eventId)) throw new GoogleCalendarError('VALIDATION_FAILED', 'Google Calendar event ID is invalid.');
}

function digest(value) { return createHash('sha256').update(value, 'utf8').digest('hex'); }
function idempotencyMarker(key) { return `${DIGEST_VERSION}:${digest(key)}`; }

export function eventIdFromIdempotencyKey(key) {
  if (typeof key !== 'string' || key.length < 8 || key.length > 512 || key !== key.trim()) throw new GoogleCalendarError('VALIDATION_FAILED', 'Idempotency key is invalid.');
  // Google IDs use lowercase base32hex-compatible characters; hex is a subset.
  return `b${digest(`${DIGEST_VERSION}:${key}`)}`;
}

function providerFailure(message = 'Google Calendar returned invalid data.') { return new GoogleCalendarError('GOOGLE_REQUEST_FAILED', message); }

function verifiedEvent(event, expected) {
  if (!isPlainRecord(event) || event.id !== expected.eventId || event.visibility !== 'private'
    || typeof event.status !== 'string' || event.status === 'cancelled'
    || event.summary !== expected.summary || event.description !== expected.description
    || event.extendedProperties?.private?.[PRIVATE_MARKER_KEY] !== expected.marker
    || event.extendedProperties?.private?.[PRIVATE_WORK_TRACK_KEY] !== expected.workTrack) {
    throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar event verification did not match the requested appointment.');
  }
  const start = parseInstant(event.start?.dateTime, 'Google event start', 'provider');
  const end = parseInstant(event.end?.dateTime, 'Google event end', 'provider');
  if (Temporal.Instant.compare(start, expected.start) !== 0 || Temporal.Instant.compare(end, expected.end) !== 0) {
    throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar event verification did not match the requested appointment.');
  }
  return Object.freeze({ id: event.id, start: start.toString(), end: end.toString(), status: event.status });
}

function workTrackForEvent(event) {
  const properties = event.extendedProperties?.private;
  return event.visibility === 'private' && IDEMPOTENCY_MARKER.test(properties?.[PRIVATE_MARKER_KEY]) && WORK_TRACKS.has(properties?.[PRIVATE_WORK_TRACK_KEY])
    ? properties[PRIVATE_WORK_TRACK_KEY]
    : 'unknown';
}

function normalizedAttendees(event) {
  if (!isPlainRecord(event) || (event.attendees !== undefined && !Array.isArray(event.attendees))) throw providerFailure();
  return (event.attendees ?? []).map((attendee) => {
    if (!isPlainRecord(attendee) || typeof attendee.email !== 'string' || !attendee.email.trim()) throw providerFailure();
    return attendee;
  });
}

function managedSnapshot(event, expected) {
  if (!isPlainRecord(event) || event.id !== expected.eventId || event.visibility !== 'private' || event.status === 'cancelled'
    || typeof event.etag !== 'string' || !event.etag || event.extendedProperties?.private?.[PRIVATE_MARKER_KEY] !== expected.marker
    || event.extendedProperties?.private?.[PRIVATE_WORK_TRACK_KEY] !== expected.workTrack) throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar event verification did not match the managed appointment.');
  const start = parseInstant(event.start?.dateTime, 'Google event start', 'provider'); const end = parseInstant(event.end?.dateTime, 'Google event end', 'provider');
  if (Temporal.Instant.compare(start, Temporal.Instant.from(expected.start)) !== 0 || Temporal.Instant.compare(end, Temporal.Instant.from(expected.end)) !== 0) throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar event verification did not match the managed appointment.');
  const attendees = normalizedAttendees(event).filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(item.email));
  if (attendees.length !== 1 || (expected.attendee && attendees[0].email.toLocaleLowerCase('en-US') !== expected.attendee.toLocaleLowerCase('en-US'))) throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar attendee verification did not match the managed appointment.');
  return Object.freeze({ email: attendees[0].email, etag: event.etag });
}

function cancelledManagedSnapshot(event, expected) {
  const mismatch = () => { throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar event verification did not match the managed appointment.'); };
  if (!isPlainRecord(event) || event.id !== expected.eventId || typeof event.status !== 'string') mismatch();
  const retainedPrivate = event.extendedProperties?.private;
  if (event.visibility !== undefined && event.visibility !== 'private'
    || event.extendedProperties !== undefined && (!isPlainRecord(event.extendedProperties) || retainedPrivate !== undefined && !isPlainRecord(retainedPrivate))
    || retainedPrivate?.[PRIVATE_MARKER_KEY] !== undefined && retainedPrivate[PRIVATE_MARKER_KEY] !== expected.marker
    || retainedPrivate?.[PRIVATE_WORK_TRACK_KEY] !== undefined && retainedPrivate[PRIVATE_WORK_TRACK_KEY] !== expected.workTrack) mismatch();
  const retainedTimeMatches = (value, target, label) => {
    if (value === undefined) return true;
    const actual = parseInstant(value?.dateTime, label, 'provider');
    return Temporal.Instant.compare(actual, Temporal.Instant.from(target)) === 0;
  };
  if (!retainedTimeMatches(event.start, expected.start, 'Google event start') || !retainedTimeMatches(event.end, expected.end, 'Google event end')) mismatch();
  // Google may return a sparse deletion tombstone. A non-cancelled event is
  // only safe evidence when it retains the complete managed identity.
  if (event.status === 'cancelled') return Object.freeze({ cancelled: true });
  if (event.visibility !== 'private' || retainedPrivate?.[PRIVATE_MARKER_KEY] !== expected.marker
    || retainedPrivate?.[PRIVATE_WORK_TRACK_KEY] !== expected.workTrack || event.start === undefined || event.end === undefined) mismatch();
  return Object.freeze({ cancelled: false });
}

export function createGoogleCalendarAdapter(options = {}) {
  assertExactRecord(options, 'Google Calendar adapter options', new Set(['env', 'fetch', 'now', 'timeoutMs']), []);
  const { env = process.env, fetch: injectedFetch = globalThis.fetch, now = () => Date.now(), timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const config = getGoogleCalendarConfig(env);
  if (typeof injectedFetch !== 'function' || typeof now !== 'function' || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) throw new GoogleCalendarError('CONFIGURATION_INVALID', 'Google Calendar adapter configuration is invalid.');
  let token = null;
  let generation = 0;
  let refreshInFlight = null;

  function deadlineFailure() { return new GoogleCalendarError('TRANSPORT_FAILED', 'Google Calendar could not be reached.', { retryable: true }); }
  async function withinDeadline(operation, value) {
    if (operation.signal.aborted) throw deadlineFailure();
    return Promise.race([value, operation.expired]);
  }
  async function runOperation(work) {
    const controller = new AbortController();
    let rejectDeadline;
    const expired = new Promise((_, reject) => { rejectDeadline = reject; });
    const timer = setTimeout(() => { controller.abort(); rejectDeadline(deadlineFailure()); }, timeoutMs);
    try { return await Promise.race([work({ signal: controller.signal, expired }), expired]); }
    finally { clearTimeout(timer); }
  }
  async function request(operation, url, init) {
    try { return await withinDeadline(operation, injectedFetch(url, { ...init, signal: operation.signal })); }
    catch { throw new GoogleCalendarError('TRANSPORT_FAILED', 'Google Calendar could not be reached.', { retryable: true }); }
  }

  async function refreshAccessToken(rejectedGeneration, operation) {
    if (token && token.expiresAt > now() + TOKEN_SKEW_MS && (rejectedGeneration === undefined || token.generation > rejectedGeneration)) return token;
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
      const response = await request(operation, OAUTH_TOKEN_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', client_id: config.clientId, client_secret: config.clientSecret, refresh_token: config.refreshToken }).toString() });
      if (!response.ok) throw new GoogleCalendarError('AUTHORIZATION_FAILED', 'Google Calendar authorization failed.', { status: response.status });
      let payload;
      try { payload = await withinDeadline(operation, response.json()); } catch { throw new GoogleCalendarError('AUTHORIZATION_FAILED', 'Google Calendar authorization failed.'); }
      if (!isPlainRecord(payload) || typeof payload.access_token !== 'string' || !payload.access_token.trim() || !Number.isInteger(payload.expires_in) || payload.expires_in < 1 || payload.expires_in > MAX_TOKEN_TTL_SECONDS) throw new GoogleCalendarError('AUTHORIZATION_FAILED', 'Google Calendar authorization failed.');
      token = { accessToken: payload.access_token, expiresAt: now() + payload.expires_in * 1000, generation: ++generation };
      return token;
    })();
    try { return await withinDeadline(operation, refreshInFlight); } finally { refreshInFlight = null; }
  }

  async function api(operation, path, init = {}) {
    let activeToken = await refreshAccessToken(undefined, operation);
    let response = await request(operation, `${CALENDAR_API_URL}${path}`, { ...init, headers: { accept: 'application/json', ...init.headers, authorization: `Bearer ${activeToken.accessToken}` } });
    if (response.status === 401) {
      activeToken = await refreshAccessToken(activeToken.generation, operation);
      response = await request(operation, `${CALENDAR_API_URL}${path}`, { ...init, headers: { accept: 'application/json', ...init.headers, authorization: `Bearer ${activeToken.accessToken}` } });
    }
    return response;
  }

  async function responseJson(operation, response) {
    try { const payload = await withinDeadline(operation, response.json()); if (!isPlainRecord(payload)) throw new Error(); return payload; } catch (error) { if (error?.code === 'TRANSPORT_FAILED') throw error; throw providerFailure('Google Calendar returned an invalid response.'); }
  }

  async function verifyEvent(expected, operation) {
    assertExactRecord(expected, 'Expected event', new Set(['eventId', 'start', 'end', 'summary', 'description', 'marker', 'workTrack']), ['eventId', 'start', 'end', 'summary', 'description', 'marker', 'workTrack']);
    assertEventId(expected.eventId);
    const response = await api(operation, `/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(expected.eventId)}`);
    if (!response.ok) throw await googleErrorFromResponse(response);
    return verifiedEvent(await responseJson(operation, response), expected);
  }

  async function resolveMutation(expected, outcome, operation) {
    try { return { event: await verifyEvent(expected, operation), outcome }; }
    catch (error) {
      if (error instanceof GoogleCalendarError && error.code === 'VERIFICATION_FAILED') throw error;
      throw new GoogleCalendarError('AMBIGUOUS_MUTATION', 'Google Calendar could not confirm appointment creation.', { retryable: true, operation: 'event-create' });
    }
  }

  async function reconcileCancellation(expected, operation) {
    const response = await api(operation, `/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(expected.eventId)}`);
    if (response.status === 404) return Object.freeze({ cancelled: true });
    if (!response.ok) throw await googleErrorFromResponse(response, 'management-cancel-reconcile');
    return cancelledManagedSnapshot(await responseJson(operation, response), expected);
  }

  return Object.freeze({
    async listBlockingEvents(input) { return runOperation(async (operation) => {
      assertExactRecord(input, 'Blocking event request', new Set(['timeMin', 'timeMax']), ['timeMin', 'timeMax']);
      const timeMin = parseInstant(input.timeMin, 'Blocking event timeMin'); const timeMax = parseInstant(input.timeMax, 'Blocking event timeMax');
      if (Temporal.Instant.compare(timeMax, timeMin) <= 0) throw new GoogleCalendarError('VALIDATION_FAILED', 'Blocking event timeMax must be after timeMin.');
      const blockers = []; let pageToken = undefined; const seenTokens = new Set();
      for (let page = 0; page < 5; page += 1) {
        const query = new URLSearchParams({ timeMin: timeMin.toString(), timeMax: timeMax.toString(), timeZone: STUDIO_TIME_ZONE, singleEvents: 'true', orderBy: 'startTime', maxResults: '250' });
        if (pageToken) query.set('pageToken', pageToken);
        const response = await api(operation, `/calendars/${encodeURIComponent(config.calendarId)}/events?${query}`);
        if (!response.ok) throw await googleErrorFromResponse(response);
        const payload = await responseJson(operation, response);
        if (!Array.isArray(payload.items) || (payload.nextPageToken !== undefined && (typeof payload.nextPageToken !== 'string' || !payload.nextPageToken || payload.nextPageToken.length > 512))) throw providerFailure();
        for (const event of payload.items) {
          if (!isPlainRecord(event) || typeof event.id !== 'string' || !event.id || event.id.length > 1024 || typeof event.status !== 'string' || (event.transparency !== undefined && typeof event.transparency !== 'string')) throw providerFailure();
          if (event.status === 'cancelled' || event.transparency === 'transparent') continue;
          let start; let end; let allDay;
          try {
            const timed = typeof event.start?.dateTime === 'string' && typeof event.end?.dateTime === 'string';
            allDay = typeof event.start?.date === 'string' && typeof event.end?.date === 'string';
            if (timed === allDay) throw new Error();
            start = timed ? parseInstant(event.start.dateTime, 'Google blocker start', 'provider') : Temporal.PlainDate.from(event.start.date).toZonedDateTime({ timeZone: STUDIO_TIME_ZONE }).toInstant();
            end = timed ? parseInstant(event.end.dateTime, 'Google blocker end', 'provider') : Temporal.PlainDate.from(event.end.date).toZonedDateTime({ timeZone: STUDIO_TIME_ZONE }).toInstant();
          } catch { throw providerFailure(); }
          if (Temporal.Instant.compare(end, start) <= 0) throw providerFailure();
          blockers.push(Object.freeze({ id: event.id, start: start.toString(), end: end.toString(), track: workTrackForEvent(event), allDay: allDay }));
        }
        pageToken = payload.nextPageToken;
        if (!pageToken) return Object.freeze(blockers);
        if (seenTokens.has(pageToken)) throw providerFailure('Google Calendar returned a pagination loop.');
        seenTokens.add(pageToken);
      }
      throw providerFailure('Google Calendar returned too many event pages.');
    }); },
    async getBusyIntervals(input) {
      const blockers = await this.listBlockingEvents(input);
      try { return Object.freeze(normalizeBusyIntervals(blockers.map(({ start, end, track }) => ({ start, end, track })))); }
      catch { throw providerFailure('Google Calendar returned invalid event-list data.'); }
    },
    async verifyEvent(input) { return runOperation((operation) => verifyEvent(input, operation)); },
    async reconcilePrivateEvent(input) { return runOperation(async (operation) => {
      assertExactRecord(input, 'Private event', new Set(['idempotencyKey', 'start', 'end', 'summary', 'description', 'workTrack']), ['idempotencyKey', 'start', 'end', 'summary', 'workTrack']);
      const start = parseInstant(input.start, 'Event start'); const end = parseInstant(input.end, 'Event end');
      if (Temporal.Instant.compare(end, start) <= 0 || typeof input.summary !== 'string' || !input.summary.trim() || (input.description !== undefined && typeof input.description !== 'string') || !WORK_TRACKS.has(input.workTrack)) throw new GoogleCalendarError('VALIDATION_FAILED', 'Private event details are invalid.');
      const expected = { eventId: eventIdFromIdempotencyKey(input.idempotencyKey), start, end, summary: input.summary, description: input.description ?? '', marker: idempotencyMarker(input.idempotencyKey), workTrack: input.workTrack };
      return { event: await verifyEvent(expected, operation) };
    }); },
    async createPrivateEvent(input) { return runOperation(async (operation) => {
      assertExactRecord(input, 'Private event', new Set(['idempotencyKey', 'start', 'end', 'summary', 'description', 'workTrack']), ['idempotencyKey', 'start', 'end', 'summary', 'workTrack']);
      const start = parseInstant(input.start, 'Event start'); const end = parseInstant(input.end, 'Event end');
      if (Temporal.Instant.compare(end, start) <= 0 || typeof input.summary !== 'string' || !input.summary.trim() || (input.description !== undefined && typeof input.description !== 'string') || !WORK_TRACKS.has(input.workTrack)) throw new GoogleCalendarError('VALIDATION_FAILED', 'Private event details are invalid.');
      const eventId = eventIdFromIdempotencyKey(input.idempotencyKey);
      const expected = { eventId, start, end, summary: input.summary, description: input.description ?? '', marker: idempotencyMarker(input.idempotencyKey), workTrack: input.workTrack };
      const body = { id: eventId, summary: input.summary, description: expected.description, visibility: 'private', start: { dateTime: start.toString() }, end: { dateTime: end.toString() }, extendedProperties: { private: { [PRIVATE_MARKER_KEY]: expected.marker, [PRIVATE_WORK_TRACK_KEY]: expected.workTrack } } };
      let response;
      try { response = await api(operation, `/calendars/${encodeURIComponent(config.calendarId)}/events?sendUpdates=none`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); }
      catch (error) { if (error.code === 'TRANSPORT_FAILED') return resolveMutation(expected, 'recovered', operation); throw error; }
      if (response.ok) {
        try { return { event: verifiedEvent(await responseJson(operation, response), expected), outcome: 'created' }; }
        catch (error) {
          if (error instanceof GoogleCalendarError && error.code === 'VERIFICATION_FAILED') throw error;
          return resolveMutation(expected, 'created', operation);
        }
      }
      if (response.status === 409) return resolveMutation(expected, 'duplicate', operation);
      if (response.status >= 500) return resolveMutation(expected, 'recovered', operation);
      throw await googleErrorFromResponse(response);
    }); },
    async addOrUpdateAttendee(input) { return runOperation(async (operation) => {
      assertExactRecord(input, 'Attendee update', new Set(['eventId', 'email', 'displayName']), ['eventId', 'email']);
      assertEventId(input.eventId);
      if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || (input.displayName !== undefined && typeof input.displayName !== 'string')) throw new GoogleCalendarError('VALIDATION_FAILED', 'Attendee details are invalid.');
      const path = `/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(input.eventId)}`;
      const existingResponse = await api(operation, path);
      if (!existingResponse.ok) throw await googleErrorFromResponse(existingResponse, 'invitation');
      let attendees;
      try { attendees = normalizedAttendees(await responseJson(operation, existingResponse)); } catch (error) { if (error.code) throw error; throw providerFailure(); }
      const identity = input.email.toLocaleLowerCase('en-US');
      const merged = attendees.filter((attendee) => attendee.email.toLocaleLowerCase('en-US') !== identity);
      merged.push({ email: input.email, ...(input.displayName ? { displayName: input.displayName } : {}) });
      let response;
      try { response = await api(operation, `${path}?sendUpdates=none`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attendees: merged }) }); }
      catch (error) { if (error.code === 'TRANSPORT_FAILED') throw new GoogleCalendarError('AMBIGUOUS_MUTATION', 'Google Calendar could not confirm attendee notification.', { retryable: true, operation: 'invitation' }); throw error; }
      if (!response.ok) throw await googleErrorFromResponse(response, 'invitation');
      // A 2xx PATCH body is not reliable evidence; fetch the stored event.
      let verified;
      try {
        const verifyResponse = await api(operation, path);
        if (!verifyResponse.ok) throw await googleErrorFromResponse(verifyResponse, 'invitation');
        verified = normalizedAttendees(await responseJson(operation, verifyResponse));
      } catch (error) { throw new GoogleCalendarError('AMBIGUOUS_MUTATION', 'Google Calendar could not confirm attendee notification.', { retryable: true, operation: 'invitation' }); }
      if (!verified.some((attendee) => attendee.email.toLocaleLowerCase('en-US') === identity)) throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar attendee verification did not match the requested invitation.', { operation: 'invitation' });
      return Object.freeze({ eventId: input.eventId, notificationPolicy: 'sendUpdates=none' });
    }); },
    async getVerifiedAttendee(input) { return runOperation(async (operation) => {
      assertExactRecord(input, 'Managed event read', new Set(['eventId', 'start', 'end', 'workTrack', 'marker']), ['eventId', 'start', 'end', 'workTrack', 'marker']);
      assertEventId(input.eventId); parseInstant(input.start, 'Event start'); parseInstant(input.end, 'Event end');
      if (!WORK_TRACKS.has(input.workTrack) || typeof input.marker !== 'string' || !IDEMPOTENCY_MARKER.test(input.marker)) throw new GoogleCalendarError('VALIDATION_FAILED', 'Managed event read is invalid.');
      const response = await api(operation, `/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(input.eventId)}`);
      if (!response.ok) throw await googleErrorFromResponse(response, 'management-attendee');
      const event = await responseJson(operation, response);
      return managedSnapshot(event, input);
    }); },
    async reconcileCancelledPrivateEvent(input) { return runOperation(async (operation) => {
      assertExactRecord(input, 'Managed cancellation reconciliation', new Set(['eventId', 'start', 'end', 'workTrack', 'marker']), ['eventId', 'start', 'end', 'workTrack', 'marker']);
      assertEventId(input.eventId); parseInstant(input.start, 'Event start'); parseInstant(input.end, 'Event end');
      if (!WORK_TRACKS.has(input.workTrack) || typeof input.marker !== 'string' || !IDEMPOTENCY_MARKER.test(input.marker)) throw new GoogleCalendarError('VALIDATION_FAILED', 'Managed cancellation reconciliation is invalid.');
      return reconcileCancellation(input, operation);
    }); },
    async reschedulePrivateEvent(input) { return runOperation(async (operation) => {
      assertExactRecord(input, 'Managed event update', new Set(['eventId', 'serviceId', 'workTrack', 'marker', 'previousStart', 'previousEnd', 'attendee', 'etag', 'start', 'end']), ['eventId', 'serviceId', 'workTrack', 'marker', 'previousStart', 'previousEnd', 'attendee', 'etag', 'start', 'end']);
      assertEventId(input.eventId); const start = parseInstant(input.start, 'Event start'); const end = parseInstant(input.end, 'Event end');
      parseInstant(input.previousStart, 'Previous event start'); parseInstant(input.previousEnd, 'Previous event end');
      if (Temporal.Instant.compare(end, start) <= 0 || !WORK_TRACKS.has(input.workTrack) || typeof input.marker !== 'string' || !IDEMPOTENCY_MARKER.test(input.marker) || typeof input.attendee !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(input.attendee) || typeof input.etag !== 'string' || !input.etag) throw new GoogleCalendarError('VALIDATION_FAILED', 'Managed event update is invalid.');
      const path = `/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(input.eventId)}`;
      const verify = async () => {
        const response = await api(operation, path); if (!response.ok) throw await googleErrorFromResponse(response, 'management-reschedule');
        const event = await responseJson(operation, response);
        managedSnapshot(event, { ...input, start: start.toString(), end: end.toString() });
        return Object.freeze({ eventId: input.eventId, start: start.toString(), end: end.toString() });
      };
      try { const response = await api(operation, `${path}?sendUpdates=all`, { method: 'PATCH', headers: { 'content-type': 'application/json', 'if-match': input.etag }, body: JSON.stringify({ start: { dateTime: start.toString() }, end: { dateTime: end.toString() } }) }); if (response.status === 412) throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar event changed before update.'); if (!response.ok) throw await googleErrorFromResponse(response, 'management-reschedule'); return await verify(); }
      catch (error) { if (error instanceof GoogleCalendarError && !['TRANSPORT_FAILED', 'GOOGLE_UNAVAILABLE'].includes(error.code)) throw error; try { return await verify(); } catch { throw new GoogleCalendarError('AMBIGUOUS_MUTATION', 'Google Calendar could not confirm appointment update.', { retryable: true, operation: 'management-reschedule' }); } }
    }); },
    async cancelPrivateEvent(input) { return runOperation(async (operation) => {
      assertExactRecord(input, 'Managed event cancellation', new Set(['eventId', 'start', 'end', 'workTrack', 'marker', 'attendee', 'etag']), ['eventId', 'start', 'end', 'workTrack', 'marker', 'attendee', 'etag']);
      assertEventId(input.eventId); parseInstant(input.start, 'Event start'); parseInstant(input.end, 'Event end');
      if (!WORK_TRACKS.has(input.workTrack) || typeof input.marker !== 'string' || !IDEMPOTENCY_MARKER.test(input.marker) || typeof input.attendee !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(input.attendee) || typeof input.etag !== 'string' || !input.etag) throw new GoogleCalendarError('VALIDATION_FAILED', 'Managed event cancellation is invalid.');
      const eventPath = `/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(input.eventId)}`; const path = `${eventPath}?sendUpdates=all`;
      const confirmedCancellation = async () => {
        const reconciliation = await reconcileCancellation(input, operation);
        if (reconciliation.cancelled) return Object.freeze({ cancelled: true, notificationPolicy: 'sendUpdates=all' });
        throw new GoogleCalendarError('AMBIGUOUS_MUTATION', 'Google Calendar could not confirm appointment cancellation.', { retryable: true, operation: 'management-cancel' });
      };
      try { const response = await api(operation, path, { method: 'DELETE', headers: { 'if-match': input.etag } }); if (response.status === 412) throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar event changed before cancellation.'); if (response.ok) return await confirmedCancellation(); throw await googleErrorFromResponse(response, 'management-cancel'); }
      catch (error) { if (error instanceof GoogleCalendarError && !['TRANSPORT_FAILED', 'GOOGLE_UNAVAILABLE'].includes(error.code)) throw error; try { return await confirmedCancellation(); } catch {} throw new GoogleCalendarError('AMBIGUOUS_MUTATION', 'Google Calendar could not confirm appointment cancellation.', { retryable: true, operation: 'management-cancel' }); }
    }); },
    async deleteEventForCompensation(eventId) { return runOperation(async (operation) => {
      assertEventId(eventId);
      const response = await api(operation, `/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=none`, { method: 'DELETE' });
      if (response.status === 404) return Object.freeze({ deleted: false, notificationPolicy: 'sendUpdates=none' });
      if (!response.ok) throw await googleErrorFromResponse(response, 'compensation');
      return Object.freeze({ deleted: true, notificationPolicy: 'sendUpdates=none' });
    }); },
  });
}
