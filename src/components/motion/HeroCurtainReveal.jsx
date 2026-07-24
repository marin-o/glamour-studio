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
      const veilClip = wrapper?.querySelector(
        "[data-hero-curtain-veil-clip]",
      );
      const foreground = wrapper?.querySelector(
        "[data-hero-curtain-foreground]",
      );

      if (!wrapper || !root || !hero || !veilClip || !foreground) {
        return undefined;
      }

      const clearMetrics = () => {
        delete wrapper.dataset.heroCurtainRevealDepth;
        delete wrapper.dataset.heroCurtainGap;
      };

      if (prefersReducedMotion) {
        clearMetrics();
        gsap.set([veilClip, foreground], { clearProps: "clipPath" });
        return undefined;
      }

      let foregroundBottomOffset = 0;
      let revealDepth = 0;
      let scrollDistance = 0;

      const clipPathFor = (bottom) =>
        `inset(0 0 ${Math.max(0, bottom)}px 0)`;

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

      measure();
      gsap.set([veilClip, foreground], { clipPath: clipPathFor(0) });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          end: () => `+=${scrollDistance}`,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
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
        .to(veilClip, {
          duration: 0.22,
          clipPath: () => clipPathFor(revealDepth),
        })
        .to(
          foreground,
          {
            duration: 0.22,
            clipPath: () =>
              clipPathFor(Math.max(0, revealDepth - foregroundBottomOffset)),
          },
          0,
        )
        // Keep the revealed boundary open for the remainder of the native
        // scroll interval without an onUpdate callback or a per-frame set.
        .to({}, {
          duration: 0.78,
        });

      return () => {
        clearMetrics();
        timeline.scrollTrigger?.kill();
        timeline.kill();
        gsap.set([veilClip, foreground], { clearProps: "clipPath" });
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
