const bilingual = (mk, en) => Object.freeze({ mk, en });

const homepageContent = {
  metadata: {
    title: bilingual(
      "Glamour Studio | Привремена веб-страница",
      "Glamour Studio | Provisional website",
    ),
    description: bilingual(
      "Веб-страница за Glamour Studio во Радовиш со привремена прва селекција на реални студиски фотографии. Конечниот текст и работното време чекаат потврда од сопственикот.",
      "A website for Glamour Studio in Radovish with a provisional first selection of real studio photographs. Final copy and opening hours await owner confirmation.",
    ),
    openGraphDescription: bilingual(
      "Привремена прва селекција на реални фотографии од Glamour Studio во Радовиш; конечниот текст и работното време сè уште не се одобрени.",
      "A provisional first selection of real Glamour Studio photographs in Radovish; final copy and opening hours are not yet approved.",
    ),
    imageAlt: bilingual(
      "Ентериер на Glamour Studio со огледала и топли детали.",
      "Glamour Studio interior with mirrors and warm gold details.",
    ),
  },
  typographyMetadata: {
    title: bilingual(
      "Типографска студија | Glamour Studio",
      "Typography study | Glamour Studio",
    ),
    description: bilingual(
      "Привремена типографска студија за Glamour Studio; текстот, медиумите и работното време чекаат потврда.",
      "A provisional typography study for Glamour Studio; copy, media, and opening hours await confirmation.",
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
    eyebrow: {
      home: bilingual(
        "Типографски почетен концепт",
        "Typography-led homepage",
      ),
      typography: bilingual(
        "Типографска студија / истата насока како почетната страница",
        "Typography study / same direction as homepage",
      ),
    },
    titleWords: [
      bilingual("Glamour", "Glamour"),
      bilingual("Studio", "Studio"),
    ],
    intro: bilingual(
      "Потивка насока за салонот, каде првиот впечаток го создаваат типографијата, просторот и топлиот уреднички ритам, а не декоративни картички или непотврдени детали.",
      "A quieter salon direction where the first impression comes from type, spacing, and warm editorial rhythm instead of placeholder imagery or decorative card systems.",
    ),
    pending: bilingual(
      "Ова е привремен нацрт за Радовиш. Оваа прва селекција на реални фотографии, конечниот текст и работното време сè уште чекаат одлука и потврда од сопственикот.",
      "This is still a provisional draft for Radovish. This first selection of real photographs, final copy, and opening hours remain owner decisions.",
    ),
    mediaContext: bilingual(
      "Привремена фотографија од ентериерот на студиото ја поддржува отварањето на страницата.",
      "A provisional studio-interior photograph supports the opening page and is softly blurred behind the introduction.",
    ),
  },
  media: {
    label: bilingual(
      "Привремена селекција на реални фотографии — конечна одлука за медиумите е во тек",
      "Provisional selection of real photographs — final media approval is pending",
    ),
    eyebrow: bilingual("Поглед кон студиото", "Studio glimpse"),
    title: bilingual(
      "Мирен простор за внимателна работа.",
      "A calm place for careful work.",
    ),
    description: bilingual(
      "Оваа прва работна селекција прикажува реални простори од Glamour Studio: широк работен простор, детал од рецепцијата и детал од лаунџот. Фотографиите се користат привремено додека сопственикот ја потврди селекцијата и дозволите.",
      "This first working selection shows real Glamour Studio spaces: a wide work area, a reception detail, and a lounge detail. The photographs are used provisionally while the owner confirms the final selection and permissions.",
    ),
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
    title: bilingual("Внимание во секој детаљ.", "Care in every detail."),
    groups: [
      { id: "haircuts", label: bilingual("Шишање", "Haircuts") },
      { id: "styling", label: bilingual("Стилизирање", "Styling") },
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
  tone: {
    eyebrow: bilingual("Проверка на тонот", "Tone test"),
    title: bilingual(
      "Нежно, локално, практично — намерно недовршено.",
      "Soft, local, practical, unfinished on purpose.",
    ),
    description: bilingual(
      "Оваа насока го задржува салонот мирен и читлив, а недовршените делови остануваат јасно означени. Привремената селекција на реални фотографии подоцна може да се прецизира заедно со одобрениот текст, без зависност од генерички фотографии за убавина.",
      "This direction keeps the salon presence calm and legible while making the unfinished parts explicit. The provisional real-photo selection can be refined alongside approved copy without depending on generic beauty imagery.",
    ),
  },
  contact: {
    eyebrow: bilingual("Контакт и закажување", "Contact and booking"),
    title: bilingual("Посета или контакт.", "Visit or get in touch."),
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
    disclosure: bilingual(
      "Телефонот, адресата и Instagram профилот се потврдени од сопственикот. Повик или порака не потврдува термин; работното време и дополнителните канали за пораки сè уште не се одобрени.",
      "The phone, address, and Instagram profile are owner-confirmed. Calling or messaging does not confirm an appointment; opening hours and additional messaging channels are not yet approved.",
    ),
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
    book: bilingual("Закажи онлајн", "Book online"),
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
