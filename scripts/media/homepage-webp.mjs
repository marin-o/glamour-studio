import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const MEDIA_ROOT = path.resolve("public/media/homepage");
const MIN_REDUCTION = 0.75;
const HOMEPAGE_MEDIA = [
  {
    masterName: "glamour-studio-hero-clean-4k.png",
    quality: 98,
    role: "hero",
  },
  {
    masterName: "glamour-studio-work-area-4k.png",
    quality: 90,
    role: "anchor",
  },
  {
    masterName: "glamour-studio-reception-detail-4k.png",
    quality: 90,
    role: "supporting",
  },
  {
    masterName: "glamour-studio-lounge-clean-4k.png",
    quality: 90,
    role: "supporting",
  },
];

const HOMEPAGE_MASTERS = HOMEPAGE_MEDIA.map(({ masterName }) => masterName);

const derivativePath = (masterName) =>
  path.join(MEDIA_ROOT, masterName.replace(/\.png$/i, ".webp"));

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

  const reduction = 1 - derivativeBytes / masterBytes;
  if (reduction < MIN_REDUCTION) {
    throw new Error(
      `Homepage WebP derivatives reduce bytes by ${(reduction * 100).toFixed(2)}%; expected at least ${MIN_REDUCTION * 100}%`,
    );
  }

  console.log(
    `Homepage WebP check passed: ${masterBytes} PNG bytes -> ${derivativeBytes} WebP bytes (${(reduction * 100).toFixed(2)}% reduction).`,
  );
}

async function optimizeDerivatives() {
  await mkdir(MEDIA_ROOT, { recursive: true });

  for (const { masterName, quality, role } of HOMEPAGE_MEDIA) {
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
  }

  await checkDerivatives();
}

if (process.argv.includes("--check")) await checkDerivatives();
else await optimizeDerivatives();
