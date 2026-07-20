const bilingual = (mk, en) => Object.freeze({ mk, en });

const homepageContent = {
  metadata: {
    title: bilingual(
      "Glamour Studio | Привремена веб-страница",
      "Glamour Studio | Provisional website",
    ),
    description: bilingual(
      "Привремена веб-страница за Glamour Studio во Радовиш. Текстот, услугите, работното време и начинот на закажување чекаат потврда од сопственикот.",
      "A provisional website for Glamour Studio in Radovish. Copy, services, opening hours, and booking details are awaiting owner confirmation.",
    ),
    openGraphDescription: bilingual(
      "Привремен концепт за Glamour Studio во Радовиш; конечниот текст, услугите, работното време и начинот на закажување сè уште не се одобрени.",
      "A provisional concept for Glamour Studio in Radovish; final copy, services, opening hours, and booking details are not yet approved.",
    ),
    imageAlt: bilingual(
      "Привремена концептуална слика од топол салонски ентериер; ова не е вистинското Glamour Studio.",
      "Provisional concept image of a warm salon interior; this is not the real Glamour Studio.",
    ),
  },
  typographyMetadata: {
    title: bilingual(
      "Типографска студија | Glamour Studio",
      "Typography study | Glamour Studio",
    ),
    description: bilingual(
      "Привремена типографска студија за Glamour Studio; текстот, услугите, медиумите, работното време и начинот на закажување чекаат потврда.",
      "A provisional typography study for Glamour Studio; copy, services, media, opening hours, and booking details are awaiting confirmation.",
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
      "Ова е привремен нацрт за Радовиш. Вистинските фотографии, конечниот текст, цените, работното време, услугите и начинот на закажување сè уште чекаат одлука и потврда од сопственикот.",
      "This is still a provisional draft for Radovish. Real media, final copy, prices, hours, service details, and booking behavior remain owner decisions.",
    ),
    mediaContext: bilingual(
      "Концептот за ентериер е употребен како нежно заматена почетна заднина.",
      "Interior concept used as a softly blurred opening background.",
    ),
  },
  media: {
    label: bilingual(
      "Концептуални фотографии — се чекаат вистински фотографии од студиото",
      "Concept imagery — real studio photos pending",
    ),
    eyebrow: bilingual("Поглед кон студиото", "Studio glimpse"),
    title: bilingual(
      "Мирен простор за внимателна работа.",
      "A calm place for careful work.",
    ),
    description: bilingual(
      "Овие концептуални кадри само ја прикажуваат посакуваната атмосфера и видот на моменти што би се споделувале тука. Вистински фотографии од студиото ќе ги заменат откако сопственикот ќе ги одобри кадрите и дозволите.",
      "These concept frames preview the atmosphere and kinds of moments we want to show here. Real studio photos will replace them once the owner approves the shots and permissions.",
    ),
    items: {
      interior: {
        alt: bilingual(
          "Привремена концептуална слика од топол салонски ентериер со празно столче и огледало; ова не е вистинското Glamour Studio.",
          "Concept imagery placeholder of a warm salon interior with an empty styling chair and mirror; not the real Glamour Studio.",
        ),
        caption: bilingual(
          "Концептуална широка слика од ентериер; се чека вистинска фотографија од студиото.",
          "Concept wide interior image; real studio photo pending.",
        ),
      },
      craft: {
        alt: bilingual(
          "Привремена концептуална слика од анонимни раце со салонски алатки и коса; не прикажува вистинска услуга или клиент на Glamour Studio.",
          "Concept imagery placeholder showing anonymous hands working with salon tools and hair; not a real Glamour Studio service or client.",
        ),
        caption: bilingual(
          "Привремена концептуална слика од работен процес.",
          "Provisional service-process concept image.",
        ),
      },
      work: {
        alt: bilingual(
          "Привремена концептуална слика од анонимни луѓе што работат во салон; не прикажува вработени или клиенти на Glamour Studio.",
          "Concept imagery placeholder showing distant anonymous people at work in a salon; not Glamour Studio staff or clients.",
        ),
        caption: bilingual(
          "Привремена концептуална слика од работа во салон.",
          "Provisional salon-work concept image.",
        ),
      },
    },
  },
  services: {
    title: bilingual("Внимание во секој детаљ.", "Care in every detail."),
    rows: [
      {
        label: "01",
        name: bilingual("Шишање", "Haircuts"),
        note: bilingual(
          "Привремена категорија. Точниот назив, времетраењето, цената и достапниот персонал чекаат потврда.",
          "Draft service category. Final names, duration, pricing, and staff details are pending.",
        ),
      },
      {
        label: "02",
        name: bilingual("Фризура", "Hairstyling"),
        note: bilingual(
          "Привремена категорија. Поводите, времетраењето и подготовката чекаат потврда.",
          "Draft service category. Occasion scope, timing, and preparation details are pending.",
        ),
      },
      {
        label: "03",
        name: bilingual("Шминка", "Makeup"),
        note: bilingual(
          "Привремена категорија. Опфатот, производите, шминкерот и цената чекаат потврда.",
          "Draft service category. Final scope, products, artist details, and pricing are pending.",
        ),
      },
    ],
  },
  tone: {
    eyebrow: bilingual("Проверка на тонот", "Tone test"),
    title: bilingual(
      "Нежно, локално, практично — намерно недовршено.",
      "Soft, local, practical, unfinished on purpose.",
    ),
    description: bilingual(
      "Оваа насока го задржува салонскиот концепт мирен и читлив, а недовршените делови остануваат јасно означени. Подоцна може да се вметнат одобрени текстови и вистински фотографии без зависност од генерички фотографии за убавина.",
      "This direction keeps the salon presence calm and legible while making the unfinished parts explicit. It can later absorb approved copy and real studio media without depending on generic beauty imagery now.",
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
  },
  navigation: {
    label: bilingual(
      "Навигација на почетната страница",
      "Homepage navigation",
    ),
    services: bilingual("Услуги", "Services"),
    studio: bilingual("Студио", "Studio media"),
    lookbook: bilingual("Lookbook", "Lookbook"),
    callShort: bilingual("Јави се", "Call"),
    call: bilingual("Јави се на 077-643-005", "Call 077-643-005"),
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
