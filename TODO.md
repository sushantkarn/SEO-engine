# SEO engine delivery checklist

## P0 — safety and contract correctness

- [x] Remove framework-specific routes from the default `robots.txt` policy.
- [x] Support Open Graph image alt text and URL overrides.
- [x] Support Twitter/X card selection.
- [x] Keep package and adapter versions coordinated.
- [x] Publish and verify `core@0.2.4`, `adapters-next@0.2.4`, and `cli@0.2.6`.
- [x] Publish and verify the initial Nuxt and Astro adapters (the next patch release is prepared locally).

## P1 — international and runtime output

- [x] Emit `hreflang`/alternate-language URLs through framework adapters.
- [x] Normalize and validate locale tags and alternate URLs.
- [x] Expand storage interfaces to cover the complete SEO contract and change history.
- [x] Deduplicate, validate, and limit sitemap entries.

## P1 — decision safety

- [x] Validate social, schema, sitemap, and robots changes proposed by MCP.
- [x] Detect redirect loops and redirect chains.
- [x] Restrict unsupported Twitter card values.
- [x] Add audit history and rollback metadata to change contracts.

## P2 — auditing and integrations

- [x] Make CLI HTML extraction attribute-order independent.
- [x] Implement real `/robots.txt` and `/llms.txt` audits.
- [x] Add Open Graph, Twitter, hreflang, and viewport audit rules.
- [x] Add initial Nuxt and Astro adapters.
- [x] Expand global schema helpers and breadcrumb generation.

## Product parity work

- [x] Publish the shared capability vocabulary used by the plugin and MCP discovery.
- [x] Add deterministic internal-link candidate scoring and broken-link classification contracts.
- [x] Add provider-neutral freshness and snapshot contracts for GSC, GA4, GBP, SERP, and indexing.
- [x] Add a host-neutral MCP tool-definition contract with read/preview/apply/verify safety metadata.
- [x] Add a transport-neutral MCP JSON-RPC handler with approval, idempotency, verification, and rollback hooks.
- [ ] Implement the MCP bridge transport and tool registry as a separate package.
- [ ] Implement provider connectors for Search Console, GA4, GBP, SERP, IndexNow, and Google Indexing API.
- [ ] Implement crawl-backed site audit, internal-link proposals, and broken-link recovery.
- [ ] Implement CMS/storage adapters and verified content/media execution.
- [ ] Implement ecommerce, security, role, TOC, media-format, and automation adapters.

## Release gate

- [x] Run package tests and builds.
- [x] Run application typecheck, tests, and production build.
- [x] Run package dry-run publishing checks.
- [ ] Publish the prepared releases: `core@0.2.6`, `adapters-next@0.2.6`, `adapters-nuxt@0.1.2`, `adapters-astro@0.1.2`, and `cli@0.2.8` after npm 2FA confirmation.
- [x] Verify the previous published core/Next/CLI versions and install them in the application.
