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
const DIGEST_VERSION = 'v1';

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
    || event.extendedProperties?.private?.[PRIVATE_MARKER_KEY] !== expected.marker) {
    throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar event verification did not match the requested appointment.');
  }
  const start = parseInstant(event.start?.dateTime, 'Google event start', 'provider');
  const end = parseInstant(event.end?.dateTime, 'Google event end', 'provider');
  if (Temporal.Instant.compare(start, expected.start) !== 0 || Temporal.Instant.compare(end, expected.end) !== 0) {
    throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar event verification did not match the requested appointment.');
  }
  return Object.freeze({ id: event.id, start: start.toString(), end: end.toString(), status: event.status });
}

function normalizedAttendees(event) {
  if (!isPlainRecord(event) || (event.attendees !== undefined && !Array.isArray(event.attendees))) throw providerFailure();
  return (event.attendees ?? []).map((attendee) => {
    if (!isPlainRecord(attendee) || typeof attendee.email !== 'string' || !attendee.email.trim()) throw providerFailure();
    return attendee;
  });
}

export function createGoogleCalendarAdapter(options = {}) {
  assertExactRecord(options, 'Google Calendar adapter options', new Set(['env', 'fetch', 'now', 'timeoutMs']), []);
  const { env = process.env, fetch: injectedFetch = globalThis.fetch, now = () => Date.now(), timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const config = getGoogleCalendarConfig(env);
  if (typeof injectedFetch !== 'function' || typeof now !== 'function' || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) throw new GoogleCalendarError('CONFIGURATION_INVALID', 'Google Calendar adapter configuration is invalid.');
  let token = null;
  let generation = 0;
  let refreshInFlight = null;

  async function request(url, init) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try { return await injectedFetch(url, { ...init, signal: controller.signal }); }
    catch { throw new GoogleCalendarError('TRANSPORT_FAILED', 'Google Calendar could not be reached.', { retryable: true }); }
    finally { clearTimeout(timer); }
  }

  async function refreshAccessToken(rejectedGeneration) {
    if (token && token.expiresAt > now() + TOKEN_SKEW_MS && (rejectedGeneration === undefined || token.generation > rejectedGeneration)) return token;
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
      const response = await request(OAUTH_TOKEN_URL, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', client_id: config.clientId, client_secret: config.clientSecret, refresh_token: config.refreshToken }).toString() });
      if (!response.ok) throw new GoogleCalendarError('AUTHORIZATION_FAILED', 'Google Calendar authorization failed.', { status: response.status });
      let payload;
      try { payload = await response.json(); } catch { throw new GoogleCalendarError('AUTHORIZATION_FAILED', 'Google Calendar authorization failed.'); }
      if (!isPlainRecord(payload) || typeof payload.access_token !== 'string' || !payload.access_token.trim() || !Number.isInteger(payload.expires_in) || payload.expires_in < 1 || payload.expires_in > MAX_TOKEN_TTL_SECONDS) throw new GoogleCalendarError('AUTHORIZATION_FAILED', 'Google Calendar authorization failed.');
      token = { accessToken: payload.access_token, expiresAt: now() + payload.expires_in * 1000, generation: ++generation };
      return token;
    })();
    try { return await refreshInFlight; } finally { refreshInFlight = null; }
  }

  async function api(path, init = {}) {
    let activeToken = await refreshAccessToken();
    let response = await request(`${CALENDAR_API_URL}${path}`, { ...init, headers: { accept: 'application/json', ...init.headers, authorization: `Bearer ${activeToken.accessToken}` } });
    if (response.status === 401) {
      activeToken = await refreshAccessToken(activeToken.generation);
      response = await request(`${CALENDAR_API_URL}${path}`, { ...init, headers: { accept: 'application/json', ...init.headers, authorization: `Bearer ${activeToken.accessToken}` } });
    }
    return response;
  }

  async function responseJson(response) {
    try { const payload = await response.json(); if (!isPlainRecord(payload)) throw new Error(); return payload; } catch { throw providerFailure('Google Calendar returned an invalid response.'); }
  }

  async function verifyEvent(expected) {
    assertExactRecord(expected, 'Expected event', new Set(['eventId', 'start', 'end', 'summary', 'description', 'marker']), ['eventId', 'start', 'end', 'summary', 'description', 'marker']);
    assertEventId(expected.eventId);
    const response = await api(`/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(expected.eventId)}`);
    if (!response.ok) throw await googleErrorFromResponse(response);
    return verifiedEvent(await responseJson(response), expected);
  }

  async function resolveMutation(expected, outcome) {
    try { return { event: await verifyEvent(expected), outcome }; }
    catch (error) {
      if (error instanceof GoogleCalendarError && error.code === 'VERIFICATION_FAILED') throw error;
      throw new GoogleCalendarError('AMBIGUOUS_MUTATION', 'Google Calendar could not confirm appointment creation.', { retryable: true, operation: 'event-create' });
    }
  }

  return Object.freeze({
    async listBlockingEvents(input) {
      assertExactRecord(input, 'Blocking event request', new Set(['timeMin', 'timeMax']), ['timeMin', 'timeMax']);
      const timeMin = parseInstant(input.timeMin, 'Blocking event timeMin'); const timeMax = parseInstant(input.timeMax, 'Blocking event timeMax');
      if (Temporal.Instant.compare(timeMax, timeMin) <= 0) throw new GoogleCalendarError('VALIDATION_FAILED', 'Blocking event timeMax must be after timeMin.');
      const blockers = []; let pageToken = undefined; const seenTokens = new Set();
      for (let page = 0; page < 5; page += 1) {
        const query = new URLSearchParams({ timeMin: timeMin.toString(), timeMax: timeMax.toString(), timeZone: STUDIO_TIME_ZONE, singleEvents: 'true', orderBy: 'startTime', maxResults: '250' });
        if (pageToken) query.set('pageToken', pageToken);
        const response = await api(`/calendars/${encodeURIComponent(config.calendarId)}/events?${query}`);
        if (!response.ok) throw await googleErrorFromResponse(response);
        const payload = await responseJson(response);
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
          blockers.push(Object.freeze({ id: event.id, start: start.toString(), end: end.toString(), allDay: allDay }));
        }
        pageToken = payload.nextPageToken;
        if (!pageToken) return Object.freeze(blockers);
        if (seenTokens.has(pageToken)) throw providerFailure('Google Calendar returned a pagination loop.');
        seenTokens.add(pageToken);
      }
      throw providerFailure('Google Calendar returned too many event pages.');
    },
    async getBusyIntervals(input) {
      assertExactRecord(input, 'FreeBusy request', new Set(['timeMin', 'timeMax']), ['timeMin', 'timeMax']);
      const timeMin = parseInstant(input.timeMin, 'FreeBusy timeMin'); const timeMax = parseInstant(input.timeMax, 'FreeBusy timeMax');
      if (Temporal.Instant.compare(timeMax, timeMin) <= 0) throw new GoogleCalendarError('VALIDATION_FAILED', 'FreeBusy timeMax must be after timeMin.');
      const response = await api('/freeBusy', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ timeMin: timeMin.toString(), timeMax: timeMax.toString(), items: [{ id: config.calendarId }] }) });
      if (!response.ok) throw await googleErrorFromResponse(response);
      const payload = await responseJson(response);
      const calendar = payload.calendars?.[config.calendarId];
      if (!isPlainRecord(calendar) || calendar.errors !== undefined || !Array.isArray(calendar.busy)) throw providerFailure('Google Calendar returned invalid FreeBusy data.');
      try { return Object.freeze(normalizeBusyIntervals(calendar.busy)); } catch { throw providerFailure('Google Calendar returned invalid FreeBusy data.'); }
    },
    verifyEvent,
    async createPrivateEvent(input) {
      assertExactRecord(input, 'Private event', new Set(['idempotencyKey', 'start', 'end', 'summary', 'description']), ['idempotencyKey', 'start', 'end', 'summary']);
      const start = parseInstant(input.start, 'Event start'); const end = parseInstant(input.end, 'Event end');
      if (Temporal.Instant.compare(end, start) <= 0 || typeof input.summary !== 'string' || !input.summary.trim() || (input.description !== undefined && typeof input.description !== 'string')) throw new GoogleCalendarError('VALIDATION_FAILED', 'Private event details are invalid.');
      const eventId = eventIdFromIdempotencyKey(input.idempotencyKey);
      const expected = { eventId, start, end, summary: input.summary, description: input.description ?? '', marker: idempotencyMarker(input.idempotencyKey) };
      const body = { id: eventId, summary: input.summary, description: expected.description, visibility: 'private', start: { dateTime: start.toString() }, end: { dateTime: end.toString() }, extendedProperties: { private: { [PRIVATE_MARKER_KEY]: expected.marker } } };
      let response;
      try { response = await api(`/calendars/${encodeURIComponent(config.calendarId)}/events?sendUpdates=none`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); }
      catch (error) { if (error.code === 'TRANSPORT_FAILED') return resolveMutation(expected, 'recovered'); throw error; }
      if (response.ok) {
        try { return { event: verifiedEvent(await responseJson(response), expected), outcome: 'created' }; }
        catch (error) {
          if (error instanceof GoogleCalendarError && error.code === 'VERIFICATION_FAILED') throw error;
          return resolveMutation(expected, 'created');
        }
      }
      if (response.status === 409) return resolveMutation(expected, 'duplicate');
      if (response.status >= 500) return resolveMutation(expected, 'recovered');
      throw await googleErrorFromResponse(response);
    },
    async addOrUpdateAttendee(input) {
      assertExactRecord(input, 'Attendee update', new Set(['eventId', 'email', 'displayName']), ['eventId', 'email']);
      assertEventId(input.eventId);
      if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || (input.displayName !== undefined && typeof input.displayName !== 'string')) throw new GoogleCalendarError('VALIDATION_FAILED', 'Attendee details are invalid.');
      const path = `/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(input.eventId)}`;
      const existingResponse = await api(path);
      if (!existingResponse.ok) throw await googleErrorFromResponse(existingResponse, 'invitation');
      let attendees;
      try { attendees = normalizedAttendees(await responseJson(existingResponse)); } catch (error) { if (error.code) throw error; throw providerFailure(); }
      const identity = input.email.toLocaleLowerCase('en-US');
      const merged = attendees.filter((attendee) => attendee.email.toLocaleLowerCase('en-US') !== identity);
      merged.push({ email: input.email, ...(input.displayName ? { displayName: input.displayName } : {}) });
      let response;
      try { response = await api(`${path}?sendUpdates=all`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attendees: merged }) }); }
      catch (error) { if (error.code === 'TRANSPORT_FAILED') throw new GoogleCalendarError('AMBIGUOUS_MUTATION', 'Google Calendar could not confirm attendee notification.', { retryable: true, operation: 'invitation' }); throw error; }
      if (!response.ok) throw await googleErrorFromResponse(response, 'invitation');
      // A 2xx PATCH body is not reliable evidence; fetch the stored event.
      let verified;
      try {
        const verifyResponse = await api(path);
        if (!verifyResponse.ok) throw await googleErrorFromResponse(verifyResponse, 'invitation');
        verified = normalizedAttendees(await responseJson(verifyResponse));
      } catch (error) { throw new GoogleCalendarError('AMBIGUOUS_MUTATION', 'Google Calendar could not confirm attendee notification.', { retryable: true, operation: 'invitation' }); }
      if (!verified.some((attendee) => attendee.email.toLocaleLowerCase('en-US') === identity)) throw new GoogleCalendarError('VERIFICATION_FAILED', 'Google Calendar attendee verification did not match the requested invitation.', { operation: 'invitation' });
      return Object.freeze({ eventId: input.eventId, notificationPolicy: 'sendUpdates=all' });
    },
    async deleteEventForCompensation(eventId) {
      assertEventId(eventId);
      const response = await api(`/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=none`, { method: 'DELETE' });
      if (response.status === 404) return Object.freeze({ deleted: false, notificationPolicy: 'sendUpdates=none' });
      if (!response.ok) throw await googleErrorFromResponse(response, 'compensation');
      return Object.freeze({ deleted: true, notificationPolicy: 'sendUpdates=none' });
    },
  });
}
