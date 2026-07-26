import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { homepageCopy } from '../../src/lib/homepage-copy.js';
import { bookingCopy } from '../../src/lib/booking/booking-copy.js';

const read = (file) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('booking SSR entry validates search params, provides a stable Skopje date, and keeps the no-script phone fallback', async () => {
  const page = await read('src/app/booking/page.jsx');
  assert.match(page, /await searchParams/);
  assert.match(page, /SERVICES\.some/);
  assert.match(page, /skopjeToday\(\)/);
  assert.doesNotMatch(page, /Suspense|useSearchParams/);
  assert.match(page, /<noscript>/);
  assert.match(page, /Јавете се на/);
  assert.match(page, /Закажување \| Glamour Studio/);
  assert.match(page, /Закажете термин во Glamour Studio во Радовиш/);
  assert.match(page, /openGraph/);
});

test('booking API routes stay Node-only, dynamic, no-store, and use the server request-context boundary', async () => {
  const [availability, booking] = await Promise.all([read('src/app/api/booking/availability/route.js'), read('src/app/api/booking/route.js')]);
  for (const route of [availability, booking]) {
    assert.match(route, /export const runtime = 'nodejs'/);
    assert.match(route, /export const dynamic = 'force-dynamic'/);
    assert.match(route, /export const revalidate = 0/);
    assert.match(route, /getProductionRequestContext/);
  }
});

