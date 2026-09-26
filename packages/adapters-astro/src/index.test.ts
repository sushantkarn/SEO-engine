import { describe, expect, it } from "vitest";
import { createAstroHead } from "./index.js";

describe("createAstroHead", () => {
  it("creates Astro-compatible head tags", () => {
    const tags = createAstroHead({
      seo: { title: "About", ogImage: "https://example.com/about.png", ogImageAlt: "About" },
      context: { title: "About", url: "https://example.com/about" },
      config: { siteName: "Example", separator: "|" },
    });
    expect(tags).toContainEqual({ tag: "title", content: "About" });
    expect(tags).toContainEqual({ tag: "meta", attrs: { property: "og:image:alt", content: "About" } });
  });
});
