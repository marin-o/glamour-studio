import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Lookbook Plan | Glamour Studio",
  description:
    "A media-focused Glamour Studio lookbook planning route with placeholder slots clearly marked until owner-approved salon media exists.",
};

const mediaSlots = [
  {
    key: "hero-video",
    label: "Hero / video",
    title: "Hair movement opener",
    status: "Temporary poster placeholder",
    target: "Owner-approved hero video and static poster",
    description:
      "This lead slot is reserved for real hair movement filmed in or around Glamour Studio. The current image is a planning placeholder only.",
    src: "/media/salon-hero-placeholder.png",
    alt: "Temporary salon hero placeholder for a future owner-approved video poster.",
  },
  {
    key: "hair-texture",
    label: "Hair texture",
    title: "Finish and movement",
    status: "Temporary image placeholder",
    target: "Close detail of hair finish, movement, or styling",
    description:
      "Use this position for a close, salon-approved detail that feels specific to the real work rather than generic beauty stock.",
    src: "/media/salon-hair-texture-placeholder.png",
    alt: "Temporary close hair texture placeholder.",
  },
  {
    key: "interior",
    label: "Studio interior",
    title: "Warm studio detail",
    status: "Temporary image placeholder",
    target: "Real interior materials, light, or a calm studio corner",
    description:
      "The final image should help visitors recognize the real salon atmosphere and local setting.",
    src: "/media/salon-interior-detail-placeholder.png",
    alt: "Temporary salon interior detail placeholder.",
  },
  {
    key: "process",
    label: "Service process",
    title: "Tools, prep, and care",
    status: "Real media pending",
    target: "Approved tools, color, prep, or service moment",
    description:
      "No process photo exists yet. Keep this as a named production need until the owner approves a real service image.",
    src: null,
    alt: "",
  },
  {
    key: "wide",
    label: "Wide studio moment",
    title: "Signature room frame",
    status: "Real media pending",
    target: "Wide salon image that makes the studio feel present",
    description:
      "This should become the strongest environmental frame after real studio photography exists.",
    src: null,
    alt: "",
  },
];

const productionNotes = [
  "Use only real Glamour Studio media or temporary assets that are clearly labeled.",
  "Do not show faces, staff, or clients without owner approval and permission.",
  "Keep final photos lightweight enough for mobile and paired with meaningful alt text.",
  "Treat this route as a comparison and planning endpoint, not the finished homepage.",
];

const pendingFacts = [
  "Confirmed contact channel",
  "Address and map details",
  "Opening hours",
  "Final prices and service details",
  "Live booking destination",
];

const kicker = "m-0 text-[0.84rem] font-extrabold text-accent";
const sectionH2 =
  "max-w-[13ch] text-[clamp(2.4rem,7vw,7.4rem)] leading-[0.94] md:leading-[0.92]";
const longCopy =
  "mt-7 max-w-[620px] text-[clamp(1.06rem,1.4vw,1.22rem)] leading-[1.72]";
const offsetList =
  "m-0 ml-auto grid w-[88%] max-w-[34rem] list-none p-0 lg:ml-0 lg:w-auto lg:max-w-none";

