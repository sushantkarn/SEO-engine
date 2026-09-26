export type SettingsRecord = Record<string, unknown>;

export interface PageContext {
  title: string;
  description?: string;
  /** Absolute page URL. Omit on root layout defaults so children own canonical. */
  url?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  /** BCP 47 locale used for Open Graph and alternate-language metadata. */
  locale?: string;
  /** Alternate locale URLs for international SEO. */
  alternateLocales?: Array<{ locale: string; url?: string }>;
}

export interface SeoData {
  title?: string | null;
  description?: string | null;
  keywords?: string | string[] | null;
  canonicalUrl?: string | null;
  robots?: string | null;
  robotsIndex?: string;
  robotsFollow?: string;
  robotsNoImageIndex?: boolean;
  robotsNoArchive?: boolean;
  robotsNoSnippet?: boolean;
  robotsMaxSnippet?: string | number | null;
  robotsMaxVideoPreview?: string | number | null;
  robotsMaxImagePreview?: "none" | "standard" | "large" | string | null;
  focusKeyword?: string | null;
  noindex?: boolean;
  nofollow?: boolean;
  noarchive?: boolean;
  noimageindex?: boolean;
  nosnippet?: boolean;
  maxSnippet?: number | null;
  maxImagePreview?: "none" | "standard" | "large" | null;
  maxVideoPreview?: number | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogImageAlt?: string | null;
  ogUrl?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  ogType?: string | null;
  twitterCard?: "summary" | "summary_large_image" | null;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export interface ResolvedRobots {
  index: boolean;
  follow: boolean;
  noimageindex?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  maxSnippet?: number;
  maxVideoPreview?: number;
  maxImagePreview?: "none" | "standard" | "large";
}

export interface ResolvedMetadata {
  title: string;
  description: string;
  canonical?: string;
  robots: ResolvedRobots;
  keywords?: string[];
  openGraph: {
    title: string;
    description: string;
    url?: string;
    siteName: string;
    images?: { url: string; alt?: string }[];
    locale?: string;
    alternateLocale?: string[];
    type: string;
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
  };
  twitter: {
    card: "summary" | "summary_large_image" | string;
    title: string;
    description: string;
    images?: string[];
  };
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
  alternates?: Record<string, string>;
}

export interface SeoAnalysisResult {
  score: number;
  tests: {
    id: string;
    title: string;
    status: "pass" | "fail" | "warning";
    message: string;
  }[];
}

export interface RedirectRule {
  sourceUrl: string;
  targetUrl: string;
  type?: number | string;
  matchType?: string;
  isActive?: boolean;
}

export interface RedirectMatch {
  targetUrl: string;
  type: number;
}

export interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?:
    "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export interface ImageSeoSettings {
  addMissingAlt?: boolean;
  altTemplate?: string;
  addMissingTitle?: boolean;
  titleTemplate?: string;
}

export interface LinkCounts {
  internal: number;
  external: number;
  total: number;
}
