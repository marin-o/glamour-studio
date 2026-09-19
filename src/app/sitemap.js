import { siteUrl } from "../lib/site-seo";

export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: siteUrl("/"), lastModified },
    { url: siteUrl("/booking"), lastModified },
  ];
}
