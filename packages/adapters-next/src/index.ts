import {
  generateLlmsTxt,
  generateRobots,
  type SettingsRecord,
} from "@seo-engine/core";

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

    return [...staticEntries, ...dynamicEntries];
  };
}

export function toNextMetadata(resolved: {
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
}) {
  return {
    title: resolved.title,
    description: resolved.description,
    alternates: { canonical: resolved.canonical },
    robots: {
      index: resolved.robots.index,
      follow: resolved.robots.follow,
      googleBot: {
        index: resolved.robots.index,
        follow: resolved.robots.follow,
      },
    },
    openGraph: resolved.openGraph,
    twitter: resolved.twitter,
  };
}
