# @seo-engine

Open-source, framework-agnostic SEO engine for JavaScript apps — metadata, JSON-LD, robots.txt, llms.txt, redirects, and CI audits.

Originally extracted from the [GMB Ranker](https://github.com/gmb-ranker/gmbranker) Franker SEO stack. This repository contains **only** the npm packages — not the full SaaS application.

## Packages

| Package | Description |
|---------|-------------|
| [`@seo-engine/core`](./packages/seo-engine) | Pure SEO logic — zero framework dependencies |
| [`@seo-engine/adapters-next`](./packages/adapters-next) | Next.js App Router route factories |
| [`@seo-engine/cli`](./packages/cli) | `npx seo-engine audit` for CI pipelines |

## Install

```bash
npm install @seo-engine/core
```

```typescript
import {
  generateRobots,
  resolveMetadata,
  buildGlobalSchemaJsonLd,
} from "@seo-engine/core";
```

## Development

```bash
npm install
npm run build
npm test
```

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [SEMVER.md](./SEMVER.md)
- [STORAGE.md](./STORAGE.md)

## License

MIT — see [LICENSE](./LICENSE).
