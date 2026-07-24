import 'server-only';

import { GoogleCalendarError } from './errors.mjs';

const CALENDAR_ID = /^[^\s\x00-\x1f]{1,255}$/;
const CLIENT_ID = /^\d+-[a-z0-9-]+\.apps\.googleusercontent\.com$/;
const SECRET = /^[^\s\x00-\x1f]{8,}$/;

function required(env, name, pattern) {
  const value = env[name];
  if (!Object.hasOwn(env, name) || typeof value !== 'string' || value !== value.trim() || !pattern.test(value)) {
    throw new GoogleCalendarError('CONFIGURATION_INVALID', 'Google Calendar configuration is invalid.');
  }
  return value;
}

export function getGoogleCalendarConfig(env = process.env) {
  if (!env || typeof env !== 'object') {
    throw new GoogleCalendarError('CONFIGURATION_INVALID', 'Google Calendar configuration is invalid.');
  }

  return Object.freeze({
    calendarId: required(env, 'GOOGLE_CALENDAR_ID', CALENDAR_ID),
    clientId: required(env, 'GOOGLE_OAUTH_CLIENT_ID', CLIENT_ID),
    clientSecret: required(env, 'GOOGLE_OAUTH_CLIENT_SECRET', SECRET),
    refreshToken: required(env, 'GOOGLE_OAUTH_REFRESH_TOKEN', SECRET),
  });
}
