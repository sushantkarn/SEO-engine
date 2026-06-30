export type SettingsRecord = Record<string, unknown>;

export interface PageContext {
  title: string;
  description?: string;
  url: string;
  image?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

export interface SeoData {
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  robotsIndex?: string;
  robotsFollow?: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  schema?: Record<string, unknown>;
}

export interface ResolvedMetadata {
  title: string;
  description: string;
  canonical: string;
  robots: { index: boolean; follow: boolean };
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images?: { url: string }[];
    type: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    images?: string[];
  };
  schema?: Record<string, unknown>;
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
  type?: number;
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
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
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