test('route service preselection uses a stable empty hydration snapshot before joining interactive flow state', async () => {
  const booking = await read('src/components/booking/BookingExperience.jsx');
  for (const contract of [/useSyncExternalStore/, /subscribeToHydration/, /useState\(initialBookingFlow\)/, /\(\) => initialServiceId/, /\(\) => ""/, /selectedServiceId = flow\.serviceId \|\| hydratedInitialServiceId/, /serviceId: current\.serviceId \|\| selectedServiceId/]) assert.match(booking, contract);
  assert.doesNotMatch(booking, /useState\(\(\) => initialServiceId/);
  assert.match(booking, /initialSkopjeDate/);
  assert.match(booking, /quickDateOptions\(language, stableSkopjeDate\)/);
});

test('booking controls retain lifecycle hooks while customer notices stay in one contextual status per step', async () => {
  const [home, booking] = await Promise.all([
    read('src/components/TypographySalonPage.jsx'),
    read('src/components/booking/BookingExperience.jsx'),
  ]);
  const serviceBlock = home.match(/<section[\s\S]*?data-hero-curtain-services[\s\S]*?<\/section>/)?.[0];
  assert.ok(serviceBlock, 'homepage service block should remain a semantic section');
  assert.match(serviceBlock, /<ul[\s\S]*copy\.services\.groups\.map/);
  assert.match(serviceBlock, /<Reveal\s+as="li"/);
  assert.match(serviceBlock, /<TransitionLink[\s\S]*href="\/booking"[\s\S]*>\s*\{copy\.services\.cta\}\s*<\/TransitionLink>/);
  assert.equal(homepageCopy.mk.services.groups.length, 3);
  assert.equal(homepageCopy.en.services.groups.length, 3);
  assert.deepEqual(homepageCopy.mk.services.groups, [
    { id: 'haircuts-styling', label: 'Шишање и стилизирање' },
    { id: 'colour-treatments', label: 'Боење и третмани' },
    { id: 'makeup', label: 'Шминка' },
  ]);
  assert.deepEqual(homepageCopy.en.services.groups, [
    { id: 'haircuts-styling', label: 'Haircuts & styling' },
    { id: 'colour-treatments', label: 'Colour & treatments' },
    { id: 'makeup', label: 'Makeup' },
  ]);
  assert.doesNotMatch(home, /SERVICES|serviceNames|priceLabel|durationMinutes/);
  assert.equal(homepageCopy.mk.services.cta, 'Погледнете ги сите услуги и закажете термин');
  assert.equal(homepageCopy.en.services.cta, 'View the full service menu and book an appointment');
  for (const hook of ['aria-current={', 'peer-focus-visible', 'aria-invalid', 'aria-describedby', 'aria-live', 'dateRequired', 'slotRequired', 'createAvailabilityRequestGate', 'createSubmissionGate', 'serviceStepRef', 'appointmentStepRef', 'contactStepRef', 'staleRef', 'rounded-\\[2rem\\]', 'rounded-\\[1\\.5rem\\]', 'rounded-full']) assert.match(booking, new RegExp(hook.replace(/[{}]/g, '\\\$&')));
  assert.match(booking, /controller\.abort\(\); gate\.dispose\(\)/);
  assert.doesNotMatch(booking, /setFlow\(\(current\) => \{[^}]*\.abort\(/s);
  assert.doesNotMatch(booking, /const notice =/);
  assert.doesNotMatch(booking, /<p[^>]+aria-live="polite"[^>]*>\{notice\}/);
  assert.match(booking, /id="date-status"/);
  assert.match(booking, /id="appointment-action-status"/);
  assert.match(booking, /id="booking-error"/);
});

test('booking desk keeps honest imagery, aligned surfaces, quick dates, grouped slots, and emergency scrolling', async () => {
  const booking = await read('src/components/booking/BookingExperience.jsx');
  for (const contract of [/BookingSummary/, /homepageCopy/, /mediaCopy\.items\.interior\.alt/, /quality=\{100\}/, /lg:grid-cols-\[0\.72fr_1\.28fr\]/, /grid items-stretch/, /className="sr-only"/, /useLayoutEffect/, /ResizeObserver/, /--navigation-cubby-height/, /ref=\{navigationRef\}/, /lg:min-h-dvh/, /overflow-x-clip/, /lg:h-\[calc\(100dvh-var\(--navigation-cubby-height\)-2\.5rem\)\] lg:min-h-0/, /data-lenis-prevent=\{desktopSheetScroll \? "" : undefined\}/, /lg:overflow-y-auto/, /Array\.from\(\{ length: 7 \}/, /quickDateOptions/, /morningStarts/, /afternoonStarts/, /<motion\.div[\s\S]*layout=\{!prefersReducedMotion\}[\s\S]*borderRadius: "2rem"/]) assert.match(booking, contract);
  assert.doesNotMatch(booking, /lg:min-h-\[calc\(100dvh-var\(--navigation-cubby-height\)-2\.5rem\)\]/);
  assert.doesNotMatch(booking, /mediaCopy\.label/);
  assert.doesNotMatch(booking, /lg:h-dvh/);
  assert.doesNotMatch(booking, /<header className=/);
});

test('appointment choices stay compact and every native scrollbar receives the shared site skin', async () => {
  const [booking, globals] = await Promise.all([read('src/components/booking/BookingExperience.jsx'), read('src/app/globals.css')]);
  for (const contract of [/lg:grid-cols-7/, /lg:grid-cols-6/, /min-h-10/, /space-y-4/, /disabled=\{Boolean\(flow\.date\)/]) assert.match(booking, contract);
  for (const contract of [/scrollbar-color: var\(--color-accent\) var\(--color-surface-warm\)/, /scrollbar-width: thin/, /\*::-webkit-scrollbar-thumb/, /background: var\(--color-accent-deep\)/, /\.lookbook-scroller::-webkit-scrollbar/]) assert.match(globals, contract);
});

test('step screens move on one measured Motion carousel track inside a rounded shell and inner scroller', async () => {
  const booking = await read('src/components/booking/BookingExperience.jsx');
  for (const contract of [/motion, useReducedMotion/, /const carouselSteps = \[\.\.\.steps, "success"\]/, /function CarouselPanel/, /activeScreenIndex \* -100/, /left: `\$\{index \* 100\}%`/, /carouselViewportRef/, /carouselPanelRefs/, /new ResizeObserver\(syncHeight\)/, /relative isolate overflow-hidden rounded/, /w-full px-3 py-2 sm:px-4 sm:py-3/, /absolute top-0/, /onAnimationComplete=\{\(\) => \{/, /settledScreenIndexRef\.current = activeScreenIndex/, /Math\.max\(incomingHeight, outgoingHeight\)/, /activeFocusRef\.current\?\.focus\(\)/, /aria-hidden=\{!active/, /inert=\{!active/, /pointerEvents: active \? "auto" : "none"/, /animate=\{\{ scaleX: index <= current \? 1 : 0 \}\}/, /origin-left/, /initial=\{false\}/]) assert.match(booking, contract);
  assert.doesNotMatch(booking, /carouselViewportRef\} className="[^"]*px-/);
  assert.match(booking, /h-auto min-h-\[24rem\] overflow-visible rounded-\[2\.75rem\]/);
  assert.match(booking, /lg:h-full lg:min-h-0 lg:overflow-hidden/);
  assert.match(booking, /h-auto overflow-visible p-5 sm:p-8 lg:h-full lg:overflow-y-auto/);
  assert.doesNotMatch(booking, /(?:^|[\s"])overflow-y-auto(?:[\s"]|$)/);
  assert.match(booking, /grid grid-cols-2 gap-2/);
  assert.match(booking, /min-h-28 min-w-0/);
  assert.match(booking, /whitespace-nowrap rounded-full/);
  assert.doesNotMatch(booking, /grid gap-2 md:grid-cols-2/);
  assert.doesNotMatch(booking, /AnimatePresence|usePresenceData|useIsPresent|mode="popLayout"|mode="sync"|mode="wait"/);
  assert.doesNotMatch(booking, /\[grid-area:1\/1\]/);
  assert.doesNotMatch(booking, /clip-path:inset\(0\)/);
  assert.doesNotMatch(booking, /screenVariants|screenDirection|setScreenDirection/);
});

test('availability is prefetched for the seven-day rail and safely reused without bypassing conflict recovery', async () => {
  const booking = await read('src/components/booking/BookingExperience.jsx');
  for (const contract of [
    /availabilityCacheTtlMs = 60_000/,
    /availabilityPrefetchConcurrency = 3/,
    /availabilityCacheRef/,
    /availabilityPendingRef/,
    /Promise\.allSettled/,
    /quickDates\.map\(\(\{ value \}\) => value\)/,
    /requestAvailability\(selectedServiceId, date, controller\.signal\)/,
    /getCachedAvailability\(flow\.serviceId, flow\.date\)/,
    /availabilityCacheRef\.current\.delete\(availabilityCacheKey\(flow\.serviceId, flow\.date\)\)/,
  ]) assert.match(booking, contract);
});

test('appointment validation is stationary beside Continue and contact fields clear submission feedback', async () => {
  const booking = await read('src/components/booking/BookingExperience.jsx');
  for (const contract of [/id="appointment-action-status"/, /appointment-action-status/, /absolute right-0 bottom-\[calc\(100%\+0\.5rem\)\]/, /sm:right-\[calc\(100%\+0\.75rem\)\]/, /flow\.notice === "dateRequired" \? t\.dateRequired/, /flow\.notice === "slotRequired" \? t\.slotRequired/, /flow\.notice === "taken" \? t\.taken/, /type="tel"/, /inputMode="tel"/, /autoComplete="tel"/, /autoComplete="email"/, /autoComplete="name"/]) assert.match(booking, contract);
  assert.doesNotMatch(booking, /shadow-\[0_8px_24px/);
  assert.match(booking, /\{ \.\.\.current, \[field\]: value, notice: "" \}/);
});

test('confirmation remains authoritative over deep-link service state and success progress no longer says Contact', async () => {
  const booking = await read('src/components/booking/BookingExperience.jsx');
  assert.match(booking, /flow\.step === "success" && confirmationService/);
  assert.match(booking, /step === "success" \? copy\.success : copy\.steps\[current\]/);
  assert.match(booking, /serviceNames\[flow\.confirmation\.serviceId\]/);
});

test('success guidance covers Google Calendar unknown-sender confirmation in both languages', async () => {
  const booking = await read('src/components/booking/BookingExperience.jsx');
  const guidance = {
    mk: bookingCopy.mk.invitationGuidance,
    en: bookingCopy.en.invitationGuidance,
  };

  assert.match(booking, /<p className="mt-4 text-sm leading-relaxed text-muted">\{t\.invitationGuidance\}<\/p>/);
  assert.equal(typeof guidance.mk, 'string');
  assert.equal(typeof guidance.en, 'string');
  for (const requirement of [
    /Google Calendar/,
    /Glamour Studio/,
    /Проверете ја е-поштата/,
    /Првата покана/,
    /непознат испраќач/,
    /Го познавам испраќачот/,
    /одговорете со [„"]Да[“"]/,
    /за да го додадете терминот/,
    /може[^.]*автоматски/,
    /не е загарантирано/,
  ]) {
    assert.match(guidance.mk, requirement);
  }
  for (const requirement of [
    /Google Calendar/,
    /Glamour Studio/,
    /Check your email/,
    /The first invitation/,
    /unknown sender/,
    /I know the sender/,
    /reply [“"]Yes[”"]/,
    /to add the appointment/,
    /may[^.]*automatically/,
    /not guaranteed/,
  ]) {
    assert.match(guidance.en, requirement);
  }
  assert.match(booking, /t\.invitation\[flow\.confirmation\.notification\]/);
  assert.doesNotMatch(booking, /invitationGuidance[^\n]*aria-live/);
});

test('confirmation actions are localized, reset the client flow, and preserve home navigation', async () => {
  const booking = await read('src/components/booking/BookingExperience.jsx');
  assert.equal(bookingCopy.en.newBooking, 'New booking');
  assert.equal(bookingCopy.mk.newBooking, 'Нов термин');
  assert.equal(bookingCopy.en.backHome, 'Back to home');
  assert.equal(bookingCopy.mk.backHome, 'Назад на почетна');
  assert.match(booking, /const startNewBooking = \(\) => \{/);
  for (const contract of [
    /gateRef\.current\.clear\(\)/,
    /availabilityCacheGenerationRef\.current \+= 1/,
    /availabilityCacheRef\.current\.clear\(\)/,
    /availabilityPendingRef\.current\.clear\(\)/,
    /setFlow\(initialBookingFlow\)/,
    /<PrimaryButton onClick=\{startNewBooking\} type="button">\{t\.newBooking\}<\/PrimaryButton>/,
    /<TransitionLink[^>]*href="\/"[^>]*>\{t\.backHome\}<\/TransitionLink>/,
    /flex flex-wrap items-center gap-3/,
  ]) assert.match(booking, contract);
  assert.match(booking, /requestGeneration === availabilityCacheGenerationRef\.current && !signal\.aborted/);
});
