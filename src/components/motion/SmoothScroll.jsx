"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

// Owner-requested Lenis smooth scrolling, driven by the GSAP ticker so
// ScrollTrigger and the makeup stroke stay in sync with the smoothed scroll
// position. Skipped entirely under prefers-reduced-motion, where native
// scrolling remains untouched.
export default function SmoothScroll() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return undefined;
    }

    const lenis = new Lenis({ anchors: true, autoRaf: false });
    const update = () => ScrollTrigger.update();
    const raf = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
