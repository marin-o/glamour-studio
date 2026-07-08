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

export default function TypographySalonPage({
  eyebrow = "Typography-led homepage",
  homeHref = "/old",
  homeLabel = "Old draft",
}) {
  return (
    <main className="type-study">
      <header className="type-nav" aria-label="Typography-led navigation">
        <Link className="type-home-link" href={homeHref}>
          {homeLabel}
        </Link>
        <nav>
          <a href="#type-services">Services</a>
          <a href="#type-production">Media needs</a>
          <a href="#type-contact">Contact status</a>
        </nav>
      </header>

      <section className="type-hero" aria-labelledby="type-title">
        <p className="type-kicker">{eyebrow}</p>
        <h1 id="type-title">
          Glamour
          <span>Studio</span>
        </h1>
        <div className="type-hero-grid">
          <p>
            A quieter salon direction where the first impression comes from
            type, spacing, and warm editorial rhythm instead of placeholder
            imagery or decorative card systems.
          </p>
          <p>
            This is still a draft for Radovish. Real media, final Macedonian
            copy, contact details, prices, hours, address, and booking behavior
            remain owner decisions.
          </p>
        </div>
      </section>

      <section className="type-index" aria-labelledby="type-services">
        <div className="type-section-title">
          <p className="type-kicker">Service index</p>
          <h2 id="type-services">Draft categories, set like an editorial list.</h2>
        </div>

        <div className="type-service-list">
          {serviceRows.map((service) => (
            <article className="type-service-row" key={service.name}>
              <span>{service.label}</span>
              <h3>{service.name}</h3>
              <p>{service.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="type-production" aria-labelledby="type-production">
        <div>
          <p className="type-kicker">Production brief</p>
          <h2 id="type-production">Media is named, not faked.</h2>
        </div>
        <ol>
          {productionNeeds.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="type-about" aria-labelledby="type-about">
        <p className="type-kicker">Tone test</p>
        <h2 id="type-about">Soft, local, practical, unfinished on purpose.</h2>
        <p>
          This direction keeps the salon presence calm and legible while making
          the unfinished parts explicit. It can later absorb real Macedonian
          copy and real studio media without depending on generic beauty imagery
          now.
        </p>
      </section>

      <section className="type-contact" aria-labelledby="type-contact">
        <div>
          <p className="type-kicker">Contact and booking</p>
          <h2 id="type-contact">Not live yet.</h2>
        </div>
        <ul>
          {statusItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <aside className="type-bottom-cta" aria-label="Typography-led status">
        <span>Contact details pending</span>
        <a href="#type-contact">View status</a>
      </aside>
    </main>
  );
}
