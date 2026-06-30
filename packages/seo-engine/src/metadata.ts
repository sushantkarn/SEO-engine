import type { PageContext, ResolvedMetadata, SeoData } from "./types.js";
import { replaceVariables } from "./variables.js";

export interface MetadataConfig {
  siteName: string;
  separator: string;
  titleTemplate?: string;
}

export function resolveMetadata(
  pageSeo: SeoData,
  context: PageContext,
  config: MetadataConfig,
): ResolvedMetadata {
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

  const index = pageSeo.robotsIndex !== "noindex";
  const follow = pageSeo.robotsFollow !== "nofollow";
  const ogImage = pageSeo.ogImage || context.image;
  const twitterImage = pageSeo.twitterImage || ogImage;

  return {
    title,
    description,
    canonical: pageSeo.canonicalUrl || context.url,
    robots: { index, follow },
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
      url: context.url,
      siteName: config.siteName,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: context.type || "website",
    },
    twitter: {
      card: "summary_large_image",
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
  };
}
