import HorizontalLookbook from "../../components/lookbook/HorizontalLookbook";
import { lookbookMedia } from "../../lib/lookbook-media";

export const metadata = {
  title: "Lookbook | Glamour Studio",
  description:
    "Привремен уреднички Lookbook со развојни локални медиуми од јавниот Instagram профил на Glamour Studio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LookbookPage() {
  return <HorizontalLookbook items={lookbookMedia} />;
}
