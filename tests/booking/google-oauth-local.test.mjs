import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAuthorizationRequest,
  upsertEnvValue,
} from '../../scripts/booking/google-oauth-local.mjs';

test('local OAuth authorization uses loopback, PKCE, offline consent, and narrow scopes', () => {
  const url = createAuthorizationRequest({
    clientId: '123-example.apps.googleusercontent.com',
    redirectUri: 'http://127.0.0.1:54321',
    state: 'opaque-state',
    codeChallenge: 'opaque-challenge',
  });
  assert.equal(url.origin, 'https://accounts.google.com');
  assert.equal(url.searchParams.get('redirect_uri'), 'http://127.0.0.1:54321');
  assert.equal(url.searchParams.get('access_type'), 'offline');
  assert.equal(url.searchParams.get('prompt'), 'consent');
  assert.equal(url.searchParams.get('state'), 'opaque-state');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.deepEqual(url.searchParams.get('scope').split(' ').sort(), [
    'https://www.googleapis.com/auth/calendar.events.freebusy',
    'https://www.googleapis.com/auth/calendar.events.owned',
  ]);
});

test('refresh-token storage preserves unrelated local environment values and rejects duplicates', () => {
  const original = '# local config\r\nGOOGLE_CALENDAR_ID=calendar@example.com\r\nUNRELATED=value\r\n';
  const updated = upsertEnvValue(original, 'GOOGLE_OAUTH_REFRESH_TOKEN', 'safe-token');
  assert.match(updated, /GOOGLE_CALENDAR_ID=calendar@example\.com/);
  assert.match(updated, /UNRELATED=value/);
  assert.match(updated, /GOOGLE_OAUTH_REFRESH_TOKEN="safe-token"/);
  assert.ok(updated.includes('\r\n'));
  assert.throws(() => upsertEnvValue(
    'GOOGLE_OAUTH_REFRESH_TOKEN=one\nGOOGLE_OAUTH_REFRESH_TOKEN=two\n',
    'GOOGLE_OAUTH_REFRESH_TOKEN',
    'three',
  ));
});
