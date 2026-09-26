import type { SeoCapabilityId } from "./capabilities.js";

export type SeoFramework = "next" | "nuxt" | "astro" | "wordpress" | "other";
export type SeoExecutionMode = "runtime" | "pull-request" | "cms" | "cli";

export interface SeoSiteManifest {
  version: 1;
  siteId: string;
  baseUrl: string;
  framework: SeoFramework;
  frameworkVersion?: string;
  environment: "development" | "preview" | "production" | "unknown";
  packageVersion: string;
  capabilities: SeoCapabilityId[];
  executionModes: SeoExecutionMode[];
  routeCount?: number;
  contentTypes?: string[];
  generatedAt: string;
}

export interface CreateSeoSiteManifestInput {
  siteId: string;
  baseUrl: string;
  framework: SeoFramework;
  frameworkVersion?: string;
  environment?: SeoSiteManifest["environment"];
  packageVersion: string;
  capabilities?: SeoCapabilityId[];
  executionModes?: SeoExecutionMode[];
  routeCount?: number;
  contentTypes?: string[];
  now?: Date;
}

function normalizeBaseUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.toString().replace(/\/$/, "");
}

/** Creates the privacy-safe site description shared with GMB Ranker/MCP. */
export function createSeoSiteManifest(input: CreateSeoSiteManifestInput): SeoSiteManifest {
  if (!input.siteId.trim()) throw new Error("siteId is required");
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  return {
    version: 1,
    siteId: input.siteId.trim(),
    baseUrl,
    framework: input.framework,
    frameworkVersion: input.frameworkVersion,
    environment: input.environment ?? "unknown",
    packageVersion: input.packageVersion,
    capabilities: [...new Set(input.capabilities ?? [])],
    executionModes: [...new Set(input.executionModes ?? [])],
    routeCount: input.routeCount,
    contentTypes: input.contentTypes ? [...new Set(input.contentTypes)] : undefined,
    generatedAt: (input.now ?? new Date()).toISOString(),
  };
}
