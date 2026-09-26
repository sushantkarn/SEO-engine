export type {
  ImageSeoSettings,
  LinkCounts,
  PageContext,
  RedirectMatch,
  RedirectRule,
  ResolvedMetadata,
  SeoAnalysisResult,
  SeoData,
  SettingsRecord,
  SitemapEntry,
} from "./types.js";

export {
  SEO_ENGINE_CAPABILITIES,
  getSeoCapability,
} from "./capabilities.js";
export type {
  SeoCapability,
  SeoCapabilityId,
  SeoCapabilityStatus,
} from "./capabilities.js";
export { createSeoSiteManifest } from "./manifest.js";
export type {
  CreateSeoSiteManifestInput,
  SeoExecutionMode,
  SeoFramework,
  SeoSiteManifest,
} from "./manifest.js";
export { validateSeoChange } from "./changes.js";
export type { SeoChange, SeoChangeValidation } from "./changes.js";

export {
  extractJsonLdPayload,
  normalizeJsonLd,
  normalizeSeoSchemaValue,
  parseSchemaFromSeoJson,
  serializeJsonLd,
} from "./jsonld.js";

export {
  buildGlobalSchemaJsonLd,
  buildLocalSeoSchemaJsonLd,
} from "./schema.js";

export {
  AI_CRAWLER_PRESETS,
  DEFAULT_ROBOTS_TEMPLATE,
  appendAiCrawlerPreset,
  generateRobots,
  type AiCrawlerPreset,
  type RobotsConfig,
} from "./robots.js";

export { generateLlmsTxt, isLlmsTxtEnabled } from "./llms.js";

export { matchRedirect, normalizeRedirectPath } from "./redirects.js";

export {
  getSeparator,
  getSitemapMaxItems,
  isSitemapEnabled,
  mergeSettings,
} from "./settings.js";

export { replaceVariables } from "./variables.js";

export { resolveMetadata, type MetadataConfig } from "./metadata.js";

export {
  analyzeContent,
  calculateSeoScore,
} from "./content-analysis.js";

export { getSeoUrlVariants, normalizeSeoUrlPath } from "./urls.js";

export { countLinksInHtml } from "./linking.js";

export { processContentImages } from "./images.js";
