import { describe, expect, it, vi } from "vitest";
import {
  createLlmsRoute,
  createRobotsRoute,
  createSitemapHandler,
} from "./index.js";

describe("createRobotsRoute", () => {
  it("returns robots.txt response", async () => {
    const GET = createRobotsRoute({ baseUrl: "https://example.com" });
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(await response.text()).toContain(
      "Sitemap: https://example.com/sitemap.xml",
    );
  });
});

describe("createLlmsRoute", () => {
  it("returns 404 when llms.txt is disabled", async () => {
    const GET = createLlmsRoute({
      baseUrl: "https://example.com",
      getSettings: () => ({ llms: { enabled: false } }),
    });

    const response = await GET();
    expect(response.status).toBe(404);
  });

  it("returns llms.txt content when enabled", async () => {
    const GET = createLlmsRoute({
      baseUrl: "https://example.com",
      getSettings: () => ({
        llms: { enabled: true, summary: "Example site" },
      }),
    });

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Example site");
  });
});

describe("createSitemapHandler", () => {
  it("merges static and dynamic entries", async () => {
    const handler = createSitemapHandler({
      getStaticEntries: () => [{ url: "https://example.com/" }],
      getDynamicEntries: () => [{ url: "https://example.com/blog" }],
    });

    const entries = await handler();
    expect(entries).toHaveLength(2);
  });

  it("returns empty list when disabled", async () => {
    const handler = createSitemapHandler({
      isEnabled: () => false,
      getStaticEntries: () => [{ url: "https://example.com/" }],
    });

    expect(await handler()).toEqual([]);
  });
});

describe("toNextMetadata", () => {
  it("is exported via createRobotsRoute module", () => {
    expect(createRobotsRoute).toBeTypeOf("function");
    expect(createLlmsRoute).toBeTypeOf("function");
    expect(createSitemapHandler).toBeTypeOf("function");
  });
});
