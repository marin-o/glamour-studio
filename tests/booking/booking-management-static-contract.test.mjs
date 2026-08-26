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

test('management UI fails closed when mutation capability is unavailable and clears stale details on unknown outcomes', async () => {
  const component = await read('src/components/booking/BookingManagementExperience.jsx');

  assert.match(component, /setView\(result\.booking\.status === "cancelled" \? "cancelled" : result\.booking\.canReschedule \? "ready" : "cutoff"\)/);
  assert.match(component, /view === "ready" && managementCanReschedule\(booking\) &&/);
  assert.match(component, /if \(!result\.ok\) \{\s*setBooking\(null\);\s*setErrorKind\(result\.kind\);\s*setView\("error"\);/s);
  assert.match(component, /setBooking\(null\);\s*setErrorKind\(result\?\.kind \?\? "provider"\);\s*setView\("error"\);/s);
  assert.match(component, /const returnToReady = \(\) => \{\s*setView\(managementCanReschedule\(booking\) \? "ready" : "cutoff"\);/s);
});

test('availability capability failures clear stale booking state before safe or error views', async () => {
  const component = await read('src/components/booking/BookingManagementExperience.jsx');
  const availabilityStart = component.indexOf('const loadAvailability = useCallback');
  const availabilityEnd = component.indexOf('const beginReschedule =', availabilityStart);
  assert.notEqual(availabilityStart, -1);
  assert.notEqual(availabilityEnd, -1);
  const availabilityFlow = component.slice(availabilityStart, availabilityEnd);
  const localInvalidStart = availabilityFlow.indexOf('if (!/^\\d{4}-\\d{2}-\\d{2}$/u.test(date)) {');
  const safeBranchStart = availabilityFlow.indexOf('if (!result || result.kind === "safe")');
  const safeBranchEnd = availabilityFlow.indexOf('if (result.kind === "invalid")', safeBranchStart);
  const invalidBranchEnd = availabilityFlow.indexOf('if (result.kind === "cutoff")', safeBranchEnd);
  assert.notEqual(localInvalidStart, -1);
  assert.notEqual(safeBranchStart, -1);
  assert.notEqual(safeBranchEnd, -1);
  assert.notEqual(invalidBranchEnd, -1);
  const localInvalidBranch = availabilityFlow.slice(localInvalidStart, safeBranchStart);
  const safeBranch = availabilityFlow.slice(safeBranchStart, safeBranchEnd);
  const invalidBranch = availabilityFlow.slice(safeBranchEnd, invalidBranchEnd);
  assert.match(localInvalidBranch, /setAvailabilityState\("invalid"\);\s*return;/s);
  assert.match(safeBranch, /setBooking\(null\);/);
  assert.match(safeBranch, /setStarts\(\[\]\);/);
  assert.match(safeBranch, /setAvailabilityState\("idle"\);/);
  assert.match(safeBranch, /setErrorKind\(""\);/);
  assert.match(safeBranch, /setView\("safe"\);/);
  assert.doesNotMatch(safeBranch, /setView\("reschedule"\)|setAvailabilityState\("invalid"\)/);
  assert.match(invalidBranch, /if \(result\.kind === "invalid"\) \{/);
  assert.match(invalidBranch, /setBooking\(null\);/);
  assert.match(invalidBranch, /setStarts\(\[\]\);/);
  assert.match(invalidBranch, /setAvailabilityState\("idle"\);/);
  assert.match(invalidBranch, /setErrorKind\(result\.kind\);/);
  assert.match(invalidBranch, /setView\("error"\);\s*return;/s);
  assert.doesNotMatch(invalidBranch, /setView\("reschedule"\)|setAvailabilityState\("invalid"\)/);
  assert.match(component, /\{\(view === "ready" \|\| view === "cancelled" \|\| view === "rescheduled"\) && booking &&/);
  assert.match(component, /\{view === "ready" && managementCanReschedule\(booking\) &&/);
});
