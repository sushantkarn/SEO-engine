import { describe, expect, it } from "vitest";
import {
  analyzeContent,
  appendAiCrawlerPreset,
  buildGlobalSchemaJsonLd,
  buildLocalSeoSchemaJsonLd,
  calculateSeoScore,
  countLinksInHtml,
  createSeoSiteManifest,
  extractJsonLdPayload,
  generateLlmsTxt,
  generateRobots,
  getSeparator,
  getSeoCapability,
  getSeoUrlVariants,
  getSitemapMaxItems,
  isLlmsTxtEnabled,
  isSitemapEnabled,
  matchRedirect,
  mergeSettings,
  normalizeJsonLd,
  normalizeRedirectPath,
  normalizeSeoSchemaValue,
  normalizeSeoUrlPath,
  parseSchemaFromSeoJson,
  processContentImages,
  replaceVariables,
  resolveMetadata,
  serializeJsonLd,
  SEO_ENGINE_CAPABILITIES,
  validateSeoChange,
} from "./index.js";

describe("decision engine contracts", () => {
  it("exposes the capability registry", () => {
    expect(SEO_ENGINE_CAPABILITIES.length).toBeGreaterThan(10);
    expect(getSeoCapability("mcp-bridge")?.status).toBe("planned");
  });

  it("creates a normalized site manifest", () => {
    const manifest = createSeoSiteManifest({
      siteId: "site-1",
      baseUrl: "https://example.com/marketing/?utm_source=test",
      framework: "next",
      packageVersion: "0.1.0",
      capabilities: ["metadata", "metadata"],
      contentTypes: ["article", "article"],
      now: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(manifest.baseUrl).toBe("https://example.com/marketing");
    expect(manifest.capabilities).toEqual(["metadata"]);
    expect(manifest.contentTypes).toEqual(["article"]);
    expect(manifest.generatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("validates safe MCP changes", () => {
    expect(
      validateSeoChange({
        type: "UPDATE_PAGE_METADATA",
        route: "/about",
        changes: { title: "About our company" },
      }).valid,
    ).toBe(true);
    expect(
      validateSeoChange({
        type: "CREATE_REDIRECT",
        from: "/old",
        to: "/new",
      }),
    ).toMatchObject({ valid: true, normalized: { statusCode: 301 } });
    expect(
      validateSeoChange({
        type: "ADD_INTERNAL_LINK",
        source: "/about",
        target: "/about",
        anchor: "About",
      }).valid,
    ).toBe(false);
  });
});

describe("settings", () => {
  it("merges settings without dropping nested config", () => {
    const merged = mergeSettings(
      { analytics: { googleAnalyticsId: "G-TEST" } },
      { separator: "-", modules: { sitemap: true } },
    );

    expect(merged.separator).toBe("-");
    expect(merged.analytics).toEqual({ googleAnalyticsId: "G-TEST" });
  });

  it("reads separator from root or legacy general config", () => {
    expect(getSeparator({ separator: "::" })).toBe("::");
    expect(getSeparator({ general: { separator: ">" } })).toBe(">");
    expect(getSeparator({})).toBe("|");
  });

  it("reads sitemap settings", () => {
    expect(isSitemapEnabled({})).toBe(true);
    expect(isSitemapEnabled({ enableSitemap: false })).toBe(false);
    expect(getSitemapMaxItems({ itemsPerSitemap: 50 })).toBe(50);
    expect(getSitemapMaxItems({})).toBe(1000);
  });
});

describe("llms.txt", () => {
  it("treats llms.txt as enabled unless explicitly disabled", () => {
    expect(isLlmsTxtEnabled({})).toBe(true);
    expect(isLlmsTxtEnabled({ llms: { enabled: false } })).toBe(false);
    expect(isLlmsTxtEnabled({ modules: { llms: false } })).toBe(false);
  });

  it("builds llms.txt content from settings", () => {
    const content = generateLlmsTxt(
      {
        llms: {
          enabled: true,
          summary: "Local SEO platform",
          importantLinks: [
            "https://example.com/pricing",
            { url: "https://example.com/about", label: "About" },
          ],
        },
      },
      "https://example.com",
    );

    expect(content).toContain("Local SEO platform");
    expect(content).toContain("https://example.com/pricing");
    expect(content).toContain("About: https://example.com/about");
    expect(content).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("returns null when disabled", () => {
    expect(
      generateLlmsTxt({ llms: { enabled: false } }, "https://example.com"),
    ).toBeNull();
  });
});

describe("schema", () => {
  it("builds organization and local business schema", () => {
    expect(
      buildGlobalSchemaJsonLd(
        {
          schema: {
            schemaType: "Organization",
            name: "Example Inc",
            logoUrl: "https://example.com/logo.png",
          },
        },
        "https://example.com",
      ),
    ).toMatchObject({
      "@type": "Organization",
      name: "Example Inc",
      logo: "https://example.com/logo.png",
    });

    expect(
      buildGlobalSchemaJsonLd(
        { schema: { schemaType: "Person", name: "Jane" } },
        "https://example.com",
      ),
    ).toMatchObject({ "@type": "Person" });

    expect(buildGlobalSchemaJsonLd({}, "https://example.com")).toBeNull();
    expect(buildLocalSeoSchemaJsonLd({}, "https://example.com")).toBeNull();

    expect(
      buildLocalSeoSchemaJsonLd(
        {
          localSeo: {
            type: "LocalBusiness",
            name: "HQ",
            address: "123 Main St",
            email: "hi@example.com",
            logo: "https://example.com/logo.png",
            openingHours: "Mo-Fr 09:00-17:00",
            geoCoordinates: "40.1,-74.2",
            url: "https://example.com/hq",
          },
        },
        "https://example.com",
      ),
    ).toMatchObject({
      "@type": "LocalBusiness",
      name: "HQ",
      email: "hi@example.com",
    });
  });
});

describe("redirects", () => {
  it("normalizes redirect sources to pathnames", () => {
    expect(normalizeRedirectPath("https://example.com/blog/old-post")).toBe(
      "/blog/old-post",
    );
    expect(normalizeRedirectPath("pricing")).toBe("/pricing");
    expect(normalizeRedirectPath("")).toBe("/");
  });

  it("matches active redirect rules", () => {
    const match = matchRedirect("/old", [
      { sourceUrl: "/old", targetUrl: "/new", type: 301, isActive: true },
      { sourceUrl: "/gone", targetUrl: "/home", isActive: false },
    ]);

    expect(match).toEqual({ targetUrl: "/new", type: 301 });
    expect(matchRedirect("/missing", [])).toBeNull();
  });
});

describe("robots", () => {
  it("replaces sitemap placeholder", () => {
    expect(
      generateRobots({
        sitemapUrl: "https://example.com/sitemap.xml",
      }),
    ).toContain("Sitemap: https://example.com/sitemap.xml");

    expect(
      generateRobots({
        content: "User-agent: *\nSitemap: {{sitemap}}",
        sitemapUrl: "https://example.com/sitemap.xml",
      }),
    ).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("appends ai crawler presets", () => {
    const output = appendAiCrawlerPreset(
      generateRobots({ sitemapUrl: "https://example.com/sitemap.xml" }),
      "ai-visible",
    );

    expect(output).toContain("OAI-SearchBot");
    expect(output).toContain("GPTBot");

    const blocked = appendAiCrawlerPreset(
      generateRobots({ sitemapUrl: "https://example.com/sitemap.xml" }),
      "ai-blocked",
    );
    expect(blocked).toContain("Google-Extended");
  });
});

describe("jsonld", () => {
  it("normalizes script-wrapped json-ld", () => {
    const result = normalizeJsonLd(
      '<script type="application/ld+json">{"@type":"Organization"}</script>',
    );
    expect(result.value).toBe('{"@type":"Organization"}');
  });

  it("handles invalid json-ld", () => {
    expect(normalizeJsonLd("not-json").error).toBeDefined();
    expect(normalizeJsonLd('"string"').error).toContain("object or array");
    expect(normalizeJsonLd(null).value).toBeNull();
    expect(normalizeSeoSchemaValue("").value).toBeNull();
    expect(normalizeSeoSchemaValue(42).error).toBeDefined();
    expect(normalizeSeoSchemaValue('[{"@type":"Thing"}]').value).toEqual([
      { "@type": "Thing" },
    ]);
    expect(normalizeSeoSchemaValue("not-json").error).toBeDefined();
    expect(normalizeSeoSchemaValue("null").value).toBeNull();
    expect(parseSchemaFromSeoJson("not-json")).toBeNull();
    expect(parseSchemaFromSeoJson(JSON.stringify({}))).toBeNull();
  });

  it("normalizes schema values and seo json", () => {
    expect(normalizeSeoSchemaValue({ "@type": "Thing" }).value).toEqual({
      "@type": "Thing",
    });
    expect(
      parseSchemaFromSeoJson(JSON.stringify({ schema: { "@type": "Article" } })),
    ).toEqual({ "@type": "Article" });
    expect(extractJsonLdPayload("  ")).toBeNull();
    expect(serializeJsonLd({ "@type": "Thing" })).toBe('{"@type":"Thing"}');
  });
});

describe("variables and metadata", () => {
  it("replaces template variables", () => {
    expect(
      replaceVariables(
        "%title% %sep% %sitename%",
        { title: "Hello", url: "https://example.com" },
        "Example",
        "|",
      ),
    ).toBe("Hello | Example");
  });

  it("resolves metadata from page seo data", () => {
    const resolved = resolveMetadata(
      {
        title: "%title% %sep% %sitename%",
        robotsIndex: "noindex",
        ogTitle: "OG %title%",
      },
      { title: "Post", url: "https://example.com/post" },
      { siteName: "Example", separator: "|" },
    );

    expect(resolved.title).toBe("Post | Example");
    expect(resolved.robots.index).toBe(false);
    expect(resolved.openGraph.title).toBe("OG Post");
  });
});

describe("urls", () => {
  it("normalizes seo url paths and variants", () => {
    expect(normalizeSeoUrlPath("https://example.com/pricing/")).toBe(
      "/pricing",
    );
    expect(normalizeSeoUrlPath("pricing")).toBe("/pricing");
    expect(normalizeSeoUrlPath("not a url")).toBe("/not a url");
    expect(getSeoUrlVariants("/pricing")).toEqual(["/pricing", "/pricing/"]);
    expect(getSeoUrlVariants("/")).toEqual(["/"]);
  });
});

describe("content analysis", () => {
  it("scores content with focus keyword", () => {
    const result = analyzeContent(
      "seo engine ".repeat(200),
      "seo engine guide",
      "learn seo engine basics",
      "https://example.com/seo-engine",
      "seo engine",
    );

    expect(result.score).toBeGreaterThan(0);
    expect(result.tests.length).toBeGreaterThan(0);
    expect(calculateSeoScore(result.tests)).toBeGreaterThan(0);
  });

  it("fails when no keyword is provided", () => {
    const result = analyzeContent("content", "title", "desc", "/url", "");
    expect(result.score).toBe(0);
  });

  it("covers warning and fail branches", () => {
    const short = analyzeContent(
      "short",
      "title",
      "description",
      "https://example.com/page",
      "keyword",
    );
    expect(short.tests.some((test) => test.status === "fail")).toBe(true);

    const stuffed = analyzeContent(
      `${"keyword ".repeat(50)}body`,
      "keyword title",
      "keyword description",
      "https://example.com/keyword-page",
      "keyword",
    );
    expect(stuffed.tests.some((test) => test.id === "keyword-density")).toBe(
      true,
    );

    const missingSecondary = analyzeContent(
      "primary only content ".repeat(40),
      "primary title",
      "primary description",
      "https://example.com/primary",
      "primary, secondary",
    );
    expect(
      missingSecondary.tests.some((test) => test.id === "keyword-density"),
    ).toBe(true);

    const lowDensity = analyzeContent(
      `primary ${"filler ".repeat(300)}`,
      "other title",
      "other description",
      "https://example.com/page",
      "primary",
    );
    expect(
      lowDensity.tests.find((test) => test.id === "keyword-density")?.status,
    ).toBe("fail");
  });
});

describe("linking and images", () => {
  it("counts internal and external links", () => {
    const html = `
      <a href="/internal">Internal</a>
      <a href="https://example.com/other">Same host</a>
      <a href="https://other.com/page">External</a>
      <a href="#section">Skip</a>
    `;

    expect(countLinksInHtml(html, "example.com")).toEqual({
      internal: 2,
      external: 1,
      total: 3,
    });
    expect(countLinksInHtml('<a href="relative">x</a>', "example.com").internal).toBe(
      1,
    );
  });

  it("adds missing image alt and title attributes", () => {
    const html = '<img src="/photo.jpg" />';
    const output = processContentImages(html, "My Post", {
      addMissingAlt: true,
      addMissingTitle: true,
      altTemplate: "%title% %count%",
      titleTemplate: "%filename%",
    });

    expect(output).toContain('alt="My Post 1"');
    expect(output).toContain('title="photo"');
  });

  it("returns content unchanged when image seo is disabled", () => {
    const html = '<img src="/photo.jpg" />';
    expect(
      processContentImages(html, "My Post", {
        addMissingAlt: false,
        addMissingTitle: false,
      }),
    ).toBe(html);
  });
});
