import "./globals.css";

import Script from "next/script";

import { LanguageProvider } from "../components/LanguageProvider";
import { PageTransitionProvider } from "../components/motion/PageTransition";
import SmoothScroll from "../components/motion/SmoothScroll";
import { homepageCopy } from "../lib/homepage-copy";

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
        url: "/media/placeholders/salon-interior-concept.png",
        width: 1536,
        height: 1024,
        alt: homepageCopy.mk.metadata.imageAlt,
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mk">
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
