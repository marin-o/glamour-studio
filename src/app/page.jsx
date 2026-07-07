import Image from "next/image";

const mediaSlots = [
  {
    title: "Hero film",
    status: "Owner media pending",
    detail: "Use the real hero video and poster here once they are approved.",
    currentSrc: "/media/salon-hero-placeholder.png",
    currentAlt: "Temporary soft salon media placeholder.",
    target: "Hero video and static poster",
  },
  {
    title: "Hair texture",
    status: "Owner media pending",
    detail: "Replace with a real close detail of hair movement, finish, or styling.",
    currentSrc: "/media/salon-hair-texture-placeholder.png",
    currentAlt: "Temporary close hair texture placeholder.",
    target: "Hair movement or finish",
  },
  {
    title: "Studio light",
    status: "Owner media pending",
    detail: "Replace with a real interior image from Glamour Studio.",
    currentSrc: "/media/salon-interior-detail-placeholder.png",
    currentAlt: "Temporary salon interior detail placeholder.",
    target: "Salon interior detail",
  },
  {
    title: "Service detail",
    status: "Owner media pending",
    detail: "Hold this slot for owner-approved tools, color, prep, or service imagery.",
    currentSrc: null,
    currentAlt: "",
    target: "Tools, color, or prep",
  },
  {
    title: "Wide studio moment",
    status: "Owner media pending",
    detail: "Hold this for a wide visual that makes the real studio feel present.",
    currentSrc: null,
    currentAlt: "",
    target: "Signature wide image",
  },
];

const services = [
  {
    name: "Haircuts",
    detail: "Draft category. Final service list, durations, and prices are pending.",
  },
  {
    name: "Hairstyling",
    detail: "Draft category. Occasion details and appointment length are pending.",
  },
  {
    name: "Makeup",
    detail: "Draft category. Final scope, products, and prices are pending.",
  },
];

const pendingDetails = [
  "Confirmed phone, Viber, or Instagram contact",
  "Address and map details",
  "Opening hours",
  "Real booking request destination",
];

export default function Home() {
  return (
    <main className="framer-shell">
      <header className="site-nav" aria-label="Primary navigation">
        <a className="site-mark" href="#hero-title">
          Glamour Studio
        </a>
        <nav>
          <a href="#lookbook-title">Lookbook</a>
          <a href="#services-title">Services</a>
          <a href="#about-title">About</a>
          <a href="#booking-title">Contact</a>
        </nav>
        <a className="nav-action" href="#booking-title">
          Contact status
        </a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <p className="overline">Studio Glamour</p>
        <h1 id="hero-title">Glamour Studio</h1>
        <p className="hero-subtitle">A soft salon draft for Radovish.</p>

        <div className="media-hero" aria-label="Hero media placeholder">
          <Image
            src={mediaSlots[0].currentSrc}
            alt={mediaSlots[0].currentAlt}
            fill
            priority
            sizes="100vw"
          />
          <div className="media-note">
            <strong>{mediaSlots[0].status}</strong>
            <p>{mediaSlots[0].detail}</p>
          </div>
        </div>
      </section>

      <section className="lookbook-section" aria-labelledby="lookbook-title">
        <div className="section-heading">
          <h2 id="lookbook-title">Media slots, kept honest.</h2>
          <p>
            The current imagery is temporary. These slots show what should be
            replaced by real salon media before launch.
          </p>
        </div>

        <div className="lookbook-grid">
          {mediaSlots.map((slot, index) => (
            <article
              className={`lookbook-card card-${index + 1} ${
                slot.currentSrc ? "has-media" : ""
              }`}
              key={slot.title}
              aria-label={`${slot.title}. ${slot.status}. Target: ${slot.target}.`}
            >
              {slot.currentSrc ? (
                <Image
                  src={slot.currentSrc}
                  alt={slot.currentAlt}
                  fill
                  sizes="(max-width: 900px) 100vw, 33vw"
                />
              ) : null}
              <div>
                <p className="pending-label">{slot.status}</p>
                <h3>{slot.title}</h3>
                <p>{slot.detail}</p>
                <p className="media-target">{slot.target}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="services-section" aria-labelledby="services-title">
        <div className="center-heading">
          <h2 id="services-title">Services stay provisional.</h2>
          <p>
            Haircuts, hairstyling, and makeup are draft categories for now.
            Prices, detailed descriptions, and staff names remain pending.
          </p>
        </div>

        <div className="service-list">
          {services.map((service) => (
            <article className="service-row" key={service.name}>
              <h3>{service.name}</h3>
              <p>{service.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-booking" aria-labelledby="about-title">
        <div className="about-copy">
          <h2 id="about-title">A calm place to prepare.</h2>
          <p>
            The page should eventually be shaped by the real studio: its light,
            details, owner-approved media, and final Macedonian copy.
          </p>
          <p className="footer-name">Glamour Studio</p>
        </div>

        <div className="contact-status" aria-labelledby="booking-title">
          <p className="status-kicker">Contact and booking</p>
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
