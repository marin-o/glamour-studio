"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";

import { homepageCopy } from "../lib/homepage-copy";
import {
  homepageHeroMedia,
  homepageStudioMedia,
} from "../lib/homepage-media";
import homepageImageLoader from "../lib/homepage-image-loader";
import { useLanguage } from "./LanguageProvider";
import SiteNavigation from "./SiteNavigation";
import MakeupStroke, {
  MakeupStrokeProvider,
} from "./motion/MakeupStroke";
import HeroCurtainReveal from "./motion/HeroCurtainReveal";
import { TransitionLink } from "./motion/PageTransition";
import Reveal from "./motion/Reveal";
import TypewriterTitle from "./motion/TypewriterTitle";

const contactStrokeAnchors = [
  {
    className: "top-[27%] left-pad",
    id: "contact-title",
    side: "outer-start",
  },
  {
    className: "top-[35%] right-pad",
    id: "contact-1",
    side: "outer-end",
  },
  {
    className: "top-[55%] right-pad",
    id: "contact-2",
    side: "outer-end",
  },
  {
    className: "top-[74%] right-pad",
    id: "contact-3",
    side: "outer-end",
  },
];

const kicker = "m-0 text-[0.88rem] leading-[1.35] font-extrabold text-accent";
const bodyCopy =
  "m-0 text-[clamp(1.08rem,1.45vw,1.32rem)] leading-[1.72] text-muted";
const sectionH2 =
  "max-w-[12ch] text-balance text-[clamp(2.7rem,8vw,8.5rem)] leading-[0.94] md:max-w-[13ch] md:leading-[0.9]";
const listReset = "m-0 grid list-none p-0";
const offsetList =
  "ml-auto w-[80%] max-w-[34rem] md:ml-0 md:w-auto md:max-w-none";
const NAVIGATION_CUBBY_SCALE = 4 / 3;

const heroMedia = homepageHeroMedia;
const [anchorMedia, ...supportingMedia] = homepageStudioMedia;

