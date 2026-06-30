import type {
  RedirectRule,
  SettingsRecord,
  SitemapEntry,
} from "../types.js";

export interface CustomSeoRecord {
  url: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonical?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  jsonLd?: string | null;
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

export interface SeoStorageAdapters {
  settings?: SettingsStore;
  metadata?: MetadataStore;
  redirects?: RedirectStore;
  robots?: RobotsStore;
  sitemap?: SitemapProvider;
}
