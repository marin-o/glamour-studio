import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('management route is noindex, referrer-safe, and has a Macedonian phone fallback', async () => {
  const page = await read('src/app/booking/manage/page.jsx');
  assert.match(page, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/s);
  assert.match(page, /referrer:\s*['"]no-referrer['"]/);
  assert.match(page, /<noscript>/);
  assert.match(page, /јавете се на/);
  assert.match(page, /tel:077643005/);
  assert.doesNotMatch(page, /searchParams|window\.location|Authorization|Bearer/);
});

test('management experience hydrates the fragment into an in-memory capability closure', async () => {
  const [component, api, flow] = await Promise.all([
    read('src/components/booking/BookingManagementExperience.jsx'),
    read('src/lib/booking/client/booking-api.mjs'),
    read('src/lib/booking/client/booking-flow.mjs'),
  ]);
  assert.match(component, /window\.location\.hash/);
  assert.match(component, /capabilityRef/);
  assert.match(component, /capability:\s*\(\) => capabilityRef\.current/);
  assert.doesNotMatch(component, /useState\([^\n]*secret|useState\([^\n]*capability|searchParams|URLSearchParams/);
  assert.match(api, /Authorization: `Bearer \$\{secret\}`/);
  assert.match(api, /method: 'PATCH'/);
  assert.match(api, /method: 'DELETE'/);
  assert.match(flow, /MANAGEMENT_SECRET_PATTERN/);
  assert.match(component, /managementCanReschedule/);
  assert.match(component, /managementCanCancel/);
  assert.match(component, /cancellationCutoff/);
  assert.match(component, /conflict/);
});
