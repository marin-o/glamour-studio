"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "../LanguageProvider";
import SiteNavigation from "../SiteNavigation";
import { TransitionLink } from "../motion/PageTransition";
import { SERVICES } from "../../lib/booking/services.mjs";
import { bookingCopy, serviceNames } from "../../lib/booking/booking-copy";
import { homepageCopy } from "../../lib/homepage-copy";
import { homepageHeroMedia } from "../../lib/homepage-media";
import { createBookingApi } from "../../lib/booking/client/booking-api.mjs";
import {
  PUBLIC_BOUNDS,
  initialBookingFlow,
  canContinue,
  moveBack,
  nextKey,
  skopjeLabel,
  staleSlot,
  submissionFingerprint,
  normalizedContact,
  confirmedView,
  skopjeToday,
  createAvailabilityRequestGate,
  createSubmissionGate,
} from "../../lib/booking/client/booking-flow.mjs";

const api = createBookingApi({ fetch: (...args) => fetch(...args) });
const phoneHref = "tel:077643005";
const steps = ["service", "appointment", "contact"];
const carouselSteps = [...steps, "success"];
const subscribeToHydration = () => () => {};
const NAVIGATION_CUBBY_SCALE = 4 / 3;
const carouselTransition = { duration: 0.44, ease: [0.65, 0, 0.35, 1] };
const availabilityCacheTtlMs = 60_000;
const availabilityPrefetchConcurrency = 3;
const bookingHeroMedia = homepageHeroMedia;
const availabilityErrors = new Set([
  "invalid",
  "empty",
  "error",
  "unavailable",
  "notConfigured",
  "rateLimited",
  "timeout",
  "network",
]);
const submitErrors = new Set([
  "network",
  "timeout",
  "unavailable",
  "notConfigured",
  "rateLimited",
  "keyFailure",
]);

function availabilityCacheKey(serviceId, date) {
  return `${serviceId}:${date}`;
}

function durationLabel(minutes, language) {
  if (minutes >= 60) {
    const hours = minutes / 60;
    return language === "mk" ? `${hours} ч.` : `${hours} hr`;
  }
  return language === "mk" ? `${minutes} мин.` : `${minutes} min`;
}

function quickDateOptions(language, today = skopjeToday()) {
  const [year, month, day] = today.split("-").map(Number);
  const locale = language === "mk" ? "mk-MK" : "en-GB";
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, day + index, 12));
    return {
      value: date.toISOString().slice(0, 10),
      weekday: new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short" }).format(date),
      dayMonth: new Intl.DateTimeFormat(locale, { timeZone: "UTC", day: "numeric", month: "short" }).format(date),
      isToday: index === 0,
    };
  });
}

