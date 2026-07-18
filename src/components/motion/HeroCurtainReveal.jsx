"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
      const cover = wrapper?.querySelector("[data-hero-curtain-cover]");

      if (!wrapper || !root || !hero || !veil || !foreground || !cover) {
        return undefined;
      }

      const clearOpening = () => {
        delete root.dataset.heroCurtainOpenTop;
        delete root.dataset.heroCurtainOpenBottom;
      };

      const clearMetrics = () => {
        delete wrapper.dataset.heroCurtainRevealDepth;
        delete wrapper.dataset.heroCurtainGap;
      };

      if (prefersReducedMotion) {
        clearOpening();
        clearMetrics();
        gsap.set([veil, foreground, cover], { clearProps: "all" });
        return undefined;
      }

      const state = {
        coverYPercent: 100,
        veilClip: 0,
      };
      let boundary = 0;
      let coverHeight = 0;
      let revealDepth = 0;
      let residualGap = 0;
      let scrollDistance = 0;

      const measure = () => {
        const wrapperRect = wrapper.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();

        boundary = wrapperRect.top - rootRect.top + hero.offsetHeight;
        revealDepth = Math.min(
          Math.max(window.innerHeight * 0.78, 360),
          hero.offsetHeight * 0.82,
        );
        residualGap = clamp(window.innerHeight * 0.09, 42, 72);
        coverHeight = Math.max(revealDepth - residualGap, 1);
        scrollDistance = Math.max(window.innerHeight * 1.22, 680);

        wrapper.dataset.heroCurtainRevealDepth = String(revealDepth);
        wrapper.dataset.heroCurtainGap = String(residualGap);
        root.dispatchEvent(new CustomEvent("hero-curtain:measure"));

        gsap.set(cover, {
          autoAlpha: 1,
          height: coverHeight,
        });
      };

      const render = () => {
        const openTop = boundary - state.veilClip;
        const coverTop =
          boundary -
          coverHeight +
          coverHeight * (state.coverYPercent / 100);
        const openBottom = Math.min(boundary, coverTop);

        gsap.set([veil, foreground], {
          clipPath: `inset(0 0 ${Math.max(0, state.veilClip)}px 0)`,
        });
        gsap.set(cover, { yPercent: state.coverYPercent });

        if (openBottom > openTop + 1) {
          root.dataset.heroCurtainOpenTop = String(openTop);
          root.dataset.heroCurtainOpenBottom = String(openBottom);
        } else {
          clearOpening();
        }
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
          duration: 0.33,
        })
        .to(state, {
          coverYPercent: 0,
          duration: 0.45,
        });

      return () => {
        clearOpening();
        clearMetrics();
        timeline.scrollTrigger?.kill();
        timeline.kill();
        gsap.set([veil, foreground, cover], { clearProps: "all" });
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
