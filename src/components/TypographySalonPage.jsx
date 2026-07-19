"use client";

import Image from "next/image";

import { homepageCopy } from "../lib/homepage-copy";
import { homepageMedia } from "../lib/homepage-media";
import { useLanguage } from "./LanguageProvider";
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

const [anchorMedia, ...supportingMedia] = homepageMedia;

export default function TypographySalonPage({ variant = "home" }) {
  const { language, setLanguage } = useLanguage();
  const copy = homepageCopy[language];

  return (
    <MakeupStrokeProvider>
      <main
        className="relative isolate min-h-dvh overflow-x-clip bg-surface pb-[154px] sm:pb-[104px]"
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
            className="h-full w-full scale-105 object-cover"
            height={anchorMedia.height}
            priority
            sizes="100vw"
            src={anchorMedia.src}
            style={{
              objectPosition:
                anchorMedia.heroObjectPosition ?? anchorMedia.objectPosition,
            }}
            width={anchorMedia.width}
          />
          <div
            className="absolute inset-0 bg-surface/52 backdrop-blur-[6px]"
            data-hero-curtain-veil
          />
        </div>
        <div
          className="relative z-10 grid content-start gap-9 md:min-h-[calc(100svh-12rem)] md:content-between md:gap-12"
          data-hero-curtain-foreground
        >
          <Reveal
            as="p"
            className={kicker}
            revealId="hero-eyebrow"
            side="start"
            y={0.42}
          >
            {copy.hero.eyebrow[variant]}
          </Reveal>
          <TypewriterTitle
            id="type-title"
            className="mt-4 text-[clamp(3.7rem,18vw,17.5rem)] leading-[0.82] text-accent-deep md:mt-8 md:leading-[0.74]"
            words={copy.hero.titleWords}
          />
          <div className="grid gap-7 border-t border-line pt-7 md:ml-auto md:w-full md:max-w-[1120px] md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-[clamp(28px,7vw,110px)]">
            <Reveal
              as="p"
              className={`${bodyCopy} max-w-[34rem]`}
              revealId="hero-intro"
              side="start"
            >
              {copy.hero.intro}
            </Reveal>
            <Reveal
              as="p"
              className={`${bodyCopy} ml-auto w-[78%] max-w-[26rem] border-t-2 border-blush pt-4 md:ml-0 md:w-auto md:max-w-none md:border-t-0 md:pt-0`}
              revealId="hero-pending"
              role="stroke"
              side="end"
            >
              {copy.hero.pending}
            </Reveal>
          </div>
          <p className="mt-2 ml-auto max-w-[58rem] text-[0.86rem] leading-[1.45] text-accent md:w-[72%]">
            <span className="font-extrabold">{copy.media.label}</span>{" "}
            {copy.hero.mediaContext}
          </p>
        </div>
      </section>

      <section
        className="relative z-[2] bg-surface-warm px-pad pt-[70px] pb-[84px] md:py-24"
        data-hero-curtain-services
        aria-labelledby="type-services"
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
        <div className="grid gap-5 md:grid-cols-[minmax(160px,0.32fr)_minmax(0,0.68fr)] md:items-start md:gap-[clamp(24px,6vw,88px)]">
          <Reveal
            as="p"
            className={kicker}
            revealId="services-eyebrow"
            side="start"
          >
            {copy.services.eyebrow}
          </Reveal>
          <Reveal
            as="h2"
            id="type-services"
            className={sectionH2}
            revealId="services-title"
            side="end"
            y={0.2}
          >
            {copy.services.title}
          </Reveal>
        </div>

        <div className="mt-10 border-t border-line-strong md:mt-16">
          {copy.services.rows.map((service) => (
            <Reveal
              as="article"
              className="grid gap-2.5 border-b border-line py-[26px] even:justify-items-end even:text-right md:grid-cols-[78px_minmax(180px,0.42fr)_minmax(0,0.58fr)] md:items-baseline md:gap-[clamp(18px,5vw,72px)] md:py-[30px] md:even:justify-items-start md:even:text-left"
              key={service.label}
              revealId={`service-${service.label}`}
              role="stroke"
              side={service.label === "02" ? "end" : "start"}
              y={0.08}
            >
              <span className="font-display text-[1.2rem] font-bold leading-none text-accent md:text-[2.2rem]">
                {service.label}
              </span>
              <h3 className="text-[clamp(2.7rem,12.5vw,5.8rem)] leading-[0.92] md:text-[clamp(2.1rem,5vw,5.8rem)] md:leading-[0.9]">
                {service.name}
              </h3>
              <p className="m-0 max-w-[32ch] text-[1.04rem] leading-[1.62] text-muted md:max-w-none">
                {service.note}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
        </HeroCurtainReveal>

      <section
        className="border-y border-line bg-surface px-pad pt-[70px] pb-[84px] md:py-24"
        aria-labelledby="type-studio"
        aria-describedby="studio-media-note"
      >
        <div className="grid gap-8 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:gap-[clamp(32px,7vw,96px)]">
          <div className="text-right md:text-left">
            <p className={kicker}>{copy.media.eyebrow}</p>
            <Reveal
              as="h2"
              id="type-studio"
              className={`${sectionH2} mt-4 ml-auto md:ml-0`}
              revealId="studio-title"
              role="editorial"
              side="end"
              strokeSide="start"
            >
              {copy.media.title}
            </Reveal>
            <p
              id="studio-media-note"
              className="mt-7 ml-auto max-w-[29rem] text-[1.04rem] leading-[1.62] text-muted md:ml-0"
            >
              {copy.media.description}
            </p>
            <p className="mt-5 ml-auto max-w-[29rem] text-[0.92rem] leading-[1.5] font-extrabold text-accent md:ml-0">
              {copy.media.label}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1.55fr)_minmax(150px,0.45fr)]">
            <figure className="m-0">
              <Image
                alt={copy.media.items[anchorMedia.id].alt}
                className="h-auto w-full object-cover"
                height={anchorMedia.height}
                sizes="(min-width: 768px) 45vw, 100vw"
                src={anchorMedia.src}
                style={{ objectPosition: anchorMedia.objectPosition }}
                width={anchorMedia.width}
              />
              <figcaption className="sr-only">
                {copy.media.items[anchorMedia.id].caption}
              </figcaption>
            </figure>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              {supportingMedia.map((media) => (
                <figure className="m-0" key={media.id}>
                  <Image
                    alt={copy.media.items[media.id].alt}
                    className="h-auto w-full object-cover"
                    height={media.height}
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
        className="mx-auto w-full max-w-[1180px] px-pad pt-[70px] pb-[84px] md:py-24"
        aria-labelledby="type-about"
      >
        <p className={kicker}>
          {copy.tone.eyebrow}
        </p>
        <Reveal
          as="h2"
          id="type-about"
          className="mt-5 max-w-[12ch] text-balance text-[clamp(2.7rem,8vw,8.5rem)] leading-[0.94] md:max-w-[15ch] md:leading-[0.9]"
          revealId="tone-title"
          side="start"
        >
          {copy.tone.title}
        </Reveal>
        <Reveal
          as="p"
          className={`${bodyCopy} mt-7 ml-auto w-[78%] max-w-[32rem] border-t-2 border-blush pt-4 md:mt-[34px] md:w-auto md:max-w-[720px] md:border-t-0 md:pt-0`}
          revealId="tone-copy"
          role="stroke"
          side="end"
        >
          {copy.tone.description}
        </Reveal>
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
          <li className="pt-4 text-[0.92rem] leading-[1.55] text-surface/70">
            {copy.contact.disclosure}
          </li>
        </ul>
      </section>

      <aside
        className="fixed inset-x-pad bottom-3 z-30 flex items-stretch gap-1 overflow-hidden rounded-lg border border-ink/20 bg-ink/95 p-2 text-surface shadow-[0_18px_50px_rgb(52_36_31/0.18)] lg:bottom-4 lg:gap-2 lg:py-[11px] lg:pr-3 lg:pl-[18px]"
        aria-label={copy.navigation.label}
      >
        <button
          aria-label={copy.language.toggleLabel}
          className="flex min-h-11 w-9 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent px-1 py-2 text-[0.72rem] font-extrabold text-surface/70 outline-none hover:text-surface focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-ink lg:w-auto lg:text-[0.86rem]"
          onClick={() =>
            setLanguage((current) => (current === "mk" ? "en" : "mk"))
          }
          type="button"
        >
          {copy.language.toggleText}
        </button>
        <nav className="grid min-w-0 flex-1 grid-cols-4 items-stretch gap-1 text-center text-[0.68rem] leading-tight font-bold whitespace-nowrap sm:text-[0.82rem] lg:flex lg:items-center lg:justify-end lg:gap-2 lg:text-[0.92rem]">
          <a
            className="flex min-h-11 min-w-0 items-center justify-center rounded-md px-0.5 py-2 lg:px-3"
            href="#type-services"
          >
            {copy.navigation.services}
          </a>
          <a
            className="flex min-h-11 min-w-0 items-center justify-center rounded-md px-0.5 py-2 lg:px-3"
            href="#type-studio"
          >
            {copy.navigation.studio}
          </a>
          <TransitionLink
            className="flex min-h-11 min-w-0 items-center justify-center rounded-md px-0.5 py-2 lg:px-3"
            href="/lookbook"
          >
            {copy.navigation.lookbook}
          </TransitionLink>
          <a
            aria-label={copy.navigation.call}
            className="flex min-h-11 min-w-0 items-center justify-center rounded-lg bg-surface px-0.5 py-2 text-ink lg:px-3.5 lg:py-2.5"
            href="tel:077643005"
          >
            <span className="lg:hidden">{copy.navigation.callShort}</span>
            <span className="hidden lg:inline">{copy.navigation.call}</span>
          </a>
        </nav>
      </aside>
      </main>
    </MakeupStrokeProvider>
  );
}
