import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const MEDIA_ROOT = path.resolve("public/media/homepage");
const RESPONSIVE_ROOT = path.join(MEDIA_ROOT, "responsive");
const MIN_REDUCTION = 0.75;
const NEXT_DEVICE_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const NEXT_ANCHOR_WIDTHS = [384, ...NEXT_DEVICE_WIDTHS];
const NEXT_SUPPORTING_WIDTHS = [
  32,
  48,
  64,
  96,
  128,
  256,
  384,
  ...NEXT_DEVICE_WIDTHS,
];
const HOMEPAGE_MEDIA = [
  {
    masterName: "glamour-studio-hero-clean-4k.png",
    quality: 98,
    responsiveQuality: 95,
    responsiveWidths: NEXT_DEVICE_WIDTHS,
    role: "hero",
  },
  {
    masterName: "glamour-studio-work-area-4k.png",
    quality: 90,
    responsiveQuality: 82,
    responsiveWidths: NEXT_ANCHOR_WIDTHS,
    role: "anchor",
  },
  {
    masterName: "glamour-studio-reception-detail-4k.png",
    quality: 90,
    responsiveQuality: 82,
    responsiveWidths: NEXT_SUPPORTING_WIDTHS,
    role: "supporting",
  },
  {
    masterName: "glamour-studio-lounge-clean-4k.png",
    quality: 90,
    responsiveQuality: 82,
    responsiveWidths: NEXT_SUPPORTING_WIDTHS,
    role: "supporting",
  },
];

const HOMEPAGE_MASTERS = HOMEPAGE_MEDIA.map(({ masterName }) => masterName);

const derivativePath = (masterName) =>
  path.join(MEDIA_ROOT, masterName.replace(/\.png$/i, ".webp"));

const responsiveDerivativePath = (masterName, width, quality) =>
  path.join(
    RESPONSIVE_ROOT,
    `${masterName.replace(/\.png$/i, "")}-${width}w-q${quality}.webp`,
  );

async function inspectMedia(filePath) {
  const [fileStats, metadata] = await Promise.all([
    stat(filePath),
    sharp(filePath).metadata(),
  ]);

  if (!metadata.width || !metadata.height) {
    throw new Error(`Missing dimensions for ${filePath}`);
  }

  return {
    bytes: fileStats.size,
    height: metadata.height,
    width: metadata.width,
  };
}

async function checkDerivatives() {
  let masterBytes = 0;
  let derivativeBytes = 0;

  for (const masterName of HOMEPAGE_MASTERS) {
    const masterPath = path.join(MEDIA_ROOT, masterName);
    const derivative = derivativePath(masterName);
    const master = await inspectMedia(masterPath);
    const optimized = await inspectMedia(derivative);

    if (master.width !== optimized.width || master.height !== optimized.height) {
      throw new Error(
        `${path.basename(derivative)} dimensions ${optimized.width}x${optimized.height} do not match master ${master.width}x${master.height}`,
      );
    }

    masterBytes += master.bytes;
    derivativeBytes += optimized.bytes;
  }

  const responsiveNames = new Set(await readdir(RESPONSIVE_ROOT));
  const expectedResponsiveNames = new Set();
  let responsiveBytes = 0;
  let responsiveCount = 0;
  let representativeHeroBytes = 0;

  for (const {
    masterName,
    responsiveQuality,
    responsiveWidths,
  } of HOMEPAGE_MEDIA) {
    const masterPath = path.join(MEDIA_ROOT, masterName);
    const master = await inspectMedia(masterPath);

    for (const width of responsiveWidths) {
      const responsivePath = responsiveDerivativePath(
        masterName,
        width,
        responsiveQuality,
      );
      const responsiveName = path.basename(responsivePath);
      expectedResponsiveNames.add(responsiveName);
      if (!responsiveNames.has(responsiveName)) {
        throw new Error(`Missing homepage responsive derivative ${responsiveName}`);
      }

      const responsive = await inspectMedia(responsivePath);
      const expectedHeight = Math.round((master.height * width) / master.width);
      if (responsive.width !== width || responsive.height !== expectedHeight) {
        throw new Error(
          `${responsiveName} dimensions ${responsive.width}x${responsive.height} do not match expected ${width}x${expectedHeight}`,
        );
      }

      responsiveBytes += responsive.bytes;
      responsiveCount += 1;
      if (masterName === "glamour-studio-hero-clean-4k.png" && width === 1920) {
        representativeHeroBytes = responsive.bytes;
      }
    }
  }

  const unexpectedResponsiveNames = [...responsiveNames].filter(
    (name) => !expectedResponsiveNames.has(name),
  );
  if (unexpectedResponsiveNames.length > 0) {
    throw new Error(
      `Unexpected homepage responsive derivatives: ${unexpectedResponsiveNames.join(", ")}`,
    );
  }

  const reduction = 1 - derivativeBytes / masterBytes;
  if (reduction < MIN_REDUCTION) {
    throw new Error(
      `Homepage WebP derivatives reduce bytes by ${(reduction * 100).toFixed(2)}%; expected at least ${MIN_REDUCTION * 100}%`,
    );
  }

  console.log(
    `Homepage WebP check passed: ${masterBytes} PNG bytes -> ${derivativeBytes} canonical WebP bytes (${(reduction * 100).toFixed(2)}% reduction); ${responsiveCount} responsive variants total ${responsiveBytes} bytes (hero 1920w q95: ${representativeHeroBytes} bytes).`,
  );
}

async function optimizeDerivatives() {
  await mkdir(MEDIA_ROOT, { recursive: true });
  await mkdir(RESPONSIVE_ROOT, { recursive: true });

  for (const {
    masterName,
    quality,
    responsiveQuality,
    responsiveWidths,
    role,
  } of HOMEPAGE_MEDIA) {
    const masterPath = path.join(MEDIA_ROOT, masterName);
    const derivative = derivativePath(masterName);

    await sharp(masterPath)
      .webp({
        effort: 6,
        quality,
        smartSubsample: true,
      })
      .toFile(derivative);

    console.log(
      `Generated ${role} ${path.basename(derivative)} at WebP quality ${quality}.`,
    );

    for (const width of responsiveWidths) {
      const responsiveDerivative = responsiveDerivativePath(
        masterName,
        width,
        responsiveQuality,
      );

      await sharp(masterPath)
        .resize({ width })
        .webp({
          effort: 6,
          quality: responsiveQuality,
          smartSubsample: true,
        })
        .toFile(responsiveDerivative);
    }

    console.log(
      `Generated ${responsiveWidths.length} ${role} responsive variants at WebP quality ${responsiveQuality}.`,
    );
  }

  await checkDerivatives();
}

if (process.argv.includes("--check")) await checkDerivatives();
else await optimizeDerivatives();
