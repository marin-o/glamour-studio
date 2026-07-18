"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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
    syncWithMotionPreference();

    return () => {
      mediaQuery.removeEventListener("change", syncWithMotionPreference);
      stop();
    };
  }, [pathname]);

  return null;
}
