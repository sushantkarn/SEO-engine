import type { SettingsRecord } from "./types.js";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
}

export function buildGlobalSchemaJsonLd(
  settings: SettingsRecord,
  baseUrl: string,
): Record<string, unknown> | null {
  const schema = asRecord(settings.schema);
  if (!schema?.name) {
    return null;
  }

  const schemaType =
    typeof schema.schemaType === "string" ? schema.schemaType : "Organization";
  const name = String(schema.name);
  const logoUrl =
    typeof schema.logoUrl === "string" && schema.logoUrl.length > 0
      ? schema.logoUrl
      : undefined;

  const base = schemaType === "Person"
    ? {
      "@context": "https://schema.org",
      "@type": "Person",
      name,
      url: baseUrl,
      ...(logoUrl ? { image: logoUrl } : {}),
    }
    : {
        "@context": "https://schema.org",
        "@type": schemaType,
        name,
        url: baseUrl,
        ...(logoUrl ? { logo: logoUrl } : {}),
      };

  const sameAs = stringArray(schema.sameAs);
  const telephone = typeof schema.telephone === "string" ? schema.telephone : undefined;
  const email = typeof schema.email === "string" ? schema.email : undefined;
  const contactPoint = asRecord(schema.contactPoint);
  return {
    ...base,
    ...(sameAs ? { sameAs } : {}),
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(contactPoint ? { contactPoint: { "@type": "ContactPoint", ...contactPoint } } : {}),
  };
}

export function buildLocalSeoSchemaJsonLd(
  settings: SettingsRecord,
  baseUrl: string,
): Record<string, unknown> | null {
  const localSeo = asRecord(settings.localSeo);
  if (!localSeo?.name) {
    return null;
  }

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":
      typeof localSeo.type === "string" && localSeo.type.length > 0
        ? localSeo.type
        : "LocalBusiness",
    name: String(localSeo.name),
    url:
      typeof localSeo.url === "string" && localSeo.url.length > 0
        ? localSeo.url
        : baseUrl,
  };

  if (typeof localSeo.logo === "string" && localSeo.logo.length > 0) {
    schema.image = localSeo.logo;
  }

  if (typeof localSeo.email === "string" && localSeo.email.length > 0) {
    schema.email = localSeo.email;
  }

  for (const field of ["telephone", "priceRange", "areaServed"] as const) {
    if (typeof localSeo[field] === "string" && localSeo[field].length > 0) {
      schema[field] = localSeo[field];
    }
  }

  const sameAs = stringArray(localSeo.sameAs);
  if (sameAs) schema.sameAs = sameAs;

  if (typeof localSeo.address === "string" && localSeo.address.length > 0) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: localSeo.address,
    };
  }

  if (
    typeof localSeo.openingHours === "string" &&
    localSeo.openingHours.length > 0
  ) {
    schema.openingHours = localSeo.openingHours;
  }

  if (
    typeof localSeo.geoCoordinates === "string" &&
    localSeo.geoCoordinates.includes(",")
  ) {
    const [lat, lng] = localSeo.geoCoordinates.split(",").map((v) => v.trim());
    if (lat && lng) {
      schema.geo = {
        "@type": "GeoCoordinates",
        latitude: lat,
        longitude: lng,
      };
    }
  }

  return schema;
}

export function buildBreadcrumbSchemaJsonLd(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> | null {
  const itemListElement = items
    .filter((item) => item.name.trim() && /^https?:\/\//i.test(item.url))
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name.trim(),
      item: item.url,
    }));
  if (itemListElement.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}
