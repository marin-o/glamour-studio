const bilingual = (mk, en) => Object.freeze({ mk, en });

const homepageContent = {
  metadata: {
    title: bilingual(
      "Glamour Studio",
      "Glamour Studio",
    ),
    description: bilingual(
      "Glamour Studio во Радовиш е елегантен салон со широк и топол простор, создаден за вашиот изглед. Закажете термин онлајн.",
      "Glamour Studio in Radovish is an elegant salon with a spacious, warm setting for your look. Book an appointment online.",
    ),
    openGraphDescription: bilingual(
      "Glamour Studio во Радовиш е елегантен салон со широк и топол простор, создаден за вашиот изглед. Закажете термин онлајн.",
      "Glamour Studio in Radovish is an elegant salon with a spacious, warm setting for your look. Book an appointment online.",
    ),
    imageAlt: bilingual(
      "Ентериер на Glamour Studio со огледала и топли детали.",
      "Glamour Studio interior with mirrors and warm gold details.",
    ),
  },
  language: {
    toggleText: bilingual("EN", "MK"),
    toggleLabel: bilingual(
      "Префрли на англиски",
      "Switch to Macedonian",
    ),
  },
  hero: {
    titleWords: [
      bilingual("Glamour", "Glamour"),
      bilingual("Studio", "Studio"),
    ],
    intro: bilingual(
      "Вашето место за коса, шминка и убавина во Радовиш.\nТопол простор, внимателна работа и изглед создаден за вас.",
      "Your place for hair, makeup, and beauty in Radovish.\nA warm space, attentive work, and a look created for you.",
    ),
  },
  media: {
    items: {
      interior: {
        alt: bilingual(
          "Ентериер на Glamour Studio со огледала и топли детали.",
          "Glamour Studio interior with mirrors and warm gold details.",
        ),
        caption: bilingual(
          "Ентериер на Glamour Studio со огледала и топли детали.",
          "Glamour Studio interior with mirrors and warm gold details.",
        ),
      },
      "work-area": {
        alt: bilingual(
          "Широк работен простор во Glamour Studio.",
          "Wide Glamour Studio work area with styling stations.",
        ),
        caption: bilingual(
          "Широк работен простор во Glamour Studio.",
          "Wide Glamour Studio work area with styling stations.",
        ),
      },
      "reception-detail": {
        alt: bilingual(
          "Рецепција со натпис Glamour Studio, цвеќе и прозорец.",
          "Reception desk with the Glamour Studio sign, flowers and a street-facing window.",
        ),
        caption: bilingual(
          "Рецепција со натпис Glamour Studio, цвеќе и прозорец.",
          "Reception desk with the Glamour Studio sign, flowers and a street-facing window.",
        ),
      },
      "lounge-detail": {
        alt: bilingual(
          "Детал од лаунџот на Glamour Studio.",
          "Glamour Studio lounge detail with seating and warm interior finishes.",
        ),
        caption: bilingual(
          "Детал од лаунџот на Glamour Studio.",
          "Glamour Studio lounge detail with seating and warm interior finishes.",
        ),
      },
    },
  },
  services: {
    title: bilingual("Внимание во секој детал.", "Care in every detail."),
    groups: [
      {
        id: "haircuts-styling",
        label: bilingual("Шишање и стилизирање", "Haircuts & styling"),
      },
      {
        id: "colour-treatments",
        label: bilingual("Боење и третмани", "Colour & treatments"),
      },
      { id: "makeup", label: bilingual("Шминка", "Makeup") },
    ],
    cta: bilingual(
      "Погледнете ги сите услуги и закажете термин",
      "View the full service menu and book an appointment",
    ),
  },
  studioIntro: {
    eyebrow: bilingual("За Glamour Studio", "About Glamour Studio"),
    title: bilingual(
      "Простор создаден за вашиот изглед.",
      "A space made for your look.",
    ),
    description: bilingual(
      "Елегантен салон близу срцето на градот. Широк и топол простор, најдоброто место за вашиот изглед. Тука секоја посета е посветена на вас.",
      "An elegant salon near the heart of the city. A spacious, warm setting and the right place for your look. Every visit here is dedicated to you.",
    ),
  },
  contact: {
    eyebrow: bilingual("Контакт и закажување", "Contact and booking"),
    title: bilingual("Посета и контакт", "Visit and contact"),
    items: [
      {
        href: "tel:077643005",
        label: bilingual("Телефон", "Phone"),
        value: bilingual("077-643-005", "077-643-005"),
      },
      {
        href: "https://www.google.com/maps/search/?api=1&query=11+Ilija+Aleksov+Radovish",
        label: bilingual("Адреса", "Address"),
        value: bilingual(
          "ул. Илија Алексов 11, Радовиш",
          "11 Ilija Aleksov, Radovish",
        ),
      },
      {
        href: "https://www.instagram.com/glamourrstudiio/",
        label: bilingual("Instagram", "Instagram"),
        value: bilingual("@glamourrstudiio", "@glamourrstudiio"),
      },
    ],
    booking: bilingual("Закажи онлајн", "Book online"),
  },
  navigation: {
    label: bilingual(
      "Навигација на веб-страницата",
      "Site navigation",
    ),
    services: bilingual("Услуги", "Services"),
    studio: bilingual("Студио", "Studio media"),
    lookbook: bilingual("Lookbook", "Lookbook"),
    bookShort: bilingual("Закажи", "Book"),
    book: bilingual("Закажи", "Book"),
    addressLabel: bilingual(
      "Отвори ја адресата во Google Maps",
      "Open the address in Google Maps",
    ),
  },
};

const isBilingualText = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).length === 2 &&
  Object.hasOwn(value, "mk") &&
  Object.hasOwn(value, "en");

const localize = (value, language) => {
  if (isBilingualText(value)) {
    return value[language];
  }

  if (Array.isArray(value)) {
    return value.map((item) => localize(item, language));
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        localize(item, language),
      ]),
    );
  }

  return value;
};

export const DEFAULT_HOMEPAGE_LANGUAGE = "mk";
export const homepageCopy = Object.freeze({
  mk: localize(homepageContent, "mk"),
  en: localize(homepageContent, "en"),
});
