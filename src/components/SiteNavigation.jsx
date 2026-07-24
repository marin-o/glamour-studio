"use client";

import { forwardRef } from "react";

import { homepageCopy } from "../lib/homepage-copy";
import { useLanguage } from "./LanguageProvider";
import { TransitionLink } from "./motion/PageTransition";

const navItem =
  "flex min-h-11 min-w-0 items-center justify-center rounded-full px-2.5 py-2 text-center hover:bg-surface/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface lg:px-3.5";
const activeItem =
  "flex min-h-11 min-w-0 items-center justify-center rounded-full border border-surface/25 bg-surface/12 px-2.5 py-2 text-center text-surface/75 lg:px-3.5";
const primaryItem =
  "flex min-h-11 min-w-0 items-center justify-center rounded-full bg-surface px-3 py-2 text-center text-ink shadow-[0_8px_24px_rgb(0_0_0/0.12)] hover:bg-peach focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface lg:px-4 lg:py-2.5";

const SiteNavigation = forwardRef(function SiteNavigation(
  {
    backHref,
    backLabel,
    current = "home",
    position = "bottom",
  },
  ref,
) {
  const { language, setLanguage } = useLanguage();
  const copy = homepageCopy[language];
  const address = copy.contact.items.find(({ href }) =>
    href.startsWith("https://www.google.com/maps/"),
  );
  const isTop = position === "top";

  const sectionLink = (id, label) =>
    current === "home" ? (
      <a className={navItem} href={`#${id}`}>
        {label}
      </a>
    ) : (
      <TransitionLink
        className={navItem}
        direction="backward"
        href={`/#${id}`}
      >
        {label}
      </TransitionLink>
    );

  return (
    <aside
      ref={ref}
      className={`fixed inset-x-pad z-40 flex items-stretch gap-1 overflow-hidden rounded-[1.25rem] border border-ink/20 bg-ink/95 p-2 text-surface shadow-[0_18px_50px_rgb(52_36_31/0.18)] lg:inset-x-auto lg:left-1/2 lg:w-max lg:max-w-[calc(100vw-2rem)] lg:-translate-x-1/2 lg:gap-2 lg:px-[18px] lg:py-[11px] ${
        isTop ? "top-4" : ""
      }`}
      style={isTop ? undefined : { bottom: "var(--navigation-cubby-inset, 1rem)" }}
      aria-label={copy.navigation.label}
      data-site-navigation={position}
    >
      {backHref ? (
        <TransitionLink
          aria-label={backLabel}
          className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-full border border-surface/20 bg-surface/10 text-[1.45rem] leading-none text-surface hover:bg-surface/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
          direction="backward"
          href={backHref}
        >
          <svg
            aria-hidden="true"
            className="block size-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M19 12H5m6-6-6 6 6 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </TransitionLink>
      ) : null}

      {current === "home" ? (
        <button
          aria-label={copy.language.toggleLabel}
          className="flex min-h-11 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent px-1 py-2 text-[0.72rem] font-extrabold text-surface/70 outline-none hover:bg-surface/12 hover:text-surface focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-ink lg:w-auto lg:px-2 lg:text-[0.86rem]"
          onClick={() =>
            setLanguage((selected) => (selected === "mk" ? "en" : "mk"))
          }
          type="button"
        >
          {copy.language.toggleText}
        </button>
      ) : null}

      {address ? (
        <a
          aria-label={copy.navigation.addressLabel}
          className="hidden min-h-11 max-w-[18rem] min-w-0 items-center rounded-full px-3 text-[0.86rem] leading-tight font-bold text-surface/75 hover:bg-surface/12 hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface lg:flex"
          href={address.href}
          rel="noreferrer"
          target="_blank"
        >
          <span className="truncate">{address.value}</span>
        </a>
      ) : null}

      <nav className="grid min-w-0 flex-1 grid-cols-4 items-stretch gap-1 text-[0.68rem] leading-tight font-bold whitespace-nowrap sm:text-[0.82rem] lg:flex lg:flex-none lg:items-center lg:justify-end lg:gap-2 lg:text-[0.92rem]">
        {sectionLink("type-services", copy.navigation.services)}
        {sectionLink("type-studio", copy.navigation.studio)}
        {current === "lookbook" ? (
          <span aria-current="page" className={activeItem}>
            {copy.navigation.lookbook}
          </span>
        ) : (
          <TransitionLink className={navItem} href="/lookbook">
            {copy.navigation.lookbook}
          </TransitionLink>
        )}
        {current === "booking" ? (
          <span aria-current="page" className={primaryItem}>
            <span className="lg:hidden">{copy.navigation.bookShort}</span>
            <span className="hidden lg:inline">{copy.navigation.book}</span>
          </span>
        ) : (
          <TransitionLink className={primaryItem} href="/booking">
            <span className="lg:hidden">{copy.navigation.bookShort}</span>
            <span className="hidden lg:inline">{copy.navigation.book}</span>
          </TransitionLink>
        )}
      </nav>
    </aside>
  );
});

export default SiteNavigation;
