import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('hero curtain keeps blur static behind a lightweight animated boundary', async () => {
  const [hero, homepage] = await Promise.all([
    read('src/components/motion/HeroCurtainReveal.jsx'),
    read('src/components/TypographySalonPage.jsx'),
  ]);

  assert.match(homepage, /data-hero-curtain-veil-clip/);
  // The blur must sit directly inside the animated clip wrapper. Keeping the
  // expensive backdrop-filter on a static child limits scroll invalidation to
  // the lightweight clip boundary.
  assert.match(
    homepage,
    /<div[^>]*data-hero-curtain-veil-clip[^>]*>\s*<div[^>]*data-hero-curtain-veil(?:\s|=|["'])/,
  );
  assert.match(hero, /data-hero-curtain-veil-clip/);
  assert.match(hero, /\.to\(veilClip,[\s\S]*clipPath/);
  assert.match(hero, /\.to\([\s\S]*foreground,[\s\S]*clipPath/);
  assert.doesNotMatch(hero, /onUpdate\s*:/);
  assert.doesNotMatch(hero, /onUpdate\s*:[\s\S]*?gsap\.set/);
  assert.doesNotMatch(hero, /const state = \{\s*veilClip/);

  const heroSection = homepage.match(
    /<section[\s\S]*?data-hero-curtain-hero[\s\S]*?<\/section>/,
  )?.[0];

  assert.ok(heroSection, 'homepage hero section must remain identifiable');
  assert.equal(
    (heroSection.match(/<Image\b/g) || []).length,
    1,
    'the curtain hero must render one photograph element',
  );
  assert.equal(
    (heroSection.match(/src=\{[^}]+\}/g) || []).length,
    1,
    'the curtain hero must have one image source and no duplicate source',
  );
});

test('makeup reveal visibility uses a stable external store with SSR snapshots', async () => {
  const makeup = await read('src/components/motion/MakeupStroke.jsx');

  assert.match(makeup, /useSyncExternalStore/);
  assert.match(makeup, /createMakeupStrokeStore/);
  assert.match(makeup, /getServerVisibility/);
  assert.match(makeup, /sameIds\(revealedIds, nextIds\)/);
  assert.match(makeup, /const serverVisibility = !initialMotionActive/);
  assert.match(makeup, /getServerVisibility:\s*\(\)\s*=>\s*serverVisibility/);
  assert.doesNotMatch(
    makeup,
    /getServerVisibility:\s*[^\n]*revealedIds/,
    'server visibility must not read the mutable revealed set',
  );
  assert.doesNotMatch(makeup, /useState\(\(\) => new Set\(\)\)/);
  assert.doesNotMatch(makeup, /revealedIds,\s*setRevealedIds/);
  assert.match(
    makeup,
    /if \(!root \|\| !layer\)[\s\S]*?setMotionActive\(false\)[\s\S]*?if \(!geometry\)\s*\{\s*return undefined;/,
    'the initial geometry-measurement gap must preserve the concealed snapshot',
  );
  assert.doesNotMatch(
    makeup,
    /if \([^)]*!geometry[^)]*\)[\s\S]{0,240}setMotionActive\(false\)/,
    'transient missing geometry must not reveal every subscriber',
  );

  const triggerCleanup = makeup.match(
    /return\s*\(\)\s*=>\s*\{\s*trigger\.kill\(\);([\s\S]*?)\n\s*\};/,
  );

  assert.ok(triggerCleanup, 'the scroll trigger must have an explicit cleanup');
  assert.doesNotMatch(
    triggerCleanup[1],
    /setMotionActive\s*\(/,
    'trigger cleanup must not emulate reduced motion during effect teardown',
  );
});
