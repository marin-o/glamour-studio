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

export default function LookbookPlan() {
  const heroSlot = mediaSlots[0];
  const supportingSlots = mediaSlots.slice(1);

  return (
    <main className="lookbook-page">
      <header className="lookbook-nav" aria-label="Lookbook navigation">
        <Link className="lookbook-brand" href="/">
          Glamour Studio
        </Link>
        <nav>
          <a href="#lookbook-slots">Media slots</a>
          <a href="#lookbook-notes">Production notes</a>
          <a href="#lookbook-status">Status</a>
        </nav>
        <Link className="lookbook-nav-action" href="/">
          Homepage
        </Link>
      </header>

      <section className="lookbook-hero" aria-labelledby="lookbook-title">
        <div className="lookbook-hero-copy">
          <p className="lookbook-kicker">Media lookbook plan</p>
          <h1 id="lookbook-title">A place for real salon atmosphere.</h1>
          <p>
            This endpoint separates future photography, video rhythm, and
            production notes from the typography-led homepage. It stays
            unfinished on purpose until owner-approved Glamour Studio media
            exists.
          </p>
          <div className="lookbook-hero-links" aria-label="Route options">
            <Link href="/">Back to typography-led homepage</Link>
            <Link href="/old">View previous image-led backup</Link>
          </div>
        </div>

        <figure className="lookbook-feature">
          <div className="lookbook-feature-media">
            <Image
              src={heroSlot.src}
              alt={heroSlot.alt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
            />
            <figcaption>
              <strong>{heroSlot.status}</strong>
              <span>{heroSlot.target}</span>
            </figcaption>
          </div>
        </figure>
      </section>

      <section
        className="lookbook-slots"
        id="lookbook-slots"
        aria-labelledby="lookbook-slots-title"
      >
        <div className="lookbook-section-heading">
          <p className="lookbook-kicker">Slot inventory</p>
          <h2 id="lookbook-slots-title">Named media needs, not fake portfolio claims.</h2>
        </div>

        <div className="lookbook-grid">
          {supportingSlots.map((slot) => (
            <article className="lookbook-card" key={slot.key}>
              <div className="lookbook-card-media">
                {slot.src ? (
                  <Image
                    src={slot.src}
                    alt={slot.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 44vw"
                  />
                ) : (
                  <div className="lookbook-empty-slot" aria-hidden="true">
                    {slot.label}
                  </div>
                )}
              </div>
              <div className="lookbook-card-copy">
                <p className="lookbook-kicker">{slot.label}</p>
                <h3>{slot.title}</h3>
                <p>{slot.description}</p>
                <dl>
                  <div>
                    <dt>Status</dt>
                    <dd>{slot.status}</dd>
                  </div>
                  <div>
                    <dt>Target</dt>
                    <dd>{slot.target}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="lookbook-notes"
        id="lookbook-notes"
        aria-labelledby="lookbook-notes-title"
      >
        <div>
          <p className="lookbook-kicker">Production notes</p>
          <h2 id="lookbook-notes-title">The route waits for the real studio.</h2>
        </div>
        <ol>
          {productionNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ol>
      </section>

      <section
        className="lookbook-status"
        id="lookbook-status"
        aria-labelledby="lookbook-status-title"
      >
        <div className="lookbook-status-copy">
          <p className="lookbook-kicker">Contact and booking</p>
          <h2 id="lookbook-status-title">Still not live booking.</h2>
          <p>
            This page does not collect visitor details, does not confirm
            appointments, and does not publish real business facts before the
            owner provides them.
          </p>
        </div>
        <ul className="lookbook-pending-list">
          {pendingFacts.map((fact) => (
            <li key={fact}>{fact} pending</li>
          ))}
        </ul>
      </section>

      <aside className="lookbook-bottom-cta" aria-label="Lookbook status">
        <span>Lookbook media pending</span>
        <a href="#lookbook-status">View status</a>
      </aside>
    </main>
  );
}
