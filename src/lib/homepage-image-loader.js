const RESPONSIVE_WIDTHS = Object.freeze({
  hero: new Set([640, 750, 828, 1080, 1200, 1920, 2048, 3840]),
  anchor: new Set([384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]),
  supporting: new Set([
    32,
    48,
    64,
    96,
    128,
    256,
    384,
    640,
    750,
    828,
    1080,
    1200,
    1920,
    2048,
    3840,
  ]),
});

const MEDIA_ROLES = Object.freeze({
  "glamour-studio-hero-clean-4k": "hero",
  "glamour-studio-work-area-4k": "anchor",
  "glamour-studio-reception-detail-4k": "supporting",
  "glamour-studio-lounge-clean-4k": "supporting",
});

const roleForSource = (src) => {
  const basename = src.split("/").pop()?.replace(/\.webp$/i, "");
  const role = MEDIA_ROLES[basename];
  if (!role) {
    throw new Error(`Unknown homepage image source: ${src}`);
  }
  return role;
};

export default function homepageImageLoader({ src, width, quality }) {
  const role = roleForSource(src);
  const numericWidth = Number(width);
  const numericQuality = Number(quality);

  if (!Number.isInteger(numericWidth) || !RESPONSIVE_WIDTHS[role].has(numericWidth)) {
    throw new Error(`Unsupported ${role} homepage image width: ${width}`);
  }
  if (![82, 95].includes(numericQuality)) {
    throw new Error(`Unsupported homepage image quality: ${quality}`);
  }
  if (role === "hero" && numericQuality !== 95) {
    throw new Error(`Homepage hero must use quality 95, received ${quality}`);
  }
  if (role !== "hero" && numericQuality !== 82) {
    throw new Error(`Homepage studio media must use quality 82, received ${quality}`);
  }

  return `/media/homepage/responsive/${src
    .split("/")
    .pop()
    .replace(/\.webp$/i, "")}-${numericWidth}w-q${numericQuality}.webp`;
}

