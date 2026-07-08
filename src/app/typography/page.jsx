import TypographySalonPage from "../../components/TypographySalonPage";

export const metadata = {
  title: "Typography Study | Glamour Studio",
  description:
    "A typography-led alternate draft for Glamour Studio that keeps salon facts, contact details, prices, media, and booking status clearly pending.",
};

export default function TypographyStudy() {
  return (
    <TypographySalonPage
      eyebrow="Typography study / same direction as homepage"
      homeHref="/"
      homeLabel="Main draft"
    />
  );
}
