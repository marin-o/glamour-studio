import "./globals.css";

import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";

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

const historyTransitionBridge = `
(() => {
  if (window.__glamourHistoryTransitionBridge) return;

  const bridge = {
    bypass: false,
    pending: null,
    failOpenTimer: null,
    release() {
      const pending = bridge.pending;
      if (!pending) return;

      bridge.pending = null;
      window.clearTimeout(bridge.failOpenTimer);
      bridge.failOpenTimer = null;
      bridge.bypass = true;
      window.dispatchEvent(
        new PopStateEvent("popstate", { state: pending.state }),
      );
    },
  };

  window.__glamourHistoryTransitionBridge = bridge;

  window.addEventListener(
    "popstate",
    (event) => {
      if (bridge.bypass) {
        bridge.bypass = false;
        return;
      }

      event.stopImmediatePropagation();
      bridge.pending = {
        pathname: window.location.pathname,
        state: event.state,
      };

      let accepted = false;
      window.dispatchEvent(
        new CustomEvent("glamour:history-transition", {
          detail: {
            pathname: bridge.pending.pathname,
            accept() {
              accepted = true;
            },
          },
        }),
      );

      if (!accepted) {
        bridge.release();
        return;
      }

      bridge.failOpenTimer = window.setTimeout(() => {
        bridge.release();
      }, 2400);
    },
    true,
  );
})();
`;

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
      <head>
        <Script
          id="history-transition-bridge"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: historyTransitionBridge }}
        />
      </head>
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