export default function LookbookPlan() {
  const heroSlot = mediaSlots[0];
  const supportingSlots = mediaSlots.slice(1);

  return (
    <main className="min-h-dvh overflow-x-clip bg-[linear-gradient(180deg,var(--color-surface),var(--color-surface-muted)_44%,var(--color-surface))] pb-[154px] sm:pb-[104px]">
      <header
        className="sticky top-0 z-20 grid min-h-16 grid-cols-[1fr_auto] items-center gap-3 border-b border-line bg-surface/90 px-pad py-3 backdrop-blur-2xl md:min-h-[68px] md:grid-cols-[minmax(160px,1fr)_auto_minmax(120px,1fr)] md:gap-[22px]"
        aria-label="Lookbook navigation"
      >
        <Link
          className="justify-self-start font-display text-[1.12rem] font-bold md:text-[1.22rem]"
          href="/"
        >
          Glamour Studio
        </Link>
        <nav className="hidden items-center justify-center gap-7 text-[0.95rem] text-muted md:flex">
          <a className="whitespace-nowrap" href="#lookbook-slots">
            Media slots
          </a>
          <a className="whitespace-nowrap" href="#lookbook-notes">
            Production notes
          </a>
          <a className="whitespace-nowrap" href="#lookbook-status">
            Status
          </a>
        </nav>
        <Link
          className="justify-self-end rounded-lg border border-line-strong px-[11px] py-[9px] text-[0.86rem] font-extrabold whitespace-nowrap md:px-3.5 md:py-2.5 md:text-base"
          href="/"
        >
          Homepage
        </Link>
      </header>

      <section
        className="grid gap-[30px] border-b border-line px-pad pt-[78px] pb-[84px] lg:min-h-[calc(100svh-68px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1.1fr)] lg:items-center lg:gap-[clamp(34px,7vw,96px)] lg:pt-[52px] lg:pb-16"
        aria-labelledby="lookbook-title"
      >
        <div className="max-w-[720px]">
          <p className={`${kicker} mb-3.5`}>Media lookbook plan</p>
          <h1
            id="lookbook-title"
            className="max-w-[10ch] text-[clamp(2.7rem,10vw,9.4rem)] leading-[0.94] text-accent-deep lg:leading-[0.88]"
          >
            A place for real salon atmosphere.
          </h1>
          <p className={`${longCopy} text-muted`}>
            This endpoint separates future photography, video rhythm, and
            production notes from the typography-led homepage. It stays
            unfinished on purpose until owner-approved Glamour Studio media
            exists.
          </p>
          <div
            className="mt-[34px] flex flex-wrap gap-3"
            aria-label="Route options"
          >
            <Link
              className="rounded-lg border border-line-strong bg-accent-deep px-3.5 py-[11px] font-extrabold text-surface"
              href="/"
            >
              Back to typography-led homepage
            </Link>
            <Link
              className="rounded-lg border border-line-strong px-3.5 py-[11px] font-extrabold"
              href="/old"
            >
              View previous image-led backup
            </Link>
          </div>
        </div>

        <figure className="m-0 lg:min-h-[520px] lg:self-stretch">
          <div className="relative aspect-[4/5] min-h-[315px] overflow-hidden rounded-lg border border-line bg-surface-muted bg-[linear-gradient(135deg,rgb(216_166_166/0.22),rgb(241_213_200/0.42))] sm:min-h-[360px] lg:aspect-auto lg:min-h-full">
            <Image
              className="object-cover opacity-[0.78] saturate-[0.92] sepia-[0.04]"
              src={heroSlot.src}
              alt={heroSlot.alt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgb(52_36_31/0.46)),linear-gradient(90deg,rgb(52_36_31/0.24),transparent_48%)]"
              aria-hidden="true"
            />
            <figcaption className="absolute inset-x-3.5 bottom-3.5 z-[1] grid gap-1.5 rounded-lg border border-surface/45 bg-ink/65 p-4 text-surface backdrop-blur-md sm:inset-x-5 sm:bottom-5 lg:left-auto lg:max-w-[440px]">
              <strong className="text-surface">{heroSlot.status}</strong>
              <span className="text-surface">{heroSlot.target}</span>
            </figcaption>
          </div>
        </figure>
      </section>

      <section
        className="bg-surface-muted px-pad pt-[78px] pb-[84px] md:py-24"
        id="lookbook-slots"
        aria-labelledby="lookbook-slots-title"
      >
        <div className="grid gap-5 md:grid-cols-[minmax(160px,0.32fr)_minmax(0,0.68fr)] md:items-start md:gap-[clamp(24px,6vw,88px)]">
          <p className={kicker}>Slot inventory</p>
          <h2 id="lookbook-slots-title" className={sectionH2}>
            Named media needs, not fake portfolio claims.
          </h2>
        </div>

        <div className="mt-10 grid gap-[18px] md:mt-[58px] lg:grid-cols-2">
          {supportingSlots.map((slot, index) => {
            const spansTwo =
              index === 0 || index === supportingSlots.length - 1;
            return (
              <article
                className={`grid border-t border-line bg-surface/50 even:ml-auto even:w-[calc(100%-18px)] lg:min-h-[620px] lg:grid-rows-[minmax(320px,0.82fr)_auto] lg:even:ml-0 lg:even:w-auto ${
                  spansTwo
                    ? "lg:col-span-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.72fr)] lg:grid-rows-none"
                    : ""
                }`}
                key={slot.key}
              >
                <div className="relative aspect-[4/3] min-h-[250px] overflow-hidden rounded-lg bg-[linear-gradient(135deg,rgb(216_166_166/0.22),transparent_58%),linear-gradient(180deg,var(--color-surface),var(--color-peach))] lg:aspect-auto lg:min-h-full">
                  {slot.src ? (
                    <>
                      <Image
                        className="object-cover opacity-[0.78] saturate-[0.92] sepia-[0.04]"
                        src={slot.src}
                        alt={slot.alt}
                        fill
                        sizes="(max-width: 900px) 100vw, 44vw"
                      />
                      <div
                        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_46%,rgb(52_36_31/0.26))]"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <div
                      className="grid h-full w-full min-h-[250px] place-items-center border border-line text-center font-display text-[clamp(2rem,5vw,4.4rem)] font-bold leading-[0.95] text-accent lg:min-h-[320px]"
                      aria-hidden="true"
                    >
                      {slot.label}
                    </div>
                  )}
                </div>
                <div className="self-end py-[clamp(22px,4vw,42px)] lg:px-[clamp(22px,4vw,42px)]">
                  <p className={kicker}>{slot.label}</p>
                  <h3 className="mt-2 text-[clamp(2rem,4vw,4.2rem)] leading-[0.95]">
                    {slot.title}
                  </h3>
                  <p className="m-0 mt-[18px] leading-[1.64] text-muted">
                    {slot.description}
                  </p>
                  <dl className="mt-7 grid gap-3">
                    <div className="grid grid-cols-1 gap-1 border-t border-line pt-3 sm:grid-cols-[82px_minmax(0,1fr)] sm:gap-4">
                      <dt className="m-0 font-extrabold leading-[1.45] text-accent">
                        Status
                      </dt>
                      <dd className="m-0 leading-[1.45] text-ink">
                        {slot.status}
                      </dd>
                    </div>
                    <div className="grid grid-cols-1 gap-1 border-t border-line pt-3 sm:grid-cols-[82px_minmax(0,1fr)] sm:gap-4">
                      <dt className="m-0 font-extrabold leading-[1.45] text-accent">
                        Target
                      </dt>
                      <dd className="m-0 leading-[1.45] text-ink">
                        {slot.target}
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
        className="grid gap-8 border-y border-line bg-surface px-pad pt-[78px] pb-[84px] lg:grid-cols-[minmax(0,0.52fr)_minmax(300px,0.48fr)] lg:gap-[clamp(32px,7vw,96px)] lg:py-24"
        id="lookbook-notes"
        aria-labelledby="lookbook-notes-title"
      >
        <div>
          <p className={kicker}>Production notes</p>
          <h2 id="lookbook-notes-title" className={`${sectionH2} mt-4`}>
            The route waits for the real studio.
          </h2>
        </div>
        <ol className={offsetList}>
          {productionNotes.map((note) => (
            <li
              className="border-t border-line py-[18px] text-[1.06rem] leading-[1.55] text-ink first:border-t-line-strong"
              key={note}
            >
              {note}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="grid items-start gap-8 bg-accent-deep px-pad pt-[78px] pb-[164px] lg:grid-cols-[minmax(0,0.52fr)_minmax(280px,0.48fr)] lg:gap-[clamp(32px,7vw,96px)] lg:py-24"
        id="lookbook-status"
        aria-labelledby="lookbook-status-title"
      >
        <div>
          <p className="m-0 text-[0.84rem] font-extrabold text-surface">
            Contact and booking
          </p>
          <h2
            id="lookbook-status-title"
            className={`${sectionH2} mt-4 text-surface`}
          >
            Still not live booking.
          </h2>
          <p className={`${longCopy} text-surface`}>
            This page does not collect visitor details, does not confirm
            appointments, and does not publish real business facts before the
            owner provides them.
          </p>
        </div>
        <ul className={offsetList}>
          {pendingFacts.map((fact) => (
            <li
              className="border-t border-t-surface/25 py-[18px] text-[1.06rem] leading-[1.55] text-surface first:border-t-surface/50"
              key={fact}
            >
              {fact} pending
            </li>
          ))}
        </ul>
      </section>

      <aside
        className="fixed inset-x-pad bottom-3 z-10 flex flex-col gap-2.5 rounded-lg border border-ink/20 bg-ink/95 p-3 text-center text-surface shadow-[0_18px_50px_rgb(52_36_31/0.18)] sm:bottom-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-[11px] sm:pr-3 sm:pl-[18px] sm:text-left"
        aria-label="Lookbook status"
      >
        <span className="font-extrabold">Lookbook media pending</span>
        <a
          className="rounded-lg bg-surface px-3.5 py-2.5 font-extrabold whitespace-nowrap text-ink"
          href="#lookbook-status"
        >
          View status
        </a>
      </aside>
    </main>
  );
}
