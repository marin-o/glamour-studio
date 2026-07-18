import Image from "next/image";
import Link from "next/link";

import {
  homepageMedia,
  homepageMediaLabel,
} from "../lib/homepage-media";
import MakeupStroke, {
  MakeupStrokeProvider,
} from "./motion/MakeupStroke";
import HeroCurtainReveal from "./motion/HeroCurtainReveal";
import { TransitionLink } from "./motion/PageTransition";
import Reveal from "./motion/Reveal";
import TypewriterTitle from "./motion/TypewriterTitle";

const serviceRows = [
  {
    label: "01",
    name: "Haircuts",
    note: "Draft service category. Final names, duration, pricing, and staff details are pending.",
  },
  {
    label: "02",
    name: "Hairstyling",
    note: "Draft service category. Occasion scope, timing, and preparation details are pending.",
  },
  {
    label: "03",
    name: "Makeup",
    note: "Draft service category. Final scope, products, artist details, and pricing are pending.",
  },
];

const contactItems = [
  { href: "tel:077643005", label: "Call", value: "077-643-005" },
  {
    href: "https://www.google.com/maps/search/?api=1&query=11+Ilija+Aleksov+Radovish",
    label: "Find us",
    value: "11 Ilija Aleksov, Radovish",
  },
  {
    href: "https://www.instagram.com/glamourrstudiio/",
    label: "Instagram",
    value: "@glamourrstudiio",
  },
];

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

