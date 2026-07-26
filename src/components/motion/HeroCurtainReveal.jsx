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

      let veilRect;
      let foregroundRect;
      let heroPageTop = 0;
      let heroPageBottom = 0;
      let revealDepth = 0;
      let scrollDistance = 0;
      let restingBoundary = 0;
      let revealedBoundary = 0;

      const clipPathFor = (bottomInset) =>
        `inset(0 0 ${bottomInset}px 0)`;

      const clipPathForBoundary = (boundary) => ({
        veil: clipPathFor(veilRect.bottom - boundary),
        foreground: clipPathFor(foregroundRect.bottom - boundary),
      });

      const measure = () => {
        const heroRect = hero.getBoundingClientRect();
        veilRect = veilClip.getBoundingClientRect();
        foregroundRect = foreground.getBoundingClientRect();
        heroPageTop = heroRect.top + window.scrollY;
        heroPageBottom = heroRect.bottom + window.scrollY;
        revealDepth = Math.min(
          Math.max(window.innerHeight * 0.78, 360),
          veilRect.height * 0.82,
        );
        restingBoundary = veilRect.bottom;
        revealedBoundary = restingBoundary - revealDepth;
        scrollDistance = Math.max(window.innerHeight * 1.22, 680);

        wrapper.dataset.heroCurtainRevealDepth = String(revealDepth);
        root.dispatchEvent(new CustomEvent("hero-curtain:measure"));
      };

      measure();

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
          start: () =>
            Math.max(
              heroPageTop,
              heroPageBottom - window.innerHeight * 1.18,
            ),
          trigger: hero,
        },
      });

      timeline
        .fromTo(
          veilClip,
          {
            clipPath: () => clipPathForBoundary(restingBoundary).veil,
          },
          {
            duration: 0.22,
            clipPath: () => clipPathForBoundary(revealedBoundary).veil,
          },
        )
        .fromTo(
          foreground,
          {
            clipPath: () => clipPathForBoundary(restingBoundary).foreground,
          },
          {
            duration: 0.22,
            clipPath: () =>
              clipPathForBoundary(revealedBoundary).foreground,
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
