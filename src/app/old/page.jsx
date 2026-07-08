import Image from "next/image";

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

export default function OldDraft() {
  return (
    <main className="site-shell">
      <header className="site-nav" aria-label="Old draft navigation">
        <a className="site-mark" href="/">
          Glamour Studio
        </a>
        <nav>
          <a href="#media-title">Media</a>
          <a href="#services-title">Services</a>
          <a href="#about-title">About</a>
          <a href="#booking-title">Contact</a>
        </nav>
        <a className="nav-action" href="/">
          New draft
        </a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Backup image-led draft</p>
          <h1 id="hero-title">Glamour Studio</h1>
          <p className="hero-subtitle">
            A soft, local salon draft for Radovish, ready for real media and
            owner-approved Macedonian copy.
          </p>

          <div className="hero-status" aria-label="Launch details pending">
            <span>Media pending</span>
            <span>Contact pending</span>
            <span>Booking not live</span>
          </div>
        </div>

        <div className="hero-media-block">
          <div className="media-hero" aria-label="Hero media placeholder">
            <Image
              src={mediaSlots[0].currentSrc}
              alt={mediaSlots[0].currentAlt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
            />
            <div className="media-note">
              <strong>{mediaSlots[0].status}</strong>
              <p>{mediaSlots[0].detail}</p>
            </div>
          </div>
          <p className="hero-caption">Slot for real hero video and poster.</p>
        </div>
      </section>

      <section className="media-section" aria-labelledby="media-title">
        <div className="section-heading">
          <p className="eyebrow">Studio sequence</p>
          <h2 id="media-title">Media placeholders with a calmer rhythm.</h2>
          <p>
            The page should eventually be led by real salon atmosphere. Until
            then, every image position stays visibly temporary and replaceable.
          </p>
        </div>

        <div className="media-sequence">
          {mediaSlots.slice(1).map((slot, index) => (
            <article
              className={`media-panel panel-${index + 1} ${
                slot.currentSrc ? "has-media" : "is-empty"
              }`}
              key={slot.title}
              aria-label={`${slot.title}. ${slot.status}. Target: ${slot.target}.`}
            >
              <div className="media-panel-visual">
                {slot.currentSrc ? (
                  <Image
                    src={slot.currentSrc}
                    alt={slot.currentAlt}
                    fill
                    sizes="(max-width: 900px) 100vw, 42vw"
                  />
                ) : (
                  <span aria-hidden="true">{slot.role}</span>
                )}
              </div>
              <div className="media-panel-copy">
                <p className="eyebrow">{slot.role}</p>
                <h3>{slot.title}</h3>
                <p>{slot.detail}</p>
                <dl>
                  <div>
                    <dt>Target</dt>
                    <dd>{slot.target}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{slot.status}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="services-section" aria-labelledby="services-title">
        <div className="section-heading compact">
          <p className="eyebrow">Service index</p>
          <h2 id="services-title">Draft categories, clear boundaries.</h2>
          <p>
            Haircuts, hairstyling, and makeup are useful placeholders for
            structure. Launch copy should replace them only after the owner
            confirms the service list.
          </p>
        </div>

        <div className="service-index">
          {services.map((service) => (
            <article className="service-row" key={service.name}>
              <span className="service-number">{service.number}</span>
              <div>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
              </div>
              <p className="service-pending">{service.pending}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-contact" aria-labelledby="about-title">
        <div className="about-copy">
          <p className="eyebrow">Local salon draft</p>
          <h2 id="about-title">A calm place to prepare.</h2>
          <p>
            This page should be shaped by the actual studio: its light, real
            service moments, final Macedonian wording, and the contact path the
            owner wants clients to use.
          </p>
          <p className="footer-name">Glamour Studio</p>
        </div>

        <div className="contact-status" aria-labelledby="booking-title">
          <p className="eyebrow">Contact and booking</p>
          <h2 id="booking-title">Not live yet.</h2>
          <p>
            This draft does not collect visitor details or confirm appointments.
            Add the owner-approved contact channel before launch.
          </p>

          <ul className="pending-list">
            {pendingDetails.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <aside className="bottom-cta" aria-label="Contact status">
        <span>Contact details pending</span>
        <a href="#booking-title">View status</a>
      </aside>
    </main>
  );
}
