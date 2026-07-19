"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function HeroCurtainReveal({ children }) {
  const wrapperRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      const root = wrapper?.closest("[data-makeup-root]");
      const hero = wrapper?.querySelector("[data-hero-curtain-hero]");
      const veil = wrapper?.querySelector("[data-hero-curtain-veil]");
      const foreground = wrapper?.querySelector(
        "[data-hero-curtain-foreground]",
      );

      if (!wrapper || !root || !hero || !veil || !foreground) {
        return undefined;
      }

      const clearMetrics = () => {
        delete wrapper.dataset.heroCurtainRevealDepth;
        delete wrapper.dataset.heroCurtainGap;
      };

      if (prefersReducedMotion) {
        clearMetrics();
        gsap.set([veil, foreground], { clearProps: "all" });
        return undefined;
      }

      const state = { veilClip: 0 };
      let foregroundBottomOffset = 0;
      let revealDepth = 0;
      let scrollDistance = 0;

      const measure = () => {
        const heroRect = hero.getBoundingClientRect();
        const foregroundRect = foreground.getBoundingClientRect();

        foregroundBottomOffset = Math.max(
          0,
          heroRect.bottom - foregroundRect.bottom,
        );
        revealDepth = Math.min(
          Math.max(window.innerHeight * 0.78, 360),
          hero.offsetHeight * 0.82,
        );
        scrollDistance = Math.max(window.innerHeight * 1.22, 680);

        wrapper.dataset.heroCurtainRevealDepth = String(revealDepth);
        root.dispatchEvent(new CustomEvent("hero-curtain:measure"));
      };

      const render = () => {
        const foregroundClip = Math.max(
          0,
          state.veilClip - foregroundBottomOffset,
        );

        gsap.set(veil, {
          clipPath: `inset(0 0 ${Math.max(0, state.veilClip)}px 0)`,
        });
        gsap.set(foreground, {
          clipPath: `inset(0 0 ${foregroundClip}px 0)`,
        });
      };

      measure();
      render();

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: render,
        scrollTrigger: {
          end: () => `+=${scrollDistance}`,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
            render();
          },
          onRefreshInit: measure,
          scrub: true,
          start: () => {
            const heroTop =
              hero.getBoundingClientRect().top + window.scrollY;

            return Math.max(
              heroTop,
              heroTop + hero.offsetHeight - window.innerHeight * 1.18,
            );
          },
          trigger: hero,
        },
      });

      timeline
        .to(state, {
          duration: 0.22,
          veilClip: () => revealDepth,
        })
        .to(state, {
          duration: 0.78,
        });

      return () => {
        clearMetrics();
        timeline.scrollTrigger?.kill();
        timeline.kill();
        gsap.set([veil, foreground], { clearProps: "all" });
      };
    },
    {
      dependencies: [prefersReducedMotion],
      revertOnUpdate: true,
      scope: wrapperRef,
    },
  );

  return (
    <div
      ref={wrapperRef}
      className="relative isolate bg-surface"
      data-hero-curtain
    >
      {children}
    </div>
  );
}
