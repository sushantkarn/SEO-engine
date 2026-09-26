# @gmbranker SEO Engine

Open-source, framework-agnostic SEO engine for JavaScript apps — metadata, JSON-LD, robots.txt, llms.txt, redirects, and CI audits.

Originally extracted from the [GMB Ranker](https://github.com/gmb-ranker/gmbranker) Franker SEO stack. This repository contains **only** the npm packages — not the full SaaS application.

## Packages

| Package | Description |
|---------|-------------|
| [`@gmbranker/seo-engine-core`](./packages/seo-engine) | Pure SEO logic — zero framework dependencies |
| [`@gmbranker/seo-engine-adapters-next`](./packages/adapters-next) | Next.js App Router route factories |
| [`@gmbranker/seo-engine-cli`](./packages/cli) | `npx seo-engine audit` for CI pipelines |

## Install

```bash
npm install @gmbranker/seo-engine-core
```

```typescript
import {
  generateRobots,
  resolveMetadata,
  buildGlobalSchemaJsonLd,
} from "@gmbranker/seo-engine-core";
```

## Development

```bash
npm install
npm run build
npm test
```

## Publishing

Releases are published to npm by the `Publish packages` workflow. Before creating a release,
update all package versions together, run the local checks, and commit the version changes:

```bash
npm run check:publish
git tag v0.2.0
git push origin main --follow-tags
```

The workflow expects an `NPM_TOKEN` repository secret with permission to publish these packages.
It only publishes for `v*` tags and uses npm provenance. Never commit an npm token or a local
`.npmrc` containing credentials.

Consumers can install the stable packages directly from npm:

```bash
npm install @gmbranker/seo-engine-core
npm install @gmbranker/seo-engine-adapters-next
npm install --save-dev @gmbranker/seo-engine-cli
```

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [SEMVER.md](./SEMVER.md)
- [STORAGE.md](./STORAGE.md)

## License

MIT — see [LICENSE](./LICENSE).
