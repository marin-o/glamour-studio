const freezeMedia = (media) => Object.freeze(media);

export const homepageHeroMedia = freezeMedia({
  id: "interior",
  role: "hero",
  src: "/media/homepage/glamour-studio-hero-clean-4k.png",
  width: 4344,
  height: 3258,
  objectPosition: "center center",
  heroObjectPosition: "58% center",
});

export const homepageStudioMedia = Object.freeze([
  freezeMedia({
    id: "work-area",
    role: "anchor",
    src: "/media/homepage/glamour-studio-work-area-4k.png",
    width: 4344,
    height: 3258,
    objectPosition: "center center",
  }),
  freezeMedia({
    id: "reception-detail",
    role: "supporting",
    src: "/media/homepage/glamour-studio-reception-detail-4k.png",
    width: 3258,
    height: 4344,
    objectPosition: "center center",
  }),
  freezeMedia({
    id: "lounge-detail",
    role: "supporting",
    src: "/media/homepage/glamour-studio-lounge-clean-4k.png",
    width: 3258,
    height: 4344,
    objectPosition: "center center",
  }),
]);
