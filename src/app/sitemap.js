import { siteUrl } from "../lib/site-seo";

export default function sitemap() {
  return [{ url: siteUrl("/") }, { url: siteUrl("/booking") }];
}
