import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Old Draft | Glamour Studio",
  description:
    "Backup of the previous image-led Glamour Studio homepage draft with all salon details still pending.",
};

const mediaSlots = [
  {
    title: "Hero film",
    role: "First impression",
    status: "Owner media pending",
    detail: "Reserve this lead moment for the real hero video and static poster.",
    currentSrc: "/media/salon-hero-placeholder.png",
    currentAlt: "Temporary soft salon media placeholder.",
    target: "Hero video and poster",
  },
  {
    title: "Hair texture",
    role: "Beauty detail",
    status: "Owner media pending",
    detail: "Use a close salon-approved detail of hair movement, finish, or styling.",
    currentSrc: "/media/salon-hair-texture-placeholder.png",
    currentAlt: "Temporary close hair texture placeholder.",
    target: "Hair movement or finish",
  },
  {
    title: "Studio light",
    role: "Place detail",
    status: "Owner media pending",
    detail: "Replace with real interior light, materials, or a calm corner of the studio.",
    currentSrc: "/media/salon-interior-detail-placeholder.png",
    currentAlt: "Temporary salon interior detail placeholder.",
    target: "Salon interior detail",
  },
  {
    title: "Service detail",
    role: "Work moment",
    status: "Owner media pending",
    detail: "Hold this position for approved tools, color, prep, or service process media.",
    currentSrc: null,
    currentAlt: "",
    target: "Tools, color, or prep",
  },
  {
    title: "Wide studio moment",
    role: "Signature frame",
    status: "Owner media pending",
    detail: "Use a wide image that makes the real Glamour Studio space feel present.",
    currentSrc: null,
    currentAlt: "",
    target: "Signature wide image",
  },
];

const services = [
  {
    number: "01",
    name: "Haircuts",
    summary: "Draft category for the cut service group.",
    pending: "Final service names, durations, prices, and staff details are pending.",
  },
  {
    number: "02",
    name: "Hairstyling",
    summary: "Draft category for styling and occasion-ready work.",
    pending: "Occasion scope, appointment length, and pricing are pending.",
  },
  {
    number: "03",
    name: "Makeup",
    summary: "Draft category for makeup services.",
    pending: "Final scope, products, artist details, and pricing are pending.",
  },
];

const pendingDetails = [
  "Confirmed phone, Viber, or Instagram contact",
  "Address and map details",
  "Opening hours",
  "Real booking request destination",
];

const eyebrow = "m-0 mb-3.5 text-[0.82rem] font-extrabold text-accent";
const sectionH2 = "max-w-[11ch] text-[clamp(2.35rem,7.5vw,4.8rem)] leading-[0.96]";
const sectionCopy = "mt-6 max-w-[620px] text-[1.08rem] leading-[1.68] text-muted";

