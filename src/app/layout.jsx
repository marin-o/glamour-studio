import "./globals.css";

import SmoothScroll from "../components/motion/SmoothScroll";

export const metadata = {
  title: "Glamour Studio | Radovish Salon Draft",
  description:
    "Draft one-page salon website for Glamour Studio in Radovish. Haircuts, hairstyling, and makeup are listed as draft services while address, hours, phone, prices, and media remain pending.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Glamour Studio | Radovish Salon Draft",
    description:
      "Elegant local salon website draft for Glamour Studio. Address, hours, phone, prices, and final media are pending.",
    type: "website",
    locale: "mk_MK",
    images: [
      {
        url: "/media/salon-hero-placeholder.png",
        width: 1792,
        height: 1024,
        alt: "Temporary warm salon-style hero placeholder with hair movement.",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mk">
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
