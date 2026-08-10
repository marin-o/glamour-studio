import { SITE_ORIGIN } from "../lib/site-seo";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
