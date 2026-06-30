import type { SettingsRecord } from "./types.js";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
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

  if (schemaType === "Person") {
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name,
      url: baseUrl,
      ...(logoUrl ? { image: logoUrl } : {}),
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: baseUrl,
    ...(logoUrl ? { logo: logoUrl } : {}),
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
