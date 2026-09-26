export type SeoCapabilityId =
  | "metadata"
  | "schema"
  | "robots"
  | "sitemap"
  | "llms"
  | "content-analysis"
  | "internal-links"
  | "broken-links"
  | "redirects"
  | "image-seo"
  | "social-sharing"
  | "site-audit"
  | "serp-research"
  | "dynamic-sitemaps"
  | "preferred-source"
  | "database-tools"
  | "role-manager"
  | "instant-indexing"
  | "local-seo"
  | "security-controls"
  | "content-ai"
  | "table-of-contents"
  | "media-formats"
  | "woocommerce-seo"
  | "automation"
  | "handshake-api"
  | "gsc-insights"
  | "ga4-insights"
  | "gbp-insights"
  | "mcp-bridge";

export type SeoCapabilityStatus = "stable" | "beta" | "planned";

export interface SeoCapability {
  id: SeoCapabilityId;
  name: string;
  description: string;
  status: SeoCapabilityStatus;
  executionModes: Array<"runtime" | "pull-request" | "cms" | "cli">;
  /** Product capability label used by the plugin and MCP discovery. */
  productLabel?: string;
}

/** Public capability contract shared by adapters, the CLI, and MCP. */
export const SEO_ENGINE_CAPABILITIES: readonly SeoCapability[] = [
  { id: "metadata", name: "Metadata Manager", productLabel: "Metadata Manager", description: "Titles, descriptions, canonicals, Open Graph, Twitter metadata, and robots controls.", status: "stable", executionModes: ["runtime", "pull-request", "cms"] },
  { id: "schema", name: "Schema (Structured Data)", productLabel: "Schema (Structured Data)", description: "Validated JSON-LD for organization, local business, article, service, FAQ, breadcrumb, and custom entities.", status: "stable", executionModes: ["runtime", "pull-request", "cms"] },
  { id: "robots", name: "Robots policy", description: "Robots directives and AI crawler policies with safe defaults.", status: "stable", executionModes: ["runtime", "pull-request"] },
  { id: "sitemap", name: "Dynamic Sitemaps", productLabel: "Dynamic Sitemaps", description: "Static and dynamic sitemap entries with filtering and limits.", status: "stable", executionModes: ["runtime", "pull-request"] },
  { id: "llms", name: "LLMs Txt", productLabel: "LLMs Txt", description: "Machine-readable site context and important links for AI systems.", status: "stable", executionModes: ["runtime", "pull-request"] },
  { id: "content-analysis", name: "SEO Analysis", productLabel: "SEO Analysis", description: "Deterministic content, keyword, readability, image, and link checks.", status: "stable", executionModes: ["cli", "pull-request"] },
  { id: "internal-links", name: "Links Manager", productLabel: "Links Manager", description: "Site-graph analysis and contextual link proposals.", status: "planned", executionModes: ["pull-request", "cms"] },
  { id: "broken-links", name: "Broken Link Recovery", productLabel: "Broken Links", description: "Classify broken URLs and propose safe replacements or redirects.", status: "planned", executionModes: ["pull-request", "cms", "cli"] },
  { id: "redirects", name: "Redirections", productLabel: "Redirections", description: "Typed redirect rules with normalization and hit tracking.", status: "stable", executionModes: ["runtime", "pull-request", "cms"] },
  { id: "image-seo", name: "Image SEO", description: "Alt text and image metadata processing using deterministic templates.", status: "stable", executionModes: ["runtime", "pull-request", "cms"] },
  { id: "social-sharing", name: "Social Sharing", description: "Open Graph, Twitter/X, and social preview metadata.", status: "stable", executionModes: ["runtime", "pull-request", "cms"] },
  { id: "site-audit", name: "Site Audit", description: "Crawl-backed technical SEO findings with evidence, severity, and history.", status: "planned", executionModes: ["cli", "pull-request", "cms"] },
  { id: "serp-research", name: "SERP Research", description: "Search-result benchmarks, intent signals, and competitor evidence.", status: "planned", executionModes: ["cli", "cms"] },
  { id: "dynamic-sitemaps", name: "Sitemap Controls", description: "Index, post-type, taxonomy, author, image, and custom sitemap policies.", status: "planned", executionModes: ["runtime", "cms"] },
  { id: "preferred-source", name: "Preferred Source Widget", description: "E-E-A-T source attribution and preferred-source presentation contracts.", status: "planned", executionModes: ["runtime", "cms"] },
  { id: "database-tools", name: "Database Tools", description: "Safe diagnostics and maintenance operations behind explicit permissions.", status: "planned", executionModes: ["cms"] },
  { id: "role-manager", name: "Role Manager", description: "Capability and permission policies for SEO operations.", status: "planned", executionModes: ["cms"] },
  { id: "instant-indexing", name: "Instant Indexing", description: "IndexNow and Google indexing submission contracts with limits and history.", status: "planned", executionModes: ["runtime", "cms"] },
  { id: "local-seo", name: "Local SEO", description: "Local business identity, location data, service areas, and local schema.", status: "beta", executionModes: ["runtime", "cms"] },
  { id: "security-controls", name: "Security Controls", description: "Safe headers, endpoint protection, secret handling, and execution policies.", status: "planned", executionModes: ["cms"] },
  { id: "content-ai", name: "Content AI", description: "Content briefs, generation, validation, and approval-safe content changes.", status: "planned", executionModes: ["cms", "pull-request"] },
  { id: "table-of-contents", name: "Table of Contents", description: "Heading analysis and accessible table-of-contents output.", status: "planned", executionModes: ["runtime", "cms"] },
  { id: "media-formats", name: "Media Formats & SVG", description: "Safe media format handling, SVG policy, and structured media metadata.", status: "planned", executionModes: ["cms"] },
  { id: "woocommerce-seo", name: "WooCommerce SEO", productLabel: "WooCommerce SEO", description: "Product schema, product media, offers, stock, and ecommerce sitemap policy.", status: "planned", executionModes: ["runtime", "cms"] },
  { id: "automation", name: "Automation Workflows", description: "Triggers, conditions, queued actions, schedules, and verified execution.", status: "planned", executionModes: ["cms"] },
  { id: "handshake-api", name: "Handshake API", description: "Authenticated site-to-engine connection, capability discovery, and scoped execution.", status: "planned", executionModes: ["runtime", "cms"] },
  { id: "gsc-insights", name: "Search Console insights", description: "Search demand, CTR, position, query, and page evidence.", status: "planned", executionModes: ["runtime"] },
  { id: "ga4-insights", name: "Analytics insights", description: "Traffic, engagement, conversion, and landing-page evidence.", status: "planned", executionModes: ["runtime"] },
  { id: "gbp-insights", name: "Business Profile insights", description: "Local profile visibility and customer-action evidence.", status: "planned", executionModes: ["runtime"] },
  { id: "mcp-bridge", name: "MCP Bridge", description: "Scoped inspection, proposal, approval, execution, and verification contracts.", status: "planned", executionModes: ["runtime"] },
] as const;

export function getSeoCapability(id: SeoCapabilityId) {
  return SEO_ENGINE_CAPABILITIES.find((capability) => capability.id === id) ?? null;
}