export default function TypographySalonPage() {
  const { language } = useLanguage();
  const copy = homepageCopy[language];
  const mainRef = useRef(null);
  const navigationRef = useRef(null);

  useLayoutEffect(() => {
    const main = mainRef.current;
    const navigation = navigationRef.current;

    if (!main || !navigation) {
      return undefined;
    }

    const syncCubbyHeight = () => {
      const navigationHeight = navigation.getBoundingClientRect().height;
      const cubbyHeight = Math.ceil(
        navigationHeight * NAVIGATION_CUBBY_SCALE,
      );
      const cubbyInset = (cubbyHeight - navigationHeight) / 2;

      main.style.setProperty(
        "--navigation-cubby-height",
        `${cubbyHeight}px`,
      );
      main.style.setProperty(
        "--navigation-cubby-inset",
        `${cubbyInset}px`,
      );
    };
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(syncCubbyHeight);

    resizeObserver?.observe(navigation);
    window.addEventListener("resize", syncCubbyHeight);
    syncCubbyHeight();

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncCubbyHeight);
    };
  }, []);

  return (
    <MakeupStrokeProvider>
      <main
        ref={mainRef}
        className="relative isolate min-h-dvh overflow-x-clip bg-surface pb-[var(--navigation-cubby-height)] [--navigation-cubby-height:124px] [--navigation-cubby-inset:12px] sm:[--navigation-cubby-height:104px] lg:[--navigation-cubby-inset:16px]"
        data-makeup-root
      >
        <MakeupStroke />
        <HeroCurtainReveal>
      <section
        className="relative z-[2] grid content-start gap-9 overflow-hidden border-b border-line-strong px-pad pt-[70px] pb-[84px] md:min-h-svh md:content-between md:gap-12 md:py-24"
        data-hero-curtain-hero
        aria-labelledby="type-title"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <Image
            alt=""
            className="h-full w-full object-cover"
            height={heroMedia.height}
            loader={homepageImageLoader}
            priority
            quality={95}
            sizes="100vw"
            src={heroMedia.src}
            style={{
              objectPosition:
                heroMedia.heroObjectPosition ?? heroMedia.objectPosition,
            }}
            width={heroMedia.width}
          />
          <div
            className="absolute inset-0 overflow-hidden will-change-[clip-path]"
            data-hero-curtain-veil-clip
          >
            <div
              className="absolute inset-0 bg-surface/72 backdrop-blur-[6px]"
              data-hero-curtain-veil
            />
          </div>
        </div>
        <div
          className="relative z-10 grid content-start gap-9 md:min-h-[calc(100svh-12rem)] md:content-between md:gap-12"
          data-hero-curtain-foreground
        >
          <TypewriterTitle
            id="type-title"
            className="mt-4 text-[clamp(3.515rem,17.1vw,16.625rem)] leading-[0.82] text-accent-deep md:mt-8 md:leading-[0.74]"
            words={copy.hero.titleWords}
          />
          <Reveal
            as="p"
            className="m-0 ml-auto w-[84%] max-w-[50rem] whitespace-pre-line border-t-2 border-blush pt-4 text-[clamp(1.3rem,1.75vw,1.7rem)] leading-[1.54] text-muted md:w-full md:border-t-0 md:pt-0"
            revealId="hero-intro"
            side="end"
          >
            {copy.hero.intro}
          </Reveal>
        </div>
      </section>

      <section
        id="type-services"
        className="relative z-[2] bg-surface-warm px-pad pt-[70px] pb-[84px] md:py-24"
        data-hero-curtain-services
        aria-labelledby="type-services-title"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 h-px w-px opacity-0"
          data-reveal-id="services-stroke-start"
          data-stroke-anchor="true"
          data-stroke-boundary="true"
          data-stroke-side="center"
          data-stroke-y="0.5"
        />
        <Reveal
          as="h2"
          id="type-services-title"
          className={`${sectionH2} mx-auto text-center`}
          revealId="services-title"
          side="end"
          y={0.2}
        >
          {copy.services.title}
        </Reveal>

        <ul className="m-0 mt-10 list-none border-t border-line-strong p-0 md:mt-16">
          {copy.services.groups.map((group, index) => (
            <Reveal
              as="li"
              className="grid gap-2.5 border-b border-line py-[26px] even:justify-items-end even:text-right md:grid-cols-[78px_minmax(0,1fr)] md:items-baseline md:gap-[clamp(18px,5vw,72px)] md:py-[30px] md:even:justify-items-start md:even:text-left"
              key={group.id}
              revealId={`service-${group.id}`}
              role="stroke"
              side={index % 2 ? "end" : "start"}
              y={0.08}
            >
              <span className="font-display text-[1.2rem] font-bold leading-none text-accent md:text-[2.2rem]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-[clamp(2.7rem,12.5vw,5.8rem)] leading-[0.92] md:text-[clamp(2.1rem,5vw,5.8rem)] md:leading-[0.9]">
                  {group.label}
                </h3>
                <p className="mt-4 max-w-[34rem] text-[1.02rem] leading-[1.55] text-muted md:mt-5 md:text-[1.08rem]">
                  {group.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-right text-[1.04rem] leading-[1.55] text-muted md:mt-10">
          <TransitionLink className="font-extrabold text-accent-deep underline decoration-blush decoration-2 underline-offset-4" href="/booking">
            {copy.services.cta}
          </TransitionLink>
        </p>
      </section>
        </HeroCurtainReveal>

      <section
        id="type-studio"
        className="border-y border-line bg-surface px-pad pt-[70px] pb-[84px] md:py-24"
        aria-labelledby="type-studio-title"
      >
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:gap-[clamp(32px,7vw,96px)]">
          <div className="text-right md:text-left">
            <p className={kicker}>{copy.studioIntro.eyebrow}</p>
            <Reveal
              as="h2"
              id="type-studio-title"
              className="mt-4 ml-auto max-w-none break-normal text-balance text-[clamp(2.25rem,4.2vw,4.6rem)] leading-[0.96] md:ml-0 md:leading-[0.92]"
              revealId="studio-title"
              role="editorial"
              side="end"
              strokeSide="end"
            >
              {copy.studioIntro.title}
            </Reveal>
            <Reveal
              as="p"
              className={`${bodyCopy} mt-5 ml-auto max-w-[34rem] md:ml-0`}
              revealId="studio-intro-copy"
              side="end"
            >
              {copy.studioIntro.description}
            </Reveal>
          </div>

          <div className="grid gap-3 md:aspect-[1.74/1] md:grid-cols-[minmax(0,1.55fr)_minmax(150px,0.45fr)] md:items-stretch">
            <figure className="m-0 md:min-h-0 md:overflow-hidden">
              <Image
                alt={copy.media.items[anchorMedia.id].alt}
                className="h-auto w-full object-cover md:h-full"
                height={anchorMedia.height}
                fetchPriority="low"
                loading="eager"
                loader={homepageImageLoader}
                quality={82}
                sizes="(min-width: 768px) 45vw, 100vw"
                src={anchorMedia.src}
                style={{ objectPosition: anchorMedia.objectPosition }}
                width={anchorMedia.width}
              />
              <figcaption className="sr-only">
                {copy.media.items[anchorMedia.id].caption}
              </figcaption>
            </figure>

            <div className="grid grid-cols-2 gap-3 md:h-full md:min-h-0 md:grid-cols-1 md:grid-rows-2">
              {supportingMedia.map((media) => (
                <figure className="m-0 md:min-h-0 md:overflow-hidden" key={media.id}>
                  <Image
                    alt={copy.media.items[media.id].alt}
                    className="h-auto w-full object-cover md:h-full"
                    height={media.height}
                    fetchPriority="low"
                    loading="eager"
                    loader={homepageImageLoader}
                    quality={82}
                    sizes="(min-width: 768px) 15vw, 50vw"
                    src={media.src}
                    style={{ objectPosition: media.objectPosition }}
                    width={media.width}
                  />
                  <figcaption className="sr-only">
                    {copy.media.items[media.id].caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative grid gap-8 bg-accent-deep px-pad pt-[70px] pb-[164px] md:grid-cols-[minmax(0,0.52fr)_minmax(280px,0.48fr)] md:gap-[clamp(32px,7vw,96px)] md:py-24"
        data-stroke-dark-band
        aria-labelledby="type-contact"
      >
        {contactStrokeAnchors.map((anchor) => (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute h-1 w-1 opacity-0 ${anchor.className}`}
            data-reveal-id={anchor.id}
            data-stroke-anchor="true"
            data-stroke-side={anchor.side}
            data-stroke-y="0.5"
            key={anchor.id}
          />
        ))}
        <div>
          <Reveal
            as="p"
            className="m-0 text-[0.88rem] leading-[1.35] font-extrabold text-surface"
            revealId="contact-eyebrow"
            side="outer-start"
          >
            {copy.contact.eyebrow}
          </Reveal>
          <Reveal
            as="h2"
            id="type-contact"
            className={`${sectionH2} mt-4 text-surface`}
            anchor={false}
            revealId="contact-title"
          >
            {copy.contact.title}
          </Reveal>
        </div>
        <ul className={`${listReset} ${offsetList}`}>
          {copy.contact.items.map((item, index) => (
            <Reveal
              anchor={false}
              as="li"
              className="border-t border-t-surface/25 py-[18px] text-[1.08rem] leading-[1.55] text-surface first:border-t-surface/50"
              key={item.href}
              revealId={`contact-${index + 1}`}
            >
              <a
                className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5"
                href={item.href}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                target={item.href.startsWith("http") ? "_blank" : undefined}
              >
                <span className="font-extrabold">{item.label}</span>
                <span className="text-surface/75">{item.value}</span>
              </a>
            </Reveal>
          ))}
          <li className="border-t border-t-surface/25 py-[18px] text-[1.08rem] leading-[1.55] text-surface"><TransitionLink className="font-extrabold underline" href="/booking">{copy.contact.booking}</TransitionLink></li>
        </ul>
        <p className="col-span-full mt-2 text-right font-sans text-[0.82rem] leading-[1.4] text-surface/65 md:col-start-2 md:col-span-1 md:mt-0">
          Website by{" "}
          <a
            className="underline decoration-surface/35 underline-offset-4 hover:text-surface"
            href="https://bosa.mk"
            rel="noopener noreferrer"
            target="_blank"
          >
            Marino
          </a>
        </p>
      </section>

      <SiteNavigation ref={navigationRef} current="home" position="bottom" />
      </main>
    </MakeupStrokeProvider>
  );
}
