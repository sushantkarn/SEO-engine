import {
  generateLlmsTxt,
  generateRobots,
  resolveMetadata,
  type MetadataConfig,
  type PageContext,
  type ResolvedMetadata,
  type SeoData,
  type SettingsRecord,
} from "@gmbranker/seo-engine-core";

export interface LlmsRouteOptions {
  baseUrl: string;
  getSettings: () => Promise<SettingsRecord> | SettingsRecord;
  defaultSummary?: string;
  cacheControl?: string;
}

export function createLlmsRoute(options: LlmsRouteOptions) {
  const cacheControl = options.cacheControl ?? "public, max-age=300";

  return async function GET() {
    const settings = await options.getSettings();
    const content = generateLlmsTxt(settings, options.baseUrl, {
      defaultSummary: options.defaultSummary,
    });

    if (!content) {
      return new Response("llms.txt is disabled.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": cacheControl,
      },
    });
  };
}

export interface RobotsRouteOptions {
  baseUrl: string;
  getContent?: () => Promise<string | null> | string | null;
  cacheControl?: string;
}

export function createRobotsRoute(options: RobotsRouteOptions) {
  const cacheControl = options.cacheControl ?? "public, max-age=300";
  const sitemapUrl = `${options.baseUrl.replace(/\/$/, "")}/sitemap.xml`;

  return async function GET() {
    const custom = options.getContent ? await options.getContent() : null;
    const content = generateRobots({
      content: custom,
      sitemapUrl,
    });

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": cacheControl,
      },
    });
  };
}

export interface NextSitemapEntry {
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

export interface SitemapHandlerOptions {
  getStaticEntries: () => NextSitemapEntry[] | Promise<NextSitemapEntry[]>;
  getDynamicEntries?: () => NextSitemapEntry[] | Promise<NextSitemapEntry[]>;
  isEnabled?: () => boolean | Promise<boolean>;
  maxItems?: number;
}

function normalizeSitemapUrl(value: string): string | null {
  try {
    const url = new URL(value);
    url.hash = "";
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return null;
  }
}

export function createSitemapHandler(options: SitemapHandlerOptions) {
  return async function sitemap(): Promise<NextSitemapEntry[]> {
    if (options.isEnabled) {
      const enabled = await options.isEnabled();
      if (!enabled) return [];
    }

    const staticEntries = await options.getStaticEntries();
    const dynamicEntries = options.getDynamicEntries
      ? await options.getDynamicEntries()
      : [];

    const seen = new Set<string>();
    const entries = [...staticEntries, ...dynamicEntries].flatMap((entry) => {
      const normalized = normalizeSitemapUrl(entry.url);
      if (!normalized || seen.has(normalized)) return [];
      seen.add(normalized);
      return [{ ...entry, url: normalized }];
    });

    return options.maxItems && options.maxItems > 0
      ? entries.slice(0, Math.floor(options.maxItems))
      : entries;
  };
}

export function toNextMetadata(resolved: ResolvedMetadata) {
  return {
    title: resolved.title,
    description: resolved.description,
    alternates: {
      canonical: resolved.canonical,
      ...(resolved.alternates && Object.keys(resolved.alternates).length > 0
        ? { languages: resolved.alternates }
        : {}),
    },
    robots: {
      index: resolved.robots.index,
      follow: resolved.robots.follow,
      noarchive: resolved.robots.noarchive,
      noimageindex: resolved.robots.noimageindex,
      nosnippet: resolved.robots.nosnippet,
      maxSnippet: resolved.robots.maxSnippet,
      maxImagePreview: resolved.robots.maxImagePreview,
      maxVideoPreview: resolved.robots.maxVideoPreview,
      googleBot: {
        index: resolved.robots.index,
        follow: resolved.robots.follow,
        noarchive: resolved.robots.noarchive,
        noimageindex: resolved.robots.noimageindex,
        nosnippet: resolved.robots.nosnippet,
        maxSnippet: resolved.robots.maxSnippet,
        maxImagePreview: resolved.robots.maxImagePreview,
        maxVideoPreview: resolved.robots.maxVideoPreview,
      },
    },
    keywords: resolved.keywords,
    openGraph: resolved.openGraph,
    twitter: resolved.twitter,
  };
}

export interface NextMetadataOptions {
  seo?: SeoData | null;
  context: PageContext;
  config: MetadataConfig;
}

/** Resolves the package contract directly into a Next.js Metadata-compatible object. */
export function createNextMetadata(options: NextMetadataOptions) {
  return toNextMetadata(
    resolveMetadata(options.seo ?? {}, options.context, options.config),
  );
}
