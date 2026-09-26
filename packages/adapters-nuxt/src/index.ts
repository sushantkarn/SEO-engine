import {
  resolveMetadata,
  type MetadataConfig,
  type PageContext,
  type SeoData,
} from "@gmbranker/seo-engine-core";

export interface NuxtSeoOptions {
  seo?: SeoData | null;
  context: PageContext;
  config: MetadataConfig;
}

export function createNuxtSeoHead(options: NuxtSeoOptions) {
  const resolved = resolveMetadata(options.seo ?? {}, options.context, options.config);
  const meta = [
    { name: "description", content: resolved.description },
    ...(resolved.keywords ? [{ name: "keywords", content: resolved.keywords.join(", ") }] : []),
    { property: "og:title", content: resolved.openGraph.title },
    { property: "og:description", content: resolved.openGraph.description },
    { property: "og:type", content: resolved.openGraph.type },
    ...(resolved.openGraph.url ? [{ property: "og:url", content: resolved.openGraph.url }] : []),
    ...(resolved.openGraph.locale ? [{ property: "og:locale", content: resolved.openGraph.locale }] : []),
    ...(resolved.openGraph.images ?? []).map((image) => ({ property: "og:image", content: image.url })),
    { name: "twitter:card", content: resolved.twitter.card },
    { name: "twitter:title", content: resolved.twitter.title },
    { name: "twitter:description", content: resolved.twitter.description },
    ...(resolved.twitter.images ?? []).map((image) => ({ name: "twitter:image", content: image })),
    { name: "robots", content: toRobotsContent(resolved.robots) },
  ];
  const link = [
    ...(resolved.canonical ? [{ rel: "canonical", href: resolved.canonical }] : []),
    ...Object.entries(resolved.alternates ?? {}).map(([hreflang, href]) => ({ rel: "alternate", hreflang, href })),
  ];
  return { title: resolved.title, meta, link };
}

function toRobotsContent(robots: ReturnType<typeof resolveMetadata>["robots"]): string {
  const directives = [robots.index ? "index" : "noindex", robots.follow ? "follow" : "nofollow"];
  if (robots.noarchive) directives.push("noarchive");
  if (robots.noimageindex) directives.push("noimageindex");
  if (robots.nosnippet) directives.push("nosnippet");
  if (robots.maxSnippet !== undefined) directives.push(`max-snippet:${robots.maxSnippet}`);
  if (robots.maxImagePreview) directives.push(`max-image-preview:${robots.maxImagePreview}`);
  if (robots.maxVideoPreview !== undefined) directives.push(`max-video-preview:${robots.maxVideoPreview}`);
  return directives.join(", ");
}
