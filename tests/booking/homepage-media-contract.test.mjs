import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import sharp from "sharp";

import {
  homepageHeroMedia,
  homepageStudioMedia,
} from "../../src/lib/homepage-media.js";
import { homepageCopy } from "../../src/lib/homepage-copy.js";

const root = resolve(import.meta.dirname, "../..");
const read = (file) => readFileSync(resolve(root, file), "utf8");

const expectedMedia = [
  {
    media: homepageHeroMedia,
    id: "interior",
    role: "hero",
    src: "/media/placeholders/glamour-studio-hero-clean-4k.jpg",
    width: 4096,
    height: 3072,
  },
  {
    media: homepageStudioMedia[0],
    id: "work-area",
    role: "anchor",
    src: "/media/placeholders/glamour-studio-work-area-4k.jpg",
    width: 4096,
    height: 3072,
  },
  {
    media: homepageStudioMedia[1],
    id: "reception-detail",
    role: "supporting",
    src: "/media/placeholders/glamour-studio-reception-detail-4k.jpg",
    width: 3072,
    height: 4096,
  },
  {
    media: homepageStudioMedia[2],
    id: "lounge-detail",
    role: "supporting",
    src: "/media/placeholders/glamour-studio-lounge-clean-4k.jpg",
    width: 3072,
    height: 4096,
  },
];

test("homepage media has one hero and a distinct work-area studio band", async () => {
  assert.equal(homepageHeroMedia.role, "hero");
  assert.equal(homepageStudioMedia[0].role, "anchor");
  assert.deepEqual(
    homepageStudioMedia.map(({ id, role }) => ({ id, role })),
    [
      { id: "work-area", role: "anchor" },
      { id: "reception-detail", role: "supporting" },
      { id: "lounge-detail", role: "supporting" },
    ],
  );
  assert.ok(
    homepageStudioMedia.every(({ src }) => src !== homepageHeroMedia.src),
    "studio media must not reuse the hero source",
  );
  assert.equal(
    new Set([homepageHeroMedia.src, ...homepageStudioMedia.map(({ src }) => src)]).size,
    4,
    "hero and studio sources must all be distinct",
  );

  for (const expected of expectedMedia) {
    assert.equal(expected.media.id, expected.id);
    assert.equal(expected.media.role, expected.role);
    assert.equal(expected.media.src, expected.src);
    assert.equal(expected.media.width, expected.width);
    assert.equal(expected.media.height, expected.height);

    const filePath = resolve(root, "public", expected.src.slice(1));
    assert.ok(existsSync(filePath), expected.src);
    const digest = createHash("sha256")
      .update(readFileSync(filePath))
      .digest("hex");
    expected.digest = digest;
    const dimensions = await sharp(filePath).metadata();
    assert.equal(dimensions.width, expected.width, `${expected.id} width`);
    assert.equal(dimensions.height, expected.height, `${expected.id} height`);
    assert.doesNotMatch(expected.src, /concept|interior-wide|styling-chairs/i);
  }

  assert.equal(
    new Set(expectedMedia.map(({ digest }) => digest)).size,
    expectedMedia.length,
    "hero and studio derivatives must have distinct binary contents",
  );
});

test("localized media copy follows the four visible scene IDs", () => {
  const ids = ["interior", "work-area", "reception-detail", "lounge-detail"];
  for (const language of ["mk", "en"]) {
    const copy = homepageCopy[language];
    assert.deepEqual(Object.keys(copy.media.items), ids);
    assert.equal(Object.hasOwn(copy.media, 'label'), false);
    assert.equal(Object.hasOwn(copy.media, 'description'), false);

    for (const item of Object.values(copy.media.items)) {
      assert.ok(item.alt.length > 0);
      assert.ok(item.caption.length > 0);
      assert.doesNotMatch(item.alt, /concept|концепт|client|клиент|provisional|привремена|not final|не конечна|no people|без луѓе|без препознатливи/i);
      assert.doesNotMatch(item.caption, /provisional|привремена|first selection|прва селекција|no people|без луѓе/i);
    }
  }
});

test("homepage, booking, and Open Graph consumers keep media roles explicit", () => {
  const home = read("src/components/TypographySalonPage.jsx");
  const booking = read("src/components/booking/BookingExperience.jsx");
  const layout = read("src/app/layout.jsx");

  assert.match(home, /homepageHeroMedia/);
  assert.match(home, /homepageStudioMedia/);
  assert.match(home, /const heroMedia = homepageHeroMedia/);
  assert.match(home, /const \[anchorMedia, \.\.\.supportingMedia\] = homepageStudioMedia/);
  assert.match(
    home,
    /<Image[\s\S]*?height=\{heroMedia\.height\}[\s\S]*?src=\{heroMedia\.src\}[\s\S]*?width=\{heroMedia\.width\}/,
    "hero image must consume heroMedia fields",
  );
  assert.match(
    home,
    /<Image[\s\S]*?alt=\{copy\.media\.items\[anchorMedia\.id\]\.alt\}[\s\S]*?height=\{anchorMedia\.height\}[\s\S]*?src=\{anchorMedia\.src\}[\s\S]*?width=\{anchorMedia\.width\}/,
    "studio anchor image must consume anchorMedia fields",
  );
  assert.match(
    home,
    /supportingMedia\.map\(\(media\) => \([\s\S]*?<Image[\s\S]*?height=\{media\.height\}[\s\S]*?src=\{media\.src\}[\s\S]*?width=\{media\.width\}/,
    "supporting images must consume each media entry fields",
  );
  assert.doesNotMatch(home, /homepageMedia/);

  assert.match(booking, /homepageHeroMedia/);
  assert.match(booking, /const bookingHeroMedia = homepageHeroMedia/);
  assert.match(booking, /src=\{bookingHeroMedia\.src\}/);
  assert.doesNotMatch(booking, /homepageStudioMedia|homepageMedia/);

  assert.match(layout, /homepageHeroMedia/);
  assert.match(layout, /const homepageOgImage = homepageHeroMedia/);
  assert.match(layout, /url: homepageOgImage\.src/);
  assert.match(layout, /width: homepageOgImage\.width/);
  assert.match(layout, /height: homepageOgImage\.height/);
  assert.match(layout, /metadataBase: new URL\("https:\/\/example\.com"\)/);
  assert.doesNotMatch(layout, /salon-interior-concept\.png/);
});
