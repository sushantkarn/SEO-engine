import type {
  RedirectRule,
  SettingsRecord,
  SitemapEntry,
} from "../types.js";
import type { SeoChange, SeoChangeAudit } from "../changes.js";

export interface CustomSeoRecord {
  url: string;
  title?: string | null;
  description?: string | null;
  keywords?: string | string[] | null;
  focusKeyword?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonical?: string | null;
  robots?: string | null;
  robotsIndex?: string | null;
  robotsFollow?: string | null;
  robotsNoImageIndex?: boolean | null;
  robotsNoArchive?: boolean | null;
  robotsNoSnippet?: boolean | null;
  robotsMaxSnippet?: number | null;
  robotsMaxVideoPreview?: number | null;
  robotsMaxImagePreview?: "none" | "standard" | "large" | null;
  noindex?: boolean | null;
  nofollow?: boolean | null;
  noarchive?: boolean | null;
  noimageindex?: boolean | null;
  nosnippet?: boolean | null;
  maxSnippet?: number | null;
  maxVideoPreview?: number | null;
  maxImagePreview?: "none" | "standard" | "large" | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogImageAlt?: string | null;
  ogUrl?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  twitterCard?: "summary" | "summary_large_image" | null;
  locale?: string | null;
  alternateLocales?: Array<{ locale: string; url: string }>;
  ogType?: string | null;
  schema?: Record<string, unknown> | Array<Record<string, unknown>> | null;
  jsonLd?: string | null;
  updatedAt?: string | Date | null;
}

export interface MetadataStore {
  getCustomSeo(url: string): Promise<CustomSeoRecord | null>;
  listCustomSeo?(): Promise<CustomSeoRecord[]>;
}

export interface SettingsStore {
  read(): Promise<SettingsRecord>;
  write?(value: SettingsRecord): Promise<void>;
}

export interface RedirectStore {
  listActive(): Promise<RedirectRule[]>;
  recordHit?(id: string): Promise<void>;
}

export interface RobotsStore {
  getActiveContent(): Promise<string | null>;
}

export interface SitemapProvider {
  getEntries(): Promise<SitemapEntry[]>;
}

export interface SeoChangeRecord {
  id: string;
  change: SeoChange;
  audit: SeoChangeAudit;
  status: "proposed" | "approved" | "applied" | "rejected" | "rolled_back";
  createdAt: string | Date;
  appliedAt?: string | Date | null;
  rolledBackAt?: string | Date | null;
}

export interface ChangeHistoryStore {
  append(record: SeoChangeRecord): Promise<void>;
  get(id: string): Promise<SeoChangeRecord | null>;
  list?(options?: { route?: string; limit?: number }): Promise<SeoChangeRecord[]>;
}

export interface SeoStorageAdapters {
  settings?: SettingsStore;
  metadata?: MetadataStore;
  redirects?: RedirectStore;
  robots?: RobotsStore;
  sitemap?: SitemapProvider;
  changes?: ChangeHistoryStore;
}
