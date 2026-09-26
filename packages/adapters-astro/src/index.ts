import {
  resolveMetadata,
  type MetadataConfig,
  type PageContext,
  type SeoData,
} from "@gmbranker/seo-engine-core";

export interface AstroSeoOptions {
  seo?: SeoData | null;
  context: PageContext;
  config: MetadataConfig;
}

export interface AstroHeadTag {
  tag: "title" | "meta" | "link";
  attrs?: Record<string, string>;
  content?: string;
}

export function createAstroHead(options: AstroSeoOptions): AstroHeadTag[] {
  const resolved = resolveMetadata(options.seo ?? {}, options.context, options.config);
  const tags: AstroHeadTag[] = [{ tag: "title", content: resolved.title }];
  tags.push({ tag: "meta", attrs: { name: "description", content: resolved.description } });
  tags.push({ tag: "meta", attrs: { name: "robots", content: toRobotsContent(resolved.robots) } });
  if (resolved.canonical) tags.push({ tag: "link", attrs: { rel: "canonical", href: resolved.canonical } });
  for (const [hreflang, href] of Object.entries(resolved.alternates ?? {})) {
    tags.push({ tag: "link", attrs: { rel: "alternate", hreflang, href } });
  }
  tags.push({ tag: "meta", attrs: { property: "og:title", content: resolved.openGraph.title } });
  tags.push({ tag: "meta", attrs: { property: "og:description", content: resolved.openGraph.description } });
  if (resolved.openGraph.url) tags.push({ tag: "meta", attrs: { property: "og:url", content: resolved.openGraph.url } });
  for (const image of resolved.openGraph.images ?? []) {
    tags.push({ tag: "meta", attrs: { property: "og:image", content: image.url } });
    if (image.alt) tags.push({ tag: "meta", attrs: { property: "og:image:alt", content: image.alt } });
  }
  tags.push({ tag: "meta", attrs: { name: "twitter:card", content: resolved.twitter.card } });
  tags.push({ tag: "meta", attrs: { name: "twitter:title", content: resolved.twitter.title } });
  tags.push({ tag: "meta", attrs: { name: "twitter:description", content: resolved.twitter.description } });
  return tags;
}

function toRobotsContent(robots: ReturnType<typeof resolveMetadata>["robots"]): string {
  const directives = [robots.index ? "index" : "noindex", robots.follow ? "follow" : "nofollow"];
  if (robots.noarchive) directives.push("noarchive");
  if (robots.noimageindex) directives.push("noimageindex");
  if (robots.nosnippet) directives.push("nosnippet");
  return directives.join(", ");
}
