import { homepageCopy } from "./homepage-copy";
import { homepageHeroMedia } from "./homepage-media";

export const SITE_ORIGIN = "https://glamourstudio.mk";

export const siteUrl = (path = "/") => new URL(path, SITE_ORIGIN).toString();

const socialImage = Object.freeze({
  url: siteUrl(homepageHeroMedia.src),
  width: homepageHeroMedia.width,
  height: homepageHeroMedia.height,
  alt: homepageCopy.mk.metadata.imageAlt,
});

export const homepageSeo = Object.freeze({
  title: "Glamour Studio | Фризерски и мејкап салон во Радовиш",
  description: homepageCopy.mk.metadata.description,
  path: "/",
});

export const bookingSeo = Object.freeze({
  title: "Закажување | Glamour Studio",
  description:
    "Закажете термин во Glamour Studio во Радовиш. Изберете услуга, датум и слободен термин онлајн.",
  path: "/booking",
});

export const createSeoMetadata = ({ title, description, path }) => ({
  title,
  description,
  alternates: {
    canonical: siteUrl(path),
  },
  openGraph: {
    title,
    description,
    url: siteUrl(path),
    siteName: "Glamour Studio",
    type: "website",
    locale: "mk_MK",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage.url],
  },
});

export const beautySalonJsonLd = Object.freeze({
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "@id": `${SITE_ORIGIN}/#beauty-salon`,
  name: "Glamour Studio",
  url: SITE_ORIGIN,
  description: homepageCopy.mk.metadata.description,
  telephone: "077-643-005",
  image: siteUrl(homepageHeroMedia.src),
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Илија Алексов 6",
    addressLocality: "Радовиш",
    addressCountry: "MK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 41.637664965288806,
    longitude: 22.465876285984912,
  },
  priceRange: "400-4500 MKD",
  // Seasonal hours (Sep-Mar 10:00-18:00, Apr-Aug 06:00-18:00) have no clean
  // recurring-annual schema.org representation, so this must be hand-flipped
  // twice a year alongside the Google Business Profile hours.
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "10:00",
    closes: "18:00",
  },
  sameAs: ["https://www.instagram.com/glamourrstudiio/"],
});

export const serializeJsonLd = (value) =>
  JSON.stringify(value).replace(/[<>&]/g, (character) => {
    const escaped = {
      "<": "\\u003c",
      ">": "\\u003e",
      "&": "\\u0026",
    };
    return escaped[character];
  });
