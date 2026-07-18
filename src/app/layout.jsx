import "./globals.css";

import Script from "next/script";

import { PageTransitionProvider } from "../components/motion/PageTransition";
import SmoothScroll from "../components/motion/SmoothScroll";

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
  title: "Glamour Studio | Salon in Radovish",
  description:
    "Glamour Studio in Radovish. Call 077-643-005, find the studio at 11 Ilija Aleksov, or contact the salon on Instagram.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Glamour Studio | Salon in Radovish",
    description:
      "Contact Glamour Studio in Radovish by phone or Instagram, or find the salon at 11 Ilija Aleksov.",
    type: "website",
    locale: "mk_MK",
    images: [
      {
        url: "/media/salon-hero-placeholder.png",
        width: 1792,
        height: 1024,
        alt: "Temporary warm salon-style hero placeholder with hair movement.",
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
        <PageTransitionProvider>
          <SmoothScroll />
          {children}
        </PageTransitionProvider>
      </body>
    </html>
  );
}
