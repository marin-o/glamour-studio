import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import sharp from "sharp";

import {
  homepageHeroMedia,
  homepageStudioMedia,
} from "../../src/lib/homepage-media.js";
import { homepageCopy } from "../../src/lib/homepage-copy.js";
import homepageImageLoader from "../../src/lib/homepage-image-loader.js";

const root = resolve(import.meta.dirname, "../..");
const read = (file) => readFileSync(resolve(root, file), "utf8");
const instrumentationClient = read("src/instrumentation-client.js");

const expectedMedia = [
  {
    media: homepageHeroMedia,
    id: "interior",
    role: "hero",
    src: "/media/homepage/glamour-studio-hero-clean-4k.webp",
    width: 4344,
    height: 3258,
    responsiveQuality: 95,
    responsiveWidths: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    objectPosition: "center center",
  },
  {
    media: homepageStudioMedia[0],
    id: "work-area",
    role: "anchor",
    src: "/media/homepage/glamour-studio-work-area-4k.webp",
    width: 4344,
    height: 3258,
    responsiveQuality: 82,
    responsiveWidths: [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    objectPosition: "center center",
  },
  {
    media: homepageStudioMedia[1],
    id: "reception-detail",
    role: "supporting",
    src: "/media/homepage/glamour-studio-reception-detail-4k.webp",
    width: 3258,
    height: 4344,
    responsiveQuality: 82,
    responsiveWidths: [
      32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920,
      2048, 3840,
    ],
    objectPosition: "center center",
  },
  {
    media: homepageStudioMedia[2],
    id: "lounge-detail",
    role: "supporting",
    src: "/media/homepage/glamour-studio-lounge-clean-4k.webp",
    width: 3258,
    height: 4344,
    responsiveQuality: 82,
    responsiveWidths: [
      32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920,
      2048, 3840,
    ],
    objectPosition: "center center",
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

  let masterBytes = 0;
  let optimizedBytes = 0;
  let responsiveBytes = 0;
  let responsiveCount = 0;
  const expectedResponsiveNames = [];

  for (const expected of expectedMedia) {
    assert.equal(expected.media.id, expected.id);
    assert.equal(expected.media.role, expected.role);
    assert.equal(expected.media.src, expected.src);
    assert.equal(expected.media.width, expected.width);
    assert.equal(expected.media.height, expected.height);
    assert.equal(expected.media.objectPosition, expected.objectPosition);
    if (expected.role === "hero") {
      assert.equal(expected.media.heroObjectPosition, "58% center");
    }

    const filePath = resolve(root, "public", expected.src.slice(1));
    assert.ok(existsSync(filePath), expected.src);
    assert.match(expected.src, /^\/media\/homepage\/[^/]+\.webp$/);
    const masterPath = filePath.replace(/\.webp$/i, ".png");
    assert.ok(existsSync(masterPath), `${expected.id} PNG master`);
    const digest = createHash("sha256")
      .update(readFileSync(filePath))
      .digest("hex");
    expected.digest = digest;
    const dimensions = await sharp(filePath).metadata();
    assert.equal(dimensions.width, expected.width, `${expected.id} width`);
    assert.equal(dimensions.height, expected.height, `${expected.id} height`);
    const masterDimensions = await sharp(masterPath).metadata();
    assert.equal(masterDimensions.width, expected.width, `${expected.id} master width`);
    assert.equal(masterDimensions.height, expected.height, `${expected.id} master height`);
    masterBytes += statSync(masterPath).size;
    optimizedBytes += statSync(filePath).size;
    assert.doesNotMatch(expected.src, /concept|interior-wide|styling-chairs/i);

    for (const width of expected.responsiveWidths) {
      const responsiveName = `${expected.src
        .split("/")
        .pop()
        .replace(/\.webp$/i, "")}-${width}w-q${expected.responsiveQuality}.webp`;
      const responsivePath = resolve(
        root,
        "public/media/homepage/responsive",
        responsiveName,
      );
      assert.ok(existsSync(responsivePath), responsiveName);
      const dimensions = await sharp(responsivePath).metadata();
      assert.equal(dimensions.width, width, `${responsiveName} width`);
      assert.equal(
        dimensions.height,
        Math.round((expected.height * width) / expected.width),
        `${responsiveName} proportional height`,
      );
      assert.match(
        responsiveName,
        new RegExp(`-${width}w-q${expected.responsiveQuality}\\.webp$`),
      );
      expectedResponsiveNames.push(responsiveName);
      responsiveBytes += statSync(responsivePath).size;
      responsiveCount += 1;
    }
  }

  const responsiveFiles = (await import("node:fs/promises")).readdir(
    resolve(root, "public/media/homepage/responsive"),
  );
  assert.deepEqual(
    (await responsiveFiles).sort(),
    expectedResponsiveNames.sort(),
    "homepage responsive directory must contain exactly the required variants",
  );
  assert.equal(responsiveCount, 47, "all 47 Next-requested variants must exist");
  assert.ok(responsiveBytes > 0, "responsive variants must have generated bytes");

  assert.equal(
    new Set(expectedMedia.map(({ digest }) => digest)).size,
    expectedMedia.length,
    "hero and studio derivatives must have distinct binary contents",
  );
  assert.ok(
    1 - optimizedBytes / masterBytes >= 0.75,
    `homepage WebP derivatives must reduce PNG bytes by at least 75% (got ${((1 - optimizedBytes / masterBytes) * 100).toFixed(2)}%)`,
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
  const mediaScript = read("scripts/media/homepage-webp.mjs");
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
  const imageBlocks = [...home.matchAll(/<Image\b[\s\S]*?\/>/g)].map(
    ([block]) => block,
  );
  assert.equal(imageBlocks.length, 3, "homepage must render exactly three Image blocks");
  const heroBlock = imageBlocks.find((block) =>
    block.includes("src={heroMedia.src}"),
  );
  const anchorBlock = imageBlocks.find((block) =>
    block.includes("src={anchorMedia.src}"),
  );
  const supportingBlocks = imageBlocks.filter((block) =>
    block.includes("src={media.src}"),
  );
  assert.ok(heroBlock, "homepage hero image must be present");
  assert.ok(anchorBlock, "homepage anchor image must be present");
  assert.equal(
    supportingBlocks.length,
    1,
    "homepage must render supporting images through one map block",
  );
  assert.equal(
    homepageStudioMedia.filter(({ role }) => role === "supporting").length,
    2,
    "supporting image map must represent two runtime images",
  );
  assert.match(heroBlock, /quality=\{95\}/, "hero image must request high fidelity");
  assert.match(heroBlock, /loader=\{homepageImageLoader\}/);
  assert.doesNotMatch(heroBlock, /quality=\{82\}/);
  assert.match(heroBlock, /\bpriority\b/);
  assert.doesNotMatch(heroBlock, /loading=["']lazy["']/);
  for (const block of [anchorBlock, ...supportingBlocks]) {
    assert.match(block, /loading=["']eager["']/);
    assert.match(block, /fetchPriority=["']low["']/);
    assert.match(block, /quality=\{82\}/);
    assert.match(block, /loader=\{homepageImageLoader\}/);
    assert.doesNotMatch(block, /loading=["']lazy["']/);
    assert.doesNotMatch(block, /\bpriority\b/);
  }
  assert.match(
    mediaScript,
    /masterName:\s*["']glamour-studio-hero-clean-4k\.png["'][\s\S]*?quality:\s*98[\s\S]*?role:\s*["']hero["']/,
    "hero derivative must use high source quality",
  );
  assert.match(
    mediaScript,
    /masterName:\s*["']glamour-studio-work-area-4k\.png["'][\s\S]*?quality:\s*90[\s\S]*?role:\s*["']anchor["']/,
    "studio anchor derivative must use the studio quality",
  );
  assert.match(
    mediaScript,
    /masterName:\s*["']glamour-studio-reception-detail-4k\.png["'][\s\S]*?quality:\s*90[\s\S]*?role:\s*["']supporting["']/,
    "reception derivative must use the studio quality",
  );
  assert.match(
    mediaScript,
    /masterName:\s*["']glamour-studio-lounge-clean-4k\.png["'][\s\S]*?quality:\s*90[\s\S]*?role:\s*["']supporting["']/,
    "lounge derivative must use the studio quality",
  );
  assert.match(mediaScript, /RESPONSIVE_ROOT/);
  assert.match(mediaScript, /resize\(\{ width \}\)/);
  assert.match(mediaScript, /sharp\(masterPath\)/);
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
  assert.doesNotMatch(layout, /next\/script|beforeInteractive|historyTransitionBridge/);
  assert.match(instrumentationClient, /__glamourHistoryTransitionBridge/);
  assert.match(instrumentationClient, /addEventListener\(\s*["']popstate["']/);
  assert.match(instrumentationClient, /glamour:history-transition/);
  assert.match(instrumentationClient, /2400/);
});

test("homepage static loader maps every requested width to generated files", () => {
  const roleCases = [
    {
      src: homepageHeroMedia.src,
      quality: 95,
      widths: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    },
    {
      src: homepageStudioMedia[0].src,
      quality: 82,
      widths: [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    },
    {
      src: homepageStudioMedia[1].src,
      quality: 82,
      widths: [
        32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920,
        2048, 3840,
      ],
    },
    {
      src: homepageStudioMedia[2].src,
      quality: 82,
      widths: [
        32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920,
        2048, 3840,
      ],
    },
  ];

  for (const { src, quality, widths } of roleCases) {
    for (const width of widths) {
      assert.equal(
        homepageImageLoader({ src, width, quality }),
        `/media/homepage/responsive/${src
          .split("/")
          .pop()
          .replace(/\.webp$/i, "")}-${width}w-q${quality}.webp`,
      );
    }
  }

  for (const expected of expectedMedia) {
    assert.equal(
      homepageImageLoader({
        src: expected.src,
        width: expected.width,
        quality: expected.responsiveQuality,
      }),
      `/media/homepage/responsive/${expected.src
        .split("/")
        .pop()
        .replace(/\.webp$/i, "")}-3840w-q${expected.responsiveQuality}.webp`,
      `${expected.id} intrinsic width maps to the largest generated variant`,
    );
  }

  assert.equal(
    homepageImageLoader({
      src: homepageHeroMedia.src,
      width: homepageHeroMedia.width,
      quality: 95,
    }),
    `/media/homepage/responsive/glamour-studio-hero-clean-4k-3840w-q95.webp`,
  );
  assert.equal(
    homepageImageLoader({ src: homepageHeroMedia.src, width: 5000, quality: 95 }),
    `/media/homepage/responsive/glamour-studio-hero-clean-4k-3840w-q95.webp`,
  );

  assert.throws(
    () => homepageImageLoader({ src: homepageHeroMedia.src, width: 384, quality: 95 }),
    /Unsupported hero homepage image width/,
  );
  assert.throws(
    () =>
      homepageImageLoader({
        src: homepageStudioMedia[1].src,
        width: 3257,
        quality: 82,
      }),
    /Unsupported supporting homepage image width/,
  );
  assert.throws(
    () => homepageImageLoader({ src: homepageHeroMedia.src, width: 640, quality: 82 }),
    /Homepage hero must use quality 95/,
  );
});
