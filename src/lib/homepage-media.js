const freezeMedia = (media) => Object.freeze(media);

export const homepageHeroMedia = freezeMedia({
  id: "interior",
  role: "hero",
  src: "/media/placeholders/glamour-studio-hero-clean-4k.jpg",
  width: 4096,
  height: 3072,
  objectPosition: "center center",
  heroObjectPosition: "58% center",
});

export const homepageStudioMedia = Object.freeze([
  freezeMedia({
    id: "work-area",
    role: "anchor",
    src: "/media/placeholders/glamour-studio-work-area-4k.jpg",
    width: 4096,
    height: 3072,
    objectPosition: "center center",
  }),
  freezeMedia({
    id: "reception-detail",
    role: "supporting",
    src: "/media/placeholders/glamour-studio-reception-detail-4k.jpg",
    width: 3072,
    height: 4096,
    objectPosition: "center center",
  }),
  freezeMedia({
    id: "lounge-detail",
    role: "supporting",
    src: "/media/placeholders/glamour-studio-lounge-clean-4k.jpg",
    width: 3072,
    height: 4096,
    objectPosition: "center center",
  }),
]);
