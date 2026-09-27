# @gmbranker/seo-engine-adapters-next

Next.js App Router adapters for `@gmbranker/seo-engine-core`.

## Install

```bash
npm install @gmbranker/seo-engine-core @gmbranker/seo-engine-adapters-next
```

The adapter supports Next.js `>=14.0.0`. Keep the adapter and core versions
aligned.

## Page metadata

```ts
// app/about/page.tsx
import { createNextMetadata } from "@gmbranker/seo-engine-adapters-next";

export const metadata = createNextMetadata({
  seo: {
    title: "About us",
    description: "Learn about Example Inc.",
    canonical: "https://example.com/about",
    ogImage: "https://example.com/images/about.jpg",
    twitterCard: "summary_large_image",
  },
  context: {
    title: "About us",
    url: "https://example.com/about",
  },
  config: { siteName: "Example Inc", separator: "|" },
});
```

`createNextMetadata` returns a Next.js-compatible `Metadata` object. It maps
title, description, canonical, robots, Open Graph, Twitter/X, keywords, and
alternate-language URLs. For an already resolved core value, use
`toNextMetadata`.

## Route factories

### robots.txt

```ts
// app/robots.txt/route.ts
import { createRobotsRoute } from "@gmbranker/seo-engine-adapters-next";

export const GET = createRobotsRoute({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  getContent: async () => null,
});
```

### llms.txt

```ts
// app/llms.txt/route.ts
import { createLlmsRoute } from "@gmbranker/seo-engine-adapters-next";

export const GET = createLlmsRoute({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  getSettings: async () => ({
    llmsEnabled: true,
    llmsDescription: "Official Example Inc website",
  }),
});
```

### sitemap

```ts
// app/sitemap.ts
import { createSitemapHandler } from "@gmbranker/seo-engine-adapters-next";

const buildSitemap = createSitemapHandler({
  getStaticEntries: () => [{ url: "https://example.com/", priority: 1 }],
  getDynamicEntries: async () => [],
});

export default buildSitemap;
```

The sitemap handler normalizes URLs, removes duplicates, supports dynamic
entries, and can apply an enable/disable check and item limit.

## Design boundary

This package adapts output to Next.js; it does not persist SEO settings, crawl
your site, call Google APIs, or execute MCP changes. Provide those concerns in
your application or a separate host adapter.

## License

MIT
