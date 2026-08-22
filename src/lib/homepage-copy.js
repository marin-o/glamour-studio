const bilingual = (mk, en) => Object.freeze({ mk, en });

const homepageContent = {
  metadata: {
    title: bilingual(
      "Glamour Studio | Фризерски и мејкап салон во Радовиш",
      "Glamour Studio | Hair & makeup salon in Radovish",
    ),
    description: bilingual(
      "Glamour Studio во Радовиш е фризерски и мејкап салон за шишање, стилизирање, боење, третмани и шминка. Изберете услуга и закажете термин онлајн.",
      "Glamour Studio is a hair and makeup salon in Radovish for haircuts, styling, colour, treatments and makeup. Choose a service and book online.",
    ),
    openGraphDescription: bilingual(
      "Glamour Studio во Радовиш е фризерски и мејкап салон за шишање, стилизирање, боење, третмани и шминка. Изберете услуга и закажете термин онлајн.",
      "Glamour Studio is a hair and makeup salon in Radovish for haircuts, styling, colour, treatments and makeup. Choose a service and book online.",
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
      "Фризерски и мејкап салон во Радовиш со топол простор и внимателна работа за вашиот изглед.\nИзберете услуга и закажете термин онлајн.",
      "A hair and makeup salon in Radovish with a warm space and attentive work for your look.\nChoose a service and book an appointment online.",
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
        description: bilingual(
          "Кратка и долга коса, исправување и виткање.",
          "Short and long hair, straightening and curling.",
        ),
      },
      {
        id: "colour-treatments",
        label: bilingual("Боење и третмани", "Colour & treatments"),
        description: bilingual(
          "Боење, прамени, балајаж и кератински третман за хидратација.",
          "Colouring, highlights, balayage and a keratin treatment for hydration.",
        ),
      },
      {
        id: "makeup",
        label: bilingual("Шминка", "Makeup"),
        description: bilingual(
          "Шминка за изгледот што го замислувате.",
          "Makeup for the look you have in mind.",
        ),
      },
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
      "Фризерски и мејкап салон во Радовиш со елегантен, топол простор создаден за вашиот изглед. Тука секоја посета е посветена на вас.",
      "A hair and makeup salon in Radovish with an elegant, warm setting created for your look. Every visit here is dedicated to you.",
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
        href: "https://www.google.com/maps/search/?api=1&query=6+Ilija+Aleksov+Radovish",
        label: bilingual("Адреса", "Address"),
        value: bilingual(
          "ул. Илија Алексов 6, Радовиш",
          "6 Ilija Aleksov, Radovish",
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
