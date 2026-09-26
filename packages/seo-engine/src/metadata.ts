import type {
  PageContext,
  ResolvedMetadata,
  ResolvedRobots,
  SeoData,
} from "./types.js";
import { replaceVariables } from "./variables.js";

export interface MetadataConfig {
  siteName: string;
  separator: string;
  titleTemplate?: string;
}

/** Returns a canonical BCP 47 locale tag, or undefined for an invalid tag. */
export function normalizeLocaleTag(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    return Intl.getCanonicalLocales(value.trim().replace(/_/g, "-"))[0];
  } catch {
    return undefined;
  }
}

function normalizeAlternateLocales(
  entries: PageContext["alternateLocales"],
): Array<{ locale: string; url?: string }> {
  const normalized = new Map<string, string | undefined>();
  for (const entry of entries ?? []) {
    const locale = normalizeLocaleTag(entry.locale);
    if (!locale) continue;
    if (!entry.url) {
      normalized.set(locale, undefined);
      continue;
    }
    try {
      const url = new URL(entry.url);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      normalized.set(locale, url.toString());
    } catch {
      // Alternate-language links must be absolute HTTP(S) URLs.
    }
  }
  return [...normalized].map(([locale, url]) => ({ locale, ...(url ? { url } : {}) }));
}

function parseOptionalInt(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseImagePreview(
  value: unknown,
): "none" | "standard" | "large" | undefined {
  if (value === "none" || value === "standard" || value === "large") {
    return value;
  }
  return undefined;
}

function buildRobots(pageSeo: SeoData): ResolvedRobots {
  const directives = (pageSeo.robots || "")
    .split(/[\s,]+/)
    .map((directive) => directive.trim().toLowerCase())
    .filter(Boolean);
  const robots: ResolvedRobots = {
    index:
      pageSeo.noindex !== true &&
      pageSeo.robotsIndex !== "noindex" &&
      !directives.includes("noindex"),
    follow:
      pageSeo.nofollow !== true &&
      pageSeo.robotsFollow !== "nofollow" &&
      !directives.includes("nofollow"),
  };

  if (
    pageSeo.robotsNoImageIndex ||
    pageSeo.noimageindex ||
    directives.includes("noimageindex")
  )
    robots.noimageindex = true;
  if (
    pageSeo.robotsNoArchive ||
    pageSeo.noarchive ||
    directives.includes("noarchive")
  )
    robots.noarchive = true;
  if (
    pageSeo.robotsNoSnippet ||
    pageSeo.nosnippet ||
    directives.includes("nosnippet")
  )
    robots.nosnippet = true;

  const maxSnippet = parseOptionalInt(
    pageSeo.maxSnippet ??
      pageSeo.robotsMaxSnippet ??
      directives
        .find((value) => value.startsWith("max-snippet:"))
        ?.split(":")[1],
  );
  if (maxSnippet !== undefined) robots.maxSnippet = maxSnippet;

  const maxVideoPreview = parseOptionalInt(
    pageSeo.maxVideoPreview ??
      pageSeo.robotsMaxVideoPreview ??
      directives
        .find((value) => value.startsWith("max-video-preview:"))
        ?.split(":")[1],
  );
  if (maxVideoPreview !== undefined) robots.maxVideoPreview = maxVideoPreview;

  const maxImagePreview = parseImagePreview(
    pageSeo.maxImagePreview ??
      pageSeo.robotsMaxImagePreview ??
      directives
        .find((value) => value.startsWith("max-image-preview:"))
        ?.split(":")[1],
  );
  if (maxImagePreview) robots.maxImagePreview = maxImagePreview;

  return robots;
}

export function resolveMetadata(
  pageSeo: SeoData,
  context: PageContext,
  config: MetadataConfig,
): ResolvedMetadata {
  const alternateLocales = normalizeAlternateLocales(context.alternateLocales);
  const locale = normalizeLocaleTag(context.locale);
  const titleTemplate = config.titleTemplate ?? "%title% %sep% %sitename%";
  const rawTitle = pageSeo.title || titleTemplate;
  const title = replaceVariables(
    rawTitle,
    context,
    config.siteName,
    config.separator,
  );

  const rawDesc = pageSeo.description || "%excerpt%";
  const description = replaceVariables(
    rawDesc,
    context,
    config.siteName,
    config.separator,
  );

  const ogImage = pageSeo.ogImage || context.image;
  const twitterImage = pageSeo.twitterImage || ogImage;
  const keywordValue = pageSeo.keywords ?? pageSeo.focusKeyword;
  const keywords = keywordValue
    ? (Array.isArray(keywordValue) ? keywordValue : keywordValue.split(","))
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;

  return {
    title,
    description,
    canonical: pageSeo.canonicalUrl || context.url || undefined,
    robots: buildRobots(pageSeo),
    keywords,
    openGraph: {
      title: pageSeo.ogTitle
        ? replaceVariables(
            pageSeo.ogTitle,
            context,
            config.siteName,
            config.separator,
          )
        : title,
      description: pageSeo.ogDescription
        ? replaceVariables(
            pageSeo.ogDescription,
            context,
            config.siteName,
            config.separator,
          )
        : description,
      url: pageSeo.ogUrl || context.url || undefined,
      siteName: config.siteName,
      images: ogImage
        ? [
            {
              url: ogImage,
              ...(pageSeo.ogImageAlt ? { alt: pageSeo.ogImageAlt } : {}),
            },
          ]
        : undefined,
      type: pageSeo.ogType || context.type || "website",
      locale,
      alternateLocale: alternateLocales.map((entry) => entry.locale),
      publishedTime: context.publishedTime,
      modifiedTime: context.modifiedTime,
      authors: context.authors,
    },
    twitter: {
      card:
        pageSeo.twitterCard === "summary" ||
        pageSeo.twitterCard === "summary_large_image"
          ? pageSeo.twitterCard
          : "summary_large_image",
      title: pageSeo.twitterTitle
        ? replaceVariables(
            pageSeo.twitterTitle,
            context,
            config.siteName,
            config.separator,
          )
        : title,
      description: pageSeo.twitterDescription
        ? replaceVariables(
            pageSeo.twitterDescription,
            context,
            config.siteName,
            config.separator,
          )
        : description,
      images: twitterImage ? [twitterImage] : undefined,
    },
    schema: pageSeo.schema,
    alternates: Object.fromEntries(
      alternateLocales
        .filter((entry): entry is { locale: string; url: string } => Boolean(entry.url))
        .map((entry) => [entry.locale, entry.url]),
    ),
  };
}
