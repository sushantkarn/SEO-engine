# @gmbranker/seo-engine-core

Framework-agnostic SEO engine core — metadata templates, JSON-LD, robots.txt, llms.txt, redirects, and content analysis.

## Install

```bash
npm install @gmbranker/seo-engine-core
```

## Quick start

```typescript
import {
  generateRobots,
  generateLlmsTxt,
  resolveMetadata,
  buildGlobalSchemaJsonLd,
  analyzeContent,
} from "@gmbranker/seo-engine-core";

const robots = generateRobots({
  sitemapUrl: "https://example.com/sitemap.xml",
  // Optional application-owned private routes. Nothing is blocked by default.
  disallow: ["/admin", "/private"],
});

const metadata = resolveMetadata(
  { title: "%title% %sep% %sitename%" },
  { title: "Hello", url: "https://example.com/hello" },
  { siteName: "Example", separator: "|" },
);

const schema = buildGlobalSchemaJsonLd(
  { schema: { name: "Example Inc", schemaType: "Organization" } },
  "https://example.com",
);
```

## Storage adapters

See `@gmbranker/seo-engine-core/storage` for `SettingsStore`, `MetadataStore`, `RedirectStore`, and related interfaces.

## Product capability parity

The exported `SEO_ENGINE_CAPABILITIES` registry uses the same capability labels
as the GMB Ranker SEO automation product: Metadata Manager, Dynamic Sitemaps,
Redirections, Schema, Image SEO, Links Manager, Site Audit, Local SEO,
Instant Indexing, Content AI, WooCommerce SEO, and the MCP Bridge.

The registry deliberately reports whether each capability is `stable`, `beta`,
or `planned`. The core package provides framework-independent rules and
contracts; CMS integrations, provider connectors, persistence, and MCP
transport are separate adapters and must not be advertised as runtime features
until they are implemented and tested for that host.

## License

MIT
