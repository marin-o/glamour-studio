import TypographySalonPage from "../components/TypographySalonPage";
import {
  beautySalonJsonLd,
  serializeJsonLd,
} from "../lib/site-seo";

export default function Home() {
  return (
    <>
      <TypographySalonPage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(beautySalonJsonLd) }}
      />
    </>
  );
}
