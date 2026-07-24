import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3';
const SCOPES = Object.freeze([
  'https://www.googleapis.com/auth/calendar.events.owned',
  'https://www.googleapis.com/auth/calendar.events.freebusy',
]);
const CLIENT_ID = /^\d+-[a-z0-9-]+\.apps\.googleusercontent\.com$/;
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/u;

function base64Url(value) {
  return value.toString('base64url');
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function requiredEnvironment(env, name, pattern) {
  const value = env[name];
  if (typeof value !== 'string' || value !== value.trim() || !pattern.test(value)) {
    throw new Error(`${name} is missing or invalid in .env.local.`);
  }
  return value;
}

export function upsertEnvValue(source, name, value) {
  if (typeof source !== 'string' || typeof name !== 'string' || !/^[A-Z][A-Z0-9_]*$/.test(name)
    || typeof value !== 'string' || !value || CONTROL.test(value)) {
    throw new TypeError('Cannot update the local environment file safely.');
  }
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const lines = source ? source.replace(/\r?\n$/u, '').split(/\r?\n/u) : [];
  const indexes = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (new RegExp(`^\\s*(?:export\\s+)?${name}\\s*=`).test(lines[index])) indexes.push(index);
  }
  if (indexes.length > 1) throw new Error(`${name} is declared more than once in .env.local.`);
  const assignment = `${name}=${JSON.stringify(value)}`;
  if (indexes.length === 1) lines[indexes[0]] = assignment;
  else lines.push(assignment);
  return `${lines.join(newline)}${newline}`;
}

export function createAuthorizationRequest({ clientId, redirectUri, state, codeChallenge }) {
  const url = new URL(AUTHORIZATION_URL);
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString();
  return url;
}

async function exchangeCode({ clientId, clientSecret, code, codeVerifier, redirectUri, fetchImpl }) {
  const response = await fetchImpl(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }).toString(),
  });
  let payload;
  try { payload = await response.json(); } catch { throw new Error('Google returned an unreadable OAuth response.'); }
  if (!response.ok) throw new Error(`Google OAuth failed (${payload.error ?? response.status}).`);
  if (typeof payload.access_token !== 'string' || !payload.access_token
    || typeof payload.refresh_token !== 'string' || !payload.refresh_token) {
    throw new Error('Google did not return a refresh token. Revoke the test app grant and authorize again.');
  }
  return payload;
}

async function verifyCalendar({ accessToken, calendarId, fetchImpl }) {
  const now = new Date();
  const later = new Date(now.getTime() + 5 * 60_000);
  const response = await fetchImpl(`${CALENDAR_API_URL}/freeBusy`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: now.toISOString(),
      timeMax: later.toISOString(),
      items: [{ id: calendarId }],
    }),
  });
  let payload;
  try { payload = await response.json(); } catch { throw new Error('Google Calendar returned an unreadable verification response.'); }
  const result = payload.calendars?.[calendarId];
  if (!response.ok || !result || result.errors !== undefined || !Array.isArray(result.busy)) {
    throw new Error('The authorized account cannot read FreeBusy for GOOGLE_CALENDAR_ID.');
  }
}

function successPage() {
  return '<!doctype html><html><head><meta charset="utf-8"><title>Glamour Studio authorized</title></head><body><h1>Google Calendar authorized</h1><p>You can close this tab and return to the terminal.</p></body></html>';
}

function failurePage() {
  return '<!doctype html><html><head><meta charset="utf-8"><title>Authorization failed</title></head><body><h1>Authorization failed</h1><p>Return to the terminal for the safe error message.</p></body></html>';
}

async function receiveAuthorization({ clientId, state, codeChallenge }) {
  let settle;
  const result = new Promise((resolvePromise, rejectPromise) => {
    settle = { resolve: resolvePromise, reject: rejectPromise };
  });
  const server = createServer((request, response) => {
    const callback = new URL(request.url ?? '/', 'http://127.0.0.1');
    const receivedState = callback.searchParams.get('state') ?? '';
    const code = callback.searchParams.get('code');
    const error = callback.searchParams.get('error');
    const valid = request.method === 'GET' && callback.pathname === '/' && safeEqual(receivedState, state);
    response.writeHead(valid && code && !error ? 200 : 400, { 'content-type': 'text/html; charset=utf-8' });
    response.end(valid && code && !error ? successPage() : failurePage());
    if (!valid) settle.reject(new Error('OAuth callback state or path was invalid.'));
    else if (error) settle.reject(new Error(`Google authorization was denied (${error}).`));
    else if (!code) settle.reject(new Error('Google authorization code was missing.'));
    else settle.resolve(code);
  });
  await new Promise((resolvePromise, rejectPromise) => {
    server.once('error', rejectPromise);
    server.listen(0, '127.0.0.1', resolvePromise);
  });
  const address = server.address();
  const redirectUri = `http://127.0.0.1:${address.port}`;
  const authorizationUrl = createAuthorizationRequest({ clientId, redirectUri, state, codeChallenge });
  return {
    authorizationUrl,
    redirectUri,
    async code() {
      const timeout = setTimeout(() => settle.reject(new Error('Google authorization timed out after five minutes.')), 300_000);
      try { return await result; } finally { clearTimeout(timeout); server.close(); }
    },
  };
}

export async function authorizeLocalGoogleCalendar({
  env = process.env,
  envPath = resolve(process.cwd(), '.env.local'),
  fetchImpl = globalThis.fetch,
} = {}) {
  const clientId = requiredEnvironment(env, 'GOOGLE_OAUTH_CLIENT_ID', CLIENT_ID);
  const clientSecret = requiredEnvironment(env, 'GOOGLE_OAUTH_CLIENT_SECRET', /^[^\s\u0000-\u001f]{8,}$/u);
  const calendarId = requiredEnvironment(env, 'GOOGLE_CALENDAR_ID', /^[^\s\u0000-\u001f]{1,255}$/u);
  if (typeof fetchImpl !== 'function') throw new Error('This Node.js version does not provide fetch.');
  const state = base64Url(randomBytes(32));
  const codeVerifier = base64Url(randomBytes(64));
  const codeChallenge = base64Url(createHash('sha256').update(codeVerifier).digest());
  const authorization = await receiveAuthorization({ clientId, state, codeChallenge });
  console.log('Open this Google authorization URL in your browser:');
  console.log(authorization.authorizationUrl.toString());
  const code = await authorization.code();
  const tokens = await exchangeCode({
    clientId,
    clientSecret,
    code,
    codeVerifier,
    redirectUri: authorization.redirectUri,
    fetchImpl,
  });
  await verifyCalendar({ accessToken: tokens.access_token, calendarId, fetchImpl });
  const source = await readFile(envPath, 'utf8');
  await writeFile(envPath, upsertEnvValue(source, 'GOOGLE_OAUTH_REFRESH_TOKEN', tokens.refresh_token), {
    encoding: 'utf8',
    mode: 0o600,
  });
  console.log('Authorization succeeded. The refresh token was stored in ignored .env.local and was not printed.');
}

const executedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === executedPath) {
  authorizeLocalGoogleCalendar().catch((error) => {
    console.error(`Authorization failed: ${error.message}`);
    process.exitCode = 1;
  });
}
