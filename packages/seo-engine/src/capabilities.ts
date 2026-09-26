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
}

/** Public capability contract shared by adapters, the CLI, and MCP. */
export const SEO_ENGINE_CAPABILITIES: readonly SeoCapability[] = [
  { id: "metadata", name: "Metadata", description: "Titles, descriptions, canonicals, Open Graph, and Twitter metadata.", status: "stable", executionModes: ["runtime", "pull-request", "cms"] },
  { id: "schema", name: "Structured data", description: "Validated JSON-LD for organization, local business, article, service, and FAQ entities.", status: "stable", executionModes: ["runtime", "pull-request", "cms"] },
  { id: "robots", name: "Robots policy", description: "Robots directives and AI crawler policies with safe defaults.", status: "stable", executionModes: ["runtime", "pull-request"] },
  { id: "sitemap", name: "Sitemaps", description: "Static and dynamic sitemap entries with filtering and limits.", status: "stable", executionModes: ["runtime", "pull-request"] },
  { id: "llms", name: "llms.txt", description: "Machine-readable site context and important links for AI systems.", status: "stable", executionModes: ["runtime", "pull-request"] },
  { id: "content-analysis", name: "Content analysis", description: "Deterministic content, keyword, readability, image, and link checks.", status: "stable", executionModes: ["cli", "pull-request"] },
  { id: "internal-links", name: "Internal link intelligence", description: "Site-graph analysis and contextual link proposals.", status: "planned", executionModes: ["pull-request", "cms"] },
  { id: "broken-links", name: "Broken link recovery", description: "Classify broken URLs and propose safe replacements or redirects.", status: "planned", executionModes: ["pull-request", "cms", "cli"] },
  { id: "redirects", name: "Redirects", description: "Typed redirect rules with normalization and hit tracking.", status: "stable", executionModes: ["runtime", "pull-request", "cms"] },
  { id: "image-seo", name: "Image SEO", description: "Alt text and image metadata processing using deterministic templates.", status: "stable", executionModes: ["runtime", "pull-request", "cms"] },
  { id: "gsc-insights", name: "Search Console insights", description: "Search demand, CTR, position, query, and page evidence.", status: "planned", executionModes: ["runtime"] },
  { id: "ga4-insights", name: "Analytics insights", description: "Traffic, engagement, conversion, and landing-page evidence.", status: "planned", executionModes: ["runtime"] },
  { id: "gbp-insights", name: "Business Profile insights", description: "Local profile visibility and customer-action evidence.", status: "planned", executionModes: ["runtime"] },
  { id: "mcp-bridge", name: "MCP bridge", description: "Scoped inspection, proposal, approval, execution, and verification contracts.", status: "planned", executionModes: ["runtime"] },
] as const;

export function getSeoCapability(id: SeoCapabilityId) {
  return SEO_ENGINE_CAPABILITIES.find((capability) => capability.id === id) ?? null;
}