export default function OldDraft() {
  return (
    <main className="min-h-dvh overflow-x-clip pb-[154px] sm:pb-[104px]">
      <header
        className="sticky top-0 z-20 grid min-h-16 grid-cols-[1fr_auto] items-center gap-3 border-b border-line bg-surface/90 px-pad py-3 backdrop-blur-2xl md:min-h-[68px] md:grid-cols-[minmax(160px,1fr)_auto_minmax(120px,1fr)] md:gap-[22px]"
        aria-label="Old draft navigation"
      >
        <Link
          className="justify-self-start font-display text-[1.15rem] font-bold md:text-[1.35rem]"
          href="/"
        >
          Glamour Studio
        </Link>
        <nav className="hidden items-center justify-center gap-[34px] text-[0.96rem] text-muted md:flex">
          <a className="whitespace-nowrap" href="#media-title">
            Media
          </a>
          <a className="whitespace-nowrap" href="#services-title">
            Services
          </a>
          <a className="whitespace-nowrap" href="#about-title">
            About
          </a>
          <a className="whitespace-nowrap" href="#booking-title">
            Contact
          </a>
        </nav>
        <Link
          className="justify-self-end rounded-lg border border-line-strong px-[11px] py-[9px] text-[0.86rem] font-bold whitespace-nowrap text-ink md:px-3.5 md:py-2.5 md:text-[0.92rem]"
          href="/"
        >
          New draft
        </Link>
      </header>

      <section
        className="grid gap-[30px] bg-[linear-gradient(90deg,rgb(255_248_245/0.86),rgb(246_231_222/0.58))] px-pad pt-[34px] pb-12 lg:min-h-[calc(100svh-68px)] lg:grid-cols-[minmax(0,0.88fr)_minmax(360px,1.12fr)] lg:items-center lg:gap-[clamp(34px,6vw,92px)] lg:pt-12 lg:pb-[42px]"
        aria-labelledby="hero-title"
      >
        <div className="max-w-[680px]">
          <p className={eyebrow}>Backup image-led draft</p>
          <h1
            id="hero-title"
            className="max-w-[9ch] text-[clamp(3.4rem,17vw,7rem)] leading-[0.9] lg:leading-[0.86]"
          >
            Glamour Studio
          </h1>
          <p className="mt-[26px] max-w-[38rem] text-[1.05rem] leading-[1.65] text-muted md:text-[1.18rem]">
            A soft, local salon draft for Radovish, ready for real media and
            owner-approved Macedonian copy.
          </p>

          <div
            className="mt-[34px] grid gap-2 text-[0.95rem] font-bold text-accent-deep sm:flex sm:flex-wrap sm:gap-0 sm:divide-x sm:divide-line-strong"
            aria-label="Launch details pending"
          >
            <span className="sm:px-4 sm:first:pl-0">Media pending</span>
            <span className="sm:px-4 sm:first:pl-0">Contact pending</span>
            <span className="sm:px-4 sm:first:pl-0">Booking not live</span>
          </div>
        </div>

        <div className="grid gap-3 lg:min-h-[520px] lg:grid-rows-[minmax(0,1fr)_auto] lg:self-stretch">
          <div
            className="relative aspect-[4/5] min-h-[315px] overflow-hidden rounded-lg border border-line bg-surface-muted bg-[linear-gradient(135deg,rgb(241_213_200/0.48),rgb(255_248_245/0.72))] sm:min-h-[360px] lg:aspect-auto lg:min-h-0"
            aria-label="Hero media placeholder"
          >
            <Image
              className="object-cover opacity-75 saturate-[0.9] sepia-[0.04]"
              src={mediaSlots[0].currentSrc}
              alt={mediaSlots[0].currentAlt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_248_245/0.02),rgb(52_36_31/0.42)),linear-gradient(90deg,rgb(52_36_31/0.28),transparent_45%)]"
              aria-hidden="true"
            />
            <div className="absolute inset-x-3.5 bottom-3.5 z-[1] rounded-lg border border-surface/50 bg-ink/60 p-[18px] backdrop-blur-md sm:right-5 sm:bottom-5 sm:left-auto sm:max-w-[330px]">
              <strong className="block text-[0.95rem] text-surface">
                {mediaSlots[0].status}
              </strong>
              <p className="m-0 mt-2 text-[0.98rem] leading-[1.5] text-surface">
                {mediaSlots[0].detail}
              </p>
            </div>
          </div>
          <p className="m-0 text-[0.92rem] text-muted">
            Slot for real hero video and poster.
          </p>
        </div>
      </section>

      <section
        className="bg-surface-muted px-pad pt-[78px] pb-[84px] md:py-[104px]"
        aria-labelledby="media-title"
      >
        <div className="max-w-[780px]">
          <p className={eyebrow}>Studio sequence</p>
          <h2 id="media-title" className={sectionH2}>
            Media placeholders with a calmer rhythm.
          </h2>
          <p className={sectionCopy}>
            The page should eventually be led by real salon atmosphere. Until
            then, every image position stays visibly temporary and replaceable.
          </p>
        </div>

        <div className="mt-[50px] grid gap-[18px] md:grid-cols-2">
          {mediaSlots.slice(1).map((slot, index) => {
            const isWide = index === 0 || index === 3;
            return (
              <article
                className={`grid grid-cols-1 border-t border-line bg-surface/45 even:ml-auto even:w-[88%] md:col-span-2 md:min-h-[390px] md:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] md:even:ml-0 md:even:w-auto ${
                  isWide
                    ? "xl:grid-cols-[minmax(0,0.98fr)_minmax(260px,0.72fr)]"
                    : "xl:col-span-1 xl:grid-cols-1 xl:min-h-[310px]"
                }`}
                key={slot.title}
                aria-label={`${slot.title}. ${slot.status}. Target: ${slot.target}.`}
              >
                <div
                  className={`relative aspect-[4/3] min-h-[260px] overflow-hidden rounded-lg bg-[linear-gradient(135deg,rgb(216_166_166/0.22),transparent_56%),linear-gradient(180deg,var(--color-surface),var(--color-peach))] md:aspect-auto md:min-h-[300px] ${
                    slot.currentSrc
                      ? ""
                      : "grid place-items-center border border-line"
                  }`}
                >
                  {slot.currentSrc ? (
                    <>
                      <Image
                        className="object-cover"
                        src={slot.currentSrc}
                        alt={slot.currentAlt}
                        fill
                        sizes="(max-width: 900px) 100vw, 42vw"
                      />
                      <div
                        className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgb(52_36_31/0.28))]"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <span
                      className="max-w-[12rem] text-center font-display text-[2rem] font-bold leading-none text-accent"
                      aria-hidden="true"
                    >
                      {slot.role}
                    </span>
                  )}
                </div>
                <div className="self-end py-[clamp(22px,4vw,40px)] md:px-[clamp(22px,4vw,40px)]">
                  <p className={eyebrow}>{slot.role}</p>
                  <h3 className="mt-2 text-[1.65rem] leading-[1.05] md:text-[2rem]">
                    {slot.title}
                  </h3>
                  <p className="m-0 mt-4 leading-[1.6] text-muted">
                    {slot.detail}
                  </p>
                  <dl className="mt-[26px] grid gap-3">
                    <div className="grid grid-cols-1 gap-1 border-t border-line pt-3 sm:grid-cols-[82px_minmax(0,1fr)] sm:gap-4">
                      <dt className="m-0 font-extrabold leading-[1.45] text-accent">
                        Target
                      </dt>
                      <dd className="m-0 leading-[1.45] text-ink">
                        {slot.target}
                      </dd>
                    </div>
                    <div className="grid grid-cols-1 gap-1 border-t border-line pt-3 sm:grid-cols-[82px_minmax(0,1fr)] sm:gap-4">
                      <dt className="m-0 font-extrabold leading-[1.45] text-accent">
                        Status
                      </dt>
                      <dd className="m-0 leading-[1.45] text-ink">
                        {slot.status}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="bg-surface px-pad pt-[78px] pb-[84px] md:py-[104px]"
        aria-labelledby="services-title"
      >
        <div className="max-w-[720px]">
          <p className={eyebrow}>Service index</p>
          <h2 id="services-title" className={sectionH2}>
            Draft categories, clear boundaries.
          </h2>
          <p className={sectionCopy}>
            Haircuts, hairstyling, and makeup are useful placeholders for
            structure. Launch copy should replace them only after the owner
            confirms the service list.
          </p>
        </div>

        <div className="mt-12 max-w-[1120px] border-t border-line-strong">
          {services.map((service) => (
            <article
              className="grid grid-cols-[54px_minmax(0,1fr)] items-start gap-3 border-b border-line py-[26px] even:pl-8 md:even:pl-0 lg:grid-cols-[72px_minmax(220px,0.82fr)_minmax(260px,1fr)] lg:gap-[clamp(20px,4vw,56px)] lg:py-[30px]"
              key={service.name}
            >
              <span className="font-display text-[2rem] font-bold leading-none text-accent">
                {service.number}
              </span>
              <div>
                <h3 className="text-[1.65rem] leading-[1.05] md:text-[2rem]">
                  {service.name}
                </h3>
                <p className="m-0 mt-3 leading-[1.6] text-muted">
                  {service.summary}
                </p>
              </div>
              <p className="col-start-2 m-0 mt-1 leading-[1.6] text-muted lg:col-auto">
                {service.pending}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="grid grid-cols-1 items-start gap-[clamp(42px,8vw,106px)] bg-[linear-gradient(180deg,var(--color-surface-muted),var(--color-surface))] px-pad pt-[78px] pb-[164px] lg:grid-cols-[minmax(0,0.52fr)_minmax(320px,0.48fr)] lg:py-[104px]"
        aria-labelledby="about-title"
      >
        <div>
          <p className={eyebrow}>Local salon draft</p>
          <h2
            id="about-title"
            className="max-w-[9ch] text-[clamp(2.35rem,7.5vw,4.8rem)] leading-[0.96]"
          >
            A calm place to prepare.
          </h2>
          <p className={sectionCopy}>
            This page should be shaped by the actual studio: its light, real
            service moments, final Macedonian wording, and the contact path the
            owner wants clients to use.
          </p>
          <p className="mt-[58px] font-display text-[1.72rem] font-bold text-ink lg:mt-[118px] lg:text-[2.1rem]">
            Glamour Studio
          </p>
        </div>

        <div
          className="ml-auto w-[92%] rounded-lg border border-line bg-surface/80 p-[clamp(24px,4vw,42px)] lg:ml-0 lg:w-auto"
          aria-labelledby="booking-title"
        >
          <p className={eyebrow}>Contact and booking</p>
          <h2
            id="booking-title"
            className="max-w-[9ch] text-[clamp(2.35rem,7.5vw,4.8rem)] leading-[0.96]"
          >
            Not live yet.
          </h2>
          <p className={sectionCopy}>
            This draft does not collect visitor details or confirm appointments.
            Add the owner-approved contact channel before launch.
          </p>

          <ul className="m-0 mt-[30px] grid list-none gap-3 p-0">
            {pendingDetails.map((item) => (
              <li
                className="border-t border-line pt-3 leading-[1.5] text-ink"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <aside
        className="fixed inset-x-pad bottom-3 z-10 flex items-center justify-between gap-3 rounded-lg border border-ink/25 bg-ink/95 py-2 pr-2 pl-4 text-surface shadow-[0_18px_50px_rgb(52_36_31/0.18)] backdrop-blur-md sm:bottom-4 sm:gap-4 sm:py-[11px] sm:pr-3 sm:pl-[18px]"
        aria-label="Contact status"
      >
        <span className="text-[0.92rem] font-extrabold sm:text-base">
          Contact details pending
        </span>
        <a
          className="rounded-lg bg-surface px-3 py-2 text-[0.92rem] font-extrabold whitespace-nowrap text-ink sm:px-3.5 sm:py-2.5 sm:text-base"
          href="#booking-title"
        >
          View status
        </a>
      </aside>
    </main>
  );
}
