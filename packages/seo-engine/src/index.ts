export type {
  ImageSeoSettings,
  LinkCounts,
  PageContext,
  RedirectMatch,
  RedirectRule,
  ResolvedMetadata,
  ResolvedRobots,
  SeoAnalysisResult,
  SeoData,
  SettingsRecord,
  SitemapEntry,
} from "./types.js";

export { SEO_ENGINE_CAPABILITIES, getSeoCapability } from "./capabilities.js";
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
export type { SeoChange, SeoChangeAudit, SeoChangeValidation } from "./changes.js";

export {
  extractJsonLdPayload,
  normalizeJsonLd,
  normalizeSeoSchemaValue,
  parseSchemaFromSeoJson,
  serializeJsonLd,
  validateJsonLdSchema,
} from "./jsonld.js";
export type {
  SchemaValidationIssue,
  SchemaValidationResult,
} from "./jsonld.js";

export {
  buildBreadcrumbSchemaJsonLd,
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

export {
  inspectRedirectGraph,
  matchRedirect,
  normalizeRedirectPath,
} from "./redirects.js";
export type { RedirectGraphIssue } from "./redirects.js";

export {
  getSeparator,
  getSitemapMaxItems,
  isSitemapEnabled,
  mergeSettings,
} from "./settings.js";

export { replaceVariables } from "./variables.js";

export { normalizeLocaleTag, resolveMetadata, type MetadataConfig } from "./metadata.js";

export {
  analyzeContent,
  analyzeContentDetailed,
  calculateSeoScore,
  stripHtmlToText,
  countWords,
  parseFocusKeywords,
  keywordDensityPercent,
  slugContainsKeyword,
  titleStartsWithKeyword,
  keywordInFirstPercent,
  keywordInSubheadings,
  contentHasShortParagraphs,
  contentHasInlineToc,
  contentHasToc,
  countContentLinks,
  calculateFleschKincaid,
  checkAltTagCoverage,
  SEO_TITLE_MIN_CHARS,
  SEO_TITLE_MAX_CHARS,
  SEO_DESC_MIN_CHARS,
  SEO_DESC_MAX_CHARS,
  KD_MIN_PERCENT,
  KD_MAX_PERCENT,
  PERMALINK_MAX_CHARS,
} from "./content-analysis.js";
export type {
  ContentAnalysisReport,
  ContentAnalysisTest,
  AnalyzeContentInput,
} from "./content-analysis.js";

export { getSeoUrlVariants, normalizeSeoUrlPath } from "./urls.js";

export { countLinksInHtml } from "./linking.js";

export {
  classifyBrokenLink,
  suggestInternalLinks,
} from "./link-intelligence.js";
export type {
  BrokenLinkRecommendation,
  BrokenLinkRecord,
  InternalLinkSuggestion,
  LinkPage,
} from "./link-intelligence.js";

export type {
  AnalyticsSnapshot,
  BusinessProfileSnapshot,
  IndexingSubmissionResult,
  SearchConsoleSnapshot,
  SerpSnapshot,
  SeoProviderAdapters,
  SourceFreshness,
} from "./providers.js";

export { getSeoMcpTool, SEO_MCP_TOOL_DEFINITIONS } from "./mcp-contracts.js";
export type { SeoMcpToolDefinition, SeoMcpToolKind } from "./mcp-contracts.js";
export { createSeoMcpHandler } from "./mcp-runtime.js";
export type { SeoMcpHost, SeoMcpRequest, SeoMcpResponse } from "./mcp-runtime.js";

export { createSeoAuditReport } from "./audit-contracts.js";
export type { SeoAuditFinding, SeoAuditReport, SeoAuditSeverity, SeoAuditSummary } from "./audit-contracts.js";

export { createInMemoryChangeHistoryStore } from "./history.js";

export { processContentImages } from "./images.js";
