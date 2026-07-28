import "./globals.css";

import { Cormorant_Garamond, Manrope } from "next/font/google";

import { LanguageProvider } from "../components/LanguageProvider";
import { PageTransitionProvider } from "../components/motion/PageTransition";
import SmoothScroll from "../components/motion/SmoothScroll";
import { homepageCopy } from "../lib/homepage-copy";
import { homepageHeroMedia } from "../lib/homepage-media";

const homepageOgImage = homepageHeroMedia;

const displayFont = Cormorant_Garamond({
  display: "swap",
  fallback: ["Georgia", "Times New Roman"],
  style: "normal",
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  variable: "--font-cormorant-garamond",
  weight: "variable",
});

const bodyFont = Manrope({
  display: "swap",
  fallback: ["Aptos", "Segoe UI"],
  style: "normal",
  subsets: ["cyrillic", "cyrillic-ext", "latin"],
  variable: "--font-manrope",
  weight: "variable",
});

export const metadata = {
  title: homepageCopy.mk.metadata.title,
  description: homepageCopy.mk.metadata.description,
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: homepageCopy.mk.metadata.title,
    description: homepageCopy.mk.metadata.openGraphDescription,
    type: "website",
    locale: "mk_MK",
    images: [
      {
        url: homepageOgImage.src,
        width: homepageOgImage.width,
        height: homepageOgImage.height,
        alt: homepageCopy.mk.metadata.imageAlt,
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      className={`${displayFont.variable} ${bodyFont.variable}`}
      lang="mk"
    >
      <body>
        <LanguageProvider>
          <PageTransitionProvider>
            <SmoothScroll />
            {children}
          </PageTransitionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
