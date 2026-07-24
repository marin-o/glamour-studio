import HorizontalLookbook from "../../components/lookbook/HorizontalLookbook";
import { homepageCopy } from "../../lib/homepage-copy";
import { lookbookMedia } from "../../lib/lookbook-media";

export const metadata = {
  title: "Lookbook | Glamour Studio",
  description: homepageCopy.mk.metadata.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function LookbookPage() {
  return <HorizontalLookbook items={lookbookMedia} />;
}
