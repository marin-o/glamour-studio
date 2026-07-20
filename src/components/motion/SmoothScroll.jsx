"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { LANGUAGE_LAYOUT_SETTLED_EVENT } from "../LanguageProvider";
import { HOMEPAGE_SCROLL_RESTORE_EVENT } from "./PageTransition";

gsap.registerPlugin(ScrollTrigger);

// Owner-requested Lenis smooth scrolling, driven by the GSAP ticker so
// ScrollTrigger and the makeup stroke stay in sync with the smoothed scroll
// position. Skipped entirely under prefers-reduced-motion, where native
// scrolling remains untouched.
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/lookbook") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis = null;
    let raf = null;

    const update = () => ScrollTrigger.update();
    const syncLanguageLayout = (event) => {
      lenis?.resize();

      if (event.detail?.anchorToBottom) {
        const documentHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body?.scrollHeight ?? 0,
        );
        const nextBottom = Math.max(documentHeight - window.innerHeight, 0);

        if (lenis) {
          lenis.scrollTo(nextBottom, { force: true, immediate: true });
        } else {
          window.scrollTo(window.scrollX, nextBottom);
        }
      }

      ScrollTrigger.refresh();
    };
    const restoreHomepageScroll = (event) => {
      const top = Number(event.detail?.top);

      if (!Number.isFinite(top)) {
        return;
      }

      lenis?.resize();

      if (lenis) {
        lenis.scrollTo(top, { force: true, immediate: true });
      } else {
        window.scrollTo(window.scrollX, top);
      }

      ScrollTrigger.refresh();
    };

    const stop = () => {
      if (!lenis) {
        return;
      }

      lenis.off("scroll", update);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenis = null;
      raf = null;

      // `lagSmoothing(0)` changes the shared GSAP ticker. Restore GSAP's
      // defaults whenever this integration is inactive.
      gsap.ticker.lagSmoothing(500, 33);
    };

    const start = () => {
      if (lenis || mediaQuery.matches) {
        return;
      }

      lenis = new Lenis({ anchors: true, autoRaf: false });
      raf = (time) => lenis?.raf(time * 1000);

      lenis.on("scroll", update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    };

    const syncWithMotionPreference = () => {
      if (mediaQuery.matches) {
        stop();
      } else {
        start();
      }
    };

    mediaQuery.addEventListener("change", syncWithMotionPreference);
    window.addEventListener(
      LANGUAGE_LAYOUT_SETTLED_EVENT,
      syncLanguageLayout,
    );
    window.addEventListener(
      HOMEPAGE_SCROLL_RESTORE_EVENT,
      restoreHomepageScroll,
    );
    syncWithMotionPreference();

    return () => {
      mediaQuery.removeEventListener("change", syncWithMotionPreference);
      window.removeEventListener(
        LANGUAGE_LAYOUT_SETTLED_EVENT,
        syncLanguageLayout,
      );
      window.removeEventListener(
        HOMEPAGE_SCROLL_RESTORE_EVENT,
        restoreHomepageScroll,
      );
      stop();
    };
  }, [pathname]);

  return null;
}
