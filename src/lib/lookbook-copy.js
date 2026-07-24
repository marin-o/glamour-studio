export const lookbookCopy = {
  mk: {
    returnLabel: "Врати се на почетната страна",
    regionLabel: "Lookbook",
    heading: "Lookbook на Glamour Studio",
    originalReelLabel: (index) =>
      `Отвори ја оригиналната Instagram објава за слика ${index}`,
    originalPostLabel: (index) =>
      `Отвори ја оригиналната Instagram објава за слика ${index}`,
    reelBadge: "Кадар од Reel",
    reelSource: "Погледни ја изворната објава",
    postSource: "Погледни ја изворната објава",
    imageCount: (current, total) => `Слика ${current} од ${total}`,
  },
  en: {
    returnLabel: "Return to the homepage",
    regionLabel: "Lookbook",
    heading: "Glamour Studio Lookbook",
    originalReelLabel: (index) =>
      `Open the original Instagram post for image ${index}`,
    originalPostLabel: (index) =>
      `Open the original Instagram post for image ${index}`,
    reelBadge: "Still frame from a Reel",
    reelSource: "View original Instagram post",
    postSource: "View original Instagram post",
    imageCount: (current, total) => `Image ${current} of ${total}`,
  },
};
