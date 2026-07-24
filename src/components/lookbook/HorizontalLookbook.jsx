"use client";

import Image from "next/image";
import Lenis from "lenis";
import LenisSnap from "lenis/snap";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { lookbookMediaDimensions } from "../../generated/lookbook-media-manifest";
import { lookbookCopy } from "../../lib/lookbook-copy";
import { useLanguage } from "../LanguageProvider";
import SiteNavigation from "../SiteNavigation";

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);
export default function HorizontalLookbook({ items }) {
  const { language } = useLanguage();
  const copy = lookbookCopy[language];
  const scrollerRef = useRef(null);
  const trackRef = useRef(null);
  const activeIndexRef = useRef(0);
  const lenisRef = useRef(null);
  const snapRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLenisActive, setIsLenisActive] = useState(false);
  const { scrollXProgress } = useScroll({ container: scrollerRef });
  const smoothProgress = useSpring(scrollXProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.35,
  });
  const brushProgress = useTransform(
    smoothProgress,
    [0, 1],
    [0, 1],
  );
  const brushTipPosition = useTransform(
    smoothProgress,
    (value) => `${value * 100}%`,
  );

  useMotionValueEvent(scrollXProgress, "change", (progress) => {
    const nextIndex = clamp(
      Math.round(progress * (items.length - 1)),
      0,
      items.length - 1,
    );

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  });

  const moveToImage = useCallback(
    (index) => {
      const scroller = scrollerRef.current;

      if (!scroller) {
        return;
      }

      const nextIndex = clamp(index, 0, items.length - 1);
      const availableScroll = scroller.scrollWidth - scroller.clientWidth;

      const destination =
        (availableScroll * nextIndex) / (items.length - 1);

      if (!prefersReducedMotion && snapRef.current) {
        snapRef.current.goTo(nextIndex);
        return;
      }

      scroller.scrollLeft = destination;
    },
    [items.length, prefersReducedMotion],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;

    if (!scroller || !track || prefersReducedMotion) {
      setIsLenisActive(false);
      return undefined;
    }

    const lenis = new Lenis({
      wrapper: scroller,
      content: track,
      orientation: "horizontal",
      gestureOrientation: "both",
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.085,
      wheelMultiplier: 0.9,
      overscroll: false,
    });
    const snap = new LenisSnap(lenis, {
      type: "mandatory",
      duration: 0.9,
      easing: (value) => value * value * (3 - 2 * value),
      debounce: 420,
    });

    snap.addElements(
      track.querySelectorAll("[data-lookbook-item]"),
      { align: "center" },
    );

    lenisRef.current = lenis;
    snapRef.current = snap;
    setIsLenisActive(true);

    return () => {
      snapRef.current = null;
      lenisRef.current = null;
      snap.destroy();
      lenis.destroy();
    };
  }, [items.length, prefersReducedMotion]);

  const handleKeyDown = (event) => {
    const keyActions = {
      ArrowLeft: activeIndex - 1,
      ArrowRight: activeIndex + 1,
      PageUp: activeIndex - 1,
      PageDown: activeIndex + 1,
      Home: 0,
      End: items.length - 1,
    };

    if (!(event.key in keyActions)) {
      return;
    }

    event.preventDefault();
    moveToImage(keyActions[event.key]);
  };

  return (
    <main className="relative h-svh overflow-hidden bg-surface text-ink">
      <SiteNavigation
        backHref="/"
        backLabel={copy.returnLabel}
        current="lookbook"
        position="top"
      />
      <p
        id="lookbook-media-notice"
        className="pointer-events-none fixed top-24 left-1/2 z-20 m-0 w-[min(90vw,44rem)] -translate-x-1/2 rounded-full border border-line bg-surface/92 px-4 py-2 text-center text-[0.7rem] leading-[1.35] text-muted shadow-[0_8px_24px_rgb(52_36_31/0.08)] md:top-[5.75rem] md:text-[0.76rem]"
      >
        {copy.disclosure}
      </p>

      <section
        ref={scrollerRef}
        className={`lookbook-scroller h-svh overflow-x-auto overflow-y-hidden [overscroll-behavior-x:contain] [scrollbar-width:none] ${
          isLenisActive ? "" : "snap-x snap-mandatory"
        }`}
        aria-label={copy.regionLabel}
        aria-describedby="lookbook-media-notice"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <h1 className="sr-only">
          {copy.heading}
        </h1>

        <ol
          ref={trackRef}
          className="relative m-0 flex h-full w-max list-none gap-[clamp(18px,3.2vw,48px)] px-[calc((100vw-var(--lookbook-card-width))/2)] pt-[148px] pb-[94px] [--lookbook-card-width:82vw] md:pt-[132px] md:pb-[86px] md:[--lookbook-card-width:min(62vw,690px)]"
        >
          {items.map((item, index) => {
            const isReelCover = item.kind === "reel-cover";
            const itemNumber = String(index + 1).padStart(2, "0");
            const dimensions = lookbookMediaDimensions[item.src];

            if (!dimensions) {
              throw new Error(
                `Missing lookbook media dimensions for ${item.src}. Run pnpm media:optimize.`,
              );
            }

            return (
              <li
                className={`h-full w-[var(--lookbook-card-width)] min-w-[var(--lookbook-card-width)] ${
                  isLenisActive ? "" : "snap-center"
                }`}
                key={item.id}
                data-lookbook-item
              >
                <figure className="grid h-full grid-rows-[minmax(0,1fr)_auto] gap-3">
                  <a
                    className="relative block min-h-0 overflow-hidden bg-surface-muted outline-offset-4 focus-visible:outline-3 focus-visible:outline-accent"
                    href={item.permalink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={
                      isReelCover
                        ? copy.originalReelLabel(index + 1)
                        : copy.originalPostLabel(index + 1)
                    }
                  >
                    <Image
                      className="block h-full w-full object-cover"
                      src={item.src}
                      alt={item.alt[language]}
                      width={dimensions.width}
                      height={dimensions.height}
                      priority={index === 0}
                      quality={100}
                      sizes="(max-width: 767px) 82vw, min(62vw, 690px)"
                      style={{ objectPosition: item.objectPosition }}
                    />
                    {isReelCover ? (
                      <span className="absolute top-3 right-3 bg-ink/88 px-2.5 py-1.5 text-[0.7rem] font-extrabold text-surface">
                        {copy.reelBadge}
                      </span>
                    ) : null}
                  </a>

                  <figcaption className="flex items-baseline justify-between gap-5 text-[0.8rem] leading-[1.35] text-muted">
                    <span className="font-extrabold tracking-[0.12em] text-accent uppercase">
                      {itemNumber}
                    </span>
                    <a
                      className="rounded-sm font-bold text-accent underline decoration-accent/40 underline-offset-4"
                      href={item.permalink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {isReelCover ? copy.reelSource : copy.postSource}
                    </a>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ol>
      </section>

      <aside
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 grid min-h-[76px] grid-cols-[auto_1fr] items-center gap-4 border-t border-line bg-surface/95 px-pad py-3"
        aria-label={copy.imageCount(activeIndex + 1, items.length)}
      >
        <p className="m-0 font-display text-[1rem] font-bold text-accent-deep tabular-nums">
          {String(activeIndex + 1).padStart(2, "0")}
          <span className="text-muted"> / {String(items.length).padStart(2, "0")}</span>
        </p>

        <div className="relative h-7 min-w-0" aria-hidden="true">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line-strong" />
          <motion.span
            className="absolute inset-x-0 top-[7px] h-[13px] origin-left bg-blush/78 [clip-path:polygon(0_42%,4%_18%,12%_32%,20%_8%,29%_30%,41%_13%,54%_34%,66%_9%,77%_29%,89%_12%,100%_43%,100%_68%,91%_90%,79%_70%,67%_94%,55%_72%,43%_93%,31%_69%,18%_91%,7%_68%,0_61%)]"
            style={{ scaleX: brushProgress }}
          />
          <motion.span
            className="absolute inset-x-0 top-[10px] h-[2px] origin-left bg-accent/58"
            style={{ scaleX: brushProgress }}
          />
          <motion.span
            className="absolute inset-x-0 top-[17px] h-px origin-left bg-accent-deep/34"
            style={{ scaleX: brushProgress }}
          />
          {items.map((item, index) => (
            <span
              className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface ring-1 ring-accent/55"
              key={item.id}
              style={{ left: `${(index / (items.length - 1)) * 100}%` }}
            />
          ))}
          <motion.span
            className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-accent-deep shadow-[0_0_0_4px_rgb(255_248_245/0.72)]"
            style={{ left: brushTipPosition, x: "-50%" }}
          />
        </div>
      </aside>
    </main>
  );
}