export default function TypographySalonPage({
  eyebrow = "Typography-led homepage",
  homeHref = "/old",
  homeLabel = "Old draft",
}) {
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
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-surface-warm opacity-0 will-change-transform"
          data-hero-curtain-cover
        />
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
            {eyebrow}
          </Reveal>
          <TypewriterTitle
            id="type-title"
            className="mt-4 text-[clamp(3.7rem,18vw,17.5rem)] leading-[0.82] text-accent-deep md:mt-8 md:leading-[0.74]"
          />
          <div className="grid gap-7 border-t border-line pt-7 md:ml-auto md:w-full md:max-w-[1120px] md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-[clamp(28px,7vw,110px)]">
            <Reveal
              as="p"
              className={`${bodyCopy} max-w-[34rem]`}
              revealId="hero-intro"
              side="start"
            >
              A quieter salon direction where the first impression comes from
              type, spacing, and warm editorial rhythm instead of placeholder
              imagery or decorative card systems.
            </Reveal>
            <Reveal
              as="p"
              className={`${bodyCopy} ml-auto w-[78%] max-w-[26rem] border-t-2 border-blush pt-4 md:ml-0 md:w-auto md:max-w-none md:border-t-0 md:pt-0`}
              revealId="hero-pending"
              role="stroke"
              side="end"
            >
              This is still a draft for Radovish. Real media, final Macedonian
              copy, prices, hours, service details, and booking behavior remain
              owner decisions.
            </Reveal>
          </div>
          <p className="mt-2 ml-auto max-w-[58rem] text-[0.86rem] leading-[1.45] text-accent md:w-[72%]">
            <span className="font-extrabold">{homepageMediaLabel}</span>{" "}
            Interior concept used as a softly blurred opening background.
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
            Service index
          </Reveal>
          <Reveal
            as="h2"
            id="type-services"
            className={sectionH2}
            revealId="services-title"
            side="end"
            y={0.2}
          >
            Draft categories, set like an editorial list.
          </Reveal>
        </div>

        <div className="mt-10 border-t border-line-strong md:mt-16">
          {serviceRows.map((service) => (
            <Reveal
              as="article"
              className="grid gap-2.5 border-b border-line py-[26px] even:justify-items-end even:text-right md:grid-cols-[78px_minmax(180px,0.42fr)_minmax(0,0.58fr)] md:items-baseline md:gap-[clamp(18px,5vw,72px)] md:py-[30px] md:even:justify-items-start md:even:text-left"
              key={service.name}
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
            <p className={kicker}>Studio glimpse</p>
            <Reveal
              as="h2"
              id="type-studio"
              className={`${sectionH2} mt-4 ml-auto md:ml-0`}
              revealId="studio-title"
              role="editorial"
              side="end"
              strokeSide="start"
            >
              A calm place for careful work.
            </Reveal>
            <p
              id="studio-media-note"
              className="mt-7 ml-auto max-w-[29rem] text-[1.04rem] leading-[1.62] text-muted md:ml-0"
            >
              These concept frames preview the atmosphere and kinds of moments
              we want to show here. Real studio photos will replace them once
              the owner approves the shots and permissions.
            </p>
            <p className="mt-5 ml-auto max-w-[29rem] text-[0.92rem] leading-[1.5] font-extrabold text-accent md:ml-0">
              {homepageMediaLabel}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1.55fr)_minmax(150px,0.45fr)]">
            <figure className="m-0">
              <Image
                alt={anchorMedia.alt}
                className="h-auto w-full object-cover"
                height={anchorMedia.height}
                sizes="(min-width: 768px) 45vw, 100vw"
                src={anchorMedia.src}
                style={{ objectPosition: anchorMedia.objectPosition }}
                width={anchorMedia.width}
              />
              <figcaption className="sr-only">
                {homepageMediaLabel}: wide interior concept.
              </figcaption>
            </figure>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              {supportingMedia.map((media) => (
                <figure className="m-0" key={media.id}>
                  <Image
                    alt={media.alt}
                    className="h-auto w-full object-cover"
                    height={media.height}
                    sizes="(min-width: 768px) 15vw, 50vw"
                    src={media.src}
                    style={{ objectPosition: media.objectPosition }}
                    width={media.width}
                  />
                  <figcaption className="sr-only">
                    {homepageMediaLabel}: supporting {media.id} concept.
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
          Tone test
        </p>
        <Reveal
          as="h2"
          id="type-about"
          className="mt-5 max-w-[12ch] text-balance text-[clamp(2.7rem,8vw,8.5rem)] leading-[0.94] md:max-w-[15ch] md:leading-[0.9]"
          revealId="tone-title"
          side="start"
        >
          Soft, local, practical, unfinished on purpose.
        </Reveal>
        <Reveal
          as="p"
          className={`${bodyCopy} mt-7 ml-auto w-[78%] max-w-[32rem] border-t-2 border-blush pt-4 md:mt-[34px] md:w-auto md:max-w-[720px] md:border-t-0 md:pt-0`}
          revealId="tone-copy"
          role="stroke"
          side="end"
        >
          This direction keeps the salon presence calm and legible while making
          the unfinished parts explicit. It can later absorb real Macedonian
          copy and real studio media without depending on generic beauty imagery
          now.
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
            Contact and booking
          </Reveal>
          <Reveal
            as="h2"
            id="type-contact"
            className={`${sectionH2} mt-4 text-surface`}
            anchor={false}
            revealId="contact-title"
          >
            Visit or get in touch.
          </Reveal>
        </div>
        <ul className={`${listReset} ${offsetList}`}>
          {contactItems.map((item, index) => (
            <Reveal
              anchor={false}
              as="li"
              className="border-t border-t-surface/25 py-[18px] text-[1.08rem] leading-[1.55] text-surface first:border-t-surface/50"
              key={item.label}
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
            Calling or messaging does not confirm an appointment. Opening
            hours, Viber, and WhatsApp are not confirmed yet.
          </li>
        </ul>
      </section>

      <aside
        className="fixed inset-x-pad bottom-3 z-30 flex items-center gap-3 overflow-hidden rounded-lg border border-ink/20 bg-ink/95 py-2 pr-2 pl-3 text-surface shadow-[0_18px_50px_rgb(52_36_31/0.18)] sm:bottom-4 sm:gap-5 sm:py-[11px] sm:pr-3 sm:pl-[18px]"
        aria-label="Typography-led navigation"
      >
        <Link
          className="shrink-0 font-display text-[1rem] font-bold sm:text-[1.1rem]"
          href={homeHref}
        >
          {homeLabel}
        </Link>
        <span aria-hidden="true" className="h-5 w-px shrink-0 bg-surface/25" />
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto text-[0.82rem] font-bold whitespace-nowrap sm:gap-2 sm:text-[0.92rem]">
          <a className="rounded-md px-2 py-2 sm:px-3" href="#type-services">
            Services
          </a>
          <a className="rounded-md px-2 py-2 sm:px-3" href="#type-studio">
            Studio media
          </a>
          <TransitionLink className="rounded-md px-2 py-2 sm:px-3" href="/lookbook">
            Lookbook
          </TransitionLink>
          <a
            className="rounded-lg bg-surface px-3 py-2 text-ink sm:px-3.5 sm:py-2.5"
            href="tel:077643005"
          >
            Call 077-643-005
          </a>
        </nav>
      </aside>
      </main>
    </MakeupStrokeProvider>
  );
}
