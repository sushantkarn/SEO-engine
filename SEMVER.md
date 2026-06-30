# Semver policy

`@seo-engine` packages follow [Semantic Versioning 2.0.0](https://semver.org/).

## Versioning rules

- **MAJOR** — breaking changes to public exports, storage interface contracts, or CLI flags
- **MINOR** — backward-compatible features (new modules, new optional config fields)
- **PATCH** — bug fixes, documentation, internal refactors with no API change

## Stability tiers

| Tier | Packages | Guarantee |
|------|----------|-----------|
| Stable | `@seo-engine/core`, `@seo-engine/adapters-next`, `@seo-engine/cli` | Semver-compliant |
| Experimental | future `@seo-engine/geo`, `@seo-engine/entity` | May ship `0.x` until APIs stabilize |

## Deprecation process

1. Mark API as `@deprecated` in JSDoc
2. Log runtime warning for one minor release (optional)
3. Remove in next major release

Example: keyword density scoring remains opt-in and deprecated per skills.md Decision 9.

## Monorepo releases

Packages are versioned independently but released together when cross-package changes land. Dependent packages pin compatible workspace versions during development.
