# Storage adapter interfaces

`@gmbranker/seo-engine-core` separates **pure SEO logic** from **persistence**. Applications provide storage adapters; the core never imports Prisma, Redis, or CMS SDKs.

## Import

```typescript
import type {
  MetadataStore,
  SettingsStore,
  RedirectStore,
  RobotsStore,
  SitemapProvider,
  SeoStorageAdapters,
} from "@gmbranker/seo-engine-core/storage";
```

## SettingsStore

```typescript
interface SettingsStore {
  read(): Promise<SettingsRecord>;
  write?(value: SettingsRecord): Promise<void>;
}
```

Stores Franker/Rank Math–style JSON: separator, module toggles, schema config, llms.txt settings.

## MetadataStore

```typescript
interface MetadataStore {
  getCustomSeo(url: string): Promise<CustomSeoRecord | null>;
  listCustomSeo?(): Promise<CustomSeoRecord[]>;
}
```

Per-URL overrides for title, description, canonical, OG tags, JSON-LD.

## RedirectStore

```typescript
interface RedirectStore {
  listActive(): Promise<RedirectRule[]>;
  recordHit?(id: string): Promise<void>;
}
```

Used with `matchRedirect()` from core for middleware enforcement.

## RobotsStore

```typescript
interface RobotsStore {
  getActiveContent(): Promise<string | null>;
}
```

Custom robots.txt body; use `{{sitemap}}` placeholder replaced by `generateRobots()`.

## SitemapProvider

```typescript
interface SitemapProvider {
  getEntries(): Promise<SitemapEntry[]>;
}
```

Returns dynamic URLs merged with static routes in framework adapters.

## Example (in-memory)

```typescript
import { matchRedirect } from "@gmbranker/seo-engine-core";
import type { RedirectStore } from "@gmbranker/seo-engine-core/storage";

const memoryRedirects: RedirectRule[] = [];

const redirectStore: RedirectStore = {
  listActive: async () => memoryRedirects.filter((r) => r.isActive !== false),
};
```

## GMB Ranker reference

GMB Ranker implements these via Prisma in `lib/franker/*` while consuming `@gmbranker/seo-engine-core` for algorithms.
