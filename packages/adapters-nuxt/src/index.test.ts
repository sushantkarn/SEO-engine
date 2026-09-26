import { describe, expect, it } from "vitest";
import { createNuxtSeoHead } from "./index.js";

describe("createNuxtSeoHead", () => {
  it("maps metadata, robots, canonical, and hreflang", () => {
    const head = createNuxtSeoHead({
      seo: { title: "About", robots: "noindex,nofollow" },
      context: { title: "About", url: "https://example.com/about", alternateLocales: [{ locale: "fr", url: "https://example.com/fr/about" }] },
      config: { siteName: "Example", separator: "|" },
    });
    expect(head.title).toContain("About");
    expect(head.link).toContainEqual({ rel: "alternate", hreflang: "fr", href: "https://example.com/fr/about" });
    expect(head.meta).toContainEqual({ name: "robots", content: "noindex, nofollow" });
  });
});
