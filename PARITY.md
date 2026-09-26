# SEO engine ↔ plugin parity plan

The WordPress plugin remains the reference implementation for product labels and
host execution. The npm packages provide the portable rules, contracts, and
framework adapters. Every item below must be either implemented or explicitly
represented by a host adapter before it is marked stable.

## P0 — portable decision engine

- [x] Capability vocabulary matches the plugin.
- [x] Metadata, social, robots, locale, schema, sitemap, llms.txt, and redirects.
- [x] Change validation, audit metadata, rollback references, and storage interfaces.
- [x] Internal-link candidate scoring and proposal generation.
- [x] Broken-link classification and replacement/redirect recommendations.
- [x] Portable audit report contract and deterministic finding summaries (crawl execution remains an adapter concern).
- [x] Shared provider snapshot contracts for GSC, GA4, GBP, SERP, and indexing.
- [x] MCP tool definitions for inspect → propose → approve → apply → verify.

## P1 — portable adapters

- [x] In-memory change-history implementation for serverless/tests.
- [ ] Durable database-backed change-history implementations.
- [ ] Next/Nuxt/Astro runtime integrations for every stable core output.
- [ ] CLI site crawl, link scan, audit history, and machine-readable reports.
- [ ] IndexNow and Google Indexing API provider adapters.
- [ ] GSC, GA4, GBP, SERP, and rank-history provider adapters.

## P2 — host execution adapters

- [ ] WordPress storage, permissions, preview/apply handlers, and rollback executor.
- [ ] Custom Node/CMS storage and content/media mutation adapters.
- [ ] WooCommerce product schema and ecommerce sitemap adapter.
- [ ] Security, roles, database tools, TOC, media formats, and automation adapters.
- [x] Transport-neutral MCP JSON-RPC tool handler with approval, idempotency, verification, and rollback hooks.
- [ ] MCP HTTP transport and OAuth host integration.

## Release rules

- A capability may be `stable` only when its tests, adapter contract, and failure
  behavior are covered.
- Provider credentials never enter the core package or MCP response payloads.
- All writes require a validated proposal, explicit approval, idempotency, and
  post-write verification.
