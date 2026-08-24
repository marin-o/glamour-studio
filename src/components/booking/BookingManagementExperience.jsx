"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLanguage } from "../LanguageProvider";
import SiteNavigation from "../SiteNavigation";
import { SERVICES } from "../../lib/booking/services.mjs";
import { bookingCopy, serviceNames } from "../../lib/booking/booking-copy";
import { homepageCopy } from "../../lib/homepage-copy";
import { homepageHeroMedia } from "../../lib/homepage-media";
import { createBookingApi } from "../../lib/booking/client/booking-api.mjs";
import {
  managementCanCancel,
  managementCanReschedule,
  managementDates,
  managementSlotGroups,
  readManagementSecret,
  skopjeLabel,
  skopjeToday,
} from "../../lib/booking/client/booking-flow.mjs";

const phoneHref = "tel:077643005";
const safeStates = new Set(["safe", "invalid"]);

function durationLabel(minutes, language) {
  if (minutes >= 60) {
    const hours = minutes / 60;
    return language === "mk" ? `${hours} ч.` : `${hours} hr`;
  }
  return language === "mk" ? `${minutes} мин.` : `${minutes} min`;
}

function timeLabel(value, language) {
  return new Intl.DateTimeFormat(language === "mk" ? "mk-MK" : "en-GB", {
    timeZone: "Europe/Skopje",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      className="min-h-12 rounded-full bg-accent-deep px-7 py-3 font-extrabold text-surface transition-colors hover:bg-accent hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
      {...props}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      className="min-h-12 rounded-full border border-line-strong bg-surface px-7 py-3 font-extrabold text-accent-deep transition-colors hover:border-accent-deep hover:bg-peach focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
      {...props}
    >
      {children}
    </button>
  );
}

function PhoneFallback({ copy }) {
  return (
    <p className="mt-5 rounded-[1.5rem] border border-line bg-surface p-4 text-sm leading-relaxed text-muted">
      <a className="font-extrabold text-accent-deep underline decoration-2 underline-offset-4 hover:text-accent" href={phoneHref}>{copy.phoneAction}</a>
    </p>
  );
}

function BookingSummary({ booking, language, copy }) {
  const service = booking ? SERVICES.find((item) => item.id === booking.serviceId) : null;
  return (
    <aside className="relative h-full min-h-[24rem] overflow-hidden rounded-[2.75rem] border border-line-strong bg-accent-deep shadow-[0_24px_70px_rgb(92_56_44_/_0.18)] lg:min-h-0" aria-label={copy.summaryTitle}>
      <Image
        alt={homepageCopy[language].media.items.interior.alt}
        className="object-cover"
        fill
        quality={100}
        sizes="(min-width: 1024px) 38vw, 100vw"
        src={homepageHeroMedia.src}
        style={{ objectPosition: homepageHeroMedia.heroObjectPosition }}
      />
      <div className="absolute inset-0 bg-accent-deep/55" aria-hidden="true" />
      <div className="relative flex h-full min-h-[24rem] flex-col justify-between p-5 sm:p-7 lg:min-h-0 lg:p-8">
        <p className="max-w-[10ch] text-[clamp(2.7rem,5vw,5.7rem)] font-bold leading-[0.88] tracking-[-0.045em] text-surface">{copy.summaryTitle}</p>
        {booking && service ? (
          <div className="rounded-[2rem] border border-surface/50 bg-surface/95 p-5 text-ink shadow-[0_16px_50px_rgb(52_36_31_/_0.18)] sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">{copy.service}</p>
            <p className="mt-2 text-2xl font-bold leading-tight">{serviceNames[service.id][language]}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-peach px-3 py-1.5 text-sm font-bold text-accent-deep">{durationLabel(service.durationMinutes, language)}</span>
              <span className="rounded-full bg-peach px-3 py-1.5 text-sm font-bold text-accent-deep">{service.priceLabel}</span>
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">{copy.dateTime}</p>
              <p className="mt-2 text-base font-bold leading-snug">{skopjeLabel(booking.start, language)}</p>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function DateRail({ dates, selected, language, copy, onSelect }) {
  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {dates.map((date) => {
          const active = selected === date.value;
          return (
            <button
              aria-pressed={active}
              className={`min-h-16 rounded-[1.25rem] border px-2.5 py-2.5 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent ${active ? "border-accent-deep bg-accent-deep text-surface shadow-[0_10px_24px_rgb(92_56_44_/_0.18)]" : "border-line-strong bg-surface text-ink hover:border-accent hover:bg-peach/60"}`}
              key={date.value}
              onClick={() => onSelect(date.value)}
              type="button"
            >
              <span className={`block text-xs font-extrabold uppercase tracking-[0.08em] ${active ? "text-surface/75" : "text-accent"}`}>{date.isToday ? copy.today : new Intl.DateTimeFormat(language === "mk" ? "mk-MK" : "en-GB", { timeZone: "UTC", weekday: "short" }).format(new Date(`${date.value}T12:00:00Z`))}</span>
              <span className="mt-0.5 block text-sm font-bold">{new Intl.DateTimeFormat(language === "mk" ? "mk-MK" : "en-GB", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(`${date.value}T12:00:00Z`))}</span>
            </button>
          );
        })}
      </div>
      <label className="mt-4 block text-sm font-extrabold text-ink">
        {copy.anotherDate}
        <span className="relative mt-2 block">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-accent-deep">
            <svg data-icon="calendar" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>
          </span>
          <input aria-describedby="management-date-hint" className="min-h-14 w-full cursor-pointer rounded-[1.5rem] border border-line-strong bg-surface pl-12 pr-4 text-base font-semibold text-ink outline-none transition-colors hover:border-accent focus:border-accent-deep focus:ring-3 focus:ring-blush/50" min={dates[0]?.value} onChange={(event) => onSelect(event.target.value)} type="date" value={selected} />
        </span>
      </label>
      <p className="mt-1.5 text-xs text-muted" id="management-date-hint">{copy.dateHint}</p>
    </>
  );
}

function SlotGroup({ label, starts, selected, language, onSelect }) {
  if (!starts.length) return null;
  return (
    <div className="mt-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">{label}</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6" role="radiogroup" aria-label={label}>
        {starts.map((start) => (
          <label className="group relative cursor-pointer" key={start}>
            <input checked={selected === start} className="peer sr-only" name="management-slot" onChange={() => onSelect(start)} type="radio" />
            <span className="flex min-h-10 items-center justify-center rounded-full border border-line-strong bg-surface px-2 text-center text-[0.82rem] font-bold text-ink transition-colors hover:border-accent hover:bg-peach/60 peer-checked:border-accent-deep peer-checked:bg-accent-deep peer-checked:text-surface peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">{timeLabel(start, language)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function BookingManagementExperience() {
  const { language } = useLanguage();
  const copy = bookingCopy[language].management;
  const capabilityRef = useRef("");
  const apiRef = useRef(null);
  const readControllerRef = useRef(null);
  const availabilityControllerRef = useRef(null);
  const headingRef = useRef(null);
  const [view, setView] = useState("loading");
  const [booking, setBooking] = useState(null);
  const [errorKind, setErrorKind] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const [starts, setStarts] = useState([]);
  const [availabilityState, setAvailabilityState] = useState("idle");
  const [notice, setNotice] = useState("");
  const [mutationState, setMutationState] = useState("idle");
  const navigationRef = useRef(null);
  const dates = useMemo(() => managementDates(skopjeToday()), []);
  const groupedStarts = useMemo(() => managementSlotGroups(starts, language), [starts, language]);

  const phone = <a className="font-bold text-accent-deep underline decoration-2 underline-offset-4 hover:text-accent" href={phoneHref}>{bookingCopy[language].phoneAction}</a>;

  const readBooking = useCallback(async (signal) => {
    const result = await apiRef.current?.managementRead({ signal });
    if (!result || result.kind === "safe" || result.kind === "invalid") {
      setBooking(null);
      setView("safe");
      return;
    }
    if (!result.ok) {
      setErrorKind(result.kind);
      setView("error");
      return;
    }
    setBooking(result.booking);
    setErrorKind("");
    setView(result.booking.status === "cancelled" ? "cancelled" : "ready");
  }, []);

  useEffect(() => {
    const consumeCapability = (event) => {
      const fromFragment = readManagementSecret(window.location.hash);
      // React Strict Mode replays effects after the first mount; the fragment
      // has already been stripped, but the in-memory capability remains valid.
      // A real hashchange to a stripped entry intentionally does not reuse it.
      const capability = fromFragment || (event ? "" : capabilityRef.current);
      readControllerRef.current?.abort();
      availabilityControllerRef.current?.abort();
      capabilityRef.current = capability;
      // Keep same-document history metadata intact while removing the secret
      // before any request starts. Strict Mode may replay this safely.
      if (window.location.hash) window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
      if (!capability) { apiRef.current = null; setBooking(null); setView("safe"); return; }
      apiRef.current = createBookingApi({ fetch: (...args) => fetch(...args), capability: () => capabilityRef.current });
      const controller = new AbortController();
      readControllerRef.current = controller;
      setView("loading");
      readBooking(controller.signal);
    };
    consumeCapability();
    window.addEventListener("hashchange", consumeCapability);
    return () => {
      window.removeEventListener("hashchange", consumeCapability);
      readControllerRef.current?.abort();
      availabilityControllerRef.current?.abort();
    };
  }, [readBooking]);

  useEffect(() => {
    if (view === "loading") return;
    queueMicrotask(() => headingRef.current?.focus());
  }, [view]);

  const loadAvailability = useCallback(async (date) => {
    availabilityControllerRef.current?.abort();
    const controller = new AbortController();
    availabilityControllerRef.current = controller;
    setSelectedDate(date);
    setSelectedStart("");
    setNotice("");
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(date)) {
      setStarts([]);
      setAvailabilityState("invalid");
      return;
    }
    setStarts([]);
    setAvailabilityState("loading");
    const result = await apiRef.current?.managementAvailability({ date, signal: controller.signal });
    if (controller.signal.aborted) return;
    if (!result || result.kind === "safe" || result.kind === "invalid") {
      setAvailabilityState("invalid");
      return;
    }
    if (result.kind === "cutoff") {
      setAvailabilityState("idle");
      setView("cutoff");
      return;
    }
    if (!result.ok) {
      setErrorKind(result.kind);
      setView("error");
      return;
    }
    if (result.availability?.serviceId !== booking?.serviceId || result.availability?.date !== date) {
      setErrorKind("provider");
      setView("error");
      return;
    }
    setStarts(result.availability.starts);
    setAvailabilityState(result.availability.starts.length ? "ready" : "empty");
  }, [booking?.serviceId]);

  const beginReschedule = () => {
    if (!managementCanReschedule(booking)) {
      setView("cutoff");
      return;
    }
    setView("reschedule");
    const firstDate = dates[0]?.value ?? skopjeToday();
    loadAvailability(firstDate);
  };

  const submitReschedule = async () => {
    if (!selectedDate) return setNotice("chooseDate");
    if (!selectedStart) return setNotice("chooseSlot");
    setMutationState("loading");
    setNotice("");
    const result = await apiRef.current?.managementReschedule({ start: selectedStart });
    if (result?.ok) {
      setBooking(result.booking);
      setMutationState("idle");
      setView("rescheduled");
      return;
    }
    setMutationState("idle");
    if (result?.kind === "conflict") {
      setNotice("conflict");
      loadAvailability(selectedDate);
    } else if (result?.kind === "cutoff") {
      setView("cutoff");
    } else if (safeStates.has(result?.kind)) {
      setView("safe");
    } else {
      setErrorKind(result?.kind ?? "provider");
      setView("error");
    }
  };

  const beginCancel = () => {
    if (!managementCanCancel(booking)) {
      setView("cancellationCutoff");
      return;
    }
    setView("cancelConfirm");
    setNotice("");
  };

  const submitCancel = async () => {
    setMutationState("loading");
    const result = await apiRef.current?.managementCancel({});
    if (result?.ok) {
      setBooking(result.booking);
      setMutationState("idle");
      setView("cancelled");
      return;
    }
    setMutationState("idle");
    if (result?.kind === "cancellationCutoff") setView("cancellationCutoff");
    else if (safeStates.has(result?.kind)) setView("safe");
    else {
      setErrorKind(result?.kind ?? "provider");
      setView("error");
    }
  };

  const retryRead = () => {
    readControllerRef.current?.abort();
    const controller = new AbortController();
    readControllerRef.current = controller;
    setView("loading");
    readBooking(controller.signal);
  };

  const errorText = errorKind === "rateLimited" ? copy.rateLimited : errorKind === "unknown" ? copy.unknown : copy.provider;
  const isWorking = mutationState === "loading";
  const mediaCopy = homepageCopy[language].media;

  return (
    <main className="min-h-dvh overflow-x-clip bg-surface px-pad pb-32 pt-8 sm:pt-12 lg:pb-28 lg:pt-10" ref={navigationRef}>
      <div className="mx-auto max-w-[90rem]">
        <h1 className="sr-only">{copy.title}</h1>
        <div className="grid items-stretch gap-6 lg:min-h-[calc(100dvh-8rem)] lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
          <BookingSummary booking={booking} copy={copy} language={language} />
          <section className="rounded-[2.75rem] border border-line bg-surface-warm/65 p-5 shadow-[0_24px_70px_rgb(92_56_44_/_0.08)] sm:p-8">
            <p aria-live="polite" className="sr-only">{view === "loading" ? copy.loading : notice ? copy[notice] ?? "" : ""}</p>
            {view === "loading" && (
              <section className="pt-3" aria-busy="true"><h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-[-0.025em]">{copy.title}</h2><p className="mt-4 text-lg text-muted">{copy.loading}</p></section>
            )}
            {view === "safe" && (
              <section className="pt-3"><h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-[-0.025em]">{copy.safeTitle}</h2><p className="mt-4 text-lg leading-relaxed text-muted">{copy.safeBody}</p><PhoneFallback copy={bookingCopy[language]} /></section>
            )}
            {view === "error" && (
              <section className="pt-3"><h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-[-0.025em]">{copy.errorTitle}</h2><p className="mt-4 text-lg leading-relaxed text-muted">{errorText}</p><div className="mt-6 flex flex-wrap items-center gap-3"><SecondaryButton onClick={retryRead} type="button">{copy.retry}</SecondaryButton>{phone}</div></section>
            )}
            {(view === "ready" || view === "cancelled" || view === "rescheduled") && booking && (
              <section className="pt-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">{view === "ready" ? copy.confirmed : view === "cancelled" ? copy.cancelled : copy.rescheduledTitle}</p>
                <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-bold tracking-[-0.025em]">{view === "ready" ? copy.summaryTitle : view === "cancelled" ? copy.cancelledTitle : copy.rescheduledTitle}</h2>
                <p className="mt-4 text-lg leading-relaxed text-muted">{view === "cancelled" ? copy.cancelledBody : view === "rescheduled" ? copy.rescheduledBody : skopjeLabel(booking.start, language)}</p>
                {view === "ready" && (
                  <div className="mt-7 flex flex-wrap gap-3"><PrimaryButton onClick={beginReschedule} type="button">{copy.reschedule}</PrimaryButton><SecondaryButton onClick={beginCancel} type="button">{copy.cancel}</SecondaryButton></div>
                )}
                {view !== "ready" && <PhoneFallback copy={bookingCopy[language]} />}
              </section>
            )}
            {view === "cutoff" && (
              <section className="pt-3"><h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-[-0.025em]">{copy.cutoffTitle}</h2><p className="mt-4 text-lg leading-relaxed text-muted">{copy.cutoffBody}</p><PhoneFallback copy={bookingCopy[language]} /><div className="mt-6"><SecondaryButton onClick={() => setView("ready")} type="button">{copy.back}</SecondaryButton></div></section>
            )}
            {view === "cancellationCutoff" && (
              <section className="pt-3"><h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-[-0.025em]">{copy.cancellationCutoffTitle}</h2><p className="mt-4 text-lg leading-relaxed text-muted">{copy.cancellationCutoffBody}</p><PhoneFallback copy={bookingCopy[language]} /><div className="mt-6"><SecondaryButton onClick={() => setView("ready")} type="button">{copy.back}</SecondaryButton></div></section>
            )}
            {view === "cancelConfirm" && booking && (
              <section className="pt-3"><fieldset><legend ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-[-0.025em]">{copy.cancelTitle}</legend><p className="mt-4 text-lg leading-relaxed text-muted">{copy.cancelBody}</p><p className="mt-5 rounded-[1.5rem] border border-line bg-surface p-4 font-bold">{skopjeLabel(booking.start, language)}</p><p aria-live="polite" className="min-h-6 pt-4 text-sm font-semibold text-accent-deep">{notice ? copy[notice] ?? "" : ""}</p><div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row"><SecondaryButton disabled={isWorking} onClick={() => setView("ready")} type="button">{copy.keepBooking}</SecondaryButton><PrimaryButton disabled={isWorking} onClick={submitCancel} type="button">{isWorking ? copy.cancelling : copy.confirmCancel}</PrimaryButton></div></fieldset></section>
            )}
            {view === "reschedule" && booking && (
              <section className="pt-3"><fieldset><legend ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-[-0.025em]">{copy.rescheduleTitle}</legend><p className="mt-3 text-sm text-muted">{copy.rescheduleHint}</p><DateRail copy={copy} dates={dates} language={language} onSelect={loadAvailability} selected={selectedDate} /><p aria-live="polite" className="mt-4 min-h-6 text-sm font-semibold text-accent-deep">{availabilityState === "loading" ? copy.loadingAvailability : availabilityState === "empty" ? copy.emptyAvailability : availabilityState === "invalid" ? copy.provider : notice === "conflict" ? copy.conflict : notice ? copy[notice] ?? "" : ""}</p>{availabilityState === "ready" && <><SlotGroup label={copy.morning} language={language} onSelect={setSelectedStart} selected={selectedStart} starts={groupedStarts.morning} /><SlotGroup label={copy.afternoon} language={language} onSelect={setSelectedStart} selected={selectedStart} starts={groupedStarts.afternoon} /></>}<div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><SecondaryButton disabled={isWorking} onClick={() => setView("ready")} type="button">{copy.back}</SecondaryButton><PrimaryButton disabled={isWorking || availabilityState !== "ready"} onClick={submitReschedule} type="button">{isWorking ? copy.rescheduling : copy.reschedule}</PrimaryButton></div></fieldset></section>
            )}
          </section>
        </div>
      </div>
      <SiteNavigation backHref="/" backLabel={copy.back} current="booking" position="bottom" />
      <p className="sr-only">{mediaCopy.items.interior.alt}</p>
    </main>
  );
}