function plainDateLabel(value, language) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.valueOf())) return "";
  return new Intl.DateTimeFormat(language === "mk" ? "mk-MK" : "en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function timeLabel(start, language) {
  return new Intl.DateTimeFormat(language === "mk" ? "mk-MK" : "en-GB", {
    timeZone: "Europe/Skopje",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(start));
}

function skopjeHour(start) {
  const part = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Skopje",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(start)).find((item) => item.type === "hour");
  return Number(part?.value ?? 0);
}

function Progress({ step, copy, prefersReducedMotion }) {
  const current = step === "success" ? 2 : Math.max(0, steps.indexOf(step));
  const label = `${copy.stepProgress} ${current + 1} ${copy.of} 3 — ${step === "success" ? copy.success : copy.steps[current]}`;
  return (
    <div className="border-b border-line pb-5" aria-label={label}>
      <div className="flex items-center justify-between gap-4 text-sm font-bold">
        <span aria-current={step !== "success" ? "step" : undefined} className="text-ink">{label}</span>
        <span aria-hidden="true" className="text-accent">{current + 1}/3</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2" role="progressbar" aria-valuemin="1" aria-valuemax="3" aria-valuenow={current + 1} aria-valuetext={label}>
        {steps.map((item, index) => (
          <span
            aria-hidden="true"
            className="relative h-1.5 overflow-hidden rounded-full bg-peach"
            key={item}
          >
            <motion.span
              animate={{ scaleX: index <= current ? 1 : 0 }}
              className="absolute inset-0 origin-left rounded-full bg-accent-deep"
              initial={false}
          transition={prefersReducedMotion
            ? { duration: 0 }
            : carouselTransition}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

function BookingSummary({ flow, service, language, copy, onChangeService, prefersReducedMotion }) {
  const mediaCopy = homepageCopy[language].media;
  const confirmationService = flow.confirmation
    ? SERVICES.find((item) => item.id === flow.confirmation.serviceId)
    : null;
  const shownService = flow.step === "success" && confirmationService
    ? confirmationService
    : service ?? confirmationService;
  const shownStart = flow.confirmation?.start ?? flow.start;
  const appointment = shownStart
    ? skopjeLabel(shownStart, language)
    : flow.date
      ? `${plainDateLabel(flow.date, language)} · ${copy.timePending}`
      : copy.appointmentPending;
  const canChange = shownService && flow.step !== "service" && flow.step !== "success";

  return (
    <aside className="relative h-full min-h-[24rem] overflow-hidden rounded-[2.75rem] border border-line-strong bg-accent-deep shadow-[0_24px_70px_rgb(92_56_44_/_0.18)] lg:min-h-0" aria-label={copy.summaryTitle}>
      <Image
        alt={mediaCopy.items.interior.alt}
        className="object-cover"
        fill
        quality={100}
        sizes="(min-width: 1024px) 38vw, 100vw"
        src={bookingHeroMedia.src}
        style={{ objectPosition: bookingHeroMedia.heroObjectPosition }}
      />
      <div className="absolute inset-0 bg-accent-deep/55" aria-hidden="true" />
      <div className="relative flex h-full min-h-[24rem] flex-col justify-between p-5 sm:p-7 lg:min-h-0 lg:p-8">
        <div>
          <p className="max-w-[9ch] text-[clamp(2.7rem,5vw,5.7rem)] font-bold leading-[0.88] tracking-[-0.045em] text-surface">
            {copy.summaryTitle}
          </p>
        </div>

        <motion.div
          className="mt-14 rounded-[2rem] border border-surface/50 bg-surface/95 p-5 text-ink shadow-[0_16px_50px_rgb(52_36_31_/_0.18)] backdrop-blur-md sm:p-6"
          layout={!prefersReducedMotion}
          style={{ borderRadius: "2rem" }}
          transition={prefersReducedMotion
            ? { layout: { duration: 0 } }
            : { layout: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } }}
        >
          {shownService ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">{copy.selectedService}</p>
                  <p className="mt-2 text-2xl font-bold leading-tight">{serviceNames[shownService.id][language]}</p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-deep text-surface" aria-hidden="true">✓</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-peach px-3 py-1.5 text-sm font-bold text-accent-deep">{durationLabel(shownService.durationMinutes, language)}</span>
                <span className="rounded-full bg-peach px-3 py-1.5 text-sm font-bold text-accent-deep">{shownService.priceLabel}</span>
              </div>
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">{copy.steps[1]}</p>
                <p className="mt-2 text-base font-bold leading-snug">{appointment}</p>
              </div>
              {canChange && (
                <button
                  className="mt-5 min-h-11 rounded-full border border-line-strong bg-surface-warm px-5 py-2 text-sm font-extrabold text-accent-deep transition-colors hover:border-accent-deep hover:bg-peach focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  onClick={onChangeService}
                  type="button"
                >
                  {copy.changeService}
                </button>
              )}
            </>
          ) : (
            <p className="max-w-xs text-lg font-bold leading-snug text-accent-deep">{copy.summaryEmpty}</p>
          )}
        </motion.div>
      </div>
    </aside>
  );
}

function DateRail({ dates, selected, invalid, copy, onSelect }) {
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
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
              <span className={`block text-xs font-extrabold uppercase tracking-[0.08em] ${active ? "text-surface/75" : "text-accent"}`}>
                {date.isToday ? copy.today : date.weekday}
              </span>
              <span className="mt-0.5 block text-sm font-bold">{date.dayMonth}</span>
            </button>
          );
        })}
      </div>

      <label className="mt-3 block text-sm font-extrabold text-ink">
        {copy.date}
        <span className="relative mt-2 block">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-accent-deep" aria-hidden="true">
            <svg data-icon="calendar" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M7 3v4M17 3v4M3 10h18" />
            </svg>
          </span>
          <input
            aria-describedby={invalid ? "date-status" : "date-hint"}
            aria-invalid={invalid}
            className="min-h-14 w-full cursor-pointer rounded-[1.5rem] border border-line-strong bg-surface pl-12 pr-4 text-base font-semibold text-ink outline-none transition-colors hover:border-accent focus:border-accent-deep focus:ring-3 focus:ring-blush/50"
            min={dates[0]?.value}
            onChange={(event) => onSelect(event.target.value)}
            type="date"
            value={selected}
          />
        </span>
      </label>
      <p id="date-hint" className="mt-1.5 text-xs text-muted">{copy.dateHint}</p>
    </>
  );
}

