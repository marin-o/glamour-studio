import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('one shared site bar is placed on every current page composition', async () => {
  const [navigation, home, booking, lookbook] = await Promise.all([
    read('src/components/SiteNavigation.jsx'),
    read('src/components/TypographySalonPage.jsx'),
    read('src/components/booking/BookingExperience.jsx'),
    read('src/components/lookbook/HorizontalLookbook.jsx'),
  ]);

  assert.match(home, /<SiteNavigation ref=\{navigationRef\} current="home" position="bottom"/);
  assert.match(booking, /<SiteNavigation[\s\S]*backHref="\/"[\s\S]*backLabel=\{t\.back\}[\s\S]*current="booking"[\s\S]*position="bottom"/);
  assert.match(lookbook, /<SiteNavigation[\s\S]*backHref="\/"[\s\S]*backLabel=\{copy\.returnLabel\}[\s\S]*current="lookbook"[\s\S]*position="top"/);
  assert.match(navigation, /data-site-navigation=\{position\}/);
  assert.match(navigation, /<svg[\s\S]*viewBox="0 0 24 24"[\s\S]*M19 12H5m6-6-6 6 6 6/);
  assert.doesNotMatch(navigation, />←</);
  assert.match(navigation, /current === "lookbook"/);
  assert.match(navigation, /current === "booking"/);
});

test('subpages inherit global language and Lookbook no longer owns duplicate navigation', async () => {
  const [navigation, booking, lookbook] = await Promise.all([
    read('src/components/SiteNavigation.jsx'),
    read('src/components/booking/BookingExperience.jsx'),
    read('src/components/lookbook/HorizontalLookbook.jsx'),
  ]);

  assert.match(navigation, /current === "home" \?/);
  assert.match(navigation, /setLanguage/);
  assert.doesNotMatch(booking, /setLanguage|language === "mk" \? "EN"/);
  assert.doesNotMatch(lookbook, /setLanguage|utilityNavItem|<header/);
  assert.match(lookbook, /returnLabel/);
  assert.match(navigation, /backHref/);
  assert.match(lookbook, /lookbook-media-notice/);
  assert.match(lookbook, /brushProgress/);
});
