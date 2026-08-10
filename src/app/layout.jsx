import "./globals.css";

import { Cormorant_Garamond, Manrope } from "next/font/google";

import { LanguageProvider } from "../components/LanguageProvider";
import { PageTransitionProvider } from "../components/motion/PageTransition";
import SmoothScroll from "../components/motion/SmoothScroll";
import {
  SITE_ORIGIN,
  createSeoMetadata,
  homepageSeo,
} from "../lib/site-seo";

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
  metadataBase: new URL(SITE_ORIGIN),
  ...createSeoMetadata(homepageSeo),
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
