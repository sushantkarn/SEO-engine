import type { LinkCounts } from "./types.js";

export function countLinksInHtml(content: string, siteHost: string): LinkCounts {
  const hrefMatches = content.match(/href=["']([^"']+)["']/gi) || [];
  let internal = 0;
  let external = 0;

  for (const match of hrefMatches) {
    const href = match.replace(/^href=["']/i, "").replace(/["']$/, "");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) continue;

    if (href.startsWith("/")) {
      internal += 1;
      continue;
    }

    try {
      const url = new URL(href);
      if (url.hostname === siteHost) {
        internal += 1;
      } else {
        external += 1;
      }
    } catch {
      internal += 1;
    }
  }

  return { internal, external, total: internal + external };
}
