import Link from "next/link";

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

const productionNeeds = [
  "Hero hair-movement video or poster from the real studio",
  "Interior detail photos with owner approval",
  "Final Macedonian copy and later English translation",
  "Confirmed contact channel, address, hours, and booking destination",
];

const statusItems = [
  "No visitor details are collected here.",
  "No appointment is confirmed by this draft.",
  "No real prices, hours, address, or staff claims are shown yet.",
];

const kicker = "m-0 text-[0.88rem] leading-[1.35] font-extrabold text-accent";
const bodyCopy =
  "m-0 text-[clamp(1.08rem,1.45vw,1.32rem)] leading-[1.72] text-muted";
const sectionH2 =
  "max-w-[12ch] text-balance text-[clamp(2.7rem,8vw,8.5rem)] leading-[0.94] md:max-w-[13ch] md:leading-[0.9]";
const listReset = "m-0 grid list-none p-0";
const offsetList =
  "ml-auto w-[80%] max-w-[34rem] md:ml-0 md:w-auto md:max-w-none";

export default function TypographySalonPage({
  eyebrow = "Typography-led homepage",
  homeHref = "/old",
  homeLabel = "Old draft",
}) {
  return (
    <main className="min-h-dvh overflow-x-clip bg-surface pb-[154px] sm:pb-[104px]">
      <header
        className="flex min-h-[68px] flex-col items-start gap-3 border-b border-line bg-surface px-pad py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        aria-label="Typography-led navigation"
      >
        <Link
          className="font-display text-[1.22rem] font-bold"
          href={homeHref}
        >
          {homeLabel}
        </Link>
        <nav className="flex flex-wrap gap-x-3.5 gap-y-1 text-[0.95rem] text-muted sm:justify-end sm:gap-x-[22px]">
          <a href="#type-services">Services</a>
          <a href="#type-production">Media needs</a>
          <a href="#type-contact">Contact status</a>
        </nav>
      </header>

      <section
        className="grid content-start gap-9 border-b border-line-strong px-pad pt-[70px] pb-[84px] md:min-h-[calc(100svh-68px)] md:content-between md:gap-12 md:py-24"
        aria-labelledby="type-title"
      >
        <p className={kicker}>{eyebrow}</p>
        <h1
          id="type-title"
          className="mt-4 text-[clamp(3.7rem,18vw,17.5rem)] leading-[0.82] tracking-[-0.01em] text-accent-deep md:mt-8 md:leading-[0.74]"
        >
          Glamour
          <span className="block text-right text-ink md:pl-[0.55em] md:text-left">
            Studio
          </span>
        </h1>
        <div className="grid gap-7 border-t border-line pt-7 md:ml-auto md:w-full md:max-w-[1120px] md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-[clamp(28px,7vw,110px)]">
          <p className={`${bodyCopy} max-w-[34rem]`}>
            A quieter salon direction where the first impression comes from
            type, spacing, and warm editorial rhythm instead of placeholder
            imagery or decorative card systems.
          </p>
          <p
            className={`${bodyCopy} ml-auto w-[78%] max-w-[26rem] border-t-2 border-blush pt-4 md:ml-0 md:w-auto md:max-w-none md:border-t-0 md:pt-0`}
          >
            This is still a draft for Radovish. Real media, final Macedonian
            copy, contact details, prices, hours, address, and booking behavior
            remain owner decisions.
          </p>
        </div>
      </section>

      <section
        className="bg-surface-warm px-pad pt-[70px] pb-[84px] md:py-24"
        aria-labelledby="type-services"
      >
        <div className="grid gap-5 md:grid-cols-[minmax(160px,0.32fr)_minmax(0,0.68fr)] md:items-start md:gap-[clamp(24px,6vw,88px)]">
          <p className={kicker}>Service index</p>
          <h2 id="type-services" className={sectionH2}>
            Draft categories, set like an editorial list.
          </h2>
        </div>

        <div className="mt-10 border-t border-line-strong md:mt-16">
          {serviceRows.map((service) => (
            <article
              className="grid gap-2.5 border-b border-line py-[26px] even:justify-items-end even:text-right md:grid-cols-[78px_minmax(180px,0.42fr)_minmax(0,0.58fr)] md:items-baseline md:gap-[clamp(18px,5vw,72px)] md:py-[30px] md:even:justify-items-start md:even:text-left"
              key={service.name}
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
            </article>
          ))}
        </div>
      </section>

      <section
        className="grid gap-8 border-y border-line bg-surface px-pad pt-[70px] pb-[84px] md:grid-cols-[minmax(0,0.55fr)_minmax(280px,0.45fr)] md:gap-[clamp(32px,7vw,96px)] md:py-24"
        aria-labelledby="type-production"
      >
        <div className="text-right md:text-left">
          <p className={kicker}>Production brief</p>
          <h2 id="type-production" className={`${sectionH2} mt-4 ml-auto md:ml-0`}>
            Media is named, not faked.
          </h2>
        </div>
        <ol className={listReset}>
          {productionNeeds.map((item) => (
            <li
              className="border-t border-line py-[18px] text-[1.08rem] leading-[1.55] text-ink first:border-t-line-strong"
              key={item}
            >
              {item}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="mx-auto w-full max-w-[1180px] px-pad pt-[70px] pb-[84px] md:py-24"
        aria-labelledby="type-about"
      >
        <p className={kicker}>Tone test</p>
        <h2
          id="type-about"
          className="mt-5 max-w-[12ch] text-balance text-[clamp(2.7rem,8vw,8.5rem)] leading-[0.94] md:max-w-[15ch] md:leading-[0.9]"
        >
          Soft, local, practical, unfinished on purpose.
        </h2>
        <p
          className={`${bodyCopy} mt-7 ml-auto w-[78%] max-w-[32rem] border-t-2 border-blush pt-4 md:mt-[34px] md:w-auto md:max-w-[720px] md:border-t-0 md:pt-0`}
        >
          This direction keeps the salon presence calm and legible while making
          the unfinished parts explicit. It can later absorb real Macedonian
          copy and real studio media without depending on generic beauty imagery
          now.
        </p>
      </section>

      <section
        className="grid gap-8 bg-accent-deep px-pad pt-[70px] pb-[164px] md:grid-cols-[minmax(0,0.52fr)_minmax(280px,0.48fr)] md:gap-[clamp(32px,7vw,96px)] md:py-24"
        aria-labelledby="type-contact"
      >
        <div>
          <p className="m-0 text-[0.88rem] leading-[1.35] font-extrabold text-surface">
            Contact and booking
          </p>
          <h2 id="type-contact" className={`${sectionH2} mt-4 text-surface`}>
            Not live yet.
          </h2>
        </div>
        <ul className={`${listReset} ${offsetList}`}>
          {statusItems.map((item) => (
            <li
              className="border-t border-t-surface/25 py-[18px] text-[1.08rem] leading-[1.55] text-surface first:border-t-surface/50"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <aside
        className="fixed inset-x-pad bottom-3 z-10 flex items-center justify-between gap-3 rounded-lg border border-ink/20 bg-ink/95 py-2 pr-2 pl-4 text-surface shadow-[0_18px_50px_rgb(52_36_31/0.18)] sm:bottom-4 sm:gap-4 sm:py-[11px] sm:pr-3 sm:pl-[18px]"
        aria-label="Typography-led status"
      >
        <span className="text-[0.92rem] font-extrabold sm:text-base">
          Contact details pending
        </span>
        <a
          className="rounded-lg bg-surface px-3 py-2 text-[0.92rem] font-extrabold whitespace-nowrap text-ink sm:px-3.5 sm:py-2.5 sm:text-base"
          href="#type-contact"
        >
          View status
        </a>
      </aside>
    </main>
  );
}
