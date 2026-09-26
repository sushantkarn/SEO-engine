# Contributing to @gmbranker SEO Engine

Thank you for contributing to the open-source SEO engine monorepo.

## Packages

| Package | Purpose |
|---------|---------|
| `@gmbranker/seo-engine-core` | Framework-agnostic SEO logic |
| `@gmbranker/seo-engine-adapters-next` | Next.js App Router route factories |
| `@gmbranker/seo-engine-cli` | CI audit CLI |

## Development

```bash
npm install
npm run build
npm test
```

## Pull request guidelines

1. Keep `core` free of framework and database dependencies.
2. Add unit tests for new pure functions (target 95% coverage in core).
3. Follow semver for public API changes (see `SEMVER.md`).
4. Storage integrations belong in adapter packages, not in `core`.

## Storage adapters

Implement interfaces from `@gmbranker/seo-engine-core/storage`:

- `SettingsStore` — site-wide SEO settings JSON
- `MetadataStore` — per-URL custom SEO overrides
- `RedirectStore` — active redirect rules
- `RobotsStore` — robots.txt content
- `SitemapProvider` — dynamic sitemap entries

Reference implementations can live in separate packages (e.g. `@seo-engine/storage-prisma`).

## Code style

- TypeScript strict mode
- Pure functions preferred over classes
- No WordPress or Rank Math branding in public APIs