function SlotGroup({ label, starts, selected, invalid, language, copy, onSelect }) {
  if (starts.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">{label}</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6" role="radiogroup" aria-invalid={invalid}>
        {starts.map((start) => (
          <label className="group relative cursor-pointer" key={start}>
            <input checked={selected === start} onChange={() => onSelect(start)} className="peer sr-only" name="slot" type="radio" />
            <span className="flex min-h-10 items-center justify-center rounded-full border border-line-strong bg-surface px-2 text-center text-[0.82rem] font-bold text-ink transition-colors hover:border-accent hover:bg-peach/60 peer-checked:border-accent-deep peer-checked:bg-accent-deep peer-checked:hover:bg-accent peer-checked:text-surface peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
              {timeLabel(start, language)}
              <span className="sr-only">, {selected === start ? copy.selected : ""}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
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

function CarouselPanel({ active, children, index, panelRef }) {
  return (
    <div
      ref={panelRef}
      aria-hidden={!active ? "true" : undefined}
      className={`${index === 0 ? "relative" : "absolute top-0"} w-full px-3 py-2 sm:px-4 sm:py-3`}
      inert={!active ? true : undefined}
      style={{ left: `${index * 100}%`, pointerEvents: active ? "auto" : "none" }}
    >
      {children}
    </div>
  );
}

export default function BookingExperience({ initialServiceId = "", initialSkopjeDate = "" }) {
  const { language } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const t = bookingCopy[language];
  const [flow, setFlow] = useState(initialBookingFlow);
  const [desktopSheetScroll, setDesktopSheetScroll] = useState(false);
  const hydratedInitialServiceId = useSyncExternalStore(
    subscribeToHydration,
    () => initialServiceId,
    () => "",
  );
  const selectedServiceId = flow.serviceId || hydratedInitialServiceId;
  const presentedFlow = useMemo(
    () => selectedServiceId === flow.serviceId ? flow : { ...flow, serviceId: selectedServiceId },
    [flow, selectedServiceId],
  );
  const [retry, setRetry] = useState(0);
  const gateRef = useRef(createAvailabilityRequestGate());
  const submitGateRef = useRef(createSubmissionGate());
  const mainRef = useRef(null);
  const navigationRef = useRef(null);
  const carouselViewportRef = useRef(null);
  const carouselPanelRefs = useRef([]);
  const settledScreenIndexRef = useRef(0);
  const carouselTransitioningRef = useRef(false);
  const availabilityCacheRef = useRef(new Map());
  const availabilityPendingRef = useRef(new Map());
  const availabilityCacheGenerationRef = useRef(0);
  const successStepRef = useRef();
  const serviceStepRef = useRef();
  const appointmentStepRef = useRef();
  const contactStepRef = useRef();
  const staleRef = useRef();
  const statusRef = useRef();
  const errorRef = useRef();
  const service = useMemo(() => SERVICES.find((item) => item.id === selectedServiceId), [selectedServiceId]);
  const stableSkopjeDate = initialSkopjeDate || skopjeToday();
  const quickDates = useMemo(() => quickDateOptions(language, stableSkopjeDate), [language, stableSkopjeDate]);
  const morningStarts = flow.starts.filter((start) => skopjeHour(start) < 12);
  const afternoonStarts = flow.starts.filter((start) => skopjeHour(start) >= 12);
  const activeScreenIndex = Math.max(0, carouselSteps.indexOf(flow.step));
  const activeFocusRef = [serviceStepRef, appointmentStepRef, contactStepRef, successStepRef][activeScreenIndex];
  const getCachedAvailability = useCallback((serviceId, date) => {
    const key = availabilityCacheKey(serviceId, date);
    const cached = availabilityCacheRef.current.get(key);
    if (!cached) return null;
    if (cached.expiresAt <= Date.now()) {
      availabilityCacheRef.current.delete(key);
      return null;
    }
    return cached.result;
  }, []);
  const requestAvailability = useCallback((serviceId, date, signal) => {
    const cached = getCachedAvailability(serviceId, date);
    if (cached) return Promise.resolve(cached);

    const key = availabilityCacheKey(serviceId, date);
    const requestGeneration = availabilityCacheGenerationRef.current;
    const pending = availabilityPendingRef.current.get(key);
    if (pending) return pending.promise;

    let promise;
    promise = api.availability({ serviceId, date, signal }).then((result) => {
      if (result.ok && requestGeneration === availabilityCacheGenerationRef.current && !signal.aborted) {
        availabilityCacheRef.current.set(key, {
          result,
          expiresAt: Date.now() + availabilityCacheTtlMs,
        });
      }
      return result;
    }).finally(() => {
      if (availabilityPendingRef.current.get(key)?.promise === promise) {
        availabilityPendingRef.current.delete(key);
      }
    });
    availabilityPendingRef.current.set(key, { promise, signal });
    return promise;
  }, [getCachedAvailability]);

  useLayoutEffect(() => {
    const main = mainRef.current;
    const navigation = navigationRef.current;
    if (!main || !navigation) return undefined;

    const syncCubbyHeight = () => {
      const navigationHeight = navigation.getBoundingClientRect().height;
      const cubbyHeight = Math.ceil(navigationHeight * NAVIGATION_CUBBY_SCALE);
      const cubbyInset = (cubbyHeight - navigationHeight) / 2;
      main.style.setProperty("--navigation-cubby-height", `${cubbyHeight}px`);
      main.style.setProperty("--navigation-cubby-inset", `${cubbyInset}px`);
    };
    const resizeObserver = typeof ResizeObserver === "undefined"
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

  useLayoutEffect(() => {
    const viewport = carouselViewportRef.current;
    const incomingPanel = carouselPanelRefs.current[activeScreenIndex];
    const outgoingPanel = carouselPanelRefs.current[settledScreenIndexRef.current];
    if (!viewport || !incomingPanel) return undefined;
    carouselTransitioningRef.current = !prefersReducedMotion
      && settledScreenIndexRef.current !== activeScreenIndex;
    const syncHeight = () => {
      const incomingHeight = Math.ceil(incomingPanel.getBoundingClientRect().height);
      const outgoingHeight = outgoingPanel
        ? Math.ceil(outgoingPanel.getBoundingClientRect().height)
        : incomingHeight;
      const height = carouselTransitioningRef.current
        ? Math.max(incomingHeight, outgoingHeight)
        : incomingHeight;
      viewport.style.height = `${height}px`;
    };
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(syncHeight);
    resizeObserver?.observe(incomingPanel);
    if (outgoingPanel && outgoingPanel !== incomingPanel) {
      resizeObserver?.observe(outgoingPanel);
    }
    syncHeight();
    if (prefersReducedMotion) {
      settledScreenIndexRef.current = activeScreenIndex;
      carouselTransitioningRef.current = false;
    }
    return () => resizeObserver?.disconnect();
  }, [activeScreenIndex, prefersReducedMotion]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncDesktopSheetScroll = () => setDesktopSheetScroll(mediaQuery.matches);
    syncDesktopSheetScroll();
    mediaQuery.addEventListener?.("change", syncDesktopSheetScroll);
    return () => mediaQuery.removeEventListener?.("change", syncDesktopSheetScroll);
  }, []);

  useEffect(() => {
    if (!selectedServiceId) return undefined;

    const controller = new AbortController();
    const pendingRequests = availabilityPendingRef.current;
    const dates = quickDates.map(({ value }) => value);
    let nextDateIndex = 0;
    const prefetchWorker = async () => {
      while (nextDateIndex < dates.length && !controller.signal.aborted) {
        const date = dates[nextDateIndex];
        nextDateIndex += 1;
        await requestAvailability(selectedServiceId, date, controller.signal);
      }
    };
    void Promise.allSettled(
      Array.from(
        { length: Math.min(availabilityPrefetchConcurrency, dates.length) },
        () => prefetchWorker(),
      ),
    );

    return () => {
      controller.abort();
      dates.forEach((date) => {
        const key = availabilityCacheKey(selectedServiceId, date);
        if (pendingRequests.get(key)?.signal === controller.signal) {
          pendingRequests.delete(key);
        }
      });
    };
  }, [quickDates, requestAvailability, selectedServiceId]);

  useEffect(() => {
    if (flow.notice === "taken") staleRef.current?.focus();
    else if (availabilityErrors.has(flow.availability) || ["dateRequired", "slotRequired"].includes(flow.notice)) statusRef.current?.focus();
    else if (submitErrors.has(flow.notice) || flow.notice === "invalid") errorRef.current?.focus();
  }, [flow.availability, flow.notice]);

  useEffect(() => {
    const gate = gateRef.current;
    if (flow.step !== "appointment" || !flow.serviceId || !flow.date) {
      gate.clear();
      return undefined;
    }
    const controller = new AbortController();
    const generation = gate.start(controller);
    const cached = getCachedAvailability(flow.serviceId, flow.date);
    Promise.resolve().then(() => {
      if (!gate.current(generation)) return { ok: false, kind: "aborted" };
      if (cached) return cached;
      setFlow((current) => ({ ...current, availability: "loading", starts: [], start: "" }));
      return requestAvailability(flow.serviceId, flow.date, controller.signal);
    }).then((result) => {
      if (!gate.current(generation) || result.kind === "aborted") return;
      setFlow((current) => ({ ...current, availability: result.ok ? (result.starts.length ? "ready" : "empty") : result.kind, starts: result.ok ? result.starts : [] }));
    });
    return () => { controller.abort(); gate.dispose(); };
  }, [flow.step, flow.serviceId, flow.date, getCachedAvailability, requestAvailability, retry]);

  const set = (field, value) => setFlow((current) => field === "serviceId" || field === "date"
    ? { ...current, [field]: value, start: "", starts: [], availability: "idle", notice: "" }
    : { ...current, [field]: value, notice: "" });
  const changeService = () => {
    setFlow((current) => ({ ...current, step: "service", notice: "" }));
  };
  const startNewBooking = () => {
    gateRef.current.clear();
    availabilityCacheGenerationRef.current += 1;
    availabilityCacheRef.current.clear();
    availabilityPendingRef.current.clear();
    setRetry(0);
    setFlow(initialBookingFlow);
  };
  const goBack = () => {
    setFlow(moveBack(flow));
  };
  const proceed = () => {
    if (flow.step === "appointment" && !flow.date) return setFlow((current) => ({ ...current, notice: "dateRequired" }));
    if (flow.step === "appointment" && !flow.start) return setFlow((current) => ({ ...current, notice: "slotRequired" }));
    if (!canContinue(presentedFlow)) return setFlow((current) => ({ ...current, notice: "invalid" }));
    setFlow((current) => ({
      ...current,
      serviceId: current.serviceId || selectedServiceId,
      step: current.step === "service" ? "appointment" : "contact",
      notice: "",
    }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!submitGateRef.current.acquire()) return;
    try {
      if (!canContinue(flow)) return setFlow((current) => ({ ...current, notice: "invalid" }));
      const key = nextKey(flow, api.createKey);
      if (!key) return setFlow((current) => ({ ...current, notice: "keyFailure" }));
      const contact = normalizedContact(flow);
      setFlow((current) => ({ ...current, ...contact, submit: "submitting", key, keyFingerprint: submissionFingerprint(flow), notice: "" }));
      const result = await api.book({ ...flow, ...contact, idempotencyKey: key });
      if (result.ok) {
        return setFlow({ ...initialBookingFlow, step: "success", confirmation: confirmedView(result.booking) });
      }
      if (result.kind === "taken") {
        availabilityCacheRef.current.delete(availabilityCacheKey(flow.serviceId, flow.date));
        availabilityPendingRef.current.delete(availabilityCacheKey(flow.serviceId, flow.date));
        setRetry((value) => value + 1);
        return setFlow(staleSlot(flow));
      }
      setFlow((current) => ({ ...current, submit: "idle", notice: result.kind }));
    } finally {
      submitGateRef.current.release();
    }
  };

  const availabilityMessage = flow.availability === "empty" ? t.empty
    : flow.availability === "invalid" ? t.invalidDate
      : flow.availability === "rateLimited" ? t.rateLimited
        : flow.availability === "timeout" ? t.timeout : t.unavailable;
  const phone = <a className="font-bold text-accent-deep underline decoration-2 underline-offset-4 hover:text-accent" href={phoneHref}>{t.phoneAction}</a>;

  return (
    <main
      ref={mainRef}
      className="min-h-dvh overflow-x-clip bg-surface px-pad pt-8 pb-[var(--navigation-cubby-height)] [--navigation-cubby-height:124px] [--navigation-cubby-inset:12px] sm:pt-12 sm:[--navigation-cubby-height:104px] lg:min-h-dvh lg:overflow-y-auto lg:pt-10 lg:[--navigation-cubby-inset:16px]"
    >
      <div className="mx-auto max-w-[90rem] lg:h-full">
        <h1 className="sr-only">{flow.step === "success" ? t.success : t.title}</h1>
        <div className="grid items-stretch gap-6 lg:h-[calc(100dvh-var(--navigation-cubby-height)-2.5rem)] lg:min-h-0 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
          <BookingSummary flow={presentedFlow} service={service} language={language} copy={t} onChangeService={changeService} prefersReducedMotion={prefersReducedMotion} />

          <section
            className="h-auto min-h-[24rem] overflow-visible rounded-[2.75rem] border border-line bg-surface-warm/65 shadow-[0_24px_70px_rgb(92_56_44_/_0.08)] lg:h-full lg:min-h-0 lg:overflow-hidden"
          >
            <div className="h-auto overflow-visible p-5 sm:p-8 lg:h-full lg:overflow-y-auto lg:[scrollbar-gutter:stable]" data-lenis-prevent={desktopSheetScroll ? "" : undefined}>
            <Progress step={flow.step} copy={t} prefersReducedMotion={prefersReducedMotion} />

            <div ref={carouselViewportRef} className="relative isolate overflow-hidden rounded-[1.75rem] bg-surface-warm/30">
              <motion.div
                animate={{ x: `${activeScreenIndex * -100}%` }}
                className="relative w-full"
                initial={false}
                onAnimationComplete={() => {
                  carouselTransitioningRef.current = false;
                  settledScreenIndexRef.current = activeScreenIndex;
                  const activePanel = carouselPanelRefs.current[activeScreenIndex];
                  if (carouselViewportRef.current && activePanel) {
                    carouselViewportRef.current.style.height = `${Math.ceil(activePanel.getBoundingClientRect().height)}px`;
                  }
                  activeFocusRef.current?.focus();
                }}
                transition={prefersReducedMotion ? { duration: 0 } : carouselTransition}
              >
              <CarouselPanel active={flow.step === "service"} index={0} panelRef={(node) => { carouselPanelRefs.current[0] = node; }}>
              <fieldset className="pt-3">
                <legend ref={serviceStepRef} tabIndex="-1" className="text-3xl font-bold tracking-[-0.025em] outline-none">{t.choose}</legend>
                <p className="mt-2 text-sm text-muted">{t.serviceHint}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {SERVICES.map((item) => (
                    <label
                      className="group relative grid min-h-28 min-w-0 cursor-pointer grid-cols-1 items-start gap-2 rounded-[1.25rem] border border-line-strong bg-surface px-3 py-3 transition-colors hover:border-accent hover:bg-peach/35 has-[:checked]:border-accent-deep has-[:checked]:bg-peach/70 has-[:checked]:shadow-[0_12px_30px_rgb(92_56_44_/_0.1)] has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent lg:min-h-[4.75rem] lg:grid-cols-[auto_1fr] lg:gap-3 lg:rounded-[1.5rem] lg:px-4 lg:py-3"
                      key={item.id}
                    >
                      <input checked={selectedServiceId === item.id} onChange={() => set("serviceId", item.id)} className="peer sr-only" type="radio" name="service" />
                      <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full border-2 border-accent/50 text-sm text-transparent transition-colors peer-checked:border-accent-deep peer-checked:bg-accent-deep peer-checked:text-surface peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">✓</span>
                      <span className="min-w-0">
                        <span className="block text-base font-bold leading-tight text-ink sm:text-lg">{serviceNames[item.id][language]}</span>
                        <span className="mt-2 flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
                          <span className="whitespace-nowrap rounded-full bg-surface-warm px-2 py-1 text-[0.7rem] font-bold leading-tight text-muted sm:px-2.5 sm:text-xs">{durationLabel(item.durationMinutes, language)}</span>
                          <span className="whitespace-nowrap rounded-full bg-surface-warm px-2 py-1 text-[0.7rem] font-extrabold leading-tight text-accent-deep sm:px-2.5 sm:text-xs">{item.priceLabel}</span>
                        </span>
                        <span className="sr-only">, {selectedServiceId === item.id ? t.selected : ""}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-5 flex justify-end">
                  <PrimaryButton onClick={proceed} type="button" disabled={!selectedServiceId}>{t.continue}</PrimaryButton>
                </div>
              </fieldset>
              </CarouselPanel>

              <CarouselPanel active={flow.step === "appointment"} index={1} panelRef={(node) => { carouselPanelRefs.current[1] = node; }}>
              <section className="pt-3">
                <h2 ref={appointmentStepRef} tabIndex="-1" className="text-3xl font-bold tracking-[-0.025em] outline-none">{t.chooseDate}</h2>
                <DateRail dates={quickDates} selected={flow.date} invalid={flow.availability === "invalid"} copy={t} onSelect={(value) => set("date", value)} />
                <p ref={flow.notice === "slotRequired" ? undefined : statusRef} id="date-status" tabIndex="-1" aria-live="polite" className="mt-4 min-h-6 text-sm font-semibold text-accent-deep outline-none">
                  {flow.availability === "loading" ? t.loading
                    : availabilityErrors.has(flow.availability) ? availabilityMessage
                      : ""}
                </p>

                {availabilityErrors.has(flow.availability) && flow.availability !== "loading" && (
                  <div className="mt-3 flex flex-wrap items-center gap-4 rounded-[1.5rem] border border-line bg-surface p-4 text-sm">
                    {phone}
                    {flow.availability !== "empty" && (
                      <button className="min-h-11 rounded-full border border-line-strong bg-surface-warm px-5 py-2 font-extrabold text-accent-deep transition-colors hover:border-accent-deep hover:bg-peach focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent" onClick={() => setRetry((value) => value + 1)} type="button">{t.retry}</button>
                    )}
                  </div>
                )}

                {flow.availability === "ready" && (
                  <fieldset className="mt-5 space-y-4">
                    <legend className="mb-3 text-lg font-bold">{t.slots}</legend>
                    <SlotGroup label={t.morning} starts={morningStarts} selected={flow.start} invalid={flow.notice === "slotRequired"} language={language} copy={t} onSelect={(value) => set("start", value)} />
                    <SlotGroup label={t.afternoon} starts={afternoonStarts} selected={flow.start} invalid={flow.notice === "slotRequired"} language={language} copy={t} onSelect={(value) => set("start", value)} />
                  </fieldset>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <SecondaryButton onClick={goBack} type="button">{t.back}</SecondaryButton>
                  <div className="relative flex justify-end">
                    {(flow.notice === "dateRequired" || flow.notice === "slotRequired" || flow.notice === "taken") && (
                      <p
                        aria-live="polite"
                        className="absolute right-0 bottom-[calc(100%+0.5rem)] z-10 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-2 text-sm font-bold text-accent-deep outline-none sm:top-1/2 sm:right-[calc(100%+0.75rem)] sm:bottom-auto sm:-translate-y-1/2"
                        id="appointment-action-status"
                        ref={(node) => {
                          statusRef.current = node;
                          staleRef.current = node;
                        }}
                        tabIndex="-1"
                      >
                        {flow.notice === "dateRequired" ? t.dateRequired : flow.notice === "slotRequired" ? t.slotRequired : flow.notice === "taken" ? t.taken : ""}
                      </p>
                    )}
                    <PrimaryButton aria-describedby={(flow.notice === "dateRequired" || flow.notice === "slotRequired" || flow.notice === "taken") ? "appointment-action-status" : undefined} onClick={proceed} type="button" disabled={Boolean(flow.date) && (flow.availability !== "ready" || !flow.start)}>{t.continue}</PrimaryButton>
                  </div>
                </div>
              </section>
              </CarouselPanel>

              <CarouselPanel active={flow.step === "contact"} index={2} panelRef={(node) => { carouselPanelRefs.current[2] = node; }}>
              <form className="pt-3" onSubmit={submit}>
                <h2 ref={contactStepRef} tabIndex="-1" className="text-3xl font-bold tracking-[-0.025em] outline-none">{t.contactTitle}</h2>
                <p className="mt-2 text-sm text-muted">{t.contactHint}</p>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-extrabold text-ink">
                    {t.name}
                    <input aria-describedby={flow.notice === "invalid" ? "booking-error" : undefined} aria-invalid={flow.notice === "invalid"} autoComplete="name" required maxLength={PUBLIC_BOUNDS.name} className="mt-2 min-h-14 w-full rounded-[1.5rem] border border-line-strong bg-surface px-4 text-base font-semibold text-ink outline-none transition-colors hover:border-accent focus:border-accent-deep focus:ring-3 focus:ring-blush/50" type="text" value={flow.name} onChange={(event) => set("name", event.target.value)} />
                  </label>
                  <label className="block text-sm font-extrabold text-ink">
                    {t.phoneLabel}
                    <input aria-describedby={flow.notice === "invalid" ? "booking-error" : undefined} aria-invalid={flow.notice === "invalid"} autoComplete="tel" inputMode="tel" required maxLength={PUBLIC_BOUNDS.phone} className="mt-2 min-h-14 w-full rounded-[1.5rem] border border-line-strong bg-surface px-4 text-base font-semibold text-ink outline-none transition-colors hover:border-accent focus:border-accent-deep focus:ring-3 focus:ring-blush/50" type="tel" value={flow.phone} onChange={(event) => set("phone", event.target.value)} />
                  </label>
                  <label className="block text-sm font-extrabold text-ink sm:col-span-2">
                    {t.email}
                    <input aria-describedby={flow.notice === "invalid" ? "booking-error" : "email-note"} aria-invalid={flow.notice === "invalid"} autoComplete="email" required maxLength={PUBLIC_BOUNDS.email} className="mt-2 min-h-14 w-full rounded-[1.5rem] border border-line-strong bg-surface px-4 text-base font-semibold text-ink outline-none transition-colors hover:border-accent focus:border-accent-deep focus:ring-3 focus:ring-blush/50" type="email" value={flow.email} onChange={(event) => set("email", event.target.value)} />
                    <span id="email-note" className="mt-2 block font-normal text-muted">{t.emailNote}</span>
                  </label>
                </div>
                <p className="mt-6 rounded-[1.5rem] border border-line bg-surface p-4 text-sm leading-relaxed text-muted">{t.privacy}</p>
                <p id="booking-error" ref={errorRef} tabIndex="-1" aria-live="polite" className="min-h-6 pt-4 text-sm font-semibold text-accent-deep outline-none">
                  {flow.notice === "invalid" ? t.invalid
                    : flow.notice === "rateLimited" ? t.rateLimited
                      : flow.notice === "timeout" ? t.timeout
                        : submitErrors.has(flow.notice) ? t.unavailable : ""}
                </p>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <SecondaryButton onClick={goBack} type="button">{t.back}</SecondaryButton>
                  <PrimaryButton disabled={flow.submit === "submitting"} type="submit">{flow.submit === "submitting" ? t.submitting : t.submit}</PrimaryButton>
                </div>
                {submitErrors.has(flow.notice) && (
                  <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[1.5rem] border border-line bg-surface p-4 text-sm">
                    {phone}
                    <button className="min-h-11 rounded-full border border-line-strong bg-surface-warm px-5 py-2 font-extrabold text-accent-deep transition-colors hover:border-accent-deep hover:bg-peach focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent" type="submit">{t.retry}</button>
                  </div>
                )}
              </form>
              </CarouselPanel>

              <CarouselPanel active={flow.step === "success"} index={3} panelRef={(node) => { carouselPanelRefs.current[3] = node; }}>
              {flow.confirmation && (
              <section className="pt-4">
                <span className="flex size-16 items-center justify-center rounded-full bg-accent-deep text-2xl text-surface" aria-hidden="true">✓</span>
                <h2 ref={successStepRef} tabIndex="-1" className="mt-6 text-3xl font-bold tracking-[-0.025em] outline-none">{t.success}</h2>
                <p className="mt-4 text-2xl font-bold">{serviceNames[flow.confirmation.serviceId][language]}</p>
                <p className="mt-3 text-lg text-muted">{skopjeLabel(flow.confirmation.start, language)}</p>
                <p className="mt-7 rounded-[1.5rem] border border-line bg-surface p-5 text-sm leading-relaxed">{t.invitation[flow.confirmation.notification]}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{t.invitationGuidance}</p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <PrimaryButton onClick={startNewBooking} type="button">{t.newBooking}</PrimaryButton>
                  <TransitionLink className="inline-flex min-h-12 items-center rounded-full border border-line-strong bg-surface px-6 font-extrabold text-accent-deep transition-colors hover:border-accent-deep hover:bg-peach focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent" href="/">{t.backHome}</TransitionLink>
                </div>
              </section>
              )}
              </CarouselPanel>
              </motion.div>
            </div>
            </div>
          </section>
        </div>
      </div>
      <SiteNavigation ref={navigationRef} backHref="/" backLabel={t.back} current="booking" position="bottom" />
    </main>
  );
}
