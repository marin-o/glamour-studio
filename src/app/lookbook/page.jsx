import HorizontalLookbook from "../../components/lookbook/HorizontalLookbook";
import { lookbookMedia } from "../../lib/lookbook-media";

export const metadata = {
  title: "Development Lookbook | Glamour Studio",
  description:
    "A temporary editorial lookbook using development-only local media from Glamour Studio's public Instagram profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LookbookPage() {
  return <HorizontalLookbook items={lookbookMedia} />;
}
