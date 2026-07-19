import TypographySalonPage from "../../components/TypographySalonPage";
import { homepageCopy } from "../../lib/homepage-copy";

export const metadata = {
  title: homepageCopy.mk.typographyMetadata.title,
  description: homepageCopy.mk.typographyMetadata.description,
};

export default function TypographyStudy() {
  return <TypographySalonPage variant="typography" />;
}
