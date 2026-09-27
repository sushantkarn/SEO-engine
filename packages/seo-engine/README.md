# @gmbranker/seo-engine-core

Framework-agnostic SEO logic for JavaScript applications. This package has no
framework, database, CMS, or provider dependency.

## Install

```bash
npm install @gmbranker/seo-engine-core
```

## Main API groups

### Metadata and discovery

`resolveMetadata`, `replaceVariables`, and the metadata types produce a stable
contract for page titles, descriptions, canonicals, robots directives, Open
Graph, Twitter/X, locales, and alternate URLs.

`generateRobots`, `appendAiCrawlerPreset`, `generateLlmsTxt`, and
`isLlmsTxtEnabled` generate discovery content without assuming where your app
stores settings.

### Structured data

Use `buildGlobalSchemaJsonLd`, `buildLocalSeoSchemaJsonLd`, and
`buildBreadcrumbSchemaJsonLd` for common entities. Use
`normalizeSeoSchemaValue`, `normalizeJsonLd`, `serializeJsonLd`, and
`validateJsonLdSchema` when accepting custom JSON-LD from an editor or MCP
proposal.

```ts
import {
  normalizeSeoSchemaValue,
  validateJsonLdSchema,
} from "@gmbranker/seo-engine-core";

const normalized = normalizeSeoSchemaValue(inputFromEditor);
if (normalized.error) throw new Error(normalized.error);

const check = validateJsonLdSchema(normalized.value);
if (!check.valid) console.error(check.issues);
```

Validation returns errors that block publication and warnings that should be
reviewed but do not necessarily block a page.

### Analysis and link intelligence

`analyzeContent`, `analyzeContentDetailed`, and the exported scoring helpers
perform deterministic checks. `countLinksInHtml`, `suggestInternalLinks`, and
`classifyBrokenLink` provide evidence for internal-link and broken-link
decision workflows. They do not edit page content.

### Redirects and settings

`normalizeRedirectPath`, `matchRedirect`, and `inspectRedirectGraph` handle
redirect matching and loop/conflict inspection. Settings helpers normalize
separator, sitemap, and module configuration.

### Site manifests and safe changes

`createSeoSiteManifest` describes a connected site without exposing secrets.
`validateSeoChange` validates typed proposals before a host executes them.
Supported proposal types include page metadata, social metadata, JSON-LD,
redirects, internal links, and robots directives.

The core does not execute these changes. A CMS, MCP host, or pull-request
adapter must enforce permissions, approval, persistence, rollback, and deploy
policy.

### MCP and audit contracts

`SEO_MCP_TOOL_DEFINITIONS`, `getSeoMcpTool`, and `createSeoMcpHandler` expose
typed inspection/proposal/approval contracts. `createSeoAuditReport` provides
structured findings and summary types for host integrations. These exports are
transport-agnostic; connect them to your own authenticated MCP server.

## Storage subpath

```ts
import type {
  MetadataStore,
  RedirectStore,
  SeoStorageAdapters,
  SettingsStore,
} from "@gmbranker/seo-engine-core/storage";
```

See the repository [storage guide](../../STORAGE.md). Storage adapters are
interfaces only; the core never imports Prisma, Redis, or a CMS SDK.

## Capability registry

```ts
import {
  SEO_ENGINE_CAPABILITIES,
  getSeoCapability,
} from "@gmbranker/seo-engine-core";

const schema = getSeoCapability("schema");
```

The registry distinguishes `stable`, `beta`, and `planned` capabilities. A
planned product capability is not an implementation guarantee.

## License

MIT
