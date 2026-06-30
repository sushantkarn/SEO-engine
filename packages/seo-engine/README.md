# @seo-engine/core

Framework-agnostic SEO engine core — metadata templates, JSON-LD, robots.txt, llms.txt, redirects, and content analysis.

## Install

```bash
npm install @seo-engine/core
```

## Quick start

```typescript
import {
  generateRobots,
  generateLlmsTxt,
  resolveMetadata,
  buildGlobalSchemaJsonLd,
  analyzeContent,
} from "@seo-engine/core";

const robots = generateRobots({
  sitemapUrl: "https://example.com/sitemap.xml",
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

See `@seo-engine/core/storage` for `SettingsStore`, `MetadataStore`, `RedirectStore`, and related interfaces.

## License

MIT
